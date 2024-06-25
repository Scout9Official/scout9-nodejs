
/**
 * Represents the configuration provided in src/index.{js | ts} in a project
 * @deprecated use IScout9ProjectConfig
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
 * @deprecated use IEntityConfiguration
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
 * @deprecated use IEntityRootProjectConfiguration instead
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

/**
 * @deprecated use IEntitiesRootProjectConfiguration instead
 */
export type EntitiesBuildConfig = ExportedEntityBuildConfig[];

/**
 * @deprecated use IWorkflowConfiguration instead
 */
export type WorkflowBuildConfig = {
  entities: string[];
  entity: string;
}

/**
 * @deprecated use IWorkflowsConfiguration instead
 */
export type WorkflowsBuildConfig = WorkflowBuildConfig[];

/**
 * Including the provided project config, this is the manifest for all entities and workflows to be managed in build
 * @deprecated IScout9ProjectBuildConfig
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

/**
 * @deprecated use IConversation
 */
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

/**
 * @typedef {import('./runtime/client/message.js').IMessage} IMessage
 * @deprecated use IMessage
 */
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

/**
 * @deprecated use ICustomer
 */
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

/**
 * @deprecated use IAgent
 */
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

/**
 * @deprecated use IPersona
 */
export type Persona = Agent;

/**
 * The input event provided to the application
 * @deprecated use IWorkflowEvent
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

/**
 * @deprecated use IInstruction
 */
export interface Instruction {
  id: string;
  content: string;
}

/**
 * @deprecated use IWorkflowResponseSlot
 */
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

/**
 * @deprecated use IWorkflowResponse
 */
export type WorkflowResponse<Type = any> = WorkflowResponseSlot<Type> | WorkflowResponseSlot<Type>[];

/**
 * @deprecated use IWorkflowFunction
 */
export type WorkflowFunction<Type = any> = (event: WorkflowEvent) => Promise<WorkflowResponse<Type>> | WorkflowResponse<Type>;
