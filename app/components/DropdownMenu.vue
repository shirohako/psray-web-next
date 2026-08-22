<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import MarkdownEditorDropdownMenu from '#markdown-editor/components/internal/MarkdownEditorDropdownMenu.vue'

withDefaults(defineProps<{
  align?: 'left' | 'right'
  panelClass?: string
}>(), { align: 'left', panelClass: '' })

defineEmits<{ open: []; close: [] }>()
</script>

<template>
  <MarkdownEditorDropdownMenu
    v-bind="$attrs"
    :align="align"
    :panel-class="panelClass"
    @open="$emit('open')"
    @close="$emit('close')"
  >
    <slot />
    <template #menu="slotProps">
      <slot name="menu" v-bind="slotProps" />
    </template>
  </MarkdownEditorDropdownMenu>
</template>
