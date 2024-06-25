declare module '@scout9/app/testing-tools' {
	import type { z } from 'zod';
	export function createMockAgent(firstName?: string, lastName?: string): IAgent;
	export function createMockCustomer(firstName?: string, lastName?: string): ICustomer;
	export function createMockMessage(content: any, role?: string, time?: string): IMessage;
	export function createMockConversation(environment?: string, $agent?: string, $customer?: string): IConversation;
	export function createMockWorkflowEvent(message: string, intent?: string | IWorkflowEvent['intent'] | null): IWorkflowEvent;
	/**
	 * Testing tool kit, used to handle Scout9 operations such as parsing, workflow, and generating responses
	 */
	export class Scout9Test {
		/**
		 * Mimics a customer message to your app (useful for testing)
		 * @param props - the Scout9Test properties
		 * @param props.customer - customer to use
		 * @param props.context - prior conversation context
		 * @param props.persona id to use
		 * @param props.conversation - existing conversation
		 * 
		 */
		constructor({ persona, customer, context, conversation, cwd, src, mode, api, app, project }?: {
			cwd?: string;
			src?: string;
			mode?: string;
			persona: any;
			customer: any;
			context: any;
			conversation?: {
				environment: "email" | "phone" | "web";
				$agent: string;
				$customer: string;
				initialContexts?: string[] | undefined;
				environmentProps?: {
					subject?: string | undefined;
					platformEmailThreadId?: string | undefined;
				} | undefined;
				locked?: boolean | null | undefined;
				lockedReason?: string | null | undefined;
				lockAttempts?: number | null | undefined;
				forwardedTo?: string | null | undefined;
				forwarded?: string | null | undefined;
				forwardNote?: string | null | undefined;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
			} | undefined;
			api: any;
			app: any;
			project: any;
		});
		
		customer: ICustomer;
		
		persona: IPersona;
		
		conversation: IConversation;
		
		messages: IMessage[];
		
		context: any;
		
		private _project;
		
		private _app;
		
		private _api;
		
		private _cwd;
		
		private _src;
		
		private _mode;
		
		private _loaded;
		
		private _personaId;
		/**
		 * Loads the test environment
		 * @param override - defaults to false, if true, it will override the current loaded state such as the scout9 api, workflow function, and project config
		 * */
		load(override?: boolean | undefined): Promise<void>;
		/**
		 * Teardown the test environment
		 */
		teardown(): void;
		/**
		 * Send a message as a customer to your app
		 * @param message - message to send
		 * @param progress - progress callback, if true, will log progress, can override with your own callback. If not provided, no logs will be added.
		 * */
		send(message: string, progress?: boolean | import("@scout9/app/testing-tools").StatusCallback | undefined): Promise<ConversationEvent>;
		/**
		 * Parse user message
		 * @param message - message string to parse
		 * @param language - language to parse in, defaults to "en" for english
		 * */
		parse(message: string, language?: string | undefined): Promise<import('@scout9/admin').ParseResponse>;
		/**
		 * Runs your local app workflow
		 * @param message - the message to run through the workflow
		 * @param event - additional event data
		 * */
		workflow(message: string, event?: Omit<Partial<IWorkflowEvent>, 'message'> | undefined): Promise<IWorkflowResponse>;
		/**
		 * Generate a response to the user from the given or registered persona's voice in relation to the current conversation's context.
		 * @param {Object} input - Generation input, defaults to test registered data such as existing messages, context, and persona information.
		 * */
		generate({ personaId, conversation, messages, context }?: {
			personaId?: string | undefined;
			conversation?: Partial<import("@scout9/admin").ConversationCreateRequest> | undefined;
			messages?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[] | undefined;
			context?: any;
		} | undefined): Promise<import('@scout9/admin').GenerateResponse>;
		
		private _loadApp;
	}
	const customerSchema: z.ZodObject<{
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		name: z.ZodString;
		email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
	}, "strip", z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, z.objectOutputType<{
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		name: z.ZodString;
		email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
	}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">, z.objectInputType<{
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		name: z.ZodString;
		email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
	}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">>;

	const agentBaseConfigurationSchema: z.ZodObject<{
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		inactive: z.ZodOptional<z.ZodBoolean>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
	}, "strip", z.ZodTypeAny, {
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}, {
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		title?: string | undefined;
		context?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}>;
	type ICustomer = import('zod').infer<typeof customerSchema>;
	type IAgent = import('zod').infer<typeof agentBaseConfigurationSchema>;
	type IPersona = import('zod').infer<typeof agentBaseConfigurationSchema>;
	const MessageSchema: z.ZodObject<{
		id: z.ZodString;
		role: z.ZodEnum<["agent", "customer", "system"]>;
		content: z.ZodString;
		time: z.ZodString;
		name: z.ZodOptional<z.ZodString>;
		scheduled: z.ZodOptional<z.ZodString>;
		context: z.ZodOptional<z.ZodAny>;
		intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
	}, "strip", z.ZodTypeAny, {
		time: string;
		id: string;
		content: string;
		role: "agent" | "customer" | "system";
		name?: string | undefined;
		scheduled?: string | undefined;
		context?: any;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
		delayInSeconds?: number | null | undefined;
	}, {
		time: string;
		id: string;
		content: string;
		role: "agent" | "customer" | "system";
		name?: string | undefined;
		scheduled?: string | undefined;
		context?: any;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
		delayInSeconds?: number | null | undefined;
	}>;
	type IMessage = import('zod').infer<typeof MessageSchema>;
	const ConversationSchema: z.ZodObject<{
		$agent: z.ZodString;
		$customer: z.ZodString;
		initialContexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		environment: z.ZodEnum<["phone", "email", "web"]>;
		environmentProps: z.ZodOptional<z.ZodObject<{
			subject: z.ZodOptional<z.ZodString>;
			platformEmailThreadId: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		}, {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		}>>;
		locked: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
		lockedReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		lockAttempts: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
		forwardedTo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		forwarded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		forwardNote: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		intentScore: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
	}, "strip", z.ZodTypeAny, {
		environment: "email" | "phone" | "web";
		$agent: string;
		$customer: string;
		initialContexts?: string[] | undefined;
		environmentProps?: {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		} | undefined;
		locked?: boolean | null | undefined;
		lockedReason?: string | null | undefined;
		lockAttempts?: number | null | undefined;
		forwardedTo?: string | null | undefined;
		forwarded?: string | null | undefined;
		forwardNote?: string | null | undefined;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
	}, {
		environment: "email" | "phone" | "web";
		$agent: string;
		$customer: string;
		initialContexts?: string[] | undefined;
		environmentProps?: {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		} | undefined;
		locked?: boolean | null | undefined;
		lockedReason?: string | null | undefined;
		lockAttempts?: number | null | undefined;
		forwardedTo?: string | null | undefined;
		forwarded?: string | null | undefined;
		forwardNote?: string | null | undefined;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
	}>;

	const WorkflowEventSchema: z.ZodObject<{
		messages: z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>, "many">;
		conversation: z.ZodObject<{
			$agent: z.ZodString;
			$customer: z.ZodString;
			initialContexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			environment: z.ZodEnum<["phone", "email", "web"]>;
			environmentProps: z.ZodOptional<z.ZodObject<{
				subject: z.ZodOptional<z.ZodString>;
				platformEmailThreadId: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			}, {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			}>>;
			locked: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
			lockedReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			lockAttempts: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
			forwardedTo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			forwarded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			forwardNote: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		}, {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		}>;
		context: z.ZodAny;
		message: z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>;
		agent: z.ZodObject<Omit<{
			inactive: z.ZodOptional<z.ZodBoolean>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			deployed: z.ZodOptional<z.ZodObject<{
				web: z.ZodOptional<z.ZodString>;
				phone: z.ZodOptional<z.ZodString>;
				email: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}>>;
			programmablePhoneNumber: z.ZodOptional<z.ZodString>;
			programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
			programmableEmail: z.ZodOptional<z.ZodString>;
			forwardEmail: z.ZodOptional<z.ZodString>;
			forwardPhone: z.ZodOptional<z.ZodString>;
			includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
			transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				role: z.ZodEnum<["agent", "customer", "system"]>;
				content: z.ZodString;
				time: z.ZodString;
				name: z.ZodOptional<z.ZodString>;
				scheduled: z.ZodOptional<z.ZodString>;
				context: z.ZodOptional<z.ZodAny>;
				intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			}, "strip", z.ZodTypeAny, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}>, "many">, "many">>;
			audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
			id: z.ZodString;
		}, "context" | "includedLocations" | "excludedLocations" | "model" | "transcripts" | "audios">, "strip", z.ZodTypeAny, {
			id: string;
			title: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}, {
			id: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			title?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}>;
		customer: z.ZodObject<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, "strip", z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, z.objectOutputType<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">, z.objectInputType<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">>;
		intent: z.ZodObject<{
			current: z.ZodNullable<z.ZodString>;
			flow: z.ZodArray<z.ZodString, "many">;
			initial: z.ZodNullable<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			current: string | null;
			flow: string[];
			initial: string | null;
		}, {
			current: string | null;
			flow: string[];
			initial: string | null;
		}>;
		stagnationCount: z.ZodNumber;
		note: z.ZodOptional<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		message: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		};
		agent: {
			id: string;
			title: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		};
		customer: {
			name: string;
			firstName?: string | undefined;
			lastName?: string | undefined;
			email?: string | null | undefined;
			phone?: string | null | undefined;
			img?: string | null | undefined;
			neighborhood?: string | null | undefined;
			city?: string | null | undefined;
			country?: string | null | undefined;
			line1?: string | null | undefined;
			line2?: string | null | undefined;
			postal_code?: string | null | undefined;
			state?: string | null | undefined;
			town?: string | null | undefined;
			joined?: string | null | undefined;
			stripe?: string | null | undefined;
			stripeDev?: string | null | undefined;
		} & {
			[k: string]: string | number | boolean;
		};
		intent: {
			current: string | null;
			flow: string[];
			initial: string | null;
		};
		messages: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[];
		conversation: {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		};
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}, {
		message: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		};
		agent: {
			id: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			title?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		};
		customer: {
			name: string;
			firstName?: string | undefined;
			lastName?: string | undefined;
			email?: string | null | undefined;
			phone?: string | null | undefined;
			img?: string | null | undefined;
			neighborhood?: string | null | undefined;
			city?: string | null | undefined;
			country?: string | null | undefined;
			line1?: string | null | undefined;
			line2?: string | null | undefined;
			postal_code?: string | null | undefined;
			state?: string | null | undefined;
			town?: string | null | undefined;
			joined?: string | null | undefined;
			stripe?: string | null | undefined;
			stripeDev?: string | null | undefined;
		} & {
			[k: string]: string | number | boolean;
		};
		intent: {
			current: string | null;
			flow: string[];
			initial: string | null;
		};
		messages: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[];
		conversation: {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		};
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}>;
	/**
	 * The workflow response object slot
	 * 
	 */
	const WorkflowResponseSlotSchema: z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>;
	/**
	 * The workflow response to send in any given workflow
	 * 
	 */
	const WorkflowResponseSchema: z.ZodUnion<[z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>, z.ZodArray<z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>, "many">]>;
	type IConversation = import('zod').infer<typeof ConversationSchema>;
	type IWorkflowEvent = import('zod').infer<typeof WorkflowEventSchema>;
	/**
	 * The workflow response object slot
	 */
	type IWorkflowResponseSlot = import('zod').infer<typeof WorkflowResponseSlotSchema>;
	/**
	 * The workflow response to send in any given workflow
	 */
	type IWorkflowResponse = import('zod').infer<typeof WorkflowResponseSchema>;
	export namespace Spirits {
		function customer(input: ConversationData & CustomerSpiritCallbacks): Promise<ConversationEvent>;
	}
	export type Document = {
		id: string;
	};
	/**
	 * Represents a change with before and after states of a given type.
	 */
	export type Change<Type> = {
		/**
		 * - The state before the change.
		 */
		before: Type;
		/**
		 * - The state after the change.
		 */
		after: Type;
	};
	export type ConversationData = {
		/**
		 * - used to define generation and extract persona metadata
		 */
		config: IScout9ProjectBuildConfig;
		conversation: IConversation;
		messages: Array<IMessage>;
		/**
		 * - the message sent by the customer (should exist in messages)
		 */
		message: IMessage;
		customer: ICustomer;
		context: any;
	};
	export type ParseOutput = {
		messages: Array<IMessage>;
		conversation: IConversation;
		message: IMessage;
		context: any;
	};
	export type WorkflowOutput = {
		slots: Array<IWorkflowResponseSlot>;
		messages: Array<IMessage>;
		conversation: IConversation;
		context: any;
	};
	export type GenerateOutput = {
		generate: import('@scout9/admin').GenerateResponse | undefined;
		messages: Array<IMessage>;
		conversation: IConversation;
		context: any;
	};
	export type ParseFun = (message: string, language: string | undefined) => Promise<import('@scout9/admin').ParseResponse>;
	export type WorkflowFun = (event: IWorkflowEvent) => Promise<IWorkflowResponse>;
	export type GenerateFun = (data: import('@scout9/admin').GenerateRequestOneOf) => Promise<import('@scout9/admin').GenerateResponse>;
	export type IdGeneratorFun = (prefix: any) => string;
	export type StatusCallback = (message: string, level?: 'info' | 'warn' | 'error' | 'success' | undefined, type?: string | undefined, payload?: any | undefined) => void;
	export type CustomerSpiritCallbacks = {
		parser: ParseFun;
		workflow: WorkflowFun;
		generator: GenerateFun;
		idGenerator: IdGeneratorFun;
		progress?: StatusCallback | undefined;
	};
	export type ConversationEvent = {
		conversation: Change<IConversation> & {
			forwardNote?: string;
			forward?: IWorkflowResponseSlot['forward'];
		};
		messages: Change<Array<IMessage>>;
		context: Change<Object>;
		message: Change<IMessage>;
	};
	const Scout9ProjectBuildConfigSchema: z.ZodObject<{
		organization: z.ZodOptional<z.ZodObject<{
			name: z.ZodString;
			description: z.ZodString;
			dashboard: z.ZodOptional<z.ZodString>;
			logo: z.ZodOptional<z.ZodString>;
			icon: z.ZodOptional<z.ZodString>;
			logos: z.ZodOptional<z.ZodString>;
			website: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		}, {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		}>>;
		tag: z.ZodOptional<z.ZodString>;
		llm: z.ZodUnion<[z.ZodObject<{
			engine: z.ZodLiteral<"openai">;
			model: z.ZodUnion<[z.ZodLiteral<"gpt-4-1106-preview">, z.ZodLiteral<"gpt-4-vision-preview">, z.ZodLiteral<"gpt-4">, z.ZodLiteral<"gpt-4-0314">, z.ZodLiteral<"gpt-4-0613">, z.ZodLiteral<"gpt-4-32k">, z.ZodLiteral<"gpt-4-32k-0314">, z.ZodLiteral<"gpt-4-32k-0613">, z.ZodLiteral<"gpt-3.5-turbo">, z.ZodLiteral<"gpt-3.5-turbo-16k">, z.ZodLiteral<"gpt-3.5-turbo-0301">, z.ZodLiteral<"gpt-3.5-turbo-0613">, z.ZodLiteral<"gpt-3.5-turbo-16k-0613">, z.ZodString]>;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "openai";
		}, {
			model: string;
			engine: "openai";
		}>, z.ZodObject<{
			engine: z.ZodLiteral<"llama">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "llama";
		}, {
			model: string;
			engine: "llama";
		}>, z.ZodObject<{
			engine: z.ZodLiteral<"bard">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "bard";
		}, {
			model: string;
			engine: "bard";
		}>]>;
		pmt: z.ZodObject<{
			engine: z.ZodLiteral<"scout9">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "scout9";
		}, {
			model: string;
			engine: "scout9";
		}>;
		maxLockAttempts: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
		initialContext: z.ZodArray<z.ZodString, "many">;
		agents: z.ZodArray<z.ZodObject<{
			deployed: z.ZodOptional<z.ZodObject<{
				web: z.ZodOptional<z.ZodString>;
				phone: z.ZodOptional<z.ZodString>;
				email: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			inactive: z.ZodOptional<z.ZodBoolean>;
			programmablePhoneNumber: z.ZodOptional<z.ZodString>;
			programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
			programmableEmail: z.ZodOptional<z.ZodString>;
			forwardEmail: z.ZodOptional<z.ZodString>;
			forwardPhone: z.ZodOptional<z.ZodString>;
			title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
			transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				role: z.ZodEnum<["agent", "customer", "system"]>;
				content: z.ZodString;
				time: z.ZodString;
				name: z.ZodOptional<z.ZodString>;
				scheduled: z.ZodOptional<z.ZodString>;
				context: z.ZodOptional<z.ZodAny>;
				intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			}, "strip", z.ZodTypeAny, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}>, "many">, "many">>;
			audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		}, "strip", z.ZodTypeAny, {
			title: string;
			context: string;
			model: "openai" | "bard" | "Scout9";
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}, {
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			title?: string | undefined;
			context?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			model?: "openai" | "bard" | "Scout9" | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}>, "many">;
		entities: z.ZodArray<z.ZodEffects<z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			definitions: z.ZodOptional<z.ZodArray<z.ZodObject<{
				utterance: z.ZodOptional<z.ZodString>;
				value: z.ZodString;
				text: z.ZodArray<z.ZodString, "many">;
			}, "strip", z.ZodTypeAny, {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}, {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}>, "many">>;
			training: z.ZodOptional<z.ZodArray<z.ZodObject<{
				intent: z.ZodString;
				text: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				text: string;
				intent: string;
			}, {
				text: string;
				intent: string;
			}>, "many">>;
			tests: z.ZodOptional<z.ZodArray<z.ZodObject<{
				text: z.ZodString;
				expected: z.ZodObject<{
					intent: z.ZodString;
					context: z.ZodAny;
				}, "strip", z.ZodTypeAny, {
					intent: string;
					context?: any;
				}, {
					intent: string;
					context?: any;
				}>;
			}, "strip", z.ZodTypeAny, {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}, {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}>, "many">>;
			entities: z.ZodArray<z.ZodString, "many">;
			entity: z.ZodString;
			api: z.ZodNullable<z.ZodObject<{
				GET: z.ZodOptional<z.ZodBoolean>;
				UPDATE: z.ZodOptional<z.ZodBoolean>;
				QUERY: z.ZodOptional<z.ZodBoolean>;
				PUT: z.ZodOptional<z.ZodBoolean>;
				PATCH: z.ZodOptional<z.ZodBoolean>;
				DELETE: z.ZodOptional<z.ZodBoolean>;
			}, "strip", z.ZodTypeAny, {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			}, {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			}>>;
		}, "strict", z.ZodTypeAny, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}>, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}>, "many">;
		workflows: z.ZodArray<z.ZodObject<{
			entities: z.ZodArray<z.ZodString, "many">;
			entity: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			entity: string;
			entities: string[];
		}, {
			entity: string;
			entities: string[];
		}>, "many">;
	}, "strip", z.ZodTypeAny, {
		agents: {
			title: string;
			context: string;
			model: "openai" | "bard" | "Scout9";
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}[];
		entities: {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}[];
		llm: {
			model: string;
			engine: "openai";
		} | {
			model: string;
			engine: "llama";
		} | {
			model: string;
			engine: "bard";
		};
		pmt: {
			model: string;
			engine: "scout9";
		};
		initialContext: string[];
		workflows: {
			entity: string;
			entities: string[];
		}[];
		organization?: {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		} | undefined;
		tag?: string | undefined;
		maxLockAttempts?: number | undefined;
	}, {
		agents: {
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			title?: string | undefined;
			context?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			model?: "openai" | "bard" | "Scout9" | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}[];
		entities: {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}[];
		llm: {
			model: string;
			engine: "openai";
		} | {
			model: string;
			engine: "llama";
		} | {
			model: string;
			engine: "bard";
		};
		pmt: {
			model: string;
			engine: "scout9";
		};
		initialContext: string[];
		workflows: {
			entity: string;
			entities: string[];
		}[];
		organization?: {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		} | undefined;
		tag?: string | undefined;
		maxLockAttempts?: number | undefined;
	}>;
	type IScout9ProjectBuildConfig = import('zod').infer<typeof Scout9ProjectBuildConfigSchema>;
}

declare module '@scout9/app' {
	import type { z } from 'zod';
	export const customerValueSchema: z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>;

	export const customerSchema: z.ZodObject<{
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		name: z.ZodString;
		email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
	}, "strip", z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, z.objectOutputType<{
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		name: z.ZodString;
		email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
	}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">, z.objectInputType<{
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		name: z.ZodString;
		email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
	}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">>;

	export const agentBaseConfigurationSchema: z.ZodObject<{
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		inactive: z.ZodOptional<z.ZodBoolean>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
	}, "strip", z.ZodTypeAny, {
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}, {
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		title?: string | undefined;
		context?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}>;

	export const agentConfigurationSchema: z.ZodObject<{
		inactive: z.ZodOptional<z.ZodBoolean>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		id: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		id: string;
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		inactive?: boolean | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}, {
		id: string;
		inactive?: boolean | undefined;
		img?: string | null | undefined;
		title?: string | undefined;
		context?: string | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}>;

	export const agentsConfigurationSchema: z.ZodArray<z.ZodObject<{
		inactive: z.ZodOptional<z.ZodBoolean>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		id: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		id: string;
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		inactive?: boolean | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}, {
		id: string;
		inactive?: boolean | undefined;
		img?: string | null | undefined;
		title?: string | undefined;
		context?: string | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}>, "many">;

	export const agentsBaseConfigurationSchema: z.ZodArray<z.ZodObject<{
		deployed: z.ZodOptional<z.ZodObject<{
			web: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}, {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		}>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		inactive: z.ZodOptional<z.ZodBoolean>;
		programmablePhoneNumber: z.ZodOptional<z.ZodString>;
		programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
		programmableEmail: z.ZodOptional<z.ZodString>;
		forwardEmail: z.ZodOptional<z.ZodString>;
		forwardPhone: z.ZodOptional<z.ZodString>;
		title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
		includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
		transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>, "many">, "many">>;
		audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
	}, "strip", z.ZodTypeAny, {
		title: string;
		context: string;
		model: "openai" | "bard" | "Scout9";
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}, {
		deployed?: {
			web?: string | undefined;
			phone?: string | undefined;
			email?: string | undefined;
		} | undefined;
		img?: string | null | undefined;
		firstName?: string | undefined;
		lastName?: string | undefined;
		inactive?: boolean | undefined;
		programmablePhoneNumber?: string | undefined;
		programmablePhoneNumberSid?: string | undefined;
		programmableEmail?: string | undefined;
		forwardEmail?: string | undefined;
		forwardPhone?: string | undefined;
		title?: string | undefined;
		context?: string | undefined;
		includedLocations?: string[] | undefined;
		excludedLocations?: string[] | undefined;
		model?: "openai" | "bard" | "Scout9" | undefined;
		transcripts?: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[][] | undefined;
		audios?: any[] | undefined;
	}>, "many">;
	export type ICustomerValue = import('zod').infer<typeof customerValueSchema>;
	export type ICustomer = import('zod').infer<typeof customerSchema>;
	export type IAgentBase = import('zod').infer<typeof agentBaseConfigurationSchema>;
	export type IAgent = import('zod').infer<typeof agentBaseConfigurationSchema>;
	export type IPersona = import('zod').infer<typeof agentBaseConfigurationSchema>;
	export type IAgentsConfiguration = import('zod').infer<typeof agentsConfigurationSchema>;
	export type IAgentsBaseConfiguration = import('zod').infer<typeof agentsBaseConfigurationSchema>;
	/**
	 * Utility runtime class used to guide event output
	 * */
	export class EventResponse<T> {
		/**
		 * Create a new EventResponse instance with a JSON body.
		 * @param body - The body of the response.
		 * @param options - Additional options for the response.
		 * @returns A new EventResponse instance.
		 */
		static json<T_1>(body: T_1, options?: ResponseInit | undefined): EventResponse<T_1>;
		/**
		 * Create an EventResponse.
		 * @param body - The body of the response.
		 * @param init - Additional options for the response.
		 * @throws {Error} If the body is not a valid object.
		 */
		constructor(body: T, init?: ResponseInit | undefined);
		
		private body;
		
		private init;
		/**
		 * Get the response object.
		 * @returns The response object.
		 */
		get response(): Response;
		/**
		 * Get the data of the response.
		 * @returns The body of the response.
		 */
		get data(): T;
	}

	export const eventResponseSchema: z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>;
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>;
	export type IEventResponse<T> = {
		/**
		 * - The body of the response.
		 */
		body: T;
		/**
		 * - Additional options for the response.
		 */
		init?: ResponseInit | undefined;
		/**
		 * - The response object.
		 */
		response: Response;
		/**
		 * - The body of the response.
		 */
		data: T;
	};
	/**
	 * Represents the configuration provided in src/index.{js | ts} in a project
	 * 
	 */
	export const Scout9ProjectConfigSchema: z.ZodObject<{
		/**
		 * Tag to reference this application
		 * @defaut your local package.json name + version, or scout9-app-v1.0.0
		 */
		tag: z.ZodOptional<z.ZodString>;
		llm: z.ZodUnion<[z.ZodObject<{
			engine: z.ZodLiteral<"openai">;
			model: z.ZodUnion<[z.ZodLiteral<"gpt-4-1106-preview">, z.ZodLiteral<"gpt-4-vision-preview">, z.ZodLiteral<"gpt-4">, z.ZodLiteral<"gpt-4-0314">, z.ZodLiteral<"gpt-4-0613">, z.ZodLiteral<"gpt-4-32k">, z.ZodLiteral<"gpt-4-32k-0314">, z.ZodLiteral<"gpt-4-32k-0613">, z.ZodLiteral<"gpt-3.5-turbo">, z.ZodLiteral<"gpt-3.5-turbo-16k">, z.ZodLiteral<"gpt-3.5-turbo-0301">, z.ZodLiteral<"gpt-3.5-turbo-0613">, z.ZodLiteral<"gpt-3.5-turbo-16k-0613">, z.ZodString]>;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "openai";
		}, {
			model: string;
			engine: "openai";
		}>, z.ZodObject<{
			engine: z.ZodLiteral<"llama">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "llama";
		}, {
			model: string;
			engine: "llama";
		}>, z.ZodObject<{
			engine: z.ZodLiteral<"bard">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "bard";
		}, {
			model: string;
			engine: "bard";
		}>]>;
		/**
		 * Configure personal model transformer (PMT) settings to align auto replies the agent's tone
		 */
		pmt: z.ZodObject<{
			engine: z.ZodLiteral<"scout9">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "scout9";
		}, {
			model: string;
			engine: "scout9";
		}>;
		/**
		 * Determines the max auto replies without further conversation progression (defined by new context data gathered)
		 * before the conversation is locked and requires manual intervention
		 * @default 3
		 */
		maxLockAttempts: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
		initialContext: z.ZodArray<z.ZodString, "many">;
		organization: z.ZodOptional<z.ZodObject<{
			name: z.ZodString;
			description: z.ZodString;
			dashboard: z.ZodOptional<z.ZodString>;
			logo: z.ZodOptional<z.ZodString>;
			icon: z.ZodOptional<z.ZodString>;
			logos: z.ZodOptional<z.ZodString>;
			website: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		}, {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		}>>;
	}, "strip", z.ZodTypeAny, {
		llm: {
			model: string;
			engine: "openai";
		} | {
			model: string;
			engine: "llama";
		} | {
			model: string;
			engine: "bard";
		};
		pmt: {
			model: string;
			engine: "scout9";
		};
		initialContext: string[];
		tag?: string | undefined;
		maxLockAttempts?: number | undefined;
		organization?: {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		} | undefined;
	}, {
		llm: {
			model: string;
			engine: "openai";
		} | {
			model: string;
			engine: "llama";
		} | {
			model: string;
			engine: "bard";
		};
		pmt: {
			model: string;
			engine: "scout9";
		};
		initialContext: string[];
		tag?: string | undefined;
		maxLockAttempts?: number | undefined;
		organization?: {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		} | undefined;
	}>;

	export const Scout9ProjectBuildConfigSchema: z.ZodObject<{
		organization: z.ZodOptional<z.ZodObject<{
			name: z.ZodString;
			description: z.ZodString;
			dashboard: z.ZodOptional<z.ZodString>;
			logo: z.ZodOptional<z.ZodString>;
			icon: z.ZodOptional<z.ZodString>;
			logos: z.ZodOptional<z.ZodString>;
			website: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		}, {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		}>>;
		tag: z.ZodOptional<z.ZodString>;
		llm: z.ZodUnion<[z.ZodObject<{
			engine: z.ZodLiteral<"openai">;
			model: z.ZodUnion<[z.ZodLiteral<"gpt-4-1106-preview">, z.ZodLiteral<"gpt-4-vision-preview">, z.ZodLiteral<"gpt-4">, z.ZodLiteral<"gpt-4-0314">, z.ZodLiteral<"gpt-4-0613">, z.ZodLiteral<"gpt-4-32k">, z.ZodLiteral<"gpt-4-32k-0314">, z.ZodLiteral<"gpt-4-32k-0613">, z.ZodLiteral<"gpt-3.5-turbo">, z.ZodLiteral<"gpt-3.5-turbo-16k">, z.ZodLiteral<"gpt-3.5-turbo-0301">, z.ZodLiteral<"gpt-3.5-turbo-0613">, z.ZodLiteral<"gpt-3.5-turbo-16k-0613">, z.ZodString]>;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "openai";
		}, {
			model: string;
			engine: "openai";
		}>, z.ZodObject<{
			engine: z.ZodLiteral<"llama">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "llama";
		}, {
			model: string;
			engine: "llama";
		}>, z.ZodObject<{
			engine: z.ZodLiteral<"bard">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "bard";
		}, {
			model: string;
			engine: "bard";
		}>]>;
		pmt: z.ZodObject<{
			engine: z.ZodLiteral<"scout9">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "scout9";
		}, {
			model: string;
			engine: "scout9";
		}>;
		maxLockAttempts: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
		initialContext: z.ZodArray<z.ZodString, "many">;
		agents: z.ZodArray<z.ZodObject<{
			deployed: z.ZodOptional<z.ZodObject<{
				web: z.ZodOptional<z.ZodString>;
				phone: z.ZodOptional<z.ZodString>;
				email: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			inactive: z.ZodOptional<z.ZodBoolean>;
			programmablePhoneNumber: z.ZodOptional<z.ZodString>;
			programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
			programmableEmail: z.ZodOptional<z.ZodString>;
			forwardEmail: z.ZodOptional<z.ZodString>;
			forwardPhone: z.ZodOptional<z.ZodString>;
			title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
			transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				role: z.ZodEnum<["agent", "customer", "system"]>;
				content: z.ZodString;
				time: z.ZodString;
				name: z.ZodOptional<z.ZodString>;
				scheduled: z.ZodOptional<z.ZodString>;
				context: z.ZodOptional<z.ZodAny>;
				intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			}, "strip", z.ZodTypeAny, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}>, "many">, "many">>;
			audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		}, "strip", z.ZodTypeAny, {
			title: string;
			context: string;
			model: "openai" | "bard" | "Scout9";
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}, {
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			title?: string | undefined;
			context?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			model?: "openai" | "bard" | "Scout9" | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}>, "many">;
		entities: z.ZodArray<z.ZodEffects<z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			definitions: z.ZodOptional<z.ZodArray<z.ZodObject<{
				utterance: z.ZodOptional<z.ZodString>;
				value: z.ZodString;
				text: z.ZodArray<z.ZodString, "many">;
			}, "strip", z.ZodTypeAny, {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}, {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}>, "many">>;
			training: z.ZodOptional<z.ZodArray<z.ZodObject<{
				intent: z.ZodString;
				text: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				text: string;
				intent: string;
			}, {
				text: string;
				intent: string;
			}>, "many">>;
			tests: z.ZodOptional<z.ZodArray<z.ZodObject<{
				text: z.ZodString;
				expected: z.ZodObject<{
					intent: z.ZodString;
					context: z.ZodAny;
				}, "strip", z.ZodTypeAny, {
					intent: string;
					context?: any;
				}, {
					intent: string;
					context?: any;
				}>;
			}, "strip", z.ZodTypeAny, {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}, {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}>, "many">>;
			entities: z.ZodArray<z.ZodString, "many">;
			entity: z.ZodString;
			api: z.ZodNullable<z.ZodObject<{
				GET: z.ZodOptional<z.ZodBoolean>;
				UPDATE: z.ZodOptional<z.ZodBoolean>;
				QUERY: z.ZodOptional<z.ZodBoolean>;
				PUT: z.ZodOptional<z.ZodBoolean>;
				PATCH: z.ZodOptional<z.ZodBoolean>;
				DELETE: z.ZodOptional<z.ZodBoolean>;
			}, "strip", z.ZodTypeAny, {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			}, {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			}>>;
		}, "strict", z.ZodTypeAny, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}>, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}>, "many">;
		workflows: z.ZodArray<z.ZodObject<{
			entities: z.ZodArray<z.ZodString, "many">;
			entity: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			entity: string;
			entities: string[];
		}, {
			entity: string;
			entities: string[];
		}>, "many">;
	}, "strip", z.ZodTypeAny, {
		agents: {
			title: string;
			context: string;
			model: "openai" | "bard" | "Scout9";
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}[];
		entities: {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}[];
		llm: {
			model: string;
			engine: "openai";
		} | {
			model: string;
			engine: "llama";
		} | {
			model: string;
			engine: "bard";
		};
		pmt: {
			model: string;
			engine: "scout9";
		};
		initialContext: string[];
		workflows: {
			entity: string;
			entities: string[];
		}[];
		organization?: {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		} | undefined;
		tag?: string | undefined;
		maxLockAttempts?: number | undefined;
	}, {
		agents: {
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			title?: string | undefined;
			context?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			model?: "openai" | "bard" | "Scout9" | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}[];
		entities: {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}[];
		llm: {
			model: string;
			engine: "openai";
		} | {
			model: string;
			engine: "llama";
		} | {
			model: string;
			engine: "bard";
		};
		pmt: {
			model: string;
			engine: "scout9";
		};
		initialContext: string[];
		workflows: {
			entity: string;
			entities: string[];
		}[];
		organization?: {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		} | undefined;
		tag?: string | undefined;
		maxLockAttempts?: number | undefined;
	}>;
	/**
	 * Represents the configuration provided in src/index.{js | ts} in a project
	 */
	export type IScout9ProjectConfig = import('zod').infer<typeof Scout9ProjectConfigSchema>;
	export type IScout9ProjectBuildConfig = import('zod').infer<typeof Scout9ProjectBuildConfigSchema>;
	export const entityApiConfigurationSchema: z.ZodNullable<z.ZodObject<{
		GET: z.ZodOptional<z.ZodBoolean>;
		UPDATE: z.ZodOptional<z.ZodBoolean>;
		QUERY: z.ZodOptional<z.ZodBoolean>;
		PUT: z.ZodOptional<z.ZodBoolean>;
		PATCH: z.ZodOptional<z.ZodBoolean>;
		DELETE: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		GET?: boolean | undefined;
		UPDATE?: boolean | undefined;
		QUERY?: boolean | undefined;
		PUT?: boolean | undefined;
		PATCH?: boolean | undefined;
		DELETE?: boolean | undefined;
	}, {
		GET?: boolean | undefined;
		UPDATE?: boolean | undefined;
		QUERY?: boolean | undefined;
		PUT?: boolean | undefined;
		PATCH?: boolean | undefined;
		DELETE?: boolean | undefined;
	}>>;

	export const entityConfigurationSchema: z.ZodEffects<z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
		definitions: z.ZodOptional<z.ZodArray<z.ZodObject<{
			utterance: z.ZodOptional<z.ZodString>;
			value: z.ZodString;
			text: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}>, "many">>;
		training: z.ZodOptional<z.ZodArray<z.ZodObject<{
			intent: z.ZodString;
			text: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			text: string;
			intent: string;
		}, {
			text: string;
			intent: string;
		}>, "many">>;
		tests: z.ZodOptional<z.ZodArray<z.ZodObject<{
			text: z.ZodString;
			expected: z.ZodObject<{
				intent: z.ZodString;
				context: z.ZodAny;
			}, "strip", z.ZodTypeAny, {
				intent: string;
				context?: any;
			}, {
				intent: string;
				context?: any;
			}>;
		}, "strip", z.ZodTypeAny, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}>, "many">>;
	}, "strict", z.ZodTypeAny, {
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>, {
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>;

	export const entitiesRootConfigurationSchema: z.ZodArray<z.ZodEffects<z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
		definitions: z.ZodOptional<z.ZodArray<z.ZodObject<{
			utterance: z.ZodOptional<z.ZodString>;
			value: z.ZodString;
			text: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}>, "many">>;
		training: z.ZodOptional<z.ZodArray<z.ZodObject<{
			intent: z.ZodString;
			text: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			text: string;
			intent: string;
		}, {
			text: string;
			intent: string;
		}>, "many">>;
		tests: z.ZodOptional<z.ZodArray<z.ZodObject<{
			text: z.ZodString;
			expected: z.ZodObject<{
				intent: z.ZodString;
				context: z.ZodAny;
			}, "strip", z.ZodTypeAny, {
				intent: string;
				context?: any;
			}, {
				intent: string;
				context?: any;
			}>;
		}, "strip", z.ZodTypeAny, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}>, "many">>;
	}, "strict", z.ZodTypeAny, {
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>, {
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>, "many">;
	/**
	 * @TODO why type extend not valid?
	 * 
	 */
	export const entityRootProjectConfigurationSchema: z.ZodEffects<z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
		definitions: z.ZodOptional<z.ZodArray<z.ZodObject<{
			utterance: z.ZodOptional<z.ZodString>;
			value: z.ZodString;
			text: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}>, "many">>;
		training: z.ZodOptional<z.ZodArray<z.ZodObject<{
			intent: z.ZodString;
			text: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			text: string;
			intent: string;
		}, {
			text: string;
			intent: string;
		}>, "many">>;
		tests: z.ZodOptional<z.ZodArray<z.ZodObject<{
			text: z.ZodString;
			expected: z.ZodObject<{
				intent: z.ZodString;
				context: z.ZodAny;
			}, "strip", z.ZodTypeAny, {
				intent: string;
				context?: any;
			}, {
				intent: string;
				context?: any;
			}>;
		}, "strip", z.ZodTypeAny, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}>, "many">>;
		entities: z.ZodArray<z.ZodString, "many">;
		entity: z.ZodString;
		api: z.ZodNullable<z.ZodObject<{
			GET: z.ZodOptional<z.ZodBoolean>;
			UPDATE: z.ZodOptional<z.ZodBoolean>;
			QUERY: z.ZodOptional<z.ZodBoolean>;
			PUT: z.ZodOptional<z.ZodBoolean>;
			PATCH: z.ZodOptional<z.ZodBoolean>;
			DELETE: z.ZodOptional<z.ZodBoolean>;
		}, "strip", z.ZodTypeAny, {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		}, {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		}>>;
	}, "strict", z.ZodTypeAny, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>;

	export const entitiesRootProjectConfigurationSchema: z.ZodArray<z.ZodEffects<z.ZodObject<{
		id: z.ZodOptional<z.ZodString>;
		definitions: z.ZodOptional<z.ZodArray<z.ZodObject<{
			utterance: z.ZodOptional<z.ZodString>;
			value: z.ZodString;
			text: z.ZodArray<z.ZodString, "many">;
		}, "strip", z.ZodTypeAny, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}, {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}>, "many">>;
		training: z.ZodOptional<z.ZodArray<z.ZodObject<{
			intent: z.ZodString;
			text: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			text: string;
			intent: string;
		}, {
			text: string;
			intent: string;
		}>, "many">>;
		tests: z.ZodOptional<z.ZodArray<z.ZodObject<{
			text: z.ZodString;
			expected: z.ZodObject<{
				intent: z.ZodString;
				context: z.ZodAny;
			}, "strip", z.ZodTypeAny, {
				intent: string;
				context?: any;
			}, {
				intent: string;
				context?: any;
			}>;
		}, "strip", z.ZodTypeAny, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}, {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}>, "many">>;
		entities: z.ZodArray<z.ZodString, "many">;
		entity: z.ZodString;
		api: z.ZodNullable<z.ZodObject<{
			GET: z.ZodOptional<z.ZodBoolean>;
			UPDATE: z.ZodOptional<z.ZodBoolean>;
			QUERY: z.ZodOptional<z.ZodBoolean>;
			PUT: z.ZodOptional<z.ZodBoolean>;
			PATCH: z.ZodOptional<z.ZodBoolean>;
			DELETE: z.ZodOptional<z.ZodBoolean>;
		}, "strip", z.ZodTypeAny, {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		}, {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		}>>;
	}, "strict", z.ZodTypeAny, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}, {
		entity: string;
		entities: string[];
		api: {
			GET?: boolean | undefined;
			UPDATE?: boolean | undefined;
			QUERY?: boolean | undefined;
			PUT?: boolean | undefined;
			PATCH?: boolean | undefined;
			DELETE?: boolean | undefined;
		} | null;
		id?: string | undefined;
		definitions?: {
			value: string;
			text: string[];
			utterance?: string | undefined;
		}[] | undefined;
		training?: {
			text: string;
			intent: string;
		}[] | undefined;
		tests?: {
			text: string;
			expected: {
				intent: string;
				context?: any;
			};
		}[] | undefined;
	}>, "many">;
	export type IEntityApiConfiguration = import('zod').infer<typeof entityApiConfigurationSchema>;
	export type IEntityConfiguration = import('zod').infer<typeof entityConfigurationSchema>;
	export type IEntitiesRootConfiguration = import('zod').infer<typeof entitiesRootConfigurationSchema>;
	export type IEntityRootProjectConfiguration = import('zod').infer<typeof entityRootProjectConfigurationSchema>;
	export type IEntitiesRootProjectConfiguration = import('zod').infer<typeof entitiesRootProjectConfigurationSchema>;
	export const MessageSchema: z.ZodObject<{
		id: z.ZodString;
		role: z.ZodEnum<["agent", "customer", "system"]>;
		content: z.ZodString;
		time: z.ZodString;
		name: z.ZodOptional<z.ZodString>;
		scheduled: z.ZodOptional<z.ZodString>;
		context: z.ZodOptional<z.ZodAny>;
		intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
	}, "strip", z.ZodTypeAny, {
		time: string;
		id: string;
		content: string;
		role: "agent" | "customer" | "system";
		name?: string | undefined;
		scheduled?: string | undefined;
		context?: any;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
		delayInSeconds?: number | null | undefined;
	}, {
		time: string;
		id: string;
		content: string;
		role: "agent" | "customer" | "system";
		name?: string | undefined;
		scheduled?: string | undefined;
		context?: any;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
		delayInSeconds?: number | null | undefined;
	}>;
	export type IMessage = import('zod').infer<typeof MessageSchema>;
	export const WorkflowConfigurationSchema: z.ZodObject<{
		entities: z.ZodArray<z.ZodString, "many">;
		entity: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		entity: string;
		entities: string[];
	}, {
		entity: string;
		entities: string[];
	}>;

	export const WorkflowsConfigurationSchema: z.ZodArray<z.ZodObject<{
		entities: z.ZodArray<z.ZodString, "many">;
		entity: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		entity: string;
		entities: string[];
	}, {
		entity: string;
		entities: string[];
	}>, "many">;

	export const ConversationSchema: z.ZodObject<{
		$agent: z.ZodString;
		$customer: z.ZodString;
		initialContexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		environment: z.ZodEnum<["phone", "email", "web"]>;
		environmentProps: z.ZodOptional<z.ZodObject<{
			subject: z.ZodOptional<z.ZodString>;
			platformEmailThreadId: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		}, {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		}>>;
		locked: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
		lockedReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		lockAttempts: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
		forwardedTo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		forwarded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		forwardNote: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		intentScore: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
	}, "strip", z.ZodTypeAny, {
		environment: "email" | "phone" | "web";
		$agent: string;
		$customer: string;
		initialContexts?: string[] | undefined;
		environmentProps?: {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		} | undefined;
		locked?: boolean | null | undefined;
		lockedReason?: string | null | undefined;
		lockAttempts?: number | null | undefined;
		forwardedTo?: string | null | undefined;
		forwarded?: string | null | undefined;
		forwardNote?: string | null | undefined;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
	}, {
		environment: "email" | "phone" | "web";
		$agent: string;
		$customer: string;
		initialContexts?: string[] | undefined;
		environmentProps?: {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		} | undefined;
		locked?: boolean | null | undefined;
		lockedReason?: string | null | undefined;
		lockAttempts?: number | null | undefined;
		forwardedTo?: string | null | undefined;
		forwarded?: string | null | undefined;
		forwardNote?: string | null | undefined;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
	}>;

	export const IntentWorkflowEventSchema: z.ZodObject<{
		current: z.ZodNullable<z.ZodString>;
		flow: z.ZodArray<z.ZodString, "many">;
		initial: z.ZodNullable<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		current: string | null;
		flow: string[];
		initial: string | null;
	}, {
		current: string | null;
		flow: string[];
		initial: string | null;
	}>;

	export const WorkflowEventSchema: z.ZodObject<{
		messages: z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>, "many">;
		conversation: z.ZodObject<{
			$agent: z.ZodString;
			$customer: z.ZodString;
			initialContexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			environment: z.ZodEnum<["phone", "email", "web"]>;
			environmentProps: z.ZodOptional<z.ZodObject<{
				subject: z.ZodOptional<z.ZodString>;
				platformEmailThreadId: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			}, {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			}>>;
			locked: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
			lockedReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			lockAttempts: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
			forwardedTo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			forwarded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			forwardNote: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		}, {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		}>;
		context: z.ZodAny;
		message: z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>;
		agent: z.ZodObject<Omit<{
			inactive: z.ZodOptional<z.ZodBoolean>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			deployed: z.ZodOptional<z.ZodObject<{
				web: z.ZodOptional<z.ZodString>;
				phone: z.ZodOptional<z.ZodString>;
				email: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}>>;
			programmablePhoneNumber: z.ZodOptional<z.ZodString>;
			programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
			programmableEmail: z.ZodOptional<z.ZodString>;
			forwardEmail: z.ZodOptional<z.ZodString>;
			forwardPhone: z.ZodOptional<z.ZodString>;
			includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
			transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				role: z.ZodEnum<["agent", "customer", "system"]>;
				content: z.ZodString;
				time: z.ZodString;
				name: z.ZodOptional<z.ZodString>;
				scheduled: z.ZodOptional<z.ZodString>;
				context: z.ZodOptional<z.ZodAny>;
				intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			}, "strip", z.ZodTypeAny, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}>, "many">, "many">>;
			audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
			id: z.ZodString;
		}, "context" | "includedLocations" | "excludedLocations" | "model" | "transcripts" | "audios">, "strip", z.ZodTypeAny, {
			id: string;
			title: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}, {
			id: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			title?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}>;
		customer: z.ZodObject<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, "strip", z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, z.objectOutputType<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">, z.objectInputType<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">>;
		intent: z.ZodObject<{
			current: z.ZodNullable<z.ZodString>;
			flow: z.ZodArray<z.ZodString, "many">;
			initial: z.ZodNullable<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			current: string | null;
			flow: string[];
			initial: string | null;
		}, {
			current: string | null;
			flow: string[];
			initial: string | null;
		}>;
		stagnationCount: z.ZodNumber;
		note: z.ZodOptional<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		message: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		};
		agent: {
			id: string;
			title: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		};
		customer: {
			name: string;
			firstName?: string | undefined;
			lastName?: string | undefined;
			email?: string | null | undefined;
			phone?: string | null | undefined;
			img?: string | null | undefined;
			neighborhood?: string | null | undefined;
			city?: string | null | undefined;
			country?: string | null | undefined;
			line1?: string | null | undefined;
			line2?: string | null | undefined;
			postal_code?: string | null | undefined;
			state?: string | null | undefined;
			town?: string | null | undefined;
			joined?: string | null | undefined;
			stripe?: string | null | undefined;
			stripeDev?: string | null | undefined;
		} & {
			[k: string]: string | number | boolean;
		};
		intent: {
			current: string | null;
			flow: string[];
			initial: string | null;
		};
		messages: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[];
		conversation: {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		};
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}, {
		message: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		};
		agent: {
			id: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			title?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		};
		customer: {
			name: string;
			firstName?: string | undefined;
			lastName?: string | undefined;
			email?: string | null | undefined;
			phone?: string | null | undefined;
			img?: string | null | undefined;
			neighborhood?: string | null | undefined;
			city?: string | null | undefined;
			country?: string | null | undefined;
			line1?: string | null | undefined;
			line2?: string | null | undefined;
			postal_code?: string | null | undefined;
			state?: string | null | undefined;
			town?: string | null | undefined;
			joined?: string | null | undefined;
			stripe?: string | null | undefined;
			stripeDev?: string | null | undefined;
		} & {
			[k: string]: string | number | boolean;
		};
		intent: {
			current: string | null;
			flow: string[];
			initial: string | null;
		};
		messages: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[];
		conversation: {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		};
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}>;
	/**
	 * Lazy is used to handle recursive types.
	 * 
	 */
	export const ConversationContext: any;
	/**
	 * Forward input information of a conversation
	 * 
	 */
	export const ForwardSchema: z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
		to: z.ZodOptional<z.ZodString>;
		mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
		note: z.ZodOptional<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		to?: string | undefined;
		mode?: "after-reply" | "immediately" | undefined;
		note?: string | undefined;
	}, {
		to?: string | undefined;
		mode?: "after-reply" | "immediately" | undefined;
		note?: string | undefined;
	}>]>;
	/**
	 * Instruction object schema used to send context to guide conversations
	 * 
	 */
	export const InstructionSchema: z.ZodObject<{
		id: z.ZodString;
		content: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		id: string;
		content: string;
	}, {
		id: string;
		content: string;
	}>;

	export const WorkflowResponseMessageApiRequest: z.ZodObject<{
		uri: z.ZodString;
		data: z.ZodOptional<z.ZodAny>;
		headers: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
		method: z.ZodOptional<z.ZodEnum<["GET", "POST", "PUT"]>>;
	}, "strip", z.ZodTypeAny, {
		uri: string;
		data?: any;
		headers?: {} | undefined;
		method?: "GET" | "POST" | "PUT" | undefined;
	}, {
		uri: string;
		data?: any;
		headers?: {} | undefined;
		method?: "GET" | "POST" | "PUT" | undefined;
	}>;
	/**
	 * If its a string, it will be sent as a static string.
	 * If it's a object or WorkflowResponseMessageAPI - it will use
	 * 
	 */
	export const WorkflowResponseMessage: z.ZodUnion<readonly [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>;
	/**
	 * The intended response provided by the WorkflowResponseMessageApiRequest
	 * 
	 */
	export const WorkflowResponseMessageApiResponse: z.ZodUnion<[z.ZodString, z.ZodObject<{
		message: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		message: string;
	}, {
		message: string;
	}>, z.ZodObject<{
		text: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		text: string;
	}, {
		text: string;
	}>, z.ZodObject<{
		data: z.ZodObject<{
			message: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			message: string;
		}, {
			message: string;
		}>;
	}, "strip", z.ZodTypeAny, {
		data: {
			message: string;
		};
	}, {
		data: {
			message: string;
		};
	}>, z.ZodObject<{
		data: z.ZodObject<{
			text: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			text: string;
		}, {
			text: string;
		}>;
	}, "strip", z.ZodTypeAny, {
		data: {
			text: string;
		};
	}, {
		data: {
			text: string;
		};
	}>]>;
	/**
	 * The workflow response object slot
	 * 
	 */
	export const WorkflowResponseSlotSchema: z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>;
	/**
	 * The workflow response to send in any given workflow
	 * 
	 */
	export const WorkflowResponseSchema: z.ZodUnion<[z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>, z.ZodArray<z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>, "many">]>;

	export const WorkflowFunctionSchema: z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		messages: z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>, "many">;
		conversation: z.ZodObject<{
			$agent: z.ZodString;
			$customer: z.ZodString;
			initialContexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			environment: z.ZodEnum<["phone", "email", "web"]>;
			environmentProps: z.ZodOptional<z.ZodObject<{
				subject: z.ZodOptional<z.ZodString>;
				platformEmailThreadId: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			}, {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			}>>;
			locked: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
			lockedReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			lockAttempts: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
			forwardedTo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			forwarded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			forwardNote: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		}, {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		}>;
		context: z.ZodAny;
		message: z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>;
		agent: z.ZodObject<Omit<{
			inactive: z.ZodOptional<z.ZodBoolean>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			deployed: z.ZodOptional<z.ZodObject<{
				web: z.ZodOptional<z.ZodString>;
				phone: z.ZodOptional<z.ZodString>;
				email: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}>>;
			programmablePhoneNumber: z.ZodOptional<z.ZodString>;
			programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
			programmableEmail: z.ZodOptional<z.ZodString>;
			forwardEmail: z.ZodOptional<z.ZodString>;
			forwardPhone: z.ZodOptional<z.ZodString>;
			includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
			transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				role: z.ZodEnum<["agent", "customer", "system"]>;
				content: z.ZodString;
				time: z.ZodString;
				name: z.ZodOptional<z.ZodString>;
				scheduled: z.ZodOptional<z.ZodString>;
				context: z.ZodOptional<z.ZodAny>;
				intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			}, "strip", z.ZodTypeAny, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}>, "many">, "many">>;
			audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
			id: z.ZodString;
		}, "context" | "includedLocations" | "excludedLocations" | "model" | "transcripts" | "audios">, "strip", z.ZodTypeAny, {
			id: string;
			title: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}, {
			id: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			title?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}>;
		customer: z.ZodObject<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, "strip", z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, z.objectOutputType<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">, z.objectInputType<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">>;
		intent: z.ZodObject<{
			current: z.ZodNullable<z.ZodString>;
			flow: z.ZodArray<z.ZodString, "many">;
			initial: z.ZodNullable<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			current: string | null;
			flow: string[];
			initial: string | null;
		}, {
			current: string | null;
			flow: string[];
			initial: string | null;
		}>;
		stagnationCount: z.ZodNumber;
		note: z.ZodOptional<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		message: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		};
		agent: {
			id: string;
			title: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		};
		customer: {
			name: string;
			firstName?: string | undefined;
			lastName?: string | undefined;
			email?: string | null | undefined;
			phone?: string | null | undefined;
			img?: string | null | undefined;
			neighborhood?: string | null | undefined;
			city?: string | null | undefined;
			country?: string | null | undefined;
			line1?: string | null | undefined;
			line2?: string | null | undefined;
			postal_code?: string | null | undefined;
			state?: string | null | undefined;
			town?: string | null | undefined;
			joined?: string | null | undefined;
			stripe?: string | null | undefined;
			stripeDev?: string | null | undefined;
		} & {
			[k: string]: string | number | boolean;
		};
		intent: {
			current: string | null;
			flow: string[];
			initial: string | null;
		};
		messages: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[];
		conversation: {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		};
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}, {
		message: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		};
		agent: {
			id: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			title?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		};
		customer: {
			name: string;
			firstName?: string | undefined;
			lastName?: string | undefined;
			email?: string | null | undefined;
			phone?: string | null | undefined;
			img?: string | null | undefined;
			neighborhood?: string | null | undefined;
			city?: string | null | undefined;
			country?: string | null | undefined;
			line1?: string | null | undefined;
			line2?: string | null | undefined;
			postal_code?: string | null | undefined;
			state?: string | null | undefined;
			town?: string | null | undefined;
			joined?: string | null | undefined;
			stripe?: string | null | undefined;
			stripeDev?: string | null | undefined;
		} & {
			[k: string]: string | number | boolean;
		};
		intent: {
			current: string | null;
			flow: string[];
			initial: string | null;
		};
		messages: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[];
		conversation: {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		};
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}>], z.ZodUnknown>, z.ZodUnion<[z.ZodPromise<z.ZodUnion<[z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>, z.ZodArray<z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>, "many">]>>, z.ZodUnion<[z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>, z.ZodArray<z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>, "many">]>]>>;
	export type IWorkflowConfiguration = import('zod').infer<typeof WorkflowConfigurationSchema>;
	export type IWorkflowsConfiguration = import('zod').infer<typeof WorkflowsConfigurationSchema>;
	export type IConversation = import('zod').infer<typeof ConversationSchema>;
	export type IIntentWorkflowEvent = import('zod').infer<typeof IntentWorkflowEventSchema>;
	export type IWorkflowEvent = import('zod').infer<typeof WorkflowEventSchema>;
	/**
	 * Forward input information of a conversation
	 */
	export type IForward = import('zod').infer<typeof ForwardSchema>;
	/**
	 * Instruction object schema used to send context to guide conversations
	 */
	export type IInstruction = import('zod').infer<typeof InstructionSchema>;
	export type IWorkflowResponseMessageApiRequest = import('zod').infer<typeof WorkflowResponseMessageApiRequest>;
	/**
	 * If its a string, it will be sent as a static string.
	 * If it's a object or WorkflowResponseMessageAPI - it will use
	 */
	export type IWorkflowResponseMessage = import('zod').infer<typeof WorkflowResponseMessage>;
	/**
	 * The intended response provided by the WorkflowResponseMessageApiRequest
	 */
	export type IWorkflowResponseMessageApiResponse = import('zod').infer<typeof WorkflowResponseMessageApiResponse>;
	/**
	 * The workflow response object slot
	 */
	export type IWorkflowResponseSlot = import('zod').infer<typeof WorkflowResponseSlotSchema>;
	/**
	 * The workflow response to send in any given workflow
	 */
	export type IWorkflowResponse = import('zod').infer<typeof WorkflowResponseSchema>;
	export type IWorkflowFunction = import('zod').infer<typeof WorkflowFunctionSchema>;
	export const apiFunctionSchema: z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		params: z.ZodRecord<z.ZodString, z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>; /**
		 * @template Params
		 * @template RequestBody
		 * @template Response
		 * @typedef {function(IApiFunctionParams & {body: Partial<RequestBody>}): Promise<EventResponse<Response>>} IPatchApiFunction
		 */
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;

	export const queryApiFunctionSchema: z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		params: z.ZodRecord<z.ZodString, z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>; /**
		 * @template Params
		 * @template RequestBody
		 * @template Response
		 * @typedef {function(IApiFunctionParams & {body: Partial<RequestBody>}): Promise<EventResponse<Response>>} IPatchApiFunction
		 */
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;

	export const getApiFunctionSchema: z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		params: z.ZodRecord<z.ZodString, z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>; /**
		 * @template Params
		 * @template RequestBody
		 * @template Response
		 * @typedef {function(IApiFunctionParams & {body: Partial<RequestBody>}): Promise<EventResponse<Response>>} IPatchApiFunction
		 */
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;
	export function postApiFunctionSchema(requestBodySchema: any): z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		params: z.ZodRecord<z.ZodString, z.ZodString>;
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		body: any;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
		body?: any;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
		body?: any;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>; /**
		 * @template Params
		 * @template RequestBody
		 * @template Response
		 * @typedef {function(IApiFunctionParams & {body: Partial<RequestBody>}): Promise<EventResponse<Response>>} IPatchApiFunction
		 */
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;
	export function putApiFunctionSchema(requestBodySchema: any): z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		params: z.ZodRecord<z.ZodString, z.ZodString>;
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		body: any;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
		body?: any;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
		body?: any;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>; /**
		 * @template Params
		 * @template RequestBody
		 * @template Response
		 * @typedef {function(IApiFunctionParams & {body: Partial<RequestBody>}): Promise<EventResponse<Response>>} IPatchApiFunction
		 */
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;
	export function patchApiFunctionSchema(requestBodySchema: any): z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		params: z.ZodRecord<z.ZodString, z.ZodString>;
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		body: any;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
		body?: any;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
		body?: any;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>; /**
		 * @template Params
		 * @template RequestBody
		 * @template Response
		 * @typedef {function(IApiFunctionParams & {body: Partial<RequestBody>}): Promise<EventResponse<Response>>} IPatchApiFunction
		 */
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;

	export const deleteApiFunctionSchema: z.ZodFunction<z.ZodTuple<[z.ZodObject<{
		searchParams: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
		params: z.ZodRecord<z.ZodString, z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}, {
		params: Record<string, string>;
		searchParams: Record<string, string | string[]>;
	}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
		body: z.ZodAny;
		init: z.ZodOptional<z.ZodObject<{
			status: z.ZodOptional<z.ZodNumber>;
			statusText: z.ZodOptional<z.ZodString>;
			headers: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}, {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		}>>; /**
		 * @template Params
		 * @template RequestBody
		 * @template Response
		 * @typedef {function(IApiFunctionParams & {body: Partial<RequestBody>}): Promise<EventResponse<Response>>} IPatchApiFunction
		 */
	}, "strip", z.ZodTypeAny, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}, {
		body?: any;
		init?: {
			status?: number | undefined;
			statusText?: string | undefined;
			headers?: any;
		} | undefined;
	}>>>;
	export type IApiFunctionParams = {
		searchParams: {
			[x: string]: string | string[];
		};
		params: Record<string, string>;
	};
	export type IApiEntityFunctionParams = IApiFunctionParams & {
		id: string;
	};
	export type IApiFunction<Params, Response_1> = (arg0: IApiFunctionParams) => Promise<EventResponse<any>>;
	export type IQueryApiFunction<Params, Response_1> = IApiFunction<Params, Response>;
	export type GetApiFunction<Params, Response_1> = IApiFunction<Params, Response>;
	export type IPostApiFunction<Params, RequestBody, Response_1> = (arg0: IApiFunctionParams & {
		body: Partial<RequestBody>;
	}) => Promise<EventResponse<Response>>;
	export type IPutApiFunction<Params, RequestBody, Response_1> = (arg0: IApiFunctionParams & {
		body: Partial<RequestBody>;
	}) => Promise<EventResponse<Response>>;
	export type IPatchApiFunction<Params, RequestBody, Response_1> = (arg0: IApiFunctionParams & {
		body: Partial<RequestBody>;
	}) => Promise<EventResponse<Response>>;
	export type IDeleteApiFunction<Params, Response_1> = IApiFunction<Params, Response>;
}

declare module '@scout9/app/spirits' {
	import type { z } from 'zod';
	export namespace Spirits {
		function customer(input: ConversationData & CustomerSpiritCallbacks): Promise<ConversationEvent>;
	}
	export type Document = {
		id: string;
	};
	/**
	 * Represents a change with before and after states of a given type.
	 */
	export type Change<Type> = {
		/**
		 * - The state before the change.
		 */
		before: Type;
		/**
		 * - The state after the change.
		 */
		after: Type;
	};
	export type ConversationData = {
		/**
		 * - used to define generation and extract persona metadata
		 */
		config: IScout9ProjectBuildConfig;
		conversation: IConversation;
		messages: Array<IMessage>;
		/**
		 * - the message sent by the customer (should exist in messages)
		 */
		message: IMessage;
		customer: ICustomer;
		context: any;
	};
	export type ParseOutput = {
		messages: Array<IMessage>;
		conversation: IConversation;
		message: IMessage;
		context: any;
	};
	export type WorkflowOutput = {
		slots: Array<IWorkflowResponseSlot>;
		messages: Array<IMessage>;
		conversation: IConversation;
		context: any;
	};
	export type GenerateOutput = {
		generate: import('@scout9/admin').GenerateResponse | undefined;
		messages: Array<IMessage>;
		conversation: IConversation;
		context: any;
	};
	export type ParseFun = (message: string, language: string | undefined) => Promise<import('@scout9/admin').ParseResponse>;
	export type WorkflowFun = (event: IWorkflowEvent) => Promise<IWorkflowResponse>;
	export type GenerateFun = (data: import('@scout9/admin').GenerateRequestOneOf) => Promise<import('@scout9/admin').GenerateResponse>;
	export type IdGeneratorFun = (prefix: any) => string;
	export type StatusCallback = (message: string, level?: 'info' | 'warn' | 'error' | 'success' | undefined, type?: string | undefined, payload?: any | undefined) => void;
	export type CustomerSpiritCallbacks = {
		parser: ParseFun;
		workflow: WorkflowFun;
		generator: GenerateFun;
		idGenerator: IdGeneratorFun;
		progress?: StatusCallback | undefined;
	};
	export type ConversationEvent = {
		conversation: Change<IConversation> & {
			forwardNote?: string;
			forward?: IWorkflowResponseSlot['forward'];
		};
		messages: Change<Array<IMessage>>;
		context: Change<Object>;
		message: Change<IMessage>;
	};
	const Scout9ProjectBuildConfigSchema: z.ZodObject<{
		organization: z.ZodOptional<z.ZodObject<{
			name: z.ZodString;
			description: z.ZodString;
			dashboard: z.ZodOptional<z.ZodString>;
			logo: z.ZodOptional<z.ZodString>;
			icon: z.ZodOptional<z.ZodString>;
			logos: z.ZodOptional<z.ZodString>;
			website: z.ZodOptional<z.ZodString>;
			email: z.ZodOptional<z.ZodString>;
			phone: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		}, {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		}>>;
		tag: z.ZodOptional<z.ZodString>;
		llm: z.ZodUnion<[z.ZodObject<{
			engine: z.ZodLiteral<"openai">;
			model: z.ZodUnion<[z.ZodLiteral<"gpt-4-1106-preview">, z.ZodLiteral<"gpt-4-vision-preview">, z.ZodLiteral<"gpt-4">, z.ZodLiteral<"gpt-4-0314">, z.ZodLiteral<"gpt-4-0613">, z.ZodLiteral<"gpt-4-32k">, z.ZodLiteral<"gpt-4-32k-0314">, z.ZodLiteral<"gpt-4-32k-0613">, z.ZodLiteral<"gpt-3.5-turbo">, z.ZodLiteral<"gpt-3.5-turbo-16k">, z.ZodLiteral<"gpt-3.5-turbo-0301">, z.ZodLiteral<"gpt-3.5-turbo-0613">, z.ZodLiteral<"gpt-3.5-turbo-16k-0613">, z.ZodString]>;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "openai";
		}, {
			model: string;
			engine: "openai";
		}>, z.ZodObject<{
			engine: z.ZodLiteral<"llama">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "llama";
		}, {
			model: string;
			engine: "llama";
		}>, z.ZodObject<{
			engine: z.ZodLiteral<"bard">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "bard";
		}, {
			model: string;
			engine: "bard";
		}>]>;
		pmt: z.ZodObject<{
			engine: z.ZodLiteral<"scout9">;
			model: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			model: string;
			engine: "scout9";
		}, {
			model: string;
			engine: "scout9";
		}>;
		maxLockAttempts: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
		initialContext: z.ZodArray<z.ZodString, "many">;
		agents: z.ZodArray<z.ZodObject<{
			deployed: z.ZodOptional<z.ZodObject<{
				web: z.ZodOptional<z.ZodString>;
				phone: z.ZodOptional<z.ZodString>;
				email: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			inactive: z.ZodOptional<z.ZodBoolean>;
			programmablePhoneNumber: z.ZodOptional<z.ZodString>;
			programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
			programmableEmail: z.ZodOptional<z.ZodString>;
			forwardEmail: z.ZodOptional<z.ZodString>;
			forwardPhone: z.ZodOptional<z.ZodString>;
			title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
			transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				role: z.ZodEnum<["agent", "customer", "system"]>;
				content: z.ZodString;
				time: z.ZodString;
				name: z.ZodOptional<z.ZodString>;
				scheduled: z.ZodOptional<z.ZodString>;
				context: z.ZodOptional<z.ZodAny>;
				intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			}, "strip", z.ZodTypeAny, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}>, "many">, "many">>;
			audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
		}, "strip", z.ZodTypeAny, {
			title: string;
			context: string;
			model: "openai" | "bard" | "Scout9";
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}, {
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			title?: string | undefined;
			context?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			model?: "openai" | "bard" | "Scout9" | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}>, "many">;
		entities: z.ZodArray<z.ZodEffects<z.ZodObject<{
			id: z.ZodOptional<z.ZodString>;
			definitions: z.ZodOptional<z.ZodArray<z.ZodObject<{
				utterance: z.ZodOptional<z.ZodString>;
				value: z.ZodString;
				text: z.ZodArray<z.ZodString, "many">;
			}, "strip", z.ZodTypeAny, {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}, {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}>, "many">>;
			training: z.ZodOptional<z.ZodArray<z.ZodObject<{
				intent: z.ZodString;
				text: z.ZodString;
			}, "strip", z.ZodTypeAny, {
				text: string;
				intent: string;
			}, {
				text: string;
				intent: string;
			}>, "many">>;
			tests: z.ZodOptional<z.ZodArray<z.ZodObject<{
				text: z.ZodString;
				expected: z.ZodObject<{
					intent: z.ZodString;
					context: z.ZodAny;
				}, "strip", z.ZodTypeAny, {
					intent: string;
					context?: any;
				}, {
					intent: string;
					context?: any;
				}>;
			}, "strip", z.ZodTypeAny, {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}, {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}>, "many">>;
			entities: z.ZodArray<z.ZodString, "many">;
			entity: z.ZodString;
			api: z.ZodNullable<z.ZodObject<{
				GET: z.ZodOptional<z.ZodBoolean>;
				UPDATE: z.ZodOptional<z.ZodBoolean>;
				QUERY: z.ZodOptional<z.ZodBoolean>;
				PUT: z.ZodOptional<z.ZodBoolean>;
				PATCH: z.ZodOptional<z.ZodBoolean>;
				DELETE: z.ZodOptional<z.ZodBoolean>;
			}, "strip", z.ZodTypeAny, {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			}, {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			}>>;
		}, "strict", z.ZodTypeAny, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}>, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}, {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}>, "many">;
		workflows: z.ZodArray<z.ZodObject<{
			entities: z.ZodArray<z.ZodString, "many">;
			entity: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			entity: string;
			entities: string[];
		}, {
			entity: string;
			entities: string[];
		}>, "many">;
	}, "strip", z.ZodTypeAny, {
		agents: {
			title: string;
			context: string;
			model: "openai" | "bard" | "Scout9";
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}[];
		entities: {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}[];
		llm: {
			model: string;
			engine: "openai";
		} | {
			model: string;
			engine: "llama";
		} | {
			model: string;
			engine: "bard";
		};
		pmt: {
			model: string;
			engine: "scout9";
		};
		initialContext: string[];
		workflows: {
			entity: string;
			entities: string[];
		}[];
		organization?: {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		} | undefined;
		tag?: string | undefined;
		maxLockAttempts?: number | undefined;
	}, {
		agents: {
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			inactive?: boolean | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
			title?: string | undefined;
			context?: string | undefined;
			includedLocations?: string[] | undefined;
			excludedLocations?: string[] | undefined;
			model?: "openai" | "bard" | "Scout9" | undefined;
			transcripts?: {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}[][] | undefined;
			audios?: any[] | undefined;
		}[];
		entities: {
			entity: string;
			entities: string[];
			api: {
				GET?: boolean | undefined;
				UPDATE?: boolean | undefined;
				QUERY?: boolean | undefined;
				PUT?: boolean | undefined;
				PATCH?: boolean | undefined;
				DELETE?: boolean | undefined;
			} | null;
			id?: string | undefined;
			definitions?: {
				value: string;
				text: string[];
				utterance?: string | undefined;
			}[] | undefined;
			training?: {
				text: string;
				intent: string;
			}[] | undefined;
			tests?: {
				text: string;
				expected: {
					intent: string;
					context?: any;
				};
			}[] | undefined;
		}[];
		llm: {
			model: string;
			engine: "openai";
		} | {
			model: string;
			engine: "llama";
		} | {
			model: string;
			engine: "bard";
		};
		pmt: {
			model: string;
			engine: "scout9";
		};
		initialContext: string[];
		workflows: {
			entity: string;
			entities: string[];
		}[];
		organization?: {
			name: string;
			description: string;
			dashboard?: string | undefined;
			logo?: string | undefined;
			icon?: string | undefined;
			logos?: string | undefined;
			website?: string | undefined;
			email?: string | undefined;
			phone?: string | undefined;
		} | undefined;
		tag?: string | undefined;
		maxLockAttempts?: number | undefined;
	}>;
	type IScout9ProjectBuildConfig = import('zod').infer<typeof Scout9ProjectBuildConfigSchema>;
	const ConversationSchema: z.ZodObject<{
		$agent: z.ZodString;
		$customer: z.ZodString;
		initialContexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		environment: z.ZodEnum<["phone", "email", "web"]>;
		environmentProps: z.ZodOptional<z.ZodObject<{
			subject: z.ZodOptional<z.ZodString>;
			platformEmailThreadId: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		}, {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		}>>;
		locked: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
		lockedReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		lockAttempts: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
		forwardedTo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		forwarded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		forwardNote: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		intentScore: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
	}, "strip", z.ZodTypeAny, {
		environment: "email" | "phone" | "web";
		$agent: string;
		$customer: string;
		initialContexts?: string[] | undefined;
		environmentProps?: {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		} | undefined;
		locked?: boolean | null | undefined;
		lockedReason?: string | null | undefined;
		lockAttempts?: number | null | undefined;
		forwardedTo?: string | null | undefined;
		forwarded?: string | null | undefined;
		forwardNote?: string | null | undefined;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
	}, {
		environment: "email" | "phone" | "web";
		$agent: string;
		$customer: string;
		initialContexts?: string[] | undefined;
		environmentProps?: {
			subject?: string | undefined;
			platformEmailThreadId?: string | undefined;
		} | undefined;
		locked?: boolean | null | undefined;
		lockedReason?: string | null | undefined;
		lockAttempts?: number | null | undefined;
		forwardedTo?: string | null | undefined;
		forwarded?: string | null | undefined;
		forwardNote?: string | null | undefined;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
	}>;

	const WorkflowEventSchema: z.ZodObject<{
		messages: z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>, "many">;
		conversation: z.ZodObject<{
			$agent: z.ZodString;
			$customer: z.ZodString;
			initialContexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			environment: z.ZodEnum<["phone", "email", "web"]>;
			environmentProps: z.ZodOptional<z.ZodObject<{
				subject: z.ZodOptional<z.ZodString>;
				platformEmailThreadId: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			}, {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			}>>;
			locked: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
			lockedReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			lockAttempts: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
			forwardedTo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			forwarded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			forwardNote: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		}, {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		}>;
		context: z.ZodAny;
		message: z.ZodObject<{
			id: z.ZodString;
			role: z.ZodEnum<["agent", "customer", "system"]>;
			content: z.ZodString;
			time: z.ZodString;
			name: z.ZodOptional<z.ZodString>;
			scheduled: z.ZodOptional<z.ZodString>;
			context: z.ZodOptional<z.ZodAny>;
			intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
			intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}, {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}>;
		agent: z.ZodObject<Omit<{
			inactive: z.ZodOptional<z.ZodBoolean>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			context: z.ZodDefault<z.ZodOptional<z.ZodString>>;
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			deployed: z.ZodOptional<z.ZodObject<{
				web: z.ZodOptional<z.ZodString>;
				phone: z.ZodOptional<z.ZodString>;
				email: z.ZodOptional<z.ZodString>;
			}, "strip", z.ZodTypeAny, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}, {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			}>>;
			programmablePhoneNumber: z.ZodOptional<z.ZodString>;
			programmablePhoneNumberSid: z.ZodOptional<z.ZodString>;
			programmableEmail: z.ZodOptional<z.ZodString>;
			forwardEmail: z.ZodOptional<z.ZodString>;
			forwardPhone: z.ZodOptional<z.ZodString>;
			includedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			excludedLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
			model: z.ZodDefault<z.ZodOptional<z.ZodEnum<["Scout9", "bard", "openai"]>>>;
			transcripts: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
				id: z.ZodString;
				role: z.ZodEnum<["agent", "customer", "system"]>;
				content: z.ZodString;
				time: z.ZodString;
				name: z.ZodOptional<z.ZodString>;
				scheduled: z.ZodOptional<z.ZodString>;
				context: z.ZodOptional<z.ZodAny>;
				intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
				intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
				delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
			}, "strip", z.ZodTypeAny, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}, {
				time: string;
				id: string;
				content: string;
				role: "agent" | "customer" | "system";
				name?: string | undefined;
				scheduled?: string | undefined;
				context?: any;
				intent?: string | null | undefined;
				intentScore?: number | null | undefined;
				delayInSeconds?: number | null | undefined;
			}>, "many">, "many">>;
			audios: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
			id: z.ZodString;
		}, "context" | "includedLocations" | "excludedLocations" | "model" | "transcripts" | "audios">, "strip", z.ZodTypeAny, {
			id: string;
			title: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}, {
			id: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			title?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		}>;
		customer: z.ZodObject<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, "strip", z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, z.objectOutputType<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">, z.objectInputType<{
			firstName: z.ZodOptional<z.ZodString>;
			lastName: z.ZodOptional<z.ZodString>;
			name: z.ZodString;
			email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
			stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">>;
		intent: z.ZodObject<{
			current: z.ZodNullable<z.ZodString>;
			flow: z.ZodArray<z.ZodString, "many">;
			initial: z.ZodNullable<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			current: string | null;
			flow: string[];
			initial: string | null;
		}, {
			current: string | null;
			flow: string[];
			initial: string | null;
		}>;
		stagnationCount: z.ZodNumber;
		note: z.ZodOptional<z.ZodString>;
	}, "strip", z.ZodTypeAny, {
		message: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		};
		agent: {
			id: string;
			title: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		};
		customer: {
			name: string;
			firstName?: string | undefined;
			lastName?: string | undefined;
			email?: string | null | undefined;
			phone?: string | null | undefined;
			img?: string | null | undefined;
			neighborhood?: string | null | undefined;
			city?: string | null | undefined;
			country?: string | null | undefined;
			line1?: string | null | undefined;
			line2?: string | null | undefined;
			postal_code?: string | null | undefined;
			state?: string | null | undefined;
			town?: string | null | undefined;
			joined?: string | null | undefined;
			stripe?: string | null | undefined;
			stripeDev?: string | null | undefined;
		} & {
			[k: string]: string | number | boolean;
		};
		intent: {
			current: string | null;
			flow: string[];
			initial: string | null;
		};
		messages: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[];
		conversation: {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		};
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}, {
		message: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		};
		agent: {
			id: string;
			inactive?: boolean | undefined;
			img?: string | null | undefined;
			title?: string | undefined;
			firstName?: string | undefined;
			lastName?: string | undefined;
			deployed?: {
				web?: string | undefined;
				phone?: string | undefined;
				email?: string | undefined;
			} | undefined;
			programmablePhoneNumber?: string | undefined;
			programmablePhoneNumberSid?: string | undefined;
			programmableEmail?: string | undefined;
			forwardEmail?: string | undefined;
			forwardPhone?: string | undefined;
		};
		customer: {
			name: string;
			firstName?: string | undefined;
			lastName?: string | undefined;
			email?: string | null | undefined;
			phone?: string | null | undefined;
			img?: string | null | undefined;
			neighborhood?: string | null | undefined;
			city?: string | null | undefined;
			country?: string | null | undefined;
			line1?: string | null | undefined;
			line2?: string | null | undefined;
			postal_code?: string | null | undefined;
			state?: string | null | undefined;
			town?: string | null | undefined;
			joined?: string | null | undefined;
			stripe?: string | null | undefined;
			stripeDev?: string | null | undefined;
		} & {
			[k: string]: string | number | boolean;
		};
		intent: {
			current: string | null;
			flow: string[];
			initial: string | null;
		};
		messages: {
			time: string;
			id: string;
			content: string;
			role: "agent" | "customer" | "system";
			name?: string | undefined;
			scheduled?: string | undefined;
			context?: any;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
			delayInSeconds?: number | null | undefined;
		}[];
		conversation: {
			environment: "email" | "phone" | "web";
			$agent: string;
			$customer: string;
			initialContexts?: string[] | undefined;
			environmentProps?: {
				subject?: string | undefined;
				platformEmailThreadId?: string | undefined;
			} | undefined;
			locked?: boolean | null | undefined;
			lockedReason?: string | null | undefined;
			lockAttempts?: number | null | undefined;
			forwardedTo?: string | null | undefined;
			forwarded?: string | null | undefined;
			forwardNote?: string | null | undefined;
			intent?: string | null | undefined;
			intentScore?: number | null | undefined;
		};
		stagnationCount: number;
		context?: any;
		note?: string | undefined;
	}>;
	/**
	 * The workflow response object slot
	 * 
	 */
	const WorkflowResponseSlotSchema: z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>;
	/**
	 * The workflow response to send in any given workflow
	 * 
	 */
	const WorkflowResponseSchema: z.ZodUnion<[z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>, z.ZodArray<z.ZodObject<{
		forward: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodObject<{
			to: z.ZodOptional<z.ZodString>;
			mode: z.ZodOptional<z.ZodEnum<["after-reply", "immediately"]>>;
			note: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}, {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		}>]>>;
		forwardNote: z.ZodOptional<z.ZodString>;
		instructions: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
			id: z.ZodString;
			content: z.ZodString;
		}, "strip", z.ZodTypeAny, {
			id: string;
			content: string;
		}, {
			id: string;
			content: string;
		}>, "many">]>>;
		removeInstructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
		message: z.ZodOptional<z.ZodString>;
		secondsDelay: z.ZodOptional<z.ZodNumber>;
		scheduled: z.ZodOptional<z.ZodNumber>;
		contextUpsert: any;
		resetIntent: z.ZodOptional<z.ZodBoolean>;
	}, "strip", z.ZodTypeAny, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}, {
		forward?: string | boolean | {
			to?: string | undefined;
			mode?: "after-reply" | "immediately" | undefined;
			note?: string | undefined;
		} | undefined;
		forwardNote?: string | undefined;
		instructions?: string | string[] | {
			id: string;
			content: string;
		} | {
			id: string;
			content: string;
		}[] | undefined;
		removeInstructions?: string[] | undefined;
		message?: string | undefined;
		secondsDelay?: number | undefined;
		scheduled?: number | undefined;
		contextUpsert?: any;
		resetIntent?: boolean | undefined;
	}>, "many">]>;
	type IConversation = import('zod').infer<typeof ConversationSchema>;
	type IWorkflowEvent = import('zod').infer<typeof WorkflowEventSchema>;
	/**
	 * The workflow response object slot
	 */
	type IWorkflowResponseSlot = import('zod').infer<typeof WorkflowResponseSlotSchema>;
	/**
	 * The workflow response to send in any given workflow
	 */
	type IWorkflowResponse = import('zod').infer<typeof WorkflowResponseSchema>;
	const MessageSchema: z.ZodObject<{
		id: z.ZodString;
		role: z.ZodEnum<["agent", "customer", "system"]>;
		content: z.ZodString;
		time: z.ZodString;
		name: z.ZodOptional<z.ZodString>;
		scheduled: z.ZodOptional<z.ZodString>;
		context: z.ZodOptional<z.ZodAny>;
		intent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
		intentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
		delayInSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
	}, "strip", z.ZodTypeAny, {
		time: string;
		id: string;
		content: string;
		role: "agent" | "customer" | "system";
		name?: string | undefined;
		scheduled?: string | undefined;
		context?: any;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
		delayInSeconds?: number | null | undefined;
	}, {
		time: string;
		id: string;
		content: string;
		role: "agent" | "customer" | "system";
		name?: string | undefined;
		scheduled?: string | undefined;
		context?: any;
		intent?: string | null | undefined;
		intentScore?: number | null | undefined;
		delayInSeconds?: number | null | undefined;
	}>;
	type IMessage = import('zod').infer<typeof MessageSchema>;
	const customerSchema: z.ZodObject<{
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		name: z.ZodString;
		email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
	}, "strip", z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, z.objectOutputType<{
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		name: z.ZodString;
		email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
	}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">, z.objectInputType<{
		firstName: z.ZodOptional<z.ZodString>;
		lastName: z.ZodOptional<z.ZodString>;
		name: z.ZodString;
		email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		img: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		neighborhood: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		line2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		town: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		joined: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripe: z.ZodOptional<z.ZodNullable<z.ZodString>>;
		stripeDev: z.ZodOptional<z.ZodNullable<z.ZodString>>;
	}, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>, "strip">>;
	type ICustomer = import('zod').infer<typeof customerSchema>;
}

//# sourceMappingURL=index.d.ts.map