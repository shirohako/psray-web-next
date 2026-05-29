<script setup lang="ts">
import { House, LayoutDashboard, Users, FileText, Settings, Menu, Zap, type IconNode } from 'lucide'

const route = useRoute()

// Sidebar collapse state. Default expanded; restored from localStorage on mount
// (read in onMounted to avoid an SSR/hydration mismatch).
const collapsed = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('sidebar:collapsed')
  if (saved !== null) collapsed.value = saved === '1'
})

watch(collapsed, (v) => {
  localStorage.setItem('sidebar:collapsed', v ? '1' : '0')
})

function toggleSidebar() {
  collapsed.value = !collapsed.value
}

type MenuItem = {
  label: string
  to: string
  icon: IconNode
}

const menu: MenuItem[] = [
  { label: '首页', to: '/', icon: House },
  { label: '仪表盘', to: '/dashboard', icon: LayoutDashboard },
  { label: '用户管理', to: '/users', icon: Users },
  { label: '文档', to: '/docs', icon: FileText },
  { label: '设置', to: '/settings', icon: Settings },
]

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <!-- Top bar -->
    <header
      class="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-3 backdrop-blur-md sm:px-4"
    >
      <!-- Left: collapse toggle + logo -->
      <div class="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          @click="toggleSidebar"
          :aria-label="collapsed ? '展开菜单' : '折叠菜单'"
          class="grid size-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <LucideIcon :icon="Menu" class="size-6" stroke-width="1.75" />
        </button>

        <NuxtLink to="/" class="flex items-center gap-2.5">
          <span
            class="grid size-9 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30"
          >
            <LucideIcon :icon="Zap" class="size-5" />
          </span>
          <span class="hidden text-lg font-bold tracking-tight text-slate-900 sm:block">
            PS<span class="text-indigo-600">Ray</span>
          </span>
        </NuxtLink>
      </div>

      <!-- Right: auth buttons -->
      <div class="flex items-center gap-2 sm:gap-3">
        <NuxtLink
          to="/login"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-4"
        >
          登录
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 active:bg-indigo-700 sm:px-4"
        >
          注册
        </NuxtLink>
      </div>
    </header>

    <!-- Left sidebar -->
    <aside
      class="fixed bottom-0 left-0 top-16 z-30 flex flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out"
      :class="collapsed ? 'w-17' : 'w-64'"
    >
      <nav class="flex-1 overflow-y-auto px-3 py-4">
        <p
          class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-opacity duration-200"
          :class="collapsed ? 'pointer-events-none opacity-0' : 'opacity-100'"
        >
          导航
        </p>
        <ul class="space-y-1">
          <li v-for="item in menu" :key="item.to">
            <NuxtLink
              :to="item.to"
              :title="collapsed ? item.label : undefined"
              class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
              :class="[
                isActive(item.to)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                collapsed ? 'justify-center' : '',
              ]"
            >
              <LucideIcon
                :icon="item.icon"
                stroke-width="1.75"
                class="size-6 shrink-0 transition-colors"
                :class="isActive(item.to) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"
              />
              <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main content -->
    <main
      class="pt-16 transition-[padding] duration-300 ease-in-out"
      :class="collapsed ? 'pl-17' : 'pl-64'"
    >
      <div class="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
