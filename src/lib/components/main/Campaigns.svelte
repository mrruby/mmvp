<script lang="ts">
	import type { CampaignList } from '$lib/schemas';
	import { enhance } from '$app/forms';

	let { campaigns, adAccountId }: { campaigns: CampaignList['data']; adAccountId: string } =
		$props();

	function translateStatus(status: string): string {
		const translations: Record<string, string> = {
			ACTIVE: 'Aktywna',
			PAUSED: 'Wstrzymana',
			DELETED: 'Usunięta',
			ARCHIVED: 'Zarchiwizowana'
		};
		return translations[status] ?? status;
	}
</script>

<div class="mt-8">
	<h2 class="mb-4 text-xl font-semibold">Twoje kampanie</h2>
	{#if campaigns.length > 0}
		<div class="space-y-4">
			{#each campaigns as campaign}
				<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<div class="flex items-start justify-between">
						<div class="flex items-start space-x-4">
							{#if campaign.ads?.data[0]?.creative?.image_url || campaign.ads?.data[0]?.creative?.thumbnail_url}
								<img
									src={campaign.ads.data[0].creative.image_url ??
										campaign.ads.data[0].creative.thumbnail_url}
									alt={campaign.name}
									class="h-24 w-24 rounded-lg object-cover"
								/>
							{/if}
							<div>
								<h3 class="font-medium text-gray-900">
									{campaign.name}
								</h3>
								<div class="mt-1 flex items-center space-x-4">
									<span
										class="group relative inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
										class:bg-green-100={campaign.status === 'ACTIVE'}
										class:text-green-800={campaign.status === 'ACTIVE'}
										class:bg-yellow-100={campaign.status === 'PAUSED'}
										class:text-yellow-800={campaign.status === 'PAUSED'}
										class:bg-red-100={campaign.status === 'DELETED' ||
											campaign.status === 'ARCHIVED'}
										class:text-red-800={campaign.status === 'DELETED' ||
											campaign.status === 'ARCHIVED'}
									>
										{translateStatus(campaign.status)}
										{#if campaign.status === 'PAUSED'}
											<span
												class="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded bg-gray-900 p-2 text-xs text-white group-hover:block"
											>
												Kampania może być wstrzymana zaraz po utworzeniu. Przechodzi wtedy przez
												proces weryfikacji Meta.
											</span>
										{/if}
									</span>
								</div>
							</div>
						</div>
						<form
							action="?/deleteCampaign"
							method="POST"
							use:enhance
							class="flex items-center space-x-2"
						>
							<input type="hidden" name="campaignId" value={campaign.id} />
							<input type="hidden" name="adAccountId" value={adAccountId} />
							<button
								type="submit"
								class="rounded bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
							>
								Usuń
							</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-gray-500">Nie masz jeszcze żadnych kampanii.</p>
	{/if}
</div>
