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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function platformApi(url, options = {}, retries = 0) {
  if (retries > 3) {
    throw new Error(`Request timed out, try again later`);
  }
  if (!process.env.SCOUT9_API_KEY) {
    throw new Error('Missing required environment variable "SCOUT9_API_KEY"');
  }
  return fetch(url, {
    method: 'GET',
    ...options,
    headers: {
      'Authorization': process.env.SCOUT9_API_KEY || ''
    }
  }).then((res) => {
    if (res.status === 504) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(platformApi(url, options, retries + 1));
        }, 3000);
      });
    }
    return Promise.resolve(res);
  });
}

/**
 * @returns {Promise<string>} - the output directory
 */
// async function runNpmRunBuild({cwd = process.cwd(), src = 'src'} = {}) {
//   const pkg = JSON.parse(fss.readFileSync(new URL(`${cwd}/package.json`, import.meta.url), 'utf-8'));
//   // Package.json must have a "build" script
//   const buildScript = pkg.scripts?.build;
//   if (!buildScript) {
//     // If no build script then just return src
//     return path.resolve(cwd, src);
//   }
//   // "build" script cannot contain "scout9 build" (otherwise we'll get stuck in a loop)
//   if (buildScript.includes('scout9 build')) {
//     throw new Error(`"build" script in ${cwd}/package.json cannot contain "scout9 build"`);
//   }
//
//   return new Promise((resolve, reject) => {
//     exec('npm run build', {cwd}, (error, stdout, stderr) => {
//       if (error) {
//         return reject(error);
//       }
//       // @TODO don't assume build script created a "build" directory (use a config)
//       return resolve(path.resolve(cwd, 'build'));
//     });
//   });
// }


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
  // application/gzip
  const blob = new Blob([await fs.readFile(zipFilePath)], {type: 'application/gzip'});
  form.set('file', blob, path.basename(zipFilePath), {contentType: 'application/gzip'});
  // const blob = new Blob([await fs.readFile(zipFilePath)], {type: 'application/zip'});
  // form.set('file', blob, path.basename(zipFilePath), {contentType: 'application/zip'});
  form.set('config', JSON.stringify(config));

  // @TODO append signature secret header
  // const url = 'http://localhost:3000/api/b/platform/upload';
  const url = 'https://scout9.vercel.app/api/b/platform/upload';
  const response = await platformApi(url, {
    method: 'POST',
    body: form
  });
  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}: ${response.statusText}`);
  }

  return response;
}

async function downloadAndUnpackZip(outputDir) {
  const downloadLocalResponse = await platformApi(`https://scout9.vercel.app/api/b/platform/download`);
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
  // Ensures directory exists
  await fs.mkdir(dest, {recursive: true});

  const copyDirectory = async (source, destination) => {
    await fs.mkdir(destination, {recursive: true});

    const dir = await fs.readdir(source, {withFileTypes: true});
    for (const dirent of dir) {
      const sourcePath = path.resolve(source, dirent.name);
      const destinationPath = path.resolve(destination, dirent.name);

      dirent.isDirectory() ?
        await copyDirectory(sourcePath, destinationPath) :
        await fs.copyFile(sourcePath, destinationPath);
    }
  };

  const srcDir = path.resolve(cwd, src);
  const appTemplateJsPath = path.resolve(__dirname, './templates/app.js');
  const templatePackagePath = path.resolve(__dirname, './templates/template-package.json');

  // Copy src directory
  await copyDirectory(srcDir, path.resolve(dest, 'src'));

  // Copy user target package.json, first load app.js dependencies/scripts and append to target package.json
  const packageTemplate = JSON.parse(await fs.readFile(new URL(templatePackagePath, import.meta.url), 'utf-8'));
  const {pkg} = await loadUserPackageJson({cwd});
  pkg.dependencies = {...pkg.dependencies, ...packageTemplate.dependencies};
  pkg.scripts.start = 'node app.js';
  await fs.writeFile(path.resolve(dest, 'package.json'), JSON.stringify(pkg, null, 2));

  // Copy app.js
  await fs.copyFile(appTemplateJsPath, path.resolve(dest, 'app.js'));

  // Copy config.js - redact any sensitive information // @TODO use security encoder
  const redactedConfig = {
    ...config
  };
  for (const agent of redactedConfig.agents) {
    agent.forwardEmail = 'REDACTED';
    agent.forwardPhone = 'REDACTED';
    agent.programmableEmail = 'REDACTED';
    agent.programmablePhoneNumber = 'REDACTED';
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
  const url = `https://scout9.vercel.app/api/b/platform/dev?v=${version}`;
  // const url = 'http://localhost:3000/api/b/platform/upload';
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
 * Runs a given project container from scout9 to given environment
 * Runs the project in a container
 *
 * @param {WorkflowEvent} event - every workflow receives an event object
 * @param {{cwd: string; src: string; logger: ProgressLogger}} - run options
 * @returns {Promise<WorkflowResponse<any>>}
 */
export async function run(event, {cwd = process.cwd(), src, logger = new ProgressLogger()} = {}) {
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

export async function runConfig({cwd = process.cwd(), src, logger = new ProgressLogger()} = {}) {
  const configuration = new Configuration({
    apiKey: process.env.SCOUT9_API_KEY
  });
  const scout9 = new Scout9Api(configuration);
  const response = await scout9.runPlatformConfig()
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
 */
export async function build({
  cwd = process.cwd(),
  src = './src',
  dest = '/tmp/project',
  logger = new ProgressLogger(),
  mode
} = {}, config) {
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
}

/**
 * Deploys a local project to scout9
 * @param {{cwd: string; src: string, dest: string}} - build options
 * @param {Scout9ProjectBuildConfig} config
 */
export async function deploy(
  {cwd = process.cwd(), src = './src', dest = '/tmp/project', logger = new ProgressLogger()},
  config
) {

  await buildApp(cwd, src, dest, config);
  logger.info(`App built ${dest}`);

  const destPaths = dest.split('/');
  const zipFilePath = path.resolve(dest, `${destPaths[destPaths.length - 1]}.tar.gz`);
  await zipDirectory(dest, zipFilePath);

  logger.info('Project zipped successfully.', zipFilePath);

  logger.log(`Uploading ${zipFilePath} to Scout9...`);
  const response = await deployZipDirectory(zipFilePath, config);

  if (response.status !== 200) {
    logger.error(`Error uploading project to Scout9 ${response.status} - ${response.statusText}`);
  } else {
    logger.info(`File sent successfully: ${response.status} - ${response.statusText}`);
  }

  // Remove temporary directory
  // logger.log(`Cleaning up ${dest}...`);
  // await fs.rmdir(dest, { recursive: true });
  // logger.info(`Cleaned up ${dest}`);

  return response;
}

/**
 *
 * @param {{cwd: string; src: string; logger: ProgressLogger}} options
 * @param {Scout9ProjectBuildConfig} config
 * @returns {Promise<{success: boolean}>}
 */
export async function sync({cwd = process.cwd(), src = 'src', logger = new ProgressLogger()} = {}, config) {
  logger.log('Fetching project data...');
  if (!process.env.SCOUT9_API_KEY) {
    throw new Error('Missing required environment variable "SCOUT9_API_KEY"');
  }
  const {entities, agents} = await platformApi(`https://scout9.vercel.app/api/b/platform/sync`).then((res) => {
    if (res.status !== 200) {
      throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
    }
    return res.json();
  })
    .catch((err) => {
      err.message = `Error fetching entities and agents: ${err.message}`;
      throw err;
    });

  // Merge
  config.agents = agents.reduce((accumulator, agent) => {
    // Check if agent already exists
    const existingAgentIndex = accumulator.findIndex(a => a.id === agent.id);
    if (existingAgentIndex === -1) {
      accumulator.push(agent);
    } else {
      // Merge agent
      accumulator[existingAgentIndex] = {
        ...accumulator[existingAgentIndex],
        ...agent
      };
    }
    return accumulator;
  }, config.agents);

  // Remove agents that are not on the server
  config.agents = config.agents.filter(agent => agents.find(a => a.id === agent.id));

  config.entities = entities.reduce((accumulator, entity) => {
    // Check if agent already exists
    const existingEntityIndex = accumulator.findIndex(a => a.id === entity.id);
    if (existingEntityIndex === -1) {
      accumulator.push(entity);
    } else {
      // Merge agent
      accumulator[existingEntityIndex] = {
        ...accumulator[existingEntityIndex],
        ...entity
      };
    }
    return accumulator;
  }, config.entities);


  // Write to src/agents
  const paths = globSync(`${src}/entities/agents/{index,config}.{ts,js}`, {cwd, absolute: true});
  if (paths.length === 0) {
    throw new Error(`Missing required agents entity file, rerun "scout9 sync" to fix`);
  }
  if (paths.length > 1) {
    throw new Error(`Multiple agents entity files found, rerun "scout9 sync" to fix`);
  }
  const [filePath] = paths;

  await fs.writeFile(filePath, `
/**
 * Required core entity type: Agents represents you and your team
 * @returns {Array<Agent>}
 */
export default function Agents() {
  return ${JSON.stringify(config.agents, null, 2)};
}
`);
  logger.log(`Updated ${filePath}`);

  for (const entity of config.entities) {
    const {entity: _entity, entities, api, id, ...rest} = entity;
    if ((rest.training?.length || 0) === 0) {
      continue;
    }
    if ((rest.definitions?.length || 0) === 0) {
      continue;
    }
    const fileContent = `
/**
 * ${rest.description || 'Example entity to help us differentiate if a user wants a delivery or pickup order'}
 * @returns {IEntityBuildConfig}
 */
export default async function ${_entity}Entity() {
  return ${JSON.stringify(rest, null, 2)};
}
`;
    const isConfigNamed = fss.existsSync(`${cwd}/${src}/entities/${_entity}/config.js`);
    await fs.writeFile(`${cwd}/${src}/entities/${_entity}/${isConfigNamed ? 'config' : 'index'}.js`, fileContent);
    logger.log(`Updated ${cwd}/${src}/entities/${_entity}/index.js`);
  }

  return {success: true};
}
