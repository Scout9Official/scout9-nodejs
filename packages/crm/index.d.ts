import type {
    CustomerCreateResponse,
    CustomerDeleteResponse,
    CustomerUpdateResponse,
    CreateCustomersResponse,
    Customer,
    DeleteCustomersResponse,
    UpdateCustomersResponse
} from '@scout9/admin';

/**
 * A default customer CRM API
 */
export default class Scout9CRM {

    /**
     * @param {{apiKey?: string}} opts
     */
    constructor(opts: {
        apiKey?: string
    });

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
    public query(
        query?: {
            field: string;
            operator: string;
            value: any
        } | undefined,
        page?: number | undefined,
        limit?: number | undefined,
        orderBy?: string | undefined,
        endAt?: string | number | undefined,
        startAt?: string | number | undefined
    ): Promise<Customer[]>;

    /**
     *
     * @param {string} id
     * @returns {Promise<import('@scout9/admin').Customer | null>}
     */
    public get(id: string): Promise<Customer | null>;

    /**
     * Add one or more customers
     * @param {(import('@scout9/admin').Customer | Array<import('@scout9/admin').Customer>)} customerOrCustomers
     * @returns {Promise<import('@scout9/admin').CreateCustomersResponse | import('@scout9/admin').CreateCustomerResponse>}
     */
    public add(customerOrCustomers: Customer | Customer[]): Promise<CustomerCreateResponse | CreateCustomersResponse>;

    /**
     * Update one or more customers
     * @param {(Partial<import('@scout9/admin').Customer> & {$id: string;}) | Array<(Partial<import('@scout9/admin').Customer> & {$id: string;})>} updateOrUpdates
     * @returns {Promise<import('@scout9/admin').UpdateCustomersResponse | import('@scout9/admin').UpdateCustomerResponse>}
     */
    public update(updateOrUpdates: Partial<Customer> & {
        $id: string;
    } | Array<Partial<Customer> & {
        $id: string;
    }>): Promise<CustomerUpdateResponse | UpdateCustomersResponse>;

    /**
     * Remove one or more customers
     * @param {string | string[]} idOrIds
     * @returns {Promise<import('@scout9/admin').DeleteCustomersResponse | import('@scout9/admin').DeleteCustomerResponse>}
     */
    public remove(idOrIds: string | string[]): Promise<CustomerDeleteResponse | DeleteCustomersResponse>;

}
