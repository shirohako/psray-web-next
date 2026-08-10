<script setup lang="ts">
import { Lock } from 'lucide'

/** Step 2 — set the account password. `mismatch` is surfaced on the confirm field. */
defineProps<{ passwordError?: string, mismatch?: boolean }>()
const password = defineModel<string>('password', { required: true })
const confirmPassword = defineModel<string>('confirmPassword', { required: true })
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-slate-500">{{ $t('auth.register.password.hint') }}</p>
    <AuthField
      v-model="password"
      :label="$t('auth.field.password')"
      type="password"
      :icon="Lock"
      :placeholder="$t('auth.field.passwordPlaceholder')"
      autocomplete="new-password"
      :error="passwordError"
    />
    <AuthField
      v-model="confirmPassword"
      :label="$t('auth.field.confirmPassword')"
      type="password"
      :icon="Lock"
      :placeholder="$t('auth.field.confirmPasswordPlaceholder')"
      autocomplete="new-password"
      :error="mismatch ? $t('auth.field.passwordMismatch') : undefined"
    />
  </div>
</template>
