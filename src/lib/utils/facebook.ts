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
