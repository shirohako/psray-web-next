<script setup lang="ts">
import { animate, type JSAnimation } from 'animejs'
import { Clock, ChevronDown, ChevronRight, Globe } from 'lucide'
import type { PlayedTrophySet } from '~/services/profile'
import type { DisplayDensity } from '~/composables/usePreferences'

const props = defineProps<{ psnid: string }>()

interface PageMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

const page = ref(1)
const expanded = ref(false)
const animatedReady = ref(false)
const toggleIconTouched = ref(false)
const listEl = ref<HTMLElement | null>(null)
const listAnimation = shallowRef<JSAnimation | null>(null)
const { profileGameDensity } = usePreferences()

const densityStyles: Record<DisplayDensity, {
  row: string
  artColumn: string
  art: string
  mobileBadges: string
  title: string
  meta: string
  progress: string
  tiers: string
  chevron: string
}> = {
  dense: {
    row: 'gap-2.5 px-3 py-2 sm:items-center sm:px-4',
    artColumn: 'w-16 gap-1',
    art: 'h-12 w-16',
    mobileBadges: 'max-w-16 gap-0.5',
    title: 'text-sm',
    meta: 'mt-0.5',
    progress: 'mt-1.5 gap-2',
    tiers: 'mt-1 gap-2 text-[10px]',
    chevron: 'size-4',
  },
  compact: {
    row: 'gap-3 px-3 py-3 sm:items-center sm:px-4',
    artColumn: 'w-20 gap-1',
    art: 'h-15 w-20',
    mobileBadges: 'max-w-20 gap-0.5',
    title: 'text-sm',
    meta: 'mt-1',
    progress: 'mt-2 gap-2.5',
    tiers: 'mt-1 gap-2.5 text-[11px]',
    chevron: 'size-4.5',
  },
  standard: {
    row: 'gap-4 px-4 py-4 sm:items-center sm:px-5',
    artColumn: 'w-24 gap-1.5',
    art: 'h-18 w-24',
    mobileBadges: 'max-w-24 gap-1',
    title: '',
    meta: 'mt-1.5',
    progress: 'mt-2.5 gap-3',
    tiers: 'mt-1.5 gap-3 text-xs',
    chevron: 'size-5',
  },
}
const density = computed(() => densityStyles[profileGameDensity.value])
const collapsedListHeight = computed(() => ({
  dense: 280,
  compact: 340,
  standard: 400,
})[profileGameDensity.value])

// `page` is read inside the URL getter, so changing it re-fetches.
const { data: res, pending } = await useApiFetchRaw<PlayedTrophySet[], PageMeta>(
  () => `/profile/${props.psnid}/recently-played?page=${page.value}`,
)

const recent = computed(() => res.value?.data ?? [])
const totalPages = computed(() => res.value?.meta?.total_pages ?? 1)
const canCollapse = computed(() => recent.value.length > 4)

function trophySetName(g: PlayedTrophySet) {
  return g.trophy_set.localized_name || g.trophy_set.name
}

/** Per-tier earned counts in display order (platinum → bronze). */
function earnedTiers(g: PlayedTrophySet) {
  return [
    { dot: 'bg-cyan-400', count: g.earned_platinum },
    { dot: 'bg-amber-400', count: g.earned_gold },
    { dot: 'bg-slate-400', count: g.earned_silver },
    { dot: 'bg-orange-400', count: g.earned_bronze },
  ]
}

function isMobileViewport() {
  return import.meta.client && window.matchMedia('(max-width: 639.98px)').matches
}

function prefersReducedMotion() {
  return import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function targetListHeight() {
  const el = listEl.value
  if (!el) return collapsedListHeight.value
  return expanded.value || !canCollapse.value
    ? el.scrollHeight
    : Math.min(collapsedListHeight.value, el.scrollHeight)
}

function syncListHeight() {
  const el = listEl.value
  if (!el) return

  listAnimation.value?.cancel()
  listAnimation.value = null

  if (!canCollapse.value || !isMobileViewport()) {
    el.style.height = ''
    el.style.overflow = ''
    el.style.opacity = ''
    return
  }

  el.style.overflow = 'hidden'
  el.style.height = expanded.value ? 'auto' : `${targetListHeight()}px`
  el.style.opacity = ''
}

function toggleExpanded() {
  toggleIconTouched.value = true
  expanded.value = !expanded.value
}

async function animateListHeight(isExpanded: boolean) {
  await nextTick()

  const el = listEl.value
  if (!el) return

  if (!animatedReady.value || !canCollapse.value || !isMobileViewport() || prefersReducedMotion()) {
    syncListHeight()
    return
  }

  listAnimation.value?.cancel()

  const fromHeight = el.getBoundingClientRect().height
  el.style.height = `${fromHeight}px`
  el.style.overflow = 'hidden'

  await nextTick()

  const toHeight = isExpanded ? el.scrollHeight : Math.min(collapsedListHeight.value, el.scrollHeight)

  listAnimation.value = animate(el, {
    height: `${toHeight}px`,
    duration: isExpanded ? 1100 : 820,
    ease: isExpanded ? 'outQuart' : 'inOutCubic',
    onComplete: () => {
      el.style.height = isExpanded ? 'auto' : `${toHeight}px`
      el.style.overflow = 'hidden'
      el.style.opacity = ''
      listAnimation.value = null
    },
  })
}

watch(() => props.psnid, () => {
  expanded.value = false
})

watch(expanded, animateListHeight)

watch([recent, canCollapse, profileGameDensity], async () => {
  await nextTick()
  syncListHeight()
})

onMounted(async () => {
  await nextTick()
  animatedReady.value = true
  syncListHeight()
})

onBeforeUnmount(() => {
  listAnimation.value?.cancel()
})
</script>

<template>
  <div>
  <!-- Top pager (only when the current page is long enough to be worth it) -->
  <div
    v-if="totalPages > 1 && recent.length > 5"
    class="border-b border-slate-100 px-4 py-2.5"
  >
    <Pagination v-model:page="page" :total-pages="totalPages" />
  </div>

  <!-- Loading (initial only — on page change we keep the list visible) -->
  <div v-if="pending && !recent.length" class="divide-y divide-slate-100">
    <div v-for="i in 5" :key="i" class="flex items-center" :class="density.row">
      <div class="shrink-0 animate-pulse rounded-lg bg-slate-200" :class="density.art" />
      <div class="flex-1 space-y-2">
        <div class="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div class="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
        <div class="h-1.5 w-full animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  </div>

  <!-- Empty -->
  <div v-else-if="!recent.length" class="px-6 py-20 text-center text-sm text-slate-500">
    {{ $t('profile.recent.empty') }}
  </div>

  <!-- List -->
  <div v-else class="relative">
    <div
      ref="listEl"
      class="divide-y divide-slate-100 max-sm:overflow-hidden"
      :class="[
        { 'opacity-50': pending },
        !animatedReady && canCollapse && !expanded ? 'max-sm:max-h-100' : '',
      ]"
    >
      <a
        v-for="g in recent"
        :key="g.id"
        :href="`/trophies/${g.trophy_set_id}`"
        class="group flex items-start transition hover:bg-slate-50"
        :class="density.row"
        @click="openTrophyWithProgress($event, g.trophy_set_id, psnid)"
      >
        <!-- Fixed-width slot keeps rows aligned; the image renders at its natural
             aspect (PS4 320×176 landscape, PS5 square) with a soft ring instead of
             a gray letterbox box around it, plus a loading skeleton. -->
        <div class="flex shrink-0 flex-col items-center" :class="density.artColumn">
          <div class="relative flex items-center justify-center" :class="density.art">
            <TrophySetImage
              :src="g.trophy_set.icon_url"
              :alt="trophySetName(g)"
              :platform="platformList(g.trophy_set.platform)"
            />
          </div>
          <div class="flex flex-wrap justify-center sm:hidden" :class="density.mobileBadges">
            <span
              v-for="platform in platformList(g.trophy_set.platform)"
              :key="platform"
              class="inline-flex h-4 shrink-0 items-center rounded px-1.5 text-[10px] font-bold leading-none"
              :class="platformBadgeClass(platform)"
            >
              {{ platformLabel(platform) }}
            </span>
            <span
              v-if="g.trophy_set.region"
              class="inline-flex shrink-0 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-slate-500"
            >
              <LucideIcon :icon="Globe" class="size-3 text-slate-400" />
              {{ g.trophy_set.region }}
            </span>
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <!-- Title -->
          <h3 class="truncate font-semibold text-slate-900" :class="density.title">{{ trophySetName(g) }}</h3>

          <!-- Platform + region + last-earned time -->
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1" :class="density.meta">
            <span
              v-for="platform in platformList(g.trophy_set.platform)"
              :key="platform"
              class="hidden h-4 shrink-0 items-center rounded px-1.5 text-[10px] font-bold leading-none sm:inline-flex"
              :class="platformBadgeClass(platform)"
            >
              {{ platformLabel(platform) }}
            </span>
            <span
              v-if="g.trophy_set.region"
              class="hidden shrink-0 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-slate-500 sm:inline-flex"
            >
              <LucideIcon :icon="Globe" class="size-3 text-slate-400" />
              {{ g.trophy_set.region }}
            </span>
            <span class="inline-flex items-center gap-1 text-xs tabular-nums text-slate-400">
              <LucideIcon :icon="Clock" class="size-3.5" />
              {{ fmtDateTime(g.last_earned_at) }}
            </span>
          </div>

          <!-- Progress + per-tier earned counts -->
          <div class="flex items-center" :class="density.progress">
            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full"
                :class="g.progress === 100 ? 'bg-cyan-400' : 'bg-slate-900'"
                :style="{ width: `${g.progress}%` }"
              />
            </div>
            <span class="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-600">{{ g.progress }}%</span>
          </div>
          <div class="flex items-center text-slate-500" :class="density.tiers">
            <span v-for="(t, i) in earnedTiers(g)" :key="i" class="inline-flex items-center gap-1 tabular-nums">
              <span class="size-2 rounded-full" :class="t.dot" />{{ t.count }}
            </span>
          </div>
        </div>

        <LucideIcon
          :icon="ChevronRight"
          class="shrink-0 text-slate-300 transition group-hover:text-slate-400"
          :class="density.chevron"
        />
      </a>
    </div>

    <div
      v-if="canCollapse"
      class="sm:hidden"
      :class="expanded ? 'border-t border-slate-100 bg-white px-4 py-3' : 'pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-white via-white/95 to-white/0 px-4 pb-4 pt-16'"
    >
      <button
        type="button"
        class="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm shadow-slate-900/5 transition active:scale-[0.99]"
        @click="toggleExpanded"
      >
        {{ expanded ? $t('profile.recent.collapse') : $t('profile.recent.expand') }}
        <span
          class="profile-toggle-chevron inline-flex size-4 items-center justify-center"
          :class="[
            expanded ? 'is-expanded' : 'is-collapsed',
            toggleIconTouched ? 'is-animated' : '',
          ]"
        >
          <LucideIcon :icon="ChevronDown" class="size-4" />
        </span>
      </button>
    </div>
  </div>

  <!-- Bottom pager -->
  <div
    v-if="totalPages > 1"
    class="border-t border-slate-100 px-4 py-3"
    :class="canCollapse && !expanded ? 'max-sm:hidden' : ''"
  >
    <Pagination v-model:page="page" :total-pages="totalPages" />
  </div>
  </div>
</template>

<style scoped>
.profile-toggle-chevron {
  transform: rotate(0deg);
  transform-origin: center;
  will-change: transform;
}

.profile-toggle-chevron.is-expanded {
  transform: rotate(180deg);
}

.profile-toggle-chevron.is-animated.is-expanded {
  animation: profile-toggle-chevron-expand 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.profile-toggle-chevron.is-animated.is-collapsed {
  animation: profile-toggle-chevron-collapse 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes profile-toggle-chevron-expand {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  38% {
    transform: translateY(3px) rotate(130deg) scale(1.24);
  }
  62% {
    transform: translateY(-1px) rotate(205deg) scale(0.92);
  }
  100% {
    transform: translateY(0) rotate(180deg) scale(1);
  }
}

@keyframes profile-toggle-chevron-collapse {
  0% {
    transform: translateY(0) rotate(180deg) scale(1);
  }
  38% {
    transform: translateY(-3px) rotate(48deg) scale(1.24);
  }
  62% {
    transform: translateY(1px) rotate(-18deg) scale(0.92);
  }
  100% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .profile-toggle-chevron.is-animated.is-expanded,
  .profile-toggle-chevron.is-animated.is-collapsed {
    animation: none;
  }
}
</style>
