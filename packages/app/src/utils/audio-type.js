import { fileTypeFromBuffer } from './file-type.js';

export const audioExtensions = new Set([
  'mp3',
  'flac',
  'm4a',
  'opus',
  'ogg',
  'wav',
  'amr',
]);

/**
 * @typedef {Object} AudioTypeResult
 * @property {string} ext - One of the supported [file types](https://github.com/sindresorhus/image-type#supported-file-types).
 * @property {string} mime - The detected [MIME type](https://en.wikipedia.org/wiki/Internet_media_type).
 */

/**
 *
 * @param {Buffer | Uint8Array} input
 * @returns {Promise<AudioTypeResult | undefined>}
 */
export default async function audioType(input) {
  const result = await fileTypeFromBuffer(input);
  return audioExtensions.has(result?.ext) && result;
}
