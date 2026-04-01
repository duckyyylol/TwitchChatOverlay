interface _wsState {
	isConnected: boolean;
	isAuthorized: boolean;
	lastMessage: any | null;
	error: string | null;
}


declare global {
	export interface WebsocketState extends _wsState {};

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
