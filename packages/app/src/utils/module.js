import { pathToFileURL } from 'node:url';

async function importFile(filePath) {
  const fileUrl = pathToFileURL(filePath);
  return import(fileUrl.href);
}

export async function requireProjectFile(filePath) {
  try {
    return importFile(filePath);
  } catch (e) {
    throw new Error(`Missing required project file "${filePath}"`);
  }
}

export async function requireOptionalProjectFile(filePath) {
  return importFile(filePath).catch((e) => {
    switch (e.code) {
      case 'ERR_MODULE_NOT_FOUND':
      case 'MODULE_NOT_FOUND':
        return null;
      default:
        throw e;
    }
  });
}


export function checkVariableType(variable) {
  // Check for null explicitly as typeof null is "object"
  if (variable === null) {
    return 'null';
  }

  const type = typeof variable;

  // Check for function or async function
  if (type === 'function') {
    // Check if it's an async function
    if (variable.constructor.name === 'AsyncFunction') {
      return 'async function';
    }
    return 'function';
  }

  // Check for JSON object (which in JavaScript is just an object)
  if (type === 'object') {
    // Additional check to differentiate from array and other objects
    if (!Array.isArray(variable) && !(variable instanceof Date)) {
      return 'json object';
    }
    if (Array.isArray(variable)) {
      return 'array';
    }
    return 'object';
  }

  // Other types (number, string, boolean, undefined, etc.)
  return type;
}
