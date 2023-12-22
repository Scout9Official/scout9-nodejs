/**
 * This an example adapter for a mock database to your CRM
 */
export const customerMockDb = {
  query: async (
    query,
    page,
    limit,
    orderBy,
    endAt,
    startAt,
  ) => Promise.resolve([{id: '1234', name: 'Test Customer', email: '', phone: ''}]),
  get: async (id) => Promise.resolve({id, name: 'Test Customer', email: '', phone: ''}),
  add: async (id, customer) => ({id}),
  update: async (id, updates) => true,
  remove: async (id) => true
}
