import { adAccountSchema, facebookPageSchema, fundingSourceSchema } from '$lib/schemas/facebook';
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
