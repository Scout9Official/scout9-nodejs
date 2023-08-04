import { Currency } from '../../../common/currency';
/**
 * scout9-businesses/{businessId}/offers/{offerId}
 *
 * What do you offer to your customers? How can your agents help them?
 * @deprecated - use Context
 */
export interface IOffer {
    name: string;
    description: string;
    /**
     * Tags for the offer to be captured by the AI
     */
    tags: string[];
    /**
     * The price of the offer is either a fixed price or an estimated price range
     */
    price: number | [number, number];
    currency: Currency;
    /**
     * Media urls for the offer
     */
    media?: string[];
    /**
     * scout9-businesses/{businessId}/locations/{locationId}
     * If provided, the offer is only limited to these locations.
     */
    locations?: string[];
}
