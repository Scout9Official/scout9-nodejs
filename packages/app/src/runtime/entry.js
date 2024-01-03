import moment from 'moment';
import vm from 'node:vm';
import path from 'node:path';
import fs from 'node:fs';
import {globSync} from 'glob';

import * as Platform from '../exports.js';

const allowedModules = {
  moment: moment,
  platform: Platform
  // Add other allowed modules here
}

function customRequire(folder, moduleName) {
  if (allowedModules.hasOwnProperty(moduleName)) {
    return allowedModules[moduleName];
  }
  let modulePath = path.resolve(folder, moduleName);
  if (moduleName.startsWith('../') || moduleName.startsWith('./')) {

    // @TODO remove this
    if (moduleName.includes('platform/src')) {
      return allowedModules['platform'];
    }


    // Relative file path, resolve it relative to the current file
    // Use glob to guess the file absolute url
    const modulePaths = globSync(`${folder}/**/${moduleName}*`);
    if (modulePaths.length !== 1) {
      throw new Error(`Could not resolve module "${moduleName}" absolute path`);
    }
    modulePath = modulePaths[0];
  }

  // Check for .js extension @TODO idk if we need to do this
  const resolvedPath = modulePath.endsWith('.js') ? modulePath : `${modulePath}.js`;

  // Read and execute the module file
  const moduleCode = fs.readFileSync(resolvedPath, 'utf8');
  const moduleScript = new vm.Script(moduleCode, { filename: moduleName });

  // Prepare a module-specific context
  const moduleExports = {};
  const moduleContext = vm.createContext({
    require: (name) => customRequire(folder, name),
    console,
    module: { exports: moduleExports },
    exports: moduleExports,
    __filename: resolvedPath,
    __dirname: path.dirname(resolvedPath),
  });

  try {
    moduleScript.runInContext(moduleContext);
  } catch (e) {
    throw e;
  }

  return moduleContext.module.exports;
}

export async function runInVM(
  event,
  {src, filePath, fileName}
) {
  // Prepare the script context
  const scriptExports = {};
  const context = vm.createContext({
    require: (moduleName) => customRequire(src, moduleName),
    console,
    module: { exports: scriptExports },
    exports: scriptExports,
    __filename: filePath,
    __dirname: path.dirname(filePath),
  });

  const scriptCode = fs.readFileSync(filePath, 'utf8');
  const entryScript = new vm.Script(scriptCode, { filename: fileName });

  // Run the script in the VM
  entryScript.runInContext(context);

  const exportedFunction = context.module.exports.default;

  if (typeof exportedFunction !== 'function') {
    throw new Error(`The script did not export a function`);
  }

  return exportedFunction(event);
}
