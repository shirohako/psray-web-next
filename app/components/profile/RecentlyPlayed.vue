<script setup lang="ts">
import { Clock, ChevronRight } from 'lucide'
import type { PlayedTrophySet } from '~/services/profile'

const props = defineProps<{ psnid: string }>()

const { data: recent, pending } = await useApiFetch<PlayedTrophySet[]>(
  () => `/profile/${props.psnid}/recently-played`,
)

/** Per-tier earned counts in display order (platinum → bronze). */
function earnedTiers(g: PlayedTrophySet) {
  return [
    { dot: 'bg-cyan-400', count: g.earned_platinum },
    { dot: 'bg-amber-400', count: g.earned_gold },
    { dot: 'bg-slate-400', count: g.earned_silver },
    { dot: 'bg-orange-400', count: g.earned_bronze },
  ]
}
</script>

<template>
  <!-- Loading -->
  <div v-if="pending" class="divide-y divide-slate-100">
    <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-4 py-3.5 sm:px-5">
      <div class="size-16 shrink-0 animate-pulse rounded-lg bg-slate-200" />
      <div class="flex-1 space-y-2">
        <div class="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div class="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
        <div class="h-1.5 w-full animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  </div>

  <!-- Empty -->
  <div v-else-if="!recent || !recent.length" class="px-6 py-20 text-center text-sm text-slate-500">
    还没有游玩记录。
  </div>

  <!-- List -->
  <div v-else class="divide-y divide-slate-100">
    <NuxtLink
      v-for="g in recent"
      :key="g.id"
      :to="`/trophies/${g.trophy_set_id}`"
      class="group flex items-center gap-4 px-4 py-3.5 transition hover:bg-slate-50 sm:px-5"
    >
      <!-- Fixed-width slot keeps rows aligned; the image renders at its natural
           aspect (PS4 320×176 landscape, PS5 square) with its own rounded corners
           + shadow, so there's no gray letterbox box around it. -->
      <div class="flex h-18 w-24 shrink-0 items-center justify-center">
        <img
          :src="g.trophy_set.trophy_title_icon_url"
          :alt="g.trophy_set.trophy_title_name"
          class="max-h-full max-w-full rounded-lg object-contain shadow-sm"
        />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h3 class="truncate font-semibold text-slate-900">{{ g.trophy_set.trophy_title_name }}</h3>
          <span
            class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
            :class="g.trophy_set.trophy_title_platform === 'PS5'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600'"
          >
            {{ g.trophy_set.trophy_title_platform }}
          </span>
        </div>
        <div class="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
          <span class="inline-flex items-center gap-1">
            <LucideIcon :icon="Clock" class="size-3.5 text-slate-400" /> {{ fromNow(g.last_updated_at) }}
          </span>
          <span class="inline-flex items-center gap-2">
            <span v-for="(t, i) in earnedTiers(g)" :key="i" class="inline-flex items-center gap-0.5">
              <span class="size-2 rounded-full" :class="t.dot" />{{ t.count }}
            </span>
          </span>
        </div>
        <!-- Progress -->
        <div class="mt-2 flex items-center gap-2">
          <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full"
              :class="g.progress === 100 ? 'bg-cyan-400' : 'bg-slate-900'"
              :style="{ width: `${g.progress}%` }"
            />
          </div>
          <span class="w-9 shrink-0 text-right text-xs font-semibold text-slate-600">{{ g.progress }}%</span>
        </div>
      </div>
      <LucideIcon
        :icon="ChevronRight"
        class="size-5 shrink-0 text-slate-300 transition group-hover:text-slate-400"
      />
    </NuxtLink>
  </div>
</template>
