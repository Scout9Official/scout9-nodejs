import { customerDb } from '../../lib/customer-db.js';
import { EventResponse, QueryApiFunction } from '@scout9/app';

/**
 * Required entity - use this to sync with your CRM
 *
 * Query customer info from your CRM
 * @returns {Promise<import('@scout9/app').EventResponse<Array<import('@scout9/app').Customer>>>}
 */
export const QUERY: QueryApiFunction = async ({searchParams}) => {
  const {page, q, orderBy, endAt, startAt, limit} = searchParams;
  const customers = await customerDb.query(
    q,
    page ? parseInt(page.toString()) : undefined,
    limit ? parseInt(limit.toString()) : undefined,
    orderBy ? parseInt(orderBy.toString()) : undefined,
    endAt ? parseInt(endAt.toString()) : undefined,
    startAt ? parseInt(startAt.toString()) : undefined,
  );
  return EventResponse.json(customers, {status: 200});
};
