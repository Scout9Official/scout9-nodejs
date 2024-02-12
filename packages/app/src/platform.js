import colors from 'kleur';
import { z } from 'zod';
import { build as _build, deploy as _deploy, run as _run, runConfig as _runConfig, sync as _sync, test as _test } from './core/index.js';
import { loadConfig, loadEnvConfig } from './core/config/index.js';
import { coalesceToError, ProgressLogger } from './utils/index.js';
import ProjectFiles from './utils/project.js';
import { logUserValidationError, report } from './report.js';

/**
 * Collection of Scout9 Platform commands
 */
export const Scout9Platform = {
  /**
   * @param {{cwd: string; mode: 'development' | 'production'; src: string}} - build options
   */
  sync: async function ({cwd = process.cwd(), src = 'src', mode = 'production'} = {}) {
    const logger = new ProgressLogger();
    const messages = [];
    try {
      logger.log(`Loading Local Config...`);
      const projectFiles = new ProjectFiles({cwd, src, autoSave: true, logger});
      const config = await projectFiles.load();
      logger.success('Local Config Loaded');
      logger.log(`Syncing project...`);
      const result = await _sync({cwd, src, logger, projectFiles}, config);
      logger.success('Sync Complete');
      report(config, logger);
      messages.forEach((m) => logger.info(m));
      logger.done();
      return result;
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
      const {contacts} = await _deploy({cwd, src, dest, logger}, config);
      messages.forEach((m) => logger.info(m));
      logger.success(`Deploy Complete\n\n`);
      logger.write(`\tApplication will be live for the following channels in a few moments:\n${contacts}`);
      logger.done();
      return config;
    } catch (e) {
      logger.done();
      this.handleError(e);
    }
  },
  /**
   * Tests the project
   * @param {{cwd: string; mode: 'development' | 'production'; src: string, dest: string}} - build options
   */
  test: async function ({cwd = process.cwd(), src = './src', dest = '/tmp/project', mode = 'production'} = {}) {
    const logger = new ProgressLogger();
    const messages = [];
    try {
      logger.log(`Loading test data...`);
      const config = await loadConfig({cwd, src, logger, cb: (m) => messages.push(m)});
      logger.success('Test data loaded');
      logger.log(`Testing project...`);
      await _test({cwd, src, dest, logger}, config);
      messages.forEach((m) => logger.info(m));
      logger.success(`Test complete`);
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
      messages.forEach((m) => logger.info(m));
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

    switch (error.name) {
      case 'SyntaxError':
        throw error;
      case 'ZodError':
        logUserValidationError(error, error.source || 'src/index.js|ts');
        break;
      default:
        console.error(colors.bold().red(`> ${error.message}`));
        if (error instanceof z.ZodError) {
          console.error(error.issues.map(i => colors.red(`${colors.bold(`\tZod Error (${i.code}): `)}"${i.message}" ${JSON.stringify(
            i.path)}`)).join('\n'));
          console.error(colors.gray(JSON.stringify(error.format(), null, 2)));
        }

        if (error.stack) {
          console.error(colors.gray(error.stack.split('\n').slice(0).join('\n')));
        }
    }
    process.exit(1);
  }
};
