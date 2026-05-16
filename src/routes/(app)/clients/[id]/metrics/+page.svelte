<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const platformLabel: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook' };

  let selectedConnection = $state(data.connections[0]?.id ?? '');
  let metrics: any = $state(null);
  let loading = $state(false);
  let err = $state('');

  const selected = $derived(data.connections.find((c: any) => c.id === selectedConnection));

  async function fetchMetrics() {
    if (!selectedConnection) return;
    loading = true;
    err = '';
    metrics = null;
    try {
      const conn = data.connections.find((c: any) => c.id === selectedConnection);
      if (!conn) throw new Error('Conexão não encontrada');
      const res = await fetch(`/api/metrics?client_id=${data.clientId}&platform=${conn.platform}&connection_id=${conn.id}`);
      if (!res.ok) {
        const text = await res.text();
        try { err = JSON.parse(text).message ?? text; } catch { err = text; }
      } else {
        metrics = await res.json();
      }
    } catch (e: any) {
      err = e.message;
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (selectedConnection) fetchMetrics();
  });
</script>

<svelte:head><title>Métricas — skillgência</title></svelte:head>

<div class="p-8">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-xl font-bold text-gray-900">Métricas</h2>
  </div>

  {#if data.connections.length === 0}
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
      <p class="text-sm text-amber-800">
        Nenhuma conta conectada.
        <a href="settings" class="font-medium underline">Conectar agora →</a>
      </p>
    </div>
  {:else}
    <!-- Connection selector -->
    <div class="flex flex-wrap gap-2 mb-6">
      {#each data.connections as conn}
        <button
          onclick={() => { selectedConnection = conn.id; }}
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors {selectedConnection === conn.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}"
        >
          <span class="w-5 h-5 rounded flex items-center justify-center text-white text-xs {conn.platform === 'instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-blue-600'}">
            {conn.platform === 'instagram' ? 'IG' : 'FB'}
          </span>
          {conn.page_name || platformLabel[conn.platform]}
        </button>
      {/each}
    </div>

    {#if loading}
      <div class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <p class="text-sm text-gray-400">Carregando métricas de {selected?.page_name}...</p>
      </div>
    {:else if err}
      <div class="bg-red-50 border border-red-200 rounded-xl p-6">
        <p class="text-sm font-medium text-red-700 mb-1">Erro ao buscar métricas</p>
        <p class="text-xs text-red-600">{err}</p>
        <p class="text-xs text-gray-500 mt-2">Verifique se a conta é uma conta profissional/business no Instagram.</p>
      </div>
    {:else if metrics}
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">{selected?.page_name} — últimos 30 dias</h3>
        <pre class="text-xs text-gray-600 overflow-auto">{JSON.stringify(metrics, null, 2)}</pre>
      </div>
    {/if}
  {/if}
</div>
