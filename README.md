# Scout9's Pocket Scout API  🦴
Pocket Scout Node.js API for [Scout9](https://pocket-guide.vercel.app/)
#### ⚠️ *API is not fully released, caution using this API, ping Patrick for questions*

___


## Pocket Scout When You're Away 🏝🍻😎

#### Personal email or phone auto responses that are **100% your voice**

👉 Programmable conversations

👉 Interject into conversations whenever


### Things to Pocket Scout while you're asleep 🌙🤗
- 📦 [Fulfilling a customer Orders](examples/)
- 📝 [Responding to homework questions](examples/)
- 💔 [Politely rejecting dates](examples/)
- 📆 [Scheduling meetings or appointments](examples/)
- 🔊 [Promoting an event](examples/)
- 🙋‍ [Handling customer support](/examples)
- 📋 [Surveying customers](/examples)
- 💸 [Generating sales leads](/examples)
- ✍️ [Registering customers](/examples)
- ⏰ [Handling event reminders](/examples)
- 📧 [Handling event Follow-ups](/examples)
- 🗣️ [Gathering user feedback](/examples)
- 📊 [Gathering poll data](/examples)
- 🎂 [Saying happy birthday](/examples)
- ...[and more](/examples)!

All 100% from your voice and personal email or phone number!
___



## Setup

1. Register and grab an API key from [Scout9](https://pocket-guide.vercel.app/)
2. (Optional) [Purchase](https://pocket-guide.vercel.app/) a Scout9 email or phone number if you prefer

```bash
npm install @scout9/admin --save
```

```typescript
import { Configuration, PocketScoutApi } from '@scout9/admin';

const configuration = new Configuration({
  apiKey: '', // Your API key
});

const pocketScout = new PocketScoutApi(configuration);
```
___

# Full Example
## Step 1: Register yourself as an agent

```typescript
import fs from 'fs/promises';
import path from 'path';

// Registered your self as an agent within the Pocket Scout context
const agentId = await pocketScout
  .agentRegister({
    firstName: 'Tony',
    lastName: 'Sopranos',
    title: 'Boss',

    // A brief description of yourself to set the tone
    context: 'I\'m Tony. Look, this life, it ain\'t for the faint-hearted. I got responsibilities - to my family and my crew. Loyalty, respect, that\'s everything. When I deal with my associates, I\'m direct. I expect them to come to me straight, no BS. Some might call me tough, even ruthless, but it\'s the world we\'re in. You show weakness, you\'re done. I\'ve got a code, though. If you\'re loyal to me, I\'ll have your back. But cross me? That\'s something you\'ll regret. It\'s business, but it\'s also personal. We\'re a family.',

    // Must provide one of the following...
    forwardPhone: '+15555555544', // my personal phone number to get notified of in coming messages
    forwardEmail: 'tonyboss@gmail.com', // my personal email to get notified of in coming messages


    /**
     * (optional) either a provided Scout9 phone number or your personal
     * ⚠️ Note: If a personal number, you'll be asked to download the Pocket Scout app to enable Pocket Scout auto responses
     */
    programmablePhoneNumber: '+15555555555',

    /**
     * (optional) either a provided Scout9 email or your personal
     * ⚠️ Note: If a personal email, you'll be asked to authenticate your Pocket Scout onto your email account
     */
    programmableEmail: `tonyboss@gmail.com`,


    /**
     * Optional conversation data to help your Pocket Scout capture your tone
     * See ./examples/samples to see coversation text format or enter JSON manually
     */
    conversations: [
      await pocketScout.fileCreate(await fs.readFile('./conversation1.txt'), 'conversation with Chris')
        .then(res => res.data.id),
      await pocketScout.fileCreate(await fs.readFile('./conversation2.txt'), 'conversation with Paulie')
        .then(res => res.data.id),
    ],

    /**
     * (optional) audio data to help your Pocket Scout capture your tone
     * (Eventually your Pocket Scout can use this to generate voice responses, but for now its more of a way to capture your tone/character)
     */
    audio: [
      await pocketScout.fileCreate(await fs.readFile('./audio.mp3'),
        'Secret Audio of me talking to Dr. Melfi (no one can know about this)').then(res => res.data.id),
    ]
  })
  .then((res) => res.data.id);
```

## Step 2: Register customers

You can register customers by adding their email or phone.

**⚠️ Note:** If you are using a provided Scout9 email or phone number, customers must opt-in to receive messages or
initiate conversations with you.

```typescript
// Create 1 customer
const customerId = await pocketScout.createCustomer({
  firstName: 'Hi',
  lastName: 'Jack',
  email: 'hi@example.com',
  phone: '+15555555555',
})
  .then((res) => res.data.id);

// Or create multiple customers
const customers: Customer[] = [
  {
    // scout9 internal values
    name: 'Tony Soprano',
    phone: null,
    email: null,

    // customer properties
    role: 'boss',
    customId: 'tony-soprano',
    fun_fact: 'I love my ducks'
  },
  {
    // scout9 internal values
    name: 'Carmela Soprano',
    phone: null,
    email: null,

    // customer properties
    favorite_drink: 'lillet blanc',
  },
  {
    name: 'Salvatore Bonpensiero',
    firstName: 'Salvatore',
    phone: null,
    email: null,
    $agent: 'skip_lipari', // agent id

    // customer properties
    rat: true,
    location: 'New Jersey coast',
    nickname: 'Big 🐈',
    lastSeason: 'season 1'
  }
];
await pocketScout.customersCreate({customers});
```

## Step 3: Initiate a conversation

Initiate a default generic conversation with an existing customer, use the optional **initialMessage** to provide some
guidance.

```typescript
const initialMessage = `Hey there, would you like a free pizza?`;

const conversation = await pocketScout.conversationCreate({
  customer: customerId,
  agent: agentId,
  environment: 'phone', // This will attempt to contact via SMS
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

// Send a message
await pocketScout.message({convo: conversation.data.id, message: initialMessage});
```

## Step 4: Test your conversation

Test your conversation before you send a message.

```typescript
const initialMessage = `Hey there, would you like a free pizza?`;

const conversationId = await pocketScout.conversationCreate({
  customer: customerId,
  agent: agentId,
  environment: 'phone', // This will attempt to contact via SMS
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
}).then((res) => res.data.id);

const anticipatedCustomerResponses = [
  'Yes please!',
  'No thanks',
  'What kind of pizza are we talking about?',
  'I\'m vegan, do you have vegan pizza?',
  'I hate you, stop texting me',
  'I love you, keep texting me',
];
for (const customerResponse of anticipatedCustomerResponses) {
  const generatedResponse = await pocketScout.generate({
    convo: conversationId,
    mocks: {
      messages: [
        {
          role: 'customer',
          content: customerResponse
        }
      ]
    }
  })
    .then((res) => res.data.content);

  console.log(`\n\tCustomer: "${customerResponse}"\n\tAgent: "${generatedResponse}"\n`);
}

console.log(`Looks good 👍 - sending messing to customer`);
await pocketScout.message({convo: conversation.data.id, message: initialMessage});
```

## Step 5: View your conversation

Messages and customer responses can be viewed in the [Scout9 UI](https://pocket-guide.vercel.app/). You can also
configure webhooks in the account portal to listen to incoming messages on your own server.

```typescript
const messages = await pocketScout.messages(conversationId);
console.log(`Retrieved ${messages.data.length} messages from the conversation`);

for (const message of messages.data) {
  console.log(`\t${message.role}: ${message.content}`);
}
```

## Advanced Examples

### Schedule a conversation

See [simple-schedule-conversation.ts](examples/simple-schedule-conversation.ts) on how to test a conversation before its
created.

```typescript
const initialMessage = `Hey there, would you like a free pizza?`;

const conversation = await pocketScout.scheduleConversation({
  customer: customerId,
  agent: agentId,
  environment: 'phone', // This will attempt to contact via SMS
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
```

### Define workflows

Conversations by default use a generic **workflow** procedure that has a stated goal to guide your Pocket Scout in a
conversation. Initiate a conversation with a clear specific objective using the **workflow** api.

See [full workflow example](examples/create-workflow.ts)

```typescript
const workflow: CreateWorkflowRequest = {
  name: 'Order Pizza',

  // Define the goal of the workflow
  context: 'When a customer wants to order a pizza, I will determine what pizza they need and when, then determine if it needs to be picked up or delivered to their address.',

  // fields follow this boolean structure -> (a || b) && (c || d), if true then the context will be inserted into the conversation.
  fields: contextFields,

  // Custom context and how this workflow will be triggered from a customer conversation
  initiators: {
    // We need to describe the fields that we want to collect from the customer in this workflow
    // entity fields such as firstName, address, location, etc are built in and will be provided by default
    entities: customEntities,
    documents: workflowTriggerStatements
  },
};

const workflowId = await pocketScout.workflowCreate(workflow).then(res => res.data.id);

console.log(`Created workflow with id: ${workflowId}`);
```

Use the `.fields` property to guide the conversation to accomplish the goal. In this example we ask the user for the
pizza size, sauce, toppings, when, delivery or take out, and if delivery then the address.

```typescript
const contextFields: ConversationContextField[] = [
  {
    id: 'determineSize',
    context: 'Determine what size pizza the customer wants, we have small, medium, and large',
    conditions: [
      {
        conditions: [
          {
            key: 'pizzaSize', // If we don't know the pizzaSize, then insert this context
            operator: 'notExists',
            value: true
          }
        ]
      }
    ]
  },
  // ... other field definitions
]
```

In the `.initiators.entities` we can define custom fields that the Pocket Scout can search for and store in the
conversation

In this example we include a custom entity field `pizzaSize` which can be described as a small or personal pizza.

```typescript
const customEntities = [
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
  // ... other custom entities or pizza sizes
]
```

Then we need some statements that can trigger the workflow and context fields that get stored in `.initiators.documents`.

```typescript
 const workflowTriggerStatements = [
  {text: 'I would like to order a %pizzaSize%  %pizzaType%', id: 'request'},
  // ... more examples that might trigger the workflow
];
```

### Respond to a customer

If a customer triggers one of your active **workflows**, then by default your Pocket Scout will respond to the customer.
If you respond manually, then the Pocket Scout will stop responding to the customer for the entire conversation.

```typescript
await pocketScout.message({convo: conversationId, message: 'Hey there, would you like a free pizza?'});
```

## Available Platforms

Customers can interact with you (and your Pocket Scout) on any of the connected platforms

| Platforms    | Supported            |                                                                                                                                                     |
|--------------|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Android      | ⚠️ (pending)         | (free) An android app is in development to enable your Pocket Scout to respond to SMS text                                                          |
| iOS          | ⚠️ (pending)         | (free) An ios app is in development to enable your Pocket Scout to respond to iMessages                                                             |
| Web          | ✅                    | (free) We generate conversation links for you and your customers to quickly connect, conversations expire in 1 day                                  |
| Gmail        | ✅                    | (free) Provide Scout9 authorization access to your gmail account for read/write capabilities so your Pocket Scout can respond to emails             |
| Outlook      | ⚠️ (pending)         | (free) Provide Scout9 authorization access to your outlook account for read/write capabilities so your Pocket Scout can respond to emails           |
| Native Email | ❌                    | For security and privacy concerns we currently cannot support native email systems at this time                                                     |
| Discord      | ⚠️ (pending)         | (free) Download the Pocket Scout Discord bot and configure workflows to respond to messages accordingly                                             |
| Slack        | ⚠️ (pending)         | (free) Download the Pocket Scout Slack agent and configure workflows to respond to messages accordingly                                             |
| Teams        | ⚠️ (pending)         | (free) Download the Pocket Scout Teams add-on                                                                                                       |
| Scout9 Phone | ✅                    | $5/month we provide a generated phone number you can use for your Pocket Scout to text, messages will be relayed back to your personal phone number |
| Scout9 Email | ✅                    | $5/month We provide a generated email with your name (e.g. patrick.opie@scout9.com) you can use for your Pocket Scout                               |
| Instagram    | ⚠️ (pending/limited) | (free) The Pocket Scout desktop or mobile app will auto generate responses but requires manual insertion                                            |
| Tiktok       | ⚠️ (pending/limited) | (free) The Pocket Scout desktop or mobile app will auto generate responses but requires manual insertion                   |
| Facebook     | ⚠️ (pending/limited) | (free) The Pocket Scout desktop or mobile app will auto generate responses but requires manual insertion                                            |



**⚠️ Warning**: Avoid using a Pocket Scout to autopilot your job and personal relationships, this tool is designed for
workplace productivity and not a substitute for human interaction.
