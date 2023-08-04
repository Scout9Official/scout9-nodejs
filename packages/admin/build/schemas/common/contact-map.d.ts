import { EmailServiceType } from '../users';
export interface IContactPath {
    id: string;
    path: string;
}
/**
 * A utility helper collection to map contact information to a common format.
 *
 * scout9-contact-map/{contact}
 */
export interface IContactMap {
    /**
     * Can either be the formatted phone number or email address.
     */
    contact: string;
    agentPaths: {
        businessId: string;
        agentId: string;
    }[];
    customerPaths: {
        businessId: string;
        customerId: string;
    }[];
    programmableEmailProps?: {
        type: EmailServiceType;
        /**
         * If this email is a gmail email, then we can store the refresh token (after they O-Auth) here so that we can run gmail.contacts.watch
         * @TODO - create a O-Auth flow for this, see scripts/gmail/generate-refresh-token for an example
         */
        gmailRefreshToken?: string;
        gmailWatchExpiration?: string;
    };
}
