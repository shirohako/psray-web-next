<script setup lang="ts">
import { RefreshCw, Search, Clock, Loader, CheckCircle2, XCircle, SkipForward, Activity, ListOrdered, Gamepad2, ArrowRight } from 'lucide'
import { ApiError } from '~/utils/ApiError'
import { useSync, type SyncStatus, type SyncStatusInfo } from '~/services/sync'

useHead({ title: '同步资料 · PSRay' })

const sync = useSync()

const psnid = ref('')
const submitting = ref(false)
const errorMessage = ref('')

/** The PSN ID we're currently polling status for. */
const activePsnid = ref('')
const info = ref<SyncStatusInfo | null>(null)
const polling = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const canSubmit = computed(() => psnid.value.trim() !== '' && !submitting.value)
const progress = computed(() => Math.max(0, Math.min(100, info.value?.progress ?? 0)))

/** Badge / progress-bar / accent styling per lifecycle state. */
const STATUS_META: Record<SyncStatus, { label: string; pill: string; bar: string; text: string; icon: typeof Clock; spin?: boolean }> = {
  queued: { label: '排队中', pill: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400', text: 'text-slate-500', icon: Clock },
  calculating: { label: '计算中', pill: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500', text: 'text-amber-600', icon: Loader, spin: true },
  syncing: { label: '同步中', pill: 'bg-sky-50 text-sky-600', bar: 'bg-sky-500', text: 'text-sky-600', icon: Loader, spin: true },
  completed: { label: '已完成', pill: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500', text: 'text-emerald-600', icon: CheckCircle2 },
  failed: { label: '失败', pill: 'bg-rose-50 text-rose-600', bar: 'bg-rose-500', text: 'text-rose-600', icon: XCircle },
}
const meta = computed(() => info.value ? STATUS_META[info.value.status] : null)
const inProgress = computed(() =>
  !!info.value && info.value.status !== 'completed' && info.value.status !== 'failed')

function stopPolling() {
  if (timer) clearInterval(timer)
  timer = null
  polling.value = false
}

async function pollOnce() {
  if (!activePsnid.value) return
  try {
    const s = await sync.status(activePsnid.value)
    info.value = s
    if (s.status === 'completed' || s.status === 'failed') stopPolling()
  }
  catch (error) {
    // Right after submit the status row may not exist yet — keep polling.
    if (error instanceof ApiError && error.code === 'NOT_FOUND') return
    errorMessage.value = error instanceof ApiError ? error.message : '获取同步进度失败。'
    stopPolling()
  }
}

async function onSubmit() {
  if (!canSubmit.value) return

  const id = psnid.value.trim()
  errorMessage.value = ''
  info.value = null
  stopPolling()
  submitting.value = true

  try {
    await sync.submit(id)
    activePsnid.value = id
    polling.value = true
    await pollOnce()
    // First read may have hit a terminal state already; only keep polling if not.
    if (polling.value) timer = setInterval(pollOnce, 5000)
  }
  catch (error) {
    if (error instanceof ApiError) {
      errorMessage.value = error.code === 'SYNC_WORKER_UNAVAILABLE'
        ? '同步服务暂时不可用，请稍后再试。'
        : error.message || '提交同步请求失败。'
    }
    else {
      errorMessage.value = '提交同步请求失败，请稍后再试。'
    }
  }
  finally {
    submitting.value = false
  }
}

onBeforeUnmount(stopPolling)

// Prefill from links like `/sync?psnid=foo`, but never auto-submit. Syncing is
// intentionally user-triggered so opening a link cannot enqueue work by itself.
onMounted(() => {
  const q = useRoute().query.psnid
  const id = (Array.isArray(q) ? q[0] : q)?.trim()
  if (!id) return
  psnid.value = id
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <!-- Submit form -->
    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex items-start gap-3.5">
        <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-900 text-white">
          <LucideIcon :icon="RefreshCw" class="size-5" />
        </span>
        <div>
          <h2 class="text-base font-semibold text-slate-900">同步 PSN 资料</h2>
          <p class="mt-1 text-sm text-slate-500">输入 PSN ID 提交同步至服务器同步队列，后台会按顺序处理您的请求。</p>
        </div>
      </div>

      <form class="mt-4 flex gap-2" @submit.prevent="onSubmit">
        <div class="relative flex-1">
          <LucideIcon
            :icon="Search"
            class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />
          <input
            v-model="psnid"
            type="text"
            placeholder="PSN ID"
            autocapitalize="off"
            autocomplete="off"
            spellcheck="false"
            class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          :disabled="!canSubmit"
          class="shrink-0 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/30 transition hover:bg-slate-800 active:bg-slate-950 disabled:opacity-40 disabled:hover:bg-slate-900"
        >
          {{ submitting ? '提交中…' : '同步' }}
        </button>
      </form>

      <p
        v-if="errorMessage"
        class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700"
      >
        {{ errorMessage }}
      </p>
    </section>

    <!-- Live progress -->
    <section v-if="info && meta" class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <span class="truncate text-base font-semibold text-slate-900">{{ info.psnid }}</span>
          <span
            class="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="meta.pill"
          >
            <LucideIcon :icon="meta.icon" class="size-3.5" :class="{ 'animate-spin': meta.spin }" />
            {{ meta.label }}
          </span>
        </div>
        <span
          v-if="polling"
          class="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-400"
        >
          <span class="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          进度每 5 秒刷新
        </span>
      </div>

      <!-- Wizard animation while a sync is running -->
      <div v-if="inProgress" class="flex h-44 items-center justify-center overflow-hidden">
        <LoaderWizard class="scale-[0.7]" />
      </div>

      <!-- Focal metric: synced / total + progress -->
      <div :class="inProgress ? '' : 'mt-5'">
        <div class="flex items-end justify-between gap-3">
          <div v-if="info.total_games > 0" class="flex items-baseline gap-1.5">
            <span class="text-2xl font-bold tabular-nums text-slate-900">{{ info.synced_count }}</span>
            <span class="text-sm text-slate-400">/ {{ info.total_games }} 个游戏</span>
          </div>
          <span v-else class="text-sm text-slate-400">
            {{ info.status === 'queued' ? '等待 worker 领取…' : '正在计算需要同步的游戏…' }}
          </span>
          <span class="text-sm font-semibold tabular-nums" :class="meta.text">{{ progress }}%</span>
        </div>
        <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="meta.bar"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <!-- Contextual line (queue position / current game) -->
      <p
        v-if="info.status === 'queued' && info.queue_ahead != null"
        class="mt-3 flex items-center gap-2 text-sm text-slate-500"
      >
        <LucideIcon :icon="ListOrdered" class="size-4 text-slate-400" />
        前方还有 <span class="font-semibold text-slate-700">{{ info.queue_ahead }}</span> 个任务
      </p>
      <p
        v-else-if="info.status === 'syncing' && info.current_game"
        class="mt-3 flex min-w-0 items-center gap-2 text-sm text-slate-500"
      >
        <LucideIcon :icon="Gamepad2" class="size-4 shrink-0 text-slate-400" />
        <span class="shrink-0">正在同步</span>
        <span class="truncate font-mono text-xs text-slate-700">{{ info.current_game }}</span>
      </p>

      <!-- Anomalies: only surfaced when they actually occur -->
      <div v-if="info.failed_count > 0 || info.skipped_count > 0" class="mt-3 flex flex-wrap gap-2">
        <span
          v-if="info.failed_count > 0"
          class="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600"
        >
          <LucideIcon :icon="XCircle" class="size-3.5" />
          失败 {{ info.failed_count }}
        </span>
        <span
          v-if="info.skipped_count > 0"
          class="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600"
        >
          <LucideIcon :icon="SkipForward" class="size-3.5" />
          跳过 {{ info.skipped_count }}
        </span>
      </div>

      <!-- Failure reason -->
      <p
        v-if="info.status === 'failed' && info.error"
        class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700"
      >
        {{ info.error }}
      </p>

      <!-- Done: go to the profile -->
      <NuxtLink
        v-if="info.status === 'completed'"
        :to="`/p/${encodeURIComponent(info.psnid)}`"
        class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/30 transition hover:bg-slate-800 active:bg-slate-950"
      >
        前往个人资料
        <LucideIcon :icon="ArrowRight" class="size-4" />
      </NuxtLink>

      <!-- Queue overview + last-updated -->
      <hr class="mt-5 border-slate-100" />
      <div class="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-slate-400">
        <span class="inline-flex items-center gap-1.5">
          <LucideIcon :icon="Activity" class="size-3.5" />
          <span>
            <span class="font-semibold tabular-nums text-sky-600">{{ info.active_queue_count }}</span> 个同步任务正在执行，<span class="font-semibold tabular-nums text-slate-600">{{ info.waiting_queue_count }}</span> 人在排队。
          </span>
        </span>
        <span v-if="info.updated_at">更新于 {{ fmtDateTime(info.updated_at) }}</span>
      </div>
    </section>
  </div>
</template>
