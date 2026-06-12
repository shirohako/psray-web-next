/**
 * Hydrates site-wide preferences from localStorage at client startup, before
 * the first API requests fire — so the `$api` plugin can attach the user's
 * `Accept-Language` from the very first call.
 */
export default defineNuxtPlugin(() => {
  usePreferences().load()
})
