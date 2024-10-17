import archiver from 'archiver';
import { globSync } from 'glob';
import fss from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fetch, { FormData } from 'node-fetch';
import { Configuration, Scout9Api } from '@scout9/admin';
import { checkVariableType, ProgressLogger, requireProjectFile } from '../utils/index.js';
import decompress from 'decompress';
import { loadUserPackageJson } from './config/project.js';
import { platformApi } from './data.js';
import { syncData } from './sync.js';
import ProjectFiles from '../utils/project.js';
import { projectTemplates } from '../utils/project-templates.js';
import { WorkflowEventSchema } from '../runtime/index.js';
import { logUserValidationError } from '../report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function zipDirectory(source, out) {
  const archive = archiver('tar', {
    gzip: true,
    gzipOptions: {level: 9}
    // zlib: {level: 9}
  });
  const stream = fss.createWriteStream(out);


  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Zip timed out'));
    }, 10 * 1000);

    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve(undefined));
    archive.finalize();
  });
}

async function deployZipDirectory(zipFilePath, config) {
  const form = new FormData();
  if (!fss.existsSync(zipFilePath)) {
    throw new Error(`Missing required zip file ${zipFilePath}`);
  }
  const blob = new Blob([await fs.readFile(zipFilePath)], {type: 'application/gzip'});
  form.set('file', blob, path.basename(zipFilePath), {contentType: 'application/gzip'});
  // const blob = new Blob([await fs.readFile(zipFilePath)], {type: 'application/zip'});
  // form.set('file', blob, path.basename(zipFilePath), {contentType: 'application/zip'});
  form.set('config', JSON.stringify(config));

  // @TODO append signature secret header
  // const url = 'http://localhost:3000/api/b/platform/upload';
  const url = 'https://us-central1-jumpstart.cloudfunctions.net/v1-utils-platform-upload';
  const response = await platformApi(url, {
    method: 'POST',
    body: form,
    headers: {
      'Authorization': 'Bearer ' + process.env.SCOUT9_API_KEY || ''
    }
  });
  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}: ${response.statusText}`);
  }

  return response;
}

async function downloadAndUnpackZip(outputDir) {
  const downloadLocalResponse = await platformApi(`https://scout9.com/api/b/platform/download`);
  if (!downloadLocalResponse.ok) {
    throw new Error(`Error downloading project file ${downloadLocalResponse.statusText}`);
  }

  try {
    const arrayBuffer = await downloadLocalResponse.arrayBuffer();
    const outputPath = path.resolve(outputDir, 'build');
    // Convert ArrayBuffer to Buffer
    await decompress(Buffer.from(arrayBuffer), outputPath);

    console.log('Files unpacked successfully at ' + outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error unpacking file:', error);
    throw error;
  }
}

/**
 * Builds the app to a specified location
 * @param {string} cwd
 * @param {string} src
 * @param {string} dest
 * @param {Scout9ProjectBuildConfig} config
 * @returns {Promise<void>}
 */
async function buildApp(cwd, src, dest, config) {
  // Remove existing directory
  await fs.rm(dest, {recursive: true, force: true});
  // Ensures directory exists
  await fs.mkdir(dest, {recursive: true});

  const root = src.replace(process.cwd(), '');

  const copyDirectory = async (source, destination, permittedExtensions) => {
    await fs.mkdir(destination, {recursive: true});

    const dir = await fs.readdir(source, {withFileTypes: true});
    for (const dirent of dir) {
      if (dirent.name.includes('.spec') || dirent.name.includes('.test')) {
        continue; // Skip this file or directory
      }

      const sourcePath = path.resolve(source, dirent.name);
      const destinationPath = path.resolve(destination, dirent.name);

      if (dirent.isDirectory()) {
        await copyDirectory(sourcePath, destinationPath, permittedExtensions);
      } else {
        if (permittedExtensions && permittedExtensions.length > 0) {
          const fileExtension = path.extname(dirent.name).replace('.', '');
          if (!permittedExtensions.includes(fileExtension)) {
            // console.log(`Skipping ${dirent.name} because it's not in the permitted extensions list`);
            continue;
          }
        }
        if (sourcePath.includes('entities/agents/index') || sourcePath.includes('entities/agents/config')) {
          // Special case where we have to paste the agent raw data to avoid uploading large audio/txt files
          await fs.writeFile(destinationPath, projectTemplates.entities.agents(config.agents, path.extname(destinationPath)));
        } else if (sourcePath.includes(`${root}/index`)) {
          await fs.writeFile(destinationPath, projectTemplates.root(config, path.extname(destinationPath)));
        } else {
          await fs.copyFile(sourcePath, destinationPath);
        }

      }

    }
  };

  const srcDir = path.resolve(cwd, src);
  const appTemplateJsPath = path.resolve(__dirname, './templates/app.js');
  const templatePackagePath = path.resolve(__dirname, './templates/template-package.json');

  // Copy src directory
  await copyDirectory(srcDir, path.resolve(dest, 'src'),  ['js', 'ts', 'cjs', 'mjs', 'json', 'env']);

  // Copy user target package.json, first load app.js dependencies/scripts and append to target package.json
  const packageTemplate = JSON.parse(await fs.readFile(new URL(templatePackagePath, import.meta.url), 'utf-8'));
  const {pkg} = await loadUserPackageJson({cwd});
  pkg.dependencies = {...pkg.dependencies, ...packageTemplate.dependencies};
  pkg.scripts.start = 'node app.js';
  await fs.writeFile(path.resolve(dest, 'package.json'), JSON.stringify(pkg, null, 2));

  // Copy app.js
  await fs.copyFile(appTemplateJsPath, path.resolve(dest, 'app.js'));

  // Copy .env file
  await fs.copyFile(path.resolve(cwd, '.env'), path.resolve(dest, '.env'));

  // Copy config.js - redact any sensitive information // @TODO use security encoder
  const redactedConfig = {
    ...config
  };
  for (const agent of redactedConfig.agents) {
    // agent.forwardEmail = 'REDACTED';
    // agent.forwardPhone = 'REDACTED';
    // agent.programmableEmail = 'REDACTED';
    // agent.programmablePhoneNumber = 'REDACTED';
  }
  await fs.writeFile(path.resolve(dest, 'config.js'), `export default ${JSON.stringify(redactedConfig, null, 2)}`);

  // Copy Dockerfile (if it exists)
  const dockerfile = path.resolve(cwd, './Dockerfile');
  if (fss.existsSync(dockerfile)) {
    await fs.copyFile(dockerfile, path.resolve(dest, 'Dockerfile'));
  } else {
    await fs.copyFile(path.resolve(__dirname, './templates/Dockerfile'), path.resolve(dest, 'Dockerfile'));
  }

  if (process.env.DEV_MODE === 'true') {
    // Copy dev app folder
    // const clientFolder = path.resolve(__dirname, './templates/public');
    // await copyDirectory(clientFolder, path.resolve(dest, 'public'));

    // @TODO migrate this into a package
    const devAppFolder = path.resolve(dest, 'public');
    const exists = fss.existsSync(devAppFolder);
    if (!exists) {
      await downloadDevApp(devAppFolder, process.env.DEV_APP_VERSION || 'default');
    }
  }
}

// For dev server, downloads the dev app if it doesn't exist
async function downloadDevApp(destination, version) {
  const url = `https://scout9.com/api/b/platform/dev?v=${version}`;
  const downloadLocalResponse = await platformApi(url);
  if (!downloadLocalResponse.ok) {
    throw new Error(`Error downloading scout9 dev app project file ${downloadLocalResponse.statusText}`);
  }
  try {
    const arrayBuffer = await downloadLocalResponse.arrayBuffer();
    await decompress(Buffer.from(arrayBuffer), destination);
    console.log('Dev server unpacked successfully at ' + destination);
  } catch (error) {
    console.error('Error unpacking file:', error);
    throw error;
  }

}

/**
 * @param {Object} [options]
 * @param {string} [options.cwd]
 * @param {string} [options.src]
 * @param {boolean} [options.ignoreAppRequire]
 * @returns {Promise<{app: *, fileName: string, exe: string, filePath: string}>}
 */
export async function getApp({cwd = process.cwd(), src = 'src', ignoreAppRequire = false} = {}) {
  const indexTsPath = path.resolve(cwd, src, 'index.ts');
  const indexJsPath = path.resolve(cwd, src, 'index.js');
  let exe = '';
  if (fss.existsSync(indexTsPath)) {
    exe = path.extname(indexTsPath);
  } else if (fss.existsSync(indexJsPath)) {
    exe = path.extname(indexJsPath);
  } else {
    throw new Error(`Missing main project entry file ${src}/index.{js|ts}`);
  }
  const filePath = path.resolve(cwd, src, `app${exe}`);
  let app;
  if (!ignoreAppRequire) {
    app = await requireProjectFile(filePath).then(mod => mod.default);
    const type = checkVariableType(app);
    if (!(type === 'function' || type === 'async function')) {
      throw new Error(`App must return a default function, received "${type}"`);
    }
  }
  return {app, exe, filePath, fileName: `app${exe}`};
}

/**
 * For each agent, lists out each method of contact
 * @returns {Promise<T>}
 */
export async function getAgentContacts() {
  const configuration = new Configuration({
    apiKey: process.env.SCOUT9_API_KEY
  });
  const scout9 = new Scout9Api(configuration);
  return Promise.all([
    scout9.agents(),
    platformApi('https://us-central1-jumpstart.cloudfunctions.net/v1-utils-auth', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + process.env.SCOUT9_API_KEY || ''
      }
    }).then((res) => {
      console.log(res);
      return res.json();
    })
  ])
    .then((res) => {
      console.log(res[1]);
      return res[0].data.map((agent) => {
        let output = `\n\t${agent.firstName || 'Agent'}${agent.lastName ? ' ' + agent.lastName : ''}:\n`;
        if (agent.programmablePhoneNumber) {
          output += `\t\t- ${agent.programmablePhoneNumber}\n`;
        }
        if (agent.programmableEmail) {
          output += `\t\t- ${agent.programmableEmail}\n`;
        }
        output += `\t\t- https://scout9.com/${res[1].id}/${agent.id || agent.$id}\n`;
        return output;
      }).join('\n');
    })
    .catch((err) => {
      err.message = `Error fetching agents: ${err.message}`;
      throw err;
    });
}

/**
 * Runs a given project container from scout9 to given environment
 * Runs the project in a container
 *
 * @param {WorkflowEvent} event - every workflow receives an event object
 * @param {Object} options
 * @param {string} options.eventSource - the source path of the event
 * @returns {Promise<WorkflowResponse>}
 */
export async function run(event, {eventSource} = {}) {
  const result = WorkflowEventSchema.safeParse(event);
  if (!result.success) {
    logUserValidationError(result.error, eventSource);
    throw result.error;
  }
  const configuration = new Configuration({
    apiKey: process.env.SCOUT9_API_KEY
  });
  const scout9 = new Scout9Api(configuration);
  const response = await scout9.runPlatform(event)
    .catch((err) => {
      err.message = `Error running platform: ${err.message}`;
      throw err;
    });
  return response.data;
}

/**
 * Calls scout9 backend to get project config file
 */
export async function runConfig() {
  if (!process.env.SCOUT9_API_KEY) {
    throw new Error('Missing SCOUT9_API_KEY, please add your Scout9 API key to your .env file');
  }
  const configuration = new Configuration({
    apiKey: process.env.SCOUT9_API_KEY
  });
  const scout9 = new Scout9Api(configuration);
  const response = await scout9.config()
    .catch((err) => {
      err.message = `Error running platform: ${err.message}`;
      throw err;
    });
  return response.data;
}


/**
 * Builds a local project
 * @param {{cwd: string; src: string; dest: string; logger: ProgressLogger; mode: string;}} - build options
 * @param {Scout9ProjectBuildConfig} config
 * @returns {messages: string[]}
 */
export async function build({
  cwd = process.cwd(),
  src = './src',
  dest = '/tmp/project',
  logger = new ProgressLogger(),
  mode
} = {}, config) {
  const messages = [];
  // 1. Lint: Run validation checks

  // Check if app looks good
  await getApp({cwd, src});

  // Check if workflows look good
  // console.log('@TODO check if workflows are properly written');

  // 2. Build app
  await buildApp(cwd, src, dest, config);

  // 2. Build code in user's project
  // const buildDir = await runNpmRunBuild({cwd, src: src});
  // const buildPath = buildDir.split('/');

  // Check if directory "build" exists
  // if (!fss.existsSync(buildDir)) {
  //   throw new Error(`Missing required "${buildPath[buildPath.length - 1]}" directory, make sure your build script outputs to a "${buildPath[buildPath.length - 1]}" directory or modify your scout9 config`);
  // }


  // 3. Remove unnecessary files
  // const files = globSync(path.resolve(cwd, `${dest}/**/*(*.test.*|*.spec.*)`), {cwd, absolute: true});
  const files = globSync(`${dest}/**/*(*.test.*|*.spec.*)`, {cwd, absolute: true});
  for (const file of files) {
    await fs.unlink(file);
  }

  // 3. Run tests
  // console.log('@TODO run tests');
  return {messages};
}


/**
 * Deploys a local project to scout9
 * @param {{cwd: string; src: string, dest: string}} - build options
 * @param {Scout9ProjectBuildConfig} config
 * @return {Promise<{deploy: Object, contacts: any}>}
 */
export async function deploy(
  {cwd = process.cwd(), src = './src', dest = '/tmp/project', logger = new ProgressLogger()},
  config
) {

  // Check if app looks good
  await getApp({cwd, src});

  await buildApp(cwd, src, dest, config);
  logger.info(`App built ${dest}`);

  await test({cwd, src, dest, logger}, config);

  const destPaths = dest.split('/');
  const zipFilePath = path.resolve(dest, `${destPaths[destPaths.length - 1]}.tar.gz`);
  if (fss.existsSync(zipFilePath)) {
    fss.unlinkSync(zipFilePath);
  }
  await zipDirectory(dest, zipFilePath);

  logger.info('Project zipped successfully.', zipFilePath);

  logger.log(`Uploading ${zipFilePath} to Scout9...`);
  const response = await deployZipDirectory(zipFilePath, config);

  if (response.status !== 200) {
    logger.error(`Error uploading project to Scout9 ${response.status} - ${response.statusText}`);
  } else {
    logger.info(`File sent successfully: ${response.status} - ${response.statusText}`);
  }

  logger.log(`Fetching agent contacts...`);
  const contacts = await getAgentContacts();
  logger.info(`Fetched agent contacts`);

  // Remove temporary directory
  // logger.log(`Cleaning up ${dest}...`);
  // await fs.rmdir(dest, { recursive: true });
  // logger.info(`Cleaned up ${dest}`);

  return {deploy: response, contacts};
}

/**
 * Tests a local project to scout9 by running a dummy parse command with the project's local entities
 * @param {{cwd: string; src: string, dest: string}} - build options
 * @param {Scout9ProjectBuildConfig} config
 */
export async function test(
  {cwd = process.cwd(), src = './src', dest = '/tmp/project', logger = new ProgressLogger()},
  config
) {

  const testableEntities = config.entities.filter(e => e?.definitions?.length > 0 || e?.training?.length > 0);

  const tests = testableEntities.reduce((accumulator, entity) => accumulator += (entity?.tests || []).length, 0);

  if (tests === 0) {
    logger.warn('No tests found for any entities, skipping test run');
    return;
  }

  // @TODO format errors
  logger.log(`Running ${tests} entity test points...`);
  await new Scout9Api(new Configuration({apiKey: process.env.SCOUT9_API_KEY || ''})).parse({
    message: 'Dummy message to parse',
    language: 'en',
    entities: testableEntities
  });
}

/**
 *
 * @param {{cwd: string; src: string; projectFiles: ProjectFiles; logger: ProgressLogger}} options
 * @param {Scout9ProjectBuildConfig} config
 * @returns {Promise<{success: boolean; config: Scout9ProjectBuildConfig}>}
 */
export async function sync({
  cwd = process.cwd(), src = 'src',
  projectFiles = new ProjectFiles({src, autoSave: true, cwd}),
  logger = new ProgressLogger()} = {},
  config
) {
  if (!process.env.SCOUT9_API_KEY) {
    throw new Error('Missing required environment variable "SCOUT9_API_KEY"');
  }
  logger.log('Fetching project data...');
  // Grabs saved server data on Scout9
  config = await syncData(config);
  logger.log(`Syncing project`);

  // Uses saved server data to sync project with local data
  await projectFiles.sync(config, (message, type) => {
    switch (type) {
      case 'info':
        logger.info(message);
        break;
      case 'warn':
        logger.warn(message);
        break;
      case 'error':
        logger.error(message);
        break;
      default:
        logger.info(message);
    }
  });
  return {success: true, config};
}
