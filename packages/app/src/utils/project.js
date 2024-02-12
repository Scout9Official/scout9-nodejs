import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { checkVariableType, requireProjectFile } from './module.js';
import { globSync } from 'glob';
import { projectTemplates } from './project-templates.js';

class ProjectModule {

  constructor({
    autoSave = true,
    cwd = process.cwd(),
    src = './src',
    defaultExe = '.js',
    relativeFileSourcePatternWithoutExe,
    templateBuilder
  } = {}) {
    this.cwd = cwd;
    this.autoSave = autoSave;
    this.relativeFileSourcePatternWithoutExe = relativeFileSourcePatternWithoutExe
    this.defaultExe = defaultExe;
    this.src = src;
    if (!templateBuilder) {
      throw new Error('templateBuilder is required');
    }
    this.templateBuilder = templateBuilder;
    if (path.extname(relativeFileSourcePatternWithoutExe)) {
      throw new Error(`relativeFileSourcePatternWithoutExe should not include the file extension`);
    }
  }

  /**
   * Loads a project module
   * @param {Scout9ProjectBuildConfig | undefined} config - is required if autoSave is true
   * @param {boolean} ignoreModule - if true, will not require the module
   * @returns {Promise<{mod?: function, exe: string; filePath: string}>}
   */
  async load(config = undefined, ignoreModule = false) {
    const paths = globSync(`${this.src}/${this.relativeFileSourcePatternWithoutExe}.{ts,js,mjs,cjs}`, {cwd: this.cwd, absolute: true});
    if (paths.length === 0) {
      if (this.autoSave) {
        if (!config) {
          throw new Error(`Missing required file ${this.relativeFileSourcePatternWithoutExe}, autoSave requires a config object`);
        }
        return this.save(config);
      } else {
        throw new Error(`Missing required file ${this.relativeFileSourcePatternWithoutExe}, rerun "scout9 sync" to fix`);
      }
    }

    if (paths.length > 1) {
      throw new Error(`Multiple files found - [${paths.join(', ')}], remove one and rerun "scout9 sync" to fix`);
    }

    const [filePath] = paths;
    let mod;
    if (!ignoreModule) {
      mod = await requireProjectFile(filePath);
    }

    return {
      mod,
      exe: path.extname(filePath),
      filePath,
    }

  }

  /**
   * @param {Scout9ProjectBuildConfig} config
   * @param {boolean} ignoreModule - if true, will not require the module
   * @returns {Promise<{mod?: function, exe: string; filePath: string}>}
   */
  async save(config, ignoreModule = false) {
    const filePath = path.resolve(this.cwd, this.src, `${this.relativeFileSourcePatternWithoutExe}${this.defaultExe}`);
    const content = this.templateBuilder(config);
    // Ensures directory exists
    await fsp.mkdir(path.dirname(filePath), {recursive: true});
    await fsp.writeFile(filePath, content);
    let mod;
    if (!ignoreModule) {
      mod = await requireProjectFile(filePath);
    }
    return {
      mod,
      exe: this.defaultExe,
      filePath,
    }
  }
}

/**
 * Project Utility class - used to load and write project files
 */
export default class ProjectFiles {

  constructor({autoSave = true, cwd = process.cwd(), src = './src'} = {}) {
    this.cwd = cwd;
    this.src = src;
    this.autoSave = autoSave;

    // Determine default executable file
    const rootFilePaths = [
      path.resolve(cwd, src, 'index.ts'),
      path.resolve(cwd, src, 'index.mjs'),
      path.resolve(cwd, src, 'index.js'),
      path.resolve(cwd, src, 'index.cjs')
    ];
    let defaultExe = '.js';
    for (const filepath of rootFilePaths) {
      if (fs.existsSync(filepath)) {
         defaultExe = path.extname(filepath);
         break;
      }
    }
    this.defaultExe = defaultExe;
    this.root = new ProjectModule({autoSave, cwd, src, defaultExe, relativeFileSourcePatternWithoutExe: '{index,config}', templateBuilder: projectTemplates.root});
    this.app = new ProjectModule({autoSave, cwd, src, defaultExe, relativeFileSourcePatternWithoutExe: '{app}', templateBuilder: projectTemplates.app});
    this.agents = new ProjectModule({autoSave, cwd, src, defaultExe, relativeFileSourcePatternWithoutExe: 'entities/agents/{index,config}', templateBuilder: (config) => projectTemplates.entities.agents({agents: config.agents})});
    this.customers = new ProjectModule({autoSave, cwd, src, defaultExe, relativeFileSourcePatternWithoutExe: 'entities/customers/api', templateBuilder: projectTemplates.entities.customers});
    this.customer = new ProjectModule({autoSave, cwd, src, defaultExe, relativeFileSourcePatternWithoutExe: 'entities/customers/[customer]/api', templateBuilder: projectTemplates.entities.customers});
  }

  /**
   *
   * @param {Scout9ProjectBuildConfig | undefined} config - is required if autoSave is true
   * @param {ProgressLogger} logger
   * @returns {Promise<void>}
   */
  async sync(config, logger) {
    await this.root.load(config, true);
    await this.app.load(config, true);

    await this.agents.load(config, true);
    await this.agents.save(config, true);
    logger.info('Synced agents');

    await this.customers.load(config, true);
    await this.customer.load(config, true);

    // If entity file doesn't exist, create it
    for (const entityConfig of config.entities) {
      const {entities} = entityConfig;
      if (entities.length === 0) {
        logger.warn(`Entity ${entityConfig.entity} has no entity path references - skipping check`);
      }
      const paths = entities.join('/');
      const filepath = path.resolve(this.cwd, this.src, `entities/${paths}/api${this.defaultExe}`);
      if (!fs.existsSync(filepath)) {
        await fsp.mkdir(path.dirname(filepath), {recursive: true});
        await fsp.writeFile(filepath, projectTemplates.entities.entity({entity: entityConfig}));
        logger.info(`Missing entity, created ${filepath}`);
      } else {
        logger.info(`Existing entity, ${filepath} skipped`);
      }
    }
  }

}
