<script setup lang="ts">
import { Eye, EyeOff, type IconNode } from 'lucide'

const props = defineProps<{
  label: string
  icon: IconNode
  type?: string
  placeholder?: string
  autocomplete?: string
}>()

const model = defineModel<string>({ required: true })

// Local reveal state for password fields.
const revealed = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() =>
  isPassword.value ? (revealed.value ? 'text' : 'password') : (props.type ?? 'text'),
)

const fieldId = useId()
</script>

<template>
  <div>
    <label :for="fieldId" class="mb-1.5 block text-sm font-medium text-slate-700">
      {{ label }}
    </label>
    <div class="group relative">
      <LucideIcon
        :icon="icon"
        class="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-slate-900"
      />
      <input
        :id="fieldId"
        v-model="model"
        :type="inputType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        class="auth-input w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 text-sm text-slate-900 transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
        :class="isPassword ? 'pr-11' : 'pr-3.5'"
      />
      <button
        v-if="isPassword"
        type="button"
        :aria-label="revealed ? '隐藏密码' : '显示密码'"
        @click="revealed = !revealed"
        class="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 active:scale-95"
      >
        <LucideIcon :icon="revealed ? EyeOff : Eye" class="size-4.5" />
      </button>
    </div>
  </div>
</template>
