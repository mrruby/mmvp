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
		billing_event: validatedParams.billing_event,
		bid_strategy: validatedParams.bid_strategy,
		targeting: JSON.stringify(validatedParams.targeting),
		status: 'PAUSED'
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
	const linkData: Record<string, unknown> = {
		message: validatedParams.message,
		link: validatedParams.link
	};

	if (validatedParams.imageHash) {
		linkData.image_hash = validatedParams.imageHash;
	}

	if (validatedParams.call_to_action) {
		linkData.call_to_action = validatedParams.call_to_action;
	}

	const response = await event.locals.facebook.post(`/${adAccountId}/adcreatives`, {
		name: validatedParams.name,
		object_story_spec: JSON.stringify({
			page_id: validatedParams.pageId,
			link_data: linkData
		}),
		degrees_of_freedom_spec: JSON.stringify({
			creative_features_spec: {
				standard_enhancements: {
					enroll_status: validatedParams.enroll_status || 'OPT_OUT'
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
