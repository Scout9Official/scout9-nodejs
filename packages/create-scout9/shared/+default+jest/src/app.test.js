import { Scout9Test } from '@scout9/app/testing-tools';

describe('Scout9App', () => {

  it('Should try to ask customer what type of pizza they want', async () => {
    const test = new Scout9Test();
    await test.load();

    await test.send('Hey I would like a pizza');

    expect(test.messages[1].content).toEqual('Figure out what pizza sizes, toppings are needed for order');
  });

});
