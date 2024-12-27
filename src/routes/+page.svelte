<script lang="ts">
	import { SignOut } from '@auth/sveltekit/components';
	import { page } from '$app/state';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<div class="rounded-lg bg-white p-8 shadow-md">
		{#if page.data.session}
			<div class="text-center">
				{#if page.data.session.user?.image}
					<img
						src={page.data.session.user.image}
						class="mx-auto mb-4 h-16 w-16 rounded-full"
						alt="User Avatar"
					/>
				{/if}
				<span class="mb-4 block">
					<small class="text-gray-500">Signed in as</small><br />
					<strong>{page.data.session.user?.name ?? 'User'}</strong>
				</span>

				<div class="mb-4">
					<h2 class="mb-2 text-xl font-bold">Your Facebook Pages</h2>
					{#if page.data.pages.length > 0}
						<ul class="space-y-2">
							{#each page.data.pages as fbPage}
								<li class="rounded bg-gray-50 p-2">
									{fbPage.name}
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-gray-500">No pages found</p>
					{/if}
				</div>

				<SignOut>
					<div
						slot="submitButton"
						class="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
					>
						Sign out
					</div>
				</SignOut>
			</div>
		{/if}
	</div>
</div>
