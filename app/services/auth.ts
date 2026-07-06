import type { ApiSuccess } from '~/types/api'
import type { Profile } from '~/services/profile'
import { ApiError } from '~/utils/ApiError'

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

/**
 * Private per-account settings. Only the authenticated user carries these —
 * the public profile (`/profile/:psnid`) and anonymous/tracked users never
 * include a `settings` block.
 */
export interface AccountSettings {
  social_account: string | null
  timezone: string | null
  calendar_enabled: boolean
  milestones_enabled: boolean
  /** Whether `avatar_url` currently holds a custom image rather than the synced PSN one. */
  has_custom_avatar: boolean
  /** The user's `use_custom_avatar` toggle (see `PATCH /user/setting` in `~/services/account`). */
  use_custom_avatar: boolean
}

/**
 * The authenticated account. Structurally the public {@link Profile} minus the
 * viewer-relative fields the backend omits when the profile *is* you
 * (follow flags, milestones, calendar), plus the private `email` and
 * `settings` only the logged-in user receives. `role` is inherited from
 * {@link Profile}.
 */
export interface AuthUser
  extends Omit<Profile, 'can_follow' | 'is_following' | 'is_follower' | 'milestones' | 'calendar' | 'social_account'> {
  email: string | null
  settings: AccountSettings
}

export interface AuthTokenMeta {
  expires_at: string
  last_used_at?: string | null
}

/** The resolved session shared by `login()` and `fetchMe()`. */
export interface AuthSession {
  user: AuthUser
  roles: string[]
  permissions: string[]
  token: AuthTokenMeta
}

export interface LoginPayload {
  loginId: string
  password: string
}

export interface LogoutPayload {
  all?: boolean
}

export interface LogoutResponse {
  revoked: number
}

/** Route-guard requirement declared via `definePageMeta({ auth })`; see `middleware/auth.global.ts`. */
export interface AuthRequirement {
  roles?: string | string[]
  permissions?: string | string[]
  requireAll?: boolean
}

// ---------------------------------------------------------------------------
// Wire shapes + normalization
//
// `login()` and `/auth/me` disagree on a couple of details, so a single
// `normalizeUser` reconciles both into one `AuthUser` — nothing downstream has
// to special-case which endpoint the data came from:
//   • `email`/`settings` arrive flat on `user` (login) or nested under a
//     legacy `setting` block (`/auth/me`).
//   • the server may leak `password`/`admin_level`, which we strip.
// ---------------------------------------------------------------------------

/** A `user` object straight off the wire, before {@link normalizeUser}. */
type RawUser = Record<string, unknown> & {
  email?: string | null
  settings?: AccountSettings
  setting?: { email?: string | null, settings?: AccountSettings }
}

function normalizeUser(raw: RawUser): AuthUser {
  const { setting, password: _password, admin_level: _adminLevel, ...user } = raw
  return {
    ...user,
    email: raw.email ?? setting?.email ?? null,
    settings: raw.settings ?? setting?.settings,
  } as AuthUser
}

/** `GET /auth/me` envelope: a `user` plus session `role`/`permissions`/`token`. */
interface RawMeResponse {
  user: RawUser
  role?: string
  roles?: string[]
  permissions?: string[]
  token: AuthTokenMeta
}

function toAuthSession(raw: RawMeResponse): AuthSession {
  return {
    user: normalizeUser(raw.user),
    roles: raw.roles ?? (raw.role ? [raw.role] : []),
    permissions: raw.permissions ?? [],
    token: raw.token,
  }
}

/** `POST /auth/login` envelope. We only consume the bearer token + its expiry. */
interface LoginResponse {
  token: string
  token_type?: string
  expires_at?: string
}

function parseBearerToken(value: string | null) {
  if (!value) return null
  return value.replace(/^Bearer\s+/i, '').trim() || null
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export function useAuthApi() {
  const { get, post } = useApi()
  const { $api } = useNuxtApp()

  return {
    /** Authenticate and return just the bearer token; the caller loads the account via {@link me}. */
    async login(payload: LoginPayload) {
      const res = await $api.raw<ApiSuccess<LoginResponse>>('/auth/login', {
        method: 'POST',
        body: payload,
      })
      const data = res._data?.data
      const token =
        data?.token
        ?? parseBearerToken(res.headers.get('Authorization'))
        ?? parseBearerToken(res.headers.get('X-Auth-Token'))

      if (!token) {
        throw new ApiError({
          code: 'INTERNAL_ERROR',
          message: 'Login succeeded, but the API did not return a token.',
          status: 500,
        })
      }

      return { token, expiresAt: data?.expires_at ?? null }
    },
    me: async () => toAuthSession(await get<RawMeResponse>('/auth/me')),
    logout: (payload?: LogoutPayload) => post<LogoutResponse>('/auth/logout', payload),
  }
}
