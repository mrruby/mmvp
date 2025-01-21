import {
	adAccountSchema,
	fundingSourceSchema,
	instagramBusinessAccountSchema,
	instagramConnectedPageSchema,
	adAccountsResponseSchema,
	pagesResponseSchema,
	businessResponseSchema,
	instagramAccountsResponseSchema,
	instagramMediaResponseSchema,
	businessWithInstagramSchema
} from '$lib/schemas/facebook';
import type { RequestEvent } from '@sveltejs/kit';

export const fetchAdAccounts = async (event: RequestEvent) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const response = await event.locals.facebook.get<unknown>(
		'/me/adaccounts',
		'id,account_id,name,currency,business_name'
	);

	const validated = adAccountsResponseSchema.parse(response);
	return validated.data;
};

export const fetchFundingSource = async (event: RequestEvent, adAccountId: string) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	try {
		const response = await event.locals.facebook.get<unknown>(
			`/${adAccountId}`,
			'funding_source_details'
		);

		return fundingSourceSchema.parse(response);
	} catch (error) {
		if (error instanceof Error && error.message.includes('Permission Denied')) {
			return null;
		}
		throw error;
	}
};

export const fetchPages = async (event: RequestEvent) => {
	const facebookCall = event.locals.facebook;
	if (!facebookCall) {
		throw new Error('Facebook service not available');
	}

	// First get the pages
	const pagesResponse = await facebookCall.get<unknown>('/me/accounts', 'id,name,access_token');

	const validatedPages = pagesResponseSchema.parse(pagesResponse);
	const pages = validatedPages.data;

	// Then fetch instagram_business_account for each page
	const pagesWithInstagram = await Promise.all(
		pages.map(async (page) => {
			const instagramResponse = await facebookCall.get<unknown>(
				`/${page.id}`,
				'instagram_business_account'
			);
			const instagramData = instagramBusinessAccountSchema.parse(instagramResponse);
			return {
				...page,
				instagram_business_account: instagramData.instagram_business_account
			};
		})
	);

	return pagesWithInstagram;
};

export const getPageInstagramAccount = async (event: RequestEvent, pageId: string) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const response = await event.locals.facebook.get<unknown>(
		`/${pageId}`,
		'instagram_business_account'
	);

	const validated = instagramBusinessAccountSchema.parse(response);
	return validated.instagram_business_account;
};

export const fetchInstagramAccounts = async (event: RequestEvent) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const facebook = event.locals.facebook;

	const businessResponse = await facebook.get<unknown>('/me/businesses', 'id,name');
	const businessData = businessResponseSchema.parse(businessResponse);

	if (!businessData.data.length) {
		throw new Error('No business accounts found');
	}

	const instagramAccountsPromises = businessData.data.map(async (business) => {
		try {
			const response = await facebook.get<unknown>(
				`/${business.id}/instagram_accounts`,
				'id,username,profile_picture_url'
			);
			const validated = instagramAccountsResponseSchema.parse(response);
			return validated.data;
		} catch (error) {
			console.error(`Failed to fetch Instagram accounts for business ${business.id}:`, error);
			return [];
		}
	});

	const instagramAccountsArrays = await Promise.all(instagramAccountsPromises);

	const uniqueAccounts = new Map<string, { id: string; name: string }>();
	instagramAccountsArrays.flat().forEach((account) => {
		uniqueAccounts.set(account.id, {
			id: account.id,
			name: account.username
		});
	});

	return Array.from(uniqueAccounts.values());
};

export const fetchAdAccountDetails = async (event: RequestEvent, adAccountId: string) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const response = await event.locals.facebook.get<unknown>(`/${adAccountId}`, 'id,name,currency');

	return adAccountSchema.parse(response);
};

export const validateInstagramAccount = async (event: RequestEvent, igAccountId: string) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	// Step 1: Verify basic account info
	const accountResponse = await event.locals.facebook.get<unknown>(
		`/${igAccountId}`,
		'id,username,instagram_business_account'
	);

	const account = instagramBusinessAccountSchema.parse(accountResponse);

	if (!account.instagram_business_account) {
		throw new Error('Instagram account is not a Business or Creator account');
	}

	// Step 2: Verify business connection
	const businesses = await fetchBusinessesWithInstagram(event);
	const hasValidBusiness = businesses.some((business) =>
		business.instagram_accounts?.data.some((igAccount) => igAccount.id === igAccountId)
	);

	if (!hasValidBusiness) {
		throw new Error('Instagram account is not properly connected to a Facebook Business');
	}

	return account;
};

const fetchBusinessesWithInstagram = async (event: RequestEvent) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const response = await event.locals.facebook.get<unknown>(
		'/me/businesses',
		'id,name,instagram_accounts{id,username}'
	);

	const validated = businessWithInstagramSchema.parse(response);
	return validated.data;
};

export const fetchInstagramMedia = async (event: RequestEvent, igAccountId: string) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	// Validate Instagram account setup before proceeding
	await validateInstagramAccount(event, igAccountId);

	const response = await event.locals.facebook.get<unknown>(
		`/${igAccountId}/media`,
		'id,caption,media_type,media_url,thumbnail_url,timestamp'
	);

	const validated = instagramMediaResponseSchema.parse(response);
	return validated.data;
};

export const getInstagramConnectedPage = async (event: RequestEvent, igUserId: string) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const response = await event.locals.facebook.get<unknown>(`/${igUserId}`, 'id,name');

	return instagramConnectedPageSchema.parse(response);
};
