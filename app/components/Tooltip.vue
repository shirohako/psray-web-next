<script lang="ts">
// Two root nodes (trigger + teleport) make this a fragment, so disable auto
// attribute inheritance and bind $attrs to the trigger span explicitly.
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
/**
 * Lightweight tooltip. Wrap any trigger in the default slot; the label shows on
 * hover/focus. The panel is teleported to `body` so scroll containers do not
 * clip it. Position is controlled via `placement` (defaults to `bottom`).
 *
 * ```vue
 * <Tooltip content="已注册用户">
 *   <LucideIcon :icon="BadgeCheck" class="size-4" />
 * </Tooltip>
 *
 * <Tooltip placement="right">
 *   <button>?</button>
 *   <template #content>富文本 <b>提示</b></template>
 * </Tooltip>
 * ```
 */
type Placement = 'top' | 'bottom' | 'left' | 'right'

const props = withDefaults(defineProps<{
  /** Plain-text label. For rich content use the `#content` slot instead. */
  content?: string
  placement?: Placement
}>(), { placement: 'bottom' })

const slots = useSlots()
const hasContent = computed(() => !!props.content || !!slots.content)
const trigger = ref<HTMLElement | null>(null)
const visible = ref(false)
const position = ref({ top: 0, left: 0 })

const PANEL: Record<Placement, string> = {
  top: '-translate-x-1/2 -translate-y-full',
  bottom: '-translate-x-1/2',
  left: '-translate-x-full -translate-y-1/2',
  right: '-translate-y-1/2',
}

const ARROW: Record<Placement, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2',
  left: 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2',
  right: 'right-full top-1/2 translate-x-1/2 -translate-y-1/2',
}

const panelStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
}))

function updatePosition() {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const gap = 8
  switch (props.placement) {
    case 'top':
      position.value = { top: rect.top - gap, left: rect.left + rect.width / 2 }
      break
    case 'bottom':
      position.value = { top: rect.bottom + gap, left: rect.left + rect.width / 2 }
      break
    case 'left':
      position.value = { top: rect.top + rect.height / 2, left: rect.left - gap }
      break
    case 'right':
      position.value = { top: rect.top + rect.height / 2, left: rect.right + gap }
  }
}

function show() {
  if (!hasContent.value) return
  updatePosition()
  visible.value = true
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
}

function hide() {
  visible.value = false
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
}

onUnmounted(hide)
</script>

<template>
  <span
    ref="trigger"
    class="inline-flex"
    v-bind="$attrs"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />
  </span>
  <Teleport to="body">
    <span
      v-if="hasContent && visible"
      role="tooltip"
      class="pointer-events-none fixed z-50 w-max max-w-xs rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md transition-opacity duration-150"
      :class="PANEL[placement]"
      :style="panelStyle"
    >
      <slot name="content">{{ content }}</slot>
      <span class="absolute size-2 rotate-45 bg-slate-900" :class="ARROW[placement]" />
    </span>
  </Teleport>
</template>
