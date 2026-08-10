<script setup lang="ts">
import { Mail, Lock, ArrowRight } from 'lucide'
import { ApiError } from '~/utils/ApiError'

definePageMeta({ guestOnly: true })

const auth = useAuth()
const route = useRoute()
const { t } = useI18n()

useSeo({
  title: () => t('seo.login.title'),
  description: () => t('seo.login.description'),
  // A sign-in form has no content to rank for, and `?redirect=` would multiply
  // it into near-duplicates.
  noindex: true,
})

const loginId = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const fieldErrors = ref<Record<string, string>>({})

const canSubmit = computed(() => loginId.value.trim() !== '' && password.value !== '')

function fallbackPath() {
  return auth.user.value?.psnid ? `/p/${encodeURIComponent(auth.user.value.psnid)}` : '/'
}

function redirectPath() {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) return redirect
  return fallbackPath()
}

function setLoginError(error: unknown) {
  fieldErrors.value = {}

  if (!(error instanceof ApiError)) {
    errorMessage.value = t('auth.login.errors.generic')
    return
  }

  if (error.isValidation) {
    fieldErrors.value = error.fieldErrors()
    errorMessage.value = t('auth.login.errors.checkFields')
    return
  }

  if (error.code === 'INVALID_CREDENTIALS') {
    errorMessage.value = t('errors.api.INVALID_CREDENTIALS')
    return
  }

  if (error.code === 'ACCOUNT_TERMINATED') {
    errorMessage.value = t('errors.api.ACCOUNT_TERMINATED')
    return
  }

  errorMessage.value = error.message || t('auth.login.errors.generic')
}

async function onSubmit() {
  if (!canSubmit.value || submitting.value) return

  errorMessage.value = ''
  fieldErrors.value = {}
  submitting.value = true

  try {
    await auth.login({ loginId: loginId.value.trim(), password: password.value })
    await navigateTo(redirectPath())
  }
  catch (error) {
    setLoginError(error)
  }
  finally {
    submitting.value = false
  }
}

</script>

<template>
  <AuthShell>
    <div class="space-y-8">
      <header class="animate-rise" style="animation-delay: 0.05s">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ $t('auth.login.heading') }}</h1>
        <p class="mt-2 text-sm text-slate-500">{{ $t('auth.login.tagline') }}</p>
      </header>

      <form class="space-y-5" @submit.prevent="onSubmit">
        <div class="animate-rise" style="animation-delay: 0.12s">
          <AuthField
            v-model="loginId"
            label="PSN / Email"
            type="text"
            :icon="Mail"
            placeholder="you@example.com"
            autocomplete="username"
            :error="fieldErrors.loginId || fieldErrors.login_id"
          />
        </div>

        <div class="animate-rise" style="animation-delay: 0.18s">
          <AuthField
            v-model="password"
            :label="$t('auth.field.password')"
            type="password"
            :icon="Lock"
            placeholder="••••••••"
            autocomplete="current-password"
            :error="fieldErrors.password"
          />
        </div>

        <p
          v-if="errorMessage"
          class="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-700 animate-rise"
          style="animation-delay: 0.22s"
        >
          {{ errorMessage }}
        </p>

        <div class="flex items-center justify-end animate-rise" style="animation-delay: 0.24s">
          <a href="#" class="text-sm font-medium text-slate-500 transition hover:text-slate-900">
            {{ $t('auth.login.forgotPassword') }}
          </a>
        </div>

        <button
          type="submit"
          :disabled="!canSubmit || submitting"
          class="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/30 transition-all duration-200 hover:bg-slate-800 hover:shadow-md hover:shadow-slate-900/20 active:scale-[0.99] active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-slate-900 animate-rise"
          style="animation-delay: 0.3s"
        >
          {{ submitting ? $t('auth.login.submitting') : $t('nav.login') }}
          <LucideIcon
            v-if="!submitting"
            :icon="ArrowRight"
            class="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </form>

      <p class="text-center text-sm text-slate-500 animate-rise" style="animation-delay: 0.36s">
        {{ $t('auth.login.noAccount') }}
        <NuxtLink to="/auth/register" class="font-semibold text-slate-900 transition hover:underline">
          {{ $t('auth.login.registerNow') }}
        </NuxtLink>
      </p>
    </div>
  </AuthShell>
</template>
