import { ChatCompletionRequestMessage, MessageStatus, Timestamp } from '../common';
import { IConversationContextField } from './context';
import { ConversationParsed } from './parsed';
export type ConversationEnvironment = 'phone' | 'web' | 'email';
export interface IConversationMessageEmailProps {
    /**
     * The platform that this message was sent from the assigned agent in the conversation
     * (this is used to help with sync/identification mainly getting the global Message-ID)
     */
    platformMessageId?: string;
    /**
     * The global message id that this message states in email headers 'Message-ID'
     */
    globalMessageId?: string;
}
export interface IConversationMessage extends ChatCompletionRequestMessage {
    time: Timestamp;
    contentHtml?: string;
    /**
     * When the message is created we parse the message for relevant fields
     */
    parsed?: ConversationParsed;
    /**
     * Time at which the parsed information was processed
     */
    parsedLoaded?: Timestamp;
    /**
     * The message we are replying to
     */
    replyTo?: string;
    emailEnvironmentProps?: IConversationMessageEmailProps;
    smsEnvironmentProps?: {
        twilioMessageId: string;
    };
    /**
     * @TODO the existence of this field being being perceived as an indication that the message
     * was recived by the client, this should be changed and handled properly
     */
    receipt?: IConversationMessageReceipt;
    /**
     * @TODO remove this in production as it will bloat the database
     */
    context?: IConversationContextField[];
}
export interface IConversationMessageReceipt {
    environment: {
        type: 'phone';
        /**
         * Twilio message id
         */
        sid: string;
        status: MessageStatus;
    } | {
        type: 'web';
    } | {
        type: 'email';
        status: 'sent' | 'received';
    };
    time: Timestamp;
    error?: string;
    errorCode?: string;
}
