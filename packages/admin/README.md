# Scout9 API

Node.js API for [Scout9](https://www.scout9.com)

```bash
npm install @scout9/admin --save
```

```typescript
import { Configuration, Scout9Api } from '@scout9/admin';

const configuration = new Configuration({
  apiKey: '', // Your API key
});

const scout9 = new Scout9Api(configuration);

const customer = scout9.createCustomer({
  firstName: 'Hi',
  lastName: 'Jack',
  email: 'hi@example.com',
  phone: '+15555555555',
})
  .then((res) => {
    console.log('Success', res);
  })
  .catch((err) => {
    console.error('Error', err);
  });


const agent = scout9.createAgent({
  firstName: 'Bye',
  lastName: 'Jack',
  email: 'jack@company.com',
  phone: '+15555555552',
})
  .then((res) => {
    console.log('Success', res);
  })
  .catch((err) => {
    console.error('Error', err);
  });


const conversation = await scout9.startConversation({
  customer: customer.id,
  agent: agent.id,
  channel: 'sms',
  message: 'Hello, how can I help you?',
})
  .then((res) => {
    console.log('Success', res);
  })
  .catch((err) => {
    console.error('Error', err);
});
```
