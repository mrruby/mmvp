import type { RequestEvent } from '@sveltejs/kit';
import {
	type CreateCampaignParams,
	type CreateAdSetParams,
	type CreateAdCreativeParams,
	type CreateAdParams,
	createCampaignParamsSchema,
	createAdSetParamsSchema,
	createAdCreativeParamsSchema,
	createAdParamsSchema
} from '$lib/schemas/campaign';
import { campaignListSchema, responseSchema } from '$lib/schemas/facebook';

export const createCampaign = async (
	event: RequestEvent,
	adAccountId: string,
	params: CreateCampaignParams
) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const validatedParams = createCampaignParamsSchema.parse(params);
	const response = await event.locals.facebook.post(`/${adAccountId}/campaigns`, {
		name: validatedParams.name,
		objective: validatedParams.objective,
		status: validatedParams.status,
		special_ad_categories: '[]'
	});
	return responseSchema.parse(response);
};

export const createAdSet = async (
	event: RequestEvent,
	adAccountId: string,
	params: CreateAdSetParams
) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const validatedParams = createAdSetParamsSchema.parse(params);
	const response = await event.locals.facebook.post(`/${adAccountId}/adsets`, {
		name: validatedParams.name,
		campaign_id: validatedParams.campaignId,
		daily_budget: validatedParams.dailyBudget,
		bid_amount: '2',
		billing_event: 'IMPRESSIONS',
		destination_type: validatedParams.destination_type,
		targeting: JSON.stringify(validatedParams.targeting),
		status: 'PAUSED',
		optimization_goal: 'LINK_CLICKS'
	});
	return responseSchema.parse(response);
};

export const createAdCreative = async (
	event: RequestEvent,
	adAccountId: string,
	params: CreateAdCreativeParams
) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const validatedParams = createAdCreativeParamsSchema.parse(params);

	const response = await event.locals.facebook.post(`/${adAccountId}/adcreatives`, {
		name: validatedParams.name,
		object_story_spec: JSON.stringify({
			instagram_actor_id: validatedParams.object_story_spec.instagram_actor_id,
			page_id: validatedParams.object_story_spec.page_id,
			link_data: {
				image_hash: validatedParams.object_story_spec.link_data.image_hash,
				message: validatedParams.object_story_spec.link_data.message,
				call_to_action: {
					type: 'VIEW_INSTAGRAM_PROFILE'
				},
				link: `https://www.instagram.com/${validatedParams.object_story_spec.instagram_username}/`
			}
		}),
		degrees_of_freedom_spec: JSON.stringify({
			creative_features_spec: {
				standard_enhancements: {
					enroll_status: 'OPT_OUT'
				}
			}
		})
	});
	return responseSchema.parse(response);
};

export const createAd = async (
	event: RequestEvent,
	adAccountId: string,
	params: CreateAdParams
) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const validatedParams = createAdParamsSchema.parse(params);
	const response = await event.locals.facebook.post(`/${adAccountId}/ads`, {
		name: validatedParams.name,
		adset_id: validatedParams.adsetId,
		creative: JSON.stringify({ creative_id: validatedParams.creativeId }),
		status: 'PAUSED'
	});
	return responseSchema.parse(response);
};

export const fetchCampaigns = async (event: RequestEvent, adAccountId: string) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const response = await event.locals.facebook.get<unknown>(
		`/${adAccountId}/campaigns`,
		'id,name,status,effective_status,adsets{destination_type},ads{creative{id,thumbnail_url,image_url,body,object_story_spec,asset_feed_spec}}'
	);

	const validated = campaignListSchema.parse(response);

	// Filter campaigns that have at least one adset with INSTAGRAM_PROFILE destination type
	const instagramCampaigns = validated.data.filter(
		(campaign) =>
			campaign.adsets?.data.some((adset) => adset.destination_type === 'INSTAGRAM_PROFILE') ?? false
	);

	return instagramCampaigns;
};

export const deleteCampaign = async (event: RequestEvent, campaignId: string) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const response = await event.locals.facebook.post<{ success: boolean }>(`/${campaignId}`, {
		status: 'DELETED'
	});

	return response.success;
};

export const createExistingPostCampaign = async (
	event: RequestEvent,
	adAccountId: string,
	params: {
		postId: string;
		name: string;
		dailyBudget: string;
	}
) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	// Create campaign
	const campaignResponse = await event.locals.facebook.post<unknown>(`/${adAccountId}/campaigns`, {
		name: params.name,
		objective: 'POST_ENGAGEMENT',
		status: 'PAUSED',
		special_ad_categories: '[]'
	});
	const campaign = responseSchema.parse(campaignResponse);

	// Create ad set
	const adSetResponse = await event.locals.facebook.post<unknown>(`/${adAccountId}/adsets`, {
		campaign_id: campaign.id,
		name: `${params.name} Ad Set`,
		optimization_goal: 'POST_ENGAGEMENT',
		billing_event: 'IMPRESSIONS',
		bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
		daily_budget: (Number(params.dailyBudget) * 100).toString(), // Convert to cents
		targeting: JSON.stringify({
			age_min: 18,
			age_max: 65,
			genders: [1, 2],
			geo_locations: {
				countries: ['US']
			}
		}),
		status: 'PAUSED'
	});
	const adSet = responseSchema.parse(adSetResponse);

	// Create ad creative
	const creativeResponse = await event.locals.facebook.post<unknown>(
		`/${adAccountId}/adcreatives`,
		{
			object_story_id: params.postId
		}
	);
	const creative = responseSchema.parse(creativeResponse);

	// Create ad
	await event.locals.facebook.post(`/${adAccountId}/ads`, {
		name: `${params.name} Ad`,
		adset_id: adSet.id,
		creative: JSON.stringify({ creative_id: creative.id }),
		status: 'PAUSED'
	});

	return { success: true };
};
