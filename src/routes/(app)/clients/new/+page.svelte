<script lang="ts">
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();

  let name = $state('');
  let slug = $derived(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
</script>

<svelte:head><title>Novo Cliente — skillgência</title></svelte:head>

<div class="p-8 max-w-xl">
  <div class="flex items-center gap-3 mb-8">
    <a href="/clients" class="text-gray-400 hover:text-gray-600 text-sm">← Clientes</a>
    <span class="text-gray-300">/</span>
    <h1 class="text-2xl font-bold text-gray-900">Novo Cliente</h1>
  </div>

  {#if form?.error}
    <p class="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{form.error}</p>
  {/if}

  <form method="POST" class="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
      <input
        id="name"
        name="name"
        type="text"
        required
        bind:value={name}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Ex: Acme Corp"
      />
    </div>
    <div>
      <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
      <input
        id="slug"
        name="slug"
        type="text"
        required
        value={slug}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="acme-corp"
      />
      <p class="text-xs text-gray-400 mt-1">Identificador único, gerado automaticamente.</p>
    </div>
    <div>
      <label for="primary_color" class="block text-sm font-medium text-gray-700 mb-1">Cor Principal da Marca</label>
      <input
        id="primary_color"
        name="primary_color"
        type="color"
        value="#6366f1"
        class="h-10 w-20 px-1 py-1 border border-gray-300 rounded-lg cursor-pointer"
      />
    </div>
    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
      Criar Cliente
    </button>
  </form>
</div>
