import type { AuthRequirement } from '~/services/auth'

declare module '#app' {
  interface PageMeta {
    auth?: boolean | AuthRequirement
    guestOnly?: boolean
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    auth?: boolean | AuthRequirement
    guestOnly?: boolean
  }
}

export {}
