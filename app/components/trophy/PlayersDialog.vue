<script setup lang="ts">
import { Trophy, Timer } from 'lucide'
import { useTrophies, type PlayerRanking, type PlayersMeta, type PlayerRankType } from '~/services/trophies'

const props = withDefaults(defineProps<{
  id: number | string
  open: boolean
  /** Sort tab to select when the dialog opens. */
  initialType?: PlayerRankType
}>(), { initialType: 'recent' })
const emit = defineEmits<{ 'update:open': [v: boolean] }>()

const tabs: { value: PlayerRankType; label: string }[] = [
  { value: 'recent', label: '最近再玩' },
  { value: 'progress', label: '最先完成' },
  { value: 'speedrun', label: '耗时最短' },
]

const type = ref<PlayerRankType>('recent')
const page = ref(1)
const players = ref<PlayerRanking[]>([])
const meta = ref<PlayersMeta>()
const pending = ref(false)

const { players: fetchPlayers } = useTrophies()
const totalPages = computed(() => meta.value?.total_pages ?? 1)

async function load() {
  pending.value = true
  try {
    const res = await fetchPlayers(props.id, { type: type.value, page: page.value })
    players.value = res.data
    meta.value = res.meta
  } finally {
    pending.value = false
  }
}

function selectType(t: PlayerRankType) {
  if (t === type.value) return
  type.value = t
  page.value = 1
  load()
}

function setPage(p: number) {
  if (p === page.value) return
  page.value = p
  load()
}

// (Re)load with a fresh state each time the dialog opens, honoring initialType.
watch(() => props.open, (v) => {
  if (!v) return
  type.value = props.initialType
  page.value = 1
  load()
})

function tiers(p: PlayerRanking) {
  return [
    { dot: 'bg-cyan-400', count: p.earned_platinum },
    { dot: 'bg-amber-400', count: p.earned_gold },
    { dot: 'bg-slate-400', count: p.earned_silver },
    { dot: 'bg-orange-400', count: p.earned_bronze },
  ]
}

function rankClass(rank: number) {
  if (rank === 1) return 'bg-amber-100 text-amber-700'
  if (rank === 2) return 'bg-slate-200 text-slate-600'
  if (rank === 3) return 'bg-orange-100 text-orange-700'
  return 'text-slate-400'
}
</script>

<template>
  <Dialog
    :open="open"
    size="2xl"
    title="玩家排行"
    @update:open="emit('update:open', $event)"
  >
    <!-- Sort tabs (sticky atop the scroll area) -->
    <div class="sticky top-0 z-10 border-b border-slate-100 bg-white/90 px-3 py-2.5 backdrop-blur sm:px-4">
      <div class="flex gap-1">
        <button
          v-for="t in tabs"
          :key="t.value"
          type="button"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition"
          :class="type === t.value
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'"
          @click="selectType(t.value)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending && !players.length" class="divide-y divide-slate-100">
      <div v-for="i in 8" :key="i" class="flex items-center gap-3 px-4 py-3">
        <div class="size-6 shrink-0 animate-pulse rounded-md bg-slate-200" />
        <div class="size-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
        <div class="flex-1 space-y-2">
          <div class="h-3.5 w-1/3 animate-pulse rounded bg-slate-200" />
          <div class="h-2.5 w-1/4 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <p v-else-if="!players.length" class="px-5 py-16 text-center text-sm text-slate-400">
      暂无玩家记录。
    </p>

    <!-- List -->
    <ul v-else class="divide-y divide-slate-100 transition-opacity" :class="{ 'opacity-50': pending }">
      <li v-for="p in players" :key="p.psnid">
        <NuxtLink
          :to="`/p/${p.psnid}`"
          class="group flex items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50 sm:px-5"
          @click="emit('update:open', false)"
        >
          <span class="grid size-7 shrink-0 place-items-center rounded-md text-xs font-bold tabular-nums" :class="rankClass(p.rank)">
            {{ p.rank }}
          </span>
          <img :src="p.avatar_url" :alt="p.psnid" class="size-10 shrink-0 rounded-full bg-slate-100 object-cover" />

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="truncate text-sm font-semibold text-slate-900 group-hover:text-slate-700">{{ p.psnid }}</span>
              <LucideIcon v-if="p.earned_platinum > 0" :icon="Trophy" class="size-3.5 shrink-0 text-cyan-500" />
            </div>
            <div class="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
              <span>{{ formatRegion(p.country) }}</span>
              <span>·</span>
              <span v-if="type === 'speedrun'" class="inline-flex items-center gap-1 font-medium text-slate-500">
                <LucideIcon :icon="Timer" class="size-3" />{{ formatDuration(p.gap) }}
              </span>
              <span v-else>{{ fmtDateTime(p.last_updated_at) }}</span>
            </div>
          </div>

          <!-- Trophy breakdown -->
          <div class="hidden shrink-0 items-center gap-2.5 text-xs text-slate-500 sm:flex">
            <span v-for="(t, i) in tiers(p)" :key="i" class="inline-flex items-center gap-0.5">
              <span class="size-2 rounded-full" :class="t.dot" />{{ t.count }}
            </span>
          </div>

          <div class="w-12 shrink-0 text-right text-sm font-bold text-slate-900 tabular-nums">{{ p.progress }}%</div>
        </NuxtLink>
      </li>
    </ul>

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <span class="text-xs text-slate-400">共 {{ fmt(meta?.total) }} 名玩家</span>
        <Pagination v-if="totalPages > 1" :page="page" :total-pages="totalPages" @update:page="setPage" />
      </div>
    </template>
  </Dialog>
</template>
