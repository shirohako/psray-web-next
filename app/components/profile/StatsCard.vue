<script setup lang="ts">
import { CheckCircle2, XCircle, Heart, Star } from 'lucide'
import type { Profile } from '~/services/profile'

const props = defineProps<{ profile: Profile }>()
const total = computed(() => sumTrophies(props.profile))
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="mb-4 text-sm font-semibold text-slate-900">统计概览</h2>
    <dl class="grid grid-cols-2 gap-y-4">
      <div>
        <dt class="text-xs text-slate-400">游戏总数</dt>
        <dd class="mt-0.5 text-lg font-bold text-slate-900">{{ fmt(profile.played_game_count) }}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-400">奖杯总数</dt>
        <dd class="mt-0.5 text-lg font-bold text-slate-900">{{ fmt(total) }}</dd>
      </div>
      <div>
        <dt class="inline-flex items-center gap-1 text-xs text-slate-400">
          <LucideIcon :icon="CheckCircle2" class="size-3.5 text-emerald-400" />已完成
        </dt>
        <dd class="mt-0.5 text-lg font-bold text-slate-900">{{ fmt(profile.completed_game_count) }}</dd>
      </div>
      <div>
        <dt class="inline-flex items-center gap-1 text-xs text-slate-400">
          <LucideIcon :icon="XCircle" class="size-3.5 text-rose-400" />已弃坑
        </dt>
        <dd class="mt-0.5 text-lg font-bold text-slate-900">{{ fmt(profile.abandoned_game_count) }}</dd>
      </div>
    </dl>

    <div class="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
      <div class="flex items-center gap-2">
        <LucideIcon :icon="Heart" class="size-4 text-rose-400" />
        <div class="leading-tight">
          <div class="text-sm font-semibold text-slate-900">{{ fmt(profile.favorite_game_count) }}</div>
          <div class="text-xs text-slate-400">收藏游戏</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <LucideIcon :icon="Star" class="size-4 text-amber-400" />
        <div class="leading-tight">
          <div class="text-sm font-semibold text-slate-900">{{ fmt(profile.review_count) }}</div>
          <div class="text-xs text-slate-400">游戏评测</div>
        </div>
      </div>
    </div>
  </div>
</template>
