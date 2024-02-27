import { fileTypeFromBuffer } from './file-type.js';

export const videoExtensions = new Set([
  'mp4',
  'm4v',
  'mkv',
  'webm',
  'mov',
  'avi',
  'wmv',
  'mpg',
  'flv',
]);

/**
 * @typedef {Object} VideoTypeResult
 * @property {string} ext - One of the supported [file types](https://github.com/sindresorhus/image-type#supported-file-types).
 * @property {string} mime - The detected [MIME type](https://en.wikipedia.org/wiki/Internet_media_type).
 */

/**
 *
 * @param {Buffer | Uint8Array} input
 * @returns {Promise<VideoTypeResult | undefined>}
 */
export default async function videoType(input) {
  const result = await fileTypeFromBuffer(input);
  return videoExtensions.has(result?.ext) && result;
}
