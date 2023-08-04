/**
 * If user is blocked, we can't send messages to them, this could happen if the customer has unsubscribed from the business
 */
import { Stripe, Timestamp } from '../../common';

export interface IBlockInfo {
  message: string;
  time: Timestamp;
}

/**
 * scout9-businesses/{$business}/customers/{customerId}
 *
 * Any information that is specific to a customer (not a businesses), the customerId can be used to get the auth details
 * (email/phone)
 */
export interface ICustomer extends Partial<Stripe.Address> {

  firstName: string;
  lastName: string;
  img?: string;

  /**
   * If this is a temp user, delete them after x days
   */
  temp?: boolean;

  // Id for neighborhood
  neighborhood?: string;
  neighborhoodName?: string;
  address?: string;
  addressStr?: string;

  blocked?: IBlockInfo;

  phone?: string;
  phoneBlocked?: IBlockInfo;
  email?: string;
  emailBlocked?: IBlockInfo;

  joined?: Timestamp;

  // Stripe IDs for processing payments
  stripe?: string;
  stripeDev?: string;
}
