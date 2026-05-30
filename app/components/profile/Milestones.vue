<script setup lang="ts">
import {
  ArrowUpDown, Award, ChevronDown, ChevronRight, ChevronUp, Clock,
  Milestone, Trophy,
} from 'lucide'
import type { ProfileMilestone } from '~/services/profile'

const props = defineProps<{ psnid: string }>()

const LIMIT = 30
const ascending = ref(false)
const expanded = ref(false)

const { data: milestones, pending, error } = await useApiFetch<ProfileMilestone[]>(
  () => `/profile/${props.psnid}/milestones`,
)

const sorted = computed(() =>
  [...(milestones.value ?? [])].sort((a, b) =>
    ascending.value ? a.earned_at - b.earned_at : b.earned_at - a.earned_at,
  ),
)
const visibleMilestones = computed(() =>
  expanded.value ? sorted.value : sorted.value.slice(0, LIMIT),
)
const hiddenCount = computed(() => Math.max(sorted.value.length - LIMIT, 0))

function milestoneMeta(item: ProfileMilestone) {
  return item.type === 'platinum'
    ? {
        label: `第 ${fmt(Number(item.index))} 个白金`,
        icon: Award,
        iconClass: 'bg-cyan-50 text-cyan-600 ring-cyan-100',
        badgeClass: 'border-sky-100 bg-sky-50/80 text-sky-700',
      }
    : {
        label: `第 ${fmt(Number(item.index))} 个奖杯`,
        icon: Trophy,
        iconClass: 'bg-slate-800 text-white ring-slate-700',
        badgeClass: 'border-stone-200/80 bg-stone-100/80 text-stone-600',
      }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
      <div>
        <h2 class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          <LucideIcon :icon="Milestone" class="size-4 text-slate-500" />
          奖杯里程碑
        </h2>
        <p class="mt-0.5 text-xs text-slate-400">记录奖杯收藏中的重要时刻</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        @click="ascending = !ascending"
      >
        <LucideIcon :icon="ArrowUpDown" class="size-3.5" />
        {{ ascending ? '正序' : '倒序' }}
      </button>
    </div>

    <div v-if="pending" class="space-y-4 px-4 py-5 sm:px-5">
      <div v-for="i in 5" :key="i" class="flex gap-3">
        <div class="size-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
        <div class="flex-1 space-y-2 py-1">
          <div class="h-3.5 w-1/3 animate-pulse rounded bg-slate-200" />
          <div class="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>

    <div v-else-if="error" class="px-6 py-16 text-center text-sm text-slate-500">
      里程碑加载失败，请稍后重试。
    </div>

    <div v-else-if="!sorted.length" class="px-6 py-16 text-center">
      <div class="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
        <LucideIcon :icon="Milestone" class="size-6" />
      </div>
      <p class="mt-3 text-sm text-slate-500">还没有解锁里程碑。</p>
    </div>

    <div v-else class="relative px-4 py-2 sm:px-5">
      <span v-if="visibleMilestones.length > 1" class="absolute bottom-14 left-9 top-14 w-px bg-slate-200 sm:left-10" />
      <NuxtLink
        v-for="(item, index) in visibleMilestones"
        :key="`${item.type}-${item.index}-${item.trophy_id}`"
        :to="{ path: `/trophies/${item.trophy_set_id}`, query: { psnid } }"
        class="group relative flex gap-3 py-3"
      >
        <div class="relative flex w-10 shrink-0 items-center justify-center">
          <span
            class="relative z-10 grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-inset"
            :class="milestoneMeta(item).iconClass"
          >
            <LucideIcon :icon="milestoneMeta(item).icon" class="size-4.5" />
          </span>
        </div>

        <div class="relative min-w-0 flex-1 overflow-hidden rounded-lg border border-slate-100 bg-slate-50/60 transition group-hover:border-slate-200 group-hover:bg-slate-50">
          <div class="flex items-center gap-1 border-b px-3 py-1.5 text-[11px] font-semibold" :class="milestoneMeta(item).badgeClass">
            <LucideIcon :icon="milestoneMeta(item).icon" class="size-3" />
            {{ milestoneMeta(item).label }}
          </div>
          <div class="flex items-center gap-3 px-3 py-2.5 sm:pr-44">
            <img
              :src="item.trophyIconUrl"
              :alt="item.trophyName"
              class="size-12 shrink-0 rounded-lg bg-white object-cover shadow-sm"
            />
            <div class="min-w-0 flex-1">
              <p class="line-clamp-2 text-sm font-semibold text-slate-800 sm:truncate">{{ item.trophyName }}</p>
              <p class="mt-0.5 truncate text-xs text-slate-400">{{ item.trophySetName }}</p>
              <time class="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400 tabular-nums sm:hidden">
                <LucideIcon :icon="Clock" class="size-3" />
                {{ fmtDateTime(item.earned_at) }}
              </time>
            </div>
            <time class="absolute right-9 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-xs text-slate-400 tabular-nums sm:inline-flex">
              <LucideIcon :icon="Clock" class="size-3.5" />
              {{ fmtDateTime(item.earned_at) }}
            </time>
            <LucideIcon :icon="ChevronRight" class="absolute right-3 top-1/2 size-4 shrink-0 -translate-y-1/2 text-slate-300 transition group-hover:text-slate-500 max-sm:hidden" />
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-if="hiddenCount" class="border-t border-slate-100 px-4 py-3 text-center sm:px-5">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        @click="expanded = !expanded"
      >
        <LucideIcon :icon="expanded ? ChevronUp : ChevronDown" class="size-4" />
        {{ expanded ? '收起里程碑' : `查看更多里程碑（还有 ${hiddenCount} 条）` }}
      </button>
    </div>
  </div>
</template>
