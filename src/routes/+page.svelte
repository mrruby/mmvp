<script lang="ts">
	import { SignOut, SignIn } from '@auth/sveltekit/components';
	import UserProfile from '$lib/components/UserProfile.svelte';
	import AdAccounts from '$lib/components/AdAccounts.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<div class="rounded-lg bg-white p-8 shadow-md">
		{#if data.session}
			<UserProfile user={data.session.user} />

			<AdAccounts adAccounts={data.adAccounts} />

			<div class="mb-4 mt-4 text-center">
				<p class="mb-3 text-gray-600">
					Can't see your ad accounts? You may need to relogin with additional permissions.
				</p>
				<SignIn provider="facebook">
					<div
						slot="submitButton"
						class="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
					>
						Relogin with full access
					</div>
				</SignIn>
			</div>

			<div class="mt-6">
				<SignOut>
					<div
						slot="submitButton"
						class="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
					>
						Sign out
					</div>
				</SignOut>
			</div>
		{/if}
	</div>
</div>
