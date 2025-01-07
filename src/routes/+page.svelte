<script lang="ts">
	import { SignOut, SignIn } from '@auth/sveltekit/components';
	import UserProfile from '$lib/components/main/UserProfile.svelte';
	import AdAccounts from '$lib/components/main/AdAccounts.svelte';
	import Campaigns from '$lib/components/main/Campaigns.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<div class="rounded-lg bg-white p-8 shadow-md">
		{#if data.session}
			<UserProfile user={data.session.user} />

			<AdAccounts adAccounts={data.adAccounts} />

			{#each data.adAccounts as account}
				<Campaigns campaigns={account.campaigns} adAccountId={account.id} />
			{/each}

			<div class="mx-auto mb-4 mt-4 max-w-md text-center">
				<p class="mb-3 text-gray-600">
					Nie widzisz swoich kont reklamowych? Możesz potrzebować zalogowania się z dodatkowymi
					uprawnieniami.
				</p>
				<p class="mb-2 text-sm text-gray-500">Dodaj dodatkowe uprawnienia do swojego konta:</p>
				<SignIn provider="facebook">
					<div
						slot="submitButton"
						class="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
					>
						Zaloguj się jeszcze raz
					</div>
				</SignIn>
			</div>

			<div class="mt-6">
				<SignOut>
					<div
						slot="submitButton"
						class="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
					>
						Wyloguj się
					</div>
				</SignOut>
			</div>
		{/if}
	</div>
</div>
