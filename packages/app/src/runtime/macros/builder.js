/**
 * Builder Macros
 * used to build and guide a application logic in relation to the Scout9 conversation state.
 */
import { Configuration, MacroContextResult, Scout9Api } from '@scout9/admin';
import MacroGlobals from './globals.js';

function handleAxiosResponse(res) {
  if (res.status === 200) {
    return res.data;
  } else {
    throw new Error(`${res.status} ${res.statusText}`)
  }
}

/**
 * The `did` macro takes a given prompt and infers a binary `true` or `false` result in relation to the prompt's subject actor and the prompt's inquiry.
 * @param {string} prompt
 * @return {Promise<boolean>}
 */
export async function did(prompt) {
  const convoId = MacroGlobals.$convo();
  const {value} = (await (new Scout9Api(new Configuration({apiKey: process.env.SCOUT9_API_KEY}))).did({prompt, convoId})
    .then(handleAxiosResponse));
  return value;
}


/**
 * The `context` macro, similar to the `did` macro, takes a natural statement and checks the entire conversation state and extracts or infers a metadata composition result.
 * @param {string} prompt
 * @param {import('@scout9/admin').CaptureContextRequestExamples} [examples]
 * @return {Promise<import('@scout9/admin').MacroContextValue>}
 */
export async function context(prompt, examples) {
  const convoId = MacroGlobals.$convo();
  const {value} = (await (new Scout9Api(new Configuration({apiKey: process.env.SCOUT9_API_KEY}))).captureContext({
    prompt,
    examples,
    convoId
  })
    .then(handleAxiosResponse));
  return value;
}
