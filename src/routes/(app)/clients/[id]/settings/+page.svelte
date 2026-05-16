<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';

  let { data }: { data: PageData } = $props();

  const clientId = $derived($page.params.id);
  const connected = $derived($page.url.searchParams.get('connected') === 'true');

  const platformLabel: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook' };
</script>

<svelte:head><title>Configurações — skillgência</title></svelte:head>

<div class="p-8 max-w-2xl">
  <h2 class="text-xl font-bold text-gray-900 mb-6">Configurações</h2>

  {#if connected}
    <div class="mb-6 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
      Conta Meta conectada com sucesso!
    </div>
  {/if}

  <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-900">Conexões Meta</h3>
      <div class="flex gap-2">
        <a
          href="/api/meta/connect?client_id={clientId}&type=instagram"
          class="text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-4 py-2 rounded-lg transition-all"
        >
          + Instagram
        </a>
        <a
          href="/api/meta/connect?client_id={clientId}&type=facebook"
          class="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Facebook
        </a>
      </div>
    </div>

    {#if data.connections.length === 0}
      <p class="text-sm text-gray-400">Nenhuma conta conectada ainda.</p>
    {:else}
      <div class="space-y-3">
        {#each data.connections as conn}
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold {conn.platform === 'instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-blue-600'}">
                {conn.platform === 'instagram' ? 'IG' : 'FB'}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{conn.page_name || platformLabel[conn.platform]}</p>
                <p class="text-xs text-gray-500">{platformLabel[conn.platform]} · ID: {conn.account_id}</p>
              </div>
            </div>
            <span class="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">Conectado</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
