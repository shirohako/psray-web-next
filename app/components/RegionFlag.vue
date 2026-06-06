<script setup lang="ts">
/**
 * Country flag rendered from the `flag-icons` set via @nuxt/icon.
 * Uses `mode="svg"` so the flag keeps its real colors (CSS mode would mask it
 * into a single-color silhouette). Size follows the inherited font-size; the
 * 4:3 aspect ratio is preserved automatically. Renders nothing for a country
 * value that isn't a 2-letter ISO code.
 */
const props = defineProps<{ country: string }>()

const valid = computed(() => /^[A-Za-z]{2}$/.test(props.country))
const icon = computed(() => `flag:${props.country.toLowerCase()}-4x3`)
</script>

<template>
  <Icon
    v-if="valid"
    :name="icon"
    mode="svg"
    :aria-label="country"
    class="inline-block shrink-0 rounded-xs ring-1 ring-black/5"
  />
</template>
