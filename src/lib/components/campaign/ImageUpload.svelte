<script lang="ts">
	let { imagePreview = $bindable(null) } = $props<{ imagePreview?: string | null }>();

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

<div>
	<label for="image" class="block text-sm font-medium text-gray-700">Zdjęcie reklamy</label>
	<input
		type="file"
		id="image"
		name="image"
		accept="image/*"
		onchange={handleImageChange}
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
