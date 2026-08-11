<script setup lang="ts">
import { ChevronRight, ThumbsDown, ThumbsUp, Trophy } from 'lucide'
import type { ProfileRecentTip, ProfileTip } from '~/types/tip'

const props = withDefaults(defineProps<{
  tip: ProfileTip | ProfileRecentTip
  compact?: boolean
}>(), { compact: false })

const route = useRoute()
const trophyName = computed(() => props.tip.trophy?.name || `#${props.tip.trophy_id}`)
const edited = computed(() => isTipEdited(props.tip))
const voteDigits = computed(() => Math.max(
  String(props.tip.vote_up_count).length,
  String(props.tip.vote_down_count).length,
))
const voteGrid = computed(() => ({
  gridTemplateColumns: `0.875rem ${voteDigits.value}ch`,
}))
const trophyTarget = computed(() => {
  const trophySetId = props.tip.trophy_set_id
  if (!trophySetId) return null

  const psnid = typeof route.params.psnid === 'string' ? route.params.psnid : undefined
  return {
    path: `/trophies/${trophySetId}`,
    query: {
      ...(psnid ? { psnid } : {}),
      tips: String(props.tip.trophy_id),
    },
    hash: `#trophy-${props.tip.trophy_id}`,
  }
})
</script>

<template>
  <article class="flex min-w-0 items-center gap-3" :class="compact ? 'px-4 py-3' : 'px-5 py-4'">
    <div class="relative shrink-0">
      <img
        v-if="tip.trophy?.icon_url"
        :src="tip.trophy.icon_url"
        :alt="trophyName"
        class="rounded-lg bg-slate-100 object-cover"
        :class="compact ? 'size-10' : 'size-12'"
      />
      <span
        v-else
        class="grid place-items-center rounded-lg bg-slate-100 text-slate-400"
        :class="compact ? 'size-10' : 'size-12'"
      >
        <LucideIcon :icon="Trophy" class="size-5" />
      </span>
      <span
        v-if="tip.trophy"
        class="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-white bg-white"
        :class="trophyTierColor(tip.trophy.type)"
      >
        <LucideIcon :icon="Trophy" class="size-3" />
      </span>
    </div>

    <div class="min-w-0 flex-1">
      <h3 class="truncate text-sm font-semibold text-slate-900">{{ trophyName }}</h3>
      <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
        <span class="tabular-nums">{{ fmtDateTime(tip.updated_at) }}</span>
        <span v-if="edited && !compact" class="font-medium text-slate-500">{{ $t('trophy.tips.edited') }}</span>
        <span class="inline-flex items-center gap-2">
          <span class="inline-grid items-center gap-0.5" :style="voteGrid">
            <LucideIcon :icon="ThumbsUp" class="size-3.5" />
            <span class="text-right tabular-nums">{{ tip.vote_up_count }}</span>
          </span>
          <span class="inline-grid items-center gap-0.5" :style="voteGrid">
            <LucideIcon :icon="ThumbsDown" class="size-3.5" />
            <span class="text-right tabular-nums">{{ tip.vote_down_count }}</span>
          </span>
        </span>
      </div>
    </div>

    <NuxtLink
      v-if="trophyTarget"
      :to="trophyTarget"
      class="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
      :aria-label="$t('common.view')"
    >
      <LucideIcon :icon="ChevronRight" class="size-4" />
    </NuxtLink>
  </article>
</template>
