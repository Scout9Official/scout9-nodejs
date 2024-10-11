/**
 * An example service of creating and retrieving an invoice
 */
export async function createInvoice(pizza) {
  // @TODO create invoice backend
  return {
    id: 'invoice-123',
    subtotal: 6000,
    tax: 600,
    total: 6600,
    invoiceUrl: 'https://example.com/invoice-123'
  };
}

export async function getInvoice(id) {
  // @TODO create invoice backend
  return {
    id: 'invoice-123',
    subtotal: 6000,
    tax: 600,
    total: 6600,
    invoiceUrl: 'https://example.com/invoice-123'
  };
}
