<script lang="ts">
	import { enhance } from '$app/forms';
	import StatusMessage from './StatusMessage.svelte';
	import FormField from './FormField.svelte';

	/**
	 * Props from the server:
	 * data.instagramAccounts:
	 *   an array of { id: string, name: string }
	 */
	let { data } = $props<{
		data: {
			instagramAccounts: Array<{ id: string; name: string }>;
		};
	}>();

	let loading = $state(false);
	let error = $state<string | null>(null);

	// After loading posts from the server
	let posts = $state<
		Array<{
			id: string;
			caption?: string;
			media_type: string;
			media_url?: string;
			thumbnail_url?: string;
			timestamp: string;
		}>
	>([]);

	let selectedInstagramAccount = $state('');
	let selectedPostId = $state('');
</script>

<div class="space-y-4">
	<h2 class="text-xl font-semibold">Create Campaign from Existing Instagram Post</h2>

	{#if error}
		<StatusMessage type="error" message={error} />
	{/if}

	<!-- Step 1: Pick Instagram Account -->
	<div>
		<label for="instagram-account" class="block text-sm font-medium text-gray-700">
			Select Instagram Account
		</label>
		<form
			method="POST"
			action="?/loadPosts"
			use:enhance={() => {
				loading = true;
				error = null;

				return async ({ result }) => {
					console.log('loadPosts');
					loading = false;
					if (result.type === 'error') {
						error = result.error?.message || 'Error loading posts';
						posts = [];
						return;
					}
					if (result.type === 'success') {
						posts = (result.data?.posts as typeof posts) ?? [];
					}
				};
			}}
		>
			<select
				id="instagram-account"
				name="instagramAccountId"
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				onchange={(e) => {
					if (selectedInstagramAccount) {
						console.log('requestSubmit');
						e.currentTarget.form?.requestSubmit();
					}
				}}
				bind:value={selectedInstagramAccount}
				disabled={loading}
				required
			>
				<option value="">-- Choose an Instagram Account --</option>
				{#each data.instagramAccounts as acc}
					<option value={acc.id}>{acc.name}</option>
				{/each}
			</select>
		</form>
	</div>

	<!-- Step 2: If we have posts, let the user pick one + fill out campaign details -->
	{#if posts.length > 0}
		<form
			method="POST"
			action="?/createCampaign"
			use:enhance={() => {
				loading = true;
				error = null;
				return async ({ result }) => {
					loading = false;
					if (result.type === 'error') {
						error = result.error?.message || 'Error creating campaign';
					} else if (result.type === 'success') {
						console.log('Campaign created successfully');
					}
				};
			}}
			class="space-y-6"
		>
			<!-- Hidden field to pass along chosen IG account -->
			<input type="hidden" name="instagramAccountId" value={selectedInstagramAccount} />

			<FormField
				label="Campaign Name"
				name="name"
				id="campaign-name"
				type="text"
				required
				placeholder="My Existing Post Campaign"
			/>

			<FormField
				label="Daily Budget"
				name="dailyBudget"
				id="daily-budget"
				type="number"
				min="1"
				required
				placeholder="10"
				helpText="Daily budget in your account currency"
			/>

			<!-- Post grid radio options -->
			<div class="space-y-2">
				<div class="block text-sm font-medium text-gray-700">Select a Post</div>
				<div class="grid gap-4 md:grid-cols-2">
					{#each posts as post}
						<label
							class="relative block cursor-pointer rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
							for={`post-${post.id}`}
						>
							<input
								type="radio"
								name="postId"
								value={post.id}
								id={`post-${post.id}`}
								class="peer sr-only"
								bind:group={selectedPostId}
								required
							/>
							{#if post.media_url || post.thumbnail_url}
								<img
									src={post.media_url ?? post.thumbnail_url}
									alt="Instagram post"
									class="mb-2 h-48 w-full rounded object-cover"
								/>
							{/if}
							<p class="line-clamp-2 text-sm text-gray-800">
								{post.caption || '(No caption)'}
							</p>
							<p class="mt-1 text-xs text-gray-500">Type: {post.media_type}</p>
							<p class="text-xs text-gray-500">{new Date(post.timestamp).toLocaleString()}</p>
						</label>
					{/each}
				</div>
			</div>

			<button
				type="submit"
				class="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
				disabled={loading}
			>
				{loading ? 'Creating...' : 'Create Campaign'}
			</button>
		</form>
	{:else if selectedInstagramAccount}
		<p class="text-sm text-gray-500">No posts found for this Instagram account.</p>
	{/if}

	{#if loading}
		<p class="text-sm text-gray-500">Loading...</p>
	{/if}
</div>
