<script setup lang="ts">
import { Clock, ChevronRight, Globe } from 'lucide'
import type { PlayedTrophySet } from '~/services/profile'

const props = defineProps<{ psnid: string }>()

interface PageMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

const page = ref(1)

// `page` is read inside the URL getter, so changing it re-fetches.
const { data: res, pending } = await useApiFetchRaw<PlayedTrophySet[], PageMeta>(
  () => `/profile/${props.psnid}/recently-played?page=${page.value}`,
)

const recent = computed(() => res.value?.data ?? [])
const totalPages = computed(() => res.value?.meta?.total_pages ?? 1)

function trophySetName(g: PlayedTrophySet) {
  return g.trophy_set.localized_name || g.trophy_set.name
}

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
  <div>
  <!-- Top pager (only when the current page is long enough to be worth it) -->
  <div
    v-if="totalPages > 1 && recent.length > 5"
    class="border-b border-slate-100 px-4 py-2.5"
  >
    <Pagination v-model:page="page" :total-pages="totalPages" />
  </div>

  <!-- Loading (initial only — on page change we keep the list visible) -->
  <div v-if="pending && !recent.length" class="divide-y divide-slate-100">
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
  <div v-else-if="!recent.length" class="px-6 py-20 text-center text-sm text-slate-500">
    还没有游玩记录。
  </div>

  <!-- List -->
  <div v-else class="divide-y divide-slate-100 transition-opacity" :class="{ 'opacity-50': pending }">
    <NuxtLink
      v-for="g in recent"
      :key="g.id"
      :to="{ path: `/trophies/${g.trophy_set_id}`, query: { psnid } }"
      class="group flex items-center gap-4 px-4 py-4 transition hover:bg-slate-50 sm:px-5"
    >
      <!-- Fixed-width slot keeps rows aligned; the image renders at its natural
           aspect (PS4 320×176 landscape, PS5 square) with a soft ring instead of
           a gray letterbox box around it, plus a loading skeleton. -->
      <div class="relative flex h-18 w-24 shrink-0 items-center justify-center">
        <TrophySetImage
          :src="g.trophy_set.icon_url"
          :alt="trophySetName(g)"
          :platform="platformList(g.trophy_set.platform)"
        />
      </div>

      <div class="min-w-0 flex-1">
        <!-- Title -->
        <h3 class="truncate font-semibold text-slate-900">{{ trophySetName(g) }}</h3>

        <!-- Platform + region + last-earned time -->
        <div class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            v-for="platform in platformList(g.trophy_set.platform)"
            :key="platform"
            class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold leading-none"
            :class="platformBadgeClass(platform)"
          >
            {{ platform }}
          </span>
          <span
            v-if="g.trophy_set.region"
            class="inline-flex shrink-0 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-slate-500"
          >
            <LucideIcon :icon="Globe" class="size-3 text-slate-400" />
            {{ g.trophy_set.region }}
          </span>
          <span class="inline-flex items-center gap-1 text-xs tabular-nums text-slate-400">
            <LucideIcon :icon="Clock" class="size-3.5" />
            {{ fmtDateTime(g.last_earned_at) }}
          </span>
        </div>

        <!-- Progress + per-tier earned counts -->
        <div class="mt-2.5 flex items-center gap-3">
          <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full"
              :class="g.progress === 100 ? 'bg-cyan-400' : 'bg-slate-900'"
              :style="{ width: `${g.progress}%` }"
            />
          </div>
          <span class="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-600">{{ g.progress }}%</span>
        </div>
        <div class="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
          <span v-for="(t, i) in earnedTiers(g)" :key="i" class="inline-flex items-center gap-1 tabular-nums">
            <span class="size-2 rounded-full" :class="t.dot" />{{ t.count }}
          </span>
        </div>
      </div>

      <LucideIcon
        :icon="ChevronRight"
        class="size-5 shrink-0 text-slate-300 transition group-hover:text-slate-400"
      />
    </NuxtLink>
  </div>

  <!-- Bottom pager -->
  <div v-if="totalPages > 1" class="border-t border-slate-100 px-4 py-3">
    <Pagination v-model:page="page" :total-pages="totalPages" />
  </div>
  </div>
</template>
