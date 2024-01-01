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
   * @param {string} query - query string
   * @param {number} page - page number
   * @param {number} limit - page limit
   * @param orderBy
   * @param endAt
   * @param startAt
   * @returns {Promise<Array<import('@scout9/admin').Customer>>}
   */
  async query(query, page, limit, orderBy, endAt, startAt) {
    const res = await this.admin.customers(query);
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
   * @returns {Promise<void>}
   */
  async add(customerOrCustomers) {
    if (Array.isArray(customerOrCustomers)) {
      await this.admin.customersCreate({
        customers: customerOrCustomers
      });
      // @TODO check/listen to operation
    }  else {
      await this.admin.customerCreate(customerOrCustomers);
    }
  }

  /**
   * Update one or more customers
   * @param {(Partial<import('@scout9/admin').Customer> & {$id: string}) | Array<(Partial<import('@scout9/admin').Customer> & {$id: string})>} updateOrUpdates
   * @returns {Promise<void>}
   */
  async update(updateOrUpdates) {
    if (Array.isArray(updateOrUpdates)) {
      if (!updateOrUpdates.every((u => !!u.$id))) {
        throw new Error(`Missing $id property on customer update`);
      }
      await this.admin.customersUpdate({
        customers: updateOrUpdates
      });
    } else {
      if (!updateOrUpdates.$id) {
        throw new Error(`Missing $id property on customer update`);
      }
      return this.admin.customerUpdate(updateOrUpdates);
    }
  }

  /**
   * Remove one or more customers
   * @param idOrIds
   * @returns {Promise<import("axios").AxiosResponse<DeleteCustomerResponse, any>|import("axios").AxiosResponse<DeleteCustomersResponse, any>>}
   */
  async remove(idOrIds) {
    if (Array.isArray(idOrIds)) {
      return this.admin.customersDelete(idOrIds);
    } else {
      return this.admin.customerDelete(idOrIds);
    }
  }

}
