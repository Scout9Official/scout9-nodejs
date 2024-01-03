/**
 * @param {import('@scout9/app').WorkflowEvent} event - every workflow receives an event object
 * @returns {Promise<import('@scout9/app').WorkflowResponse>} - every workflow must return a WorkflowResponse
 */
export default async function DefaultWorkflow(
  {
    context,
    customer
  }) {
  return {
    forward: true,
  };
}
