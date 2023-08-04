import { IConversationMessage } from './message';
import { ConversationParsed } from './parsed';
export type MessageWebhookType = 'conversation.scheduled' | 'conversation.created' | 'conversation.updated' | 'conversation.deleted' | 'conversation.error' | 'conversation.message.created' | 'conversation.message.updated' | 'conversation.message.deleted' | 'conversation.message.error';
export interface IMessageWebhookResponse {
    type: MessageWebhookType;
    parsed?: ConversationParsed;
    message?: IConversationMessage;
}
