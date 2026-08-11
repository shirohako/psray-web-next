<script lang="ts">
// Two root nodes (trigger + teleport) make this a fragment, so disable auto
// attribute inheritance and bind $attrs to the trigger element explicitly.
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
/**
 * Click-anywhere context menu. The default slot is the trigger; clicking
 * anywhere on it opens a teleported menu (the `#menu` slot) at the exact cursor
 * position, flipping/clamping so it stays on screen. Closes on outside click,
 * Esc, scroll, or resize. `$attrs` (class, etc.) bind to the trigger element, so
 * style it like any element.
 *
 * Use this when the trigger is a large surface (e.g. a list row) and the menu
 * should appear where the user clicked. For a menu anchored under a specific
 * button, use `DropdownMenu` instead.
 *
 * Put `@click.stop` on any inner control that should keep its own behavior
 * without opening the menu.
 *
 * ```vue
 * <Popover class="flex cursor-pointer …">
 *   …trigger content…
 *   <template #menu="{ close }">
 *     <button class="…" @click="doThing(); close()">Copy</button>
 *   </template>
 * </Popover>
 * ```
 */
const props = withDefaults(defineProps<{
  /** Which menu edge sits at the cursor (the menu opens toward the other side). */
  align?: 'left' | 'right'
  /** Extra classes for the teleported menu panel. */
  panelClass?: string
}>(), { align: 'left', panelClass: '' })

const emit = defineEmits<{ open: []; close: [] }>()

const open = ref(false)
const position = ref({ top: 0, left: 0 })
const panel = ref<HTMLElement | null>(null)
// Cursor position captured at open; the panel size isn't known until after
// render, so adjust() resolves the final placement.
let point = { x: 0, y: 0 }
let observer: ResizeObserver | null = null

function toggle(event: MouseEvent) {
  if (open.value) return close()
  point = { x: event.clientX, y: event.clientY }
  position.value = { top: point.y, left: point.x }
  open.value = true
  emit('open')
  nextTick(() => {
    adjust()
    // Keep the panel on-screen as its content grows (e.g. menu → list).
    if (panel.value) {
      observer = new ResizeObserver(adjust)
      observer.observe(panel.value)
    }
  })
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
  window.addEventListener('keydown', onKey)
}

// Open from the cursor, flipping toward the opposite edge near a screen border.
function adjust() {
  const el = panel.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const margin = 8

  let left = props.align === 'right' ? point.x - rect.width : point.x
  // Flip horizontally if the chosen side overflows.
  if (left + rect.width + margin > window.innerWidth) left = point.x - rect.width
  if (left < margin) left = point.x

  let top = point.y + 4
  // Flip above the cursor if it would overflow the bottom.
  if (top + rect.height + margin > window.innerHeight) top = point.y - rect.height

  position.value = {
    top: Math.min(Math.max(margin, top), window.innerHeight - rect.height - margin),
    left: Math.min(Math.max(margin, left), window.innerWidth - rect.width - margin),
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

function close() {
  if (!open.value) return
  open.value = false
  observer?.disconnect()
  observer = null
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
  window.removeEventListener('keydown', onKey)
  emit('close')
}

onUnmounted(close)
</script>

<template>
  <div v-bind="$attrs" @click="toggle">
    <slot />
    <Teleport v-if="open" to="body">
      <div class="fixed inset-0 z-50" @click="close" @contextmenu.prevent="close">
        <Transition
          appear
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
        >
          <div
            ref="panel"
            role="menu"
            class="fixed min-w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg ring-1 ring-slate-900/5"
            :class="[align === 'right' ? 'origin-top-right' : 'origin-top-left', panelClass]"
            :style="{ top: `${position.top}px`, left: `${position.left}px` }"
            @click.stop
          >
            <slot name="menu" :close="close" />
          </div>
        </Transition>
      </div>
    </Teleport>
  </div>
</template>
