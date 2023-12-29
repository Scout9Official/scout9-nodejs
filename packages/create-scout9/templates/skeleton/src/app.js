import DefaultWorkflow from './workflows/default/workflow.js';

/**
 * @param {WorkflowEvent} event - every workflow receives an event object
 * @returns {Promise<WorkflowResponse>} - every workflow must return a WorkflowResponse
 */
export default async function Scout9App(event) {
  return DefaultWorkflow(event);
}
