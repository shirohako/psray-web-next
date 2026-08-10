<script setup lang="ts">
import { Mail } from 'lucide'

/** Step 4 — email; the parent's primary CTA sends the verification code. */
defineProps<{ emailError?: string }>()
const email = defineModel<string>('email', { required: true })
</script>

<template>
  <div class="space-y-5">
    <AuthField
      v-model="email"
      :label="$t('auth.field.email')"
      type="email"
      :icon="Mail"
      placeholder="you@example.com"
      autocomplete="email"
      :error="emailError"
    />
    <p class="text-xs leading-relaxed text-slate-400">
      {{ $t('auth.register.email.hint') }}
    </p>
  </div>
</template>
