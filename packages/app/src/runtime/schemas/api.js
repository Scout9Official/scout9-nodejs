import { z } from 'zod';


const responseInitSchema = z.object({
  status: z.number().optional(),
  statusText: z.string().optional(),
  headers: z.any().optional() // Headers can be complex; adjust as needed
});

/**
 * @template T
 * @typedef {object} IEventResponse
 * @property {T} body - The body of the response.
 * @property {ResponseInit} [init] - Additional options for the response.
 * @property {Response} response - The response object.
 * @property {T} data - The body of the response.
 */
export const eventResponseSchema = z.object({
  body: z.any(), // Adjust as per your actual body structure
  init: responseInitSchema.optional()
});
