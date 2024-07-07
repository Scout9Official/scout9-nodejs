import { WorkflowResponseSlotBaseSchema, WorkflowResponseSlotSchema } from '../runtime/index.js';

function HelperMacros() {
  return {
    /**
     * Sets context into the conversation context for later use
     * @param {any} contextUpdates
     * @return {*}
     */
    upsert(contextUpdates) {
      return this;
    }
  };
}

const dateToUnix = (date) => parseInt((date.getTime() / 1000).toFixed(0));
const scheduledToUnix = (scheduled) => {
  if (scheduled instanceof Date) {
    return dateToUnix(scheduled)
  } else if (typeof scheduled === 'string') {
    const timestamp = Date.parse(scheduled);
    if (isNaN(timestamp) === false) {
      return dateToUnix(new Date(timestamp));
    } else {
      throw new Error('.scheduled is an invalid date string');
    }
  } else {
    throw new Error(`.scheduled was neither a Date or ISO string`);
  }
}

function EventMacros() {
  const helperMacros = HelperMacros();

  const chainable = (obj) => {
    return {
      ...obj,
      ...helperMacros,
      chainable: undefined
    };
  };

  const slots = [];

  const obj = {

    /**
     * Sets context into the conversation context for later use
     * @param {Record<string, any>} updates
     * @return {*}
     */
    upsert(updates) {
      const slot = {contextUpsert: updates}
      slots.push(WorkflowResponseSlotSchema.parse(slot));
    },

    /**
     * Similar to `instruction` except that it requires a schedule time parameter that determines when to follow up (and is not an event output macro). This will fire another run job with a new insert system context message, if `options.literal` is set to true, it will be an appended agent message prior to running the workflow app.
     * @param {string} instruction
     * @param {Object} options
     * @param {Date | string} options.scheduled
     * @param {Record<string, any>} [options.cancelIf]
     *
     */
    followup(instruction, options) {

    },

    /**
     * Similar to `instruct` except that it requires a schedule time parameter that determines when to follow up (and is not an event output macro). This will fire another run job with a new insert system context message, if `options.literal` is set to true, it will be an appended agent message prior to running the workflow app.
     * @overload
     * @param {string} instruction - The instruction to be anticipated as a string. When this is a string, `yes` and `no` must be provided as objects.
     * @param {object} yes - The object to process if the instruction is a string and the condition is met.
     * @param {object} no - The object to process if the instruction is a string and the condition is not met.
     *
     * @overload
     * @param {(Array<import('zod').infer<typeof import('../runtime/client/workflow.js').WorkflowResponseSlotBaseSchema> & {keywords: string[]}>)} instruction
     */
    anticipate(instruction, yes, no) {
      const slot = {
        anticipate: []
      }
      if (Array.isArray(instruction)) {
        for (const _slot of instruction) {
          if (!Array.isArray(_slot.keywords) || _slot.keywords.length < 1) {
            throw new Error(`Anticipate field .keywords should be an array of string, with more than one value`);
          }
          slot.anticipate.push(_slot);
        }
      } else if (typeof instruction === 'string') {
        if (!yes) {
          throw new Error('Missing "yes" option for anticipate');
        }
        if (!no) {
          throw new Error('Missing "no" option for anticipate');
        }
        slot.anticipate = {
          did: instruction,
          yes: WorkflowResponseSlotBaseSchema.parse(yes),
          no: WorkflowResponseSlotBaseSchema.parse(no)
        }
      } else {
        throw new Error(`Instruction is not of type "string" or "array"`);
      }
      slots.push(WorkflowResponseSlotSchema.parse(slot));
    },



    /**
     *
     * @param {string} instruction
     * @param {Object} [options]
     * @param {string} [options.id] - Unique ID for the instruction, this is used to remove the instruction later
     * @param {string} [options.persist] - if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply
     * @return {obj}
     */
    instruct(instruction, options = {}) {
      const slot = {};
      if (Object.keys(options).length > 0) {
        const instructionObj = {
          context: instruction,
        }
        if (options.id) {
          instructionObj.id = options.id
        }
        if (typeof options.persist === 'boolean') {
          instructionObj.persist = options.persist
        }
        slot.instruction = instructionObj;
      } else {
        slot.instruction = instruction;
      }
      slots.push(slot);
      return this;
    },
    /**
     * If a manual message must be sent, you can use the `reply` macro
     * @param {string} message - the message to manually send to the user
     * @param {Object} [options]
     * @param {Date | string} [options.scheduled] - this will schedule the date to a specific provided date
     * @param {string} [options.delay] - delays the message return in seconds
     * @return {obj}
     */
    reply(message, options = {}) {
      const slot = {
        message
      };
      if (Object.keys(options).length) {
        if ('scheduled' in options) {
          slot.scheduled = scheduledToUnix(options.scheduled);
        }
        if ('delay' in options) {
          const delay = options.delay;
          if (typeof delay !== 'number') {
            throw new Error('.delay is not of type "number"');
          }
          slot.secondsDelay = delay;
        }
      }
      slots.push(slot);
      return this;
    },
    /**
     * This macro ends the conversation and forwards it the owner of the persona to manually handle the flow. If your app returns undefined or no event, then a default forward is generated.
     * @param {string} message - the message to forward to owner of persona
     * @param {string} [note] - debug note to label reason or add additional information behind the forward
     */
    forward(message, note) {
      const slot = {
        forward: message,
        forwardNote: note
      }
      slots.push(slot);
    },
    toJSON() {
      return slots;
    }
  };

  return {
    instruct: (instruction, options = {}) => chainable(obj).instruct(instruction, options),
    reply: (message, options = {}) => chainable(obj).reply(message, options),
    forward: (message, note) => chainable(obj).forward(message, note),
    toJSON: () => chainable(obj).toJSON()
  };
}

const eventMacros = EventMacros();
const { foo, bar } = eventMacros;

foo().bar();
foo().bar().baz().foo(); // Works
// baz().foo(); // This will throw an error since baz() cannot chain foo()
