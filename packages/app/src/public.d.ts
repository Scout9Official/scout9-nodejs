
/**
 * Scout9 App
 * Application platform for managing auto reply workflows from personal communication methods
 */

import { z } from 'zod';
import { Message as MessageAdmin, EntityToken as EntityTokenAdmin } from '@scout9/admin'

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
export function json<T = any>(data: T, init?: ResponseInit | undefined): EventResponse<T>;
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
export class EventResponse<T = any> {
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
 * @overload
 * @param {Array<string | (OptionsInstruct & {content: string})>} instruction
 *
 * @example instruct("Ask user if they are looking to order a pizza");
 *
 * @type {(message: string, options?: OptionsInstruct) => EventMacros}
 */
export const instruct: ((instruction: string, options?: OptionsInstruct) => EventMacros) | ((instruction: Array<string | (OptionsInstruct & {content: string})>) => EventMacros);

/**
 * If conversation is not stagnant, return instructions to guide next auto reply response, otherwise it will forward the conversation
 * @param {string} instruction - the instruction to send to the
 * @param {OptionsInstruct} [options]
 * @return {EventMacros}
 *
 * @example instructSafe("Ask user if they are looking to order a pizza");
 * @example instructSafe("Ask user if they are looking to order a pizza", {stagnationLimit: 3}); // Allows for 3 stagnate messages before forwarding
 *
 * @type {(message: string, options?: OptionsInstruct) => EventMacros}
 */
export const instructSafe: (instruction: string, options?: (OptionsInstruct & OptionsForward & {stagnationLimit?: number})) => EventMacros;

/**
 * Forwards conversation back to you or owner of workflow.
 *
 * Typically used when the conversation is over or user is stuck in the workflow and needs manual intervention.
 *
 * The provided message input gets sent to you in a sms text with some information why conversation was forwarded.
 *
 * Calling this method will lock the conversation and prevent auto replies from being sent to the user.
 *
 * @example - basic forward
 * forward()
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
export const forward: (message?: string, options?: OptionsForward) => EventMacros;
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

    resetIntent?: boolean;
};

/**
 * Event macros to be used inside your scout9 auto reply workflows
 */
export type EventMacros = {
    /**
     * Sets context into the conversation context for later use
     */
    upsert(updates: Record<string, any>): EventMacros;
    /**
     * Similar to `instruction` except that it requires a schedule time parameter that determines when to follow up (and is not an event output macro). This will fire another run job with a new insert system context message, if `options.literal` is set to true, it will be an appended agent message prior to running the workflow app.
     */
    followup(instruction: string, options: (Date | string | OptionsFollowup)): EventMacros;

    /**
     * Similar to `instruct` except that it requires a schedule time parameter that determines when to follow up (and is not an event output macro). This will fire another run job with a new insert system context message, if `options.literal` is set to true, it will be an appended agent message prior to running the workflow app.
     */
    anticipate(instruction: string, yes: WorkflowResponseSlotBase, no: WorkflowResponseSlotBase): EventMacros;

    /**
     * Similar to `instruct` except that it requires a schedule time parameter that determines when to follow up (and is not an event output macro). This will fire another run job with a new insert system context message, if `options.literal` is set to true, it will be an appended agent message prior to running the workflow app.
     */
    anticipate(instruction: Array<WorkflowResponseSlotBase & {keywords: string[]}>): EventMacros;

    /**
     * Resets conversation intent
     */
    resetIntent(): EventMacros;

    /**
     * Removes instruction(s) from the system
     */
    instructRemove(idOrIds: string | string[], strict?: boolean): EventMacros

    /**
     * If conversation is not stagnant, return instructions to guide next auto reply response, otherwise it will forward the conversation
     * stagnationLimit defaults to 2
     */
    instructSafe(instruction: string, options?: (OptionsInstruct & OptionsForward & {stagnationLimit?: number})): EventMacros;

    /**
     * Return instructions to guide next auto reply response
     */
    instruct(instruction: string, options?: OptionsInstruct): EventMacros;

    /**
     * Return instructions to guide next auto reply response
     */
    instruct(instruction: Array<string | (OptionsInstruct & {content: string})>): EventMacros;

    /**
     * If a manual message must be sent, you can use the `reply` macro
     * @param {string} message - the message to manually send to the user
     * @param {OptionsReply} [options]
     * @return {EventMacros}
     */
    reply(message: string, options?: OptionsReply): EventMacros;

    /**
     * This macro ends the conversation and forwards it the owner of the persona to manually handle the flow. If your app returns undefined or no event, then a default forward is generated.
     * @param {string} [message] - the message to forward to owner of persona
     * @param {OptionsForward} [options]
     */
    forward(message?: string, options?: OptionsForward): EventMacros;

    /**
     * Returns event payload
     * @param {boolean} flush - if true, will reset the data payload
     * @return {Array<WorkflowResponseSlot>}
     */
    toJSON(flush?: boolean): Array<WorkflowResponseSlot>;
};


/**
 * The `did` macro takes a given prompt and infers a binary `true` or `false` result in relation to the prompt's subject actor and the prompt's inquiry.
 * @param {string} prompt
 * @return {Promise<boolean>}
 */
export function did(prompt: string): Promise<boolean>;

/**
 * The `does` macro takes a given prompt and infers a binary `true` or `false` result in relation to the prompt's subject actor and the prompt's inquiry for the given immediate message
 *
 * Only use this if you want to evaluate the latest message, otherwise use did() which uses all messages
 * @param {string} prompt
 * @param {'customer' | 'agent'} [relation]
 * @return {Promise<boolean>}
 */
export function does(prompt: string, relation?: 'customer' | 'agent'): Promise<boolean>;

export type ContextExampleWithTrainingData = {
    input: string;
    output: Record<string, any>[];
}

export type ConversationContext = Record<string, string | number | boolean | null | Array<string | number | boolean | null>>;

export type ContextExamples = (ContextExampleWithTrainingData | ConversationContext)[];
export type ContextOutput = Record<string, any>;

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
export function context(prompt: string, examples?: ContextExamples): Promise<ContextOutput>;

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
    transcripts?: Message[][] | undefined;
    audios?: any[] | undefined;
    pmt?: {
        tag?: string;
        ingress: "auto" | "manual" | "app" | "webhook";
        llm?: string;
        scout9?: string;
    }
};

export type AgentConfiguration = Agent & {id: string};

export type AgentsConfiguration = AgentConfiguration[];

export type Agents = Agent[];

export type ContextExample = ContextExampleWithTrainingData[] | ConversationContext[];

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


export type Conversation = {
    $id: string;
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
    /** Used to handle anticipating outcome */
    anticipate?: ConversationAnticipate | undefined;
    /** If conversation is assigned to a command */
    command?: CommandConfiguration | undefined;
};

export type CustomerValue = boolean | number | string;

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
} & {[key: string]: CustomerValue};

export type EntityDefinition = {
    /** What entity utterance this represents, if not provided, it will default to the entity id */
    utterance?: string | undefined;
    /** The value of this entity variance */
    value: string;
    /** Text representing the entity variance */
    text: string[];
};

export type EntityTrainingDocument = {
    /** The assigned intent id of the given text, e.g. "I love %pizza%" could have an intent id "feedback" and "Can I purchase a %pizza%?" could have an intent id "purchase" */
    intent: string;
    /** Text to train the intent field and entities in or entity variances in example sentences or phrase. Ex: "I love %pizza%" and "Can I purchase a %pizza%?" */
    text: string;
}

export type EntityTest = {
    /** Text to test the entity detection */
    text: string;
    expected: {
        /** The expected intent id */
        intent: string;
        context?: any;
    };
};

/**
 * The type of entity.
 * - "entity" represents a core entity type.
 * - "reference" represents a categorical reference to a core entity.
 */
export type EntityConfigurationType = 'entity' | 'reference';

/** Configuration for a core entity */
export type CoreEntityConfiguration = {
    type: 'entity';
};

/** Configuration for a reference entity */
export type CategoricalReferenceEntityConfiguration = {
    type: 'reference';
    /**
     * The ID of the core entity this reference entity links to.
     */
    references: string;
};

/** Fallback when the type is unknown or optional */
export type UnknownEntityConfigurationType = {
    /**
     * The type of entity.
     * - "entity" for core types
     * - "reference" for generated categories that reference core entities
     */
    type?: EntityConfigurationType;
    /** Required if type is "reference" */
    references?: string;
};

/** Base entity NLP configuration file used for training/tuning its corresponding NLP model(s) */
export type EntityConfigurationBase = {
    /**
     * Optional ID; if not provided, defaults to the route (folder) name.
     */
    id?: string;

    /**
     * What type of entity this represents
     */
    type: 'reference' | 'entity';

    /**
     * The corpus definitions used to compute embeddings for NLP models.
     */
    definitions?: EntityDefinition[];

    /**
     * The corpus documents used to train NLP models.
     */
    training?: EntityTrainingDocument[];

    /**
     * Tests to validate the trained NLP model.
     */
    tests?: EntityTest[];
};

/** Full entity NLP configuration file used for training/tuning its corresponding NLP model(s) */
export type EntityConfiguration = EntityConfigurationBase & (CategoricalReferenceEntityConfiguration | CoreEntityConfiguration | UnknownEntityConfigurationType);

export type EntityApiConfiguration = {
    GET?: boolean | undefined;
    UPDATE?: boolean | undefined;
    QUERY?: boolean | undefined;
    PUT?: boolean | undefined;
    PATCH?: boolean | undefined;
    DELETE?: boolean | undefined;
};

export type EntityRootProjectConfiguration = EntityConfiguration & {
    /** Entity id association, used to handle route params */
    entities: string[];
    entity: string;
    api: EntityApiConfiguration | null;
};

export type EntitiesRootConfiguration = EntityConfiguration[];

export type EntitiesRootProjectConfiguration = EntityRootProjectConfiguration[];


export type InstructionObject = {
    /** Unique ID for the instruction, this is used to remove the instruction later */
    id?: string | undefined;
    /** if true, the instruction persists the conversation, if false the instruction will only last for 1 auto reply */
    persist?: boolean | undefined;
    content: string;
};

export type Instruction = string | InstructionObject;

export type FollowupBase = {
    scheduled: number;
    cancelIf?: {
        [x: string]: any;
    } | undefined;
    /** This will still run even if the conversation is locked, defaults to false */
    overrideLock?: boolean | undefined;
};

export type FollowupWithMessage = FollowupBase & {
    /** Manual message sent to client */
    message: string;
};

export type FollowupWithInstructions = FollowupBase & { instructions: Instruction[]; };

export type Followup = FollowupWithMessage | FollowupWithInstructions;

/**
 * Metadata to provide a atomic transaction on a entity context record
 * @ingress auto/manual only
 */
export type EntityContextUpsert = {
    entityType: string;
    entityRecordId: string;
    method: 'mutate' | 'delete'
} & ({
    method: 'delete'
} | {
    method: 'mutate';
    fields: Record<string, string | number | boolean | null | '#remove' | '#delete'>;
});

export type Forward = boolean | string | {
    to?: string | undefined;
    mode?: ("after-reply" | "immediately") | undefined;
    /** Note to provide to the agent */
    note?: string | undefined;
};

export type IntentWorkflowEvent = {
    current: string | null;
    flow: string[];
    initial: string | null;
};

/**
 * metadata relationship for the <entity-context>/<entity> element in transcripts and instructions
 * @ingress auto/manual
 * @deprecated use @scout9/admin EntityTokenAdmin
 */
export type EntityToken = EntityTokenAdmin;

/**
 * metadata relationship for the <entity-api> element in transcripts and instructions
 * @ingress auto/manual
 */
export type EntityApi = {

    /**
     * REST URI to hit
     */
    uri: string;

    /**
     * Method to use to call the api, defaults to "POST"
     */
    method?: string;

    /**
     * Additional payload to include to the api
     */
    body?: ConversationContext;

    /**
     * Headers to apply to the call
     */
    headers?: Record<string, string>;

    /**
     * Separate URI to establish OAuth 2.0/JWT tokens
     */
    auth?: Omit<EntityApi, 'auth'>;
}

/**
 * @deprecated use @scout/admin Message
 */
export type Message = MessageAdmin;

export type PersonaConfiguration = AgentConfiguration;

export type Persona = Agent;

export type PersonasConfiguration = PersonaConfiguration[];

export type Personas = Persona[];

export type WorkflowConfiguration = {
    /** Workflow id association, used to handle route params */
    entities: string[];
    entity: string;
};

export type CommandConfiguration = {
    entity: string;
    path: string;
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

export type Scout9ProjectBuildConfig = Scout9ProjectConfig & {
    agents: AgentsConfiguration;
    /**
     * @deprecated use agents
     */
    personas?: AgentsConfiguration;
    /**
     * @deprecated use agents
     */
    persona?: AgentsConfiguration;
    entities: EntityRootProjectConfiguration[];
    workflows: WorkflowConfiguration[];
    commands: CommandConfiguration[];
};

export type WorkflowEvent = {
    messages: Message[];
    conversation: Conversation;
    context?: any;
    message: Message;
    agent: Omit<AgentConfiguration, 'transcripts' | 'audios' | 'includedLocations' | 'excludedLocations' | 'model' | 'context' | 'pmt'>;
    customer: Customer;
    intent: IntentWorkflowEvent;
    stagnationCount: number;
    /** Any developer notes to provide */
    note?: string | undefined;
};

export type AnticipateDid =  {
    did: string;
    yes: WorkflowResponseSlotBase;
    no: WorkflowResponseSlotBase;
};

export type AnticipateKeywords = WorkflowResponseSlotBase & {
    keywords: string[];
}

export type Anticipate = AnticipateDid | AnticipateKeywords[];

export type DirectMessage = Partial<Omit<Message, 'id' | 'entities' | 'time' | 'role'>>;

/**
 * Workflow Response Slot, can use for both PMT workflow event and event macro runtimes
 */
export type WorkflowResponseSlotBase = {
    /** Context to upsert to the conversation */
    contextUpsert?: {
        [x: string]: any;
    } | undefined;

    /** Information to follow up to the client */
    followup?: Followup | undefined;

    /** Forward input information of a conversation */
    forward?: Forward | undefined;

    /** Note to provide to the agent, recommend using forward object api instead */
    forwardNote?: string | undefined;

    /** Instructions to send to the PMT on how to steer the conversation */
    instructions?: Instruction | Instruction[] | undefined;

    /** If provided, sends a direct message to the user */
    message?: string | DirectMessage | undefined;

    /** Remove instructions from memory (requires set instructions to have ids) */
    removeInstructions?: string[] | undefined;

    /** If true, resets the conversations intent value to undefined or to its initial value */
    resetIntent?: boolean | undefined;

    /** Delays in seconds of instructions (if provided) to PMT and direct message (if provided) to user */
    secondsDelay?: number | undefined;

    /** unix time of when to send instructions or message */
    scheduled?: number | undefined;

};

/**
 * Workflow Response Slot, only PMT workflow events
 */
export type WorkflowResponseSlot = WorkflowResponseSlotBase & {
    /**
     * The Anticipate API acts as a preflight to the users next response, for example:
     *      - did the user agree to accept the concert tickets? Then proceed with asking for their email
     *      - Did the user say any of these words: "cancel", "drop", or "remove"? Then cancel tickets
     */
    anticipate?: Anticipate | undefined;

    /**
     * If provided, it will propagate entity context to your Scout9 entity context store
     * @ingress auto/manual only
     */
    entityContextUpsert?: Array<EntityContextUpsert> | undefined;

    /**
     * If provided, it will send the user's workflow tasks to the PMT to execute custom business logic
     * @ingress auto/manual only
     */
    tasks?: string[] | undefined;
};

/**
 * The JSON anticipated response for a given workflow to drive the PMT runtime
 * Can either be an EventMacro or WorkflowResponseSlot
 */
export type WorkflowResponse = EventMacros | WorkflowResponseSlot | (WorkflowResponseSlot | EventMacros)[];

export type WorkflowFunction = (event: WorkflowEvent) => WorkflowResponse | Promise<WorkflowResponse>;

export type WorkflowResponseMessageApiRequest = {
  uri: string;
  data?: any | undefined;
  headers?: Record<string, string> | undefined;
  method?: ("GET" | "POST" | "PUT") | undefined;
};

export type WorkflowResponseMessage = string | WorkflowResponseMessageApiRequest;

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

export type WorkflowsConfiguration = {
    /** Workflow id association, used to handle route params */
    entities: string[];
    entity: string;
}[];

export type apiFunction = (args: {
    searchParams: Record<string, string | string[]>;
    params: Record<string, string>;
}) => Promise<{
    body?: any;
    init?: {
        status?: number | undefined;
        statusText?: string | undefined;
        headers?: any | undefined;
    } | undefined;
}>;

export type deleteApiFunction = apiFunction;

export type eventResponse = {
    body?: any;
    init?: {
        status?: number | undefined;
        statusText?: string | undefined;
        headers?: any | undefined;
    } | undefined;
};

export type getApiFunction = apiFunction;

export type queryApiFunction = apiFunction;
