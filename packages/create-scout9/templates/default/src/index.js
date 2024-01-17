/**
 * Configuration for the Scout9 project.
 * @type {import('@scout9/app').Scout9ProjectConfig}
 */
export default {

  /**
   * Configure large language model (LLM) settings to generate auto replies
   */
  llm: {
    engine: 'openai',
    model: 'gpt-3.5-turbo',
  },
  /**
   * Configure personal model transformer (PMT) settings to align auto replies the agent's tone
   */
  pmt: {
    engine: 'scout9',
    model: 'orin-1.0'
  },
  organization: {
    name: "PizzaZoom",
    description: "PizzaZoom is a pizza delivery service that uses drones to deliver pizza to your door in 30 minutes or less.",
  },
  initialContext: [
    "Get the customers pizza order, be as brief and concise as possible.",
    "Customers generally want the pizza ASAP, so assume unless they ask for a specific time, they want it as soon as possible.",
  ]
}
