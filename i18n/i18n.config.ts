/**
 * vue-i18n options. Locale *selection* lives in `app/plugins/i18n-locale.server.ts`
 * and `app/middleware/i18n.global.ts`; this file only configures the runtime.
 */
export default defineI18nConfig(() => ({
  legacy: false,
  // `ja.json` is the source catalog every other locale is translated from, so a
  // key missing anywhere renders Japanese rather than the raw key. Costs a
  // `ja` download on top of the active locale — see `scripts/check-locales.mjs`,
  // which enforces key parity so this can eventually be turned off.
  fallbackLocale: 'ja',
}))
