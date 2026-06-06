<script setup lang="ts">
import { useTrophies, type TrophyPlayer, type PlayersMeta } from '~/services/trophies'

const props = defineProps<{
  /** Trophy database id (matches `Trophy.id`). */
  trophyId: number | string
  /** Trophy name, shown in the dialog title. */
  trophyName?: string
  open: boolean
}>()
const emit = defineEmits<{ 'update:open': [v: boolean] }>()

const { trophyPlayers } = useTrophies()
const page = ref(1)
const players = ref<TrophyPlayer[]>([])
const meta = ref<PlayersMeta>()
const pending = ref(false)

const totalPages = computed(() => meta.value?.total_pages ?? 1)

async function load() {
  pending.value = true
  try {
    const res = await trophyPlayers(props.trophyId, { page: page.value })
    players.value = res.data
    meta.value = res.meta
  } finally {
    pending.value = false
  }
}

function setPage(p: number) {
  if (p === page.value) return
  page.value = p
  load()
}

// (Re)load fresh each time the dialog opens.
watch(() => props.open, (v) => {
  if (!v) return
  page.value = 1
  load()
})
</script>

<template>
  <Dialog
    :open="open"
    size="lg"
    @update:open="emit('update:open', $event)"
  >
    <template #title>
      近期获得的玩家
      <span v-if="trophyName" class="ml-1 font-normal text-slate-400">· {{ trophyName }}</span>
    </template>

    <!-- Loading -->
    <div v-if="pending && !players.length" class="divide-y divide-slate-100">
      <div v-for="i in 8" :key="i" class="flex items-center gap-3 px-4 py-3 sm:px-5">
        <div class="size-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
        <div class="flex-1 space-y-2">
          <div class="h-3.5 w-1/3 animate-pulse rounded bg-slate-200" />
          <div class="h-2.5 w-1/4 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <p v-else-if="!players.length" class="px-5 py-16 text-center text-sm text-slate-400">
      还没有玩家获得这个奖杯。
    </p>

    <!-- List -->
    <ul v-else class="divide-y divide-slate-100 transition-opacity" :class="{ 'opacity-50': pending }">
      <li v-for="p in players" :key="p.psnid">
        <NuxtLink
          :to="`/p/${p.psnid}`"
          class="group flex items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50 sm:px-5"
          @click="emit('update:open', false)"
        >
          <img :src="p.avatar_url" :alt="p.psnid" class="size-10 shrink-0 rounded-full bg-slate-100 object-cover" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <RegionFlag :country="p.country" class="text-xs" />
              <span class="truncate text-sm font-semibold text-slate-900 group-hover:text-slate-700">{{ p.psnid }}</span>
            </div>
            <div class="mt-0.5 text-xs tabular-nums text-slate-400">{{ fmtDateTime(p.earned_at) }} 获得</div>
          </div>
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
