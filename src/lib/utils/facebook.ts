import type { AdAccount, FundingSource } from '$lib/types/facebook';

const FB_API_VERSION = 'v21.0';
const FB_API_BASE_URL = 'https://graph.facebook.com';

const buildFacebookUrl = (path: string, fields: string, accessToken: string): string => {
	return `${FB_API_BASE_URL}/${FB_API_VERSION}${path}?fields=${fields}&access_token=${accessToken}`;
};

const fetchFromFacebook = async <T>(url: string): Promise<T> => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.error('Error fetching data:', await response.text());
			return {} as T;
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error:', error);
		return {} as T;
	}
};

export const fetchAdAccounts = async (accessToken: string): Promise<AdAccount[]> => {
	const url = buildFacebookUrl(
		'/me/adaccounts',
		'id,account_id,name,currency,business_name',
		accessToken
	);
	const response = await fetchFromFacebook<{ data: AdAccount[] }>(url);
	return response.data ?? [];
};

export const fetchFundingSource = async (
	accessToken: string,
	adAccountId: string
): Promise<FundingSource> => {
	const url = buildFacebookUrl(`/${adAccountId}`, 'funding_source_details', accessToken);
	return fetchFromFacebook<FundingSource>(url);
};

interface CreateCampaignParams {
	name: string;
	objective: string;
	status: 'ACTIVE' | 'PAUSED';
}

interface CreateAdSetParams {
	name: string;
	campaignId: string;
	dailyBudget: string;
	targeting: Record<string, unknown>;
	billing_event: 'IMPRESSIONS' | 'LINK_CLICKS';
	bid_strategy: 'LOWEST_COST_WITHOUT_CAP' | 'LOWEST_COST_WITH_BID_CAP';
}

interface CreateAdCreativeParams {
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

interface CreateAdParams {
	name: string;
	adsetId: string;
	creativeId: string;
}

interface FacebookPage {
	id: string;
	name: string;
	access_token: string;
}

export const fetchPages = async (accessToken: string): Promise<FacebookPage[]> => {
	const url = buildFacebookUrl('/me/accounts', 'id,name,access_token', accessToken);
	const response = await fetchFromFacebook<{ data: FacebookPage[] }>(url);
	return response.data ?? [];
};

export const createCampaign = async (
	accessToken: string,
	adAccountId: string,
	params: CreateCampaignParams
) => {
	const url = buildFacebookUrl(`/${adAccountId}/campaigns`, '', accessToken);
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			name: params.name,
			objective: params.objective,
			status: params.status,
			special_ad_categories: '[]'
		}).toString()
	});

	if (!response.ok) {
		throw new Error(`Failed to create campaign: ${await response.text()}`);
	}
	return response.json();
};

export const createAdSet = async (
	accessToken: string,
	adAccountId: string,
	params: CreateAdSetParams
) => {
	const url = buildFacebookUrl(`/${adAccountId}/adsets`, '', accessToken);
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			name: params.name,
			campaign_id: params.campaignId,
			daily_budget: params.dailyBudget,
			billing_event: params.billing_event,
			bid_strategy: params.bid_strategy,
			targeting: JSON.stringify(params.targeting),
			status: 'PAUSED'
		}).toString()
	});

	if (!response.ok) {
		throw new Error(`Failed to create ad set: ${await response.text()}`);
	}
	return response.json();
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

	const requestBody: Record<string, string> = {
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
	};

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(requestBody).toString()
	});

	if (!response.ok) {
		throw new Error(`Failed to create ad creative: ${await response.text()}`);
	}
	return response.json();
};

export const createAd = async (
	accessToken: string,
	adAccountId: string,
	params: CreateAdParams
) => {
	const url = buildFacebookUrl(`/${adAccountId}/ads`, '', accessToken);
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			name: params.name,
			adset_id: params.adsetId,
			creative: JSON.stringify({ creative_id: params.creativeId }),
			status: 'PAUSED'
		}).toString()
	});

	if (!response.ok) {
		throw new Error(`Failed to create ad: ${await response.text()}`);
	}
	return response.json();
};

export const uploadAdImage = async (
	accessToken: string,
	adAccountId: string,
	imageData: string
): Promise<{ hash: string }> => {
	const url = buildFacebookUrl(`/${adAccountId}/adimages`, '', accessToken);
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			bytes: imageData
		}).toString()
	});

	if (!response.ok) {
		throw new Error(`Failed to upload image: ${await response.text()}`);
	}
	const data = await response.json();
	return { hash: data.images?.bytes?.hash };
};
