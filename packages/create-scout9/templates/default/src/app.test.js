import { createMockWorkflowEvent } from '@scout9/app';
import Scout9App from './app.js';

describe('Scout9App', () => {

  it('Should try to ask customer what type of pizza they want', async () => {
    const event = createMockWorkflowEvent('Hey I would like a pizza', 'pizzaOrder');

    // Alternatively you can run the app using sendEvent
    // const response = await sendEvent(event);

    const response = await Scout9App(event);
    expect(response.instructions).toEqual('Figure out what pizza sizes, toppings are needed for order');
  });

});
