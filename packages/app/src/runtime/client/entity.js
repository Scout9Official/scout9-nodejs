import { z } from 'zod';
import { zId } from './utils.js';


export const _entityApiConfigurationSchema = z.object({
  // path: z.string(),
  GET: z.boolean().optional(),
  UPDATE: z.boolean().optional(),
  QUERY: z.boolean().optional(),
  PUT: z.boolean().optional(),
  PATCH: z.boolean().optional(),
  DELETE: z.boolean().optional()
})

export const entityApiConfigurationSchema = _entityApiConfigurationSchema.nullable();

const entityConfigurationDefinitionSchema = z.object({
  utterance: zId('Utterance', z.string({description: 'What entity utterance this represents, if not provided, it will default to the entity id'}))
    .optional(),
  value: z.string({description: 'The value of this entity variance'}),
  text: z.array(z.string(), {description: 'Text representing the entity variance'})
});
const entityConfigurationTrainingSchema = z.object({
  intent: zId('Intent', z.string({description: 'The assigned intent id of the given text, e.g. "I love %pizza%" could have an intent id "feedback" and "Can I purchase a %pizza%?" could have an intent id "purchase"'})),
  text: z.string({description: 'Text to train the intent field and entities in or entity variances in example sentences or phrase. Ex: "I love %pizza%" and "Can I purchase a %pizza%?"'})
});
const entityConfigurationTestSchema = z.object({
  text: z.string({description: 'Text to test the entity detection'}),
  expected: z.object({
    intent: zId('Intent', z.string({description: 'The expected intent id'})),
    // context: ConversationContext
    context: z.any()
  })
});
const _entityConfigurationSchema = z.object({
  id: zId('Id', z.string({description: 'If not provided, the id will default to the route (folder) name'})).optional(),
  definitions: z.array(entityConfigurationDefinitionSchema).optional(),
  training: z.array(entityConfigurationTrainingSchema).optional(),
  tests: z.array(entityConfigurationTestSchema).optional()
}).strict();

export const entityConfigurationSchema = _entityConfigurationSchema.refine((data) => {
  // If 'definitions' is provided, then 'training' must also be provided
  if (data.definitions !== undefined) {
    return data.training !== undefined;
  }
  // If 'definitions' is not provided, no additional validation is needed
  return true;
}, {
  // Custom error message
  message: "If 'definitions' is provided, then 'training' must also be provided",
});

export const entitiesRootConfigurationSchema = z.array(entityConfigurationSchema);


const entityExtendedProjectConfigurationSchema = z.object({
  entities: z.array(zId('Entity Folder', z.string()), {description: 'Entity id association, used to handle route params'})
    .min(1, 'Must have at least 1 entity')
    .max(15, 'Cannot have more than 15 entity paths'),
  entity: zId('Entity Folder', z.string()),
  api: entityApiConfigurationSchema
});

const _entityRootProjectConfigurationSchema = _entityConfigurationSchema.extend(entityExtendedProjectConfigurationSchema.shape);
const _entitiesRootProjectConfigurationSchema = z.array(_entityRootProjectConfigurationSchema);

// @TODO why type extend not valid?
export const entityRootProjectConfigurationSchema = _entityConfigurationSchema.extend(entityExtendedProjectConfigurationSchema.shape).refine((data) => {
  // If 'definitions' is provided, then 'training' must also be provided
  if (data.definitions !== undefined) {
    return data.training !== undefined;
  }
  // If 'definitions' is not provided, no additional validation is needed
  return true;
}, {
  // Custom error message
  message: "If 'definitions' is provided, then 'training' must also be provided",
});
export const entitiesRootProjectConfigurationSchema = z.array(entityRootProjectConfigurationSchema);
