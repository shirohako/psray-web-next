<script setup lang="ts">
import { DEFAULT_LOCALE, HTML_LANG, isUiLocale } from '#shared/locales'

// `<html lang>` lives here rather than in a page so `error.vue` inherits it too.
// The i18n module's own `useLocaleHead()` can't be used: under the `no_prefix`
// strategy it emits no hreflang at all, and our alternates are per-page anyway
// (a trophy set advertises its own PSN languages). See `composables/useSeo.ts`.
const { locale } = useI18n()

useHead(() => ({
  htmlAttrs: {
    lang: HTML_LANG[isUiLocale(locale.value) ? locale.value : DEFAULT_LOCALE],
  },
}))
</script>

<template>
  <div>
    <NuxtLoadingIndicator class="opacity-100" />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <Toast />
    </ClientOnly>
  </div>
</template>
