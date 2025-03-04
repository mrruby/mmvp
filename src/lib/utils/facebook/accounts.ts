import {
	fundingSourceSchema,
	instagramBusinessAccountSchema,
	adAccountsResponseSchema,
	pagesResponseSchema,
	businessResponseSchema,
	instagramAccountsResponseSchema,
	instagramMediaResponseSchema,
	instagramConnectedPageSchema
} from '$lib/schemas';
import type { RequestEvent } from '@sveltejs/kit';

export const fetchAdAccounts = async (event: RequestEvent) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const { User } = event.locals.facebook;
	const me = new User('me');

	const adAccounts = await me.getAdAccounts([
		'id',
		'account_id',
		'name',
		'currency',
		'business_name'
	]);

	// Transform the SDK response to match our schema
	const transformedData = {
		data: adAccounts.map((account) => ({
			id: account.id,
			account_id: account.account_id,
			name: account.name,
			currency: account.currency,
			business_name: account.business_name
		}))
	};

	const validated = adAccountsResponseSchema.parse(transformedData);
	return validated.data;
};

export const fetchFundingSource = async (event: RequestEvent, adAccountId: string) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	try {
		const { AdAccount } = event.locals.facebook;
		const account = new AdAccount(adAccountId);
		const response = await account.get(['funding_source_details']);
		return fundingSourceSchema.parse(response);
	} catch (error) {
		if (error instanceof Error && error.message.includes('Permission Denied')) {
			return null;
		}
		throw error;
	}
};

export const fetchPages = async (event: RequestEvent) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const { User, Page } = event.locals.facebook;
	const me = new User('me');

	// First get the pages
	const pages = await me.getAccounts(['id', 'name', 'access_token']);
	const validatedPages = pagesResponseSchema.parse({ data: pages });

	// Then fetch instagram_business_account for each page
	const pagesWithInstagram = await Promise.all(
		validatedPages.data.map(async (page) => {
			const fbPage = new Page(String(page.id));
			const instagramData = await fbPage.get(['instagram_business_account']);
			const validated = instagramBusinessAccountSchema.parse(instagramData);
			return {
				...page,
				instagram_business_account: validated.instagram_business_account
			};
		})
	);

	return pagesWithInstagram;
};

export const getPageInstagramAccount = async (event: RequestEvent, pageId: string) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const { Page } = event.locals.facebook;
	const fbPage = new Page(pageId);
	const response = await fbPage.get(['instagram_business_account']);

	const validated = instagramBusinessAccountSchema.parse(response);
	return validated.instagram_business_account;
};

export const fetchInstagramAccounts = async (event: RequestEvent) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const { User, Business } = event.locals.facebook;
	const me = new User('me');
	const businessResponse = await me.getBusinesses(['id', 'name']);
	const businessData = businessResponseSchema.parse({ data: businessResponse });

	if (!businessData.data.length) {
		throw new Error('No business accounts found');
	}

	const instagramAccountsPromises = businessData.data.map(async (business) => {
		try {
			const fbBusiness = new Business(String(business.id));
			const response = await fbBusiness.getInstagramAccounts([
				'id',
				'ig_id',
				'username',
				'profile_picture'
			]);
			const validated = instagramAccountsResponseSchema.parse({ data: response });
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

export const getInstagramConnectedPage = async (
	event: RequestEvent,
	instagramAccountId: string
) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const { User } = event.locals.facebook;
	const me = new User('me');

	// Get the Instagram account details using Graph API
	const response = await me.get(['id', 'name', 'username', 'profile_picture_url'], {
		path: `/${instagramAccountId}`
	});

	return instagramConnectedPageSchema.parse(response);
};

export const fetchInstagramMedia = async (event: RequestEvent, instagramAccountId: string) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const { User } = event.locals.facebook;
	const me = new User('me');

	// Get the Instagram media using Graph API
	const response = await me.get(
		['id', 'caption', 'media_type', 'media_url', 'thumbnail_url', 'timestamp'],
		{
			path: `/${instagramAccountId}/media`
		}
	);

	const validated = instagramMediaResponseSchema.parse(response);
	return validated.data;
};
