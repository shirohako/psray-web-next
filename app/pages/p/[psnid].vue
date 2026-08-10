<template>
  <!-- Loading -->
  <div v-if="pending" class="space-y-6">
    <div class="h-48 animate-pulse rounded-lg bg-slate-200" />
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="h-96 animate-pulse rounded-lg bg-slate-200 lg:col-span-2" />
      <div class="h-96 animate-pulse rounded-lg bg-slate-200" />
    </div>
  </div>

  <!-- Profile. A missing PSN ID raises a real 404 via `error.vue`. -->
  <div v-else-if="profile" class="space-y-6">
    <ProfileHeader :profile="profile" :follow-pending="followPending" @toggle-follow="toggleFollow" />

    <!-- Private profiles expose no trophy data: hide the calendar and the two columns below. -->
    <template v-if="profile.is_profile_public">
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { UserCheck } from 'lucide'
import type { Profile } from '~/services/profile'
import { useProfiles } from '~/services/profile'
import { ApiError } from '~/utils/ApiError'

const route = useRoute()
const { t } = useI18n()
const psnid = computed(() => String(route.params.psnid))
const auth = useAuth()

const { data: profile, pending, error } = await useApiFetch<Profile>(
  () => `/profile/${psnid.value}`,
)

// An unknown PSN ID must answer 404 rather than a 200 page that says so.
// Watched, not checked once: moving between two profiles reuses this component.
function raiseFetchError(err: typeof error.value) {
  if (!err) return
  const notFound = (err as { statusCode?: number }).statusCode === 404
  showError(createError({
    statusCode: notFound ? 404 : 502,
    statusMessage: notFound ? 'Profile not found' : 'Profile service unavailable',
    fatal: true,
  }))
}
raiseFetchError(error.value)
watch(error, raiseFetchError)

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
  p.follower_count += next ? 1 : -1

  followPending.value = true
  try {
    const res = next ? await follow(p.psnid) : await unfollow(p.psnid)
    if (res.following !== next) {
      p.is_following = res.following
      p.follower_count += res.following ? 1 : -1
    }
    if (next && p.is_following) {
      toast.add({
        title: t('toast.followed.title'),
        description: t('toast.followed.description', { psnid: p.psnid }),
        icon: UserCheck,
      })
    }
  }
  catch (err) {
    p.is_following = !next
    p.follower_count += next ? -1 : 1
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

useSeo({
  title: () => (profile.value
    ? t('seo.profile.title', { psnid: profile.value.psnid })
    : t('seo.profile.titleFallback')),
  description: () => (profile.value
    ? t('seo.profile.description', { psnid: profile.value.psnid })
    : ''),
  image: () => profile.value?.avatar_url ?? undefined,
  // A private profile exposes no trophy data, so there is nothing worth indexing.
  noindex: () => !profile.value?.is_profile_public,
})
</script>
