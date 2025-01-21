<script lang="ts">
	import ExistingPostCampaignForm from '$lib/components/campaign/ExistingPostCampaignForm.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<ExistingPostCampaignForm {data} />
