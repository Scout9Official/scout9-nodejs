import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import loadAgentConfig from './agents.js';
import loadEntitiesConfig from './entities.js';
import loadProjectConfig from './project.js';
import loadWorkflowsConfig from './workflow.js';
import { Scout9ProjectBuildConfigSchema } from '../../runtime/index.js';
import { ProgressLogger } from '../../utils/index.js';


export function loadEnvConfig({cwd = process.cwd()} = {}) {
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
            throw new Error(`Missing .env file with SCOUT9_API_KEY`);
        } else {
            throw new Error('Missing SCOUT9_API_KEY within .env file');
        }
    }
}

/**
 * @param {{cwd: string; src: string; logger: ProgressLogger}} - build options
 * @returns {Promise<Scout9ProjectBuildConfig>}
 */
export async function loadConfig({cwd = process.cwd(), src = 'src', logger = new ProgressLogger()} = {}) {
    // Load globals
    loadEnvConfig({cwd, src, logger});
    const baseProjectConfig = await loadProjectConfig({cwd, src, logger});
    const entitiesConfig = await loadEntitiesConfig({cwd, src, logger});
    const agentsConfig = await loadAgentConfig({cwd, src, logger});
    const workflowsConfig = await loadWorkflowsConfig({cwd, src, logger});

    /**
     * @type {Scout9ProjectBuildConfig}
     */
    const projectConfig = {
        ...baseProjectConfig, entities: entitiesConfig, agents: agentsConfig, workflows: workflowsConfig
    };

    // Validate the config
    const result = Scout9ProjectBuildConfigSchema.safeParse(projectConfig);
    if (!result.success) {
        throw result.error;
    }

    return projectConfig;
}
