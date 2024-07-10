import { WorkflowResponseSlotBaseSchema, WorkflowResponseSlotSchema } from '../client/workflow.js';
import { MacroUtils } from './utils.js';



function EventMacros() {

  let slots = [];

  return {

    /**
     * Sets context into the conversation context for later use
     * @param {Record<string, any>} updates
     * @return {this}
     */
    upsert(updates) {
      const slot = {contextUpsert: updates}
      slots.push(WorkflowResponseSlotSchema.parse(slot));
      return this;
    },

    /**
     * Similar to `instruction` except that it requires a schedule time parameter that determines when to follow up (and is not an event output macro). This will fire another run job with a new insert system context message, if `options.literal` is set to true, it will be an appended agent message prior to running the workflow app.
     *
     * @param {string} instruction
     *
     * @overload
     * @param {Date | string} options
     *
     * @overload
     * @param {Object} options
     * @param {Date | string} options.scheduled
     * @param {Record<string, any>} [options.cancelIf]
     * @param {boolean} [options.literal]
     * @param {boolean} [options.overrideLock]
     *
     * @return {this}
     */
    followup(instruction, options) {
      let slot;
      if (!options) {
        throw new Error('Missing second argument in followup(instruction, options) \'options\' argument needs to be included')
      }
      // Check if it's date value
      const {success, ...rest} = MacroUtils.scheduledToUnixSafe(options);
      if (!success) {
        if (!('scheduled' in options)) {
          throw new Error('.scheduled was not included in options and needs to be required');
        }
        if (typeof options !== 'object') {
          throw new Error('second argument options in followup is not an object type');
        }

        // Advance object
        slot = {
          followup: {
            scheduled: MacroUtils.scheduledToUnix(options.scheduled)
          }
        }
        if (options.literal) {
          slot.followup.message = instruction;
        } else {
          slot.followup.instructions = instruction;
        }
        if (typeof options.overrideLock === 'boolean') {
          slot.followup.overrideLock = options.overrideLock;
        }
        if (options.cancelIf) {
          slot.followup.cancelIf = options.cancelIf;
        }

      } else {
        // Simple follow up
        slot = {
          followup: {
            instructions: instruction,
            scheduled: rest.data
          }
        }

      }
      slots.push(WorkflowResponseSlotSchema.parse(slot));
      return this;
    },

    /**
     * Similar to `instruct` except that it requires a schedule time parameter that determines when to follow up (and is not an event output macro). This will fire another run job with a new insert system context message, if `options.literal` is set to true, it will be an appended agent message prior to running the workflow app.
     * @overload
     * @param {string} instruction - The instruction to be anticipated as a string. When this is a string, `yes` and `no` must be provided as objects.
     * @param {object} yes - The object to process if the instruction is a string and the condition is met.
     * @param {object} no - The object to process if the instruction is a string and the condition is not met.
     *
     * @overload
     * @param {(Array<IWorkflowResponseSlotBase & {keywords: string[]}>)} instruction
     *
     * @return {EventMacros}
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
      return this;
    },

    /**
     *
     * @param {string} instruction
     * @param {Object} [options]
     * @param {string} [options.id] - Unique ID for the instruction, this is used to remove the instruction later
     * @param {string} [options.persist] - if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply
     * @return {EventMacros}
     */
    instruct(instruction, options = {}) {
      const slot = {};
      if (Object.keys(options).length > 0) {
        const instructionObj = {
          content: instruction,
        }
        if (options.id) {
          instructionObj.id = options.id
        }
        if (typeof options.persist === 'boolean') {
          instructionObj.persist = options.persist
        }
        slot.instructions = instructionObj;
      } else {
        slot.instructions = instruction;
      }
      slots.push(WorkflowResponseSlotSchema.parse(slot));
      return this;
    },
    /**
     * If a manual message must be sent, you can use the `reply` macro
     * @param {string} message - the message to manually send to the user
     * @param {Object} [options]
     * @param {Date | string} [options.scheduled] - this will schedule the date to a specific provided date
     * @param {string} [options.delay] - delays the message return in seconds
     * @return {this}
     */
    reply(message, options = {}) {
      const slot = {
        message
      };
      if (Object.keys(options).length) {
        if ('scheduled' in options) {
          slot.scheduled = MacroUtils.scheduledToUnix(options.scheduled);
        }
        if ('delay' in options) {
          const delay = options.delay;
          if (typeof delay !== 'number') {
            throw new Error('.delay is not of type "number"');
          }
          slot.secondsDelay = delay;
        }
      }
      slots.push(WorkflowResponseSlotSchema.parse(slot));
      return this;
    },
    /**
     * This macro ends the conversation and forwards it the owner of the persona to manually handle the flow. If your app returns undefined or no event, then a default forward is generated.
     * @param {string} [message] - the message to forward to owner of persona
     * @param {Object} [options]
     * @param {'after-reply' | 'immediately'} [options.mode] - sets forward mode, defaults to "immediately"
     * @param {string} [options.to] - another phone or email to forward to instead of owner
     * @return {this}
     */
    forward(message, options = {}) {
      let slot;
      const defaultForward = 'Conversation forwarded for manual intervention';
      if (options && Object.keys(options).length) {
        slot = {
          forward: {
            note: message ?? defaultForward
          },
          forwardNote: message ?? defaultForward
        }
        if (options.to) {
          slot.forward.to = options.to;
        }
        if (options.mode) {
          slot.forward.mode = options.mode;
        }
      } else {
        slot = {
          forward: true,
          forwardNote: message ?? defaultForward
        }
      }
      slots.push(WorkflowResponseSlotSchema.parse(slot));
      return this;
    },
    /**
     * Returns event payload
     * @return {Array<IWorkflowResponseSlot>}
     */
    toJSON(flush = true) {
      if (flush) {
        const copy = [...slots];
        slots =[];
        return copy;
      } else {
        return slots;
      }
    },
  };
}

const eventMacros = EventMacros();
export const instruct = eventMacros.instruct.bind(eventMacros);
export const forward = eventMacros.forward.bind(eventMacros);
export const reply = eventMacros.reply.bind(eventMacros);
