import { adImageResponseSchema } from '$lib/schemas/facebook';
import type { RequestEvent } from '@sveltejs/kit';
import { AdImage } from 'facebook-nodejs-business-sdk';

export const uploadAdImage = async (
	event: RequestEvent,
	adAccountId: string,
	imageData: string
): Promise<{ hash: string }> => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const { AdAccount } = event.locals.facebook;
	const account = new AdAccount(adAccountId);

	const response = await account.createAdImage([AdImage.Fields.hash], {
		bytes: imageData
	});

	const result = adImageResponseSchema.parse({
		hash: response._data?.images?.bytes?.hash
	});

	return result;
};
