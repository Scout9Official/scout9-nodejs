import { platformApi } from './data.js';

/**
 * @param {import('@scout9/app').IScout9ProjectBuildConfig} config
 * @returns {Promise<import('@scout9/app').IScout9ProjectBuildConfig>}
 */
export async function syncData(config) {
  if (!process.env.SCOUT9_API_KEY) {
    throw new Error('Missing required environment variable "SCOUT9_API_KEY"');
  }
  const result = await platformApi(`https://scout9.com/api/b/platform/sync`).then((res) => {
    if (res.status !== 200) {
      throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
    }
    return res.json();
  })
    .catch((err) => {
      err.message = `Error fetching entities and agents: ${err.message}`;
      throw err;
    });

  const { agents, entities, organization, initialContext } = result;

  // Merge
  config.agents = agents.reduce((accumulator, agent) => {
    // Check if agent already exists
    const existingAgentIndex = accumulator.findIndex(a => a.id === agent.id);
    if (existingAgentIndex === -1) {
      accumulator.push(agent);
    } else {
      // Merge agent
      accumulator[existingAgentIndex] = {
        ...accumulator[existingAgentIndex],
        ...agent
      };
    }
    return accumulator;
  }, config.agents);

  // Remove agents that are not on the server
  config.agents = config.agents.filter(agent => agents.find(a => a.id === agent.id));

  // Merge entities
  config.entities = entities.reduce((accumulator, entity) => {
    // Check if agent already exists
    const existingEntityIndex = accumulator.findIndex(a => a.id === entity.id);
    if (existingEntityIndex === -1) {
      accumulator.push(entity);
    } else {
      // Merge agent
      accumulator[existingEntityIndex] = {
        ...accumulator[existingEntityIndex],
        ...entity
      };
    }
    return accumulator;
  }, config.entities);

  // Remove entities that are not on the server
  config.entities = config.entities.filter(entity => entities.find(a => a.id === entity.id));
  config.organization = {
    ...(config?.organization || {}),
    ...(organization || {})
  };
  config.initialContext = [
    ...(Array.isArray(config?.initialContext)  ? config.initialContext : []),
    ...(Array.isArray(initialContext) ? initialContext : [])
  ];

  return config;
}
