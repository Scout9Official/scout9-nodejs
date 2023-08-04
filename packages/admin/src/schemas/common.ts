export type Timestamp = any;
export type ISOString = string;

export type MessageStatus = 'queued'|'sending'|'sent'|'failed'|'delivered'|'undelivered'|'receiving'|'received'|'accepted'|'scheduled'|'read'|'partially_delivered'|'canceled';

export const ChatCompletionRequestMessageRoleEnum = {
  System: 'system',
  User: 'user',
  Assistant: 'assistant'
} as const;

export type ChatCompletionRequestMessageRoleEnum = typeof ChatCompletionRequestMessageRoleEnum[keyof typeof ChatCompletionRequestMessageRoleEnum];


export interface ChatCompletionRequestMessage {
  /**
   * The role of the author of this message.
   * @type {string}
   * @memberof ChatCompletionRequestMessage
   */
  'role': ChatCompletionRequestMessageRoleEnum;
  /**
   * The contents of the message
   * @type {string}
   * @memberof ChatCompletionRequestMessage
   */
  'content': string;
  /**
   * The name of the user in a multi-user chat
   * @type {string}
   * @memberof ChatCompletionRequestMessage
   */
  'name'?: string;
}


export module Stripe {
  export interface Address {
    /**
     * City/District/Suburb/Town/Village.
     */
    city: string | null;

    /**
     * 2-letter country code.
     */
    country: string | null;

    /**
     * Address line 1 (Street address/PO Box/Company name).
     */
    line1: string | null;

    /**
     * Address line 2 (Apartment/Suite/Unit/Building).
     */
    line2: string | null;

    /**
     * ZIP or postal code.
     */
    postal_code: string | null;

    /**
     * State/County/Province/Region.
     */
    state: string | null;
  }
}

/**
 * Helper schedule to bridge algolia records with internal db
 */
export interface IAlgoliaIndexedObject {
  /**
   * Where this object is stored in the database
   */
  parent: string;

  /**
   * Algolia objectID required
   */
  objectID: string;


  /**
   * Algolia geolocation for a given object
   */
  _geoloc?: {
    lat: number;
    lng: number;
  }

}
