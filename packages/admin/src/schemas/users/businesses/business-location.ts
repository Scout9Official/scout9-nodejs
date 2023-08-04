import { Stripe } from '../../common';
import { ILocation } from '../../common/location';


/**
 * scout9-businesses/{businessId}/locations/{locationId}
 */
export interface IBusinessLocation extends ILocation, Stripe.Address {
  name: string;

  areaCodes?: number[] | null;

  twilioAddressSid?: string;

}
