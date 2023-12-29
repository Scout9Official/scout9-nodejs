import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import loadAgentConfig from './agents.js';
import loadEntitiesConfig from './entities.js';
import loadProjectConfig from './project.js';
import loadWorkflowsConfig from './workflow.js';
import { Scout9ProjectBuildConfigSchema } from '../../runtime/index.js';


export function loadEnvConfig({ cwd = process.cwd()} = {}) {
  if (!!process.env.SCOUT9_API_KEY) {
    return;
  }
  const configFilePath = path.resolve(cwd, './.env');
  config({path: configFilePath});
  if (!process.env.SCOUT9_API_KEY) {
    const exists = fs.existsSync(configFilePath);
    if (!exists) {
      throw new Error(`Missing .env file with SCOUT9_API_KEY`);
    } else {
      throw new Error('Missing SCOUT9_API_KEY within .env file');
    }
  }
}

/**
 *
 * @param cwd
 * @param folder
 * @returns {Promise<Scout9ProjectBuildConfig>}
 */
export async function loadConfig({ cwd = process.cwd(), folder = 'src'} = {}) {
  // Load globals
  loadEnvConfig({cwd});
  const projectConfig = {
    ...await loadProjectConfig({cwd, folder}),
    entities: await loadEntitiesConfig({cwd, folder}),
    agents: await loadAgentConfig({cwd, folder}),
    workflows: await loadWorkflowsConfig({cwd, folder})
  }

  // Validate the config
  Scout9ProjectBuildConfigSchema.parse(projectConfig);

  return projectConfig;
}
