<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide'

const props = defineProps<{ page: number; totalPages: number }>()
const emit = defineEmits<{ 'update:page': [n: number] }>()

/**
 * Items to render: always the first and last page, the current page ±1, and
 * `'…'` markers wherever there's a gap between shown pages.
 */
const items = computed<(number | '…')[]>(() => {
  const { page, totalPages } = props
  if (totalPages <= 1) return [1]

  const shown = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter(p => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const out: (number | '…')[] = []
  let prev = 0
  for (const p of shown) {
    if (prev && p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
})

function goto(p: number) {
  if (p < 1 || p > props.totalPages || p === props.page) return
  emit('update:page', p)
}
</script>

<template>
  <nav class="flex items-center justify-center gap-1">
    <button
      type="button"
      :disabled="page <= 1"
      @click="goto(page - 1)"
      class="grid size-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
      aria-label="上一页"
    >
      <LucideIcon :icon="ChevronLeft" class="size-3.5" />
    </button>

    <template v-for="(item, i) in items" :key="i">
      <span v-if="item === '…'" class="px-1 text-xs text-slate-400">…</span>
      <button
        v-else
        type="button"
        @click="goto(item)"
        class="min-w-7 rounded-md px-1.5 py-1 text-xs font-medium transition"
        :class="item === page
          ? 'bg-slate-900 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
      >
        {{ item }}
      </button>
    </template>

    <button
      type="button"
      :disabled="page >= totalPages"
      @click="goto(page + 1)"
      class="grid size-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
      aria-label="下一页"
    >
      <LucideIcon :icon="ChevronRight" class="size-3.5" />
    </button>
  </nav>
</template>
