<script setup lang="ts">
import { House, Menu, Gamepad2, Trophy, LogOut, User, RefreshCw, type IconNode } from 'lucide'

const route = useRoute()
const appConfig = useAppConfig()
const { user, loggedIn, logout } = useAuth()

// Desktop (lg+) sidebar collapse state: full width <-> icon rail.
// Default expanded; restored from localStorage on mount (read in onMounted to
// avoid an SSR/hydration mismatch).
const collapsed = ref(false)
// Mobile (< lg) drawer state: the sidebar is fully hidden off-canvas and slides
// in as an overlay layer above the content when opened.
const mobileOpen = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('sidebar:collapsed')
  if (saved !== null) collapsed.value = saved === '1'
})

watch(collapsed, (v) => {
  localStorage.setItem('sidebar:collapsed', v ? '1' : '0')
})

// The top-bar button collapses the rail on desktop, and opens/closes the
// overlay drawer on mobile.
function toggleSidebar() {
  if (window.matchMedia('(min-width: 1024px)').matches) {
    collapsed.value = !collapsed.value
  } else {
    mobileOpen.value = !mobileOpen.value
  }
}

type MenuItem = {
  label: string
  to: string
  icon: IconNode
}

const menu: MenuItem[] = [
  { label: '首页', to: '/', icon: House },
  { label: '排行榜', to: '/leaderboard', icon: Trophy },
]

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

const profilePath = computed(() => user.value?.psnid ? `/p/${encodeURIComponent(user.value.psnid)}` : '/')

async function onLogout() {
  await logout()
  await navigateTo('/')
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
          class="grid size-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <LucideIcon :icon="Menu" class="size-6" stroke-width="1.75" />
        </button>

        <NuxtLink to="/" class="flex items-center gap-2.5">
          <img
            v-if="appConfig.brand.logo"
            :src="appConfig.brand.logo"
            alt="PSRay"
            class="size-9 object-contain"
          />
          <span
            v-else
            class="grid size-9 place-items-center rounded-xl bg-slate-900 text-white shadow-sm shadow-slate-900/30"
          >
            <LucideIcon :icon="Gamepad2" class="size-5" />
          </span>
          <span class="text-lg font-bold tracking-tight text-slate-900">
            PS<span class="text-slate-900">Ray</span>
          </span>
        </NuxtLink>
      </div>

      <!-- Right: auth controls -->
      <div v-if="loggedIn && user" class="flex items-center gap-2 sm:gap-3">
        <Popover
          align="right"
          class="flex min-w-0 cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 sm:px-3"
        >
          <img
            v-if="user.avatar_url"
            :src="user.avatar_url"
            :alt="user.psnid"
            class="size-8 shrink-0 rounded-full bg-slate-100 object-cover"
          />
          <span
            v-else
            class="grid size-8 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white"
          >
            {{ user.psnid.slice(0, 1).toUpperCase() }}
          </span>
          <span class="hidden max-w-32 truncate sm:block">{{ user.psnid }}</span>

          <template #menu="{ close }">
            <NuxtLink
              :to="profilePath"
              class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              @click="close"
            >
              <LucideIcon :icon="User" class="size-4 text-slate-400" />
              个人资料
            </NuxtLink>
            <NuxtLink
              :to="{ path: '/sync', query: { psnid: user.psnid } }"
              class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              @click="close"
            >
              <LucideIcon :icon="RefreshCw" class="size-4 text-slate-400" />
              同步账户
            </NuxtLink>
            <button
              type="button"
              class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              @click="close(); onLogout()"
            >
              <LucideIcon :icon="LogOut" class="size-4 text-slate-400" />
              退出登录
            </button>
          </template>
        </Popover>
      </div>
      <div v-else class="flex items-center gap-2 sm:gap-3">
        <NuxtLink
          to="/auth/login"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-4"
        >
          登录
        </NuxtLink>
        <NuxtLink
          to="/auth/register"
          class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/30 transition hover:bg-slate-800 active:bg-slate-950 sm:px-4"
        >
          注册
        </NuxtLink>
      </div>
    </header>

    <!-- Mobile backdrop: only visible while the drawer is open on small screens -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen"
        class="fixed inset-0 top-16 z-30 bg-slate-900/50 lg:hidden"
        @click="mobileOpen = false"
      />
    </Transition>

    <!-- Left sidebar: overlay drawer on mobile, pushing rail on desktop -->
    <aside
      class="fixed bottom-0 left-0 top-16 z-40 flex w-56 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:transition-[width]"
      :class="[
        mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full',
        collapsed ? 'lg:w-17' : 'lg:w-56',
      ]"
    >
      <nav class="flex-1 overflow-y-auto px-3 py-4">
        <p
          class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
          :class="collapsed ? 'lg:hidden' : ''"
        >
          导航
        </p>
        <ul class="space-y-1">
          <li v-for="item in menu" :key="item.to">
            <NuxtLink
              :to="item.to"
              :title="collapsed ? item.label : undefined"
              @click="mobileOpen = false"
              class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
              :class="[
                isActive(item.to)
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                collapsed ? 'lg:justify-center' : '',
              ]"
            >
              <LucideIcon
                :icon="item.icon"
                stroke-width="1.75"
                class="size-6 shrink-0 transition-colors"
                :class="isActive(item.to) ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'"
              />
              <span class="truncate" :class="collapsed ? 'lg:hidden' : ''">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main content: no offset on mobile (drawer overlays), pushed on desktop -->
    <main
      class="pt-16 transition-[padding] duration-300 ease-in-out"
      :class="collapsed ? 'lg:pl-17' : 'lg:pl-56'"
    >
      <div class="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
