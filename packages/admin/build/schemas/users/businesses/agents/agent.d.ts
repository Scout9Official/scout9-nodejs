/**
 * scout9-businesses/{businessId}/agents/{agentId}
 *
 * An agents is a person who works for a businesses
 */
export type EmailServiceType = 'sendgrid' | 'gmail' | 'outlook';
export interface IAgent {
    img?: string;
    firstName: string;
    lastName: string;
    inactive?: boolean;
    /**
     * Programmable phone number from Twilio
     */
    programmablePhoneNumber?: string;
    programmablePhoneNumberSid?: string;
    /**
     * Email address from Scout9 gmail subdomain
     */
    programmableEmail?: string;
    forwardEmail?: string;
    /**
     * All agents must have a phone number (used to login)
     */
    forwardPhone: string;
    /**
     * Whether or not this agent has been verified by the business.
     */
    /**
     * Title of the agent, defaults to "Agent"
     */
    title: string;
    /**
     * In 1 sentence, what does this agent do for customers.
     */
    context: string;
    /**
     * If provided, this means they are part of these office locations. If not provided and excludedLocations not
     * provided, we assume this agents can support all locations.
     * scout9-businesses/{businessId}/locations/{...includedLocations}
     */
    includedLocations?: string[];
    /**
     * If provided, this will take precedence over includedLocations.
     * scout9-businesses/{businessId}/locations/{...excludedLocations}
     */
    excludedLocations?: string[];
    /**
     * A base64 large string object of the transcript, for example if the agents name is "Jeff", then the decoded transcript would be:
     *
     * Format 1:
     *
     * Jeff: Hey Bill, so you need help with you car?
     *
     * Bill: Yes, I need to get my car fixed
     *
     * Jeff: Ok, what's the problem?
     *
     * Format 2:
     *
     * [Jeff] Hey Bill, so you need help with you car?
     *
     * [Bill] Yes, I need to get my car fixed
     *
     * [Jeff] Ok, what's the problem?
     *
     *
     *
     * The agents name "Jeff" must match exact the agents name in the database, otherwise it won't work.
     */
    transcript?: string;
    /**
     * Firebase storage reference to the audio file if available
     */
    audioRef?: string;
}
