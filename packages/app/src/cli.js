import fs from 'node:fs';
import sade from 'sade';
import colors from 'kleur';
import path from 'node:path';
import { Scout9Platform } from './platform.js';
import { coalesceToError } from './utils/index.js';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
const prog = sade('scout9').version(pkg.version);

/** @param {unknown} e */
function handle_error(e) {
  const error = coalesceToError(e);

  if (error.name === 'SyntaxError') throw error;

  console.error(colors.bold().red(`> ${error.message}`));
  if (error.stack) {
    console.error(colors.gray(error.stack.split('\n').slice(1).join('\n')));
  }

  process.exit(1);
}

/** @param {string} mode */
const coerceMode = (mode) => {
  const x = mode.toLowerCase().trim();
  const dmodes = ['development', 'dev', 'd'];
  const pmodes = ['production', 'prod', 'p'];
  if (dmodes.includes(x)) {
    return 'development';
  } else if (pmodes.includes(x)) {
    return 'production';
  } else {
    throw new Error(`Invalid mode "${mode}"`);
  }
}

prog
  .command('sync')
  .describe('Sync your project with your Scout9 account (copies any missing personas and entities into your project)')
  .example('sync')
  .option('--mode', 'Specify a mode for loading environment variables', 'production')
  .option('--folder', 'Project source code fold', 'src')
  .action(async ({mode, folder}) => {
    if (!fs.existsSync('.env')) {
      console.warn(`Missing ${path.resolve('.env')} — skipping`);
      return;
    }
    try {
      await Scout9Platform.sync({cwd: process.cwd(), mode: coerceMode(mode), folder});
      process.exit(0);
    } catch (e) {
      handle_error(e);
    }
  });

prog
  .command('build')
  .describe('Builds your scout9 auto reply app')
  .example('build')
  .example('build --mode development')
  .example('build --mode production')
  .option('--mode', 'Specify a mode for loading environment variables', 'production')
  .option('--folder', 'Project source code fold', 'src')
  .action(async ({ mode, folder }) => {
    if (!fs.existsSync('.env')) {
      console.warn(`Missing ${path.resolve('.env')} — skipping`);
      return;
    }
    try {
      await Scout9Platform.build({cwd: process.cwd(), mode: coerceMode(mode), folder});
      process.exit(0);
    } catch (e) {
      handle_error(e);
    }
  });


prog
  .command('deploy')
  .describe('Deploy your scout9 auto reply app')
  .option('--mode', 'Specify a mode for loading environment variables', 'production')
  .option('--folder', 'Project source code fold', 'src')
  .action(async ({ mode, folder }) => {
    if (!fs.existsSync('.env')) {
      console.warn(`Missing ${path.resolve('.env')} — skipping`);
      return;
    }
    try {
      await Scout9Platform.deploy({cwd: process.cwd(), mode: coerceMode(mode), folder});
      process.exit(0);
    } catch (e) {
      handle_error(e);
    }
  });

prog
  .command('dev')
  .describe('Run your scout9 auto reply app locally')
  .option('--mode', 'Specify a mode for loading environment variables', 'development')
  .action(async ({ mode }) => {
    if (!fs.existsSync('.env')) {
      console.warn(`Missing ${path.resolve('.env')} — skipping`);
      return;
    }
    try {
      throw new Error('Dev server not available yet');
    } catch (e) {
      handle_error(e);
    }
  })


prog.parse(process.argv, { unknown: (arg) => `Unknown option: ${arg}` });
