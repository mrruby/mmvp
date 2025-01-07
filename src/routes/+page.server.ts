import type { PageServerLoad, Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import {
	fetchAdAccounts,
	fetchFundingSource,
	fetchCampaigns,
	deleteCampaign
} from '$lib/utils/facebook';

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
				...fundingData
			};
		})
	);

	const filteredAccounts = await Promise.all(
		accountsWithFunding
			.filter((account) => account.funding_source_details)
			.map(async (account) => {
				const campaigns = await fetchCampaigns(event, account.id);
				return {
					...account,
					campaigns
				};
			})
	);

	return {
		session,
		adAccounts: filteredAccounts
	};
};

export const actions: Actions = {
	deleteCampaign: async (event) => {
		const session = await event.locals.auth();
		if (!session?.accessToken) {
			throw redirect(303, '/signin');
		}

		const formData = await event.request.formData();
		const campaignId = formData.get('campaignId')?.toString();
		const adAccountId = formData.get('adAccountId')?.toString();

		if (!campaignId || !adAccountId) {
			throw error(400, 'Missing campaign ID or ad account ID');
		}

		try {
			await deleteCampaign(event, campaignId);
			return { success: true };
		} catch (err) {
			console.error('Error deleting campaign:', err);
			throw error(500, 'Failed to delete campaign');
		}
	}
};
