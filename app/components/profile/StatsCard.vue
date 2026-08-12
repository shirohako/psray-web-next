<script setup lang="ts">
import { CheckCircle2, Eye, Layers3, MessageSquare } from 'lucide'
import type { Profile } from '~/services/profile'

const props = defineProps<{ profile: Profile }>()
const total = computed(() => sumTrophies(props.profile))
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="mb-4 text-sm font-semibold text-slate-900">{{ $t('profile.stats.title') }}</h2>
    <dl class="grid grid-cols-2 gap-y-4">
      <div>
        <dt class="text-xs text-slate-400">{{ $t('profile.stats.games') }}</dt>
        <dd class="mt-0.5 text-lg font-bold text-slate-900">{{ fmt(profile.played_game_count) }}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-400">{{ $t('profile.stats.trophies') }}</dt>
        <dd class="mt-0.5 text-lg font-bold text-slate-900">{{ fmt(total) }}</dd>
      </div>
      <div>
        <dt class="inline-flex items-center gap-1 text-xs text-slate-400">
          <LucideIcon :icon="CheckCircle2" class="size-3.5 text-emerald-400" />{{ $t('profile.stats.perfect') }}
        </dt>
        <dd class="mt-0.5 text-lg font-bold text-slate-900">{{ fmt(profile.completed_game_count) }}</dd>
      </div>
      <div>
        <dt class="inline-flex items-center gap-1 text-xs text-slate-400">
          <LucideIcon :icon="Layers3" class="size-3.5 text-violet-400" />{{ $t('profile.stats.lowCompletion') }}
        </dt>
        <dd class="mt-0.5 text-lg font-bold text-slate-900">{{ fmt(profile.abandoned_game_count) }}</dd>
      </div>
    </dl>

    <div class="mt-3 border-t border-slate-100">
      <div class="flex items-center justify-between gap-3 px-1 py-2">
        <div class="flex min-w-0 items-center gap-2.5">
          <span class="grid size-7 shrink-0 place-items-center rounded-md bg-white text-sky-500 shadow-sm ring-1 ring-slate-200/70">
            <LucideIcon :icon="MessageSquare" class="size-3.5" />
          </span>
          <span class="truncate text-xs font-medium text-slate-500">{{ $t('profile.stats.comments') }}</span>
        </div>
        <span class="shrink-0 text-base font-bold tabular-nums text-slate-900">{{ fmt(profile.tip_count) }}</span>
      </div>
      <div class="flex items-center justify-between gap-3 border-t border-slate-100 px-1 py-2">
        <div class="flex min-w-0 items-center gap-2.5">
          <span class="grid size-7 shrink-0 place-items-center rounded-md bg-white text-violet-500 shadow-sm ring-1 ring-slate-200/70">
            <LucideIcon :icon="Eye" class="size-3.5" />
          </span>
          <span class="truncate text-xs font-medium text-slate-500">{{ $t('profile.stats.views') }}</span>
        </div>
        <span class="shrink-0 text-base font-bold tabular-nums text-slate-900">{{ fmt(profile.page_view_count) }}</span>
      </div>
    </div>
  </div>
</template>
