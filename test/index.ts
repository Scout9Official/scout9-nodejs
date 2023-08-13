import 'dotenv/config'
import { Scout9Api, Configuration } from '@scout9/admin/src';

const fs = require('fs');
const path = require('path');

const configuration = new Configuration({
  apiKey: process.env.SCOUT9_API_KEY,
});

export const scout9 = new Scout9Api(configuration);

async function main() {
  const customers = await scout9.getCustomers();
  // fs.writeFileSync(path.resolve(__dirname, './customers.json'), JSON.stringify(customers, null, 2));
  console.log(customers.data.length, 'Customers');
}

main()
  .then(() => console.log('done'))
  .catch((err) => {
    console.error(err);
  });
