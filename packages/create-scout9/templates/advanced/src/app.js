import {did, instruct, forward} from '@scout9/app';
import PizzaOrder from './workflows/pizzaOrder/workflow.js';

export default async function Scout9App(event) {
  // If the user intent is pizzaOrder or the context has a pizza object, run the pizza order workflow
  if (await did('User order or want a pizza?')) {
    return PizzaOrder(event);
  } else if (event.intent.initial === 'pizza'  || !!event.context.pizza) {
    throw new Error('Scout9 \'did\' macro failed');
  } else {
    if (event.stagnationCount < 2) {
      return instruct('Double check if the user is looking to order a pizza from us at PizzaZoom');
    }
    return forward('Conversation forwarded for manual intervention');
  }
}
