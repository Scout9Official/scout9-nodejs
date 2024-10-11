import { forward, instruct, reply } from '@scout9/app';
import moment from 'moment';
import { getAvailableDriver } from '../../lib/drivers.js';
import { createInvoice, getInvoice } from '../../lib/invoice.js';


/**
 * Example PizzaOrder workflow - this is an example of a PMT workflow that can be used to order a pizza using custom pizza entities to identify in conversation
 * @param {import('@scout9/app').WorkflowEvent} event - every workflow receives an event object
 * @returns {Promise<import('@scout9/app').WorkflowResponse>} - every workflow must return a WorkflowResponse
 */
export default async function PizzaOrder(event) {

  // If we don't have an invoice, but have a delivery method
  if (!event.context.invoiceId && event.context.delivery_method) {

    const pizzas = event.context.pizza ?? event.context.pizzas;
    const invoice = await createInvoice(event.context.pizza);
    const msg = [
      'Okay so I got...',
      pizzas.map(item => `${item.quantity} ${item.size} ${item.toppings.join(', ')}`),
      `Total of $${(invoice.total / 100).toFixed(2)}`,
      `\nThis look correct?`
    ].join('\n');

    const address = event.context.address ?? event.customer.address;
    if (!address) {
      forward(`Unable to capture customers address, manual intervention required`);
    }

    const intro = `${event.context.delivery_method === 'delivery' ? 'Order will be sent over in 30 minutes' : `Order will be ready for pickup in 30 minutes at ${address}`}.`;
    const paymentMsg = `${intro}.\n\nThe total is $${(invoice.total / 100).toFixed(2)}, you can pay at this url: ${invoice.invoiceUrl}`;

    return reply(msg).upsert({
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoiceUrl,
      invoicePaid: false
    }).anticipate(
      'Did user confirm the order is correct?',
      {message: paymentMsg},
      {forward: 'There was an issue collecting the users order (user didn\'t agree), must intervene'}
    );
  }

  if (!event.context.invoicePaid && event.context.invoiceId) {
    const invoice = await getInvoice(event.context.invoiceId || '');
    return instruct(`Let user know order is ready for payment at ${invoice.invoiceUrl}`);
  }

  if (event.context.delivery_method === 'pickup') {
    return instruct(`Let user know their order will be ready at ${moment().add(30, 'minutes').format('h:mm a')}`)
      .followup(
        `Find out if everything was delivered, and let the user know to contact if there are any issues`,
        {scheduled: moment().add(30, 'minutes').toDate(), cancelIf: {canceled: true}}
      );
  }

  if (!event.context.address && event.context.delivery_method === 'delivery') {
    return instruct(`Ask ${event.customer.firstName || 'the customer'} for their delivery address`);
  }

  if (event.context.address && !event.context.driver && !event.context.deliveryTime) {
    const {driver, deliveryEstimate} = await getAvailableDriver(event.context.address);
    return instruct(
      `Let ${event.customer.firstName || 'the customer'} know the pizza order should arrive at ${deliveryEstimate.format(
        'h:mm a')}`
    )
      .upsert({
        driver: {
          ...driver
        },
        deliveryTime: deliveryEstimate.unix()
      });
  }

  if (!event.context.delivery_method) {
    return instruct(`Ask ${event.customer.firstName || 'the customer'} if they want their pizza order for either pickup or delivery.`);
  }

  console.error('No where to go - view context:\n', JSON.stringify(event.context, null, 2));
  return forward('Logic gap in workflow');
}
