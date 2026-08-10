<script setup lang="ts">
import { ShieldCheck, User } from 'lucide'

/** Step 2 — verify that the PSN ID is eligible before collecting account details. */
defineProps<{ psnidError?: string }>()
const psnid = defineModel<string>('psnid', { required: true })

/** Three eligibility bullets; one catalog key each. */
const requirementKeys = [1, 2, 3].map(n => `auth.register.psnid.requirement${n}`)
</script>

<template>
  <div class="space-y-5">
    <AuthField
      v-model="psnid"
      label="PSN ID"
      type="text"
      :icon="User"
      :placeholder="$t('auth.register.psnid.placeholder')"
      autocomplete="username"
      :error="psnidError"
    />

    <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <LucideIcon :icon="ShieldCheck" class="size-4 text-slate-500" />
        {{ $t('auth.register.psnid.requirementsTitle') }}
      </div>
      <p class="mb-3 text-xs leading-relaxed text-slate-400">
        {{ $t('auth.register.psnid.requirementsHint') }}
      </p>
      <ul class="space-y-1.5 text-xs leading-relaxed text-slate-500">
        <li v-for="key in requirementKeys" :key="key" class="flex gap-2">
          <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-300" />
          <span>{{ $t(key) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
