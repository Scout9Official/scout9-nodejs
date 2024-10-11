import { context, did, forward, instruct } from '@scout9/app';
import { pizzaExamples, addressExamples } from '../../lib/examples.js';

/**
 * Example PizzaOrder workflow - this is a simple example of a workflow that can be used to order a pizza
 */
export default async function PizzaOrder(event) {

  const customerName = event.customer.name ?? 'the user';

  if (did('The user not give us their pizza order?')) {
    return instruct(`Check if ${customerName} is trying to order a pizza`);
  }
  // If we don't have an invoice, but have a delivery method
  const order = context('Grab the users pizza order', pizzaExamples);
  if (!order.pizzas || !order.pizzas.length) {
    forward('Unable to parse the users pizza order, manual assistance required');
  }

  const pizzas = order.pizzas;

  if (await did('The user not tell us if they wanted to pickup or have their pizza delivered?')) {
    return instruct(`Ask ${customerName} if they would prefer takeout or delivery. If delivery, lets get their address.`)
      .upsert({pizzas});
  }

  const isDelivery = await did('The user want their food delivered?');

  if (isDelivery) {

    if (await did('User not provide us their address?')) {
      return instruct(`Ask ${customerName} for their address`).upsert({pizzas});
    }

    const {address} = await context(`What is the users address?`, addressExamples)

    if (!address) {
      return forward('Unable to parse users address');
    }

    // Is this user serviceable?
    if (did(`Is the address "${address}" too far from Seattle? (max 40 miles)`)) {
      return instruct("Let user know their address is too far away")
        .forward("User requested service outside our jurisdiction");
    }

    // Send to base for delivery order, manually send invoice
    return instruct(`Let ${customerName} know their pizza should be delivered in 30-60 minutes and we will follow up with a payment link soon.`)
      .forward('Order up! Send payment url to customer')
      .anticipate(
        'Did the user want to cancel the order or mentioned they are too far away from pickup location?',
        {instructions: `Let ${customerName} know the order is cancelled`, forward: `${customerName}'s order has been cancelled`},
        {instructions: `Let ${customerName} know to call this number if they need any help or need to change the order.`}
      )

  } else {

    // Send to base for pickup order, user pays onsite
    return instruct(`Let ${customerName} know their pizza should be ready for pick at 12298 main st Seattle WA 89122 in 30-60 minutes`)
      .forward('Order up! Pick up order')
      .anticipate(
        'Did the user want to cancel the order or mentioned they are too far away from pickup location?',
        {instructions: `Let ${customerName} know the order is cancelled`, forward: `${customerName}'s order has been cancelled`},
        {instructions: `Let ${customerName} know to call this number if they need any help or need to change the order.`}
      )

  }
}
