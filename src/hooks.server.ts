import { redirect, type Handle } from '@sveltejs/kit';
import { handle as authenticationHandle } from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';
import { initFacebookSdk } from '$lib/server/facebook-sdk';

const facebookServiceHandle: Handle = async ({ event, resolve }) => {
	try {
		const session = await event.locals.auth();
		if (session?.accessToken) {
			event.locals.facebook = initFacebookSdk(session.accessToken);
		} else {
			event.locals.facebook = undefined;
		}
	} catch (error) {
		// If we can't create the service, just continue without it
		console.error('Failed to create Facebook service:', error);
		event.locals.facebook = undefined;
	}
	return resolve(event);
};

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

export const handle: Handle = sequence(
	authenticationHandle,
	facebookServiceHandle,
	authorizationHandle
);
