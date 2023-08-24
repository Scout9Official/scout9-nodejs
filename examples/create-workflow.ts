import { Configuration, ConversationContextField, CreateWorkflowRequest, PocketScoutApi } from '@scout9/admin/src';
import 'dotenv/config';
import { ILocalCache, loadCache, reset, saveCache } from './_utils';


// Replace with a customer id that has a valid phone number
const customerIdWithPhone = process.env.MY_TEST_CUSTOMER_PHONE || '';

// Replace with customer id that has a valid email
const customerIdWithEmail = process.env.MY_TEST_CUSTOMER_EMAIL || '';

// Replace with valid agent id
const agentId = process.env.MY_TEST_AGENT || '';

const configuration = new Configuration({
  apiKey: process.env.MY_S9_API_KEY, // Replace with your API key
});
const pocketScout = new PocketScoutApi(configuration);


/**
 * Simple conversation between a customer and agent
 */
async function createWorkflow(cache: ILocalCache) {
  console.log(`Creating default conversation:\n\tcustomer: "${customerIdWithPhone}"\n\tagent: "${agentId}"`);

  const context = [
    'When a customer wants to order a pizza, I will determine what pizza they need and when, then determine if it needs to be picked up or delivered to their address.',
  ];

  const contextFields: ConversationContextField[] = [
    {
      id: 'determineSize',
      context: 'Determine what size pizza the customer wants, we have small, medium, and large',
      conditions: [
        {
          conditions: [
            {
              key: 'pizzaSize',
              operator: 'notExists',
              value: true
            }
          ]
        }
      ]
    },
    {
      id: 'determineSauce',
      context: 'Determine what sauce pizza the customer wants, we have red, white, and pesto',
      conditions: [
        {
          conditions: [
            {
              key: 'pizzaSauce',
              operator: 'notExists',
              value: true
            }
          ]
        }
      ]
    },
    {
      id: 'determineToppings',
      context: 'Determine what toppings the customer wants, we have pepperoni, sausage, mushrooms, olives, onions, peppers, and more (don\'t list all toppings unless customer asks, and only list 15 at a time)',
      conditions: [
        {
          conditions: [
            {
              key: 'pizzaToppings',
              operator: 'notExists',
              value: true
            }
          ]
        }
      ]
    },
    {
      id: 'isDeliveryOrPickup',
      context: 'Determine if the customer wants delivery or pickup',
      conditions: [
        {
          conditions: [
            {
              key: 'serviceMethod',
              operator: 'notExists',
              value: true
            }
          ]
        }
      ]
    },
    {
      id: 'getAddress',
      context: 'If the customer wants delivery, determine where they want it delivered',
      conditions: [
        {
          conditions: [
            {
              key: 'serviceMethod',
              operator: 'equal',
              value: 'delivery'
            }
          ]
        },
        {
          conditions: [
            {
              key: 'address',
              operator: 'notExists',
              value: true
            }
          ]
        }
      ]
    },
    {
      id: 'getPayment',
      // We can insert variables into the conversation, let's assume that an order is created when customer reaches out, we insert an orderId to the conversation context.
      context: 'We do not accept payment over the phone, so I will direct them to our website (https://azpizza.com/payment/{orderId}) to complete the order',
      conditions: [
        {
          conditions: [
            {
              key: 'serviceMethod',
              operator: 'equal',
              value: 'delivery'
            }
          ]
        },
        {
          conditions: [
            {
              key: 'orderId',
              operator: 'exists',
              value: true
            }
          ]
        }
      ]
    },
    {
      id: 'getOrderTime',
      // We can insert variables into the conversation, let's assume that an order is created when customer reaches out, we insert an orderId to the conversation context.
      context: 'Determine when the customer would like this pizza to be ready for pickup or delivery',
      conditions: [
        {
          conditions: [
            {
              key: 'orderTime',
              operator: 'notExists',
              value: true
            }
          ]
        },
      ]
    }
  ];

  const customEntities = [
      {
        utteranceId: 'pizzaType',
        option: 'unknown',
        languages: ['en'],
        text: [
          'pizza',
          'slice',
          'chicago-style',
          'deep-dish',
          'pie',
          'thin-crust',
          'new-york-style',
          'california-style',
          'sicilian',
          'greek',
          'chicago',
          // ... more utterances
        ]
      },
      {
        utteranceId: 'pizzaType',
        option: 'deep-dish',
        languages: ['en'],
        text: [
          'deep-dish',
          'chicago-style',
          'chicago',
          // ... more utterances or terms a human might use to describe "A deep dish pizza"
        ]
      },
      {
        utteranceId: 'pizzaSize',
        option: 'small',
        languages: ['en'],
        text: [
          'small',
          'personal',
          'individual',
          '6-inch',
          '8-inch',
        ]
      },
      {
        utteranceId: 'pizzaSize',
        option: 'medium',
        languages: ['en'],
        text: [
          'medium',
          'md pizza',
          '10-inch',
          '11-inch',
          '12-inch',
          // ...
        ]
      }
      // ... more entities like pizzaToppings, pizzaSauce, serviceMethod, etc
    ];

  // If a customers message is close to any of these, then we will trigger the workflow
  const workflowTriggerStatements = [
    // Notice we use %{id}% to reference an entity
    {text: 'I would like to order a %pizzaType%', id: 'request'},
    {text: 'Do you serve %pizzaType%', id: 'request'},
    {text: 'Do you have a &pizzaType% that has %pizzaTopping%, %pizzaTopping%', id: 'request'},
    {text: 'I would like to order a %pizzaSize%  %pizzaType%', id: 'request'},
    // ... more examples that might trigger the workflow
  ];

  const workflow: CreateWorkflowRequest = {
    name: 'Order Pizza',

    // Define the goal of the workflow
    context: context.join('. '),

    // fields follow this boolean structure -> (a || b) && (c || d), if true then the context will be inserted into the conversation.
    fields: contextFields,
    initiators: {
      // We need to describe the fields that we want to collect from the customer in this workflow
      // entity fields such as firstName, address, location, etc are built in and will be provided by default
      entities: customEntities,
      documents: workflowTriggerStatements
    },
  };

  const option = 'option3';

  // Option 1: Save a workflow from scratch, and use in a conversation later
  if (option === 'option1') {
    const workflowId = await pocketScout.workflowCreate(workflow).then(res => res.data.id);
    const conversationId = await pocketScout.conversationCreate({
      $workflow: workflowId,
      $customer: customerIdWithPhone,
      $agent: agentId,
      environment: 'phone'
    }).then(res => res.data.id);
    await pocketScout.message({convo: conversationId, message: 'Hey got your text, what pizza were you looking for?'});

    await saveCache({workflows: [...(cache.workflows || []), workflowId]});
  }
  // Option 2: Inline the workflow in a conversation, this will create the workflow automatically
  if (option === 'option2') {
    const res = await pocketScout.conversationCreate({
      $workflow: workflow, // <-- This will create the workflow and use it in the conversation
      $customer: customerIdWithPhone,
      $agent: agentId,
      environment: 'phone'
    });
    await pocketScout.message({convo: res.data.id, message: 'Hey got your text, what pizza were you looking for?'});

    // @TODO get created workflow ID and cache
    await saveCache({convo: res.data.id});
  }


  // Option 3: Test the workflow without saving by using the generate API
  if (option === 'option3') {

    // Test the workflow without saving by using the generate API
    const test1 = await pocketScout.generate({
      convo: {
        $customer: 'test', // <-- We can use the built in 'test' ID to test workflows
        $agent: agentId,
        environment: 'phone',
        $workflow: workflow
      },
      mocks: {
        messages: [
          {
            role: 'agent',
            content: 'Hey got your text, what pizza were you looking for?'
          },
          {
            role: 'customer',
            content: 'I would like to order a deep-dish pizza'
          }
        ]
      }
    }).then(res => res.data);

    if (test1.info['pizzaType'] !== 'deep-dish') {
      throw new Error(`Expected pizzaType to be "deep-dish", got "${test1.info['pizzaType']}"`);
    } else {
      console.log(`Successfully got pizzaType: "${test1.info['pizzaType']}"`);
    }

    const test2 = await pocketScout.generate({
      convo: {
        $customer: 'test', // <-- We can use the built in 'test' ID to test workflows
        $agent: agentId,
        environment: 'phone',
        $workflow: workflow
      },
      mocks: {
        messages: [
          {
            role: 'agent',
            content: 'Hey got your text, what pizza were you looking for?'
          },
          {
            role: 'customer',
            content: 'I would like to order a deep-dish pizza'
          },
          {
            role: 'agent',
            content: test1.content // Should ask for size or toppings
          },
          {
            role: 'customer',
            content: 'Small size or 12-inch and cheese, and pepperoni only please'
          },
        ]
      }
    }).then(res => res.data);

    if (!test1.info['pizzaTopping']) {
      throw new Error(`Expected to have pizzaToppings`);
    }

  }

}

loadCache()
  .then((cache) => reset(cache, pocketScout))
  .then(createWorkflow)
  .then(() => console.log('Done! 🎉'))
  .catch((err) => {
    console.error(err);
  });
