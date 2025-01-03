import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { Dispatch, type Call } from '@shared/types';
import { DispatchType } from '@shared/constants';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { LoaderCircle } from 'lucide-react';
import config from '@web-config.json';
import { sleep } from '@shared/utils';


type SocketStates = 'idle' | 'connecting' | 'connected' | 'ready';

interface BackendContextProps {
	state: SocketStates;
	authenticated: boolean;
	data: Call[];
	send: (type: DispatchType, payload?: Record<PropertyKey, any>) => void;
	on: (type: DispatchType, callback: (...args: any[]) => any) => () => void;
	once: (type: DispatchType, callback: (...args: any[]) => any) => () => void;
	off: (type: DispatchType, callback: (...args: any[]) => any) => void;
	waitForDispatch: (type: DispatchType) => Promise<unknown>;
	readonly ws: WebSocket | null;
}

export const BackendContext = createContext<BackendContextProps>({
	send: () => void 0,
	data: [],
	state: 'idle',
	authenticated: false,
	on: () => () => void 0,
	once: () => () => void 0,
	off: () => void 0,
	waitForDispatch: () => Promise.resolve(),
	ws: null
});

export const listeners = new Map<DispatchType, Set<(payload: Record<PropertyKey, any>) => any>>();

function BackendProvider({ children, ...props }: React.PropsWithChildren) {
	// Auth
	const [authenticated, setAuthenticated] = useState<boolean>(false);
	const [authenticating, setAuthenticating] = useState(false);
	const [authFailed, setAuthFailed] = useState(false);
	const [authOpen, setAuthOpen] = useState(true);
	const [password, setPassword] = useState('');
	const [data, setData] = useState([]);

	const [state, setState] = useState<SocketStates>('idle');
	const ws = useRef<WebSocket | null>(null);


	const emit = useCallback((type: DispatchType, payload: any) => {
		const callbacks = listeners.get(type);

		for (const callback of callbacks ?? []) {
			try {
				callback(payload);
			} catch (error) {
				console.error(`Failed to run callback for ${type} event:`, error);
			}
		}
	}, []);

	const on = useCallback((type: DispatchType, callback: (...args: any[]) => any) => {
		const set = listeners.get(type) ?? new Set();

		if (set.size) {
			set.add(callback);
		} else {
			set.add(callback);
			listeners.set(type, set);
		}

		return () => off(type, callback);
	}, []);

	const once = useCallback((type: DispatchType, callback: (...args: any[]) => any) => {
		function onCallback(...args: any[]) {
			try {
				callback(...args);
			} catch (error) {
				console.error('Failed to call `once` callback:', error);
			} finally {
				off(type, onCallback);
			}
		}

		on(type, onCallback);

		return () => off(type, callback);
	}, []);

	const off = useCallback((type: DispatchType, callback: (...args: any[]) => any) => {
		const existing = listeners.get(type);
		if (!existing) return;

		existing.delete(callback);
	}, []);

	const waitForDispatch = useCallback((type: DispatchType, filter?: (dispatch: Dispatch) => any): Promise<Dispatch> => {
		return new Promise(resolve => {
			function callback(dispatch: Dispatch) {
				if (filter && !filter(dispatch)) return;
				off(type, callback);
				resolve(dispatch);
			}

			on(type, callback);
		});
	}, []);

	const send = useCallback((type: DispatchType, payload: Record<PropertyKey, any> = {}) => {
		if (!ws.current) return console.warn('Attempted to send data to the WebSocket in CLOSED state.');

		try {
			const stringified = JSON.stringify({ ...payload, type });
			ws.current!.send(stringified);
		} catch (error) {
			console.error('Failed to send WebSocket message to client:', error);
		}
	}, [ws.current]);

	useEffect(() => {
		const password = localStorage.getItem('password');
		if (!password || state !== 'ready' || authenticated) return;

		send(DispatchType.REQUEST_AUTH, { password });
	}, [state, authenticated]);

	const ctx = {
		state,
		authenticated,
		data,
		send,
		on,
		off,
		once,
		emit,
		waitForDispatch,
		get ws() {
			return ws.current;
		}
	};

	useEffect(() => {
		function onUnload() {
			ws.current?.close();
		}

		function createSocket() {
			if (ws.current) return;

			setState('connecting');
			setAuthenticated(false);

			const socket = new WebSocket('ws://' + config.host + ':' + config.port);

			socket.binaryType = 'arraybuffer';

			ws.current = socket;

			socket.addEventListener('close', async () => {
				ws.current = null;
				setState('idle');

				console.log('Socket closed, waiting 1000ms then retrying...');
				await sleep(1000);

				createSocket();
			});

			socket.addEventListener('open', () => {
				console.info('Socket opened');
				setState('connected');
			});

			socket.addEventListener('message', (event) => {
				try {
					const payload = JSON.parse(event.data);

					emit(payload.type, payload);

					switch (payload.type) {
						case DispatchType.WELCOME: {
							console.log('WebSocket ready for authentication.');
							setState('ready');
						} break;

						case DispatchType.AUTH_RESPONSE: {
							if (!payload.success) return;

							setAuthenticated(true);
						} break;

						case DispatchType.DATA_UPDATE: {
							setData(payload.calls);
						} break;

						default: {
							console.log(`Received unknown dispatch:`, payload);
						} break;
					}
				} catch (e) {
					console.error('!!! Failed parsing WebSocket message !!!');
				}
			});
		}

		createSocket();
		document.addEventListener('beforeunload', onUnload);

		return () => {
			document.removeEventListener('beforeunload', onUnload);
			ws.current?.close();
		};
	}, []);

	return <BackendContext.Provider {...props} value={ctx}>
		{!authenticated && <Dialog open={authOpen} onOpenChange={(open) => setAuthOpen(open)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Authenticate
					</DialogTitle>
					<DialogDescription>
						Please enter the password you set in the configuration to continue.
					</DialogDescription>
				</DialogHeader>
				<Input
					value={password}
					data-failed={authFailed}
					className='data-[failed=true]:!border-red-500 data-[failed=true]:border-2'
					placeholder='Password'
					type='password'
					onChange={(e) => {
						setAuthFailed(false);
						setPassword(e.target.value ?? '');
					}}
				/>
				{authFailed && <span className='text-red-500'>Incorrect password.</span>}
				<DialogFooter>
					<Button
						type='submit'
						disabled={!password || authenticating}
						className='w-full disabled:opacity-50'
						onClick={async () => {
							setAuthenticating(true);
							setAuthFailed(false);

							send(DispatchType.REQUEST_AUTH, { password });

							const success = await new Promise<boolean>((resolve) => {
								const remove = on(DispatchType.AUTH_RESPONSE, (payload) => {
									remove();
									resolve(payload.success);
								});
							});

							setAuthFailed(!success);
							setAuthenticating(false);

							if (success) {
								setAuthOpen(false);
								localStorage.setItem('password', password);
							}
						}}
					>
						{authenticating ? <LoaderCircle className='animate-spin' /> : 'Submit'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>}
		{children}
	</BackendContext.Provider>;
}

export default BackendProvider;