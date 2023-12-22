/// <reference types="node" />
export type WebhookEventType = 'conversation.created' | 'conversation.updated' | 'conversation.deleted' | 'conversation.error' | 'conversation.locked';
export type IWebhookEvent<Context = Record<string, any>> = {
    type: WebhookEventType;
    $conversation: string;
    $workflow: string;
    messages: {
        role: 'user' | 'assistant' | 'system';
        content: string;
        time: string;
    }[];
    context: Context;
};
export declare namespace Scout9Webhooks {
    function constructEvent<Context = any>(rawBody: string | Buffer, signatureKey: string, secretKey: string): Promise<IWebhookEvent<Context>>;
}
