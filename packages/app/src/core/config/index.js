import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import loadAgentConfig from './agents.js';
import loadEntitiesConfig from './entities.js';
import loadProjectConfig from './project.js';
import loadWorkflowsConfig from './workflow.js';
import { Scout9ProjectBuildConfigSchema } from '../../runtime/index.js';
import { ProgressLogger } from '../../utils/index.js';


export function loadEnvConfig({ cwd = process.cwd(), folder = 'src', logger = new ProgressLogger()} = {}) {
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
 * @param logger
 * @returns {Promise<Scout9ProjectBuildConfig>}
 */
export async function loadConfig({ cwd = process.cwd(), folder = 'src', logger = new ProgressLogger()} = {}) {
  // Load globals
  loadEnvConfig({cwd, folder, logger});
  const baseProjectConfig  = await loadProjectConfig({cwd, folder, logger});
  const entitiesConfig = await loadEntitiesConfig({cwd, folder, logger});
  const agentsConfig = await loadAgentConfig({cwd, folder, logger});
  const workflowsConfig = await loadWorkflowsConfig({cwd, folder, logger});

  /**
   * @type {Scout9ProjectBuildConfig}
   */
  const projectConfig = {
    ...baseProjectConfig,
    entities: entitiesConfig,
    agents: agentsConfig,
    workflows: workflowsConfig
  }

  // Validate the config
  const result = Scout9ProjectBuildConfigSchema.safeParse(projectConfig);
  if (!result.success) {
    throw result.error;
  }

  return projectConfig;
}
