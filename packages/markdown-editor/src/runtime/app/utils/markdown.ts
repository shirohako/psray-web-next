import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import mark from 'markdown-it-mark'
import taskLists from 'markdown-it-task-lists'
import { tr } from './translate'
import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs'

export type MarkdownContainerName =
  | 'details'
  | 'info'
  | 'tip'
  | 'warning'
  | 'danger'
  | 'checklist'
  | 'steps'
  | 'spoiler'

export interface MarkdownContainerDefinition {
  name: MarkdownContainerName
  labelKey: string
  descriptionKey: string
  snippet: string
}

export const MARKDOWN_TEXT_COLORS = {
  slate: 'text-slate-600',
  red: 'text-rose-600',
  orange: 'text-orange-600',
  yellow: 'text-amber-600',
  green: 'text-emerald-600',
  blue: 'text-sky-600',
  purple: 'text-violet-600',
  pink: 'text-pink-600',
} as const

export const MARKDOWN_TEXT_SIZES = {
  small: 'text-xs',
  large: 'text-lg',
  xlarge: 'text-xl',
} as const

export const MARKDOWN_UNDERLINE_COLORS = {
  slate: 'markdown-underline-slate',
  red: 'markdown-underline-red',
  orange: 'markdown-underline-orange',
  yellow: 'markdown-underline-yellow',
  green: 'markdown-underline-green',
  blue: 'markdown-underline-blue',
  purple: 'markdown-underline-purple',
  pink: 'markdown-underline-pink',
} as const

export type MarkdownTextColor = keyof typeof MARKDOWN_TEXT_COLORS
export type MarkdownTextSize = keyof typeof MARKDOWN_TEXT_SIZES
export type MarkdownUnderlineColor = keyof typeof MARKDOWN_UNDERLINE_COLORS

/**
 * The authoring catalogue is shared by the renderer, CodeMirror completion and
 * the help page. Adding a container here makes every surface discover it.
 */
export const markdownContainers: readonly MarkdownContainerDefinition[] = [
  {
    name: 'details',
    labelKey: 'markdown.blocks.details.title',
    descriptionKey: 'markdown.blocks.details.description',
    snippet: '::: details ${title}\n${content}\n:::',
  },
  {
    name: 'info',
    labelKey: 'markdown.blocks.info.title',
    descriptionKey: 'markdown.blocks.info.description',
    snippet: '::: info ${title}\n${content}\n:::',
  },
  {
    name: 'tip',
    labelKey: 'markdown.blocks.tip.title',
    descriptionKey: 'markdown.blocks.tip.description',
    snippet: '::: tip ${title}\n${content}\n:::',
  },
  {
    name: 'warning',
    labelKey: 'markdown.blocks.warning.title',
    descriptionKey: 'markdown.blocks.warning.description',
    snippet: '::: warning ${title}\n${content}\n:::',
  },
  {
    name: 'danger',
    labelKey: 'markdown.blocks.danger.title',
    descriptionKey: 'markdown.blocks.danger.description',
    snippet: '::: danger ${title}\n${content}\n:::',
  },
  {
    name: 'checklist',
    labelKey: 'markdown.blocks.checklist.title',
    descriptionKey: 'markdown.blocks.checklist.description',
    snippet: '::: checklist ${title}\n- [x] ${completedTask}\n- [ ] ${pendingTask}\n:::',
  },
  {
    name: 'steps',
    labelKey: 'markdown.blocks.steps.title',
    descriptionKey: 'markdown.blocks.steps.description',
    snippet: '::: steps\n1. ${firstStep}\n2. ${secondStep}\n:::',
  },
  {
    name: 'spoiler',
    labelKey: 'markdown.blocks.spoiler.title',
    descriptionKey: 'markdown.blocks.spoiler.description',
    snippet: '::: spoiler ${title}\n${content}\n:::',
  },
] as const

const CALLOUTS = {
  info: { icon: 'i', classes: 'border-sky-200 bg-sky-50/80 text-sky-950', iconClasses: 'bg-sky-500 text-white' },
  tip: { icon: '✓', classes: 'border-emerald-200 bg-emerald-50/80 text-emerald-950', iconClasses: 'bg-emerald-500 text-white' },
  warning: { icon: '!', classes: 'border-amber-200 bg-amber-50/80 text-amber-950', iconClasses: 'bg-amber-500 text-white' },
  danger: { icon: '!', classes: 'border-rose-200 bg-rose-50/80 text-rose-950', iconClasses: 'bg-rose-500 text-white' },
} as const

function titleFrom(info: string, name: MarkdownContainerName) {
  return info.trim().slice(name.length).trim()
}

function fallbackTitle(name: MarkdownContainerName) {
  return tr(`markdown.blocks.${name}.defaultTitle`)
}

/** Shared safe Markdown renderer for published tips and live previews. */
export const md = new MarkdownIt({
  // Community content must never be able to inject arbitrary elements or
  // attributes. Site-owned containers below emit the only custom HTML.
  html: false,
  linkify: true,
  breaks: true,
  typographer: true,
})

md.use(taskLists, { enabled: true, label: true, labelAfter: true })
md.use(mark)

/**
 * markdown-it-task-lists' `labelAfter` mode assumes an item has a single text
 * token. For nested Markdown it leaves the already-rendered tokens in place
 * and appends the complete source again as a raw label, duplicating content
 * (and bypassing Markdown escaping inside that label). Rebuild the label from
 * parsed inline tokens while retaining the plugin's checkbox/id structure.
 */
md.core.ruler.after('github-task-lists', 'psray_task_list_labels', (state) => {
  for (const token of state.tokens) {
    if (token.type !== 'inline' || !token.children?.length) continue

    const checkbox = token.children[0]
    const rawLabel = token.children[token.children.length - 1]
    if (
      checkbox?.type !== 'html_inline'
      || !checkbox.content.includes('task-list-item-checkbox')
      || rawLabel?.type !== 'html_inline'
      || !rawLabel.content.startsWith('<label class="task-list-item-label"')
    ) continue

    const id = /\sid="([^"]+)"/.exec(checkbox.content)?.[1]
    if (!id) continue

    const labelOpen = new state.Token('html_inline', '', 0)
    labelOpen.content = `<label class="task-list-item-label" for="${id}">`
    const labelClose = new state.Token('html_inline', '', 0)
    labelClose.content = '</label>'
    const labelChildren: typeof token.children = []
    state.md.inline.parse(token.content, state.md, state.env, labelChildren)
    token.children = [checkbox, labelOpen, ...labelChildren, labelClose]
  }
})

/**
 * A deliberately small, safe subset of Pandoc's bracketed-span attributes:
 *
 *   [text]{color=red}
 *   [text]{size=large}
 *   [**Markdown** text]{color=red size=large}
 *
 * Arbitrary HTML attributes and CSS values are never emitted. Both attribute
 * names and values must be present in the fixed maps above.
 */
function pandocSpanRule(state: StateInline, silent: boolean) {
  if (state.src[state.pos] !== '[') return false

  let squareDepth = 1
  let labelEnd = -1
  for (let index = state.pos + 1; index < state.src.length; index += 1) {
    if (state.src[index - 1] === '\\') continue
    if (state.src[index] === '[') squareDepth += 1
    if (state.src[index] !== ']') continue
    squareDepth -= 1
    if (squareDepth === 0) {
      labelEnd = index
      break
    }
    // Bound pathological nesting while still allowing links inside a span.
    if (squareDepth > 16) return false
  }

  if (labelEnd <= state.pos + 1 || state.src[labelEnd + 1] !== '{') return false
  const attributesEnd = state.src.indexOf('}', labelEnd + 2)
  if (attributesEnd < 0) return false

  const rawAttributes = state.src.slice(labelEnd + 2, attributesEnd)
  if (!rawAttributes || rawAttributes.includes('\n')) return false

  const classes: string[] = []
  const seen = new Set<string>()
  for (const attribute of rawAttributes.trim().split(/\s+/)) {
    const match = /^(color|size|underline)=([a-z]+)$/.exec(attribute)
    if (!match || seen.has(match[1]!)) return false
    const [kind, value] = match.slice(1) as ['color' | 'size' | 'underline', string]
    const className = kind === 'color'
      ? MARKDOWN_TEXT_COLORS[value as MarkdownTextColor]
      : kind === 'size'
        ? MARKDOWN_TEXT_SIZES[value as MarkdownTextSize]
        : MARKDOWN_UNDERLINE_COLORS[value as MarkdownUnderlineColor]
    if (!className) return false
    seen.add(kind)
    classes.push(`markdown-text-${kind}`, className)
  }
  if (classes.length === 0) return false

  if (!silent) {
    const opening = state.push('psray_span_open', 'span', 1)
    opening.attrSet('class', classes.join(' '))
    const innerTokens: StateInline['tokens'] = []
    state.md.inline.parse(
      state.src.slice(state.pos + 1, labelEnd),
      state.md,
      state.env,
      innerTokens,
    )
    state.tokens.push(...innerTokens)
    state.push('psray_span_close', 'span', -1)
  }
  state.pos = attributesEnd + 1
  return true
}

md.inline.ruler.before('link', 'psray_pandoc_span', pandocSpanRule)

/** Discord-style inline spoilers. The RichContent component owns reveal
 * interaction so the renderer stays deterministic for previews and SSR. */
function inlineSpoilerRule(state: StateInline, silent: boolean) {
  if (!state.src.startsWith('||', state.pos)) return false
  const end = state.src.indexOf('||', state.pos + 2)
  if (end <= state.pos + 2 || state.src.slice(state.pos + 2, end).includes('\n')) return false

  if (!silent) {
    const opening = state.push('psray_inline_spoiler_open', 'span', 1)
    opening.attrSet('class', 'markdown-inline-spoiler')
    opening.attrSet('role', 'button')
    opening.attrSet('tabindex', '0')
    opening.attrSet('aria-expanded', 'false')
    opening.attrSet('aria-label', tr('markdown.inlineSpoiler.reveal'))

    const contentOpening = state.push('psray_inline_spoiler_content_open', 'span', 1)
    contentOpening.attrSet('class', 'markdown-inline-spoiler-content')
    const innerTokens: StateInline['tokens'] = []
    state.md.inline.parse(state.src.slice(state.pos + 2, end), state.md, state.env, innerTokens)
    state.tokens.push(...innerTokens)
    state.push('psray_inline_spoiler_content_close', 'span', -1)
    state.push('psray_inline_spoiler_close', 'span', -1)
  }
  state.pos = end + 2
  return true
}

// markdown-it intentionally does not treat `|` as an inline extension
// boundary. Keep its standard terminators and add `|` so the spoiler rule can
// inspect that position instead of having the whole sequence consumed as text.
const INLINE_TEXT_TERMINATORS = '\n!#$%&*+-:<=>@[\\]^_`{|}~'
md.inline.ruler.at('text', (state: StateInline, silent: boolean) => {
  let position = state.pos
  while (position < state.posMax && !INLINE_TEXT_TERMINATORS.includes(state.src[position]!)) position += 1
  if (position === state.pos) return false
  if (!silent) state.pending += state.src.slice(state.pos, position)
  state.pos = position
  return true
})
md.inline.ruler.before('emphasis', 'psray_inline_spoiler', inlineSpoilerRule)

/** Safe Pandoc-style image dimensions. A single dimension preserves the
 * intrinsic aspect ratio; providing both creates an explicit image box. */
// Run after task-list labels are rebuilt so images nested in a task item also
// receive their validated dimensions.
md.core.ruler.after('psray_task_list_labels', 'psray_image_dimensions', (state) => {
  for (const blockToken of state.tokens) {
    const children = blockToken.children
    if (!children) continue
    for (let index = 0; index < children.length - 1; index += 1) {
      const image = children[index]!
      const attributes = children[index + 1]!
      if (image.type !== 'image' || attributes.type !== 'text' || !attributes.content.startsWith('{')) continue

      const closing = attributes.content.indexOf('}')
      if (closing < 0) continue
      const declarations = attributes.content.slice(1, closing).trim().split(/\s+/)
      if (declarations.length === 0 || declarations.length > 2) continue

      const dimensions = new Map<'width' | 'height', string>()
      let valid = true
      for (const declaration of declarations) {
        const match = /^(width|height)=(\d{1,4})$/.exec(declaration)
        if (!match || dimensions.has(match[1] as 'width' | 'height')) {
          valid = false
          break
        }
        const value = Number(match[2])
        if (value < 1 || value > 4096) {
          valid = false
          break
        }
        dimensions.set(match[1] as 'width' | 'height', match[2]!)
      }
      if (!valid || dimensions.size === 0) continue

      image.attrJoin('class', 'markdown-sized-image')
      for (const [name, value] of dimensions) image.attrSet(name, value)
      attributes.content = attributes.content.slice(closing + 1)
      if (!attributes.content) children.splice(index + 1, 1)
    }
  }
})

interface ContainerRenderToken {
  nesting: number
  info: string
  type: string
  children?: { type: string, content: string }[] | null
}

function checklistStats(tokens: ContainerRenderToken[], openingIndex: number) {
  let completed = 0
  let total = 0
  const closingType = tokens[openingIndex]!.type.replace(/_open$/, '_close')
  for (let index = openingIndex + 1; index < tokens.length && tokens[index]!.type !== closingType; index += 1) {
    for (const child of tokens[index]!.children ?? []) {
      if (child.type !== 'html_inline' || !child.content.includes('task-list-item-checkbox')) continue
      total += 1
      if (/\schecked(?:="")?/.test(child.content)) completed += 1
    }
  }
  return { completed, total }
}

for (const definition of markdownContainers) {
  const { name } = definition
  md.use(container, name, {
    validate: (params: string) => {
      const token = params.trim().split(/\s+/, 1)[0]
      return token === name
    },
    render: (tokens: ContainerRenderToken[], idx: number) => {
      if (tokens[idx]!.nesting === -1) {
        if (name === 'details' || name === 'spoiler') return '</div></details>\n'
        if (name === 'steps') return '</div>\n'
        if (name === 'checklist') return '</div></div>\n'
        return '</div></div>\n'
      }

      const rawTitle = titleFrom(tokens[idx]!.info, name)
      const title = md.utils.escapeHtml(rawTitle || fallbackTitle(name))

      if (name === 'details' || name === 'spoiler') {
        const kind = name === 'spoiler' ? ' markdown-container-spoiler' : ''
        const icon = name === 'spoiler'
          ? '<span class="markdown-spoiler-icons" aria-hidden="true"><svg class="markdown-spoiler-eye markdown-spoiler-eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.06 12.35a1 1 0 0 1 0-.7C3.73 7.9 7.23 5.5 12 5.5s8.27 2.4 9.94 6.15a1 1 0 0 1 0 .7C20.27 16.1 16.77 18.5 12 18.5s-8.27-2.4-9.94-6.15Z"/><circle cx="12" cy="12" r="3"/></svg><svg class="markdown-spoiler-eye markdown-spoiler-eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M6.7 6.7C4.6 8 3.1 9.8 2.1 12a1 1 0 0 0 0 .7c1.7 3.7 5.2 6.1 9.9 6.1 1.5 0 2.9-.2 4.1-.7"/><path d="M10.7 5.6c.4-.1.9-.1 1.3-.1 4.8 0 8.3 2.4 9.9 6.2a1 1 0 0 1 0 .7 12 12 0 0 1-2.1 3.1"/></svg></span>'
          : ''
        return `<details class="markdown-container markdown-container-details${kind}"><summary>${icon}<span>${title}</span></summary><div class="markdown-container-body">\n`
      }

      if (name === 'steps') {
        return `<div class="markdown-container markdown-container-steps" role="group" aria-label="${title}">\n`
      }

      if (name === 'checklist') {
        const { completed, total } = checklistStats(tokens, idx)
        const completeClass = total > 0 && completed === total ? ' is-complete' : ''
        const progressLabel = md.utils.escapeHtml(tr('markdown.blocks.checklist.progress', { completed, total }))
        return `<div class="markdown-container markdown-container-checklist${completeClass}" role="group" aria-label="${title}"><div class="markdown-checklist-heading"><svg class="markdown-checklist-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><strong>${title}</strong><span class="markdown-checklist-progress" aria-live="polite" aria-label="${progressLabel}"><span class="markdown-checklist-progress-value">${completed} / ${total}</span></span></div><div class="markdown-checklist-body">\n`
      }

      const callout = CALLOUTS[name]
      return `<div class="markdown-container markdown-container-callout ${callout.classes}" role="note"><div class="markdown-container-heading"><span class="markdown-container-icon ${callout.iconClasses}" aria-hidden="true">${callout.icon}</span><strong>${title}</strong></div><div class="markdown-container-body">\n`
    },
  })
}

// Open links in a new tab safely. markdown-it's built-in validateLink rejects
// javascript:, vbscript:, file: and unsafe data: URLs before this runs.
const defaultLinkOpen = md.renderer.rules.link_open
  ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]!
  token.attrSet('target', '_blank')
  token.attrSet('rel', 'noopener noreferrer')
  return defaultLinkOpen(tokens, idx, options, env, self)
}

export const renderMarkdown = (src: string) => md.render(src ?? '')
