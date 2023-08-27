import { Scout9Api } from '@scout9/admin/src';

const fs = require('fs').promises;
const path = require('path');

export interface ILocalCache {
  agent?: string;
  customers?: string[];
  convo?: string;
  group?: string;
  operation?: string;
  files?: string[];
  workflows?: string[];
}

const cachePath = path.resolve(__dirname, './cache.json');

export const reset = async (cache: ILocalCache, scout9: Scout9Api) => {
  const {convo, group, customers, workflows, operation: operationId, files} = cache;
  if (convo) {
    console.log(`Deleting previous conversation...`);
    await scout9.conversationDelete(convo);
    console.log(`Previous conversation deleted\n`);
  }
  if (group) {
    console.log(`Deleting previous group...`);
    await scout9.scheduleGroupDelete(group);
    console.log(`Previous group deleted\n`);
  }
  if (customers) {
    await scout9.customersDelete(customers);
  }
  if (workflows) {
    await scout9.workflowsDelete(workflows);
  }
  if (files) {
    for (const file of files) {
      await scout9.fileDelete(file);
    }
  }
  if (operationId) {
    const operation = await scout9.operation(operationId)
      .catch((err) => {
        console.error('Operation Error:', err);
        throw err;
        return null;
      });
    if (operation) {
      switch (operation.data.model) {
        case 'customers':
          const resultTotal = Object.keys(operation.data.results).length;
          if (resultTotal > 20) {
            console.log(`Deleting ${resultTotal} customers...`);
            await scout9.customersDelete(Object.keys(operation.data.results).map((name) => operation.data.results[name].id));
          } else {
            for (const name in operation.data.results) {
              console.log(`Deleting customer ${name}...`)
              const {id} = operation.data.results[name];
              await scout9.customerDelete(id);
            }
          }
          break;
        default:
          throw new Error(`Unknown operation model: ${operation.data.model}, cannot reset (unimplemented)`);
      }
    }
  }
  return {} as ILocalCache;
};

export const loadCache = async () => {
  return await fs.readFile(cachePath, 'utf8')
    .then((obj: any) => {
      return JSON.parse(obj) as ILocalCache || {};
    })
    .catch(() => {
      return {} as ILocalCache;
    });
};

export const saveCache = async (cache: ILocalCache) => {
  await fs.writeFile(cachePath, JSON.stringify(cache));
};
