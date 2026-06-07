import type { AuthRequirement } from '~/services/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const requirement = to.meta.auth as boolean | AuthRequirement | undefined
  const guestOnly = to.meta.guestOnly === true

  if (!requirement && !guestOnly) return

  const auth = useAuth()

  if (auth.hasToken.value && !auth.ready.value) {
    await auth.fetchMe()
  }

  if (guestOnly && auth.loggedIn.value) {
    return navigateTo(auth.user.value?.psnid ? `/p/${encodeURIComponent(auth.user.value.psnid)}` : '/')
  }

  if (!requirement) return

  if (!auth.loggedIn.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }

  if (!auth.can(requirement)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You do not have permission to access this page.',
    })
  }
})
