import path from 'node:path';
import { globSync } from 'glob';
import { checkVariableType, requireProjectFile } from '../../utils/index.js';
import { agentsConfigurationSchema } from '../../runtime/index.js';

export default async function loadAgentConfig({cwd = process.cwd(), src = 'src'} = {}) {
  const paths = globSync(`${src}/entities/agents/{index,config}.{ts,js}`, {cwd, absolute: true});
  if (paths.length === 0) {
    throw new Error(`Missing required agents entity file, rerun "scout9 sync" to fix`);
  }
  if (paths.length > 1) {
    throw new Error(`Multiple agents entity files found, rerun "scout9 sync" to fix`);
  }

  /**
   * @type {Array<Agent> | function(): Array<Agent> | function(): Promise<Array<Agent>>}
   */
  const mod = await requireProjectFile(paths[0]).then(mod => mod.default);

  // @type {Array<Agent>}
  let agents = [];
  const entityType = checkVariableType(mod);
  switch (entityType) {
    case 'async function':
    case 'function':
      agents = await mod();
      break;
    case 'array':
      agents = mod;
      break;
    default:
      throw new Error(`Invalid entity type (${entityType}) returned at "${path}"`);
  }

  const result = agentsConfigurationSchema.safeParse(agents);
  if (!result.success) {
    throw result.error;
  }
  return agents;
}
