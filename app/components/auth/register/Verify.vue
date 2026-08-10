<script setup lang="ts">
import { Loader2, MailCheck, RotateCcw } from 'lucide'

/** Step 4 — instructions to place the emailed code into the PSN profile + resend. */
defineProps<{ email: string, cooldown: number, sending: boolean }>()
defineEmits<{ resend: [] }>()

/** Three numbered instructions; the catalog holds one key per step. */
const guideKeys = [1, 2, 3].map(n => `auth.register.verify.step${n}`)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <LucideIcon :icon="MailCheck" class="mt-0.5 size-4.5 shrink-0" />
      <i18n-t keypath="auth.register.verify.sentTo" scope="global" tag="span">
        <template #email>
          <span class="font-semibold">{{ email.trim() }}</span>
        </template>
      </i18n-t>
    </div>

    <ol class="space-y-3">
      <li v-for="(key, i) in guideKeys" :key="key" class="flex items-start gap-3">
        <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
          {{ i + 1 }}
        </span>
        <span class="pt-0.5 text-sm leading-relaxed text-slate-600">{{ $t(key) }}</span>
      </li>
    </ol>

    <button
      type="button"
      :disabled="cooldown > 0 || sending"
      class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
      @click="$emit('resend')"
    >
      <LucideIcon :icon="sending ? Loader2 : RotateCcw" class="size-4" :class="sending && 'animate-spin'" />
      {{ cooldown > 0
        ? $t('auth.register.cta.resendIn', { seconds: cooldown })
        : $t('auth.register.verify.resend') }}
    </button>
  </div>
</template>
