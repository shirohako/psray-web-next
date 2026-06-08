<script setup lang="ts">
import {
  CheckCircle2, Info, AlertTriangle, XCircle, Bell, X,
} from 'lucide'
import type { ToastColor, ToastItem } from '~/composables/useToast'

/**
 * Toaster — a faithful port of Nuxt UI v4's `Toast`/`Toaster`.
 * https://github.com/nuxt/ui/blob/v4/src/runtime/components/Toast.vue
 *
 * Restores the original's signature behaviours:
 * - Stacked layout that fans open on hover (`expand`), with the stack collapsing
 *   newer toasts behind the front one (scaled + offset).
 * - Auto-dismiss that pauses while the cursor is over the stack — both the timer
 *   and the progress bar freeze, then resume on leave.
 * - Title / description / leading icon / actions / close button / progress bar.
 */
const props = withDefaults(defineProps<{
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  /** Default auto-dismiss delay (ms). Per-toast `duration` overrides it; `0` keeps it open. */
  duration?: number
  /** Maximum number of toasts shown at once (older ones drop off). */
  max?: number
  /** Always fan the toasts open. When `false`, they collapse into a stack and expand on hover. */
  expand?: boolean
}>(), {
  position: 'bottom-right',
  duration: 5000,
  max: 5,
  expand: true,
})

const GAP = 16

const { toasts, remove } = useToast()

// Oldest first, newest last (the "front" of the stack), capped to `max`.
const visibleToasts = computed(() => toasts.value.slice(-props.max))

const isTop = computed(() => props.position.startsWith('top'))
const isCenter = computed(() => props.position.endsWith('center'))

const hovered = ref(false)
const expanded = computed(() => props.expand || hovered.value)

// ── Measured heights (per id) drive the stack offsets and viewport height ─────
const heights = reactive<Record<string, number>>({})

// Created eagerly (client-only) so it's ready when the v-for ref callbacks fire,
// which happens before `onMounted`.
const observer = import.meta.client
  ? new ResizeObserver((entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.toastId
        if (id) heights[id] = entry.contentRect.height
      }
    })
  : null

function setItemRef(id: string, el: Element | null) {
  if (el instanceof HTMLElement) {
    heights[id] = el.getBoundingClientRect().height
    observer?.observe(el)
  }
}

const stackHeight = computed(() => {
  const items = visibleToasts.value
  if (!items.length) return 0
  if (expanded.value)
    return items.reduce((acc, t) => acc + (heights[t.id] ?? 0) + GAP, 0) - GAP
  return heights[items[items.length - 1]!.id] ?? 0
})

/** Collapsed: newer toasts peek behind (offset + scaled). Expanded: a spaced list. */
function itemStyle(index: number) {
  const items = visibleToasts.value
  const before = items.length - 1 - index
  const sign = isTop.value ? 1 : -1

  let offset = 0
  for (let j = index + 1; j < items.length; j++)
    offset += (heights[items[j]!.id] ?? 0) + GAP

  const translate = expanded.value ? offset * sign : before * GAP * sign
  const scale = expanded.value ? 1 : Math.max(1 - before * 0.05, 0)

  return {
    transform: `translateY(${translate}px) scale(${scale})`,
    transformOrigin: isTop.value ? 'top center' : 'bottom center',
    zIndex: index,
    [isTop.value ? 'top' : 'bottom']: '0',
  }
}

// ── Auto-dismiss with pause-on-hover ─────────────────────────────────────────
interface Timer { remaining: number, start: number, handle?: ReturnType<typeof setTimeout> }
const timers = new Map<string, Timer>()

function toastDuration(toast: ToastItem) {
  return toast.duration ?? props.duration
}

function dismiss(id: string) {
  const timer = timers.get(id)
  if (timer?.handle) clearTimeout(timer.handle)
  timers.delete(id)
  remove(id)
}

function arm(id: string) {
  const timer = timers.get(id)
  if (!timer || timer.handle) return
  if (timer.remaining <= 0) return dismiss(id)
  timer.start = Date.now()
  timer.handle = setTimeout(() => dismiss(id), timer.remaining)
}

function pauseAll() {
  for (const timer of timers.values()) {
    if (!timer.handle) continue
    clearTimeout(timer.handle)
    timer.remaining -= Date.now() - timer.start
    timer.handle = undefined
  }
}

function resumeAll() {
  for (const id of timers.keys()) arm(id)
}

function syncTimers() {
  for (const id of [...timers.keys()]) {
    if (!visibleToasts.value.some(t => t.id === id)) {
      const timer = timers.get(id)
      if (timer?.handle) clearTimeout(timer.handle)
      timers.delete(id)
    }
  }
  for (const toast of visibleToasts.value) {
    if (timers.has(toast.id)) continue
    const duration = toastDuration(toast)
    if (duration <= 0) continue
    timers.set(toast.id, { remaining: duration, start: 0 })
    if (!hovered.value) arm(toast.id)
  }
}

async function runAction(id: string, event: MouseEvent, action: NonNullable<ToastItem['actions']>[number]) {
  await action.onClick?.(event)
  dismiss(id)
}

watch(hovered, paused => (paused ? pauseAll() : resumeAll()))

watch(
  () => visibleToasts.value.map(t => `${t.id}:${t.createdAt}`).join(','),
  () => syncTimers(),
  { immediate: true, flush: 'post' },
)

onUnmounted(() => {
  observer?.disconnect()
  for (const timer of timers.values())
    if (timer.handle) clearTimeout(timer.handle)
  timers.clear()
})

// ── Presentation ─────────────────────────────────────────────────────────────
const positionClass = computed(() => ({
  'top-right': 'top-4 right-4 sm:top-6 sm:right-6',
  'top-left': 'top-4 left-4 sm:top-6 sm:left-6',
  'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
  'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 sm:top-6',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6',
}[props.position]))

const colorClasses: Record<ToastColor, { icon: string, progress: string }> = {
  neutral: { icon: 'text-zinc-900', progress: 'bg-zinc-900' },
  success: { icon: 'text-emerald-500', progress: 'bg-emerald-500' },
  info: { icon: 'text-sky-500', progress: 'bg-sky-500' },
  warning: { icon: 'text-amber-500', progress: 'bg-amber-500' },
  error: { icon: 'text-rose-500', progress: 'bg-rose-500' },
}

const fallbackIcons = {
  neutral: Bell,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visibleToasts.length"
      class="fixed z-100 w-[calc(100vw-2rem)] sm:w-96"
      :class="positionClass"
      :style="{ height: `${stackHeight}px` }"
      style="transition: height 0.3s ease"
      aria-live="polite"
      aria-atomic="true"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <article
          v-for="(toast, index) in visibleToasts"
          :key="toast.id"
          :ref="el => setItemRef(toast.id, el as Element | null)"
          :data-toast-id="toast.id"
          class="absolute inset-x-0 flex gap-2.5 rounded-lg bg-white p-4 shadow-lg ring-1 ring-slate-200 transition-[transform] duration-300 ease-out will-change-transform"
          :class="isCenter && 'mx-auto'"
          :style="itemStyle(index)"
          role="status"
        >
          <!-- Leading icon -->
          <LucideIcon
            :icon="toast.icon ?? fallbackIcons[toast.color ?? 'neutral']"
            class="size-5 shrink-0"
            :class="colorClasses[toast.color ?? 'neutral'].icon"
          />

          <!-- Content -->
          <div class="flex w-0 flex-1 flex-col">
            <p v-if="toast.title" class="text-sm font-medium text-slate-900">
              {{ toast.title }}
            </p>
            <p
              v-if="toast.description"
              class="text-sm text-slate-500"
              :class="toast.title && 'mt-1'"
            >
              {{ toast.description }}
            </p>

            <!-- Vertical actions: under the text -->
            <div
              v-if="toast.actions?.length && toast.orientation !== 'horizontal'"
              class="mt-2.5 flex flex-wrap items-start gap-1.5"
            >
              <button
                v-for="action in toast.actions"
                :key="action.label"
                type="button"
                class="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                @click="runAction(toast.id, $event, action)"
              >
                <LucideIcon v-if="action.icon" :icon="action.icon" class="size-3.5" />
                {{ action.label }}
              </button>
            </div>
          </div>

          <!-- Horizontal actions + close -->
          <div class="flex shrink-0 items-center gap-1.5">
            <template v-if="toast.actions?.length && toast.orientation === 'horizontal'">
              <button
                v-for="action in toast.actions"
                :key="action.label"
                type="button"
                class="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                @click="runAction(toast.id, $event, action)"
              >
                <LucideIcon v-if="action.icon" :icon="action.icon" class="size-3.5" />
                {{ action.label }}
              </button>
            </template>
            <button
              v-if="toast.close !== false"
              type="button"
              class="-m-1 grid size-6 shrink-0 place-items-center rounded-md text-slate-400 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              aria-label="关闭"
              @click="dismiss(toast.id)"
            >
              <LucideIcon :icon="X" class="size-5" />
            </button>
          </div>

          <!-- Progress bar (freezes while the stack is hovered) -->
          <div
            v-if="toast.progress !== false && toastDuration(toast) > 0"
            class="absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-lg"
          >
            <div
              class="toast-progress-bar h-full w-full origin-left"
              :class="[colorClasses[toast.color ?? 'neutral'].progress, hovered && 'paused']"
              :style="{ animationDuration: `${toastDuration(toast)}ms` }"
            />
          </div>
        </article>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style>
.toast-progress-bar {
  animation-name: toast-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.toast-progress-bar.paused {
  animation-play-state: paused;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
</style>
