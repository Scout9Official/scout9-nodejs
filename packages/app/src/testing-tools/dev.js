import { Scout9Admin, Scout9Api, Configuration } from '@scout9/admin';
import { createMockConversation } from './mocks.js';
import { loadConfig } from '../core/config/index.js';


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
  callback = (msg) => {}
) {
  const config = await loadConfig({cwd, src, mode});
  const configuration = new Configuration({ apiKey: process.env.SCOUT9_API_KEY });
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
  const previousUserMessages = messages.filter(m => m.role === 'user' && m.content !== message);
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
      } else {
        throw new Error('instructions must be a string or array');
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
      const lastAgentMessage = messages.filter(m => m.role === 'assistant')[0];
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
