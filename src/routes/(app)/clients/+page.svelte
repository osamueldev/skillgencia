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
        <div class="relative group bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
          <a href="/clients/{client.id}/posts" class="block p-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                {client.name[0].toUpperCase()}
              </div>
              <div>
                <p class="font-semibold text-gray-900">{client.name}</p>
                <p class="text-xs text-gray-400">@{client.slug}</p>
              </div>
            </div>
          </a>
          <form
            method="POST"
            action="?/delete"
            class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onsubmit={(e) => { if (!confirm(`Deletar cliente ${client.name}? Esta ação não pode ser desfeita.`)) e.preventDefault(); }}
          >
            <input type="hidden" name="client_id" value={client.id} />
            <button
              type="submit"
              class="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Deletar cliente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </form>
        </div>
      {/each}
    </div>
  {/if}
</div>
