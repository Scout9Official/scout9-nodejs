import { Configuration, Scout9Api } from '@scout9/admin/src';
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
 * Simple conversation between a customer and agent
 */
async function scheduleMultipleConversations(cache: ILocalCache) {

  // This workflow's goal is send out deal offers to customers for home maintenance
  const workflow = process.env.MY_TEST_WORKFLOW || '';
  const now = new Date();
  const oneMinuteLater = new Date(now.getTime() + 60 * 1000); // Adding 60,000 milliseconds (1 minute)

  console.log(`Scheduling conversation group`);
  const group = await scout9.scheduleGroupCreate({
    $agent: agentId, // This will come from the agent's profile
    $workflow: workflow,
    initialContexts: [
      'If the user replies "1", "2", or "3" tell them we will check with the team for an open slot for gutter cleaning tomorrow and then close the conversation, DO NOT ASK FOR THEIR AVAILABILITY. If the user replies "4" ask them if they prefer a morning time or afternoon time for two weeks out and then close the conversation, DO NOT ASK FOR DATE. If the user replies with "5" then they are not interested, close the conversation.'
    ],
    scheduled: oneMinuteLater.toISOString(),

    /**
     * We can add template injections to the initial message to personalize it for each customer
     * Template injections follow key/value relationships within the data you pass in for each customer
     * By default first_name, last_name, and full_name, phone, email are available, pass arguments for default values
     *
     * customer object...
     * {
     *    id: '123',
     *    name: 'John Doe',
     *    first_name: 'John',
     *    last_name: 'Doe',
     *    favorite_car: 'Tesla',
     *    random_fun_fact: '2012 Gummy Bear World Eating Contest Champion'
     * }
     *
     * Template: "Hey there {first_name}! Do you like {favorite_fruit}?"
     * Success ✅: "Hey there John! Do you like apples?"
     * Failure ❌: "Hey there! Do you like?"
     *
     *
     * 💡 Tip #1: Account for data gaps by passing arguments for default values
     *
     * Template: "Hey there {first_name:friend}! Do you like {favorite_fruit:fruit}?"
     * Success ✅: "Hey there John! Do you like apples?"
     * Failure ❌: "Hey there friend! Do you like fruit?"
     *
     * 💡 Tip #2: you can access data from other objects by using `dot notation` and `$` prefix for $business, $agent, $workflow, $thread ($workflow alias), $conversation, $conversation.$context, and $conversation.$info
     * See the docs for more info on available properties
     *
     * Template: "Hey there {first_name:friend}! This is {$agent.first_name:Alex}, your {$business.name:WelcomeHome} representative. Do you like {favorite_fruit:fruit}?"
     * Success ✅: "Hey there John! This is Jane, your WelcomeHome representative. Do you like apples?"
     * Failure ❌: "Hey there friend! This is Alex, your WelcomeHome representative. Do you like fruit?"
     */
    initialMessage: `
    🚨 WelcomeHome Weekly Neighborhood Deal: Hey {first_name} we\'re in Seattle tomorrow doing gutter cleaning for...
    
    - $240-630 tomorrow
    - $192-504 two weeks out
    
    You in?
    
    1. for tomorrow morning
    2. for tomorrow afternoon
    3. anytime tomorrow
    4. take discount, schedule 2 weeks out
    5. not available tomorrow
    
    Reply either 1, 2, 3, 4, 5
    `,

    /**
     * We can also add HTML to the initial message, we use {convoUrl} to link to the active conversation
     * We provide a query param `reply` to allow the customer to reply to the conversation when they click the link
     */
    initialMessageHtml: `<p>Hey {first_name} we're in Seattle tomorrow doing gutter cleaning for...<br><br>- $240-630 tomorrow<br>or<br>- $192-504 two weeks out<br><br>You in?<br><a href="{convoUrl}?reply=2">1. for tomorrow morning</a><br><a href="{convoUrl}?reply=3">2. for tomorrow afternoon</a><br><a href="{convoUrl}?reply=1">3. anytime tomorrow</a><br><a href="{convoUrl}?reply=4">4. take discount, schedule 2 weeks out</a><br><a href="{convoUrl}?reply=5">5. not available tomorrow</a><br><br>Reply either 1, 2, 3, 4, 5</p>`,
    environmentProps: {
      subject: 'WelcomeHome Weekly Neighborhood Deal',
    },
    delay: 15000, // in milliseconds, waits 15 seconds between each customer message

    // We can schedule the conversation to be sent to multiple customers in different environments
    $cGroup: {
      name: 'Test Group',
      description: 'Test Group from my home town',
      customers: [
        {
          environment: 'phone',
          id: customerIdWithPhone
        },
        {
          environment: 'email',
          id: customerIdWithEmail,
          $agent: process.env.MY_TEST_AGENT2 || '' // Use another agent for this customer
        },
      ]
    },
  });
  console.log(`\n\tgroup: conversation: "${group.data.id}"\n`);

  // Cache the group
  await saveCache({group: group.data.id});

  console.log(`Conversation scheduled for delivery: ${oneMinuteLater.toLocaleString()}\n`);

}

loadCache()
  .then((cache) => reset(cache, scout9))
  .then(scheduleMultipleConversations)
  .then(() => console.log('Done! 🎉'))
  .catch((err) => {
    console.error(err);
  });
