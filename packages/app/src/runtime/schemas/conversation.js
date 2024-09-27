import { z } from 'zod';
import { zId } from './utils.js';

export const ConversationContext = z.record(
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(
      z.union([z.string(), z.number(), z.boolean(), z.null()])
    )
  ])
);

export const ConversationAnticipateSchema = z.object({
  type: z.enum(['did', 'literal', 'context'], {description: "Determines the runtime to address the next response"}),
  slots: z.record(z.string(), z.array(z.any())),
  did: z.string({description: 'For type \'did\''}).optional(),
  map: z.array(z.object({
    slot: z.string(),
    keywords: z.array(z.string())
  }), {description: 'For literal keywords, this map helps point which slot the keyword matches to'}).optional()
});

export const ConversationSchema = z.object({
  $agent: zId('Conversation Agent ID', z.string({description: 'Default agent assigned to the conversation(s)'})),
  $customer: zId('Conversation Customer ID', z.string({description: 'Customer this conversation is with'})),
  initialContexts: z.array(z.string(), {description: 'Initial contexts to load when starting the conversation'})
    .optional(),
  environment: z.enum(['phone', 'email', 'web']),
  environmentProps: z.object({
    subject: z.string({description: 'HTML Subject of the conversation'}).optional(),
    platformEmailThreadId: z.string({description: 'Used to sync email messages with the conversation'}).optional()
  }).optional(),
  locked: z.boolean({description: 'Whether the conversation is locked or not'}).optional().nullable(),
  lockedReason: z.string({description: 'Why this conversation was locked'}).optional().nullable(),
  lockAttempts: z.number({description: 'Number attempts made until conversation is locked'}).optional().nullable(),
  forwardedTo: z.string({description: 'What personaId/phone/email was forwarded'}).optional().nullable(),
  forwarded: z.string({description: 'Datetime ISO 8601 timestamp when persona was forwarded'}).optional().nullable(),
  forwardNote: z.string().optional().nullable(),
  intent: z.string({description: 'Detected intent of conversation'}).optional().nullable(),
  intentScore: z.number({description: 'Confidence score of the assigned intent'}).optional().nullable(),
  anticipate: ConversationAnticipateSchema.optional()
});
