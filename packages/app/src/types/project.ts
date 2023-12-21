import { WorkflowsConfiguration } from '../runtime/client';
import { AgentsConfiguration } from '../runtime/client/agent';
import { EntitiesRootConfiguration } from '../runtime/client/entity';
import { Agent } from './api';

/**
 * Represents the configuration provided in src/index.{js | ts} in a project
 */
export interface IScout9ProjectConfig {
  llm: {
    engine: 'openai',
    model: (string & {})
      | 'gpt-4-1106-preview'
      | 'gpt-4-vision-preview'
      | 'gpt-4'
      | 'gpt-4-0314'
      | 'gpt-4-0613'
      | 'gpt-4-32k'
      | 'gpt-4-32k-0314'
      | 'gpt-4-32k-0613'
      | 'gpt-3.5-turbo'
      | 'gpt-3.5-turbo-16k'
      | 'gpt-3.5-turbo-0301'
      | 'gpt-3.5-turbo-0613'
      | 'gpt-3.5-turbo-16k-0613';
  } | {
    engine: 'llama',
    model: string;
  } | {
    engine: 'bard',
    model: string;
  },
  /**
   * Configure personal model transformer (PMT) settings to align auto replies the agent's tone
   */
  pmt: {
    engine: 'scout9',
    model: 'orin-1.0' | 'orin-2.0-preview'
  }
}

/**
 * Including the provided project config, this is the manifest for all entities and workflows to be managed in build
 */
export interface IScout9ProjectBuildConfig extends IScout9ProjectConfig {
  agents: AgentsConfiguration;
  entities: EntitiesRootConfiguration;
  workflows: WorkflowsConfiguration;
}
