import type { AuthRequest, AuthResponse } from '@shared/types';
import { DispatchType } from '@shared/constants';
import type { WebSocket } from 'ws';
import config from '@config.json';
import storage from '~/storage';
import { send } from '~/socket';


function handler(ws: WebSocket, payload: AuthRequest) {
	const success = config.password === payload.password;

	if (success) {
		ws.authenticated = true;
		storage.emit('updated');
	}

	return send(ws, DispatchType.AUTH_RESPONSE, { success } as AuthResponse);
}

export default handler;