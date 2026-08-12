<script setup lang="ts">
import { FileText, Gamepad2, ShieldCheck } from 'lucide'

/** Step 1 — three independent consents; the parent gates on all being checked. */
const agreedNotice = defineModel<boolean>('agreedNotice', { required: true })
const agreedTerms = defineModel<boolean>('agreedTerms', { required: true })
const agreedPrivacy = defineModel<boolean>('agreedPrivacy', { required: true })
</script>

<template>
  <div class="space-y-3">
    <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-600 transition hover:border-slate-300">
      <UiCheckbox1 v-model="agreedNotice" />
      <span>
        <span class="block">{{ $t('auth.register.terms.intro') }}</span>
        <span class="flex items-center gap-1">
          <i18n-t keypath="auth.register.terms.needsPsn" scope="global" tag="span" class="flex items-center gap-1">
            <template #icon>
              <LucideIcon :icon="Gamepad2" class="size-4 text-slate-400" />
            </template>
          </i18n-t>
        </span>
      </span>
    </label>

    <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-600 transition hover:border-slate-300">
      <UiCheckbox1 v-model="agreedTerms" />
      <span class="flex flex-wrap items-center gap-x-1">
        <i18n-t keypath="auth.register.terms.agreeTerms" scope="global" tag="span" class="flex flex-wrap items-center gap-x-1">
          <template #icon>
            <LucideIcon :icon="FileText" class="size-4 text-slate-400" />
          </template>
          <template #link>
            <NuxtLink
              to="/terms"
              target="_blank"
              rel="noopener"
              class="font-semibold text-slate-900 hover:underline"
              @click.stop
            >
              {{ $t('auth.register.terms.termsLink') }}
            </NuxtLink>
          </template>
        </i18n-t>
      </span>
    </label>

    <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-600 transition hover:border-slate-300">
      <UiCheckbox1 v-model="agreedPrivacy" />
      <span class="flex flex-wrap items-center gap-x-1">
        <i18n-t keypath="auth.register.terms.agreePrivacy" scope="global" tag="span" class="flex flex-wrap items-center gap-x-1">
          <template #icon>
            <LucideIcon :icon="ShieldCheck" class="size-4 text-slate-400" />
          </template>
          <template #link>
            <NuxtLink
              to="/privacy"
              target="_blank"
              rel="noopener"
              class="font-semibold text-slate-900 hover:underline"
              @click.stop
            >
              {{ $t('auth.register.terms.privacyLink') }}
            </NuxtLink>
          </template>
        </i18n-t>
      </span>
    </label>
  </div>
</template>
