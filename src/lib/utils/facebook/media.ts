import { buildFacebookUrl, postToFacebook } from './client';

export const uploadAdImage = async (
	accessToken: string,
	adAccountId: string,
	imageData: string
): Promise<{ hash: string }> => {
	const url = buildFacebookUrl(`/${adAccountId}/adimages`, '', accessToken);
	const response = await postToFacebook<{ images: { bytes: { hash: string } } }>(url, {
		bytes: imageData
	});
	return { hash: response.images?.bytes?.hash };
};
