import 'dotenv/config';
import { PocketScoutApi, Configuration, Customer } from '@scout9/admin/src';
import { ILocalCache, loadCache, reset, saveCache } from './_utils';

const configuration = new Configuration({
  apiKey: process.env.MY_S9_API_KEY, // Replace with your API key
});
const pocketScout = new PocketScoutApi(configuration);


/**
 * Simple conversation between a customer and agent
 */
async function addCustomers(cache: ILocalCache) {

  console.log(`Adding customers`);
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
  ]
  const res = await pocketScout.customersCreate({
    customers
  });
  console.log(`Added customers using a bulk operation, operation id: ${res.data.$operation}`);

  await saveCache({operation: res.data.$operation});

  // Check the status of the bulk operation

  const operation = await pocketScout.operation(res.data.$operation);

  console.log(`Operation status:\n${JSON.stringify(operation.data, null, 2)}`);
}

loadCache()
  .then((cache) => reset(cache, pocketScout))
  .then(addCustomers)
  .then(() => console.log('Done! 🎉'))
  .catch((err) => {
    console.error(err);
  });
