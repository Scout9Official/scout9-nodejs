import path from 'node:path';
import colors from 'kleur';
import { globSync } from 'glob';
import { checkVariableType, requireProjectFile } from '../../utils/index.js';
import { agentsConfigurationSchema, agentsBaseConfigurationSchema } from '../../runtime/index.js';

/**
 * @param {Array<Agent>} agents
 * @returns {*}
 */
export function validateAgentConfig(agents) {
  // Send warnings if not properly registered
  for (const agent of agents) {
    if (!agent.forwardPhone && !agent.forwardEmail) {
      throw new Error(`src/entities/agents.js|ts: must provide either a ".forwardPhone" or ".forwardEmail" to ${agent.firstName || JSON.stringify(agent)}.`)
    }
    if (!agent.programmablePhoneNumber) {
      const userName = agent.firstName ? `${agent.firstName}${agent.lastName ? ' ' + agent.lastName : ''}` : agent.forwardPhone;
      cb(`⚠️${colors.yellow('Warning')}: ${userName} does not have a masked phone number to do auto replies. You can register one at ${colors.cyan('https://scout9.com/b')} under ${colors.green('users')} > ${colors.green(userName)}. Then run ${colors.cyan('scout9 sync')} to update.`);
    }
    if (agent.forwardPhone && agents.filter(a => a.forwardPhone && (a.forwardPhone === agent.forwardPhone)).length > 1) {
      throw new Error(`src/entities/agents.js|ts: ".forwardPhone: ${agent.forwardPhone}" can only be associated to one agent within your project`);
    }
    if (agent.forwardEmail && agents.filter(a => a.forwardEmail && (a.forwardEmail === agent.forwardEmail)).length > 1) {
      throw new Error(`src/entities/agents.js|ts: ".forwardEmail: ${agent.forwardEmail}" can only be associated to one agent within your project`);
    }
  }

  const result = agentsBaseConfigurationSchema.safeParse(agents);
  if (!result.success) {
    result.error.source = `src/entities/agents.js|ts`;
    throw result.error;
  }
  return agents;
}

export default async function loadAgentConfig({cwd = process.cwd(), src = 'src', cb = (message) => {}} = {}) {
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

  return validateAgentConfig(agents);
}

