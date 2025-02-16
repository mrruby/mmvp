import { error } from '@sveltejs/kit';
import { fetchInstagramAccounts, fetchInstagramMedia } from '$lib/utils/facebook/accounts';
import { createExistingPostCampaign } from '$lib/utils/facebook/ads';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	try {
		// Fetch Instagram accounts
		const instagramAccounts = await fetchInstagramAccounts(event);

		return {
			instagramAccounts
		};
	} catch (e) {
		console.error('Error loading Instagram accounts:', e);
		throw error(500, 'Failed to load Instagram accounts');
	}
};

export const actions: Actions = {
	// 1) Action that loads posts for the selected Instagram account
	loadPosts: async (event) => {
		try {
			console.log('loadPosts');
			const data = await event.request.formData();
			const instagramAccountId = data.get('instagramAccountId')?.toString();

			if (!instagramAccountId) {
				throw error(400, 'Missing Instagram account ID');
			}

			// Fetch that account's posts
			const posts = await fetchInstagramMedia(event, instagramAccountId);

			return {
				success: true,
				posts
			};
		} catch (e) {
			console.error('Error loading posts:', e);
			throw error(500, e instanceof Error ? e.message : 'Failed to load Instagram posts');
		}
	},

	// 2) Action that creates the campaign from an existing post
	createCampaign: async (event) => {
		try {
			const data = await event.request.formData();
			const name = data.get('name')?.toString();
			const dailyBudget = data.get('dailyBudget')?.toString();
			const postId = data.get('postId')?.toString();
			const instagramAccountId = data.get('instagramAccountId')?.toString();

			if (!name || !dailyBudget || !postId || !instagramAccountId) {
				throw error(400, 'Missing required fields');
			}

			const adAccountId = event.params.slug;
			if (!adAccountId) {
				throw error(400, 'Missing ad account ID');
			}

			await createExistingPostCampaign(event, adAccountId, {
				name,
				dailyBudget,
				postId,
				instagramAccountId
			});

			return {
				success: true,
				message: 'Campaign created successfully'
			};
		} catch (e) {
			console.error('Error creating campaign:', e);
			throw error(500, e instanceof Error ? e.message : 'Failed to create campaign');
		}
	}
};
