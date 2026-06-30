<script setup lang="ts">
import type { IconNode } from 'lucide'

/**
 * Animated sweep button. At rest it shows `label`; on hover a staggered sweep
 * wipes across and reveals `hoverLabel`. Renders as a `<NuxtLink>` when `to` is
 * set, otherwise a plain `<button>`. Extra classes/attrs land on the root
 * element, so size or hide it from the call site (e.g. `class="max-sm:hidden"`).
 */
const props = withDefaults(defineProps<{
  /** Resting label, shown before hover. */
  label?: string
  /** Label revealed on hover; falls back to `label`. */
  hoverLabel?: string
  /** Optional leading icon shown next to both labels. */
  icon?: IconNode
  /** Color + sweep-geometry preset. */
  variant?: 'indigo' | 'sky' | 'green' | 'purple'
  /** When set, renders as a link to this path instead of a `<button>`. */
  to?: string
}>(), { label: 'Hover me!', hoverLabel: '', variant: 'indigo', to: '' })

// Each preset bundles the sweep's color trio (light→dark), its shape, the corner
// it grows from, and how far the last (darkest) layer expands. Full literal
// class names so Tailwind's scanner keeps them.
const variants = {
  indigo: { shape: 'rotate-12', origin: 'origin-left', last: 'group-hover:scale-x-50', colors: ['bg-white', 'bg-indigo-400', 'bg-indigo-600'] },
  sky: { shape: 'rotate-12', origin: 'origin-right', last: 'group-hover:scale-x-100', colors: ['bg-sky-200', 'bg-sky-400', 'bg-sky-600'] },
  green: { shape: 'rounded-full', origin: 'origin-bottom', last: 'group-hover:scale-x-100', colors: ['bg-green-200', 'bg-green-400', 'bg-green-600'] },
  purple: { shape: 'rounded-full', origin: 'origin-bottom', last: 'group-hover:scale-x-100', colors: ['bg-purple-200', 'bg-purple-400', 'bg-purple-600'] },
} as const

const NuxtLink = resolveComponent('NuxtLink')
const reveal = computed(() => props.hoverLabel || props.label)

// Three layered sweep spans with staggered enter/leave durations.
const sweep = computed(() => {
  const v = variants[props.variant]
  const base = `absolute -left-2 -top-10 h-40 w-44 scale-x-0 transition-transform ${v.shape} ${v.origin}`
  return [
    `${base} ${v.colors[0]} duration-1000 group-hover:scale-x-100 group-hover:duration-500`,
    `${base} ${v.colors[1]} duration-700 group-hover:scale-x-100 group-hover:duration-700`,
    `${base} ${v.colors[2]} duration-500 ${v.last} group-hover:duration-1000`,
  ]
})
</script>

<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to || undefined"
    :type="to ? undefined : 'button'"
    class="group relative z-0 inline-flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white"
  >
    <!-- Resting label (covered by the sweep on hover) -->
    <span class="inline-flex items-center gap-1.5">
      <LucideIcon v-if="icon" :icon="icon" class="size-4" stroke-width="1.75" />
      {{ label }}
    </span>

    <!-- Staggered sweep -->
    <span v-for="(cls, i) in sweep" :key="i" :class="cls" />

    <!-- Hover label, on top of the sweep -->
    <span class="absolute inset-0 z-10 flex items-center justify-center gap-1.5 opacity-0 duration-100 group-hover:opacity-100 group-hover:duration-1000">
      <LucideIcon v-if="icon" :icon="icon" class="size-4" stroke-width="1.75" />
      {{ reveal }}
    </span>
  </component>
</template>
