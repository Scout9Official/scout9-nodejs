import { ZodString } from 'zod';

export function zId(name, strType) {
  if (strType instanceof ZodString) {
    return strType.regex(/^[A-Za-z0-9\-_\[\]]+$/, {
      message: `Invalid ${name} ID: ID must not contain spaces and should only contain alphanumeric characters, dashes, or underscores.`
    });
  } else {
    throw new Error(`Invalid zId type: ${strType}`);
  }
}
