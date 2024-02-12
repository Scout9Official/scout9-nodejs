import path from 'node:path';
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
