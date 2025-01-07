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
import { campaignListSchema } from '$lib/schemas/facebook';
import { z } from 'zod';

const responseSchema = z.object({
	id: z.string(),
	success: z.boolean().optional()
});

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
		'id,name,status,effective_status,adsets{destination_type}'
	);

	const validated = campaignListSchema.parse(response);

	// Filter campaigns that have at least one adset with INSTAGRAM_PROFILE destination type
	const instagramCampaigns = validated.data.filter(
		(campaign) =>
			campaign.adsets?.data.some((adset) => adset.destination_type === 'INSTAGRAM_PROFILE') ?? false
	);

	console.log(JSON.stringify(instagramCampaigns, null, 2));

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
