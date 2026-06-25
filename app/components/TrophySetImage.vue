<script setup lang="ts">
import { ImageOff } from 'lucide'

/**
 * Trophy-set artwork with a per-image loading skeleton + fade-in. Trophy art
 * loads slowly, so the slot shows a pulsing placeholder shaped to the expected
 * aspect until the image resolves.
 *
 * Drop into a `relative` wrapper that fixes the slot size; the image renders at
 * its natural aspect (`object-contain`) and the skeleton matches it: PS5 art is
 * square, PS4/older art is 320×176 landscape.
 */
const props = defineProps<{
  src: string
  alt: string
  /** Platforms of the set, used to shape the skeleton (PS5 → square). */
  platform?: string[]
}>()

const loaded = ref(false)
const failed = ref(false)

// Reset when the source changes (e.g. list re-render on pagination).
watch(() => props.src, () => {
  loaded.value = false
  failed.value = false
})

const isSquare = computed(() => (props.platform ?? []).includes('PS5'))
</script>

<template>
  <!-- Loading skeleton, shaped to match the art that resolves into it -->
  <div
    v-if="!loaded && !failed"
    class="absolute inset-0 m-auto animate-pulse rounded-lg bg-slate-200"
    :class="isSquare ? 'aspect-square h-full' : 'aspect-320/176 w-full'"
  />
  <!-- Error fallback -->
  <div
    v-else-if="failed"
    class="grid size-full place-items-center rounded-lg bg-slate-100 text-slate-300"
  >
    <LucideIcon :icon="ImageOff" class="size-5" />
  </div>
  <img
    v-show="!failed"
    :src="src"
    :alt="alt"
    loading="lazy"
    decoding="async"
    class="max-h-full max-w-full rounded-lg object-contain shadow-sm ring-1 ring-black/5 transition-opacity duration-300"
    :class="loaded ? 'opacity-100' : 'opacity-0'"
    @load="loaded = true"
    @error="failed = true"
  />
</template>
