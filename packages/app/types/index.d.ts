declare module '@scout9/app' {
	import type { Message as MessageAdmin, EntityToken as EntityTokenAdmin } from '@scout9/admin';
  /**
   * @param event - every workflow receives an event object
   * */
  export function run(event: WorkflowEvent, options: {
	  cwd?: string;
	  mode?: string;
	  src?: string;
	  eventSource: string;
  }): WorkflowResponse;

  export function json<T = any>(data: T, init?: ResponseInit | undefined): EventResponse<T>;
  /**
   * @param event - every workflow receives an event object
   * */
  export function sendEvent(event: WorkflowEvent, options: {
	  cwd?: string;
	  mode?: string;
	  src?: string;
	  eventSource: string;
  }): WorkflowResponse;


  /**
   * Utility runtime class used to guide event output
   * */
  export class EventResponse<T = any> {
	  /**
	   * Create a new EventResponse instance with a JSON body.
	   * @param body - The body of the response.
	   * @param options - Additional options for the response.
	   * @returns A new EventResponse instance.
	   */
	  static json<T_1>(body: T_1, options?: ResponseInit): EventResponse<T_1>;
	  /**
	   * Create an EventResponse.
	   * @param body - The body of the response.
	   * @param init - Additional options for the response.
	   * @throws {Error} If the body is not a valid object.
	   */
	  constructor(body: T, init?: ResponseInit);
	  
	  private body;
	  
	  private init;
	  /**
	   * Get the response object.
	   * @returns The response object.
	   */
	  get response(): Response;
	  /**
	   * Get the data of the response.
	   * @returns The body of the response.
	   */
	  get data(): T;
  }


  /**
   * Return instructions to guide next auto reply response
   * @param instruction - the instruction to send to the
   * @example instruct("Ask user if they are looking to order a pizza");
   *
   * */
  export const instruct: ((instruction: string, options?: OptionsInstruct) => EventMacros) | ((instruction: Array<string | (OptionsInstruct & {content: string})>) => EventMacros);

  /**
   * If conversation is not stagnant, return instructions to guide next auto reply response, otherwise it will forward the conversation
   * @param instruction - the instruction to send to the
   * @example instructSafe("Ask user if they are looking to order a pizza");
   * @example instructSafe("Ask user if they are looking to order a pizza", {stagnationLimit: 3}); // Allows for 3 stagnate messages before forwarding
   *
   * */
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
   * */
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
   * */
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
	   * @param message - the message to manually send to the user
	   * */
	  reply(message: string, options?: OptionsReply): EventMacros;

	  /**
	   * This macro ends the conversation and forwards it the owner of the persona to manually handle the flow. If your app returns undefined or no event, then a default forward is generated.
	   * @param message - the message to forward to owner of persona
	   * 
	   */
	  forward(message?: string, options?: OptionsForward): EventMacros;

	  /**
	   * Returns event payload
	   * @param flush - if true, will reset the data payload
	   * */
	  toJSON(flush?: boolean): Array<WorkflowResponseSlot>;
  };


  /**
   * The `did` macro takes a given prompt and infers a binary `true` or `false` result in relation to the prompt's subject actor and the prompt's inquiry.
   * */
  export function did(prompt: string): Promise<boolean>;

  /**
   * The `does` macro takes a given prompt and infers a binary `true` or `false` result in relation to the prompt's subject actor and the prompt's inquiry for the given immediate message
   *
   * Only use this if you want to evaluate the latest message, otherwise use did() which uses all messages
   * */
  export function does(prompt: string, relation?: 'customer' | 'agent'): Promise<boolean>;

  export type ContextExampleWithTrainingData = {
	  input: string;
	  output: Record<string, any>[];
  }

  export type ConversationContext = Record<string, string | number | boolean | null | Array<string | number | boolean | null>>;

  export type ContextExamples = (ContextExampleWithTrainingData | ConversationContext)[];
  export type ContextOutput = Record<string, any>;


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
   * @param prompt - Prompt to infer a context data set to use in your workflow code.
   * @param examples - Examples to the macro to ensure a consistent data structure.
   * */
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
	  instructions?: Instruction[] | undefined;

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
}

declare module '@scout9/app/testing-tools' {
	export function createMockAgent(firstName?: string, lastName?: string): any;
	export function createMockCustomer(firstName?: string, lastName?: string): any;
	export function createMockMessage(content: any, role?: string, time?: string): any;
	export function createMockConversation(environment?: any, $agent?: string | undefined, $customer?: string | undefined, $id?: string | undefined): any;
	export function createMockWorkflowEvent(message: string, intent?: string | any['intent'] | null): any;
	/**
	 * Testing tool kit, used to handle Scout9 operations such as parsing, workflow, and generating responses
	 */
	export class Scout9Test {
		/**
		 * Mimics a customer message to your app (useful for testing)
		 * @param props - the Scout9Test properties
		 * @param props.customer - customer to use
		 * @param props.context - prior conversation context
		 * @param props.persona id to use
		 * @param props.conversation - existing conversation
		 * 
		 */
		constructor({ persona, customer, context, conversation, cwd, src, mode, api, app, project, log }?: {
			cwd?: string;
			src?: string;
			mode?: string;
			persona: any;
			customer: any;
			context: any;
			conversation?: any;
			api: any;
			app: any;
			project: any;
			log?: boolean | undefined;
		});
		
		customer: any;
		
		persona: any;
		
		conversation: any;
		
		messages: any[];
		
		context: any;
		/**
		 * Loads the test environment
		 * @param override - defaults to false, if true, it will override the current loaded state such as the scout9 api, workflow function, and project config
		 * */
		load(override?: boolean | undefined): Promise<void>;
		/**
		 * Teardown the test environment
		 */
		teardown(): void;
		/**
		 * Send a message as a customer to your app
		 * @param message - message to send
		 * @param progress - progress callback, if true, will log progress, can override with your own callback. If not provided, no logs will be added.
		 * */
		send(message: string, progress?: any | boolean): Promise<any>;
		/**
		 * Parse user message
		 * @param message - message string to parse
		 * @param language - language to parse in, defaults to "en" for english
		 * */
		parse(message: string, language?: string | undefined): Promise<import('@scout9/admin').ParseResponse>;
		/**
		 * Runs your local app workflow
		 * @param message - the message to run through the workflow
		 * @param event - additional event data
		 * */
		workflow(message: string, event?: Omit<Partial<any>, 'message'> | undefined): Promise<any>;
		/**
		 * Generate a response to the user from the given or registered persona's voice in relation to the current conversation's context.
		 * @param {Object} input - Generation input, defaults to test registered data such as existing messages, context, and persona information.
		 * */
		generate({ personaId, conversation, messages, context }?: {
			personaId?: string | undefined;
			conversation?: Partial<import("@scout9/admin").ConversationCreateRequest> | undefined;
			messages?: any[] | undefined;
			context?: any;
		} | undefined): Promise<import('@scout9/admin').GenerateResponse>;
		#private;
	}
}

declare module '@scout9/app/spirits' {
	export namespace Spirits {
		function customer(input: ConversationData & CustomerSpiritCallbacks, onError?: (error: Error) => void): Promise<ConversationEvent>;
	}
	export type Document = {
		id: string;
	};
	/**
	 * Represents a change with before and after states of a given type.
	 */
	export type Change<Type> = {
		/**
		 * - The state before the change.
		 */
		before: Type;
		/**
		 * - The state after the change.
		 */
		after: Type;
	};
	export type ConversationData = {
		/**
		 * - used to define generation and extract persona metadata
		 */
		config: any;
		conversation: any;
		messages: Array<import('@scout9/admin').Message>;
		/**
		 * - the message sent by the customer (should exist in messages)
		 */
		message: import('@scout9/admin').Message;
		customer: any;
		/**
		 * - progress checklist for manual/auto ingress workflows
		 */
		progress: any;
		/**
		 * - event context
		 */
		context: any;
	};
	export type ParseOutput = {
		messages: Array<import('@scout9/admin').Message>;
		conversation: any;
		message: import('@scout9/admin').Message;
		context: any;
	};
	export type WorkflowOutput = {
		slots: Array<any>;
		messages: Array<import('@scout9/admin').Message>;
		conversation: any;
		context: any;
	};
	export type GenerateOutput = {
		generate: import('@scout9/admin').GenerateResponse | undefined;
		messages: Array<import('@scout9/admin').Message>;
		conversation: any;
		context: any;
	};
	export type ParseFun = (message: string, language: string | undefined) => Promise<import('@scout9/admin').ParseResponse>;
	export type ContextualizerFun = (args: Pick<any, 'messages' | 'conversation'>) => Promise<any['messages']>;
	export type WorkflowFun = (event: any) => Promise<any>;
	export type GenerateFun = (data: import('@scout9/admin').GenerateRequestOneOf1) => Promise<import('@scout9/admin').GenerateResponse>;
	export type TransformerFun = (data: import('@scout9/admin').PmtTransformRequest) => Promise<import('@scout9/admin').PmtTransformResponse>;
	export type IdGeneratorFun = (prefix: import('@scout9/admin').Message['role']) => string;
	export type StatusCallback = (message: string, level?: 'info' | 'warn' | 'error' | 'success' | undefined, type?: string | undefined, payload?: any | undefined) => void;
	export type CustomerSpiritCallbacks = {
		parser: ParseFun;
		contextualizer: ContextualizerFun;
		workflow: WorkflowFun;
		generator: GenerateFun;
		transformer: TransformerFun;
		idGenerator: IdGeneratorFun;
		progress?: StatusCallback | undefined;
	};
	export type ConversationEvent = {
		conversation: (Change<any> & {
			forwardNote?: string;
			forward?: any['forward'];
		});
		messages: Change<Array<import('@scout9/admin').Message>>;
		context: Change<any>;
		message: Change<import('@scout9/admin').Message>;
		followup: Array<any>;
		entityContextUpsert: Array<any>;
	};
}

declare module '@scout9/app/schemas' {
	import type { z } from 'zod';
	export const eventResponseSchema: z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>;
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>;
	export const CommandSchema: z.ZodObject<{
		path: z.ZodString;
		entity: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		path: string;
		entity: string;
	}, {
		path: string;
		entity: string;
	}>;
	export const CommandsSchema: z.ZodArray<z.ZodObject<{
		path: z.ZodString;
		entity: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		path: string;
		entity: string;
	}, {
		path: string;
		entity: string;
	}>, "many">;
	export const ConversationContext: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>;
	export const ConversationAnticipateSchema: z.ZodObject<{
		type: z.ZodEnum<["did", "literal", "context"]>;
		slots: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodAny, "many">>;
		did: z.ZodOptional<z.ZodString>;
		map: z.ZodOptional<z.ZodArray<z.ZodObject<{
			slot: z.ZodString;
			keywords: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			slot: string;
			keywords: string[];
		}, {
			slot: string;
			keywords: string[];
		}>, "many">>;
	}, "strip", z.ZodTypeAny, {
		type: "literal" | "context" | "did";
		slots: Record<string, any[]>;
		did?: string | undefined;
		map?: {
			slot: string;
			keywords: string[];
		}[] | undefined;
	}, {
		type: "literal" | "context" | "did";
		slots: Record<string, any[]>;
		did?: string | undefined;
		map?: {
			slot: string;
			keywords: string[];
		}[] | undefined;
	}>;
	export const ConversationSchema: z.ZodObject<{
		$id: z.ZodString;
		$agent: z.ZodString;
		$customer: z.ZodString;
		initialContexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		environment: z.ZodEnum<["phone", "email", "web"]>;
		environmentProps: z.ZodOptional<z.ZodObject<{
			subject: z.ZodOptional<z.ZodString>;
			platformEmailThreadId: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		}, {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		}>>;
		locked: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
		lockedReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		lockAttempts: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
		forwardedTo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		forwarded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		forwardNote: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		intentScore: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
		anticipate: z.ZodOptional<z.ZodObject<{
			type: z.ZodEnum<["did", "literal", "context"]>;
			slots: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodAny, "many">>;
			did: z.ZodOptional<z.ZodString>;
			map: z.ZodOptional<z.ZodArray<z.ZodObject<{
				slot: z.ZodString;
				keywords: z.ZodArray<z.ZodString, "many">;
			}, "strip", z.ZodTypeAny, {
				slot: string;
				keywords: string[];
			}, {
				slot: string;
				keywords: string[];
			}>, "many">>;
		}, "strip", z.ZodTypeAny, {
			type: "literal" | "context" | "did";
			slots: Record<string, any[]>;
			did?: string | undefined;
			map?: {
				slot: string;
				keywords: string[];
			}[] | undefined;
		}, {
			type: "literal" | "context" | "did";
			slots: Record<string, any[]>;
			did?: string | undefined;
			map?: {
				slot: string;
				keywords: string[];
			}[] | undefined;
		}>>;
		/**
		 * Whether this conversation is part of a command flow
		 */
		command: z.ZodOptional<z.ZodObject<{
			path: z.ZodString;
			entity: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			path: string;
			entity: string;
		}, {
			path: string;
			entity: string;
		}>>;
	}, "strip", z.ZodTypeAny, {
		environment: "email" | "phone" | "web";
		$id: string;
		$agent: string;
		$customer: string;
		initialContexts?: string[] | undefined;
		environmentProps?: {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		} | undefined;
		locked?: boolean | null | undefined;
		lockedReason?: string | null | undefined;
		lockAttempts?: number | null | undefined;
		forwardedTo?: string | null | undefined;
		forwarded?: string | null | undefined;
		forwardNote?: string | null | undefined;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
		anticipate?: {
			type: "literal" | "context" | "did";
			slots: Record<string, any[]>;
			did?: string | undefined;
			map?: {
				slot: string;
				keywords: string[];
			}[] | undefined;
		} | undefined;
		command?: {
			path: string;
			entity: string;
		} | undefined;
	}, {
		environment: "email" | "phone" | "web";
		$id: string;
		$agent: string;
		$customer: string;
		initialContexts?: string[] | undefined;
		environmentProps?: {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		} | undefined;
		locked?: boolean | null | undefined;
		lockedReason?: string | null | undefined;
		lockAttempts?: number | null | undefined;
		forwardedTo?: string | null | undefined;
		forwarded?: string | null | undefined;
		forwardNote?: string | null | undefined;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
		anticipate?: {
			type: "literal" | "context" | "did";
			slots: Record<string, any[]>;
			did?: string | undefined;
			map?: {
				slot: string;
				keywords: string[];
			}[] | undefined;
		} | undefined;
		command?: {
			path: string;
			entity: string;
		} | undefined;
	}>;
	/**
	 * Represents the configuration provided in src/index.{js | ts} in a project
	 */
	export const Scout9ProjectConfigSchema: z.ZodObject<{
		/**
		 * Tag to reference this application
		 * @defaut your local package.json name + version, or scout9-app-v1.0.0
		 */
		tag: z.ZodOptional<z.ZodString>;
		llm: z.ZodUnion<[z.ZodObject<{
			engine: z.ZodLiteral<"openai">;
			model: z.ZodUnion<[z.ZodLiteral<"gpt-4-1106-preview">, z.ZodLiteral<"gpt-4-vision-preview">, z.ZodLiteral<"gpt-4">, z.ZodLiteral<"gpt-4-0314">, z.ZodLiteral<"gpt-4-0613">, z.ZodLiteral<"gpt-4-32k">, z.ZodLiteral<"gpt-4-32k-0314">, z.ZodLiteral<"gpt-4-32k-0613">, z.ZodLiteral<"gpt-3.5-turbo">, z.ZodLiteral<"gpt-3.5-turbo-16k">, z.ZodLiteral<"gpt-3.5-turbo-0301">, z.ZodLiteral<"gpt-3.5-turbo-0613">, z.ZodLiteral<"gpt-3.5-turbo-16k-0613">, z.ZodString]>;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "openai";
		}, {
			model: string;
			engine: "openai";
		}>, z.ZodObject<{
			engine: z.ZodLiteral<"llama">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "llama";
		}, {
			model: string;
			engine: "llama";
		}>, z.ZodObject<{
			engine: z.ZodLiteral<"bard">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "bard";
		}, {
			model: string;
			engine: "bard";
		}>]>;
		/**
		 * Configure personal model transformer (PMT) settings to align auto replies the agent's tone
		 */
		pmt: z.ZodObject<{
			engine: z.ZodLiteral<"scout9">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "scout9";
		}, {
			model: string;
			engine: "scout9";
		}>;
		/**
		 * Determines the max auto replies without further conversation progression (defined by new context data gathered)
		 * before the conversation is locked and requires manual intervention
		 * @default 3
		 */
		maxLockAttempts: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
		initialContext: z.ZodArray<z.ZodString, "many">;
		organization: z.ZodOptional<z.ZodObject<{
			name: z.ZodString;
			description: z.ZodString;
			dashboard: z.ZodOptional<z.ZodString>;
			logo: z.ZodOptional<z.ZodString>;
			icon: z.ZodOptional<z.ZodString>;
			logos: z.ZodOptional<z.ZodString>;
			website: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		}, {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		}>>;
	}, "strip", z.ZodTypeAny, {
		initialContext: string[];
		llm: {
			model: string;
			engine: "openai";
		} | {
			model: string;
			engine: "llama";
		} | {
			model: string;
			engine: "bard";
		};
		pmt: {
			model: string;
			engine: "scout9";
		};
		tag?: string | undefined;
		maxLockAttempts?: number | undefined;
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
	}, {
		initialContext: string[];
		llm: {
			model: string;
			engine: "openai";
		} | {
			model: string;
			engine: "llama";
		} | {
			model: string;
			engine: "bard";
		};
		pmt: {
			model: string;
			engine: "scout9";
		};
		tag?: string | undefined;
		maxLockAttempts?: number | undefined;
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
	}>;
	export const Scout9ProjectBuildConfigSchema: z.ZodObject<{
		organization: z.ZodOptional<z.ZodObject<{
			name: z.ZodString;
			description: z.ZodString;
			dashboard: z.ZodOptional<z.ZodString>;
			logo: z.ZodOptional<z.ZodString>;
			icon: z.ZodOptional<z.ZodString>;
			logos: z.ZodOptional<z.ZodString>;
			website: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		}, {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		}>>;
		initialContext: z.ZodArray<z.ZodString, "many">;
		tag: z.ZodOptional<z.ZodString>;
		llm: z.ZodUnion<[z.ZodObject<{
			engine: z.ZodLiteral<"openai">;
			model: z.ZodUnion<[z.ZodLiteral<"gpt-4-1106-preview">, z.ZodLiteral<"gpt-4-vision-preview">, z.ZodLiteral<"gpt-4">, z.ZodLiteral<"gpt-4-0314">, z.ZodLiteral<"gpt-4-0613">, z.ZodLiteral<"gpt-4-32k">, z.ZodLiteral<"gpt-4-32k-0314">, z.ZodLiteral<"gpt-4-32k-0613">, z.ZodLiteral<"gpt-3.5-turbo">, z.ZodLiteral<"gpt-3.5-turbo-16k">, z.ZodLiteral<"gpt-3.5-turbo-0301">, z.ZodLiteral<"gpt-3.5-turbo-0613">, z.ZodLiteral<"gpt-3.5-turbo-16k-0613">, z.ZodString]>;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "openai";
		}, {
			model: string;
			engine: "openai";
		}>, z.ZodObject<{
			engine: z.ZodLiteral<"llama">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "llama";
		}, {
			model: string;
			engine: "llama";
		}>, z.ZodObject<{
			engine: z.ZodLiteral<"bard">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "bard";
		}, {
			model: string;
			engine: "bard";
		}>]>;
		pmt: z.ZodObject<{
			engine: z.ZodLiteral<"scout9">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "scout9";
		}, {
			model: string;
			engine: "scout9";
		}>;
		maxLockAttempts: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
		agents: z.ZodArray<z.ZodObject<{
			deployed: z.ZodOptional<z.ZodObject<{
				web: z.ZodOptional<z.ZodString>;
				phone: z.ZodOptional<z.ZodString>;
				email: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			inactive: z.ZodOptional<z.ZodBoolean>;
			isFreeProgrammablePhoneNumber: z.ZodOptional<z.ZodBoolean>;
			programmablePhoneNumber: z.ZodOptional<z.ZodString>;
			programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
			programmableEmail: z.ZodOptional<z.ZodString>;
			forwardEmail: z.ZodOptional<z.ZodString>;
			forwardPhone: z.ZodOptional<z.ZodString>;
			title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
			transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
				content: z.ZodString;
				time: z.ZodString;
				name: z.ZodOptional<z.ZodString>;
				scheduled: z.ZodOptional<z.ZodString>;
				context: z.ZodOptional<z.ZodAny>;
				intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					start: z.ZodNumber;
					end: z.ZodNumber;
					type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				}, "strip", z.ZodTypeAny, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}>, "many">>>;
				ignoreTransform: z.ZodOptional<z.ZodBoolean>;
				mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
				tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					id: z.ZodString;
					type: z.ZodString;
					function: z.ZodObject<{
						arguments: z.ZodString;
						name: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						name: string;
						arguments: string;
					}, {
						name: string;
						arguments: string;
					}>;
				}, "strip", z.ZodTypeAny, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}>, "many">>>;
				tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system" | "tool";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				entities?: {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}[] | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system" | "tool";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				entities?: {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}[] | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}>, "many">, "many">>;
			audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
			pmt: z.ZodOptional<z.ZodObject<{
				tag: z.ZodOptional<z.ZodString>;
				ingress: z.ZodEnum<["auto", "manual", "app", "workflow"]>;
				llm: z.ZodOptional<z.ZodString>;
				webhookUri: z.ZodOptional<z.ZodString>;
				watermarkEnabled: z.ZodOptional<z.ZodBoolean>;
				watermark: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				ingress: "auto" | "manual" | "app" | "workflow";
				tag?: string | undefined;
				llm?: string | undefined;
				webhookUri?: string | undefined;
				watermarkEnabled?: boolean | undefined;
				watermark?: string | undefined;
			}, {
				ingress: "auto" | "manual" | "app" | "workflow";
				tag?: string | undefined;
				llm?: string | undefined;
				webhookUri?: string | undefined;
				watermarkEnabled?: boolean | undefined;
				watermark?: string | undefined;
			}>>;
		}, "strip", z.ZodTypeAny, {
			title: string;
			context: string;
			model: "openai" | "bard" | "Scout9";
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			isFreeProgrammablePhoneNumber?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system" | "tool";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				entities?: {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}[] | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
			pmt?: {
				ingress: "auto" | "manual" | "app" | "workflow";
				tag?: string | undefined;
				llm?: string | undefined;
				webhookUri?: string | undefined;
				watermarkEnabled?: boolean | undefined;
				watermark?: string | undefined;
			} | undefined;
		}, {
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			isFreeProgrammablePhoneNumber?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			title?: string | undefined;
			context?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			model?: "openai" | "bard" | "Scout9" | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system" | "tool";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				entities?: {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}[] | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
			pmt?: {
				ingress: "auto" | "manual" | "app" | "workflow";
				tag?: string | undefined;
				llm?: string | undefined;
				webhookUri?: string | undefined;
				watermarkEnabled?: boolean | undefined;
				watermark?: string | undefined;
			} | undefined;
		}>, "many">;
		entities: z.ZodArray<z.ZodEffects<z.ZodObject<{
			type: z.ZodOptional<z.ZodEnum<["entity", "reference"]>>;
			id: z.ZodOptional<z.ZodString>;
			model: z.ZodOptional<z.ZodAny>;
			references: z.ZodOptional<z.ZodString>;
			definitions: z.ZodOptional<z.ZodArray<z.ZodObject<{
				utterance: z.ZodOptional<z.ZodString>;
				value: z.ZodString;
				text: z.ZodArray<z.ZodString, "many">;
			}, "strip", z.ZodTypeAny, {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}, {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}>, "many">>;
			training: z.ZodOptional<z.ZodArray<z.ZodObject<{
				intent: z.ZodString;
				text: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				text: string;
				intent: string;
			}, {
				text: string;
				intent: string;
			}>, "many">>;
			tests: z.ZodOptional<z.ZodArray<z.ZodObject<{
				text: z.ZodString;
				expected: z.ZodObject<{
					intent: z.ZodString;
					context: z.ZodAny;
				}, "strip", z.ZodTypeAny, {
					intent: string;
					context?: any;
				}, {
					intent: string;
					context?: any;
				}>;
			}, "strip", z.ZodTypeAny, {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}, {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}>, "many">>;
			entities: z.ZodArray<z.ZodString, "many">;
			entity: z.ZodString;
			api: z.ZodNullable<z.ZodObject<{
				GET: z.ZodOptional<z.ZodBoolean>;
				UPDATE: z.ZodOptional<z.ZodBoolean>;
				QUERY: z.ZodOptional<z.ZodBoolean>;
				PUT: z.ZodOptional<z.ZodBoolean>;
				PATCH: z.ZodOptional<z.ZodBoolean>;
				DELETE: z.ZodOptional<z.ZodBoolean>;
			}, "strip", z.ZodTypeAny, {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			}, {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			}>>;
		}, "strict", z.ZodTypeAny, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			type?: "entity" | "reference" | undefined;
			id?: string | undefined;
			model?: any;
			references?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			type?: "entity" | "reference" | undefined;
			id?: string | undefined;
			model?: any;
			references?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}>, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			type?: "entity" | "reference" | undefined;
			id?: string | undefined;
			model?: any;
			references?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			type?: "entity" | "reference" | undefined;
			id?: string | undefined;
			model?: any;
			references?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}>, "many">;
		workflows: z.ZodArray<z.ZodObject<{
			entities: z.ZodArray<z.ZodString, "many">;
			entity: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			entity: string;
			entities: string[];
		}, {
			entity: string;
			entities: string[];
		}>, "many">;
		commands: z.ZodArray<z.ZodObject<{
			path: z.ZodString;
			entity: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			path: string;
			entity: string;
		}, {
			path: string;
			entity: string;
		}>, "many">;
	}, "strip", z.ZodTypeAny, {
		agents: {
			title: string;
			context: string;
			model: "openai" | "bard" | "Scout9";
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			isFreeProgrammablePhoneNumber?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system" | "tool";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				entities?: {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}[] | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
			pmt?: {
				ingress: "auto" | "manual" | "app" | "workflow";
				tag?: string | undefined;
				llm?: string | undefined;
				webhookUri?: string | undefined;
				watermarkEnabled?: boolean | undefined;
				watermark?: string | undefined;
			} | undefined;
		}[];
		entities: {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			type?: "entity" | "reference" | undefined;
			id?: string | undefined;
			model?: any;
			references?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}[];
		initialContext: string[];
		llm: {
			model: string;
			engine: "openai";
		} | {
			model: string;
			engine: "llama";
		} | {
			model: string;
			engine: "bard";
		};
		pmt: {
			model: string;
			engine: "scout9";
		};
		workflows: {
			entity: string;
			entities: string[];
		}[];
		commands: {
			path: string;
			entity: string;
		}[];
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
		tag?: string | undefined;
		maxLockAttempts?: number | undefined;
	}, {
		agents: {
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			isFreeProgrammablePhoneNumber?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			title?: string | undefined;
			context?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			model?: "openai" | "bard" | "Scout9" | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system" | "tool";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				entities?: {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}[] | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
			pmt?: {
				ingress: "auto" | "manual" | "app" | "workflow";
				tag?: string | undefined;
				llm?: string | undefined;
				webhookUri?: string | undefined;
				watermarkEnabled?: boolean | undefined;
				watermark?: string | undefined;
			} | undefined;
		}[];
		entities: {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			type?: "entity" | "reference" | undefined;
			id?: string | undefined;
			model?: any;
			references?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}[];
		initialContext: string[];
		llm: {
			model: string;
			engine: "openai";
		} | {
			model: string;
			engine: "llama";
		} | {
			model: string;
			engine: "bard";
		};
		pmt: {
			model: string;
			engine: "scout9";
		};
		workflows: {
			entity: string;
			entities: string[];
		}[];
		commands: {
			path: string;
			entity: string;
		}[];
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
		tag?: string | undefined;
		maxLockAttempts?: number | undefined;
	}>;
	export const EntityApiConfigurationSchema: z.ZodNullable<z.ZodObject<{
		GET: z.ZodOptional<z.ZodBoolean>;
		UPDATE: z.ZodOptional<z.ZodBoolean>;
		QUERY: z.ZodOptional<z.ZodBoolean>;
		PUT: z.ZodOptional<z.ZodBoolean>;
		PATCH: z.ZodOptional<z.ZodBoolean>;
		DELETE: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		GET?: boolean | undefined;
		UPDATE?: boolean | undefined;
		QUERY?: boolean | undefined;
		PUT?: boolean | undefined;
		PATCH?: boolean | undefined;
		DELETE?: boolean | undefined;
	}, {
		GET?: boolean | undefined;
		UPDATE?: boolean | undefined;
		QUERY?: boolean | undefined;
		PUT?: boolean | undefined;
		PATCH?: boolean | undefined;
		DELETE?: boolean | undefined;
	}>>;
	export const EntityConfigurationSchema: z.ZodEffects<z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
		model: z.ZodOptional<z.ZodAny>;
		type: z.ZodOptional<z.ZodEnum<["entity", "reference"]>>;
		references: z.ZodOptional<z.ZodString>;
		definitions: z.ZodOptional<z.ZodArray<z.ZodObject<{
			utterance: z.ZodOptional<z.ZodString>;
			value: z.ZodString;
			text: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}>, "many">>;
		training: z.ZodOptional<z.ZodArray<z.ZodObject<{
			intent: z.ZodString;
			text: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			text: string;
			intent: string;
		}, {
			text: string;
			intent: string;
		}>, "many">>;
		tests: z.ZodOptional<z.ZodArray<z.ZodObject<{
			text: z.ZodString;
			expected: z.ZodObject<{
				intent: z.ZodString;
				context: z.ZodAny;
			}, "strip", z.ZodTypeAny, {
				intent: string;
				context?: any;
			}, {
				intent: string;
				context?: any;
			}>;
		}, "strip", z.ZodTypeAny, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}>, "many">>;
	}, "strict", z.ZodTypeAny, {
		id?: string | undefined;
		model?: any;
		type?: "entity" | "reference" | undefined;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		id?: string | undefined;
		model?: any;
		type?: "entity" | "reference" | undefined;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>, {
		id?: string | undefined;
		model?: any;
		type?: "entity" | "reference" | undefined;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		id?: string | undefined;
		model?: any;
		type?: "entity" | "reference" | undefined;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>;
	export const EntitiesRootConfigurationSchema: z.ZodArray<z.ZodEffects<z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
		model: z.ZodOptional<z.ZodAny>;
		type: z.ZodOptional<z.ZodEnum<["entity", "reference"]>>;
		references: z.ZodOptional<z.ZodString>;
		definitions: z.ZodOptional<z.ZodArray<z.ZodObject<{
			utterance: z.ZodOptional<z.ZodString>;
			value: z.ZodString;
			text: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}>, "many">>;
		training: z.ZodOptional<z.ZodArray<z.ZodObject<{
			intent: z.ZodString;
			text: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			text: string;
			intent: string;
		}, {
			text: string;
			intent: string;
		}>, "many">>;
		tests: z.ZodOptional<z.ZodArray<z.ZodObject<{
			text: z.ZodString;
			expected: z.ZodObject<{
				intent: z.ZodString;
				context: z.ZodAny;
			}, "strip", z.ZodTypeAny, {
				intent: string;
				context?: any;
			}, {
				intent: string;
				context?: any;
			}>;
		}, "strip", z.ZodTypeAny, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}>, "many">>;
	}, "strict", z.ZodTypeAny, {
		id?: string | undefined;
		model?: any;
		type?: "entity" | "reference" | undefined;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		id?: string | undefined;
		model?: any;
		type?: "entity" | "reference" | undefined;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>, {
		id?: string | undefined;
		model?: any;
		type?: "entity" | "reference" | undefined;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		id?: string | undefined;
		model?: any;
		type?: "entity" | "reference" | undefined;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>, "many">;
	/**
	 * @TODO why type extend not valid?
	 */
	export const EntityRootProjectConfigurationSchema: z.ZodEffects<z.ZodObject<{
		type: z.ZodOptional<z.ZodEnum<["entity", "reference"]>>;
		id: z.ZodOptional<z.ZodString>;
		model: z.ZodOptional<z.ZodAny>;
		references: z.ZodOptional<z.ZodString>;
		definitions: z.ZodOptional<z.ZodArray<z.ZodObject<{
			utterance: z.ZodOptional<z.ZodString>;
			value: z.ZodString;
			text: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}>, "many">>;
		training: z.ZodOptional<z.ZodArray<z.ZodObject<{
			intent: z.ZodString;
			text: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			text: string;
			intent: string;
		}, {
			text: string;
			intent: string;
		}>, "many">>;
		tests: z.ZodOptional<z.ZodArray<z.ZodObject<{
			text: z.ZodString;
			expected: z.ZodObject<{
				intent: z.ZodString;
				context: z.ZodAny;
			}, "strip", z.ZodTypeAny, {
				intent: string;
				context?: any;
			}, {
				intent: string;
				context?: any;
			}>;
		}, "strip", z.ZodTypeAny, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}>, "many">>;
		entities: z.ZodArray<z.ZodString, "many">;
		entity: z.ZodString;
		api: z.ZodNullable<z.ZodObject<{
			GET: z.ZodOptional<z.ZodBoolean>;
			UPDATE: z.ZodOptional<z.ZodBoolean>;
			QUERY: z.ZodOptional<z.ZodBoolean>;
			PUT: z.ZodOptional<z.ZodBoolean>;
			PATCH: z.ZodOptional<z.ZodBoolean>;
			DELETE: z.ZodOptional<z.ZodBoolean>;
		}, "strip", z.ZodTypeAny, {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		}, {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		}>>;
	}, "strict", z.ZodTypeAny, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		type?: "entity" | "reference" | undefined;
		id?: string | undefined;
		model?: any;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		type?: "entity" | "reference" | undefined;
		id?: string | undefined;
		model?: any;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		type?: "entity" | "reference" | undefined;
		id?: string | undefined;
		model?: any;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		type?: "entity" | "reference" | undefined;
		id?: string | undefined;
		model?: any;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>;
	export const EntitiesRootProjectConfigurationSchema: z.ZodArray<z.ZodEffects<z.ZodObject<{
		type: z.ZodOptional<z.ZodEnum<["entity", "reference"]>>;
		id: z.ZodOptional<z.ZodString>;
		model: z.ZodOptional<z.ZodAny>;
		references: z.ZodOptional<z.ZodString>;
		definitions: z.ZodOptional<z.ZodArray<z.ZodObject<{
			utterance: z.ZodOptional<z.ZodString>;
			value: z.ZodString;
			text: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}>, "many">>;
		training: z.ZodOptional<z.ZodArray<z.ZodObject<{
			intent: z.ZodString;
			text: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			text: string;
			intent: string;
		}, {
			text: string;
			intent: string;
		}>, "many">>;
		tests: z.ZodOptional<z.ZodArray<z.ZodObject<{
			text: z.ZodString;
			expected: z.ZodObject<{
				intent: z.ZodString;
				context: z.ZodAny;
			}, "strip", z.ZodTypeAny, {
				intent: string;
				context?: any;
			}, {
				intent: string;
				context?: any;
			}>;
		}, "strip", z.ZodTypeAny, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}>, "many">>;
		entities: z.ZodArray<z.ZodString, "many">;
		entity: z.ZodString;
		api: z.ZodNullable<z.ZodObject<{
			GET: z.ZodOptional<z.ZodBoolean>;
			UPDATE: z.ZodOptional<z.ZodBoolean>;
			QUERY: z.ZodOptional<z.ZodBoolean>;
			PUT: z.ZodOptional<z.ZodBoolean>;
			PATCH: z.ZodOptional<z.ZodBoolean>;
			DELETE: z.ZodOptional<z.ZodBoolean>;
		}, "strip", z.ZodTypeAny, {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		}, {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		}>>;
	}, "strict", z.ZodTypeAny, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		type?: "entity" | "reference" | undefined;
		id?: string | undefined;
		model?: any;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		type?: "entity" | "reference" | undefined;
		id?: string | undefined;
		model?: any;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		type?: "entity" | "reference" | undefined;
		id?: string | undefined;
		model?: any;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		type?: "entity" | "reference" | undefined;
		id?: string | undefined;
		model?: any;
		references?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>, "many">;
	export const apiFunctionSchema: z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		params: z.ZodRecord<z.ZodString, z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>;
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;
	export const queryApiFunctionSchema: z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		params: z.ZodRecord<z.ZodString, z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>;
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;
	export const getApiFunctionSchema: z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		params: z.ZodRecord<z.ZodString, z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>;
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;
	export function postApiFunctionSchema(requestBodySchema: any): z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		params: z.ZodRecord<z.ZodString, z.ZodString>;
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		body: any;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
		body?: any;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
		body?: any;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>;
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;
	export function putApiFunctionSchema(requestBodySchema: any): z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		params: z.ZodRecord<z.ZodString, z.ZodString>;
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		body: any;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
		body?: any;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
		body?: any;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>;
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;
	export function patchApiFunctionSchema(requestBodySchema: any): z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		params: z.ZodRecord<z.ZodString, z.ZodString>;
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		body: any;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
		body?: any;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
		body?: any;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>;
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;
	export const deleteApiFunctionSchema: z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		params: z.ZodRecord<z.ZodString, z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>;
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;
	export const ContextExampleWithTrainingDataSchema: z.ZodObject<{
		input: z.ZodString;
		output: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">;
	}, "strip", z.ZodTypeAny, {
		input: string;
		output: Record<string, any>[];
	}, {
		input: string;
		output: Record<string, any>[];
	}>;
	export const ContextExampleSchema: z.ZodUnion<[z.ZodArray<z.ZodObject<{
		input: z.ZodString;
		output: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">;
	}, "strip", z.ZodTypeAny, {
		input: string;
		output: Record<string, any>[];
	}, {
		input: string;
		output: Record<string, any>[];
	}>, "many">, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">]>;
	export const MessageEntitySchema: z.ZodObject<{
		start: z.ZodNumber;
		end: z.ZodNumber;
		type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
	}, "strip", z.ZodTypeAny, {
		end: number;
		start: number;
		type?: string | null | undefined;
		option?: string | null | undefined;
		text?: string | null | undefined;
	}, {
		end: number;
		start: number;
		type?: string | null | undefined;
		option?: string | null | undefined;
		text?: string | null | undefined;
	}>;
	/**
	 * Follows @scout9/admin Message
	 */
	export const MessageSchema: z.ZodObject<{
		id: z.ZodString;
		role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
		content: z.ZodString;
		time: z.ZodString;
		name: z.ZodOptional<z.ZodString>;
		scheduled: z.ZodOptional<z.ZodString>;
		context: z.ZodOptional<z.ZodAny>;
		intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
			start: z.ZodNumber;
			end: z.ZodNumber;
			type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			end: number;
			start: number;
			type?: string | null | undefined;
			option?: string | null | undefined;
			text?: string | null | undefined;
		}, {
			end: number;
			start: number;
			type?: string | null | undefined;
			option?: string | null | undefined;
			text?: string | null | undefined;
		}>, "many">>>;
		ignoreTransform: z.ZodOptional<z.ZodBoolean>;
		mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
		tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			type: z.ZodString;
			function: z.ZodObject<{
				arguments: z.ZodString;
				name: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				name: string;
				arguments: string;
			}, {
				name: string;
				arguments: string;
			}>;
		}, "strip", z.ZodTypeAny, {
			function: {
				name: string;
				arguments: string;
			};
			type: string;
			id: string;
		}, {
			function: {
				name: string;
				arguments: string;
			};
			type: string;
			id: string;
		}>, "many">>>;
		tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
	}, "strip", z.ZodTypeAny, {
		time: string;
		id: string;
		content: string;
		role: "agent" | "customer" | "system" | "tool";
		name?: string | undefined;
		scheduled?: string | undefined;
		context?: any;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
		delayInSeconds?: number | null | undefined;
		entities?: {
			end: number;
			start: number;
			type?: string | null | undefined;
			option?: string | null | undefined;
			text?: string | null | undefined;
		}[] | null | undefined;
		ignoreTransform?: boolean | undefined;
		mediaUrls?: string[] | null | undefined;
		tool_calls?: {
			function: {
				name: string;
				arguments: string;
			};
			type: string;
			id: string;
		}[] | null | undefined;
		tool_call_id?: string | null | undefined;
	}, {
		time: string;
		id: string;
		content: string;
		role: "agent" | "customer" | "system" | "tool";
		name?: string | undefined;
		scheduled?: string | undefined;
		context?: any;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
		delayInSeconds?: number | null | undefined;
		entities?: {
			end: number;
			start: number;
			type?: string | null | undefined;
			option?: string | null | undefined;
			text?: string | null | undefined;
		}[] | null | undefined;
		ignoreTransform?: boolean | undefined;
		mediaUrls?: string[] | null | undefined;
		tool_calls?: {
			function: {
				name: string;
				arguments: string;
			};
			type: string;
			id: string;
		}[] | null | undefined;
		tool_call_id?: string | null | undefined;
	}>;
	export const CustomerValueSchema: z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>;
	export const CustomerSchema: z.ZodObject<{
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		name: z.ZodString;
		email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
	}, "strip", z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>, z.objectOutputType<{
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		name: z.ZodString;
		email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
	}, z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>, "strip">, z.objectInputType<{
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		name: z.ZodString;
		email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
	}, z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>, "strip">>;
	export const AgentSchema: z.ZodObject<{
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		inactive: z.ZodOptional<z.ZodBoolean>;
		isFreeProgrammablePhoneNumber: z.ZodOptional<z.ZodBoolean>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>;
			ignoreTransform: z.ZodOptional<z.ZodBoolean>;
			mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
			tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>;
			tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		pmt: z.ZodOptional<z.ZodObject<{
			tag: z.ZodOptional<z.ZodString>;
			ingress: z.ZodEnum<["auto", "manual", "app", "workflow"]>;
			llm: z.ZodOptional<z.ZodString>;
			webhookUri: z.ZodOptional<z.ZodString>;
			watermarkEnabled: z.ZodOptional<z.ZodBoolean>;
			watermark: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}>>;
	}, "strip", z.ZodTypeAny, {
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}, {
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		title?: string | undefined;
		context?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}>;
	export const PersonaSchema: z.ZodObject<{
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		inactive: z.ZodOptional<z.ZodBoolean>;
		isFreeProgrammablePhoneNumber: z.ZodOptional<z.ZodBoolean>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>;
			ignoreTransform: z.ZodOptional<z.ZodBoolean>;
			mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
			tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>;
			tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		pmt: z.ZodOptional<z.ZodObject<{
			tag: z.ZodOptional<z.ZodString>;
			ingress: z.ZodEnum<["auto", "manual", "app", "workflow"]>;
			llm: z.ZodOptional<z.ZodString>;
			webhookUri: z.ZodOptional<z.ZodString>;
			watermarkEnabled: z.ZodOptional<z.ZodBoolean>;
			watermark: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}>>;
	}, "strip", z.ZodTypeAny, {
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}, {
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		title?: string | undefined;
		context?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}>;
	export const AgentConfigurationSchema: z.ZodObject<{
		inactive: z.ZodOptional<z.ZodBoolean>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		isFreeProgrammablePhoneNumber: z.ZodOptional<z.ZodBoolean>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>;
			ignoreTransform: z.ZodOptional<z.ZodBoolean>;
			mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
			tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>;
			tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		pmt: z.ZodOptional<z.ZodObject<{
			tag: z.ZodOptional<z.ZodString>;
			ingress: z.ZodEnum<["auto", "manual", "app", "workflow"]>;
			llm: z.ZodOptional<z.ZodString>;
			webhookUri: z.ZodOptional<z.ZodString>;
			watermarkEnabled: z.ZodOptional<z.ZodBoolean>;
			watermark: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}>>;
		id: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		id: string;
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		inactive?: boolean | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}, {
		id: string;
		inactive?: boolean | undefined;
		img?: string | null | undefined;
		title?: string | undefined;
		context?: string | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}>;
	export const PersonaConfigurationSchema: z.ZodObject<{
		inactive: z.ZodOptional<z.ZodBoolean>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		isFreeProgrammablePhoneNumber: z.ZodOptional<z.ZodBoolean>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>;
			ignoreTransform: z.ZodOptional<z.ZodBoolean>;
			mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
			tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>;
			tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		pmt: z.ZodOptional<z.ZodObject<{
			tag: z.ZodOptional<z.ZodString>;
			ingress: z.ZodEnum<["auto", "manual", "app", "workflow"]>;
			llm: z.ZodOptional<z.ZodString>;
			webhookUri: z.ZodOptional<z.ZodString>;
			watermarkEnabled: z.ZodOptional<z.ZodBoolean>;
			watermark: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}>>;
		id: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		id: string;
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		inactive?: boolean | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}, {
		id: string;
		inactive?: boolean | undefined;
		img?: string | null | undefined;
		title?: string | undefined;
		context?: string | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}>;
	export const AgentsConfigurationSchema: z.ZodArray<z.ZodObject<{
		inactive: z.ZodOptional<z.ZodBoolean>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		isFreeProgrammablePhoneNumber: z.ZodOptional<z.ZodBoolean>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>;
			ignoreTransform: z.ZodOptional<z.ZodBoolean>;
			mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
			tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>;
			tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		pmt: z.ZodOptional<z.ZodObject<{
			tag: z.ZodOptional<z.ZodString>;
			ingress: z.ZodEnum<["auto", "manual", "app", "workflow"]>;
			llm: z.ZodOptional<z.ZodString>;
			webhookUri: z.ZodOptional<z.ZodString>;
			watermarkEnabled: z.ZodOptional<z.ZodBoolean>;
			watermark: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}>>;
		id: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		id: string;
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		inactive?: boolean | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}, {
		id: string;
		inactive?: boolean | undefined;
		img?: string | null | undefined;
		title?: string | undefined;
		context?: string | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}>, "many">;
	export const PersonasConfigurationSchema: z.ZodArray<z.ZodObject<{
		inactive: z.ZodOptional<z.ZodBoolean>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		isFreeProgrammablePhoneNumber: z.ZodOptional<z.ZodBoolean>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>;
			ignoreTransform: z.ZodOptional<z.ZodBoolean>;
			mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
			tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>;
			tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		pmt: z.ZodOptional<z.ZodObject<{
			tag: z.ZodOptional<z.ZodString>;
			ingress: z.ZodEnum<["auto", "manual", "app", "workflow"]>;
			llm: z.ZodOptional<z.ZodString>;
			webhookUri: z.ZodOptional<z.ZodString>;
			watermarkEnabled: z.ZodOptional<z.ZodBoolean>;
			watermark: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}>>;
		id: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		id: string;
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		inactive?: boolean | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}, {
		id: string;
		inactive?: boolean | undefined;
		img?: string | null | undefined;
		title?: string | undefined;
		context?: string | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}>, "many">;
	export const AgentsSchema: z.ZodArray<z.ZodObject<{
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		inactive: z.ZodOptional<z.ZodBoolean>;
		isFreeProgrammablePhoneNumber: z.ZodOptional<z.ZodBoolean>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>;
			ignoreTransform: z.ZodOptional<z.ZodBoolean>;
			mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
			tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>;
			tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		pmt: z.ZodOptional<z.ZodObject<{
			tag: z.ZodOptional<z.ZodString>;
			ingress: z.ZodEnum<["auto", "manual", "app", "workflow"]>;
			llm: z.ZodOptional<z.ZodString>;
			webhookUri: z.ZodOptional<z.ZodString>;
			watermarkEnabled: z.ZodOptional<z.ZodBoolean>;
			watermark: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}>>;
	}, "strip", z.ZodTypeAny, {
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}, {
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		title?: string | undefined;
		context?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}>, "many">;
	export const PersonasSchema: z.ZodArray<z.ZodObject<{
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		inactive: z.ZodOptional<z.ZodBoolean>;
		isFreeProgrammablePhoneNumber: z.ZodOptional<z.ZodBoolean>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>;
			ignoreTransform: z.ZodOptional<z.ZodBoolean>;
			mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
			tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>;
			tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		pmt: z.ZodOptional<z.ZodObject<{
			tag: z.ZodOptional<z.ZodString>;
			ingress: z.ZodEnum<["auto", "manual", "app", "workflow"]>;
			llm: z.ZodOptional<z.ZodString>;
			webhookUri: z.ZodOptional<z.ZodString>;
			watermarkEnabled: z.ZodOptional<z.ZodBoolean>;
			watermark: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}, {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		}>>;
	}, "strip", z.ZodTypeAny, {
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}, {
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		isFreeProgrammablePhoneNumber?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		title?: string | undefined;
		context?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		pmt?: {
			ingress: "auto" | "manual" | "app" | "workflow";
			tag?: string | undefined;
			llm?: string | undefined;
			webhookUri?: string | undefined;
			watermarkEnabled?: boolean | undefined;
			watermark?: string | undefined;
		} | undefined;
	}>, "many">;
	export const ForwardSchema: z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
		to: z.ZodOptional<z.ZodString>;
		mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
		note: z.ZodOptional<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		to?: string | undefined;
		mode?: "after-reply" | "immediately" | undefined;
		note?: string | undefined;
	}, {
		to?: string | undefined;
		mode?: "after-reply" | "immediately" | undefined;
		note?: string | undefined;
	}>]>;
	export const InstructionObjectSchema: z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
		persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
		content: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		content: string;
		id?: string | undefined;
		persist?: boolean | undefined;
	}, {
		content: string;
		id?: string | undefined;
		persist?: boolean | undefined;
	}>;
	export const WorkflowResponseMessageApiRequest: z.ZodObject<{
		uri: z.ZodString;
		data: z.ZodOptional<z.ZodAny>;
		headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
		method: z.ZodOptional<z.ZodEnum<["GET", "POST", "PUT"]>>;
	}, "strip", z.ZodTypeAny, {
		uri: string;
		data?: any;
		headers?: Record<string, string> | undefined;
		method?: "GET" | "POST" | "PUT" | undefined;
	}, {
		uri: string;
		data?: any;
		headers?: Record<string, string> | undefined;
		method?: "GET" | "POST" | "PUT" | undefined;
	}>;
	/**
	 * If its a string, it will be sent as a static string.
	 * If it's a object or WorkflowResponseMessageAPI - it will use
	 */
	export const WorkflowResponseMessage: z.ZodUnion<[z.ZodString, z.ZodObject<{
		uri: z.ZodString;
		data: z.ZodOptional<z.ZodAny>;
		headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
		method: z.ZodOptional<z.ZodEnum<["GET", "POST", "PUT"]>>;
	}, "strip", z.ZodTypeAny, {
		uri: string;
		data?: any;
		headers?: Record<string, string> | undefined;
		method?: "GET" | "POST" | "PUT" | undefined;
	}, {
		uri: string;
		data?: any;
		headers?: Record<string, string> | undefined;
		method?: "GET" | "POST" | "PUT" | undefined;
	}>]>;
	/**
	 * The intended response provided by the WorkflowResponseMessageApiRequest
	 */
	export const WorkflowResponseMessageApiResponse: z.ZodUnion<[z.ZodString, z.ZodObject<{
		message: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		message: string;
	}, {
		message: string;
	}>, z.ZodObject<{
		text: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		text: string;
	}, {
		text: string;
	}>, z.ZodObject<{
		data: z.ZodObject<{
			message: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			message: string;
		}, {
			message: string;
		}>;
	}, "strip", z.ZodTypeAny, {
		data: {
			message: string;
		};
	}, {
		data: {
			message: string;
		};
	}>, z.ZodObject<{
		data: z.ZodObject<{
			text: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			text: string;
		}, {
			text: string;
		}>;
	}, "strip", z.ZodTypeAny, {
		data: {
			text: string;
		};
	}, {
		data: {
			text: string;
		};
	}>]>;
	/**
	 * The workflow response object slot
	 */
	export const InstructionSchema: z.ZodUnion<[z.ZodString, z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
		persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
		content: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		content: string;
		id?: string | undefined;
		persist?: boolean | undefined;
	}, {
		content: string;
		id?: string | undefined;
		persist?: boolean | undefined;
	}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
		persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
		content: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		content: string;
		id?: string | undefined;
		persist?: boolean | undefined;
	}, {
		content: string;
		id?: string | undefined;
		persist?: boolean | undefined;
	}>]>, "many">]>;
	/**
	 * Base follow up schema to follow up with the client
	 */
	export const FollowupBaseSchema: z.ZodObject<{
		scheduled: z.ZodNumber;
		cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
		overrideLock: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		scheduled: number;
		cancelIf?: Record<string, any> | undefined;
		overrideLock?: boolean | undefined;
	}, {
		scheduled: number;
		cancelIf?: Record<string, any> | undefined;
		overrideLock?: boolean | undefined;
	}>;
	/**
	 * Data used to automatically follow up with the client in the future
	 */
	export const FollowupSchema: z.ZodUnion<[z.ZodObject<{
		scheduled: z.ZodNumber;
		cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
		overrideLock: z.ZodOptional<z.ZodBoolean>;
		message: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		message: string;
		scheduled: number;
		cancelIf?: Record<string, any> | undefined;
		overrideLock?: boolean | undefined;
	}, {
		message: string;
		scheduled: number;
		cancelIf?: Record<string, any> | undefined;
		overrideLock?: boolean | undefined;
	}>, z.ZodObject<{
		scheduled: z.ZodNumber;
		cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
		overrideLock: z.ZodOptional<z.ZodBoolean>;
		instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>]>, "many">]>;
	}, "strip", z.ZodTypeAny, {
		scheduled: number;
		instructions: (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[]) & (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined);
		cancelIf?: Record<string, any> | undefined;
		overrideLock?: boolean | undefined;
	}, {
		scheduled: number;
		instructions: (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[]) & (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined);
		cancelIf?: Record<string, any> | undefined;
		overrideLock?: boolean | undefined;
	}>]>;
	export const WorkflowConfigurationSchema: z.ZodObject<{
		entities: z.ZodArray<z.ZodString, "many">;
		entity: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		entity: string;
		entities: string[];
	}, {
		entity: string;
		entities: string[];
	}>;
	export const WorkflowsConfigurationSchema: z.ZodArray<z.ZodObject<{
		entities: z.ZodArray<z.ZodString, "many">;
		entity: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		entity: string;
		entities: string[];
	}, {
		entity: string;
		entities: string[];
	}>, "many">;
	export const IntentWorkflowEventSchema: z.ZodObject<{
		current: z.ZodNullable<z.ZodString>;
		flow: z.ZodArray<z.ZodString, "many">;
		initial: z.ZodNullable<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		current: string | null;
		flow: string[];
		initial: string | null;
	}, {
		current: string | null;
		flow: string[];
		initial: string | null;
	}>;
	export const WorkflowEventSchema: z.ZodObject<{
		messages: z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>;
			ignoreTransform: z.ZodOptional<z.ZodBoolean>;
			mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
			tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>;
			tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>, "many">;
		conversation: z.ZodObject<{
			$id: z.ZodString;
			$agent: z.ZodString;
			$customer: z.ZodString;
			initialContexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			environment: z.ZodEnum<["phone", "email", "web"]>; /**
			 * An api call that should be called later, must return a string or {message: string}
			 */
			environmentProps: z.ZodOptional<z.ZodObject<{
				subject: z.ZodOptional<z.ZodString>;
				platformEmailThreadId: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			}, {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			}>>;
			locked: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
			lockedReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			lockAttempts: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
			forwardedTo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			forwarded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			forwardNote: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
			anticipate: z.ZodOptional<z.ZodObject<{
				type: z.ZodEnum<["did", "literal", "context"]>;
				slots: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodAny, "many">>;
				did: z.ZodOptional<z.ZodString>;
				map: z.ZodOptional<z.ZodArray<z.ZodObject<{
					slot: z.ZodString;
					keywords: z.ZodArray<z.ZodString, "many">;
				}, "strip", z.ZodTypeAny, {
					slot: string;
					keywords: string[];
				}, {
					slot: string;
					keywords: string[];
				}>, "many">>;
			}, "strip", z.ZodTypeAny, {
				type: "literal" | "context" | "did";
				slots: Record<string, any[]>;
				did?: string | undefined;
				map?: {
					slot: string;
					keywords: string[];
				}[] | undefined;
			}, {
				type: "literal" | "context" | "did";
				slots: Record<string, any[]>;
				did?: string | undefined;
				map?: {
					slot: string;
					keywords: string[];
				}[] | undefined;
			}>>;
			command: z.ZodOptional<z.ZodObject<{
				path: z.ZodString;
				entity: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				path: string;
				entity: string;
			}, {
				path: string;
				entity: string;
			}>>;
		}, "strip", z.ZodTypeAny, {
			environment: "email" | "phone" | "web";
			$id: string;
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			anticipate?: {
				type: "literal" | "context" | "did";
				slots: Record<string, any[]>;
				did?: string | undefined;
				map?: {
					slot: string;
					keywords: string[];
				}[] | undefined;
			} | undefined;
			command?: {
				path: string;
				entity: string;
			} | undefined;
		}, {
			environment: "email" | "phone" | "web";
			$id: string;
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			anticipate?: {
				type: "literal" | "context" | "did";
				slots: Record<string, any[]>;
				did?: string | undefined;
				map?: {
					slot: string;
					keywords: string[];
				}[] | undefined;
			} | undefined;
			command?: {
				path: string;
				entity: string;
			} | undefined;
		}>;
		context: z.ZodAny;
		message: z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>;
			ignoreTransform: z.ZodOptional<z.ZodBoolean>;
			mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
			tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>;
			tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>;
		agent: z.ZodObject<Omit<{
			inactive: z.ZodOptional<z.ZodBoolean>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			deployed: z.ZodOptional<z.ZodObject<{
				web: z.ZodOptional<z.ZodString>;
				phone: z.ZodOptional<z.ZodString>;
				email: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}>>;
			isFreeProgrammablePhoneNumber: z.ZodOptional<z.ZodBoolean>;
			programmablePhoneNumber: z.ZodOptional<z.ZodString>;
			programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
			programmableEmail: z.ZodOptional<z.ZodString>;
			forwardEmail: z.ZodOptional<z.ZodString>;
			forwardPhone: z.ZodOptional<z.ZodString>;
			includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
			transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
				content: z.ZodString;
				time: z.ZodString;
				name: z.ZodOptional<z.ZodString>;
				scheduled: z.ZodOptional<z.ZodString>;
				context: z.ZodOptional<z.ZodAny>;
				intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					start: z.ZodNumber;
					end: z.ZodNumber;
					type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				}, "strip", z.ZodTypeAny, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}>, "many">>>;
				ignoreTransform: z.ZodOptional<z.ZodBoolean>;
				mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
				tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					id: z.ZodString;
					type: z.ZodString;
					function: z.ZodObject<{
						arguments: z.ZodString;
						name: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						name: string;
						arguments: string;
					}, {
						name: string;
						arguments: string;
					}>;
				}, "strip", z.ZodTypeAny, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}>, "many">>>;
				tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system" | "tool";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				entities?: {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}[] | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system" | "tool";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				entities?: {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}[] | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}>, "many">, "many">>;
			audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
			pmt: z.ZodOptional<z.ZodObject<{
				tag: z.ZodOptional<z.ZodString>;
				ingress: z.ZodEnum<["auto", "manual", "app", "workflow"]>;
				llm: z.ZodOptional<z.ZodString>;
				webhookUri: z.ZodOptional<z.ZodString>;
				watermarkEnabled: z.ZodOptional<z.ZodBoolean>;
				watermark: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				ingress: "auto" | "manual" | "app" | "workflow";
				tag?: string | undefined;
				llm?: string | undefined;
				webhookUri?: string | undefined;
				watermarkEnabled?: boolean | undefined;
				watermark?: string | undefined;
			}, {
				ingress: "auto" | "manual" | "app" | "workflow";
				tag?: string | undefined;
				llm?: string | undefined;
				webhookUri?: string | undefined;
				watermarkEnabled?: boolean | undefined;
				watermark?: string | undefined;
			}>>;
			id: z.ZodString;
		}, "context" | "includedLocations" | "excludedLocations" | "model" | "transcripts" | "audios" | "pmt">, "strip", z.ZodTypeAny, {
			id: string;
			title: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			isFreeProgrammablePhoneNumber?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}, {
			id: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			title?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			isFreeProgrammablePhoneNumber?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}>;
		customer: z.ZodObject<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, "strip", z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>, z.objectOutputType<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>, "strip">, z.objectInputType<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>, "strip">>;
		intent: z.ZodObject<{
			current: z.ZodNullable<z.ZodString>;
			flow: z.ZodArray<z.ZodString, "many">;
			initial: z.ZodNullable<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			current: string | null;
			flow: string[];
			initial: string | null;
		}, {
			current: string | null;
			flow: string[];
			initial: string | null;
		}>;
		stagnationCount: z.ZodNumber;
		note: z.ZodOptional<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		message: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		};
		agent: {
			id: string;
			title: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			isFreeProgrammablePhoneNumber?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		};
		customer: {
			name: string;
			firstName?: string | undefined;
			lastName?: string | undefined;
			email?: string | null | undefined;
			phone?: string | null | undefined;
			img?: string | null | undefined;
			neighborhood?: string | null | undefined;
			city?: string | null | undefined;
			country?: string | null | undefined;
			line1?: string | null | undefined;
			line2?: string | null | undefined;
			postal_code?: string | null | undefined;
			state?: string | null | undefined;
			town?: string | null | undefined;
			joined?: string | null | undefined;
			stripe?: string | null | undefined;
			stripeDev?: string | null | undefined;
		} & {
			[k: string]: string | number | boolean | undefined;
		};
		intent: {
			current: string | null;
			flow: string[];
			initial: string | null;
		};
		messages: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[];
		conversation: {
			environment: "email" | "phone" | "web";
			$id: string;
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			anticipate?: {
				type: "literal" | "context" | "did";
				slots: Record<string, any[]>;
				did?: string | undefined;
				map?: {
					slot: string;
					keywords: string[];
				}[] | undefined;
			} | undefined;
			command?: {
				path: string;
				entity: string;
			} | undefined;
		};
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}, {
		message: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		};
		agent: {
			id: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			title?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			isFreeProgrammablePhoneNumber?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		};
		customer: {
			name: string;
			firstName?: string | undefined;
			lastName?: string | undefined;
			email?: string | null | undefined;
			phone?: string | null | undefined;
			img?: string | null | undefined;
			neighborhood?: string | null | undefined;
			city?: string | null | undefined;
			country?: string | null | undefined;
			line1?: string | null | undefined;
			line2?: string | null | undefined;
			postal_code?: string | null | undefined;
			state?: string | null | undefined;
			town?: string | null | undefined;
			joined?: string | null | undefined;
			stripe?: string | null | undefined;
			stripeDev?: string | null | undefined;
		} & {
			[k: string]: string | number | boolean | undefined;
		};
		intent: {
			current: string | null;
			flow: string[];
			initial: string | null;
		};
		messages: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[];
		conversation: {
			environment: "email" | "phone" | "web";
			$id: string;
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			anticipate?: {
				type: "literal" | "context" | "did";
				slots: Record<string, any[]>;
				did?: string | undefined;
				map?: {
					slot: string;
					keywords: string[];
				}[] | undefined;
			} | undefined;
			command?: {
				path: string;
				entity: string;
			} | undefined;
		};
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}>;
	export const DirectMessageSchema: z.ZodObject<Omit<{
		id: z.ZodOptional<z.ZodString>;
		role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
		content: z.ZodOptional<z.ZodString>;
		time: z.ZodOptional<z.ZodString>;
		name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
		scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
		context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
		intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
		intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
		delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
		entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
			start: z.ZodNumber;
			end: z.ZodNumber;
			type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			end: number;
			start: number;
			type?: string | null | undefined;
			option?: string | null | undefined;
			text?: string | null | undefined;
		}, {
			end: number;
			start: number;
			type?: string | null | undefined;
			option?: string | null | undefined;
			text?: string | null | undefined;
		}>, "many">>>>;
		ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
		mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
		tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			type: z.ZodString;
			function: z.ZodObject<{
				arguments: z.ZodString;
				name: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				name: string;
				arguments: string;
			}, {
				name: string;
				arguments: string;
			}>;
		}, "strip", z.ZodTypeAny, {
			function: {
				name: string;
				arguments: string;
			};
			type: string;
			id: string;
		}, {
			function: {
				name: string;
				arguments: string;
			};
			type: string;
			id: string;
		}>, "many">>>>;
		tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
	}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
		name?: string | undefined;
		content?: string | undefined;
		context?: any;
		scheduled?: string | undefined;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
		delayInSeconds?: number | null | undefined;
		ignoreTransform?: boolean | undefined;
		mediaUrls?: string[] | null | undefined;
		tool_calls?: {
			function: {
				name: string;
				arguments: string;
			};
			type: string;
			id: string;
		}[] | null | undefined;
		tool_call_id?: string | null | undefined;
	}, {
		name?: string | undefined;
		content?: string | undefined;
		context?: any;
		scheduled?: string | undefined;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
		delayInSeconds?: number | null | undefined;
		ignoreTransform?: boolean | undefined;
		mediaUrls?: string[] | null | undefined;
		tool_calls?: {
			function: {
				name: string;
				arguments: string;
			};
			type: string;
			id: string;
		}[] | null | undefined;
		tool_call_id?: string | null | undefined;
	}>;
	/**
	 * The workflow response object slot
	 */
	export const WorkflowResponseSlotBaseSchema: z.ZodObject<{
		contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
		followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			message: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>, z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>;
		}, "strip", z.ZodTypeAny, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>]>>;
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>]>, "many">]>>;
		message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
			id: z.ZodOptional<z.ZodString>;
			role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
			content: z.ZodOptional<z.ZodString>;
			time: z.ZodOptional<z.ZodString>;
			name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
			intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>>;
			ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
			mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
			tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>>;
			tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
		}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
	}, "strip", z.ZodTypeAny, {
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
	}, {
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
	}>;
	export const EntityContextUpsertSchema: z.ZodDiscriminatedUnion<"method", [z.ZodObject<{
		entityType: z.ZodString;
		entityRecordId: z.ZodString;
		method: z.ZodLiteral<"delete">;
	}, "strip", z.ZodTypeAny, {
		method: "delete";
		entityType: string;
		entityRecordId: string;
	}, {
		method: "delete";
		entityType: string;
		entityRecordId: string;
	}>, z.ZodObject<{
		entityType: z.ZodString;
		entityRecordId: z.ZodString;
		method: z.ZodLiteral<"mutate">;
		fields: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodLiteral<"#remove">, z.ZodLiteral<"#delete">]>>;
	}, "strip", z.ZodTypeAny, {
		method: "mutate";
		entityType: string;
		entityRecordId: string;
		fields: Record<string, string | number | boolean | null>;
	}, {
		method: "mutate";
		entityType: string;
		entityRecordId: string;
		fields: Record<string, string | number | boolean | null>;
	}>]>;
	/**
	 * The workflow response object slot
	 */
	export const WorkflowResponseSlotSchema: z.ZodObject<{
		message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
			id: z.ZodOptional<z.ZodString>;
			role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
			content: z.ZodOptional<z.ZodString>;
			time: z.ZodOptional<z.ZodString>;
			name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
			intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>>;
			ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
			mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
			tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>>;
			tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
		}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>]>>;
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>]>, "many">]>>;
		contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
		followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			message: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>, z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>;
		}, "strip", z.ZodTypeAny, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		anticipate: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			did: z.ZodString;
			yes: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
			no: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
		}, "strip", z.ZodTypeAny, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}>, z.ZodArray<z.ZodObject<{
			message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
				id: z.ZodOptional<z.ZodString>;
				role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
				content: z.ZodOptional<z.ZodString>;
				time: z.ZodOptional<z.ZodString>;
				name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
				intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					start: z.ZodNumber;
					end: z.ZodNumber;
					type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				}, "strip", z.ZodTypeAny, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}>, "many">>>>;
				ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
				mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
				tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					id: z.ZodString;
					type: z.ZodString;
					function: z.ZodObject<{
						arguments: z.ZodString;
						name: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						name: string;
						arguments: string;
					}, {
						name: string;
						arguments: string;
					}>;
				}, "strip", z.ZodTypeAny, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}>, "many">>>>;
				tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}>]>>;
			forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
				to: z.ZodOptional<z.ZodString>;
				mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
				note: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}>]>>;
			scheduled: z.ZodOptional<z.ZodNumber>;
			forwardNote: z.ZodOptional<z.ZodString>;
			instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>>;
			contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				message: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>, z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>;
			}, "strip", z.ZodTypeAny, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>]>>;
			removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			resetIntent: z.ZodOptional<z.ZodBoolean>;
			secondsDelay: z.ZodOptional<z.ZodNumber>;
			keywords: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}>, "many">]>>;
		entityContextUpsert: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"method", [z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"delete">;
		}, "strip", z.ZodTypeAny, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}>, z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"mutate">;
			fields: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodLiteral<"#remove">, z.ZodLiteral<"#delete">]>>;
		}, "strip", z.ZodTypeAny, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}>]>, "many">>;
		tasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
	}, "strip", z.ZodTypeAny, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}>;
	/**
	 * The workflow response to send in any given workflow
	 */
	export const WorkflowResponseSchema: z.ZodUnion<[z.ZodObject<{
		message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
			id: z.ZodOptional<z.ZodString>;
			role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
			content: z.ZodOptional<z.ZodString>;
			time: z.ZodOptional<z.ZodString>;
			name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
			intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>>;
			ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
			mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
			tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>>;
			tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
		}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>]>>;
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>]>, "many">]>>;
		contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
		followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			message: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>, z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>;
		}, "strip", z.ZodTypeAny, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		anticipate: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			did: z.ZodString;
			yes: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
			no: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
		}, "strip", z.ZodTypeAny, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}>, z.ZodArray<z.ZodObject<{
			message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
				id: z.ZodOptional<z.ZodString>;
				role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
				content: z.ZodOptional<z.ZodString>;
				time: z.ZodOptional<z.ZodString>;
				name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
				intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					start: z.ZodNumber;
					end: z.ZodNumber;
					type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				}, "strip", z.ZodTypeAny, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}>, "many">>>>;
				ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
				mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
				tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					id: z.ZodString;
					type: z.ZodString;
					function: z.ZodObject<{
						arguments: z.ZodString;
						name: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						name: string;
						arguments: string;
					}, {
						name: string;
						arguments: string;
					}>;
				}, "strip", z.ZodTypeAny, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}>, "many">>>>;
				tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}>]>>;
			forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
				to: z.ZodOptional<z.ZodString>;
				mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
				note: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}>]>>;
			scheduled: z.ZodOptional<z.ZodNumber>;
			forwardNote: z.ZodOptional<z.ZodString>;
			instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>>;
			contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				message: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>, z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>;
			}, "strip", z.ZodTypeAny, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>]>>;
			removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			resetIntent: z.ZodOptional<z.ZodBoolean>;
			secondsDelay: z.ZodOptional<z.ZodNumber>;
			keywords: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}>, "many">]>>;
		entityContextUpsert: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"method", [z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"delete">;
		}, "strip", z.ZodTypeAny, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}>, z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"mutate">;
			fields: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodLiteral<"#remove">, z.ZodLiteral<"#delete">]>>;
		}, "strip", z.ZodTypeAny, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}>]>, "many">>;
		tasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
	}, "strip", z.ZodTypeAny, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}>, z.ZodArray<z.ZodObject<{
		message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
			id: z.ZodOptional<z.ZodString>;
			role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
			content: z.ZodOptional<z.ZodString>;
			time: z.ZodOptional<z.ZodString>;
			name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
			intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>>;
			ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
			mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
			tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>>;
			tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
		}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>]>>;
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>]>, "many">]>>;
		contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
		followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			message: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>, z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>;
		}, "strip", z.ZodTypeAny, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		anticipate: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			did: z.ZodString;
			yes: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
			no: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
		}, "strip", z.ZodTypeAny, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}>, z.ZodArray<z.ZodObject<{
			message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
				id: z.ZodOptional<z.ZodString>;
				role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
				content: z.ZodOptional<z.ZodString>;
				time: z.ZodOptional<z.ZodString>;
				name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
				intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					start: z.ZodNumber;
					end: z.ZodNumber;
					type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				}, "strip", z.ZodTypeAny, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}>, "many">>>>;
				ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
				mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
				tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					id: z.ZodString;
					type: z.ZodString;
					function: z.ZodObject<{
						arguments: z.ZodString;
						name: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						name: string;
						arguments: string;
					}, {
						name: string;
						arguments: string;
					}>;
				}, "strip", z.ZodTypeAny, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}>, "many">>>>;
				tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}>]>>;
			forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
				to: z.ZodOptional<z.ZodString>;
				mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
				note: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}>]>>;
			scheduled: z.ZodOptional<z.ZodNumber>;
			forwardNote: z.ZodOptional<z.ZodString>;
			instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>>;
			contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				message: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>, z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>;
			}, "strip", z.ZodTypeAny, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>]>>;
			removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			resetIntent: z.ZodOptional<z.ZodBoolean>;
			secondsDelay: z.ZodOptional<z.ZodNumber>;
			keywords: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}>, "many">]>>;
		entityContextUpsert: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"method", [z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"delete">;
		}, "strip", z.ZodTypeAny, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}>, z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"mutate">;
			fields: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodLiteral<"#remove">, z.ZodLiteral<"#delete">]>>;
		}, "strip", z.ZodTypeAny, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}>]>, "many">>;
		tasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
	}, "strip", z.ZodTypeAny, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}>, "many">]>;
	export const WorkflowFunctionSchema: z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		messages: z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>;
			ignoreTransform: z.ZodOptional<z.ZodBoolean>;
			mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
			tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>;
			tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>, "many">;
		conversation: z.ZodObject<{
			$id: z.ZodString;
			$agent: z.ZodString;
			$customer: z.ZodString;
			initialContexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			environment: z.ZodEnum<["phone", "email", "web"]>; /**
			 * An api call that should be called later, must return a string or {message: string}
			 */
			environmentProps: z.ZodOptional<z.ZodObject<{
				subject: z.ZodOptional<z.ZodString>;
				platformEmailThreadId: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			}, {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			}>>;
			locked: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
			lockedReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			lockAttempts: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
			forwardedTo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			forwarded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			forwardNote: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
			anticipate: z.ZodOptional<z.ZodObject<{
				type: z.ZodEnum<["did", "literal", "context"]>;
				slots: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodAny, "many">>;
				did: z.ZodOptional<z.ZodString>;
				map: z.ZodOptional<z.ZodArray<z.ZodObject<{
					slot: z.ZodString;
					keywords: z.ZodArray<z.ZodString, "many">;
				}, "strip", z.ZodTypeAny, {
					slot: string;
					keywords: string[];
				}, {
					slot: string;
					keywords: string[];
				}>, "many">>;
			}, "strip", z.ZodTypeAny, {
				type: "literal" | "context" | "did";
				slots: Record<string, any[]>;
				did?: string | undefined;
				map?: {
					slot: string;
					keywords: string[];
				}[] | undefined;
			}, {
				type: "literal" | "context" | "did";
				slots: Record<string, any[]>;
				did?: string | undefined;
				map?: {
					slot: string;
					keywords: string[];
				}[] | undefined;
			}>>;
			command: z.ZodOptional<z.ZodObject<{
				path: z.ZodString;
				entity: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				path: string;
				entity: string;
			}, {
				path: string;
				entity: string;
			}>>;
		}, "strip", z.ZodTypeAny, {
			environment: "email" | "phone" | "web";
			$id: string;
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			anticipate?: {
				type: "literal" | "context" | "did";
				slots: Record<string, any[]>;
				did?: string | undefined;
				map?: {
					slot: string;
					keywords: string[];
				}[] | undefined;
			} | undefined;
			command?: {
				path: string;
				entity: string;
			} | undefined;
		}, {
			environment: "email" | "phone" | "web";
			$id: string;
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			anticipate?: {
				type: "literal" | "context" | "did";
				slots: Record<string, any[]>;
				did?: string | undefined;
				map?: {
					slot: string;
					keywords: string[];
				}[] | undefined;
			} | undefined;
			command?: {
				path: string;
				entity: string;
			} | undefined;
		}>;
		context: z.ZodAny;
		message: z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>;
			ignoreTransform: z.ZodOptional<z.ZodBoolean>;
			mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
			tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>;
			tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>;
		agent: z.ZodObject<Omit<{
			inactive: z.ZodOptional<z.ZodBoolean>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			deployed: z.ZodOptional<z.ZodObject<{
				web: z.ZodOptional<z.ZodString>;
				phone: z.ZodOptional<z.ZodString>;
				email: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}>>;
			isFreeProgrammablePhoneNumber: z.ZodOptional<z.ZodBoolean>;
			programmablePhoneNumber: z.ZodOptional<z.ZodString>;
			programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
			programmableEmail: z.ZodOptional<z.ZodString>;
			forwardEmail: z.ZodOptional<z.ZodString>;
			forwardPhone: z.ZodOptional<z.ZodString>;
			includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
			transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				role: z.ZodEnum<["agent", "customer", "system", "tool"]>;
				content: z.ZodString;
				time: z.ZodString;
				name: z.ZodOptional<z.ZodString>;
				scheduled: z.ZodOptional<z.ZodString>;
				context: z.ZodOptional<z.ZodAny>;
				intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				entities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					start: z.ZodNumber;
					end: z.ZodNumber;
					type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				}, "strip", z.ZodTypeAny, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}>, "many">>>;
				ignoreTransform: z.ZodOptional<z.ZodBoolean>;
				mediaUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
				tool_calls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					id: z.ZodString;
					type: z.ZodString;
					function: z.ZodObject<{
						arguments: z.ZodString;
						name: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						name: string;
						arguments: string;
					}, {
						name: string;
						arguments: string;
					}>;
				}, "strip", z.ZodTypeAny, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}>, "many">>>;
				tool_call_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system" | "tool";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				entities?: {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}[] | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system" | "tool";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				entities?: {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}[] | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}>, "many">, "many">>;
			audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
			pmt: z.ZodOptional<z.ZodObject<{
				tag: z.ZodOptional<z.ZodString>;
				ingress: z.ZodEnum<["auto", "manual", "app", "workflow"]>;
				llm: z.ZodOptional<z.ZodString>;
				webhookUri: z.ZodOptional<z.ZodString>;
				watermarkEnabled: z.ZodOptional<z.ZodBoolean>;
				watermark: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				ingress: "auto" | "manual" | "app" | "workflow";
				tag?: string | undefined;
				llm?: string | undefined;
				webhookUri?: string | undefined;
				watermarkEnabled?: boolean | undefined;
				watermark?: string | undefined;
			}, {
				ingress: "auto" | "manual" | "app" | "workflow";
				tag?: string | undefined;
				llm?: string | undefined;
				webhookUri?: string | undefined;
				watermarkEnabled?: boolean | undefined;
				watermark?: string | undefined;
			}>>;
			id: z.ZodString;
		}, "context" | "includedLocations" | "excludedLocations" | "model" | "transcripts" | "audios" | "pmt">, "strip", z.ZodTypeAny, {
			id: string;
			title: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			isFreeProgrammablePhoneNumber?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}, {
			id: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			title?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			isFreeProgrammablePhoneNumber?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}>;
		customer: z.ZodObject<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, "strip", z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>, z.objectOutputType<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>, "strip">, z.objectInputType<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>, "strip">>;
		intent: z.ZodObject<{
			current: z.ZodNullable<z.ZodString>;
			flow: z.ZodArray<z.ZodString, "many">;
			initial: z.ZodNullable<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			current: string | null;
			flow: string[];
			initial: string | null;
		}, {
			current: string | null;
			flow: string[];
			initial: string | null;
		}>;
		stagnationCount: z.ZodNumber;
		note: z.ZodOptional<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		message: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		};
		agent: {
			id: string;
			title: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			isFreeProgrammablePhoneNumber?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		};
		customer: {
			name: string;
			firstName?: string | undefined;
			lastName?: string | undefined;
			email?: string | null | undefined;
			phone?: string | null | undefined;
			img?: string | null | undefined;
			neighborhood?: string | null | undefined;
			city?: string | null | undefined;
			country?: string | null | undefined;
			line1?: string | null | undefined;
			line2?: string | null | undefined;
			postal_code?: string | null | undefined;
			state?: string | null | undefined;
			town?: string | null | undefined;
			joined?: string | null | undefined;
			stripe?: string | null | undefined;
			stripeDev?: string | null | undefined;
		} & {
			[k: string]: string | number | boolean | undefined;
		};
		intent: {
			current: string | null;
			flow: string[];
			initial: string | null;
		};
		messages: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[];
		conversation: {
			environment: "email" | "phone" | "web";
			$id: string;
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			anticipate?: {
				type: "literal" | "context" | "did";
				slots: Record<string, any[]>;
				did?: string | undefined;
				map?: {
					slot: string;
					keywords: string[];
				}[] | undefined;
			} | undefined;
			command?: {
				path: string;
				entity: string;
			} | undefined;
		};
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}, {
		message: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		};
		agent: {
			id: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			title?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			isFreeProgrammablePhoneNumber?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		};
		customer: {
			name: string;
			firstName?: string | undefined;
			lastName?: string | undefined;
			email?: string | null | undefined;
			phone?: string | null | undefined;
			img?: string | null | undefined;
			neighborhood?: string | null | undefined;
			city?: string | null | undefined;
			country?: string | null | undefined;
			line1?: string | null | undefined;
			line2?: string | null | undefined;
			postal_code?: string | null | undefined;
			state?: string | null | undefined;
			town?: string | null | undefined;
			joined?: string | null | undefined;
			stripe?: string | null | undefined;
			stripeDev?: string | null | undefined;
		} & {
			[k: string]: string | number | boolean | undefined;
		};
		intent: {
			current: string | null;
			flow: string[];
			initial: string | null;
		};
		messages: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system" | "tool";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			entities?: {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}[] | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}[];
		conversation: {
			environment: "email" | "phone" | "web";
			$id: string;
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			anticipate?: {
				type: "literal" | "context" | "did";
				slots: Record<string, any[]>;
				did?: string | undefined;
				map?: {
					slot: string;
					keywords: string[];
				}[] | undefined;
			} | undefined;
			command?: {
				path: string;
				entity: string;
			} | undefined;
		};
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}>], z.ZodUnknown>, z.ZodUnion<[z.ZodPromise<z.ZodUnion<[z.ZodObject<{
		message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
			id: z.ZodOptional<z.ZodString>;
			role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
			content: z.ZodOptional<z.ZodString>;
			time: z.ZodOptional<z.ZodString>;
			name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
			intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>>;
			ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
			mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
			tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>>;
			tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
		}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>]>>;
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>]>, "many">]>>;
		contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
		followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			message: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>, z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>;
		}, "strip", z.ZodTypeAny, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		anticipate: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			did: z.ZodString;
			yes: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
			no: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
		}, "strip", z.ZodTypeAny, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}>, z.ZodArray<z.ZodObject<{
			message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
				id: z.ZodOptional<z.ZodString>;
				role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
				content: z.ZodOptional<z.ZodString>;
				time: z.ZodOptional<z.ZodString>;
				name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
				intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					start: z.ZodNumber;
					end: z.ZodNumber;
					type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				}, "strip", z.ZodTypeAny, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}>, "many">>>>;
				ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
				mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
				tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					id: z.ZodString;
					type: z.ZodString;
					function: z.ZodObject<{
						arguments: z.ZodString;
						name: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						name: string;
						arguments: string;
					}, {
						name: string;
						arguments: string;
					}>;
				}, "strip", z.ZodTypeAny, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}>, "many">>>>;
				tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}>]>>;
			forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
				to: z.ZodOptional<z.ZodString>;
				mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
				note: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}>]>>;
			scheduled: z.ZodOptional<z.ZodNumber>;
			forwardNote: z.ZodOptional<z.ZodString>;
			instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>>;
			contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				message: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>, z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>;
			}, "strip", z.ZodTypeAny, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>]>>;
			removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			resetIntent: z.ZodOptional<z.ZodBoolean>;
			secondsDelay: z.ZodOptional<z.ZodNumber>;
			keywords: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}>, "many">]>>;
		entityContextUpsert: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"method", [z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"delete">;
		}, "strip", z.ZodTypeAny, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}>, z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"mutate">;
			fields: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodLiteral<"#remove">, z.ZodLiteral<"#delete">]>>;
		}, "strip", z.ZodTypeAny, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}>]>, "many">>;
		tasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
	}, "strip", z.ZodTypeAny, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}>, z.ZodArray<z.ZodObject<{
		message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
			id: z.ZodOptional<z.ZodString>;
			role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
			content: z.ZodOptional<z.ZodString>;
			time: z.ZodOptional<z.ZodString>;
			name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
			intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>>;
			ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
			mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
			tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>>;
			tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
		}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>]>>;
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>]>, "many">]>>;
		contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
		followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			message: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>, z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>;
		}, "strip", z.ZodTypeAny, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		anticipate: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			did: z.ZodString;
			yes: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
			no: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
		}, "strip", z.ZodTypeAny, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}>, z.ZodArray<z.ZodObject<{
			message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
				id: z.ZodOptional<z.ZodString>;
				role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
				content: z.ZodOptional<z.ZodString>;
				time: z.ZodOptional<z.ZodString>;
				name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
				intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					start: z.ZodNumber;
					end: z.ZodNumber;
					type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				}, "strip", z.ZodTypeAny, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}>, "many">>>>;
				ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
				mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
				tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					id: z.ZodString;
					type: z.ZodString;
					function: z.ZodObject<{
						arguments: z.ZodString;
						name: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						name: string;
						arguments: string;
					}, {
						name: string;
						arguments: string;
					}>;
				}, "strip", z.ZodTypeAny, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}>, "many">>>>;
				tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}>]>>;
			forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
				to: z.ZodOptional<z.ZodString>;
				mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
				note: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}>]>>;
			scheduled: z.ZodOptional<z.ZodNumber>;
			forwardNote: z.ZodOptional<z.ZodString>;
			instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>>;
			contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				message: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>, z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>;
			}, "strip", z.ZodTypeAny, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>]>>;
			removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			resetIntent: z.ZodOptional<z.ZodBoolean>;
			secondsDelay: z.ZodOptional<z.ZodNumber>;
			keywords: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}>, "many">]>>;
		entityContextUpsert: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"method", [z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"delete">;
		}, "strip", z.ZodTypeAny, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}>, z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"mutate">;
			fields: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodLiteral<"#remove">, z.ZodLiteral<"#delete">]>>;
		}, "strip", z.ZodTypeAny, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}>]>, "many">>;
		tasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
	}, "strip", z.ZodTypeAny, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}>, "many">]>>, z.ZodUnion<[z.ZodObject<{
		message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
			id: z.ZodOptional<z.ZodString>;
			role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
			content: z.ZodOptional<z.ZodString>;
			time: z.ZodOptional<z.ZodString>;
			name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
			intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>>;
			ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
			mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
			tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>>;
			tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
		}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>]>>;
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>]>, "many">]>>;
		contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
		followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			message: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>, z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>;
		}, "strip", z.ZodTypeAny, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		anticipate: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			did: z.ZodString;
			yes: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
			no: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
		}, "strip", z.ZodTypeAny, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}>, z.ZodArray<z.ZodObject<{
			message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
				id: z.ZodOptional<z.ZodString>;
				role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
				content: z.ZodOptional<z.ZodString>;
				time: z.ZodOptional<z.ZodString>;
				name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
				intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					start: z.ZodNumber;
					end: z.ZodNumber;
					type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				}, "strip", z.ZodTypeAny, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}>, "many">>>>;
				ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
				mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
				tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					id: z.ZodString;
					type: z.ZodString;
					function: z.ZodObject<{
						arguments: z.ZodString;
						name: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						name: string;
						arguments: string;
					}, {
						name: string;
						arguments: string;
					}>;
				}, "strip", z.ZodTypeAny, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}>, "many">>>>;
				tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}>]>>;
			forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
				to: z.ZodOptional<z.ZodString>;
				mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
				note: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}>]>>;
			scheduled: z.ZodOptional<z.ZodNumber>;
			forwardNote: z.ZodOptional<z.ZodString>;
			instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>>;
			contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				message: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>, z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>;
			}, "strip", z.ZodTypeAny, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>]>>;
			removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			resetIntent: z.ZodOptional<z.ZodBoolean>;
			secondsDelay: z.ZodOptional<z.ZodNumber>;
			keywords: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}>, "many">]>>;
		entityContextUpsert: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"method", [z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"delete">;
		}, "strip", z.ZodTypeAny, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}>, z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"mutate">;
			fields: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodLiteral<"#remove">, z.ZodLiteral<"#delete">]>>;
		}, "strip", z.ZodTypeAny, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}>]>, "many">>;
		tasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
	}, "strip", z.ZodTypeAny, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}>, z.ZodArray<z.ZodObject<{
		message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
			id: z.ZodOptional<z.ZodString>;
			role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
			content: z.ZodOptional<z.ZodString>;
			time: z.ZodOptional<z.ZodString>;
			name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
			context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
			intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
			entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				start: z.ZodNumber;
				end: z.ZodNumber;
				type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			}, "strip", z.ZodTypeAny, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}, {
				end: number;
				start: number;
				type?: string | null | undefined;
				option?: string | null | undefined;
				text?: string | null | undefined;
			}>, "many">>>>;
			ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
			mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
			tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				type: z.ZodString;
				function: z.ZodObject<{
					arguments: z.ZodString;
					name: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					name: string;
					arguments: string;
				}, {
					name: string;
					arguments: string;
				}>;
			}, "strip", z.ZodTypeAny, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}, {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}>, "many">>>>;
			tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
		}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}, {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		}>]>>;
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}, {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		}>]>, "many">]>>;
		contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
		followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			message: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>, z.ZodObject<{
			scheduled: z.ZodNumber;
			cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			overrideLock: z.ZodOptional<z.ZodBoolean>;
			instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>;
		}, "strip", z.ZodTypeAny, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}, {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		}>]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		anticipate: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
			did: z.ZodString;
			yes: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
			no: z.ZodObject<{
				contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					message: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>, z.ZodObject<{
					scheduled: z.ZodNumber;
					cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
					overrideLock: z.ZodOptional<z.ZodBoolean>;
					instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
						id: z.ZodOptional<z.ZodString>;
						persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
						content: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}, {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					}>]>, "many">]>;
				}, "strip", z.ZodTypeAny, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}, {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				}>]>>;
				forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
					to: z.ZodOptional<z.ZodString>;
					mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
					note: z.ZodOptional<z.ZodString>;
				}, "strip", z.ZodTypeAny, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}, {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				}>]>>;
				forwardNote: z.ZodOptional<z.ZodString>;
				instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>>;
				message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
					id: z.ZodOptional<z.ZodString>;
					role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
					content: z.ZodOptional<z.ZodString>;
					time: z.ZodOptional<z.ZodString>;
					name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
					context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
					intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
					intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
					entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						start: z.ZodNumber;
						end: z.ZodNumber;
						type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
						text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					}, "strip", z.ZodTypeAny, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}, {
						end: number;
						start: number;
						type?: string | null | undefined;
						option?: string | null | undefined;
						text?: string | null | undefined;
					}>, "many">>>>;
					ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
					mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
					tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
						id: z.ZodString;
						type: z.ZodString;
						function: z.ZodObject<{
							arguments: z.ZodString;
							name: z.ZodString;
						}, "strip", z.ZodTypeAny, {
							name: string;
							arguments: string;
						}, {
							name: string;
							arguments: string;
						}>;
					}, "strip", z.ZodTypeAny, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}, {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}>, "many">>>>;
					tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}, {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				}>]>>;
				removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
				resetIntent: z.ZodOptional<z.ZodBoolean>;
				secondsDelay: z.ZodOptional<z.ZodNumber>;
				scheduled: z.ZodOptional<z.ZodNumber>;
			}, "strip", z.ZodTypeAny, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}, {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			}>;
		}, "strip", z.ZodTypeAny, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}, {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		}>, z.ZodArray<z.ZodObject<{
			message: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<Omit<{
				id: z.ZodOptional<z.ZodString>;
				role: z.ZodOptional<z.ZodEnum<["agent", "customer", "system", "tool"]>>;
				content: z.ZodOptional<z.ZodString>;
				time: z.ZodOptional<z.ZodString>;
				name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				scheduled: z.ZodOptional<z.ZodOptional<z.ZodString>>;
				context: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
				intent: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
				intentScore: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				delayInSeconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
				entities: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					start: z.ZodNumber;
					end: z.ZodNumber;
					type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					option: z.ZodNullable<z.ZodOptional<z.ZodString>>;
					text: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				}, "strip", z.ZodTypeAny, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}, {
					end: number;
					start: number;
					type?: string | null | undefined;
					option?: string | null | undefined;
					text?: string | null | undefined;
				}>, "many">>>>;
				ignoreTransform: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
				mediaUrls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
				tool_calls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodObject<{
					id: z.ZodString;
					type: z.ZodString;
					function: z.ZodObject<{
						arguments: z.ZodString;
						name: z.ZodString;
					}, "strip", z.ZodTypeAny, {
						name: string;
						arguments: string;
					}, {
						name: string;
						arguments: string;
					}>;
				}, "strip", z.ZodTypeAny, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}, {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}>, "many">>>>;
				tool_call_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
			}, "time" | "id" | "role" | "entities">, "strip", z.ZodTypeAny, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}, {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			}>]>>;
			forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
				to: z.ZodOptional<z.ZodString>;
				mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
				note: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}, {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			}>]>>;
			scheduled: z.ZodOptional<z.ZodNumber>;
			forwardNote: z.ZodOptional<z.ZodString>;
			instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
				id: z.ZodOptional<z.ZodString>;
				persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
				content: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}, {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			}>]>, "many">]>>;
			contextUpsert: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
			followup: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				message: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>, z.ZodObject<{
				scheduled: z.ZodNumber;
				cancelIf: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodAny, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">]>>>;
				overrideLock: z.ZodOptional<z.ZodBoolean>;
				instructions: z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
					id: z.ZodOptional<z.ZodString>;
					persist: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
					content: z.ZodString;
				}, "strip", z.ZodTypeAny, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}, {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				}>]>, "many">]>;
			}, "strip", z.ZodTypeAny, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}, {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			}>]>>;
			removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			resetIntent: z.ZodOptional<z.ZodBoolean>;
			secondsDelay: z.ZodOptional<z.ZodNumber>;
			keywords: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}, {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}>, "many">]>>;
		entityContextUpsert: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"method", [z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"delete">;
		}, "strip", z.ZodTypeAny, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}, {
			method: "delete";
			entityType: string;
			entityRecordId: string;
		}>, z.ZodObject<{
			entityType: z.ZodString;
			entityRecordId: z.ZodString;
			method: z.ZodLiteral<"mutate">;
			fields: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodLiteral<"#remove">, z.ZodLiteral<"#delete">]>>;
		}, "strip", z.ZodTypeAny, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}, {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		}>]>, "many">>;
		tasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
	}, "strip", z.ZodTypeAny, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}, {
		message?: string | {
			name?: string | undefined;
			content?: string | undefined;
			context?: any;
			scheduled?: string | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
			ignoreTransform?: boolean | undefined;
			mediaUrls?: string[] | null | undefined;
			tool_calls?: {
				function: {
					name: string;
					arguments: string;
				};
				type: string;
				id: string;
			}[] | null | undefined;
			tool_call_id?: string | null | undefined;
		} | undefined;
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		scheduled?: number | undefined;
		forwardNote?: string | undefined;
		instructions?: string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		} | (string | {
			content: string;
			id?: string | undefined;
			persist?: boolean | undefined;
		})[] | undefined;
		contextUpsert?: Record<string, any> | undefined;
		followup?: {
			message: string;
			scheduled: number;
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | {
			scheduled: number;
			instructions: (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[]) & (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined);
			cancelIf?: Record<string, any> | undefined;
			overrideLock?: boolean | undefined;
		} | undefined;
		removeInstructions?: string[] | undefined;
		resetIntent?: boolean | undefined;
		secondsDelay?: number | undefined;
		anticipate?: {
			did: string;
			yes: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
			no: {
				contextUpsert?: Record<string, any> | undefined;
				followup?: {
					message: string;
					scheduled: number;
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | {
					scheduled: number;
					instructions: (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[]) & (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					} | (string | {
						content: string;
						id?: string | undefined;
						persist?: boolean | undefined;
					})[] | undefined);
					cancelIf?: Record<string, any> | undefined;
					overrideLock?: boolean | undefined;
				} | undefined;
				forward?: string | boolean | {
					to?: string | undefined;
					mode?: "after-reply" | "immediately" | undefined;
					note?: string | undefined;
				} | undefined;
				forwardNote?: string | undefined;
				instructions?: string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined;
				message?: string | {
					name?: string | undefined;
					content?: string | undefined;
					context?: any;
					scheduled?: string | undefined;
					intent?: string | null | undefined;
					intentScore?: number | null | undefined;
					delayInSeconds?: number | null | undefined;
					ignoreTransform?: boolean | undefined;
					mediaUrls?: string[] | null | undefined;
					tool_calls?: {
						function: {
							name: string;
							arguments: string;
						};
						type: string;
						id: string;
					}[] | null | undefined;
					tool_call_id?: string | null | undefined;
				} | undefined;
				removeInstructions?: string[] | undefined;
				resetIntent?: boolean | undefined;
				secondsDelay?: number | undefined;
				scheduled?: number | undefined;
			};
		} | {
			keywords: string[];
			message?: string | {
				name?: string | undefined;
				content?: string | undefined;
				context?: any;
				scheduled?: string | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
				ignoreTransform?: boolean | undefined;
				mediaUrls?: string[] | null | undefined;
				tool_calls?: {
					function: {
						name: string;
						arguments: string;
					};
					type: string;
					id: string;
				}[] | null | undefined;
				tool_call_id?: string | null | undefined;
			} | undefined;
			forward?: string | boolean | {
				to?: string | undefined;
				mode?: "after-reply" | "immediately" | undefined;
				note?: string | undefined;
			} | undefined;
			scheduled?: number | undefined;
			forwardNote?: string | undefined;
			instructions?: string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			} | (string | {
				content: string;
				id?: string | undefined;
				persist?: boolean | undefined;
			})[] | undefined;
			contextUpsert?: Record<string, any> | undefined;
			followup?: {
				message: string;
				scheduled: number;
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | {
				scheduled: number;
				instructions: (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[]) & (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				} | (string | {
					content: string;
					id?: string | undefined;
					persist?: boolean | undefined;
				})[] | undefined);
				cancelIf?: Record<string, any> | undefined;
				overrideLock?: boolean | undefined;
			} | undefined;
			removeInstructions?: string[] | undefined;
			resetIntent?: boolean | undefined;
			secondsDelay?: number | undefined;
		}[] | undefined;
		entityContextUpsert?: ({
			method: "delete";
			entityType: string;
			entityRecordId: string;
		} | {
			method: "mutate";
			entityType: string;
			entityRecordId: string;
			fields: Record<string, string | number | boolean | null>;
		})[] | undefined;
		tasks?: string[] | undefined;
	}>, "many">]>]>>;
}

//# sourceMappingURL=index.d.ts.map