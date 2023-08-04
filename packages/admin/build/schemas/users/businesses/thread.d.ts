import { IConversationContextField } from '../../conversations';
import { IContextDetectionParams } from './context';
/**
 * Languages we support
 */
export type ThreadLanguage = 'en' | 'es';
/**
 * Used to initiate conversations
 * scout9-businesses/{businessId}/threads/{threadId}
 */
export interface IThread {
    /**
     * Name of the thread
     */
    name: string;
    /**
     * Metadata to be used to detect when this conversation should be initiated
     */
    initiators: IContextDetectionParams;
    /**
     * Fields to be loaded to a conversation
     */
    fields: IConversationContextField[];
    /**
     * About this conversation - used as initial context
     */
    context: string;
    /**
     * Public webhook when thread is created
     */
    onCreated?: string;
    /**
     * Public webhook when thread is updated
     */
    onUpdated?: string;
    /**
     * Public webhook when thread is deleted
     */
    onDeleted?: string;
    /**
     * Public webhook when thread has an error
     */
    onError?: string;
}
