import { Configuration, Scout9Api } from '@scout9/admin';

/**
 * A default customer CRM API
 *
 * @TODO add zod for type checking
 */
export default class Scout9CRM {

  /**
   * @param {{apiKey?: string}} opts
   */
  constructor(opts = {}) {
    if (!opts.apiKey) {
      throw new Error(`Missing Scout9 apiKey`);
    }
    const configuration = new Configuration({
      apiKey: opts.apiKey,
    });

    this.admin = new Scout9Api(configuration);
  }

  /**
   *
   * @param {{field: string; operator: string; value: any} | undefined} query - query object
   * @param {number | undefined} page - page number
   * @param {number | undefined} limit - page limit
   * @param {string | undefined} orderBy - key of document to order by
   * @param {string | number | undefined} endAt - value of key
   * @param {string | number | undefined} startAt - value of key
   * @returns {Promise<Array<import('@scout9/admin').Customer>>}
   */
  async query(query, page, limit, orderBy, endAt, startAt) {
    const querystring = query ? `${query.field},${query.operator},${query.value}` : '';
    const res = await this.admin.customers(querystring);
    return res.data;
  }

  /**
   *
   * @param {string} id
   * @returns {Promise<import('@scout9/admin').Customer | null>}
   */
  async get(id) {
    const response = await this.admin.customer(id);
    return response.data || null;
  }

  /**
   * Add one or more customers
   * @param {(import('@scout9/admin').Customer | Array<import('@scout9/admin').Customer>)} customerOrCustomers
   * @returns {Promise<import('@scout9/admin').CreateCustomersResponse | import('@scout9/admin').CustomerCreateResponse>}
   */
  async add(customerOrCustomers) {
    if (Array.isArray(customerOrCustomers)) {
      const res = await this.admin.customersCreate({
        customers: customerOrCustomers
      });
      return res.data;
      // @TODO check/listen to operation
    }  else {
      const res = await this.admin.customerCreate(customerOrCustomers);
      return res.data;
    }
  }

  /**
   * Update one or more customers
   * @param {(Partial<import('@scout9/admin').Customer> & {$id: string; name: string}) | Array<(Partial<import('@scout9/admin').Customer> & {$id: string; name: string})>} updateOrUpdates
   * @returns {Promise<import('@scout9/admin').UpdateCustomersResponse | import('@scout9/admin').CustomerUpdateResponse>}
   */
  async update(updateOrUpdates) {
    if (Array.isArray(updateOrUpdates)) {
      if (!updateOrUpdates.every((u => !!u.$id))) {
        throw new Error(`Missing $id property on customer update`);
      }
      const res = await this.admin.customersUpdate({
        customers: updateOrUpdates
      });
      return res.data;
    } else {
      if (!updateOrUpdates.$id) {
        throw new Error(`Missing $id property on customer update`);
      }
      const res = await this.admin.customerUpdate(updateOrUpdates);
      return res.data;
    }
  }

  /**
   * Remove one or more customers
   * @param {string | string[]} idOrIds
   * @returns {Promise<import('@scout9/admin').DeleteCustomersResponse | import('@scout9/admin').CustomerDeleteResponse>}
   */
  async remove(idOrIds) {
    if (Array.isArray(idOrIds)) {
      const res = await this.admin.customersDelete(idOrIds);
      return res.data;
    } else {
      const res = await this.admin.customerDelete(idOrIds);
      return res.data;
    }
  }

}
