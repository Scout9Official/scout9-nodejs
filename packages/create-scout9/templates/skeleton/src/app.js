import DefaultWorkflow from './workflows/default/workflow.js';

export default async function Scout9App(event) {
  return DefaultWorkflow(event);
}
