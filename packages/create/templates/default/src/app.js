import { EventResponse } from '@scout9/app';

import PizzaOrder from './workflows/pizzaOrder/workflow.js';

export default async function Scout9App(event) {

  console.log(EventResponse);
  if (event.intent === 'pizzaOrder') {
    // run pizza order workflow
    return PizzaOrder(event);
  } else {
    if (event.stagnationCount < 2) {
      return {
        instructions: 'Double check if the user is looking to order a pizza'
      }
    } else {
      // End auto replies, forward to agent for manual intervention
      return {
        forward: true,
      }
    }
  }

}
