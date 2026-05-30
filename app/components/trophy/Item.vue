<script setup lang="ts">
import { Trophy, Check, Eye, EyeOff, Lightbulb } from 'lucide'
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
  props.lang ? props.trophy.translations[props.lang] : null,
)
const name = computed(() => translation.value?.trophyName || props.trophy.trophy_name)
const detail = computed(() => translation.value?.trophyDetail || props.trophy.trophy_detail)
const rarity = computed(() => rarityMeta(props.trophy.rarity))
const showEarned = computed(() => props.hasViewer && props.earned)

// Per-trophy peek override, toggled by the eye icon next to the title. The
// global toggle is the master: flipping it resets any individual overrides, so
// turning it off re-hides trophies that were peeked open.
const revealed = ref(false)
watch(() => props.showSpoilers, () => { revealed.value = false })

// Mask spoiler trophies unless globally shown, individually revealed, or already
// earned by the viewer.
const masked = computed(
  () =>
    props.trophy.trophy_hidden === 1 &&
    !props.showSpoilers &&
    !props.earned &&
    !revealed.value,
)
const displayName = computed(() => (masked.value ? '隐藏奖杯' : name.value))
const displayDetail = computed(() => (masked.value ? '' : detail.value))
</script>

<template>
  <div
    class="flex items-center gap-4 px-4 py-3.5 transition sm:px-5"
    :class="showEarned ? 'bg-emerald-50/40' : 'hover:bg-slate-50'"
  >
    <div class="flex shrink-0 items-center gap-3">
      <!-- Continuous serial number -->
      <span class="w-6 text-right text-sm font-semibold tabular-nums text-slate-400">#{{ number }}</span>

      <!-- Icon + tier badge + earned check -->
      <div class="relative">
      <img
        :src="trophy.trophy_icon_url"
        :alt="displayName"
        class="size-16 rounded-lg object-cover shadow-sm"
        :class="{ 'blur-[3px] grayscale': masked }"
      />
      <span
        class="absolute -bottom-1.5 -right-1.5 grid size-6 place-items-center rounded-full border-2 border-white bg-white shadow-sm"
        :class="trophyTierColor(trophy.trophy_type)"
        :title="trophy.trophy_type"
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
          v-if="trophy.trophy_hidden === 1"
          type="button"
          class="inline-flex items-center rounded bg-slate-100 p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          :title="masked ? '显示该隐藏奖杯' : '隐藏该奖杯'"
          @click="revealed = !revealed"
        >
          <LucideIcon :icon="masked ? EyeOff : Eye" class="size-3" />
        </button>
        <NuxtLink
          v-if="trophy.tips > 0"
          :to="`/trophies/tips/${trophy.id}`"
          class="inline-flex items-center gap-1 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-600 transition hover:bg-sky-100"
        >
          <LucideIcon :icon="Lightbulb" class="size-3" />{{ trophy.tips }} 攻略
        </NuxtLink>
      </div>
      <p v-if="displayDetail" class="mt-0.5 line-clamp-2 text-sm text-slate-500">{{ displayDetail }}</p>
    </div>

    <!-- Rarity + earn rates -->
    <div class="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
      <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="rarity.pill">
        {{ rarity.label }}
      </span>
      <div class="text-xs text-slate-500">
        <span title="PSN 官方获得率"><span class="text-slate-400">PSN</span> {{ trophy.trophy_earned_rate }}%</span>
      </div>
    </div>
  </div>
</template>
