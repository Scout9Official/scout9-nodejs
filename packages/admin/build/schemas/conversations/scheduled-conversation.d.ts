import { Timestamp } from '../common';
import { IConversation } from './conversation';
import { ConversationEnvironment } from './message';
/**
 * scout9-scheduled-conversations/{conversationId}
 * When a conversation is scheduled to be sent at a later time
 */
export interface IScheduledConversation extends IConversation {
    scheduled: Timestamp;
    initialMessage: string;
    initialMessageHtml?: string;
    sent?: Timestamp;
    /**
     * Attached to a schedule group
     * scout9-scheduled-conversation-groups/{groupId}
     */
    $group?: string;
}
/**
 * scout9-scheduled-conversation-groups/{groupId}
 */
export interface IScheduledGroupConversation extends Omit<IScheduledConversation, '$customer' | 'environment' | '$group'> {
    customers: {
        environment: ConversationEnvironment;
        id: string;
    }[];
    /**
     * How much we should delay between schedules, defaults to 15000 (15 seconds)
     */
    delay?: number;
}
