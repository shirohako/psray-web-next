<script setup lang="ts">
import { Users, Heart, UserPlus, UserCheck } from 'lucide'
import type { Profile } from '~/services/profile'

const props = defineProps<{ profile: Profile }>()

/** Follow relationship between the viewer and this profile, for a status chip. */
const relationship = computed(() => {
  const p = props.profile
  if (p.is_following && p.is_follower)
    return { label: '互相关注', icon: UserCheck, class: 'bg-emerald-50 text-emerald-600' }
  if (p.is_follower)
    return { label: '关注了你', icon: UserPlus, class: 'bg-sky-50 text-sky-600' }
  if (p.is_following)
    return { label: '已关注', icon: UserCheck, class: 'bg-slate-100 text-slate-700' }
  return null
})
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-sm font-semibold text-slate-900">社交</h2>
      <span
        v-if="relationship"
        class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
        :class="relationship.class"
      >
        <LucideIcon :icon="relationship.icon" class="size-3.5" />{{ relationship.label }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
        <LucideIcon :icon="Users" class="size-4 shrink-0 text-slate-900" />
        <span class="text-lg font-bold text-slate-900">{{ fmt(profile.followers) }}</span>
        <span class="text-xs text-slate-400">粉丝</span>
      </div>
      <div class="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
        <LucideIcon :icon="Heart" class="size-4 shrink-0 text-rose-500" />
        <span class="text-lg font-bold text-slate-900">{{ fmt(profile.following) }}</span>
        <span class="text-xs text-slate-400">关注</span>
      </div>
    </div>
  </div>
</template>
