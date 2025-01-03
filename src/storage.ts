import type { Call } from '@shared/types';
import EventEmitter from 'events';


class Storage extends EventEmitter {
	store = [];

	add(call: Call) {
		this.store.push(call);
		this.emit('updated');
	}
}

export default new Storage();