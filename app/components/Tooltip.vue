<script setup lang="ts">
/**
 * Lightweight tooltip. Wrap any trigger in the default slot; the label shows on
 * hover/focus. Position is controlled via `placement` (defaults to `bottom`).
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

const PANEL: Record<Placement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const ARROW: Record<Placement, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2',
  left: 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2',
  right: 'right-full top-1/2 translate-x-1/2 -translate-y-1/2',
}
</script>

<template>
  <span class="group relative inline-flex">
    <slot />
    <span
      v-if="hasContent"
      role="tooltip"
      class="pointer-events-none absolute z-50 w-max max-w-xs rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      :class="PANEL[placement]"
    >
      <slot name="content">{{ content }}</slot>
      <span class="absolute size-2 rotate-45 bg-slate-900" :class="ARROW[placement]" />
    </span>
  </span>
</template>
