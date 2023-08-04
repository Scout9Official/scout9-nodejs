/**
 * scout9-businesses/{businessId}/offers-indexed/{offerId}
 * An auto generated offer, when an offer is created it will be indexed in a collection, resolving all stripe and
 * algolia references.
 */
import { IOffer } from './offer';
/**
 * @deprecated - use Context
 */
export interface IOfferIndexed extends IOffer {
    /**
     * scout9-businesses/{businessId}/offers/{parent}
     */
    parent: string;
    /**
     * Algolia objectID
     */
    objectID: string;
    /**
     * Stripe product ID
     */
    stripe?: string;
    /**
     * Stripe product ID for dev
     */
    stripeDev?: string;
    /**
     * Algolia geolocation for the offer, offer is limited to this location at some distance
     */
    _geoloc?: {
        lat: number;
        lng: number;
    };
}
