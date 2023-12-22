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
    model: 'orin-2.2'
  },
}
