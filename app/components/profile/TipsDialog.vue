<script setup lang="ts">
import { AlertTriangle, MessageSquare, RotateCw } from 'lucide'
import { useTips } from '~/services/tips'
import type { ProfileTip, TipPageMeta } from '~/types/tip'
import { hasTipTrophy } from '~/utils/tip'

const props = defineProps<{
  psnid: string
  open: boolean
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()
const { forProfile } = useTips()
const page = ref(1)
const tips = ref<ProfileTip[]>([])
const meta = ref<TipPageMeta>()
const pending = ref(false)
const loadError = ref(false)

const totalPages = computed(() => meta.value?.total_pages ?? 1)

async function load() {
  pending.value = true
  loadError.value = false
  try {
    const response = await forProfile(props.psnid, { page: page.value })
    tips.value = response.data.filter(hasTipTrophy)
    meta.value = response.meta
  }
  catch {
    loadError.value = true
  }
  finally {
    pending.value = false
  }
}

function setPage(value: number) {
  if (value === page.value) return
  page.value = value
  load()
}

watch(() => props.open, (open) => {
  if (!open) return
  page.value = 1
  load()
})
</script>

<template>
  <Dialog :open="open" size="4xl" @update:open="emit('update:open', $event)">
    <template #title>
      {{ $t('profile.tips.dialogTitle') }}
      <span class="ml-1 font-normal text-slate-400">· {{ psnid }}</span>
    </template>

    <div v-if="pending && !tips.length" class="space-y-4 p-5">
      <div v-for="index in 5" :key="index" class="flex gap-3">
        <div class="size-12 shrink-0 animate-pulse rounded-lg bg-slate-200" />
        <div class="flex-1 space-y-2">
          <div class="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
          <div class="h-3 w-full animate-pulse rounded bg-slate-100" />
          <div class="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>

    <div v-else-if="loadError && !tips.length" class="flex flex-col items-center gap-3 px-5 py-14 text-center">
      <LucideIcon :icon="AlertTriangle" class="size-8 text-rose-400" />
      <p class="text-sm text-slate-500">{{ $t('profile.tips.loadFailed') }}</p>
      <button type="button" class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" @click="load">
        <LucideIcon :icon="RotateCw" class="size-4" />
        {{ $t('common.retry') }}
      </button>
    </div>

    <div v-else-if="!tips.length" class="flex flex-col items-center gap-2 px-5 py-16 text-center text-slate-400">
      <LucideIcon :icon="MessageSquare" class="size-8" />
      <p class="text-sm">{{ $t('profile.tips.empty') }}</p>
    </div>

    <div v-else class="divide-y divide-slate-100 transition-opacity" :class="{ 'opacity-50': pending }">
      <ProfileTipItem v-for="tip in tips" :key="tip.id" :tip="tip" />
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <span class="text-xs text-slate-400">{{ $t('profile.tips.total', { count: fmt(meta?.total) }) }}</span>
        <Pagination :page="page" :total-pages="totalPages" @update:page="setPage" />
      </div>
    </template>
  </Dialog>
</template>
