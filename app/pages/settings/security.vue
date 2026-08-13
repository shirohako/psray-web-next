<script setup lang="ts">
import { AtSign, BadgeCheck, ChevronRight, Fingerprint, KeyRound, Loader2, Lock, Mail, Pencil, Send } from 'lucide'
import { useAccountApi } from '~/services/account'
import { ApiError } from '~/utils/ApiError'

const { user, fetchMe } = useAuth()
const { t } = useI18n()
const toast = useToast()
const api = useAccountApi()

/**
 * Map an API error onto per-field messages by its stable `code`, and surface the
 * (displayable) `error.message` as a toast. Returns the field-error map so each
 * handler can assign it to its own reactive ref.
 */
function mapError(error: unknown, byCode: Record<string, string> = {}): Record<string, string> {
  if (!(error instanceof ApiError)) {
    toast.error({ title: t('settings.security.errors.generic') })
    return {}
  }
  const fields = error.isValidation ? error.fieldErrors() : {}
  const mapped = byCode[error.code]
  toast.error({ title: error.message })
  return mapped ? { ...fields, [mapped]: error.message } : fields
}

// --- Change email (two-step: send code, then confirm) ---------------------
const editingEmail = ref(false)
const newEmail = ref('')
const emailCode = ref('')
const emailPassword = ref('')
const emailSaving = ref(false)
const codeSending = ref(false)
const codeCooldown = ref(0)
const emailErrors = ref<Record<string, string>>({})

let cooldownTimer: ReturnType<typeof setInterval> | undefined

const currentEmail = computed(() => user.value?.email || t('settings.security.email.unbound'))
const canSendCode = computed(() => newEmail.value.trim() !== '' && codeCooldown.value === 0 && !codeSending.value)
const canSaveEmail = computed(() =>
  newEmail.value.trim() !== '' && emailCode.value.trim() !== '' && emailPassword.value !== '',
)

function startCooldown(seconds = 60) {
  codeCooldown.value = seconds
  cooldownTimer = setInterval(() => {
    codeCooldown.value -= 1
    if (codeCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = undefined
    }
  }, 1000)
}

function stopCooldown() {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
    cooldownTimer = undefined
  }
  codeCooldown.value = 0
}

function cancelEmail() {
  editingEmail.value = false
  newEmail.value = ''
  emailCode.value = ''
  emailPassword.value = ''
  emailErrors.value = {}
  stopCooldown()
}

async function sendCode() {
  if (!canSendCode.value) return
  codeSending.value = true
  emailErrors.value = {}
  try {
    await api.sendEmailCode({ email: newEmail.value.trim() })
    toast.success({ title: t('auth.register.codeSent') })
    startCooldown(60)
  }
  catch (error) {
    emailErrors.value = mapError(error, { EMAIL_ALREADY_USED: 'email' })
  }
  finally {
    codeSending.value = false
  }
}

async function saveEmail() {
  if (emailSaving.value || !canSaveEmail.value) return
  emailSaving.value = true
  emailErrors.value = {}
  try {
    await api.changeEmail({
      current_password: emailPassword.value,
      email: newEmail.value.trim(),
      code: emailCode.value.trim(),
    })
    toast.success({ title: t('settings.security.email.updated') })
    await fetchMe()
    cancelEmail()
  }
  catch (error) {
    emailErrors.value = mapError(error, {
      INVALID_CREDENTIALS: 'current_password',
      EMAIL_ALREADY_USED: 'email',
      VERIFICATION_CODE_INVALID: 'code',
      VERIFICATION_CODE_EXPIRED: 'code',
    })
  }
  finally {
    emailSaving.value = false
  }
}

onBeforeUnmount(stopCooldown)

// --- Change password ------------------------------------------------------
const editingPassword = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const pwSaving = ref(false)
const pwErrors = ref<Record<string, string>>({})

const pwMismatch = computed(() => confirmPassword.value !== '' && newPassword.value !== confirmPassword.value)
const canSavePassword = computed(() =>
  currentPassword.value !== '' && newPassword.value.length >= 8 && confirmPassword.value !== '' && !pwMismatch.value,
)
const passwordStrength = computed(() => {
  const value = newPassword.value
  let score = 0
  if (value.length >= 8) score += 1
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1

  if (!value) return { score: 0, label: t('settings.security.strength.empty'), color: 'bg-slate-200', text: 'text-slate-400' }
  if (score <= 1) return { score, label: t('settings.security.strength.weak'), color: 'bg-rose-400', text: 'text-rose-500' }
  if (score === 2) return { score, label: t('settings.security.strength.fair'), color: 'bg-amber-400', text: 'text-amber-500' }
  if (score === 3) return { score, label: t('settings.security.strength.good'), color: 'bg-sky-500', text: 'text-sky-600' }
  return { score, label: t('settings.security.strength.strong'), color: 'bg-emerald-500', text: 'text-emerald-600' }
})

function cancelPassword() {
  editingPassword.value = false
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  pwErrors.value = {}
}

async function savePassword() {
  if (pwSaving.value) return
  if (pwMismatch.value) {
    pwErrors.value = { confirm: t('auth.field.passwordMismatch') }
    return
  }
  pwSaving.value = true
  pwErrors.value = {}
  try {
    await api.changePassword({ current_password: currentPassword.value, new_password: newPassword.value })
    toast.success({
      title: t('settings.security.password.updated'),
      description: t('settings.security.password.updatedDetail'),
    })
    cancelPassword()
  }
  catch (error) {
    pwErrors.value = mapError(error, { INVALID_CREDENTIALS: 'current_password' })
  }
  finally {
    pwSaving.value = false
  }
}
</script>

<template>
  <section class="overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div class="space-y-6">
      <div class="overflow-hidden rounded-lg border border-stone-800 bg-stone-900 text-white shadow-sm">
        <div class="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div class="flex min-w-0 items-start gap-3">
            <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-white/10 text-sky-200 ring-1 ring-white/15">
              <LucideIcon :icon="Fingerprint" class="size-5.5" />
            </span>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wide text-sky-200">Security center</p>
              <h3 class="mt-1 text-xl font-bold tracking-tight text-white">{{ $t('settings.security.heading') }}</h3>
              <p class="mt-1 max-w-xl text-sm leading-relaxed text-stone-300">
                {{ $t('settings.security.subheading') }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 sm:w-48">
            <div class="rounded-lg bg-white/8 p-3 ring-1 ring-white/10">
              <p class="text-[11px] font-medium text-stone-400">{{ $t('settings.security.status.email') }}</p>
              <p class="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
                <LucideIcon :icon="BadgeCheck" class="size-4" />
                {{ $t('settings.security.status.bound') }}
              </p>
            </div>
            <div class="rounded-lg bg-white/8 p-3 ring-1 ring-white/10">
              <p class="text-[11px] font-medium text-stone-400">{{ $t('settings.security.status.password') }}</p>
              <p class="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
                <LucideIcon :icon="BadgeCheck" class="size-4" />
                {{ $t('settings.security.status.set') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Change email -->
      <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/3">
        <button
          v-if="!editingEmail"
          type="button"
          class="group flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50"
          @click="editingEmail = true"
        >
          <span class="flex min-w-0 items-start gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <LucideIcon :icon="AtSign" class="size-5" />
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-semibold text-slate-900">{{ $t('settings.security.email.label') }}</span>
              <span class="mt-1 block truncate text-sm text-slate-500">{{ currentEmail }}</span>
            </span>
          </span>
          <span class="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition group-hover:border-sky-200 group-hover:text-sky-700">
            <LucideIcon :icon="Pencil" class="size-4" />
            {{ $t('common.edit') }}
            <LucideIcon :icon="ChevronRight" class="size-4 text-slate-400" />
          </span>
        </button>

        <div v-else class="px-4 py-4">
          <div class="mb-4 flex items-start gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-sky-600 text-white shadow-sm shadow-sky-600/25">
              <LucideIcon :icon="AtSign" class="size-5" />
            </span>
            <div class="min-w-0">
              <h4 class="text-sm font-semibold text-slate-900">{{ $t('settings.security.email.editTitle') }}</h4>
              <p class="mt-1 truncate text-sm text-slate-500">{{ $t('settings.security.email.current', { email: currentEmail }) }}</p>
            </div>
          </div>

          <form class="space-y-4" @submit.prevent="saveEmail">
            <!-- Step 1: new email + send verification code -->
            <div class="flex items-end gap-2">
              <AuthField
                v-model="newEmail"
                class="flex-1"
                compact
                :label="$t('settings.security.email.new')"
                type="email"
                :icon="Mail"
                placeholder="you@example.com"
                autocomplete="email"
                :error="emailErrors.email"
              />
              <button
                type="button"
                :disabled="!canSendCode"
                class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
                @click="sendCode"
              >
                <LucideIcon :icon="codeSending ? Loader2 : Send" class="size-4" :class="codeSending && 'animate-spin'" />
                {{ codeCooldown > 0
                  ? $t('auth.register.cta.resendIn', { seconds: codeCooldown })
                  : (codeSending ? $t('auth.register.cta.sending') : $t('auth.register.cta.sendCode')) }}
              </button>
            </div>

            <!-- Step 2: code + current password -->
            <div class="grid gap-4 sm:grid-cols-2">
              <AuthField
                v-model="emailCode"
                compact
                :label="$t('auth.field.code')"
                type="text"
                :icon="KeyRound"
                :placeholder="$t('auth.field.codePlaceholder')"
                autocomplete="one-time-code"
                :error="emailErrors.code"
              />
              <AuthField
                v-model="emailPassword"
                compact
                :label="$t('auth.field.currentPassword')"
                type="password"
                :icon="Lock"
                placeholder="••••••••"
                autocomplete="current-password"
                :error="emailErrors.current_password"
              />
            </div>

            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                @click="cancelEmail"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="emailSaving || !canSaveEmail"
                class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LucideIcon v-if="emailSaving" :icon="Loader2" class="size-4 animate-spin" />
                {{ emailSaving ? $t('settings.security.email.saving') : $t('settings.security.email.save') }}
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- Change password -->
      <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/3">
        <button
          v-if="!editingPassword"
          type="button"
          class="group flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50"
          @click="editingPassword = true"
        >
          <span class="flex min-w-0 items-start gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-violet-100">
              <LucideIcon :icon="KeyRound" class="size-5" />
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-semibold text-slate-900">{{ $t('settings.security.password.label') }}</span>
              <span class="mt-1 block text-sm text-slate-500">{{ $t('settings.security.password.hint') }}</span>
            </span>
          </span>
          <span class="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition group-hover:border-violet-200 group-hover:text-violet-700">
            <LucideIcon :icon="Pencil" class="size-4" />
            {{ $t('common.edit') }}
            <LucideIcon :icon="ChevronRight" class="size-4 text-slate-400" />
          </span>
        </button>

        <div v-else class="px-4 py-4">
          <div class="mb-4 flex items-start gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-violet-600 text-white shadow-sm shadow-violet-600/25">
              <LucideIcon :icon="KeyRound" class="size-5" />
            </span>
            <div class="min-w-0">
              <h4 class="text-sm font-semibold text-slate-900">{{ $t('settings.security.password.editTitle') }}</h4>
              <p class="mt-1 text-sm text-slate-500">{{ $t('settings.security.password.editHint') }}</p>
            </div>
          </div>

          <form class="space-y-4" @submit.prevent="savePassword">
            <div class="grid gap-4 sm:grid-cols-2">
              <AuthField
                v-model="currentPassword"
                compact
                :label="$t('auth.field.currentPassword')"
                type="password"
                :icon="Lock"
                placeholder="••••••••"
                autocomplete="current-password"
                :error="pwErrors.current_password"
              />
              <AuthField
                v-model="newPassword"
                compact
                :label="$t('auth.field.newPassword')"
                type="password"
                :icon="Lock"
                placeholder="••••••••"
                autocomplete="new-password"
                :error="pwErrors.new_password"
              />
              <div class="sm:col-span-2">
                <AuthField
                  v-model="confirmPassword"
                  compact
                  :label="$t('auth.field.confirmNewPassword')"
                  type="password"
                  :icon="Lock"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  :error="pwErrors.confirm || (pwMismatch ? $t('auth.field.passwordMismatch') : undefined)"
                />
              </div>
            </div>

            <div class="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
              <div class="mb-2 flex items-center justify-between gap-3">
                <span class="text-xs font-medium text-slate-500">{{ $t('settings.security.strength.label') }}</span>
                <span class="text-xs font-semibold sm:hidden" :class="passwordStrength.text">{{ passwordStrength.label }}</span>
              </div>
              <div class="grid grid-cols-4 gap-1.5">
                <span
                  v-for="step in 4"
                  :key="step"
                  class="h-1.5 rounded-full transition"
                  :class="step <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'"
                />
              </div>
              <p class="mt-2 text-xs leading-relaxed text-slate-400">{{ $t('settings.security.strength.tip') }}</p>
            </div>

            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                @click="cancelPassword"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="pwSaving || !canSavePassword"
                class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LucideIcon v-if="pwSaving" :icon="Loader2" class="size-4 animate-spin" />
                {{ pwSaving ? $t('settings.security.password.saving') : $t('settings.security.password.save') }}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  </section>
</template>
