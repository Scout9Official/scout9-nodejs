/* tslint:disable */
/* eslint-disable */
/**
 * Scout9 API
 * APIs for managing Scout9 users and conversations
 *
 * The version of the OpenAPI document: 1.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export * from './api';
export * from './configuration';
export * from './webhooks';

import { AxiosResponse } from 'axios';
import type {
  Agent,
  Conversation,
  Customer,
  ForwardRequest,
  ForwardResponse,
  GenerateRequestOneOf,
  Message,
  MessageCreateRequestRoleEnum,
  MessageCreateResponse,
  OperationBulkResponse,
  OperationDocResponse,
  PurchasePhoneRequest,
  PurchasePhoneResponse,
  WorkflowEvent,
  PurposeEnum
} from './api';
import { ConversationEnvironment, ListFilesResponseInner, Scout9Api, } from './api';
import { Configuration } from './configuration';

export type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'in'
  | 'not-in'
  | 'array-contains-any';

export type S9File = ListFilesResponseInner;

export type QueryPayload = {
  field: string;
  operator: WhereFilterOp;
  value: string | number | boolean;
}

export const toQuery = (payload: QueryPayload) => `${payload.field},${payload.operator},${payload.value}`;
export type MessageInputExistingConversation = {
  convo: string;
  message: string;
  role?: MessageCreateRequestRoleEnum;
  html?: string;
}
export type MessageInputNewConversation = {
  /**
   * Either customer id, customer phone, or customer email
   */
  to: string;
  /**
   * Either agent id, agent forward phone #, programmable phone #, forward email, or programmable email address. If the
   * contact is valid, it will auto resolve the correct agent.
   */
  from: string;

  /**
   * Overrides auto detected environment
   */
  environment?: ConversationEnvironment;

  message: string;
  role?: MessageCreateRequestRoleEnum;
  html?: string;
}
export type MessageInput = MessageInputExistingConversation | MessageInputNewConversation;

async function sendMessage(_scout9: Scout9Api, input: MessageInput) {
  if (!('convo' in input) && !input.to) {
    throw new Error('Either .convo or .to must be provided in message payload');
  }
  return _scout9.message({
    convo: 'convo' in input ? input.convo : {
      customerIdOrPhoneOrEmail: input.to || '',
      agentIdOrPhoneOrEmail: input.from || '',
      environment: input.environment,
    },
    message: input.message,
    ...(input.html ? {html: input.html} : {}),
    role: input.role || 'agent'
  }).then(resolve<MessageCreateResponse>);
}

function resolve<Type>(res: AxiosResponse<Type, any>) {
  return res.data;
}


export default function (apiKey: string) {
  const configuration = new Configuration({apiKey});
  const scout9 = new Scout9Api(configuration);
  return {

    app: {
      run: async (event: WorkflowEvent) => scout9.runPlatform(event),
      config: async () => scout9.runPlatformConfig().then(resolve<any>),
      context: {
        files: {
          list: async () => scout9.files('context').then(resolve<S9File[]>),
          retrieve: async (contextId: string,) => scout9.file('context', contextId),
          remove: async (contextId: string) => scout9.fileRemove('context', contextId),
        }
      }
    },

    agents: {
      retrieve: async (id: string) => scout9.agent(id).then(resolve<Agent | null>),
      list: async (query: QueryPayload) => scout9.agents(toQuery(query)).then(resolve<(Agent & { $id: string })[]>),
      create: async (data: Agent) => scout9.agentRegister({
        firstName: '',
        lastName: '',
        forwardEmail: '',
        forwardPhone: '',
        ...data
      }).then(resolve<OperationDocResponse>),
      update: async (id: string, data: Partial<Agent>) => scout9.agentUpdate({
        ...data,
        $id: id
      }).then(resolve<OperationDocResponse>),
      purchasePhone: async (agentId?: string, purchaseOptions?: Omit<PurchasePhoneRequest, '$agent'>) => scout9.purchasePhone(
        agentId ? {
          $agent: agentId,
          ...(purchaseOptions || {})
        } : undefined).then(resolve<PurchasePhoneResponse>),
      remove: async (id: string) => scout9.agentDelete(id).then(resolve<OperationDocResponse>),
      bulkRemove: async (ids: string[]) => scout9.agentsDelete(ids).then(resolve<OperationBulkResponse>),
      bulkCreate: async (data: Agent[]) => scout9.agentsCreate({
        agents: data.map(a => ({
          firstName: '',
          lastName: '',
          ...a
        }))
      }).then(resolve<OperationBulkResponse>),
      bulkUpdate: async (data: (Partial<Agent> & { id: string })[]) => scout9.agentsUpdate({
        agents: data.map(a => ({
          $id: a.id,
          ...a as any
        }))
      }).then(resolve<OperationBulkResponse>),
      transcripts: {
        list: async (agentId?: string) => scout9.files('agent-transcript', agentId).then(resolve<S9File[]>),
        retrieve: async (agentId: string, fileId: string,) => scout9.file('agent-transcript', fileId, agentId),
        remove: async (agentId: string, fileId: string) => scout9.fileRemove('agent-transcript', fileId, agentId),
        upload: async (agentId: string, file: File | Buffer | Blob, fileId?: string) => scout9.fileUpload(file,
          'agent-transcript',
          fileId,
          agentId),
      },
      audio: {
        list: async (agentId?: string) => scout9.files('agent-audio', agentId).then(resolve<S9File[]>),
        retrieve: async (agentId: string, fileId: string,) => scout9.file('agent-audio', fileId, agentId),
        remove: async (agentId: string, fileId: string) => scout9.fileRemove('agent-audio', fileId, agentId),
        upload: async (agentId: string, file: File | Buffer | Blob, fileId?: string) => scout9.fileUpload(file,
          'agent-audio',
          fileId,
          agentId),
      }
    },
    conversation: {
      retrieve: async (id: string) => scout9.conversation(id).then(resolve<Conversation | null>),
      list: async (query: QueryPayload) => scout9.conversations(toQuery(query))
        .then(resolve<(Agent & { $id: string })[]>),
      remove: async (id: string) => scout9.conversationDelete(id).then(resolve<OperationDocResponse>),
      create: async (data: Conversation) => scout9.conversationCreate({
        ...data
      }).then(resolve<OperationDocResponse>),
      update: async (id: string, data: Partial<Conversation>) =>
        scout9.conversationUpdate({
          ...data as any,
          $id: id
        }).then(resolve<OperationDocResponse>),
      forward: async (conversationId: string, options?: Pick<ForwardRequest, 'forward' | 'latestMessage' | 'convo'>) => scout9.forward(
        {
          convo: conversationId,
          ...(options || {})
        }).then(resolve<ForwardResponse>),
      generate: async (conversationId: string, mockData?: GenerateRequestOneOf) => scout9.generate(mockData ? mockData : conversationId),
      message: async (conversationId: string, message: string, role: MessageCreateRequestRoleEnum = 'agent', html?: string) => scout9.message(
        {
          convo: conversationId,
          message,
          ...(html ? {html} : {}),
          role
        }).then(resolve<MessageCreateResponse>),
      messages: {
        send: (input: MessageInput) => sendMessage(scout9, input),
        list: async (conversationId: string) => scout9.messages(conversationId).then(resolve<Message[]>),
      }
    },

    message: {
      send: (input: MessageInput) => sendMessage(scout9, input),
    },
    messages: {
      list: async (conversationId: string) => scout9.messages(conversationId).then(resolve<Message[]>),
    },

    customers: {
      retrieve: async (idOrEmailOrPhone: string) => scout9.customer(idOrEmailOrPhone).then(resolve<Customer>),
      list: async (query: QueryPayload) => scout9.customers(toQuery(query))
        .then(resolve<(Customer & { $id: string })[]>),
      remove: async (customerId: string) => scout9.customerDelete(customerId).then(resolve<OperationDocResponse>),
      create: async (data: Customer) => scout9.customerCreate(data).then(resolve<OperationDocResponse>),
      update: async (customerId: string, data: Partial<Customer>) => scout9.customerUpdate({
        name: '', ...data,
        $id: customerId
      }).then(resolve<OperationDocResponse>),
      bulkCreate: async (customers: Customer[]) => scout9.customersCreate({customers})
        .then(resolve<OperationBulkResponse>),
      bulkRemove: async (ids: string[]) => scout9.customersDelete(ids).then(resolve<OperationBulkResponse>),
      bulkUpdate: async (data: { $id: string & Partial<Customer> }[]) =>
        scout9.customersUpdate({
          customers: data.map(c => ({
            ...c as any
          }))
        }).then(resolve<OperationBulkResponse>),
    },

    utils: {
      fileUpload: scout9.fileUpload,
      files: scout9.files,
    },

    v1: scout9
  };
}
