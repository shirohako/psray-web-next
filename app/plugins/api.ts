import { ApiError } from '~/utils/ApiError'

/**
 * Provides `$api`: a configured ofetch instance that talks to the PSRay backend.
 *
 * - Prefixes `runtimeConfig.public.apiBase`.
 * - Sends `Accept: application/json` + an `X-Request-Id` for tracing.
 * - Injects `Authorization: Bearer <token>` from the `auth_token` cookie.
 * - Normalizes every non-2xx response into a thrown {@link ApiError}.
 *
 * Returns the raw success envelope (`{ data, meta }`). Most call sites should
 * use the `useApi()` composable, which unwraps `data` for you.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    retry: 0,

    onRequest({ options }) {
      const token = useCookie<string | null>('auth_token')
      const headers = new Headers(options.headers)
      headers.set('Accept', 'application/json')
      if (!headers.has('X-Request-Id')) headers.set('X-Request-Id', crypto.randomUUID())
      if (token.value && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token.value}`)
      }
      // Attach Accept-Language: the saved trophy-language preference when
      // enabled, otherwise the user's browser default. A per-call header wins.
      const acceptLanguage = usePreferences().acceptLanguage.value
      if (acceptLanguage && !headers.has('Accept-Language')) {
        headers.set('Accept-Language', acceptLanguage)
      }
      options.headers = headers
    },

    onResponseError({ response }) {
      // Replace ofetch's FetchError with our normalized, branchable ApiError.
      throw ApiError.fromResponse(response.status, response._data)
    },
  })

  return {
    provide: { api },
  }
})
