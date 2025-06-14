import { globSync } from 'glob';
import path from 'node:path';
import {
  EntitiesRootProjectConfigurationSchema,
  EntityApiConfigurationSchema,
  EntityConfigurationSchema,
  EntityRootProjectConfigurationSchema
} from '../../runtime/index.js';
import { checkVariableType, requireOptionalProjectFile, requireProjectFile } from '../module.js';
import { logUserValidationError } from '../../report.js';
import { simplifyError } from '../error.js';

async function loadEntityApiConfig(cwd, filePath) {
  const dir = path.dirname(filePath);
  const extension = path.extname(filePath);
  const apiFilePath = path.resolve(dir, `api${extension}`);
  const mod = await requireOptionalProjectFile(apiFilePath);

  if (mod) {
    const config = {};
    const methods = ['GET', 'UPDATE', 'QUERY', 'PUT', 'PATCH', 'DELETE'];
    for (const key in mod) {
      if (methods.includes(key)) {
        config[key] = true;
      }
    }
    EntityApiConfigurationSchema.parse(config);
    return config;
  } else {
    return null;
  }
}

/**
 * @returns {Promise<EntitiesBuildConfig>}
 */
export default async function loadEntitiesConfig(
  {
    cwd = process.cwd(),
    src = 'src',
    // logger,
    // cb = (message) => {}
  } = {}
) {
  /** @type EntitiesBuildConfig */
  const config = [];
  // const paths = globSync(path.resolve(cwd, `${src}/entities/**/{index,config,api}.{ts,js}`), {cwd, absolute: true});
  const filePaths = globSync(`${src}/entities/**/{index,config,api}.{ts,js}`, {cwd, absolute: true});
  const data = [];
  for (const filePath of filePaths) {
    const segments = filePath.split(path.sep); // Use path.sep for platform independence
    // const segments = filePath.split('/');
    const srcIndex = segments.findIndex((segment, index) => segment === src && segments[index + 1] === 'entities');
    const parents = segments.slice(srcIndex + 2, -1).reverse(); // +2 to skip "${src}" and "entities"
    if (parents.length > 0) {
      const api = await loadEntityApiConfig(cwd, filePath);
      data.push({filePath, parents, api});
    } else {
      console.log(`WARNING: "${filePath}" Is not a valid entity filePath, must be contained in a named src under "${src}/entities/", see "${src}/entities/agents" or "${src}/entities/customers" for examples.`);
    }
  }

  const specialEntities = ['agents'];

  for (const {filePath, parents, api} of data) {
    let entityConfig = {};
    // const fileName = filePath.split('/')?.pop()?.split('.')?.[0];
    const fileName = path.basename(filePath, path.extname(filePath));
    if (!fileName) throw new Error(`Invalid file name "${filePath}"`);
    const isSpecial = specialEntities.some(se => parents.includes(se));
    if ((fileName === 'index' || fileName === 'config') && !isSpecial) {
      const entityConfigHandler = await requireProjectFile(filePath).then(mod => mod.default);
      // Check if entityConfig is a function or object
      const entityType = checkVariableType(entityConfigHandler);
      switch (entityType) {
        case 'async function':
        case 'function':
          entityConfig = await entityConfigHandler();
          break;
        case 'object':
          entityConfig = entityConfigHandler;
          break;
        default:
          throw new Error(`Invalid entity type (${entityType}) returned at "${filePath}"`);
      }

      // Validate entity configuration
      const result = EntityConfigurationSchema.safeParse(entityConfig, {path: ['entities', config.length]});
      if (!result.success) {
        result.error.source = filePath;
        throw logUserValidationError(result.error, filePath);
      }
    } else if (isSpecial && (fileName === 'index' || fileName === 'config')) {
      // If this is a special entity file, then ignore as we will capture it another method
      continue;
    }

    // Validate project configuration
    const entityProjectConfig = {
      ...entityConfig,
      entity: parents[0],
      entities: parents.reverse(),
      api
    };

    try {
      EntityRootProjectConfigurationSchema.parse(entityProjectConfig);
    } catch (e) {
      throw simplifyError(e);
    }
    const existingIndex = config.findIndex(c => c.entity === entityProjectConfig.entity);
    if (existingIndex > -1) {
      if (config[existingIndex].entities.length !== entityProjectConfig.entities.length) {
        throw new Error(`Invalid entity configuration at "${filePath}", entity name mismatch`);
      }
        config[existingIndex] = {
          ...config[existingIndex],
          definitions: [
              ...(config[existingIndex].definitions),
                ...(entityProjectConfig.definitions || [])
          ],
          training: [
            ...(config[existingIndex].training),
            ...(entityProjectConfig.training || [])
          ],
          tests: [
            ...(config[existingIndex].tests),
            ...(entityProjectConfig.tests || [])
          ],
            api: (!config[existingIndex].api && !entityProjectConfig.api) ? null : {
            ...(config[existingIndex].api || {}),
            ...(entityProjectConfig.api || {})
          }
        }
    } else {
      config.push(entityProjectConfig);
    }
  }

  // if (!config.some(c => c.entity === 'customers')) {
  //   throw new Error(`Missing required entity: "entities/customers" in ${src}`);
  // }
  // if (!config.some(c => c.entity === '[customer]')) {
  //   throw new Error(`Missing required entity: "entities/customers/[customer]"`);
  // }

  // Validate the config
  try {
    return EntitiesRootProjectConfigurationSchema.parse(config);
  } catch (e) {
    throw simplifyError(e);
  }

}

