<script setup lang="ts">
import { ArrowLeft, ArrowRight, Loader2, Send } from 'lucide'

definePageMeta({ guestOnly: true })

const { t } = useI18n()

useSeo({
  title: () => t('seo.register.title'),
  description: () => t('seo.register.description'),
  noindex: true,
})

const {
  step, agreedNotice, agreedTerms, agreedPrivacy, password, confirmPassword, psnid, email,
  sending, cooldown, errorMessage, fieldErrors, pwMismatch,
  primaryAction, primaryDisabled, primaryBusy, primaryLabel, primaryTrailingIsSend,
  back, sendCode, goToLogin,
} = useRegisterFlow()
</script>

<template>
  <AuthShell compact-aside>
    <!-- Done: registration complete (no auto-login → CTA sends to sign-in). -->
    <AuthRegisterDone v-if="step === 6" @login="goToLogin" />

    <div v-else class="space-y-6">
      <div class="animate-rise space-y-3" style="animation-delay: 0.05s">
        <AuthStepper :count="5" :current="step" />
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ $t('auth.register.heading') }}</h1>
      </div>

      <form class="space-y-5" @submit.prevent="primaryAction">
        <Transition name="step" mode="out-in">
          <AuthRegisterTerms
            v-if="step === 1"
            key="1"
            v-model:agreed-notice="agreedNotice"
            v-model:agreed-terms="agreedTerms"
            v-model:agreed-privacy="agreedPrivacy"
          />
          <AuthRegisterPsnid
            v-else-if="step === 2"
            key="2"
            v-model:psnid="psnid"
            :psnid-error="fieldErrors.psnid"
          />
          <AuthRegisterPassword
            v-else-if="step === 3"
            key="3"
            v-model:password="password"
            v-model:confirm-password="confirmPassword"
            :password-error="fieldErrors.password"
            :mismatch="pwMismatch"
          />
          <AuthRegisterEmail
            v-else-if="step === 4"
            key="4"
            v-model:email="email"
            :email-error="fieldErrors.email"
          />
          <AuthRegisterVerify
            v-else
            key="5"
            :email="email"
            :cooldown="cooldown"
            :sending="sending"
            @resend="sendCode"
          />
        </Transition>

        <p
          v-if="errorMessage"
          class="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-700"
        >
          {{ errorMessage }}
        </p>

        <!-- Navigation -->
        <div class="flex items-center gap-3" :class="step > 1 ? 'justify-between' : 'justify-end'">
          <button
            v-if="step > 1"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl px-3 py-3.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            @click="back"
          >
            <LucideIcon :icon="ArrowLeft" class="size-4" />
            {{ $t('common.back') }}
          </button>

          <button
            type="submit"
            :disabled="primaryDisabled"
            class="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/30 transition-all duration-200 hover:bg-slate-800 hover:shadow-md active:scale-[0.99] active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-slate-900"
            :class="step > 1 ? 'max-w-[60%]' : ''"
          >
            <LucideIcon v-if="primaryBusy" :icon="Loader2" class="size-4 animate-spin" />
            {{ primaryLabel }}
            <LucideIcon
              v-if="!primaryBusy"
              :icon="primaryTrailingIsSend ? Send : ArrowRight"
              class="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </form>

      <p v-if="step === 1" class="text-center text-sm text-slate-500 animate-rise" style="animation-delay: 0.36s">
        {{ $t('auth.register.haveAccount') }}
        <NuxtLink to="/auth/login" class="font-semibold text-slate-900 transition hover:underline">
          {{ $t('auth.register.loginNow') }}
        </NuxtLink>
      </p>
    </div>
  </AuthShell>
</template>

<style scoped>
.step-enter-active,
.step-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(10px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
