import {Scout9CRM} from '@scout9/crm';

const crm = new Scout9CRM({apiKey: process.env.SCOUT9_API_KEY});

/**
 * This an example adapter for a mock database to your CRM
 */
export const customerDb = {
  query: async (
    query,
    page,
    limit,
    orderBy,
    endAt,
    startAt,
  ) => crm.query(query, page, limit, orderBy, endAt, startAt),
  get: async (id) => crm.get(id),
  add: async (customer) => crm.add(customer),
  update: async (id, updates) => crm.update({...updates, $id: id}),
  remove: async (id) => crm.remove(id)
}
