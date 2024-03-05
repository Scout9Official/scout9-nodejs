import { toBuffer } from './file.js';
import { audioExtensions } from './audio-type.js';
import { videoExtensions } from './video-type.js';

export default async function audioBuffer(audio, allowVideo = false, source = '') {
  const result = await toBuffer(audio, source);
  if (!result) {
    throw new Error(`Invalid audio type: ${typeof audio}`);
  }
  if (!audioExtensions.has(result.ext)) {
    if (!(allowVideo && videoExtensions.has(result.ext))) {
      throw new Error(`Invalid audio type: ${result.ext}`);
    }
  }
  return result;
}
