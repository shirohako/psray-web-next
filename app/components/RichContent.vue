<script setup lang="ts">
/**
 * Renders rich user content as styled prose. `format` selects the source:
 * `'html'` is output as-is, `'markdown'` is parsed via the shared markdown-it
 * instance in `utils/markdown`.
 *
 * Content is community-authored — sanitize upstream if the source is untrusted.
 *
 * ```vue
 * <RichContent :content="tip.content" :format="tip.content_type" />
 * ```
 */
const props = defineProps<{
  content: string
  format: 'html' | 'markdown'
}>()

const html = computed(() =>
  props.format === 'markdown' ? renderMarkdown(props.content) : (props.content ?? ''),
)
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div
    class="prose prose-sm max-w-none prose-slate prose-a:text-sky-600 prose-img:rounded-lg prose-pre:bg-slate-900"
    v-html="html"
  />
</template>
