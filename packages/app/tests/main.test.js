import { ConversationState } from './utils.js';

describe('PizzaZoom End To End Testing', () => {

  const conversation = new ConversationState();

  it('Should generate a response', async () => {
    const response = await conversation.sendMessage('Hey, could I order a pepperoni pizza');
    expect(typeof response).toBe('string');
  });

});
