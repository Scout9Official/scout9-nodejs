import moment from 'moment';

export const createMockAgent = (firstName = 'Carmela', lastName = 'Soprano') => {
  return {
    firstName,
    lastName
  }
}

export const createMockCustomer = (firstName = 'Tony', lastName = 'Soprano') => {
  return {
    name: `${firstName} ${lastName}`,
    firstName,
    lastName
  }
}

export const createMockMessage = (content, role = 'customer', time  = moment().toISOString()) => {
  return {
    role,
    content,
    time
  }
}
export const createMockConversation = (environment = 'phone', $agent = 'default', $customer = 'default') => {
  return {
    $agent,
    $customer,
    environment
  }
}
export const createMockWorkflowEvent = (
  message,
  intent,
) => {
  return {
    messages: [],
    conversation: createMockConversation(),
    context: {},
    message: createMockMessage(message),
    stagnationCount: 0,
    customer: createMockCustomer(),
    agent: createMockAgent(),
    intent,
  }
}

