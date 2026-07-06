<script setup lang="ts">
import { BadgeCheck, Eye, RefreshCw } from 'lucide'
import type { Profile } from '~/services/profile'

const props = defineProps<{ profile: Profile }>()

/**
 * Whether this is a registered PSRay user (vs. a tracked-only PSN profile).
 * Assumed signal: `registered_at` is set once the account is registered.
 */
const isRegistered = computed(() => props.profile.registered_at != null)
</script>

<template>
  <div>
    <!-- Avatar overlaps the banner above -->
    <img
      :src="profile.avatar_url"
      :alt="profile.psnid"
      class="relative z-10 -mt-18 size-24 rounded-xl border-4 border-white bg-white object-cover shadow-md sm:-mt-22 sm:size-28"
    />

    <!-- Name + about + meta -->
    <div class="mt-3">
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="text-xl font-bold leading-none tracking-tight text-slate-900">{{ profile.psnid }}</h1>
        <LucideIcon
          :icon="BadgeCheck"
          class="size-4 shrink-0"
          :class="isRegistered ? 'text-sky-600' : 'text-slate-300'"
          :title="isRegistered ? '已注册用户' : '未注册（仅同步 PSN 资料）'"
        />
        <span
          v-if="profile.is_follower"
          class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
        >关注了你</span>
      </div>
      <p class="mt-1 max-w-prose text-sm text-slate-500">
        {{ profile.about_me || '这个人很神秘，什么都没留下。' }}
      </p>
      <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span class="inline-flex items-center gap-1">
          <RegionFlag :country="profile.country" /> {{ regionName(profile.country) }}
        </span>
        <span class="inline-flex items-center gap-1">
          <LucideIcon :icon="Eye" class="size-3.5 text-slate-400" /> {{ fmt(profile.page_view_count) }} 次浏览
        </span>
        <span class="inline-flex items-center gap-1">
          <LucideIcon :icon="RefreshCw" class="size-3.5 text-slate-400" /> 更新于 {{ fmtDateTime(profile.updated_at) }}
        </span>
      </div>
    </div>
  </div>
</template>
