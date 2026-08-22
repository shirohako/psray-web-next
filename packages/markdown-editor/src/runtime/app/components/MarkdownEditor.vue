<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AlertTriangle, Bold, Braces, ChevronDown, Code, ExternalLink, Eye, EyeOff,
  Heading2, HelpCircle, Highlighter, Image, Info, Italic, Lightbulb, Link,
  ListChecks, ListOrdered, Palette, Pencil, Quote, ShieldAlert, Strikethrough,
  Type, Underline,
} from 'lucide'
import { basicSetup, EditorView } from 'codemirror'
import { Compartment, EditorState } from '@codemirror/state'
import { placeholder as editorPlaceholder } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { autocompletion, type CompletionContext } from '@codemirror/autocomplete'
import MarkdownContent from './MarkdownContent.vue'
import MarkdownEditorDropdownMenu from './internal/MarkdownEditorDropdownMenu.vue'
import MarkdownEditorIcon from './internal/MarkdownEditorIcon.vue'
import {
  MARKDOWN_TEXT_COLORS,
  MARKDOWN_TEXT_SIZES,
  MARKDOWN_UNDERLINE_COLORS,
  markdownContainers,
  type MarkdownContainerName,
  type MarkdownTextColor,
  type MarkdownTextSize,
  type MarkdownUnderlineColor,
} from '../utils/markdown'
import {
  applyMarkdownEdit,
  applyMarkdownTextStyle,
  markdownContainerSnippet,
  type MarkdownEditAction,
} from '../utils/markdownEditor'

const props = withDefaults(defineProps<{
  alwaysSplit?: boolean
  disabled?: boolean
  error?: string
  helpUrl?: string | false
  placeholder?: string
}>(), { alwaysSplit: false, disabled: false, error: '', helpUrl: '/docs/markdown', placeholder: '' })

const model = defineModel<string>({ required: true })
const { t } = useI18n()
const editorHost = ref<HTMLElement>()
const mobilePane = ref<'edit' | 'preview'>('edit')
const preview = ref(model.value)
let view: EditorView | undefined
let previewTimer: ReturnType<typeof setTimeout> | undefined
const readOnly = new Compartment()

const toolbar: { action: MarkdownEditAction, icon: typeof Bold, labelKey: string }[] = [
  { action: 'heading', icon: Heading2, labelKey: 'markdown.editor.toolbar.heading' },
  { action: 'bold', icon: Bold, labelKey: 'markdown.editor.toolbar.bold' },
  { action: 'italic', icon: Italic, labelKey: 'markdown.editor.toolbar.italic' },
  { action: 'strike', icon: Strikethrough, labelKey: 'markdown.editor.toolbar.strike' },
  { action: 'mark', icon: Highlighter, labelKey: 'markdown.editor.toolbar.mark' },
  { action: 'inlineSpoiler', icon: Eye, labelKey: 'markdown.editor.toolbar.inlineSpoiler' },
  { action: 'quote', icon: Quote, labelKey: 'markdown.editor.toolbar.quote' },
  { action: 'link', icon: Link, labelKey: 'markdown.editor.toolbar.link' },
  { action: 'image', icon: Image, labelKey: 'markdown.editor.toolbar.image' },
  { action: 'code', icon: Code, labelKey: 'markdown.editor.toolbar.code' },
]

const containerMenuMeta: Record<MarkdownContainerName, {
  icon: typeof Bold
  englishLabel: string
  iconClass: string
}> = {
  details: { icon: ChevronDown, englishLabel: 'Details', iconClass: 'bg-slate-100 text-slate-600' },
  info: { icon: Info, englishLabel: 'Info', iconClass: 'bg-sky-100 text-sky-700' },
  tip: { icon: Lightbulb, englishLabel: 'Tip', iconClass: 'bg-emerald-100 text-emerald-700' },
  warning: { icon: AlertTriangle, englishLabel: 'Warning', iconClass: 'bg-amber-100 text-amber-700' },
  danger: { icon: ShieldAlert, englishLabel: 'Danger', iconClass: 'bg-rose-100 text-rose-700' },
  checklist: { icon: ListChecks, englishLabel: 'Checklist', iconClass: 'bg-indigo-100 text-indigo-700' },
  steps: { icon: ListOrdered, englishLabel: 'Steps', iconClass: 'bg-violet-100 text-violet-700' },
  spoiler: { icon: EyeOff, englishLabel: 'Spoiler', iconClass: 'bg-slate-200 text-slate-700' },
}

function schedulePreview(value: string) {
  clearTimeout(previewTimer)
  previewTimer = setTimeout(() => { preview.value = value }, 150)
}

function completions(context: CompletionContext) {
  const match = context.matchBefore(/:::\s*[a-z-]*/i)
  if (!match || (!context.explicit && match.from === match.to)) return null
  return {
    from: match.from,
    options: markdownContainers.map(definition => ({
      label: `::: ${definition.name}`,
      displayLabel: t(definition.labelKey),
      detail: t(definition.descriptionKey),
      type: 'keyword',
      apply: markdownContainerSnippet(definition.name),
    })),
    validFor: /^:::\s*[a-z-]*$/i,
  }
}

onMounted(() => {
  if (!editorHost.value) return
  view = new EditorView({
    parent: editorHost.value,
    state: EditorState.create({
      doc: model.value,
      extensions: [
        basicSetup,
        markdown(),
        autocompletion({ override: [completions] }),
        editorPlaceholder(props.placeholder || t('markdown.editor.placeholder')),
        readOnly.of(EditorState.readOnly.of(props.disabled)),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({
          'aria-label': t('markdown.editor.ariaLabel'),
          'spellcheck': 'true',
        }),
        EditorView.theme({
          '&': { minHeight: '18rem', height: '100%', fontSize: '14px' },
          '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: '1.65' },
          '.cm-content': { padding: '12px 0' },
          '.cm-gutters': { backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', color: '#94a3b8' },
          '&.cm-focused': { outline: 'none' },
        }),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return
          const value = update.state.doc.toString()
          model.value = value
          schedulePreview(value)
        }),
      ],
    }),
  })
})

watch(model, (value) => {
  schedulePreview(value)
  if (!view || value === view.state.doc.toString()) return
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
})

watch(() => props.disabled, (value) => {
  view?.dispatch({ effects: readOnly.reconfigure(EditorState.readOnly.of(value)) })
})

onUnmounted(() => {
  clearTimeout(previewTimer)
  view?.destroy()
})

function applyAction(action: MarkdownEditAction) {
  if (!view || props.disabled) return
  const selection = view.state.selection.main
  const result = applyMarkdownEdit(view.state.doc.toString(), selection.from, selection.to, action)
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: result.text },
    selection: { anchor: result.selectionFrom, head: result.selectionTo },
    scrollIntoView: true,
  })
  view.focus()
}

function insertContainer(name: MarkdownContainerName) {
  if (!view || props.disabled) return
  const selection = view.state.selection.main
  const selected = view.state.doc.sliceString(selection.from, selection.to)
  const snippet = markdownContainerSnippet(name, selected)
  view.dispatch({
    changes: { from: selection.from, to: selection.to, insert: snippet },
    selection: { anchor: selection.from + snippet.indexOf('\n') + 1 },
    scrollIntoView: true,
  })
  view.focus()
}

function applyTextStyle(kind: 'color' | 'size' | 'underline', value: MarkdownTextColor | MarkdownTextSize | MarkdownUnderlineColor) {
  if (!view || props.disabled) return
  const selection = view.state.selection.main
  const result = applyMarkdownTextStyle(view.state.doc.toString(), selection.from, selection.to, kind, value)
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: result.text },
    selection: { anchor: result.selectionFrom, head: result.selectionTo },
    scrollIntoView: true,
  })
  view.focus()
}
</script>

<template>
  <a
    v-if="helpUrl"
    :href="helpUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="group mb-3 flex items-center gap-2.5 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-white px-3 py-2 text-left transition hover:border-sky-300 sm:px-3.5"
  >
    <span class="grid size-7 shrink-0 place-items-center rounded-md bg-sky-100/80 text-sky-700 ring-1 ring-sky-200/80 transition group-hover:scale-105 group-hover:bg-sky-100 group-hover:text-sky-800">
      <MarkdownEditorIcon :icon="HelpCircle" class="size-4" />
    </span>
    <span class="min-w-0 flex-1">
      <span class="block text-sm font-bold text-slate-900">{{ $t('markdown.editor.help') }}</span>
      <span class="block text-xs leading-4 text-slate-500">{{ $t('markdown.editor.helpHint') }}</span>
    </span>
    <MarkdownEditorIcon :icon="ExternalLink" class="size-4 shrink-0 text-sky-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
  </a>

  <div class="overflow-hidden rounded-xl border bg-white" :class="error ? 'border-rose-300' : 'border-slate-200'">
    <div class="grid grid-cols-1 items-center gap-1.5 border-b border-slate-200 bg-slate-50/80 px-2 py-1.5 md:grid-cols-[minmax(0,1fr)_auto] md:gap-2">
      <div class="order-1 flex min-w-0 flex-wrap items-center gap-1">
        <div class="flex shrink-0 items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
          <button
            v-for="item in toolbar"
            :key="item.action"
            type="button"
            :disabled="disabled"
            class="grid size-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
            :title="$t(item.labelKey)"
            :aria-label="$t(item.labelKey)"
            @click="applyAction(item.action)"
          >
            <MarkdownEditorIcon :icon="item.icon" class="size-4" />
          </button>
        </div>

        <div class="flex shrink-0 items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm max-sm:basis-full">
          <MarkdownEditorDropdownMenu>
        <button
          type="button"
          :disabled="disabled"
          class="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
        >
          <MarkdownEditorIcon :icon="Type" class="size-4" />
          {{ $t('markdown.editor.toolbar.size') }}
        </button>
        <template #menu="{ close }">
          <button
            v-for="(_, value) in MARKDOWN_TEXT_SIZES"
            :key="value"
            type="button"
            role="menuitem"
            class="flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50"
            @click="applyTextStyle('size', value); close()"
          >
            <span>{{ $t(`markdown.editor.sizes.${value}`) }}</span>
            <span :class="MARKDOWN_TEXT_SIZES[value]">Aa</span>
          </button>
        </template>
          </MarkdownEditorDropdownMenu>

          <MarkdownEditorDropdownMenu>
        <button
          type="button"
          :disabled="disabled"
          class="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
        >
          <MarkdownEditorIcon :icon="Palette" class="size-4" />
          {{ $t('markdown.editor.toolbar.color') }}
        </button>
        <template #menu="{ close }">
          <button
            v-for="(className, value) in MARKDOWN_TEXT_COLORS"
            :key="value"
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50"
            @click="applyTextStyle('color', value); close()"
          >
            <span class="size-3 rounded-full bg-current" :class="className" />
            {{ $t(`markdown.editor.colors.${value}`) }}
          </button>
        </template>
          </MarkdownEditorDropdownMenu>

          <MarkdownEditorDropdownMenu>
        <button
          type="button"
          :disabled="disabled"
          class="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
        >
          <MarkdownEditorIcon :icon="Underline" class="size-4" />
          {{ $t('markdown.editor.toolbar.underline') }}
        </button>
        <template #menu="{ close }">
          <button
            v-for="(className, value) in MARKDOWN_UNDERLINE_COLORS"
            :key="value"
            type="button"
            role="menuitem"
            class="flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50"
            @click="applyTextStyle('underline', value); close()"
          >
            <span>{{ $t(`markdown.editor.colors.${value}`) }}</span>
            <span class="markdown-text-underline font-semibold" :class="className">Aa</span>
          </button>
        </template>
          </MarkdownEditorDropdownMenu>
        </div>
      </div>

      <MarkdownEditorDropdownMenu
        align="right"
        class="order-2 flex w-full items-center self-center md:w-auto md:justify-self-end"
        panel-class="w-[min(22rem,calc(100vw-1rem))] max-h-[min(22rem,calc(100vh-2rem))] overflow-y-auto p-1.5"
      >
        <button
          type="button"
          :disabled="disabled"
          class="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 md:w-auto"
        >
          <MarkdownEditorIcon :icon="Braces" class="size-4" />
          {{ $t('markdown.editor.toolbar.advanced') }}
        </button>
        <template #menu="{ close }">
          <button
            v-for="definition in markdownContainers"
            :key="definition.name"
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
            @click="insertContainer(definition.name); close()"
          >
            <span class="grid size-8 shrink-0 place-items-center rounded-lg" :class="containerMenuMeta[definition.name].iconClass">
              <MarkdownEditorIcon :icon="containerMenuMeta[definition.name].icon" class="size-4" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex min-w-0 items-baseline gap-2">
                <span class="truncate text-[13px] font-semibold text-slate-800">{{ $t(definition.labelKey) }}</span>
                <span class="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{{ containerMenuMeta[definition.name].englishLabel }}</span>
              </span>
              <span class="mt-0.5 block truncate text-[11px] leading-4 text-slate-400">{{ $t(definition.descriptionKey) }}</span>
            </span>
          </button>
        </template>
      </MarkdownEditorDropdownMenu>

    </div>

    <div v-if="!alwaysSplit" class="flex border-b border-slate-200 bg-white p-1 md:hidden">
      <button
        v-for="pane in (['edit', 'preview'] as const)"
        :key="pane"
        type="button"
        class="flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition"
        :class="mobilePane === pane ? 'bg-slate-900 text-white' : 'text-slate-500'"
        @click="mobilePane = pane"
      >
        <MarkdownEditorIcon :icon="pane === 'edit' ? Pencil : Eye" class="size-3.5" />
        {{ $t(`markdown.editor.${pane}`) }}
      </button>
    </div>

    <div
      class="grid"
      :class="alwaysSplit ? 'grid-cols-2 divide-x divide-slate-200' : 'md:grid-cols-2 md:divide-x md:divide-slate-200'"
    >
      <div
        ref="editorHost"
        class="min-w-0 bg-white"
        :class="alwaysSplit || mobilePane === 'edit' ? 'block' : 'hidden md:block'"
      />
      <div
        class="min-w-0 min-h-72 overflow-y-auto bg-slate-50/50 p-4"
        :class="alwaysSplit || mobilePane === 'preview' ? 'block' : 'hidden md:block'"
      >
        <MarkdownContent v-if="preview.trim()" :content="preview" />
        <div v-else class="grid min-h-64 place-items-center text-sm text-slate-400">
          {{ $t('markdown.editor.previewEmpty') }}
        </div>
      </div>
    </div>
  </div>
  <p v-if="error" class="mt-1.5 text-xs font-medium text-rose-600">{{ error }}</p>
</template>
