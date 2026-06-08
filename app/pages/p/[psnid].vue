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
    <ProfileHeader :profile="profile" :follow-pending="followPending" @toggle-follow="toggleFollow" />
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
import { UserCheck, XCircle } from 'lucide'
import type { Profile } from '~/services/profile'
import { useProfiles } from '~/services/profile'
import { ApiError } from '~/utils/ApiError'

const route = useRoute()
const psnid = computed(() => String(route.params.psnid))
const auth = useAuth()

const { data: profile, pending, error } = await useApiFetch<Profile>(
  () => `/profile/${psnid.value}`,
)

const { follow, unfollow } = useProfiles()
const followPending = ref(false)
const toast = useToast()

function redirectToLogin() {
  return navigateTo({
    path: '/auth/login',
    query: { redirect: route.fullPath },
  })
}

/**
 * Toggle the follow relationship. Optimistically flips `is_following` and the
 * follower count (so the header button and the social card update instantly),
 * then reconciles with the server response and rolls back on failure.
 */
async function toggleFollow() {
  const p = profile.value
  if (!p || followPending.value) return
  if (!auth.loggedIn.value) {
    await redirectToLogin()
    return
  }

  const next = !p.is_following
  p.is_following = next
  p.followers += next ? 1 : -1

  followPending.value = true
  try {
    const res = next ? await follow(p.psnid) : await unfollow(p.psnid)
    if (res.following !== next) {
      p.is_following = res.following
      p.followers += res.following ? 1 : -1
    }
    if (next && p.is_following) {
      toast.add({
        title: '关注成功',
        description: `已关注 ${p.psnid}`,
        icon: UserCheck,
      })
    }
  }
  catch (err) {
    p.is_following = !next
    p.followers += next ? -1 : 1
    if (err instanceof ApiError && err.code === 'UNAUTHENTICATED') {
      await redirectToLogin()
      return
    }
    throw err
  }
  finally {
    followPending.value = false
  }
}

useHead(() => ({ title: profile.value ? `${profile.value.psnid} · 个人资料` : '个人资料' }))
</script>
