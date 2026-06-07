import type { ApiSuccess } from '~/types/api'
import type { Profile } from '~/services/profile'
import { ApiError } from '~/utils/ApiError'

export type AuthUser = Omit<Partial<Profile>, 'admin_level'> & {
  id: number
  psnid: string
  avatar_url?: string
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
  const { get } = useApi()
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
  }
}
