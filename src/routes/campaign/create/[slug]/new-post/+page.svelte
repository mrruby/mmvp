<script lang="ts">
	import CampaignForm from '$lib/components/campaign/CampaignForm.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<CampaignForm {data} />
