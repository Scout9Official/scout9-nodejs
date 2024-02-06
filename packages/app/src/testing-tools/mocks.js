import moment from 'moment';

/**
 * @returns {import('@scout9/app').Agent}
 */
export const createMockAgent = (firstName = 'Carmela', lastName = 'Soprano') => {
  return {
    id: Math.random().toString(36).substring(7),
    firstName,
    lastName
  }
}

/**
 * @returns {import('@scout9/app').Customer}
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
 * @returns {import('@scout9/app').Message}
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
 * @returns {import('@scout9/app').Conversation}
 */
export const createMockConversation = (environment = 'phone', $agent = 'default', $customer = 'default') => {
  return {
    $agent,
    $customer,
    environment
  }
}

/**
 * @returns {import('@scout9/app').WorkflowEvent}
 */
export const createMockWorkflowEvent = (
  message,
  intent,
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
    } : intent,
    stagnationCount: 0,
  }
}

