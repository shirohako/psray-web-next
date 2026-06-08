<script lang="ts">
// Two root nodes (trigger + teleport) make this a fragment, so disable auto
// attribute inheritance and bind $attrs to the trigger element explicitly.
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
/**
 * Anchored dropdown menu. The default slot is the trigger; clicking it opens a
 * teleported menu (the `#menu` slot) anchored directly under the trigger and
 * aligned to its left or right edge. Closes on outside click, Esc, scroll, or
 * resize. `$attrs` (class, etc.) bind to the trigger element, so style it like
 * any element.
 *
 * Use this for menus with a clear trigger button (avatar menu, "已关注" button).
 * For a context menu that should open at the cursor, use `Popover` instead.
 *
 * ```vue
 * <DropdownMenu align="right" class="cursor-pointer …">
 *   …trigger content…
 *   <template #menu="{ close }">
 *     <button @click="doThing(); close()">退出登录</button>
 *   </template>
 * </DropdownMenu>
 * ```
 */
const props = withDefaults(defineProps<{
  /** Which trigger edge the menu aligns to. */
  align?: 'left' | 'right'
  /** Extra classes for the teleported menu panel. */
  panelClass?: string
}>(), { align: 'left', panelClass: '' })

const emit = defineEmits<{ open: []; close: [] }>()

const open = ref(false)
const position = ref({ top: 0, left: 0 })
const trigger = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
// Trigger bounds captured at open; the final left edge needs the panel width,
// which isn't known until after render, so adjust() resolves it.
let anchor: DOMRect | null = null
let observer: ResizeObserver | null = null

function toggle() {
  if (open.value) return close()
  anchor = trigger.value?.getBoundingClientRect() ?? null
  if (anchor) position.value = { top: anchor.bottom + 8, left: anchor.left }
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

// Anchor to the requested trigger edge, then nudge back inside the viewport.
function adjust() {
  const el = panel.value
  if (!el || !anchor) return
  const rect = el.getBoundingClientRect()
  const margin = 8
  let top = anchor.bottom + 8
  let left = props.align === 'right' ? anchor.right - rect.width : anchor.left
  if (left + rect.width + margin > window.innerWidth) left = window.innerWidth - rect.width - margin
  if (top + rect.height + margin > window.innerHeight) top = window.innerHeight - rect.height - margin
  position.value = { top: Math.max(margin, top), left: Math.max(margin, left) }
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
  <div ref="trigger" v-bind="$attrs" @click="toggle">
    <slot />
  </div>

  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50" @click="close" @contextmenu.prevent="close">
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
</template>
