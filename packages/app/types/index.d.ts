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

declare module '@scout9/app/types' {
	import type { z } from 'zod';
	export const customerValueSchema: z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>;
	export const customerSchema: z.ZodObject<{
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
	}, "strip", z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, z.objectOutputType<{
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
	}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">, z.objectInputType<{
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
	}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">>;
	export const agentBaseConfigurationSchema: z.ZodObject<{
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
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		inactive: z.ZodOptional<z.ZodBoolean>;
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
			content: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}, {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
	}, "strip", z.ZodTypeAny, {
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}, {
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
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
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}>;
	export const agentConfigurationSchema: z.ZodObject<{
		inactive: z.ZodOptional<z.ZodBoolean>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			content: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}, {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
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
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		id: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		id: string;
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		inactive?: boolean | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		transcripts?: {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
	}, {
		id: string;
		inactive?: boolean | undefined;
		title?: string | undefined;
		context?: string | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		transcripts?: {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
	}>;
	export const agentsConfigurationSchema: z.ZodArray<z.ZodObject<{
		inactive: z.ZodOptional<z.ZodBoolean>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			content: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}, {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
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
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		id: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		id: string;
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		inactive?: boolean | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		transcripts?: {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
	}, {
		id: string;
		inactive?: boolean | undefined;
		title?: string | undefined;
		context?: string | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		transcripts?: {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
	}>, "many">;
	export const agentsBaseConfigurationSchema: z.ZodArray<z.ZodObject<{
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
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		inactive: z.ZodOptional<z.ZodBoolean>;
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
			content: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}, {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
	}, "strip", z.ZodTypeAny, {
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}, {
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
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
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}>, "many">;
	/**
	 * Utility runtime class used to guide event output
	 */
	export class EventResponse {
		static json(body: any, options: any): EventResponse;
		constructor(body: any, init: any);
		body: any;
		init: any;
		get response(): Response;
		get data(): any;
	}
	export const Scout9ProjectBuildConfigSchema: z.ZodObject<{
		tag: z.ZodOptional<z.ZodString>;
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
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			inactive: z.ZodOptional<z.ZodBoolean>;
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
				content: z.ZodString;
				role: z.ZodEnum<["agent", "customer", "system"]>;
				time: z.ZodString;
				name: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				time: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
			}, {
				time: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
			}>, "many">, "many">>;
			audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		}, "strip", z.ZodTypeAny, {
			title: string;
			context: string;
			model: "openai" | "bard" | "Scout9";
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			transcripts?: {
				time: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}, {
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
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
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}>, "many">;
		entities: z.ZodArray<z.ZodEffects<z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
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
			id?: string | undefined;
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
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
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
			id?: string | undefined;
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
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
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
			id?: string | undefined;
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
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
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
			id?: string | undefined;
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
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
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
		initialContext: z.ZodArray<z.ZodString, "many">;
		maxLockAttempts: z.ZodOptional<z.ZodNumber>;
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
		agents: {
			title: string;
			context: string;
			model: "openai" | "bard" | "Scout9";
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			transcripts?: {
				time: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
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
			id?: string | undefined;
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
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
		}[];
		initialContext: string[];
		workflows: {
			entity: string;
			entities: string[];
		}[];
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
		agents: {
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
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
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
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
			id?: string | undefined;
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
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
		}[];
		initialContext: string[];
		workflows: {
			entity: string;
			entities: string[];
		}[];
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
	export const _entityApiConfigurationSchema: z.ZodObject<{
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
	}>;
	export const entityApiConfigurationSchema: z.ZodNullable<z.ZodObject<{
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
	export const entityConfigurationSchema: z.ZodEffects<z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
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
	export const entitiesRootConfigurationSchema: z.ZodArray<z.ZodEffects<z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
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
	export const entityRootProjectConfigurationSchema: z.ZodEffects<z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
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
		id?: string | undefined;
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
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
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
		id?: string | undefined;
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
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
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
		id?: string | undefined;
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
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
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
		id?: string | undefined;
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
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
	}>;
	export const entitiesRootProjectConfigurationSchema: z.ZodArray<z.ZodEffects<z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
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
		id?: string | undefined;
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
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
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
		id?: string | undefined;
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
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
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
		id?: string | undefined;
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
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
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
		id?: string | undefined;
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
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
	}>, "many">;
	export const MessageSchema: z.ZodObject<{
		content: z.ZodString;
		role: z.ZodEnum<["agent", "customer", "system"]>;
		time: z.ZodString;
		name: z.ZodOptional<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		time: string;
		content: string;
		role: "agent" | "customer" | "system";
		name?: string | undefined;
	}, {
		time: string;
		content: string;
		role: "agent" | "customer" | "system";
		name?: string | undefined;
	}>;
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
	export const ConversationSchema: z.ZodObject<{
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
	}, "strip", z.ZodTypeAny, {
		environment: "email" | "phone" | "web";
		$agent: string;
		$customer: string;
		initialContexts?: string[] | undefined;
		environmentProps?: {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		} | undefined;
	}, {
		environment: "email" | "phone" | "web";
		$agent: string;
		$customer: string;
		initialContexts?: string[] | undefined;
		environmentProps?: {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		} | undefined;
	}>;
	export const IntentWorkflowEventSchema: z.ZodObject<{
		current: z.ZodNullable<z.ZodString>;
		flow: z.ZodArray<z.ZodString, "many">;
		initial: z.ZodNullable<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		current: string | null;
		initial: string | null;
		flow: string[];
	}, {
		current: string | null;
		initial: string | null;
		flow: string[];
	}>;
	export const WorkflowEventSchema: z.ZodObject<{
		messages: z.ZodArray<z.ZodObject<{
			content: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}, {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}>, "many">;
		conversation: z.ZodObject<{
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
		}, "strip", z.ZodTypeAny, {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
		}, {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
		}>;
		context: z.ZodAny;
		message: z.ZodObject<{
			content: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}, {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}>;
		agent: z.ZodObject<{
			inactive: z.ZodOptional<z.ZodBoolean>;
			title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
				content: z.ZodString;
				role: z.ZodEnum<["agent", "customer", "system"]>;
				time: z.ZodString;
				name: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				time: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
			}, {
				time: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
			}>, "many">, "many">>;
			audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
			includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
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
			programmablePhoneNumber: z.ZodOptional<z.ZodString>;
			programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
			programmableEmail: z.ZodOptional<z.ZodString>;
			forwardEmail: z.ZodOptional<z.ZodString>;
			forwardPhone: z.ZodOptional<z.ZodString>;
			id: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			title: string;
			context: string;
			model: "openai" | "bard" | "Scout9";
			inactive?: boolean | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			transcripts?: {
				time: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}, {
			id: string;
			inactive?: boolean | undefined;
			title?: string | undefined;
			context?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			transcripts?: {
				time: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			model?: "openai" | "bard" | "Scout9" | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
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
		}, "strip", z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, z.objectOutputType<{
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
		}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">, z.objectInputType<{
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
		}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">>;
		intent: z.ZodObject<{
			current: z.ZodNullable<z.ZodString>;
			flow: z.ZodArray<z.ZodString, "many">;
			initial: z.ZodNullable<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			current: string | null;
			initial: string | null;
			flow: string[];
		}, {
			current: string | null;
			initial: string | null;
			flow: string[];
		}>;
		stagnationCount: z.ZodNumber;
		note: z.ZodOptional<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		message: {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		};
		agent: {
			id: string;
			title: string;
			context: string;
			model: "openai" | "bard" | "Scout9";
			inactive?: boolean | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			transcripts?: {
				time: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
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
			[k: string]: string | number | boolean;
		};
		intent: {
			current: string | null;
			initial: string | null;
			flow: string[];
		};
		conversation: {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
		};
		messages: {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}[];
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}, {
		message: {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		};
		agent: {
			id: string;
			inactive?: boolean | undefined;
			title?: string | undefined;
			context?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			transcripts?: {
				time: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			model?: "openai" | "bard" | "Scout9" | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
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
			[k: string]: string | number | boolean;
		};
		intent: {
			current: string | null;
			initial: string | null;
			flow: string[];
		};
		conversation: {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
		};
		messages: {
			time: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
		}[];
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}>;
	export const ConversationContext: any;
	export const ForwardSchema: z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
		to: z.ZodOptional<z.ZodString>;
		mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
	}, "strip", z.ZodTypeAny, {
		to?: string | undefined;
		mode?: "after-reply" | "immediately" | undefined;
	}, {
		to?: string | undefined;
		mode?: "after-reply" | "immediately" | undefined;
	}>]>;
	export const InstructionSchema: z.ZodObject<{
		id: z.ZodString;
		content: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		id: string;
		content: string;
	}, {
		id: string;
		content: string;
	}>;
	/**
	 * If its a string, it will be sent as a static string.
	 * If it's a object or WorkflowResponseMessageAPI - it will use
	 */
	export const WorkflowResponseMessage: z.ZodUnion<readonly [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>;
	export const WorkflowResponseMessageApiRequest: z.ZodObject<{
		uri: z.ZodString;
		data: z.ZodOptional<z.ZodAny>;
		headers: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
		method: z.ZodOptional<z.ZodEnum<["GET", "POST", "PUT"]>>;
	}, "strip", z.ZodTypeAny, {
		uri: string;
		data?: any;
		headers?: {} | undefined;
		method?: "GET" | "POST" | "PUT" | undefined;
	}, {
		uri: string;
		data?: any;
		headers?: {} | undefined;
		method?: "GET" | "POST" | "PUT" | undefined;
	}>;
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
	export const WorkflowResponseSlotSchema: z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
		}>]>>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
		} | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
		} | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>;
	export const WorkflowResponseSchema: z.ZodUnion<[z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
		}>]>>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
		} | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
		} | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>, z.ZodArray<z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
		}>]>>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
		} | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
		} | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>, "many">]>;
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