<script setup lang="ts">
import { Medal, MapPin, Sparkles } from 'lucide'
import type { Profile } from '~/services/profile'

/** Compact inline row: global rank · region rank · trophy points. */
defineProps<{ profile: Profile }>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
    <span class="inline-flex items-center gap-1.5">
      <LucideIcon :icon="Medal" class="size-4 text-amber-500" />
      <span class="font-bold text-slate-900">{{ rankText(profile.rank) }}</span>
      <span class="text-xs text-slate-400">{{ $t('profile.stats.globalRank') }}</span>
    </span>
    <div class="h-4 w-px bg-slate-200" />
    <span class="inline-flex items-center gap-1.5">
      <LucideIcon :icon="MapPin" class="size-4 text-sky-500" />
      <span class="font-bold text-slate-900">{{ rankText(profile.server_rank) }}</span>
      <span class="text-xs text-slate-400">{{ $t('profile.stats.regionRank') }}</span>
    </span>
    <div class="h-4 w-px bg-slate-200" />
    <span class="inline-flex items-center gap-1.5">
      <LucideIcon :icon="Sparkles" class="size-4 text-slate-700" />
      <span class="font-bold text-slate-900">{{ fmt(profile.points) }}</span>
      <span class="text-xs text-slate-400">{{ $t('profile.stats.points') }}</span>
    </span>
  </div>
</template>
