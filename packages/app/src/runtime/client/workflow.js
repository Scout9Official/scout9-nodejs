'use strict';

import { z } from 'zod';
import { zId } from './utils.js';
import { agentConfigurationSchema, customerSchema } from './users.js';
import { MessageSchema } from './message.js';


/**
 * @typedef {import('zod').infer<typeof WorkflowConfigurationSchema>} IWorkflowConfiguration
 */
export const WorkflowConfigurationSchema = z.object({
  entities: z.array(
    zId('Workflow Folder', z.string()),
    {description: 'Workflow id association, used to handle route params'}
  )
    .min(1, 'Must have at least 1 entity')
    .max(15, 'Cannot have more than 15 entity paths'),
  entity: zId('Workflow Folder', z.string())
});

/**
 * @typedef {import('zod').infer<typeof WorkflowsConfigurationSchema>} IWorkflowsConfiguration
 */
export const WorkflowsConfigurationSchema = z.array(WorkflowConfigurationSchema);


/**
 * @typedef {import('zod').infer<typeof ConversationSchema>} IConversation
 */
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
  intentScore: z.number({description: 'Confidence score of the assigned intent'}).optional().nullable()
});

/**
 * @typedef {import('zod').infer<typeof IntentWorkflowEventSchema>} IIntentWorkflowEvent
 */
export const IntentWorkflowEventSchema = z.object({
  current: z.string().nullable(),
  flow: z.array(z.string()),
  initial: z.string().nullable()
});

/**
 * @typedef {import('zod').infer<typeof WorkflowEventSchema>} IWorkflowEvent
 */
export const WorkflowEventSchema = z.object({
  messages: z.array(MessageSchema),
  conversation: ConversationSchema,
  context: z.any(),
  message: MessageSchema,
  agent: agentConfigurationSchema.omit({
    transcripts: true,
    audios: true,
    includedLocations: true,
    excludedLocations: true,
    model: true,
    context: true
  }),
  customer: customerSchema,
  intent: IntentWorkflowEventSchema,
  stagnationCount: z.number(),
  note: z.string({description: 'Any developer notes to provide'}).optional()
});

const Primitive = z.union([z.string(), z.number(), z.boolean()]);
// Assuming ConversationContext is already defined as a Zod schema

/**
 * Lazy is used to handle recursive types.
 * @typedef {import('zod').infer<typeof ConversationContext>} IConversation
 */
export const ConversationContext = z.lazy(() =>
  z.record(
    Primitive.or(ConversationContext)
  )
);

const ContextSchema = z.record(Primitive.or(ConversationContext));

/**
 * Forward input information of a conversation
 * @typedef {import('zod').infer<typeof ForwardSchema>} IForward
 */
export const ForwardSchema = z.union([
  z.boolean(),
  z.string(),
  z.object({
    to: z.string().optional(),
    mode: z.enum(['after-reply', 'immediately']).optional(),
    note: z.string({description: 'Note to provide to the agent'}).optional()
  })
], {description: 'Forward input information of a conversation'});


/**
 * Instruction object schema used to send context to guide conversations
 * @typedef {import('zod').infer<typeof InstructionObjectSchema>} IInstruction
 */
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

/**
 * @typedef {import('zod').infer<typeof WorkflowResponseMessageApiRequest>} IWorkflowResponseMessageApiRequest
 */
export const WorkflowResponseMessageApiRequest = z.object({
  uri: z.string(),
  data: z.any().optional(),
  headers: z.object({
    [z.string()]: z.string()
  }).optional(),
  method: z.enum(['GET', 'POST', 'PUT']).optional()
});

/**
 * If its a string, it will be sent as a static string.
 * If it's a object or WorkflowResponseMessageAPI - it will use
 * @typedef {import('zod').infer<typeof WorkflowResponseMessage>} IWorkflowResponseMessage
 */
export const WorkflowResponseMessage = z.union(
  z.string(),

  /**
   * An api call that should be called later, must return a string or {message: string}
   */
  WorkflowResponseMessageApiRequest
);


/**
 * The intended response provided by the WorkflowResponseMessageApiRequest
 * @typedef {import('zod').infer<typeof WorkflowResponseMessageApiResponse>} IWorkflowResponseMessageApiResponse
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
 * @typedef {import('zod').infer<typeof InstructionSchema>} IInstruction
 */
export const InstructionSchema = z.union([z.string(), InstructionObjectSchema, z.array(z.string()), z.array(
  InstructionObjectSchema)]);

/**
 * Base follow up schema to follow up with the client
 * @typedef {import('zod').infer<typeof FollowupBaseSchema>} IFollowupBase
 */
export const FollowupBaseSchema = z.object({
  scheduled: z.number(),
  cancelIf: ConversationContext.optional(),
  overrideLock: z.boolean({description: 'This will still run even if the conversation is locked, defaults to false'}).optional()
});

/**
 * Data used to automatically follow up with the client in the future
 * @typedef {import('zod').infer<typeof FollowupSchema>} IFollowup
 */
export const FollowupSchema = z.union([
  FollowupBaseSchema.extend({
    message: z.string({description: 'Manual message sent to client'}),
  }),
  FollowupBaseSchema.extend({
    instructions: InstructionSchema
  })
]);

/**
 * The workflow response object slot
 * @typedef {import('zod').infer<typeof WorkflowResponseSlotBaseSchema>} IWorkflowResponseSlotBase
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
 * @typedef {import('zod').infer<typeof WorkflowResponseSlotSchema>} IWorkflowResponseSlot
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
 * @typedef {import('zod').infer<typeof WorkflowResponseSchema>} IWorkflowResponse
 */
export const WorkflowResponseSchema = z.union([
  WorkflowResponseSlotSchema,
  z.array(WorkflowResponseSlotSchema)
]);

/**
 * @typedef {import('zod').infer<typeof WorkflowFunctionSchema>} IWorkflowFunction
 */
export const WorkflowFunctionSchema = z.function()
  .args(WorkflowEventSchema)
  .returns(z.union([
    z.promise(WorkflowResponseSchema),
    WorkflowResponseSchema
  ]));
