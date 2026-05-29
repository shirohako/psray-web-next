import type { UseFetchOptions } from '#app'
import type { ApiMeta, ApiSuccess } from '~/types/api'

/**
 * SSR-friendly, declarative data fetching for the PSRay API.
 *
 * Wraps Nuxt's `useFetch` with our configured `$api` client, so it inherits
 * auth, `X-Request-Id`, and {@link ApiError} normalization, while gaining
 * SSR hydration dedup, payload transfer, caching keys, `refresh()`, and the
 * reactive `{ data, pending, error, status }` refs.
 *
 * Use this in `<script setup>` / page setup for data the page renders.
 * For mutations and event handlers (login, submit, delete) use `useApi()`.
 *
 * By default it unwraps to the `data` payload. Need pagination `meta`? Use
 * {@link useApiFetchRaw}, which keeps the full `{ data, meta }` envelope.
 *
 * ```ts
 * const { data: user, pending, error, refresh } = useApiFetch<User>('/users/1')
 *
 * // reactive url re-fetches when `id` changes:
 * const { data } = useApiFetch<User>(() => `/users/${id.value}`)
 * ```
 */
export function useApiFetch<T>(
  url: string | (() => string),
  options?: UseFetchOptions<ApiSuccess<T>, T>,
) {
  const { $api } = useNuxtApp()
  return useFetch(url, {
    $fetch: $api as typeof $fetch,
    transform: (res: ApiSuccess<T>) => res.data,
    ...options,
  })
}

/**
 * Like {@link useApiFetch} but resolves `data` to the full `{ data, meta }`
 * envelope — use when the page needs pagination/total `meta`.
 *
 * ```ts
 * const { data } = useApiFetchRaw<User[]>('/users', { query: { page } })
 * // data.value?.data -> User[]   data.value?.meta?.total -> number
 * ```
 */
export function useApiFetchRaw<T, M = ApiMeta>(
  url: string | (() => string),
  options?: UseFetchOptions<ApiSuccess<T, M>>,
) {
  const { $api } = useNuxtApp()
  return useFetch(url, {
    $fetch: $api as typeof $fetch,
    ...options,
  })
}
