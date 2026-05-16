<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Squads — skillgência</title></svelte:head>

<div class="p-8">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Squads</h1>
    <a href="/squads/new" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
      + Novo Squad
    </a>
  </div>

  {#if data.squads.length === 0}
    <div class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <p class="text-gray-400 text-sm">Nenhum squad ainda.</p>
      <a href="/squads/new" class="inline-block mt-4 text-indigo-600 text-sm font-medium hover:underline">
        Criar primeiro squad
      </a>
    </div>
  {:else}
    <div class="space-y-3">
      {#each data.squads as squad}
        <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p class="font-semibold text-gray-900">{squad.name}</p>
            {#if squad.description}
              <p class="text-sm text-gray-500 mt-1">{squad.description}</p>
            {/if}
          </div>
          <span class="text-xs text-gray-400">{squad.created ? new Date(squad.created).toLocaleDateString('pt-BR') : ''}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
