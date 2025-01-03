import { createLogger } from '@shared/structs/logger';
import { DispatchType } from '@shared/constants';
import { WebSocket, WebSocketServer } from 'ws';
import config from '@web-config.json';
import * as Events from '~/events';


const server = new WebSocketServer({ port: config.port });
const logger = createLogger('Socket', 'Server');

export const clients = new Set<WebSocket>();

server.on('connection', (ws: WebSocket) => {
	logger.debug(`A new client has connected.`);

	ws.authenticated = false;

	ws.on('close', (code, reason) => {
		logger.debug(`Client disconnected. (Code: ${code ?? 'Unknown'})`);
	});

	ws.on('message', (data) => {
		try {
			const payload = JSON.parse(data.toString());
			if (!payload.type) return;

			const handler = Events[payload.type as keyof typeof Events];
			if (!handler) return;

			handler(ws, payload);
		} catch (error) {
			console.error('Failed to parse WebSocket message from client:', error);
		}
	});

	// Notify the client that we are ready for [DispatchType.AUTH_REQUEST]
	send(ws, DispatchType.WELCOME);
});

export function send(ws: WebSocket, type: DispatchType, payload: Record<PropertyKey, any> = {}) {
	try {
		const stringified = JSON.stringify({ ...payload, type });
		ws.send(stringified);
	} catch (error) {
		console.error('Failed to send WebSocket message to client:', error);
	}
}

logger.success(`Initialized WebSocket server on port ${config.port}.`);