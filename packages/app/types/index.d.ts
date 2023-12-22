declare module '@scout9/app' {
  /**
   * Represents the configuration provided in src/index.{js | ts} in a project
   */
  export interface Scout9ProjectConfig {
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
	  engine: 'llama',
	  model: string;
	} | {
	  engine: 'bard',
	  model: string;
	},
	/**
	 * Configure personal model transformer (PMT) settings to align auto replies the agent's tone
	 */
	pmt: {
	  engine: 'scout9',
	  model: 'orin-1.0' | 'orin-2.0-preview'
	}
  }

  /**
   * Including the provided project config, this is the manifest for all entities and workflows to be managed in build
   */
  export interface Scout9ProjectBuildConfig extends Scout9ProjectConfig {
	agents: Agent[];
	entities: {
	  entities: string[];
	  entity: string;
	  id: string;
	  definitions?:  {
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
	}[];
	workflows: {
	  entities: string[];
	  entity: string;
	}
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
  }

  export interface Message {
	role: 'customer' | 'agent' | 'system';
	content: string;
	name?: string;
	time: string;
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
	id: string;
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
	audioRef?: any[];
  }

  export interface WorkflowEvent {
	messages: Message[];
	conversation: Conversation;
	context: any;
	message: Message;
	agent: Agent;
	customer: Customer;
	intent: string;
  }

  // forward: ForwardSchema.optional(),
  //   instructions: z.union([z.string(), z.array(z.string())]).optional(),
  //   message: z.string().optional(),
  //   secondsDelay: z.number().optional(),
  //   scheduled: z.number().optional(),
  //   contextUpsert: ConversationContext.optional(),
  //   resetIntent: z.boolean().optional(),

  // export const ForwardSchema = z.union([
  //   z.boolean(),
  //   z.string(),
  //   z.object({
  //     to: z.string().optional(),
  //     mode: z.enum(['after-reply', 'immediately']).optional(),
  //   }),
  // ]);
  export interface WorkflowResponseSlot<Type = any> {
	forward?: string | boolean | {
	  to?: string;
	  mode?: 'after-reply' | 'immediately';
	};
	instructions?: string | string[];
	message?: string;
	secondsDelay?: number;
	scheduled?: number;
	contextUpsert?: Partial<Type>;
	resetIntent?: boolean;
  }

  export type WorkflowResponse<Type> = WorkflowResponseSlot<Type> | WorkflowResponseSlot<Type>[];

  export function json<Type = any>(data: Type, init?: ResponseInit): Promise<EventResponse<Type>>;
  export function run<Type = any>(event: WorkflowEvent, options: RunOptions): Promise<WorkflowResponse<Type>>;
  export function sendEvent<Type = any>(event: WorkflowEvent, options: RunOptions): Promise<WorkflowResponse<Type>>;
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
}

//# sourceMappingURL=index.d.ts.map