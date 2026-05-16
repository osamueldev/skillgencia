<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';

  let { data }: { data: PageData } = $props();
  const clientId = $derived($page.params.id);

  const statusColor: Record<string, string> = {
    draft: 'text-gray-600 bg-gray-100',
    scheduled: 'text-indigo-700 bg-indigo-50',
    published: 'text-green-700 bg-green-50',
    failed: 'text-red-700 bg-red-50'
  };

  const statusLabel: Record<string, string> = {
    draft: 'Rascunho', scheduled: 'Agendado', published: 'Publicado', failed: 'Falhou'
  };
</script>

<svelte:head><title>Posts — skillgência</title></svelte:head>

<div class="p-8">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-xl font-bold text-gray-900">Posts</h2>
    <a href="/clients/{clientId}/posts/new" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
      + Novo Post
    </a>
  </div>

  {#if data.posts.length === 0}
    <div class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <p class="text-gray-400 text-sm">Nenhum post ainda.</p>
      <a href="/clients/{clientId}/posts/new" class="inline-block mt-4 text-indigo-600 text-sm font-medium hover:underline">
        Criar primeiro post
      </a>
    </div>
  {:else}
    <div class="space-y-3">
      {#each data.posts as post}
        <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-start justify-between">
          <div class="flex-1 min-w-0 mr-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-medium text-gray-500 uppercase">{post.platform}</span>
              {#if post.scheduled_at}
                <span class="text-xs text-gray-400">· {new Date(post.scheduled_at).toLocaleString('pt-BR')}</span>
              {/if}
            </div>
            <p class="text-sm text-gray-800 truncate">{post.content}</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="text-xs font-medium px-2 py-1 rounded-full {statusColor[post.status]}">
              {statusLabel[post.status]}
            </span>
            {#if post.status === 'draft' || post.status === 'scheduled'}
              <form method="POST" action="/api/posts/{post.id}/publish">
                <button type="submit" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  Publicar Agora
                </button>
              </form>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
