<script setup lang="ts">
/**
 * Animated circular checkbox (uiverse "checkbox-12" port): draws the tick and
 * bursts a gooey splash on check. `v-model`-bound and themed to slate-900.
 *
 * Meant to sit inside a `<label>` that also holds the text — clicking anywhere
 * in that label toggles this (the sole descendant input), so no `for`/`id`
 * wiring is needed here. The goo filter id is per-instance to avoid collisions.
 */
const model = defineModel<boolean>({ default: false })
const gooId = `cbx-goo-${useId()}`
</script>

<template>
  <span class="cbx relative inline-block size-6 shrink-0">
    <input
      v-model="model"
      type="checkbox"
      class="absolute inset-0 m-0 size-6 cursor-pointer appearance-none rounded-full border-2 border-slate-300 outline-none transition-colors"
    />
    <span class="splash absolute inset-0 rounded-full" :style="{ filter: `url(#${gooId})` }" />
    <svg class="check absolute left-1 top-1.25 w-3.75" viewBox="0 0 15 14" fill="none" height="14" width="15">
      <path d="M2 8.36364L6.23077 12L13 2" />
    </svg>

    <!-- Gooey-splash filter, isolated per instance. -->
    <svg class="pointer-events-none absolute size-0" aria-hidden="true">
      <defs>
        <filter :id="gooId">
          <feGaussianBlur result="blur" stdDeviation="4" in="SourceGraphic" />
          <feColorMatrix result="goo" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7" mode="matrix" in="blur" />
          <feBlend in2="goo" in="SourceGraphic" />
        </filter>
      </defs>
    </svg>
  </span>
</template>

<style scoped>
/* Filled state + splash burst can't be expressed in Tailwind (multi box-shadow
   keyframes, sibling-driven stroke draw), so they live here. Colors = slate-900. */
.cbx input:checked {
  border-color: #0f172a;
}

.splash {
  transform: translate3d(0, 0, 0);
  pointer-events: none;
}

.cbx input:checked ~ .splash {
  animation: cbx-splash 0.6s ease forwards;
}

.check {
  z-index: 1;
  pointer-events: none;
}

.check path {
  stroke: #fff;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 19;
  stroke-dashoffset: 19;
  transition: stroke-dashoffset 0.3s ease;
  transition-delay: 0.2s;
}

.cbx input:checked ~ .check path {
  stroke-dashoffset: 0;
}

@keyframes cbx-splash {
  40% {
    background: #0f172a;
    box-shadow:
      0 -18px 0 -8px #0f172a, 16px -8px 0 -8px #0f172a, 16px 8px 0 -8px #0f172a,
      0 18px 0 -8px #0f172a, -16px 8px 0 -8px #0f172a, -16px -8px 0 -8px #0f172a;
  }
  100% {
    background: #0f172a;
    box-shadow:
      0 -36px 0 -10px transparent, 32px -16px 0 -10px transparent, 32px 16px 0 -10px transparent,
      0 36px 0 -10px transparent, -32px 16px 0 -10px transparent, -32px -16px 0 -10px transparent;
  }
}
</style>
