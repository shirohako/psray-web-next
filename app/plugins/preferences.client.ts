/**
 * Restores site-wide preferences at client startup. Current language settings
 * already arrive through the SSR-readable cookie; `load()` also migrates the
 * legacy localStorage-only format used by earlier releases.
 */
export default defineNuxtPlugin(() => {
  const migrated = usePreferences().load()
  if (migrated) window.location.reload()
})
