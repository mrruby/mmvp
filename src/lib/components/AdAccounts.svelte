<script lang="ts">
	import type { AdAccount } from '$lib/types/facebook';

	let { adAccounts }: { adAccounts: AdAccount[] } = $props();
</script>

{#if adAccounts.length > 0}
	<div class="mt-6">
		<h2 class="mb-4 text-xl font-semibold">Ad Accounts</h2>
		<div class="space-y-3">
			{#each adAccounts as account}
				<div class="rounded-md border border-gray-200 p-4">
					<div class="font-medium">{account.name}</div>
					<div class="text-sm text-gray-600">
						ID: {account.account_id}
						{#if account.business_name}
							· Business: {account.business_name}
						{/if}
						· {account.currency}
					</div>
					<div class="mt-2 text-sm">
						{#if account.fundingSource?.funding_source_details}
							<div class="flex items-center gap-2">
								<span class="font-medium">Funding Source:</span>
								<span>{account.fundingSource.funding_source_details.display_string}</span>
								<span
									class="rounded-full px-2 py-0.5 text-xs {account.fundingSource
										.funding_source_details.status === 'active'
										? 'bg-green-100 text-green-800'
										: 'bg-red-100 text-red-800'}"
								>
									{account.fundingSource.funding_source_details.status}
								</span>
							</div>
						{:else}
							<div class="text-gray-400">No funding source available</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="mt-6 text-gray-600">No ad accounts found</div>
{/if}
