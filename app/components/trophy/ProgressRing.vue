<script setup lang="ts">
// Circular progress indicator with the percentage in the centre. Mirrors the
// SVG ring used in ProfileHeader (viewBox 36×36, r=16, circumference ≈ 100.5).
const props = withDefaults(
  defineProps<{
    /** 0–100. */
    progress: number
    /** Track/bar colour for the completed arc. */
    barClass?: string
    /** Pixel size of the ring. */
    size?: number
  }>(),
  { barClass: 'stroke-slate-900', size: 56 },
)

const clamped = computed(() => Math.max(0, Math.min(100, props.progress)))
</script>

<template>
  <div class="relative grid shrink-0 place-items-center" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg class="-rotate-90" viewBox="0 0 36 36" :width="size" :height="size">
      <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" stroke-width="3" />
      <circle
        cx="18" cy="18" r="16" fill="none" stroke-width="3" stroke-linecap="round"
        class="transition-[stroke-dasharray] duration-500"
        :class="barClass"
        :stroke-dasharray="`${(clamped / 100) * 100.5} 100.5`"
      />
    </svg>
    <span class="absolute text-sm font-bold text-slate-900">{{ clamped }}%</span>
  </div>
</template>
