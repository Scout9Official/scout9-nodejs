import moment from 'moment';

/**
 * @returns {import('../runtime/client/users.js').IAgent}
 */
export const createMockAgent = (firstName = 'Carmela', lastName = 'Soprano') => {
  return {
    id: Math.random().toString(36).substring(7),
    firstName,
    lastName
  }
}

/**
 * @returns {import('../runtime/client/users.js').ICustomer}
 */
export const createMockCustomer = (firstName = 'Tony', lastName = 'Soprano') => {
  return {
    id: Math.random().toString(36).substring(7),
    name: `${firstName} ${lastName}`,
    firstName,
    lastName
  }
}

/**
 *
 * @param content
 * @param role
 * @param time
 * @returns {import('../runtime/client/message.js').IMessage}
 */
export const createMockMessage = (content, role = 'customer', time  = moment().toISOString()) => {
  return {
    id: Math.random().toString(36).substring(7),
    role,
    content,
    time,
    intent: null,
    intentScore: null
  }
}

/**
 * @returns {import('../runtime/client/workflow.js').IConversation}
 */
export const createMockConversation = (environment = 'phone', $agent = 'default', $customer = 'default') => {
  return {
    $agent,
    $customer,
    environment
  }
}

/**
 * @param {string} message
 * @param {string | import('../runtime/client/workflow.js').IWorkflowEvent['intent'] | null} intent
 * @returns {import('../runtime/client/workflow.js').IWorkflowEvent}
 */
export const createMockWorkflowEvent = (
  message,
  intent = null,
) => {
  return {
    messages: [],
    conversation: createMockConversation(),
    context: {},
    message: createMockMessage(message),
    agent: createMockAgent(),
    customer: createMockCustomer(),
    intent: typeof intent === 'string' ? {
      current: intent,
      flow: [],
      initial: intent
    } : typeof intent === 'object' ? intent : null,
    stagnationCount: 0,
  }
}

