<script setup lang="ts">
import { Trophy } from 'lucide'
import type { Profile } from '~/services/profile'

/** Account level (with progress ring) + trophy total + per-tier breakdown, in one row. */
const props = defineProps<{ profile: Profile }>()

const total = computed(() => sumTrophies(props.profile))
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
    <!-- Account level (with progress ring) -->
    <div class="flex items-center gap-2.5">
      <div class="relative grid size-9 shrink-0 place-items-center">
        <svg class="size-9 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" stroke-width="3" />
          <circle
            cx="18" cy="18" r="16" fill="none" stroke="#0f172a" stroke-width="3"
            stroke-linecap="round"
            :stroke-dasharray="`${(profile.progress / 100) * 100.5} 100.5`"
          />
        </svg>
        <LucideIcon :icon="Trophy" class="absolute size-4 text-slate-900" />
      </div>
      <div class="leading-tight">
        <div class="text-xl font-bold text-slate-900">{{ profile.trophy_level }}</div>
        <div class="text-xs text-slate-500">{{ $t('profile.summary.level', { progress: profile.progress }) }}</div>
      </div>
    </div>
    <div class="h-8 w-px bg-slate-200" />
    <!-- Trophy total -->
    <div class="flex items-center gap-2.5">
      <span class="grid size-9 shrink-0 place-items-center rounded-full bg-white text-slate-900 shadow-sm">
        <LucideIcon :icon="Trophy" class="size-4.5" />
      </span>
      <div class="leading-tight">
        <div class="text-xl font-bold text-slate-900">{{ fmt(total) }}</div>
        <div class="text-xs text-slate-400">{{ $t('profile.stats.trophies') }}</div>
      </div>
    </div>
    <div class="h-8 w-px bg-slate-200" />
    <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
      <span v-for="t in trophyKinds" :key="t.key" class="inline-flex items-baseline gap-1.5">
        <span class="size-3 translate-y-0.5 rounded-full" :class="t.dot" />
        <span class="text-sm font-bold text-slate-900">{{ fmt(profile[t.key]) }}</span>
        <span class="text-xs" :class="t.text">{{ $t(t.labelKey) }}</span>
      </span>
    </div>
  </div>
</template>
