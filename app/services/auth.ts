import type { ApiSuccess } from '~/types/api'
import type { Profile } from '~/services/profile'
import { ApiError } from '~/utils/ApiError'

/**
 * Private per-account settings. Only the authenticated user carries these, and
 * only `GET /auth/me` returns them — the public profile (`/profile/:psnid`) and
 * anonymous/tracked users never include a `setting` block. Present once the
 * account is registered.
 */
export interface AccountSetting {
  email: string | null
  social_account: string | null
  timezone: string | null
  calendar_enabled: boolean
  milestones_enabled: boolean
  /** Whether `avatar_url` is a user-uploaded/custom image vs. the synced PSN one. */
  has_custom_avatar: boolean
}

/**
 * The authenticated user as returned by `GET /auth/me`. Shares the public
 * {@link Profile} fields, plus `role` and the private {@link AccountSetting}
 * block that only exists for the logged-in account.
 */
export type AuthUser = Omit<Partial<Profile>, 'admin_level'> & {
  id: number
  psnid: string
  avatar_url?: string
  role?: string
  setting?: AccountSetting
  [key: string]: unknown
}

export interface AuthTokenMeta {
  expires_at: string
  last_used_at?: string | null
}

export type LoginToken = AuthTokenMeta & {
  value?: string
  token?: string
  access_token?: string
  plain_text_token?: string
}

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

export interface LoginResponse {
  token: string | LoginToken
  token_type?: 'Bearer' | string
  expires_at?: string
  roles?: string[]
  permissions?: string[]
  user: AuthUser & { password?: unknown; admin_level?: unknown }
}

export interface AuthRequirement {
  roles?: string | string[]
  permissions?: string | string[]
  requireAll?: boolean
}

export function sanitizeAuthUser(user: LoginResponse['user'] | AuthSession['user']): AuthUser {
  const { password: _password, admin_level: _adminLevel, ...safe } = user as Record<string, unknown>
  return safe as AuthUser
}

function parseBearerToken(value: string | null) {
  if (!value) return null
  return value.replace(/^Bearer\s+/i, '').trim() || null
}

function tokenValue(token: LoginResponse['token']) {
  if (typeof token === 'string') return token
  return token.value ?? token.token ?? token.access_token ?? token.plain_text_token ?? null
}

export function loginTokenMeta(res: LoginResponse): AuthTokenMeta {
  if (typeof res.token === 'object') {
    return {
      expires_at: res.token.expires_at,
      last_used_at: res.token.last_used_at,
    }
  }

  return {
    expires_at: res.expires_at ?? '',
    last_used_at: null,
  }
}

export function loginSession(res: LoginResponse): AuthSession {
  return {
    user: sanitizeAuthUser(res.user),
    roles: res.roles ?? [],
    permissions: res.permissions ?? [],
    token: loginTokenMeta(res),
  }
}

export function useAuthApi() {
  const { get, post } = useApi()
  const { $api } = useNuxtApp()

  return {
    async login(payload: LoginPayload) {
      const response = await $api.raw<ApiSuccess<LoginResponse>>('/auth/login', {
        method: 'POST',
        body: payload,
      })
      const data = response._data?.data
      if (!data) {
        throw new ApiError({
          code: 'INTERNAL_ERROR',
          message: 'Login succeeded, but the API response was empty.',
          status: 500,
        })
      }

      const bearerToken =
        tokenValue(data.token)
        ?? parseBearerToken(response.headers.get('Authorization'))
        ?? parseBearerToken(response.headers.get('X-Auth-Token'))

      return { data, bearerToken }
    },
    me: () => get<AuthSession>('/auth/me'),
    logout: (payload?: LogoutPayload) => post<LogoutResponse>('/auth/logout', payload),
  }
}
