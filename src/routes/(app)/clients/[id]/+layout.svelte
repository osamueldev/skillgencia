<script lang="ts">
  import type { LayoutData } from './$types';
  import { page } from '$app/stores';

  let { data, children }: { data: LayoutData; children: any } = $props();

  const tabs = $derived([
    { href: `/clients/${data.client.id}/posts`, label: 'Posts' },
    { href: `/clients/${data.client.id}/metrics`, label: 'Métricas' },
    { href: `/clients/${data.client.id}/settings`, label: 'Configurações' }
  ]);
</script>

<div class="flex flex-col h-full">
  <!-- Client header -->
  <div class="bg-white border-b border-gray-200 px-8 py-5">
    <div class="flex items-center gap-3 mb-4">
      <a href="/clients" class="text-gray-400 hover:text-gray-600 text-sm">← Clientes</a>
      <span class="text-gray-300">/</span>
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style="background-color: {data.client.brand_colors?.primary ?? '#6366f1'}">
          {data.client.name[0].toUpperCase()}
        </div>
        <span class="font-semibold text-gray-900">{data.client.name}</span>
      </div>
    </div>
    <nav class="flex gap-1">
      {#each tabs as tab}
        <a
          href={tab.href}
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {$page.url.pathname.startsWith(tab.href) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}"
        >
          {tab.label}
        </a>
      {/each}
    </nav>
  </div>

  <div class="flex-1 overflow-y-auto">
    {@render children()}
  </div>
</div>
