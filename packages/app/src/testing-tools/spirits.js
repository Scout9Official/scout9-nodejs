import {
  pushMessage,
  nextMonotonicIso,
  enforceMonotonicInPlace,
} from "./message-utils.js";

/**
 * @typedef {Object} Document
 * @property {string} id
 */

/**
 * Represents a change with before and after states of a given type.
 * @template Type The type of the before and after properties.
 * @typedef {Object} Change
 * @property {Type} before - The state before the change.
 * @property {Type} after - The state after the change.
 */

/**
 * @typedef {Object} ConversationData
 * @property {import('@scout9/app').Scout9ProjectBuildConfig} config - used to define generation and extract persona metadata
 * @property {import('@scout9/app').Conversation} conversation
 * @property {Array<import('@scout9/admin').Message>} messages
 * @property {import('@scout9/admin').Message} message - the message sent by the customer (should exist in messages)
 * @property {import('@scout9/app').Customer} customer
 * @property {import('@scout9/app').ConversationProgress} progress - progress checklist for manual/auto ingress workflows
 * @property {any} context - event context
 */

/**
 * @typedef {Object} ParseOutput
 * @property {Array<import('@scout9/admin').Message>} messages
 * @property {import('@scout9/app').Conversation} conversation
 * @property {import('@scout9/admin').Message} message
 * @property {any} context
 */

/**
 * @typedef {Object} WorkflowOutput
 * @property {Array<import('@scout9/app').WorkflowResponseSlot>} slots
 * @property {Array<import('@scout9/admin').Message>} messages
 * @property {import('@scout9/app').Conversation} conversation
 * @property {any} context
 */

/**
 * @typedef {Object} GenerateOutput
 * @property {import('@scout9/admin').GenerateResponse | undefined} generate
 * @property {Array<import('@scout9/admin').Message>} messages
 * @property {import('@scout9/app').Conversation} conversation
 * @property {any} context
 */

/**
 * @callback ParseFun
 * @param {string} message - message to send
 * @param {string | undefined} language - language to parse in, defaults to "en" for english
 * @returns {Promise<import('@scout9/admin').ParseResponse>}
 */

/**
 * @callback ContextualizerFun
 * @param {Pick<import('@scout9/app').WorkflowEvent, 'messages' | 'conversation'>} args - message to send
 * @returns {Promise<import('@scout9/app').WorkflowEvent['messages']>}
 */

/**
 * @callback WorkflowFun
 * @param {import('@scout9/app').WorkflowEvent} event - conversation data
 * @returns {Promise<import('@scout9/app').WorkflowResponse>}
 */

/**
 * @callback GenerateFun
 * @param {import('@scout9/admin').GenerateRequestOneOf1} data - data to generate from
 * @returns {Promise<import('@scout9/admin').GenerateResponse>}
 */

/**
 * @callback TransformerFun
 * @param {import('@scout9/admin').PmtTransformRequest} data - data to generate from
 * @returns {Promise<import('@scout9/admin').PmtTransformResponse>}
 */

/**
 * @callback IdGeneratorFun
 * @param {import('@scout9/admin').Message['role']} prefix
 * @returns {string}
 */

/**
 * @callback StatusCallback
 * @param {string} message
 * @param {'info' | 'warn' | 'error' | 'success' | undefined} [level]
 * @param {string | undefined} [type]
 * @param {any | undefined} [payload]
 * @returns {void}
 */

/**
 * @typedef {Object} CustomerSpiritStateCallbacks
 * @property {(context: any) => void} [onSetContext]
 * @property {(contextPatch: any) => void} [onUpdateContext]
 *
 * @property {(conversation: import('@scout9/app').Conversation) => void} [onSetConversation]
 * @property {(conversationPatch: Partial<import('@scout9/app').Conversation>) => void} [onUpdateConversation]
 *
 * // MUST match ConversationRunnerState.chunkMessage input shape
 * @property {(args: { text: string; conversationId: string; source?: string; mode?: 'generation' | 'transformation' }) => void} [onChunkMessage]
 *
 * @property {(message: import('@scout9/admin').Message) => void} [onAddMessage]
 * @property {(messagePatch: Partial<import('@scout9/admin').Message> & { id: string }) => void} [onUpdateMessage]
 * @property {(messageId: string) => void} [onDeleteMessage]
 */


/**
 * @typedef {Object} CustomerSpiritCallbacks
 * @property {ParseFun} parser
 * @property {ContextualizerFun} contextualizer
 * @property {WorkflowFun} workflow
 * @property {GenerateFun} generator
 * @property {TransformerFun} transformer
 * @property {IdGeneratorFun} idGenerator
 * @property {StatusCallback | undefined} [progress]
 * @property {CustomerSpiritStateCallbacks['onSetContext']} [onSetContext]
 * @property {CustomerSpiritStateCallbacks['onUpdateContext']} [onUpdateContext]
 * @property {CustomerSpiritStateCallbacks['onSetConversation']} [onSetConversation]
 * @property {CustomerSpiritStateCallbacks['onUpdateConversation']} [onUpdateConversation]
 * @property {CustomerSpiritStateCallbacks['onChunkMessage']} [onChunkMessage]
 * @property {CustomerSpiritStateCallbacks['onAddMessage']} [onAddMessage]
 * @property {CustomerSpiritStateCallbacks['onUpdateMessage']} [onUpdateMessage]
 * @property {CustomerSpiritStateCallbacks['onDeleteMessage']} [onDeleteMessage]
 */


/**
 * Message key helper for doing comparisons to fund duplicates
 * @param {any} message
 * @returns {string}
 */
export function messageKey(m) {
  if (m.role === "tool") {
    // Prefer tool_call_id; fall back to id; then content.
    return `tool::${m.tool_call_id || m.id || ""}::${m.content || ""}`;
  }
  if (m.tool_calls) {
    return `assistant::tool_calls::${JSON.stringify(m.tool_calls)}`;
  }
  return `${m.role || ""}::${m.content || ""}`;
}

class SpiritError extends Error {
  /**
   * @param {string} message - Description of the error.
   * @param {string} step - The step or phase in which the error occurred.
   */
  constructor(message, step) {
    super(message);
    this.name = this.constructor.name;
    this.step = step;

    // Ensures the stack trace starts from where this error was created
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * 
   * @param {unknown} err 
   * @param {string} step 
   * @returns {SpiritError}
   */
  static fromError(err, step) {
    if (err instanceof SpiritError) return err;
    if (err instanceof Error) {
      const wrapped = new SpiritError(err.message, step, { cause: err });
      wrapped.stack = err.stack;
      return wrapped;
    }
    // fallback for non-Error values
    return new SpiritError(String(err), step);
  }
}

/**
 * @typedef {Object} ConversationEvent
 * @property {(Change<import('@scout9/app').Conversation> & {
 *   forwardNote?: string;
 *   forward?: import('@scout9/app').WorkflowResponseSlot['forward'];
 * })} conversation
 * @property {Change<Array<import('@scout9/admin').Message>>} messages
 * @property {Change<any>} context
 * @property {Change<import('@scout9/admin').Message>} message
 * @property {Array<import('@scout9/app').Followup>} followup
 * @property {Array<import('@scout9/app').EntityContextUpsert>} entityContextUpsert
 */
export const Spirits = {

  /**
   * Customer message
   * @param {ConversationData & CustomerSpiritCallbacks} input
   * @param {(error: Error) => void} onError
   * @returns {Promise<ConversationEvent>}
   */
  customer: async function (input, onError = () => {
  }) {
    const {
      customer,
      config,
      message: messageBefore,
      context: contextBefore,
      messages: messagesBefore,
      conversation: conversationBefore,
      parser,
      contextualizer,
      workflow,
      generator,
      transformer,
      idGenerator,
      progress = (message, level, type, payload) => {
      },
      onSetContext = (_ctx) => { },
      onUpdateContext = (_patch) => { },
      onSetConversation = (_conv) => { },
      onUpdateConversation = (_patch) => { },
      onChunkMessage = (_args) => { },
      onAddMessage = (_msg) => { },
      onUpdateMessage = (_patch) => { },
      onDeleteMessage = (_id) => { },
    } = input;
    let { conversation, messages, context, message } = input;
    const elapsedSeconds = (start) => ((performance.now() - start) / 1000).toFixed(2);
    const rootStart = performance.now();
    progress(`Spirits.customer start`, 'info', undefined, undefined);

    if (typeof message.content !== 'string') {
      const err = new Error(
        `Spirits: customer message.content is not string (id=${message.id}, type=${typeof message.content})`
      );
      progress('customer message.content is not string', 'error', 'INVALID_CUSTOMER_MESSAGE', {
        id: message.id,
        contentType: typeof message.content,
      });
      console.error(err);
      onError(err);
    }

    // Storing post process events here
    const followup = [];
    const entityContextUpsert = [];

    // 0. Setup Helpers
    // ---- SYNC SAFE CALLS (NO PROMISES) ----
    const safeCall = (fn, ...args) => {
      try { fn(...args); } catch (e) { console.error('Spirits: callback error', e); }
    };

    const emitSetContext = (ctx) => safeCall(onSetContext, ctx);
    const emitUpdateContext = (patch) => safeCall(onUpdateContext, patch);

    const emitSetConversation = (conv) => safeCall(onSetConversation, conv);
    const emitUpdateConversation = (patch) => safeCall(onUpdateConversation, patch);

    const emitAddMessage = (m) => safeCall(onAddMessage, m);

    const emitUpdateMessage = (patch) => {
      if (!patch || typeof patch.id !== 'string' || !patch.id.trim()) {
        console.error('Spirits: onUpdateMessage requires patch.id, got:', patch);
        return;
      }
      safeCall(onUpdateMessage, patch);
    };

    const emitDeleteMessage = (id) => safeCall(onDeleteMessage, id);

    const emitChunkMessage = ({ text, conversationId, messageId, mode, source }) => {
      if (!messageId) return;
      safeCall(onChunkMessage, { text, conversationId, messageId, mode, source });
    };

    const enforceMonotonicWithEmits = (arr, minStepSeconds = 1) => {
      // capture old times by id (only for items that have ids)
      const before = new Map();
      for (const m of arr || []) {
        if (m?.id) before.set(m.id, m.time);
      }

      enforceMonotonicInPlace(arr, minStepSeconds);

      // emit patches for changed times
      for (const m of arr || []) {
        if (!m?.id) continue;
        const prev = before.get(m.id);
        if (prev !== m.time) {
          emitUpdateMessage({ id: m.id, time: m.time });
        }
      }
    };

    const logToolPairingIssues = (allMessages, stage) => {
      const assistantToolCallIds = new Set();
      const toolResponseIds = new Set();

      for (const m of allMessages || []) {
        if (m?.tool_calls?.length) {
          for (const tc of m.tool_calls) {
            if (tc?.id) assistantToolCallIds.add(tc.id);
          }
        }
        if (m?.role === 'tool' && m.tool_call_id) {
          toolResponseIds.add(m.tool_call_id);
        }
      }

      const missingToolResponses = [...assistantToolCallIds].filter((id) => !toolResponseIds.has(id));
      if (missingToolResponses.length) {
        progress('Missing tool responses for tool_calls', 'warn', 'TOOL_PAIRING_MISSING_TOOL', {
          stage,
          missingToolResponses,
        });
        console.error(`Spirits: Missing tool responses (${stage}): ${missingToolResponses.join(', ')}`);
      }
    };

    const isEmptySystemMessage = (m) =>
      m?.role === 'system' &&
      (typeof m.content !== 'string' || m.content.trim() === '');

    const updateConversation = (previousConversation, conversationUpdates, note) => {
      const _note = [`Updated conversation fields`, note].filter(Boolean).join(', ')
      progress(`${_note}: ${JSON.stringify(Object.keys(conversationUpdates))}`, 'info', 'UPDATE_CONVERSATION', conversationUpdates);
      emitUpdateConversation(conversationUpdates);
      return {
        ...previousConversation,
        ...conversationUpdates
      };
    };

    const updateContext = (previousContext, newContext, note) => {
      const _note = [`Updated context fields`, note].filter(Boolean).join(', ')
      progress(`${_note}: ${JSON.stringify(Object.keys(newContext))}`, 'info', 'UPDATE_CONTEXT', newContext);
      emitUpdateContext(newContext);
      return {
        ...previousContext,
        ...newContext
      };
    };

    const userMessages = (_messages) => {
      return _messages.filter(m => m.role === 'customer' || m.role === 'user');
    };

    const recentUserMessage = (_messages) => {
      const _userMessages = userMessages(_messages);
      return _userMessages[_userMessages.length - 1];
    };

    const lockConversation = (_conversation, reason) => {
      return updateConversation(
        _conversation,
        { locked: true, lockedReason: _conversation.lockedReason || reason || 'Unknown' },
        'lock conversation'
      );
    };

    const incrementLockAttempt = (_conversation, _config) => {
      const max = _config?.maxLockAttempts || 3;
      const prev = typeof _conversation.lockAttempts === "number" ? _conversation.lockAttempts : 0;
      const next = prev + 1;

      /** @type {any} */
      const patch = { lockAttempts: next };

      if (next > max) {
        patch.locked = true;
        patch.lockedReason = `Max lock attempts exceeded (${next} > ${max})`;
      }
      const updated = updateConversation(_conversation, patch, 'increment lock');
      return {updated, patch}
    };

    const _addInstruction = (
      instruction,
      _messages,
      _conversation,
      _config,
      previousLockAttempt,
      id
    ) => {
      const systemMessages = _messages.filter(m => m.role === 'system');
      const lastSystemMessage = systemMessages[systemMessages.length - 1];
      let addedMessage = false;
      let changedConversation = [];

      // If instruction does not equal previous system message, add it, otherwise lock attempt
      if (!lastSystemMessage || instruction !== lastSystemMessage.content) {
        if (typeof instruction !== 'string' || instruction.trim() === '') {
          progress('Empty system instruction blocked', 'error', 'EMPTY_SYSTEM_MESSAGE', {
            instruction,
            instructionId: id,
          });
        } else {
          const appended = pushMessage(_messages, {
            id,
            role: "system",
            content: instruction,
            time: new Date().toISOString(),
          });
          emitAddMessage(appended);
          addedMessage = true;
        }
      } else {
        // Handle repeated instruction
        // Increment lock attempt if instructions are repeated and we haven't already incremented lock attempt (for example if a forward is provided)
        if (previousLockAttempt === (_conversation.lockAttempts || 0)) {
          const {updated, patch} = incrementLockAttempt(_conversation, _config);
          _conversation = updated;
          changedConversation = Object.keys(patch);
        }
      }
      return {
        conversation: _conversation,
        messages: _messages,
        addedMessage,
        changedConversation
      };
    };

    let instructionsAdded = 0;
    const addInstruction = (instruction, previousLockAttempt, id = idGenerator('sys')) => {
      const {
        conversation: newConversation,
        messages: newMessages,
        addedMessage,
        changedConversation
      } = _addInstruction(instruction, messages, conversation, config, previousLockAttempt, id);
      conversation = newConversation;
      messages = newMessages;
      if (addedMessage) {
        instructionsAdded++;
        progress(`Added ${instructionsAdded} instruction${instructionsAdded === 1 ? '' : 's'}`, 'info', 'ADD_MESSAGE', newMessages[newMessages.length - 1]);
      }
      if (changedConversation.length) {
        progress(`Updated conversation fields: ${JSON.stringify(changedConversation)}`, 'info', 'UPDATE_CONVERSATION', newConversation);
      }
    };

    const onStatus = (statusType, completeOrError = true) => {
      const level = completeOrError === true ? 'success'
                  : completeOrError === 'ignored' ? 'info'
                  : 'error';
      progress(`${statusType}: ${completeOrError}`, level, 'STATUS', { [statusType]: completeOrError });
    };


    /**
     * Wraps a step, handling performance, 
     * @param {Promise<any>} prom - the operation
     * @param {string} step - the step name
     * @param {string} stepAction - overrides step name in logs
     */
    const wrapStep = async (prom, step, stepAction = step) => {
      const stepStart = performance.now();

      try {
        progress(`${stepAction} start`, 'info', undefined, undefined);
        const result = await prom;
        progress(`${stepAction} succeeded in ${elapsedSeconds(stepStart)}s`, 'success', undefined, undefined);
        return result;
      } catch (error) {
        const msg = error?.message || 'UNHANDLED ERROR';
        progress(
          `${stepAction} failed in ${elapsedSeconds(stepStart)}s`,
          'error',
          undefined,
          { error: msg }
        );
        throw SpiritError.fromError(error, step);
      }
    };

    // 1. Check inputs
    if (!conversation.$agent) {
      throw new Error(`SpiritsError: No agent found in conversation, must define ".$agent" in the conversation`);
    }
    const persona = (config.persona || config.personas || config.agents).find(p => p.id === conversation.$agent);
    if (!persona) {
      if ((config.persona || config.personas || config.agents).some(a => !a.id)) {
        throw new Error(`SpiritsError: No persona found ("${conversation.$agent}") in provided config, some persona's did not contain an "id" (Internal Mapping Error)`);
      }
      throw new Error(`SpiritsError: No persona found ("${conversation.$agent}") in provided config`);
    }
    if (!messages.every(m => !!m.id)) {
      throw new Error(`SpiritsError: Every message must have an ".id", ensure all messages have an id assigned before running`);
    }
    if (!messages.every(m => m.role === 'customer' || m.role === 'agent' || m.role === 'system' || m.role === 'tool')) {
      const invalidRoles = messages.filter(m => m.role !== 'customer' && m.role !== 'agent' && m.role !== 'system' && m.role !== 'tool');
      throw new Error(`SpiritsError: Every message must have a role of "customer", "agent", or "system". Got invalid roles: ${invalidRoles.map(
        m => m.role).join(', ')}`);
    }

    // Normalize existing message times ONCE at the start
    enforceMonotonicWithEmits(messages, 1);

    // init emits
    emitSetConversation(conversation);
    emitSetContext(context);

    // if message is not in messages, then add it
    if (!messages.find(m => m.id === input.message.id)) {
      emitAddMessage(pushMessage(messages, input.message));
    }

    // 2. Parse the message
    const parsePayload = await wrapStep(parser(message.content, 'en'), 'parse', 'parsing message');

    if (parsePayload.intent) {
      message.intent = parsePayload.intent;
    }
    if (typeof parsePayload.intentScore === 'number') {
      message.intentScore = parsePayload.intentScore;
    }
    message.context = parsePayload.context;
    message.entities = parsePayload.entities;
    const index = messages.findIndex(m => messageKey(m) === messageKey(message) || m.id === message.id);
    if (index === -1) {
      // Message is not in messages array, add it with parsed info
      const _message = {
        id: idGenerator('customer'),
        role: 'customer',
        content: message.content,
        context: parsePayload.context,
        entities: parsePayload.entities,
        time: new Date().toISOString()
      };
      if (parsePayload.intent) {
        _message.intent = parsePayload.intent;
      }
      if (typeof parsePayload.intentScore === 'number') {
        _message.intentScore = parsePayload.intentScore;
      }
      message = _message;
      message = pushMessage(messages, _message);
      emitAddMessage(message);
      progress(`Added "${_message.role}" message (wasn't originally in array)`, 'info', 'ADD_MESSAGE', _message);
    } else {
      messages[index].context = parsePayload.context;
      messages[index].entities = parsePayload.entities;
      if (parsePayload.intent) {
        messages[index].intent = parsePayload.intent;
      }
      if (typeof parsePayload.intentScore === 'number') {
        messages[index].intentScore = parsePayload.intentScore;
      }
      message = messages[index];
      const patch = {
        id: messages[index].id,
        context: parsePayload.context,
        entities: parsePayload.entities,
        ...(parsePayload.intent ? { intent: parsePayload.intent } : {}),
        ...(typeof parsePayload.intentScore === 'number' ? { intentScore: parsePayload.intentScore } : {}),
      };
      emitUpdateMessage(patch);
      const {id, ...updatedFields} = patch;
      progress(`updated ${id} message fields ${JSON.stringify(Object.keys(updatedFields))}`, 'info', 'UPDATE_MESSAGE', message);
    }
    // If this is the first user message, then update conversations intent
    const previousUserMessages = messages.filter(m => m.role === 'customer' && m.content !== message.content);
    if (!conversation.intent || (previousUserMessages.length === 0 && parsePayload.intent)) {
      conversation = updateConversation(conversation, {
        intent: parsePayload.intent,
        intentScore: parsePayload?.intentScore || 0,
      }, 'intent mapping');
    }
    const oldKeyCount = Object.keys(context).length;
    context = updateContext(context, parsePayload.context);
    const newKeyCount = Object.keys(context).length;

    if (!conversation.locked && (newKeyCount > oldKeyCount)) {
      // Reset lock attempts
      conversation = updateConversation(conversation, {
        locked: false,
        lockAttempts: 0,
        lockedReason: '',
      }, 'reset lock attempts');
    }

    const noNewContext = Object.keys(parsePayload.context).length === 0;

    // upsert parse system messages
    if (parsePayload.contextMessages.length) {
      const toAdd = parsePayload.contextMessages.reduce((accumulator, text) => {
        if (typeof text !== "string" || text.trim() === "") {
          progress("Empty parse system context blocked", "warn", "EMPTY_SYSTEM_MESSAGE", {
            source: "parser.contextMessages",
            text,
          });
        } else if (!messages.find((mes) => mes.content === text)) {
          accumulator.push({
            id: idGenerator("sys"),
            role: "system",
            content: text,
            time: new Date().toISOString(),
          });
        } else {
          progress("Already have system context, skipping", "info", "SKIP_SYSTEM_CONTEXT", { content: text });
        }
        return accumulator;
      }, []);

      for (const m of toAdd) {
        emitAddMessage(pushMessage(messages, m));
      }
    }

    // 3. Run the contextualizer
    // progress('Running contextualizer', 'info', 'SET_PROCESSING', 'system');
    const newContextMessages = await wrapStep(contextualizer({ conversation, messages }), 'contextualize', 'contextualizing');
    for (const contextMessage of newContextMessages) {
      if (isEmptySystemMessage(contextMessage)) {
        progress('Empty contextualizer system message blocked', 'warn', 'EMPTY_SYSTEM_MESSAGE', {
          source: 'contextualizer',
          message: contextMessage,
        });
      } else if (!messages.find(mes => messageKey(mes) === messageKey(contextMessage))) {
        emitAddMessage(pushMessage(messages, contextMessage));
        progress(`Added context ${message.role} message`, 'info', 'ADD_MESSAGE', messages[messages.length - 1]);
      } else {
        progress(`Already have system context, skipping`, 'info');
      }
    }

    // 4. Run the workflow
    // progress('Running workflow', 'info', 'SET_PROCESSING', 'system');
    const slots = await wrapStep(workflow({
      messages,
      conversation,
      context,
      message,
      agent: persona,
      customer,
      intent: {
        current: recentUserMessage(messages)?.intent || null,
        flow: messages.map(m => m.intent).filter(Boolean),
        initial: conversation.intent || null
      },
      stagnationCount: conversation.lockAttempts || 0
    }), 'workflow')
      .then((res) => Array.isArray(res) ? res : [res])
      .then((slots) => slots.reduce((accumulator, slot) => {
        if ('toJSON' in slot) {
          const slotJson = slot.toJSON();
          accumulator.push(...(Array.isArray(slotJson) ? slotJson : [slotJson]));
        } else {
          accumulator.push(slot);
        }
        return accumulator;
      }, []));

    const hasNoInstructions = slots.every(s => !s.instructions || (Array.isArray(s.instructions) && s.instructions.length === 0));
    const hasNoCustomMessage = slots.every(s => !s.message);
    const messagesToTransform = slots.reduce((acc, slot, index) => {
      const m = slot?.message;

      // ignore empty
      if (!m) return acc;

      const adjusted = {
        id: idGenerator('agent'),
        role: 'agent',
        time: new Date().toISOString(),
        content: typeof m === 'string' ? m : (typeof m?.content === 'string' ? m.content : ''),
      };

      if (typeof m !== 'string' && m && typeof m === 'object') {
        // merge any additional fields (tool_calls, transform flag, etc.)
        Object.assign(adjusted, m);
      } else if (typeof m !== 'string') {
        progress(`Slot ${index} message is not string/object`, 'warn', 'SLOT_MESSAGE_TYPE', {
          slotIndex: index,
          typeofMessage: typeof m,
        });
      }

      // only include those explicitly requesting transform
      if (!adjusted.transform) {
        adjusted.ignoreTransform = true;
      }

      // set contentGenerated correctly for manual slot messages
      if (!adjusted.tool_calls && adjusted.role === 'agent') {
        adjusted.contentGenerated = adjusted.contentGenerated ?? adjusted.content;
      }

      if (slot.scheduled) {
        adjusted.time = new Date(slot.scheduled * 1000).toISOString();
        adjusted.scheduled = adjusted.time;
      } else if (slot.secondsDelay) {
        const now = new Date();
        now.setSeconds(now.getSeconds() + slot.secondsDelay);
        adjusted.time = now.toISOString();
        adjusted.delayInSeconds = slot.secondsDelay;
      }

      if (!adjusted.content && !adjusted.tool_calls) {
        progress(`Slot ${index} input error`, 'error', 'SLOT_INPUT_ERROR', {
          error: `Expected slots[${index}].message.content to exist (unless tool_calls provided)`,
        });
        return acc;
      }
      acc.push(adjusted);
      return acc;
    }, []);
    enforceMonotonicWithEmits(messagesToTransform, 1);

    const previousLockAttempt = conversation.lockAttempts || 0; // Used to track

    if (hasNoInstructions && noNewContext) {
      conversation = incrementLockAttempt(conversation, config).updated;
    } else {
      conversation = updateConversation(conversation, {
        lockAttempts: 0,
        locked: false,
        lockedReason: '',
      }, 'reset lock');
    }

    let resettedIntent = false;
    let _forward;
    let _forwardNote;

    /** @type {Array<string> | undefined} */
    let _tasks;

    for (const {
      forward,
      forwardNote,
      instructions,
      removeInstructions,
      message: manualMessage,
      scheduled,
      resetIntent,
      secondsDelay,
      contextUpsert,
      anticipate,
      followup: slotFollowup,
      entityContextUpsert: slotEntityContextUpsert,
      tasks
    } of slots) {

      // Anticipate customer response
      if (anticipate) {
        if (Array.isArray(anticipate)) {
          // 'literal' anticipation
          const slots = {};
          const map = [];
          for (let i = 0; i < anticipate.length; i++) {
            const { keywords, ..._slot } = anticipate[i];
            const slotId = `${i}`;
            slots[slotId] = _slot;
            map.push({
              slot: slotId,
              keywords
            });
          }
          conversation = updateConversation(conversation, {
            type: 'literal',
            slots,
            map
          }, 'anticipation slots');
        } else if ('yes' in anticipate && 'no' in anticipate && 'did' in anticipate) {
          // "did" anticipation
          conversation = updateConversation(conversation, {
            type: 'did',
            slots: {
              yes: anticipate.yes,
              no: anticipate.no
            },
            did: anticipate.did
          }, 'anticipation slots');
        } else {
          throw new Error(`Invalid anticipate payload "${JSON.stringify(anticipate)}"`);
        }
      }

      // tasks from auto/manual ingress to execute
      if (!!tasks && Array.isArray(tasks) && !!tasks.length) {
        if (!_tasks) _tasks = [];
        _tasks.push(...tasks);
      }

      if (slotFollowup) {
        followup.push(slotFollowup);
      }

      if (slotEntityContextUpsert && slotEntityContextUpsert.length) {
        entityContextUpsert.push(...slotEntityContextUpsert);
      }

      // Forward to agent or other agent
      if (forward) {
        conversation = lockConversation(conversation, 'App instructed forward');
        _forward = forward;
        _forwardNote = forwardNote;
        if (typeof forward === 'string') {
          conversation = updateConversation(conversation, { forwarded: forward }, 'forward');
          emitAddMessage(pushMessage(messages, {
            id: idGenerator("sys"),
            role: "system",
            content: `forwarded to "${forward}"`,
            time: new Date().toISOString(),
          }));
          progress(`Forwarded to "${forward}"`, 'info', 'ADD_MESSAGE', messages[messages.length - 1]);
        } else if (typeof forward === 'boolean') {
          conversation = updateConversation(conversation, { forwarded: conversation.$agent }, 'forward');
          emitAddMessage(pushMessage(messages, {
            id: idGenerator("sys"),
            role: "system",
            content: `forwarded to "${forward}"`,
            time: new Date().toISOString(),
          }));
          progress(`Forwarded to agent`, 'info', 'ADD_MESSAGE', messages[messages.length - 1]);

        } else {
          conversation = updateConversation(conversation, { forwarded: forward.to }, 'forward');
          emitAddMessage(pushMessage(messages, {
            id: idGenerator("sys"),
            role: "system",
            content: `forwarded to "${forward.to}" ${forward.mode ? ' (' + forward.mode + ')' : ''}`,
            time: new Date().toISOString(),
          }));
          progress(
            `Forwarded to "${forward.to}" ${forward.mode ? ' (' + forward.mode + ')' : ''}`,
            'info',
            'ADD_MESSAGE',
            messages[messages.length - 1]
          );
        }
      }

      // Insert instructions context
      if (instructions) {
        if (typeof instructions === 'string') {
          addInstruction(instructions, previousLockAttempt);
        } else if (Array.isArray(instructions)) {
          for (const instruction of instructions) {
            if (typeof instruction === 'string') {
              addInstruction(instruction, previousLockAttempt);
            } else {
              addInstruction(instruction.content, previousLockAttempt, instruction.id);
            }
          }
        } else if (typeof instructions === 'object' && 'content' in instructions) {
          addInstruction(instructions.content, previousLockAttempt, instructions.id);
        } else {
          throw new Error(`SpiritsError: instructions must be a string or array or {content: "<instruction>"}, got: ${JSON.stringify(
            instructions)}`);
        }
      }


      // Remove messages that have the given ids
      if (removeInstructions) {
        for (const instructionId of removeInstructions) {
          const index = messages.findIndex(m => m.id === instructionId);
          if (index > -1) {
            const removed = messages.splice(index, 1)[0];
            progress('Remove instruction', 'info', 'REMOVE_MESSAGE', instructionId);
            emitDeleteMessage(removed?.id || instructionId);
          } else {
            console.log(`Spirits: Instruction not found "${instructionId}", other ids: ${messages.map(m => `"${m.id}"`)
              .join(', ')}`);
          }
        }
      }

      // @TODO this logic is now handled at messagesToTransform's initialization, maybe move back down here
      // if (manualMessage) {

      //   /** @type {import('@scout9/admin').Message} */
      //   let manualMessageObj = {
      //     id: idGenerator('persona'),
      //     role: 'agent', // @TODO switch role to persona
      //     content: '',
      //     time: new Date().toISOString()
      //   };
      //   if (typeof manualMessage === 'object') {
      //     Object.assign(manualMessageObj, manualMessage);
      //     manualMessageObj.role = 'agent';
      //     manualMessageObj.time = new Date().toISOString();
      //   } else if (typeof manualMessage === 'string') {
      //     manualMessageObj.content = manualMessage;
      //   } else {
      //     throw new Error('Manual message must be of type "string" or "DirectMessage"');
      //   }

      //   if (scheduled) {
      //     manualMessageObj.time = new Date(scheduled * 1000).toISOString();
      //     manualMessageObj.scheduled = manualMessageObj.time;
      //   } else if (secondsDelay) {
      //     const now = new Date();
      //     now.setSeconds(now.getSeconds() + secondsDelay);
      //     manualMessageObj.time = now.toISOString();
      //     manualMessageObj.delayInSeconds = secondsDelay;
      //   }
      //   // @TODO should we mark this as ignored transform?
      //   manualMessageObj.ignoreTransform = true;
      //   messagesToTransform.push(manualMessageObj);
      //   progress('Added manual message', 'info', 'ADD_MESSAGE', messagesToTransform[messagesToTransform.length - 1]);
      // }

      if (contextUpsert) {
        context = updateContext(context, contextUpsert);
      }

      if (resetIntent) {
        resettedIntent = true;
      }

    }

    enforceMonotonicWithEmits(messages, 1);

    if (resettedIntent && !_forward) {
      conversation = updateConversation(conversation, {
        intent: null,
        intentScore: null,
        locked: false,
        lockedReason: '',
        lockAttempts: 0,
      }, 'reset conversation intent');
    }

    // 5. Generate response
    // If conversation previously locked, don't generate
    if (!input.conversation.locked) {
      // If conversation is newly locked, don't generate, unless instructions were provided and no custom messages were provided
      if ((!conversation.locked || !hasNoInstructions) && !!hasNoCustomMessage) {
        try {
          // progress('Generating message', 'info', 'SET_PROCESSING', 'system');

          /** @type {import('@scout9/admin').GenerateRequestOneOf1} */
          const generatorInput = {
            messages,
            persona,
            context,
            llm: config.llm,
            pmt: config.pmt
          };

          if (!!_tasks && Array.isArray(_tasks) && !!_tasks.length) {
            generatorInput.tasks = _tasks;
          }
          const generatorPayload = await wrapStep(generator(generatorInput), 'generate');
          if (!generatorPayload.send) {
            progress(
              'Generated response send rejected',
              'error',
              undefined,
              { error: generatorPayload.errors?.join('\n\n') || 'Unknown Reason' }
            );
            console.error(
              `Spirits: Locking conversation, api returned send false: ${generatorPayload.messages}`,
              generatorPayload.errors?.join('\n\n') || generatorPayload.forwardNote || 'Unknown Reason'
            );
            conversation = lockConversation(
              conversation,
              'API: ' + generatorPayload.errors?.join('\n\n') || generatorPayload.forwardNote || 'Unknown Reason'
            );
          } else {
            // Check if already had message
            const agentMessages = messages.filter(m => m.role === 'agent');
            const lastAgentMessage = agentMessages[agentMessages.length - 1];

            // Build addedMessages from generatorPayload.messages
            const addedMessages = (generatorPayload?.messages ?? [])
              .map((message) => {
                // Normalize time → ISO string
                const t = message.time;
                let isoTime;

                if (typeof t === "string") {
                  isoTime = t;
                } else if (t instanceof Date) {
                  isoTime = t.toISOString();
                } else if (t && typeof t.toDate === "function") {
                  // Firestore Timestamp
                  isoTime = t.toDate().toISOString();
                } else {
                  progress(
                    `Message "${message.content}" wasn't given a usable timestamp (${JSON.stringify(
                      t
                    )}), defaulting to now`
                  );
                  isoTime = new Date().toISOString();
                }

                // Base fields we guarantee
                const base = {
                  role: message.role,
                  content: message.content,
                  contentGenerated: message.content,
                  id: idGenerator(message.role),
                  time: nextMonotonicIso(messages, isoTime, 1),
                };

                // Copy any other non-nullish fields without overwriting base
                return Object.entries(message).reduce((acc, [key, value]) => {
                  if (!Object.prototype.hasOwnProperty.call(acc, key) && value != null) {
                    acc[key] = value;
                  }
                  return acc;
                }, base);
              })
              // De-dupe by content (change the key if you want stricter uniqueness)
              .reduce(
                (acc, msg) => {
                  const key = messageKey(msg);
                  if (!acc.seen.has(key)) {
                    acc.seen.add(key);
                    acc.items.push(msg);
                  } else {
                    console.error(`Spirits: Duplicate message removed: ${JSON.stringify(msg)}`);
                    progress('Duplicate message removed', 'warn', 'DUPLICATE_MESSAGE_REMOVED', {
                      key,
                      role: msg.role,
                      id: msg.id,
                      tool_call_id: msg.tool_call_id,
                    });
                  }
                  return acc;
                },
                { seen: new Set(), items: [] }
              ).items;

            enforceMonotonicWithEmits(addedMessages, 1);

            logToolPairingIssues([...messages, ...addedMessages], 'post-dedupe');


            if (lastAgentMessage && lastAgentMessage.content && addedMessages.some((message) => message.content === lastAgentMessage.content)) {
              // Error should not have happened
              conversation = lockConversation(conversation, 'Duplicate message');
            } else {
              enforceMonotonicWithEmits(messagesToTransform, 1);
              for (const newMessage of addedMessages) {
                // messages.push(newMessage); switched to push to messages after transform is complete
                pushMessage(messagesToTransform, {
                  ...newMessage,
                  contentGenerated: newMessage.contentGenerated ?? newMessage.content,
                });
                progress('Added agent message for transform', 'info', 'ADD_MESSAGE', messagesToTransform[messagesToTransform.length - 1]);
              }
            }

            // Check if conversation was marked for forward (generator message still allowed to be sent)
            if (generatorPayload.forward) {
              conversation = lockConversation(
                conversation,
                'API: ' + generatorPayload.forwardNote || 'Forwarded by API'
              );
              if (!_forward) {
                _forward = generatorPayload.forward;
                _forwardNote = generatorPayload.forwardNote;
              }
            }
          }

        } catch (e) {
          onError(e);
          console.error(`Spirits: Locking conversation, error generating response: ${e.message}`);
          conversation = lockConversation(conversation, 'API: ' + e.message);
        }
      } else {
        onStatus('generate', 'ignored');
      }

      // For manual messages to transform
      if (messagesToTransform.length && transformer) {
        try {
          const transformResponse = await wrapStep(transformer({
            // message: messagesToTransform,
            addedMessages: messagesToTransform,
            persona,
            customer: customer.id,
            messages,
            context
          }), 'transform');

          // @TODO check for duplicates, or have already sent the message
          const transformedMessages =
            transformResponse.messages?.length
              ? transformResponse.messages
              : [{ role: 'agent', content: transformResponse.message }];

              const appendedList = [];
          for (const message of transformedMessages) {
            const adjusted = {
              id: idGenerator('agent'),
              role: 'agent',
              time: new Date().toISOString(),
              ...message,
            };

            if (adjusted.role === 'agent' && adjusted.content && !adjusted.ignoreTransform && !adjusted.tool_calls) {
              const prior = messagesToTransform.find((m) => m.id === message.id);
              if (prior) {
                adjusted.contentGenerated = prior.content;        // BEFORE (original)
                adjusted.contentTransformed = adjusted.content;   // AFTER (transformed)
              } else {
                // fallback if transformer changed ids
                adjusted.contentGenerated = adjusted.contentGenerated ?? adjusted.content;
                adjusted.contentTransformed = adjusted.contentTransformed ?? adjusted.content;
              }
            }

            if (adjusted.role === 'agent' && adjusted.content && !adjusted.ignoreTransform && !adjusted.tool_calls && !adjusted.contentTransformed) {
              progress('missing contentTransformed on a generated message', 'warn', undefined, adjusted);
              adjusted.contentTransformed = adjusted.content;
            }

            const appended = pushMessage(messages, adjusted);
            appendedList.push(appended);
            emitAddMessage(appended);
          }

          progress(`Added ${appendedList.length} persona message${appendedList.length === 1 ? '' : 's'}`, "info", "ADD_MESSAGES", appendedList);

        } catch (e) {
          console.error(`Spirits: Locking conversation, error transforming response: ${e.message}`);
          conversation = lockConversation(conversation, 'API: ' + e.message);
          onError(e);
        }
      } else if (messagesToTransform.length) {
        console.warn(`Spirits: No transformer provided`);
        onStatus('transform', 'ignored');
      } else {
        onStatus('transform', 'ignored');
      }
    } else {
      onStatus('generate', 'ignored');
      onStatus('transform', 'ignored');
    }

    const emptySystemMessages = messages.filter(isEmptySystemMessage);
    if (emptySystemMessages.length) {
      progress('Empty system messages detected post-run', 'error', 'EMPTY_SYSTEM_MESSAGE_FINAL', {
        count: emptySystemMessages.length,
        ids: emptySystemMessages.map((m) => m.id),
      });
      console.error('Spirits: Empty system messages detected', emptySystemMessages);
    }

    logToolPairingIssues(messages, 'final');

    progress(`Spirits.customer executed in ${elapsedSeconds(rootStart)}s total`, 'success', undefined, undefined);

    return {
      conversation: {
        before: conversationBefore,
        after: conversation,
        forward: _forward || null,
        forwardNote: _forwardNote || ''
      },
      messages: {
        before: messagesBefore,
        after: messages
      },
      message: {
        before: messageBefore,
        after: message
      },
      context: {
        before: contextBefore,
        after: context
      },
      followup,
      entityContextUpsert
    };
  }
};
