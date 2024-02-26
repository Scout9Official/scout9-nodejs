
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
  audioRef?: any[];
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
  agent: Omit<Agent, 'transcripts' | 'audioRef' | 'includedLocations' | 'excludedLocations' | 'model' | 'context'>;
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

export declare function json<Type = any>(data: Type, init?: ResponseInit): Promise<EventResponse<Type>>;

export declare function run<Type = any>(event: WorkflowEvent, options?: RunOptions): Promise<WorkflowResponse<Type>>;

export declare function sendEvent<Type = any>(event: WorkflowEvent, options?: RunOptions): Promise<WorkflowResponse<Type>>;

export declare function build(options?: BuildOptions): Promise<Scout9ProjectBuildConfig>;

export declare function deploy(options?: DeployOptions): Promise<Scout9ProjectBuildConfig>;

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
