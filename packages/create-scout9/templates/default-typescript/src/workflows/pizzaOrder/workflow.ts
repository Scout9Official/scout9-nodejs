import type { WorkflowEvent, WorkflowResponse } from '@scout9/app';
import moment from 'moment';
import { getAvailableDriver } from '../../lib/drivers';
import { createInvoice, getInvoice } from '../../lib/invoice';

/**
 * Example PizzaOrder workflow - this is a simple example of a workflow that can be used to order a pizza
 * @param {import('@scout9/app').WorkflowEvent} event - the workflow event that every workflow must have
 * @returns {Promise<import('@scout9/app').WorkflowResponse>} - the response that every workflow must return
 */
export default async function PizzaOrder(
  {
    context,
    customer
  }: WorkflowEvent): Promise<WorkflowResponse<any>> {

  if (!context.pizza) {
    return {
      instructions: 'Figure out what pizza sizes, toppings are needed for order'
    };
  }

  if (!context.invoiceId && context.delivery_method) {
    const invoice = await createInvoice(context.pizza);
    const intro = `${context.delivery_method === 'delivery' ? 'Order will be sent over in 30 minutes' : 'Order will be ready for pickup in 30 minutes at 123 Nark Ave Seattle WA 98122'}.`;
    return {
      message: `${intro}.\n\nThe total is $${(invoice.total/100).toFixed(2)}, you can pay at this url: ${invoice.invoiceUrl}`,
      contextUpsert: {
        invoiceId: invoice.id,
        invoicePaid: false
      }
    }
  }

  if (!context.invoicePaid && context.invoiceId) {
    if (!context.invoiceId) {
      return {forward: true};
    }
    const invoice = await getInvoice(context.invoiceId || '');
    return {
      instructions: `Let user know order is ready for payment at ${invoice.invoiceUrl}`
    }
  }

  if (context.delivery_method === 'pickup') {
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

  if (!context.address && context.delivery_method === 'delivery') {
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

  if (!context.delivery_method) {
    return {
      instructions: `Ask ${customer.firstName || 'the customer'} if they want their pizza order for either pickup or delivery.`
    }
  }

  console.error('No where to go - view context:\n', JSON.stringify(context, null, 2));
  return {
    forward: true,
    // notes: 'No where to go, something happened'
  }
}
