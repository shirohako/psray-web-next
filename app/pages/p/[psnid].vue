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
          <ProfileRecentTips
            v-if="profile.recent_tips !== null"
            :psnid="psnid"
            :tip-count="profile.tip_count"
            :tips="profile.recent_tips"
          />
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
import { DEFAULT_LOCALE, HTML_LANG, isUiLocale } from '#shared/locales'

const route = useRoute()
const { t, locale } = useI18n()
const psnid = computed(() => String(route.params.psnid))
const auth = useAuth()
const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/+$/, '')

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

const canonicalProfilePath = computed(() => profile.value
  ? `/p/${encodeURIComponent(profile.value.psnid)}`
  : route.path)

useSeo({
  title: () => (profile.value
    ? t('seo.profile.title', { psnid: profile.value.psnid })
    : t('seo.profile.titleFallback')),
  description: () => (profile.value
    ? t('seo.profile.description', { psnid: profile.value.psnid })
    : ''),
  image: () => profile.value?.avatar_url ?? undefined,
  canonicalPath: () => canonicalProfilePath.value,
  // A private profile exposes no trophy data, so there is nothing worth indexing.
  noindex: () => !profile.value?.is_profile_public,
})

const canonicalProfileUrl = computed(() => {
  const lang = isUiLocale(locale.value) ? locale.value : DEFAULT_LOCALE
  return `${siteUrl}${canonicalProfilePath.value}${lang === DEFAULT_LOCALE ? '' : `?lang=${encodeURIComponent(lang)}`}`
})

function isoDate(value: Profile['registered_at']): string | undefined {
  if (value == null || value === '') return undefined
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

// Only registered PSRay members are creators affiliated with this site. A
// synced-only PSN record is useful content, but it is not a community profile.
const profileJsonLd = computed(() => {
  const p = profile.value
  if (!p?.is_profile_public || p.registered_at == null) return null

  const url = canonicalProfileUrl.value
  const person: Record<string, unknown> = {
    '@id': `${url}#person`,
    '@type': 'Person',
    'name': p.psnid,
    'identifier': p.psnid,
    'url': url,
    'image': p.avatar_url,
    'interactionStatistic': [{
      '@type': 'InteractionCounter',
      'interactionType': 'https://schema.org/FollowAction',
      'userInteractionCount': p.follower_count,
    }],
    'agentInteractionStatistic': [
      {
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/FollowAction',
        'userInteractionCount': p.following_count,
      },
      {
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/WriteAction',
        'userInteractionCount': p.tip_count,
      },
    ],
  }
  if (p.about_me) person.description = p.about_me

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    'url': url,
    'dateCreated': isoDate(p.registered_at),
    'inLanguage': HTML_LANG[isUiLocale(locale.value) ? locale.value : DEFAULT_LOCALE],
    'mainEntity': person,
  }
})

useHead(() => ({
  script: profileJsonLd.value
    ? [{
        key: 'profile-jsonld',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(profileJsonLd.value).replace(/</g, '\\u003c'),
      }]
    : [],
}))
</script>
