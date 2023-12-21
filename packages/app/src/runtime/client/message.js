import { z } from 'zod';

export const MessageSchema = z.object({
  content: z.string(),
  role: z.enum(['agent', 'customer', 'system']),
  time: z.string(),
  name: z.string().optional()
});
