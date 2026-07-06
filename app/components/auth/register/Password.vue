<script setup lang="ts">
import { Lock } from 'lucide'

/** Step 2 — set the account password. `mismatch` is surfaced on the confirm field. */
defineProps<{ passwordError?: string, mismatch?: boolean }>()
const password = defineModel<string>('password', { required: true })
const confirmPassword = defineModel<string>('confirmPassword', { required: true })
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-slate-500">为你的账号设置一个安全的登录密码。</p>
    <AuthField
      v-model="password"
      label="密码"
      type="password"
      :icon="Lock"
      placeholder="至少 8 位字符"
      autocomplete="new-password"
      :error="passwordError"
    />
    <AuthField
      v-model="confirmPassword"
      label="确认密码"
      type="password"
      :icon="Lock"
      placeholder="再次输入密码"
      autocomplete="new-password"
      :error="mismatch ? '两次输入的密码不一致' : undefined"
    />
  </div>
</template>
