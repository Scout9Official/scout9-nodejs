import { toBuffer } from './file.js';
import { imageExtensions } from './image-type.js';
import { isSvg } from './is-svg.js';

/**
 *
 * @param {string | Buffer} img
 * @param [allowSvg=false]
 * @param [source='']
 * @returns {Promise<{buffer: Buffer, ext: string, mime: string, isAudio: boolean, isVideo: boolean, isImage: boolean}>}
 */
export default async function imageBuffer(img, allowSvg = false, source = '') {
  const imageResult = await toBuffer(img, source);
  if (!imageResult) {
    throw new Error(`Invalid image type: ${typeof img}`);
  }
  if (!imageExtensions.has(imageResult.ext)) {
    if (!(allowSvg && isSvg(img.toString('utf-8')))) {
      throw new Error(`Invalid image type: ${imageResult.ext}`);
    }
  }
  return imageResult;
}
