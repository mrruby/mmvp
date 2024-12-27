import { SvelteKitAuth } from '@auth/sveltekit';
import Facebook from '@auth/core/providers/facebook';
import { AUTH_FACEBOOK_ID, AUTH_FACEBOOK_SECRET, AUTH_SECRET } from '$env/static/private';

const auth = SvelteKitAuth(async () => {
	const authOptions = {
		providers: [
			Facebook({
				clientId: AUTH_FACEBOOK_ID,
				clientSecret: AUTH_FACEBOOK_SECRET,
				authorization: { params: { scope: 'email,ads_management,business_management' } }
			})
		],
		secret: AUTH_SECRET,
		trustHost: true
	};
	return authOptions;
});

export const { handle, signIn, signOut } = auth;
