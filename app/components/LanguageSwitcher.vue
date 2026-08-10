<script setup lang="ts">
import { Check, Languages } from 'lucide'
import { DEFAULT_LOCALE, LANG_COOKIE, type UiLocale } from '#shared/locales'

/**
 * UI language menu for the top bar.
 *
 * Each entry is a real `<NuxtLink>` rather than a click handler, so every
 * language has a crawlable `href` while still navigating client-side. Picking
 * one rewrites only the `lang` query param — every other param survives,
 * including `psnid` and an explicitly chosen trophy language (`tlang`) on a
 * trophy page, and `redirect` on the login page — and `ja`, the default,
 * *removes* the param instead of writing `?lang=ja`, so each language keeps
 * exactly one canonical URL.
 *
 * The cookie is written on click purely so a later visit to a bare URL comes
 * back in the chosen language; the URL itself remains the source of truth.
 * See `middleware/i18n.global.ts` for how the change is applied.
 */
const { locale, locales } = useI18n()
const route = useRoute()

const langCookie = useCookie<string | null>(LANG_COOKIE, {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  path: '/',
})

function targetFor(code: UiLocale) {
  const query = { ...route.query }
  if (code === DEFAULT_LOCALE) delete query.lang
  else query.lang = code
  return { path: route.path, query, hash: route.hash }
}

/** Runs before NuxtLink navigates, so the middleware sees the new preference. */
function remember(code: UiLocale) {
  langCookie.value = code
}
</script>

<template>
  <DropdownMenu align="right">
    <button
      type="button"
      :aria-label="$t('nav.aria.language')"
      :title="$t('nav.aria.language')"
      class="grid size-10 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
    >
      <LucideIcon :icon="Languages" class="size-5" stroke-width="1.75" />
    </button>

    <template #menu="{ close }">
      <NuxtLink
        v-for="item in locales"
        :key="item.code"
        :to="targetFor(item.code as UiLocale)"
        class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        :class="item.code === locale ? 'text-slate-900' : ''"
        @click="remember(item.code as UiLocale); close()"
      >
        <LucideIcon v-if="item.code === locale" :icon="Check" class="size-4 text-slate-400" />
        <span v-else class="size-4" />
        <!-- Endonyms, deliberately untranslated. -->
        {{ item.name }}
      </NuxtLink>
    </template>
  </DropdownMenu>
</template>
