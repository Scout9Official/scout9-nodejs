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
    environment: 'phone' // web, phone, or email
  });
  console.log(`\n\tconversation: "${conversation.data.id}"\n\tclient portal: ${conversation.data.clientWebUrl}\n\tagent portal: ${conversation.data.agentWebUrl}\n\tagent test portal: ${conversation.data.agentTestWebUrl}\n`);

  // Cache the conversation id for later use
  await saveCache({convo: conversation.data.id});

  console.log(`Generating a message in the agents voice...`);
  const message = await scout9.generate({
    convo: conversation.data.id
  });
  console.log(`Generated message in agents voice:\n\t"${message.data.content}"\n`);


  console.log(`Sending message to customer...`);
  await scout9.message({
    convo: conversation.data.id,
    message: `(WelcomeHome Test Message) ` + message.data.content
  });
  console.log(`Message queued for delivery\n`);

}

loadCache()
  .then((cache) => reset(cache, scout9))
  .then(simpleConversation)
  .then(() => console.log('Done! 🎉'))
  .catch((err) => {
    console.error(err);
  });
