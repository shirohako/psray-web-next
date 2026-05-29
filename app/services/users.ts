import type { ApiMeta } from '~/types/api'

/**
 * Example service module — the recommended extensibility pattern.
 *
 * Group related endpoints + their types in one file under `app/services/`,
 * so call sites import a typed method instead of hand-writing URL strings.
 * Copy this shape for `psn.ts`, `auth.ts`, etc.
 *
 * Imperative methods (find/create/update/remove) build on `useApi()` and are
 * meant for event handlers. For page data that should render on the server,
 * call `useApiFetch` with the same paths from your page's setup.
 */

export interface User {
  id: number
  name: string
  // extend with real backend fields
}

export function useUsers() {
  const { get, post, patch, delete: del, raw } = useApi()

  return {
    /** Paginated list — returns the full envelope so `meta` is available. */
    list: (query?: Record<string, unknown>) =>
      raw.get<User[], ApiMeta>('/users', { query }),

    find: (id: number | string) => get<User>(`/users/${id}`),

    create: (payload: Partial<User>) => post<User>('/users', payload),

    update: (id: number | string, payload: Partial<User>) =>
      patch<User>(`/users/${id}`, payload),

    remove: (id: number | string) => del<null>(`/users/${id}`),
  }
}
