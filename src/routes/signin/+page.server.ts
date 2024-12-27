import { signIn } from '$lib/server/auth';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = { default: signIn };
