<script setup lang="ts">
import { Trophy, Users, Gauge, CheckCircle2, Timer, Flag } from 'lucide'
import type { TrophySetDetailInfo, PlayerRankType } from '~/services/trophies'

const props = defineProps<{ trophySet: TrophySetDetailInfo }>()

// Ranking shortcuts open the shared players dialog on a specific sort tab.
const dialogOpen = ref(false)
const dialogType = ref<PlayerRankType>('recent')

function openRanking(type: PlayerRankType) {
  dialogType.value = type
  dialogOpen.value = true
}

const stats = computed(() => [
  { icon: Users, label: '玩过', value: fmt(props.trophySet.owners), tint: 'text-slate-900' },
  { icon: Gauge, label: '平均进度', value: `${props.trophySet.average_progress}%`, tint: 'text-sky-600' },
  { icon: CheckCircle2, label: '完成人数', value: fmt(props.trophySet.completed_players), tint: 'text-emerald-600' },
  { icon: Trophy, label: '白金人数', value: fmt(props.trophySet.platinum_achievers), tint: 'text-cyan-600' },
])
</script>

<template>
  <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <!-- Blurred game art behind a dark scrim, for the title area only -->
    <div class="relative">
      <div
        class="absolute inset-0 scale-110 bg-cover bg-center blur-2xl saturate-150"
        :style="{ backgroundImage: `url(${trophySet.icon_url})` }"
      />
      <div class="absolute inset-0 bg-slate-900/70" />

      <div class="relative flex flex-col items-center gap-5 p-5 text-center sm:flex-row sm:items-center sm:p-6 sm:text-left">
        <!-- PS5 icons are square; PS4 are 320×176 landscape — keep natural aspect. -->
        <img
          :src="trophySet.icon_url"
          :alt="trophySet.name"
          class="h-12 w-auto min-w-12 max-w-50 shrink-0 rounded-lg border border-white/15 bg-white/10 object-contain shadow-lg sm:h-28 sm:min-w-28 sm:rounded-xl"
        />
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
            <h1 class="text-base font-bold leading-tight tracking-tight text-white sm:text-2xl">
              {{ trophySet.name }}
            </h1>
            <span
              v-for="platform in platformList(trophySet.platform)"
              :key="platform"
              class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
              :class="platformBadgeClass(platform)"
            >
              {{ platform }}
            </span>
          </div>
          <p v-if="trophySet.detail" class="mt-1.5 line-clamp-2 max-w-prose text-sm text-slate-300">
            {{ trophySet.detail }}
          </p>
          <!-- Defined trophies by tier -->
          <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 sm:justify-start">
            <span v-for="t in trophyKinds" :key="t.key" class="inline-flex items-baseline gap-1.5">
              <span class="size-2.5 translate-y-0.5 rounded-full" :class="t.dot" />
              <span class="text-sm font-bold text-white">{{ trophySet.defined_trophies[t.key] }}</span>
              <span class="text-xs text-slate-300">{{ t.label }}</span>
            </span>
          </div>

          <!-- Ranking shortcuts -->
          <div class="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20"
              @click="openRanking('speedrun')"
            >
              <LucideIcon :icon="Timer" class="size-3.5" />最短耗时排行
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20"
              @click="openRanking('progress')"
            >
              <LucideIcon :icon="Flag" class="size-3.5" />最先完成排行
            </button>
          </div>
        </div>
      </div>
    </div>

    <TrophyPlayersDialog :id="trophySet.id" v-model:open="dialogOpen" :initial-type="dialogType" />

    <!-- Aggregate stats strip -->
    <div class="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
      <div v-for="s in stats" :key="s.label" class="flex items-center gap-2.5 px-4 py-3.5">
        <span class="grid size-9 shrink-0 place-items-center rounded-full bg-slate-50" :class="s.tint">
          <LucideIcon :icon="s.icon" class="size-4.5" />
        </span>
        <div class="leading-tight">
          <div class="text-lg font-bold text-slate-900">{{ s.value }}</div>
          <div class="text-xs text-slate-400">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
