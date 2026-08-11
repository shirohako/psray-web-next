<script setup lang="ts">
/**
 * PSN country flag loaded as an individual local 4:3 SVG. Keeping flags out of
 * the JavaScript bundle lets the browser fetch and cache only those visible on
 * the current page. Size follows the inherited font size.
 */
const props = defineProps<{ country: string }>()

const valid = computed(() => /^[A-Za-z]{2}$/.test(props.country))
// Bump the query version only when regenerating flags with visibly new artwork;
// flag responses otherwise carry a one-year immutable cache lifetime.
const src = computed(() => `/flags/4x3/${props.country.toLowerCase()}.svg?v=1`)
</script>

<template>
  <img
    v-if="valid"
    :src="src"
    :alt="country"
    width="4"
    height="3"
    loading="lazy"
    decoding="async"
    class="inline-block h-[1em] w-[1.333em] shrink-0 rounded-xs object-cover ring-1 ring-black/5"
  />
</template>
