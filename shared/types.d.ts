import type { DispatchType } from '@shared/constants';


declare module 'ws' {
	interface WebSocket {
		authenticated: boolean;
	}
}

export interface Dispatch {
	type: DispatchType;
	[key: PropertyKey]: any;
}

export interface AuthRequest {
	password: string;
}

export interface AuthResponse {
	success: boolean;
}
