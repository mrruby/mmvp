import { createCampaign, createAdSet, createAdCreative, createAd, uploadAdImage } from './facebook';

export type CampaignData = {
	adAccountId: string;
	campaignName: string;
	dailyBudget: string;
	pageId: string;
	message: string;
	link: string;
	imageFile: File | null;
	accessToken: string;
};

export const validateCampaignData = (data: Partial<CampaignData>): data is CampaignData => {
	const { adAccountId, campaignName, dailyBudget, pageId, message, link } = data;
	return !!(adAccountId && campaignName && dailyBudget && pageId && message && link);
};

export const createFullCampaign = async (data: CampaignData) => {
	const { accessToken, adAccountId, campaignName, dailyBudget, pageId, message, link, imageFile } =
		data;

	// Create campaign
	const campaign = await createCampaign(accessToken, adAccountId, {
		name: campaignName,
		objective: 'OUTCOME_TRAFFIC',
		status: 'PAUSED'
	});

	// Create ad set
	const adSet = await createAdSet(accessToken, adAccountId, {
		name: `${campaignName} - Zestaw reklam`,
		campaignId: campaign.id,
		dailyBudget: (parseFloat(dailyBudget) * 100).toString(),
		targeting: {
			geo_locations: { countries: ['PL'] }
		},
		billing_event: 'IMPRESSIONS',
		bid_strategy: 'LOWEST_COST_WITHOUT_CAP'
	});

	// Handle image upload if provided
	let imageHash: string | undefined;
	if (imageFile && imageFile.size > 0) {
		const imageBuffer = await imageFile.arrayBuffer();
		const base64Image = btoa(
			new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
		);
		const uploadResult = await uploadAdImage(accessToken, adAccountId, base64Image);
		imageHash = uploadResult.hash;
	}

	// Create ad creative
	const creative = await createAdCreative(accessToken, adAccountId, {
		name: `${campaignName} - Kreacja`,
		pageId,
		message,
		link,
		imageHash
	});

	// Create ad
	return createAd(accessToken, adAccountId, {
		name: `${campaignName} - Reklama`,
		adsetId: adSet.id,
		creativeId: creative.id
	});
};
