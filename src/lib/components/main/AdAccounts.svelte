<script lang="ts">
	import type { AdAccount } from '$lib/types/facebook';
	let { adAccounts }: { adAccounts: AdAccount[] } = $props();
</script>

<div class="mt-6">
	<h2 class="mb-4 text-xl font-semibold">Twoje konta reklamowe</h2>
	{#if adAccounts.length > 0}
		<div class="space-y-4">
			{#each adAccounts as account}
				<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="font-medium text-gray-900">{account.name}</h3>
							<p class="text-sm text-gray-500">ID: {account.account_id}</p>
							{#if account.business_name}
								<p class="text-sm text-gray-500">Firma: {account.business_name}</p>
							{/if}
							<p class="text-sm text-gray-500">Waluta: {account.currency}</p>
						</div>
						<a
							href="/campaign/create/{account.id}"
							class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							Utwórz kampanię
						</a>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-gray-500">Nie znaleziono żadnych kont reklamowych.</p>
	{/if}
</div>
