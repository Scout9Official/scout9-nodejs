import { Timestamp } from '../common';
import { IThread } from '../users';
import { ConversationEnvironment } from './message';
export interface IConversationEnvironmentProps {
    subject?: string;
    /**
     * Used to sync email messages with the conversation
     *
     */
    platformEmailThreadId?: string;
}
/**
 * scout9-conversations/{conversationId}
 *
 * A two way conversation between a customer and a businesses agents
 */
export interface IConversation extends Pick<IThread, 'onCreated' | 'onDeleted' | 'onUpdated' | 'onError'> {
    /**
     * Customer this conversation is with
     * scout9-businesses/{$business}/customers/{$customer}
     */
    $customer: string;
    /**
     * Business this conversation is with
     * scout9-businesses/{$businesses}
     */
    $business: string;
    /**
     * Agent assigned to this conversation
     * scout9-businesses/{$businesses}/agents/{$agents}
     */
    $agent: string;
    /**
     * Thread this conversation is in - this determines what context to pull when loading the conversation
     * scout9-businesses/{$businesses}/threads/{$threads}
     */
    $thread: string;
    /**
     * When the conversation is created, append these contexts to the conversation
     */
    initialContexts?: string[];
    initiated: Timestamp;
    /**
     * What parser functions to run for this conversation, by default will parse core fields
     */
    parse?: string[];
    /**
     * What this environment is intended for
     * Defaults to 'web'
     */
    environment?: ConversationEnvironment;
    environmentProps?: IConversationEnvironmentProps;
}
