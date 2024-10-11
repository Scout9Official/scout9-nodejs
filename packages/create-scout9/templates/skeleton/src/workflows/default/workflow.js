import { forward } from '@scout9/app';

/**
 * @param {import('@scout9/app').WorkflowEvent} event - every workflow receives an event object
 * @returns {Promise<import('@scout9/app').WorkflowResponse>} - every workflow must return a WorkflowResponse
 */
export default async function DefaultWorkflow(event) {
  return forward('@TODO implement');
}
