import type { NitroFetchOptions } from 'nitropack'
import type { ApiMeta, ApiSuccess } from '~/types/api'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type Options = Omit<NitroFetchOptions<string>, 'method' | 'body'>

/**
 * Ergonomic wrapper around the `$api` plugin instance.
 *
 * Methods resolve to the unwrapped `data` payload. Errors are thrown as
 * {@link ApiError} (branch on `error.code`). When you need pagination `meta`,
 * use `raw.*`, which resolves to the full `{ data, meta }` envelope.
 *
 * ```ts
 * const { get, post, raw } = useApi()
 * const user   = await get<User>('/users/1')                 // -> User
 * const me     = await post<User>('/login', { email, pw })   // -> User
 * const page   = await raw.get<User[]>('/users', { query })  // -> { data, meta }
 * console.log(page.meta?.total)
 * ```
 */
export function useApi() {
  const { $api } = useNuxtApp()

  function raw<T, M = ApiMeta>(method: Method, url: string, body?: unknown, opts?: Options) {
    return $api<ApiSuccess<T, M>>(url, { method, body, ...opts })
  }

  function unwrap<T>(method: Method, url: string, body?: unknown, opts?: Options) {
    return raw<T>(method, url, body, opts).then(r => r.data)
  }

  return {
    /** Underlying ofetch instance — full control, returns the raw envelope. */
    $api,

    get: <T>(url: string, opts?: Options) => unwrap<T>('GET', url, undefined, opts),
    post: <T>(url: string, body?: unknown, opts?: Options) => unwrap<T>('POST', url, body, opts),
    put: <T>(url: string, body?: unknown, opts?: Options) => unwrap<T>('PUT', url, body, opts),
    patch: <T>(url: string, body?: unknown, opts?: Options) => unwrap<T>('PATCH', url, body, opts),
    delete: <T>(url: string, opts?: Options) => unwrap<T>('DELETE', url, undefined, opts),

    /** Same verbs, but resolve to the full `{ data, meta }` envelope. */
    raw: {
      get: <T, M = ApiMeta>(url: string, opts?: Options) => raw<T, M>('GET', url, undefined, opts),
      post: <T, M = ApiMeta>(url: string, body?: unknown, opts?: Options) => raw<T, M>('POST', url, body, opts),
      put: <T, M = ApiMeta>(url: string, body?: unknown, opts?: Options) => raw<T, M>('PUT', url, body, opts),
      patch: <T, M = ApiMeta>(url: string, body?: unknown, opts?: Options) => raw<T, M>('PATCH', url, body, opts),
      delete: <T, M = ApiMeta>(url: string, opts?: Options) => raw<T, M>('DELETE', url, undefined, opts),
    },
  }
}
