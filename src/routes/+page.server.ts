import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { fetchAdAccounts, fetchFundingSource } from '$lib/utils/facebook';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	if (!session) {
		throw redirect(303, '/signin');
	}

	const accessToken = session.accessToken;
	if (!accessToken) {
		return {
			session,
			adAccounts: []
		};
	}

	const adAccounts = await fetchAdAccounts(accessToken);
	const accountsWithFunding = await Promise.all(
		adAccounts.map(async (account) => {
			const fundingData = await fetchFundingSource(accessToken, account.id);
			return {
				...account,
				fundingSource: fundingData
			};
		})
	);

	const filteredAccounts = accountsWithFunding.filter(
		(account) => account.fundingSource?.funding_source_details
	);

	return {
		session,
		adAccounts: filteredAccounts
	};
};
