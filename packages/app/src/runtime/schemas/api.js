import { z } from 'zod';


const responseInitSchema = z.object({
  status: z.number().optional(),
  statusText: z.string().optional(),
  headers: z.any().optional() // Headers can be complex; adjust as needed
});

export const eventResponseSchema = z.object({
  body: z.any(), // Adjust as per your actual body structure
  init: responseInitSchema.optional()
});
