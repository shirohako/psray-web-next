import { LANG_COOKIE, resolveUiLocale } from '#shared/locales'

/**
 * Applies the `?lang=` → cookie → `ja` precedence to client-side navigations.
 * The server-render equivalent is `plugins/i18n-locale.server.ts`.
 *
 * The equality guard below is load-bearing, not an optimization. Under the
 * `no_prefix` strategy the module's own `locale-changing` middleware is never
 * registered, so its `initial` flag is never cleared — which means the fast
 * path in `loadAndSetLocale()` (`locale === oldLocale && !initial`) can never
 * hit. Without the guard, every single client-side navigation would re-run the
 * locale switch and re-fetch the message catalog.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // `useI18n()` needs a component setup scope, which middleware doesn't have.
  const { $i18n } = useNuxtApp()

  const target = resolveUiLocale(
    to.query.lang,
    useCookie<string | null>(LANG_COOKIE).value,
  )

  if ($i18n.locale.value === target) return

  await $i18n.setLocale(target)
})
