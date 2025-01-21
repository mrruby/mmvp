import { SvelteKitAuth } from '@auth/sveltekit';
import Facebook from '@auth/core/providers/facebook';
import { AUTH_FACEBOOK_ID, AUTH_FACEBOOK_SECRET, AUTH_SECRET } from '$env/static/private';
import type { Account, Session } from '@auth/core/types';
import type { JWT } from '@auth/core/jwt';

const auth = SvelteKitAuth(async () => {
	const authOptions = {
		providers: [
			Facebook({
				clientId: AUTH_FACEBOOK_ID,
				clientSecret: AUTH_FACEBOOK_SECRET,
				authorization: {
					params: {
						scope:
							'email,ads_management,ads_read,business_management,pages_show_list,pages_read_engagement'
					}
				}
			})
		],
		callbacks: {
			jwt: async ({ token, account }: { token: JWT; account?: Account | null }) => {
				if (account) {
					token.accessToken = account.access_token;
				}
				return token;
			},
			session: async ({ session, token }: { session: Session; token: JWT }) => {
				session.accessToken = token.accessToken as string;
				return session;
			}
		},
		secret: AUTH_SECRET,
		trustHost: true
	};
	return authOptions;
});

export const { handle, signIn, signOut } = auth;
