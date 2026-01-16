import { z } from 'zod';
import { zId } from './utils.js';

export const MessageEntitySchema = z.object({
  text: z.string().optional(),
  start: z.number(),
  end: z.number(),
  option: z.string().optional(),
  subType: z.string().optional(),
  type: z.string(),          
});

export const LlmMessageToolCallSchema = z.object({
  id: z.string(),
  type: z.string(),
  function: z.object({
    arguments: z.string(),
    name: z.string(),
  }),
});


/**
 * Follows @scout9/admin Message
 */
export const MessageSchema = z.object({
  id: zId("Message ID", { description: "Unique ID for the message" }),
  role: z.enum(["agent", "customer", "system", "tool"]),
  content: z.string(),
  time: z.string({ description: "Datetime ISO 8601 timestamp" }),

  name: z.string().optional(),

  context: z
    .record(z.any(), { description: "The context generated from the message" })
    .optional(),

  delayInSeconds: z
    .number({ description: "How long to delay the message manually in seconds" })
    .optional(),

  entities: z
    .array(MessageEntitySchema, {
      description: "Entities related to the message (gets set after the PMT transform)",
    })
    .optional(),

  contentGenerated: z
    .string({
      description:
        "The recorded content of the message created before the PMT transform (usually by a LLM, Application, or Agent)",
    })
    .optional(),

  contentTransformed: z
    .string({ description: "The recorded content of the message after the PMT transform" })
    .optional(),

  ignoreTransform: z
    .boolean({
      description:
        "If set to true, the PMT will not transform, message will be sent as is",
    })
    .optional(),

  intent: z.string({ description: "Detected intent" }).optional(),

  intentScore: z
    .number({ description: "Confidence score of the assigned intent" })
    .optional(),

  mediaUrls: z
    .array(z.string(), {
      description: "Media urls to attach to the transported message (seperated from content)",
    })
    .optional(),

  scheduled: z
    .string({ description: "Datetime ISO 8601 timestamp" })
    .optional(),

  tool_calls: z
    .array(LlmMessageToolCallSchema, {
      description:
        "for auto/manual ingress only, used by LLMs to register when tool calls are invoked",
    })
    .optional(),

  tool_call_id: z
    .string({
      description:
        "for auto/manual ingress only, used by LLMs to identity what tool was called",
    })
    .optional(),
});