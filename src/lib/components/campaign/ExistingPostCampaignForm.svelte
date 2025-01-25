<script lang="ts">
	import FormField from './FormField.svelte';
	import StatusMessage from './StatusMessage.svelte';
	import { enhance } from '$app/forms';
	import type {
		InstagramPost,
		FacebookPageWithInstagram,
		InstagramAccountDetails
	} from '$lib/schemas/facebook';

	type Props = {
		data: {
			pages: FacebookPageWithInstagram[];
			instagramAccounts: InstagramAccountDetails[];
			hasInstagramPages: boolean;
		};
	};

	let { data }: Props = $props();

	let loading = $state(false);
	let error = $state<string | null>(null);
	let posts = $state<InstagramPost[]>([]);
	let selectedPageId = $state<string | null>(null);
	let showPostSelector = $state(false);
	let selectedPageInstagram = $state<InstagramAccountDetails | null>(null);

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString();
	}

	async function handlePageSelection(event: Event) {
		const select = event.target as HTMLSelectElement;
		selectedPageId = select.value;
		selectedPageInstagram = null;

		if (!selectedPageId) {
			showPostSelector = false;
			posts = [];
			return;
		}

		loading = true;
		error = null;
		showPostSelector = false;
		posts = [];

		try {
			const formData = new FormData();
			formData.append('pageId', selectedPageId);

			const response = await fetch('?/loadPosts', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.error) {
				throw new Error(result.error);
			}

			selectedPageInstagram = result.instagramDetails;
			posts = result.posts;
			showPostSelector = true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load Instagram posts';
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-4">
	<h2 class="h2">Create Campaign from Existing Instagram Post</h2>

	{#if error}
		<StatusMessage type="error" message={error} />
	{/if}

	{#if !data.hasInstagramPages}
		<div class="space-y-2 rounded-md border border-yellow-200 bg-yellow-50 p-4">
			<div class="text-sm text-yellow-700">
				None of your Facebook pages have Instagram accounts connected. To use existing posts, you
				need to:
			</div>
			<ol class="list-decimal pl-5 text-sm text-yellow-700">
				<li>Go to your Facebook Business Settings</li>
				<li>Connect your Instagram account to one of your Facebook pages</li>
				<li>Make sure the Instagram account is a Business or Creator account</li>
			</ol>
		</div>
	{/if}

	<div class="space-y-4">
		<label for="page-select" class="block text-sm font-medium text-gray-700">
			Select Facebook Page
		</label>
		<select
			id="page-select"
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
			onchange={handlePageSelection}
			disabled={loading}
		>
			<option value="">Select a page...</option>
			{#each data.pages as page}
				<option value={page.id} disabled={!page.hasInstagram}>
					{page.name}
					{#if !page.hasInstagram}
						(No Instagram)
					{/if}
				</option>
			{/each}
		</select>

		{#if selectedPageId && !error}
			<div class="mt-2">
				{#if selectedPageInstagram}
					<div class="flex items-center space-x-2">
						{#if selectedPageInstagram.profilePicture}
							<img
								src={selectedPageInstagram.profilePicture}
								alt="Instagram profile"
								class="h-6 w-6 rounded-full"
							/>
						{/if}
						<p class="text-sm text-green-600">
							✓ Connected to Instagram account: @{selectedPageInstagram.username ||
								selectedPageInstagram.name}
						</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if loading}
		<div class="text-center">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
			></div>
			<p class="mt-2 text-sm text-gray-600">Loading posts...</p>
		</div>
	{/if}

	{#if showPostSelector && posts.length > 0}
		<form
			method="POST"
			action="?/createCampaign"
			use:enhance={() => {
				loading = true;
				error = null;

				return async ({ result }) => {
					loading = false;
					if (result.type === 'error') {
						error = result.error.message;
					}
				};
			}}
			class="space-y-6"
		>
			<FormField label="Campaign Name" name="name" type="text" required id="campaign-name" />
			<FormField
				label="Daily Budget (USD)"
				name="dailyBudget"
				type="number"
				min="1"
				required
				id="daily-budget"
			/>

			<div class="space-y-4">
				<label for="posts-container" class="block text-sm font-medium text-gray-700"
					>Select an Instagram Post</label
				>
				<div
					id="posts-container"
					class="grid gap-4 md:grid-cols-2"
					role="radiogroup"
					aria-labelledby="posts-label"
				>
					{#each posts as post}
						<label class="relative block cursor-pointer">
							<input type="radio" name="postId" value={post.id} class="peer sr-only" required />
							<div
								class="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:ring-1 peer-checked:ring-blue-500"
							>
								{#if post.media_url || post.thumbnail_url}
									<img
										src={post.media_url ?? post.thumbnail_url}
										alt="Post preview"
										class="mb-2 h-48 w-full rounded object-cover"
									/>
								{/if}
								<p class="mb-1 text-sm text-gray-500">
									{formatDate(post.timestamp)}
								</p>
								<p class="text-sm text-gray-700">
									{post.caption || 'No caption'}
								</p>
								<p class="mt-1 text-xs text-gray-500">
									Type: {post.media_type}
								</p>
							</div>
						</label>
					{/each}
				</div>
			</div>

			{#if selectedPageInstagram}
				<input type="hidden" name="instagramAccountId" value={selectedPageInstagram.id} />
			{/if}

			<button
				type="submit"
				class="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
				disabled={loading}
			>
				{loading ? 'Creating Campaign...' : 'Create Campaign'}
			</button>
		</form>
	{:else if showPostSelector}
		<p>No Instagram posts found for this account.</p>
	{/if}
</div>
