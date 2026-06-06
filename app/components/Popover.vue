<script lang="ts">
// Two root nodes (trigger + teleport) make this a fragment, so disable auto
// attribute inheritance and bind $attrs to the trigger element explicitly.
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
/**
 * Click-anywhere popover menu. The default slot is the trigger; clicking
 * anywhere on it opens a teleported menu (the `#menu` slot) anchored at the
 * cursor. Closes on outside click, Esc, scroll, or resize. `$attrs` (class,
 * etc.) bind to the trigger root, so style it like any element.
 *
 * Put `@click.stop` on any inner control that should keep its own behavior
 * without opening the menu.
 *
 * ```vue
 * <Popover class="flex cursor-pointer …">
 *   …trigger content…
 *   <template #menu="{ close }">
 *     <button class="…" @click="doThing(); close()">复制</button>
 *   </template>
 * </Popover>
 * ```
 */
const open = ref(false)
const position = ref({ top: 0, left: 0 })
const panel = ref<HTMLElement | null>(null)

function toggle(e: MouseEvent) {
  if (open.value) return close()
  position.value = { top: e.clientY, left: e.clientX }
  open.value = true
  nextTick(adjust)
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
  window.addEventListener('keydown', onKey)
}

// Nudge the panel back inside the viewport when the cursor is near an edge.
function adjust() {
  const el = panel.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const margin = 8
  let { top, left } = position.value
  if (left + rect.width + margin > window.innerWidth) left = window.innerWidth - rect.width - margin
  if (top + rect.height + margin > window.innerHeight) top = window.innerHeight - rect.height - margin
  position.value = { top: Math.max(margin, top), left: Math.max(margin, left) }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

function close() {
  open.value = false
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
  window.removeEventListener('keydown', onKey)
}

onUnmounted(close)
</script>

<template>
  <div v-bind="$attrs" @click="toggle">
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
          class="fixed min-w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg ring-1 ring-slate-900/5 origin-top-left"
          :style="{ top: `${position.top}px`, left: `${position.left}px` }"
          @click.stop
        >
          <slot name="menu" :close="close" />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
