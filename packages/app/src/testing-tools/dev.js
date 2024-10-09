import { Configuration, Scout9Api } from '@scout9/admin';
import { grey, italic, bgWhite, black } from 'kleur/colors';
import { createMockConversation, createMockWorkflowEvent } from './mocks.js';
import { loadConfig } from '../core/config/index.js';
import { requireProjectFile } from '../utils/index.js';
import { globSync } from 'glob';

import { Spirits } from './spirits.js';

/**
 * Testing tool kit, used to handle Scout9 operations such as parsing, workflow, and generating responses
 */
export class Scout9Test {

  /**
   * @type {import('@scout9/app').Customer}
   */
  customer;

  /**
   * @type {import('@scout9/app').Persona}
   */
  persona;

  /**
   * @type {import('@scout9/app').Conversation}
   */
  conversation;

  /**
   * @type {import('@scout9/app').Message[]}
   */
  messages;

  /**
   * @type {import('@scout9/app').ConversationContext}
   */
  context;

  /**
   * @private
   * @type {import('@scout9/app').Scout9ProjectBuildConfig | null}
   */
  _project = null;

  /**
   * @private
   * @type {import('@scout9/app').WorkflowFunction | null}
   */
  _app = null;

  /**
   * @private
   * @type {import('@scout9/admin').Scout9Api | null}
   */
  _api = null;

  /**
   * @private
   */
  _cwd;

  /**
   * @private
   */
  _src;

  /**
   * @private
   */
  _mode;

  /**
   * @private
   */
  _loaded;

  /**
   * @private
   */
  _personaId;

  /**
   * @private
   */
  #defaultLog;


  /**
   * Mimics a customer message to your app (useful for testing)
   * @param props - the Scout9Test properties
   * @param {import('@scout9/app').Customer | undefined} [props.customer] - customer to use
   * @param {any | undefined} [props.context] - prior conversation context
   * @param {string | undefined} [props.persona] id to use
   * @param {import('@scout9/app').Conversation | undefined} [props.conversation] - existing conversation
   * @param {string | undefined} [props.cwd]
   * @param {string | undefined} [props.src]
   * @param {string | undefined} [props.mode]
   * @param {import('@scout9/admin').Scout9Api} [props.api]
   * @param {import('@scout9/app').WorkflowFunction} [props.app]
   * @param {import('@scout9/app').Scout9ProjectBuildConfig} [props.project]
   */
  constructor(
    {
      persona,
      customer,
      context,
      conversation = createMockConversation(),
      cwd = process.cwd(),
      src = 'src',
      mode = 'production',
      api,
      app,
      project,
      log = false
    } = {
      cwd: process.cwd(),
      src: 'src',
      mode: 'production'
    }
  ) {
    this.messages = [];
    this._cwd = cwd;
    this._src = src;
    this._mode = mode;
    this.context = context || {};
    this.conversation = conversation;
    if (api) {
      this._api = api;
    }
    if (app) {
      this._app = app;
    }
    if (project) {
      this._project = project;
    }
    if (!customer) {
      customer = {
        id: 'mock_customer_' + Math.random().toString(36).slice(2, 11),
        name: 'Mock Customer',
        firstName: 'Mock',
        lastName: 'Customer'
      };
      this.conversation.$customer = customer.id;
    } else {
      this.conversation.$customer = customer.id;
    }
    this.customer = customer;
    this.context.customer = customer;
    this._personaId = persona;
    this.#defaultLog = !!log;
  }

  /**
   * Loads the test environment
   * @param {boolean} [override] - defaults to false, if true, it will override the current loaded state such as the scout9 api, workflow function, and project config
   * @returns {Promise<void>}
   */
  async load(override = false) {

    // Load app (if not already loaded or override true)
    if (override || !this._app) {
      this._app = await this._loadApp();
    }

    // Load app configuration (if not already loaded or override true)
    if (override || !this._project) {
      this._project = await loadConfig({cwd: this._cwd, src: this._src, mode: this._mode});
    }

    if (override || !this._api) {
      this._api = new Scout9Api(new Configuration({apiKey: process.env.SCOUT9_API_KEY}));
    }

    if (!this._personaId) {
      this._personaId = (this._project.persona || this._project.agents)?.[0]?.id;
      if (!this._personaId) {
        throw new Error(`No persona found in config, please specify a persona id`);
      }
    }
    this.conversation.$agent = this._personaId;
    this.persona = (this._project.persona || this._project.agents).find(p => p.id === this._personaId);
    if (!this.persona) {
      throw new Error(`Could not find persona with id: ${this._personaId}, ensure your project is sync'd by running "scout9 sync" or you are using the correct persona id`);
    }
    this.context.agent = this.persona;
    this._loaded = true;
  }

  /**
   * Teardown the test environment
   */
  teardown() {
    this._loaded = false;
    this._api = null;
    this._project = null;
    this._app = null;
  }

  /**
   * Send a message as a customer to your app
   * @param {string} message - message to send
   * @param {import('@scout9/app/spirits').StatusCallback | boolean} [progress] - progress callback, if true, will log progress, can override with your own callback. If not provided, no logs will be added.
   * @returns {Promise<import('@scout9/app/spirits').ConversationEvent>}
   */
  async send(message, progress = this.#defaultLog) {
    if (!this._loaded) {
      await this.load();
    }

    const defaultProgressLogger = (message, level = 'info', type = '') => {
      const typeStdout = type ? italic(bgWhite(' ' + black(type) + ' ')) : '';
      const messageStdout = grey(message);
      (console.hasOwnProperty(level) ? console[level] : console.log)(`\t${typeStdout ? typeStdout + ' ' : ''}${messageStdout}`);
    };

    // If custom logger provided, use it, otherwise use default logger
    let progressInput = typeof progress === 'function' ? progress : defaultProgressLogger;

    // If progress turned off, use a no-op function
    if (typeof progress === 'boolean') {
      if (!!progress) {
        progressInput = defaultProgressLogger; // use default logger
      } else {
        progressInput = () => {
        }; // use no-op
      }
    }

    /**
     * @type {import('@scout9/app').Message}
     */
    const _message = {
      id: 'user_mock_' + Math.random().toString(36).slice(2, 11),
      role: 'customer',
      content: message,
      time: new Date().toISOString()
    };
    this.messages.push(_message);
    const result = await Spirits.customer({
      customer: this.customer,
      config: this._project,
      parser: async (_msg, _lng) => {
        // @TODO can't do this for HUGE data sets
        const detectableEntities = this._project.entities.filter(e => e.training?.length > 0 && e.definitions?.length > 0);
        return this._api.parse({
          message: _msg,
          language: _lng,
          entities: detectableEntities
        }).then((_res => _res.data));
      },
      workflow: async (event) => {
        globalThis.SCOUT9 = {
          ...event,
          $convo: this.conversation.$id
        }
        return this._app(event);
      },
      generator: (request) => {
        return this._api.generate(request).then((_res => _res.data));
      },
      idGenerator: (prefix) => prefix + '_' + Math.random().toString(36).slice(2, 11),
      progress: progressInput,
      message: _message,
      context: this.context,
      messages: this.messages,
      conversation: this.conversation
    });

    this.context = result.context.after;
    this.messages = result.messages.after;
    this.conversation = result.conversation.after;

    if (!!result.conversation.forward) {
      // @TODO migrate this
      if (typeof result.conversation.forward === 'string') {
        this.conversation.forwardedTo = result.conversation.forward;
      } else if (result.conversation.forward === true) {
        this.conversation.forwardedTo = this.persona.forwardPhone || this.persona.forwardEmail || 'No Forward';
      } else if (!!result.conversation.forward?.to) {
        this.conversation.forwardedTo = result.conversation.forward.to;
      } else {
        console.error(`Invalid forward result`, result.conversation.forward);
        this.conversation.forwardedTo = 'Invalid Forward';
      }
      this.conversation.forwarded = new Date().toISOString();
      this.conversation.forwardNote = result.conversation.forwardNote || '';
      this.conversation.locked = true;
      this.conversation.lockedReason = result.conversation.forwardNote ?? ('Forwarded to ' + this.conversation.forwardedTo);
    }

    if (!result.messages.after.find(m => m.id === result.message.after.id)) {
      console.error(`Message not found in result.messages.after`, result.message.after.id);
    }

    return result;
  }

  /**
   * Parse user message
   * @param {string} message - message string to parse
   * @param {string} [language] - language to parse in, defaults to "en" for english
   * @returns {Promise<import('@scout9/admin').ParseResponse>}
   */
  async parse(message, language = 'en') {
    if (!this._project) {
      throw new Error(`Config is not defined`);
    }
    return this._api.parse({
      message,
      language,
      entities: this._project.entities
    }).then((_res => _res.data));
  }

  /**
   * Runs your local app workflow
   * @param {string} message - the message to run through the workflow
   * @param {Omit<Partial<import('@scout9/app').WorkflowEvent>, 'message'> | undefined} [event] - additional event data
   * @returns {Promise<import('@scout9/app').WorkflowResponse>}
   */
  async workflow(message, event = {}) {
    if (!this._app) {
      throw new Error(`Workflow function is not loaded or found - make sure to run ".load()" before calling ".workflow()"`);
    }
    if (event.hasOwnProperty('message')) {
      console.warn(`WARNING: inserting a "event.message" will overwrite your "message" argument`);
    }
    return this._app({
      ...createMockWorkflowEvent(message),
      ...event
    });
  }

  /**
   * Generate a response to the user from the given or registered persona's voice in relation to the current conversation's context.
   * @param {Object} [input] - Generation input, defaults to test registered data such as existing messages, context, and persona information.
   * @param {string} [input.personaId] - Persona ID to use, defaults to test registered persona id.
   * @param {Partial<import('@scout9/admin').ConversationCreateRequest>} [input.conversation] - Conversation overrides, defaults to test registered conversation data.
   * @param {import('@scout9/app').Message[]} [input.messages] - Message overrides, defaults to test registered message data.
   * @param {any} [input.context] - Context overrides, defaults to test registered context data.
   * @returns {Promise<import('@scout9/admin').GenerateResponse>}
   */
  async generate({personaId = this._personaId, conversation = {}, messages = this.messages, context = this.context}) {
    if (!this._api) {
      throw new Error(`Scout9 API is not loaded or found - make sure to run ".load()" before calling ".generate()"`);
    }
    if (!this._project) {
      throw new Error(`Config is not defined - make sure to run ".load()" before calling ".generate()"`);
    }
    const persona = (this._project.persona || this._project.agents).find(p => p.id === personaId);
    if (!persona) {
      throw new Error(`Could not find persona with id: ${personaId}, ensure your project is sync'd by running "scout9 sync"`);
    }
    return this._api.generate({
      convo: {
        $customer: this.customer.id,
        environment: this.conversation.environment,
        initialContexts: this.conversation.initialContexts || [],
        ...conversation,
        $agent: persona
      },
      messages,
      context,
      persona,
      llm: this._project.llm,
      pmt: this._project.pmt
    }).then((_res => _res.data));
  }

  /**
   * @param {Partial<import('@scout9/app').ConversationContext>} ctx
   */
  set context(ctx) {
    this.context = {
      ...this.context,
      ...ctx
    };
  }

  /**
   * @private
   */
  async _loadApp() {
    const paths = globSync(`${this._src}/app.{ts,cjs,mjs,js}`, {cwd: this._cwd, absolute: true});
    if (paths.length === 0) {
      throw new Error(`Missing main project entry file ${this._src}/app.{js|ts|cjs|mjs}`);
    } else if (paths.length > 1) {
      throw new Error(`Multiple main project entry files found ${this._src}/app.{js|ts|cjs|mjs}`);
    }
    const [appFilePath] = paths;
    return requireProjectFile(appFilePath)
      .then(mod => mod.default);
  }

}
