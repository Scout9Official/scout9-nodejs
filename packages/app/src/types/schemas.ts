import { z } from 'zod';

const primitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.string()),
  z.array(z.number()),
  z.array(z.boolean())
]);

// @TODO - Fix this, shouldn't use any
export const conversationContextSchema: any = z.lazy(() =>
  z.record(z.union([
    primitiveSchema,
    conversationContextSchema,
    z.array(conversationContextSchema)
  ]))
);

export type ConversationContextSchema = z.infer<typeof conversationContextSchema>;
