import { z } from 'zod';
import { zId } from './utils.js';
import { CommandSchema } from './commands.js';

export const ConversationContext = z.record(
    z.union([
        z.any(),
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
    type: z.enum(['did', 'literal', 'context'], {description: 'Determines the runtime to address the next response'}),
    slots: z.record(z.string(), z.array(z.any())),
    did: z.string({description: 'For type \'did\''}).optional(),
    map: z.array(z.object({
        slot: z.string(),
        keywords: z.array(z.string())
    }), {description: 'For literal keywords, this map helps point which slot the keyword matches to'}).optional()
});

export const ConversationChannelPropsSchema = z.object({
    subject: z.string({description: 'Subject line for email-style channels such as Gmail and Outlook'}).optional(),
    platformEmailThreadId: z.string({description: 'Provider thread id used to sync Gmail/Outlook channel messages with this conversation'}).optional(),
    smsMessageSid: z.string({description: 'Twilio message sid that initiated this conversation'}).optional(),
    channelResolutionPath: z.enum(['twilio_production', 'twilio_legacy_pmt', 'twilio_free_bridge'], {
        description: 'Persisted channel-resolution path used for the current conversation'
    }).optional()
}).catchall(z.any());

export const ConversationSchema = z.object({
    $id: zId('Conversation ID', {description: 'Conversation unique id'}).optional(),
    $agent: zId('Conversation Agent ID', {description: 'The user id assigned to this conversation'}),
    $customer: zId('Conversation Customer ID', {description: 'Customer this conversation is with'}),
    initialContexts: z.array(z.string(), {description: 'Initial contexts to load when starting the conversation'})
        .optional(),
    channel: z.enum([
        'web',
        'demo_phone_test',
        'sms_phone',
        'outlook',
        'gmail',
        'iphone',
        'android',
        'teams',
        'discord',
        'whatsapp'
    ]),
    channelProps: ConversationChannelPropsSchema.optional(),
    locked: z.boolean({description: 'Whether automated replies are locked and the conversation requires a policy outcome or manual intervention'}).optional().nullable(),
    lockCode: z.enum(['workflow_stagnation', 'max_lock_attempts', 'runtime_error', 'manual_mode', 'policy_block'], {
        description: 'Machine-readable lock reason'
    }).optional(),
    lockedReason: z.string({description: 'Human-readable locked reason'}).optional().nullable(),
    lockAttempts: z.number({description: 'Number of consecutive workflow/context no-progress attempts'}).optional().nullable(),
    forwardedTo: z.string({description: 'Contact that received a forward handoff'}).optional().nullable(),
    forwarded: z.string({description: 'ISO 8601 datetime string for when the conversation was forwarded'}).optional().nullable(),
    forwardNote: z.string({description: 'Operator or workflow note attached to the forward'}).optional().nullable(),
    initiated: z.string({description: 'ISO 8601 datetime string for when this conversation was initiated'}).optional(),
    intent: z.string({description: 'Detected intent attached at conversation start or first customer message'}).optional().nullable(),
    intentScore: z.number({description: 'Confidence score for the detected intent'}).optional().nullable(),
    read: z.string({description: 'ISO 8601 datetime string for when the account user read this conversation in the app'}).optional(),
    metadata: z.record(z.any(), {description: 'Server-assigned conversation metadata'}).optional(),
    anticipate: ConversationAnticipateSchema.optional(),
    command: CommandSchema.optional(),
    ingress: z.enum(['auto', 'manual', 'app', 'webhook'], {
        description: 'Overrides the Persona Model ingress mode for this conversation'
    }).optional()
});
