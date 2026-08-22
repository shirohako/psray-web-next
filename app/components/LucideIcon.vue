<script setup lang="ts">
import type { IconNode } from 'lucide'
import MarkdownEditorIcon from '#markdown-editor/components/internal/MarkdownEditorIcon.vue'

defineProps<{ icon?: IconNode }>()
</script>

<template>
  <MarkdownEditorIcon :icon="icon" />
</template>
