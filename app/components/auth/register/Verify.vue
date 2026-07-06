<script setup lang="ts">
import { Loader2, MailCheck, RotateCcw } from 'lucide'

/** Step 4 — instructions to place the emailed code into the PSN profile + resend. */
defineProps<{ email: string, cooldown: number, sending: boolean }>()
defineEmits<{ resend: [] }>()

const guides = [
  '打开邮箱，查收 6 位验证码。',
  '打开 PlayStation App 或官网，登录您的 PSN 账户，把验证码填入「关于我 / About Me」个人简介并保存。',
  '回到本页点击「完成注册」。验证成功后，您可以删除 PSN 账户简介中的临时验证码。',
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <LucideIcon :icon="MailCheck" class="mt-0.5 size-4.5 shrink-0" />
      <span>验证码已发送至 <span class="font-semibold">{{ email.trim() }}</span>，请查收邮件。部分服务商可能被标记为 SPAM，请检查垃圾箱。</span>
    </div>

    <ol class="space-y-3">
      <li v-for="(guide, i) in guides" :key="i" class="flex items-start gap-3">
        <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
          {{ i + 1 }}
        </span>
        <span class="pt-0.5 text-sm leading-relaxed text-slate-600">{{ guide }}</span>
      </li>
    </ol>

    <button
      type="button"
      :disabled="cooldown > 0 || sending"
      class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
      @click="$emit('resend')"
    >
      <LucideIcon :icon="sending ? Loader2 : RotateCcw" class="size-4" :class="sending && 'animate-spin'" />
      {{ cooldown > 0 ? `${cooldown}s 后可重新发送` : '没收到？重新发送验证码' }}
    </button>
  </div>
</template>
