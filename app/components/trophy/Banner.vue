<script setup lang="ts">
import { Trophy, Users, Gauge, CheckCircle2 } from 'lucide'
import type { TrophySetDetailInfo } from '~/services/trophies'

const props = defineProps<{ trophySet: TrophySetDetailInfo }>()

const stats = computed(() => [
  { icon: Users, label: '拥有者', value: fmt(props.trophySet.owners), tint: 'text-slate-900' },
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
        :style="{ backgroundImage: `url(${trophySet.trophy_title_icon_url})` }"
      />
      <div class="absolute inset-0 bg-slate-900/70" />

      <div class="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <img
          :src="trophySet.trophy_title_icon_url"
          :alt="trophySet.trophy_title_name"
          class="size-24 shrink-0 rounded-xl border border-white/15 object-cover shadow-lg sm:size-28"
        />
        <div class="min-w-0 flex-1">
          <span
            class="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold"
            :class="platformBadgeClass(trophySet.trophy_title_platform)"
          >
            {{ trophySet.trophy_title_platform }}
          </span>
          <h1 class="mt-2 text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
            {{ trophySet.trophy_title_name }}
          </h1>
          <p v-if="trophySet.trophy_title_detail" class="mt-1.5 line-clamp-2 max-w-prose text-sm text-slate-300">
            {{ trophySet.trophy_title_detail }}
          </p>
          <!-- Defined trophies by tier -->
          <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span v-for="t in trophyKinds" :key="t.key" class="inline-flex items-baseline gap-1.5">
              <span class="size-2.5 translate-y-0.5 rounded-full" :class="t.dot" />
              <span class="text-sm font-bold text-white">{{ trophySet.defined_trophies[t.key] }}</span>
              <span class="text-xs text-slate-300">{{ t.label }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

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
