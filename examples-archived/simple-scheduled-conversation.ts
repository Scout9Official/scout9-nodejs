import { Configuration, GenerateRequestConvo, Scout9Api, ScheduleCreateRequest } from '@scout9/admin/src';
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
const scout9 = new Scout9Api(configuration);


/**
 * Simple scheduled conversation between a customer and agent
 */
async function simpleScheduledConversation(cache: ILocalCache) {
  console.log(`Creating default conversation:\n\tcustomer: "${customerIdWithPhone}"\n\tagent: "${agentId}"`);

  const now = new Date();
  const oneMinuteLater = new Date(now.getTime() + 60 * 1000); // Adding 60,000 milliseconds (1 minute)
  const initialMessage = `Hey there, would you like a free pizza?`;

  const request: ScheduleCreateRequest = {
    $customer: customerIdWithPhone,
    $agent: agentId,
    environment: 'phone', // web, phone, or email
    scheduled: oneMinuteLater.toISOString(),
    initialMessage,
    // Add some initial contexts to the conversation to help the agent get started
    initialContexts: [
      'We are offering free pizzas to the first 100 hundred customers for today only',
      'We have pepperoni, cheese, meat lovers, and vegan pizzas available',
      'We do not have gluten free pizzas available at this time',
      'We are only offering free pizzas, nothing else',
      'You must pick up the free pizza at 255 W Alameda St, Tucson, AZ 85701',
      'We close at 10pm tonight',
      'If the customer is not interested or serious in receiving a free pizza, disengage and direct them to our website (https://azpizzatime.com) for future orders'
    ],
  }
  const scheduleConversationRes = await scout9.scheduleConversation(request);
  console.log(`\n\tscheduled conversation: "${scheduleConversationRes.data.id}"\n`);

  // Cache the conversation id for later use
  await saveCache({convo: scheduleConversationRes.data.id});


  console.log(`Testing out a few anticipated responses...`);
  const anticipatedCustomerResponses = [
    'Yes please!',
    'No thanks',
    'What kind of pizza are we talking about?',
    'I\'m vegan, do you have vegan pizza?',
    'I hate you, stop texting me',
    'I love you, keep texting me',
  ];
  // We have to input the conversation object since it's a scheduled conversation and not yet created
  const conversation: GenerateRequestConvo = {
    $agent: request.$agent,
    $customer: request.$customer,
    environment: request.environment,
    initialContexts: request.initialContexts,
  }

  for (const customerResponse of anticipatedCustomerResponses) {
    const generatedResponse = await scout9.generate({
      convo: conversation,
      mocks: {
        messages: [
          {
            role: 'agent',
            content: initialMessage // We have to add the initial message to the conversation because the conversation has not yet been created
          },
          {
            role: 'customer',
            content: customerResponse
          }
        ]
      }
    })
      .then((res) => res.data.content)
    console.log(`\n\tCustomer: "${customerResponse}"\n\tAgent: "${generatedResponse}"\n`);
  }

}

loadCache()
  .then((cache) => reset(cache, scout9))
  .then(simpleScheduledConversation)
  .then(() => console.log('Done! 🎉'))
  .catch((err) => {
    console.error(err);
  });
