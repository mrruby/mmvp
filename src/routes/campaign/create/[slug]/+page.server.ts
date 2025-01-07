import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { fetchInstagramAccounts, fetchPages } from '$lib/utils/facebook';
import { createFullCampaign, validateCampaignData } from '$lib/utils/campaign';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.accessToken) {
		throw redirect(303, '/signin');
	}

	const adAccountId = event.params.slug;

	if (!adAccountId) {
		throw error(400, 'Brak ID konta reklamowego');
	}

	const pages = await fetchPages(event);

	const instagramAccounts = await fetchInstagramAccounts(event);
	return { adAccountId, pages, instagramAccounts };
};

export const actions: Actions = {
	default: async (event) => {
		const session = await event.locals.auth();
		if (!session?.accessToken) {
			throw redirect(303, '/signin');
		}

		const formData = await event.request.formData();
		const instagramAccountId = formData.get('instagramAccountId')?.toString();

		// Get Instagram accounts to find username
		const instagramAccounts = await fetchInstagramAccounts(event);
		const instagramAccount = instagramAccounts.find((account) => account.id === instagramAccountId);

		const campaignData = {
			adAccountId: formData.get('adAccountId')?.toString(),
			campaignName: formData.get('campaignName')?.toString(),
			dailyBudget: formData.get('dailyBudget')?.toString(),
			pageId: formData.get('pageId')?.toString(),
			instagramAccountId,
			instagramUsername: instagramAccount?.name,
			message: formData.get('message')?.toString(),
			imageFile: formData.get('image') as File | null
		};

		if (!validateCampaignData(campaignData)) {
			throw error(400, 'Brakujące wymagane pola');
		}

		try {
			// await createFullCampaign(event, campaignData);
			return { success: true };
		} catch (err) {
			console.error('Błąd podczas tworzenia kampanii:', err);
			throw error(500, 'Nie udało się utworzyć kampanii');
		}
	}
};
