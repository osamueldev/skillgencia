<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { page } from '$app/stores';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  const clientId = $derived($page.params.id);
  let scheduleMode = $state('draft');
</script>

<svelte:head><title>Novo Post — skillgência</title></svelte:head>

<div class="p-8 max-w-2xl">
  <div class="flex items-center gap-3 mb-6">
    <a href="/clients/{clientId}/posts" class="text-gray-400 hover:text-gray-600 text-sm">← Posts</a>
    <span class="text-gray-300">/</span>
    <h2 class="text-xl font-bold text-gray-900">Novo Post</h2>
  </div>

  {#if data.connections.length === 0}
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <p class="text-sm text-amber-800">
        Nenhuma conta Meta conectada.
        <a href="/clients/{clientId}/settings" class="font-medium underline">Conectar agora →</a>
      </p>
    </div>
  {/if}

  {#if form?.error}
    <p class="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{form.error}</p>
  {/if}

  <form method="POST" enctype="multipart/form-data" class="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Plataforma</label>
      <div class="flex gap-3">
        {#each ['instagram', 'facebook'] as plt}
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="platform" value={plt} required class="text-indigo-600" />
            <span class="text-sm capitalize">{plt}</span>
          </label>
        {/each}
      </div>
    </div>

    <div>
      <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Legenda</label>
      <textarea
        id="content"
        name="content"
        rows="4"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Escreva a legenda do post..."
      ></textarea>
    </div>

    <div>
      <label for="media" class="block text-sm font-medium text-gray-700 mb-1">Mídia</label>
      <input
        id="media"
        name="media"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,video/mp4"
        class="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium hover:file:bg-indigo-100"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Publicação</label>
      <div class="flex gap-4">
        {#each [['draft', 'Salvar Rascunho'], ['schedule', 'Agendar']] as [val, lbl]}
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="schedule_mode" value={val} bind:group={scheduleMode} class="text-indigo-600" />
            <span class="text-sm">{lbl}</span>
          </label>
        {/each}
      </div>
    </div>

    {#if scheduleMode === 'schedule'}
      <div>
        <label for="scheduled_at" class="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
        <input
          id="scheduled_at"
          name="scheduled_at"
          type="datetime-local"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    {/if}

    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
      {scheduleMode === 'schedule' ? 'Agendar Post' : 'Salvar Rascunho'}
    </button>
  </form>
</div>
