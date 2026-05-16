<script lang="ts">
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Login — skillgência</title></svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="w-full max-w-sm bg-white rounded-2xl shadow p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">skillgência</h1>

    {#if form?.error}
      <p class="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        {form.error}
      </p>
    {/if}

    <form method="POST" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
      >
        Entrar
      </button>
    </form>
  </div>
</div>
