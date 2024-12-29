import { createCampaign, createAdSet, createAdCreative, createAd } from './facebook/ads';
import { uploadAdImage } from './facebook/media';
import { type CampaignData, campaignDataSchema } from '$lib/schemas/campaign';
import type { RequestEvent } from '@sveltejs/kit';

export const validateCampaignData = (data: unknown): data is CampaignData => {
	try {
		campaignDataSchema.parse(data);
		return true;
	} catch {
		return false;
	}
};

export const createFullCampaign = async (event: RequestEvent, data: CampaignData) => {
	const validatedData = campaignDataSchema.parse(data);
	const { adAccountId, campaignName, dailyBudget, pageId, message, link, imageFile } =
		validatedData;

	// Create campaign
	const campaign = await createCampaign(event, adAccountId, {
		name: campaignName,
		objective: 'OUTCOME_TRAFFIC',
		status: 'PAUSED'
	});

	// Create ad set
	const adSet = await createAdSet(event, adAccountId, {
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
		const uploadResult = await uploadAdImage(event, adAccountId, base64Image);
		imageHash = uploadResult.hash;
	}

	// Create ad creative
	const creative = await createAdCreative(event, adAccountId, {
		name: `${campaignName} - Kreacja`,
		pageId,
		message,
		link,
		imageHash
	});

	// Create ad
	return createAd(event, adAccountId, {
		name: `${campaignName} - Reklama`,
		adsetId: adSet.id,
		creativeId: creative.id
	});
};
