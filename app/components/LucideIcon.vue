<script setup lang="ts">
import type { IconNode } from 'lucide'

const props = defineProps<{ icon?: IconNode }>()

function escapeAttribute(value: unknown) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

/**
 * Lucide icons are trusted, statically imported node definitions. Serializing
 * those definitions as SVG children avoids the Fragment hydration markers that
 * a template-level `v-for` would add around every icon.
 */
const paths = computed(() => (props.icon ?? []).map(([tag, attrs]) => {
  const attributes = Object.entries(attrs)
    .filter(([name]) => name !== 'key')
    .map(([name, value]) => `${name}="${escapeAttribute(value)}"`)
    .join(' ')
  return `<${tag}${attributes ? ` ${attributes}` : ''}></${tag}>`
}).join(''))
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
    v-html="paths"
  />
</template>
