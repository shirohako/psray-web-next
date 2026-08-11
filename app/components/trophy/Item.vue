<script setup lang="ts">
import { Trophy, Check, Eye, EyeOff, MessageSquare, Copy, FileText, Users, Info, Clock3, Medal, Timer } from 'lucide'
import type { Trophy as TrophyData } from '~/services/trophies'
import type { DisplayDensity } from '~/composables/usePreferences'

const props = defineProps<{
  trophy: TrophyData
  /** Whether the viewed user has earned this trophy. */
  earned: boolean
  /** When the viewed user earned this trophy, if returned by the API. */
  earnedAt?: number | string | null
  /** 1-based order in which the viewer earned this trophy. */
  earnedOrder?: number | null
  /** Seconds since the viewer's previous earned trophy (`null` for the first). */
  earnedGap?: number | null
  /** True when a viewer was requested (enables the earned styling). */
  hasViewer: boolean
  /** Reveal PSN-hidden (spoiler) trophies. */
  showSpoilers: boolean
  /** Continuous serial number across all groups. */
  number: number
  /** Language currently used for the trophy names and new-tip default. */
  displayLanguage: string
}>()

const { t } = useI18n()

const name = computed(() => props.trophy.localized_name || props.trophy.name)
const detail = computed(() => props.trophy.localized_detail || props.trophy.detail)
const showEarned = computed(() => props.hasViewer && props.earned)

// Headline earn rate follows the site-wide earn-rate-basis preference; the
// tooltip still lists both PSN and PSRay rates regardless.
const { rateBasis, trophyDensity } = usePreferences()
const densityStyles: Record<DisplayDensity, {
  row: string
  number: string
  icon: string
  tierBadge: string
  tierIcon: string
  earnedBadge: string
  earnedIcon: string
  title: string
  detail: string
  earnedMeta: string
  actions: string
  rate: string
  commentButton: string
  commentIcon: string
}> = {
  dense: {
    row: 'gap-2 px-2 py-1.5 sm:gap-2.5 sm:px-3 sm:py-2',
    number: 'w-5 text-xs',
    icon: 'size-10 sm:size-12',
    tierBadge: '-bottom-1 -right-1 size-4 border',
    tierIcon: 'size-2.5',
    earnedBadge: '-right-1 -top-1 size-4 border',
    earnedIcon: 'size-2.5',
    title: 'text-sm',
    detail: 'mt-0 line-clamp-1 text-xs',
    earnedMeta: 'mt-0.5 gap-x-2 gap-y-0.5 text-[10px]',
    actions: 'gap-1',
    rate: 'text-[11px]',
    commentButton: 'size-5.5',
    commentIcon: 'size-2.5',
  },
  compact: {
    row: 'gap-2.5 px-2.5 py-2 sm:gap-3 sm:px-4 sm:py-2.5',
    number: 'w-5 text-xs',
    icon: 'size-11 sm:size-13',
    tierBadge: '-bottom-1 -right-1 size-4.5 border',
    tierIcon: 'size-2.5',
    earnedBadge: '-right-1 -top-1 size-4 border',
    earnedIcon: 'size-2.5',
    title: 'text-sm',
    detail: 'mt-0.5 line-clamp-1 text-xs',
    earnedMeta: 'mt-0.5 gap-x-2 gap-y-0.5 text-[10px]',
    actions: 'gap-1 sm:gap-2',
    rate: 'text-xs',
    commentButton: 'size-6',
    commentIcon: 'size-3',
  },
  standard: {
    row: 'gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-3.5',
    number: 'w-6 text-sm',
    icon: 'size-14 sm:size-16',
    tierBadge: '-bottom-1.5 -right-1.5 size-6 border-2',
    tierIcon: 'size-3.5',
    earnedBadge: '-right-1.5 -top-1.5 size-5 border-2',
    earnedIcon: 'size-3',
    title: '',
    detail: 'mt-0.5 line-clamp-2 text-[13px] font-medium',
    earnedMeta: 'mt-1.5 gap-x-2.5 gap-y-1 text-[11px]',
    actions: 'gap-1.5 sm:gap-3',
    rate: 'text-xs sm:text-sm',
    commentButton: 'size-6 sm:size-7',
    commentIcon: 'size-3 sm:size-3.5',
  },
}
const density = computed(() => densityStyles[trophyDensity.value])
const primaryRateLabel = computed(() => (rateBasis.value === 'psray' ? 'PSRay' : 'PSN'))
const primaryRate = computed(() =>
  rateBasis.value === 'psray' ? props.trophy.psray_rate : props.trophy.psn_earned_rate,
)

// Per-trophy visibility override toggled by the eye icon next to the title.
// `null` follows the global state; `true` force-hides, `false` force-reveals.
// The global toggle is the master: flipping it clears any per-trophy override.
const override = ref<boolean | null>(null)
watch(() => props.showSpoilers, () => { override.value = null })

// Mask spoiler trophies unless globally shown, already earned by the viewer, or
// overridden per-trophy via the eye icon.
const masked = computed(() => {
  if (!props.trophy.is_hidden) return false
  if (override.value !== null) return override.value
  return !props.showSpoilers && !props.earned
})

// The eye flips this trophy's current state — reveal a masked one, hide a shown one.
function toggleMask() {
  override.value = !masked.value
}
const displayName = computed(() => (masked.value ? t('trophy.item.hidden') : name.value))
const displayDetail = computed(() => (masked.value ? '' : detail.value))
function fmtRate(rate: number | string) {
  const n = Number(rate)
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : '—'
}

function fmtEarnGap(sec: number) {
  const s = Math.max(0, Math.round(sec))
  const d = Math.floor(s / 86_400)
  const h = Math.floor((s % 86_400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const rest = s % 60
  if (d > 0) return h > 0 ? `${d}d ${h}h` : `${d}d`
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  if (m > 0) return rest > 0 ? `${m}m ${rest}s` : `${m}m`
  return `${rest}s`
}

const toast = useToast()
const route = useRoute()
async function copy(text: string, label: string) {
  if (!text || !import.meta.client) return
  try {
    await navigator.clipboard.writeText(text)
    toast.success({ title: t('toast.copied', { label }) })
  } catch {
    toast.error({
      title: t('toast.copyFailed.title'),
      description: t('toast.copyFailed.description'),
    })
  }
}

// Dialogs opened from the row's menu / comment button.
const detailOpen = ref(false)
const earnersOpen = ref(false)
const tipsOpen = ref(String(route.query.tips ?? '') === String(props.trophy.id))
const composerOpen = ref(false)
// Dialogs are expensive multiplied by every trophy row. Mount each one only
// after its first open, then keep it alive until its leave transition finishes.
const detailMounted = ref(false)
const earnersMounted = ref(false)
const tipsMounted = ref(tipsOpen.value)
const composerMounted = ref(false)
const composerMode = ref<'create' | 'edit'>('create')
const dialogDestination = ref<'tips' | 'composer' | null>(null)
const displayedTipCount = ref(props.trophy.tip_count)
watch(() => props.trophy.tip_count, value => { displayedTipCount.value = value })
watch(() => route.query.tips, (tipId) => {
  if (String(tipId ?? '') === String(props.trophy.id)) tipsOpen.value = true
})
watch(detailOpen, value => { if (value) detailMounted.value = true })
watch(earnersOpen, value => { if (value) earnersMounted.value = true })
watch(tipsOpen, value => { if (value) tipsMounted.value = true })
watch(composerOpen, value => { if (value) composerMounted.value = true })

function openTipComposer(mode: 'create' | 'edit') {
  composerMode.value = mode
  dialogDestination.value = 'composer'
  tipsOpen.value = false
}

function onTipsClosed() {
  tipsMounted.value = false
  if (dialogDestination.value !== 'composer') return
  dialogDestination.value = null
  composerOpen.value = true
}

function returnToTips() {
  dialogDestination.value = 'tips'
}

function onComposerClosed() {
  composerMounted.value = false
  if (dialogDestination.value !== 'tips') return
  dialogDestination.value = null
  tipsOpen.value = true
}

function onTipPublished() {
  returnToTips()
}

function onTipDeleted() {
  returnToTips()
}
</script>

<template>
  <Popover
    :id="`trophy-${trophy.id}`"
    class="flex scroll-mt-20 cursor-pointer select-none items-center transition target:bg-amber-50/60"
    :class="[density.row, showEarned ? 'bg-sky-50/60' : 'hover:bg-slate-50']"
  >
    <div class="flex shrink-0 items-center gap-2 sm:gap-3">
      <!-- Continuous serial number -->
      <span class="text-right font-semibold tabular-nums text-slate-400" :class="density.number">#{{ number }}</span>

      <!-- Icon + tier badge + earned check -->
      <div class="relative">
        <img
          :src="trophy.icon_url"
          :alt="displayName"
          class="rounded-lg bg-slate-100 object-cover shadow-sm"
          :class="[density.icon, { 'blur-[3px] grayscale': masked }]"
        />
        <span
          class="absolute grid place-items-center rounded-full border-white bg-white shadow-sm"
          :class="[density.tierBadge, trophyTierColor(trophy.type)]"
          :title="trophy.type"
        >
          <LucideIcon :icon="Trophy" :class="density.tierIcon" />
        </span>
        <span
          v-if="showEarned"
          class="absolute grid place-items-center rounded-full border-white bg-slate-900 text-white shadow-sm"
          :class="density.earnedBadge"
          :title="$t('trophy.item.earned')"
        >
          <LucideIcon :icon="Check" :class="density.earnedIcon" stroke-width="3" />
        </span>
      </div>
    </div>

    <!-- Name + detail -->
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="min-w-0 truncate font-semibold text-slate-900" :class="[density.title, { 'text-slate-400': masked }]">{{ displayName }}</h3>
        <button
          v-if="trophy.is_hidden && !earned"
          type="button"
          class="inline-flex items-center rounded bg-slate-100 p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          :title="masked ? $t('trophy.item.reveal') : $t('trophy.item.mask')"
          @click.stop="toggleMask"
        >
          <LucideIcon :icon="masked ? EyeOff : Eye" class="size-3" />
        </button>
      </div>
      <p v-if="displayDetail" class="text-slate-500" :class="density.detail">{{ displayDetail }}</p>
      <div
        v-if="showEarned && earnedAt"
        class="flex max-w-full flex-wrap items-center font-medium leading-none text-slate-400"
        :class="density.earnedMeta"
      >
        <!-- When the viewer earned it -->
        <span class="inline-flex min-w-0 items-center gap-1" :title="$t('trophy.item.earnedAt')">
          <LucideIcon :icon="Clock3" class="size-3 shrink-0" />
          <span class="truncate tabular-nums">{{ fmtDateTime(earnedAt) }}</span>
        </span>

        <!-- Earned-order badge; the tooltip carries the gap since the previously
             earned trophy -->
        <Tooltip v-if="earnedOrder" placement="top" class="shrink-0 cursor-help text-slate-500">
          <span class="inline-flex items-center gap-1" @click.stop>
            <LucideIcon :icon="Medal" class="size-3 shrink-0" />
            <span class="font-semibold tabular-nums">{{ earnedOrder }}</span>
          </span>
          <template #content>
            <div v-if="earnedGap == null" class="flex w-40 items-center justify-between gap-3 p-1">
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                  <LucideIcon :icon="Medal" class="size-3" />
                  {{ $t('trophy.item.earnedOrder') }}
                </div>
                <div class="mt-1.5 text-sm font-semibold leading-none text-white">{{ $t('trophy.item.firstEarned') }}</div>
              </div>
              <div class="shrink-0 text-base font-bold tabular-nums text-slate-300">#{{ earnedOrder }}</div>
            </div>
            <div v-else class="flex w-40 items-center justify-between gap-3 p-1">
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                  <LucideIcon :icon="Timer" class="size-3" />
                  {{ $t('trophy.item.sincePrevious') }}
                </div>
                <div class="mt-1.5 text-sm font-semibold leading-none text-white tabular-nums">+ {{ fmtEarnGap(earnedGap) }}</div>
              </div>
              <div class="shrink-0 text-base font-bold tabular-nums text-slate-300">#{{ earnedOrder }}</div>
            </div>
          </template>
        </Tooltip>
      </div>
    </div>

    <!-- PSN earn rate + actions -->
    <div class="flex shrink-0 items-center" :class="density.actions">
      <Tooltip placement="left">
        <div tabindex="0" class="flex cursor-pointer flex-col items-end leading-tight focus:outline-none" @click.stop>
          <span class="text-[10px] font-medium text-slate-400 max-sm:hidden">{{ primaryRateLabel }}</span>
          <span class="font-semibold tabular-nums text-slate-700" :class="density.rate">{{ fmtRate(primaryRate) }}</span>
        </div>
        <template #content>
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-300">{{ $t('trophy.item.psnRate') }}</span>
              <span class="font-semibold tabular-nums">{{ fmtRate(trophy.psn_earned_rate) }}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-300">{{ $t('trophy.item.psrayRate') }}</span>
              <span class="font-semibold tabular-nums">{{ fmtRate(trophy.psray_rate) }}</span>
            </div>
          </div>
        </template>
      </Tooltip>

      <!-- Comment button (badge = number of tips). Stops propagation so it
           keeps its own action instead of opening the row menu. -->
      <button
        type="button"
        class="relative grid place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        :class="density.commentButton"
        :title="$t('trophy.item.tips')"
        @click.stop="tipsOpen = true"
      >
        <LucideIcon :icon="MessageSquare" :class="density.commentIcon" />
        <span
          class="absolute -right-1 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full px-1 text-[9px] font-bold leading-none text-white"
          :class="displayedTipCount > 0 ? 'bg-slate-900' : 'bg-slate-300'"
        >
          {{ displayedTipCount }}
        </span>
      </button>
    </div>

    <template #menu="{ close }">
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50"
        @click="detailOpen = true; close()"
      >
        <LucideIcon :icon="Info" class="size-4 text-slate-400" />
        {{ $t('trophy.item.menu.view') }}
      </button>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50"
        @click="tipsOpen = true; close()"
      >
        <LucideIcon :icon="MessageSquare" class="size-4 text-slate-400" />
        {{ $t('trophy.item.menu.viewTips') }}
      </button>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50"
        @click="copy(name, $t('trophy.item.menu.titleLabel')); close()"
      >
        <LucideIcon :icon="Copy" class="size-4 text-slate-400" />
        {{ $t('trophy.item.menu.copyTitle') }}
      </button>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50"
        @click="copy(detail, $t('trophy.item.menu.detailLabel')); close()"
      >
        <LucideIcon :icon="FileText" class="size-4 text-slate-400" />
        {{ $t('trophy.item.menu.copyDetail') }}
      </button>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50"
        @click="earnersOpen = true; close()"
      >
        <LucideIcon :icon="Users" class="size-4 text-slate-400" />
        {{ $t('trophy.item.menu.recentEarners') }}
      </button>
    </template>
  </Popover>

  <LazyTrophyDetailDialog
    v-if="detailMounted"
    :trophy="trophy"
    v-model:open="detailOpen"
    @closed="detailMounted = false"
  />
  <LazyTrophyEarnersDialog
    v-if="earnersMounted"
    :trophy-id="trophy.id"
    :trophy-name="name"
    v-model:open="earnersOpen"
    @closed="earnersMounted = false"
  />
  <LazyTrophyTipsDialog
    v-if="tipsMounted"
    :trophy-id="trophy.id"
    :trophy-name="name"
    v-model:open="tipsOpen"
    @compose="openTipComposer"
    @closed="onTipsClosed"
    @count="displayedTipCount = $event"
  />
  <LazyTrophyTipComposerDialog
    v-if="composerMounted"
    :trophy-id="trophy.id"
    :trophy-name="name"
    :display-language="displayLanguage"
    :editing="composerMode === 'edit'"
    v-model:open="composerOpen"
    @published="onTipPublished"
    @deleted="onTipDeleted"
    @cancelled="returnToTips"
    @closed="onComposerClosed"
  />
</template>
