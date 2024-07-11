import colors from 'kleur';
import { z } from 'zod';
import {
  build as _build,
  deploy as _deploy,
  run as _run,
  runConfig as _runConfig,
  sync as _sync,
  test as _test
} from './core/index.js';
import { loadConfig, loadEnvConfig } from './core/config/index.js';
import { coalesceToError, ProgressLogger } from './utils/index.js';
import ProjectFiles from './utils/project.js';
import { logUserValidationError, report } from './report.js';

/**
 * Collection of Scout9 Platform commands
 */
export const Scout9Platform = {
  /**
   * Syncs the project with the Scout9 account
   * @param {Object} params
   * @param {string} [params.cwd=process.cwd()] - the working directory
   * @param {string} [params.src='src'] - the source directory
   * @param {string} [params.mode='production'] - the build mode
   * @returns {Promise<Scout9ProjectBuildConfig>}
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
   * @param {Object} params
   * @param {string} [params.cwd=process.cwd()] - the working directory
   * @param {string} [params.src='./src'] - the source directory
   * @param {string} [params.dest='/tmp/project'] - the destination directory
   * @param {boolean} [params.sync=true] - whether to sync the project after deploying
   * @returns {Promise<Scout9ProjectBuildConfig>}
   */
  deploy: async function (
    {
      cwd = process.cwd(),
      src = './src',
      dest = '/tmp/project',
      sync = true
    } = {}
  ) {
    const logger = new ProgressLogger();
    const messages = [];
    try {
      // @TODO replace loadConfig with ProjectFiles class
      logger.log(`Loading config...`);
      let config = await loadConfig({cwd, src, deploying: true, dest, logger, cb: (m) => messages.push(m)});
      logger.success('Config Loaded');
      // await _build({cwd, src, dest, mode, logger}, config);
      logger.log(`Deploying project...`);
      const {contacts} = await _deploy({cwd, src, dest, logger}, config);
      report(config, logger);
      logger.success(`Deploy Complete\n\n`);
      if (sync) {
        logger.log(`Syncing project...`);
        const projectFiles = new ProjectFiles({cwd, src, autoSave: true, logger});
        config = await projectFiles.load();
        const result = await _sync({cwd, src, logger, projectFiles}, config);
        if (result.success) {
          logger.success('Sync Complete');
          config = result.config;
        } else {
          logger.error('Sync Failed');
        }
      } else {
        logger.warn(`Syncing project... skipped`);
      }

      logger.write(`\tApplication will be live for the following channels in a few moments:\n${contacts}`);
      logger.done();
      messages.forEach((m) => logger.info(m));
      return config;
    } catch (e) {
      logger.done();
      this.handleError(e);
    }
  },
  /**
   * Tests the project
   * @param {Object} params
   * @param {string} [params.cwd=process.cwd()] - the working directory
   * @param {string} [params.src='./src'] - the source directory
   * @param {string} [params.dest='/tmp/project'] - the destination directory
   * @param {'development' | 'production'} [params.mode='production'] - the build mode
   * @returns {Promise<Scout9ProjectBuildConfig>}
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
      report(config, logger);
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
   * @param {Object} params
   * @param {string} [params.cwd=process.cwd()] - the working directory
   * @param {string} [params.src='./src'] - the source directory
   * @param {string} [params.dest='/tmp/project'] - the destination directory
   * @param {'development' | 'production'} [params.mode='production'] - the build mode
   * @returns {Promise<Scout9ProjectBuildConfig>}
   */
  build: async function ({cwd = process.cwd(), src = './src', dest = '/tmp/project', mode = 'production'} = {}) {
    const logger = new ProgressLogger();
    const messages = [];
    try {
      logger.log(`Loading config...`);
      const config = await loadConfig({
        cwd, src, mode, logger, cb: (m) => {
          logger.info(m);
        }
      });
      logger.success('Config Loaded');
      logger.log(`Building project...`);
      await _build({cwd, src, dest, mode, logger}, config);
      report(config, logger);
      messages.forEach((m) => logger.info(m));
      logger.success('Build Complete');
      logger.done();
      return config;
    } catch (e) {
      logger.done();
      this.handleError(e);
    }
  },

  /**
   * Loads the project config
   * @param {Object} params
   * @param {string} [params.cwd=process.cwd()] - the working directory
   * @param {boolean} [params.local=false] - whether to only load the local config (ignores what's saved on server)
   * @param {string} [params.src='./src'] - the source directory
   * @returns {Promise<Scout9ProjectBuildConfig>}
   */
  config: async function ({cwd = process.cwd(), local = false, src = './src'} = {}) {
    try {
      loadEnvConfig({cwd});
      if (local) {
        const projectFiles = new ProjectFiles({cwd, src, autoSave: false});
        return projectFiles.load();
      } else {
        return _runConfig();
      }

    } catch (e) {
      this.handleError(e);
      throw e;
    }
  },

  /**
   * Runs the project in a container
   * @param {WorkflowEvent} event - every workflow receives an event object
   * @param {Object} options
   * @param {string} [options.cwd=process.cwd()] - the working directory
   * @param {string} [options.mode='production'] - the build mode
   * @param {string} [options.src='./src'] - the source directory
   * @param {string} options.eventSource - the source of the workflow event
   * @returns {WorkflowResponse}
   */
  run: async function (
    event,
    {cwd = process.cwd(), mode = 'production', src = './src', eventSource}
  ) {
    try {
      loadEnvConfig({cwd});
      return _run(event, {cwd, src, mode, eventSource})
        .catch(e => {
          throw e;
        });
    } catch (e) {
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
