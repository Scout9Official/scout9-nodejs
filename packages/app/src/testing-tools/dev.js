import { Configuration, Scout9Api } from '@scout9/admin';
import { createMockConversation } from './mocks.js';
import { loadConfig } from '../core/config/index.js';
import { requireProjectFile } from '../utils/index.js';
import { globSync } from 'glob';


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
  constructor({
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
  }) {
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
   * @returns {Promise<{context: (*|{}), messages: Array<import('@scout9/app').Message>, generate: import('@scout9/admin').GenerateResponse, conversation: import('@scout9/app').Conversation, slots: Array<import('@scout9/app').WorkflowResponseSlot>, message: import('@scout9/app').Message}>}
   */
  async send(message) {
    if (!this._loaded) {
      await this.load();
    }
    const parse = await this.parse(message);
    const workflow = await this.workflow();
    const generate = await this.generate();
    return {
     ...generate,
      message: parse.message,
      slots: workflow.slots
    };
  }

  /**
   * Parse user message in relation to the conversation
   * @param {string} message - message to send
   * @param {string | undefined} language
   * @returns {Promise<{context: (*|{}), messages: [], message: {intentScore: *, role: string, context, id: string, time: string, intent, content}, conversation: Conversation}>}
   */
  async parse(message, language = 'en') {
    if (!this._loaded) {
      await this.load();
    }
    let _message;
    const parsePayload = await this._scout9.parse({
      message,
      language,
      entities: this._config.entities
    }).then((_res => _res.data));
    if (!this.messages.find(m => m.content === message)) {
      _message =  {
        id: 'user_mock_' + Math.random().toString(36).substr(2, 9),
        role: 'customer',
        content: message,
        context: parsePayload.context,
        time: new Date().toISOString(),
        intent: parsePayload.intent,
        intentScore: parsePayload.intentScore
      };
      this.messages.push(_message);
    }
    // If this is the first user message, then update conversations intent
    const previousUserMessages = this.messages.filter(m => m.role === 'customer' && m.content !== message);
    if (!this.conversation.intent || previousUserMessages.length === 0) {
      this.conversation.intent = parsePayload.intent;
      this.conversation.intentScore = parsePayload.intentScore;
    }

    const oldKeyCount = Object.keys(this.context).length;
    this.context = {
      ...this.context,
      ...parsePayload.context
    };
    const newKeyCount = Object.keys(this.context).length;

    if (newKeyCount > oldKeyCount) {
      this.conversation.locked = false;
      this.conversation.lockAttempts = 0;
    }

    return {
      context: this.context,
      messages: this.messages,
      conversation: this.conversation,
      message: _message,
    }
  }

  /**
   * Run the workflow (the app)
   * @returns {Promise<{slots: *, context: (*|{}), messages: [], conversation: Conversation}>}
   */
  async workflow() {
    if (!this._loaded) {
      await this.load();
    }
    const slots = await this._workflowFn({
      messages: this.messages,
      conversation: this.conversation,
      context: this.context,
      message: this.messages[this.messages.length - 1],
      agent: this.persona,
      customer: this.customer,
      intent: {
        current: this._recentUserMessage?.intent || null,
        flow: this.messages.map(m => m.intent).filter(Boolean),
        initial: this.conversation.intent || null
      },
      stagnationCount: this.conversation?.lockAttempts || 0
    }).then((res => Array.isArray(res) ? res : [res]));
    const hasNoInstructions = slots.every(s => !s.instructions || (Array.isArray(s) && s.instructions.length === 0));
    const previousLockAttempt = this.conversation.lockAttempts || 0; // Used to track

    if (hasNoInstructions && this._noNewContext) {
      await this._incrementLockAttempt();
    } else {
      this.conversation.lockAttempts = 0;
      this.conversation.locked = false;
    }

    for (const {
      forward,
      instructions,
      removeInstructions,
      message,
      scheduled,
      resetIntent,
      secondsDelay,
      contextUpsert
    } of slots) {
      // Forward to agent or other agent
      if (forward) {
        await this._lockConversation();
        if (typeof forward === 'string') {
          this.messages.push({
            id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
            role: 'system',
            content: `forwarded to "${forward}"`,
            time: new Date().toISOString()
          });
        } else if (typeof forward === 'boolean') {
          this.messages.push({
            id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
            role: 'system',
            content: `forwarded to "${forward}"`,
            time: new Date().toISOString()
          });
        } else {
          this.messages.push({
            id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
            role: 'system',
            content: `forwarded to "${forward.to}" ${forward.mode ? ' (' + forward.mode + ')' : ''}`,
            time: new Date().toISOString()
          });
        }
      }

      // Insert instructions context
      if (instructions) {
        if (typeof instructions === 'string') {
          await this._addInstruction(instructions, previousLockAttempt);
        } else if (Array.isArray(instructions)) {
          for (const instruction of instructions) {
            if (typeof instruction === 'string') {
              await this._addInstruction(instruction, previousLockAttempt);
            } else {
              await this._addInstruction(instruction.content, previousLockAttempt, instruction.id);
            }
          }
        } else if (typeof instructions === 'object' && 'content' in instructions && 'id' in instructions) {
          await this._addInstruction(instructions.content, previousLockAttempt, instructions.id);
        } else {
          throw new Error('instructions must be a string or array or {content: "", id: ""}');
        }
      }

      // Remove messages that have the given ids
      if (removeInstructions) {
        for (const instructionId of removeInstructions) {
          const index = this.messages.findIndex(m => m.id === instructionId);
          if (index > -1) {
            this.messages.splice(index, 1);
          }
          // else {
          //   console.log('instruction not found', instructionId);
          // }
        }
      }

      if (message) {
        const manualMessage = {
          id: 'agent_mock_' + Math.random().toString(36).substr(2, 9), // 'agent_mock_'
          role: 'agent',
          content: message,
          time: new Date().toISOString()
        };
        if (scheduled) {
          manualMessage.time = new Date(scheduled * 1000).toISOString();
        } else if (secondsDelay) {
          const now = new Date();
          now.setSeconds(now.getSeconds() + secondsDelay);
          manualMessage.time = now.toISOString();
        }
        this.messages.push(manualMessage);
      }

      if (contextUpsert) {
        this.context = {...this.context, ...contextUpsert};
      }

      if (resetIntent) {
        // setIntent('none');
        this.conversation.intent = null;
        this.conversation.intentScore = null;
      }
    }

    return {
      context: this.context,
      messages: this.messages,
      conversation: this.conversation,
      slots
    }
  }

  /**
   * Generate a response to the user
   * @returns {Promise<{context: (*|{}), messages: [], generate: T, conversation: Conversation}>}
   */
  async generate() {
    if (!this._loaded) {
      await this.load();
    }
    let _generate;
    if (this.conversation.locked) {
      throw new Error('Conversation is locked, cannot generate a response');
    }
    try {
      const generatePayload = await this._scout9.generate({
        messages: this.messages,
        persona: this.persona,
        context: this.context,
        llm: this._config.llm,
        pmt: this._config.pmt
      }).then((_res => _res.data));

      _generate = generatePayload;

      // Check if already had message
      const lastAgentMessage = this.messages.filter(m => m.role === 'agent')[0];
      if (lastAgentMessage && lastAgentMessage.content === generatePayload.message) {
        await this._lockConversation();
      } else {
        this.messages.push({
          id: 'assistant_mock_' + Math.random().toString(36).substr(2, 9), // 'assistant_mock_'
          role: 'agent',
          content: generatePayload.message,
          time: new Date().toISOString()
        });
      }
    } catch (e) {
      await this._lockConversation();
    }
    return {
      context: this.context,
      messages: this.messages,
      conversation: this.conversation,
      generate: _generate
    }
  }

  // get _currentIntent() {
  //   return this._recentUserMessage?.intent || null;
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
export async function mimicCustomerMessage(
  {
    workflowFn,
    customer,
    context,
    message,
    persona: personaId,
    conversation,
    messages,
    cwd = process.cwd(),
    src = 'src',
    mode = 'production'
  } = {},
  callback = (msg) => {
  }
) {
  const config = await loadConfig({cwd, src, mode});
  const configuration = new Configuration({apiKey: process.env.SCOUT9_API_KEY});
  const scout9 = new Scout9Api(configuration);
  // const config = await loadConfig({cwd, src, mode});
  // const scout9 = Scout9Admin(process.env.SCOUT9_API_KEY);
  if (!conversation) {
    conversation = createMockConversation();
  }
  if (!messages) {
    messages = [];
  }
  if (!message) {
    throw new Error(`No .message found`);
  }
  if (!workflowFn) {
    throw new Error(`No .workflowFn found`);
  }
  if (!personaId) {
    personaId = (config.persona || config.agents)?.[0]?.id;
    if (!personaId) {
      throw new Error(`No persona found in config, please specify a persona id`);
    }
    conversation.$agent = personaId;
  } else {
    conversation.$agent = personaId;
  }
  if (!customer) {
    customer = {
      id: 'mock_customer_' + Math.random().toString(36).substr(2, 9),
      name: 'Mock Customer',
      firstName: 'Mock',
      lastName: 'Customer'
    };
    conversation.$customer = customer.id;
  } else {
    conversation.$customer = customer.id;
  }
  if (!context) {
    context = {};
  }

  // Parse the message
  callback('Parsing message');
  const parsePayload = await scout9.parse({
    message,
    language: 'en',
    entities: config.entities
  }).then((_res => _res.data));
  callback('Parsing complete');

  const persona = (config.persona || config.agents).find(p => p.id === personaId);
  if (!persona) {
    throw new Error(`Could not find persona with id: ${personaId}, ensure your project is sync'd by running "scout9 sync"`);
  }
  if (!messages.find(m => m.content === message)) {
    messages.push({
      id: 'user_mock_' + Math.random().toString(36).substr(2, 9),
      role: 'customer',
      content: message,
      context: parsePayload.context,
      time: new Date().toISOString(),
      intent: parsePayload.intent,
      intentScore: parsePayload.intentScore
    });
  }

  // If this is the first user message, then update conversations intent
  const previousUserMessages = messages.filter(m => m.role === 'customer' && m.content !== message);
  if (!conversation.intent || previousUserMessages.length === 0) {
    conversation.intent = parsePayload.intent;
    conversation.intentScore = parsePayload.intentScore;
  }

  context = {
    ...context,
    ...parsePayload.context
  };

  const noNewContext = Object.keys(parsePayload.context).length === 0;

  // Run workflow
  callback('Running workflow');
  const slots = await workflowFn({
    messages,
    conversation,
    context,
    message: messages[messages.length - 1],
    agent: persona,
    customer,
    intent: {
      current: parsePayload.intent || null,
      flow: messages.map(m => m.intent).filter(Boolean),
      initial: conversation.intent || null
    },
    stagnationCount: conversation?.lockAttempts || 0
  }).then((res => Array.isArray(res) ? res : [res]));

  const hasNoInstructions = slots.every(s => !s.instructions || (Array.isArray(s) && s.instructions.length === 0));
  const previousLockAttempt = conversation.lockAttempts || 0; // Used to track
  const lockConversation = () => {
    callback('Conversation locked');
    conversation.locked = true;
  };
  const incrementLockAttempt = () => {
    if (typeof conversation?.lockAttempts !== 'number') {
      conversation.lockAttempts = 0;
    }
    conversation.lockAttempts++;
    if (conversation.lockAttempts > 3) {
      lockConversation();
    }
  };
  const addInstruction = (instruction) => {
    const systemMessages = messages.filter(m => m.role === 'system');
    const lastSystemMessage = systemMessages[systemMessages.length - 1];
    if (messages.filter(m => m.role === 'system' && m.content === instruction).length === 0) {
      // Add instructions to messages
      messages.push({
        id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
        role: 'system',
        content: instruction,
        time: new Date().toISOString()
      });
    } else {
      // Handle repeated instruction

      // Increment lock attempt if instructions are repeated and we haven't already incremented lock attempt (for example if a forward is provided)
      if (previousLockAttempt === (conversation.lockAttempts || 0)) {
        incrementLockAttempt();
      }

      // if (lastSystemMessage.content !== 'Attempt to continue conversation.') {
      //   input.messages.push({
      //     $id: Geneseed.utils.tokens.generate('sys'),
      //     role: 'system',
      //     content: 'Attempt to continue conversation.',
      //     time: new Date().toISOString()
      //   });
      //   dispatch({type: 'ADD_MESSAGE', payload: input.messages[input.messages.length - 1]});
      // }
    }
  };

  if (hasNoInstructions && noNewContext) {
    await incrementLockAttempt();
  }

  for (const {
    forward,
    instructions,
    removeInstructions,
    message,
    scheduled,
    resetIntent,
    secondsDelay,
    contextUpsert
  } of slots) {

    // Forward to agent or other agent
    if (forward) {
      await lockConversation();
      if (typeof forward === 'string') {
        messages.push({
          id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
          role: 'system',
          content: `forwarded to "${forward}"`,
          time: new Date().toISOString()
        });
      } else if (typeof forward === 'boolean') {
        messages.push({
          id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
          role: 'system',
          content: `forwarded to "${forward}"`,
          time: new Date().toISOString()
        });
      } else {
        messages.push({
          id: 'sys_' + Math.random().toString(36).substr(2, 9), // 'sys_'
          role: 'system',
          content: `forwarded to "${forward.to}" ${forward.mode ? ' (' + forward.mode + ')' : ''}`,
          time: new Date().toISOString()
        });
      }
    }

    // Insert instructions context
    if (instructions) {
      if (typeof instructions === 'string') {
        await addInstruction(instructions);
      } else if (Array.isArray(instructions)) {
        for (const instruction of instructions) {
          if (typeof instruction === 'string') {
            await addInstruction(instruction);
          } else {
            await addInstruction(instruction.content);
          }
        }
      } else if (typeof instructions === 'object' && 'content' in instructions && 'id' in instructions) {
        throw new Error('Implement me');
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

    if (message) {
      const manualMessage = {
        id: 'agent_mock_' + Math.random().toString(36).substr(2, 9), // 'agent_mock_'
        role: 'agent',
        content: message,
        time: new Date().toISOString()
      };
      if (scheduled) {
        manualMessage.time = new Date(scheduled * 1000).toISOString();
      } else if (secondsDelay) {
        const now = new Date();
        now.setSeconds(now.getSeconds() + secondsDelay);
        manualMessage.time = now.toISOString();
      }
      messages.push(manualMessage);
    }

    if (contextUpsert) {
      context = {...context, ...contextUpsert};
    }

    if (resetIntent) {
      // setIntent('none');
      conversation.intent = null;
      conversation.intentScore = null;
    }
  }

  // Generate a response
  if (!conversation.locked) {
    try {
      callback('Generating message...');
      const generatePayload = await scout9.generate({
        messages,
        persona,
        context,
        llm: config.llm,
        pmt: config.pmt
      }).then((_res => _res.data));
      callback('Message generated');

      // Check if already had message
      const lastAgentMessage = messages.filter(m => m.role === 'agent')[0];
      if (lastAgentMessage && lastAgentMessage.content === generatePayload.message) {
        await lockConversation();
      } else {
        messages.push({
          id: 'assistant_mock_' + Math.random().toString(36).substr(2, 9), // 'assistant_mock_'
          role: 'agent',
          content: generatePayload.message,
          time: new Date().toISOString()
        });
      }
    } catch (e) {
      await lockConversation();
    }
  }

  return {
    messages,
    conversation,
    context
  };
}
