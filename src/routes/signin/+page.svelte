<script lang="ts">
	import { SignIn } from '@auth/sveltekit/components';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<div class="rounded-lg bg-white p-8 shadow-md">
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
	</div>
</div>
