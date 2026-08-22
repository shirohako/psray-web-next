<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import MarkdownContent from '#markdown-editor/components/MarkdownContent.vue'

defineProps<{
  content: string
  format: 'html' | 'markdown'
}>()
</script>

<template>
  <MarkdownContent v-if="format === 'markdown'" v-bind="$attrs" :content="content" />
  <!-- HTML is a legacy API response format and must be sanitized upstream. -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div
    v-else
    v-bind="$attrs"
    class="prose prose-sm max-w-none prose-slate prose-a:text-sky-600 prose-img:rounded-lg prose-pre:bg-slate-900"
    v-html="content ?? ''"
  />
</template>
