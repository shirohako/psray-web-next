<script setup lang="ts">
import { CircleCheck, Circle, Ellipsis, Check } from 'lucide'
import type { LeaderboardRow, LeaderboardMeta } from '~/services/leaderboard'

useHead({ title: '排行榜 · PSRay' })

// All available boards (registry). Each owns its label, icon, filters, columns
// and fetcher — see `useRankingBoards`.
const boards = useRankingBoards()

const activeKey = ref(boards[0]!.key)
const board = computed(() => boards.find(b => b.key === activeKey.value) ?? boards[0]!)

// Mobile: the rail collapses to the first few boards plus a "show more" button
// (and a picker dialog) once the list grows past this count. Desktop shows all.
const MOBILE_LIMIT = 3
const pickerOpen = ref(false)
// Highlight the "show more" button when the active board is one it hides.
const activeHidden = computed(() => boards.findIndex(b => b.key === activeKey.value) >= MOBILE_LIMIT)

// Page-level filters. A board only consumes the ones it declares support for.
const region = ref('US')
const registeredOnly = ref(false)
const page = ref(1)

// One fetcher driven by the active board; SSR-rendered, re-run via `reload()`.
const { data, status, refresh } = await useAsyncData('leaderboard', () =>
  board.value.fetch({ page: page.value, registeredOnly: registeredOnly.value, region: region.value }),
)

const rows = computed<LeaderboardRow[]>(() => data.value?.data ?? [])
const meta = computed<LeaderboardMeta | undefined>(() => data.value?.meta)
const totalPages = computed(() => meta.value?.total_pages ?? 1)
const pending = computed(() => status.value === 'pending')

// Refetch. Control/board changes reset to page 1; pagination keeps the page.
function reload(resetPage = true) {
  if (resetPage) page.value = 1
  refresh()
}

function selectBoard(key: string) {
  if (key === activeKey.value) return
  activeKey.value = key
  reload()
}

function setPage(p: number) {
  if (p === page.value) return
  page.value = p
  reload(false)
}

watch([region, registeredOnly], () => reload())
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
    <!-- Left: vertical board switcher -->
    <aside class="lg:w-48 lg:shrink-0">
      <nav class="flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm">
        <p class="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">榜单</p>
        <button
          v-for="(b, idx) in boards"
          :key="b.key"
          type="button"
          class="group w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-medium transition"
          :class="[
            idx < MOBILE_LIMIT ? 'flex' : 'hidden lg:flex',
            b.key === activeKey
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          ]"
          @click="selectBoard(b.key)"
        >
          <span
            class="grid size-7 shrink-0 place-items-center rounded-md transition"
            :class="b.key === activeKey
              ? 'bg-white/15 text-white'
              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'"
          >
            <LucideIcon :icon="b.icon" class="size-3.5" />
          </span>
          <span class="truncate">{{ b.label }}</span>
        </button>

        <!-- Mobile: reveal the collapsed boards in a picker -->
        <button
          v-if="boards.length > MOBILE_LIMIT"
          type="button"
          class="group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-medium transition lg:hidden"
          :class="activeHidden
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          @click="pickerOpen = true"
        >
          <span
            class="grid size-7 shrink-0 place-items-center rounded-md transition"
            :class="activeHidden ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'"
          >
            <LucideIcon :icon="Ellipsis" class="size-3.5" />
          </span>
          <span class="truncate">显示更多</span>
        </button>
      </nav>
    </aside>

    <!-- Right: header + filters + table + pagination -->
    <section class="min-w-0 flex-1 space-y-4">
      <!-- Board header + the filters the active board supports -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
            <LucideIcon :icon="board.icon" class="size-5" />
          </span>
          <div class="min-w-0">
            <h2 class="text-base font-bold text-slate-900">{{ board.label }}</h2>
            <p class="truncate text-xs text-slate-400">{{ board.description }}</p>
          </div>
        </div>

        <div v-if="board.region || board.registered" class="flex flex-wrap items-center gap-2.5">
          <LeaderboardRegionSelect v-if="board.region" v-model="region" />
          <button
            v-if="board.registered"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition"
            :class="registeredOnly
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
            @click="registeredOnly = !registeredOnly"
          >
            <LucideIcon :icon="registeredOnly ? CircleCheck : Circle" class="size-4" />
            仅注册用户
          </button>
        </div>
      </div>

      <LeaderboardTable :columns="board.columns" :rows="rows" :pending="pending">
        <template #footer>
          <div class="flex items-center justify-between gap-3">
            <span class="text-xs text-slate-400">共 {{ fmt(meta?.total) }} 名玩家</span>
            <Pagination :page="page" :total-pages="totalPages" @update:page="setPage" />
          </div>
        </template>
      </LeaderboardTable>
    </section>
  </div>

  <!-- Mobile board picker -->
  <Dialog v-model:open="pickerOpen" title="选择榜单" size="sm">
    <div class="p-2">
      <button
        v-for="b in boards"
        :key="b.key"
        type="button"
        class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition hover:bg-slate-50"
        @click="selectBoard(b.key); pickerOpen = false"
      >
        <span class="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-500">
          <LucideIcon :icon="b.icon" class="size-4" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold text-slate-900">{{ b.label }}</span>
          <span class="block truncate text-xs text-slate-400">{{ b.description }}</span>
        </span>
        <LucideIcon v-if="b.key === activeKey" :icon="Check" class="size-4 shrink-0 text-slate-900" />
      </button>
    </div>
  </Dialog>
</template>
