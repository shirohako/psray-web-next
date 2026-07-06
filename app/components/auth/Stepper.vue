<script setup lang="ts">
/**
 * Minimal progress indicator: one bar per step. Bars up to and including the
 * 1-based `current` step are filled; the rest stay muted.
 */
const props = defineProps<{
  count: number
  current: number
}>()

const bars = computed(() => Array.from({ length: props.count }, (_, i) => i + 1))
</script>

<template>
  <div class="flex items-center gap-2">
    <span
      v-for="n in bars"
      :key="n"
      class="h-1.5 flex-1 rounded-full transition-colors duration-300"
      :class="n <= current ? 'bg-slate-900' : 'bg-slate-200'"
    />
  </div>
</template>
