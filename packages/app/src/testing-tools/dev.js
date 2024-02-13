import {Configuration, Scout9Api} from '@scout9/admin';
import {createMockConversation} from './mocks.js';
import {loadConfig} from '../core/config/index.js';
import {requireProjectFile} from '../utils/index.js';
import {globSync} from 'glob';

/**
 * @typedef {Object} Document
 * @property {string} id
 */


/**
 * Represents a change with before and after states of a given type.
 * @template Type The type of the before and after properties.
 * @typedef {Object} Change
 * @property {Type} before - The state before the change.
 * @property {Type} after - The state after the change.
 */

/**
 * @typedef {Object} ConversationData
 * @property {import('@scout9/app').Scout9ProjectBuildConfig} config - used to define generation and extract persona metadata
 * @property {import('@scout9/app').Conversation} conversation
 * @property {Array<import('@scout9/app').Message>} messages
 * @property {import('@scout9/app').Message} message - the message sent by the customer (should exist in messages)
 * @property {import('@scout9/app').Customer} customer
 * @property {any} context
 */

/**
 * @typedef {Object} ParseOutput
 * @property {Array<import('@scout9/app').Message>} messages
 * @property {import('@scout9/app').Conversation} conversation
 * @property {import('@scout9/app').Message} message
 * @property {any} context
 */

/**
 * @typedef {Object} WorkflowOutput
 * @property {Array<import('@scout9/app').WorkflowResponseSlot>} slots
 * @property {Array<import('@scout9/app').Message>} messages
 * @property {import('@scout9/app').Conversation} conversation
 * @property {any} context
 */

/**
 * @typedef {Object} GenerateOutput
 * @property {import('@scout9/admin').GenerateResponse | undefined} generate
 * @property {Array<import('@scout9/app').Message>} messages
 * @property {import('@scout9/app').Conversation} conversation
 * @property {any} context
 */

/**
 * @callback ParseFun
 * @param {string} message - message to send
 * @param {string | undefined} language - language to parse in, defaults to "en" for english
 * @returns {Promise<import('@scout9/admin').ParseResponse>}
 */

/**
 * @callback WorkflowFun
 * @param {import('@scout9/app').WorkflowEvent} event - conversation data
 * @returns {Promise<import('@scout9/app').WorkflowResponse>}
 */

/**
 * @callback GenerateFun
 * @param {import('@scout9/admin').GenerateRequest} data - data to generate from
 * @returns {Promise<import('@scout9/admin').GenerateResponse>}
 */

/**
 * @callback IdGeneratorFun
 * @param {import('@scout9/app').Message.role} prefix
 * @returns {string}
 */
/**
 * @callback statusCallback
 * @param {string} message
 * @param {'info' | 'warn' | 'error' | 'success' | undefined} type
 * @returns {void}
 */

/**
 * @typedef {Object} CustomerSpiritCallbacks
 * @property {ParseFun} parser
 * @property {WorkflowFun} workflow
 * @property {GenerateFun} generator
 * @property {IdGeneratorFun} idGenerator
 * @property {statusCallback | undefined} progress
 */

/**
 * @typedef {Object} ConversationEvent
 * @property {Change<import('@scout9/app').Conversation> & {forwardNote?: string; forward?: import('@scout9/app').WorkflowResponseSlot['forward']}} conversation
 * @property {Change<Array<import('@scout9/app').Message>>} messages
 * @property {Change<Object>} context
 * @property {Change<import('@scout9/app').Message>} message
 */
export const Spirits = {

    /**
     * Customer message
     * @param {ConversationData & CustomerSpiritCallbacks} input
     * @returns {Promise<ConversationEvent>}
     */
    customer: async function (input) {
        const {
            customer,
            config,
            parser,
            workflow,
            generator,
            idGenerator,
            progress = (message, type) => {
            },
            message: messageBefore,
            context: contextBefore,
            messages: messagesBefore,
            conversation: conversationBefore
        } = input;
        let {conversation, messages, context, message} = input;

        // 0. Setup Helpers
        const updateMessages = (previousMessages, newMessages) => {
            return newMessages.reduce((accumulator, newMessage) => {
                const index = accumulator.findIndex(m => m.id === newMessage.id);
                if (index > -1) {
                    accumulator[index] = newMessage;
                } else {
                    accumulator.push(newMessage);
                }
                return accumulator;
            }, [...previousMessages]);
        }

        const updateConversation = (previousConversation, newConversation) => {
            return {
                ...previousConversation,
                ...newConversation
            };
        }

        const updateContext = (previousContext, newContext) => {
            return {
                ...previousContext,
                ...newContext
            };
        }

        const userMessages = (_messages) => {
            return _messages.filter(m => m.role === 'customer' || m.role === 'user')
        }

        const recentUserMessage = (_messages) => {
            const _userMessages = userMessages(_messages);
            return _userMessages[_userMessages.length - 1];
        }

        const getNoNewContext = (_messages) => {
            return Object.keys((recentUserMessage(_messages)?.context || {})).length === 0 || false;
        }

        const lockConversation = (_conversation) => {
            return updateConversation(_conversation, {locked: true});
        }

        const incrementLockAttempt = (_conversation, _config) => {
            if (typeof _conversation.lockAttempts !== 'number') {
                _conversation.lockAttempts = 0;
            }
            _conversation.lockAttempts++;
            if (_conversation.lockAttempts > (_config?.maxLockAttempts || 3)) {
                _conversation.locked = true;
            }
            return _conversation;
        }

        const _addInstruction = (
            instruction,
            _messages,
            _conversation,
            _config,
            previousLockAttempt,
            id
        ) => {
            const systemMessages = _messages.filter(m => m.role === 'system');
            const lastSystemMessage = systemMessages[systemMessages.length - 1];

            // If instruction does not equal previous system message, add it, otherwise lock attempt
            if (!lastSystemMessage || instruction !== lastSystemMessage.content) {
                _messages.push({
                    id,
                    role: 'system',
                    content: instruction,
                    time: new Date().toISOString()
                });
            } else {
                // Handle repeated instruction
                // Increment lock attempt if instructions are repeated and we haven't already incremented lock attempt (for example if a forward is provided)
                if (previousLockAttempt === (this.conversation.lockAttempts || 0)) {
                    _conversation = incrementLockAttempt(_conversation, _config);
                }
            }
            return {
                conversation: _conversation,
                messages: _messages
            }
        }

        const addInstruction = (instruction, previousLockAttempt, id = idGenerator('sys')) => {
            const {
                conversation: newConversation,
                messages: newMessages
            } = _addInstruction(instruction, messages, conversation, config, previousLockAttempt, id);
            conversation = newConversation;
            messages = newMessages;
        }

        // 1. Check inputs
        if (!conversation.$agent) {
            throw new Error(`No agent found in conversation, must define ".$agent" in the conversation`);
        }
        const persona = (config.persona || config.agents).find(p => p.id === conversation.$agent);
        if (!persona) {
            throw new Error(`No persona found ("${conversation.$agent}") in provided config`);
        }
        if (!messages.every(m => !!m.id)) {
            throw new Error(`Every message must have an ".id", ensure all messages have an id assigned before running`);
        }
        if (!messages.every(m => m.role === 'customer' || m.role === 'agent' || m.role === 'system')) {
            const invalidRoles = messages.filter(m => m.role !== 'customer' && m.role !== 'agent' && m.role !== 'system');
            throw new Error(`Every message must have a role of "customer", "agent", or "system". Got invalid roles: ${invalidRoles.map(m => m.role).join(', ')}`);
        }
        // if message is not in messages, then add it
        if (!messages.find(m => m.id === input.message.id)) {
            messages.push(input.message);
        }

        // 2. Parse the message
        progress('Parsing message', 'info');
        const parsePayload = await parser(message.content, 'en');
        progress('Parsed message', 'success');
        message.intent = parsePayload.intent;
        message.intentScore = parsePayload.intentScore;
        message.context = parsePayload.context;
        const index = this.messages.findIndex(m => m.content === message);
        if (index === -1) {
            message = {
                id: idGenerator('customer'),
                role: 'customer',
                content: message,
                context: parsePayload.context,
                time: new Date().toISOString(),
                intent: parsePayload.intent,
                intentScore: parsePayload.intentScore
            };
            messages.push(message);
        } else {
            messages[index].context = parsePayload.context;
            messages[index].intent = parsePayload.intent;
            messages[index].intentScore = parsePayload.intentScore;
            message = messages[index];
        }
        // If this is the first user message, then update conversations intent
        const previousUserMessages = messages.filter(m => m.role === 'customer' && m.content !== message.content);
        if (!conversation.intent || previousUserMessages.length === 0) {
            conversation.intent = parsePayload.intent;
            conversation.intentScore = parsePayload.intentScore;
        }
        const oldKeyCount = Object.keys(context).length;
        context = updateContext(context, parsePayload.context);
        const newKeyCount = Object.keys(context).length;

        if (!conversation.locked && (newKeyCount > oldKeyCount)) {
            // Reset lock attempts
            conversation.locked = false;
            conversation.lockAttempts = 0;
        }

        const noNewContext = Object.keys(parsePayload.context).length === 0;

        // 3. Run the workflow
        progress('Running workflow', 'info');
        const slots = await workflow({
            messages,
            conversation,
            context,
            message,
            agent: persona,
            customer,
            intent: {
                current: recentUserMessage(messages)?.intent || null,
                flow: messages.map(m => m.intent).filter(Boolean),
                initial: conversation.intent || null
            },
            stagnationCount: conversation.lockAttempts || 0
        }).then((res) => Array.isArray(res) ? res : [res]);
        progress('Ran workflow', 'success');
        const hasNoInstructions = slots.every(s => !s.instructions || (Array.isArray(s) && s.instructions.length === 0));
        const previousLockAttempt = conversation.lockAttempts || 0; // Used to track

        if (hasNoInstructions && noNewContext) {
            conversation = incrementLockAttempt(conversation, config);
        } else {
            conversation.lockAttempts = 0;
            conversation.locked = false;
        }

        let resettedIntent = false;
        let _forward;
        let _forwardNote
        for (const {
            forward,
            forwardNote,
            instructions,
            removeInstructions,
            message: manualMessage,
            scheduled,
            resetIntent,
            secondsDelay,
            contextUpsert
        } of slots) {

            // Forward to agent or other agent
            if (forward) {
                conversation = lockConversation(conversation);
                _forward = forward;
                _forwardNote = forwardNote;
                if (typeof forward === 'string') {
                    messages.push({
                        id: idGenerator('sys'),
                        role: 'system',
                        content: `forwarded to "${forward}"`,
                        time: new Date().toISOString()
                    });
                } else if (typeof forward === 'boolean') {
                    messages.push({
                        id: idGenerator('sys'),
                        role: 'system',
                        content: `forwarded to "${forward}"`,
                        time: new Date().toISOString()
                    });
                } else {
                    messages.push({
                        id: idGenerator('sys'),
                        role: 'system',
                        content: `forwarded to "${forward.to}" ${forward.mode ? ' (' + forward.mode + ')' : ''}`,
                        time: new Date().toISOString()
                    });
                }
            }

            // Insert instructions context
            if (instructions) {
                if (typeof instructions === 'string') {
                    addInstruction(instructions, previousLockAttempt)
                } else if (Array.isArray(instructions)) {
                    for (const instruction of instructions) {
                        if (typeof instruction === 'string') {
                            addInstruction(instruction, previousLockAttempt)
                        } else {
                            addInstruction(instruction.content, previousLockAttempt, instruction.id)
                        }
                    }
                } else if (typeof instructions === 'object' && 'content' in instructions && 'id' in instructions) {
                    addInstruction(instructions.content, previousLockAttempt, instructions.id)
                } else {
                    throw new Error('instructions must be a string or array or {content: "", id: ""}');
                }
            }


            // Remove messages that have the given ids
            if (removeInstructions) {
                for (const instructionId of removeInstructions) {
                    const index = messages.findIndex(m => m.id === instructionId);
                    if (index > -1) {
                        messages.splice(index, 1);
                    } else {
                        console.log('instruction not found', instructionId);
                    }
                }
            }

            if (manualMessage) {
                let manualMessageObj = {
                    id: idGenerator('agent'),
                    role: 'agent',
                    content: message,
                    time: new Date().toISOString()
                };
                if (scheduled) {
                    manualMessageObj.time = new Date(scheduled * 1000).toISOString();
                    manualMessageObj.scheduled = manualMessage.time;
                } else if (secondsDelay) {
                    const now = new Date();
                    now.setSeconds(now.getSeconds() + secondsDelay);
                    manualMessageObj.time = now.toISOString();
                    manualMessageObj.delayInSeconds = secondsDelay;
                }
                messages.push(manualMessageObj);
            }

            if (contextUpsert) {
                context = updateContext(context, contextUpsert);
            }

            if (resetIntent) {
                resettedIntent = true;
            }

        }

        if (resettedIntent && !_forward) {
            conversation.intent = null;
            conversation.intentScore = null;
            conversation.locked = false;
            conversation.lockAttempts = 0;
        }


        // 4. Generate response
        if (!conversation.locked) {
            try {
                progress('Generating response', 'info');
                const generatorPayload = await generator({
                    messages,
                    persona,
                    context,
                    llm: config.llm,
                    pmt: config.pmt,
                });
                progress('Generated response', 'success');
                // Check if already had message
                const agentMessages = this.messages.filter(m => m.role === 'agent');
                const lastAgentMessage = agentMessages[agentMessages.length - 1];
                if (lastAgentMessage && lastAgentMessage.content === generatorPayload.message) {
                    conversation = lockConversation(conversation);
                } else {
                    messages.push({
                        id: idGenerator('agent'),
                        role: 'agent',
                        content: generatorPayload.message,
                        time: new Date().toISOString()
                    });
                }
            } catch (e) {
                progress(`Error generating response: ${e.message}`, 'error');
                console.error(`Locking conversation, error generating response: ${e.message}`);
                conversation = lockConversation(conversation);
            }
        }

        return {
            conversation: {
                before: conversationBefore,
                after: conversation,
                forward: _forward || null,
                forwardNote: _forwardNote || ''
            },
            messages: {
                before: messagesBefore,
                after: messages
            },
            message: {
                before: messageBefore,
                after: parse.message
            },
            context: {
                before: contextBefore,
                after: context
            }
        }
    }
}


export class Scout9Test {

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
                id: 'mock_customer_' + Math.random().toString(36).substr(2, 9),
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
     * Send a message as a customer to your app
     * @param {string} message - message to send
     * @returns {Promise<ConversationEvent>}
     */
    async send(message) {
        if (!this._loaded) {
            await this.load();
        }
        const _message = {
            id: 'user_mock_' + Math.random().toString(36).substr(2, 9),
            role: 'customer',
            content: message,
            time: new Date().toISOString(),
        };
        this.messages.push(_message);
        const result = await Spirits.customer({
            customer: this.customer,
            config: this._config,
            parser: async (_msg, _lng) => {
                return this._scout9.parse({
                    message: _msg,
                    language: _lng,
                }).then((_res => _res.data));
            },
            workflow: async (event) => {
                return this._workflowFn(event)
            },
            generator: (request) => {
                return this._scout9.generate(request).then((_res => _res.data));
            },
            idGenerator: (prefix) => prefix + '_' + Math.random().toString(36).substr(2, 9),
            message: _message,
            context: this.context,
            messages: this.messages,
            conversation: this.conversation
        });

        this.context = result.context.after;
        this.messages = result.messages.after;
        this.conversation = result.conversation.after;

        return result;
    }

    // /**
    //  * Parse user message in relation to the conversation
    //  * @deprecated - use send
    //  * @param {string} message - message to send
    //  * @param {string | undefined} language - language to parse in, defaults to "en" for english
    //  * @returns {Promise<ParseOutput>}
    //  */
    // async parse(message, language = 'en') {
    //     if (!this._loaded) {
    //         await this.load();
    //     }
    //     /**
    //      * @type {import('@scout9/app').Message | undefined}
    //      */
    //     let _message;
    //     const parsePayload = await this._scout9.parse({
    //         message,
    //         language,
    //         entities: this._config.entities
    //     }).then((_res => _res.data));
    //     const index = this.messages.findIndex(m => m.content === message);
    //     if (index === -1) {
    //         _message = {
    //             id: 'user_mock_' + Math.random().toString(36).substr(2, 9),
    //             role: 'customer',
    //             content: message,
    //             context: parsePayload.context,
    //             time: new Date().toISOString(),
    //             intent: parsePayload.intent,
    //             intentScore: parsePayload.intentScore
    //         };
    //         this.messages.push(_message);
    //     } else {
    //         this.messages[index].context = parsePayload.context;
    //         this.messages[index].intent = parsePayload.intent;
    //         this.messages[index].intentScore = parsePayload.intentScore;
    //         _message = this.messages[index];
    //     }
    //     // If this is the first user message, then update conversations intent
    //     const previousUserMessages = this.messages.filter(m => m.role === 'customer' && m.content !== message);
    //     if (!this.conversation.intent || previousUserMessages.length === 0) {
    //         this.conversation.intent = parsePayload.intent;
    //         this.conversation.intentScore = parsePayload.intentScore;
    //     }
    //
    //     const oldKeyCount = Object.keys(this.context).length;
    //     this.context = {
    //         ...this.context,
    //         ...parsePayload.context
    //     };
    //     const newKeyCount = Object.keys(this.context).length;
    //
    //     if (newKeyCount > oldKeyCount) {
    //         this.conversation.locked = false;
    //         this.conversation.lockAttempts = 0;
    //     }
    //
    //     return {
    //         context: this.context,
    //         messages: this.messages,
    //         conversation: this.conversation,
    //         message: _message,
    //     }
    // }

    // /**
    //  * Run the workflow (the app)
    //  * @deprecated - use send
    //  * @returns {Promise<{slots: *, context: (*|{}), messages: [], conversation: Conversation}>}
    //  */
    // async workflow() {
    //     if (!this._loaded) {
    //         await this.load();
    //     }
    //     const slots = await this._workflowFn({
    //         messages: this.messages,
    //         conversation: this.conversation,
    //         context: this.context,
    //         message: this.messages[this.messages.length - 1],
    //         agent: this.persona,
    //         customer: this.customer,
    //         intent: {
    //             current: this._recentUserMessage?.intent || null,
    //             flow: this.messages.map(m => m.intent).filter(Boolean),
    //             initial: this.conversation.intent || null
    //         },
    //         stagnationCount: this.conversation?.lockAttempts || 0
    //     }).then((res => Array.isArray(res) ? res : [res]));
    //     const hasNoInstructions = slots.every(s => !s.instructions || (Array.isArray(s) && s.instructions.length === 0));
    //     const previousLockAttempt = this.conversation.lockAttempts || 0; // Used to track
    //
    //     if (hasNoInstructions && this._noNewContext) {
    //         await this._incrementLockAttempt();
    //     } else {
    //         this.conversation.lockAttempts = 0;
    //         this.conversation.locked = false;
    //     }
    //
    //     for (const {
    //         forward,
    //         instructions,
    //         removeInstructions,
    //         message,
    //         scheduled,
    //         resetIntent,
    //         secondsDelay,
    //         contextUpsert
    //     } of slots) {
    //         // Forward to agent or other agent
    //         if (forward) {
    //             await this._lockConversation();
    //             if (typeof forward === 'string') {
    //                 this.messages.push({
    //                     id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
    //                     role: 'system',
    //                     content: `forwarded to "${forward}"`,
    //                     time: new Date().toISOString()
    //                 });
    //             } else if (typeof forward === 'boolean') {
    //                 this.messages.push({
    //                     id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
    //                     role: 'system',
    //                     content: `forwarded to "${forward}"`,
    //                     time: new Date().toISOString()
    //                 });
    //             } else {
    //                 this.messages.push({
    //                     id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
    //                     role: 'system',
    //                     content: `forwarded to "${forward.to}" ${forward.mode ? ' (' + forward.mode + ')' : ''}`,
    //                     time: new Date().toISOString()
    //                 });
    //             }
    //         }
    //
    //         // Insert instructions context
    //         if (instructions) {
    //             if (typeof instructions === 'string') {
    //                 await this._addInstruction(instructions, previousLockAttempt);
    //             } else if (Array.isArray(instructions)) {
    //                 for (const instruction of instructions) {
    //                     if (typeof instruction === 'string') {
    //                         await this._addInstruction(instruction, previousLockAttempt);
    //                     } else {
    //                         await this._addInstruction(instruction.content, previousLockAttempt, instruction.id);
    //                     }
    //                 }
    //             } else if (typeof instructions === 'object' && 'content' in instructions && 'id' in instructions) {
    //                 await this._addInstruction(instructions.content, previousLockAttempt, instructions.id);
    //             } else {
    //                 throw new Error('instructions must be a string or array or {content: "", id: ""}');
    //             }
    //         }
    //
    //         // Remove messages that have the given ids
    //         if (removeInstructions) {
    //             for (const instructionId of removeInstructions) {
    //                 const index = this.messages.findIndex(m => m.id === instructionId);
    //                 if (index > -1) {
    //                     this.messages.splice(index, 1);
    //                 }
    //                 // else {
    //                 //   console.log('instruction not found', instructionId);
    //                 // }
    //             }
    //         }
    //
    //         if (message) {
    //             const manualMessage = {
    //                 id: 'agent_mock_' + Math.random().toString(36).substr(2, 9), // 'agent_mock_'
    //                 role: 'agent',
    //                 content: message,
    //                 time: new Date().toISOString()
    //             };
    //             if (scheduled) {
    //                 manualMessage.time = new Date(scheduled * 1000).toISOString();
    //             } else if (secondsDelay) {
    //                 const now = new Date();
    //                 now.setSeconds(now.getSeconds() + secondsDelay);
    //                 manualMessage.time = now.toISOString();
    //             }
    //             this.messages.push(manualMessage);
    //         }
    //
    //         if (contextUpsert) {
    //             this.context = {...this.context, ...contextUpsert};
    //         }
    //
    //         if (resetIntent) {
    //             // setIntent('none');
    //             this.conversation.intent = null;
    //             this.conversation.intentScore = null;
    //         }
    //     }
    //
    //     return {
    //         context: this.context,
    //         messages: this.messages,
    //         conversation: this.conversation,
    //         slots
    //     }
    // }

    // /**
    //  * Generate a response to the user
    //  * @deprecated - use send
    //  * @returns {Promise<{context: (*|{}), messages: [], generate: T, conversation: Conversation}>}
    //  */
    // async generate() {
    //     if (!this._loaded) {
    //         await this.load();
    //     }
    //     let _generate;
    //     if (this.conversation.locked) {
    //         throw new Error('Conversation is locked, cannot generate a response');
    //     }
    //     try {
    //         const generatePayload = await this._scout9.generate({
    //             messages: this.messages,
    //             persona: this.persona,
    //             context: this.context,
    //             llm: this._config.llm,
    //             pmt: this._config.pmt
    //         }).then((_res => _res.data));
    //
    //         _generate = generatePayload;
    //
    //         // Check if already had message
    //         const agentMessages = this.messages.filter(m => m.role === 'agent');
    //         const lastAgentMessage = agentMessages[agentMessages.length - 1];
    //         if (lastAgentMessage && lastAgentMessage.content === generatePayload.message) {
    //             await this._lockConversation();
    //         } else {
    //             this.messages.push({
    //                 id: 'assistant_mock_' + Math.random().toString(36).substr(2, 9), // 'assistant_mock_'
    //                 role: 'agent',
    //                 content: generatePayload.message,
    //                 time: new Date().toISOString()
    //             });
    //         }
    //     } catch (e) {
    //         await this._lockConversation();
    //     }
    //     return {
    //         context: this.context,
    //         messages: this.messages,
    //         conversation: this.conversation,
    //         generate: _generate
    //     }
    // }


    get _noNewContext() {
        return Object.keys((this._recentUserMessage?.context || {})).length === 0 || false;
    }

    get _recentUserMessage() {
        const _userMessages = this._userMessages;
        return _userMessages[_userMessages.length - 1];
    }

    get _userMessages() {
        return this.messages.filter(m => m.role === 'customer' || m.role === 'user')
    }


    _lockConversation() {
        this.conversation.locked = true;
    };

    _incrementLockAttempt() {
        if (typeof this.conversation?.lockAttempts !== 'number') {
            this.conversation.lockAttempts = 0;
        }
        this.conversation.lockAttempts++;
        if (this.conversation.lockAttempts > 3) {
            this._lockConversation();
        }
    }

    /**
     * @param {string} instruction
     * @param {number} previousLockAttempt
     * @param {string} id
     * @private
     */
    _addInstruction(instruction, previousLockAttempt, id = 'sys_' + Math.random().toString(36).substr(2, 9)) {
        const systemMessages = this.messages.filter(m => m.role === 'system');
        const lastSystemMessage = systemMessages[systemMessages.length - 1];
        // If instruction does not equal previous system message, add it, otherwise lock attempt
        if (!lastSystemMessage || instruction !== lastSystemMessage.content) {
            this.messages.push({
                id,
                role: 'system',
                content: instruction,
                time: new Date().toISOString()
            });


        } else {
            // Handle repeated instruction
            // Increment lock attempt if instructions are repeated and we haven't already incremented lock attempt (for example if a forward is provided)
            if (previousLockAttempt === (this.conversation.lockAttempts || 0)) {
                this._incrementLockAttempt();
            }
        }
    };

}

/**
 * Mimics a customer message to your app (useful for testing)
 * @param {import('@scout9/app').WorkflowFunction} workflowFn
 * @param {import('@scout9/app').Customer | undefined} customer
 * @param {string} message to send
 * @param {any | undefined} context - prior conversation context
 * @param {string | undefined} persona id to use
 * @param {import('@scout9/app').Conversation | undefined} conversation - existing conversation
 * @param {import('@scout9/app').Message[] | undefined} messages - previous messages
 * @param {string} cwd
 * @param {string} src
 * @param {string} mode
 * @param {(message: string) => void} callback
 * @returns Promise<{
 *   messages: import('@scout9/app').Message[],
 *   conversation: import('@scout9/app').Conversation,
 *   context: any
 * }>
 */
// export async function mimicCustomerMessage(
//     {
//         workflowFn,
//         customer,
//         context,
//         message,
//         persona: personaId,
//         conversation,
//         messages,
//         cwd = process.cwd(),
//         src = 'src',
//         mode = 'production'
//     } = {},
//     callback = (msg) => {
//     }
// ) {
//     const config = await loadConfig({cwd, src, mode});
//     const configuration = new Configuration({apiKey: process.env.SCOUT9_API_KEY});
//     const scout9 = new Scout9Api(configuration);
//     // const config = await loadConfig({cwd, src, mode});
//     // const scout9 = Scout9Admin(process.env.SCOUT9_API_KEY);
//     if (!conversation) {
//         conversation = createMockConversation();
//     }
//     if (!messages) {
//         messages = [];
//     }
//     if (!message) {
//         throw new Error(`No .message found`);
//     }
//     if (!workflowFn) {
//         throw new Error(`No .workflowFn found`);
//     }
//     if (!personaId) {
//         personaId = (config.persona || config.agents)?.[0]?.id;
//         if (!personaId) {
//             throw new Error(`No persona found in config, please specify a persona id`);
//         }
//         conversation.$agent = personaId;
//     } else {
//         conversation.$agent = personaId;
//     }
//     if (!customer) {
//         customer = {
//             id: 'mock_customer_' + Math.random().toString(36).substr(2, 9),
//             name: 'Mock Customer',
//             firstName: 'Mock',
//             lastName: 'Customer'
//         };
//         conversation.$customer = customer.id;
//     } else {
//         conversation.$customer = customer.id;
//     }
//     if (!context) {
//         context = {};
//     }
//
//     // Parse the message
//     callback('Parsing message');
//     const parsePayload = await scout9.parse({
//         message,
//         language: 'en',
//         entities: config.entities
//     }).then((_res => _res.data));
//     callback('Parsing complete');
//
//     const persona = (config.persona || config.agents).find(p => p.id === personaId);
//     if (!persona) {
//         throw new Error(`Could not find persona with id: ${personaId}, ensure your project is sync'd by running "scout9 sync"`);
//     }
//     if (!messages.find(m => m.content === message)) {
//         messages.push({
//             id: 'user_mock_' + Math.random().toString(36).substr(2, 9),
//             role: 'customer',
//             content: message,
//             context: parsePayload.context,
//             time: new Date().toISOString(),
//             intent: parsePayload.intent,
//             intentScore: parsePayload.intentScore
//         });
//     }
//
//     // If this is the first user message, then update conversations intent
//     const previousUserMessages = messages.filter(m => m.role === 'customer' && m.content !== message);
//     if (!conversation.intent || previousUserMessages.length === 0) {
//         conversation.intent = parsePayload.intent;
//         conversation.intentScore = parsePayload.intentScore;
//     }
//
//     context = {
//         ...context,
//         ...parsePayload.context
//     };
//
//     const noNewContext = Object.keys(parsePayload.context).length === 0;
//
//     // Run workflow
//     callback('Running workflow');
//     const slots = await workflowFn({
//         messages,
//         conversation,
//         context,
//         message: messages[messages.length - 1],
//         agent: persona,
//         customer,
//         intent: {
//             current: parsePayload.intent || null,
//             flow: messages.map(m => m.intent).filter(Boolean),
//             initial: conversation.intent || null
//         },
//         stagnationCount: conversation?.lockAttempts || 0
//     }).then((res => Array.isArray(res) ? res : [res]));
//
//     const hasNoInstructions = slots.every(s => !s.instructions || (Array.isArray(s) && s.instructions.length === 0));
//     const previousLockAttempt = conversation.lockAttempts || 0; // Used to track
//     const lockConversation = () => {
//         callback('Conversation locked');
//         conversation.locked = true;
//     };
//     const incrementLockAttempt = () => {
//         if (typeof conversation?.lockAttempts !== 'number') {
//             conversation.lockAttempts = 0;
//         }
//         conversation.lockAttempts++;
//         if (conversation.lockAttempts > 3) {
//             lockConversation();
//         }
//     };
//     const addInstruction = (instruction) => {
//         const systemMessages = messages.filter(m => m.role === 'system');
//         const lastSystemMessage = systemMessages[systemMessages.length - 1];
//         if (messages.filter(m => m.role === 'system' && m.content === instruction).length === 0) {
//             // Add instructions to messages
//             messages.push({
//                 id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
//                 role: 'system',
//                 content: instruction,
//                 time: new Date().toISOString()
//             });
//         } else {
//             // Handle repeated instruction
//
//             // Increment lock attempt if instructions are repeated and we haven't already incremented lock attempt (for example if a forward is provided)
//             if (previousLockAttempt === (conversation.lockAttempts || 0)) {
//                 incrementLockAttempt();
//             }
//
//             // if (lastSystemMessage.content !== 'Attempt to continue conversation.') {
//             //   input.messages.push({
//             //     $id: Geneseed.utils.tokens.generate('sys'),
//             //     role: 'system',
//             //     content: 'Attempt to continue conversation.',
//             //     time: new Date().toISOString()
//             //   });
//             //   dispatch({type: 'ADD_MESSAGE', payload: input.messages[input.messages.length - 1]});
//             // }
//         }
//     };
//
//     if (hasNoInstructions && noNewContext) {
//         await incrementLockAttempt();
//     }
//
//     for (const {
//         forward,
//         instructions,
//         removeInstructions,
//         message,
//         scheduled,
//         resetIntent,
//         secondsDelay,
//         contextUpsert
//     } of slots) {
//
//         // Forward to agent or other agent
//         if (forward) {
//             await lockConversation();
//             if (typeof forward === 'string') {
//                 messages.push({
//                     id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
//                     role: 'system',
//                     content: `forwarded to "${forward}"`,
//                     time: new Date().toISOString()
//                 });
//             } else if (typeof forward === 'boolean') {
//                 messages.push({
//                     id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
//                     role: 'system',
//                     content: `forwarded to "${forward}"`,
//                     time: new Date().toISOString()
//                 });
//             } else {
//                 messages.push({
//                     id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
//                     role: 'system',
//                     content: `forwarded to "${forward.to}" ${forward.mode ? ' (' + forward.mode + ')' : ''}`,
//                     time: new Date().toISOString()
//                 });
//             }
//         }
//
//         // Insert instructions context
//         if (instructions) {
//             if (typeof instructions === 'string') {
//                 await addInstruction(instructions);
//             } else if (Array.isArray(instructions)) {
//                 for (const instruction of instructions) {
//                     if (typeof instruction === 'string') {
//                         await addInstruction(instruction);
//                     } else {
//                         await addInstruction(instruction.content);
//                     }
//                 }
//             } else if (typeof instructions === 'object' && 'content' in instructions && 'id' in instructions) {
//                 throw new Error('Implement me');
//             } else {
//                 throw new Error('instructions must be a string or array or {content: "", id: ""}');
//             }
//         }
//
//         // Remove messages that have the given ids
//         if (removeInstructions) {
//             for (const instructionId of removeInstructions) {
//                 const index = messages.findIndex(m => m.id === instructionId);
//                 if (index > -1) {
//                     messages.splice(index, 1);
//                 } else {
//                     console.log('instruction not found', instructionId);
//                 }
//             }
//         }
//
//         if (message) {
//             const manualMessage = {
//                 id: 'agent_mock_' + Math.random().toString(36).substr(2, 9), // 'agent_mock_'
//                 role: 'agent',
//                 content: message,
//                 time: new Date().toISOString()
//             };
//             if (scheduled) {
//                 manualMessage.time = new Date(scheduled * 1000).toISOString();
//             } else if (secondsDelay) {
//                 const now = new Date();
//                 now.setSeconds(now.getSeconds() + secondsDelay);
//                 manualMessage.time = now.toISOString();
//             }
//             messages.push(manualMessage);
//         }
//
//         if (contextUpsert) {
//             context = {...context, ...contextUpsert};
//         }
//
//         if (resetIntent) {
//             // setIntent('none');
//             conversation.intent = null;
//             conversation.intentScore = null;
//         }
//     }
//
//     // Generate a response
//     if (!conversation.locked) {
//         try {
//             callback('Generating message...');
//             const generatePayload = await scout9.generate({
//                 messages,
//                 persona,
//                 context,
//                 llm: config.llm,
//                 pmt: config.pmt
//             }).then((_res => _res.data));
//             callback('Message generated');
//
//             // Check if already had message
//             const lastAgentMessage = messages.filter(m => m.role === 'agent')[0];
//             if (lastAgentMessage && lastAgentMessage.content === generatePayload.message) {
//                 await lockConversation();
//             } else {
//                 messages.push({
//                     id: 'assistant_mock_' + Math.random().toString(36).substr(2, 9), // 'assistant_mock_'
//                     role: 'agent',
//                     content: generatePayload.message,
//                     time: new Date().toISOString()
//                 });
//             }
//         } catch (e) {
//             await lockConversation();
//         }
//     }
//
//     return {
//         messages,
//         conversation,
//         context
//     };
// }
