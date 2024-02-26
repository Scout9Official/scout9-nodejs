declare module '@scout9/app' {
  /**
   * Represents the configuration provided in src/index.{js | ts} in a project
   */
  export interface Scout9ProjectConfig {

	/**
	 * Tag to reference this application
	 * @defaut your local package.json name + version, or scout9-app-v1.0.0
	 */
	tag?: string;

	llm: {
	  engine: 'openai',
	  model: (string & {})
		| 'gpt-4-1106-preview'
		| 'gpt-4-vision-preview'
		| 'gpt-4'
		| 'gpt-4-0314'
		| 'gpt-4-0613'
		| 'gpt-4-32k'
		| 'gpt-4-32k-0314'
		| 'gpt-4-32k-0613'
		| 'gpt-3.5-turbo'
		| 'gpt-3.5-turbo-16k'
		| 'gpt-3.5-turbo-0301'
		| 'gpt-3.5-turbo-0613'
		| 'gpt-3.5-turbo-16k-0613';
	} | {
	  engine: 'bard' | 'gemini' | 'llama',
	  model: string;
	},
	/**
	 * Configure personal model transformer (PMT) settings to align auto replies the agent's tone
	 */
	pmt: {
	  engine: 'scout9',
	  model: 'orin-1.0' | 'orin-2.0-preview'
	}

	/**
	 * Determines the max auto replies without further conversation progression (defined by new context data gathered)
	 * before the conversation is locked and requires manual intervention
	 * @default 3
	 */
	maxLockAttempts?: number;

	/**
	 * Configure the initial contexts for every conversation
	 */
	initialContext: string[];
	organization: {
	  name: string;
	  description: string;
	  dashboard?: string;
	  logo?: string;
	  icon?: string;
	  logos?: string;
	  website?: string;
	  email?: string;
	  phone?: string;
	}
  }

  /**
   * Entity config the user provides
   */
  export interface EntityBuildConfig {
	definitions?: {
	  utterance?: string;
	  value: string;
	  text: string[];
	}[],
	training?: {
	  text: string, intent: string;
	}[];
	tests?: {
	  text: string;
	  expected: {
		intent: string;
		context: any;
	  }
	}[];
  }

  /**
   * What gets exported to the scout9 backend, properties are constructed by @scout/app build
   */
  export interface ExportedEntityBuildConfig extends EntityBuildConfig {
	entities: string[];
	entity: string;
	// id: string;
	api: {
	  QUERY?: boolean;
	  GET?: boolean;
	  POST?: boolean;
	  PUT?: boolean;
	  PATCH?: boolean;
	  DELETE?: boolean;
	} | null;
  }

  export type EntitiesBuildConfig = ExportedEntityBuildConfig[];

  export type WorkflowBuildConfig = {
	entities: string[];
	entity: string;
  }
  export type WorkflowsBuildConfig = WorkflowBuildConfig[];
  /**
   * Including the provided project config, this is the manifest for all entities and workflows to be managed in build
   */
  export interface Scout9ProjectBuildConfig extends Scout9ProjectConfig {
	agents: Agent[];
	entities: EntitiesBuildConfig;
	workflows: WorkflowsBuildConfig;
  }


  export interface DeployOptions {
	cwd?: string;
  }

  export interface BuildOptions {
	cwd?: string;
	mode?: 'development' | 'production';
  }

  export interface RunOptions {
	cwd?: string;
	mode?: 'remote' | 'local';
  }

  export interface Conversation {
	$agent: string;
	$customer: string;
	initialContexts?: string[];
	environment: 'phone' | 'email' | 'web';
	environmentProps?: {
	  subject?: string;
	  platformEmailThreadId?: string;
	};
	locked?: boolean;
	lockedReason?: string;
	lockAttempts?: number;
	forwardedTo?: string; // personaId/phone/email
	forwarded?: string; // ISO 8601
	forwardNote?: string;

	/**
	 * Detected intent
	 */
	intent?: string | null;

	/**
	 * Confidence score of the assigned intent
	 */
	intentScore?: number | null;
  }

  export interface Message {
	id: string;

	role: 'customer' | 'agent' | 'system';
	content: string;
	name?: string;
	time: string;

	scheduled?: string;
	delayInSeconds?: number;

	/**
	 * The context generated from the message
	 */
	context?: any;

	/**
	 * Detected intent
	 */
	intent?: string | null;

	/**
	 * Confidence score of the assigned intent
	 */
	intentScore?: number | null;
  }

  export interface Customer {
	id: string;
	name: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	img?: string;
	neighborhood?: string;
	city?: string;
	country?: string;
	line1?: string;
	line2?: string;
	postal_code?: string;
	state?: string;
	town?: string;

	[key: string]: any;
  }

  export interface Agent {
	// Generated Info
	id: string;
	deployed?: {
	  web?: string;
	  phone?: string;
	  email?: string;
	};

	/**
	 * Profile image path
	 */
	img?: string | Buffer;

	firstName?: string;
	lastName?: string;
	inactive?: boolean;
	programmablePhoneNumber?: string;
	programmablePhoneNumberSid?: string;
	programmableEmail?: string;
	forwardEmail?: string;
	forwardPhone?: string;
	title?: string;
	context?: string;
	includedLocations?: string[];
	excludedLocations?: string[];
	model?: 'Scout9' | 'bard' | 'openai';
	transcripts?: Message[][];
	audios?: any[];
  }

  export type Persona = Agent;

  /**
   * The input event provided to the application
   */
  export interface WorkflowEvent<Type = any> {
	messages: Message[];
	conversation: Conversation;
	context: Partial<Type>;
	message: Message;
	agent: Omit<Agent, 'transcripts' | 'audios' | 'includedLocations' | 'excludedLocations' | 'model' | 'context'>;
	customer: Customer;
	intent: {
	  current: string | null;
	  flow: string[];
	  initial: string | null;
	};
	stagnationCount: number;
  }

  export interface Instruction {
	id: string;
	content: string;
  }

  export interface WorkflowResponseSlot<Type = any> {
	forward?: string | boolean | {
	  to?: string;
	  mode?: 'after-reply' | 'immediately';

	  /**
	   * Note to provide to the agent
	   */
	  note?: string;
	};
	forwardNote?: string;
	instructions?: string | string[] | Instruction | Instruction[];
	removeInstructions?: string[];
	message?: string;
	secondsDelay?: number;
	scheduled?: number;
	contextUpsert?: Partial<Type>;
	resetIntent?: boolean;
  }

  export type WorkflowResponse<Type = any> = WorkflowResponseSlot<Type> | WorkflowResponseSlot<Type>[];

  export type WorkflowFunction<Type = any> = (event: WorkflowEvent) => Promise<WorkflowResponse<Type>> | WorkflowResponse<Type>;

  export function json<Type = any>(data: Type, init?: ResponseInit): Promise<EventResponse<Type>>;

  export function run<Type = any>(event: WorkflowEvent, options?: RunOptions): Promise<WorkflowResponse<Type>>;

  export function sendEvent<Type = any>(event: WorkflowEvent, options?: RunOptions): Promise<WorkflowResponse<Type>>;

  export function build(options?: BuildOptions): Promise<Scout9ProjectBuildConfig>;

  export function deploy(options?: DeployOptions): Promise<Scout9ProjectBuildConfig>;

  export class EventResponse<Type = any> {
	/**
	 * Static method to create an EventResponse object.
	 * @param body The body of the response, expected to be an object.
	 * @param options Additional options for the response.
	 */
	static json<Type = any>(body: object, options?: ResponseInit): EventResponse<Type>;

	/**
	 * The body of the response.
	 */
	body: object;

	// Alias to body
	readonly data: object;

	/**
	 * Initialization options for the response.
	 */
	init?: ResponseInit;

	/**
	 * Creates an instance of EventResponse.
	 * @param body The body of the response, expected to be an object.
	 * @param init Initialization options for the response.
	 */
	constructor(body: Type, init?: ResponseInit);

	/**
	 * Returns a Response object with JSON body.
	 */
	readonly response: Response;
  }

  export type ApiFunctionParams<Params = Record<string, string>> = {
	searchParams: {[key: string]: string | string[] };
	params: Params;
  }
  // export type ApiEntityFunctionParams<Params = Record<string, string>> = ApiFunctionParams<Params> & {id: string};
  export type ApiFunction<Params = Record<string, string>, Response = any> = (params: ApiFunctionParams<Params>) => Promise<EventResponse<Response>>;
  export type QueryApiFunction<Params = Record<string, string>, Response = any> = (params: ApiFunctionParams<Params>) => Promise<EventResponse<Response>>;
  export type GetApiFunction<Params = Record<string, string>, Response = any> = (params: ApiFunctionParams<Params>) => Promise<EventResponse<Response>>;
  export type PostApiFunction<Params = Record<string, string>, RequestBody = any, Response = any> = (params: ApiFunctionParams<Params> & {body: Partial<RequestBody>}) => Promise<EventResponse<Response>>;
  export type PutApiFunction<Params = Record<string, string>, RequestBody = any, Response = any> = (params: ApiFunctionParams<Params> & {body: Partial<RequestBody>}) => Promise<EventResponse<Response>>;
  export type PatchApiFunction<Params = Record<string, string>, RequestBody = any, Response = any> = (params: ApiFunctionParams<Params> & {body: Partial<RequestBody>}) => Promise<EventResponse<Response>>;
  export type DeleteApiFunction<Params = Record<string, string>, Response = any> = (params: ApiFunctionParams<Params>) => Promise<EventResponse<Response>>;


  export type mimicCustomerMessage = (input: {
	message: string;
	messages?: Message[];
	workflowFn: WorkflowFunction;
	customer?: Customer;
	context?: any;
	/**
	 * Agent or persona id
	 */
	persona?: string;

	conversation?: Conversation;

	cwd?: string;
	src?: string;
	mode?: 'development' | 'production';
  }) => Promise<{
	messages: Message[];
	conversation: Conversation;
	context: any;
  }>
}

declare module '@scout9/app/testing-tools' {
	export function createMockAgent(firstName?: string, lastName?: string): import('@scout9/app').Agent;
	export function createMockCustomer(firstName?: string, lastName?: string): import('@scout9/app').Customer;
	export function createMockMessage(content: any, role?: string, time?: string): import('@scout9/app').Message;
	export function createMockConversation(environment?: string, $agent?: string, $customer?: string): import('@scout9/app').Conversation;
	export function createMockWorkflowEvent(message: string, intent?: string | import('@scout9/app').WorkflowEvent['intent'] | null): import('@scout9/app').WorkflowEvent;
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
		constructor({ persona, customer, context, conversation, cwd, src, mode, api, app, project }?: {
			cwd?: string;
			src?: string;
			mode?: string;
			persona: any;
			customer: any;
			context: any;
			conversation?: import("@scout9/app").Conversation | undefined;
			api: any;
			app: any;
			project: any;
		});
		
		customer: import('@scout9/app').Customer;
		
		persona: import('@scout9/app').Persona;
		
		conversation: import('@scout9/app').Conversation;
		
		messages: import('@scout9/app').Message[];
		
		context: any;
		
		private _project;
		
		private _app;
		
		private _api;
		
		private _cwd;
		
		private _src;
		
		private _mode;
		
		private _loaded;
		
		private _personaId;
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
		send(message: string, progress?: boolean | import("@scout9/app/testing-tools").StatusCallback | undefined): Promise<ConversationEvent>;
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
		workflow(message: string, event?: Omit<Partial<import('@scout9/app').WorkflowEvent>, 'message'> | undefined): Promise<import('@scout9/app').WorkflowResponse>;
		/**
		 * Generate a response to the user from the given or registered persona's voice in relation to the current conversation's context.
		 * @param {Object} input - Generation input, defaults to test registered data such as existing messages, context, and persona information.
		 * */
		generate({ personaId, conversation, messages, context }?: {
			personaId?: string | undefined;
			conversation?: Partial<import("@scout9/admin").ConversationCreateRequest> | undefined;
			messages?: import("@scout9/app").Message[] | undefined;
			context?: any;
		} | undefined): Promise<import('@scout9/admin').GenerateResponse>;
		
		private _loadApp;
	}
	export namespace Spirits {
		function customer(input: ConversationData & CustomerSpiritCallbacks): Promise<ConversationEvent>;
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
		config: import('@scout9/app').Scout9ProjectBuildConfig;
		conversation: import('@scout9/app').Conversation;
		messages: Array<import('@scout9/app').Message>;
		/**
		 * - the message sent by the customer (should exist in messages)
		 */
		message: import('@scout9/app').Message;
		customer: import('@scout9/app').Customer;
		context: any;
	};
	export type ParseOutput = {
		messages: Array<import('@scout9/app').Message>;
		conversation: import('@scout9/app').Conversation;
		message: import('@scout9/app').Message;
		context: any;
	};
	export type WorkflowOutput = {
		slots: Array<import('@scout9/app').WorkflowResponseSlot>;
		messages: Array<import('@scout9/app').Message>;
		conversation: import('@scout9/app').Conversation;
		context: any;
	};
	export type GenerateOutput = {
		generate: import('@scout9/admin').GenerateResponse | undefined;
		messages: Array<import('@scout9/app').Message>;
		conversation: import('@scout9/app').Conversation;
		context: any;
	};
	export type ParseFun = (message: string, language: string | undefined) => Promise<import('@scout9/admin').ParseResponse>;
	export type WorkflowFun = (event: import('@scout9/app').WorkflowEvent) => Promise<import('@scout9/app').WorkflowResponse>;
	export type GenerateFun = (data: import('@scout9/admin').GenerateRequestOneOf) => Promise<import('@scout9/admin').GenerateResponse>;
	export type IdGeneratorFun = (prefix: any) => string;
	export type StatusCallback = (message: string, level?: 'info' | 'warn' | 'error' | 'success' | undefined, type?: string | undefined, payload?: any | undefined) => void;
	export type CustomerSpiritCallbacks = {
		parser: ParseFun;
		workflow: WorkflowFun;
		generator: GenerateFun;
		idGenerator: IdGeneratorFun;
		progress?: StatusCallback | undefined;
	};
	export type ConversationEvent = {
		conversation: Change<import('@scout9/app').Conversation> & {
			forwardNote?: string;
			forward?: import('@scout9/app').WorkflowResponseSlot['forward'];
		};
		messages: Change<Array<import('@scout9/app').Message>>;
		context: Change<Object>;
		message: Change<import('@scout9/app').Message>;
	};
}

declare module '@scout9/app/spirits' {
	export namespace Spirits {
		function customer(input: ConversationData & CustomerSpiritCallbacks): Promise<ConversationEvent>;
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
		config: import('@scout9/app').Scout9ProjectBuildConfig;
		conversation: import('@scout9/app').Conversation;
		messages: Array<import('@scout9/app').Message>;
		/**
		 * - the message sent by the customer (should exist in messages)
		 */
		message: import('@scout9/app').Message;
		customer: import('@scout9/app').Customer;
		context: any;
	};
	export type ParseOutput = {
		messages: Array<import('@scout9/app').Message>;
		conversation: import('@scout9/app').Conversation;
		message: import('@scout9/app').Message;
		context: any;
	};
	export type WorkflowOutput = {
		slots: Array<import('@scout9/app').WorkflowResponseSlot>;
		messages: Array<import('@scout9/app').Message>;
		conversation: import('@scout9/app').Conversation;
		context: any;
	};
	export type GenerateOutput = {
		generate: import('@scout9/admin').GenerateResponse | undefined;
		messages: Array<import('@scout9/app').Message>;
		conversation: import('@scout9/app').Conversation;
		context: any;
	};
	export type ParseFun = (message: string, language: string | undefined) => Promise<import('@scout9/admin').ParseResponse>;
	export type WorkflowFun = (event: import('@scout9/app').WorkflowEvent) => Promise<import('@scout9/app').WorkflowResponse>;
	export type GenerateFun = (data: import('@scout9/admin').GenerateRequestOneOf) => Promise<import('@scout9/admin').GenerateResponse>;
	export type IdGeneratorFun = (prefix: any) => string;
	export type StatusCallback = (message: string, level?: 'info' | 'warn' | 'error' | 'success' | undefined, type?: string | undefined, payload?: any | undefined) => void;
	export type CustomerSpiritCallbacks = {
		parser: ParseFun;
		workflow: WorkflowFun;
		generator: GenerateFun;
		idGenerator: IdGeneratorFun;
		progress?: StatusCallback | undefined;
	};
	export type ConversationEvent = {
		conversation: Change<import('@scout9/app').Conversation> & {
			forwardNote?: string;
			forward?: import('@scout9/app').WorkflowResponseSlot['forward'];
		};
		messages: Change<Array<import('@scout9/app').Message>>;
		context: Change<Object>;
		message: Change<import('@scout9/app').Message>;
	};
}

//# sourceMappingURL=index.d.ts.map