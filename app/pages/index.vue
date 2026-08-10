<script setup lang="ts">
import { ListOrdered, MessageSquare, RefreshCw, Search, Trophy, User, type IconNode } from 'lucide'
import { DEFAULT_LOCALE, HTML_LANG, isUiLocale } from '#shared/locales'

const { t, locale } = useI18n()
const psnid = ref('')

function goToProfile() {
  const id = psnid.value.trim()
  if (!id) return
  navigateTo(`/p/${encodeURIComponent(id)}`)
}

function goToSync() {
  const id = psnid.value.trim()
  if (!id) return
  navigateTo(`/sync?psnid=${encodeURIComponent(id)}`)
}

/**
 * What the site actually does, in the order a new visitor meets it: look up a
 * player → open a trophy set → compare against everyone else → keep it fresh.
 * Rendered as real prose rather than icons alone, so the landing page has
 * something to rank for beyond its own name.
 */
const features: { icon: IconNode; key: string }[] = [
  { icon: User, key: 'profile' },
  { icon: Trophy, key: 'trophies' },
  { icon: ListOrdered, key: 'leaderboard' },
  { icon: MessageSquare, key: 'tips' },
]

useSeo({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
})

// Minimal, honest structured data: what this site is and what it's called.
// No SearchAction — that promises a search-results URL we don't have yet.
const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/+$/, '')
useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'PSRay',
      'url': siteUrl,
      'inLanguage': HTML_LANG[isUiLocale(locale.value) ? locale.value : DEFAULT_LOCALE],
      'description': t('seo.home.description'),
    }),
  }],
}))
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-10">
    <!-- Hero: the one thing most visitors came to do -->
    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {{ $t('home.hero.title') }}
      </h1>
      <p class="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
        {{ $t('home.hero.lead') }}
      </p>

      <form
        class="mt-6 flex flex-col gap-2 sm:flex-row"
        :aria-label="$t('home.lookup.heading')"
        @submit.prevent="goToProfile"
      >
        <div class="relative flex-1">
          <LucideIcon
            :icon="Search"
            class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />
          <input
            v-model="psnid"
            type="text"
            :placeholder="$t('home.lookup.placeholder')"
            autocapitalize="off"
            autocomplete="off"
            spellcheck="false"
            class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
        </div>
        <div class="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <button
            type="submit"
            :disabled="!psnid.trim()"
            class="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/30 transition hover:bg-slate-800 active:bg-slate-950 disabled:opacity-40 disabled:hover:bg-slate-900 sm:shrink-0"
          >
            <LucideIcon :icon="Search" class="size-4" />
            {{ $t('home.lookup.view') }}
          </button>
          <button
            type="button"
            :disabled="!psnid.trim()"
            class="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white sm:shrink-0"
            @click="goToSync"
          >
            <LucideIcon :icon="RefreshCw" class="size-4" />
            {{ $t('home.lookup.sync') }}
          </button>
        </div>
      </form>

      <p class="mt-2.5 text-xs leading-relaxed text-slate-400">{{ $t('home.lookup.hint') }}</p>
    </section>

    <!-- What the site does -->
    <section>
      <h2 class="text-lg font-bold tracking-tight text-slate-900">{{ $t('home.features.title') }}</h2>
      <p class="mt-1.5 text-sm text-slate-500">{{ $t('home.features.lead') }}</p>

      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <article
          v-for="feature in features"
          :key="feature.key"
          class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <span class="grid size-10 place-items-center rounded-lg bg-slate-900 text-white">
            <LucideIcon :icon="feature.icon" class="size-5" stroke-width="1.75" />
          </span>
          <h3 class="mt-3.5 text-sm font-semibold text-slate-900">
            {{ $t(`home.features.${feature.key}.title`) }}
          </h3>
          <p class="mt-1.5 text-sm leading-relaxed text-slate-500">
            {{ $t(`home.features.${feature.key}.description`) }}
          </p>
        </article>
      </div>
    </section>
  </div>
</template>
