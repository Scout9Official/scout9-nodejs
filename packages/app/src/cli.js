import fs from 'node:fs';
import sade from 'sade';
import colors from 'kleur';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
};

prog
    .command('sync')
    .describe('Sync your project with your Scout9 account (copies any missing personas and entities into your project)')
    .example('sync')
    .option('--mode', 'Specify a mode for loading environment variables', 'production')
    .option('--src', 'Project source code folder', 'src')
    .action(async ({mode, src}) => {
        if (!fs.existsSync('.env')) {
            console.warn(`Missing ${path.resolve('.env')} — skipping`);
            return;
        }
        mode = coerceMode(mode);
        try {
            await Scout9Platform.sync({cwd: process.cwd(), mode: coerceMode(mode), src});
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
    .option('--dest', 'Project local destination', './build')
    .option('--mode', 'Specify a mode for loading environment variables', 'production')
    .option('--src', 'Project source code fold', 'src')
    .action(async ({mode, src, dest}) => {
        if (!fs.existsSync('.env')) {
            console.warn(`Missing ${path.resolve('.env')} — skipping`);
            return;
        }
        mode = coerceMode(mode);
        try {
            await Scout9Platform.build({cwd: process.cwd(), mode, src, dest});
            process.exit(0);
        } catch (e) {
            handle_error(e);
        }
    });


prog
    .command('deploy')
    .describe('Deploy your scout9 app')
    .option('--src', 'Project source code folder', 'src')
    .option('--sync, -s', 'Syncs project after deploying (overwriting code)', true)
    .option('--dest', 'Project local destination', './build')
    .action(async ({src, dest, sync}) => {
        if (!fs.existsSync('.env')) {
            console.warn(`Missing ${path.resolve('.env')} — skipping`);
            return;
        }
        try {
            await Scout9Platform.deploy({cwd: process.cwd(), mode: 'production', src, dest, sync});
            process.exit(0);
        } catch (e) {
            handle_error(e);
        }
    });

prog
  .command('test')
  .describe('Test your scout9 app')
  .option('--mode', 'Specify a mode for loading environment variables', 'production')
  .option('--src', 'Project source code folder', 'src')
  .option('--dest', 'Project local destination', './build')
  .action(async ({mode, src, dest}) => {
    if (!fs.existsSync('.env')) {
      console.warn(`Missing ${path.resolve('.env')} — skipping`);
      return;
    }
    mode = coerceMode(mode);
    try {
      await Scout9Platform.test({cwd: process.cwd(), mode: coerceMode(mode), src, dest});
      process.exit(0);
    } catch (e) {
      handle_error(e);
    }
  });

prog
    .command('dev')
    .describe('Builds and runs your scout9 auto reply app locally')
    .option('--mode', 'Specify a mode for loading environment variables', 'development')
    .option('--src', 'Project source code folder', 'src')
    .option('--open', 'Where to open website by default of not', true)
    .option('--dest', 'Project local destination', './build')
    .action(async ({mode, src, dest}) => {
        if (!fs.existsSync('.env')) {
            console.warn(`Missing ${path.resolve('.env')} — skipping`);
            return;
        }
        mode = coerceMode(mode);
        try {
            process.env.DEV_MODE = "true";
            const cwd = process.cwd();
            await Scout9Platform.build({cwd, mode, src, dest});
            await import(pathToFileURL(path.join(cwd, `${dest}/app.js`)));
        } catch (e) {
            handle_error(e);
        }
    });

prog
    .command('config')
    .describe('Prints the project configuration')
    .option('--mode', 'Specify a mode for loading environment variables', 'production')
    .option('--local', 'Prints the local configuration', false)
    .option('--src', 'Project source code folder', 'src')
    .action(async ({mode, local, src}) => {
        if (!fs.existsSync('.env')) {
            console.warn(`Missing ${path.resolve('.env')} — skipping`);
            return;
        }
        mode = coerceMode(mode);
        try {
            const config = await Scout9Platform.config({cwd: process.cwd(), mode: coerceMode(mode), src, local});
            console.log(JSON.stringify(config, null, 2));
            process.exit(0);
        } catch (e) {
            handle_error(e);
        }
    });

prog
    .command('run <eventPath>')
    .describe('Runs the project locally with a given workflow event')
    .option('--mode', 'Specify a mode for loading environment variables', 'development')
    .option('--src', 'Project source code folder', './src')
    .action(async (eventPath, {mode, src}) => {
        if (!fs.existsSync('.env')) {
            console.warn(`Missing ${path.resolve('.env')} — skipping`);
            return;
        }
        mode = coerceMode(mode);
        if (!fs.existsSync(eventPath)) {
            console.error(`Event file not found: ${eventPath}`);
            process.exit(1);
        }
        try {
            const event = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
            const result = await Scout9Platform.run(event, {cwd: process.cwd(), mode: coerceMode(mode), eventSource: eventPath, src});
            console.log(JSON.stringify(result, null, 2));
            process.exit(0);
        } catch (e) {
            handle_error(e);
        }
    });

prog
    .command('message')
    .describe('Send a test message to an agent')



// @TODO would be dope if I could test by sending a message to an agent with the cli tool

prog.parse(process.argv, {unknown: (arg) => `Unknown option: ${arg}`});
