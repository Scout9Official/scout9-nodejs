import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import loadAgentConfig from './agents.js';
import loadEntitiesConfig from './entities.js';
import loadProjectConfig from './project.js';
import loadWorkflowsConfig from './workflow.js';
import { Scout9ProjectBuildConfigSchema } from '../../runtime/index.js';
import { ProgressLogger } from '../../utils/index.js';
import ProjectFiles from '../../utils/project.js';
import { logUserValidationError } from '../../report.js';


export function loadEnvConfig({
  cwd = process.cwd(), cb = (msg) => {
  }
} = {}) {
  if (!!process.env.SCOUT9_API_KEY) {
    if (process.env.SCOUT9_API_KEY.includes('insert-scout9-api-key')) {
      throw new Error('Missing SCOUT9_API_KEY, please add your Scout9 API key to your .env file');
    }
    return;
  }
  const configFilePath = path.resolve(cwd, './.env');
  config({path: configFilePath});
  if (!process.env.SCOUT9_API_KEY) {
    const exists = fs.existsSync(configFilePath);
    if (!exists) {
      throw new Error(`Missing .env file with "SCOUT9_API_KEY".\n\n\tTo fix, create a .env file at the root of your project.\nAdd "SCOUT9_API_KEY=<your-scout9-api-key>" to the .env file.\n\n\t> You can get your API key at https://scout9.com\n\n`);
    } else {
      throw new Error(`Missing "SCOUT9_API_KEY" within .env file.\n\n\tTo fix, add "SCOUT9_API_KEY=<your-scout9-api-key>" to the .env file.\n\n\tYou can get your API key at https://scout9.com\n\n`);
    }
  }
}

/**
 * @deprecated use "new ProjectFiles(...).load()" instead
 * @param {{cwd: string; src: string; logger?: ProgressLogger; deploying?: boolean; cb?: (message: string) => void}} - build options
 * @returns {Promise<Scout9ProjectBuildConfig>}
 */
export async function loadConfig({
  cwd = process.cwd(), src = 'src', dest = '/tmp/project', deploying = false, logger = new ProgressLogger(), cb = (msg) => {
  }
} = {}) {
  // Load globals
  loadEnvConfig({cwd, src, logger, cb});

  const baseProjectConfig = await loadProjectConfig({cwd, src, logger, cb});
  const entitiesConfig = await loadEntitiesConfig({cwd, src, logger, cb});
  const agentsConfig = await loadAgentConfig({cwd, src, logger, cb, deploying, dest});
  const workflowsConfig = await loadWorkflowsConfig({cwd, src, logger, cb});

  /**
   * @type {Scout9ProjectBuildConfig}
   */
  const projectConfig = {
    ...baseProjectConfig,
    entities: entitiesConfig,
    agents: agentsConfig,
    workflows: workflowsConfig
  };

  // Validate the config
  const result = Scout9ProjectBuildConfigSchema.safeParse(projectConfig);
  if (!result.success) {
    result.error.source = `${src}/index.js`;
    throw result.error;
  }

  return projectConfig;
}
