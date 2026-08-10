<script setup lang="ts">
import { User, ShieldCheck, type IconNode } from 'lucide'

definePageMeta({ auth: true })

const route = useRoute()
const { t } = useI18n()

useSeo({
  title: () => t('seo.settings.title'),
  // Account-scoped and behind auth — nothing to index.
  noindex: true,
})

type NavItem = { to: string, labelKey: string, icon: IconNode }

// Group registry — add a new settings group by adding an entry here plus a
// matching child page under `app/pages/settings/`.
const nav: NavItem[] = [
  { to: '/settings/profile', labelKey: 'settings.nav.profile', icon: User },
  { to: '/settings/security', labelKey: 'settings.nav.security', icon: ShieldCheck },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ $t('settings.heading') }}</h1>
      <p class="mt-1.5 text-sm text-slate-500">{{ $t('settings.subheading') }}</p>
    </header>

    <div class="grid gap-6 lg:grid-cols-[13rem_1fr]">
      <!-- Vertical nav on desktop; horizontal scrollable tabs on mobile -->
      <nav class="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm lg:flex-col lg:self-start">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="group inline-flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition"
          :class="isActive(item.to)
            ? 'bg-slate-100 text-slate-900'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
        >
          <LucideIcon
            :icon="item.icon"
            class="size-4 shrink-0"
            :class="isActive(item.to) ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'"
          />
          {{ $t(item.labelKey) }}
        </NuxtLink>
      </nav>

      <div class="min-w-0">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
