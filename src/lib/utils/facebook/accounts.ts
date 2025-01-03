import {
	adAccountSchema,
	fundingSourceSchema,
	businessSchema,
	instagramAccountSchema,
	facebookPageSchema
} from '$lib/schemas/facebook';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

export const fetchAdAccounts = async (event: RequestEvent) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const response = await event.locals.facebook.get<unknown>(
		'/me/adaccounts',
		'id,account_id,name,currency,business_name'
	);

	const schema = z.object({ data: z.array(adAccountSchema) });
	const validated = schema.parse(response);
	return validated.data ?? [];
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
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const response = await event.locals.facebook.get<unknown>('/me/accounts', 'id,name,access_token');
	const schema = z.object({ data: z.array(facebookPageSchema) });
	const validated = schema.parse(response);
	return validated.data ?? [];
};

export const fetchInstagramAccounts = async (event: RequestEvent) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const facebook = event.locals.facebook;

	type BusinessResponse = z.infer<typeof businessSchema>;
	const businessResponse = await facebook.get<BusinessResponse>('/me/businesses', 'id,name');
	const businessData = businessSchema.parse(businessResponse);

	if (!businessData.data.length) {
		throw new Error('No business accounts found');
	}

	type InstagramResponse = z.infer<typeof instagramAccountSchema>;
	const instagramAccountsPromises = businessData.data.map(async (business) => {
		try {
			const response = await facebook.get<InstagramResponse>(
				`/${business.id}/instagram_accounts`,
				'id,username,profile_picture_url'
			);
			const validated = instagramAccountSchema.parse(response);
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
