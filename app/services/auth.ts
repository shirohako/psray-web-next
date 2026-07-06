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

/** Registration: bind email + password to an in-library PSN account (see `pages/auth/register.vue`). */
export interface RegisterPayload {
  psnid: string
  email: string
  password: string
}

/** Shared `POST /auth/send-code` payload. `type` selects the code's purpose. */
export interface SendCodePayload {
  email: string
  type: 'register' | 'change_email'
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

/** Token envelope shared by `POST /auth/login` and `POST /auth/register`. We only consume the token + expiry. */
interface TokenResponse {
  token: string
  token_type?: string
  expires_at?: string
}

/** The resolved bearer token from an auth endpoint; the caller loads the account via {@link useAuthApi.me}. */
export interface IssuedToken {
  token: string
  expiresAt: string | null
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

  /** POST a token-issuing endpoint (`/auth/login`, `/auth/register`) and pull the bearer token off it. */
  async function authenticate(url: string, body: unknown): Promise<IssuedToken> {
    const res = await $api.raw<ApiSuccess<TokenResponse>>(url, { method: 'POST', body })
    const data = res._data?.data
    const token =
      data?.token
      ?? parseBearerToken(res.headers.get('Authorization'))
      ?? parseBearerToken(res.headers.get('X-Auth-Token'))

    if (!token) {
      throw new ApiError({
        code: 'INTERNAL_ERROR',
        message: 'Authentication succeeded, but the API did not return a token.',
        status: 500,
      })
    }

    return { token, expiresAt: data?.expires_at ?? null }
  }

  return {
    login: (payload: LoginPayload) => authenticate('/auth/login', payload),
    /** Verify email + PSN-profile ownership and register; on success the backend auto-issues a token. */
    register: (payload: RegisterPayload) => authenticate('/auth/register', payload),
    /** Email a verification code for the given `type` (register / change-email). */
    sendCode: (payload: SendCodePayload) => post<{ message: string }>('/auth/send-code', payload),
    me: async () => toAuthSession(await get<RawMeResponse>('/auth/me')),
    logout: (payload?: LogoutPayload) => post<LogoutResponse>('/auth/logout', payload),
  }
}
