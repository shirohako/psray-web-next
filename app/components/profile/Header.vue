<script setup lang="ts">
import {
  Trophy, Eye, UserPlus, UserCheck, RefreshCw,
  Crown, Medal, MapPin, Sparkles, BadgeCheck,
} from 'lucide'
import type { Profile } from '~/services/profile'

const props = defineProps<{ profile: Profile }>()

// Banner image: per-user banner when the API exposes one, else the global
// default from `app.config.ts`.
const appConfig = useAppConfig()
const bannerImage = computed(() => appConfig.profile.defaultBanner)

const total = computed(() => sumTrophies(props.profile))

/**
 * Whether this is a registered PSRay user (vs. a tracked-only PSN profile).
 * Assumed signal: `joined_at` is set once the account is registered. Adjust if
 * the backend exposes a dedicated flag.
 */
const isRegistered = computed(() => props.profile.joined_at != null)
</script>

<template>
  <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <!-- Banner -->
    <div
      class="relative h-36 bg-slate-300 bg-cover bg-center sm:h-48"
      :style="{ backgroundImage: `url(${bannerImage})` }"
    >
      <div class="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" />
      <span
        v-if="profile.plus"
        class="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-xs font-bold text-amber-950 shadow-sm backdrop-blur"
      >
        <LucideIcon :icon="Crown" class="size-3.5" /> PLUS
      </span>
    </div>

    <!-- Header -->
    <div class="px-4 pb-5 sm:px-6">
      <!-- Avatar (overlapping banner) + follow button on one baseline -->
      <div class="flex items-end justify-between gap-4">
        <img
          :src="profile.avatar_url"
          :alt="profile.psnid"
          class="relative z-10 -mt-12 size-24 rounded-xl border-4 border-white bg-white object-cover shadow-md sm:-mt-14 sm:size-28"
        />
        <button
          type="button"
          class="mb-1 inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition"
          :class="profile.is_following
            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            : 'bg-slate-900 text-white shadow-slate-900/30 hover:bg-slate-800 active:bg-slate-950'"
        >
          <LucideIcon :icon="profile.is_following ? UserCheck : UserPlus" class="size-4" />
          {{ profile.is_following ? '已关注' : '关注' }}
        </button>
      </div>

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
            <LucideIcon :icon="Eye" class="size-3.5 text-slate-400" /> {{ fmt(profile.page_views) }} 次浏览
          </span>
          <span class="inline-flex items-center gap-1">
            <LucideIcon :icon="RefreshCw" class="size-3.5 text-slate-400" /> 更新于 {{ fmtDateTime(profile.updated_at) }}
          </span>
        </div>
      </div>

      <!-- Key stats: ranks + points (compact inline row) -->
      <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span class="inline-flex items-center gap-1.5">
          <LucideIcon :icon="Medal" class="size-4 text-amber-500" />
          <span class="font-bold text-slate-900">{{ rankText(profile.rank) }}</span>
          <span class="text-xs text-slate-400">全球排名</span>
        </span>
        <div class="h-4 w-px bg-slate-200" />
        <span class="inline-flex items-center gap-1.5">
          <LucideIcon :icon="MapPin" class="size-4 text-sky-500" />
          <span class="font-bold text-slate-900">{{ rankText(profile.server_rank) }}</span>
          <span class="text-xs text-slate-400">地区排名</span>
        </span>
        <div class="h-4 w-px bg-slate-200" />
        <span class="inline-flex items-center gap-1.5">
          <LucideIcon :icon="Sparkles" class="size-4 text-slate-700" />
          <span class="font-bold text-slate-900">{{ fmt(profile.points) }}</span>
          <span class="text-xs text-slate-400">奖杯点数</span>
        </span>
      </div>

      <!-- Account level + trophy total + per-tier breakdown in a single row -->
      <div class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
        <!-- Account level (with progress ring) -->
        <div class="flex items-center gap-2.5">
          <div class="relative grid size-9 shrink-0 place-items-center">
            <svg class="size-9 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" stroke-width="3" />
              <circle
                cx="18" cy="18" r="16" fill="none" stroke="#0f172a" stroke-width="3"
                stroke-linecap="round"
                :stroke-dasharray="`${(profile.progress / 100) * 100.5} 100.5`"
              />
            </svg>
            <LucideIcon :icon="Trophy" class="absolute size-4 text-slate-900" />
          </div>
          <div class="leading-tight">
            <div class="text-xl font-bold text-slate-900">{{ profile.trophy_level }}</div>
            <div class="text-xs text-slate-500">账户等级 · {{ profile.progress }}%</div>
          </div>
        </div>
        <div class="h-8 w-px bg-slate-200" />
        <!-- Trophy total -->
        <div class="flex items-center gap-2.5">
          <span class="grid size-9 shrink-0 place-items-center rounded-full bg-white text-slate-900 shadow-sm">
            <LucideIcon :icon="Trophy" class="size-4.5" />
          </span>
          <div class="leading-tight">
            <div class="text-xl font-bold text-slate-900">{{ fmt(total) }}</div>
            <div class="text-xs text-slate-400">奖杯总数</div>
          </div>
        </div>
        <div class="h-8 w-px bg-slate-200" />
        <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span v-for="t in trophyKinds" :key="t.key" class="inline-flex items-baseline gap-1.5">
            <span class="size-3 translate-y-0.5 rounded-full" :class="t.dot" />
            <span class="text-sm font-bold text-slate-900">{{ fmt(profile[t.key]) }}</span>
            <span class="text-xs" :class="t.text">{{ t.label }}</span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
