'use strict';

import { z } from 'zod';
import { zId } from './utils.js';
import { AgentConfigurationSchema, CustomerSchema } from './users.js';
import { MessageSchema } from './message.js';
import { ConversationSchema, ConversationContext } from './conversation.js';


export const ForwardSchema = z.union([
  z.boolean(),
  z.string(),
  z.object({
    to: z.string().optional(),
    mode: z.enum(['after-reply', 'immediately']).optional(),
    note: z.string({description: 'Note to provide to the agent'}).optional()
  })
], {description: 'Forward input information of a conversation'});


export const InstructionObjectSchema = z.object({
  id: zId('Instruction ID')
    .describe('Unique ID for the instruction, this is used to remove the instruction later')
    .optional(),
  persist: z.boolean()
    .describe(
      'if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply')
    .default(true)
    .optional(),
  content: z.string()
});

export const WorkflowResponseMessageApiRequest = z.object({
  uri: z.string(),
  data: z.any().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  method: z.enum(['GET', 'POST', 'PUT']).optional()
});

/**
 * If its a string, it will be sent as a static string.
 * If it's a object or WorkflowResponseMessageAPI - it will use
 */
export const WorkflowResponseMessage = z.union([
  z.string(),

  /**
   * An api call that should be called later, must return a string or {message: string}
   */
  WorkflowResponseMessageApiRequest
]);


/**
 * The intended response provided by the WorkflowResponseMessageApiRequest
 */
export const WorkflowResponseMessageApiResponse = z.union([
  z.string(),
  z.object({
    message: z.string()
  }),
  z.object({
    text: z.string()
  }),
  z.object({
    data: z.object({
      message: z.string()
    })
  }),
  z.object({
    data: z.object({
      text: z.string()
    })
  })
]);

/**
 * The workflow response object slot
 */
export const InstructionSchema = z.union([z.string(), InstructionObjectSchema, z.array(z.string()), z.array(
  InstructionObjectSchema)]);

/**
 * Base follow up schema to follow up with the client
 */
export const FollowupBaseSchema = z.object({
  scheduled: z.number(),
  cancelIf: ConversationContext.optional(),
  overrideLock: z.boolean({description: 'This will still run even if the conversation is locked, defaults to false'}).optional()
});

/**
 * Data used to automatically follow up with the client in the future
 */
export const FollowupSchema = z.union([
  FollowupBaseSchema.extend({
    message: z.string({description: 'Manual message sent to client'}),
  }),
  FollowupBaseSchema.extend({
    instructions: InstructionSchema
  })
]);


export const WorkflowConfigurationSchema = z.object({
  entities: z.array(
    zId('Workflow Folder', z.string()),
    {description: 'Workflow id association, used to handle route params'}
  )
    .min(1, 'Must have at least 1 entity')
    .max(15, 'Cannot have more than 15 entity paths'),
  entity: zId('Workflow Folder', z.string())
});

export const WorkflowsConfigurationSchema = z.array(WorkflowConfigurationSchema);

export const IntentWorkflowEventSchema = z.object({
  current: z.string().nullable(),
  flow: z.array(z.string()),
  initial: z.string().nullable()
});

export const WorkflowEventSchema = z.object({
  messages: z.array(MessageSchema),
  conversation: ConversationSchema,
  context: z.any(),
  message: MessageSchema,
  agent: AgentConfigurationSchema.omit({
    transcripts: true,
    audios: true,
    includedLocations: true,
    excludedLocations: true,
    model: true,
    context: true
  }),
  customer: CustomerSchema,
  intent: IntentWorkflowEventSchema,
  stagnationCount: z.number(),
  note: z.string({description: 'Any developer notes to provide'}).optional()
});

/**
 * The workflow response object slot
 */
export const WorkflowResponseSlotBaseSchema = z.object({
  forward: ForwardSchema.optional(),
  forwardNote: z.string({description: 'Note to provide to the agent, recommend using forward object api instead'})
    .optional(),
  instructions: InstructionSchema.optional(),
  removeInstructions: z.array(z.string()).optional(),
  message: z.string().optional(),
  secondsDelay: z.number().optional(),
  scheduled: z.number().optional(),
  contextUpsert: ConversationContext.optional(),
  resetIntent: z.boolean().optional(),
  followup: FollowupSchema.optional()
});

/**
 * The workflow response object slot
 */
export const WorkflowResponseSlotSchema = WorkflowResponseSlotBaseSchema.extend({
  anticipate: z.union([
    z.object({
      did: z.string({definition: 'The prompt to check if true or false'}),
      yes: WorkflowResponseSlotBaseSchema,
      no: WorkflowResponseSlotBaseSchema
    }),
    z.array(WorkflowResponseSlotBaseSchema.extend({
      keywords: z.array(z.string()).min(1).max(20)
    }))
  ]).optional()
});

/**
 * The workflow response to send in any given workflow
 */
export const WorkflowResponseSchema = z.union([
  WorkflowResponseSlotSchema,
  z.array(WorkflowResponseSlotSchema)
]);

export const WorkflowFunctionSchema = z.function()
  .args(WorkflowEventSchema)
  .returns(z.union([
    z.promise(WorkflowResponseSchema),
    WorkflowResponseSchema
  ]));
