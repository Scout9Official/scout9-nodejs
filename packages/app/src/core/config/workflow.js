import { globSync } from 'glob';
import { WorkflowConfigurationSchema, WorkflowsConfigurationSchema } from '../../runtime/index.js';
import { logUserValidationError } from '../../report.js';


/**
 * @returns {Promise<WorkflowsConfiguration>}
 */
export default async function loadWorkflowsConfig(
  {
    cwd = process.cwd(),
    src = 'src',
    cb = (message) => {}
  } = {}
) {
  // const config = globSync(path.resolve(cwd, `${src}/workflows/**/workflow.{ts,js}`), {cwd, absolute: true})
  const config = globSync(`${src}/workflows/**/workflow.{ts,js}`, {cwd, absolute: true})
    .map((path) => {
      const segments = path.split('/');
      const srcIndex = segments.findIndex((segment, index) => segment === src && segments[index + 1] === 'workflows');
      const parents = segments.slice(srcIndex + 2, -1).reverse(); // +2 to skip "${src}" and "workflows"
      return {path, parents};
    })
    .filter(path => {
      if (path.parents.length > 0) {
        return true;
      } else {
        console.log(`WARNING: "${path}" Is not a valid entity path, must be contained in a named src under workflows/`);
      }
    })
    .map(({path, parents}) => {

      // Validate project configuration
      /** @type {WorkflowConfiguration} */
      const workflowConfig = {
        entity: parents[0],
        entities: parents.reverse(),
      }
      try {
        return WorkflowConfigurationSchema.parse(workflowConfig);
      } catch (e) {
        throw logUserValidationError(e, path);
      }
    });

  // Validate the config
  try {
    return WorkflowsConfigurationSchema.parse(config);
  } catch (e) {
    throw logUserValidationError(e, src);
  }

}
