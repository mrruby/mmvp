import { error } from '@sveltejs/kit';
import {
	fetchPages,
	getPageInstagramAccount,
	fetchInstagramMedia,
	fetchInstagramAccounts,
	getInstagramConnectedPage
} from '$lib/utils/facebook/accounts';
import type { PageServerLoad } from './$types';
import type {
	FacebookPageWithInstagram,
	InstagramAccountDetails,
	InstagramPost
} from '$lib/schemas/facebook';

function checkInstagramConnection(
	page: FacebookPageWithInstagram,
	instagramAccounts: InstagramAccountDetails[]
): InstagramAccountDetails | null {
	if (!page.instagramAccountId) return null;
	return instagramAccounts.find((acc) => acc.id === page.instagramAccountId) ?? null;
}

export const load: PageServerLoad = async (event) => {
	try {
		// Fetch available Facebook pages and Instagram accounts
		const [pages, instagramAccounts] = await Promise.all([
			fetchPages(event),
			fetchInstagramAccounts(event)
		]);

		// Get details for each Instagram account
		const instagramConnections = await Promise.all(
			instagramAccounts.map(async (acc) => {
				try {
					const details = await getInstagramConnectedPage(event, acc.id);
					return {
						...acc,
						username: details.username,
						profilePicture: details.profile_picture_url
					};
				} catch (e) {
					console.error(`Failed to get details for Instagram account ${acc.id}:`, e);
					return acc;
				}
			})
		);

		// Transform pages data and validate Instagram connections
		const transformedPages: FacebookPageWithInstagram[] = pages.map((page) => ({
			id: page.id,
			name: page.name,
			hasInstagram: !!page.instagram_business_account,
			instagramAccountId: page.instagram_business_account?.id
		}));

		// Return pages with their Instagram connection status
		return {
			pages: transformedPages,
			instagramAccounts: instagramConnections as InstagramAccountDetails[],
			hasInstagramPages: transformedPages.some(
				(page) =>
					page.hasInstagram &&
					checkInstagramConnection(page, instagramConnections as InstagramAccountDetails[])
			)
		};
	} catch (e) {
		console.error('Error loading Facebook pages:', e);
		throw error(500, 'Failed to load Facebook pages');
	}
};

export const actions = {
	loadPosts: async (event) => {
		try {
			const data = await event.request.formData();
			const pageId = data.get('pageId')?.toString();

			if (!pageId) {
				throw error(400, 'Page ID is required');
			}

			// Get Instagram account connected to the page
			const instagramAccount = await getPageInstagramAccount(event, pageId);

			if (!instagramAccount) {
				throw error(400, 'Selected page has no Instagram account connected');
			}

			// Get Instagram account details
			const instagramDetails = await getInstagramConnectedPage(event, instagramAccount.id);

			// Fetch Instagram posts
			const posts = await fetchInstagramMedia(event, instagramAccount.id);

			return {
				success: true,
				posts: posts as InstagramPost[],
				instagramAccountId: instagramAccount.id,
				instagramUsername: instagramDetails.username,
				instagramDetails: {
					id: instagramAccount.id,
					name: instagramDetails.name || instagramDetails.username,
					username: instagramDetails.username,
					profilePicture: instagramDetails.profile_picture_url
				} as InstagramAccountDetails
			};
		} catch (e) {
			console.error('Error loading Instagram posts:', e);
			throw error(500, e instanceof Error ? e.message : 'Failed to load Instagram posts');
		}
	},

	createCampaign: async (event) => {
		try {
			const data = await event.request.formData();
			const name = data.get('name')?.toString();
			const dailyBudget = data.get('dailyBudget')?.toString();
			const postId = data.get('postId')?.toString();

			if (!name || !dailyBudget || !postId) {
				throw error(400, 'Missing required fields');
			}

			// TODO: Add campaign creation logic here

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
