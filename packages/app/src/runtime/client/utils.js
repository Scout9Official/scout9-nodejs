import { z } from 'zod';

/**
 *
 * @param {string} name
 * @returns {ZodString}
 */
export function zId(name) {
  return z.string().regex(/^[A-Za-z0-9\-_\[\]]+$/, {
    message: `Invalid ${name} ID: ID must not contain spaces and should only contain alphanumeric characters, dashes, or underscores.`
  });
}
