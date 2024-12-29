import type { FacebookClient } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';

// Constants
const FB_API_VERSION = 'v21.0';
const FB_API_BASE_URL = 'https://graph.facebook.com';

// Core URL builder
const buildUrl = (path: string, fields: string, accessToken: string): string =>
	`${FB_API_BASE_URL}/${FB_API_VERSION}${path}?fields=${fields}&access_token=${accessToken}`;

// Core fetch functions
const fetchData = async <T>(url: string): Promise<T> => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Facebook API error: ${await response.text()}`);
	}
	return response.json();
};

const postData = async <T>(url: string, params: Record<string, string | undefined>): Promise<T> => {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== undefined)
	) as Record<string, string>;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(filteredParams).toString()
	});

	if (!response.ok) {
		throw new Error(`Facebook API error: ${await response.text()}`);
	}
	return response.json();
};

// Higher-order functions that create API methods
const createGet =
	(accessToken: string) =>
	async <T>(path: string, fields: string): Promise<T> => {
		const url = buildUrl(path, fields, accessToken);
		return fetchData<T>(url);
	};

const createPost =
	(accessToken: string) =>
	async <T>(path: string, params: Record<string, string | undefined>): Promise<T> => {
		const url = buildUrl(path, '', accessToken);
		return postData<T>(url, params);
	};

// Factory function that composes the client
const createFacebookClient = (accessToken: string): FacebookClient => ({
	get: createGet(accessToken),
	post: createPost(accessToken)
});

// Factory function to create FacebookClient from RequestEvent
export const createFacebookService = async (event: RequestEvent): Promise<FacebookClient> => {
	const session = await event.locals.auth();
	if (!session?.accessToken) {
		throw new Error('No Facebook access token available');
	}
	return createFacebookClient(session.accessToken);
};
