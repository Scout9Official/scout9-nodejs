import colors from 'kleur';
import { z } from 'zod';
import { build as _build, deploy as _deploy, run as _run, runConfig as _runConfig, sync as _sync } from './core/index.js';
import { loadConfig, loadEnvConfig } from './core/config/index.js';
import { coalesceToError, ProgressLogger } from './utils/index.js';

export const Scout9Platform = {
  /**
   * @param {{cwd: string; mode: 'development' | 'production'; src: string}} - build options
   */
  sync: async function ({cwd = process.cwd(), src = 'src', mode = 'production'} = {}) {
    const logger = new ProgressLogger();
    const messages = [];
    try {
      logger.log(`Loading config...`);
      const config = await loadConfig({cwd, src, logger, cb: (m) => messages.push(m)});
      logger.success('Config Loaded');
      logger.log(`Syncing project...`);
      const result = await _sync({cwd, src, logger}, config);
      messages.map(logger.info);
      logger.success('Sync Complete');
      logger.done();
      logger.info()
      messages.forEach(console.log);
      return {
        config,
        sync: result
      };
    } catch (e) {
      logger.done();
      this.handleError(e);
    }
  },

  /**
   * Builds & Deploys the project
   * @param {{cwd: string; mode: 'development' | 'production'; src: string, dest: string}} - build options
   */
  deploy: async function ({cwd = process.cwd(), src = './src', dest = '/tmp/project', mode = 'production'} = {}) {
    const logger = new ProgressLogger();
    const messages = [];
    try {
      logger.log(`Loading config...`);
      const config = await loadConfig({cwd, src, logger, cb: (m) => messages.push(m)});
      logger.success('Config Loaded');
      // await _build({cwd, src, dest, mode, logger}, config);
      logger.log(`Deploying project...`);
      await _deploy({cwd, src, dest, logger}, config);
      messages.map(logger.info);
      logger.success('Deploy Complete');
      logger.done();
      return config;
    } catch (e) {
      logger.done();
      this.handleError(e);
    }
  },
  /**
   * Builds the project
   * @param {{cwd: string; mode: 'development' | 'production'; src: string; dest: string;}} - build options
   */
  build: async function ({cwd = process.cwd(), src = './src', dest = '/tmp/project', mode = 'production'} = {}) {
    const logger = new ProgressLogger();
    const messages = [];
    try {
      logger.log(`Loading config...`);
      const config = await loadConfig({cwd, src, mode, logger, cb: (m) => messages.push(m)});
      logger.success('Config Loaded');
      logger.log(`Building project...`);
      await _build({cwd, src, dest, mode, logger}, config);
      messages.map(logger.info);
      logger.success('Build Complete');
      logger.done();
      return config;
    } catch (e) {
      logger.done();
      this.handleError(e);
    }
  },

  runConfig: async function ({cwd = process.cwd(), src  = './src', mode = 'production'} = {}) {
    const logger = new ProgressLogger();
    try {
      logger.log(`Loading config`);
      loadEnvConfig({cwd, logger});
      logger.log(`Getting auto-reply workflow config`);
      return _runConfig({cwd, src, mode, logger})
        .catch(e => {
          logger.done();
          throw e
        });
    } catch (e) {
      logger.done();
      this.handleError(e);
      throw e;
    }
  },

  /**
   * Runs the project in a container
   * @param {WorkflowEvent} event - every workflow receives an event object
   * @param {{cwd: string; mode: 'development' | 'production'; src: string}} - build options
   * @returns {Promise<WorkflowResponse<any>>}
   */
  run: async function (
    event,
    {cwd = process.cwd(), mode, src}
  ) {
    const logger = new ProgressLogger();
    try {
      logger.log(`Loading config`);
      loadEnvConfig({cwd, logger});
      logger.log(`Running auto-reply workflow`);
      return _run(event, {cwd, src, mode, logger})
        .catch(e => {
          logger.done();
          throw e
        });
    } catch (e) {
      logger.done();
      this.handleError(e);
      throw e;
    }
  },
  handleError: function (e) {
    const error = coalesceToError(e);

    if (error.name === 'SyntaxError') throw error;

    console.error(colors.bold().red(`> ${error.message}`));
    if (error instanceof z.ZodError) {
      console.error(error.issues.map(i => colors.red(`${colors.bold(`\tZod Error (${i.code}): `)}"${i.message}" ${JSON.stringify(
        i.path)}`)).join('\n'));
      console.error(colors.gray(JSON.stringify(error.format(), null, 2)));
    }

    if (error.stack) {
      console.error(colors.gray(error.stack.split('\n').slice(0).join('\n')));
    }

    process.exit(1);
  }
};
