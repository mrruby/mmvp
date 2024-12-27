import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Get the user session (which contains our stored access token)
	const session = await locals.auth();

	// If the user is not logged in, you can redirect them to sign in:
	if (!session) {
		throw redirect(303, '/signin');
	}

	// Retrieve the access token we stored in the session callbacks
	const accessToken = session.accessToken;
	if (!accessToken) {
		// No access token means we can't call the Graph API
		return { pages: [] };
	}

	const url = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token&access_token=${accessToken}`;

	const res = await fetch(url);
	if (!res.ok) {
		console.error('Error fetching Facebook Pages:', await res.text());
		return { pages: [] };
	}

	const data = await res.json();
	// data.data is typically an array of pages the user manages
	return {
		pages: data.data ?? []
	};
};
