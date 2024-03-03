import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { config } from 'dotenv';
import { checkVariableType, requireProjectFile } from './module.js';
import { globSync } from 'glob';
import { projectTemplates } from './project-templates.js';
import { loadUserPackageJson } from './configs/project.js';
import loadEntitiesConfig from './configs/entities.js';
import loadWorkflowsConfig from './configs/workflow.js';
import { Scout9ProjectBuildConfigSchema } from '../runtime/index.js';
import { ProgressLogger } from './logger.js';
import { formatGlobPattern, normalizeGlobPattern } from './glob.js';

/**
 * Utility class to load and write project files in a targeted way
 */
class ProjectModule {

  constructor({
    autoSave = true,
    cwd = process.cwd(),
    src = './src',
    defaultExe = '.js',
    relativeFileSourcePatternWithoutExe,
    templateBuilder,
    logger = new ProgressLogger(),
  } = {}) {
    this.cwd = cwd;
    this.autoSave = autoSave;
    this.logger = logger;
    this.relativeFileSourcePatternWithoutExe = relativeFileSourcePatternWithoutExe;
    if (!defaultExe.startsWith('.')) {
      console.warn(`defaultExe should start with a "." - ${defaultExe}, defaulting to ".${defaultExe}"`);
      defaultExe = `.${defaultExe}`;
    }
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
    let filePath;
    try {
      filePath = this._filepath;
    } catch (e) {
      if ('message' in e && e.message.startsWith('Not Found')) {
        const _defaultFilepath = this._defaultFilepath;
        if (fs.existsSync(_defaultFilepath)) {
          // try {
          //   const x = this._filepath;
          // } catch (e) {
          //   //
          // }
          throw new Error(`Internal: "this._filepath" was unable to derive the default file path "${_defaultFilepath}`);
        }
        if (this.autoSave) {
          if (!config) {
            throw new Error(`Missing required file ${this.relativeFileSourcePatternWithoutExe}, autoSave requires a config object`);
          }
          return this.save(config, ignoreModule, this._defaultFilepath);
        } else {
          throw new Error(`Missing required file ${this.relativeFileSourcePatternWithoutExe}, rerun "scout9 sync" to fix`);
        }
      } else {
        throw e;
      }
    }

    let mod;
    if (!ignoreModule) {
      mod = await requireProjectFile(filePath);
    }

    return {
      mod,
      exe: path.extname(filePath),
      filePath
    };
  }

  /**
   * Writes data into a project file
   * @param {Scout9ProjectBuildConfig} config
   * @param {boolean} ignoreModule - if true, will not require the module (turning this off will speed runtime)
   * @param {string | undefined} filePathOverride - if provided, will override the default file path
   * @returns {Promise<{mod?: function, exe: string; filePath: string}>}
   */
  async save(config, ignoreModule = false, filePathOverride = undefined) {
    const filePath = filePathOverride || this._filepath;
    const content = this.templateBuilder(config);
    if (!content || typeof content !== 'string') {
      throw new Error(`Invalid templateBuilder return value for file "${filePath}"`);
    }

    // @TODO why this here?
    if (filePath.endsWith('entities/api.js')) {
      throw new Error(`Invalid file path "${filePath}"`);
    }

    const exists = fs.existsSync(filePath);
    if (!exists) {
      this.logger?.warn?.(`Missing "${filePath}"`);
    }
    // Ensures directory exists
    await fsp.mkdir(path.dirname(filePath), {recursive: true});
    await fsp.writeFile(filePath, content);
    this.logger?.info?.(`${exists ? 'Synced' : 'Created'} "${filePath}"`);
    let mod;
    if (!ignoreModule) {
      mod = await requireProjectFile(filePath);
    }
    return {
      mod,
      exe: this.defaultExe,
      filePath
    };
  }

  /**
   * @param {Array<Agent> | function(): Array<Agent> | function(): Promise<Array<Agent>>} mod
   * @param {Array<string>} acceptableTypes
   * @returns {Promise<any>}
   */
  async resolve(mod, acceptableTypes = ['async function', 'function', 'array', 'object', 'json object']) {
    let result;
    const entityType = checkVariableType(mod);
    if (!acceptableTypes.includes(entityType)) {
      throw new Error(`Invalid entity type (${entityType})`);
    }
    switch (entityType) {
      case 'async function':
      case 'function':
        result = await mod();
        break;
      case 'array':
      case 'object':
      case 'json object':
        result = mod;
        break;
      default:
        throw new Error(`Invalid entity type (${entityType}) returned at "${path}"`);
    }
    return result;
  }

  get _filepath() {
    const _filePath = `${this.src}/${this.relativeFileSourcePatternWithoutExe}`;
    const pattern = formatGlobPattern(`${_filePath}.{ts,js,mjs,cjs}`);
    const paths = globSync(
      pattern,
      {cwd: this.cwd, absolute: true}
    );
    if (paths.length === 0) {
      throw new Error(`Not Found: Missing required file ${_filePath}`);
    }

    if (paths.length > 1) {
      throw new Error(`Input Error: Multiple files found - [${paths.join(', ')}], remove one and rerun "scout9 sync" to fix`);
    }

    const [filePath] = paths;

    if (!filePath) {
      throw new Error(`Not Found: No filepath available in ${_filePath}`);
    }

    return filePath;
  }

  get _defaultFilepath() {
    return normalizeGlobPattern(`${this.src}/${this.relativeFileSourcePatternWithoutExe}${this.defaultExe}`);
  }
}

/**
 * Project Utility class - used to load and write project files
 */
export default class ProjectFiles {

  constructor({
    autoSave = true,
    cwd = process.cwd(),
    src = './src',
    logger
  } = {}) {
    this.cwd = cwd;
    this.src = src;
    this.autoSave = autoSave;

    // Determine default executable file from the src/index.{ts,js,mjs,cjs}
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
    this.root = new ProjectModule({
      autoSave,
      cwd,
      src,
      defaultExe,
      logger,
      relativeFileSourcePatternWithoutExe: '{index,config}',
      templateBuilder: projectTemplates.root
    });
    this.app = new ProjectModule({
      autoSave,
      cwd,
      src,
      defaultExe,
      logger,
      relativeFileSourcePatternWithoutExe: 'app',
      templateBuilder: projectTemplates.app
    });
    this.agents = new ProjectModule({
      autoSave,
      cwd,
      src,
      defaultExe,
      logger,
      relativeFileSourcePatternWithoutExe: 'entities/agents/{index,config}',
      templateBuilder: (config) => {
        // console.log({config});
        return projectTemplates.entities.agents({agents: config.agents});
      }
    });
    this.customers = new ProjectModule({
      autoSave,
      cwd,
      src,
      defaultExe,
      logger,
      relativeFileSourcePatternWithoutExe: 'entities/customers/api',
      templateBuilder: projectTemplates.entities.customers
    });
    this.customer = new ProjectModule({
      autoSave,
      cwd,
      src,
      defaultExe,
      logger,
      relativeFileSourcePatternWithoutExe: 'entities/customers/[customer]/api',
      templateBuilder: projectTemplates.entities.customer
    });
    this.logger = logger;
  }

  /**
   * Loads all the project configuration data
   * @returns {Promise<Scout9ProjectBuildConfig>}
   */
  async load() {
    /**
     * @type {Scout9ProjectBuildConfig}
     */
    const projectConfig = {
      ...(await this._loadEnv()),
      entities: [],
      agents: [],
      workflows: []
    };

    // Load entities, except for special entities such as ["agents"]
    projectConfig.entities = await loadEntitiesConfig({cwd: this.cwd, src: this.src});

    // Load agent persona configuration
    const mod = await this.agents.load(projectConfig, false).then(({mod}) => mod.default);
    projectConfig.agents = await this.agents.resolve(
      mod,
      ['async function', 'function', 'array']
    );

    // Loads workflows
    projectConfig.workflows = await loadWorkflowsConfig({cwd: this.cwd, src: this.src});

    // Validate the config
    const result = Scout9ProjectBuildConfigSchema.safeParse(projectConfig);
    if (!result.success) {
      result.error.source = `${this.src}/index.js`;
      throw result.error;
    }

    // Log
    for (const entityConfig of projectConfig.entities) {
      this.logger?.info?.(`Loaded entity ${entityConfig.entities.join('/')}`);
    }

    return projectConfig;
  }

  /**
   *
   * @param {Scout9ProjectBuildConfig | undefined} config - is required if autoSave is true
   * @param {(message: string, type: 'info' | 'warn' | 'error' | 'log' | undefined) => void | undefined} cb
   * @returns {Promise<void>}
   */
  async sync(config, cb = (message, type) => {
  }) {
    await this.root.load(config, true);
    await this.root.save(config, true);

    await this.app.load(config, true);

    await this.agents.load(config, true);
    await this.agents.save(config, true);
    cb('Synced agents');

    await this.customers.load(config, true);
    await this.customer.load(config, true);

    // If entity file doesn't exist, create it
    for (const entityConfig of config.entities) {
      const {entities} = entityConfig;
      if (entities.length === 0) {
        cb(`Entity ${entityConfig.entity} has no entity path references - skipping check`, 'warn');
        continue;
      }
      const paths = entities.join('/');
      const filepath = path.resolve(this.cwd, this.src, `entities/${paths}/api${this.defaultExe}`);
      if (!fs.existsSync(filepath)) {
        await fsp.mkdir(path.dirname(filepath), {recursive: true});
        await fsp.writeFile(filepath, projectTemplates.entities.entity({entity: entityConfig}));
        cb(`Missing entity, created ${filepath}`, 'info');
      } else {
        cb(`Existing entity, ${filepath} skipped`, 'info');
      }
    }
  }

  /**
   * Loads the users local package.json, if they provide a package-s9-test.json, it will load that instead (used for scout9 internal testing)
   * @returns {Promise<Scout9ProjectConfig>}
   */
  async _loadEnv() {
    if (!!process.env.SCOUT9_API_KEY) {
      if (process.env.SCOUT9_API_KEY.includes('insert-scout9-api-key')) {
        throw new Error('Missing SCOUT9_API_KEY, please add your Scout9 API key to your .env file');
      }
    } else {
      const configFilePath = path.resolve(this.cwd, './.env');
      config({path: configFilePath});
      if (!process.env.SCOUT9_API_KEY) {
        const exists = fs.existsSync(configFilePath);
        if (!exists) {
          throw new Error(`Missing .env file with "SCOUT9_API_KEY".\n\n\tTo fix, create a .env file at the root of your project.\nAdd "SCOUT9_API_KEY=<your-scout9-api-key>" to the .env file.\n\n\t> You can get your API key at https://scout9.com\n\n`);
        } else {
          throw new Error(`Missing "SCOUT9_API_KEY" within .env file.\n\n\tTo fix, add "SCOUT9_API_KEY=<your-scout9-api-key>" to the .env file.\n\n\tYou can get your API key at https://scout9.com\n\n`);
        }
      }
    }

    const {pkg} = await loadUserPackageJson({cwd: this.cwd});
    const tag = `${pkg.name || 'scout9-app'}-v${pkg.version || '0.0.1'}`;
    const {mod, filePath} = await this.root.load();
    const root = mod?.default;
    if (!root || checkVariableType(root) !== 'json object') {
      throw new Error(`Invalid root project file ${filePath} - must be an object, example:\n\nexport default {/** ... */}`);
    }
    return {
      tag,
      ...root
    };
  }


}
