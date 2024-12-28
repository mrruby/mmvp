import { buildFacebookUrl, postToFacebook } from './client';

export interface CreateCampaignParams {
	name: string;
	objective: string;
	status: 'ACTIVE' | 'PAUSED';
}

export interface CreateAdSetParams {
	name: string;
	campaignId: string;
	dailyBudget: string;
	targeting: Record<string, unknown>;
	billing_event: 'IMPRESSIONS' | 'LINK_CLICKS';
	bid_strategy: 'LOWEST_COST_WITHOUT_CAP' | 'LOWEST_COST_WITH_BID_CAP';
}

export interface CreateAdCreativeParams {
	name: string;
	pageId: string;
	message: string;
	link: string;
	imageHash?: string;
	call_to_action?: {
		type: string;
		value: {
			link: string;
			[key: string]: string;
		};
	};
	enroll_status?: 'OPT_OUT' | 'OPT_IN';
}

export interface CreateAdParams {
	name: string;
	adsetId: string;
	creativeId: string;
}

export const createCampaign = async (
	accessToken: string,
	adAccountId: string,
	params: CreateCampaignParams
) => {
	const url = buildFacebookUrl(`/${adAccountId}/campaigns`, '', accessToken);
	return postToFacebook(url, {
		name: params.name,
		objective: params.objective,
		status: params.status,
		special_ad_categories: '[]'
	});
};

export const createAdSet = async (
	accessToken: string,
	adAccountId: string,
	params: CreateAdSetParams
) => {
	const url = buildFacebookUrl(`/${adAccountId}/adsets`, '', accessToken);
	return postToFacebook(url, {
		name: params.name,
		campaign_id: params.campaignId,
		daily_budget: params.dailyBudget,
		billing_event: params.billing_event,
		bid_strategy: params.bid_strategy,
		targeting: JSON.stringify(params.targeting),
		status: 'PAUSED'
	});
};

export const createAdCreative = async (
	accessToken: string,
	adAccountId: string,
	params: CreateAdCreativeParams
) => {
	const url = buildFacebookUrl(`/${adAccountId}/adcreatives`, '', accessToken);
	const linkData: Record<string, unknown> = {
		message: params.message,
		link: params.link
	};

	if (params.imageHash) {
		linkData.image_hash = params.imageHash;
	}

	if (params.call_to_action) {
		linkData.call_to_action = params.call_to_action;
	}

	return postToFacebook(url, {
		name: params.name,
		object_story_spec: JSON.stringify({
			page_id: params.pageId,
			link_data: linkData
		}),
		degrees_of_freedom_spec: JSON.stringify({
			creative_features_spec: {
				standard_enhancements: {
					enroll_status: params.enroll_status || 'OPT_OUT'
				}
			}
		})
	});
};

export const createAd = async (
	accessToken: string,
	adAccountId: string,
	params: CreateAdParams
) => {
	const url = buildFacebookUrl(`/${adAccountId}/ads`, '', accessToken);
	return postToFacebook(url, {
		name: params.name,
		adset_id: params.adsetId,
		creative: JSON.stringify({ creative_id: params.creativeId }),
		status: 'PAUSED'
	});
};
