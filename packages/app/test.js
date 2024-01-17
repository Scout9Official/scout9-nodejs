import { fileURLToPath } from 'node:url';
import path from 'node:path';

const modulePath = fileURLToPath(import.meta.url);
const cwd = path.dirname(modulePath);

(async () => {
  await import(path.join(cwd, 'test-sync.js'));
  console.log('✅ Tested Sync');
  await import(path.join(cwd, 'test-run.js'));
  console.log('✅ Tested Run');
  await import(path.join(cwd, 'test-dev.js'));
// await import('./test-dev-local.js');
  console.log('✅ Tested Dev');
  console.log('✅ Done');
})();
