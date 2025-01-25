import type { RequestEvent } from '@sveltejs/kit';
import {
	type CreateCampaignParams,
	type CreateAdSetParams,
	type CreateAdCreativeParams,
	type CreateAdParams,
	createCampaignParamsSchema,
	createAdSetParamsSchema,
	createAdCreativeParamsSchema,
	createAdParamsSchema,
	campaignListSchema,
	responseSchema,
	type LinkData
} from '$lib/schemas';

export const createCampaign = async (
	event: RequestEvent,
	adAccountId: string,
	params: CreateCampaignParams
) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const validatedParams = createCampaignParamsSchema.parse(params);
	const { AdAccount } = event.locals.facebook;
	const account = new AdAccount(adAccountId);

	const campaign = await account.createCampaign(['id', 'name', 'status'], {
		name: validatedParams.name,
		objective: validatedParams.objective,
		status: validatedParams.status,
		special_ad_categories: []
	});

	return responseSchema.parse(campaign);
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
	const { AdAccount } = event.locals.facebook;
	const account = new AdAccount(adAccountId);

	const adSet = await account.createAdSet(['id', 'name', 'status'], {
		name: validatedParams.name,
		campaign_id: validatedParams.campaignId,
		daily_budget: validatedParams.dailyBudget,
		bid_amount: '2',
		billing_event: 'IMPRESSIONS',
		destination_type: validatedParams.destination_type,
		targeting: validatedParams.targeting,
		status: 'PAUSED',
		optimization_goal: 'LINK_CLICKS'
	});

	return responseSchema.parse(adSet);
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
	const { AdAccount } = event.locals.facebook;
	const account = new AdAccount(adAccountId);

	// If we're using an existing post
	if (validatedParams.object_story_id) {
		const creative = await account.createAdCreative(['id', 'name'], {
			name: validatedParams.name,
			object_story_id: validatedParams.object_story_id
		});
		return responseSchema.parse(creative);
	}

	// If we're creating a new ad with an uploaded image
	if (validatedParams.object_story_spec) {
		const linkData: LinkData = {
			message: validatedParams.object_story_spec.link_data.message,
			call_to_action: {
				type: 'VIEW_INSTAGRAM_PROFILE'
			},
			link: `https://www.instagram.com/${validatedParams.object_story_spec.instagram_username}/`
		};

		// Only add image_hash if it's provided
		if (validatedParams.object_story_spec.link_data.image_hash) {
			linkData.image_hash = validatedParams.object_story_spec.link_data.image_hash;
		}

		const creative = await account.createAdCreative(['id', 'name'], {
			name: validatedParams.name,
			object_story_spec: {
				instagram_actor_id: validatedParams.object_story_spec.instagram_actor_id,
				page_id: validatedParams.object_story_spec.page_id,
				link_data: linkData
			},
			degrees_of_freedom_spec: {
				creative_features_spec: {
					standard_enhancements: {
						enroll_status: 'OPT_OUT'
					}
				}
			}
		});
		return responseSchema.parse(creative);
	}

	throw new Error('Invalid ad creative parameters');
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
	const { AdAccount } = event.locals.facebook;
	const account = new AdAccount(adAccountId);

	const ad = await account.createAd(['id', 'name', 'status'], {
		name: validatedParams.name,
		adset_id: validatedParams.adsetId,
		creative: { creative_id: validatedParams.creativeId },
		status: 'PAUSED',
		instagram_actor_id: validatedParams.instagramActorId
	});

	return responseSchema.parse(ad);
};

export const fetchCampaigns = async (event: RequestEvent, adAccountId: string) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const { AdAccount } = event.locals.facebook;
	const account = new AdAccount(adAccountId);

	const campaigns = await account.getCampaigns([
		'id',
		'name',
		'status',
		'effective_status',
		'adsets{destination_type}',
		'ads{creative{id,thumbnail_url,image_url,body,object_story_spec,asset_feed_spec}}'
	]);

	const validated = campaignListSchema.parse({ data: campaigns });

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

	const { Campaign } = event.locals.facebook;
	const campaign = new Campaign(campaignId);
	await campaign.delete(['id']);

	return true;
};

export const createExistingPostCampaign = async (
	event: RequestEvent,
	adAccountId: string,
	params: {
		postId: string;
		name: string;
		dailyBudget: string;
		instagramAccountId: string;
	}
) => {
	if (!event.locals.facebook) {
		throw new Error('Facebook service not available');
	}

	const { AdAccount } = event.locals.facebook;
	const account = new AdAccount(adAccountId);

	// Create campaign
	const campaign = await account.createCampaign(['id', 'name', 'status'], {
		name: params.name,
		objective: 'POST_ENGAGEMENT',
		status: 'PAUSED',
		special_ad_categories: []
	});
	const campaignResult = responseSchema.parse(campaign);

	// Create ad set
	const adSet = await account.createAdSet(['id', 'name', 'status'], {
		campaign_id: campaignResult.id,
		name: `${params.name} Ad Set`,
		optimization_goal: 'POST_ENGAGEMENT',
		billing_event: 'IMPRESSIONS',
		bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
		daily_budget: (Number(params.dailyBudget) * 100).toString(), // Convert to cents
		targeting: {
			age_min: 18,
			age_max: 65,
			genders: [1, 2],
			geo_locations: {
				countries: ['US']
			}
		},
		status: 'PAUSED'
	});
	const adSetResult = responseSchema.parse(adSet);

	// Create ad creative
	const creative = await account.createAdCreative(['id', 'name'], {
		object_story_id: params.postId
	});
	const creativeResult = responseSchema.parse(creative);

	// Create ad
	await account.createAd(['id', 'name', 'status'], {
		name: `${params.name} Ad`,
		adset_id: adSetResult.id,
		creative: { creative_id: creativeResult.id },
		status: 'PAUSED',
		instagram_actor_id: params.instagramAccountId
	});

	return { success: true };
};
