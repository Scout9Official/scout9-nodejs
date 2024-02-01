'use strict';

import { z } from 'zod';
import { zId } from './utils.js';
import { agentConfigurationSchema, customerSchema } from './agent.js';
import { MessageSchema } from './message.js';



export const WorkflowConfigurationSchema = z.object({
  entities: z.array(zId('Workflow Folder', z.string()), {description: 'Workflow id association, used to handle route params'})
    .min(1, 'Must have at least 1 entity')
    .max(15, 'Cannot have more than 15 entity paths'),
  entity: zId('Workflow Folder', z.string()),
});

export const WorkflowsConfigurationSchema = z.array(WorkflowConfigurationSchema);

export const ConversationSchema = z.object({
  $agent: zId('Conversation Agent ID', z.string({description: 'Default agent assigned to the conversation(s)'})),
  $customer: zId('Conversation Customer ID', z.string({description: 'Customer this conversation is with'})),
  initialContexts: z.array(z.string(), {description: 'Initial contexts to load when starting the conversation'}).optional(),
  environment: z.enum(['phone', 'email', 'web']),
  environmentProps: z.object({
    subject: z.string({description: 'HTML Subject of the conversation'}).optional(),
    platformEmailThreadId: z.string({description: 'Used to sync email messages with the conversation'}).optional(),
  }).optional(),
});

export const IntentWorkflowEventSchema = z.object({
 current: z.string().nullable(),
 flow: z.array(z.string()),
 initial: z.string().nullable()
})

export const WorkflowEventSchema = z.object({
  messages: z.array(MessageSchema),
  conversation: ConversationSchema,
  context: z.any(),
  message: MessageSchema,
  agent: agentConfigurationSchema,
  customer: customerSchema,
  intent: IntentWorkflowEventSchema,
  stagnationCount: z.number(),
  note: z.string({description: 'Any developer notes to provide'}).optional()
})

const Primitive = z.union([z.string(), z.number(), z.boolean()]);
// Assuming ConversationContext is already defined as a Zod schema

// Lazy is used to handle recursive types.
export const ConversationContext = z.lazy(() =>
  z.record(
    Primitive.or(ConversationContext)
  )
);

const ContextSchema = z.record(Primitive.or(ConversationContext));

export const ForwardSchema = z.union([
  z.boolean(),
  z.string(),
  z.object({
    to: z.string().optional(),
    mode: z.enum(['after-reply', 'immediately']).optional(),
  }),
]);

export const InstructionSchema = z.object({
  id: zId('Instruction ID').describe('Unique ID for the instruction, this is used to remove the instruction later'),
  content: z.string(),
});
export const WorkflowResponseSlotSchema = z.object({
  forward: ForwardSchema.optional(),
  instructions: z.union([z.string(), InstructionSchema, z.array(z.string()), z.array(InstructionSchema)]).optional(),
  removeInstructions: z.array(z.string()).optional(),
  message: z.string().optional(),
  secondsDelay: z.number().optional(),
  scheduled: z.number().optional(),
  contextUpsert: ConversationContext.optional(),
  resetIntent: z.boolean().optional(),
});


export const WorkflowResponseSchema = z.union([
  WorkflowResponseSlotSchema,
  z.array(WorkflowResponseSlotSchema)
]);
