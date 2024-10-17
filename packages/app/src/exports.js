import { Scout9Platform } from './platform.js';
import { EventResponse } from './runtime/index.js';

export { EventResponse } from './runtime/index.js';
export { ProgressLogger } from './utils/logger.js';

export * from './testing-tools/index.js';
export * from './runtime/client/index.js';
export * from './runtime/macros/index.js';

/**
 * @param {WorkflowEvent} event - every workflow receives an event object
 * @param {Object} options
 * @param {string} [options.cwd=process.cwd()] - the working directory
 * @param {string} [options.mode='production'] - the build mode
 * @param {string} [options.src='./src'] - the source directory
 * @param {string} options.eventSource - the source of the workflow event
 * @returns {WorkflowResponse}
 */
export async function run(event, options) {
  return Scout9Platform.run(event, options)
}

/**
 * @param {WorkflowEvent} event - every workflow receives an event object
 * @param {{cwd: string; mode: 'development' | 'production'; src: string}} options - build options
 * @returns {WorkflowResponse}
 */
export const sendEvent = run;

/**
 * @template T
 * @param {T} data
 * @param {ResponseInit | undefined} [init]
 * @returns {EventResponse<T>}
 */
export function json(data, init) {
  if (data instanceof Promise) {
    throw new Error(`json() does not expect a Promise. Use json(await promise) instead`);
  }
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
