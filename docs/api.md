# API Layer

A unified request layer for the PSRay backend, built around its response
standard (`{ data, meta }` success envelope / `{ error, request_id }` error
envelope, with real HTTP status codes).

## Overview

Two layers with clear responsibilities (based on Nuxt's "Custom useFetch"
recipe plus the service-layer split common in production apps):

| Layer | File | Purpose |
| --- | --- | --- |
| **HTTP client** | `app/plugins/api.ts` | The single ofetch instance `$api`: injects baseURL, `X-Request-Id`, Bearer auth, and normalizes every non-2xx response into an `ApiError` |
| **Imperative calls** | `app/composables/useApi.ts` | `get/post/put/patch/delete` — **for event handlers / submits / mutations**. Unwraps `data` by default; `raw.*` returns the full envelope |
| **Declarative fetching (SSR)** | `app/composables/useApiFetch.ts` | Wraps `useFetch` — **for page render data**. SSR hydration dedup, payload transfer, `refresh()`, reactive `data/pending/error` |
| **Type contracts** | `app/types/api.ts` | Envelope types, `ErrorCode`, pagination `meta` |
| **Error model** | `app/utils/ApiError.ts` | A branchable error class (`code`/`status`/`details`/`requestId`) |
| **Service modules** | `app/services/*.ts` | Group endpoints + types per domain (extension point, see below) |

> Key distinction: **SSR page data uses `useApiFetch`** (avoids double-fetch on
> hydration); **mutations / event handlers use `useApi` or `$api`** (imperative).

## Configuration

`baseURL` comes from runtimeConfig and can be overridden via env var. The repo
ships `.env.example`; copy it to `.env` and fill in per environment (`.env` is
gitignored):

```bash
cp .env.example .env
```

```ini
# .env
# Point to local Laravel in dev; to the production domain in prod
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
```

The auth token is read from the `auth_token` cookie by default and injected as
`Authorization: Bearer` (see `plugins/api.ts`). After login, write it:
`useCookie('auth_token').value = token`.

## Usage

### 1. Page data (SSR)

```vue
<script setup lang="ts">
const { data: user, pending, error, refresh } = useApiFetch<User>('/users/1')

// Reactive URL — refetches when the dependency changes
const route = useRoute()
const { data } = useApiFetch<User>(() => `/users/${route.params.id}`)

// When you need pagination meta
const { data: page } = useApiFetchRaw<User[]>('/users', { query: { page: 1 } })
// page.value?.data -> User[]   page.value?.meta?.total -> number
</script>
```

`error.value` is an `ApiError`, so you can branch on `error.value.code` directly.

### 2. Mutations / event handlers

```ts
const { get, post } = useApi()

async function login() {
  try {
    const token = await post<string>('/auth/login', { email, password })
    useCookie('auth_token').value = token
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.isValidation) formErrors.value = e.fieldErrors()  // { field: message }
      else toast(e.message)                                    // safe to display
    }
  }
}
```

### 3. Error handling: branch on `error.code`

```ts
import { ApiError } from '~/utils/ApiError'

catch (e) {
  if (e instanceof ApiError) {
    switch (e.code) {
      case 'UNAUTHENTICATED': return navigateTo('/login')
      case 'PSN_LEVEL_TOO_LOW': return toast(e.message)
      default: toast(e.message)
    }
    console.error('request_id:', e.requestId)  // reconcile with backend logs
  }
}
```

`ApiError` fields: `code` (stable enum, branch on this), `message`
(safe to display), `status` (HTTP status), `details` (field-level validation
errors), `requestId`, plus the `isValidation` / `fieldErrors()` helpers.

## Extension points

- **New domain endpoints**: add a file per domain under `app/services/`
  (e.g. `psn.ts`, `auth.ts`), following `users.ts`. Keep URLs and return types
  in one place; pages just import the methods.
- **New error codes**: extend the `ErrorCode` union in `app/types/api.ts` with
  known codes (any other string is still valid — no type error).
- **Global interceptors** (401 auto-logout, token refresh, telemetry): add them
  in `plugins/api.ts` (`onRequest` / `onResponseError`); all calls inherit them.
- **Per-endpoint meta type**: pass a second generic —
  `useApiFetchRaw<T, MyMeta>(...)` / `raw.get<T, MyMeta>(...)`.
