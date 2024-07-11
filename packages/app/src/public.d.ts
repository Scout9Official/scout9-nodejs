
/**
 * Scout9 App
 * Application platform for managing auto reply workflows from personal communication methods
 *
 *
 * NOTE: This file was auto generated 7/10/2024, 3:30:35 PM
 * Do not edit the file manually.
 */


/**
 * @param {WorkflowEvent} event - every workflow receives an event object
 * @param {Object} options
 * @param {string} [options.cwd=process.cwd()] - the working directory
 * @param {string} [options.mode='production'] - the build mode
 * @param {string} [options.src='./src'] - the source directory
 * @param {string} options.eventSource - the source of the workflow event
 * @returns {WorkflowResponse}
 */
export function run(event: WorkflowEvent, options: {
    cwd?: string;
    mode?: string;
    src?: string;
    eventSource: string;
}): WorkflowResponse;
/**
 * @template T
 * @param {T} data
 * @param {ResponseInit | undefined} [init]
 * @returns {EventResponse<T>}
 */
export function json<T>(data: T, init?: ResponseInit | undefined): EventResponse<T>;
/**
 * @param {WorkflowEvent} event - every workflow receives an event object
 * @param {Object} options
 * @param {string} [options.cwd=process.cwd()] - the working directory
 * @param {string} [options.mode='production'] - the build mode
 * @param {string} [options.src='./src'] - the source directory
 * @param {string} options.eventSource - the source of the workflow event
 * @returns {WorkflowResponse}
 */
export function sendEvent(event: WorkflowEvent, options: {
    cwd?: string;
    mode?: string;
    src?: string;
    eventSource: string;
}): WorkflowResponse;


/**
 * Utility runtime class used to guide event output
 * @template T
 */
export class EventResponse<T> {
    /**
     * Create a new EventResponse instance with a JSON body.
     * @template T
     * @param {T} body - The body of the response.
     * @param {ResponseInit} [options] - Additional options for the response.
     * @returns {EventResponse<T>} A new EventResponse instance.
     */
    static json<T_1>(body: T_1, options?: ResponseInit): EventResponse<T_1>;
    /**
     * Create an EventResponse.
     * @param {T} body - The body of the response.
     * @param {ResponseInit} [init] - Additional options for the response.
     * @throws {Error} If the body is not a valid object.
     */
    constructor(body: T, init?: ResponseInit);
    /**
     * @type {T}
     * @private
     */
    private body;
    /**
     * @type {ResponseInit}
     * @private
     */
    private init;
    /**
     * Get the response object.
     * @returns {Response} The response object.
     */
    get response(): Response;
    /**
     * Get the data of the response.
     * @returns {T} The body of the response.
     */
    get data(): T;
}


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
export const instruct: (message: string, options?: OptionsInstruct) => EventMacros;
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
export const forward: (message: string, options?: OptionsForward) => EventMacros;
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
export const reply: (message: string, options?: OptionsReply) => EventMacros;
/**
 * followup macro options
 */
export type OptionsFollowup = {
    scheduled: Date | string;
    cancelIf?: Record<string, any>;
    literal?: boolean;
    overrideLock?: boolean;
};
/**
 * instruct macro options
 */
export type OptionsInstruct = {
    /**
     * - Unique ID for the instruction, this is used to remove the instruction later
     */
    id?: string;
    /**
     * - if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply
     */
    persist?: boolean;
};
/**
 * reply macro options
 */
export type OptionsReply = {
    scheduled?: Date | string;
    delay?: number;
};
/**
 * forward macro options
 */
export type OptionsForward = {
    /**
     * - sets forward mode, defaults to "immediately". If "after-reply", the forward will be on hold until the customer responds. We recommend using "immediately" for most cases.
     */
    mode?: 'after-reply' | 'immediately';
    /**
     * - another phone or email to forward to instead of owner
     */
    to?: string;
};
/**
 * - Extends `WorkflowResponseSlotBase` to include keywords.
 */
export type WorkflowResponseSlotBaseWithKeywords = WorkflowResponseSlotBase & {
    keywords: string[];
};
/**
 * - Defines the overloads for the `anticipate` function.
 */
export type AnticipateFunction = (instruction: string, yes: WorkflowResponseSlotBase, no: WorkflowResponseSlotBase) => EventMacros | ((instruction: WorkflowResponseSlotBaseWithKeywords[]) => EventMacros);
/**
 * Event macros to be used inside your scout9 auto reply workflows
 */
export type EventMacros = {
    upsert: (arg0: Record<string, any>) => EventMacros;
    followup: (arg0: string, arg1: (Date | string | OptionsFollowup)) => EventMacros;
    anticipate: AnticipateFunction;
    instruct: (arg0: string, arg1: OptionsInstruct | null) => EventMacros;
    reply: (arg0: string, arg1: OptionsReply | null) => EventMacros;
    forward: (arg0: string | null, arg1: OptionsForward | null) => EventMacros;
    toJSON: (arg0: boolean | null) => Array<WorkflowResponseSlot>;
};


/**
 * The `did` macro takes a given prompt and infers a binary `true` or `false` result in relation to the prompt's subject actor and the prompt's inquiry.
 * @param {string} prompt
 * @return {Promise<boolean>}
 */
export function did(prompt: string): Promise<boolean>;
/**
 * @typedef {import('@scout9/admin').MacroContextInputExamples} ContextExamples
 * @typedef {import('@scout9/admin').MacroContextValue} ContextOutput
 */
/**
 * The `context` macro, similar to the `did` macro, takes a natural statement and checks the entire conversation state and extracts or infers a metadata composition result.
 *
 * @example - inferring what a user requested
 * const response = await context(`What pizzas did the user want to order?`);
 * {
 *   "order": {
 *     "pizzas": [
 *       {"size": "small", "toppings": ["cheese"], quantity: 1}
 *     ]
 *   }
 * }
 *
 * @param {string} prompt - Prompt to infer a context data set to use in your workflow code.
 * @param {ContextExamples} [examples] - Examples to the macro to ensure a consistent data structure.
 * @return {Promise<ContextOutput>}
 */
export function context(prompt: string, examples?: any): Promise<any>;
export type ContextExamples = any;
export type ContextOutput = any;


export type AgentConfiguration = {
    deployed?: {
        /** Web URL for agent */
        web?: string | undefined;
        /** Phone number for agent */
        phone?: string | undefined;
        /** Email address for agent */
        email?: string | undefined;
    } | undefined;
    img?: (string | null) | undefined;
    /** Agent first name */
    firstName?: string | undefined;
    /** Agent last name */
    lastName?: string | undefined;
    /** Agent is inactive */
    inactive?: boolean | undefined;
    /** Programmable phone number */
    programmablePhoneNumber?: string | undefined;
    /** Programmable phone number SID */
    programmablePhoneNumberSid?: string | undefined;
    /** Email address from Scout9 gmail subdomain */
    programmableEmail?: string | undefined;
    /** Email address to forward to */
    forwardEmail?: string | undefined;
    /** Phone number to forward to */
    forwardPhone?: string | undefined;
    /** Agent title  */
    title?: string;
    /** Context of the agent */
    context?: string;
    includedLocations?: string[] | undefined;
    excludedLocations?: string[] | undefined;
    model?: ("Scout9" | "bard" | "openai");
    transcripts?: {
        /** Unique ID for the message */
        id: string;
        role: "agent" | "customer" | "system";
        content: string;
        /** Datetime ISO 8601 timestamp */
        time: string;
        name?: string | undefined;
        /** Datetime ISO 8601 timestamp */
        scheduled?: string | undefined;
        /** The context generated from the message */
        context?: any | undefined;
        /** Detected intent */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | null) | undefined;
        /** How long to delay the message manually in seconds */
        delayInSeconds?: (number | null) | undefined;
    }[][] | undefined;
    audios?: any[] | undefined;
    /** Unique ID for agent */
    id: string;
};

export type Agent = {
    deployed?: {
        /** Web URL for agent */
        web?: string | undefined;
        /** Phone number for agent */
        phone?: string | undefined;
        /** Email address for agent */
        email?: string | undefined;
    } | undefined;
    img?: (string | null) | undefined;
    /** Agent first name */
    firstName?: string | undefined;
    /** Agent last name */
    lastName?: string | undefined;
    /** Agent is inactive */
    inactive?: boolean | undefined;
    /** Programmable phone number */
    programmablePhoneNumber?: string | undefined;
    /** Programmable phone number SID */
    programmablePhoneNumberSid?: string | undefined;
    /** Email address from Scout9 gmail subdomain */
    programmableEmail?: string | undefined;
    /** Email address to forward to */
    forwardEmail?: string | undefined;
    /** Phone number to forward to */
    forwardPhone?: string | undefined;
    /** Agent title  */
    title?: string;
    /** Context of the agent */
    context?: string;
    includedLocations?: string[] | undefined;
    excludedLocations?: string[] | undefined;
    model?: ("Scout9" | "bard" | "openai");
    transcripts?: {
        /** Unique ID for the message */
        id: string;
        role: "agent" | "customer" | "system";
        content: string;
        /** Datetime ISO 8601 timestamp */
        time: string;
        name?: string | undefined;
        /** Datetime ISO 8601 timestamp */
        scheduled?: string | undefined;
        /** The context generated from the message */
        context?: any | undefined;
        /** Detected intent */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | null) | undefined;
        /** How long to delay the message manually in seconds */
        delayInSeconds?: (number | null) | undefined;
    }[][] | undefined;
    audios?: any[] | undefined;
};

export type AgentsConfiguration = {
    deployed?: {
        /** Web URL for agent */
        web?: string | undefined;
        /** Phone number for agent */
        phone?: string | undefined;
        /** Email address for agent */
        email?: string | undefined;
    } | undefined;
    img?: (string | null) | undefined;
    /** Agent first name */
    firstName?: string | undefined;
    /** Agent last name */
    lastName?: string | undefined;
    /** Agent is inactive */
    inactive?: boolean | undefined;
    /** Programmable phone number */
    programmablePhoneNumber?: string | undefined;
    /** Programmable phone number SID */
    programmablePhoneNumberSid?: string | undefined;
    /** Email address from Scout9 gmail subdomain */
    programmableEmail?: string | undefined;
    /** Email address to forward to */
    forwardEmail?: string | undefined;
    /** Phone number to forward to */
    forwardPhone?: string | undefined;
    /** Agent title  */
    title?: string;
    /** Context of the agent */
    context?: string;
    includedLocations?: string[] | undefined;
    excludedLocations?: string[] | undefined;
    model?: ("Scout9" | "bard" | "openai");
    transcripts?: {
        /** Unique ID for the message */
        id: string;
        role: "agent" | "customer" | "system";
        content: string;
        /** Datetime ISO 8601 timestamp */
        time: string;
        name?: string | undefined;
        /** Datetime ISO 8601 timestamp */
        scheduled?: string | undefined;
        /** The context generated from the message */
        context?: any | undefined;
        /** Detected intent */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | null) | undefined;
        /** How long to delay the message manually in seconds */
        delayInSeconds?: (number | null) | undefined;
    }[][] | undefined;
    audios?: any[] | undefined;
    /** Unique ID for agent */
    id: string;
}[];

export type Agents = {
    deployed?: {
        /** Web URL for agent */
        web?: string | undefined;
        /** Phone number for agent */
        phone?: string | undefined;
        /** Email address for agent */
        email?: string | undefined;
    } | undefined;
    img?: (string | null) | undefined;
    /** Agent first name */
    firstName?: string | undefined;
    /** Agent last name */
    lastName?: string | undefined;
    /** Agent is inactive */
    inactive?: boolean | undefined;
    /** Programmable phone number */
    programmablePhoneNumber?: string | undefined;
    /** Programmable phone number SID */
    programmablePhoneNumberSid?: string | undefined;
    /** Email address from Scout9 gmail subdomain */
    programmableEmail?: string | undefined;
    /** Email address to forward to */
    forwardEmail?: string | undefined;
    /** Phone number to forward to */
    forwardPhone?: string | undefined;
    /** Agent title  */
    title?: string;
    /** Context of the agent */
    context?: string;
    includedLocations?: string[] | undefined;
    excludedLocations?: string[] | undefined;
    model?: ("Scout9" | "bard" | "openai");
    transcripts?: {
        /** Unique ID for the message */
        id: string;
        role: "agent" | "customer" | "system";
        content: string;
        /** Datetime ISO 8601 timestamp */
        time: string;
        name?: string | undefined;
        /** Datetime ISO 8601 timestamp */
        scheduled?: string | undefined;
        /** The context generated from the message */
        context?: any | undefined;
        /** Detected intent */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | null) | undefined;
        /** How long to delay the message manually in seconds */
        delayInSeconds?: (number | null) | undefined;
    }[][] | undefined;
    audios?: any[] | undefined;
}[];

export type Baz = {
    boo: {
        one: number;
        two?: number | undefined;
    };
};

export type Bus = {
    foo: string;
    bar?: boolean | undefined;
};

export type ContextExample = {
    input: string;
    output: {
        [x: string]: any;
    }[];
}[] | {
    [x: string]: any;
}[];

export type ContextExampleWithTrainingData = {
    input: string;
    output: {
        [x: string]: any;
    }[];
};

export type ConversationAnticipate = {
    /** Determines the runtime to address the next response */
    type: "did" | "literal" | "context";
    slots: {
        [x: string]: any[];
    };
    /** For type 'did' */
    did?: string | undefined;
    /** For literal keywords, this map helps point which slot the keyword matches to */
    map?: {
        slot: string;
        keywords: string[];
    }[] | undefined;
};

export type ConversationContext = {
    [x: string]: any;
};

export type Conversation = {
    /** Default agent assigned to the conversation(s) */
    $agent: string;
    /** Customer this conversation is with */
    $customer: string;
    /** Initial contexts to load when starting the conversation */
    initialContexts?: string[] | undefined;
    environment: "phone" | "email" | "web";
    environmentProps?: {
        /** HTML Subject of the conversation */
        subject?: string | undefined;
        /** Used to sync email messages with the conversation */
        platformEmailThreadId?: string | undefined;
    } | undefined;
    /** Whether the conversation is locked or not */
    locked?: (boolean | undefined) | null;
    /** Why this conversation was locked */
    lockedReason?: (string | undefined) | null;
    /** Number attempts made until conversation is locked */
    lockAttempts?: (number | undefined) | null;
    /** What personaId/phone/email was forwarded */
    forwardedTo?: (string | undefined) | null;
    /** Datetime ISO 8601 timestamp when persona was forwarded */
    forwarded?: (string | undefined) | null;
    forwardNote?: (string | undefined) | null;
    /** Detected intent of conversation */
    intent?: (string | undefined) | null;
    /** Confidence score of the assigned intent */
    intentScore?: (number | undefined) | null;
    anticipate?: {
        /** Determines the runtime to address the next response */
        type: "did" | "literal" | "context";
        slots: {
            [x: string]: any[];
        };
        /** For type 'did' */
        did?: string | undefined;
        /** For literal keywords, this map helps point which slot the keyword matches to */
        map?: {
            slot: string;
            keywords: string[];
        }[] | undefined;
    } | undefined;
};

export type Customer = {
    firstName?: string | undefined;
    lastName?: string | undefined;
    name: string;
    email?: (string | null) | undefined;
    phone?: (string | null) | undefined;
    img?: (string | null) | undefined;
    neighborhood?: (string | null) | undefined;
    city?: (string | null) | undefined;
    country?: (string | null) | undefined;
    line1?: (string | null) | undefined;
    line2?: (string | null) | undefined;
    postal_code?: (string | null) | undefined;
    state?: (string | null) | undefined;
    town?: (string | null) | undefined;
    joined?: (string | null) | undefined;
    stripe?: (string | null) | undefined;
    stripeDev?: (string | null) | undefined;
};

export type CustomerValue = boolean | number | string;

export type EntitiesRootConfiguration = {
    /** If not provided, the id will default to the route (folder) name */
    id?: string | undefined;
    definitions?: {
        /** What entity utterance this represents, if not provided, it will default to the entity id */
        utterance?: string | undefined;
        /** The value of this entity variance */
        value: string;
        /** Text representing the entity variance */
        text: string[];
    }[] | undefined;
    training?: {
        /** The assigned intent id of the given text, e.g. "I love %pizza%" could have an intent id "feedback" and "Can I purchase a %pizza%?" could have an intent id "purchase" */
        intent: string;
        /** Text to train the intent field and entities in or entity variances in example sentences or phrase. Ex: "I love %pizza%" and "Can I purchase a %pizza%?" */
        text: string;
    }[] | undefined;
    tests?: {
        /** Text to test the entity detection */
        text: string;
        expected: {
            /** The expected intent id */
            intent: string;
            context?: any;
        };
    }[] | undefined;
}[];

export type EntitiesRootProjectConfiguration = {
    /** If not provided, the id will default to the route (folder) name */
    id?: string | undefined;
    definitions?: {
        /** What entity utterance this represents, if not provided, it will default to the entity id */
        utterance?: string | undefined;
        /** The value of this entity variance */
        value: string;
        /** Text representing the entity variance */
        text: string[];
    }[] | undefined;
    training?: {
        /** The assigned intent id of the given text, e.g. "I love %pizza%" could have an intent id "feedback" and "Can I purchase a %pizza%?" could have an intent id "purchase" */
        intent: string;
        /** Text to train the intent field and entities in or entity variances in example sentences or phrase. Ex: "I love %pizza%" and "Can I purchase a %pizza%?" */
        text: string;
    }[] | undefined;
    tests?: {
        /** Text to test the entity detection */
        text: string;
        expected: {
            /** The expected intent id */
            intent: string;
            context?: any;
        };
    }[] | undefined;
    /** Entity id association, used to handle route params */
    entities: string[];
    entity: string;
    api: {
        GET?: boolean | undefined;
        UPDATE?: boolean | undefined;
        QUERY?: boolean | undefined;
        PUT?: boolean | undefined;
        PATCH?: boolean | undefined;
        DELETE?: boolean | undefined;
    } | null;
}[];

export type EntityApiConfiguration = {
    GET?: boolean | undefined;
    UPDATE?: boolean | undefined;
    QUERY?: boolean | undefined;
    PUT?: boolean | undefined;
    PATCH?: boolean | undefined;
    DELETE?: boolean | undefined;
} | null;

export type EntityConfiguration = {
    /** If not provided, the id will default to the route (folder) name */
    id?: string | undefined;
    definitions?: {
        /** What entity utterance this represents, if not provided, it will default to the entity id */
        utterance?: string | undefined;
        /** The value of this entity variance */
        value: string;
        /** Text representing the entity variance */
        text: string[];
    }[] | undefined;
    training?: {
        /** The assigned intent id of the given text, e.g. "I love %pizza%" could have an intent id "feedback" and "Can I purchase a %pizza%?" could have an intent id "purchase" */
        intent: string;
        /** Text to train the intent field and entities in or entity variances in example sentences or phrase. Ex: "I love %pizza%" and "Can I purchase a %pizza%?" */
        text: string;
    }[] | undefined;
    tests?: {
        /** Text to test the entity detection */
        text: string;
        expected: {
            /** The expected intent id */
            intent: string;
            context?: any;
        };
    }[] | undefined;
};

export type EntityRootProjectConfiguration = {
    /** If not provided, the id will default to the route (folder) name */
    id?: string | undefined;
    definitions?: {
        /** What entity utterance this represents, if not provided, it will default to the entity id */
        utterance?: string | undefined;
        /** The value of this entity variance */
        value: string;
        /** Text representing the entity variance */
        text: string[];
    }[] | undefined;
    training?: {
        /** The assigned intent id of the given text, e.g. "I love %pizza%" could have an intent id "feedback" and "Can I purchase a %pizza%?" could have an intent id "purchase" */
        intent: string;
        /** Text to train the intent field and entities in or entity variances in example sentences or phrase. Ex: "I love %pizza%" and "Can I purchase a %pizza%?" */
        text: string;
    }[] | undefined;
    tests?: {
        /** Text to test the entity detection */
        text: string;
        expected: {
            /** The expected intent id */
            intent: string;
            context?: any;
        };
    }[] | undefined;
    /** Entity id association, used to handle route params */
    entities: string[];
    entity: string;
    api: {
        GET?: boolean | undefined;
        UPDATE?: boolean | undefined;
        QUERY?: boolean | undefined;
        PUT?: boolean | undefined;
        PATCH?: boolean | undefined;
        DELETE?: boolean | undefined;
    } | null;
};

export type FollowupBase = {
    scheduled: number;
    cancelIf?: {
        [x: string]: any;
    } | undefined;
    /** This will still run even if the conversation is locked, defaults to false */
    overrideLock?: boolean | undefined;
};

export type Followup = {
    scheduled: number;
    cancelIf?: {
        [x: string]: any;
    } | undefined;
    /** This will still run even if the conversation is locked, defaults to false */
    overrideLock?: boolean | undefined;
    /** Manual message sent to client */
    message: string;
} | {
    scheduled: number;
    cancelIf?: {
        [x: string]: any;
    } | undefined;
    /** This will still run even if the conversation is locked, defaults to false */
    overrideLock?: boolean | undefined;
    instructions: string | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    } | string[] | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    }[];
};

export type Forward = boolean | string | {
    to?: string | undefined;
    mode?: ("after-reply" | "immediately") | undefined;
    /** Note to provide to the agent */
    note?: string | undefined;
};

export type InstructionObject = {
    /** Unique ID for the instruction, this is used to remove the instruction later */
    id?: string | undefined;
    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
    persist?: boolean | undefined;
    content: string;
};

export type Instruction = string | {
    /** Unique ID for the instruction, this is used to remove the instruction later */
    id?: string | undefined;
    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
    persist?: boolean | undefined;
    content: string;
} | string[] | {
    /** Unique ID for the instruction, this is used to remove the instruction later */
    id?: string | undefined;
    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
    persist?: boolean | undefined;
    content: string;
}[];

export type IntentWorkflowEvent = {
    current: string | null;
    flow: string[];
    initial: string | null;
};

export type Message = {
    /** Unique ID for the message */
    id: string;
    role: "agent" | "customer" | "system";
    content: string;
    /** Datetime ISO 8601 timestamp */
    time: string;
    name?: string | undefined;
    /** Datetime ISO 8601 timestamp */
    scheduled?: string | undefined;
    /** The context generated from the message */
    context?: any | undefined;
    /** Detected intent */
    intent?: (string | undefined) | null;
    /** Confidence score of the assigned intent */
    intentScore?: (number | null) | undefined;
    /** How long to delay the message manually in seconds */
    delayInSeconds?: (number | null) | undefined;
};

export type PersonaConfiguration = {
    deployed?: {
        /** Web URL for agent */
        web?: string | undefined;
        /** Phone number for agent */
        phone?: string | undefined;
        /** Email address for agent */
        email?: string | undefined;
    } | undefined;
    img?: (string | null) | undefined;
    /** Agent first name */
    firstName?: string | undefined;
    /** Agent last name */
    lastName?: string | undefined;
    /** Agent is inactive */
    inactive?: boolean | undefined;
    /** Programmable phone number */
    programmablePhoneNumber?: string | undefined;
    /** Programmable phone number SID */
    programmablePhoneNumberSid?: string | undefined;
    /** Email address from Scout9 gmail subdomain */
    programmableEmail?: string | undefined;
    /** Email address to forward to */
    forwardEmail?: string | undefined;
    /** Phone number to forward to */
    forwardPhone?: string | undefined;
    /** Agent title  */
    title?: string;
    /** Context of the agent */
    context?: string;
    includedLocations?: string[] | undefined;
    excludedLocations?: string[] | undefined;
    model?: ("Scout9" | "bard" | "openai");
    transcripts?: {
        /** Unique ID for the message */
        id: string;
        role: "agent" | "customer" | "system";
        content: string;
        /** Datetime ISO 8601 timestamp */
        time: string;
        name?: string | undefined;
        /** Datetime ISO 8601 timestamp */
        scheduled?: string | undefined;
        /** The context generated from the message */
        context?: any | undefined;
        /** Detected intent */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | null) | undefined;
        /** How long to delay the message manually in seconds */
        delayInSeconds?: (number | null) | undefined;
    }[][] | undefined;
    audios?: any[] | undefined;
    /** Unique ID for agent */
    id: string;
};

export type Persona = {
    deployed?: {
        /** Web URL for agent */
        web?: string | undefined;
        /** Phone number for agent */
        phone?: string | undefined;
        /** Email address for agent */
        email?: string | undefined;
    } | undefined;
    img?: (string | null) | undefined;
    /** Agent first name */
    firstName?: string | undefined;
    /** Agent last name */
    lastName?: string | undefined;
    /** Agent is inactive */
    inactive?: boolean | undefined;
    /** Programmable phone number */
    programmablePhoneNumber?: string | undefined;
    /** Programmable phone number SID */
    programmablePhoneNumberSid?: string | undefined;
    /** Email address from Scout9 gmail subdomain */
    programmableEmail?: string | undefined;
    /** Email address to forward to */
    forwardEmail?: string | undefined;
    /** Phone number to forward to */
    forwardPhone?: string | undefined;
    /** Agent title  */
    title?: string;
    /** Context of the agent */
    context?: string;
    includedLocations?: string[] | undefined;
    excludedLocations?: string[] | undefined;
    model?: ("Scout9" | "bard" | "openai");
    transcripts?: {
        /** Unique ID for the message */
        id: string;
        role: "agent" | "customer" | "system";
        content: string;
        /** Datetime ISO 8601 timestamp */
        time: string;
        name?: string | undefined;
        /** Datetime ISO 8601 timestamp */
        scheduled?: string | undefined;
        /** The context generated from the message */
        context?: any | undefined;
        /** Detected intent */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | null) | undefined;
        /** How long to delay the message manually in seconds */
        delayInSeconds?: (number | null) | undefined;
    }[][] | undefined;
    audios?: any[] | undefined;
};

export type PersonasConfiguration = {
    deployed?: {
        /** Web URL for agent */
        web?: string | undefined;
        /** Phone number for agent */
        phone?: string | undefined;
        /** Email address for agent */
        email?: string | undefined;
    } | undefined;
    img?: (string | null) | undefined;
    /** Agent first name */
    firstName?: string | undefined;
    /** Agent last name */
    lastName?: string | undefined;
    /** Agent is inactive */
    inactive?: boolean | undefined;
    /** Programmable phone number */
    programmablePhoneNumber?: string | undefined;
    /** Programmable phone number SID */
    programmablePhoneNumberSid?: string | undefined;
    /** Email address from Scout9 gmail subdomain */
    programmableEmail?: string | undefined;
    /** Email address to forward to */
    forwardEmail?: string | undefined;
    /** Phone number to forward to */
    forwardPhone?: string | undefined;
    /** Agent title  */
    title?: string;
    /** Context of the agent */
    context?: string;
    includedLocations?: string[] | undefined;
    excludedLocations?: string[] | undefined;
    model?: ("Scout9" | "bard" | "openai");
    transcripts?: {
        /** Unique ID for the message */
        id: string;
        role: "agent" | "customer" | "system";
        content: string;
        /** Datetime ISO 8601 timestamp */
        time: string;
        name?: string | undefined;
        /** Datetime ISO 8601 timestamp */
        scheduled?: string | undefined;
        /** The context generated from the message */
        context?: any | undefined;
        /** Detected intent */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | null) | undefined;
        /** How long to delay the message manually in seconds */
        delayInSeconds?: (number | null) | undefined;
    }[][] | undefined;
    audios?: any[] | undefined;
    /** Unique ID for agent */
    id: string;
}[];

export type Personas = {
    deployed?: {
        /** Web URL for agent */
        web?: string | undefined;
        /** Phone number for agent */
        phone?: string | undefined;
        /** Email address for agent */
        email?: string | undefined;
    } | undefined;
    img?: (string | null) | undefined;
    /** Agent first name */
    firstName?: string | undefined;
    /** Agent last name */
    lastName?: string | undefined;
    /** Agent is inactive */
    inactive?: boolean | undefined;
    /** Programmable phone number */
    programmablePhoneNumber?: string | undefined;
    /** Programmable phone number SID */
    programmablePhoneNumberSid?: string | undefined;
    /** Email address from Scout9 gmail subdomain */
    programmableEmail?: string | undefined;
    /** Email address to forward to */
    forwardEmail?: string | undefined;
    /** Phone number to forward to */
    forwardPhone?: string | undefined;
    /** Agent title  */
    title?: string;
    /** Context of the agent */
    context?: string;
    includedLocations?: string[] | undefined;
    excludedLocations?: string[] | undefined;
    model?: ("Scout9" | "bard" | "openai");
    transcripts?: {
        /** Unique ID for the message */
        id: string;
        role: "agent" | "customer" | "system";
        content: string;
        /** Datetime ISO 8601 timestamp */
        time: string;
        name?: string | undefined;
        /** Datetime ISO 8601 timestamp */
        scheduled?: string | undefined;
        /** The context generated from the message */
        context?: any | undefined;
        /** Detected intent */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | null) | undefined;
        /** How long to delay the message manually in seconds */
        delayInSeconds?: (number | null) | undefined;
    }[][] | undefined;
    audios?: any[] | undefined;
}[];

export type Scout9ProjectBuildConfig = {
    tag?: string | undefined;
    llm: {
        engine: "openai";
        model: "gpt-4-1106-preview" | "gpt-4-vision-preview" | "gpt-4" | "gpt-4-0314" | "gpt-4-0613" | "gpt-4-32k" | "gpt-4-32k-0314" | "gpt-4-32k-0613" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-3.5-turbo-0301" | "gpt-3.5-turbo-0613" | "gpt-3.5-turbo-16k-0613" | string;
    } | {
        engine: "llama";
        model: string;
    } | {
        engine: "bard";
        model: string;
    };
    /** Configure personal model transformer (PMT) settings to align auto replies the agent's tone */
    pmt: {
        engine: "scout9";
        model: string;
    };
    /** Determines the max auto replies without further conversation progression (defined by new context data gathered), before the conversation is locked and requires manual intervention */
    maxLockAttempts?: number | undefined;
    /** Configure the initial contexts for every conversation */
    initialContext: string[];
    organization?: {
        name: string;
        description: string;
        dashboard?: string | undefined;
        logo?: string | undefined;
        icon?: string | undefined;
        logos?: string | undefined;
        website?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    } | undefined;
    agents: {
        deployed?: {
            /** Web URL for agent */
            web?: string | undefined;
            /** Phone number for agent */
            phone?: string | undefined;
            /** Email address for agent */
            email?: string | undefined;
        } | undefined;
        img?: (string | null) | undefined;
        /** Agent first name */
        firstName?: string | undefined;
        /** Agent last name */
        lastName?: string | undefined;
        /** Agent is inactive */
        inactive?: boolean | undefined;
        /** Programmable phone number */
        programmablePhoneNumber?: string | undefined;
        /** Programmable phone number SID */
        programmablePhoneNumberSid?: string | undefined;
        /** Email address from Scout9 gmail subdomain */
        programmableEmail?: string | undefined;
        /** Email address to forward to */
        forwardEmail?: string | undefined;
        /** Phone number to forward to */
        forwardPhone?: string | undefined;
        /** Agent title  */
        title?: string;
        /** Context of the agent */
        context?: string;
        includedLocations?: string[] | undefined;
        excludedLocations?: string[] | undefined;
        model?: ("Scout9" | "bard" | "openai");
        transcripts?: {
            /** Unique ID for the message */
            id: string;
            role: "agent" | "customer" | "system";
            content: string;
            /** Datetime ISO 8601 timestamp */
            time: string;
            name?: string | undefined;
            /** Datetime ISO 8601 timestamp */
            scheduled?: string | undefined;
            /** The context generated from the message */
            context?: any | undefined;
            /** Detected intent */
            intent?: (string | undefined) | null;
            /** Confidence score of the assigned intent */
            intentScore?: (number | null) | undefined;
            /** How long to delay the message manually in seconds */
            delayInSeconds?: (number | null) | undefined;
        }[][] | undefined;
        audios?: any[] | undefined;
    }[];
    entities: {
        /** If not provided, the id will default to the route (folder) name */
        id?: string | undefined;
        definitions?: {
            /** What entity utterance this represents, if not provided, it will default to the entity id */
            utterance?: string | undefined;
            /** The value of this entity variance */
            value: string;
            /** Text representing the entity variance */
            text: string[];
        }[] | undefined;
        training?: {
            /** The assigned intent id of the given text, e.g. "I love %pizza%" could have an intent id "feedback" and "Can I purchase a %pizza%?" could have an intent id "purchase" */
            intent: string;
            /** Text to train the intent field and entities in or entity variances in example sentences or phrase. Ex: "I love %pizza%" and "Can I purchase a %pizza%?" */
            text: string;
        }[] | undefined;
        tests?: {
            /** Text to test the entity detection */
            text: string;
            expected: {
                /** The expected intent id */
                intent: string;
                context?: any;
            };
        }[] | undefined;
        /** Entity id association, used to handle route params */
        entities: string[];
        entity: string;
        api: {
            GET?: boolean | undefined;
            UPDATE?: boolean | undefined;
            QUERY?: boolean | undefined;
            PUT?: boolean | undefined;
            PATCH?: boolean | undefined;
            DELETE?: boolean | undefined;
        } | null;
    }[];
    workflows: {
        /** Workflow id association, used to handle route params */
        entities: string[];
        entity: string;
    }[];
};

export type Scout9ProjectConfig = {
    tag?: string | undefined;
    llm: {
        engine: "openai";
        model: "gpt-4-1106-preview" | "gpt-4-vision-preview" | "gpt-4" | "gpt-4-0314" | "gpt-4-0613" | "gpt-4-32k" | "gpt-4-32k-0314" | "gpt-4-32k-0613" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-3.5-turbo-0301" | "gpt-3.5-turbo-0613" | "gpt-3.5-turbo-16k-0613" | string;
    } | {
        engine: "llama";
        model: string;
    } | {
        engine: "bard";
        model: string;
    };
    /** Configure personal model transformer (PMT) settings to align auto replies the agent's tone */
    pmt: {
        engine: "scout9";
        model: string;
    };
    /** Determines the max auto replies without further conversation progression (defined by new context data gathered), before the conversation is locked and requires manual intervention */
    maxLockAttempts?: number | undefined;
    /** Configure the initial contexts for every conversation */
    initialContext: string[];
    organization?: {
        name: string;
        description: string;
        dashboard?: string | undefined;
        logo?: string | undefined;
        icon?: string | undefined;
        logos?: string | undefined;
        website?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    } | undefined;
};

export type Test = {
    baz: {
        boo: {
            one: number;
            two?: number | undefined;
        };
    };
    bus: {
        foo: string;
        bar?: boolean | undefined;
    };
};

export type WorkflowConfiguration = {
    /** Workflow id association, used to handle route params */
    entities: string[];
    entity: string;
};

export type WorkflowEvent = {
    messages: {
        /** Unique ID for the message */
        id: string;
        role: "agent" | "customer" | "system";
        content: string;
        /** Datetime ISO 8601 timestamp */
        time: string;
        name?: string | undefined;
        /** Datetime ISO 8601 timestamp */
        scheduled?: string | undefined;
        /** The context generated from the message */
        context?: any | undefined;
        /** Detected intent */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | null) | undefined;
        /** How long to delay the message manually in seconds */
        delayInSeconds?: (number | null) | undefined;
    }[];
    conversation: {
        /** Default agent assigned to the conversation(s) */
        $agent: string;
        /** Customer this conversation is with */
        $customer: string;
        /** Initial contexts to load when starting the conversation */
        initialContexts?: string[] | undefined;
        environment: "phone" | "email" | "web";
        environmentProps?: {
            /** HTML Subject of the conversation */
            subject?: string | undefined;
            /** Used to sync email messages with the conversation */
            platformEmailThreadId?: string | undefined;
        } | undefined;
        /** Whether the conversation is locked or not */
        locked?: (boolean | undefined) | null;
        /** Why this conversation was locked */
        lockedReason?: (string | undefined) | null;
        /** Number attempts made until conversation is locked */
        lockAttempts?: (number | undefined) | null;
        /** What personaId/phone/email was forwarded */
        forwardedTo?: (string | undefined) | null;
        /** Datetime ISO 8601 timestamp when persona was forwarded */
        forwarded?: (string | undefined) | null;
        forwardNote?: (string | undefined) | null;
        /** Detected intent of conversation */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | undefined) | null;
        anticipate?: {
            /** Determines the runtime to address the next response */
            type: "did" | "literal" | "context";
            slots: {
                [x: string]: any[];
            };
            /** For type 'did' */
            did?: string | undefined;
            /** For literal keywords, this map helps point which slot the keyword matches to */
            map?: {
                slot: string;
                keywords: string[];
            }[] | undefined;
        } | undefined;
    };
    context?: any;
    message: {
        /** Unique ID for the message */
        id: string;
        role: "agent" | "customer" | "system";
        content: string;
        /** Datetime ISO 8601 timestamp */
        time: string;
        name?: string | undefined;
        /** Datetime ISO 8601 timestamp */
        scheduled?: string | undefined;
        /** The context generated from the message */
        context?: any | undefined;
        /** Detected intent */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | null) | undefined;
        /** How long to delay the message manually in seconds */
        delayInSeconds?: (number | null) | undefined;
    };
    agent: {
        deployed?: {
            /** Web URL for agent */
            web?: string | undefined;
            /** Phone number for agent */
            phone?: string | undefined;
            /** Email address for agent */
            email?: string | undefined;
        } | undefined;
        img?: (string | null) | undefined;
        /** Agent first name */
        firstName?: string | undefined;
        /** Agent last name */
        lastName?: string | undefined;
        /** Agent is inactive */
        inactive?: boolean | undefined;
        /** Programmable phone number */
        programmablePhoneNumber?: string | undefined;
        /** Programmable phone number SID */
        programmablePhoneNumberSid?: string | undefined;
        /** Email address from Scout9 gmail subdomain */
        programmableEmail?: string | undefined;
        /** Email address to forward to */
        forwardEmail?: string | undefined;
        /** Phone number to forward to */
        forwardPhone?: string | undefined;
        /** Agent title  */
        title?: string;
        /** Unique ID for agent */
        id: string;
    };
    customer: {
        firstName?: string | undefined;
        lastName?: string | undefined;
        name: string;
        email?: (string | null) | undefined;
        phone?: (string | null) | undefined;
        img?: (string | null) | undefined;
        neighborhood?: (string | null) | undefined;
        city?: (string | null) | undefined;
        country?: (string | null) | undefined;
        line1?: (string | null) | undefined;
        line2?: (string | null) | undefined;
        postal_code?: (string | null) | undefined;
        state?: (string | null) | undefined;
        town?: (string | null) | undefined;
        joined?: (string | null) | undefined;
        stripe?: (string | null) | undefined;
        stripeDev?: (string | null) | undefined;
    };
    intent: {
        current: string | null;
        flow: string[];
        initial: string | null;
    };
    stagnationCount: number;
    /** Any developer notes to provide */
    note?: string | undefined;
};

export type WorkflowFunction = (args_0: {
    messages: {
        /** Unique ID for the message */
        id: string;
        role: "agent" | "customer" | "system";
        content: string;
        /** Datetime ISO 8601 timestamp */
        time: string;
        name?: string | undefined;
        /** Datetime ISO 8601 timestamp */
        scheduled?: string | undefined;
        /** The context generated from the message */
        context?: any | undefined;
        /** Detected intent */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | null) | undefined;
        /** How long to delay the message manually in seconds */
        delayInSeconds?: (number | null) | undefined;
    }[];
    conversation: {
        /** Default agent assigned to the conversation(s) */
        $agent: string;
        /** Customer this conversation is with */
        $customer: string;
        /** Initial contexts to load when starting the conversation */
        initialContexts?: string[] | undefined;
        environment: "phone" | "email" | "web";
        environmentProps?: {
            /** HTML Subject of the conversation */
            subject?: string | undefined;
            /** Used to sync email messages with the conversation */
            platformEmailThreadId?: string | undefined;
        } | undefined;
        /** Whether the conversation is locked or not */
        locked?: (boolean | undefined) | null;
        /** Why this conversation was locked */
        lockedReason?: (string | undefined) | null;
        /** Number attempts made until conversation is locked */
        lockAttempts?: (number | undefined) | null;
        /** What personaId/phone/email was forwarded */
        forwardedTo?: (string | undefined) | null;
        /** Datetime ISO 8601 timestamp when persona was forwarded */
        forwarded?: (string | undefined) | null;
        forwardNote?: (string | undefined) | null;
        /** Detected intent of conversation */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | undefined) | null;
        anticipate?: {
            /** Determines the runtime to address the next response */
            type: "did" | "literal" | "context";
            slots: {
                [x: string]: any[];
            };
            /** For type 'did' */
            did?: string | undefined;
            /** For literal keywords, this map helps point which slot the keyword matches to */
            map?: {
                slot: string;
                keywords: string[];
            }[] | undefined;
        } | undefined;
    };
    context?: any;
    message: {
        /** Unique ID for the message */
        id: string;
        role: "agent" | "customer" | "system";
        content: string;
        /** Datetime ISO 8601 timestamp */
        time: string;
        name?: string | undefined;
        /** Datetime ISO 8601 timestamp */
        scheduled?: string | undefined;
        /** The context generated from the message */
        context?: any | undefined;
        /** Detected intent */
        intent?: (string | undefined) | null;
        /** Confidence score of the assigned intent */
        intentScore?: (number | null) | undefined;
        /** How long to delay the message manually in seconds */
        delayInSeconds?: (number | null) | undefined;
    };
    agent: {
        deployed?: {
            /** Web URL for agent */
            web?: string | undefined;
            /** Phone number for agent */
            phone?: string | undefined;
            /** Email address for agent */
            email?: string | undefined;
        } | undefined;
        img?: (string | null) | undefined;
        /** Agent first name */
        firstName?: string | undefined;
        /** Agent last name */
        lastName?: string | undefined;
        /** Agent is inactive */
        inactive?: boolean | undefined;
        /** Programmable phone number */
        programmablePhoneNumber?: string | undefined;
        /** Programmable phone number SID */
        programmablePhoneNumberSid?: string | undefined;
        /** Email address from Scout9 gmail subdomain */
        programmableEmail?: string | undefined;
        /** Email address to forward to */
        forwardEmail?: string | undefined;
        /** Phone number to forward to */
        forwardPhone?: string | undefined;
        /** Agent title  */
        title?: string;
        /** Unique ID for agent */
        id: string;
    };
    customer: {
        firstName?: string | undefined;
        lastName?: string | undefined;
        name: string;
        email?: (string | null) | undefined;
        phone?: (string | null) | undefined;
        img?: (string | null) | undefined;
        neighborhood?: (string | null) | undefined;
        city?: (string | null) | undefined;
        country?: (string | null) | undefined;
        line1?: (string | null) | undefined;
        line2?: (string | null) | undefined;
        postal_code?: (string | null) | undefined;
        state?: (string | null) | undefined;
        town?: (string | null) | undefined;
        joined?: (string | null) | undefined;
        stripe?: (string | null) | undefined;
        stripeDev?: (string | null) | undefined;
    };
    intent: {
        current: string | null;
        flow: string[];
        initial: string | null;
    };
    stagnationCount: number;
    /** Any developer notes to provide */
    note?: string | undefined;
}, ...args_1: unknown[]) => Promise<{
    /** Forward input information of a conversation */
    forward?: (boolean | string | {
        to?: string | undefined;
        mode?: ("after-reply" | "immediately") | undefined;
        /** Note to provide to the agent */
        note?: string | undefined;
    }) | undefined;
    /** Note to provide to the agent, recommend using forward object api instead */
    forwardNote?: string | undefined;
    instructions?: (string | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    } | string[] | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    }[]) | undefined;
    removeInstructions?: string[] | undefined;
    message?: string | undefined;
    secondsDelay?: number | undefined;
    scheduled?: number | undefined;
    contextUpsert?: {
        [x: string]: any;
    } | undefined;
    resetIntent?: boolean | undefined;
    followup?: ({
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        /** Manual message sent to client */
        message: string;
    } | {
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        instructions: string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[];
    }) | undefined;
    anticipate?: ({
        did: string;
        yes: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
        no: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
    } | {
        /** Forward input information of a conversation */
        forward?: (boolean | string | {
            to?: string | undefined;
            mode?: ("after-reply" | "immediately") | undefined;
            /** Note to provide to the agent */
            note?: string | undefined;
        }) | undefined;
        /** Note to provide to the agent, recommend using forward object api instead */
        forwardNote?: string | undefined;
        instructions?: (string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[]) | undefined;
        removeInstructions?: string[] | undefined;
        message?: string | undefined;
        secondsDelay?: number | undefined;
        scheduled?: number | undefined;
        contextUpsert?: {
            [x: string]: any;
        } | undefined;
        resetIntent?: boolean | undefined;
        followup?: ({
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            /** Manual message sent to client */
            message: string;
        } | {
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            instructions: string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[];
        }) | undefined;
        keywords: string[];
    }[]) | undefined;
} | {
    /** Forward input information of a conversation */
    forward?: (boolean | string | {
        to?: string | undefined;
        mode?: ("after-reply" | "immediately") | undefined;
        /** Note to provide to the agent */
        note?: string | undefined;
    }) | undefined;
    /** Note to provide to the agent, recommend using forward object api instead */
    forwardNote?: string | undefined;
    instructions?: (string | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    } | string[] | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    }[]) | undefined;
    removeInstructions?: string[] | undefined;
    message?: string | undefined;
    secondsDelay?: number | undefined;
    scheduled?: number | undefined;
    contextUpsert?: {
        [x: string]: any;
    } | undefined;
    resetIntent?: boolean | undefined;
    followup?: ({
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        /** Manual message sent to client */
        message: string;
    } | {
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        instructions: string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[];
    }) | undefined;
    anticipate?: ({
        did: string;
        yes: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
        no: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
    } | {
        /** Forward input information of a conversation */
        forward?: (boolean | string | {
            to?: string | undefined;
            mode?: ("after-reply" | "immediately") | undefined;
            /** Note to provide to the agent */
            note?: string | undefined;
        }) | undefined;
        /** Note to provide to the agent, recommend using forward object api instead */
        forwardNote?: string | undefined;
        instructions?: (string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[]) | undefined;
        removeInstructions?: string[] | undefined;
        message?: string | undefined;
        secondsDelay?: number | undefined;
        scheduled?: number | undefined;
        contextUpsert?: {
            [x: string]: any;
        } | undefined;
        resetIntent?: boolean | undefined;
        followup?: ({
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            /** Manual message sent to client */
            message: string;
        } | {
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            instructions: string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[];
        }) | undefined;
        keywords: string[];
    }[]) | undefined;
}[]> | ({
    /** Forward input information of a conversation */
    forward?: (boolean | string | {
        to?: string | undefined;
        mode?: ("after-reply" | "immediately") | undefined;
        /** Note to provide to the agent */
        note?: string | undefined;
    }) | undefined;
    /** Note to provide to the agent, recommend using forward object api instead */
    forwardNote?: string | undefined;
    instructions?: (string | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    } | string[] | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    }[]) | undefined;
    removeInstructions?: string[] | undefined;
    message?: string | undefined;
    secondsDelay?: number | undefined;
    scheduled?: number | undefined;
    contextUpsert?: {
        [x: string]: any;
    } | undefined;
    resetIntent?: boolean | undefined;
    followup?: ({
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        /** Manual message sent to client */
        message: string;
    } | {
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        instructions: string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[];
    }) | undefined;
    anticipate?: ({
        did: string;
        yes: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
        no: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
    } | {
        /** Forward input information of a conversation */
        forward?: (boolean | string | {
            to?: string | undefined;
            mode?: ("after-reply" | "immediately") | undefined;
            /** Note to provide to the agent */
            note?: string | undefined;
        }) | undefined;
        /** Note to provide to the agent, recommend using forward object api instead */
        forwardNote?: string | undefined;
        instructions?: (string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[]) | undefined;
        removeInstructions?: string[] | undefined;
        message?: string | undefined;
        secondsDelay?: number | undefined;
        scheduled?: number | undefined;
        contextUpsert?: {
            [x: string]: any;
        } | undefined;
        resetIntent?: boolean | undefined;
        followup?: ({
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            /** Manual message sent to client */
            message: string;
        } | {
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            instructions: string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[];
        }) | undefined;
        keywords: string[];
    }[]) | undefined;
} | {
    /** Forward input information of a conversation */
    forward?: (boolean | string | {
        to?: string | undefined;
        mode?: ("after-reply" | "immediately") | undefined;
        /** Note to provide to the agent */
        note?: string | undefined;
    }) | undefined;
    /** Note to provide to the agent, recommend using forward object api instead */
    forwardNote?: string | undefined;
    instructions?: (string | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    } | string[] | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    }[]) | undefined;
    removeInstructions?: string[] | undefined;
    message?: string | undefined;
    secondsDelay?: number | undefined;
    scheduled?: number | undefined;
    contextUpsert?: {
        [x: string]: any;
    } | undefined;
    resetIntent?: boolean | undefined;
    followup?: ({
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        /** Manual message sent to client */
        message: string;
    } | {
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        instructions: string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[];
    }) | undefined;
    anticipate?: ({
        did: string;
        yes: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
        no: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
    } | {
        /** Forward input information of a conversation */
        forward?: (boolean | string | {
            to?: string | undefined;
            mode?: ("after-reply" | "immediately") | undefined;
            /** Note to provide to the agent */
            note?: string | undefined;
        }) | undefined;
        /** Note to provide to the agent, recommend using forward object api instead */
        forwardNote?: string | undefined;
        instructions?: (string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[]) | undefined;
        removeInstructions?: string[] | undefined;
        message?: string | undefined;
        secondsDelay?: number | undefined;
        scheduled?: number | undefined;
        contextUpsert?: {
            [x: string]: any;
        } | undefined;
        resetIntent?: boolean | undefined;
        followup?: ({
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            /** Manual message sent to client */
            message: string;
        } | {
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            instructions: string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[];
        }) | undefined;
        keywords: string[];
    }[]) | undefined;
}[]);

export type WorkflowResponseMessage = string | {
    uri: string;
    data?: any | undefined;
    headers?: {
        [x: string]: string;
    } | undefined;
    method?: ("GET" | "POST" | "PUT") | undefined;
};

export type WorkflowResponseMessageApiRequest = {
    uri: string;
    data?: any | undefined;
    headers?: {
        [x: string]: string;
    } | undefined;
    method?: ("GET" | "POST" | "PUT") | undefined;
};

export type WorkflowResponseMessageApiResponse = string | {
    message: string;
} | {
    text: string;
} | {
    data: {
        message: string;
    };
} | {
    data: {
        text: string;
    };
};

export type WorkflowResponse = {
    /** Forward input information of a conversation */
    forward?: (boolean | string | {
        to?: string | undefined;
        mode?: ("after-reply" | "immediately") | undefined;
        /** Note to provide to the agent */
        note?: string | undefined;
    }) | undefined;
    /** Note to provide to the agent, recommend using forward object api instead */
    forwardNote?: string | undefined;
    instructions?: (string | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    } | string[] | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    }[]) | undefined;
    removeInstructions?: string[] | undefined;
    message?: string | undefined;
    secondsDelay?: number | undefined;
    scheduled?: number | undefined;
    contextUpsert?: {
        [x: string]: any;
    } | undefined;
    resetIntent?: boolean | undefined;
    followup?: ({
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        /** Manual message sent to client */
        message: string;
    } | {
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        instructions: string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[];
    }) | undefined;
    anticipate?: ({
        did: string;
        yes: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
        no: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
    } | {
        /** Forward input information of a conversation */
        forward?: (boolean | string | {
            to?: string | undefined;
            mode?: ("after-reply" | "immediately") | undefined;
            /** Note to provide to the agent */
            note?: string | undefined;
        }) | undefined;
        /** Note to provide to the agent, recommend using forward object api instead */
        forwardNote?: string | undefined;
        instructions?: (string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[]) | undefined;
        removeInstructions?: string[] | undefined;
        message?: string | undefined;
        secondsDelay?: number | undefined;
        scheduled?: number | undefined;
        contextUpsert?: {
            [x: string]: any;
        } | undefined;
        resetIntent?: boolean | undefined;
        followup?: ({
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            /** Manual message sent to client */
            message: string;
        } | {
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            instructions: string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[];
        }) | undefined;
        keywords: string[];
    }[]) | undefined;
} | {
    /** Forward input information of a conversation */
    forward?: (boolean | string | {
        to?: string | undefined;
        mode?: ("after-reply" | "immediately") | undefined;
        /** Note to provide to the agent */
        note?: string | undefined;
    }) | undefined;
    /** Note to provide to the agent, recommend using forward object api instead */
    forwardNote?: string | undefined;
    instructions?: (string | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    } | string[] | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    }[]) | undefined;
    removeInstructions?: string[] | undefined;
    message?: string | undefined;
    secondsDelay?: number | undefined;
    scheduled?: number | undefined;
    contextUpsert?: {
        [x: string]: any;
    } | undefined;
    resetIntent?: boolean | undefined;
    followup?: ({
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        /** Manual message sent to client */
        message: string;
    } | {
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        instructions: string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[];
    }) | undefined;
    anticipate?: ({
        did: string;
        yes: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
        no: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
    } | {
        /** Forward input information of a conversation */
        forward?: (boolean | string | {
            to?: string | undefined;
            mode?: ("after-reply" | "immediately") | undefined;
            /** Note to provide to the agent */
            note?: string | undefined;
        }) | undefined;
        /** Note to provide to the agent, recommend using forward object api instead */
        forwardNote?: string | undefined;
        instructions?: (string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[]) | undefined;
        removeInstructions?: string[] | undefined;
        message?: string | undefined;
        secondsDelay?: number | undefined;
        scheduled?: number | undefined;
        contextUpsert?: {
            [x: string]: any;
        } | undefined;
        resetIntent?: boolean | undefined;
        followup?: ({
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            /** Manual message sent to client */
            message: string;
        } | {
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            instructions: string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[];
        }) | undefined;
        keywords: string[];
    }[]) | undefined;
}[];

export type WorkflowResponseSlotBase = {
    /** Forward input information of a conversation */
    forward?: (boolean | string | {
        to?: string | undefined;
        mode?: ("after-reply" | "immediately") | undefined;
        /** Note to provide to the agent */
        note?: string | undefined;
    }) | undefined;
    /** Note to provide to the agent, recommend using forward object api instead */
    forwardNote?: string | undefined;
    instructions?: (string | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    } | string[] | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    }[]) | undefined;
    removeInstructions?: string[] | undefined;
    message?: string | undefined;
    secondsDelay?: number | undefined;
    scheduled?: number | undefined;
    contextUpsert?: {
        [x: string]: any;
    } | undefined;
    resetIntent?: boolean | undefined;
    followup?: ({
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        /** Manual message sent to client */
        message: string;
    } | {
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        instructions: string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[];
    }) | undefined;
};

export type WorkflowResponseSlot = {
    /** Forward input information of a conversation */
    forward?: (boolean | string | {
        to?: string | undefined;
        mode?: ("after-reply" | "immediately") | undefined;
        /** Note to provide to the agent */
        note?: string | undefined;
    }) | undefined;
    /** Note to provide to the agent, recommend using forward object api instead */
    forwardNote?: string | undefined;
    instructions?: (string | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    } | string[] | {
        /** Unique ID for the instruction, this is used to remove the instruction later */
        id?: string | undefined;
        /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
        persist?: boolean | undefined;
        content: string;
    }[]) | undefined;
    removeInstructions?: string[] | undefined;
    message?: string | undefined;
    secondsDelay?: number | undefined;
    scheduled?: number | undefined;
    contextUpsert?: {
        [x: string]: any;
    } | undefined;
    resetIntent?: boolean | undefined;
    followup?: ({
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        /** Manual message sent to client */
        message: string;
    } | {
        scheduled: number;
        cancelIf?: {
            [x: string]: any;
        } | undefined;
        /** This will still run even if the conversation is locked, defaults to false */
        overrideLock?: boolean | undefined;
        instructions: string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[];
    }) | undefined;
    anticipate?: ({
        did: string;
        yes: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
        no: {
            /** Forward input information of a conversation */
            forward?: (boolean | string | {
                to?: string | undefined;
                mode?: ("after-reply" | "immediately") | undefined;
                /** Note to provide to the agent */
                note?: string | undefined;
            }) | undefined;
            /** Note to provide to the agent, recommend using forward object api instead */
            forwardNote?: string | undefined;
            instructions?: (string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[]) | undefined;
            removeInstructions?: string[] | undefined;
            message?: string | undefined;
            secondsDelay?: number | undefined;
            scheduled?: number | undefined;
            contextUpsert?: {
                [x: string]: any;
            } | undefined;
            resetIntent?: boolean | undefined;
            followup?: ({
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                /** Manual message sent to client */
                message: string;
            } | {
                scheduled: number;
                cancelIf?: {
                    [x: string]: any;
                } | undefined;
                /** This will still run even if the conversation is locked, defaults to false */
                overrideLock?: boolean | undefined;
                instructions: string | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                } | string[] | {
                    /** Unique ID for the instruction, this is used to remove the instruction later */
                    id?: string | undefined;
                    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                    persist?: boolean | undefined;
                    content: string;
                }[];
            }) | undefined;
        };
    } | {
        /** Forward input information of a conversation */
        forward?: (boolean | string | {
            to?: string | undefined;
            mode?: ("after-reply" | "immediately") | undefined;
            /** Note to provide to the agent */
            note?: string | undefined;
        }) | undefined;
        /** Note to provide to the agent, recommend using forward object api instead */
        forwardNote?: string | undefined;
        instructions?: (string | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        } | string[] | {
            /** Unique ID for the instruction, this is used to remove the instruction later */
            id?: string | undefined;
            /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
            persist?: boolean | undefined;
            content: string;
        }[]) | undefined;
        removeInstructions?: string[] | undefined;
        message?: string | undefined;
        secondsDelay?: number | undefined;
        scheduled?: number | undefined;
        contextUpsert?: {
            [x: string]: any;
        } | undefined;
        resetIntent?: boolean | undefined;
        followup?: ({
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            /** Manual message sent to client */
            message: string;
        } | {
            scheduled: number;
            cancelIf?: {
                [x: string]: any;
            } | undefined;
            /** This will still run even if the conversation is locked, defaults to false */
            overrideLock?: boolean | undefined;
            instructions: string | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            } | string[] | {
                /** Unique ID for the instruction, this is used to remove the instruction later */
                id?: string | undefined;
                /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
                persist?: boolean | undefined;
                content: string;
            }[];
        }) | undefined;
        keywords: string[];
    }[]) | undefined;
};

export type WorkflowsConfiguration = {
    /** Workflow id association, used to handle route params */
    entities: string[];
    entity: string;
}[];

export type apiFunction = (args_0: {
    searchParams: {
        [x: string]: string | string[];
    };
    params: {
        [x: string]: string;
    };
}, ...args_1: unknown[]) => Promise<{
    body?: any;
    init?: {
        status?: number | undefined;
        statusText?: string | undefined;
        headers?: any | undefined;
    } | undefined;
}>;

export type deleteApiFunction = (args_0: {
    searchParams: {
        [x: string]: string | string[];
    };
    params: {
        [x: string]: string;
    };
}, ...args_1: unknown[]) => Promise<{
    body?: any;
    init?: {
        status?: number | undefined;
        statusText?: string | undefined;
        headers?: any | undefined;
    } | undefined;
}>;

export type eventResponse = {
    body?: any;
    init?: {
        status?: number | undefined;
        statusText?: string | undefined;
        headers?: any | undefined;
    } | undefined;
};

export type getApiFunction = (args_0: {
    searchParams: {
        [x: string]: string | string[];
    };
    params: {
        [x: string]: string;
    };
}, ...args_1: unknown[]) => Promise<{
    body?: any;
    init?: {
        status?: number | undefined;
        statusText?: string | undefined;
        headers?: any | undefined;
    } | undefined;
}>;

export type queryApiFunction = (args_0: {
    searchParams: {
        [x: string]: string | string[];
    };
    params: {
        [x: string]: string;
    };
}, ...args_1: unknown[]) => Promise<{
    body?: any;
    init?: {
        status?: number | undefined;
        statusText?: string | undefined;
        headers?: any | undefined;
    } | undefined;
}>;