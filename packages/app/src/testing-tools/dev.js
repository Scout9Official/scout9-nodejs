import { Configuration, Scout9Api } from '@scout9/admin';
import { createMockConversation, createMockWorkflowEvent } from './mocks.js';
import { loadConfig } from '../core/config/index.js';
import { requireProjectFile } from '../utils/index.js';
import { globSync } from 'glob';

export * from './spirits.js';

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
   * @type {any}
   */
  context;

  /**
   * @private
   * @type {import('scout9/app').Scout9ProjectBuildConfig | null}
   */
  _config = null;

  /**
   * @private
   * @type {import('@scout9/app').WorkflowFunction | null}
   */
  _workflowFn = null;

  /**
   * @private
   * @type {import('@scout9/admin').Scout9Api | null}
   */
  _scout9 = null;

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
   * Mimics a customer message to your app (useful for testing)
   * @param {import('@scout9/app').Customer | undefined} customer
   * @param {any | undefined} context - prior conversation context
   * @param {string | undefined} persona id to use
   * @param {import('@scout9/app').Conversation | undefined} conversation - existing conversation
   * @param {string | undefined} cwd
   * @param {string | undefined} src
   * @param {string | undefined} mode
   */
  constructor(
    {
      persona,
      customer,
      context,
      cwd = process.cwd(),
      src = 'src',
      mode = 'production'
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
    this.conversation = createMockConversation();
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
  }

  async load() {
    const paths = globSync(`${this._src}/app.{ts,cjs,mjs,js}`, {cwd: this._cwd, absolute: true});
    if (paths.length === 0) {
      throw new Error(`Missing main project entry file ${this._src}/app.{js|ts|cjs|mjs}`);
    } else if (paths.length > 1) {
      throw new Error(`Multiple main project entry files found ${this._src}/app.{js|ts|cjs|mjs}`);
    }
    const [appFilePath] = paths;
    await requireProjectFile(appFilePath)
      .then(mod => {
        this._workflowFn = mod.default;
      });
    await loadConfig({cwd: this._cwd, src: this._src, mode: this._mode})
      .then((_config) => {
        this._config = _config;
        this._scout9 = new Scout9Api(new Configuration({apiKey: process.env.SCOUT9_API_KEY}));
        if (!this._personaId) {
          this._personaId = (this._config.persona || this._config.agents)?.[0]?.id;
          if (!this._personaId) {
            throw new Error(`No persona found in config, please specify a persona id`);
          }
        }
        this.conversation.$agent = this._personaId;
        this.persona = (this._config.persona || this._config.agents).find(p => p.id === this._personaId);
        this.context.agent = this.persona;
      });
    this._loaded = true;
  }

  /**
   * Teardown the test environment
   */
  teardown() {
    this._loaded = false;
    this._scout9 = null;
    this._config = null;
    this._workflowFn = null;
  }

  /**
   * Send a message as a customer to your app
   * @param {string} message - message to send
   * @returns {Promise<ConversationEvent>}
   */
  async send(message) {
    if (!this._loaded) {
      await this.load();
    }
    const _message = {
      id: 'user_mock_' + Math.random().toString(36).slice(2, 11),
      role: 'customer',
      content: message,
      time: new Date().toISOString()
    };
    this.messages.push(_message);
    const result = await Spirits.customer({
      customer: this.customer,
      config: this._config,
      parser: async (_msg, _lng) => {
        // @TODO can't do this for HUGE data sets
        const detectableEntities = this._config.entities.filter(e => e.training?.length > 0 && e.definitions?.length > 0);
        return this._scout9.parse({
          message: _msg,
          language: _lng,
          entities: detectableEntities
        }).then((_res => _res.data));
      },
      workflow: async (event) => {
        return this._workflowFn(event);
      },
      generator: (request) => {
        return this._scout9.generate(request).then((_res => _res.data));
      },
      idGenerator: (prefix) => prefix + '_' + Math.random().toString(36).slice(2, 11),
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
      this.conversation.forwarded = new Date().toString();
      this.conversation.locked = true;
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
    if (!this._config) {
      throw new Error(`Config is not defined`);
    }
    return this._scout9.parse({
      message,
      language,
      entities: this._config.entities
    }).then((_res => _res.data));
  }

  /**
   * Runs your local app workflow
   * @param {string} message - the message to run through the workflow
   * @param {Omit<Partial<import('@scout9/app').WorkflowEvent>, 'message'> | undefined} [event] - additional event data
   * @returns {Promise<import('@scout9/app').WorkflowResponse>}
   */
  async workflow(message, event = {}) {
    if (!this._workflowFn) {
      throw new Error(`Workflow function is not loaded or found - make sure to run ".load()" before calling ".workflow()"`);
    }
    if (event.hasOwnProperty('message')) {
      console.warn(`WARNING: inserting a "event.message" will overwrite your "message" argument`);
    }
    return this._workflowFn({
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
    if (!this._scout9) {
      throw new Error(`Scout9 API is not loaded or found - make sure to run ".load()" before calling ".generate()"`);
    }
    if (!this._config) {
      throw new Error(`Config is not defined - make sure to run ".load()" before calling ".generate()"`);
    }
    const persona = (this._config.persona || this._config.agents).find(p => p.id === personaId);
    if (!persona) {
      throw new Error(`Could not find persona with id: ${personaId}, ensure your project is sync'd by running "scout9 sync"`);
    }
    return this._scout9.generate({
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
      llm: this._config.llm,
      pmt: this._config.pmt
    }).then((_res => _res.data));
  }

}
