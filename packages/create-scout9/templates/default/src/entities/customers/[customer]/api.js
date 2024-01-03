import { json } from '@scout9/app';

// @TODO replace with your CRM api
import { customerDb } from '../../../lib/customer-db.js';

/**
 * Get customer info from your CRM
 * @returns {Promise<import('@scout9/app').EventResponse<import('@scout9/app').Customer>>}
 */
export const GET = async ({params}) => {
  return json(await customerDb.get(params.customer));
};

/**
 * When a customer is created on scout9's side
 *
 * Example:
 *    A new or unrecognized customer has contacted an agent. Scout9 has captured some preliminary information
 *    about them and sent this POST request. Take the information to either add a new customer record to your CRM
 *    or return an existing customer id to map the correct customer document.
 *
 * @returns {Promise<import('@scout9/app').EventResponse>}
 */
export const POST = async ({params, body: newCustomer}) => {
  // Scout9 will generate random id for new customers, but whatever id you return back will be used for the new customer
  const {id: crmId} = await customerDb.add({$id: params.customer, newCustomer});
  return json({success: true, id: crmId}, {status: 200});
};

/**
 * New customer info revealed, use this to save the customer info to your CRM
 *
 * Example:
 *    In a conversation, if any new data is found, Scout9 will send a PUT or PATCH request to allow for you to update
 *    your CRM accordingly.
 *
 * @returns {Promise<import('@scout9/app').EventResponse>}
 */
export const PUT = async ({params, body: updatedCustomer}) => {
  // const id = params.customer;

  console.log('updatedCustomer', updatedCustomer);
  // @TODO REST call  to api to save customer info

  // @TODO REST call to api to save customer info
  return json({success: true}, {status: 200});
};


/**
 * Customer request to be removed from platform, use this to remove/update the customer info from your CRM
 *
 * Example:
 *    A customer has opt-out of text messaging, Scout9 will send a DELETE message for you to remove any data, returning
 *    back success: true will then have Scout9 delete any data on their end as well.
 *
 * @returns {Promise<import('@scout9/app').EventResponse>}
 */
export const DELETE = async ({params, request}) => {
  await customerDb.remove(params.customer);
  return json({success: true}, {status: 200});
};
