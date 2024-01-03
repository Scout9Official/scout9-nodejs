import { customerDb } from '../../lib/customer-db.js';
import { EventResponse } from '@scout9/app';

/**
 * Required entity - use this to sync with your CRM
 *
 * Query customer info from your CRM
 * @returns {Promise<import('@scout9/app').EventResponse<Array<import('@scout9/app').Customer>>>}
 */
export const QUERY = async ({searchParams}) => {
  const {page, q, orderBy, endAt, startAt, limit} = searchParams;
  const customers = await customerDb.query(
    q,
    page ? parseInt(page) : undefined,
    limit ? parseInt(limit) : undefined,
    orderBy ? parseInt(orderBy) : undefined,
    endAt ? parseInt(endAt) : undefined,
    startAt ? parseInt(startAt) : undefined,
  );
  return EventResponse.json(customers, {status: 200});
};
