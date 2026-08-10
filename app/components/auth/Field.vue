<script setup lang="ts">
import { Eye, EyeOff, type IconNode } from 'lucide'

const props = defineProps<{
  label: string
  icon: IconNode
  type?: string
  placeholder?: string
  autocomplete?: string
  error?: string
  /** Shorter, denser field — for settings forms where the tall auth-shell height is too much. */
  compact?: boolean
}>()

const model = defineModel<string>({ required: true })

// Local reveal state for password fields.
const revealed = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() =>
  isPassword.value ? (revealed.value ? 'text' : 'password') : (props.type ?? 'text'),
)

const fieldId = useId()
const errorId = `${fieldId}-error`
</script>

<template>
  <div>
    <label :for="fieldId" class="mb-1.5 block text-sm font-medium text-slate-700">
      {{ label }}
    </label>
    <div class="group relative">
      <LucideIcon
        :icon="icon"
        class="pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-slate-900"
        :class="compact ? 'left-3 size-4' : 'left-3.5 size-4.5'"
      />
      <input
        :id="fieldId"
        v-model="model"
        :type="inputType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : undefined"
        class="auth-input w-full border bg-slate-50 text-sm text-slate-900 transition-all duration-200 placeholder:text-slate-400 hover:bg-white focus:bg-white focus:outline-none focus:ring-4"
        :class="[
          compact ? 'rounded-lg py-2 pl-9.5' : 'rounded-xl py-3.5 pl-11',
          isPassword ? (compact ? 'pr-9.5' : 'pr-11') : (compact ? 'pr-3' : 'pr-3.5'),
          error
            ? 'border-rose-300 hover:border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
            : 'border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-slate-900/10',
        ]"
      />
      <button
        v-if="isPassword"
        type="button"
        :aria-label="revealed ? $t('auth.field.hidePassword') : $t('auth.field.showPassword')"
        @click="revealed = !revealed"
        class="absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 active:scale-95"
        :class="compact ? 'right-1.5 size-7' : 'right-2 size-8'"
      >
        <LucideIcon :icon="revealed ? EyeOff : Eye" :class="compact ? 'size-4' : 'size-4.5'" />
      </button>
    </div>
    <p v-if="error" :id="errorId" class="mt-1.5 text-xs font-medium text-rose-600">
      {{ error }}
    </p>
  </div>
</template>
