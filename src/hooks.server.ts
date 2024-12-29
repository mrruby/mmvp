import { redirect, type Handle } from '@sveltejs/kit';
import { handle as authenticationHandle } from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';
import { createFacebookService } from '$lib/server/facebook';

const facebookServiceHandle: Handle = async ({ event, resolve }) => {
	try {
		event.locals.facebook = await createFacebookService(event);
	} catch (error) {
		// If we can't create the service, just continue without it
		console.error('Failed to create Facebook service:', error);
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
