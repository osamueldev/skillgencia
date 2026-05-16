<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Clientes — skillgência</title></svelte:head>

<div class="p-8">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Clientes</h1>
    <a href="/clients/new" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
      + Novo Cliente
    </a>
  </div>

  {#if data.clients.length === 0}
    <div class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <p class="text-gray-400 text-sm">Nenhum cliente ainda.</p>
      <a href="/clients/new" class="inline-block mt-4 text-indigo-600 text-sm font-medium hover:underline">
        Adicionar primeiro cliente
      </a>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each data.clients as client}
        <a href="/clients/{client.id}/posts" class="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-sm transition-all">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {client.name[0].toUpperCase()}
            </div>
            <div>
              <p class="font-semibold text-gray-900">{client.name}</p>
              <p class="text-xs text-gray-400">@{client.slug}</p>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
