import fs from 'node:fs';
import sade from 'sade';
import path from 'node:path';
import { Scout9Platform } from './platform.js';

// const pkg = JSON.parse(fs.readFileSync(new URL('../package.json'), 'utf-8'));
// const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
const prog = sade('scout9-auto-reply').version('0.0.1');

prog
  .command('build')
  .describe('Builds your scout9 auto reply app')
  .option('--mode', 'Specify a mode for loading environment variables', 'development')
  .action(async ({ mode }) => {
    if (!fs.existsSync('.env')) {
      console.warn(`Missing ${path.resolve('.env')} — skipping`);
      return;
    }
    return Scout9Platform.build({cwd: process.cwd(), mode});
  });


prog
  .command('deploy')
  .describe('Deploy your scout9 auto reply app')
  .option('--mode', 'Specify a mode for loading environment variables', 'development')
  .action(async ({ mode }) => {
    if (!fs.existsSync('.env')) {
      console.warn(`Missing ${path.resolve('.env')} — skipping`);
      return;
    }
    return Scout9Platform.build({cwd: process.cwd(), mode});
  });

prog.parse(process.argv, { unknown: (arg) => `Unknown option: ${arg}` });
