import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import loadAgentConfig from './agents.js';
import loadEntitiesConfig from './entities.js';
import loadProjectConfig from './project.js';
import loadWorkflowsConfig from './workflow.js';


export function loadEnvConfig({ cwd = process.cwd()} = {}) {
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
export async function loadConfig({ cwd = process.cwd(), folder = 'src'} = {}) {
  // Load globals
  loadEnvConfig({cwd});
  return {
    ...await loadProjectConfig({cwd, folder}),
    entities: await loadEntitiesConfig({cwd, folder}),
    agents: await loadAgentConfig({cwd, folder}),
    workflows: await loadWorkflowsConfig({cwd, folder})
  }
}
