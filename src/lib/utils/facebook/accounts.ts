import type { AdAccount, FundingSource } from '$lib/types/facebook';
import { buildFacebookUrl, fetchFromFacebook } from './client';

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

export interface FacebookPage {
	id: string;
	name: string;
	access_token: string;
}

export const fetchPages = async (accessToken: string): Promise<FacebookPage[]> => {
	const url = buildFacebookUrl('/me/accounts', 'id,name,access_token', accessToken);
	const response = await fetchFromFacebook<{ data: FacebookPage[] }>(url);
	return response.data ?? [];
};
