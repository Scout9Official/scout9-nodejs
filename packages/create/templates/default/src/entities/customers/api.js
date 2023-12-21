import { EventResponse } from '../../../platform/src/index.js';
import { customerMockDb } from '../../lib/customer-mock-db.js';

/**
 * Required entity - use this to sync with your CRM
 *
 * Query customer info from your CRM
 */
export const QUERY = async ({searchParams}) => {
  const {page, q, orderBy, endAt, startAt, limit} = searchParams;
  const customers = await customerMockDb.query(
    q,
    page ? parseInt(page) : undefined,
    limit ? parseInt(limit) : undefined,
    orderBy ? parseInt(orderBy) : undefined,
    endAt ? parseInt(endAt) : undefined,
    startAt ? parseInt(startAt) : undefined,
  );
  return EventResponse.json(customers, {status: 200});
};
