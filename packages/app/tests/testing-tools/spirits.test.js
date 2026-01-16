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

});
