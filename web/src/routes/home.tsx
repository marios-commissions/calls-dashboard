import { Loader2, Lock, MailQuestion } from 'lucide-react';
import CallItem from '~/components/call-item';
import useBackend from '~/hooks/use-backend';
import Page from '~/components/page';


export const path = '/';
export const element = Home;

function Home() {
	const backend = useBackend();

	console.log(backend.data);

	return <Page className='h-full flex flex-1 flex-col' containerClassName='flex-1'>
		{backend.state !== 'ready' && <div className='flex flex-col m-auto items-center h-full w-full gap-2'>
			<Loader2 className='animate-spin' size={96} />
			<span className='font-bold'>Connection State: {backend.state}</span>
		</div>}
		{backend.state === 'ready' && !backend.authenticated && <div className='flex flex-col m-auto items-center h-full w-full gap-2'>
			<Lock size={96} />
			<span className='font-bold'>Please refresh to authenticate.</span>
		</div>}
		{backend.state === 'ready' && backend.data.length === 0 && <div className='flex flex-col m-auto items-center h-full w-full gap-2'>
			<MailQuestion size={96} />
			<span className='font-bold'>No calls have been recorded so far.</span>
		</div>}
		{backend.state === 'ready' && backend.data.length !== 0 && <div className='flex flex-col gap-2'>
			<table className='table-auto w-full mt-5 border-spacing-2 border-separate rounded'>
				<thead>
					<tr>
						<th>Channel</th>
						<th>Call</th>
						<th>Link</th>
					</tr>
				</thead>
				<tbody>
					{backend.data.reverse().map(call => <CallItem call={call} />)}
				</tbody>
			</table>
		</div>}
	</Page>;
}

