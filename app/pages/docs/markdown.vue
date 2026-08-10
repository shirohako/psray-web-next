<script setup lang="ts">
import { Check, Clipboard, ExternalLink, List, ShieldCheck } from 'lucide'
import type { MarkdownContainerName } from '~/utils/markdown'

const { t } = useI18n()
const toast = useToast()
const underlineExampleColors = ['slate', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'] as const
const textSizeExamples = ['small', 'large', 'xlarge'] as const

const basics = computed(() => [
  { label: t('markdown.help.basic.heading'), source: '# H1\n## H2\n### H3\n#### H4' },
  { label: t('markdown.help.basic.list'), source: '- Item\n- Item\n\n1. First\n2. Second' },
  { label: t('markdown.help.basic.link'), source: '[PSRay](https://psray.net)' },
  { label: t('markdown.help.basic.emphasis'), source: '**Bold** and *italic* and ~~strike~~' },
  { label: t('markdown.help.basic.task'), source: '- [x] Complete\n- [ ] Remaining' },
  { label: t('markdown.help.basic.quote'), source: '> A useful note\n> Supporting details continue here.\n> The final line stays in the same quote.' },
  { label: t('markdown.help.basic.code'), source: '`inline code`\n\n```\ncode block\n```' },
])

const inlineFormatting = computed(() => [
  {
    label: t('markdown.help.formatting.mark'),
    source: `${t('markdown.help.formatting.outerSample')}==${t('markdown.help.formatting.sample')}==${t('markdown.help.formattingSampleAfter')}`,
  },
  { label: t('markdown.help.formatting.color'), source: `[${t('markdown.help.formatting.sample')}]{color=red}` },
  {
    label: t('markdown.help.formatting.size'),
    source: `${t('markdown.help.formatting.outerSample')} ${textSizeExamples
      .map(size => `[${t(`markdown.editor.sizes.${size}`)}]{size=${size}}`)
      .join(' ')}`,
  },
  {
    label: t('markdown.help.formatting.underline'),
    source: `${t('markdown.help.formatting.outerSample')}[${t('markdown.editor.colors.slate')}]{underline=slate}${t('markdown.help.formattingSampleAfter')}\n${underlineExampleColors
      .filter(color => color !== 'slate')
      .map(color => `[${t(`markdown.editor.colors.${color}`)}]{underline=${color}}`)
      .join(' ')}`,
  },
])

const attributeExamples = computed(() => [
  {
    label: t('markdown.help.formatting.combined.title'),
    description: t('markdown.help.formatting.combined.description'),
    badge: t('markdown.help.formatting.recommended'),
    badgeClass: 'bg-emerald-50 text-emerald-700',
    source: `[${t('markdown.help.formatting.sample')}]{color=red size=large}`,
  },
  {
    label: t('markdown.help.formatting.nested.title'),
    description: t('markdown.help.formatting.nested.description'),
    badge: t('markdown.help.formatting.supported'),
    badgeClass: 'bg-sky-50 text-sky-700',
    source: `[${t('markdown.help.formatting.outerSample')} [${t('markdown.help.formatting.innerSample')}]{color=red}]{size=large}`,
  },
  {
    label: t('markdown.help.formatting.avoid.title'),
    description: t('markdown.help.formatting.avoid.description'),
    badge: t('markdown.help.formatting.notRecommended'),
    badgeClass: 'bg-amber-50 text-amber-700',
    source: `[[${t('markdown.help.formatting.sample')}]{color=red}]{size=large}`,
  },
])

const nestedExample = computed(() => `:::: details ${t('markdown.editor.placeholders.title')}\n::: warning ${t('markdown.blocks.warning.defaultTitle')}\n${t('markdown.editor.placeholders.content')}\n:::\n::::`)
const inlineSpoilerExample = computed(() => `${t('markdown.help.spoilers.inlineBefore')}||${t('markdown.help.spoilers.inlineSample')}||${t('markdown.help.spoilers.inlineAfter')}`)
const imageSizingExamples = computed(() => [
  { label: t('markdown.help.basic.image'), source: '![PSRay Logo](/logo.png)' },
  { label: t('markdown.help.images.width'), source: '![PSRay Logo](/logo.png){width=48}' },
  { label: t('markdown.help.images.height'), source: '![PSRay Logo](/logo.png){height=88}' },
  { label: t('markdown.help.images.both'), source: '![PSRay Logo](/logo.png){width=112 height=48}' },
])

const containerExamples = computed<Record<MarkdownContainerName, string>>(() => ({
  details: `::: details ${t('markdown.help.advanced.examples.detailsTitle')}\n${t('markdown.help.advanced.examples.detailsBody')}\n:::`,
  info: `::: info ${t('markdown.help.advanced.examples.infoTitle')}\n${t('markdown.help.advanced.examples.infoBody')}\n:::`,
  tip: `::: tip ${t('markdown.help.advanced.examples.tipTitle')}\n${t('markdown.help.advanced.examples.tipBody')}\n:::`,
  warning: `::: warning ${t('markdown.help.advanced.examples.warningTitle')}\n${t('markdown.help.advanced.examples.warningBody')}\n:::`,
  danger: `::: danger ${t('markdown.help.advanced.examples.dangerTitle')}\n${t('markdown.help.advanced.examples.dangerBody')}\n:::`,
  checklist: `::: checklist ${t('markdown.help.advanced.examples.checklistTitle')}\n- [x] ${t('markdown.help.advanced.examples.checklistDone')}\n- [ ] ${t('markdown.help.advanced.examples.checklistPending')}\n- [ ] ${t('markdown.help.advanced.examples.checklistOptional')}\n:::`,
  steps: `::: steps\n1. ${t('markdown.help.advanced.examples.stepsFirst')}\n2. ${t('markdown.help.advanced.examples.stepsSecond')}\n3. ${t('markdown.help.advanced.examples.stepsThird')}\n:::`,
  spoiler: `::: spoiler ${t('markdown.help.advanced.examples.spoilerTitle')}\n${t('markdown.help.advanced.examples.spoilerBody')}\n:::`,
}))

function containerExample(name: MarkdownContainerName) {
  return containerExamples.value[name]
}

async function copy(source: string) {
  try {
    await navigator.clipboard.writeText(source)
    toast.success({ title: t('markdown.help.copied') })
  }
  catch {
    toast.error({ title: t('toast.copyFailed.title') })
  }
}

useSeo({
  title: () => t('markdown.help.seoTitle'),
  description: () => t('markdown.help.seoDescription'),
})
</script>

<template>
  <div class="space-y-8">
    <header class="overflow-hidden rounded-2xl bg-slate-950 px-5 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-12">
      <div class="max-w-2xl">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">PSRay Markdown</p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{{ $t('markdown.help.title') }}</h1>
        <p class="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">{{ $t('markdown.help.lead') }}</p>
      </div>
    </header>

    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 class="text-xl font-bold text-slate-900">{{ $t('markdown.help.basic.title') }}</h2>
      <p class="mt-1 text-sm text-slate-500">{{ $t('markdown.help.basic.description') }}</p>
      <div class="mt-4 flex gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-3 text-sm leading-6 text-sky-900">
        <LucideIcon :icon="List" class="mt-1 size-4 shrink-0 text-sky-600" />
        <p>{{ $t('markdown.help.basic.headingTocHint') }}</p>
      </div>
      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <article v-for="example in basics" :key="example.label" class="overflow-hidden rounded-lg border border-slate-200">
          <div class="flex items-center justify-between bg-slate-50 px-3 py-2">
            <h3 class="text-xs font-semibold text-slate-700">{{ example.label }}</h3>
            <button type="button" :aria-label="$t('common.copy')" class="text-slate-400 hover:text-slate-800" @click="copy(example.source)">
              <LucideIcon :icon="Clipboard" class="size-3.5" />
            </button>
          </div>
          <pre class="overflow-x-auto border-b border-slate-100 p-3 text-xs leading-6 text-slate-700"><code>{{ example.source }}</code></pre>
          <div class="bg-slate-50/30 p-3">
            <span class="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{{ $t('markdown.help.result') }}</span>
            <RichContent :content="example.source" format="markdown" />
          </div>
        </article>
      </div>
      <div class="mt-7 border-t border-slate-100 pt-6">
        <h3 class="font-bold text-slate-900">{{ $t('markdown.help.images.title') }}</h3>
        <p class="mt-1 text-sm leading-6 text-slate-500">{{ $t('markdown.help.images.description') }}</p>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <article v-for="example in imageSizingExamples" :key="example.label" class="overflow-hidden rounded-lg border border-slate-200">
            <div class="flex items-center justify-between bg-slate-50 px-3 py-2">
              <h4 class="text-xs font-semibold text-slate-700">{{ example.label }}</h4>
              <button type="button" :aria-label="$t('common.copy')" class="text-slate-400 hover:text-slate-800" @click="copy(example.source)"><LucideIcon :icon="Clipboard" class="size-3.5" /></button>
            </div>
            <pre class="overflow-x-auto border-b border-slate-100 p-3 text-xs leading-6 text-slate-700"><code>{{ example.source }}</code></pre>
            <RichContent class="markdown-image-example p-3" :content="example.source" format="markdown" />
          </article>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 class="text-xl font-bold text-slate-900">{{ $t('markdown.help.formatting.title') }}</h2>
      <p class="mt-1 text-sm text-slate-500">{{ $t('markdown.help.formatting.description') }}</p>
      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <article v-for="example in inlineFormatting" :key="example.label" class="overflow-hidden rounded-lg border border-slate-200">
          <div class="flex items-center justify-between bg-slate-50 px-3 py-2">
            <h3 class="text-xs font-semibold text-slate-700">{{ example.label }}</h3>
            <button type="button" :aria-label="$t('common.copy')" class="text-slate-400 hover:text-slate-800" @click="copy(example.source)">
              <LucideIcon :icon="Clipboard" class="size-3.5" />
            </button>
          </div>
          <pre class="overflow-x-auto border-b border-slate-100 p-3 text-xs leading-6 text-slate-700"><code>{{ example.source }}</code></pre>
          <RichContent class="p-3" :content="example.source" format="markdown" />
        </article>
      </div>

      <div class="mt-7 border-t border-slate-100 pt-6">
        <h3 class="font-bold text-slate-900">{{ $t('markdown.help.formatting.attributesTitle') }}</h3>
        <p class="mt-1 text-sm leading-6 text-slate-500">{{ $t('markdown.help.formatting.attributesDescription') }}</p>
        <div class="mt-4 grid gap-4 lg:grid-cols-3">
          <article v-for="example in attributeExamples" :key="example.label" class="overflow-hidden rounded-lg border border-slate-200">
            <header class="border-b border-slate-100 bg-slate-50 px-3 py-2.5">
              <div class="flex items-center justify-between gap-2">
                <h4 class="text-sm font-semibold text-slate-800">{{ example.label }}</h4>
                <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" :class="example.badgeClass">{{ example.badge }}</span>
              </div>
              <p class="mt-1 text-xs leading-5 text-slate-500">{{ example.description }}</p>
            </header>
            <div class="relative border-b border-slate-100 p-3 pr-9">
              <pre class="overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-700"><code>{{ example.source }}</code></pre>
              <button type="button" :aria-label="$t('common.copy')" class="absolute right-3 top-3 text-slate-400 hover:text-slate-800" @click="copy(example.source)">
                <LucideIcon :icon="Clipboard" class="size-3.5" />
              </button>
            </div>
            <RichContent class="p-3" :content="example.source" format="markdown" />
          </article>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-bold text-slate-900">{{ $t('markdown.help.advanced.title') }}</h2>
      <p class="mt-1 text-sm text-slate-500">{{ $t('markdown.help.advanced.description') }}</p>
      <div class="mt-5 space-y-5">
        <template v-for="definition in markdownContainers" :key="definition.name">
          <article class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <header class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
              <div>
                <h3 class="font-semibold text-slate-900">{{ $t(definition.labelKey) }}</h3>
                <p class="mt-0.5 text-xs text-slate-400">{{ $t(definition.descriptionKey) }}</p>
              </div>
              <code class="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">::: {{ definition.name }}</code>
            </header>
            <div class="grid md:grid-cols-2 md:divide-x md:divide-slate-200">
              <div class="min-w-0 bg-slate-950 p-4 text-slate-200">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ $t('markdown.help.source') }}</span>
                  <button type="button" :aria-label="$t('common.copy')" class="text-slate-500 hover:text-white" @click="copy(containerExample(definition.name))">
                    <LucideIcon :icon="Clipboard" class="size-4" />
                  </button>
                </div>
                <pre class="overflow-x-auto whitespace-pre-wrap text-xs leading-6"><code>{{ containerExample(definition.name) }}</code></pre>
              </div>
              <div class="min-w-0 bg-slate-50/40 p-4">
                <span class="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ $t('markdown.help.result') }}</span>
                <RichContent :content="containerExample(definition.name)" format="markdown" />
              </div>
            </div>
          </article>

          <article v-if="definition.name === 'spoiler'" class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <header class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
              <div>
                <h3 class="font-semibold text-slate-900">{{ $t('markdown.editor.toolbar.inlineSpoiler') }}</h3>
                <p class="mt-0.5 text-xs text-slate-400">{{ $t('markdown.help.spoilers.inline') }}</p>
              </div>
              <code class="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">|| ... ||</code>
            </header>
            <div class="grid md:grid-cols-2 md:divide-x md:divide-slate-200">
              <div class="min-w-0 bg-slate-950 p-4 text-slate-200">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ $t('markdown.help.source') }}</span>
                  <button type="button" :aria-label="$t('common.copy')" class="text-slate-500 hover:text-white" @click="copy(inlineSpoilerExample)"><LucideIcon :icon="Clipboard" class="size-4" /></button>
                </div>
                <pre class="overflow-x-auto whitespace-pre-wrap text-xs leading-6"><code>{{ inlineSpoilerExample }}</code></pre>
              </div>
              <div class="min-w-0 bg-slate-50/40 p-4">
                <span class="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ $t('markdown.help.result') }}</span>
                <RichContent :content="inlineSpoilerExample" format="markdown" />
              </div>
            </div>
          </article>
        </template>
      </div>
    </section>

    <section class="grid gap-5 lg:grid-cols-2">
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900">{{ $t('markdown.help.nesting.title') }}</h2>
        <p class="mt-1 text-sm leading-6 text-slate-500">{{ $t('markdown.help.nesting.description') }}</p>
        <pre class="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-200"><code>{{ nestedExample }}</code></pre>
      </article>

      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900">{{ $t('markdown.help.spoilers.title') }}</h2>
        <p class="mt-1 text-sm leading-6 text-slate-500">{{ $t('markdown.help.spoilers.description') }}</p>
        <ul class="mt-4 space-y-3 text-sm text-slate-600">
          <li class="flex gap-2"><LucideIcon :icon="Check" class="mt-0.5 size-4 shrink-0 text-emerald-500" />{{ $t('markdown.help.spoilers.whole') }}</li>
          <li class="flex gap-2"><LucideIcon :icon="Check" class="mt-0.5 size-4 shrink-0 text-emerald-500" />{{ $t('markdown.help.spoilers.block') }}</li>
          <li class="flex gap-2"><LucideIcon :icon="Check" class="mt-0.5 size-4 shrink-0 text-emerald-500" />{{ $t('markdown.help.spoilers.inline') }}</li>
        </ul>
      </article>
    </section>

    <aside class="flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-5 text-sky-950">
      <LucideIcon :icon="ShieldCheck" class="mt-0.5 size-5 shrink-0 text-sky-600" />
      <div>
        <h2 class="font-semibold">{{ $t('markdown.help.security.title') }}</h2>
        <p class="mt-1 text-sm leading-6 text-sky-800">{{ $t('markdown.help.security.description') }}</p>
        <a href="https://commonmark.org/help/" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:underline">
          {{ $t('markdown.help.commonMark') }}
          <LucideIcon :icon="ExternalLink" class="size-3.5" />
        </a>
      </div>
    </aside>
  </div>
</template>
