# Scout9's Pocket Scout API

Pocket Scout Node.js API for [Scout9](https://scout9.vercel.app/) - mimics you over your personal phone and email
for common tasks like scheduling meetings, answering questions, and more.

**⚠️ Danger**: Avoid using a Pocket Scout to autopilot your job and personal relationships, this tool is designed for
workplace productivity and not a substitute for human interaction.

## Setup

1. Register and grab an API key from [Scout9](https://scout9.vercel.app/)
2. (Optional) [Purchase](https://scout9.vercel.app/) a Scout9 email or phone number if you prefer

```bash
npm install @scout9/admin --save
```

```typescript
import Scout9Admin from '@scout9/admin';

const scout9 = Scout9Admin('s9_api_key');
```
## Example: Start a conversation

```typescript
await scout9.message.send({
  to: '+12345678900',
  message: 'Hey, bob, do you need that ladder?'
});
```

## Example: Programmatically register an agent

```typescript
const {id: agentId} = await scout9.agents.create({
  firstName: 'Tony',
  lastName: 'Soprano',
  forwardPhone: '+14327650098'
});

// Use Tony instead of the default agent (owner of account)
await scout9.message({
  to: '+12345678900',
  from: agentId,
  message: 'Hey, bob, do you need that ladder?'
});


```

## Example: Programmatically purchase a phone number

You can purchase and assign a masked phone number to your agent entity. You will have to have a [default payment method attached](https://scout9.com/b) to your account.

```typescript
// Purchase a phone - assuming I have a payment method at https://scout9.com/b
const {phoneNumber} = await scout9.agents.purchasePhone(agentId, {areaCode: 206});
console.log(`Purchased phone number: ${phoneNumber}`);
```

Purchasing a phone number will assign your phone number and its aid to your agent's `.programmablePhoneNumber`.

## Example: Programmatically add agent audio and conversation files

You can programmatically upload audio and text files to your agent registry to improve Persona Model Transformer (PMT) performance (responses sound more like you).

```typescript
import fs from 'fs/promises';
import path from 'path';

const textConvo1 = await scout9.agents.transcripts.upload(
  agentId,
  await fs.readFile('./conversation1.txt'),
  'conversation with Chris'
);
const textConvo2 = await scout9.agents.transcripts.upload(
  agentId,
  await fs.readFile('./conversation2.txt'),
  'conversation with Paulie'
);
const audioConvo1 = await scout9.agents.audio.upload(
  agentId,
  await fs.readFile('./audio.mp3'),
  'Secret Audio of me talking to Dr. Melfi (no one can know about this)'
);
```



## Step 2: Register customers

Customers are automatically added in your account when they contact any of your masked contacts. However, you can programmatically register customers by adding their email or phone.

```typescript
await scout9.customers.create({
  firstName: 'Hi',
  lastName: 'Jack',
  email: 'hi@example.com',
  phone: '+15555555555'
});
```

You can also add multiple customers
```typescript
 // Add multiple customers
  await scout9.customers.bulkCreate(
    [
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
        favorite_drink: 'lillet blanc'
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
    ]
  );
```

## Example: Schedule a conversation
```typescript
import moment from 'moment';


// Schedule a new conversation with Bob at 9:00am tomorrow
await scout9.message({
  to: '+12345678900',
  message: 'Hey, Bob, good morning!',
  scheduled: moment()
    .add(1, 'day')
    .set({hour: 9, minutes: 0, seconds: 0})
    .unix()
});


// Schedule a message to an existing conversation with Bob at 9:00am tomorrow
scout9.message({
  convo: 'convo_122343332', 
  message: 'Hey, Bob, good morning!',
  scheduled: moment()
    .add(1, 'day')
    .set({hour: 9, minutes: 0, seconds: 0})
    .unix()
});


// Or delay a message to an existing conversation with Bob 1 minute from now
scout9.message({
  convo: 'convo_122343332',
  message: 'Hey, Bob, good morning!',
  secondsDelay: 60
});
```

## Example view messages

Messages and customer responses can be viewed in the [Scout9 UI](https://scout9.vercel.app/). You can also
configure webhooks in the account portal to listen to incoming messages on your own server.

```typescript
const conversationId = 'convo_122343332';
const messages = await scout9.conversation.messages(conversationId);
console.log(`Retrieved ${messages.data.length} messages from the conversation`);

for (const message of messages.data) {
  console.log(`\t${message.role}: ${message.content}`);
}
```
```json
[
  {
    "role": "customer",
    "content": "Hey, Tony, good morning! I need that 'ladder' you mentioned." 
  },
  {
    "role": "agent",
    "content": "Hey, Paulie, I know exactly what you mean... Chris will have that ladder for you. Standby for his call."
  },
  {
    "role": "customer",
    "content": "Yeah, thanks Ton"
  }
]
```

## Example: Schedule an advanced conversation

If you need the conversation to have some additional context, you can add initial contexts to a newly created conversation. Otherwise sending the message and automatically creating a conversation to the default context.

```typescript
const customerId = '1233993';
const agentId = '10029292';

// Create a conversation with some additional context to drive the conversation
const {id: convoId} = await scout9.conversation.create({
  $customer: customerId,
  $agent: agentId,
  environment: "phone",
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

// Schedule message to 9:00 am tomorrow
await scout9.message({
  convo: convoId,
  message: 'Hey Bob, would you like a free pizza?',
  scheduled: moment()
    .add(1, 'day')
    .set({hour: 9, minutes: 0, seconds: 0})
    .unix()
});
```

## Example: Respond to a customer

If a customer triggers one of your active **workflows**, then by default your application will respond to the customer.
If you respond manually, then the Application will stop responding to the customer for the entire conversation.

```typescript
await scout9.message.send({convo: conversationId, message: 'Hey there, would you like a free pizza?'});
```

[//]: # (## Available Platforms)

[//]: # ()
[//]: # (Customers can interact with you on any of the connected platforms)

[//]: # ()
[//]: # (| Platforms    | Supported    |                                                                                                                                                    |)

[//]: # (|--------------|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------|)

[//]: # (| Android      | ⚠️ &#40;pending&#41; | &#40;free&#41; An android app is in development to enable your Pocket Scout to respond to SMS text                                                         |)

[//]: # (| iOS          | ⚠️ &#40;pending&#41; | &#40;free&#41; An ios app is in development to enable your Pocket Scout to respond to iMessages                                                            |)

[//]: # (| Web          | ✅            | &#40;free&#41; We generate conversation links for you and your customers to quickly connect, conversations expire in 1 day                                 |)

[//]: # (| Gmail        | ✅            | &#40;free&#41; Provide Scout9 authorization access to your gmail account for read/write capabilities so your Pocket Scout can respond to emails            |)

[//]: # (| Outlook      | ⚠️ &#40;pending&#41; | &#40;free&#41; Provide Scout9 authorization access to your outlook account for read/write capabilities so your Pocket Scout can respond to emails          |)

[//]: # (| Native Email | ❌            | For security and privacy concerns we currently cannot support native email systems at this time                                                    |)

[//]: # (| Discord      | ⚠️ &#40;pending&#41; | &#40;free&#41; Download the Pocket Scout Discord bot and configure workflows to respond to messages accordingly                                            |)

[//]: # (| Slack        | ⚠️ &#40;pending&#41; | &#40;free&#41; Download the Pocket Scout Slack agent and configure workflows to respond to messages accordingly                                            |)

[//]: # (| Teams        | ⚠️ &#40;pending&#41; | &#40;free&#41; Download the Pocket Scout Teams add-on                                                                                                      |)

[//]: # (| Scout9 Phone | ✅            | $5/month we provide a generated phone number you can use for your Pocket Scout to text, messages will be relayed back to your personal phone number |)

[//]: # (| Scout9 Email | ✅            | $5/month We provide a generated email with your name &#40;e.g. patrick.opie@scout9.com&#41; you can use for your Pocket Scout                              |)
