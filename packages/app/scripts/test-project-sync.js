import { resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { executeCommand } from './utils.js';
import { chdir } from 'node:process';

const configFilePath = resolve(process.cwd(), './.env');
dotenv({path: configFilePath});


const syncEnvironment = async () => {
  // Change to the appropriate directory
  chdir('./src-test');
  try {
    console.log('Running sync, this may take some time...');
    await executeCommand('npx scout9 sync');
  } catch (error) {
    console.error('Failed to sync environment:', error);
  }
  chdir('../');
};

await syncEnvironment();
