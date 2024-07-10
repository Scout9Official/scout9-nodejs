import { z } from 'zod';
import { eventResponseSchema } from './api.js';


/**
 * @typedef {object} IApiFunctionParams
 * @property {Object.<string, string|string[]>} searchParams
 * @property {Record<string, string>} params
 */
const apiFunctionParamsSchema = z.object({
  searchParams: z.record(z.union([z.string(), z.array(z.string())])),
  params: z.record(z.string())
});

/**
 * @typedef {IApiFunctionParams & { id: string }} IApiEntityFunctionParams
 */
const apiEntityFunctionParamsSchema = apiFunctionParamsSchema.extend({
  id: z.string()
});

/**
 * @template Params
 * @template Response
 * @typedef {function(IApiFunctionParams): Promise<EventResponse>} IApiFunction
 */
export const apiFunctionSchema = z.function()
  .args(apiFunctionParamsSchema)
  .returns(z.promise(eventResponseSchema));

/**
 * @template Params
 * @template Response
 * @typedef {IApiFunction<Params, Response>} IQueryApiFunction
 */
export const queryApiFunctionSchema = apiFunctionSchema;

/**
 * @template Params
 * @template Response
 * @typedef {IApiFunction<Params, Response>} GetApiFunction
 */
export const getApiFunctionSchema = apiFunctionSchema;

/**
 * @template Params
 * @template RequestBody
 * @template Response
 * @typedef {function(IApiFunctionParams & {body: Partial<RequestBody>}): Promise<EventResponse<Response>>} IPostApiFunction
 */
export const postApiFunctionSchema = (requestBodySchema) => z.function()
  .args(apiFunctionParamsSchema.extend({
    body: requestBodySchema.partial()
  }))
  .returns(z.promise(eventResponseSchema));

/**
 * @template Params
 * @template RequestBody
 * @template Response
 * @typedef {function(IApiFunctionParams & {body: Partial<RequestBody>}): Promise<EventResponse<Response>>} IPutApiFunction
 */
export const putApiFunctionSchema = (requestBodySchema) => z.function()
  .args(apiFunctionParamsSchema.extend({
    body: requestBodySchema.partial()
  }))
  .returns(z.promise(eventResponseSchema));

/**
 * @template Params
 * @template RequestBody
 * @template Response
 * @typedef {function(IApiFunctionParams & {body: Partial<RequestBody>}): Promise<EventResponse<Response>>} IPatchApiFunction
 */
export const patchApiFunctionSchema = (requestBodySchema) => z.function()
  .args(apiFunctionParamsSchema.extend({
    body: requestBodySchema.partial()
  }))
  .returns(z.promise(eventResponseSchema));

/**
 * @template Params
 * @template Response
 * @typedef {IApiFunction<Params, Response>} IDeleteApiFunction
 */
export const deleteApiFunctionSchema = apiFunctionSchema;
