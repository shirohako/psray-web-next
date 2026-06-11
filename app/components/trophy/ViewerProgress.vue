<script setup lang="ts">
import { Calendar, Clock, RefreshCw } from 'lucide'
import type { ViewerProgress } from '~/services/trophies'

const props = defineProps<{ progress: ViewerProgress, total?: number }>()

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

function timestamp(value: number | string | null | undefined) {
  if (value == null || value === '') return null
  const ms = typeof value === 'number' ? value * 1000 : new Date(value).getTime()
  return Number.isNaN(ms) ? null : ms
}

const duration = computed(() => {
  const first = timestamp(props.progress.first_earned_at)
  const last = timestamp(props.progress.last_earned_at)
  if (first != null && last != null) return Math.max(0, Math.floor((last - first) / 1000))
  return props.progress.duration ?? null
})

const earnedTotal = computed(() =>
  props.progress.earned_bronze
  + props.progress.earned_silver
  + props.progress.earned_gold
  + props.progress.earned_platinum,
)
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="mb-4 text-sm font-semibold text-slate-900">你的进度</h2>

    <div class="flex items-center gap-3">
      <img :src="progress.avatar_url" :alt="progress.psnid" class="size-12 rounded-full bg-slate-100 object-cover" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-semibold text-slate-900">{{ progress.psnid }}</div>
        <div class="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          <span>已获得</span>
          <span class="inline-flex items-baseline gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 font-bold tabular-nums text-slate-800">
            <span>{{ fmt(earnedTotal) }}</span>
            <template v-if="total != null">
              <span class="text-slate-400">/</span>
              <span>{{ fmt(total) }}</span>
            </template>
          </span>
          <span>个奖杯</span>
        </div>
      </div>
      <TrophyProgressRing :progress="progress.progress" :bar-class="ringClass" :size="56" />
    </div>

    <div class="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
      <div
        v-for="t in earned"
        :key="t.key"
        class="inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-50 px-2 py-1.5"
      >
        <span class="size-2.5 shrink-0 rounded-full" :class="trophyKinds.find(k => k.key === t.key)?.dot" />
        <span class="text-sm font-bold tabular-nums text-slate-900">{{ t.count }}</span>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-[7rem_minmax(0,1fr)] gap-2.5 border-t border-slate-100 pt-4">
      <div class="flex min-h-full flex-col justify-center rounded-lg bg-slate-50 px-3.5 py-2.5">
        <div class="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <LucideIcon :icon="Clock" class="size-3.5" />耗时
        </div>
        <div class="mt-1.5 text-base font-bold leading-tight tabular-nums text-slate-900">
          {{ duration == null ? '—' : formatDuration(duration) }}
        </div>
      </div>
      <div class="grid gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs">
        <div class="grid gap-0.5">
          <span class="inline-flex items-center gap-1.5 text-slate-400">
            <LucideIcon :icon="Calendar" class="size-3.5" />首个奖杯
          </span>
          <span class="font-medium tabular-nums text-slate-700">
            {{ fmtDateTime(progress.first_earned_at) }}
          </span>
        </div>
        <div class="grid gap-0.5">
          <span class="inline-flex items-center gap-1.5 text-slate-400">
            <LucideIcon :icon="RefreshCw" class="size-3.5" />最后奖杯
          </span>
          <span class="font-medium tabular-nums text-slate-700">
            {{ fmtDateTime(progress.last_earned_at) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
