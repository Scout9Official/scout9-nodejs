import { z } from "zod";

export const ContextExampleWithTrainingDataSchema = z.object({
  input: z.string(),
  output: z.array(z.record(z.string(), z.any())),
});

export const ContextExampleSchema = z.union([
  z.array(ContextExampleWithTrainingDataSchema),
  z.array(z.record(z.string(), z.any())),
]);

