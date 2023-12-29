/**
 * @param {WorkflowEvent} event - every workflow receives an event object
 * @returns {Promise<WorkflowResponse>} - every workflow must return a WorkflowResponse
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
