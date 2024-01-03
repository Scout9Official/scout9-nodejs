
import PizzaOrder from './workflows/pizzaOrder/workflow.js';

/**
 * @param {import('@scout9/app').WorkflowEvent} event - every workflow receives an event object
 * @returns {Promise<import('@scout9/app').WorkflowResponse>} - every workflow must return a WorkflowResponse
 */
export default async function Scout9App(event) {

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
