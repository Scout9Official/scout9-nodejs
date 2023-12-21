import { globSync } from 'glob';
import path from 'node:path';
import {
  entitiesRootProjectConfigurationSchema,
  entityApiConfigurationSchema,
  entityConfigurationSchema,
  entityRootProjectConfigurationSchema
} from '../../runtime/index.js';
import { checkVariableType, requireOptionalProjectFile, requireProjectFile } from '../../utils/index.js';

async function loadEntityApiConfig(cwd, filePath) {
  const dir = path.dirname(filePath);
  const extension = path.extname(filePath);
  const apiFilePath = path.join(dir, `api${extension}`);
  const root = cwd.split('/').pop();
  const x = apiFilePath.replace(cwd, '').split('/').slice(1).join('/');

  const mod = await requireOptionalProjectFile(x);
  if (mod) {
    const config = {};
    const methods = ['GET', 'UPDATE', 'QUERY', 'PUT', 'PATCH', 'DELETE'];
    for (const key in mod) {
      if (methods.includes(key)) {
        config[key] = true;
      }
    }
    entityApiConfigurationSchema.parse(config);
    return config;
  } else {
    return null;
  }
}

export default async function loadEntitiesConfig(
  {cwd = process.cwd(), folder = 'src'} = {}
) {
  console.log('loadEntitiesConfig', {cwd, folder});
  const config = [];
  const paths = globSync(path.resolve(cwd, `${folder}/entities/**/{index,config,api}.{ts,js}`));
  const data = [];
  for (const path of paths) {
    const segments = path.split('/');
    const srcIndex = segments.findIndex((segment, index) => segment === folder && segments[index + 1] === 'entities');
    const parents = segments.slice(srcIndex + 2, -1).reverse(); // +2 to skip "${folder}" and "entities"
    if (parents.length > 0) {
      const api = await loadEntityApiConfig(cwd, path);
      data.push({path, parents, api});
    } else {
      console.log(`WARNING: "${path}" Is not a valid entity path, must be contained in a named folder under entities/`);
    }
  }

  const specialEntities = ['agents'];

  for (const {path, parents, api} of data) {
    let entityConfig = {};
    const fileName = path.split('/')?.pop()?.split('.')?.[0];
    if (!fileName) throw new Error(`Invalid file name "${path}"`);
    const isSpecial = specialEntities.some(se => parents.includes(se));
    if ((fileName === 'index' || fileName === 'config') && !isSpecial) {
      const entityConfigHandler = await requireProjectFile(path).then(mod => mod.default);
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
          throw new Error(`Invalid entity type (${entityType}) returned at "${path}"`);
      }

      // Validate entity configuration
      const result = entityConfigurationSchema.safeParse(entityConfig, {path: ['entities', config.length]});
      if (!result.success) {
        throw result.error;
      }
    } else if (isSpecial && (fileName === 'index' || fileName === 'config')) {
      // If this is a special entity file, then ignore as we will capture it another method
      continue;
    }

    // Validate project configuration
    const entityProjectConfig = {
      ...entityConfig,
      entity: parents[0],
      entities: parents,
      api
    };
    entityRootProjectConfigurationSchema.parse(entityProjectConfig);

    config.push(entityProjectConfig);
  }

  if (!config.some(c => c.entity === 'customers')) {
    throw new Error(`Missing required entity: "entities/customers"`);
  }
  if (!config.some(c => c.entity === '[customer]')) {
    throw new Error(`Missing required entity: "entities/customers/[customer]"`);
  }

  // Validate the config
  entitiesRootProjectConfigurationSchema.parse(config);

  return config;
}

