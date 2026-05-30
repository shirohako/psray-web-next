<script setup lang="ts">
import { X } from 'lucide'

/**
 * Generic modal dialog. Teleports to <body>, dims + blurs the page, traps scroll,
 * closes on backdrop click / Esc. Drive it with `v-model:open`.
 *
 * ```vue
 * <Dialog v-model:open="open" title="标题" size="lg">
 *   <p class="p-5">内容…</p>
 *   <template #footer> … </template>
 * </Dialog>
 * ```
 */
type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  size?: Size
}>(), { size: 'lg' })

const emit = defineEmits<{ 'update:open': [v: boolean] }>()

const close = () => emit('update:open', false)

const SIZE: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}

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
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div v-if="open" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm" @click="close" />
      </Transition>

      <!-- Panel -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="open" class="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            class="pointer-events-auto flex max-h-[85vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/5"
            :class="SIZE[size]"
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
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>
