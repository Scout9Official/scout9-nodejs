import { z } from 'zod';

/**
 * @param {string} name
 * @param {Object} [props]
 * @returns {import('zod').ZodString}
 */
export function zId(name, props = {}) {
  return z.string(props).regex(/^[A-Za-z0-9\-_\[\]]+$/, {
    message: `Invalid ${name} ID: ID must not contain spaces and should only contain alphanumeric characters, dashes, or underscores.`
  });
}
