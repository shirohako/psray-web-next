<script setup lang="ts">
import type { SimilarTrophySet } from '~/services/trophies'

const props = defineProps<{ sets: SimilarTrophySet[] }>()

// Newest platform first; anything unknown sinks to the bottom.
const PLATFORM_ORDER = ['PS5', 'PS4', 'PS3', 'PSVITA', 'PSP']
const platformRank = (p: string) => {
  const i = PLATFORM_ORDER.indexOf(p)
  return i === -1 ? PLATFORM_ORDER.length : i
}
const platformGroupKey = (platform: string[]) => platform.join('/') || 'UNKNOWN'
const platformGroupRank = (platform: string[]) =>
  platform.length ? Math.min(...platform.map(platformRank), PLATFORM_ORDER.length) : PLATFORM_ORDER.length

// Same game, different store entries. Name and trophy counts repeat across every
// variant, so we group by platform combination — each group shows one cover
// and lists its variants as id chips that reveal full details on hover.
const groups = computed(() => {
  const byPlatform = new Map<string, SimilarTrophySet[]>()
  for (const s of props.sets) {
    const platforms = platformList(s.platform)
    const key = platformGroupKey(platforms)
    const list = byPlatform.get(key)
    if (list) list.push(s)
    else byPlatform.set(key, [s])
  }
  return [...byPlatform.entries()]
    .map(([key, list]) => {
      const sets = [...list].sort((a, b) => b.owners - a.owners)
      const platforms = platformList(sets[0]!.platform)
      return { key, platforms, sets, cover: sets[0]!.icon_url }
    })
    .sort((a, b) => platformGroupRank(a.platforms) - platformGroupRank(b.platforms))
})
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-100 px-4 py-2.5">
      <h2 class="text-sm font-semibold text-slate-900">已关联的奖杯组</h2>
      <p class="mt-0.5 text-xs text-slate-400">同款游戏其他平台/其他地区的奖杯组</p>
    </div>

    <div class="divide-y divide-slate-100">
      <section v-for="g in groups" :key="g.key" class="p-3 sm:p-3.5">
        <!-- Platform + set count on its own line. -->
        <div class="flex items-center gap-2">
          <span
            v-for="platform in g.platforms"
            :key="platform"
            class="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold leading-none"
            :class="platformBadgeClass(platform)"
          >
            {{ platform }}
          </span>
          <span class="text-xs text-slate-400">{{ g.sets.length }} 套奖杯</span>
        </div>

        <div class="mt-2.5 flex items-center gap-3">
          <!-- Cover capped by width (PS4 art is 320×176 landscape — capping
               height would let it sprawl), ring-hugged like the profile game list. -->
          <div class="flex w-16 shrink-0 items-center justify-center">
            <!-- PS5's square art is nudged a bit narrower so it sits centered
                 with a little breathing room; PS4's landscape art keeps the
                 full slot width. -->
            <img
              :src="g.cover"
              :alt="g.platforms.join(' / ')"
              class="rounded-md object-contain shadow-sm ring-1 ring-black/5"
              :class="g.platforms.length === 1 && g.platforms[0] === 'PS5' ? 'max-w-14' : 'max-w-full'"
            />
          </div>

          <div class="flex min-w-0 flex-1 flex-wrap gap-1.5">
            <TrophySimilarChip v-for="s in g.sets" :key="s.id" :set="s" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
