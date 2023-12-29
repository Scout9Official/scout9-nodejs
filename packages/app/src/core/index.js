import archiver from 'archiver';
import { globSync } from 'glob';
import { exec } from 'node:child_process';
import fss from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import fetch, {FormData} from 'node-fetch';
import { runInVM } from '../runtime/index.js';
import { checkVariableType, requireProjectFile } from '../utils/index.js';



async function runNpmRunBuild({cwd = process.cwd()} = {}) {
  return new Promise((resolve, reject) => {
    exec('npm run build', {cwd}, (error, stdout, stderr) => {
      if (error) {
        console.error(`Build failed: ${error.message}`);
        return reject(error);
      }
      console.log('Build successful');
      return resolve(undefined);
    });
  });
}


function zipDirectory(source, out) {
  const archive = archiver('zip', {zlib: {level: 9}});
  const stream = fss.createWriteStream(out);

  return new Promise((resolve, reject) => {
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
  const blob = new Blob([await fs.readFile(zipFilePath)], {type: 'application/zip'});
  form.set("file", blob, path.basename(zipFilePath), {contentType: 'application/zip'});
  form.set("config", JSON.stringify(config));

  // @TODO append signature secret header
  const response = await fetch(`https://pocket-guide.vercel.app/api/b/platform/upload`, {
    method: 'POST',
    body: form,
    headers: {
      'Authorization': process.env.SCOUT9_API_KEY || ''
    }
  });
  if (!response.ok) {
    throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
  }

  console.log('File sent successfully');
  return true;
}

async function downloadAndUnpackZip(outputDir) {
  const downloadLocalResponse = await fetch(
    `https://pocket-guide.vercel.app/api/b/platform/download`,
    {
      headers: {
        'Authorization': process.env.SCOUT9_API_KEY || ''
      }
    }
  );
  if (!downloadLocalResponse.ok) {
    throw new Error(`Error downloading project file ${downloadLocalResponse.statusText}`);
  }

  try {
    const buffer = await downloadLocalResponse.arrayBuffer();
    const decompress = require('decompress');
    await decompress(buffer, outputDir + '/build');

    console.log('Files unpacked successfully at ' + outputDir + '/build');

    return outputDir + '/build';
  } catch (error) {
    console.error('Error unpacking file:', error);
    throw error;
  }
}

export async function getApp({cwd = process.cwd(), folder = 'src', ignoreAppRequire = false} = {}) {
  const indexTsPath = path.resolve(cwd, folder, 'index.ts');
  const indexJsPath = path.join(cwd, folder, 'index.js');
  let exe = '';
  if (fss.existsSync(indexTsPath)) {
    exe = path.extname(indexTsPath);
  } else if (fss.existsSync(indexJsPath)) {
    exe = path.extname(indexJsPath);
  } else {
    throw new Error(`Missing main project entry file ${folder}/index.{js|ts}`);
  }
  const filePath = path.resolve(cwd, folder, `app${exe}`);
  let app;
  if (!ignoreAppRequire) {
    app = await requireProjectFile(filePath).then(mod => mod.default);
    const type = checkVariableType(app);
    if (!(type === 'function' || type === 'async function')) {
      throw new Error(`App must return a default function, received "${type}"`);
    }
  }
  return {app, exe, filePath, fileName: `app${exe}`}
}


/**
 * Runs a given project container from scout9 to given environment
 */
export async function run(event, {cwd = process.cwd(), folder} = {}) {

  // @TODO use scout9/admin
  await downloadAndUnpackZip(folder ? folder : path.resolve(cwd, 'tmp'));

  const {filePath, fileName} = await getApp({cwd, folder: folder ? path.resolve(folder, '/build') : 'tmp/build', ignoreAppRequire: true});

  return runInVM(event, {folder: folder ? path.resolve(folder, 'build') : path.resolve(cwd, 'tmp/build'), filePath, fileName});
}

/**
 * Builds a local project
 */
export async function build({cwd = process.cwd()} = {}, config) {
  // 1. Lint: Run validation checks

  // Check if app looks good
  await getApp({cwd, folder: 'src'});

  // Check if workflows look good
  console.log('@TODO check if workflows are properly written');

  // 2. Build code in user's project
  await runNpmRunBuild({cwd});


  // 3. Remove unnecessary files
  const files = globSync(path.resolve(cwd, 'build/**/*(*.test.*|*.spec.*)'))
  for (const file of files) {
    await fs.unlink(file);
  }

  // 3. Run tests
  // console.log('@TODO run tests');
}

/**
 * Deploys a local project to scout9
 */
export async function deploy({cwd = process.cwd()}, config) {
  const zipFilePath = path.join(cwd, 'build.zip');
  await zipDirectory(path.resolve(cwd, 'build'), zipFilePath);

  console.log('Project zipped successfully.');

  const response = await deployZipDirectory(zipFilePath, config);
  console.log('Response from Firebase Function:', response);
}
