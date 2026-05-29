<script setup lang="ts">
import type { IconNode } from 'lucide'

// Renders a lucide `IconNode` (an array of [tag, attrs] pairs) as an inline SVG.
// Usage: <LucideIcon :icon="Menu" class="size-6" />
defineProps<{ icon: IconNode }>()
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <component :is="tag" v-for="([tag, attrs], i) in icon" :key="i" v-bind="attrs" />
  </svg>
</template>
