import { z } from 'zod';
import { zId } from './utils.js';

export const MessageEntitySchema = z.object({
  start: z.number(),
  end: z.number(),
  type: z.string().optional().nullable(),
  option: z.string().optional().nullable(),
  text: z.string().optional().nullable()
});

/**
 * Follows @scout9/admin Message
 */
export const MessageSchema = z.object({
  id: zId('Message ID', {description: 'Unique ID for the message'}),
  role: z.enum(['agent', 'customer', 'system', 'tool']),
  content: z.string(),
  time: z.string({description: 'Datetime ISO 8601 timestamp'}),
  name: z.string().optional(),
  scheduled: z.string({description: 'Datetime ISO 8601 timestamp'}).optional(),
  context: z.any({description: 'The context generated from the message'}).optional(),
  intent: z.string({description: 'Detected intent'}).optional().nullable(),
  intentScore: z.number({description: 'Confidence score of the assigned intent'}).nullable().optional(),
  delayInSeconds: z.number({description: 'How long to delay the message manually in seconds'}).nullable().optional(),
  entities: z.array(MessageEntitySchema).optional().nullable(),
  ignoreTransform: z.boolean({description: 'If set to true, the PMT will not transform, message will be sent as is'}).optional(),
  mediaUrls: z.array(z.string(), {description: 'Media urls to attach to the transported message'}).optional().nullable(),
  tool_calls: z.array(z.object({
    id: z.string(),
    type: z.string(),
    function: z.object({
      arguments: z.string(),
      name: z.string()
    })
  })).optional().nullable(),
  tool_call_id: z.string().optional().nullable()
});
