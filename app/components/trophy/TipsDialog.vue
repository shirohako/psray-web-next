<script setup lang="ts">
import { AlertTriangle, LogIn, MessageSquare, Pencil, Plus, RotateCw } from 'lucide'
import { useTips } from '~/services/tips'
import type { TrophyTip, TrophyTipPageMeta } from '~/types/tip'

const props = defineProps<{
  trophyId: number | string
  trophyName?: string
  open: boolean
}>()
const emit = defineEmits<{
  'update:open': [v: boolean]
  compose: [mode: 'create' | 'edit']
  closed: []
  count: [value: number]
}>()

const route = useRoute()
const { loggedIn } = useAuth()
const { forTrophy } = useTips()
const page = ref(1)
const tips = ref<TrophyTip[]>([])
const meta = ref<TrophyTipPageMeta>()
const pending = ref(false)
const loadError = ref(false)

const totalPages = computed(() => meta.value?.total_pages ?? 1)
const loginTo = computed(() => ({
  path: '/auth/login',
  query: { redirect: route.fullPath },
}))
async function load() {
  pending.value = true
  loadError.value = false
  try {
    const res = await forTrophy(props.trophyId, { page: page.value })
    tips.value = res.data
    meta.value = res.meta
    emit('count', res.meta?.total ?? res.data.length)
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

watch(() => props.open, (value) => {
  if (!value) return
  page.value = 1
  load()
}, { immediate: true })
</script>

<template>
  <Dialog :open="open" size="4xl" @update:open="emit('update:open', $event)" @closed="emit('closed')">
    <template #title>
      {{ $t('trophy.tips.title') }}
      <span v-if="trophyName" class="ml-1 font-normal text-slate-400">· {{ trophyName }}</span>
    </template>

    <section class="border-b border-slate-100 bg-slate-50/60 p-4 sm:p-5">
      <button
        v-if="loggedIn"
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
        :disabled="pending"
        @click="emit('compose', meta?.has_my_tip ? 'edit' : 'create')"
      >
        <LucideIcon :icon="meta?.has_my_tip ? Pencil : Plus" class="size-4" />
        {{ $t(meta?.has_my_tip ? 'trophy.tips.form.edit' : 'trophy.tips.form.open') }}
      </button>

      <div v-else class="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-center sm:flex-row sm:text-left">
        <div>
          <p class="text-sm font-semibold text-slate-800">{{ $t('trophy.tips.form.loginTitle') }}</p>
          <p class="mt-0.5 text-xs text-slate-400">{{ $t('trophy.tips.form.loginHint') }}</p>
        </div>
        <NuxtLink :to="loginTo" class="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          <LucideIcon :icon="LogIn" class="size-4" />
          {{ $t('nav.login') }}
        </NuxtLink>
      </div>
    </section>

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

    <div v-else-if="loadError && !tips.length" class="flex flex-col items-center gap-3 px-5 py-14 text-center">
      <LucideIcon :icon="AlertTriangle" class="size-8 text-rose-400" />
      <p class="text-sm text-slate-500">{{ $t('trophy.tips.loadFailed') }}</p>
      <button type="button" class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" @click="load">
        <LucideIcon :icon="RotateCw" class="size-4" />
        {{ $t('common.retry') }}
      </button>
    </div>

    <div v-else-if="!tips.length" class="flex flex-col items-center gap-2 px-5 py-16 text-center text-slate-400">
      <LucideIcon :icon="MessageSquare" class="size-8" />
      <p class="text-sm">{{ $t('trophy.tips.empty') }}</p>
    </div>

    <ul v-else class="divide-y divide-slate-100 transition-opacity" :class="{ 'opacity-50': pending }">
      <li v-for="tip in tips" :key="tip.id">
        <TrophyTipCard :tip="tip" />
      </li>
    </ul>

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <span class="text-xs text-slate-400">{{ $t('trophy.tips.total', { count: fmt(meta?.total) }) }}</span>
        <Pagination :page="page" :total-pages="totalPages" @update:page="setPage" />
      </div>
    </template>
  </Dialog>
</template>
