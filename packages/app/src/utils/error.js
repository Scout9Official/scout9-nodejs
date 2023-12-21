/**
 * @param {unknown} err
 * @return {Error}
 */
export function coalesceToError(err) {
  return err instanceof Error ||
  (err && /** @type {any} */ err.name && /** @type {any} */ err.message)
    ? /** @type {Error} */ err
    : new Error(JSON.stringify(err));
}

/**
 * This is an identity function that exists to make TypeScript less
 * paranoid about people throwing things that aren't errors, which
 * frankly is not something we should care about
 * @param {unknown} error
 */
export function normalizeError(error) {
  return /** @type {import('../runtime/control.js').Redirect | import('../runtime/control.js').HttpError | Error} */ (
    error
  );
}
