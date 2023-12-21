export type ConversationContext = { [field: string]: Primitive | ConversationContext | ConversationContext[] }
export type Primitive = string | number | boolean | null | string[] | number[] | boolean[];

/**
 *
 * @export
 * @interface Agent
 */
export interface Agent {
  /**
   * Agent first name
   * @type {string}
   * @memberof Agent
   */
  'firstName'?: string;
  /**
   * Agent last name
   * @type {string}
   * @memberof Agent
   */
  'lastName'?: string;
  /**
   * Agent is inactive
   * @type {boolean}
   * @memberof Agent
   */
  'inactive'?: boolean;
  /**
   * Programmable phone number
   * @type {string}
   * @memberof Agent
   */
  'programmablePhoneNumber'?: string;
  /**
   * Programmable phone number SID
   * @type {string}
   * @memberof Agent
   */
  'programmablePhoneNumberSid'?: string;
  /**
   * Email address from Scout9 gmail subdomain
   * @type {string}
   * @memberof Agent
   */
  'programmableEmail'?: string;
  /**
   * Forward email
   * @type {string}
   * @memberof Agent
   */
  'forwardEmail'?: string;
  /**
   * Forward phone
   * @type {string}
   * @memberof Agent
   */
  'forwardPhone'?: string;
  /**
   * Title of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof Agent
   */
  'title'?: string;
  /**
   * Context of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof Agent
   */
  'context'?: string;
  /**
   * Locations ids the agent is included in
   * @type {Array<string>}
   * @memberof Agent
   */
  'includedLocations'?: Array<string>;
  /**
   * AI Model
   * @type {string}
   * @memberof Agent
   */
  'model'?: AgentModelEnum;
  /**
   * Locations id the agent is excluded from
   * @type {Array<string>}
   * @memberof Agent
   */
  'excludedLocations'?: Array<string>;
}
export declare const AgentModelEnum: {
  readonly Scout9: "Scout9";
  readonly Bard: "bard";
  readonly Null: "null";
};
export type AgentModelEnum = typeof AgentModelEnum[keyof typeof AgentModelEnum];
/**
 *
 * @export
 * @interface AndLogic
 */
export interface AndLogic {
  /**
   *
   * @type {Array<Logic>}
   * @memberof AndLogic
   */
  'and': Array<Logic>;
}
/**
 * @type AnyValue
 * @export
 */
export type AnyValue = boolean | number | object | string;
/**
 *
 * @export
 * @interface ApiOperation
 */
export interface ApiOperation {
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof ApiOperation
   */
  'time': string;
  /**
   * The model that was created, updated, or deleted
   * @type {string}
   * @memberof ApiOperation
   */
  'model': string;
  /**
   * The method that was called
   * @type {string}
   * @memberof ApiOperation
   */
  'method': ApiOperationMethodEnum;
  /**
   *
   * @type {{ [key: string]: any; }}
   * @memberof ApiOperation
   */
  'results': {
    [key: string]: any;
  };
}
export declare const ApiOperationMethodEnum: {
  readonly Get: "get";
  readonly Post: "post";
  readonly Put: "put";
  readonly Delete: "delete";
  readonly Patch: "patch";
};
export type ApiOperationMethodEnum = typeof ApiOperationMethodEnum[keyof typeof ApiOperationMethodEnum];
/**
 *
 * @export
 * @interface BlockInfo
 */
export interface BlockInfo {
  /**
   *
   * @type {string}
   * @memberof BlockInfo
   */
  'message'?: string;
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof BlockInfo
   */
  'time'?: string;
}
/**
 * @type Condition
 * @export
 */
export type Condition = EqualityCondition | ExistsCondition | RegexCondition;
/**
 *
 * @export
 * @interface ConditionBase
 */
export interface ConditionBase {
  /**
   *
   * @type {string}
   * @memberof ConditionBase
   */
  'path': string;
  /**
   *
   * @type {Operator}
   * @memberof ConditionBase
   */
  'operator': Operator;
  /**
   *
   * @type {any}
   * @memberof ConditionBase
   */
  'value'?: any;
  /**
   *
   * @type {boolean}
   * @memberof ConditionBase
   */
  'external'?: boolean;
}
/**
 *
 * @export
 * @interface ConditionLogic
 */
export interface ConditionLogic {
  /**
   *
   * @type {Condition}
   * @memberof ConditionLogic
   */
  'condition': Condition;
}
/**
 *
 * @export
 * @interface Context
 */
export interface Context {
  /**
   * The name of the context
   * @type {string}
   * @memberof Context
   */
  'name': string;
  /**
   * Whether or not the context is modifiable
   * @type {boolean}
   * @memberof Context
   */
  'modifiable'?: boolean;
  /**
   * The description of the context
   * @type {string}
   * @memberof Context
   */
  'description'?: string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof Context
   */
  'detection'?: ContextDetectionParams;
  /**
   * The API to use for context detection
   * @type {string}
   * @memberof Context
   */
  'detectionApi'?: string;
  /**
   * The ID column of the context
   * @type {string}
   * @memberof Context
   */
  'idColumn'?: string;
  /**
   * The columns of the context
   * @type {Array<string>}
   * @memberof Context
   */
  'columns'?: Array<string>;
  /**
   * The required columns of the context
   * @type {Array<string>}
   * @memberof Context
   */
  'requiredColumns'?: Array<string>;
  /**
   * Whether or not to force NER
   * @type {boolean}
   * @memberof Context
   */
  'forceNER'?: boolean;
  /**
   *
   * @type {ContextModel}
   * @memberof Context
   */
  'model'?: ContextModel;
}
/**
 *
 * @export
 * @interface ContextDetectionDocument
 */
export interface ContextDetectionDocument {
  /**
   * The languages the entity is available in
   * @type {string}
   * @memberof ContextDetectionDocument
   */
  'language'?: string;
  /**
   *
   * @type {string}
   * @memberof ContextDetectionDocument
   */
  'text': string;
  /**
   *
   * @type {string}
   * @memberof ContextDetectionDocument
   */
  'intent'?: string;
}
/**
 *
 * @export
 * @interface ContextDetectionEntity
 */
export interface ContextDetectionEntity {
  /**
   * The utterance ID of the entity
   * @type {string}
   * @memberof ContextDetectionEntity
   */
  'utteranceId'?: string;
  /**
   * The classification of the given text
   * @type {string}
   * @memberof ContextDetectionEntity
   */
  'option': string;
  /**
   * The languages the entity is available in
   * @type {Array<string>}
   * @memberof ContextDetectionEntity
   */
  'languages'?: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof ContextDetectionEntity
   */
  'text': Array<string>;
}
/**
 *
 * @export
 * @interface ContextDetectionParams
 */
export interface ContextDetectionParams {
  /**
   *
   * @type {Array<ContextDetectionEntity>}
   * @memberof ContextDetectionParams
   */
  'entities': Array<ContextDetectionEntity>;
  /**
   *
   * @type {Array<ContextDetectionDocument>}
   * @memberof ContextDetectionParams
   */
  'documents': Array<ContextDetectionDocument>;
  /**
   * The activation intent of the context
   * @type {string}
   * @memberof ContextDetectionParams
   */
  'activationIntent'?: string;
  /**
   *
   * @type {Array<ContextDetectionTest>}
   * @memberof ContextDetectionParams
   */
  'test'?: Array<ContextDetectionTest>;
}
/**
 *
 * @export
 * @interface ContextDetectionTest
 */
export interface ContextDetectionTest {
  /**
   *
   * @type {string}
   * @memberof ContextDetectionTest
   */
  'language'?: string;
  /**
   *
   * @type {string}
   * @memberof ContextDetectionTest
   */
  'text': string;
  /**
   *
   * @type {ContextDetectionTestExpected}
   * @memberof ContextDetectionTest
   */
  'expected': ContextDetectionTestExpected;
}
/**
 * The expected result of the test
 * @export
 * @interface ContextDetectionTestExpected
 */
export interface ContextDetectionTestExpected {
  /**
   *
   * @type {string}
   * @memberof ContextDetectionTestExpected
   */
  'intent': string;
  /**
   *
   * @type {Array<ParsedContextEntity>}
   * @memberof ContextDetectionTestExpected
   */
  'entities': Array<ParsedContextEntity>;
}
/**
 * The model to use for context detection
 * @export
 * @interface ContextModel
 */
export interface ContextModel {
  /**
   * The last time the model was updated
   * @type {string}
   * @memberof ContextModel
   */
  'lastUpdate': string;
  /**
   * The reference to the model
   * @type {string}
   * @memberof ContextModel
   */
  'ref': string;
}
/**
 * @type ContextRowValue
 * @export
 */
export type ContextRowValue = number | string;
/**
 *
 * @export
 * @interface ContextTestRequest
 */
export interface ContextTestRequest {
  /**
   * The context id to test
   * @type {string}
   * @memberof ContextTestRequest
   */
  'context': string;
  /**
   *
   * @type {Array<ContextDetectionTest>}
   * @memberof ContextTestRequest
   */
  'data'?: Array<ContextDetectionTest>;
  /**
   * If true, the context will be saved to the database as an update call
   * @type {boolean}
   * @memberof ContextTestRequest
   */
  'save'?: boolean;
}
/**
 *
 * @export
 * @interface ContextTestResponse
 */
export interface ContextTestResponse {
  /**
   * The context id to test
   * @type {string}
   * @memberof ContextTestResponse
   */
  'message'?: string;
  /**
   * Success percentage of the context detection in decimal format
   * @type {number}
   * @memberof ContextTestResponse
   */
  'success'?: number;
}
/**
 *
 * @export
 * @interface Conversation
 */
export interface Conversation {
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof Conversation
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof Conversation
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof Conversation
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
  /**
   * Customer this conversation is with
   * @type {string}
   * @memberof Conversation
   */
  '$customer': string;
  /**
   *
   * @type {ConversationEnvironment}
   * @memberof Conversation
   */
  'environment': ConversationEnvironment;
}
/**
 *
 * @export
 * @interface ConversationAllOf
 */
export interface ConversationAllOf {
  /**
   * Customer this conversation is with
   * @type {string}
   * @memberof ConversationAllOf
   */
  '$customer': string;
  /**
   *
   * @type {ConversationEnvironment}
   * @memberof ConversationAllOf
   */
  'environment': ConversationEnvironment;
}
/**
 * Base props all conversation types will have
 * @export
 * @interface ConversationBase
 */
export interface ConversationBase {
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof ConversationBase
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof ConversationBase
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof ConversationBase
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
}
/**
 * Environment properties for the conversation
 * @export
 * @interface ConversationBaseEnvironmentProps
 */
export interface ConversationBaseEnvironmentProps {
  /**
   * HTML subject line
   * @type {string}
   * @memberof ConversationBaseEnvironmentProps
   */
  'subject'?: string;
  /**
   * Used to sync email messages with the conversation
   * @type {string}
   * @memberof ConversationBaseEnvironmentProps
   */
  'platformEmailThreadId'?: string;
}
/**
 *
 * @export
 * @interface ConversationContextField
 */
export interface ConversationContextField {
  /**
   * The ID of the context
   * @type {string}
   * @memberof ConversationContextField
   */
  'id': string;
  /**
   * The time the context was created
   * @type {string}
   * @memberof ConversationContextField
   */
  'time'?: string;
  /**
   * The context of the conversation
   * @type {string}
   * @memberof ConversationContextField
   */
  'context': string;
  /**
   * The note of the conversation
   * @type {string}
   * @memberof ConversationContextField
   */
  'note'?: string;
  /**
   * The metadata of the conversation
   * @type {object}
   * @memberof ConversationContextField
   */
  'metadata'?: object;
  /**
   *
   * @type {Logic}
   * @memberof ConversationContextField
   */
  'logic'?: Logic;
  /**
   * The conditions of the conversation
   * @type {Array<ConversationContextGroup>}
   * @memberof ConversationContextField
   * @deprecated
   */
  'conditions'?: Array<ConversationContextGroup>;
  /**
   * The triggers of the conversation
   * @type {Array<string>}
   * @memberof ConversationContextField
   */
  'triggers'?: Array<string>;
}
/**
 *
 * @export
 * @interface ConversationContextFieldCondition
 */
export interface ConversationContextFieldCondition {
  /**
   * The key of the condition
   * @type {string}
   * @memberof ConversationContextFieldCondition
   */
  'key': string;
  /**
   * The operator of the condition or query
   * @type {string}
   * @memberof ConversationContextFieldCondition
   */
  'operator': ConversationContextFieldConditionOperatorEnum;
  /**
   * The regex of the condition
   * @type {string}
   * @memberof ConversationContextFieldCondition
   */
  'regex'?: string;
  /**
   *
   * @type {AnyValue}
   * @memberof ConversationContextFieldCondition
   */
  'value': AnyValue;
}
export declare const ConversationContextFieldConditionOperatorEnum: {
  readonly Eq: "eq";
  readonly Equal: "equal";
  readonly Ne: "ne";
  readonly NotEquals: "not-equals";
  readonly Gt: "gt";
  readonly GreaterThan: "greater-than";
  readonly Gte: "gte";
  readonly GreaterThanEquals: "greater-than-equals";
  readonly Lt: "lt";
  readonly LessThan: "less-than";
  readonly Lte: "lte";
  readonly LessThanEquals: "less-than-equals";
  readonly ArrayContains: "array-contains";
  readonly In: "in";
  readonly ArrayContainsAny: "array-contains-any";
  readonly NotIn: "not-in";
  readonly Exists: "exists";
  readonly NotExists: "notExists";
  readonly Contains: "contains";
  readonly NotContains: "notContains";
  readonly StartsWith: "startsWith";
  readonly EndsWith: "endsWith";
};
export type ConversationContextFieldConditionOperatorEnum = typeof ConversationContextFieldConditionOperatorEnum[keyof typeof ConversationContextFieldConditionOperatorEnum];
/**
 *
 * @export
 * @interface ConversationContextGroup
 */
export interface ConversationContextGroup {
  /**
   * The conditions of the conversation
   * @type {Array<ConversationContextFieldCondition>}
   * @memberof ConversationContextGroup
   */
  'conditions': Array<ConversationContextFieldCondition>;
}
/**
 *
 * @export
 * @interface ConversationCreateRequest
 */
export interface ConversationCreateRequest {
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof ConversationCreateRequest
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof ConversationCreateRequest
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof ConversationCreateRequest
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
  /**
   * Customer this conversation is with
   * @type {string}
   * @memberof ConversationCreateRequest
   */
  '$customer': string;
  /**
   *
   * @type {ConversationEnvironment}
   * @memberof ConversationCreateRequest
   */
  'environment': ConversationEnvironment;
  /**
   *
   * @type {ConversationUpdateRequestBaseWorkflow}
   * @memberof ConversationCreateRequest
   */
  '$workflow'?: ConversationUpdateRequestBaseWorkflow;
}
/**
 *
 * @export
 * @interface ConversationCreateRequestBase
 */
export interface ConversationCreateRequestBase {
  /**
   *
   * @type {ConversationUpdateRequestBaseWorkflow}
   * @memberof ConversationCreateRequestBase
   */
  '$workflow'?: ConversationUpdateRequestBaseWorkflow;
}
/**
 *
 * @export
 * @interface ConversationCreateResponse
 */
export interface ConversationCreateResponse {
  /**
   *
   * @type {boolean}
   * @memberof ConversationCreateResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof ConversationCreateResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof ConversationCreateResponse
   */
  'id': string;
  /**
   * The client web url of the conversation
   * @type {string}
   * @memberof ConversationCreateResponse
   */
  'clientWebUrl'?: string;
  /**
   * The agent web url of the conversation (requires phone two-factor authentication)
   * @type {string}
   * @memberof ConversationCreateResponse
   */
  'agentWebUrl'?: string;
  /**
   * The agent test web url of the conversation, used for testing the conversation without notifying the customer
   * @type {string}
   * @memberof ConversationCreateResponse
   */
  'agentTestWebUrl'?: string;
  /**
   * ISO 8601 date string of when the conversation was initiated
   * @type {string}
   * @memberof ConversationCreateResponse
   */
  'initiated': string;
}
/**
 *
 * @export
 * @interface ConversationCreateResponseAllOf
 */
export interface ConversationCreateResponseAllOf {
  /**
   * ISO 8601 date string of when the conversation was initiated
   * @type {string}
   * @memberof ConversationCreateResponseAllOf
   */
  'initiated': string;
}
/**
 * Environment this conversation is in (phone, web, or email) - this determines which device to send messages to
 * @export
 * @enum {string}
 */
export declare const ConversationEnvironment: {
  readonly Phone: "phone";
  readonly Web: "web";
  readonly Email: "email";
};
export type ConversationEnvironment = typeof ConversationEnvironment[keyof typeof ConversationEnvironment];
/**
 *
 * @export
 * @interface ConversationGetResponse
 */
export interface ConversationGetResponse {
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof ConversationGetResponse
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof ConversationGetResponse
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof ConversationGetResponse
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
  /**
   * Customer this conversation is with
   * @type {string}
   * @memberof ConversationGetResponse
   */
  '$customer': string;
  /**
   *
   * @type {ConversationEnvironment}
   * @memberof ConversationGetResponse
   */
  'environment': ConversationEnvironment;
  /**
   * The client web url of the conversation
   * @type {string}
   * @memberof ConversationGetResponse
   */
  'clientWebUrl'?: string;
  /**
   * The agent web url of the conversation (requires phone two-factor authentication)
   * @type {string}
   * @memberof ConversationGetResponse
   */
  'agentWebUrl'?: string;
  /**
   * The agent test web url of the conversation, used for testing the conversation without notifying the customer
   * @type {string}
   * @memberof ConversationGetResponse
   */
  'agentTestWebUrl'?: string;
  /**
   * The ID of the workflow used for this conversation
   * @type {string}
   * @memberof ConversationGetResponse
   */
  '$workflow': string;
  /**
   * ISO 8601 date string of when the conversation was initiated
   * @type {string}
   * @memberof ConversationGetResponse
   */
  'initiated': string;
  /**
   * The ID of the conversation
   * @type {string}
   * @memberof ConversationGetResponse
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ConversationGetResponseAllOf
 */
export interface ConversationGetResponseAllOf {
  /**
   * ISO 8601 date string of when the conversation was initiated
   * @type {string}
   * @memberof ConversationGetResponseAllOf
   */
  'initiated': string;
  /**
   * The ID of the conversation
   * @type {string}
   * @memberof ConversationGetResponseAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ConversationGetResponseBase
 */
export interface ConversationGetResponseBase {
  /**
   * The ID of the workflow used for this conversation
   * @type {string}
   * @memberof ConversationGetResponseBase
   */
  '$workflow': string;
}
/**
 *
 * @export
 * @interface ConversationRemoveResponse
 */
export interface ConversationRemoveResponse {
  /**
   *
   * @type {boolean}
   * @memberof ConversationRemoveResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof ConversationRemoveResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof ConversationRemoveResponse
   */
  'id': string;
}
/**
 * Base properties for all scheduled conversation types
 * @export
 * @interface ConversationScheduleParams
 */
export interface ConversationScheduleParams {
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof ConversationScheduleParams
   */
  'scheduled': string;
  /**
   * The initial message to send to the customer
   * @type {string}
   * @memberof ConversationScheduleParams
   */
  'initialMessage': string;
  /**
   * The initial message to send to the customer in HTML
   * @type {string}
   * @memberof ConversationScheduleParams
   */
  'initialMessageHtml'?: string | null;
}
/**
 *
 * @export
 * @interface ConversationUpdateRequest
 */
export interface ConversationUpdateRequest {
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof ConversationUpdateRequest
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof ConversationUpdateRequest
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof ConversationUpdateRequest
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
  /**
   * Customer this conversation is with
   * @type {string}
   * @memberof ConversationUpdateRequest
   */
  '$customer': string;
  /**
   *
   * @type {ConversationEnvironment}
   * @memberof ConversationUpdateRequest
   */
  'environment': ConversationEnvironment;
  /**
   *
   * @type {ConversationUpdateRequestAllOfWorkflow}
   * @memberof ConversationUpdateRequest
   */
  '$workflow'?: ConversationUpdateRequestAllOfWorkflow;
  /**
   * The ID of the conversation to update
   * @type {string}
   * @memberof ConversationUpdateRequest
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ConversationUpdateRequestAllOf
 */
export interface ConversationUpdateRequestAllOf {
  /**
   * The ID of the conversation to update
   * @type {string}
   * @memberof ConversationUpdateRequestAllOf
   */
  '$id': string;
  /**
   *
   * @type {ConversationUpdateRequestAllOfWorkflow}
   * @memberof ConversationUpdateRequestAllOf
   */
  '$workflow'?: ConversationUpdateRequestAllOfWorkflow;
}
/**
 * @type ConversationUpdateRequestAllOfWorkflow
 * @export
 */
export type ConversationUpdateRequestAllOfWorkflow = Workflow | string;
/**
 *
 * @export
 * @interface ConversationUpdateRequestBase
 */
export interface ConversationUpdateRequestBase {
  /**
   *
   * @type {ConversationUpdateRequestBaseWorkflow}
   * @memberof ConversationUpdateRequestBase
   */
  '$workflow'?: ConversationUpdateRequestBaseWorkflow;
}
/**
 * @type ConversationUpdateRequestBaseWorkflow
 * @export
 */
export type ConversationUpdateRequestBaseWorkflow = Workflow | string;
/**
 *
 * @export
 * @interface ConversationUpdateResponse
 */
export interface ConversationUpdateResponse {
  /**
   *
   * @type {boolean}
   * @memberof ConversationUpdateResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof ConversationUpdateResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof ConversationUpdateResponse
   */
  'id': string;
}
/**
 * Conversation web urls
 * @export
 * @interface ConversationUrls
 */
export interface ConversationUrls {
  /**
   * The client web url of the conversation
   * @type {string}
   * @memberof ConversationUrls
   */
  'clientWebUrl'?: string;
  /**
   * The agent web url of the conversation (requires phone two-factor authentication)
   * @type {string}
   * @memberof ConversationUrls
   */
  'agentWebUrl'?: string;
  /**
   * The agent test web url of the conversation, used for testing the conversation without notifying the customer
   * @type {string}
   * @memberof ConversationUrls
   */
  'agentTestWebUrl'?: string;
}
/**
 *
 * @export
 * @interface CreateAgentRequest
 */
export interface CreateAgentRequest {
  /**
   * Agent first name
   * @type {string}
   * @memberof CreateAgentRequest
   */
  'firstName': string;
  /**
   * Agent last name
   * @type {string}
   * @memberof CreateAgentRequest
   */
  'lastName': string;
  /**
   * Agent is inactive
   * @type {boolean}
   * @memberof CreateAgentRequest
   */
  'inactive'?: boolean;
  /**
   * Programmable phone number
   * @type {string}
   * @memberof CreateAgentRequest
   */
  'programmablePhoneNumber'?: string;
  /**
   * Programmable phone number SID
   * @type {string}
   * @memberof CreateAgentRequest
   */
  'programmablePhoneNumberSid'?: string;
  /**
   * Email address from Scout9 gmail subdomain
   * @type {string}
   * @memberof CreateAgentRequest
   */
  'programmableEmail'?: string;
  /**
   * Forward email
   * @type {string}
   * @memberof CreateAgentRequest
   */
  'forwardEmail': string;
  /**
   * Forward phone
   * @type {string}
   * @memberof CreateAgentRequest
   */
  'forwardPhone': string;
  /**
   * Title of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof CreateAgentRequest
   */
  'title'?: string;
  /**
   * Context of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof CreateAgentRequest
   */
  'context'?: string;
  /**
   * Locations ids the agent is included in
   * @type {Array<string>}
   * @memberof CreateAgentRequest
   */
  'includedLocations'?: Array<string>;
  /**
   * AI Model
   * @type {string}
   * @memberof CreateAgentRequest
   */
  'model'?: CreateAgentRequestModelEnum;
  /**
   * Locations id the agent is excluded from
   * @type {Array<string>}
   * @memberof CreateAgentRequest
   */
  'excludedLocations'?: Array<string>;
  /**
   * Sample conversations that help build out your agent to mimic your responses
   * @type {Array<CreateAgentRequestAllOfConversationsInner>}
   * @memberof CreateAgentRequest
   */
  'conversations'?: Array<CreateAgentRequestAllOfConversationsInner>;
  /**
   * Sample audio files that help build out your agent to mimic your voice
   * @type {Array<string>}
   * @memberof CreateAgentRequest
   */
  'audio'?: Array<string>;
}
export declare const CreateAgentRequestModelEnum: {
  readonly Scout9: "Scout9";
  readonly Bard: "bard";
  readonly Null: "null";
};
export type CreateAgentRequestModelEnum = typeof CreateAgentRequestModelEnum[keyof typeof CreateAgentRequestModelEnum];
/**
 *
 * @export
 * @interface CreateAgentRequestAllOf
 */
export interface CreateAgentRequestAllOf {
  /**
   * Sample conversations that help build out your agent to mimic your responses
   * @type {Array<CreateAgentRequestAllOfConversationsInner>}
   * @memberof CreateAgentRequestAllOf
   */
  'conversations'?: Array<CreateAgentRequestAllOfConversationsInner>;
  /**
   * Sample audio files that help build out your agent to mimic your voice
   * @type {Array<string>}
   * @memberof CreateAgentRequestAllOf
   */
  'audio'?: Array<string>;
}
/**
 * @type CreateAgentRequestAllOfConversationsInner
 * @export
 */
export type CreateAgentRequestAllOfConversationsInner = CreateAgentRequestAllOfConversationsInnerOneOf | string;
/**
 * Conversation sample
 * @export
 * @interface CreateAgentRequestAllOfConversationsInnerOneOf
 */
export interface CreateAgentRequestAllOfConversationsInnerOneOf {
  /**
   * The type or category of the conversation (this helps with associating work flows)
   * @type {string}
   * @memberof CreateAgentRequestAllOfConversationsInnerOneOf
   */
  'type': string;
  /**
   * The context of the conversation, this helps with associating work flows, or any caveats to the conversation
   * @type {string}
   * @memberof CreateAgentRequestAllOfConversationsInnerOneOf
   */
  'context'?: string;
  /**
   * Conversation
   * @type {Array<CreateAgentRequestAllOfConversationsInnerOneOfConversationInner>}
   * @memberof CreateAgentRequestAllOfConversationsInnerOneOf
   */
  'conversation': Array<CreateAgentRequestAllOfConversationsInnerOneOfConversationInner>;
}
/**
 *
 * @export
 * @interface CreateAgentRequestAllOfConversationsInnerOneOfConversationInner
 */
export interface CreateAgentRequestAllOfConversationsInnerOneOfConversationInner {
  /**
   * The speaker of the message, if this from the agent then this must have \"agent\" or match the agent\'s first or full name
   * @type {string}
   * @memberof CreateAgentRequestAllOfConversationsInnerOneOfConversationInner
   */
  'speaker': string;
  /**
   * The message content
   * @type {string}
   * @memberof CreateAgentRequestAllOfConversationsInnerOneOfConversationInner
   */
  'message': string;
}
/**
 *
 * @export
 * @interface CreateAgentResponse
 */
export interface CreateAgentResponse {
  /**
   *
   * @type {boolean}
   * @memberof CreateAgentResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof CreateAgentResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof CreateAgentResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface CreateAgentsRequest
 */
export interface CreateAgentsRequest {
  /**
   *
   * @type {Array<CreateAgentsRequestAgentsInner>}
   * @memberof CreateAgentsRequest
   */
  'agents'?: Array<CreateAgentsRequestAgentsInner>;
}
/**
 *
 * @export
 * @interface CreateAgentsRequestAgentsInner
 */
export interface CreateAgentsRequestAgentsInner {
  /**
   * Agent first name
   * @type {string}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'firstName': string;
  /**
   * Agent last name
   * @type {string}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'lastName': string;
  /**
   * Agent is inactive
   * @type {boolean}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'inactive'?: boolean;
  /**
   * Programmable phone number
   * @type {string}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'programmablePhoneNumber'?: string;
  /**
   * Programmable phone number SID
   * @type {string}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'programmablePhoneNumberSid'?: string;
  /**
   * Email address from Scout9 gmail subdomain
   * @type {string}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'programmableEmail'?: string;
  /**
   * Forward email
   * @type {string}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'forwardEmail'?: string;
  /**
   * Forward phone
   * @type {string}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'forwardPhone'?: string;
  /**
   * Title of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'title'?: string;
  /**
   * Context of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'context'?: string;
  /**
   * Locations ids the agent is included in
   * @type {Array<string>}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'includedLocations'?: Array<string>;
  /**
   * AI Model
   * @type {string}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'model'?: CreateAgentsRequestAgentsInnerModelEnum;
  /**
   * Locations id the agent is excluded from
   * @type {Array<string>}
   * @memberof CreateAgentsRequestAgentsInner
   */
  'excludedLocations'?: Array<string>;
}
export declare const CreateAgentsRequestAgentsInnerModelEnum: {
  readonly Scout9: "Scout9";
  readonly Bard: "bard";
  readonly Null: "null";
};
export type CreateAgentsRequestAgentsInnerModelEnum = typeof CreateAgentsRequestAgentsInnerModelEnum[keyof typeof CreateAgentsRequestAgentsInnerModelEnum];
/**
 *
 * @export
 * @interface CreateAgentsResponse
 */
export interface CreateAgentsResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof CreateAgentsResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof CreateAgentsResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface CreateContextDataRequest
 */
export interface CreateContextDataRequest {
  /**
   * The context id to create data for
   * @type {string}
   * @memberof CreateContextDataRequest
   */
  'context': string;
  /**
   *
   * @type {Array<{ [key: string]: ContextRowValue; }>}
   * @memberof CreateContextDataRequest
   */
  'data': Array<{
    [key: string]: ContextRowValue;
  }>;
}
/**
 *
 * @export
 * @interface CreateContextDataResponse
 */
export interface CreateContextDataResponse {
  /**
   *
   * @type {boolean}
   * @memberof CreateContextDataResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof CreateContextDataResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof CreateContextDataResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface CreateContextRequest
 */
export interface CreateContextRequest {
  /**
   * The name of the context
   * @type {string}
   * @memberof CreateContextRequest
   */
  'name': string;
  /**
   * Whether or not the context is modifiable
   * @type {boolean}
   * @memberof CreateContextRequest
   */
  'modifiable'?: boolean;
  /**
   * The description of the context
   * @type {string}
   * @memberof CreateContextRequest
   */
  'description'?: string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof CreateContextRequest
   */
  'detection'?: ContextDetectionParams;
  /**
   * The API to use for context detection
   * @type {string}
   * @memberof CreateContextRequest
   */
  'detectionApi'?: string;
  /**
   * The ID column of the context
   * @type {string}
   * @memberof CreateContextRequest
   */
  'idColumn'?: string;
  /**
   * The columns of the context
   * @type {Array<string>}
   * @memberof CreateContextRequest
   */
  'columns'?: Array<string>;
  /**
   * The required columns of the context
   * @type {Array<string>}
   * @memberof CreateContextRequest
   */
  'requiredColumns'?: Array<string>;
  /**
   * Whether or not to force NER
   * @type {boolean}
   * @memberof CreateContextRequest
   */
  'forceNER'?: boolean;
  /**
   *
   * @type {ContextModel}
   * @memberof CreateContextRequest
   */
  'model'?: ContextModel;
}
/**
 *
 * @export
 * @interface CreateContextResponse
 */
export interface CreateContextResponse {
  /**
   *
   * @type {boolean}
   * @memberof CreateContextResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof CreateContextResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof CreateContextResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface CreateContextsRequest
 */
export interface CreateContextsRequest {
  /**
   *
   * @type {Array<CreateContextsRequestContextsInner>}
   * @memberof CreateContextsRequest
   */
  'contexts'?: Array<CreateContextsRequestContextsInner>;
}
/**
 *
 * @export
 * @interface CreateContextsRequestContextsInner
 */
export interface CreateContextsRequestContextsInner {
  /**
   * The name of the context
   * @type {string}
   * @memberof CreateContextsRequestContextsInner
   */
  'name': string;
  /**
   * Whether or not the context is modifiable
   * @type {boolean}
   * @memberof CreateContextsRequestContextsInner
   */
  'modifiable'?: boolean;
  /**
   * The description of the context
   * @type {string}
   * @memberof CreateContextsRequestContextsInner
   */
  'description'?: string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof CreateContextsRequestContextsInner
   */
  'detection'?: ContextDetectionParams;
  /**
   * The API to use for context detection
   * @type {string}
   * @memberof CreateContextsRequestContextsInner
   */
  'detectionApi'?: string;
  /**
   * The ID column of the context
   * @type {string}
   * @memberof CreateContextsRequestContextsInner
   */
  'idColumn'?: string;
  /**
   * The columns of the context
   * @type {Array<string>}
   * @memberof CreateContextsRequestContextsInner
   */
  'columns'?: Array<string>;
  /**
   * The required columns of the context
   * @type {Array<string>}
   * @memberof CreateContextsRequestContextsInner
   */
  'requiredColumns'?: Array<string>;
  /**
   * Whether or not to force NER
   * @type {boolean}
   * @memberof CreateContextsRequestContextsInner
   */
  'forceNER'?: boolean;
  /**
   *
   * @type {ContextModel}
   * @memberof CreateContextsRequestContextsInner
   */
  'model'?: ContextModel;
}
/**
 *
 * @export
 * @interface CreateContextsResponse
 */
export interface CreateContextsResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof CreateContextsResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof CreateContextsResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface CreateCustomerGroupRequest
 */
export interface CreateCustomerGroupRequest {
  /**
   * The name of the customer group
   * @type {string}
   * @memberof CreateCustomerGroupRequest
   */
  'name': string;
  /**
   * The description of the customer group
   * @type {string}
   * @memberof CreateCustomerGroupRequest
   */
  'description'?: string;
  /**
   *
   * @type {{ [key: string]: any; }}
   * @memberof CreateCustomerGroupRequest
   */
  'metadata'?: {
    [key: string]: any;
  };
  /**
   *
   * @type {Array<CustomerGroupRecord>}
   * @memberof CreateCustomerGroupRequest
   */
  'customers': Array<CustomerGroupRecord>;
}
/**
 *
 * @export
 * @interface CreateCustomerGroupResponse
 */
export interface CreateCustomerGroupResponse {
  /**
   *
   * @type {boolean}
   * @memberof CreateCustomerGroupResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof CreateCustomerGroupResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof CreateCustomerGroupResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface CreateCustomerGroupsRequest
 */
export interface CreateCustomerGroupsRequest {
  /**
   *
   * @type {Array<CustomerGroup>}
   * @memberof CreateCustomerGroupsRequest
   */
  'CustomerGroups': Array<CustomerGroup>;
}
/**
 *
 * @export
 * @interface CreateCustomerGroupsResponse
 */
export interface CreateCustomerGroupsResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof CreateCustomerGroupsResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof CreateCustomerGroupsResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface CreateCustomerRequest
 */
export interface CreateCustomerRequest {
  /**
   * The customers first name
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'firstName'?: string;
  /**
   * The customers last name
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'lastName'?: string;
  /**
   * The customers full name
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'name': string;
  /**
   * The customers email address
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'email'?: string | null;
  /**
   * The customers phone number
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'phone'?: string | null;
  /**
   * The customers profile image
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'img'?: string | null;
  /**
   * The customers neighborhood
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'neighborhood'?: string | null;
  /**
   * The customers city
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'city'?: string | null;
  /**
   * The customers 2-letter country code
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'country'?: string | null;
  /**
   * The customers street address
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'line1'?: string | null;
  /**
   * The customers street address
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'line2'?: string | null;
  /**
   * The customers postal code
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'postal_code'?: string | null;
  /**
   * The customers state, county, province, or region
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'state'?: string | null;
  /**
   * The customers town (only used in Japan)
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'town'?: string | null;
  /**
   *
   * @type {BlockInfo}
   * @memberof CreateCustomerRequest
   */
  'blocked'?: BlockInfo;
  /**
   *
   * @type {BlockInfo}
   * @memberof CreateCustomerRequest
   */
  'phoneBlocked'?: BlockInfo;
  /**
   *
   * @type {BlockInfo}
   * @memberof CreateCustomerRequest
   */
  'emailBlocked'?: BlockInfo;
  /**
   * The date the customer joined the business
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'joined'?: string | null;
  /**
   * The customers stripe ID
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'stripe'?: string | null;
  /**
   * The customers stripe ID in the dev environment
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'stripeDev'?: string | null;

  'address'?: string | Address;
}

export type Address = {
  /**
   * The customers neighborhood
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'neighborhood'?: string | null;
  /**
   * The customers city
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'city'?: string | null;
  /**
   * The customers 2-letter country code
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'country'?: string | null;
  /**
   * The customers street address
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'line1'?: string | null;
  /**
   * The customers street address
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'line2'?: string | null;
  /**
   * The customers postal code
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'postal_code'?: string | null;
  /**
   * The customers state, county, province, or region
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'state'?: string | null;
  /**
   * The customers town (only used in Japan)
   * @type {string}
   * @memberof CreateCustomerRequest
   */
  'town'?: string | null;
}
/**
 *
 * @export
 * @interface CreateCustomerResponse
 */
export interface CreateCustomerResponse {
  /**
   *
   * @type {boolean}
   * @memberof CreateCustomerResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof CreateCustomerResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof CreateCustomerResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface CreateCustomersRequest
 */
export interface CreateCustomersRequest {
  /**
   *
   * @type {Array<Customer>}
   * @memberof CreateCustomersRequest
   */
  'customers': Array<Customer>;
}
/**
 *
 * @export
 * @interface CreateCustomersResponse
 */
export interface CreateCustomersResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof CreateCustomersResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof CreateCustomersResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface CreateFileRequestWithStringPurpose
 */
export interface CreateFileRequestWithStringPurpose {
  /**
   *
   * @type {File}
   * @memberof CreateFileRequestWithStringPurpose
   */
  'file': File;
  /**
   *
   * @type {string}
   * @memberof CreateFileRequestWithStringPurpose
   */
  'purpose': string;
  /**
   *
   * @type {string}
   * @memberof CreateFileRequestWithStringPurpose
   */
  'entity': string;
}
/**
 *
 * @export
 * @interface CreateWorkflowRequest
 */
export interface CreateWorkflowRequest {
  /**
   * The name of the workflow
   * @type {string}
   * @memberof CreateWorkflowRequest
   */
  'name': string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof CreateWorkflowRequest
   */
  'initiators': ContextDetectionParams;
  /**
   * The fields of the workflow
   * @type {Array<ConversationContextField>}
   * @memberof CreateWorkflowRequest
   */
  'fields': Array<ConversationContextField>;
  /**
   * About this conversation - used as initial context
   * @type {string}
   * @memberof CreateWorkflowRequest
   */
  'context': string;
  /**
   * The webhook to call when a workflow is created
   * @type {string}
   * @memberof CreateWorkflowRequest
   */
  'onCreated'?: string;
  /**
   * The webhook to call when a workflow is updated
   * @type {string}
   * @memberof CreateWorkflowRequest
   */
  'onUpdated'?: string;
  /**
   * The webhook to call when a workflow is deleted
   * @type {string}
   * @memberof CreateWorkflowRequest
   */
  'onDeleted'?: string;
  /**
   * The webhook to call when a workflow has an error
   * @type {string}
   * @memberof CreateWorkflowRequest
   */
  'onError'?: string;
  /**
   * The priority of the workflow in relation to other workflows (determines activation order)
   * @type {number}
   * @memberof CreateWorkflowRequest
   */
  'priority': number;
}
/**
 *
 * @export
 * @interface CreateWorkflowResponse
 */
export interface CreateWorkflowResponse {
  /**
   *
   * @type {boolean}
   * @memberof CreateWorkflowResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof CreateWorkflowResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof CreateWorkflowResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface CreateWorkflowsRequest
 */
export interface CreateWorkflowsRequest {
  /**
   *
   * @type {Array<CreateWorkflowsRequestWorkflowsInner>}
   * @memberof CreateWorkflowsRequest
   */
  'workflows'?: Array<CreateWorkflowsRequestWorkflowsInner>;
}
/**
 *
 * @export
 * @interface CreateWorkflowsRequestWorkflowsInner
 */
export interface CreateWorkflowsRequestWorkflowsInner {
  /**
   * The name of the workflow
   * @type {string}
   * @memberof CreateWorkflowsRequestWorkflowsInner
   */
  'name': string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof CreateWorkflowsRequestWorkflowsInner
   */
  'initiators': ContextDetectionParams;
  /**
   * The fields of the workflow
   * @type {Array<ConversationContextField>}
   * @memberof CreateWorkflowsRequestWorkflowsInner
   */
  'fields': Array<ConversationContextField>;
  /**
   * About this conversation - used as initial context
   * @type {string}
   * @memberof CreateWorkflowsRequestWorkflowsInner
   */
  'context': string;
  /**
   * The webhook to call when a workflow is created
   * @type {string}
   * @memberof CreateWorkflowsRequestWorkflowsInner
   */
  'onCreated'?: string;
  /**
   * The webhook to call when a workflow is updated
   * @type {string}
   * @memberof CreateWorkflowsRequestWorkflowsInner
   */
  'onUpdated'?: string;
  /**
   * The webhook to call when a workflow is deleted
   * @type {string}
   * @memberof CreateWorkflowsRequestWorkflowsInner
   */
  'onDeleted'?: string;
  /**
   * The webhook to call when a workflow has an error
   * @type {string}
   * @memberof CreateWorkflowsRequestWorkflowsInner
   */
  'onError'?: string;
  /**
   * The priority of the workflow in relation to other workflows (determines activation order)
   * @type {number}
   * @memberof CreateWorkflowsRequestWorkflowsInner
   */
  'priority': number;
}
/**
 *
 * @export
 * @interface CreateWorkflowsResponse
 */
export interface CreateWorkflowsResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof CreateWorkflowsResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof CreateWorkflowsResponse
   */
  '$operation': string;
}
/**
 * Represents a customer for your business or organization
 * @export
 * @interface Customer
 */
export interface Customer {
  [key: string]: CustomerValue | any;
  /**
   * The customers first name
   * @type {string}
   * @memberof Customer
   */
  'firstName'?: string;
  /**
   * The customers last name
   * @type {string}
   * @memberof Customer
   */
  'lastName'?: string;
  /**
   * The customers full name
   * @type {string}
   * @memberof Customer
   */
  'name': string;
  /**
   * The customers email address
   * @type {string}
   * @memberof Customer
   */
  'email'?: string | null;
  /**
   * The customers phone number
   * @type {string}
   * @memberof Customer
   */
  'phone'?: string | null;
  /**
   * The customers profile image
   * @type {string}
   * @memberof Customer
   */
  'img'?: string | null;
  /**
   * The customers neighborhood
   * @type {string}
   * @memberof Customer
   */
  'neighborhood'?: string | null;
  /**
   * The customers city
   * @type {string}
   * @memberof Customer
   */
  'city'?: string | null;
  /**
   * The customers 2-letter country code
   * @type {string}
   * @memberof Customer
   */
  'country'?: string | null;
  /**
   * The customers street address
   * @type {string}
   * @memberof Customer
   */
  'line1'?: string | null;
  /**
   * The customers street address
   * @type {string}
   * @memberof Customer
   */
  'line2'?: string | null;
  /**
   * The customers postal code
   * @type {string}
   * @memberof Customer
   */
  'postal_code'?: string | null;
  /**
   * The customers state, county, province, or region
   * @type {string}
   * @memberof Customer
   */
  'state'?: string | null;
  /**
   * The customers town (only used in Japan)
   * @type {string}
   * @memberof Customer
   */
  'town'?: string | null;
  /**
   *
   * @type {BlockInfo}
   * @memberof Customer
   */
  'blocked'?: BlockInfo;
  /**
   *
   * @type {BlockInfo}
   * @memberof Customer
   */
  'phoneBlocked'?: BlockInfo;
  /**
   *
   * @type {BlockInfo}
   * @memberof Customer
   */
  'emailBlocked'?: BlockInfo;
  /**
   * The date the customer joined the business
   * @type {string}
   * @memberof Customer
   */
  'joined'?: string | null;
  /**
   * The customers stripe ID
   * @type {string}
   * @memberof Customer
   */
  'stripe'?: string | null;
  /**
   * The customers stripe ID in the dev environment
   * @type {string}
   * @memberof Customer
   */
  'stripeDev'?: string | null;
}
/**
 * A way for a business to group customers to use in scheduling batch conversations
 * @export
 * @interface CustomerGroup
 */
export interface CustomerGroup {
  /**
   * The name of the customer group
   * @type {string}
   * @memberof CustomerGroup
   */
  'name': string;
  /**
   * The description of the customer group
   * @type {string}
   * @memberof CustomerGroup
   */
  'description'?: string;
  /**
   *
   * @type {{ [key: string]: any; }}
   * @memberof CustomerGroup
   */
  'metadata'?: {
    [key: string]: any;
  };
  /**
   *
   * @type {Array<CustomerGroupRecord>}
   * @memberof CustomerGroup
   */
  'customers': Array<CustomerGroupRecord>;
}
/**
 * A way for a business to group customers to use in scheduling batch conversations
 * @export
 * @interface CustomerGroupRecord
 */
export interface CustomerGroupRecord {
  /**
   * Customer this conversation is with
   * @type {string}
   * @memberof CustomerGroupRecord
   */
  'id': string;
  /**
   *
   * @type {ConversationEnvironment}
   * @memberof CustomerGroupRecord
   */
  'environment': ConversationEnvironment;
  /**
   * Overrides the default $agent for this customer
   * @type {string}
   * @memberof CustomerGroupRecord
   */
  '$agent'?: string;
}
/**
 * @type CustomerValue
 * @export
 */
export type CustomerValue = boolean | number | string;
/**
 *
 * @export
 * @interface DeleteAgentResponse
 */
export interface DeleteAgentResponse {
  /**
   *
   * @type {boolean}
   * @memberof DeleteAgentResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof DeleteAgentResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof DeleteAgentResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface DeleteAgentsResponse
 */
export interface DeleteAgentsResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof DeleteAgentsResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof DeleteAgentsResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface DeleteContextDataResponse
 */
export interface DeleteContextDataResponse {
  /**
   *
   * @type {boolean}
   * @memberof DeleteContextDataResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof DeleteContextDataResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof DeleteContextDataResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface DeleteContextResponse
 */
export interface DeleteContextResponse {
  /**
   *
   * @type {boolean}
   * @memberof DeleteContextResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof DeleteContextResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof DeleteContextResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface DeleteContextsResponse
 */
export interface DeleteContextsResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof DeleteContextsResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof DeleteContextsResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface DeleteCustomerGroupResponse
 */
export interface DeleteCustomerGroupResponse {
  /**
   *
   * @type {boolean}
   * @memberof DeleteCustomerGroupResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof DeleteCustomerGroupResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof DeleteCustomerGroupResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface DeleteCustomerGroupsResponse
 */
export interface DeleteCustomerGroupsResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof DeleteCustomerGroupsResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof DeleteCustomerGroupsResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface DeleteCustomerResponse
 */
export interface DeleteCustomerResponse {
  /**
   *
   * @type {boolean}
   * @memberof DeleteCustomerResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof DeleteCustomerResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof DeleteCustomerResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface DeleteCustomersResponse
 */
export interface DeleteCustomersResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof DeleteCustomersResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof DeleteCustomersResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface DeleteFileResponse
 */
export interface DeleteFileResponse {
  /**
   *
   * @type {string}
   * @memberof DeleteFileResponse
   */
  'id': string;
  /**
   *
   * @type {string}
   * @memberof DeleteFileResponse
   */
  'object': string;
  /**
   *
   * @type {boolean}
   * @memberof DeleteFileResponse
   */
  'deleted': boolean;
}
/**
 *
 * @export
 * @interface DeleteWorkflowResponse
 */
export interface DeleteWorkflowResponse {
  /**
   *
   * @type {boolean}
   * @memberof DeleteWorkflowResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof DeleteWorkflowResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof DeleteWorkflowResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface DeleteWorkflowsResponse
 */
export interface DeleteWorkflowsResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof DeleteWorkflowsResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof DeleteWorkflowsResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface EqualityCondition
 */
export interface EqualityCondition {
  /**
   *
   * @type {string}
   * @memberof EqualityCondition
   */
  'path': string;
  /**
   *
   * @type {EqualityOperator}
   * @memberof EqualityCondition
   */
  'operator': EqualityOperator;
  /**
   *
   * @type {any}
   * @memberof EqualityCondition
   */
  'value': any;
  /**
   *
   * @type {boolean}
   * @memberof EqualityCondition
   */
  'external'?: boolean;
}
/**
 *
 * @export
 * @interface EqualityConditionAllOf
 */
export interface EqualityConditionAllOf {
  /**
   *
   * @type {EqualityOperator}
   * @memberof EqualityConditionAllOf
   */
  'operator': EqualityOperator;
  /**
   *
   * @type {any}
   * @memberof EqualityConditionAllOf
   */
  'value': any;
}
/**
 *
 * @export
 * @enum {string}
 */
export declare const EqualityOperator: {
  readonly Eq: "eq";
  readonly Neq: "neq";
  readonly Gt: "gt";
  readonly Gte: "gte";
  readonly Lt: "lt";
  readonly Lte: "lte";
  readonly In: "in";
  readonly Nin: "nin";
  readonly Contains: "contains";
  readonly NotContains: "notContains";
  readonly StartsWith: "startsWith";
  readonly EndsWith: "endsWith";
  readonly ArrayContainsAny: "arrayContainsAny";
  readonly ArrayContains: "arrayContains";
};
export type EqualityOperator = typeof EqualityOperator[keyof typeof EqualityOperator];
/**
 *
 * @export
 * @interface ErrorResponse
 */
export interface ErrorResponse {
  /**
   *
   * @type {Error}
   * @memberof ErrorResponse
   */
  'error': Error;
}
/**
 *
 * @export
 * @enum {string}
 */
export declare const ExistenceOperator: {
  readonly Exists: "exists";
  readonly NotExists: "notExists";
};
export type ExistenceOperator = typeof ExistenceOperator[keyof typeof ExistenceOperator];
/**
 *
 * @export
 * @interface ExistsCondition
 */
export interface ExistsCondition {
  /**
   *
   * @type {string}
   * @memberof ExistsCondition
   */
  'path': string;
  /**
   *
   * @type {ExistenceOperator}
   * @memberof ExistsCondition
   */
  'operator': ExistenceOperator;
  /**
   *
   * @type {any}
   * @memberof ExistsCondition
   */
  'value'?: any;
  /**
   *
   * @type {boolean}
   * @memberof ExistsCondition
   */
  'external'?: boolean;
}
/**
 *
 * @export
 * @interface ExistsConditionAllOf
 */
export interface ExistsConditionAllOf {
  /**
   *
   * @type {ExistenceOperator}
   * @memberof ExistsConditionAllOf
   */
  'operator': ExistenceOperator;
}
/**
 *
 * @export
 * @interface GenerateRequest
 */
export interface GenerateRequest {
  /**
   *
   * @type {GenerateRequestConvo}
   * @memberof GenerateRequest
   */
  'convo': GenerateRequestConvo;
  /**
   *
   * @type {GenerateRequestMocks}
   * @memberof GenerateRequest
   */
  'mocks'?: GenerateRequestMocks;
}
/**
 * @type GenerateRequestConvo
 * The conversation to generate a message from
 * @export
 */
export type GenerateRequestConvo = ConversationCreateRequest | string;
/**
 * If any mocks are provided, the response will be mocked and conversation will not be created. Requires .convo to be a Conversation object
 * @export
 * @interface GenerateRequestMocks
 */
export interface GenerateRequestMocks {
  /**
   * Any key,value information about the conversation, customr, or offer goes here
   * @type {{ [key: string]: any; }}
   * @memberof GenerateRequestMocks
   */
  'info'?: {
    [key: string]: any;
  };
  /**
   * Conversation Context fields to mock, use this to test out conversation logic
   * @type {Array<ConversationContextField>}
   * @memberof GenerateRequestMocks
   */
  'context'?: Array<ConversationContextField>;
  /**
   * Conversation Messages to mock, use this to test out anticipated responses
   * @type {Array<MessageBase>}
   * @memberof GenerateRequestMocks
   */
  'messages'?: Array<MessageBase>;
}
/**
 *
 * @export
 * @interface GenerateResponse
 */
export interface GenerateResponse {
  /**
   * The role of the message (customer, agent, or business)
   * @type {string}
   * @memberof GenerateResponse
   */
  'role': GenerateResponseRoleEnum;
  /**
   * The content of the message
   * @type {string}
   * @memberof GenerateResponse
   */
  'content': string;
  /**
   * The name of the sender
   * @type {string}
   * @memberof GenerateResponse
   */
  'name'?: string;
  /**
   * The time the message was sent
   * @type {string}
   * @memberof GenerateResponse
   */
  'time': string;
  /**
   * Any key,value information about the conversation, customr, or offer goes here
   * @type {{ [key: string]: any; }}
   * @memberof GenerateResponse
   */
  'info': {
    [key: string]: any;
  };
  /**
   * Conversation Context fields to mock, use this to test out conversation logic
   * @type {Array<ConversationContextField>}
   * @memberof GenerateResponse
   */
  'included': Array<ConversationContextField>;
}
export declare const GenerateResponseRoleEnum: {
  readonly Customer: "customer";
  readonly Agent: "agent";
  readonly Context: "context";
};
export type GenerateResponseRoleEnum = typeof GenerateResponseRoleEnum[keyof typeof GenerateResponseRoleEnum];
/**
 *
 * @export
 * @interface GenerateResponseAllOf
 */
export interface GenerateResponseAllOf {
  /**
   * Any key,value information about the conversation, customr, or offer goes here
   * @type {{ [key: string]: any; }}
   * @memberof GenerateResponseAllOf
   */
  'info': {
    [key: string]: any;
  };
  /**
   * Conversation Context fields to mock, use this to test out conversation logic
   * @type {Array<ConversationContextField>}
   * @memberof GenerateResponseAllOf
   */
  'included': Array<ConversationContextField>;
}
/**
 *
 * @export
 * @interface GetAgentResponse
 */
export interface GetAgentResponse {
  /**
   * Agent first name
   * @type {string}
   * @memberof GetAgentResponse
   */
  'firstName': string;
  /**
   * Agent last name
   * @type {string}
   * @memberof GetAgentResponse
   */
  'lastName': string;
  /**
   * Agent is inactive
   * @type {boolean}
   * @memberof GetAgentResponse
   */
  'inactive'?: boolean;
  /**
   * Programmable phone number
   * @type {string}
   * @memberof GetAgentResponse
   */
  'programmablePhoneNumber'?: string;
  /**
   * Programmable phone number SID
   * @type {string}
   * @memberof GetAgentResponse
   */
  'programmablePhoneNumberSid'?: string;
  /**
   * Email address from Scout9 gmail subdomain
   * @type {string}
   * @memberof GetAgentResponse
   */
  'programmableEmail'?: string;
  /**
   * Forward email
   * @type {string}
   * @memberof GetAgentResponse
   */
  'forwardEmail'?: string;
  /**
   * Forward phone
   * @type {string}
   * @memberof GetAgentResponse
   */
  'forwardPhone'?: string;
  /**
   * Title of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof GetAgentResponse
   */
  'title'?: string;
  /**
   * Context of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof GetAgentResponse
   */
  'context'?: string;
  /**
   * Locations ids the agent is included in
   * @type {Array<string>}
   * @memberof GetAgentResponse
   */
  'includedLocations'?: Array<string>;
  /**
   * AI Model
   * @type {string}
   * @memberof GetAgentResponse
   */
  'model'?: GetAgentResponseModelEnum;
  /**
   * Locations id the agent is excluded from
   * @type {Array<string>}
   * @memberof GetAgentResponse
   */
  'excludedLocations'?: Array<string>;
  /**
   * The ID of the agent
   * @type {string}
   * @memberof GetAgentResponse
   */
  '$id': string;
}
export declare const GetAgentResponseModelEnum: {
  readonly Scout9: "Scout9";
  readonly Bard: "bard";
  readonly Null: "null";
};
export type GetAgentResponseModelEnum = typeof GetAgentResponseModelEnum[keyof typeof GetAgentResponseModelEnum];
/**
 *
 * @export
 * @interface GetAgentResponseAllOf
 */
export interface GetAgentResponseAllOf {
  /**
   * The ID of the agent
   * @type {string}
   * @memberof GetAgentResponseAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface GetApiOperationResponse
 */
export interface GetApiOperationResponse {
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof GetApiOperationResponse
   */
  'time': string;
  /**
   * The model that was created, updated, or deleted
   * @type {string}
   * @memberof GetApiOperationResponse
   */
  'model': string;
  /**
   * The method that was called
   * @type {string}
   * @memberof GetApiOperationResponse
   */
  'method': GetApiOperationResponseMethodEnum;
  /**
   *
   * @type {{ [key: string]: any; }}
   * @memberof GetApiOperationResponse
   */
  'results': {
    [key: string]: any;
  };
  /**
   * The ID of the operation
   * @type {string}
   * @memberof GetApiOperationResponse
   */
  '$id': string;
}
export declare const GetApiOperationResponseMethodEnum: {
  readonly Get: "get";
  readonly Post: "post";
  readonly Put: "put";
  readonly Delete: "delete";
  readonly Patch: "patch";
};
export type GetApiOperationResponseMethodEnum = typeof GetApiOperationResponseMethodEnum[keyof typeof GetApiOperationResponseMethodEnum];
/**
 *
 * @export
 * @interface GetApiOperationResponseAllOf
 */
export interface GetApiOperationResponseAllOf {
  /**
   * The ID of the operation
   * @type {string}
   * @memberof GetApiOperationResponseAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface GetContextDataResponse
 */
export interface GetContextDataResponse {
  /**
   * The ID of the context
   * @type {string}
   * @memberof GetContextDataResponse
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface GetContextResponse
 */
export interface GetContextResponse {
  /**
   * The name of the context
   * @type {string}
   * @memberof GetContextResponse
   */
  'name': string;
  /**
   * Whether or not the context is modifiable
   * @type {boolean}
   * @memberof GetContextResponse
   */
  'modifiable'?: boolean;
  /**
   * The description of the context
   * @type {string}
   * @memberof GetContextResponse
   */
  'description'?: string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof GetContextResponse
   */
  'detection'?: ContextDetectionParams;
  /**
   * The API to use for context detection
   * @type {string}
   * @memberof GetContextResponse
   */
  'detectionApi'?: string;
  /**
   * The ID column of the context
   * @type {string}
   * @memberof GetContextResponse
   */
  'idColumn'?: string;
  /**
   * The columns of the context
   * @type {Array<string>}
   * @memberof GetContextResponse
   */
  'columns'?: Array<string>;
  /**
   * The required columns of the context
   * @type {Array<string>}
   * @memberof GetContextResponse
   */
  'requiredColumns'?: Array<string>;
  /**
   * Whether or not to force NER
   * @type {boolean}
   * @memberof GetContextResponse
   */
  'forceNER'?: boolean;
  /**
   *
   * @type {ContextModel}
   * @memberof GetContextResponse
   */
  'model'?: ContextModel;
  /**
   * The ID of the context
   * @type {string}
   * @memberof GetContextResponse
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface GetContextResponseAllOf
 */
export interface GetContextResponseAllOf {
  /**
   * The ID of the context
   * @type {string}
   * @memberof GetContextResponseAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface GetCustomerGroupResponse
 */
export interface GetCustomerGroupResponse {
  /**
   * The name of the customer group
   * @type {string}
   * @memberof GetCustomerGroupResponse
   */
  'name': string;
  /**
   * The description of the customer group
   * @type {string}
   * @memberof GetCustomerGroupResponse
   */
  'description'?: string;
  /**
   *
   * @type {{ [key: string]: any; }}
   * @memberof GetCustomerGroupResponse
   */
  'metadata'?: {
    [key: string]: any;
  };
  /**
   *
   * @type {Array<CustomerGroupRecord>}
   * @memberof GetCustomerGroupResponse
   */
  'customers': Array<CustomerGroupRecord>;
  /**
   * The ID of the CustomerGroup
   * @type {string}
   * @memberof GetCustomerGroupResponse
   */
  '$id'?: string;
}
/**
 *
 * @export
 * @interface GetCustomerGroupResponseAllOf
 */
export interface GetCustomerGroupResponseAllOf {
  /**
   * The ID of the CustomerGroup
   * @type {string}
   * @memberof GetCustomerGroupResponseAllOf
   */
  '$id'?: string;
}
/**
 *
 * @export
 * @interface GetCustomerResponse
 */
export interface GetCustomerResponse {
  /**
   * The customers first name
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'firstName': string;
  /**
   * The customers last name
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'lastName': string;
  /**
   * The customers full name
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'name': string;
  /**
   * The customers email address
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'email'?: string | null;
  /**
   * The customers phone number
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'phone'?: string | null;
  /**
   * The customers profile image
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'img'?: string | null;
  /**
   * The customers neighborhood
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'neighborhood'?: string | null;
  /**
   * The customers city
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'city'?: string | null;
  /**
   * The customers 2-letter country code
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'country'?: string | null;
  /**
   * The customers street address
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'line1'?: string | null;
  /**
   * The customers street address
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'line2'?: string | null;
  /**
   * The customers postal code
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'postal_code'?: string | null;
  /**
   * The customers state, county, province, or region
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'state'?: string | null;
  /**
   * The customers town (only used in Japan)
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'town'?: string | null;
  /**
   *
   * @type {BlockInfo}
   * @memberof GetCustomerResponse
   */
  'blocked'?: BlockInfo;
  /**
   *
   * @type {BlockInfo}
   * @memberof GetCustomerResponse
   */
  'phoneBlocked'?: BlockInfo;
  /**
   *
   * @type {BlockInfo}
   * @memberof GetCustomerResponse
   */
  'emailBlocked'?: BlockInfo;
  /**
   * The date the customer joined the business
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'joined'?: string | null;
  /**
   * The customers stripe ID
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'stripe'?: string | null;
  /**
   * The customers stripe ID in the dev environment
   * @type {string}
   * @memberof GetCustomerResponse
   */
  'stripeDev'?: string | null;
  /**
   * The ID of the customer
   * @type {string}
   * @memberof GetCustomerResponse
   */
  '$id'?: string;
}
/**
 *
 * @export
 * @interface GetCustomerResponseAllOf
 */
export interface GetCustomerResponseAllOf {
  /**
   * The ID of the customer
   * @type {string}
   * @memberof GetCustomerResponseAllOf
   */
  '$id'?: string;
}
/**
 *
 * @export
 * @interface GetWorkflowResponse
 */
export interface GetWorkflowResponse {
  /**
   * The name of the workflow
   * @type {string}
   * @memberof GetWorkflowResponse
   */
  'name': string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof GetWorkflowResponse
   */
  'initiators': ContextDetectionParams;
  /**
   * The fields of the workflow
   * @type {Array<ConversationContextField>}
   * @memberof GetWorkflowResponse
   */
  'fields': Array<ConversationContextField>;
  /**
   * About this conversation - used as initial context
   * @type {string}
   * @memberof GetWorkflowResponse
   */
  'context': string;
  /**
   * The webhook to call when a workflow is created
   * @type {string}
   * @memberof GetWorkflowResponse
   */
  'onCreated'?: string;
  /**
   * The webhook to call when a workflow is updated
   * @type {string}
   * @memberof GetWorkflowResponse
   */
  'onUpdated'?: string;
  /**
   * The webhook to call when a workflow is deleted
   * @type {string}
   * @memberof GetWorkflowResponse
   */
  'onDeleted'?: string;
  /**
   * The webhook to call when a workflow has an error
   * @type {string}
   * @memberof GetWorkflowResponse
   */
  'onError'?: string;
  /**
   * The priority of the workflow in relation to other workflows (determines activation order)
   * @type {number}
   * @memberof GetWorkflowResponse
   */
  'priority': number;
  /**
   * The ID of the workflow
   * @type {string}
   * @memberof GetWorkflowResponse
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface GetWorkflowResponseAllOf
 */
export interface GetWorkflowResponseAllOf {
  /**
   * The ID of the workflow
   * @type {string}
   * @memberof GetWorkflowResponseAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ListAgentsResponseInner
 */
export interface ListAgentsResponseInner {
  /**
   * Agent first name
   * @type {string}
   * @memberof ListAgentsResponseInner
   */
  'firstName'?: string;
  /**
   * Agent last name
   * @type {string}
   * @memberof ListAgentsResponseInner
   */
  'lastName'?: string;
  /**
   * Agent is inactive
   * @type {boolean}
   * @memberof ListAgentsResponseInner
   */
  'inactive'?: boolean;
  /**
   * Programmable phone number
   * @type {string}
   * @memberof ListAgentsResponseInner
   */
  'programmablePhoneNumber'?: string;
  /**
   * Programmable phone number SID
   * @type {string}
   * @memberof ListAgentsResponseInner
   */
  'programmablePhoneNumberSid'?: string;
  /**
   * Email address from Scout9 gmail subdomain
   * @type {string}
   * @memberof ListAgentsResponseInner
   */
  'programmableEmail'?: string;
  /**
   * Forward email
   * @type {string}
   * @memberof ListAgentsResponseInner
   */
  'forwardEmail'?: string;
  /**
   * Forward phone
   * @type {string}
   * @memberof ListAgentsResponseInner
   */
  'forwardPhone'?: string;
  /**
   * Title of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof ListAgentsResponseInner
   */
  'title'?: string;
  /**
   * Context of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof ListAgentsResponseInner
   */
  'context'?: string;
  /**
   * Locations ids the agent is included in
   * @type {Array<string>}
   * @memberof ListAgentsResponseInner
   */
  'includedLocations'?: Array<string>;
  /**
   * AI Model
   * @type {string}
   * @memberof ListAgentsResponseInner
   */
  'model'?: ListAgentsResponseInnerModelEnum;
  /**
   * Locations id the agent is excluded from
   * @type {Array<string>}
   * @memberof ListAgentsResponseInner
   */
  'excludedLocations'?: Array<string>;
  /**
   * The ID of the agent
   * @type {string}
   * @memberof ListAgentsResponseInner
   */
  '$id': string;
}
export declare const ListAgentsResponseInnerModelEnum: {
  readonly Scout9: "Scout9";
  readonly Bard: "bard";
  readonly Null: "null";
};
export type ListAgentsResponseInnerModelEnum = typeof ListAgentsResponseInnerModelEnum[keyof typeof ListAgentsResponseInnerModelEnum];
/**
 *
 * @export
 * @interface ListAgentsResponseInnerAllOf
 */
export interface ListAgentsResponseInnerAllOf {
  /**
   * The ID of the agent
   * @type {string}
   * @memberof ListAgentsResponseInnerAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ListApiOperationsResponseInner
 */
export interface ListApiOperationsResponseInner {
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof ListApiOperationsResponseInner
   */
  'time': string;
  /**
   * The model that was created, updated, or deleted
   * @type {string}
   * @memberof ListApiOperationsResponseInner
   */
  'model': string;
  /**
   * The method that was called
   * @type {string}
   * @memberof ListApiOperationsResponseInner
   */
  'method': ListApiOperationsResponseInnerMethodEnum;
  /**
   *
   * @type {{ [key: string]: any; }}
   * @memberof ListApiOperationsResponseInner
   */
  'results': {
    [key: string]: any;
  };
  /**
   * The ID of the operation
   * @type {string}
   * @memberof ListApiOperationsResponseInner
   */
  '$id': string;
}
export declare const ListApiOperationsResponseInnerMethodEnum: {
  readonly Get: "get";
  readonly Post: "post";
  readonly Put: "put";
  readonly Delete: "delete";
  readonly Patch: "patch";
};
export type ListApiOperationsResponseInnerMethodEnum = typeof ListApiOperationsResponseInnerMethodEnum[keyof typeof ListApiOperationsResponseInnerMethodEnum];
/**
 *
 * @export
 * @interface ListApiOperationsResponseInnerAllOf
 */
export interface ListApiOperationsResponseInnerAllOf {
  /**
   * The ID of the operation
   * @type {string}
   * @memberof ListApiOperationsResponseInnerAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ListContextsResponseInner
 */
export interface ListContextsResponseInner {
  /**
   * The name of the context
   * @type {string}
   * @memberof ListContextsResponseInner
   */
  'name': string;
  /**
   * Whether or not the context is modifiable
   * @type {boolean}
   * @memberof ListContextsResponseInner
   */
  'modifiable'?: boolean;
  /**
   * The description of the context
   * @type {string}
   * @memberof ListContextsResponseInner
   */
  'description'?: string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof ListContextsResponseInner
   */
  'detection'?: ContextDetectionParams;
  /**
   * The API to use for context detection
   * @type {string}
   * @memberof ListContextsResponseInner
   */
  'detectionApi'?: string;
  /**
   * The ID column of the context
   * @type {string}
   * @memberof ListContextsResponseInner
   */
  'idColumn'?: string;
  /**
   * The columns of the context
   * @type {Array<string>}
   * @memberof ListContextsResponseInner
   */
  'columns'?: Array<string>;
  /**
   * The required columns of the context
   * @type {Array<string>}
   * @memberof ListContextsResponseInner
   */
  'requiredColumns'?: Array<string>;
  /**
   * Whether or not to force NER
   * @type {boolean}
   * @memberof ListContextsResponseInner
   */
  'forceNER'?: boolean;
  /**
   *
   * @type {ContextModel}
   * @memberof ListContextsResponseInner
   */
  'model'?: ContextModel;
  /**
   * The ID of the context
   * @type {string}
   * @memberof ListContextsResponseInner
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ListContextsResponseInnerAllOf
 */
export interface ListContextsResponseInnerAllOf {
  /**
   * The ID of the context
   * @type {string}
   * @memberof ListContextsResponseInnerAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ListCustomerGroupsResponseInner
 */
export interface ListCustomerGroupsResponseInner {
  /**
   * The name of the customer group
   * @type {string}
   * @memberof ListCustomerGroupsResponseInner
   */
  'name': string;
  /**
   * The description of the customer group
   * @type {string}
   * @memberof ListCustomerGroupsResponseInner
   */
  'description'?: string;
  /**
   *
   * @type {{ [key: string]: any; }}
   * @memberof ListCustomerGroupsResponseInner
   */
  'metadata'?: {
    [key: string]: any;
  };
  /**
   *
   * @type {Array<CustomerGroupRecord>}
   * @memberof ListCustomerGroupsResponseInner
   */
  'customers': Array<CustomerGroupRecord>;
  /**
   * The ID of the CustomerGroup
   * @type {string}
   * @memberof ListCustomerGroupsResponseInner
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ListCustomerGroupsResponseInnerAllOf
 */
export interface ListCustomerGroupsResponseInnerAllOf {
  /**
   * The ID of the CustomerGroup
   * @type {string}
   * @memberof ListCustomerGroupsResponseInnerAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ListCustomersResponseInner
 */
export interface ListCustomersResponseInner {
  /**
   * The customers first name
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'firstName'?: string;
  /**
   * The customers last name
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'lastName'?: string;
  /**
   * The customers full name
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'name': string;
  /**
   * The customers email address
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'email'?: string | null;
  /**
   * The customers phone number
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'phone'?: string | null;
  /**
   * The customers profile image
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'img'?: string | null;
  /**
   * The customers neighborhood
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'neighborhood'?: string | null;
  /**
   * The customers city
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'city'?: string | null;
  /**
   * The customers 2-letter country code
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'country'?: string | null;
  /**
   * The customers street address
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'line1'?: string | null;
  /**
   * The customers street address
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'line2'?: string | null;
  /**
   * The customers postal code
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'postal_code'?: string | null;
  /**
   * The customers state, county, province, or region
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'state'?: string | null;
  /**
   * The customers town (only used in Japan)
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'town'?: string | null;
  /**
   *
   * @type {BlockInfo}
   * @memberof ListCustomersResponseInner
   */
  'blocked'?: BlockInfo;
  /**
   *
   * @type {BlockInfo}
   * @memberof ListCustomersResponseInner
   */
  'phoneBlocked'?: BlockInfo;
  /**
   *
   * @type {BlockInfo}
   * @memberof ListCustomersResponseInner
   */
  'emailBlocked'?: BlockInfo;
  /**
   * The date the customer joined the business
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'joined'?: string | null;
  /**
   * The customers stripe ID
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'stripe'?: string | null;
  /**
   * The customers stripe ID in the dev environment
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  'stripeDev'?: string | null;
  /**
   * The ID of the customer
   * @type {string}
   * @memberof ListCustomersResponseInner
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ListCustomersResponseInnerAllOf
 */
export interface ListCustomersResponseInnerAllOf {
  /**
   * The ID of the customer
   * @type {string}
   * @memberof ListCustomersResponseInnerAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ListFilesResponse
 */
export interface ListFilesResponse {
  /**
   *
   * @type {string}
   * @memberof ListFilesResponse
   */
  'object': string;
  /**
   *
   * @type {Array<Scout9File>}
   * @memberof ListFilesResponse
   */
  'data': Array<Scout9File>;
  /**
   *
   * @type {PurposeEnum}
   * @memberof ListFilesResponse
   */
  'purpose'?: PurposeEnum;
}
/**
 *
 * @export
 * @interface ListQuery
 */
export interface ListQuery {
  /**
   *
   * @type {ListQueryId}
   * @memberof ListQuery
   */
  'id'?: ListQueryId;
  /**
   *
   * @type {Array<ListQueryOperationsInner>}
   * @memberof ListQuery
   */
  'operations'?: Array<ListQueryOperationsInner>;
}
/**
 * @type ListQueryId
 * @export
 */
export type ListQueryId = Array<string> | string;
/**
 *
 * @export
 * @interface ListQueryOperationsInner
 */
export interface ListQueryOperationsInner {
  /**
   * The field path to filter on
   * @type {string}
   * @memberof ListQueryOperationsInner
   */
  'fieldPath': string;
  /**
   *
   * @type {Operator}
   * @memberof ListQueryOperationsInner
   */
  'operator': Operator;
  /**
   *
   * @type {AnyValue}
   * @memberof ListQueryOperationsInner
   */
  'value': AnyValue;
}
/**
 *
 * @export
 * @interface ListWorkflowsResponseInner
 */
export interface ListWorkflowsResponseInner {
  /**
   * The name of the workflow
   * @type {string}
   * @memberof ListWorkflowsResponseInner
   */
  'name': string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof ListWorkflowsResponseInner
   */
  'initiators': ContextDetectionParams;
  /**
   * The fields of the workflow
   * @type {Array<ConversationContextField>}
   * @memberof ListWorkflowsResponseInner
   */
  'fields': Array<ConversationContextField>;
  /**
   * About this conversation - used as initial context
   * @type {string}
   * @memberof ListWorkflowsResponseInner
   */
  'context': string;
  /**
   * The webhook to call when a workflow is created
   * @type {string}
   * @memberof ListWorkflowsResponseInner
   */
  'onCreated'?: string;
  /**
   * The webhook to call when a workflow is updated
   * @type {string}
   * @memberof ListWorkflowsResponseInner
   */
  'onUpdated'?: string;
  /**
   * The webhook to call when a workflow is deleted
   * @type {string}
   * @memberof ListWorkflowsResponseInner
   */
  'onDeleted'?: string;
  /**
   * The webhook to call when a workflow has an error
   * @type {string}
   * @memberof ListWorkflowsResponseInner
   */
  'onError'?: string;
  /**
   * The priority of the workflow in relation to other workflows (determines activation order)
   * @type {number}
   * @memberof ListWorkflowsResponseInner
   */
  'priority': number;
  /**
   * The ID of the workflow
   * @type {string}
   * @memberof ListWorkflowsResponseInner
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ListWorkflowsResponseInnerAllOf
 */
export interface ListWorkflowsResponseInnerAllOf {
  /**
   * The ID of the workflow
   * @type {string}
   * @memberof ListWorkflowsResponseInnerAllOf
   */
  '$id': string;
}
/**
 * @type Logic
 * @export
 */
export type Logic = AndLogic | ConditionLogic | NotLogic | OrLogic;
/**
 *
 * @export
 * @interface Message
 */
export interface Message {
  /**
   * The role of the message (customer, agent, or business)
   * @type {string}
   * @memberof Message
   */
  'role': MessageRoleEnum;
  /**
   * The content of the message
   * @type {string}
   * @memberof Message
   */
  'content': string;
  /**
   * The name of the sender
   * @type {string}
   * @memberof Message
   */
  'name'?: string;
  /**
   * The time the message was sent
   * @type {string}
   * @memberof Message
   */
  'time': string;
}
export declare const MessageRoleEnum: {
  readonly Customer: "customer";
  readonly Agent: "agent";
  readonly Context: "context";
};
export type MessageRoleEnum = typeof MessageRoleEnum[keyof typeof MessageRoleEnum];
/**
 *
 * @export
 * @interface MessageAllOf
 */
export interface MessageAllOf {
  /**
   * The time the message was sent
   * @type {string}
   * @memberof MessageAllOf
   */
  'time': string;
}
/**
 *
 * @export
 * @interface MessageBase
 */
export interface MessageBase {
  /**
   * The role of the message (customer, agent, or business)
   * @type {string}
   * @memberof MessageBase
   */
  'role': MessageBaseRoleEnum;
  /**
   * The content of the message
   * @type {string}
   * @memberof MessageBase
   */
  'content': string;
  /**
   * The name of the sender
   * @type {string}
   * @memberof MessageBase
   */
  'name'?: string;
}
export declare const MessageBaseRoleEnum: {
  readonly Customer: "customer";
  readonly Agent: "agent";
  readonly Context: "context";
};
export type MessageBaseRoleEnum = typeof MessageBaseRoleEnum[keyof typeof MessageBaseRoleEnum];
/**
 *
 * @export
 * @interface MessageCreateRequest
 */
export interface MessageCreateRequest {
  /**
   * Conversation ID this belonds to
   * @type {string}
   * @memberof MessageCreateRequest
   */
  'convo': string;
  /**
   * The message content to send to a user
   * @type {string}
   * @memberof MessageCreateRequest
   */
  'message': string;
  /**
   * The message content to send to a user in HTML format (only available in email)
   * @type {string}
   * @memberof MessageCreateRequest
   */
  'messageHtml'?: string;
  /**
   * Overrides the role of the user sending the message
   * @type {string}
   * @memberof MessageCreateRequest
   */
  'role'?: MessageCreateRequestRoleEnum;
}
export declare const MessageCreateRequestRoleEnum: {
  readonly Agent: "agent";
  readonly Customer: "customer";
  readonly Context: "context";
};
export type MessageCreateRequestRoleEnum = typeof MessageCreateRequestRoleEnum[keyof typeof MessageCreateRequestRoleEnum];
/**
 *
 * @export
 * @interface MessageCreateResponse
 */
export interface MessageCreateResponse {
  /**
   *
   * @type {boolean}
   * @memberof MessageCreateResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof MessageCreateResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof MessageCreateResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface MessageGetResponseInner
 */
export interface MessageGetResponseInner {
  /**
   * The role of the message (customer, agent, or business)
   * @type {string}
   * @memberof MessageGetResponseInner
   */
  'role': MessageGetResponseInnerRoleEnum;
  /**
   * The content of the message
   * @type {string}
   * @memberof MessageGetResponseInner
   */
  'content': string;
  /**
   * The name of the sender
   * @type {string}
   * @memberof MessageGetResponseInner
   */
  'name'?: string;
  /**
   * The time the message was sent
   * @type {string}
   * @memberof MessageGetResponseInner
   */
  'time': string;
  /**
   * The ID of the message to get
   * @type {string}
   * @memberof MessageGetResponseInner
   */
  '$id': string;
}
export declare const MessageGetResponseInnerRoleEnum: {
  readonly Customer: "customer";
  readonly Agent: "agent";
  readonly Context: "context";
};
export type MessageGetResponseInnerRoleEnum = typeof MessageGetResponseInnerRoleEnum[keyof typeof MessageGetResponseInnerRoleEnum];
/**
 *
 * @export
 * @interface MessageGetResponseInnerAllOf
 */
export interface MessageGetResponseInnerAllOf {
  /**
   * The ID of the message to get
   * @type {string}
   * @memberof MessageGetResponseInnerAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ModelError
 */
export interface ModelError {
  /**
   *
   * @type {string}
   * @memberof ModelError
   */
  'type': string;
  /**
   *
   * @type {string}
   * @memberof ModelError
   */
  'message': string;
  /**
   *
   * @type {string}
   * @memberof ModelError
   */
  'param': string | null;
  /**
   *
   * @type {string}
   * @memberof ModelError
   */
  'code': string | null;
}
/**
 *
 * @export
 * @interface NotLogic
 */
export interface NotLogic {
  /**
   *
   * @type {Logic}
   * @memberof NotLogic
   */
  'not': Logic;
}
/**
 *
 * @export
 * @interface OperationBulkResponse
 */
export interface OperationBulkResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof OperationBulkResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof OperationBulkResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface OperationDocResponse
 */
export interface OperationDocResponse {
  /**
   *
   * @type {boolean}
   * @memberof OperationDocResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof OperationDocResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof OperationDocResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface OperationDocResponseAllOf
 */
export interface OperationDocResponseAllOf {
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof OperationDocResponseAllOf
   */
  'id': string;
}
/**
 *
 * @export
 * @interface OperationResponse
 */
export interface OperationResponse {
  /**
   *
   * @type {boolean}
   * @memberof OperationResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof OperationResponse
   */
  'error'?: Error;
}
/**
 * @type Operator
 * @export
 */
export type Operator = EqualityOperator | ExistenceOperator;
/**
 *
 * @export
 * @interface OrLogic
 */
export interface OrLogic {
  /**
   *
   * @type {Array<Logic>}
   * @memberof OrLogic
   */
  'or': Array<Logic>;
}
/**
 * @type ParsedContextEntity
 * @export
 */
export type ParsedContextEntity = string | {
  [key: string]: any;
};
/**
 *
 * @export
 * @enum {string}
 */
export declare const PurposeEnum: {
  readonly Context: "context";
  readonly AgentAudio: "agent-audio";
  readonly AgentTranscript: "agent-transcript";
};
export type PurposeEnum = typeof PurposeEnum[keyof typeof PurposeEnum];
/**
 *
 * @export
 * @interface RegexCondition
 */
export interface RegexCondition {
  /**
   *
   * @type {string}
   * @memberof RegexCondition
   */
  'path': string;
  /**
   *
   * @type {string}
   * @memberof RegexCondition
   */
  'regex': string;
  /**
   *
   * @type {boolean}
   * @memberof RegexCondition
   */
  'external'?: boolean;
}
/**
 *
 * @export
 * @interface ScheduleCreateRequest
 */
export interface ScheduleCreateRequest {
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof ScheduleCreateRequest
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof ScheduleCreateRequest
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof ScheduleCreateRequest
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
  /**
   * Customer this conversation is with
   * @type {string}
   * @memberof ScheduleCreateRequest
   */
  '$customer': string;
  /**
   *
   * @type {ConversationEnvironment}
   * @memberof ScheduleCreateRequest
   */
  'environment': ConversationEnvironment;
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof ScheduleCreateRequest
   */
  'scheduled': string;
  /**
   * The initial message to send to the customer
   * @type {string}
   * @memberof ScheduleCreateRequest
   */
  'initialMessage': string;
  /**
   * The initial message to send to the customer in HTML
   * @type {string}
   * @memberof ScheduleCreateRequest
   */
  'initialMessageHtml'?: string | null;
  /**
   * Group this conversation is in
   * @type {string}
   * @memberof ScheduleCreateRequest
   */
  '$group'?: string;
  /**
   *
   * @type {ConversationUpdateRequestBaseWorkflow}
   * @memberof ScheduleCreateRequest
   */
  '$workflow'?: ConversationUpdateRequestBaseWorkflow;
}
/**
 *
 * @export
 * @interface ScheduleCreateResponse
 */
export interface ScheduleCreateResponse {
  /**
   *
   * @type {boolean}
   * @memberof ScheduleCreateResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof ScheduleCreateResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof ScheduleCreateResponse
   */
  'id': string;
  /**
   * ISO Time the initial message has been sent
   * @type {string}
   * @memberof ScheduleCreateResponse
   */
  'sent'?: string;
}
/**
 *
 * @export
 * @interface ScheduleCreateResponseAllOf
 */
export interface ScheduleCreateResponseAllOf {
  /**
   * ISO Time the initial message has been sent
   * @type {string}
   * @memberof ScheduleCreateResponseAllOf
   */
  'sent'?: string;
}
/**
 *
 * @export
 * @interface ScheduleGetResponse
 */
export interface ScheduleGetResponse {
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof ScheduleGetResponse
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof ScheduleGetResponse
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof ScheduleGetResponse
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
  /**
   * Customer this conversation is with
   * @type {string}
   * @memberof ScheduleGetResponse
   */
  '$customer': string;
  /**
   *
   * @type {ConversationEnvironment}
   * @memberof ScheduleGetResponse
   */
  'environment': ConversationEnvironment;
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof ScheduleGetResponse
   */
  'scheduled': string;
  /**
   * The initial message to send to the customer
   * @type {string}
   * @memberof ScheduleGetResponse
   */
  'initialMessage': string;
  /**
   * The initial message to send to the customer in HTML
   * @type {string}
   * @memberof ScheduleGetResponse
   */
  'initialMessageHtml'?: string | null;
  /**
   * Group this conversation is in
   * @type {string}
   * @memberof ScheduleGetResponse
   */
  '$group'?: string;
  /**
   * The ID of the workflow used for this conversation
   * @type {string}
   * @memberof ScheduleGetResponse
   */
  '$workflow': string;
  /**
   * The client web url of the conversation
   * @type {string}
   * @memberof ScheduleGetResponse
   */
  'clientWebUrl'?: string;
  /**
   * The agent web url of the conversation (requires phone two-factor authentication)
   * @type {string}
   * @memberof ScheduleGetResponse
   */
  'agentWebUrl'?: string;
  /**
   * The agent test web url of the conversation, used for testing the conversation without notifying the customer
   * @type {string}
   * @memberof ScheduleGetResponse
   */
  'agentTestWebUrl'?: string;
}
/**
 *
 * @export
 * @interface ScheduleGroupCreateRequest
 */
export interface ScheduleGroupCreateRequest {
  /**
   *
   * @type {ConversationUpdateRequestBaseWorkflow}
   * @memberof ScheduleGroupCreateRequest
   */
  '$workflow'?: ConversationUpdateRequestBaseWorkflow;
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof ScheduleGroupCreateRequest
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof ScheduleGroupCreateRequest
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof ScheduleGroupCreateRequest
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof ScheduleGroupCreateRequest
   */
  'scheduled': string;
  /**
   * The initial message to send to the customer
   * @type {string}
   * @memberof ScheduleGroupCreateRequest
   */
  'initialMessage': string;
  /**
   * The initial message to send to the customer in HTML
   * @type {string}
   * @memberof ScheduleGroupCreateRequest
   */
  'initialMessageHtml'?: string | null;
  /**
   * The delay in miliseconds between each customer, defaults to 15000 (15 seconds)
   * @type {number}
   * @memberof ScheduleGroupCreateRequest
   */
  'delay'?: number;
  /**
   *
   * @type {ScheduleGroupCreateRequestAllOfCGroup}
   * @memberof ScheduleGroupCreateRequest
   */
  '$cGroup': ScheduleGroupCreateRequestAllOfCGroup;
}
/**
 *
 * @export
 * @interface ScheduleGroupCreateRequestAllOf
 */
export interface ScheduleGroupCreateRequestAllOf {
  /**
   *
   * @type {ScheduleGroupCreateRequestAllOfCGroup}
   * @memberof ScheduleGroupCreateRequestAllOf
   */
  '$cGroup': ScheduleGroupCreateRequestAllOfCGroup;
}
/**
 * @type ScheduleGroupCreateRequestAllOfCGroup
 * @export
 */
export type ScheduleGroupCreateRequestAllOfCGroup = CustomerGroup | string;
/**
 *
 * @export
 * @interface ScheduleGroupCreateResponse
 */
export interface ScheduleGroupCreateResponse {
  /**
   *
   * @type {boolean}
   * @memberof ScheduleGroupCreateResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof ScheduleGroupCreateResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof ScheduleGroupCreateResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface ScheduleGroupGetResponse
 */
export interface ScheduleGroupGetResponse {
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof ScheduleGroupGetResponse
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof ScheduleGroupGetResponse
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof ScheduleGroupGetResponse
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof ScheduleGroupGetResponse
   */
  'scheduled': string;
  /**
   * The initial message to send to the customer
   * @type {string}
   * @memberof ScheduleGroupGetResponse
   */
  'initialMessage': string;
  /**
   * The initial message to send to the customer in HTML
   * @type {string}
   * @memberof ScheduleGroupGetResponse
   */
  'initialMessageHtml'?: string | null;
  /**
   * The delay in miliseconds between each customer, defaults to 15000 (15 seconds)
   * @type {number}
   * @memberof ScheduleGroupGetResponse
   */
  'delay'?: number;
  /**
   * The ID of the workflow used for this conversation
   * @type {string}
   * @memberof ScheduleGroupGetResponse
   */
  '$workflow': string;
  /**
   * The ID of the scheduled conversation group
   * @type {string}
   * @memberof ScheduleGroupGetResponse
   */
  '$id': string;
  /**
   * ISO Time the initial message has been sent
   * @type {boolean}
   * @memberof ScheduleGroupGetResponse
   */
  'sent'?: boolean;
  /**
   * The ID of the group the customers belong to
   * @type {string}
   * @memberof ScheduleGroupGetResponse
   */
  '$cGroup'?: string;
}
/**
 *
 * @export
 * @interface ScheduleGroupGetResponseAllOf
 */
export interface ScheduleGroupGetResponseAllOf {
  /**
   * The ID of the scheduled conversation group
   * @type {string}
   * @memberof ScheduleGroupGetResponseAllOf
   */
  '$id': string;
  /**
   * ISO Time the initial message has been sent
   * @type {boolean}
   * @memberof ScheduleGroupGetResponseAllOf
   */
  'sent'?: boolean;
  /**
   * The ID of the group the customers belong to
   * @type {string}
   * @memberof ScheduleGroupGetResponseAllOf
   */
  '$cGroup'?: string;
}
/**
 *
 * @export
 * @interface ScheduleGroupRemoveResponse
 */
export interface ScheduleGroupRemoveResponse {
  /**
   *
   * @type {boolean}
   * @memberof ScheduleGroupRemoveResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof ScheduleGroupRemoveResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof ScheduleGroupRemoveResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface ScheduleGroupUpdateRequest
 */
export interface ScheduleGroupUpdateRequest {
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof ScheduleGroupUpdateRequest
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof ScheduleGroupUpdateRequest
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof ScheduleGroupUpdateRequest
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof ScheduleGroupUpdateRequest
   */
  'scheduled': string;
  /**
   * The initial message to send to the customer
   * @type {string}
   * @memberof ScheduleGroupUpdateRequest
   */
  'initialMessage': string;
  /**
   * The initial message to send to the customer in HTML
   * @type {string}
   * @memberof ScheduleGroupUpdateRequest
   */
  'initialMessageHtml'?: string | null;
  /**
   * The delay in miliseconds between each customer, defaults to 15000 (15 seconds)
   * @type {number}
   * @memberof ScheduleGroupUpdateRequest
   */
  'delay'?: number;
  /**
   *
   * @type {ConversationUpdateRequestBaseWorkflow}
   * @memberof ScheduleGroupUpdateRequest
   */
  '$workflow'?: ConversationUpdateRequestBaseWorkflow;
  /**
   *
   * @type {ScheduleGroupCreateRequestAllOfCGroup}
   * @memberof ScheduleGroupUpdateRequest
   */
  '$cGroup'?: ScheduleGroupCreateRequestAllOfCGroup;
  /**
   * The ID of the scheduled conversation group to update
   * @type {string}
   * @memberof ScheduleGroupUpdateRequest
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ScheduleGroupUpdateRequestAllOf
 */
export interface ScheduleGroupUpdateRequestAllOf {
  /**
   *
   * @type {ScheduleGroupCreateRequestAllOfCGroup}
   * @memberof ScheduleGroupUpdateRequestAllOf
   */
  '$cGroup'?: ScheduleGroupCreateRequestAllOfCGroup;
  /**
   * The ID of the scheduled conversation group to update
   * @type {string}
   * @memberof ScheduleGroupUpdateRequestAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface ScheduleGroupUpdateResponse
 */
export interface ScheduleGroupUpdateResponse {
  /**
   *
   * @type {boolean}
   * @memberof ScheduleGroupUpdateResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof ScheduleGroupUpdateResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof ScheduleGroupUpdateResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface ScheduleRemoveResponse
 */
export interface ScheduleRemoveResponse {
  /**
   *
   * @type {boolean}
   * @memberof ScheduleRemoveResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof ScheduleRemoveResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof ScheduleRemoveResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface ScheduleUpdateRequest
 */
export interface ScheduleUpdateRequest {
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof ScheduleUpdateRequest
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof ScheduleUpdateRequest
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof ScheduleUpdateRequest
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
  /**
   * Customer this conversation is with
   * @type {string}
   * @memberof ScheduleUpdateRequest
   */
  '$customer': string;
  /**
   *
   * @type {ConversationEnvironment}
   * @memberof ScheduleUpdateRequest
   */
  'environment': ConversationEnvironment;
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof ScheduleUpdateRequest
   */
  'scheduled': string;
  /**
   * The initial message to send to the customer
   * @type {string}
   * @memberof ScheduleUpdateRequest
   */
  'initialMessage': string;
  /**
   * The initial message to send to the customer in HTML
   * @type {string}
   * @memberof ScheduleUpdateRequest
   */
  'initialMessageHtml'?: string | null;
  /**
   * Group this conversation is in
   * @type {string}
   * @memberof ScheduleUpdateRequest
   */
  '$group'?: string;
  /**
   *
   * @type {ConversationUpdateRequestBaseWorkflow}
   * @memberof ScheduleUpdateRequest
   */
  '$workflow'?: ConversationUpdateRequestBaseWorkflow;
  /**
   * The ID of the scheduled conversation to update
   * @type {string}
   * @memberof ScheduleUpdateRequest
   */
  '$id'?: string;
}
/**
 *
 * @export
 * @interface ScheduleUpdateRequestAllOf
 */
export interface ScheduleUpdateRequestAllOf {
  /**
   * The ID of the scheduled conversation to update
   * @type {string}
   * @memberof ScheduleUpdateRequestAllOf
   */
  '$id'?: string;
}
/**
 *
 * @export
 * @interface ScheduleUpdateResponse
 */
export interface ScheduleUpdateResponse {
  /**
   *
   * @type {boolean}
   * @memberof ScheduleUpdateResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof ScheduleUpdateResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof ScheduleUpdateResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface ScheduledConversation
 */
export interface ScheduledConversation {
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof ScheduledConversation
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof ScheduledConversation
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof ScheduledConversation
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
  /**
   * Customer this conversation is with
   * @type {string}
   * @memberof ScheduledConversation
   */
  '$customer': string;
  /**
   *
   * @type {ConversationEnvironment}
   * @memberof ScheduledConversation
   */
  'environment': ConversationEnvironment;
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof ScheduledConversation
   */
  'scheduled': string;
  /**
   * The initial message to send to the customer
   * @type {string}
   * @memberof ScheduledConversation
   */
  'initialMessage': string;
  /**
   * The initial message to send to the customer in HTML
   * @type {string}
   * @memberof ScheduledConversation
   */
  'initialMessageHtml'?: string | null;
  /**
   * Group this conversation is in
   * @type {string}
   * @memberof ScheduledConversation
   */
  '$group'?: string;
}
/**
 *
 * @export
 * @interface ScheduledConversationAllOf
 */
export interface ScheduledConversationAllOf {
  /**
   * Group this conversation is in
   * @type {string}
   * @memberof ScheduledConversationAllOf
   */
  '$group'?: string;
}
/**
 *
 * @export
 * @interface ScheduledConversationGroup
 */
export interface ScheduledConversationGroup {
  /**
   * Default agent assigned to the conversation(s)
   * @type {string}
   * @memberof ScheduledConversationGroup
   */
  '$agent': string;
  /**
   * Initial contexts to load when starting the conversation
   * @type {Array<string>}
   * @memberof ScheduledConversationGroup
   */
  'initialContexts'?: Array<string>;
  /**
   *
   * @type {ConversationBaseEnvironmentProps}
   * @memberof ScheduledConversationGroup
   */
  'environmentProps'?: ConversationBaseEnvironmentProps;
  /**
   * ISO 8601 datetime string
   * @type {string}
   * @memberof ScheduledConversationGroup
   */
  'scheduled': string;
  /**
   * The initial message to send to the customer
   * @type {string}
   * @memberof ScheduledConversationGroup
   */
  'initialMessage': string;
  /**
   * The initial message to send to the customer in HTML
   * @type {string}
   * @memberof ScheduledConversationGroup
   */
  'initialMessageHtml'?: string | null;
  /**
   * The delay in miliseconds between each customer, defaults to 15000 (15 seconds)
   * @type {number}
   * @memberof ScheduledConversationGroup
   */
  'delay'?: number;
}
/**
 *
 * @export
 * @interface ScheduledConversationGroupAllOf
 */
export interface ScheduledConversationGroupAllOf {
  /**
   * The delay in miliseconds between each customer, defaults to 15000 (15 seconds)
   * @type {number}
   * @memberof ScheduledConversationGroupAllOf
   */
  'delay'?: number;
}
/**
 * The `File` object represents a document that has been uploaded to Scout9.
 * @export
 * @interface Scout9File
 */
export interface Scout9File {
  /**
   * The file identifier, which can be referenced in the API endpoints.
   * @type {string}
   * @memberof Scout9File
   */
  'id': string;
  /**
   * The object type, which is always \"file\".
   * @type {string}
   * @memberof Scout9File
   */
  'object': string;
  /**
   * The size of the file in bytes.
   * @type {number}
   * @memberof Scout9File
   */
  'bytes': number;
  /**
   * The unix timestamp for when the file was created.
   * @type {number}
   * @memberof Scout9File
   */
  'created_at': number;
  /**
   * The name of the file.
   * @type {string}
   * @memberof Scout9File
   */
  'filename': string;
  /**
   * The intended purpose of the file. Currently, only \"fine-tune\" is supported.
   * @type {string}
   * @memberof Scout9File
   */
  'purpose': string;
  /**
   * The current status of the file, which can be either `uploaded`, `processed`, `pending`, `error`, `deleting` or `deleted`.
   * @type {string}
   * @memberof Scout9File
   */
  'status'?: string;
  /**
   * Additional details about the status of the file. If the file is in the `error` state, this will include a message describing the error.
   * @type {string}
   * @memberof Scout9File
   */
  'status_details'?: string | null;
}
/**
 *
 * @export
 * @interface UpdateAgentRequest
 */
export interface UpdateAgentRequest {
  /**
   * The ID of the agent to update
   * @type {string}
   * @memberof UpdateAgentRequest
   */
  '$id': string;
  /**
   * Sample conversations that help build out your agent to mimic your responses
   * @type {Array<CreateAgentRequestAllOfConversationsInner>}
   * @memberof UpdateAgentRequest
   */
  'conversations'?: Array<CreateAgentRequestAllOfConversationsInner>;
  /**
   * Sample audio files that help build out your agent to mimic your voice
   * @type {Array<string>}
   * @memberof UpdateAgentRequest
   */
  'audio'?: Array<string>;
  /**
   * Agent first name
   * @type {string}
   * @memberof UpdateAgentRequest
   */
  'firstName'?: string;
  /**
   * Agent last name
   * @type {string}
   * @memberof UpdateAgentRequest
   */
  'lastName'?: string;
  /**
   * Agent is inactive
   * @type {boolean}
   * @memberof UpdateAgentRequest
   */
  'inactive'?: boolean;
  /**
   * Programmable phone number
   * @type {string}
   * @memberof UpdateAgentRequest
   */
  'programmablePhoneNumber'?: string;
  /**
   * Programmable phone number SID
   * @type {string}
   * @memberof UpdateAgentRequest
   */
  'programmablePhoneNumberSid'?: string;
  /**
   * Email address from Scout9 gmail subdomain
   * @type {string}
   * @memberof UpdateAgentRequest
   */
  'programmableEmail'?: string;
  /**
   * Forward email
   * @type {string}
   * @memberof UpdateAgentRequest
   */
  'forwardEmail'?: string;
  /**
   * Forward phone
   * @type {string}
   * @memberof UpdateAgentRequest
   */
  'forwardPhone'?: string;
  /**
   * Title of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof UpdateAgentRequest
   */
  'title'?: string;
  /**
   * Context of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof UpdateAgentRequest
   */
  'context'?: string;
  /**
   * Locations ids the agent is included in
   * @type {Array<string>}
   * @memberof UpdateAgentRequest
   */
  'includedLocations'?: Array<string>;
  /**
   * AI Model
   * @type {string}
   * @memberof UpdateAgentRequest
   */
  'model'?: UpdateAgentRequestModelEnum;
  /**
   * Locations id the agent is excluded from
   * @type {Array<string>}
   * @memberof UpdateAgentRequest
   */
  'excludedLocations'?: Array<string>;
}
export declare const UpdateAgentRequestModelEnum: {
  readonly Scout9: "Scout9";
  readonly Bard: "bard";
  readonly Null: "null";
};
export type UpdateAgentRequestModelEnum = typeof UpdateAgentRequestModelEnum[keyof typeof UpdateAgentRequestModelEnum];
/**
 *
 * @export
 * @interface UpdateAgentRequestAllOf
 */
export interface UpdateAgentRequestAllOf {
  /**
   * The ID of the agent to update
   * @type {string}
   * @memberof UpdateAgentRequestAllOf
   */
  '$id': string;
  /**
   * Sample conversations that help build out your agent to mimic your responses
   * @type {Array<CreateAgentRequestAllOfConversationsInner>}
   * @memberof UpdateAgentRequestAllOf
   */
  'conversations'?: Array<CreateAgentRequestAllOfConversationsInner>;
  /**
   * Sample audio files that help build out your agent to mimic your voice
   * @type {Array<string>}
   * @memberof UpdateAgentRequestAllOf
   */
  'audio'?: Array<string>;
}
/**
 *
 * @export
 * @interface UpdateAgentResponse
 */
export interface UpdateAgentResponse {
  /**
   *
   * @type {boolean}
   * @memberof UpdateAgentResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof UpdateAgentResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof UpdateAgentResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface UpdateAgentsRequest
 */
export interface UpdateAgentsRequest {
  /**
   *
   * @type {Array<UpdateAgentsRequestAgentsInner>}
   * @memberof UpdateAgentsRequest
   */
  'agents'?: Array<UpdateAgentsRequestAgentsInner>;
}
/**
 *
 * @export
 * @interface UpdateAgentsRequestAgentsInner
 */
export interface UpdateAgentsRequestAgentsInner {
  /**
   * Agent first name
   * @type {string}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'firstName': string;
  /**
   * Agent last name
   * @type {string}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'lastName': string;
  /**
   * Agent is inactive
   * @type {boolean}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'inactive'?: boolean;
  /**
   * Programmable phone number
   * @type {string}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'programmablePhoneNumber'?: string;
  /**
   * Programmable phone number SID
   * @type {string}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'programmablePhoneNumberSid'?: string;
  /**
   * Email address from Scout9 gmail subdomain
   * @type {string}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'programmableEmail'?: string;
  /**
   * Forward email
   * @type {string}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'forwardEmail'?: string;
  /**
   * Forward phone
   * @type {string}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'forwardPhone'?: string;
  /**
   * Title of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'title'?: string;
  /**
   * Context of the agent, defaults to \"Agent\"
   * @type {string}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'context'?: string;
  /**
   * Locations ids the agent is included in
   * @type {Array<string>}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'includedLocations'?: Array<string>;
  /**
   * AI Model
   * @type {string}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'model'?: UpdateAgentsRequestAgentsInnerModelEnum;
  /**
   * Locations id the agent is excluded from
   * @type {Array<string>}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  'excludedLocations'?: Array<string>;
  /**
   * The ID of the agent
   * @type {string}
   * @memberof UpdateAgentsRequestAgentsInner
   */
  '$id': string;
}
export declare const UpdateAgentsRequestAgentsInnerModelEnum: {
  readonly Scout9: "Scout9";
  readonly Bard: "bard";
  readonly Null: "null";
};
export type UpdateAgentsRequestAgentsInnerModelEnum = typeof UpdateAgentsRequestAgentsInnerModelEnum[keyof typeof UpdateAgentsRequestAgentsInnerModelEnum];
/**
 *
 * @export
 * @interface UpdateAgentsRequestAgentsInnerAllOf
 */
export interface UpdateAgentsRequestAgentsInnerAllOf {
  /**
   * The ID of the agent
   * @type {string}
   * @memberof UpdateAgentsRequestAgentsInnerAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface UpdateAgentsResponse
 */
export interface UpdateAgentsResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof UpdateAgentsResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof UpdateAgentsResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface UpdateContextDataRequest
 */
export interface UpdateContextDataRequest {
  /**
   * The context id to create data for
   * @type {string}
   * @memberof UpdateContextDataRequest
   */
  'context': string;
  /**
   *
   * @type {Array<{ [key: string]: ContextRowValue; }>}
   * @memberof UpdateContextDataRequest
   */
  'data': Array<{
    [key: string]: ContextRowValue;
  }>;
}
/**
 *
 * @export
 * @interface UpdateContextDataResponse
 */
export interface UpdateContextDataResponse {
  /**
   *
   * @type {boolean}
   * @memberof UpdateContextDataResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof UpdateContextDataResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof UpdateContextDataResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface UpdateContextRequest
 */
export interface UpdateContextRequest {
  /**
   * The name of the context
   * @type {string}
   * @memberof UpdateContextRequest
   */
  'name': string;
  /**
   * Whether or not the context is modifiable
   * @type {boolean}
   * @memberof UpdateContextRequest
   */
  'modifiable'?: boolean;
  /**
   * The description of the context
   * @type {string}
   * @memberof UpdateContextRequest
   */
  'description'?: string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof UpdateContextRequest
   */
  'detection'?: ContextDetectionParams;
  /**
   * The API to use for context detection
   * @type {string}
   * @memberof UpdateContextRequest
   */
  'detectionApi'?: string;
  /**
   * The ID column of the context
   * @type {string}
   * @memberof UpdateContextRequest
   */
  'idColumn'?: string;
  /**
   * The columns of the context
   * @type {Array<string>}
   * @memberof UpdateContextRequest
   */
  'columns'?: Array<string>;
  /**
   * The required columns of the context
   * @type {Array<string>}
   * @memberof UpdateContextRequest
   */
  'requiredColumns'?: Array<string>;
  /**
   * Whether or not to force NER
   * @type {boolean}
   * @memberof UpdateContextRequest
   */
  'forceNER'?: boolean;
  /**
   *
   * @type {ContextModel}
   * @memberof UpdateContextRequest
   */
  'model'?: ContextModel;
  /**
   * The ID of the context to update
   * @type {string}
   * @memberof UpdateContextRequest
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface UpdateContextRequestAllOf
 */
export interface UpdateContextRequestAllOf {
  /**
   * The ID of the context to update
   * @type {string}
   * @memberof UpdateContextRequestAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface UpdateContextResponse
 */
export interface UpdateContextResponse {
  /**
   *
   * @type {boolean}
   * @memberof UpdateContextResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof UpdateContextResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof UpdateContextResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface UpdateContextsRequest
 */
export interface UpdateContextsRequest {
  /**
   *
   * @type {Array<ListContextsResponseInner>}
   * @memberof UpdateContextsRequest
   */
  'contexts'?: Array<ListContextsResponseInner>;
}
/**
 *
 * @export
 * @interface UpdateContextsResponse
 */
export interface UpdateContextsResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof UpdateContextsResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof UpdateContextsResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface UpdateCustomerGroupRequest
 */
export interface UpdateCustomerGroupRequest {
  /**
   * The name of the customer group
   * @type {string}
   * @memberof UpdateCustomerGroupRequest
   */
  'name': string;
  /**
   * The description of the customer group
   * @type {string}
   * @memberof UpdateCustomerGroupRequest
   */
  'description'?: string;
  /**
   *
   * @type {{ [key: string]: any; }}
   * @memberof UpdateCustomerGroupRequest
   */
  'metadata'?: {
    [key: string]: any;
  };
  /**
   *
   * @type {Array<CustomerGroupRecord>}
   * @memberof UpdateCustomerGroupRequest
   */
  'customers': Array<CustomerGroupRecord>;
  /**
   * The ID of the CustomerGroup
   * @type {string}
   * @memberof UpdateCustomerGroupRequest
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface UpdateCustomerGroupRequestAllOf
 */
export interface UpdateCustomerGroupRequestAllOf {
  /**
   * The ID of the CustomerGroup
   * @type {string}
   * @memberof UpdateCustomerGroupRequestAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface UpdateCustomerGroupResponse
 */
export interface UpdateCustomerGroupResponse {
  /**
   *
   * @type {boolean}
   * @memberof UpdateCustomerGroupResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof UpdateCustomerGroupResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof UpdateCustomerGroupResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface UpdateCustomerGroupsRequest
 */
export interface UpdateCustomerGroupsRequest {
  /**
   *
   * @type {Array<ListCustomerGroupsResponseInner>}
   * @memberof UpdateCustomerGroupsRequest
   */
  'CustomerGroups'?: Array<ListCustomerGroupsResponseInner>;
}
/**
 *
 * @export
 * @interface UpdateCustomerGroupsResponse
 */
export interface UpdateCustomerGroupsResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof UpdateCustomerGroupsResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof UpdateCustomerGroupsResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface UpdateCustomerRequest
 */
export interface UpdateCustomerRequest {
  /**
   * The customers first name
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'firstName'?: string;
  /**
   * The customers last name
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'lastName'?: string;
  /**
   * The customers full name
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'name': string;
  /**
   * The customers email address
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'email'?: string | null;
  /**
   * The customers phone number
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'phone'?: string | null;
  /**
   * The customers profile image
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'img'?: string | null;
  /**
   * The customers neighborhood
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'neighborhood'?: string | null;
  /**
   * The customers city
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'city'?: string | null;
  /**
   * The customers 2-letter country code
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'country'?: string | null;
  /**
   * The customers street address
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'line1'?: string | null;
  /**
   * The customers street address
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'line2'?: string | null;
  /**
   * The customers postal code
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'postal_code'?: string | null;
  /**
   * The customers state, county, province, or region
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'state'?: string | null;
  /**
   * The customers town (only used in Japan)
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'town'?: string | null;
  /**
   *
   * @type {BlockInfo}
   * @memberof UpdateCustomerRequest
   */
  'blocked'?: BlockInfo;
  /**
   *
   * @type {BlockInfo}
   * @memberof UpdateCustomerRequest
   */
  'phoneBlocked'?: BlockInfo;
  /**
   *
   * @type {BlockInfo}
   * @memberof UpdateCustomerRequest
   */
  'emailBlocked'?: BlockInfo;
  /**
   * The date the customer joined the business
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'joined'?: string | null;
  /**
   * The customers stripe ID
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'stripe'?: string | null;
  /**
   * The customers stripe ID in the dev environment
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  'stripeDev'?: string | null;
  /**
   * The ID of the customer
   * @type {string}
   * @memberof UpdateCustomerRequest
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface UpdateCustomerRequestAllOf
 */
export interface UpdateCustomerRequestAllOf {
  /**
   * The ID of the customer
   * @type {string}
   * @memberof UpdateCustomerRequestAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface UpdateCustomerResponse
 */
export interface UpdateCustomerResponse {
  /**
   *
   * @type {boolean}
   * @memberof UpdateCustomerResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof UpdateCustomerResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof UpdateCustomerResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface UpdateCustomersRequest
 */
export interface UpdateCustomersRequest {
  /**
   *
   * @type {Array<ListCustomersResponseInner>}
   * @memberof UpdateCustomersRequest
   */
  'customers'?: Array<ListCustomersResponseInner>;
}
/**
 *
 * @export
 * @interface UpdateCustomersResponse
 */
export interface UpdateCustomersResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof UpdateCustomersResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof UpdateCustomersResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface UpdateWorkflowRequest
 */
export interface UpdateWorkflowRequest {
  /**
   * The ID of the workflow to update
   * @type {string}
   * @memberof UpdateWorkflowRequest
   */
  '$id': string;
  /**
   * The name of the workflow
   * @type {string}
   * @memberof UpdateWorkflowRequest
   */
  'name'?: string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof UpdateWorkflowRequest
   */
  'initiators'?: ContextDetectionParams;
  /**
   * The fields of the workflow
   * @type {Array<ConversationContextField>}
   * @memberof UpdateWorkflowRequest
   */
  'fields'?: Array<ConversationContextField>;
  /**
   * About this conversation - used as initial context
   * @type {string}
   * @memberof UpdateWorkflowRequest
   */
  'context'?: string;
  /**
   * The webhook to call when a workflow is created
   * @type {string}
   * @memberof UpdateWorkflowRequest
   */
  'onCreated'?: string;
  /**
   * The webhook to call when a workflow is updated
   * @type {string}
   * @memberof UpdateWorkflowRequest
   */
  'onUpdated'?: string;
  /**
   * The webhook to call when a workflow is deleted
   * @type {string}
   * @memberof UpdateWorkflowRequest
   */
  'onDeleted'?: string;
  /**
   * The webhook to call when a workflow has an error
   * @type {string}
   * @memberof UpdateWorkflowRequest
   */
  'onError'?: string;
  /**
   * The priority of the workflow in relation to other workflows (determines activation order)
   * @type {number}
   * @memberof UpdateWorkflowRequest
   */
  'priority'?: number;
}
/**
 *
 * @export
 * @interface UpdateWorkflowRequestAllOf
 */
export interface UpdateWorkflowRequestAllOf {
  /**
   * The ID of the workflow to update
   * @type {string}
   * @memberof UpdateWorkflowRequestAllOf
   */
  '$id': string;
}
/**
 *
 * @export
 * @interface UpdateWorkflowResponse
 */
export interface UpdateWorkflowResponse {
  /**
   *
   * @type {boolean}
   * @memberof UpdateWorkflowResponse
   */
  'success': boolean;
  /**
   *
   * @type {Error}
   * @memberof UpdateWorkflowResponse
   */
  'error'?: Error;
  /**
   * The id of the document that was created, updated, or deleted
   * @type {string}
   * @memberof UpdateWorkflowResponse
   */
  'id': string;
}
/**
 *
 * @export
 * @interface UpdateWorkflowsRequest
 */
export interface UpdateWorkflowsRequest {
  /**
   *
   * @type {Array<ListWorkflowsResponseInner>}
   * @memberof UpdateWorkflowsRequest
   */
  'workflows'?: Array<ListWorkflowsResponseInner>;
}
/**
 *
 * @export
 * @interface UpdateWorkflowsResponse
 */
export interface UpdateWorkflowsResponse {
  /**
   * ISO 8601 datetime string of when the operation was queued
   * @type {string}
   * @memberof UpdateWorkflowsResponse
   */
  'queued': string;
  /**
   * The operation id to view the operation end results
   * @type {string}
   * @memberof UpdateWorkflowsResponse
   */
  '$operation': string;
}
/**
 *
 * @export
 * @interface Workflow
 */
export interface Workflow {
  /**
   * The name of the workflow
   * @type {string}
   * @memberof Workflow
   */
  'name': string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof Workflow
   */
  'initiators': ContextDetectionParams;
  /**
   * The fields of the workflow
   * @type {Array<ConversationContextField>}
   * @memberof Workflow
   */
  'fields': Array<ConversationContextField>;
  /**
   * About this conversation - used as initial context
   * @type {string}
   * @memberof Workflow
   */
  'context': string;
  /**
   * The webhook to call when a workflow is created
   * @type {string}
   * @memberof Workflow
   */
  'onCreated'?: string;
  /**
   * The webhook to call when a workflow is updated
   * @type {string}
   * @memberof Workflow
   */
  'onUpdated'?: string;
  /**
   * The webhook to call when a workflow is deleted
   * @type {string}
   * @memberof Workflow
   */
  'onDeleted'?: string;
  /**
   * The webhook to call when a workflow has an error
   * @type {string}
   * @memberof Workflow
   */
  'onError'?: string;
  /**
   * The priority of the workflow in relation to other workflows (determines activation order)
   * @type {number}
   * @memberof Workflow
   */
  'priority': number;
}
/**
 *
 * @export
 * @interface WorkflowPartial
 */
export interface WorkflowPartial {
  /**
   * The name of the workflow
   * @type {string}
   * @memberof WorkflowPartial
   */
  'name'?: string;
  /**
   *
   * @type {ContextDetectionParams}
   * @memberof WorkflowPartial
   */
  'initiators'?: ContextDetectionParams;
  /**
   * The fields of the workflow
   * @type {Array<ConversationContextField>}
   * @memberof WorkflowPartial
   */
  'fields'?: Array<ConversationContextField>;
  /**
   * About this conversation - used as initial context
   * @type {string}
   * @memberof WorkflowPartial
   */
  'context'?: string;
  /**
   * The webhook to call when a workflow is created
   * @type {string}
   * @memberof WorkflowPartial
   */
  'onCreated'?: string;
  /**
   * The webhook to call when a workflow is updated
   * @type {string}
   * @memberof WorkflowPartial
   */
  'onUpdated'?: string;
  /**
   * The webhook to call when a workflow is deleted
   * @type {string}
   * @memberof WorkflowPartial
   */
  'onDeleted'?: string;
  /**
   * The webhook to call when a workflow has an error
   * @type {string}
   * @memberof WorkflowPartial
   */
  'onError'?: string;
  /**
   * The priority of the workflow in relation to other workflows (determines activation order)
   * @type {number}
   * @memberof WorkflowPartial
   */
  'priority'?: number;
}
