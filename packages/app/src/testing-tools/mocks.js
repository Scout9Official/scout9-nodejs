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
 * @param {import('@scout9/app').Conversation['environment']} [environment]
 * @param {string} [$agent]
 * @param {string} [$customer]
 * @param {string} [$id]
 * @returns {import('@scout9/app').Conversation}
 */
export const createMockConversation = (
  environment = 'phone',
  $agent = 'default',
  $customer = 'default',
  $id = 'default'
) => {
  return {
    $id,
    $agent,
    $customer,
    environment
  }
}

/**
 * @param {string} message
 * @param {string | import('@scout9/app').WorkflowEvent['intent'] | null} intent
 * @returns {import('@scout9/app').WorkflowEvent}
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

