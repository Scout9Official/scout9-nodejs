import { globSync } from 'glob';
import { CommandsSchema } from '../../runtime/index.js';
import { basename, dirname } from 'node:path';


/**
 * @returns {Promise<CommandConfiguration[]>}
 */
export default async function loadCommandsConfig(
  {
    cwd = process.cwd(),
    src = 'src',
    cb = (message) => {}
  } = {}
) {
  // const config = globSync(path.resolve(cwd, `${src}/workflows/**/workflow.{ts,js}`), {cwd, absolute: true})
  const config = globSync(`${src}/commands/**/{index,command,*.command}.{ts,js}`, {cwd, absolute: false})
    .map((path) => {

      const dir = dirname(path);
      let entity = basename(path).replace(/\..*$/, ''); // Removes any "."'s
      if (!entity) {
        throw new Error(`Invalid command path "${path}"`)
      }
      switch (entity) {
        case "index":
        case "command":
          entity = basename(dir);
          break;
      }
      return {
        entity,
        path: path.split(src + '/commands/')[1]
      }
    });

  // Validate the config
  CommandsSchema.parse(config);

  return config;
}
