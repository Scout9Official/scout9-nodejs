import { fileTypeFromBuffer } from './file-type.js';

export const imageExtensions = new Set([
  'jpg',
  'png',
  'gif',
  'webp',
  'flif',
  'cr2',
  'tif',
  'bmp',
  'jxr',
  'psd',
  'ico',
  'bpg',
  'jp2',
  'jpm',
  'jpx',
  'heic',
  'cur',
  'dcm',
  'avif'
]);

/**
 * @typedef {Object} ImageTypeResult
 * @property {string} ext - One of the supported [file types](https://github.com/sindresorhus/image-type#supported-file-types).
 * @property {string} mime - The detected [MIME type](https://en.wikipedia.org/wiki/Internet_media_type).
 */

/**
 *
 * @param {Buffer | Uint8Array} input
 * @returns {Promise<ImageTypeResult | undefined>}
 */
export default async function imageType(input) {
  const result = await fileTypeFromBuffer(input);
  return imageExtensions.has(result?.ext) && result;
}
