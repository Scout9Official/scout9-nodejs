import { Customer } from '@scout9/admin';
import Scout9CRM from '@scout9/crm';

const crm = new Scout9CRM({apiKey: process.env.SCOUT9_API_KEY});

/**
 * This an example adapter for a mock database to your CRM
 */
export const customerDb: any = {
  query: async (
    query?: {field: string; operator: string; value: any} | undefined,
    page?: number | undefined,
    limit?: number | undefined,
    orderBy?: string | undefined,
    endAt?: string | number | undefined,
    startAt?: string | number | undefined
  ) => crm.query(query, page, limit, orderBy, endAt, startAt),
  get: async (id: string) => crm.get(id),
  add: async (customer: Customer) => crm.add(customer),
  update: async (id: string, updates: Partial<Customer>) => crm.update({...updates, $id: id}),
  remove: async (id: string) => crm.remove(id)
}
