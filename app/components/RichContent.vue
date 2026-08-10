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
const { t } = useI18n()

const html = computed(() =>
  props.format === 'markdown' ? renderMarkdown(props.content) : (props.content ?? ''),
)

const detailsAnimations = new WeakMap<HTMLDetailsElement, Animation>()

async function toggleDetails(details: HTMLDetailsElement) {
  if (detailsAnimations.has(details)) return
  const opening = !details.open
  if (details.classList.contains('markdown-container-spoiler')) {
    details.classList.toggle('is-spoiler-revealed', opening)
  }
  const body = details.querySelector<HTMLElement>(':scope > .markdown-container-body')
  if (!body || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    details.open = opening
    return
  }

  if (opening) details.open = true
  body.style.overflow = 'hidden'
  const height = body.scrollHeight
  const animation = body.animate(
    opening
      ? [{ height: '0px', opacity: 0, transform: 'translateY(-4px)' }, { height: `${height}px`, opacity: 1, transform: 'translateY(0)' }]
      : [{ height: `${height}px`, opacity: 1, transform: 'translateY(0)' }, { height: '0px', opacity: 0, transform: 'translateY(-4px)' }],
    { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  )
  detailsAnimations.set(details, animation)
  try {
    await animation.finished
    if (!opening) details.open = false
  }
  finally {
    detailsAnimations.delete(details)
    body.style.removeProperty('overflow')
  }
}

function revealInlineSpoiler(event: Event) {
  const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('.markdown-inline-spoiler')
  if (!target || target.classList.contains('is-revealed')) return
  // A concealed Markdown link should reveal first, never navigate blindly.
  event.preventDefault()
  target.classList.add('is-revealed')
  target.setAttribute('aria-expanded', 'true')
  target.removeAttribute('tabindex')
}

function handleContentClick(event: MouseEvent) {
  const checkbox = (event.target as HTMLElement | null)?.closest<HTMLInputElement>('.task-list-item-checkbox')
  const checklist = checkbox?.closest<HTMLElement>('.markdown-container-checklist')
  if (checkbox && checklist) {
    requestAnimationFrame(() => {
      const checkboxes = [...checklist.querySelectorAll<HTMLInputElement>('.task-list-item-checkbox')]
      const completed = checkboxes.filter(item => item.checked).length
      const progress = checklist.querySelector<HTMLElement>('.markdown-checklist-progress')
      const value = checklist.querySelector<HTMLElement>('.markdown-checklist-progress-value')
      if (value) value.textContent = `${completed} / ${checkboxes.length}`
      if (progress) progress.setAttribute('aria-label', t('markdown.blocks.checklist.progress', { completed, total: checkboxes.length }))
      checklist.classList.toggle('is-complete', checkboxes.length > 0 && completed === checkboxes.length)
    })
  }

  const summary = (event.target as HTMLElement | null)?.closest<HTMLElement>('.markdown-container-details > summary')
  if (summary) {
    const details = summary.parentElement as HTMLDetailsElement | null
    if (details) {
      event.preventDefault()
      void toggleDetails(details)
      return
    }
  }
  revealInlineSpoiler(event)
}

function handleSpoilerKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('.markdown-inline-spoiler')
  if (!target) return
  event.preventDefault()
  revealInlineSpoiler(event)
}
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div
    class="prose prose-sm max-w-none prose-slate prose-a:text-sky-600 prose-img:rounded-lg prose-pre:bg-slate-900"
    @click="handleContentClick"
    @keydown="handleSpoilerKeydown"
    v-html="html"
  />
</template>
