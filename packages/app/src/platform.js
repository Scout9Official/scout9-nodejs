import colors from 'kleur';
import { z } from 'zod';
import { build as _build, deploy as _deploy, run as _run, sync as _sync } from './core/index.js';
import { loadConfig, loadEnvConfig } from './core/config/index.js';
import { coalesceToError } from './utils/index.js';

export const Scout9Platform = {
  sync:  async function ({cwd = process.cwd(), folder = 'src', mode = 'production'} = {}) {
    try {
      const config = await loadConfig({cwd, folder});
      const result = await _sync({cwd, folder}, config);
      return {
        config,
        sync: result
      };
    } catch (e) {
      this.handleError(e);
    }
  },

  /**
   * Builds & Deploys the project
   */
  deploy:  async function ({cwd = process.cwd(), folder = 'src', mode = 'production'} = {}) {
    try {
      const config = await loadConfig({cwd, folder: 'src' });
      await _build({cwd}, config);
      await _deploy({cwd}, config);
      return config;
    } catch (e) {
      this.handleError(e);
    }
  },

  /**
   * Builds the project
   */
  build: async function({cwd = process.cwd(), folder = 'src', mode = 'production'} = {}) {
    try {
      const config = await loadConfig({cwd, folder, mode});
      await _build({cwd, folder}, config);
      return config;
    } catch (e) {
      this.handleError(e);
    }
  },

  /**
   * Runs the project in a container
   */
  run: async function (
    event,
    {cwd = process.cwd(), mode = 'remote', folder}
  ) {
    if (mode !== 'remote') {
      throw new Error(`Unimplemented mode "${mode}"`);
    }
    try {
      loadEnvConfig({cwd});
      return _run(event, {cwd, folder});
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  },
  handleError: function (e) {
    const error = coalesceToError(e);

    if (error.name === 'SyntaxError') throw error;

    console.error(colors.bold().red(`> ${error.message}`));
    if (error instanceof z.ZodError) {
      console.error(error.issues.map(i => colors.red(`${colors.bold(`\tZod Error (${i.code}): `)}"${i.message}" ${JSON.stringify(i.path)}`)).join('\n'));
      console.error(colors.gray(JSON.stringify(error.format(), null, 2)));
    }

    if (error.stack) {
      console.error(colors.gray(error.stack.split('\n').slice(0).join('\n')));
    }

    process.exit(1);
  }
}
