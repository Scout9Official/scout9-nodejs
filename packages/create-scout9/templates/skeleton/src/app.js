import DefaultWorkflow from './workflows/default/workflow.js';

/**
 * @param {import('@scout9/app').WorkflowEvent} event - every workflow receives an event object
 * @returns {Promise<import('@scout9/app').WorkflowResponse>} - every workflow must return a WorkflowResponse
 */
export default async function Scout9App(event) {
  return DefaultWorkflow(event);
}
