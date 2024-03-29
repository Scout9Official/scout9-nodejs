import { z } from 'zod';
import { agentsConfigurationSchema } from './agent.js';
import { entitiesRootProjectConfigurationSchema } from './entity.js';
import { WorkflowsConfigurationSchema } from './workflow.js';

const llmModelOptions = z.union([
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

const pmtModelOptions = z.union([
  z.literal('orin-1.0'),
  z.literal('orin-2.0-preview')
]);

const llmSchema = z.object({
  engine: z.literal('openai'),
  model: llmModelOptions
});

const llamaSchema = z.object({
  engine: z.literal('llama'),
  model: z.string()
});

const bardSchema = z.object({
  engine: z.literal('bard'),
  model: z.string()
});

const pmtSchema = z.object({
  engine: z.literal('scout9'),
  // model: pmtModelOptions
  model: z.string()
});

export const Scout9ProjectBuildConfigSchema = z.object({
  tag: z.string().optional(), // Defaults to scout9-app-v1.0.0
  agents: agentsConfigurationSchema,
  entities: entitiesRootProjectConfigurationSchema,
  workflows: WorkflowsConfigurationSchema,
  llm: z.union([llmSchema, llamaSchema, bardSchema]),
  pmt: pmtSchema,
  initialContext: z.array(z.string()),
  maxLockAttempts: z.number().min(0).max(20).optional(),
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
});
