<script setup lang="ts">
import { RefreshCw, Search, Clock, Loader, CheckCircle2, XCircle, SkipForward, Activity, ListOrdered, Gamepad2, ArrowRight, SendHorizontal } from 'lucide'
import { ApiError } from '~/utils/ApiError'
import { useSync, type SyncStatus, type SyncStatusInfo } from '~/services/sync'

const { t } = useI18n()
const sync = useSync()

useSeo({
  title: () => t('seo.sync.title'),
  description: () => t('seo.sync.description'),
  // Queue-submission tooling, not content: nothing here belongs in an index.
  noindex: true,
})

const psnid = ref('')
const submitting = ref(false)
const errorMessage = ref('')
/** The submitted PSN profile is private — show the dedicated notice, not an error row. */
const profilePrivate = ref(false)

/** The PSN ID we're currently polling status for. */
const activePsnid = ref('')
const info = ref<SyncStatusInfo | null>(null)
const polling = ref(false)
const POLL_INTERVAL_MS = 5000
const REFRESHING_MIN_MS = 650
const countdown = ref(POLL_INTERVAL_MS / 1000)
const refreshing = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

const canSubmit = computed(() => psnid.value.trim() !== '' && !submitting.value)
const progress = computed(() => Math.max(0, Math.min(100, info.value?.progress ?? 0)))

/** Badge / progress-bar / accent styling per lifecycle state. */
const STATUS_META: Record<SyncStatus, { labelKey: string; pill: string; bar: string; text: string; icon: typeof Clock; spin?: boolean }> = {
  queued: { labelKey: 'sync.status.queued', pill: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400', text: 'text-slate-500', icon: Clock },
  calculating: { labelKey: 'sync.status.calculating', pill: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500', text: 'text-amber-600', icon: Loader, spin: true },
  syncing: { labelKey: 'sync.status.syncing', pill: 'bg-sky-50 text-sky-600', bar: 'bg-sky-500', text: 'text-sky-600', icon: Loader, spin: true },
  completed: { labelKey: 'sync.status.completed', pill: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500', text: 'text-emerald-600', icon: CheckCircle2 },
  failed: { labelKey: 'sync.status.failed', pill: 'bg-rose-50 text-rose-600', bar: 'bg-rose-500', text: 'text-rose-600', icon: XCircle },
}
const meta = computed(() => info.value ? STATUS_META[info.value.status] : null)
const inProgress = computed(() =>
  !!info.value && info.value.status !== 'completed' && info.value.status !== 'failed')

function stopPolling() {
  if (pollTimer) clearInterval(pollTimer)
  if (countdownTimer) clearInterval(countdownTimer)
  pollTimer = null
  countdownTimer = null
  polling.value = false
  refreshing.value = false
  countdown.value = POLL_INTERVAL_MS / 1000
}

function resetCountdown() {
  countdown.value = POLL_INTERVAL_MS / 1000
}

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer)
  resetCountdown()
  countdownTimer = setInterval(() => {
    countdown.value = Math.max(1, countdown.value - 1)
  }, 1000)
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function pollWithRefreshTransition() {
  countdown.value = 0
  refreshing.value = true
  const startedAt = Date.now()

  await pollOnce()

  const remaining = REFRESHING_MIN_MS - (Date.now() - startedAt)
  if (remaining > 0) await wait(remaining)

  if (!polling.value) return
  resetCountdown()
  refreshing.value = false
}

async function pollOnce() {
  if (!activePsnid.value) return
  try {
    const s = await sync.status(activePsnid.value)
    if (!s) {
      if (info.value) {
        info.value = null
        stopPolling()
      }
      return
    }
    info.value = s
    if (s.status === 'completed' || s.status === 'failed') stopPolling()
  }
  catch (error) {
    // Right after submit the status row may not exist yet — keep polling.
    if (error instanceof ApiError && error.code === 'NOT_FOUND') return
    errorMessage.value = error instanceof ApiError ? error.message : t('sync.errors.status')
    stopPolling()
  }
}

async function startPollingFor(id: string) {
  activePsnid.value = id
  polling.value = true
  await pollOnce()
  // First read may have hit a terminal state already; only keep polling if not.
  if (polling.value) {
    startCountdown()
    pollTimer = setInterval(async () => {
      await pollWithRefreshTransition()
    }, POLL_INTERVAL_MS)
  }
}

async function onSubmit() {
  if (!canSubmit.value) return

  const id = psnid.value.trim()
  errorMessage.value = ''
  profilePrivate.value = false
  info.value = null
  stopPolling()
  submitting.value = true

  try {
    await sync.submit(id)
    await startPollingFor(id)
  }
  catch (error) {
    if (error instanceof ApiError) {
      if (error.code === 'SYNC_IN_PROGRESS') {
        await startPollingFor(id)
        return
      }

      if (error.code === 'PSN_PROFILE_PRIVATE') {
        profilePrivate.value = true
        return
      }

      errorMessage.value = error.code === 'SYNC_WORKER_UNAVAILABLE'
        ? t('sync.errors.workerUnavailable')
        : error.message || t('sync.errors.submit')
    }
    else {
      errorMessage.value = t('sync.errors.submitRetry')
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
  <div class="mx-auto max-w-xl space-y-6">
    <!-- Submit form -->
    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex items-start gap-3.5">
        <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-900 text-white">
          <LucideIcon :icon="RefreshCw" class="size-5" />
        </span>
        <div>
          <h2 class="text-base font-semibold text-slate-900">{{ $t('sync.heading') }}</h2>
          <p class="mt-1 text-sm text-slate-500">{{ $t('sync.subheading') }}</p>
        </div>
      </div>

      <form class="mt-4 flex gap-2" @submit.prevent="onSubmit">
        <div class="relative flex-1">
          <LucideIcon
            :icon="Search"
            class="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
          />
          <input
            v-model="psnid"
            type="text"
            placeholder="PSN ID"
            autocapitalize="off"
            autocomplete="off"
            spellcheck="false"
            class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-2.5 text-xs text-slate-900 transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          :disabled="!canSubmit"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-slate-900/30 transition hover:bg-slate-800 active:bg-slate-950 disabled:opacity-40 disabled:hover:bg-slate-900"
        >
          <LucideIcon
            :icon="submitting ? Loader : SendHorizontal"
            class="size-3.5"
            :class="{ 'animate-spin': submitting }"
          />
          {{ submitting ? $t('sync.cta.submitting') : $t('sync.cta.submit') }}
        </button>
      </form>

      <p
        v-if="errorMessage"
        class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700"
      >
        {{ errorMessage }}
      </p>

      <PrivateProfileNotice v-if="profilePrivate" class="mt-4" :title="$t('sync.private.title')">
        {{ $t('sync.private.line1') }}<br>
        {{ $t('sync.private.line2') }}
      </PrivateProfileNotice>
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
            {{ $t(meta.labelKey) }}
          </span>
        </div>
        <span
          v-if="polling"
          class="inline-flex h-5 shrink-0 items-center gap-1.5 overflow-hidden text-xs font-medium text-slate-400"
        >
          <Transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-1 opacity-0"
            leave-active-class="transition duration-150 ease-in"
            leave-to-class="-translate-y-1 opacity-0"
          >
            <span v-if="refreshing" key="refreshing" class="inline-flex items-center gap-1.5 text-slate-500">
              <LucideIcon :icon="RefreshCw" class="size-3.5 animate-spin text-slate-400" />
              {{ $t('sync.poll.refreshing') }}
            </span>
            <span v-else key="countdown" class="inline-flex items-center gap-1.5">
              <span class="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              {{ $t('sync.poll.countdown', { seconds: countdown }) }}
            </span>
          </Transition>
        </span>
      </div>

      <!-- Wizard animation while a sync is running -->
      <div v-if="inProgress" class="my-4 flex h-44 items-center justify-center overflow-hidden sm:my-6">
        <LoaderWizard class="scale-[0.7]" />
      </div>

      <!-- Focal metric: synced / total + progress -->
      <div :class="inProgress ? '' : 'mt-5'">
        <div class="flex items-end justify-between gap-3">
          <div v-if="info.total > 0" class="flex items-baseline gap-1.5">
            <span class="text-2xl font-bold tabular-nums text-slate-900">
              <AnimatedNumber :value="info.completed" />
            </span>
            <span class="text-sm text-slate-400">
              /
              <AnimatedNumber :value="info.total" />
              {{ $t('sync.gamesUnit') }}
            </span>
          </div>
          <span v-else class="text-sm text-slate-400">
            {{ info.status === 'queued' ? $t('sync.waitingWorker') : $t('sync.calculating') }}
          </span>
          <span class="text-2xl font-bold tabular-nums" :class="meta.text">
            <AnimatedNumber :value="progress" />%
          </span>
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
        <i18n-t keypath="sync.queueAhead" scope="global" tag="span" :plural="info.queue_ahead">
          <template #badge>
            <span class="font-semibold text-slate-700">{{ info.queue_ahead }}</span>
          </template>
        </i18n-t>
      </p>
      <p
        v-else-if="info.status === 'syncing' && info.current_game"
        class="mt-3 flex min-w-0 items-center gap-2 text-sm text-slate-500"
      >
        <LucideIcon :icon="Gamepad2" class="size-4 shrink-0 text-slate-400" />
        <span class="shrink-0">{{ $t('sync.currentGame') }}</span>
        <span class="truncate font-mono text-xs text-slate-700">{{ info.current_game }}</span>
      </p>

      <!-- Anomalies: only surfaced when they actually occur -->
      <div v-if="info.failed > 0 || info.skipped > 0" class="mt-3 flex flex-wrap gap-2">
        <span
          v-if="info.failed > 0"
          class="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600"
        >
          <LucideIcon :icon="XCircle" class="size-3.5" />
          {{ $t('sync.failedCount', { count: info.failed }) }}
        </span>
        <span
          v-if="info.skipped > 0"
          class="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600"
        >
          <LucideIcon :icon="SkipForward" class="size-3.5" />
          {{ $t('sync.skippedCount', { count: info.skipped }) }}
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
        {{ $t('sync.goToProfile') }}
        <LucideIcon :icon="ArrowRight" class="size-4" />
      </NuxtLink>

      <!-- Queue overview + last-updated -->
      <hr class="mt-5 border-slate-100" />
      <div class="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-slate-400">
        <span class="inline-flex items-center gap-1.5">
          <LucideIcon :icon="Activity" class="size-3.5" />
          <i18n-t keypath="sync.queueOverview" scope="global" tag="span">
            <template #active>
              <span class="font-semibold tabular-nums text-sky-600">{{ info.active_queue_count }}</span>
            </template>
            <template #waiting>
              <span class="font-semibold tabular-nums text-slate-600">{{ info.waiting_queue_count }}</span>
            </template>
          </i18n-t>
        </span>
        <span v-if="info.updated_at">{{ $t('sync.updatedAt', { time: fmtDateTime(info.updated_at) }) }}</span>
      </div>
    </section>
  </div>
</template>
