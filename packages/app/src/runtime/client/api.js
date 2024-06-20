import { z } from 'zod';

/**
 * Utility runtime class used to guide event output
 * @template T
 */
export class EventResponse {

  /**
   * Create a new EventResponse instance with a JSON body.
   * @template T
   * @param {T} body - The body of the response.
   * @param {ResponseInit} [options] - Additional options for the response.
   * @returns {EventResponse<T>} A new EventResponse instance.
   */
  static json(body, options) {
    return new EventResponse(body, options);
  }

  /**
   * Create an EventResponse.
   * @param {T} body - The body of the response.
   * @param {ResponseInit} [init] - Additional options for the response.
   * @throws {Error} If the body is not a valid object.
   */
  constructor(body, init) {
    /**
     * @type {T}
     * @private
     */
    this.body = body;

    /**
     * @type {ResponseInit}
     * @private
     */
    this.init = init;
    if (typeof this.body !== 'object') {
      throw new Error(`EventResponse body in not a valid object:\n"${JSON.stringify(body, null, 2)}"`);
    }
  }

  /**
   * Get the response object.
   * @returns {Response} The response object.
   */
  get response() {
    return Response.json(this.body, this.init);
  }

  /**
   * Get the data of the response.
   * @returns {T} The body of the response.
   */
  get data() {
    return this.body;
  }

}



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
