<script setup lang="ts">
import { Calendar, RefreshCw } from 'lucide'
import type { ViewerProgress } from '~/services/trophies'

const props = defineProps<{ progress: ViewerProgress }>()

// Per-tier earned counts in display order (platinum → bronze).
const earned = computed(() => {
  const p = props.progress
  return [
    { key: 'platinum', count: p.earned_platinum },
    { key: 'gold', count: p.earned_gold },
    { key: 'silver', count: p.earned_silver },
    { key: 'bronze', count: p.earned_bronze },
  ] as const
})

const ringClass = computed(() =>
  props.progress.progress === 100 ? 'stroke-cyan-400' : 'stroke-slate-900',
)
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="mb-4 text-sm font-semibold text-slate-900">你的进度</h2>

    <div class="flex items-center gap-3">
      <img :src="progress.avatar_url" :alt="progress.psnid" class="size-12 rounded-full bg-slate-100 object-cover" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-semibold text-slate-900">{{ progress.psnid }}</div>
        <div class="text-xs text-slate-400">首杯 {{ fmtDate(progress.first_earned_at) }}</div>
      </div>
      <TrophyProgressRing :progress="progress.progress" :bar-class="ringClass" :size="56" />
    </div>

    <div class="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
      <div v-for="t in earned" :key="t.key" class="flex flex-col items-center gap-1">
        <span class="size-3 rounded-full" :class="trophyKinds.find(k => k.key === t.key)?.dot" />
        <span class="text-base font-bold text-slate-900">{{ t.count }}</span>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
      <span class="inline-flex items-center gap-1">
        <LucideIcon :icon="Calendar" class="size-3.5" />{{ fmtDate(progress.first_earned_at) }}
      </span>
      <span class="inline-flex items-center gap-1">
        <LucideIcon :icon="RefreshCw" class="size-3.5" />更新 {{ fromNow(progress.last_updated_at) }}
      </span>
    </div>
  </div>
</template>
