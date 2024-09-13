import { z } from 'zod';
import { eventResponseSchema } from './api.js';


const apiFunctionParamsSchema = z.object({
  searchParams: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  params: z.record(z.string(), z.string())
});

const apiEntityFunctionParamsSchema = apiFunctionParamsSchema.extend({
  id: z.string()
});

export const apiFunctionSchema = z.function()
  .args(apiFunctionParamsSchema)
  .returns(z.promise(eventResponseSchema));

export const queryApiFunctionSchema = apiFunctionSchema;

export const getApiFunctionSchema = apiFunctionSchema;

export const postApiFunctionSchema = (requestBodySchema) => z.function()
  .args(apiFunctionParamsSchema.extend({
    body: requestBodySchema.partial()
  }))
  .returns(z.promise(eventResponseSchema));


export const putApiFunctionSchema = (requestBodySchema) => z.function()
  .args(apiFunctionParamsSchema.extend({
    body: requestBodySchema.partial()
  }))
  .returns(z.promise(eventResponseSchema));


export const patchApiFunctionSchema = (requestBodySchema) => z.function()
  .args(apiFunctionParamsSchema.extend({
    body: requestBodySchema.partial()
  }))
  .returns(z.promise(eventResponseSchema));

export const deleteApiFunctionSchema = apiFunctionSchema;
