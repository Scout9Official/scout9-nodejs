import { Scout9Platform } from './src/platform.js';

(async () => {

  const result = await Scout9Platform.build({cwd: process.cwd(), mode: 'development', folder: 'src-test'});
  console.log(result)

  const sync = await Scout9Platform.sync({cwd: process.cwd(), mode: 'development', folder: 'src-test'});
  console.log('Sync result:', sync);
})();
