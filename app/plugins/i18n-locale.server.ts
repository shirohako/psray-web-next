import { LANG_COOKIE, resolveUiLocale } from '#shared/locales'

/**
 * Picks the UI locale for the server-rendered response: `?lang=` → cookie → `ja`.
 *
 * Runs after the i18n module has installed its own locale detection (which is a
 * no-op here — `detectBrowserLanguage` is off) and before any route middleware,
 * so even the error page rendered by `auth.global.ts` comes out in the right
 * language.
 *
 * Hydration safety is the module's: `setLocale()` records the choice in
 * `useState('i18n:resolved-locale')`, which is serialized into the payload and
 * adopted verbatim by the client on first render. That holds because both
 * inputs — the query string and the cookie — are visible to the server. Resolve
 * a locale from anything client-only (`localStorage`, `navigator.languages`,
 * `onMounted`) and this guarantee is gone.
 */
export default defineNuxtPlugin({
  name: 'psray:i18n-locale',
  dependsOn: ['i18n:plugin:route-locale-detect'],
  async setup(nuxtApp) {
    const url = useRequestURL()
    const target = resolveUiLocale(
      url.searchParams.get('lang'),
      useCookie<string | null>(LANG_COOKIE).value,
    )

    if (nuxtApp.$i18n.locale.value !== target) {
      await nuxtApp.$i18n.setLocale(target)
    }
  },
})
