<script lang="ts">
	import { TabGroup, TabAnchor } from '@skeletonlabs/skeleton';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<TabGroup>
	<TabAnchor href="/campaign/create/{page.params.slug}/new-post">
		<span>Create New Post</span>
	</TabAnchor>
	<TabAnchor href="/campaign/create/{page.params.slug}/existing-post">
		<span>Use Existing Post</span>
	</TabAnchor>
</TabGroup>

<div class="mt-4">
	{@render children()}
</div>
