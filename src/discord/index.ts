import { getLatestBuildNumber } from '~/discord/api';
import Client from '~/discord/client';
import config from '@config.json';


export const clients: InstanceType<typeof Client>[] = [];

async function init() {
	await getLatestBuildNumber();

	const client = new Client(config.token, clients.length);
	await client.start();
}

export default init;