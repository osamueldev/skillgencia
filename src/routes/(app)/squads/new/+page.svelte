<script lang="ts">
  import type { ActionData, PageData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Novo Squad — skillgência</title></svelte:head>

<div class="p-8 max-w-xl">
  <div class="flex items-center gap-3 mb-8">
    <a href="/squads" class="text-gray-400 hover:text-gray-600 text-sm">← Squads</a>
    <span class="text-gray-300">/</span>
    <h1 class="text-2xl font-bold text-gray-900">Novo Squad</h1>
  </div>

  {#if form?.error}
    <p class="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{form.error}</p>
  {/if}

  <form method="POST" class="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome do Squad</label>
      <input
        id="name" name="name" type="text" required
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Ex: Gerador de Conteúdo Instagram"
      />
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
      <textarea
        id="description" name="description" rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="O que esse squad faz..."
      ></textarea>
    </div>

    <div>
      <label for="client" class="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
      <select id="client" name="client" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="">— Nenhum (squad global) —</option>
        {#each data.clients as client}
          <option value={client.id}>{client.name}</option>
        {/each}
      </select>
    </div>

    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
      Criar Squad
    </button>
  </form>
</div>
