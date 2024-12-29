<script lang="ts">
	let {
		label,
		id,
		type = 'text',
		name = id,
		required = false,
		placeholder = '',
		min = undefined,
		step = undefined,
		options = undefined,
		helpText = undefined
	} = $props<{
		label: string;
		id: string;
		type?: 'text' | 'number' | 'url' | 'textarea' | 'select';
		name?: string;
		required?: boolean;
		placeholder?: string;
		min?: string | number;
		step?: string | number;
		options?: Array<{ id: string; name: string }>;
		helpText?: string;
	}>();
</script>

<div>
	<label for={id} class="block text-sm font-medium text-gray-700">{label}</label>
	{#if type === 'textarea'}
		<textarea
			{id}
			{name}
			{required}
			{placeholder}
			rows="3"
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
		></textarea>
	{:else if type === 'select' && options}
		<select
			{id}
			{name}
			{required}
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
		>
			<option value="">Wybierz opcję</option>
			{#each options as option}
				<option value={option.id}>{option.name}</option>
			{/each}
		</select>
	{:else}
		<input
			{type}
			{id}
			{name}
			{required}
			{placeholder}
			{min}
			{step}
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
		/>
	{/if}
	{#if helpText}
		<p class="mt-1 text-sm text-gray-500">{helpText}</p>
	{/if}
</div>
