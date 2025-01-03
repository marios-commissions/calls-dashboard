export * as Home from './home';

export interface Page {
	path: string;
	element: React.ComponentType;
};