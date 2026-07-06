<script setup lang="ts">
import type { IconNode } from 'lucide'

/**
 * Settings section card: header (icon + title + description), body slot, and an
 * optional `#footer` slot (typically the save button). Shared shell so every
 * settings group looks consistent and new groups stay cheap to add.
 */
defineProps<{
  title: string
  description?: string
  icon?: IconNode
}>()

const slots = useSlots()
</script>

<template>
  <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-100 px-5 py-4">
      <h2 class="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
        <span v-if="icon" class="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <LucideIcon :icon="icon" class="size-4" />
        </span>
        {{ title }}
      </h2>
      <p v-if="description" class="mt-1 text-xs leading-relaxed text-slate-500" :class="icon ? 'pl-9' : ''">
        {{ description }}
      </p>
    </div>

    <div class="px-5 py-5">
      <slot />
    </div>

    <div v-if="slots.footer" class="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
      <slot name="footer" />
    </div>
  </section>
</template>
