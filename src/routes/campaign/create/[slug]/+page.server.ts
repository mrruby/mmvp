import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { fetchPages } from '$lib/utils/facebook';
import { createFullCampaign, validateCampaignData } from '$lib/utils/campaign';

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session?.accessToken) {
		throw redirect(303, '/signin');
	}

	const adAccountId = params.slug;

	if (!adAccountId) {
		throw error(400, 'Brak ID konta reklamowego');
	}

	const pages = await fetchPages(session.accessToken);
	return { adAccountId, pages };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.accessToken) {
			throw redirect(303, '/signin');
		}

		const formData = await request.formData();
		const campaignData = {
			adAccountId: formData.get('adAccountId')?.toString(),
			campaignName: formData.get('campaignName')?.toString(),
			dailyBudget: formData.get('dailyBudget')?.toString(),
			pageId: formData.get('pageId')?.toString(),
			message: formData.get('message')?.toString(),
			link: formData.get('link')?.toString(),
			imageFile: formData.get('image') as File | null,
			accessToken: session.accessToken
		};

		if (!validateCampaignData(campaignData)) {
			throw error(400, 'Brakujące wymagane pola');
		}

		try {
			await createFullCampaign(campaignData);
			return { success: true };
		} catch (err) {
			console.error('Błąd podczas tworzenia kampanii:', err);
			throw error(500, 'Nie udało się utworzyć kampanii');
		}
	}
};
