import { Separator } from '~/components/ui/separator';
import useBackend from '~/hooks/use-backend';
import Page from '~/components/page';

export const path = '/';
export const element = Home;

function Home() {
	const backend = useBackend();

	return <Page>
		<div className='flex flex-col gap-2'>
			<span>Main page here.</span>
			<Separator />
			<section className='flex flex-col'>
				<code>State: {backend.state}</code>
				<code>Authenticated: {String(backend.authenticated)}</code>
			</section>
		</div>
	</Page>;
}

