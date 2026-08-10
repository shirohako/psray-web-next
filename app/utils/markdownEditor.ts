import type { MarkdownContainerName, MarkdownTextColor, MarkdownTextSize, MarkdownUnderlineColor } from '~/utils/markdown'
import { tr } from '~/utils/locale'

export type MarkdownEditAction =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'strike'
  | 'mark'
  | 'inlineSpoiler'
  | 'quote'
  | 'link'
  | 'image'
  | 'bulletList'
  | 'taskList'
  | 'code'

export interface MarkdownEditResult {
  text: string
  selectionFrom: number
  selectionTo: number
}

function replaceRange(source: string, from: number, to: number, replacement: string, selectionStart: number, selectionLength: number): MarkdownEditResult {
  return {
    text: source.slice(0, from) + replacement + source.slice(to),
    selectionFrom: from + selectionStart,
    selectionTo: from + selectionStart + selectionLength,
  }
}

function selectedOr(value: string, fallback: string) {
  return value || fallback
}

/** Pure text transforms used by the toolbar and covered without a DOM. */
export function applyMarkdownEdit(source: string, from: number, to: number, action: MarkdownEditAction): MarkdownEditResult {
  const selected = source.slice(from, to)

  const wrap = (before: string, after: string, fallback: string) => {
    const body = selectedOr(selected, fallback)
    return replaceRange(source, from, to, `${before}${body}${after}`, before.length, body.length)
  }

  switch (action) {
    case 'bold': return wrap('**', '**', tr('markdown.editor.placeholders.text'))
    case 'italic': return wrap('*', '*', tr('markdown.editor.placeholders.text'))
    case 'strike': return wrap('~~', '~~', tr('markdown.editor.placeholders.text'))
    case 'mark': return wrap('==', '==', tr('markdown.editor.placeholders.text'))
    case 'inlineSpoiler': return wrap('||', '||', tr('markdown.editor.placeholders.text'))
    case 'link': {
      const label = selectedOr(selected, tr('markdown.editor.placeholders.linkText'))
      const url = 'https://'
      return replaceRange(source, from, to, `[${label}](${url})`, label.length + 3, url.length)
    }
    case 'image': {
      const alt = selectedOr(selected, tr('markdown.editor.placeholders.imageAlt'))
      const url = 'https://'
      return replaceRange(source, from, to, `![${alt}](${url})`, alt.length + 4, url.length)
    }
    case 'code': {
      if (selected.includes('\n')) return wrap('```\n', '\n```', tr('markdown.editor.placeholders.code'))
      return wrap('`', '`', tr('markdown.editor.placeholders.code'))
    }
    case 'heading':
    case 'quote':
    case 'bulletList':
    case 'taskList': {
      const prefix = {
        heading: '## ',
        quote: '> ',
        bulletList: '- ',
        taskList: '- [ ] ',
      }[action]
      const body = selectedOr(selected, tr('markdown.editor.placeholders.text'))
      const replacement = body.split('\n').map(line => `${prefix}${line}`).join('\n')
      return replaceRange(source, from, to, replacement, prefix.length, body.length)
    }
  }
}

/** Wrap selected inline text in a safe, allow-listed Pandoc-style span. */
export function applyMarkdownTextStyle(
  source: string,
  from: number,
  to: number,
  kind: 'color' | 'size' | 'underline',
  value: MarkdownTextColor | MarkdownTextSize | MarkdownUnderlineColor,
): MarkdownEditResult {
  const selected = selectedOr(source.slice(from, to), tr('markdown.editor.placeholders.text'))
  const replacement = selected
    .split('\n')
    .map(line => line ? `[${line}]{${kind}=${value}}` : line)
    .join('\n')
  return replaceRange(source, from, to, replacement, 1, selected.length)
}

export function markdownContainerSnippet(name: MarkdownContainerName, content = '') {
  const title = tr('markdown.editor.placeholders.title')
  const body = content || tr('markdown.editor.placeholders.content')
  if (name === 'steps') {
    return `::: steps\n1. ${tr('markdown.editor.placeholders.firstStep')}\n2. ${tr('markdown.editor.placeholders.secondStep')}\n:::`
  }
  if (name === 'checklist') {
    const items = content
      ? content.split('\n').map(line => /^\s*- \[[ xX]\]\s/.test(line) ? line : `- [ ] ${line}`).join('\n')
      : `- [x] ${tr('markdown.editor.placeholders.completedTask')}\n- [ ] ${tr('markdown.editor.placeholders.pendingTask')}`
    return `::: checklist ${title}\n${items}\n:::`
  }
  return `::: ${name} ${title}\n${body}\n:::`
}
