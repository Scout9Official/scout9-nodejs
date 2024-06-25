import {extname, resolve, join, dirname, basename, parse} from 'node:path';
import {tmpdir} from 'node:os';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import { constants } from 'node:fs';
import { imageExtensions } from './image-type.js';
import { audioExtensions } from './audio-type.js';
import { videoExtensions } from './video-type.js';
import { fileTypeFromBuffer } from './file-type.js';
import { access } from 'fs/promises';

/**
 * @typedef {Object} BufferResult
 * @property {Buffer} buffer
 * @property {string} ext
 * @property {string} mime
 */

/**
 * @param {string} url
 * @returns {boolean}
 */
function isRemoteUrl(url) {
  try {
    const parsedUrl = new URL(url);
    // Check if the URL's protocol is HTTP, HTTPS, FTP, etc.
    return ['http:', 'https:', 'ftp:'].includes(parsedUrl.protocol);
  } catch (error) {
    // If parsing fails, it might be a local path or an invalid URL
    return false;
  }
}

/**
 * @param {string} url
 * @returns {Promise<BufferResult>}
 */
async function fetchFileToBuffer(url) {
  if (!isRemoteUrl(url)) {
    throw new Error('URL must be a remote resource');
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file "${url}": ${response.statusText}`);
  }
  let buffer;
  if ('buffer' in response) {
    buffer = await response.buffer();
  } else {
    buffer = await response.arrayBuffer().then(a => Buffer.from(a));
  }
  return {
    buffer,
    ext: extname(url).slice(1),
    mime: response.headers.get('content-type')
  };
}


/**
 * @typedef {Object} ToBufferResult
 * @property {Buffer} buffer
 * @property {string} ext
 * @property {string} mime
 * @property {boolean} isAudio
 * @property {boolean} isVideo
 * @property {boolean} isImage
 */

/**
 * @param {string | Buffer} fileBufferOrFilepath
 * @param {string} [source]
 * @returns {Promise<ToBufferResult>}
 */
export async function toBuffer(fileBufferOrFilepath, source) {
  let buffer;
  let mime;
  let ext;
  if (typeof fileBufferOrFilepath === 'string') {
    // Read file
    if (isRemoteUrl(fileBufferOrFilepath)) {
      const result = await fetchFileToBuffer(fileBufferOrFilepath);
      buffer = result.buffer;
      ext = result.ext;
      mime = result.mime;
    } else {
      if (source) {
        // @TODO support windows
        let relative = resolve(dirname(source), fileBufferOrFilepath);
        if (await access(relative, constants.R_OK).then(() => true).catch(() => false)) {
          buffer = await readFile(relative);
        } else if (await access(resolve(source, fileBufferOrFilepath), constants.R_OK).then(() => true).catch(() => false)) {
          buffer = await readFile(resolve(source, fileBufferOrFilepath));
        } else {
          console.error(`File not found: ${fileBufferOrFilepath} in relation to source: ${source}`);
          buffer = await readFile(fileBufferOrFilepath);
        }
      } else {
        buffer = await readFile(fileBufferOrFilepath);
      }
    }
  } else if (Buffer.isBuffer(fileBufferOrFilepath)) {
    buffer = fileBufferOrFilepath;
  } else {
    throw new Error(`Invalid img type: ${typeof fileBufferOrFilepath}`);
  }

  if (!buffer) {
    throw new Error('No buffer found');
  }

  // Check if audio, then image, if all fails, then text
  const result = await fileTypeFromBuffer(buffer);
  if (!result) {
    throw new Error('Invalid file type');
  }

  mime = result.mime;
  ext = result.ext;
  const isVideo = videoExtensions.has(ext);
  const isAudio = audioExtensions.has(ext);
  const isImage = imageExtensions.has(ext);

  return {
    buffer,
    ext,
    mime,
    isAudio,
    isImage,
    isVideo
  };
}

/**
 * @param inputs
 * @param {string} [inputs.dest]
 * @param {string} inputs.fileName
 * @param {string | Buffer} inputs.file
 * @returns {Promise<ToBufferResult & {uri: string}>}
 */
export async function writeFileToLocal({dest = resolve(tmpdir(), 'scout9'), file, fileName, source} = {}) {
  // Ensure folder exists
  // const fileFolder = resolve(cwd, dest);
  const fileFolder = dest;
  let filePath = resolve(fileFolder, fileName);
  await mkdir(dirname(filePath), {recursive: true});

  // Retrieve buffer and extension
  const result = await toBuffer(file, source);
  const {buffer, ext} = result;

  // If file path has no extension, add it or replace it with the correct one
  if (extname(filePath) === '') {
    filePath = `${filePath}.${ext}`;
  } else if (extname(filePath) !== ext) {
    console.warn(`File extension mismatch: ${extname(filePath)} !== ${ext}, replacing to .${ext}`);
    filePath = resolve(fileFolder, `${parse(filePath).name}.${ext}`);
  }

  // Write file to disk
  await writeFile(filePath, buffer);

  // Return file path
  return {uri: filePath, ...result};
}
