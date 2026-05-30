<script setup lang="ts">
import { Languages } from 'lucide'

defineProps<{
  /** Available language codes (excluding the implicit "original"). */
  languages: string[]
}>()

// '' means the original (untranslated) text.
const model = defineModel<string>({ default: '' })
</script>

<template>
  <label
    class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 transition focus-within:border-slate-400"
  >
    <LucideIcon :icon="Languages" class="size-4 text-slate-400" />
    <select v-model="model" class="cursor-pointer bg-transparent pr-1 font-medium text-slate-900 focus:outline-none" aria-label="奖杯语言">
      <option value="">默认语言</option>
      <option v-for="code in languages" :key="code" :value="code">{{ langLabel(code) }}</option>
    </select>
  </label>
</template>
