import { resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { executeCommand } from './utils.js';
import { writeFile, rm, copyFile } from 'node:fs/promises';
import { chdir } from 'node:process';
import { copy, rimraf } from 'create-scout9/utils.js';

const configFilePath = resolve(process.cwd(), './.env');
dotenv({path: configFilePath});

const SCOUT9_TEST_API_KEY = process.env.SCOUT9_TEST_API_KEY;
if (!SCOUT9_TEST_API_KEY) {
  throw new Error(`Missing ${SCOUT9_TEST_API_KEY} in .env`);
}



const replaceFilesAndFolders = () => {
  try {
    // Delete existing files/folders
    rimraf('./node_modules/@scout9/app/dist');
    rimraf('./node_modules/@scout9/app/src');
    rimraf('./node_modules/@scout9/app/types');

    // Copy new files/folders
    copy('../dist', './node_modules/@scout9/app/dist');
    copy('../src', './node_modules/@scout9/app/src');
    copy('../types', './node_modules/@scout9/app/types');
    copy('../package.json', './node_modules/@scout9/app/package.json');

    console.log('Files and folders have been replaced successfully.');
  } catch (error) {
    console.error('Error replacing files and folders:', error);
  }
};

const setupEnvironment = async () => {
// Change to the appropriate directory
  chdir('./src-test');
  try {
    // Install npm packages
    await executeCommand('npm install');

    // Write the API key to the .env file
    await writeFile('.env', `SCOUT9_API_KEY=${SCOUT9_TEST_API_KEY}`, { flag: 'w' });
    console.log('API key added to .env file.');

    // Replace the following files and folders ...
    replaceFilesAndFolders();

    console.log('Loaded test project');
  } catch (error) {
    console.error('Failed to set up environment:', error);
  }
  chdir('../');
};

await setupEnvironment();
