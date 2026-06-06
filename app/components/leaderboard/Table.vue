<script lang="ts">
/**
 * Columns a board can render. A board picks which ones (and their order) to
 * show, so different boards can expose different fields from the same row.
 * Add a metric column here, give it a `META` entry, and render it in the
 * template's cell switch — boards opt in via their `columns` list.
 */
export type LeaderboardColumn =
  | 'rank' | 'user' | 'level'
  | 'platinum' | 'gold' | 'silver' | 'bronze'
  | 'points' | 'tips'
</script>

<script setup lang="ts">
import type { LeaderboardRow } from '~/services/leaderboard'

const props = defineProps<{
  columns: LeaderboardColumn[]
  rows: LeaderboardRow[]
  /** True while (re)fetching; dims an existing list, drives the skeleton when empty. */
  pending?: boolean
}>()

// Single source of truth for each column's header + layout. Boards only choose
// which keys to pass in `columns`; rendering for each key lives in the template.
const META: Record<LeaderboardColumn, { label: string; align: 'left' | 'center' | 'right'; class?: string }> = {
  rank: { label: '排名', align: 'center', class: 'w-14' },
  user: { label: '玩家', align: 'left' },
  level: { label: '等级', align: 'center', class: 'w-16' },
  platinum: { label: '白金', align: 'right', class: 'w-14' },
  gold: { label: '金', align: 'right', class: 'w-12' },
  silver: { label: '银', align: 'right', class: 'w-12' },
  bronze: { label: '铜', align: 'right', class: 'w-14' },
  points: { label: '点数', align: 'right', class: 'w-24' },
  tips: { label: '心得', align: 'right', class: 'w-20' },
}

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const

// The four trophy-tier columns and their accent dot, so each renders uniformly.
const TIER_DOT: Partial<Record<LeaderboardColumn, string>> = {
  platinum: 'bg-cyan-400',
  gold: 'bg-amber-400',
  silver: 'bg-slate-400',
  bronze: 'bg-orange-400',
}
const isTier = (c: LeaderboardColumn): c is 'platinum' | 'gold' | 'silver' | 'bronze' => c in TIER_DOT

function fmtPointsCompact(n: number | null | undefined) {
  if (n == null) return '—'
  if (n < 10000) return fmt(n)

  const unit = n >= 1000000 ? 'M' : 'K'
  const value = n / (unit === 'M' ? 1000000 : 1000)
  return `${value.toFixed(2)}${unit}`
}

// Soft medal pill for the top three, muted number otherwise — matching the
// rank styling used elsewhere (e.g. the players dialog).
function rankClass(rank: number) {
  if (rank === 1) return 'bg-amber-100 text-amber-700'
  if (rank === 2) return 'bg-slate-200 text-slate-600'
  if (rank === 3) return 'bg-orange-100 text-orange-700'
  return 'text-slate-400'
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
    <!-- Rows -->
    <div v-if="rows.length" class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <th
              v-for="c in columns"
              :key="c"
              class="px-3 py-3"
              :class="[ALIGN[META[c].align], META[c].class]"
            >
              {{ META[c].label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 transition-opacity" :class="{ 'opacity-50': pending }">
          <tr v-for="r in rows" :key="r.user_id" class="transition hover:bg-slate-50">
            <td
              v-for="c in columns"
              :key="c"
              class="px-3 py-3.5 align-middle"
              :class="[ALIGN[META[c].align], META[c].class]"
            >
              <!-- Rank -->
              <span
                v-if="c === 'rank'"
                class="mx-auto grid size-7 place-items-center rounded-md text-xs font-bold tabular-nums"
                :class="rankClass(r.rank)"
              >{{ r.rank }}</span>

              <!-- Player -->
              <NuxtLink v-else-if="c === 'user'" :to="`/p/${r.psnid}`" class="group flex items-center gap-3">
                <img :src="r.avatar_url" :alt="r.psnid" class="size-10 shrink-0 rounded-full bg-slate-100 object-cover" >
                <span class="flex min-w-0 items-center gap-1.5">
                  <RegionFlag :country="r.country" class="text-sm" />
                  <span class="truncate font-semibold text-slate-900 group-hover:text-sky-600">{{ r.psnid }}</span>
                </span>
              </NuxtLink>

              <!-- Trophy level -->
              <span v-else-if="c === 'level'" class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600">
                {{ r.trophy_level }}
              </span>

              <!-- Trophy tier count (one column per tier) -->
              <span v-else-if="isTier(c)" class="inline-flex items-center justify-end gap-1.5 tabular-nums text-slate-500">
                <span class="size-2 rounded-full" :class="TIER_DOT[c]" />{{ fmt(r[c]) }}
              </span>

              <!-- Points (primary metric) -->
              <Tooltip
                v-else-if="c === 'points'"
                :content="fmt(r.points)"
                placement="top"
              >
                <span class="cursor-help text-[15px] font-bold tabular-nums text-slate-900">
                  {{ fmtPointsCompact(r.points) }}
                </span>
              </Tooltip>

              <!-- Tips count (primary metric) -->
              <span v-else-if="c === 'tips'" class="text-[15px] font-bold tabular-nums text-slate-900">{{ fmt(r.tips) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- First-load skeleton -->
    <div v-else-if="pending" class="divide-y divide-slate-100">
      <div v-for="i in 10" :key="i" class="flex items-center gap-3 px-4 py-3.5">
        <div class="size-8 shrink-0 animate-pulse rounded-xl bg-slate-200" />
        <div class="size-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
        <div class="h-3.5 flex-1 animate-pulse rounded bg-slate-200" />
        <div class="h-3.5 w-16 animate-pulse rounded bg-slate-200" />
      </div>
    </div>

    <!-- Empty -->
    <p v-else class="px-5 py-16 text-center text-sm text-slate-400">暂无排名数据。</p>

    <!-- Footer (count + pagination), kept inside the card -->
    <div v-if="$slots.footer" class="border-t border-slate-100 px-4 py-3">
      <slot name="footer" />
    </div>
  </div>
</template>
