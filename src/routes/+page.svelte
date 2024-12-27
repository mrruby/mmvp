<script lang="ts">
	import { SignIn, SignOut } from '@auth/sveltekit/components';
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
				<SignOut>
					<div
						slot="submitButton"
						class="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
					>
						Sign out
					</div>
				</SignOut>
			</div>
		{:else}
			<div class="text-center">
				<h1 class="mb-6 text-2xl font-bold">Welcome</h1>
				<div class="space-y-4">
					<SignIn provider="facebook">
						<div
							slot="submitButton"
							class="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Sign in with Facebook
						</div>
					</SignIn>
				</div>
			</div>
		{/if}
	</div>
</div>
