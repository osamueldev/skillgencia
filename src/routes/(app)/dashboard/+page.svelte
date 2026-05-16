<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const statusColor: Record<string, string> = {
    published: 'text-green-700 bg-green-50',
    failed: 'text-red-700 bg-red-50',
    scheduled: 'text-indigo-700 bg-indigo-50',
    draft: 'text-gray-600 bg-gray-100'
  };
</script>

<svelte:head><title>Dashboard — skillgência</title></svelte:head>

<div class="p-8">
  <h1 class="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

  <!-- Stats -->
  <div class="grid grid-cols-3 gap-6 mb-8">
    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <p class="text-sm text-gray-500 mb-1">Clientes</p>
      <p class="text-3xl font-bold text-gray-900">{data.clientCount}</p>
    </div>
    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <p class="text-sm text-gray-500 mb-1">Posts Agendados</p>
      <p class="text-3xl font-bold text-indigo-600">{data.scheduledPosts.length}</p>
    </div>
    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <p class="text-sm text-gray-500 mb-1">Posts Recentes</p>
      <p class="text-3xl font-bold text-gray-900">{data.recentPosts.length}</p>
    </div>
  </div>

  <!-- Upcoming scheduled posts -->
  <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
    <h2 class="text-base font-semibold text-gray-900 mb-4">Próximos Posts Agendados</h2>
    {#if data.scheduledPosts.length === 0}
      <p class="text-sm text-gray-400">Nenhum post agendado.</p>
    {:else}
      <div class="space-y-3">
        {#each data.scheduledPosts as post}
          <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <p class="text-sm font-medium text-gray-900">{post.expand?.client?.name}</p>
              <p class="text-xs text-gray-500">{post.platform} · {post.content?.slice(0, 60)}...</p>
            </div>
            <p class="text-xs text-gray-400">{new Date(post.scheduled_at).toLocaleString('pt-BR')}</p>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Recent posts -->
  <div class="bg-white rounded-2xl border border-gray-200 p-6">
    <h2 class="text-base font-semibold text-gray-900 mb-4">Atividade Recente</h2>
    {#if data.recentPosts.length === 0}
      <p class="text-sm text-gray-400">Nenhuma publicação ainda.</p>
    {:else}
      <div class="space-y-3">
        {#each data.recentPosts as post}
          <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <p class="text-sm font-medium text-gray-900">{post.expand?.client?.name}</p>
              <p class="text-xs text-gray-500">{post.platform} · {post.content?.slice(0, 60)}</p>
            </div>
            <span class="text-xs font-medium px-2 py-1 rounded-full {statusColor[post.status]}">
              {post.status}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
