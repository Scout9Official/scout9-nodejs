import { Scout9Platform } from './src/platform.js';
import fetch from 'node-fetch';

(async () => {
  const dest = './tmp/project';

  // Run app

  /** @type {Conversation} */
  const conversation = {
    $id: 'platform-test',
    initiated: '2021-03-03T21:00:00.000Z',
    $customer: 'TFV6dJEXwsdfQ4HMjpr2YrQugmw2',
    customerEmail: 'opiepat@gmail.com',
    customerPhone: '+14254460552',
    $business: 'scout9',
    $agent: 'c8LyZzZsGRSU4B16iW5zOMkiUUm2',
    agentEmail: 'patrick@scout9.com',
    agentPhone: '+12066564253',
    $thread: 'default',
    environment: 'phone'
  };

  /** @type {Message} */
  const message = {
    time: '2021-03-03T21:00:00.000Z',
    content: 'Hello, I would like to order a pizza',
    role: 'user'
  };

  /** @type {Agent} */
  const agent = {
    id: conversation.$agent,
    firstName: 'Patrick',
    lastName: 'Opie',
    programmablePhoneNumber: '+12066564253',
    programmableEmail: 'patrick@scout9.com',
    forwardEmail: 'patrick@scout9.com',
    forwardPhone: '+14254460552'
  };

  /** @type {WorkflowEvent} */
  const event = {
    messages: [],
    conversation,
    context: {
      firstName: 'Patrick',
      lastName: 'Opie',
      contact: '+14254460552',
      phone: '+14254460552',
      agentName: 'Patrick Opie'
    },
    message,
    agent,
    customer: {
      id: conversation.$customer,
      name: 'Patrick Opie',
      email: 'opiepat@gmail.com',
      phone: '+14254460552'
    },
    intent: 'pizzaOrder',
    stagnationCount: 0

  }

  const res = await fetch(`http://localhost:8080/api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });
  const json = await res.json();
  console.log(json);
})();
