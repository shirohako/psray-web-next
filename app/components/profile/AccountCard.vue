<script setup lang="ts">
import { Globe, Languages, Trophy, Clock, Calendar, RefreshCw } from 'lucide'
import type { Profile } from '~/services/profile'

defineProps<{ profile: Profile }>()
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="mb-4 text-sm font-semibold text-slate-900">账号信息</h2>
    <dl class="space-y-3 text-sm">
      <div class="flex items-center justify-between gap-3">
        <dt class="inline-flex items-center gap-2 text-slate-500">
          <LucideIcon :icon="Globe" class="size-4 text-slate-400" />地区
        </dt>
        <dd class="inline-flex items-center gap-1.5 font-medium text-slate-900">
          <RegionFlag :country="profile.country" />{{ regionName(profile.country) }}
        </dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="inline-flex items-center gap-2 text-slate-500">
          <LucideIcon :icon="Languages" class="size-4 text-slate-400" />语言
        </dt>
        <dd class="text-right font-medium text-slate-900">
          {{ profile.language.map(formatLang).join('、') || '—' }}
        </dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="inline-flex items-center gap-2 text-slate-500">
          <LucideIcon :icon="Trophy" class="size-4 text-slate-400" />首个奖杯
        </dt>
        <dd class="font-medium text-slate-900">{{ fmtDate(profile.first_trophy_at) }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="inline-flex items-center gap-2 text-slate-500">
          <LucideIcon :icon="Clock" class="size-4 text-slate-400" />最近奖杯
        </dt>
        <dd class="font-medium text-slate-900">{{ fromNow(profile.last_trophy_at) }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="inline-flex items-center gap-2 text-slate-500">
          <LucideIcon :icon="Calendar" class="size-4 text-slate-400" />加入于
        </dt>
        <dd class="font-medium text-slate-900">{{ fmtDate(profile.registered_at) }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="inline-flex items-center gap-2 text-slate-500">
          <LucideIcon :icon="RefreshCw" class="size-4 text-slate-400" />自动同步间隔
        </dt>
        <dd class="font-medium text-slate-900">{{ profile.sync_interval }} 分钟</dd>
      </div>
    </dl>
  </div>
</template>
