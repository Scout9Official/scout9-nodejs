import { z } from 'zod';
import { zId } from './utils.js';

export const MessageEntitySchema = z.object({
  start: z.number(),
  end: z.number(),
  type: z.string(),
  option: z.string().optional().nullable(),
  text: z.string().optional().nullable()
});

export const MessageSchema = z.object({
  id: zId('Message ID', {description: 'Unique ID for the message'}),
  role: z.enum(['agent', 'customer', 'system']),
  content: z.string(),
  time: z.string({description: 'Datetime ISO 8601 timestamp'}),
  name: z.string().optional(),
  scheduled: z.string({description: 'Datetime ISO 8601 timestamp'}).optional(),
  context: z.any({description: 'The context generated from the message'}).optional(),
  intent: z.string({description: 'Detected intent'}).optional().nullable(),
  intentScore: z.number({description: 'Confidence score of the assigned intent'}).nullable().optional(),
  delayInSeconds: z.number({description: 'How long to delay the message manually in seconds'}).nullable().optional(),
  entities: z.array(MessageEntitySchema).optional().nullable()
});
