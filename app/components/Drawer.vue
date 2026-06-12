<script setup lang="ts">
import { X } from 'lucide'

/**
 * Off-canvas drawer panel. Teleports to <body>, dims + blurs the page, traps
 * scroll, closes on backdrop click / Esc. Slides in from `side` (default left).
 * Drive it with `v-model:open`.
 *
 * ```vue
 * <Drawer v-model:open="open" title="设置" side="left">
 *   <div class="p-5">…</div>
 *   <template #footer> … </template>
 * </Drawer>
 * ```
 */
type Side = 'left' | 'right'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  side?: Side
}>(), { side: 'left' })

const emit = defineEmits<{ 'update:open': [v: boolean] }>()

const close = () => emit('update:open', false)

const hiddenClass = computed(() =>
  props.side === 'left' ? '-translate-x-full' : 'translate-x-full',
)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(() => props.open, (v) => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = v ? 'hidden' : ''
  if (v) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})

onUnmounted(() => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <!-- Backdrop -->
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-to-class="opacity-0"
      >
        <div v-if="open" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm" @click="close" />
      </Transition>

      <!-- Panel -->
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        :enter-from-class="hiddenClass"
        leave-active-class="transition-transform duration-200 ease-in"
        :leave-to-class="hiddenClass"
      >
        <div
          v-if="open"
          role="dialog"
          aria-modal="true"
          class="fixed inset-y-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl ring-1 ring-slate-900/5"
          :class="side === 'left' ? 'left-0' : 'right-0'"
        >
          <!-- Header -->
          <header class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h2 class="truncate text-base font-semibold text-slate-900">
              <slot name="title">{{ title }}</slot>
            </h2>
            <button
              type="button"
              class="-mr-1.5 grid size-8 shrink-0 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="关闭"
              @click="close"
            >
              <LucideIcon :icon="X" class="size-5" />
            </button>
          </header>

          <!-- Body (scrollable) -->
          <div class="min-h-0 flex-1 overflow-y-auto">
            <slot />
          </div>

          <!-- Footer -->
          <footer v-if="$slots.footer" class="border-t border-slate-100 px-5 py-3">
            <slot name="footer" />
          </footer>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>
