<script lang="ts">
	import { enhance } from '$app/forms';

	export let data: {
		adAccountId: string;
		pages: Array<{ id: string; name: string }>;
	};

	let loading = false;
	let error: string | null = null;
	let success = false;
	let imagePreview: string | null = null;

	function handleImageChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		} else {
			imagePreview = null;
		}
	}
</script>

<div class="mx-auto max-w-2xl p-4">
	<h1 class="mb-6 text-2xl font-bold">Utwórz nową kampanię</h1>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			loading = true;
			error = null;
			success = false;

			return async ({ result }) => {
				loading = false;
				if (result.type === 'error') {
					error = result.error.message;
				} else {
					success = true;
					imagePreview = null;
				}
			};
		}}
		class="space-y-4"
	>
		<input type="hidden" name="adAccountId" value={data.adAccountId} />

		<div>
			<label for="campaignName" class="block text-sm font-medium text-gray-700"
				>Nazwa kampanii</label
			>
			<input
				type="text"
				id="campaignName"
				name="campaignName"
				required
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				placeholder="Moja nowa kampania"
			/>
		</div>

		<div>
			<label for="dailyBudget" class="block text-sm font-medium text-gray-700">Dzienny budżet</label
			>
			<input
				type="number"
				id="dailyBudget"
				name="dailyBudget"
				required
				min="1"
				step="1"
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				placeholder="10"
			/>
			<p class="mt-1 text-sm text-gray-500">Wprowadź kwotę w złotych</p>
		</div>

		<div>
			<label for="pageId" class="block text-sm font-medium text-gray-700">Strona na Facebooku</label
			>
			<select
				id="pageId"
				name="pageId"
				required
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
			>
				<option value="">Wybierz stronę</option>
				{#each data.pages as page}
					<option value={page.id}>{page.name}</option>
				{/each}
			</select>
		</div>

		<div>
			<label for="message" class="block text-sm font-medium text-gray-700">Treść reklamy</label>
			<textarea
				id="message"
				name="message"
				required
				rows="3"
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				placeholder="Wprowadź treść swojej reklamy..."
			></textarea>
		</div>

		<div>
			<label for="link" class="block text-sm font-medium text-gray-700">Adres URL docelowy</label>
			<input
				type="url"
				id="link"
				name="link"
				required
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				placeholder="https://twoja-strona.pl"
			/>
		</div>

		<div>
			<label for="image" class="block text-sm font-medium text-gray-700">Zdjęcie reklamy</label>
			<input
				type="file"
				id="image"
				name="image"
				accept="image/*"
				on:change={handleImageChange}
				class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
			/>
			{#if imagePreview}
				<div class="mt-2">
					<img
						src={imagePreview}
						alt="Podgląd reklamy"
						class="h-48 w-auto rounded-lg object-cover shadow-sm"
					/>
				</div>
			{/if}
		</div>

		<button
			type="submit"
			disabled={loading}
			class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
		>
			{loading ? 'Tworzenie kampanii...' : 'Utwórz kampanię'}
		</button>

		{#if error}
			<div class="rounded-md border border-red-200 bg-red-50 p-4">
				<p class="text-sm text-red-600">Wystąpił błąd: {error}</p>
			</div>
		{/if}

		{#if success}
			<div class="rounded-md border border-green-200 bg-green-50 p-4">
				<p class="text-sm text-green-600">Kampania została utworzona pomyślnie!</p>
			</div>
		{/if}
	</form>
</div>
