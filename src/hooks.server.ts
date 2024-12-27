import { redirect, type Handle } from '@sveltejs/kit';
import { handle as authenticationHandle } from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';

const authorizationHandle: Handle = async ({ event, resolve }) => {
	const publicPaths = ['/signin', '/auth'];
	const isPublicPath = publicPaths.some((path) => event.url.pathname.startsWith(path));

	if (!isPublicPath) {
		const session = await event.locals.auth();
		if (!session) {
			throw redirect(303, '/signin');
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(authenticationHandle, authorizationHandle);
