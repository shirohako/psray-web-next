<script setup lang="ts">
import { MessageSquare } from 'lucide'
import { useTrophies, type TrophyTip, type PlayersMeta } from '~/services/trophies'

const props = defineProps<{
  /** Trophy database id (matches `Trophy.id`). */
  trophyId: number | string
  /** Trophy name, shown in the dialog title. */
  trophyName?: string
  open: boolean
}>()
const emit = defineEmits<{ 'update:open': [v: boolean] }>()

const { trophyTips } = useTrophies()
const page = ref(1)
const tips = ref<TrophyTip[]>([])
const meta = ref<PlayersMeta>()
const pending = ref(false)

const totalPages = computed(() => meta.value?.total_pages ?? 1)

async function load() {
  pending.value = true
  try {
    const res = await trophyTips(props.trophyId, { page: page.value })
    tips.value = res.data
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
  <Dialog :open="open" size="xl" @update:open="emit('update:open', $event)">
    <template #title>
      奖杯留言
      <span v-if="trophyName" class="ml-1 font-normal text-slate-400">· {{ trophyName }}</span>
    </template>

    <!-- Loading -->
    <div v-if="pending && !tips.length" class="space-y-4 p-5">
      <div v-for="i in 4" :key="i" class="flex gap-3">
        <div class="size-9 shrink-0 animate-pulse rounded-full bg-slate-200" />
        <div class="flex-1 space-y-2">
          <div class="h-3 w-1/4 animate-pulse rounded bg-slate-200" />
          <div class="h-3 w-full animate-pulse rounded bg-slate-200" />
          <div class="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!tips.length" class="flex flex-col items-center gap-2 px-5 py-16 text-center text-slate-400">
      <LucideIcon :icon="MessageSquare" class="size-8" />
      <p class="text-sm">还没有玩家留言。</p>
    </div>

    <!-- List -->
    <ul v-else class="divide-y divide-slate-100 transition-opacity" :class="{ 'opacity-50': pending }">
      <li v-for="tip in tips" :key="tip.id">
        <TrophyTipCard :tip="tip" />
      </li>
    </ul>

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <span class="text-xs text-slate-400">共 {{ fmt(meta?.total) }} 条留言</span>
        <Pagination :page="page" :total-pages="totalPages" @update:page="setPage" />
      </div>
    </template>
  </Dialog>
</template>
