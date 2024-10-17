import { Configuration, Scout9Api } from '@scout9/admin';
import { grey, italic, bgWhite, black } from 'kleur/colors';
import { createMockConversation, createMockWorkflowEvent } from './mocks.js';
import { loadConfig } from '../core/config/index.js';
import { requireProjectFile } from '../utils/index.js';
import { globSync } from 'glob';

import { Spirits } from './spirits.js';
import { resolve } from 'node:path';
import { WorkflowResponseSchema } from '../runtime/index.js';

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

    #project = null;
    #app = null;
    #command = null;
    #api = null;
    #cwd;
    #src;
    #mode;
    #loaded;
    #personaId;
    #defaultLog;
    #commandId = null;


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
     * @param {string | null | undefined} [props.command] - if provided it will use the command runtime instead of the app runtime
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
            command = null,
            project,
            log = false
        } = {
            cwd: process.cwd(),
            src: 'src',
            mode: 'production'
        }
    ) {
        this.messages = [];
        this.#cwd = cwd;
        this.#src = src;
        this.#mode = mode;
        this.context = {...(context || {}), __no_cache: true};
        this.conversation = conversation;
        if (api) {
            this.#api = api;
        }
        if (app) {
            this.#app = app;
        }
        if (project) {
            this.#project = project;
        }
        if (command) {
            this.#commandId = command;
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
        this.#personaId = persona;
        this.#defaultLog = !!log;
    }

    /**
     * Loads the test environment
     * @param {boolean} [override] - defaults to false, if true, it will override the current loaded state such as the scout9 api, workflow function, and project config
     * @returns {Promise<void>}
     */
    async load(override = false) {

        // Load app (if not already loaded or override true)
        if (override || !this.#app) {
            this.#app = await this.#loadApp();
        }

        // Load app configuration (if not already loaded or override true)
        if (override || !this.#project) {
            this.#project = await loadConfig({cwd: this.#cwd, src: this.#src, mode: this.#mode});
        }

        if (this.#commandId) {
            if (override || !this.#commandId) {
                this.#command = await this.#loadCommand(this.#commandId);
            }
        }

        if (override || !this.#api) {
            this.#api = new Scout9Api(new Configuration({apiKey: process.env.SCOUT9_API_KEY}));
        }

        if (!this.#personaId) {
            this.#personaId = (this.#project.persona || this.#project.agents)?.[0]?.id;
            if (!this.#personaId) {
                throw new Error(`No persona found in config, please specify a persona id`);
            }
        }
        this.conversation.$agent = this.#personaId;
        this.persona = (this.#project.persona || this.#project.agents).find(p => p.id === this.#personaId);
        if (!this.persona) {
            throw new Error(`Could not find persona with id: ${this.#personaId}, ensure your project is sync'd by running "scout9 sync" or you are using the correct persona id`);
        }
        this.context.agent = this.persona;
        this.#loaded = true;
    }

    /**
     * Teardown the test environment
     */
    teardown() {
        this.#loaded = false;
        this.#api = null;
        this.#project = null;
        this.#app = null;
    }

    /**
     * Send a message as a customer to your app
     * @param {string} message - message to send
     * @param {import('@scout9/app/spirits').StatusCallback | boolean} [progress] - progress callback, if true, will log progress, can override with your own callback. If not provided, no logs will be added.
     * @returns {Promise<import('@scout9/app/spirits').ConversationEvent>}
     */
    async send(message, progress = this.#defaultLog) {
        if (!this.#loaded) {
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
            config: this.#project,
            parser: async (_msg, _lng) => {
                // @TODO can't do this for HUGE data sets
                const detectableEntities = this.#project.entities.filter(e => e.training?.length > 0 && e.definitions?.length > 0);
                return this.#api.parse({
                    message: _msg,
                    language: _lng,
                    entities: detectableEntities
                }).then((_res => _res.data));
            },
            workflow: async (event) => {
                globalThis.SCOUT9 = {
                    ...event,
                    $convo: this.conversation.$id ?? 'test_convo'
                };
                return (this.#command ? this.#command : this.#app)(event)
                    .then((response) => {
                        if ('toJSON' in response) {
                            return response.toJSON();
                        } else {
                            return response;
                        }
                    })
                    .then(WorkflowResponseSchema.parse);
            },
            generator: (request) => {
                return this.#api.generate(request).then((_res => _res.data));
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
        if (!this.#project) {
            throw new Error(`Config is not defined`);
        }
        return this.#api.parse({
            message,
            language,
            entities: this.#project.entities
        }).then((_res => _res.data));
    }

    /**
     * Runs your local app workflow
     * @param {string} message - the message to run through the workflow
     * @param {Omit<Partial<import('@scout9/app').WorkflowEvent>, 'message'> | undefined} [event] - additional event data
     * @returns {Promise<import('@scout9/app').WorkflowResponse>}
     */
    async workflow(message, event = {}) {
        if (!this.#app) {
            throw new Error(`Workflow function is not loaded or found - make sure to run ".load()" before calling ".workflow()"`);
        }
        if (event.hasOwnProperty('message')) {
            console.warn(`WARNING: inserting a "event.message" will overwrite your "message" argument`);
        }
        return this.#app({
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
    async generate({personaId = this.#personaId, conversation = {}, messages = this.messages, context = this.context}) {
        if (!this.#api) {
            throw new Error(`Scout9 API is not loaded or found - make sure to run ".load()" before calling ".generate()"`);
        }
        if (!this.#project) {
            throw new Error(`Config is not defined - make sure to run ".load()" before calling ".generate()"`);
        }
        const persona = (this.#project.persona || this.#project.agents).find(p => p.id === personaId);
        if (!persona) {
            throw new Error(`Could not find persona with id: ${personaId}, ensure your project is sync'd by running "scout9 sync"`);
        }
        return this.#api.generate({
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
            llm: this.#project.llm,
            pmt: this.#project.pmt
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

    async #loadApp() {
        const paths = globSync(`${this.#src}/app.{ts,cjs,mjs,js}`, {cwd: this.#cwd, absolute: true});
        if (paths.length === 0) {
            throw new Error(`Missing main project entry file ${this.#src}/app.{js|ts|cjs|mjs}`);
        } else if (paths.length > 1) {
            throw new Error(`Multiple main project entry files found ${this.#src}/app.{js|ts|cjs|mjs}`);
        }
        const [appFilePath] = paths;
        return requireProjectFile(appFilePath)
            .then(mod => mod.default);
    }

    /**
     * @param {string} command
     * @returns {Promise<void>}
     */
    async #loadCommand(command) {
        if (!this.#project) {
            throw new Error(`Must load #project before running #loadCommand`);
        }
        const commandsDir = resolve(this.#src, `./commands`);
        const commandConfig = this.#project.commands.find(command => command.entity === command || command.path === command);
        if (!commandConfig) {
            throw new Error(`Unable to find command "${command}"`);
        }
        const commandFilePath = resolve(commandsDir, commandConfig.path);
        let mod;
        try {
            mod = await import(commandFilePath);
        } catch (e) {
            throw new Error(`Unable to resolve command ${command} at ${commandFilePath}`);
        }

        if (!mod || !mod.default) {
            throw new Error(`Unable to run command ${command} at ${commandFilePath} - must return a default function that returns a WorkflowEvent payload`);
        }

        return mod.default;
    }


}
