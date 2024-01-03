import { Scout9Platform } from './src/platform.js';

(async () => {

  const result = await Scout9Platform.build({cwd: process.cwd(), mode: 'development', folder: 'src-test'});
  console.log('\n\n----------Build Result:\n\n', result,'\n\n----------\n\n');

  const sync = await Scout9Platform.sync({cwd: process.cwd(), mode: 'development', folder: 'src-test'});
  console.log('\n\n----------Sync Result:\n\n', sync,'\n\n----------\n\n');

  const deploy = await Scout9Platform.deploy({cwd: process.cwd(), mode: 'development', src: 'src-test', dest: './tmp/project'});
  console.log('\n\n----------Deploy Result:\n\n', deploy,'\n\n----------\n\n');

})();
