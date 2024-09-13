import { z } from 'zod';
import { zId } from './utils.js';
import { MessageSchema } from './message.js';

export const CustomerValueSchema = z.union([z.boolean(), z.number(), z.string()]);

export const CustomerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  img: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  line1: z.string().nullable().optional(),
  line2: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  town: z.string().nullable().optional(),
  joined: z.string().nullable().optional(),
  stripe: z.string().nullable().optional(),
  stripeDev: z.string().nullable().optional()
}).catchall(CustomerValueSchema);

export const AgentSchema = z.object({
  deployed: z.object({
    web: z.string({description: 'Web URL for agent'}).optional(),
    phone: z.string({description: 'Phone number for agent'}).optional(),
    email: z.string({description: 'Email address for agent'}).optional()
  }).optional(),
  img: z.string().nullable().optional(),
  firstName: z.string({description: 'Agent first name'}).optional(),
  lastName: z.string({description: 'Agent last name'}).optional(),
  inactive: z.boolean({description: 'Agent is inactive'}).optional(),
  programmablePhoneNumber: z.string({description: 'Programmable phone number'}).optional(),
  programmablePhoneNumberSid: z.string({description: 'Programmable phone number SID'}).optional(),
  programmableEmail: z.string({description: 'Email address from Scout9 gmail subdomain'}).optional(),
  forwardEmail: z.string({description: 'Email address to forward to'}).optional(),
  forwardPhone: z.string({description: 'Phone number to forward to'}).optional(),
  title: z.string({description: 'Agent title '}).optional().default('Agent'),
  context: z.string({description: 'Context of the agent'}).optional().default('You represent the agent when they are away'),
  includedLocations: z.array(z.string({description: 'Locations the agent is included in'})).optional(),
  excludedLocations: z.array(z.string({description: 'Locations the agent is excluded from'})).optional(),
  model: z.enum(['Scout9', 'bard', 'openai']).optional().default('openai'),
  transcripts: z.array(z.array(MessageSchema)).optional(),
  audios: z.array(z.any()).optional()
});

export const PersonaSchema = AgentSchema;

export const AgentConfigurationSchema = AgentSchema.extend({
  id: zId('Agent ID', {description: 'Unique ID for agent'}),
});

export const PersonaConfigurationSchema = AgentConfigurationSchema.extend({
  id: zId('Agent ID', {description: 'Unique ID for agent'}),
});

export const AgentsConfigurationSchema = z.array(AgentConfigurationSchema);

export const PersonasConfigurationSchema = z.array(PersonaConfigurationSchema);

export const AgentsSchema = z.array(AgentSchema);

export const PersonasSchema = z.array(PersonaSchema);
