<script setup lang="ts">
import { Trophy, Check, Eye, EyeOff, MessageSquare, Copy, FileText, Users, Info } from 'lucide'
import type { Trophy as TrophyData } from '~/services/trophies'

const props = defineProps<{
  trophy: TrophyData
  /** Selected language code, or '' for the original text. */
  lang: string
  /** Whether the viewed user has earned this trophy. */
  earned: boolean
  /** True when a viewer was requested (enables the earned styling). */
  hasViewer: boolean
  /** Reveal PSN-hidden (spoiler) trophies. */
  showSpoilers: boolean
  /** Continuous serial number across all groups. */
  number: number
}>()

const translation = computed(() =>
  props.lang ? props.trophy.translations?.[props.lang] : null,
)
const name = computed(() => translation.value?.trophyName || props.trophy.name)
const detail = computed(() => translation.value?.trophyDetail || props.trophy.detail)
const showEarned = computed(() => props.hasViewer && props.earned)

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
const displayName = computed(() => (masked.value ? '隐藏奖杯' : name.value))
const displayDetail = computed(() => (masked.value ? '' : detail.value))
function fmtRate(rate: number | string) {
  const n = Number(rate)
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : '—'
}

function copy(text: string) {
  if (text && import.meta.client) navigator.clipboard?.writeText(text)
}

// Dialogs opened from the row's menu / comment button.
const detailOpen = ref(false)
const earnersOpen = ref(false)
const tipsOpen = ref(false)
</script>

<template>
  <Popover
    class="flex cursor-pointer select-none items-center gap-3 px-3 py-3 transition sm:gap-4 sm:px-5 sm:py-3.5"
    :class="showEarned ? 'bg-sky-50/60' : 'hover:bg-slate-50'"
  >
    <div class="flex shrink-0 items-center gap-2 sm:gap-3">
      <!-- Continuous serial number -->
      <span class="w-6 text-right text-sm font-semibold tabular-nums text-slate-400">#{{ number }}</span>

      <!-- Icon + tier badge + earned check -->
      <div class="relative">
        <img
          :src="trophy.icon_url"
          :alt="displayName"
          class="size-14 rounded-lg object-cover shadow-sm sm:size-16"
          :class="{ 'blur-[3px] grayscale': masked }"
        />
        <span
          class="absolute -bottom-1.5 -right-1.5 grid size-6 place-items-center rounded-full border-2 border-white bg-white shadow-sm"
          :class="trophyTierColor(trophy.type)"
          :title="trophy.type"
        >
          <LucideIcon :icon="Trophy" class="size-3.5" />
        </span>
        <span
          v-if="showEarned"
          class="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full border-2 border-white bg-slate-900 text-white shadow-sm"
          title="已获得"
        >
          <LucideIcon :icon="Check" class="size-3" stroke-width="3" />
        </span>
      </div>
    </div>

    <!-- Name + detail -->
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="min-w-0 truncate font-semibold text-slate-900" :class="{ 'text-slate-400': masked }">{{ displayName }}</h3>
        <button
          v-if="trophy.is_hidden && !earned"
          type="button"
          class="inline-flex items-center rounded bg-slate-100 p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          :title="masked ? '显示该隐藏奖杯' : '隐藏该奖杯'"
          @click.stop="toggleMask"
        >
          <LucideIcon :icon="masked ? EyeOff : Eye" class="size-3" />
        </button>
      </div>
      <p v-if="displayDetail" class="mt-0.5 line-clamp-2 text-sm text-slate-500">{{ displayDetail }}</p>
    </div>

    <!-- PSN earn rate + actions -->
    <div class="flex shrink-0 items-center gap-1.5 sm:gap-3">
      <Tooltip placement="left" class="max-sm:hidden">
        <div tabindex="0" class="flex cursor-pointer flex-col items-end leading-tight focus:outline-none">
          <span class="text-[10px] font-medium text-slate-400">PSN</span>
          <span class="text-sm font-semibold tabular-nums text-slate-700">{{ fmtRate(trophy.psn_earned_rate) }}</span>
        </div>
        <template #content>
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-300">PSN 完成率</span>
              <span class="font-semibold tabular-nums">{{ fmtRate(trophy.psn_earned_rate) }}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-300">PSRay 完成率</span>
              <span class="font-semibold tabular-nums">{{ fmtRate(trophy.psray_rate) }}</span>
            </div>
          </div>
        </template>
      </Tooltip>

      <!-- Comment button (badge = number of tips). Stops propagation so it
           keeps its own action instead of opening the row menu. -->
      <button
        type="button"
        class="relative grid size-6 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:size-7"
        title="留言"
        @click.stop="tipsOpen = true"
      >
        <LucideIcon :icon="MessageSquare" class="size-3 sm:size-3.5" />
        <span
          class="absolute -right-1 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full px-1 text-[9px] font-bold leading-none text-white"
          :class="trophy.tip_count > 0 ? 'bg-slate-900' : 'bg-slate-300'"
        >
          {{ trophy.tip_count }}
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
        查看奖杯
      </button>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50"
        @click="copy(name); close()"
      >
        <LucideIcon :icon="Copy" class="size-4 text-slate-400" />
        复制奖杯标题
      </button>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50"
        @click="copy(detail); close()"
      >
        <LucideIcon :icon="FileText" class="size-4 text-slate-400" />
        复制奖杯描述
      </button>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50"
        @click="earnersOpen = true; close()"
      >
        <LucideIcon :icon="Users" class="size-4 text-slate-400" />
        查看近期获得的玩家
      </button>
    </template>
  </Popover>

  <TrophyDetailDialog :trophy="trophy" :lang="lang" v-model:open="detailOpen" />
  <TrophyEarnersDialog :trophy-id="trophy.id" :trophy-name="name" v-model:open="earnersOpen" />
  <TrophyTipsDialog :trophy-id="trophy.id" :trophy-name="name" v-model:open="tipsOpen" />
</template>
