import { useAuthApi } from '~/services/auth'
import type { Profile } from '~/services/profile'
import { useProfiles } from '~/services/profile'
import { ApiError } from '~/utils/ApiError'

/**
 * State machine for the 5-step registration wizard (see `pages/auth/register.vue`
 * and the `AuthRegister*` step components):
 *   1 terms → 2 PSN ID eligibility → 3 password → 4 email (sends code)
 *   → 5 verify via PSN profile.
 *
 * The emailed code is placed into the PSN "About Me" and read back by the
 * backend on register — it never round-trips through the form. Owns all
 * validation, the send-code cooldown, error mapping, and post-register redirect.
 */
export function useRegisterFlow() {
  const toast = useToast()
  const route = useRoute()
  const { t, te } = useI18n()

  /**
   * Copy for a failed request, preferring our own wording over the server's:
   * a flow-specific override, then the shared `errors.api.<CODE>` map, then the
   * server's own message, then the caller's generic fallback.
   */
  function apiMessage(error: ApiError, fallbackKey: string, overrides: Record<string, string> = {}) {
    const override = overrides[error.code]
    if (override) return t(override)
    const shared = `errors.api.${error.code}`
    if (te(shared)) return t(shared)
    return error.message || t(fallbackKey)
  }

  const step = ref(1)
  // Three independent consents on step 1; all must be checked to advance.
  const agreedNotice = ref(false)
  const agreedTerms = ref(false)
  const agreedPrivacy = ref(false)
  const agreed = computed(() => agreedNotice.value && agreedTerms.value && agreedPrivacy.value)
  const password = ref('')
  const confirmPassword = ref('')
  const psnid = ref('')
  const email = ref('')

  const checkingPsnid = ref(false) // profile eligibility request in flight
  const checkedPsnid = ref('') // PSN ID that has passed local eligibility checks
  const checkedProfile = ref<Profile | null>(null)
  const sending = ref(false) // send-code request in flight
  const submitting = ref(false) // register request in flight
  const cooldown = ref(0) // send-code resend cooldown, seconds
  const sentEmail = ref('') // email a code was last successfully sent to
  const sentPsnid = ref('') // PSN ID the current code belongs to
  const errorMessage = ref('')
  const fieldErrors = ref<Record<string, string>>({})

  // A code is already outstanding for the current email + PSN ID, so returning
  // to the email step can advance without a
  // redundant resend that would invalidate the code already placed in PSN.
  const codeAlreadySent = computed(() =>
    !!sentEmail.value
    && sentEmail.value === email.value.trim()
    && sentPsnid.value === psnid.value.trim(),
  )

  // --- Per-step validation -------------------------------------------------
  const psnidVerified = computed(() =>
    !!checkedPsnid.value
    && checkedPsnid.value === psnid.value.trim()
    && checkedProfile.value != null,
  )
  const canCheckPsnid = computed(() => psnid.value.trim() !== '' && !checkingPsnid.value)
  const pwMismatch = computed(() => confirmPassword.value !== '' && password.value !== confirmPassword.value)
  const canSetPassword = computed(() =>
    password.value.length >= 8 && confirmPassword.value !== '' && !pwMismatch.value,
  )
  const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
  const canSendCode = computed(() =>
    psnidVerified.value && emailValid.value && cooldown.value === 0 && !sending.value,
  )

  watch(psnid, (value) => {
    const trimmed = value.trim()
    if (trimmed !== checkedPsnid.value) {
      checkedPsnid.value = ''
      checkedProfile.value = null
    }
    if (trimmed !== sentPsnid.value) {
      sentEmail.value = ''
      sentPsnid.value = ''
    }
    if (fieldErrors.value.psnid) {
      const { psnid: _psnid, ...rest } = fieldErrors.value
      fieldErrors.value = rest
    }
  })

  // --- Resend cooldown timer -----------------------------------------------
  let cooldownTimer: ReturnType<typeof setInterval> | undefined
  function startCooldown(seconds = 60) {
    cooldown.value = seconds
    cooldownTimer = setInterval(() => {
      cooldown.value -= 1
      if (cooldown.value <= 0 && cooldownTimer) {
        clearInterval(cooldownTimer)
        cooldownTimer = undefined
      }
    }, 1000)
  }
  onBeforeUnmount(() => cooldownTimer && clearInterval(cooldownTimer))

  // --- Navigation ----------------------------------------------------------
  function back() {
    if (step.value > 1) {
      errorMessage.value = ''
      step.value -= 1
    }
  }

  /** Advance from a purely-local step. Async steps go through `checkPsnid` / `sendCode`. */
  function next() {
    errorMessage.value = ''
    if (step.value === 1 && agreed.value) step.value = 2
    else if (step.value === 3 && canSetPassword.value) step.value = 4
  }

  async function checkPsnid() {
    if (!canCheckPsnid.value) return
    checkingPsnid.value = true
    errorMessage.value = ''
    fieldErrors.value = {}
    try {
      const id = psnid.value.trim()
      const profile = await useProfiles().find(id)
      const failures: string[] = []

      if (profile.registered_at != null) failures.push(t('errors.api.ALREADY_REGISTERED'))
      if (profile.trophy_level <= 100) failures.push(t('errors.api.PSN_LEVEL_TOO_LOW'))
      if (!profile.is_profile_public) failures.push(t('auth.register.errors.profilePrivate'))

      if (failures.length > 0) {
        fieldErrors.value = { psnid: failures.join(' ') }
        return
      }

      checkedPsnid.value = id
      checkedProfile.value = profile
      step.value = 3
    }
    catch (error) {
      handlePsnidError(error)
    }
    finally {
      checkingPsnid.value = false
    }
  }

  async function sendCode() {
    if (!canSendCode.value) return
    sending.value = true
    errorMessage.value = ''
    fieldErrors.value = {}
    try {
      await useAuthApi().sendCode({ email: email.value.trim(), type: 'register' })
      toast.success({ title: t('auth.register.codeSent') })
      sentEmail.value = email.value.trim()
      sentPsnid.value = psnid.value.trim()
      startCooldown(60)
      step.value = 5
    }
    catch (error) {
      handleSendError(error)
    }
    finally {
      sending.value = false
    }
  }

  async function submit() {
    if (submitting.value) return
    submitting.value = true
    errorMessage.value = ''
    fieldErrors.value = {}
    try {
      // Register only — no auto-login. The backend still issues a token, but we
      // deliberately don't store it: the user logs in manually from the done screen.
      await useAuthApi().register({
        psnid: psnid.value.trim(),
        email: email.value.trim(),
        password: password.value,
      })
      step.value = 6
    }
    catch (error) {
      handleRegisterError(error)
    }
    finally {
      submitting.value = false
    }
  }

  /** Done CTA → login, carrying any `?redirect=` through so it survives the sign-in. */
  function goToLogin() {
    const redirect = route.query.redirect
    return navigateTo({
      path: '/auth/login',
      query: typeof redirect === 'string' ? { redirect } : undefined,
    })
  }

  /** The primary CTA does something different on each step. */
  function primaryAction() {
    if (step.value === 3) {
      return next()
    }
    if (step.value === 2) {
      if (psnidVerified.value) {
        errorMessage.value = ''
        step.value = 3
        return
      }
      return checkPsnid()
    }
    if (step.value === 4) {
      // Code already out for this email → just advance; else send a fresh one.
      if (codeAlreadySent.value) {
        errorMessage.value = ''
        step.value = 5
        return
      }
      return sendCode()
    }
    if (step.value === 5) return submit()
    return next()
  }
  const primaryDisabled = computed(() => {
    if (step.value === 1) return !agreed.value
    if (step.value === 2) return !canCheckPsnid.value && !psnidVerified.value
    if (step.value === 3) return !canSetPassword.value
    if (step.value === 4) return codeAlreadySent.value ? false : !canSendCode.value
    return submitting.value
  })
  // `sending` only belongs to the primary CTA on step 4; on step 5 it drives
  // the separate resend button, so it must not spin the submit button.
  const primaryBusy = computed(() =>
    (step.value === 2 && checkingPsnid.value)
    || (step.value === 4 && sending.value)
    || submitting.value,
  )
  const primaryLabel = computed(() => {
    if (step.value === 2) return t(checkingPsnid.value ? 'auth.register.cta.verifying' : 'auth.register.cta.verifyPsnid')
    if (step.value === 4) {
      if (codeAlreadySent.value) return t('common.next')
      if (cooldown.value > 0) return t('auth.register.cta.resendIn', { seconds: cooldown.value })
      return t(sending.value ? 'auth.register.cta.sending' : 'auth.register.cta.sendCode')
    }
    if (step.value === 5) return t(submitting.value ? 'auth.register.cta.submitting' : 'auth.register.cta.submit')
    return t('common.next')
  })
  // Show the paper-plane only when actually dispatching a new code.
  const primaryTrailingIsSend = computed(() => step.value === 4 && !codeAlreadySent.value)

  // --- Error mapping -------------------------------------------------------
  function handlePsnidError(error: unknown) {
    fieldErrors.value = {}
    if (!(error instanceof ApiError)) {
      fieldErrors.value = { psnid: t('auth.register.errors.psnidGeneric') }
      return
    }
    if (error.isValidation) {
      fieldErrors.value = error.fieldErrors()
      return
    }
    fieldErrors.value = {
      psnid: apiMessage(error, 'auth.register.errors.psnidGeneric', {
        // An unsynced PSN ID reads as "not found" here, so point at the fix.
        NOT_FOUND: 'auth.register.errors.psnidNotSynced',
        USER_NOT_FOUND: 'auth.register.errors.psnidNotSynced',
      }),
    }
  }

  function handleSendError(error: unknown) {
    fieldErrors.value = {}
    if (!(error instanceof ApiError)) {
      errorMessage.value = t('auth.register.errors.sendGeneric')
      return
    }
    if (error.isValidation) {
      fieldErrors.value = error.fieldErrors()
      errorMessage.value = t('auth.register.errors.checkFields')
      return
    }
    // Mirror the server's own throttling so the resend button stays disabled.
    if (error.code === 'TOO_MANY_REQUESTS') startCooldown(60)
    errorMessage.value = apiMessage(error, 'auth.register.errors.sendGeneric', {
      EMAIL_ALREADY_USED: 'auth.register.errors.emailTaken',
    })
  }

  /** Codes the user can only fix by going back to an earlier step. */
  const REGISTER_ERROR_STEP: Record<string, number> = {
    EMAIL_ALREADY_USED: 4,
    USER_NOT_FOUND: 2,
    ALREADY_REGISTERED: 2,
    PSN_LEVEL_TOO_LOW: 2,
  }

  function handleRegisterError(error: unknown) {
    fieldErrors.value = {}
    if (!(error instanceof ApiError)) {
      errorMessage.value = t('auth.register.errors.registerGeneric')
      return
    }
    if (error.isValidation) {
      fieldErrors.value = error.fieldErrors()
      errorMessage.value = t('auth.register.errors.checkFields')
      if (fieldErrors.value.psnid) step.value = 2
      else if (fieldErrors.value.email) step.value = 4
      return
    }
    errorMessage.value = apiMessage(error, 'auth.register.errors.registerGeneric', {
      EMAIL_ALREADY_USED: 'auth.register.errors.emailTakenGoBack',
      USER_NOT_FOUND: 'auth.register.errors.psnAccountNotFound',
    })
    const backTo = REGISTER_ERROR_STEP[error.code]
    if (backTo) step.value = backTo
  }

  return {
    // step + fields
    step,
    agreedNotice,
    agreedTerms,
    agreedPrivacy,
    password,
    confirmPassword,
    psnid,
    email,
    // status
    checkingPsnid,
    sending,
    submitting,
    cooldown,
    errorMessage,
    fieldErrors,
    pwMismatch,
    // primary CTA
    primaryAction,
    primaryDisabled,
    primaryBusy,
    primaryLabel,
    primaryTrailingIsSend,
    // actions
    back,
    checkPsnid,
    sendCode,
    goToLogin,
  }
}
