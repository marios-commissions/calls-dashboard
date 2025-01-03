import './styles.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import BackendProvider from '~/providers/backend-provider';
import ThemeProvider from '~/providers/theme-provider';
import { createRoot } from 'react-dom/client';
import * as Pages from '~/routes';


const root = document.getElementById('root')!;


const routes = Object.values(Pages).map(({ path, element: Component }: Pages.Page) => ({ path, element: <Component /> }));
const router = createBrowserRouter(routes);

createRoot(root).render(
	<BackendProvider>
		<ThemeProvider>
			<RouterProvider router={router} />
		</ThemeProvider>
	</BackendProvider>
);
