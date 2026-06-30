<script setup lang="ts">
import { Trophy, Clock, Hourglass, ChevronRight } from 'lucide'
import type { RecentTrophy } from '~/services/profile'

const props = defineProps<{ psnid: string }>()

interface PageMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

const page = ref(1)

// `page` is read inside the URL getter, so changing it re-fetches.
const { data: res, pending } = await useApiFetchRaw<RecentTrophy[], PageMeta>(
  () => `/profile/${props.psnid}/recent-trophies?page=${page.value}`,
)

const trophies = computed(() => res.value?.data ?? [])
const total = computed(() => res.value?.meta?.total ?? 0)
const totalPages = computed(() => res.value?.meta?.total_pages ?? 1)
const perPage = computed(() => res.value?.meta?.per_page ?? trophies.value.length)

/**
 * 1-based acquisition order across the whole history. The list is newest-first
 * and paginated, so the first row of a page is the `(page-1)*per_page`-th most
 * recent trophy — i.e. order `total - (page-1)*per_page`, decreasing per row.
 */
function earnedOrder(index: number): number {
  return total.value - (page.value - 1) * perPage.value - index
}

/**
 * Seconds elapsed between this trophy and the one earned just before it. The
 * list is newest-first, so the previous trophy is the next row down. Returns
 * `null` for the last row on the page — there's no earlier trophy to measure
 * against, so we just omit it.
 */
function elapsedSincePrev(index: number): number | null {
  const cur = trophies.value[index]
  const prev = trophies.value[index + 1]
  if (!cur || !prev) return null
  const curTime = typeof cur.earned_at === 'number' ? cur.earned_at * 1000 : new Date(cur.earned_at).getTime()
  const prevTime = typeof prev.earned_at === 'number' ? prev.earned_at * 1000 : new Date(prev.earned_at).getTime()
  if (Number.isNaN(curTime) || Number.isNaN(prevTime)) return null
  return Math.max(0, Math.floor((curTime - prevTime) / 1000))
}

function psnEarnedRate(item: RecentTrophy) {
  const rate = Number(item.trophy.psn_earned_rate)
  return Number.isFinite(rate) ? `${rate.toFixed(1)}%` : '—'
}
</script>

<template>
  <div>
    <!-- Header: title + total count -->
    <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
      <div>
        <h2 class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          <LucideIcon :icon="Trophy" class="size-4 text-slate-500" />
          获得的奖杯
        </h2>
        <p class="mt-0.5 text-xs text-slate-400">按解锁时间排序的奖杯记录</p>
      </div>
      <span v-if="total" class="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600">
        共 {{ fmt(total) }} 个
      </span>
    </div>

    <!-- Top pager (only when the page is long enough to be worth it) -->
    <div
      v-if="totalPages > 1 && trophies.length > 5"
      class="border-b border-slate-100 px-4 py-2.5"
    >
      <Pagination v-model:page="page" :total-pages="totalPages" />
    </div>

    <!-- Loading (initial only — on page change we keep the list visible) -->
    <div v-if="pending && !trophies.length" class="divide-y divide-slate-100">
      <div v-for="i in 6" :key="i" class="flex items-center gap-4 px-4 py-3.5 sm:px-5">
        <div class="size-14 shrink-0 animate-pulse rounded-lg bg-slate-200" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-2/5 animate-pulse rounded bg-slate-200" />
          <div class="h-3 w-3/5 animate-pulse rounded bg-slate-100" />
        </div>
        <div class="h-5 w-16 shrink-0 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!trophies.length" class="px-6 py-20 text-center">
      <div class="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
        <LucideIcon :icon="Trophy" class="size-6" />
      </div>
      <p class="mt-3 text-sm text-slate-500">还没有获得奖杯。</p>
    </div>

    <!-- List -->
    <div v-else class="divide-y divide-slate-100 transition-opacity" :class="{ 'opacity-50': pending }">
      <NuxtLink
        v-for="(item, index) in trophies"
        :key="`${item.trophy_set_id}-${item.trophy_id}-${item.earned_at}`"
        :to="{ path: `/trophies/${item.trophy_set_id}`, query: { psnid } }"
        class="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50 sm:gap-4 sm:px-5"
      >
        <!-- Acquisition order (newest = highest) -->
        <span
          class="inline-flex shrink-0 items-baseline gap-px text-sm font-semibold tabular-nums text-slate-400 transition group-hover:text-slate-700"
        >
          <span class="text-[10px] text-slate-300">#</span>{{ earnedOrder(index) }}
        </span>

        <!-- Icon + tier badge -->
        <div class="relative shrink-0">
          <img
            :src="item.trophy.icon_url"
            :alt="item.trophy.name"
            class="size-14 rounded-lg object-cover shadow-sm"
          />
          <span
            class="absolute -bottom-1.5 -right-1.5 grid size-6 place-items-center rounded-full border-2 border-white bg-white shadow-sm"
            :class="trophyTierColor(item.trophy.type)"
            :title="item.trophy.type"
          >
            <LucideIcon :icon="Trophy" class="size-3.5" />
          </span>
        </div>

        <!-- Name + detail + earned time -->
        <div class="min-w-0 flex-1">
          <h3 class="truncate font-semibold text-slate-900">{{ item.trophy.name }}</h3>
          <p v-if="item.trophy.detail" class="mt-0.5 line-clamp-1 text-xs text-slate-500">
            {{ item.trophy.detail }}
          </p>
          <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
            <span class="inline-flex items-center gap-1 tabular-nums">
              <LucideIcon :icon="Clock" class="size-3 text-slate-400" />
              {{ fmtDateTime(item.earned_at) }}
            </span>
            <span
              v-if="elapsedSincePrev(index) != null"
              class="inline-flex items-center gap-1 tabular-nums"
              title="距上一个奖杯的获取间隔"
            >
              <LucideIcon :icon="Hourglass" class="size-3 text-slate-400" />
              间隔 {{ formatDuration(elapsedSincePrev(index)) }}
            </span>
          </div>
        </div>

        <!-- PSN earn rate -->
        <div class="hidden shrink-0 flex-col items-end leading-tight sm:flex">
          <span class="text-[10px] font-medium text-slate-400">PSN</span>
          <span class="text-sm font-semibold tabular-nums text-slate-600">
            {{ psnEarnedRate(item) }}
          </span>
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
