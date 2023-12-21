import { globSync } from 'glob';
import path from 'node:path';
import {
  WorkflowConfigurationSchema,
  WorkflowsConfigurationSchema
} from '../../runtime/index.js';


export default async function loadWorkflowsConfig(
  {
    cwd = process.cwd(),
    folder = 'src'
  } = {}
) {
  console.log('loadWorkflowsConfig', {cwd, folder});
  const config = globSync(path.resolve(cwd, `${folder}/workflows/**/workflow.{ts,js}`))
    .map((path) => {
      const segments = path.split('/');
      const srcIndex = segments.findIndex((segment, index) => segment === folder && segments[index + 1] === 'workflows');
      const parents = segments.slice(srcIndex + 2, -1).reverse(); // +2 to skip "${folder}" and "workflows"
      return {path, parents};
    })
    .filter(path => {
      if (path.parents.length > 0) {
        return true;
      } else {
        console.log(`WARNING: "${path}" Is not a valid entity path, must be contained in a named folder under workflows/`);
      }
    })
    .map(({path, parents}) => {

      // Validate project configuration
      const workflowConfig = {
        entity: parents[0],
        entities: parents,
      }
      WorkflowConfigurationSchema.parse(workflowConfig);

      return workflowConfig;
    });

  // Validate the config
  WorkflowsConfigurationSchema.parse(config);

  return config;
}
