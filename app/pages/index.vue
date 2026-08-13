<script setup lang="ts">
import { Gamepad2, RefreshCw, Search, UserRound } from 'lucide'
import { DEFAULT_LOCALE, HTML_LANG, isUiLocale } from '#shared/locales'

const { t, locale } = useI18n()
const psnid = ref('')
const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/+$/, '')

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

useSeo({
  title: () => t('seo.home.title'),
  siteNameFirst: true,
  description: () => t('seo.home.description'),
  image: () => `${siteUrl}/images/psray-share.png`,
  imageAlt: () => `PSRay — ${t('home.hero.title')}`,
  imageWidth: 1200,
  imageHeight: 630,
  imageType: 'image/png',
})

// Minimal, honest structured data: what this site is and what it's called.
// No SearchAction — that promises a search-results URL we don't have yet.
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
      <div class="flex items-center gap-2.5">
        <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-900 text-white shadow-sm shadow-slate-900/20">
          <LucideIcon :icon="Gamepad2" class="size-5" />
        </span>
        <h1 class="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {{ $t('home.hero.title') }}
        </h1>
      </div>
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
        <div class="grid grid-cols-1 gap-2 sm:flex sm:shrink-0">
          <button
            type="submit"
            :disabled="!psnid.trim()"
            class="inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/30 transition hover:bg-slate-800 active:bg-slate-950 disabled:opacity-40 disabled:hover:bg-slate-900 sm:shrink-0"
          >
            <LucideIcon :icon="UserRound" class="size-4 shrink-0" />
            {{ $t('home.lookup.view') }}
          </button>
          <button
            type="button"
            :disabled="!psnid.trim()"
            class="inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white sm:shrink-0"
            @click="goToSync"
          >
            <LucideIcon :icon="RefreshCw" class="size-4 shrink-0" />
            {{ $t('home.lookup.sync') }}
          </button>
        </div>
      </form>

      <p class="mt-2.5 text-xs leading-relaxed text-slate-400">{{ $t('home.lookup.hint') }}</p>
    </section>
  </div>
</template>
