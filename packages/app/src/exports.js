import { Scout9Platform } from './platform.js';
import { EventResponse } from './runtime/index.js';

export { EventResponse } from './runtime/index.js';
// export * from './types';
export * from './testing-tools/index.js';

export async function run(
  event,
  {cwd = process.cwd()} = {},
) {
  return Scout9Platform.run(event, {cwd})
}
export async function sendEvent(
  event,
  {cwd = process.cwd()} = {},
) {
  return Scout9Platform.run(event, {cwd})
}

/**
 * @param data {T}
 * @param init {ResponseInit | undefined}
 * @returns {EventResponse<T>}
 */
export function json(data, init) {
  // TODO deprecate this in favour of `Response.json` when it's
  // more widely supported
  const body = JSON.stringify(data);

  // we can't just do `text(JSON.stringify(data), init)` because
  // it will set a default `content-type` header. duplicated code
  // means less duplicated work
  const headers = new Headers(init?.headers);
  if (!headers.has('content-length')) {
    headers.set('content-length', encoder.encode(body).byteLength.toString());
  }

  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  return new EventResponse(data, {
    ...init,
    headers
  });
}

const encoder = new TextEncoder();