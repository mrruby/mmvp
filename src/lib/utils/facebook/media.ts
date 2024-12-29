import type { RequestEvent } from '@sveltejs/kit';

export const uploadAdImage = async (
	event: RequestEvent,
	adAccountId: string,
	imageData: string
): Promise<{ hash: string }> => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const response = await event.locals.facebook.post<{ images: { bytes: { hash: string } } }>(
		`/${adAccountId}/adimages`,
		{
			bytes: imageData
		}
	);
	return { hash: response.images?.bytes?.hash };
};
