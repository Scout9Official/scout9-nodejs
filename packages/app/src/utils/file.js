import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import { imageExtensions } from './image-type.js';
import { audioExtensions } from './audio-type.js';
import { videoExtensions } from './video-type.js';
import { fileTypeFromBuffer } from './file-type.js';

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
  return {
    buffer: response.buffer(),
    ext: path.extname(url).slice(1),
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
 * @returns {Promise<ToBufferResult>}
 */
export async function toBuffer(fileBufferOrFilepath) {
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
      buffer = await fs.readFile(fileBufferOrFilepath);
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
export async function writeFileToLocal({dest = path.resolve(os.tmpdir(), 'scout9'), file, fileName} = {}) {
  // Ensure folder exists
  // const fileFolder = path.resolve(cwd, dest);
  const fileFolder = dest;
  let filePath = path.resolve(fileFolder, fileName);
  await fs.mkdir(path.dirname(filePath), {recursive: true});

  // Retrieve buffer and extension
  const result = await toBuffer(file);
  const {buffer, ext} = result;

  // If file path has no extension, add it or replace it with the correct one
  if (path.extname(filePath) === '') {
    filePath = `${filePath}.${ext}`;
  } else if (path.extname(filePath) !== ext) {
    console.warn(`File extension mismatch: ${path.extname(filePath)} !== ${ext}, replacing to .${ext}`);
    filePath = path.resolve(fileFolder, `${path.parse(filePath).name}.${ext}`);
  }

  // Write file to disk
  await fs.writeFile(filePath, buffer);

  // Return file path
  return {uri: filePath, ...result};
}
