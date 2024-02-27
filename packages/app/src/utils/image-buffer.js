import { toBuffer } from './file.js';
import { imageExtensions } from './image-type.js';
import { isSvg } from './is-svg.js';

export default async function imageBuffer(img, allowSvg = false) {
  const imageResult = await toBuffer(img);
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
