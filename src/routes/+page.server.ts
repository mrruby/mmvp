import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { fetchAdAccounts, fetchFundingSource } from '$lib/utils/facebook';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session) {
		throw redirect(303, '/signin');
	}

	if (!event.locals.facebook) {
		return {
			session,
			adAccounts: []
		};
	}

	const adAccounts = await fetchAdAccounts(event);
	const accountsWithFunding = await Promise.all(
		adAccounts.map(async (account) => {
			const fundingData = await fetchFundingSource(event, account.id);
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
