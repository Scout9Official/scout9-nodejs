/**
 * scout9-businesses/{businessId}
 */
export interface IBusiness {
    name: string;
    logo?: string;
    icon?: string;
    /**
     * User id of the owner of this account
     */
    $owner: string;
    phone: string;
    email: string;
    /**
     * 1 sentence what does this business do?
     */
    context: string;
    apiKey?: string;
    website?: string;
    webhookUrl?: string;
    /**
     * Stripe customer ids for charging subscriptions
     */
    stripeCustomer?: string;
    stripeCustomerDev?: string;
    /**
     * Stripe connect ids for charging customers on behalf of Scout9
     */
    stripeConnect?: string;
    stripeConnectDev?: string;
    twilioAddressSid?: string;
}
