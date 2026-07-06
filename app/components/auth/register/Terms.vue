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
        <span class="block">PSRay 是一个 PSN 用户交流网站。</span>
        <span class="flex items-center gap-1">
          您需要一个
          <LucideIcon :icon="Gamepad2" class="size-4 text-slate-400" />
          PlayStation (PSN) 账户。
        </span>
      </span>
    </label>

    <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-600 transition hover:border-slate-300">
      <UiCheckbox1 v-model="agreedTerms" />
      <span class="flex flex-wrap items-center gap-x-1">
        我已阅读并同意
        <LucideIcon :icon="FileText" class="size-4 text-slate-400" />
        <a href="#" class="font-semibold text-slate-900 hover:underline" @click.stop>使用条款</a>。
      </span>
    </label>

    <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-600 transition hover:border-slate-300">
      <UiCheckbox1 v-model="agreedPrivacy" />
      <span class="flex flex-wrap items-center gap-x-1">
        我已阅读并同意
        <LucideIcon :icon="ShieldCheck" class="size-4 text-slate-400" />
        <a href="#" class="font-semibold text-slate-900 hover:underline" @click.stop>隐私协议</a>。
      </span>
    </label>
  </div>
</template>
