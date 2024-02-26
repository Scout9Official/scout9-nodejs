import { z } from 'zod';
import { zId } from './utils.js';
import { MessageSchema } from './message.js';

export const customerValueSchema = z.union([z.boolean(), z.number(), z.string()]);

export const customerSchema = z.object({
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
}).catchall(customerValueSchema);

export const agentConfigurationSchema = z.object({
  id: zId('Agent ID', z.string({description: 'Unique ID for agent'})),

  // deployed?: {
  //   web?: string;
  //   phone?: string;
  //   email?: string;
  // };

  deployed: z.object({
    web: z.string({description: 'Web URL for agent'}).optional(),
    phone: z.string({description: 'Phone number for agent'}).optional(),
    email: z.string({description: 'Email address for agent'}).optional()
  }).optional(),

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
export const agentsConfigurationSchema = z.array(agentConfigurationSchema);
