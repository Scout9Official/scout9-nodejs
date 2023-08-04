import { Timestamp } from '../common';
import { ConversationParsed } from './parsed';

/**
 * Used to put 'system' messages into the conversation
 * scout9-conversations/{conversationId}/context/{contextId}
 */
export interface IConversationContextField {
  id: string;
  /**
   * Gets added to the message under role 'system'
   */
  time: Timestamp;
  context: string;
  note?: string;
  metadata?: {[key: string]: any};

  /**
   * Conditional that need to be met in order for this context to be apart of the conversation
   */
  conditions?: IConversationContextGroup[];

  /**
   * If all conditions are met, then it will trigger the following API keys
   * If [info.triggers[i]] exists, then it should not trigger
   */
  triggers?: string[];

}

/**
 * Used to group context fields together
 */
export interface IConversationContextGroup {
  conditions: IConversationContextFieldCondition[];
}

/**
 * Based on the data from scout9-conversations/{uid}/conversations/{convoId}/info/default
 * Checks to see if that data meets the given condition in order to release the API call
 */
export interface IConversationContextFieldCondition {

  /**
   * What field in the conversation info is being checked
   */
  key: keyof ConversationParsed;

  /**
   * Operator to evaluate the info[key] against the conditional value
   */
  operator: 'eq' | '==' | 'neq' | '!=' | 'gt' | '>' | 'gte' | '>=' | 'lt' | '<' | 'lte' | '<=' | 'in' | 'nin' | 'exists' | '!!' | 'notExists' | '!' | 'contains' | 'notContains' | 'startsWith' | 'endsWith';

  /**
   * If provided, it will skip operator check and use the regex to check the value
   */
  regex?: string;

  /**
   * What is the value being checked
   */
  value: string | number | boolean | null | string[] | number[] | boolean[];

}
