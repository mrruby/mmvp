<script lang="ts">
	let { type, message = null }: { type: 'error' | 'success'; message: string | null } = $props();
</script>

{#if message}
	<div
		class="rounded-md border p-4"
		class:border-red-200={type === 'error'}
		class:bg-red-50={type === 'error'}
	>
		<p class="text-sm" class:text-red-600={type === 'error'}>
			{#if type === 'error'}
				Wystąpił błąd: {message}
			{:else}
				{message}
			{/if}
		</p>
	</div>
{/if}
