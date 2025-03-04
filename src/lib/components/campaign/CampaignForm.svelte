<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import FormField from './FormField.svelte';
	import ImageUpload from './ImageUpload.svelte';
	import StatusMessage from './StatusMessage.svelte';

	let {
		data
	}: {
		data: {
			adAccountId: string;
			instagramAccounts: Array<{ id: string; name: string }>;
			pages: Array<{ id: string; name: string }>;
		};
	} = $props();

	let loading = $state(false);
	let error = $state<string | null>(null);
	let imagePreview = $state<string | null>(null);
</script>

<div class="mx-auto max-w-2xl p-4">
	<h1 class="mb-6 text-2xl font-bold">Utwórz nową kampanię na Instagram</h1>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			loading = true;
			error = null;

			return async ({ result }) => {
				loading = false;
				if (result.type === 'error') {
					error = result.error.message;
				} else {
					imagePreview = null;
					await goto('/');
				}
			};
		}}
		class="space-y-4"
	>
		<input type="hidden" name="adAccountId" value={data.adAccountId} />

		<FormField
			label="Nazwa kampanii"
			id="campaignName"
			required={true}
			placeholder="Moja nowa kampania na Instagram"
		/>

		<FormField
			label="Dzienny budżet"
			id="dailyBudget"
			type="number"
			required={true}
			min={1}
			step={1}
			placeholder="10"
			helpText="Wprowadź kwotę w złotych"
		/>

		<FormField
			label="Konto na Instagramie"
			id="instagramAccountId"
			type="select"
			required={true}
			options={data.instagramAccounts}
			helpText="Wybierz konto na Instagramie, które będzie używane do reklamy"
		/>

		<FormField
			label="Strona na Facebooku"
			id="pageId"
			type="select"
			required={true}
			options={data.pages}
			helpText="Wybierz stronę na Facebooku, która będzie używana do reklamy"
		/>

		<FormField
			label="Treść reklamy"
			id="message"
			type="textarea"
			required={true}
			placeholder="Wprowadź treść swojej reklamy..."
		/>

		<ImageUpload bind:imagePreview />

		<button
			type="submit"
			disabled={loading}
			class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
		>
			{loading ? 'Tworzenie kampanii...' : 'Utwórz kampanię'}
		</button>

		{#if error}
			<StatusMessage type="error" message={error} />
		{/if}
	</form>
</div>
