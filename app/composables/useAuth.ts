import { ApiError } from '~/utils/ApiError'
import type { AuthRequirement, AuthSession, AuthUser, LoginPayload } from '~/services/auth'
import { loginSession, sanitizeAuthUser, useAuthApi } from '~/services/auth'

function toList(value?: string | string[]) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function authTokenCookie(expiresAt?: string | null) {
  return useCookie<string | null>('auth_token', {
    sameSite: 'lax',
    expires: expiresAt ? new Date(expiresAt) : undefined,
  })
}

export function useAuth() {
  const token = useCookie<string | null>('auth_token', { sameSite: 'lax' })
  const user = useState<AuthUser | null>('auth:user', () => null)
  const roles = useState<string[]>('auth:roles', () => [])
  const permissions = useState<string[]>('auth:permissions', () => [])
  const tokenMeta = useState<AuthSession['token'] | null>('auth:tokenMeta', () => null)
  const ready = useState('auth:ready', () => false)
  const loading = useState('auth:loading', () => false)

  const loggedIn = computed(() => !!token.value && !!user.value)
  const hasToken = computed(() => !!token.value)

  function applySession(session: AuthSession) {
    user.value = sanitizeAuthUser(session.user)
    roles.value = session.roles ?? []
    permissions.value = session.permissions ?? []
    tokenMeta.value = session.token
    ready.value = true
  }

  function clearState() {
    user.value = null
    roles.value = []
    permissions.value = []
    tokenMeta.value = null
    ready.value = true
  }

  function setToken(value: string, expiresAt?: string | null) {
    authTokenCookie(expiresAt).value = value
    token.value = value
  }

  function clearToken() {
    authTokenCookie().value = null
    token.value = null
  }

  async function fetchMe() {
    if (!token.value) {
      clearState()
      return null
    }

    loading.value = true
    try {
      const session = await useAuthApi().me()
      applySession(session)
      return session
    }
    catch (error) {
      if (error instanceof ApiError && error.code === 'UNAUTHENTICATED') {
        clearToken()
        clearState()
        return null
      }

      ready.value = false
      throw error
    }
    finally {
      loading.value = false
    }
  }

  async function init(force = false) {
    if (ready.value && !force) return user.value
    if (!token.value) {
      clearState()
      return null
    }

    try {
      const session = await fetchMe()
      return session?.user ?? null
    }
    catch {
      return null
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    try {
      const res = await useAuthApi().login(payload)
      const session = loginSession(res.data)
      const bearerToken = res.bearerToken ?? token.value

      if (!bearerToken) {
        clearToken()
        clearState()
        throw new ApiError({
          code: 'INTERNAL_ERROR',
          message: 'Login succeeded, but the API did not return a bearer token.',
          status: 500,
        })
      }

      setToken(bearerToken, session.token.expires_at)
      applySession(session)
      return session
    }
    finally {
      loading.value = false
    }
  }

  function logout() {
    clearToken()
    clearState()
  }

  function hasRole(role: string) {
    return roles.value.includes(role)
  }

  function hasPermission(permission: string) {
    return permissions.value.includes(permission)
  }

  function can(requirement?: AuthRequirement | boolean) {
    if (!requirement) return true
    if (requirement === true) return loggedIn.value

    const checks = [
      ...toList(requirement.roles).map(hasRole),
      ...toList(requirement.permissions).map(hasPermission),
    ]

    if (!checks.length) return loggedIn.value
    return requirement.requireAll === false ? checks.some(Boolean) : checks.every(Boolean)
  }

  return {
    user,
    roles,
    permissions,
    tokenMeta,
    ready,
    loading,
    loggedIn,
    hasToken,
    init,
    login,
    fetchMe,
    logout,
    hasRole,
    hasPermission,
    can,
  }
}
