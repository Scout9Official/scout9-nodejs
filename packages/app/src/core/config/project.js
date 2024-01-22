import path from 'node:path';
import { requireProjectFile } from '../../utils/index.js';
import { globSync } from 'glob';
import { pathToFileURL } from 'node:url';
import fss from 'node:fs';
import fs from 'node:fs/promises';

/**
 * Loads the users local package.json, if they provide a package-s9-test.json, it will load that instead (used for scout9 internal testing)
 * @param {cwd?: string}
 * @returns {Promise<{isTest: boolean, pkg: {name: string; version: string; dependencies: Record<string, string>}}>}
 */
export async function loadUserPackageJson({cwd = process.cwd()}) {
  const packageJsonPath = path.resolve(cwd, './package.json');
  const packageTestJsonPath = path.resolve(cwd, './package-s9-test.json');
  const packageJsonUrl = pathToFileURL(packageJsonPath);
  const packageTestJsonUrl = pathToFileURL(packageTestJsonPath);
  const isTest = fss.existsSync(packageTestJsonUrl);
  const targetPkgUrl = isTest ? packageTestJsonUrl : packageJsonUrl;
  const pkg = JSON.parse(await fs.readFile(new URL(targetPkgUrl, import.meta.url), 'utf-8'));
  return {
    pkg,
    isTest
  }
}

/**
 * @returns {Promise<Scout9ProjectConfig>}
 */
export default async function loadProjectConfig({cwd = process.cwd(), src = 'src', cb = (message) => {}} = {}) {
  // Grab the project tag name (from their package.json)
  const {pkg} = await loadUserPackageJson({cwd});
  const tag = `${pkg.name || 'scout9-app'}-v${pkg.version || '0.0.1'}`;

  // Grab the project config file (from src/index.{ts,js})
  const paths = globSync(`${src}/index.{ts,cjs,mjs,js}`, {cwd, absolute: true});
  if (paths.length === 0) {
    throw new Error(`Missing main project entry file ${src}/index.{js|ts|cjs|mjs}`);
  } else if (paths.length > 1) {
    throw new Error(`Multiple main project entry files found ${src}/index.{js|ts|cjs|mjs}`);
  }
  const [filePath] = paths;
  const project = await requireProjectFile(filePath).then(mod => mod.default);
  // @TODO validation type check with zod
  return {
    tag,
    ...project,
  };
}
