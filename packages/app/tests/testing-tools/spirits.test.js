import { jest } from "@jest/globals";
import { Spirits } from "../../src/testing-tools/spirits.js";

// -------------------- Utilities --------------------

function makeIdGen() {
  let n = 0;
  return (prefix) => `${prefix || "id"}_${++n}`;
}

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

function nowIso() {
  return new Date().toISOString();
}

function baseInput(overrides = {}) {
  const idGenerator = makeIdGen();

  const conversation = {
    id: "conv_1",
    $agent: "persona_1",
    locked: false,
    lockAttempts: 0,
    lockedReason: "",
  };

  const config = {
    llm: { model: "fake" },
    pmt: {},
    personas: [{ id: "persona_1", name: "Test Persona" }],
  };

  const customer = { id: "cust_1" };

  const initialCustomerMessage = {
    id: "msg_customer_1",
    role: "customer",
    content: "hello",
    time: nowIso(),
  };

  const messages = [initialCustomerMessage];

  return {
    customer,
    config,
    conversation,
    messages,
    message: initialCustomerMessage,
    context: {},
    progress: jest.fn(),
    idGenerator,

    parser: jest.fn(async () => ({
      intent: "greet",
      intentScore: 0.9,
      context: {},
      entities: [],
      contextMessages: [],
    })),

    contextualizer: jest.fn(async () => []),

    // default workflow adds one system instruction
    workflow: jest.fn(async () => [{ instructions: "be helpful" }]),

    generator: jest.fn(async () => ({
      send: true,
      messages: [{ role: "agent", content: "hello there sir", time: nowIso() }],
    })),

    transformer: jest.fn(async (req) => ({
      messages: req.addedMessages.map((m) => ({
        ...m,
        content: "hello there Gary",
        contentTransformed: "hello there Gary",
      })),
    })),

    ...overrides,
  };
}

/**
 * Stable projection for assertions (ignore ids/times/etc).
 */
function pluckMessageFields(messages) {
  return (messages || []).map((m) => ({
    role: m.role,
    content: m.content,
    contentGenerated: m.contentGenerated,
    contentTransformed: m.contentTransformed,
    tool_call_id: m.role === "tool" ? m.tool_call_id : undefined,
    tool_calls: m.tool_calls ? m.tool_calls : undefined,
  }));
}

/**
 * Assert every assistant tool_call has a matching tool response.
 * OpenAI-style pairing: tool_calls[].id <-> tool.tool_call_id
 */
function assertToolPairing(messages) {
  const assistantToolCallIds = [];
  for (const m of messages || []) {
    if (m?.tool_calls?.length) {
      for (const tc of m.tool_calls) assistantToolCallIds.push(tc.id);
    }
  }
  const toolResponseIds = new Set(
    (messages || [])
      .filter((m) => m.role === "tool" && m.tool_call_id)
      .map((m) => m.tool_call_id)
  );

  for (const id of assistantToolCallIds) {
    expect(toolResponseIds.has(id)).toBe(true);
  }
}

function progressCalls(progressMock, type) {
  return progressMock.mock.calls.filter(([, , t]) => t === type);
}

/**
 * Transformer mock that returns same shape + order as req.addedMessages,
 * only mutating content + contentTransformed for agent messages.
 */
function makeTransformer({
  expectedAddedMessagesLen,
  transformedContent,
  assertAddedMessages,
  passthroughNonAgents = true,
} = {}) {
  return jest.fn(async (req) => {
    expect(req).toHaveProperty("addedMessages");
    expect(Array.isArray(req.addedMessages)).toBe(true);

    if (typeof expectedAddedMessagesLen === "number") {
      expect(req.addedMessages).toHaveLength(expectedAddedMessagesLen);
    }

    if (assertAddedMessages) assertAddedMessages(req.addedMessages);

    return {
      messages: req.addedMessages.map((m) => {
        if (m.role === "agent") {
          return {
            ...m,
            content: transformedContent,
            contentTransformed: transformedContent,
          };
        }
        return passthroughNonAgents ? m : { ...m };
      }),
    };
  });
}

// -------------------- Callback state accumulator --------------------

/**
 * State accumulator that matches Spirits' "best-effort callback" contract:
 * - onUpdateMessage UPSERTs (it may arrive before onAddMessage in some paths)
 * - onAddMessage always upserts
 * - onDeleteMessage deletes if exists (no throw)
 *
 * We store messages in a Map for O(1) updates and predictable deep equality.
 */
function makeStateAccumulator(seed) {
  const state = {
    conversation: clone(seed.conversation),
    context: clone(seed.context),
    // Map<string, Message>
    messages: new Map((seed.messages || []).map((m) => [m.id, clone(m)])),
    message: clone(seed.message),
    chunks: [],
  };

  return {
    state,
    callbacks: {
      onSetConversation: (conv) => {
        state.conversation = clone(conv);
      },

      onUpdateConversation: (patch) => {
        Object.assign(state.conversation, clone(patch));
      },

      onSetContext: (ctx) => {
        state.context = clone(ctx);
      },

      onUpdateContext: (patch) => {
        Object.assign(state.context, clone(patch));
      },

      // Optional: store chunk events; useful for future tests
      onChunkMessage: (args) => {
        state.chunks.push(clone(args));
      },

      onAddMessage: (message) => {
        // upsert
        state.messages.set(message.id, clone(message));
      },

      onUpdateMessage: (patch) => {
        if (!patch?.id || typeof patch.id !== "string" || !patch.id.trim()) {
          throw new Error("Test accumulator: onUpdateMessage requires patch.id");
        }
        const prev = state.messages.get(patch.id);
        if (!prev) {
          // UPSERT on update (Spirits may emit updates before add in some flows)
          state.messages.set(patch.id, { id: patch.id, ...clone(patch) });
        } else {
          state.messages.set(patch.id, { ...prev, ...clone(patch) });
        }
        if (state.message?.id === patch.id) Object.assign(state.message, clone(patch));
      },

      onDeleteMessage: (id) => {
        state.messages.delete(id);
      },
    },
  };
}

function withStateCallbacks(input) {
  const acc = makeStateAccumulator({
    conversation: input.conversation,
    context: input.context,
    messages: input.messages,
    message: input.message,
  });

  return {
    acc,
    input: {
      ...input,
      ...acc.callbacks,
    },
  };
}

/**
 * Deep equality between callback-accumulated state and Spirits event.
 * We compare:
 * - conversation objects
 * - context objects
 * - messages arrays (by sorting deterministically)
 */
function expectCallbackStateMatchesEvent(acc, event) {
  const accMsgs = Array.from(acc.state.messages.values()).sort((a, b) => {
    const at = new Date(a.time).getTime();
    const bt = new Date(b.time).getTime();
    if (at !== bt) return at - bt;
    return String(a.id).localeCompare(String(b.id));
  });

  const evtMsgs = [...event.messages.after].sort((a, b) => {
    const at = new Date(a.time).getTime();
    const bt = new Date(b.time).getTime();
    if (at !== bt) return at - bt;
    return String(a.id).localeCompare(String(b.id));
  });

  expect(accMsgs).toEqual(evtMsgs);
  expect(acc.state.context).toEqual(event.context.after);
  expect(acc.state.conversation).toEqual(event.conversation.after);
}

// -------------------- Strict console capture --------------------

function installConsoleGuards() {
  const errors = [];
  const warns = [];
  const logs = [];

  const errorSpy = jest.spyOn(console, "error").mockImplementation((...args) => {
    errors.push(args.map(String).join(" "));
  });

  const warnSpy = jest.spyOn(console, "warn").mockImplementation((...args) => {
    warns.push(args.map(String).join(" "));
  });

  const logSpy = jest.spyOn(console, "log").mockImplementation((...args) => {
    logs.push(args.map(String).join(" "));
  });

  const allow = {
    // Some tests intentionally create this warning
    toolPairingMissing(stageOrAny) {
      return [
        `Spirits: Missing tool responses (${stageOrAny}):`,
        "Spirits: Missing tool responses (post-dedupe):",
        "Spirits: Missing tool responses (final):",
      ];
    },
    duplicateRemoved: ["Duplicate message removed"],
  };

  const assertNoUnexpected = ({ allowError = [], allowWarn = [] } = {}) => {
    const allowedErrors = [...allowError];
    const allowedWarns = [...allowWarn];

    const unexpectedErrors = errors.filter((e) => !allowedErrors.some((a) => e.includes(a)));
    const unexpectedWarns = warns.filter((w) => !allowedWarns.some((a) => w.includes(a)));

    expect(unexpectedErrors).toEqual([]);
    expect(unexpectedWarns).toEqual([]);
  };

  const restore = () => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    logSpy.mockRestore();
  };

  return { errors, warns, logs, allow, assertNoUnexpected, restore };
}

// -------------------- Tests --------------------

describe("Spirits.customer (strict)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("generator output is routed into transformer; plucked transcript matches; callbacks deep-equal", async () => {
    const guard = installConsoleGuards();

    const transformer = makeTransformer({
      expectedAddedMessagesLen: 1,
      transformedContent: "hello there Gary",
      assertAddedMessages: (added) => {
        expect(added[0].role).toBe("agent");
        expect(added[0].content).toBe("hello there sir");
        expect(added[0].contentGenerated).toBe("hello there sir");
      },
    });

    const base = baseInput({
      transformer,
      workflow: jest.fn(async () => [{ instructions: "be helpful" }]),
      generator: jest.fn(async () => ({
        send: true,
        messages: [{ role: "agent", content: "hello there sir", time: nowIso() }],
      })),
    });

    const { input, acc } = withStateCallbacks(base);
    const event = await Spirits.customer(input);

    expect(transformer).toHaveBeenCalledTimes(1);

    expect(pluckMessageFields(event.messages.after)).toEqual([
      { role: "customer", content: "hello", contentGenerated: undefined, contentTransformed: undefined, tool_call_id: undefined, tool_calls: undefined },
      { role: "system", content: "be helpful", contentGenerated: undefined, contentTransformed: undefined, tool_call_id: undefined, tool_calls: undefined },
      { role: "agent", content: "hello there Gary", contentGenerated: "hello there sir", contentTransformed: "hello there Gary", tool_call_id: undefined, tool_calls: undefined },
    ]);

    expectCallbackStateMatchesEvent(acc, event);
    guard.assertNoUnexpected();
    guard.restore();
  });

  test("manual slot message with transform=true is included; generator skipped; callbacks deep-equal", async () => {
    const guard = installConsoleGuards();

    const generator = jest.fn(async () => ({
      send: true,
      messages: [{ role: "agent", content: "SHOULD_NOT_RUN", time: nowIso() }],
    }));

    const transformer = makeTransformer({
      expectedAddedMessagesLen: 1,
      transformedContent: "MANUAL_ONE_X",
      assertAddedMessages: (added) => {
        expect(added[0].role).toBe("agent");
        expect(added[0].content).toBe("MANUAL_ONE");
        expect(added[0].contentGenerated).toBe("MANUAL_ONE");
      },
    });

    const base = baseInput({
      transformer,
      generator,
      workflow: jest.fn(async () => [
        { instructions: "be helpful" },
        { message: { transform: true, content: "MANUAL_ONE" } },
      ]),
    });

    const { input, acc } = withStateCallbacks(base);
    const event = await Spirits.customer(input);

    expect(transformer).toHaveBeenCalledTimes(1);
    expect(generator).toHaveBeenCalledTimes(0);

    expect(pluckMessageFields(event.messages.after)).toEqual([
      { role: "customer", content: "hello", contentGenerated: undefined, contentTransformed: undefined, tool_call_id: undefined, tool_calls: undefined },
      { role: "system", content: "be helpful", contentGenerated: undefined, contentTransformed: undefined, tool_call_id: undefined, tool_calls: undefined },
      { role: "agent", content: "MANUAL_ONE_X", contentGenerated: "MANUAL_ONE", contentTransformed: "MANUAL_ONE_X", tool_call_id: undefined, tool_calls: undefined },
    ]);

    expectCallbackStateMatchesEvent(acc, event);
    guard.assertNoUnexpected();
    guard.restore();
  });

  test("if transformer omits contentTransformed, Spirits sets it to content", async () => {
    const guard = installConsoleGuards();

    const transformer = jest.fn(async (req) => ({
      messages: req.addedMessages.map((m) => ({
        ...m,
        content: "hello there Gary",
        // contentTransformed intentionally missing
      })),
    }));

    const base = baseInput({ transformer });
    const { input, acc } = withStateCallbacks(base);
    const event = await Spirits.customer(input);

    expect(pluckMessageFields(event.messages.after)).toEqual([
      { role: "customer", content: "hello", contentGenerated: undefined, contentTransformed: undefined, tool_call_id: undefined, tool_calls: undefined },
      { role: "system", content: "be helpful", contentGenerated: undefined, contentTransformed: undefined, tool_call_id: undefined, tool_calls: undefined },
      { role: "agent", content: "hello there Gary", contentGenerated: "hello there sir", contentTransformed: "hello there Gary", tool_call_id: undefined, tool_calls: undefined },
    ]);

    expectCallbackStateMatchesEvent(acc, event);
    guard.assertNoUnexpected();
    guard.restore();
  });

  test("tool messages: same content but different tool_call_id are NOT deduped", async () => {
    const guard = installConsoleGuards();

    const sharedToolContent =
      '```json\n{\n  "context": "No memory recollection found.",\n  "hint": "Use EntitiesAgent next."\n}\n```';

    const generator = jest.fn(async () => ({
      send: true,
      messages: [
        { role: "tool", content: sharedToolContent, tool_call_id: "call_A", time: nowIso() },
        { role: "tool", content: sharedToolContent, tool_call_id: "call_B", time: nowIso() },
        { role: "agent", content: "hello there sir", time: nowIso() },
      ],
    }));

    const transformer = makeTransformer({
      expectedAddedMessagesLen: 3,
      transformedContent: "hello there Gary",
    });

    const base = baseInput({
      generator,
      transformer,
      workflow: jest.fn(async () => [{ instructions: "be helpful" }]),
    });

    const { input, acc } = withStateCallbacks(base);
    const event = await Spirits.customer(input);

    const toolMsgs = event.messages.after.filter((m) => m.role === "tool");
    expect(toolMsgs).toHaveLength(2);
    expect(toolMsgs.map((m) => m.tool_call_id).sort()).toEqual(["call_A", "call_B"]);

    // no duplicate removed logs should occur
    guard.assertNoUnexpected({ allowError: [], allowWarn: [] });

    expectCallbackStateMatchesEvent(acc, event);
    guard.restore();
  });

  test("tool_call pairing: assistant tool_calls[].id must have tool response; no warnings/errors", async () => {
    const guard = installConsoleGuards();

    const generator = jest.fn(async () => ({
      send: true,
      messages: [
        {
          role: "agent",
          content: "",
          tool_calls: [{ id: "call_X", type: "function", function: { name: "MemoryAgent", arguments: "{}" } }],
          time: nowIso(),
        },
        { role: "tool", tool_call_id: "call_X", content: '```json\n{"ok":true}\n```', time: nowIso() },
        { role: "agent", content: "hello there sir", time: nowIso() },
      ],
    }));

    const transformer = jest.fn(async (req) => ({
      messages: req.addedMessages.map((m) => {
        if (m.role === "agent" && m.content) {
          return { ...m, content: "hello there Gary", contentTransformed: "hello there Gary" };
        }
        return m;
      }),
    }));

    const base = baseInput({
      generator,
      transformer,
      workflow: jest.fn(async () => [{ instructions: "be helpful" }]),
    });

    const { input, acc } = withStateCallbacks(base);
    const event = await Spirits.customer(input);

    assertToolPairing(event.messages.after);

    guard.assertNoUnexpected();
    expectCallbackStateMatchesEvent(acc, event);
    guard.restore();
  });

  test("missing tool response triggers TOOL_PAIRING_MISSING_TOOL progress + console error allowed", async () => {
    const guard = installConsoleGuards();
    const progress = jest.fn();

    const generator = jest.fn(async () => ({
      send: true,
      messages: [
        {
          role: "agent",
          content: "",
          tool_calls: [{ id: "call_MISSING", type: "function", function: { name: "MemoryAgent", arguments: "{}" } }],
          time: nowIso(),
        },
        { role: "agent", content: "hello there sir", time: nowIso() },
      ],
    }));

    const transformer = jest.fn(async (req) => ({
      messages: req.addedMessages.map((m) => {
        if (m.role === "agent" && m.content) {
          return { ...m, content: "hello there Gary", contentTransformed: "hello there Gary" };
        }
        return m;
      }),
    }));

    const base = baseInput({
      progress,
      generator,
      transformer,
      workflow: jest.fn(async () => [{ instructions: "be helpful" }]),
    });

    const { input, acc } = withStateCallbacks(base);
    await Spirits.customer(input);

    const warnings = progressCalls(progress, "TOOL_PAIRING_MISSING_TOOL");
    expect(warnings.length).toBeGreaterThanOrEqual(1);

    const payloads = warnings.map((c) => c[3]).filter(Boolean);
    const flatMissing = payloads.flatMap((p) => p.missingToolResponses || []);
    expect(flatMissing).toContain("call_MISSING");

    // allow console error about missing tool responses
    guard.assertNoUnexpected({
      allowError: guard.allow.toolPairingMissing("post-dedupe").concat(guard.allow.toolPairingMissing("final")),
      allowWarn: [],
    });

    // Note: callback parity still should hold
    // (Spirits still returns messages; callback accumulator should match)
    // We can't capture event here without storing it; re-run quickly for parity check
    const { input: input2, acc: acc2 } = withStateCallbacks(base);
    const event2 = await Spirits.customer(input2);
    expectCallbackStateMatchesEvent(acc2, event2);

    guard.restore();
  });

  test("dedupe removes true duplicate agent messages (same role/content)", async () => {
    const guard = installConsoleGuards();

    const generator = jest.fn(async () => ({
      send: true,
      messages: [
        { role: "agent", content: "DUPLICATE_ME", time: nowIso() },
        { role: "agent", content: "DUPLICATE_ME", time: nowIso() },
      ],
    }));

    const transformer = makeTransformer({
      expectedAddedMessagesLen: 1,
      transformedContent: "DEDUPED_X",
    });

    const base = baseInput({
      generator,
      transformer,
      workflow: jest.fn(async () => [{ instructions: "be helpful" }]),
    });

    const { input, acc } = withStateCallbacks(base);
    const event = await Spirits.customer(input);

    const agentMsgs = event.messages.after.filter((m) => m.role === "agent");
    expect(agentMsgs).toHaveLength(1);

    guard.assertNoUnexpected({
      allowError: guard.allow.duplicateRemoved,
      allowWarn: [],
    });

    expectCallbackStateMatchesEvent(acc, event);
    guard.restore();
  });

  test("cross-role collision: same content in tool and agent should not dedupe", async () => {
    const guard = installConsoleGuards();

    const same = "SAME_STRING";

    const generator = jest.fn(async () => ({
      send: true,
      messages: [
        { role: "tool", tool_call_id: "call_Z", content: same, time: nowIso() },
        { role: "agent", content: same, time: nowIso() },
      ],
    }));

    const transformer = jest.fn(async (req) => ({
      messages: req.addedMessages.map((m) => {
        if (m.role === "agent") return { ...m, content: "AGENT_X", contentTransformed: "AGENT_X" };
        return m;
      }),
    }));

    const base = baseInput({
      generator,
      transformer,
      workflow: jest.fn(async () => [{ instructions: "be helpful" }]),
    });

    const { input, acc } = withStateCallbacks(base);
    const event = await Spirits.customer(input);

    expect(event.messages.after.filter((m) => m.role === "tool")).toHaveLength(1);
    expect(event.messages.after.filter((m) => m.role === "agent")).toHaveLength(1);

    guard.assertNoUnexpected();
    expectCallbackStateMatchesEvent(acc, event);
    guard.restore();
  });

  test("timestamp normalization: generator message times (Date/string/toDate) become ISO strings + monotonic", async () => {
    const guard = installConsoleGuards();

    const firestoreLike = { toDate: () => new Date("2025-01-01T00:00:00.000Z") };

    const generator = jest.fn(async () => ({
      send: true,
      messages: [
        { role: "agent", content: "A", time: new Date("2025-01-02T00:00:00.000Z") },
        { role: "agent", content: "B", time: "2025-01-03T00:00:00.000Z" },
        { role: "agent", content: "C", time: firestoreLike },
      ],
    }));

    const transformer = makeTransformer({ expectedAddedMessagesLen: 3, transformedContent: "X" });

    const base = baseInput({
      generator,
      transformer,
      workflow: jest.fn(async () => [{ instructions: "be helpful" }]),
    });

    const { input, acc } = withStateCallbacks(base);
    const event = await Spirits.customer(input);

    const agentMsgs = event.messages.after.filter((m) => m.role === "agent");
    expect(agentMsgs).toHaveLength(3);

    for (const m of agentMsgs) {
      expect(typeof m.time).toBe("string");
      expect(m.time.includes("T")).toBe(true);
      expect(m.time.endsWith("Z")).toBe(true);
    }

    // monotonic by >= 1s across whole transcript
    const times = event.messages.after.map((m) => new Date(m.time).getTime());
    for (let i = 1; i < times.length; i++) {
      expect(times[i] - times[i - 1]).toBeGreaterThanOrEqual(1000);
    }

    guard.assertNoUnexpected();
    expectCallbackStateMatchesEvent(acc, event);
    guard.restore();
  });

  test("monotonic: identical timestamps become strictly increasing by >= 1s (whole transcript)", async () => {
    const guard = installConsoleGuards();

    const t = "2025-01-01T00:00:00.000Z";

    const base = baseInput({
      workflow: jest.fn(async () => [{ instructions: "be helpful" }]),
      generator: jest.fn(async () => ({
        send: true,
        messages: [
          { role: "agent", content: "A", time: t },
          { role: "agent", content: "B", time: t },
          { role: "agent", content: "C", time: t },
        ],
      })),
      transformer: makeTransformer({ expectedAddedMessagesLen: 3, transformedContent: "X" }),
    });

    const { input, acc } = withStateCallbacks(base);
    const event = await Spirits.customer(input);

    const allTimes = event.messages.after.map((m) => new Date(m.time).getTime());
    for (let i = 1; i < allTimes.length; i++) {
      expect(allTimes[i]).toBeGreaterThanOrEqual(allTimes[i - 1] + 1000);
    }

    guard.assertNoUnexpected();
    expectCallbackStateMatchesEvent(acc, event);
    guard.restore();
  });

  test("lockAttempts increment: when workflow has no instructions and parse adds no context", async () => {
    const guard = installConsoleGuards();

    const base = baseInput({
      conversation: { ...baseInput().conversation, lockAttempts: 1, locked: false },
      parser: jest.fn(async () => ({
        intent: "greet",
        intentScore: 0.9,
        context: {},
        entities: [],
        contextMessages: [],
      })),
      workflow: jest.fn(async () => [{}]),
      generator: jest.fn(async () => ({ send: true, messages: [] })),
      transformer: makeTransformer({ expectedAddedMessagesLen: 0, transformedContent: "X" }),
    });

    const { input, acc } = withStateCallbacks(base);
    const event = await Spirits.customer(input);

    expect(event.conversation.after.lockAttempts).toBe(2);
    expect(event.conversation.after.locked).toBe(false);

    guard.assertNoUnexpected();
    expectCallbackStateMatchesEvent(acc, event);
    guard.restore();
  });

  test("locks after exceeding maxLockAttempts", async () => {
    const guard = installConsoleGuards();

    const base = baseInput({
      config: { ...baseInput().config, maxLockAttempts: 2 },
      conversation: { ...baseInput().conversation, lockAttempts: 2, locked: false },
      workflow: jest.fn(async () => [{}]),
      parser: jest.fn(async () => ({ intent: "x", intentScore: 0.1, context: {}, entities: [], contextMessages: [] })),
      generator: jest.fn(async () => ({ send: true, messages: [] })),
      transformer: makeTransformer({ expectedAddedMessagesLen: 0, transformedContent: "X" }),
    });

    const { input, acc } = withStateCallbacks(base);
    const event = await Spirits.customer(input);

    expect(event.conversation.after.locked).toBe(true);
    expect(event.conversation.after.lockedReason).toMatch(/Max lock attempts exceeded/);

    guard.assertNoUnexpected();
    expectCallbackStateMatchesEvent(acc, event);
    guard.restore();
  });

  test("forward slot locks conversation and adds forwarded system message", async () => {
    const guard = installConsoleGuards();

    const base = baseInput({
      workflow: jest.fn(async () => [{ forward: "agent_2", forwardNote: "handoff" }]),
      generator: jest.fn(async () => ({ send: true, messages: [] })),
      transformer: makeTransformer({ expectedAddedMessagesLen: 0, transformedContent: "X" }),
    });

    const { input, acc } = withStateCallbacks(base);
    const event = await Spirits.customer(input);

    expect(event.conversation.after.locked).toBe(true);
    expect(event.conversation.after.forwarded).toBe("agent_2");

    const sys = event.messages.after.find((m) => m.role === "system" && String(m.content).includes("forwarded to"));
    expect(sys?.content).toContain("agent_2");

    guard.assertNoUnexpected();
    expectCallbackStateMatchesEvent(acc, event);
    guard.restore();
  });

  test("Spirits emits onUpdateMessage patches with id (basic contract)", async () => {
    const guard = installConsoleGuards();

    const base = baseInput();

    const seenBad = [];
    const onUpdateMessage = jest.fn((patch) => {
      if (!patch || typeof patch.id !== "string" || !patch.id.trim()) seenBad.push(patch);
    });

    await Spirits.customer({
      ...base,
      onUpdateMessage,
      onAddMessage: jest.fn(),
      onSetConversation: jest.fn(),
      onUpdateConversation: jest.fn(),
      onSetContext: jest.fn(),
      onUpdateContext: jest.fn(),
      onDeleteMessage: jest.fn(),
      onChunkMessage: jest.fn(),
    });

    expect(onUpdateMessage).toHaveBeenCalled();
    expect(seenBad).toEqual([]);

    guard.assertNoUnexpected();
    guard.restore();
  });
});
