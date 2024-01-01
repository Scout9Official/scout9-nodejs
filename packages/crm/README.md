# Scout9 CRM

By default every `@scout9/app` is created using this CRM package which basically adds a default database to handle CRM
related information to be enrich your customer experience.

## Installation

```bash
npm install @scout9/crm --save
```

## Usage

```js
import { Scout9CRM } from '@scout9/crm';

const crm = new Scout9CRM({apiKey: 'your-api-key'});

crm.get('customerId')
.then(customer => {
    console.log(customer);
});

// Add any customer relevant information you need to better help guide your @scout9/app
crm.add({name: 'John Doe', email: '', phone: '', premiumCustomer: true})
.then(({id}) => {
    console.log('Customer created with id: ' + id);
});
```
