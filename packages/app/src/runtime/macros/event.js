import { WorkflowResponseSlotBaseSchema, WorkflowResponseSlotSchema } from '../schemas/workflow.js';
import { MacroUtils } from './utils.js';
import { simplifyError } from '../../utils/index.js';


/**
 * followup macro options
 * @typedef {Object} OptionsFollowup
 * @property {Date | string} scheduled
 * @property {Record<string, any>} [cancelIf]
 * @property {boolean} [literal]
 * @property {boolean} [overrideLock]
 */

/**
 * instruct macro options
 * @typedef {Object} OptionsInstruct
 * @property {string} [id] - Unique ID for the instruction, this is used to remove the instruction later
 * @property {boolean} [persist] - if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply
 */

/**
 * reply macro options
 * @typedef {Object} OptionsReply
 * @property {Date | string} [scheduled]
 * @property {number} [delay]
 */

/**
 * forward macro options
 * @typedef {Object} OptionsForward
 * @property {'after-reply' | 'immediately'} [mode] - sets forward mode, defaults to "immediately". If "after-reply", the forward will be on hold until the customer responds. We recommend using "immediately" for most cases.
 * @property {string} [to] - another phone or email to forward to instead of owner
 */

/**
 *
 * @return {{followup(string, (Date|string|OptionsFollowup)): EventMacros, toJSON(boolean=): Array<WorkflowResponseSlot>, instruct(string, OptionsFollowup=): EventMacros, forward(string=, OptionsForward=): EventMacros, anticipate((string|Array<WorkflowResponseSlotBase&{keywords: string[]}>), WorkflowResponseSlotBaseSchema, WorkflowResponseSlotBaseSchema): EventMacros, upsert(Record<string, *>): EventMacros, reply(string, OptionsReply=): EventMacros}|*|*[]}
 * @constructor
 */

/**
 * @typedef {WorkflowResponseSlotBase & {keywords: string[]}} WorkflowResponseSlotBaseWithKeywords
 * - Extends `WorkflowResponseSlotBase` to include keywords.
 * @property {string[]} keywords - Keywords associated with the slot.
 */

/**
 * @typedef {(
 *   (instruction: string, yes: WorkflowResponseSlotBase, no: WorkflowResponseSlotBase) => EventMacros |
 *   (instruction: WorkflowResponseSlotBaseWithKeywords[]) => EventMacros
 * )} AnticipateFunction
 * - Defines the overloads for the `anticipate` function.
 * @property {function(string, WorkflowResponseSlotBase, WorkflowResponseSlotBase): EventMacros} withCondition
 * - Overload for when the instruction is a string.
 * @property {string} withCondition.instruction - The instruction as a string.
 * @property {WorkflowResponseSlotBase} withCondition.yes - Object to process if the condition is met.
 * @property {WorkflowResponseSlotBase} withCondition.no - Object to process if the condition is not met.
 * @property {function(WorkflowResponseSlotBaseWithKeywords[]): EventMacros} withoutCondition
 * - Overload for when the instruction is an array.
 * @property {WorkflowResponseSlotBaseWithKeywords[]} withoutCondition.instruction - Array of slots with keywords.
 */

/**
 * Event macros to be used inside your scout9 auto reply workflows
 * @typedef {Object} EventMacros
 * @property {function(Record<string, any>): EventMacros} upsert
 * @property {function(string, (Date | string | OptionsFollowup)): EventMacros} followup
 * @property {AnticipateFunction} anticipate
 * @property {function(string, OptionsInstruct?): EventMacros} instruct
 * @property {function(string, OptionsReply?): EventMacros} reply
 * @property {function(string?, OptionsForward?): EventMacros} forward
 * @property {function(boolean?): Array<WorkflowResponseSlot>} toJSON
 */
function EventMacrosFactory() {

  let slots = [];

  return {

    /**
     * Sets context into the conversation context for later use
     * @param {Record<string, string | boolean | null | number | Array<string | boolean | null | number>>} updates
     * @return {EventMacros}
     */
    upsert(updates) {
      const slot = {contextUpsert: updates};
      try {
        slots.push(WorkflowResponseSlotSchema.parse(slot));
      } catch (e) {
        throw simplifyError(
          e,
          'Invalid upsert, input must be a Record<string, string | boolean | null | number | Array<string | boolean | null | number>>'
        );
      }
      return this;
    },

    /**
     * Similar to `instruction` except that it requires a schedule time parameter that determines when to follow up (and is not an event output macro). This will fire another run job with a new insert system context message, if `options.literal` is set to true, it will be an appended agent message prior to running the workflow app.
     *
     * @param {string} instruction
     * @param {Date | string | OptionsFollowup} options
     *
     * @return {EventMacros}
     */
    followup(instruction, options) {
      let slot;
      if (!options) {
        throw new Error(
          'Missing second argument in followup(instruction, options) \'options\' argument needs to be included');
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
        };
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
        };

      }
      try {
        slots.push(WorkflowResponseSlotSchema.parse(slot));
      } catch (e) {
        throw simplifyError(e, 'Invalid followup() input');
      }
      return this;
    },

    /**
     * Similar to `instruct` except that it requires a schedule time parameter that determines when to follow up (and is not an event output macro). This will fire another run job with a new insert system context message, if `options.literal` is set to true, it will be an appended agent message prior to running the workflow app.
     * @overload
     * @param {string} instruction - The instruction to be anticipated as a string. When this is a string, `yes` and `no` must be provided as objects.
     * @param {WorkflowResponseSlotBaseSchema} yes - The object to process if the instruction is a string and the condition is met.
     * @param {WorkflowResponseSlotBaseSchema} no - The object to process if the instruction is a string and the condition is not met.
     *
     * @overload
     * @param {(Array<WorkflowResponseSlotBase & {keywords: string[]}>)} instruction
     *
     * @return {EventMacros}
     */
    anticipate(instruction, yes, no) {
      const slot = {
        anticipate: []
      };
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
        let yesParsed, noParsed;
        try {
          yesParsed = WorkflowResponseSlotBaseSchema.parse(yes);
        } catch (e) {
          throw simplifyError(e, 'Invalid anticipate.yes input');
        }
        try {
          noParsed = WorkflowResponseSlotBaseSchema.parse(no);
        } catch (e) {
          throw simplifyError(e, 'Invalid anticipate.no input');
        }

        slot.anticipate = {
          did: instruction,
          yes: yesParsed,
          no: noParsed
        };
      } else {
        throw new Error(`Instruction is not of type "string" or "array"`);
      }
      try {
        slots.push(WorkflowResponseSlotSchema.parse(slot));
      } catch (e) {
        throw simplifyError(e, 'Invalid anticipate() input');
      }
      return this;
    },

    /**
     * Return instructions to guide next auto reply response
     * @param {string} instruction
     * @param {OptionsInstruct} [options]
     * @return {EventMacros}
     */
    instruct(instruction, options = {}) {
      const slot = {};
      if (Object.keys(options).length > 0) {
        const instructionObj = {
          content: instruction
        };
        if (options.id) {
          instructionObj.id = options.id;
        }
        if (typeof options.persist === 'boolean') {
          instructionObj.persist = options.persist;
        }
        slot.instructions = instructionObj;
      } else {
        slot.instructions = instruction;
      }
      try {
        slots.push(WorkflowResponseSlotSchema.parse(slot));
      } catch (e) {
        throw simplifyError(e, 'Invalid instruct() input');
      }
      return this;
    },
    /**
     * If a manual message must be sent, you can use the `reply` macro
     * @param {string} message - the message to manually send to the user
     * @param {OptionsReply} [options]
     * @return {EventMacros}
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
      try {
        slots.push(WorkflowResponseSlotSchema.parse(slot));
      } catch (e) {
        throw simplifyError(e, 'Invalid reply() input');
      }
      return this;
    },
    /**
     * This macro ends the conversation and forwards it the owner of the persona to manually handle the flow. If your app returns undefined or no event, then a default forward is generated.
     * @param {string} [message] - the message to forward to owner of persona
     * @param {OptionsForward} [options]
     * @return {EventMacros}
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
        };
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
        };
      }
      try {
        slots.push(WorkflowResponseSlotSchema.parse(slot));
      } catch (e) {
        throw simplifyError(e, 'Invalid forward() input');
      }
      return this;
    },
    /**
     * Returns event payload
     * @param {boolean} flush - if true, will reset the data payload
     * @return {Array<WorkflowResponseSlot>}
     */
    toJSON(flush = true) {
      if (flush) {
        const copy = [...slots];
        slots = [];
        return copy;
      } else {
        return slots;
      }
    }
  };
}

const eventMacros = EventMacrosFactory();

/**
 * Return instructions to guide next auto reply response
 * @param {string} instruction - the instruction to send to the
 * @param {OptionsInstruct} [options]
 * @return {EventMacros}
 *
 * @example instruct("Ask user if they are looking to order a pizza");
 *
 * @type {(message: string, options?: OptionsInstruct) => EventMacros}
 */
export const instruct = eventMacros.instruct.bind(eventMacros);

/**
 * Forwards conversation back to you or owner of workflow.
 *
 * Typically used when the conversation is over or user is stuck in the workflow and needs manual intervention.
 *
 * The provided message input gets sent to you in a sms text with some information why conversation was forwarded.
 *
 * Calling this method will lock the conversation and prevent auto replies from being sent to the user.
 *
 * @example - end of workflow
 * forward("User wants 1 cheese pizza ready for pick");
 *
 * @example - broken step in workflow
 * forward("Cannot determine what the user wants");
 *
 * @example - forward if user sends a message
 * reply("Let me know if you're looking for a gutter cleaning").forward("User responded to gutter cleaning request", {mode: 'after-reply'});
 *
 * @type {(message: string, options?: OptionsForward) => EventMacros}
 */
export const forward = eventMacros.forward.bind(eventMacros);

/**
 * Manual message to send to the customer from the workflow.
 *
 * Typically used to return specific information to the user
 *
 * @example - confirming invoice
 * reply(`So I got...\n${invoiceItems.map((item) => `${}`)}`)
 * const msg = [
 *   'So I got...',
 *   invoice.items.map((item) => `${item.quantity} ${item.name}`),
 *   `Total: ${invoice.totalStr}`,
 *   `\nThis look right?`
 * ].join('\n');
 * return reply(msg).instruct("If user confirms ask if they prefer to pay cash or credit");
 *
 * @type {(message: string, options?: OptionsReply) => EventMacros}
 */
export const reply = eventMacros.reply.bind(eventMacros);
