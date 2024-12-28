import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
	fetchPages,
	createCampaign,
	createAdSet,
	createAdCreative,
	createAd,
	uploadAdImage
} from '$lib/utils/facebook';

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
		const adAccountId = formData.get('adAccountId')?.toString();
		const campaignName = formData.get('campaignName')?.toString();
		const dailyBudget = formData.get('dailyBudget')?.toString();
		const pageId = formData.get('pageId')?.toString();
		const message = formData.get('message')?.toString();
		const link = formData.get('link')?.toString();
		const imageFile = formData.get('image') as File | null;

		if (!adAccountId || !campaignName || !dailyBudget || !pageId || !message || !link) {
			throw error(400, 'Brakujące wymagane pola');
		}

		try {
			// Create campaign
			const campaign = await createCampaign(session.accessToken, adAccountId, {
				name: campaignName,
				objective: 'OUTCOME_TRAFFIC',
				status: 'PAUSED'
			});

			// Create ad set
			const adSet = await createAdSet(session.accessToken, adAccountId, {
				name: `${campaignName} - Zestaw reklam`,
				campaignId: campaign.id,
				dailyBudget: (parseFloat(dailyBudget) * 100).toString(), // Convert to cents
				targeting: {
					geo_locations: { countries: ['PL'] }
				},
				billing_event: 'IMPRESSIONS',
				bid_strategy: 'LOWEST_COST_WITHOUT_CAP'
			});

			// Handle image upload if provided
			let imageHash: string | undefined;
			if (imageFile && imageFile.size > 0) {
				const imageBuffer = await imageFile.arrayBuffer();
				const base64Image = btoa(
					new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
				);
				const uploadResult = await uploadAdImage(session.accessToken, adAccountId, base64Image);
				imageHash = uploadResult.hash;
			}

			// Create ad creative
			const creative = await createAdCreative(session.accessToken, adAccountId, {
				name: `${campaignName} - Kreacja`,
				pageId,
				message,
				link,
				imageHash
			});

			// Create ad
			await createAd(session.accessToken, adAccountId, {
				name: `${campaignName} - Reklama`,
				adsetId: adSet.id,
				creativeId: creative.id
			});

			return { success: true };
		} catch (err) {
			console.error('Błąd podczas tworzenia kampanii:', err);
			throw error(500, 'Nie udało się utworzyć kampanii');
		}
	}
};
