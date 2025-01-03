import { Button } from '~/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { Call } from '@shared/types';


interface CallProps {
	call: Call;
}

function CallItem({ call }: CallProps) {
	return <tr>
		<td className='bg-foreground/10 px-2 rounded-md'>
			<b>{call.channel}</b>
		</td>
		<td className='bg-foreground/10 px-2 rounded-md'>
			<div className='flex flex-col'>
				<span><b>{call.coin}</b> ({call.marketCap}) ({call.ca})</span>
				<span>by @{call.user} <b>({call.nCalls} calls, {call.winRate}%)</b></span>
			</div>
		</td>
		<td>
			<Button asChild>
				<a href={`https://photon-sol.tinyastro.io/en/lp/${call.ca}`} target='_blank' className='flex gap-2 items-center w-full h-full'>
					Photon
					<ExternalLink size={24} />
				</a>
			</Button>
		</td>
	</tr>;
}

export default CallItem;