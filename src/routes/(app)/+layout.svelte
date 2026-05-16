<script lang="ts">
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: any } = $props();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '◉' },
    { href: '/clients', label: 'Clientes', icon: '◈' },
    { href: '/squads', label: 'Squads', icon: '⬡' },
  ];
</script>

<div class="flex h-screen bg-gray-50 overflow-hidden">
  <!-- Sidebar -->
  <aside class="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
    <div class="px-5 py-5 border-b border-gray-100">
      <span class="text-lg font-bold text-indigo-600">skillgência</span>
    </div>

    <nav class="flex-1 px-3 py-4 space-y-1">
      {#each navItems as item}
        <a
          href={item.href}
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <span>{item.icon}</span>
          {item.label}
        </a>
      {/each}
    </nav>

    <div class="px-3 py-4 border-t border-gray-100">
      <div class="flex items-center gap-3 px-3 py-2 mb-1">
        <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
          {data.user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <span class="text-sm font-medium text-gray-700 truncate">{data.user?.name ?? data.user?.email}</span>
      </div>
      <form method="POST" action="/auth/logout">
        <button type="submit" class="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
          Sair
        </button>
      </form>
    </div>
  </aside>

  <!-- Main content -->
  <main class="flex-1 overflow-y-auto">
    {@render children()}
  </main>
</div>
