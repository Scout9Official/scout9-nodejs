import 'dotenv/config';
import { Scout9Api, Configuration } from '@scout9/admin/src';
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
 * Simple conversation between a customer and agent
 */
async function simpleConversation(cache: ILocalCache) {
  console.log(`Creating default conversation:\n\tcustomer: "${customerIdWithPhone}"\n\tagent: "${agentId}"`);
  const conversation = await scout9.conversationCreate({
    $customer: customerIdWithPhone,
    $agent: agentId,
    environment: 'phone', // web, phone, or email

    // Add some initial contexts to the conversation to help the agent get started
    initialContexts: [
      'We are offering free pizzas to the first 100 hundred customers for today only',
      'We have pepperoni, cheese, meat lovers, and vegan pizzas available',
      'We do not have gluten free pizzas available at this time',
      'We are only offering free pizzas, nothing else',
      'You must pick up the free pizza at 255 W Alameda St, Tucson, AZ 85701',
      'We close at 10pm tonight',
      'If the customer is not interested or serious in receiving a free pizza, disengage and direct them to our website (https://azpizzatime.com) for future orders'
    ]
  });
  console.log(`\n\tconversation: "${conversation.data.id}"\n\tclient portal: ${conversation.data.clientWebUrl}\n\tagent portal: ${conversation.data.agentWebUrl}\n\tagent test portal: ${conversation.data.agentTestWebUrl}\n`);

  // Cache the conversation id for later use
  await saveCache({convo: conversation.data.id});



  const initialMessage = `Hey there, would you like a free pizza?`;
  console.log(`Sending initial message to customer: "${initialMessage}"`);
  await scout9.message({convo: conversation.data.id, message: initialMessage});


  console.log(`Testing out a few anticipated responses...`);
  const anticipatedCustomerResponses = [
    'Yes please!',
    'No thanks',
    'What kind of pizza are we talking about?',
    'I\'m vegan, do you have vegan pizza?',
    'I hate you, stop texting me',
    'I love you, keep texting me',
  ];
  for (const customerResponse of anticipatedCustomerResponses) {
    const generatedResponse = await scout9.generate({
      convo: conversation.data.id,
      mocks: {
        messages: [
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


  // Retrieve messages from the conversation
  // const messages = await scout9.messages(conversation.data.id)
  // console.log(`Retrieved ${messages.data.length} messages from the conversation`);
  // for (const message of messages.data) {
  //   console.log(`\t${message.role}: ${message.content} (${message.time})`);
  // }

}

loadCache()
  .then((cache) => reset(cache, scout9))
  .then(simpleConversation)
  .then(() => console.log('Done! 🎉'))
  .catch((err) => {
    console.error(err);
  });
