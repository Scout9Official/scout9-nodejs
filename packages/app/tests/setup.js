import { exec } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { chdir } from 'node:process';
import { wait } from './utils.js';


export default async function () {
  chdir('./src-test');
  const server = exec('npm run dev');
  // Write the process id to a temporary file
  await writeFile('.serverpid', `${server.pid}`);
  chdir('../');

  // @TODO use spawn to catch when server ready
  // Wait sometime before starting
  console.log('\nWaiting for server to be ready...');
  await wait(30 * 1000);
  console.log('\nServer ready');
}
