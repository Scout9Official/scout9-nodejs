import { Configuration, Scout9Api } from '../packages/admin/src';

const configuration = new Configuration({
  apiKey: '1234',
});

const scout9 = new Scout9Api(configuration);


async function main() {
  console.log('Hello');
  await scout9.createCustomer({
    firstName: 'John',
    lastName: 'Doe',
  })
    .then((res) => {
      console.log('Success', res);
    })
    .catch((err) => {
      console.error('Error', err);
    })
}

main()
  .then(() => console.log('done'))
  .catch((err) => console.error(err));

export const x = 4;
