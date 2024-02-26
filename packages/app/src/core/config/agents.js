import path from 'node:path';
import fs from 'node:fs/promises';
import colors from 'kleur';
import { globSync } from 'glob';
import { checkVariableType, requireProjectFile } from '../../utils/index.js';
import { agentsConfigurationSchema } from '../../runtime/index.js';

/**
 *
 * @param {string | Buffer} imgBufferOrFilepath
 * @returns {Promise<Buffer>}
 */
async function toBuffer(imgBufferOrFilepath) {
  if (typeof imgBufferOrFilepath === 'string') {
    // Read file
    return fs.readFile(imgBufferOrFilepath);
  } else if (Buffer.isBuffer(imgBufferOrFilepath)) {
    return imgBufferOrFilepath;
  } else {
    throw new Error(`Invalid img type: ${typeof imgBufferOrFilepath}`);
  }
}

/**
 * @param inputs
 * @param {string} [inputs.cwd]
 * @param {string} [inputs.dest]
 * @param {string} inputs.fileName
 * @param {string | Buffer} inputs.img
 * @returns {Promise<string>}
 */
async function writeImgToLocal({cwd = process.cwd(), dest = '/tmp/project', img, fileName} = {}) {
  // Ensure folder exists
  const imgFolder = path.resolve(cwd, dest);
  await fs.mkdir(path.dirname(imgFolder), {recursive: true});
  const imgPath = path.resolve(imgFolder, fileName);
  await fs.writeFile(imgPath, await toBuffer(img));
  return imgPath;
}

async function writeImgToServer({img, fileName}) {

}

export default async function loadAgentConfig({cwd = process.cwd(), dest = '/tmp/project', deploying = false, src = 'src', cb = (message) => {}} = {}) {
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

    if (agent.img) {
      if (typeof agent.img === 'string') {

      } else {

      }
    }
  }

  const result = agentsConfigurationSchema.safeParse(agents);
  if (!result.success) {
    result.error.source = paths[0];
    throw result.error;
  }
  return agents;
}
