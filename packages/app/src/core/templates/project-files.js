import fs from 'node:fs/promises';
import { globSync } from 'glob';


const resolveFilePath = () => {
  const paths = globSync(`${src}/entities/agents/{index,config}.{ts,js}`, {cwd, absolute: true});
  if (paths.length === 0) {
    throw new Error(`Missing required agents entity file, rerun "scout9 sync" to fix`);
  }
  if (paths.length > 1) {
    throw new Error(`Multiple agents entity files found, rerun "scout9 sync" to fix`);
  }
}

export const entities = {
  /**
   * Generates ./src/entities/
   * @param {Scout9ProjectBuildConfig} config
   * @param {string} cwd
   * @param {string} src
   * @returns {Promise<void>}
   */

  agents: async function (config, cwd = process.cwd(), src = './src') {
    const content = `
/**
 * Required core entity type: Agents represents you and your team
 * @returns {Array<Agent>}
 */
export default function Agents() {
  return ${JSON.stringify(config.agents, null, 2)};
}
`;
    await fs.writeFile(filePath, );
  }
}
