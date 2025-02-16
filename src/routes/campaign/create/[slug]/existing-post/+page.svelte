<script lang="ts">
	import ExistingPostCampaignForm from '$lib/components/campaign/ExistingPostCampaignForm.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<ExistingPostCampaignForm {data} />
