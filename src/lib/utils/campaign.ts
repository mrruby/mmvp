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
	const { adAccountId, campaignName, dailyBudget, instagramAccountId, message, imageFile, pageId } =
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
			geo_locations: { countries: ['PL'] },
			publisher_platforms: ['instagram']
		},
		destination_type: 'INSTAGRAM_PROFILE'
	});

	// Handle image upload - required for new ads
	if (!imageFile || imageFile.size === 0) {
		throw new Error('Image file is required for new ads');
	}

	const imageBuffer = await imageFile.arrayBuffer();
	const base64Image = btoa(
		new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
	);
	const uploadResult = await uploadAdImage(event, adAccountId, base64Image);
	const imageHash = uploadResult.hash;

	// Create ad creative
	const creative = await createAdCreative(event, adAccountId, {
		name: `${campaignName} - Kreacja`,
		object_story_spec: {
			page_id: pageId,
			instagram_actor_id: instagramAccountId,
			instagram_username: validatedData.instagramUsername,
			link_data: {
				image_hash: imageHash,
				message
			}
		}
	});

	// Create ad
	return createAd(event, adAccountId, {
		name: `${campaignName} - Reklama`,
		adsetId: adSet.id,
		creativeId: creative.id,
		instagramActorId: instagramAccountId
	});
};

export const createExistingPostCampaign = async (
	event: RequestEvent,
	data: {
		adAccountId: string;
		campaignName: string;
		dailyBudget: string;
		postId: string;
		pageId: string;
		instagramAccountId: string;
		instagramUsername: string;
	}
) => {
	// Create campaign
	const campaign = await createCampaign(event, data.adAccountId, {
		name: data.campaignName,
		objective: 'POST_ENGAGEMENT', // Use POST_ENGAGEMENT for existing posts
		status: 'PAUSED'
	});

	// Create ad set
	const adSet = await createAdSet(event, data.adAccountId, {
		name: `${data.campaignName} - Zestaw reklam`,
		campaignId: campaign.id,
		dailyBudget: (parseFloat(data.dailyBudget) * 100).toString(),
		targeting: {
			geo_locations: { countries: ['PL'] },
			publisher_platforms: ['instagram']
		},
		destination_type: 'INSTAGRAM_PROFILE'
	});

	// Create ad creative using object_story_id
	const creative = await createAdCreative(event, data.adAccountId, {
		name: `${data.campaignName} - Kreacja`,
		object_story_id: data.postId
	});

	// Create ad
	return createAd(event, data.adAccountId, {
		name: `${data.campaignName} - Reklama`,
		adsetId: adSet.id,
		creativeId: creative.id,
		instagramActorId: data.instagramAccountId
	});
};
