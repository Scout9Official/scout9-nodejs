import fetch from 'node-fetch';
import { WorkflowEventSchema, ConversationSchema, MessageSchema, customerSchema } from '@scout9/app';

import agentsFun from '../src-test/src/entities/agents/index.js';
import config  from '../src-test/src/index.js';
import { WorkflowResponseSchema } from '../src/index.js';
import { resolve } from 'node:path';
import { config as dotenv } from 'dotenv';

const agents = await agentsFun();
const configFilePath = resolve(process.cwd(), './.env');
dotenv({path: configFilePath});

if (!process.env.TEST_PERSONA_UID) {
  throw new Error(`Missing TEST_PERSONA_UID`);
}
if (!process.env.TEST_USER_PHONE_NUMBER) {
  throw new Error(`Missing TEST_USER_PHONE_NUMBER`);
}

if (!process.env.TEST_USER_UID) {
  throw new Error(`Missing TEST_USER_UID`);
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

/**
 * Utility class to store and run workflow methods
 */
export class ConversationState {


  constructor() {
    this.#reset();
  }

  /**
   * Send a message to the dev app web environment
   * @param {string} message
   * @return {Promise<string>}
   */
  async sendMessage(message) {

    const parsedMessage = await this.#parse(message);

    // 1. Parse customer message to determine context
    this.messages.push(parsedMessage);

    // 2. Run workflow
    await this.#workflow(parsedMessage);

    // 3. Generate response
    const generatedResponse = await this.#generate();

    this.messages.push(generatedResponse);

    return generatedResponse.content;
  }

  reset() {
    this.#reset();
  }

  async #parse(message) {
    const _messageObj = MessageSchema.parse({
      id: 'user_' + Math.random().toString(36).substring(7),
      role: 'customer',
      content: message,
      time: new Date().toISOString(),
      name: this.customer.firstName,
    });
    const response = await this.#fetch('http://localhost:8080/dev/parse', {message, language: 'en'});
    if (response.context && Object.keys(response.context).length > 0) {
      this.context = {
        ...this.context,
        ...response.context,
      }
      _messageObj.context = response.context;
    } else {
      this.#logStagnation();
    }
    if (typeof response.intent === 'string') {
      _messageObj.intent = response.intent;
    }
    if (typeof response.intentScore === 'number') {
      _messageObj.intentScore = response.intentScore;
    }
    return _messageObj;
  }

  async #workflow(message) {
    const {transcripts, audios, includedLocations, excludedLocations, model, context, ...agent} = this.agent;
    const event = WorkflowEventSchema.parse({
      messages: this.messages,
      conversation: this.conversation,
      context: this.context,
      message,
      agent,
      customer: this.customer,
      intent: this.intent,
      stagnationCount: this.stagnationCount,
    });
    const workflowResponse = WorkflowResponseSchema.parse(await this.#fetch('http://localhost:8080/dev/workflow', event));
    for (const slot of (Array.isArray(workflowResponse) ? workflowResponse : [workflowResponse])) {
      if (slot.forward) {
        this.conversation.locked = true;
        this.conversation.lockedReason = slot.forwardNote || 'None';
      }
      if (slot.message) {
        this.messages.push({
          id: 'agent_' + Math.random().toString(36).substring(7),
          role: 'agent',
          content: slot.message,
          time: new Date().toISOString()
        });
      }

      if (slot.contextUpsert) {
        this.context = {
          ...this.context,
          ...slot.contextUpsert
        }
      }
      if (slot.removeInstructions) {
        this.messages = this.messages.filter(m =>  !slot.removeInstructions.includes(m.id));
      }
      if (slot.resetIntent) {
        this.#resetIntent();
      }
      if (slot.instructions) {
        for (const instruction of (Array.isArray(slot.instructions) ? slot.instructions : [slot.instructions])) {
          this.messages.push({
            id: 'sys_' + Math.random().toString(36).substring(7),
            content: instruction,
            time: new Date().toISOString(),
            role: 'system'
          });
        }
      }
    }

    return Array.isArray(workflowResponse) ? workflowResponse : [workflowResponse];
  }

  async #generate() {
    const res = await this.#fetch('http://localhost:8080/dev/generate', {
      persona: this.conversation.$agent,
      messages: this.messages
    });
    const {message, error, forward, forwardNote} = res;
    if (forward) {
      this.conversation.locked = true;
      this.conversation.lockedReason = forwardNote || 'Unknown';
      return MessageSchema.parse({
        id: 'sys_' + Math.random().toString(36).substring(7),
        role: 'system',
        content: 'Conversation is locked: ' + this.conversation.lockedReason,
        time: new Date().toISOString()
      });
    }
    if (message) {
      return MessageSchema.parse({
        id: 'agent_' + Math.random().toString(36).substring(7),
        role: 'agent',
        content: message,
        time: new Date().toISOString()
      });
    } else {
      throw new Error(`No message generated: ${error ?? 'Unknown Error'}`)
    }
  }

  #logStagnation() {
    if (typeof this.conversation.lockAttempts !== 'number') {
      this.conversation.lockAttempts = 0;
    }
    this.conversation.lockAttempts++;
    this.stagnationCount = this.conversation.lockAttempts;
  }

  async #fetch(url, body) {
    return await fetch(url, {
      method: body ? 'post' : 'get',
      body: body ? JSON.stringify(body) : undefined,
      headers: {'Content-Type': 'application/json'}
    }).then(res => {
      if (res.ok) {
        return res.json();
      } else {
        console.error(res.statusCode, res.statusText)
        return res.text()
          .then(r => {
            let errObj;
            try {
              errObj = JSON.parse(r);
            } catch (e) {
              errObj = undefined;
            }
            if (errObj && errObj.error) {
              throw new Error(`${errObj.name} (${errObj.code}): ${errObj.error}\nurl: "${url}"`);
            } else {
              throw new Error(`${r}\nurl: "${url}"`);
            }
          });
      }
    });
  }

  #reset() {
    this.messages = [];
    this.conversation = ConversationSchema.parse({
      $agent: process.env.TEST_PERSONA_UID,
      $customer: process.env.TEST_USER_UID,
      initialContexts: config.initialContexts,
      environment: 'web',
    });
    this.context = {};
    this.agent = agents[0];
    this.customer = customerSchema.parse({
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      phone: process.env.TEST_USER_PHONE_NUMBER
    });
    this.#resetIntent();
  }

  #resetIntent() {
    this.intent = {
      current: 'pizzaOrder',
      flow: ['pizzaOrder'],
      initial: 'pizzaOrder'
    };
    this.stagnationCount = 0;
    this.conversation.lockAttempts = 0;
    this.conversation.locked = false;
  }



}


