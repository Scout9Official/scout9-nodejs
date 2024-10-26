import { z } from 'zod';
import { AgentsSchema } from './users.js';
import { EntitiesRootProjectConfigurationSchema } from './entity.js';
import { WorkflowsConfigurationSchema } from './workflow.js';
import { CommandsSchema } from './commands.js';

const LlmModelOptions = z.union([
  z.literal('gpt-4-1106-preview'),
  z.literal('gpt-4-vision-preview'),
  z.literal('gpt-4'),
  z.literal('gpt-4-0314'),
  z.literal('gpt-4-0613'),
  z.literal('gpt-4-32k'),
  z.literal('gpt-4-32k-0314'),
  z.literal('gpt-4-32k-0613'),
  z.literal('gpt-3.5-turbo'),
  z.literal('gpt-3.5-turbo-16k'),
  z.literal('gpt-3.5-turbo-0301'),
  z.literal('gpt-3.5-turbo-0613'),
  z.literal('gpt-3.5-turbo-16k-0613'),
  z.string() // for the (string & {}) part
]);

const PmtModelOptions = z.union([
  z.literal('orin-1.0'),
  z.literal('orin-2.0-preview')
]);

const LlmSchema = z.object({
  engine: z.literal('openai'),
  model: LlmModelOptions
});

const LlamaSchema = z.object({
  engine: z.literal('llama'),
  model: z.string()
});

const BardSchema = z.object({
  engine: z.literal('bard'),
  model: z.string()
});

/**
 * Configure personal model transformer (PMT) settings to align auto replies the agent's tone
 */
const PmtSchema = z.object({
  engine: z.literal('scout9'),
  // model: pmtModelOptions
  model: z.string()
}, {
  description: 'Configure personal model transformer (PMT) settings to align auto replies the agent\'s tone'
});

/**
 * Represents the configuration provided in src/index.{js | ts} in a project
 */
export const Scout9ProjectConfigSchema = z.object({
  /**
   * Tag to reference this application
   * @defaut your local package.json name + version, or scout9-app-v1.0.0
   */
  tag: z.string().optional(), // Defaults to scout9-app-v1.0.0
  llm: z.union([LlmSchema, LlamaSchema, BardSchema]),
  /**
   * Configure personal model transformer (PMT) settings to align auto replies the agent's tone
   */
  pmt: PmtSchema,

  /**
   * Determines the max auto replies without further conversation progression (defined by new context data gathered)
   * before the conversation is locked and requires manual intervention
   * @default 3
   */
  maxLockAttempts: z.number({
    description: 'Determines the max auto replies without further conversation progression (defined by new context data gathered), before the conversation is locked and requires manual intervention'
  }).min(0).max(20).default(3).optional(),

  initialContext: z.array(z.string(), {
    description: 'Configure the initial contexts for every conversation'
  }),

  organization: z.object({
    name: z.string(),
    description: z.string(),
    dashboard: z.string().optional(),
    logo: z.string().optional(),
    icon: z.string().optional(),
    logos: z.string().optional(),
    website: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional()
})

export const Scout9ProjectBuildConfigSchema = Scout9ProjectConfigSchema.extend({
  agents: AgentsSchema,
  entities: EntitiesRootProjectConfigurationSchema,
  workflows: WorkflowsConfigurationSchema,
  commands: CommandsSchema
});


