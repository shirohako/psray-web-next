<script setup lang="ts">
import type { Trophy, TrophyGroup } from '~/services/trophies'

const props = defineProps<{
  group: TrophyGroup
  /** Selected language code, or '' for the original text. */
  lang: string
  /** id → index in the viewer's earned list (empty when no viewer). */
  earnedRank: Map<number, number>
  hasViewer: boolean
  filter: 'all' | 'earned' | 'unearned'
  sort: 'default' | 'earned' | 'rarity'
  /** Reveal PSN-hidden (spoiler) trophies. */
  showSpoilers: boolean
  /** Continuous serial number per trophy (db id → number). */
  numbers: Map<number, number>
}>()

const title = computed(() => {
  if (props.group.trophy_group_id === 'default') return '本篇'
  const loc = props.lang ? props.group.localizations[props.lang] : undefined
  return loc?.localized_title || props.group.trophy_title_name
})

function isEarned(t: Trophy) {
  return props.hasViewer && (t.earned_by_viewer ?? props.earnedRank.has(t.id))
}

// Filter then sort. Earned-based filter/sort only apply when a viewer is set.
const displayTrophies = computed(() => {
  let list = props.group.trophies

  if (props.hasViewer && props.filter !== 'all') {
    const want = props.filter === 'earned'
    list = list.filter(t => isEarned(t) === want)
  }

  if (props.sort === 'rarity') {
    // Lower PSN earn rate = rarer, so ascending puts the rarest first.
    list = [...list].sort((a, b) => a.trophy_earned_rate - b.trophy_earned_rate)
  } else if (props.sort === 'earned' && props.hasViewer) {
    // Earned trophies first, in the order the viewer earned them; rest after.
    list = [...list].sort((a, b) => {
      const ra = props.earnedRank.get(a.id) ?? Infinity
      const rb = props.earnedRank.get(b.id) ?? Infinity
      return ra - rb
    })
  }

  return list
})
</script>

<template>
  <section>
    <header
      class="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/60 px-4 py-2.5 sm:px-5"
    >
      <h2 class="truncate text-sm font-semibold text-slate-900">{{ title }}</h2>
      <div class="flex shrink-0 items-center gap-3">
        <span v-for="t in trophyKinds" :key="t.key" class="inline-flex items-center gap-1">
          <span class="size-2 rounded-full" :class="t.dot" />
          <span class="text-xs font-bold text-slate-700">{{ group.defined_trophies[t.key] }}</span>
        </span>
      </div>
    </header>

    <p v-if="!displayTrophies.length" class="px-5 py-10 text-center text-sm text-slate-400">
      没有符合条件的奖杯。
    </p>

    <div v-else class="divide-y divide-slate-100">
      <TrophyItem
        v-for="trophy in displayTrophies"
        :key="trophy.id"
        :trophy="trophy"
        :lang="lang"
        :has-viewer="hasViewer"
        :earned="isEarned(trophy)"
        :show-spoilers="showSpoilers"
        :number="numbers.get(trophy.id) ?? 0"
      />
    </div>
  </section>
</template>
