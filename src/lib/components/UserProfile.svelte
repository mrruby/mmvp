<script lang="ts">
	import type { User } from '@auth/core/types';

	let { user }: { user: User | undefined } = $props();
</script>

<div class="text-center">
	{#if user?.image}
		<img src={user.image} class="mx-auto mb-4 h-16 w-16 rounded-full" alt="User Avatar" />
	{/if}
	<span class="mb-4 block">
		<small class="text-gray-500">Signed in as</small><br />
		<strong>{user?.name ?? 'User'}</strong>
	</span>
</div>
