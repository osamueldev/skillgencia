<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let platform = $state('instagram');
  let metrics: any = $state(null);
  let loading = $state(false);
  let err = $state('');

  async function fetchMetrics() {
    loading = true;
    err = '';
    try {
      const res = await fetch(`/api/metrics?client_id=${data.clientId}&platform=${platform}`);
      if (!res.ok) throw new Error(await res.text());
      metrics = await res.json();
    } catch (e: any) {
      err = e.message;
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (data.hasConnections) fetchMetrics();
  });
</script>

<svelte:head><title>Métricas — skillgência</title></svelte:head>

<div class="p-8">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-xl font-bold text-gray-900">Métricas</h2>
    <div class="flex gap-2">
      {#each ['instagram', 'facebook'] as plt}
        <button
          onclick={() => { platform = plt; fetchMetrics(); }}
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {platform === plt ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}"
        >
          {plt}
        </button>
      {/each}
    </div>
  </div>

  {#if !data.hasConnections}
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
      <p class="text-sm text-amber-800">Conecte uma conta Meta para ver métricas.</p>
    </div>
  {:else if loading}
    <div class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <p class="text-sm text-gray-400">Carregando métricas...</p>
    </div>
  {:else if err}
    <div class="bg-red-50 border border-red-200 rounded-xl p-6">
      <p class="text-sm text-red-700">{err}</p>
    </div>
  {:else if metrics}
    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <pre class="text-xs text-gray-600 overflow-auto">{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  {/if}
</div>
