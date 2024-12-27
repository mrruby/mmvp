import { signIn } from '$lib/server/auth';
import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (events) => {
	const session = await events.locals.auth();

	if (session) {
		throw redirect(303, '/');
	}

	return {
		session
	};
};

export const actions: Actions = { default: signIn };
