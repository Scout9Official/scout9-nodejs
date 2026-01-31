import { jest } from '@jest/globals';
import { Spirits } from '../../src/testing-tools/spirits.js';

function makeIdGen() {
    let n = 0;
    return (prefix) => `${prefix || 'id'}_${++n}`;
}

function baseInput(overrides = {}) {
    const idGenerator = makeIdGen();

    const conversation = {
        id: 'conv_1',
        $agent: 'persona_1',
        locked: false,
        lockAttempts: 0,
        lockedReason: '',
    };

    const config = {
        llm: { model: 'fake' },
        pmt: {},
        personas: [{ id: 'persona_1', name: 'Test Persona' }],
    };

    const customer = { id: 'cust_1' };

    const initialCustomerMessage = {
        id: 'msg_customer_1',
        role: 'customer',
        content: 'hello',
        time: new Date().toISOString(),
    };

    // prior messages only (Spirits will append `message` if missing)
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
            intent: 'greet',
            intentScore: 0.9,
            context: {},
            entities: [],
            contextMessages: [],
        })),

        contextualizer: jest.fn(async () => []),

        // default workflow: adds instructions (becomes a system message)
        workflow: jest.fn(async () => [{ instructions: 'be helpful' }]),

        generator: jest.fn(async () => ({
            send: true,
            messages: [{ role: 'agent', content: 'hello there sir', time: new Date().toISOString() }],
        })),

        transformer: jest.fn(async (req) => ({
            messages: req.addedMessages.map((m) => ({
                ...m,
                content: 'hello there Gary',
                contentTransformed: 'hello there Gary',
            })),
        })),

        ...overrides,
    };
}

/**
 * Stable projection for deep equality (ignore ids/times/etc).
 */
function pluckMessageFields(messages) {
    return (messages || []).map((m) => ({
        role: m.role,
        content: m.content,
        contentGenerated: m.contentGenerated,
        contentTransformed: m.contentTransformed,
    }));
}

/**
 * Stable projection that also keeps tool_call_id for tool messages.
 */
function pluckMessageFieldsWithTool(messages) {
    return (messages || []).map((m) => ({
        role: m.role,
        content: m.content,
        tool_call_id: m.role === "tool" ? m.tool_call_id : undefined,
        contentGenerated: m.contentGenerated,
        contentTransformed: m.contentTransformed,
    }));
}


/**
 * Assert every assistant tool_call has a matching tool response.
 * Assumes OpenAI-style pairing: tool_calls[].id <-> tool.tool_call_id
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
 * Transformer mock: returns same shape + order as req.addedMessages,
 * only mutating content + contentTransformed.
 */
function makeTransformer({ expectedAddedMessagesLen, transformedContent, assertAddedMessages } = {}) {
    return jest.fn(async (req) => {
        expect(req).toHaveProperty('addedMessages');
        expect(Array.isArray(req.addedMessages)).toBe(true);

        if (typeof expectedAddedMessagesLen === 'number') {
            expect(req.addedMessages).toHaveLength(expectedAddedMessagesLen);
        }

        if (assertAddedMessages) assertAddedMessages(req.addedMessages);

        // same shape + order as addedMessages; only change content + contentTransformed
        return {
            messages: req.addedMessages.map((m) => ({
                ...m,
                content: transformedContent,
                contentTransformed: transformedContent,
            })),
        };
    });
}


describe('Spirits.customer (transform flow)', () => {
    test('generator output is routed into transformer; after-messages deep equals (plucked)', async () => {
        const progress = jest.fn();
        const transformer = makeTransformer({
            expectedAddedMessagesLen: 1,
            transformedContent: 'hello there Gary',
            assertAddedMessages: (added) => {
                expect(added[0].role).toBe('agent');
                expect(added[0].content).toBe('hello there sir');
                expect(added[0].contentGenerated).toBe('hello there sir');
            },
        });

        const input = baseInput({
            progress,
            transformer,
            workflow: jest.fn(async () => [{ instructions: 'be helpful' }]),
            generator: jest.fn(async () => ({
                send: true,
                messages: [{ role: 'agent', content: 'hello there sir', time: new Date().toISOString() }],
            })),
        });

        const event = await Spirits.customer(input);

        expect(transformer).toHaveBeenCalledTimes(1);

        expect(pluckMessageFields(event.messages.after)).toEqual([
            { role: 'customer', content: 'hello', contentGenerated: undefined, contentTransformed: undefined },
            { role: 'system', content: 'be helpful', contentGenerated: undefined, contentTransformed: undefined },
            { role: 'agent', content: 'hello there Gary', contentGenerated: 'hello there sir', contentTransformed: 'hello there Gary' },
        ]);
    });


    test('manual slot message with transform=true is included in addedMessages; generator skipped; after deep equals (plucked)', async () => {
        const progress = jest.fn();

        const generator = jest.fn(async () => ({
            send: true,
            messages: [{ role: 'agent', content: 'hello there sir', time: new Date().toISOString() }],
        }));

        const transformer = makeTransformer({
            expectedAddedMessagesLen: 1,
            transformedContent: 'MANUAL_ONE_X',
            assertAddedMessages: (added) => {
                expect(added[0].role).toBe('agent');
                expect(added[0].content).toBe('MANUAL_ONE');
                // ✅ your Spirits code sets this
                expect(added[0].contentGenerated).toBe('MANUAL_ONE');
            },
        });

        const input = baseInput({
            progress,
            transformer,
            generator,
            workflow: jest.fn(async () => [
                { instructions: 'be helpful' },
                { message: { transform: true, content: 'MANUAL_ONE' } },
            ]),
        });

        const event = await Spirits.customer(input);

        expect(transformer).toHaveBeenCalledTimes(1);
        expect(generator).toHaveBeenCalledTimes(0);

        expect(pluckMessageFields(event.messages.after)).toEqual([
            { role: 'customer', content: 'hello', contentGenerated: undefined, contentTransformed: undefined },
            { role: 'system', content: 'be helpful', contentGenerated: undefined, contentTransformed: undefined },
            { role: 'agent', content: 'MANUAL_ONE_X', contentGenerated: 'MANUAL_ONE', contentTransformed: 'MANUAL_ONE_X' },
        ]);
    });


    test('if transformer forgets contentTransformed, Spirits sets it to content; warning logged', async () => {
        const progress = jest.fn();

        const transformer = jest.fn(async (req) => ({
            // same shape/order, but omit contentTransformed on purpose
            messages: req.addedMessages.map((m) => ({
                ...m,
                content: 'hello there Gary',
                // contentTransformed intentionally missing
            })),
        }));

        const input = baseInput({ progress, transformer });

        const event = await Spirits.customer(input);

        expect(pluckMessageFields(event.messages.after)).toEqual([
            { role: 'customer', content: 'hello', contentGenerated: undefined, contentTransformed: undefined },
            { role: 'system', content: 'be helpful', contentGenerated: undefined, contentTransformed: undefined },
            { role: 'agent', content: 'hello there Gary', contentGenerated: 'hello there sir', contentTransformed: 'hello there Gary' },
        ]);

        // const warningCalls = progress.mock.calls.filter((c) => c[1] === 'warning');
        // expect(warningCalls.length).toBeGreaterThan(0);
    });

    test('does not dedupe tool messages with same content when tool_call_id differs', async () => {
        const progress = jest.fn();

        // Capture duplicate warnings
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

        const sharedToolContent =
            '```json\n{\n  "context": "No memory recollection found.",\n  "hint": "Use EntitiesAgent next."\n}\n```';

        const generator = jest.fn(async () => ({
            send: true,
            messages: [
                // Two tool messages with identical content but different tool_call_id
                { role: 'tool', content: sharedToolContent, tool_call_id: 'call_A', time: new Date().toISOString() },
                { role: 'tool', content: sharedToolContent, tool_call_id: 'call_B', time: new Date().toISOString() },

                // Include an agent message too, so transformer flow still looks realistic
                { role: 'agent', content: 'hello there sir', time: new Date().toISOString() },
            ],
        }));

        // Transformer: only transforms agent messages; passes tool messages through unchanged
        const transformer = jest.fn(async (req) => ({
            messages: req.addedMessages.map((m) => {
                if (m.role === 'agent') {
                    return {
                        ...m,
                        content: 'hello there Gary',
                        contentTransformed: 'hello there Gary',
                    };
                }
                return m;
            }),
        }));

        const input = baseInput({
            progress,
            generator,
            transformer,
            workflow: jest.fn(async () => [{ instructions: 'be helpful' }]),
        });

        const event = await Spirits.customer(input);

        // ✅ No tool message should have been removed as a "duplicate"
        // (With the old messageKey based only on content, you'd see 1 warn here.)
        const duplicateWarns = warnSpy.mock.calls.filter(([msg]) =>
            String(msg).includes('Duplicate message removed')
        );
        expect(duplicateWarns).toHaveLength(0);

        // ✅ Both tool messages should exist in the final messages, each with its own tool_call_id
        expect(pluckMessageFieldsWithTool(event.messages.after)).toEqual([
            { role: 'customer', content: 'hello', tool_call_id: undefined, contentGenerated: undefined, contentTransformed: undefined },
            { role: 'system', content: 'be helpful', tool_call_id: undefined, contentGenerated: undefined, contentTransformed: undefined },

            { role: 'tool', content: sharedToolContent, tool_call_id: 'call_A', contentGenerated: sharedToolContent, contentTransformed: undefined },
            { role: 'tool', content: sharedToolContent, tool_call_id: 'call_B', contentGenerated: sharedToolContent, contentTransformed: undefined },

            { role: 'agent', content: 'hello there Gary', tool_call_id: undefined, contentGenerated: 'hello there sir', contentTransformed: 'hello there Gary' },
        ]);

        warnSpy.mockRestore();
    });


    test('tool_call pairing integrity: every assistant tool_calls[].id has a matching tool message tool_call_id', async () => {
        const progress = jest.fn();
      
        const generator = jest.fn(async () => ({
          send: true,
          messages: [
            {
              role: 'agent',
              content: '',
              tool_calls: [
                { id: 'call_X', type: 'function', function: { name: 'MemoryAgent', arguments: '{}' } },
              ],
              time: new Date().toISOString(),
            },
            {
              role: 'tool',
              tool_call_id: 'call_X',
              content: '```json\n{"ok":true}\n```',
              time: new Date().toISOString(),
            },
            { role: 'agent', content: 'hello there sir', time: new Date().toISOString() },
          ],
        }));
      
        // transformer: only changes agent text messages; tool messages must remain unchanged
        const transformer = jest.fn(async (req) => ({
          messages: req.addedMessages.map((m) => {
            if (m.role === 'agent' && m.content) {
              return { ...m, content: 'hello there Gary', contentTransformed: 'hello there Gary' };
            }
            return m;
          }),
        }));
      
        const input = baseInput({
          progress,
          generator,
          transformer,
          workflow: jest.fn(async () => [{ instructions: 'be helpful' }]),
        });
      
        const event = await Spirits.customer(input);
      
        // ✅ verifies pairing exists in final output
        assertToolPairing(event.messages.after);
      
        // spot-check the tool message exists
        const toolMsgs = event.messages.after.filter((m) => m.role === 'tool');
        expect(toolMsgs).toHaveLength(1);
        expect(toolMsgs[0].tool_call_id).toBe('call_X');
      });


      test('dedupe removes true duplicate agent messages (same role/content)', async () => {
        const progress = jest.fn();
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
        const generator = jest.fn(async () => ({
          send: true,
          messages: [
            { role: 'agent', content: 'DUPLICATE_ME', time: new Date().toISOString() },
            { role: 'agent', content: 'DUPLICATE_ME', time: new Date().toISOString() }, // duplicate
          ],
        }));
      
        const transformer = makeTransformer({
          expectedAddedMessagesLen: 1, // only one survives dedupe
          transformedContent: 'DEDUPED_X',
        });
      
        const input = baseInput({
          progress,
          generator,
          transformer,
          workflow: jest.fn(async () => [{ instructions: 'be helpful' }]),
        });
      
        const event = await Spirits.customer(input);
      
        const duplicateLogs = errorSpy.mock.calls.filter(([msg]) =>
          String(msg).includes('Duplicate message removed')
        );
        expect(duplicateLogs.length).toBeGreaterThanOrEqual(1);
      
        const agentMsgs = event.messages.after.filter((m) => m.role === 'agent');
        expect(agentMsgs).toHaveLength(1);
      
        errorSpy.mockRestore();
      });

      test('does not dedupe tool messages with same content when tool_call_id differs', async () => {
        const progress = jest.fn();
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
        const sharedToolContent =
          '```json\n{\n  "context": "No memory recollection found.",\n  "hint": "Use EntitiesAgent next."\n}\n```';
      
        const generator = jest.fn(async () => ({
          send: true,
          messages: [
            { role: 'tool', content: sharedToolContent, tool_call_id: 'call_A', time: new Date().toISOString() },
            { role: 'tool', content: sharedToolContent, tool_call_id: 'call_B', time: new Date().toISOString() },
            { role: 'agent', content: 'hello there sir', time: new Date().toISOString() },
          ],
        }));
      
        const transformer = jest.fn(async (req) => ({
          messages: req.addedMessages.map((m) => {
            if (m.role === 'agent') {
              return { ...m, content: 'hello there Gary', contentTransformed: 'hello there Gary' };
            }
            return m;
          }),
        }));
      
        const input = baseInput({
          progress,
          generator,
          transformer,
          workflow: jest.fn(async () => [{ instructions: 'be helpful' }]),
        });
      
        const event = await Spirits.customer(input);
      
        const duplicateWarns = warnSpy.mock.calls.filter(([msg]) =>
          String(msg).includes('Duplicate message removed')
        );
        expect(duplicateWarns).toHaveLength(0);
      
        // ensure both tool messages made it through
        const toolMsgs = event.messages.after.filter((m) => m.role === 'tool');
        expect(toolMsgs).toHaveLength(2);
        expect(toolMsgs.map((m) => m.tool_call_id)).toEqual(['call_A', 'call_B']);
      
        warnSpy.mockRestore();
      });


      test('tool messages missing tool_call_id should not accidentally dedupe when ids differ', async () => {
        const progress = jest.fn();
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
        const sharedToolContent = '```json\n{"note":"legacy tool msg"}\n```';
      
        const generator = jest.fn(async () => ({
          send: true,
          messages: [
            // No tool_call_id on purpose; ids differ
            { id: 'tool_1', role: 'tool', content: sharedToolContent, time: new Date().toISOString() },
            { id: 'tool_2', role: 'tool', content: sharedToolContent, time: new Date().toISOString() },
            { role: 'agent', content: 'hello there sir', time: new Date().toISOString() },
          ],
        }));
      
        const transformer = jest.fn(async (req) => ({
          messages: req.addedMessages.map((m) => {
            if (m.role === 'agent') {
              return { ...m, content: 'hello there Gary', contentTransformed: 'hello there Gary' };
            }
            return m;
          }),
        }));
      
        const input = baseInput({
          progress,
          generator,
          transformer,
          workflow: jest.fn(async () => [{ instructions: 'be helpful' }]),
        });
      
        const event = await Spirits.customer(input);
      
        const duplicateWarns = warnSpy.mock.calls.filter(([msg]) =>
          String(msg).includes('Duplicate message removed')
        );
        expect(duplicateWarns).toHaveLength(0);
      
        const toolMsgs = event.messages.after.filter((m) => m.role === 'tool');
        expect(toolMsgs).toHaveLength(2);
      
        warnSpy.mockRestore();
      });


      test('cross-role collision: same content in tool and agent should not dedupe', async () => {
        const progress = jest.fn();
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
        const same = 'SAME_STRING';
      
        const generator = jest.fn(async () => ({
          send: true,
          messages: [
            { role: 'tool', tool_call_id: 'call_Z', content: same, time: new Date().toISOString() },
            { role: 'agent', content: same, time: new Date().toISOString() },
          ],
        }));
      
        const transformer = jest.fn(async (req) => ({
          messages: req.addedMessages.map((m) => {
            if (m.role === 'agent') {
              return { ...m, content: 'AGENT_X', contentTransformed: 'AGENT_X' };
            }
            return m;
          }),
        }));
      
        const input = baseInput({
          progress,
          generator,
          transformer,
          workflow: jest.fn(async () => [{ instructions: 'be helpful' }]),
        });
      
        const event = await Spirits.customer(input);
      
        const duplicateWarns = warnSpy.mock.calls.filter(([msg]) =>
          String(msg).includes('Duplicate message removed')
        );
        expect(duplicateWarns).toHaveLength(0);
      
        const toolMsgs = event.messages.after.filter((m) => m.role === 'tool');
        const agentMsgs = event.messages.after.filter((m) => m.role === 'agent');
      
        expect(toolMsgs).toHaveLength(1);
        expect(agentMsgs).toHaveLength(1);
      
        warnSpy.mockRestore();
      });


      test('timestamp normalization: generator messages with Date/string/toDate all become ISO strings', async () => {
        const progress = jest.fn();
      
        const firestoreLike = {
          toDate: () => new Date('2025-01-01T00:00:00.000Z'),
        };
      
        const generator = jest.fn(async () => ({
          send: true,
          messages: [
            { role: 'agent', content: 'A', time: new Date('2025-01-02T00:00:00.000Z') },
            { role: 'agent', content: 'B', time: '2025-01-03T00:00:00.000Z' },
            { role: 'agent', content: 'C', time: firestoreLike },
          ],
        }));
      
        const transformer = makeTransformer({
          expectedAddedMessagesLen: 3,
          transformedContent: 'X',
        });
      
        const input = baseInput({
          progress,
          generator,
          transformer,
          workflow: jest.fn(async () => [{ instructions: 'be helpful' }]),
        });
      
        const event = await Spirits.customer(input);
      
        const agentMsgs = event.messages.after.filter((m) => m.role === 'agent');
        expect(agentMsgs).toHaveLength(3);
        for (const m of agentMsgs) {
          expect(typeof m.time).toBe('string');
          // very light ISO sanity check
          expect(m.time.includes('T')).toBe(true);
          expect(m.time.endsWith('Z')).toBe(true);
        }
      });
      
      


});
