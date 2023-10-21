import {createHmac} from 'crypto';

export type WebhookEventType =
  'conversation.created'
  | 'conversation.updated'
  | 'conversation.deleted'
  | 'conversation.error'
  | 'conversation.locked';

export type IWebhookEvent<Context = Record<string, any>> = {
  type: WebhookEventType;
  // time: Timestamp;
  $conversation: string;
  $workflow: string;
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    time: string;
  }[];
  context: Context;
}

export module Scout9Webhooks {

  export function constructEvent<Context = any>(rawBody: string | Buffer, signatureKey: string, secretKey: string): Promise<IWebhookEvent<Context>> {

    // Compute the HMAC
    const computedSignature = createHmac('sha256', secretKey)
      .update(rawBody)
      .digest('hex');

    // Verify signature
    if (computedSignature !== signatureKey) {
      throw new Error('Signature verification failed.');
    }

    return JSON.parse(rawBody.toString());
  }

}



