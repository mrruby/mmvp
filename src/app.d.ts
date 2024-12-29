// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { User } from '@auth/core/types';
import type { FacebookClient } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			auth(): Promise<{ accessToken?: string; user: User } | null>;
			facebook?: FacebookClient;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '@auth/core/types' {
	interface Session {
		accessToken?: string;
		user: User;
	}
}

export {};
