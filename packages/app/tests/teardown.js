import { readFile, unlink } from 'node:fs/promises';
import { chdir } from 'node:process';

export default async function () {
  chdir('./src-test');
  const pid = await readFile('.serverpid', 'utf8');
  if (!pid) {
    throw new Error('No service pid found');
  }
  process.kill(parseInt(pid), 'SIGTERM');
  console.log('Server stopped', pid);
  await unlink('.serverpid'); // Clean up PID file
  chdir('../');
}
