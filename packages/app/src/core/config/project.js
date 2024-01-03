import path from 'node:path';
import { requireProjectFile } from '../../utils/index.js';
import { globSync } from 'glob';

/**
 * @returns {Promise<Scout9ProjectConfig>}
 */
export default async function loadProjectConfig({cwd = process.cwd(), folder = 'src'} = {}) {
  const paths = globSync(path.resolve(cwd, `${folder}/index.{ts,js}`));
  if (paths.length === 0) {
    throw new Error(`Missing main project entry file ${folder}/index.{js|ts}`);
  } else if (paths.length > 1) {
    throw new Error(`Multiple main project entry files found ${folder}/index.{js|ts}`);
  }
  const [filePath] = paths;
  const project = await requireProjectFile(filePath).then(mod => mod.default);
  // @TODO validation type check with zod
  return project;
}
