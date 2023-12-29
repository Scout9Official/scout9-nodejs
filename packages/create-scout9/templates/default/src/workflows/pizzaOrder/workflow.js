import moment from 'moment';
import { getAvailableDriver } from '../../lib/drivers.js';
import { createInvoice, getInvoice } from '../../lib/invoice.js';

/**
 * Example PizzaOrder workflow - this is a simple example of a workflow that can be used to order a pizza
 * @param {WorkflowEvent} event - every workflow receives an event object
 * @returns {Promise<WorkflowResponse>} - every workflow must return a WorkflowResponse
 */
export default async function PizzaOrder(
  {
    context,
    customer
  }) {

  if (!context.pizza) {
    return {
      instructions: 'Figure out what pizza sizes, toppings are needed for order'
    };
  }

  if (!context.deliveryMethod) {
    return {
      instructions: `Determine if ${customer?.firstName || 'the customer'} is doing a delivery or pickup and determine time of pickup/delivery`
    };
  }

  if (!context.invoiceId) {
    const invoice = await createInvoice(context.pizza);
    return {
      instructions: `Send invoice to customer`,
      message: `Order created - $${(invoice.total/100).toFixed(2)} you can pay at ${invoice.invoiceUrl}`,
      contextUpsert: {
        invoiceId: invoice.id,
        invoicePaid: false
      }
    }
  }

  if (!context.invoicePaid) {
    if (!context.invoiceId) {
      return {forward: true};
    }
    const invoice = await getInvoice(context.invoiceId || '');
    return {
      instructions: `Let user know order is ready for payment at ${invoice.invoiceUrl}`
    }
  }

  if (context.deliveryMethod === 'pickup') {
    return [
      {
        instructions: `Let user know their order will be ready at ${moment().add(30, 'minutes').format('h:mm a')}`
      },
      {
        instructions: `Find out if everything was delivered, and let the user know to contact if there are any issues`,
        forward: {
          mode: 'after-reply'
        },
        scheduled: moment().add(30, 'minutes').unix()
      }
    ];
    // @TODO - delay and notify user for feedback and if they got their pizza
  }

  if (!context.address && context.deliveryMethod === 'delivery') {
    return {
      instructions: `Ask ${customer.firstName || 'the customer'} for their delivery address`
    };
  }

  if (context.address && !context.driver && !context.deliveryTime) {
    const {driver, deliveryEstimate} = await getAvailableDriver(context.address);
    return {
      instructions: `Let ${customer.firstName || 'the customer'} know the pizza order should arrive at ${deliveryEstimate.format(
        'h:mm a')}`,
      contextUpsert: {
        driver: {
          ...driver
        },
        deliveryTime: deliveryEstimate.unix()
      }
    };
  }

  return {
    forward: true
  }
}
