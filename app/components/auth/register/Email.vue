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
      label="邮箱"
      type="email"
      :icon="Mail"
      placeholder="you@example.com"
      autocomplete="email"
      :error="emailError"
    />
    <p class="text-xs leading-relaxed text-slate-400">
      点击「发送验证码」后，我们会向该邮箱发送一个 6 位验证码。
    </p>
  </div>
</template>
