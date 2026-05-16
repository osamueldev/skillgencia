<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';

  let { data }: { data: PageData } = $props();

  const clientId = $derived($page.params.id);
  const connected = $derived($page.url.searchParams.get('connected') === 'true');

  const platformLabel: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook' };
  const platformColor: Record<string, string> = {
    instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
    facebook: 'bg-blue-600'
  };
</script>

<svelte:head><title>Configurações — skillgência</title></svelte:head>

<div class="p-8 max-w-2xl">
  <h2 class="text-xl font-bold text-gray-900 mb-6">Configurações</h2>

  {#if connected}
    <div class="mb-6 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
      Conta Meta conectada com sucesso!
    </div>
  {/if}

  {#if data.selectSessionId && data.selectAccounts.length > 0}
    <div class="bg-white rounded-2xl border border-indigo-200 p-6 mb-6">
      <h3 class="font-semibold text-gray-900 mb-1">Escolha qual conta conectar</h3>
      <p class="text-sm text-gray-500 mb-4">Encontramos {data.selectAccounts.length} conta(s) disponíveis. Selecione a que pertence a este cliente.</p>
      <div class="space-y-2">
        {#each data.selectAccounts as acc, i}
          <form method="POST" action="?/select_account">
            <input type="hidden" name="session_id" value={data.selectSessionId} />
            <input type="hidden" name="account_index" value={i} />
            <button type="submit" class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 border border-gray-200 rounded-xl text-left transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold {platformColor[acc.type] ?? 'bg-gray-400'}">
                  {acc.type === 'instagram' ? 'IG' : 'FB'}
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">{acc.name}</p>
                  <p class="text-xs text-gray-500">{platformLabel[acc.type]} · ID: {acc.account_id}</p>
                </div>
              </div>
              <span class="text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                Conectar esta →
              </span>
            </button>
          </form>
        {/each}
      </div>
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
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">Conectado</span>
              <form method="POST" action="?/disconnect" onsubmit={(e) => { if (!confirm(`Remover conexão com ${conn.page_name || platformLabel[conn.platform]}?`)) e.preventDefault(); }}>
                <input type="hidden" name="connection_id" value={conn.id} />
                <button
                  type="submit"
                  class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover conexão"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
