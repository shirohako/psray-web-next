<template>
  <!-- Loading -->
  <div v-if="pending" class="space-y-6">
    <div class="h-48 animate-pulse rounded-lg bg-slate-200" />
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="h-96 animate-pulse rounded-lg bg-slate-200 lg:col-span-2" />
      <div class="h-96 animate-pulse rounded-lg bg-slate-200" />
    </div>
  </div>

  <!-- Error -->
  <div
    v-else-if="error || !profile"
    class="grid place-items-center rounded-lg border border-slate-200 bg-white py-24 text-center shadow-sm"
  >
    <div class="space-y-2">
      <div class="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 text-rose-500">
        <LucideIcon :icon="XCircle" class="size-7" />
      </div>
      <h1 class="text-lg font-semibold text-slate-900">找不到该用户</h1>
      <p class="text-sm text-slate-500">PSN ID「{{ psnid }}」不存在或未公开资料。</p>
      <NuxtLink to="/" class="inline-block pt-2 text-sm font-medium text-slate-900 hover:text-slate-700">
        返回首页
      </NuxtLink>
    </div>
  </div>

  <!-- Profile -->
  <div v-else class="space-y-6">
    <ProfileHeader :profile="profile" />
    <ProfileTrophyCalendar v-if="profile.calendar?.length" :calendar="profile.calendar" />

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Left: tabbed activity -->
      <div class="lg:col-span-2">
        <ProfileMainCard :psnid="psnid" />
      </div>

      <!-- Right: extended info -->
      <aside class="space-y-6">
        <ProfileStatsCard :profile="profile" />
        <ProfileSocialCard :profile="profile" />
        <ProfileAccountCard :profile="profile" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XCircle } from 'lucide'
import type { Profile } from '~/services/profile'

const route = useRoute()
const psnid = computed(() => String(route.params.psnid))

const { data: profile, pending, error } = await useApiFetch<Profile>(
  () => `/profile/${psnid.value}`,
)

useHead(() => ({ title: profile.value ? `${profile.value.psnid} · 个人资料` : '个人资料' }))
</script>
