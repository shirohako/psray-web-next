import { describe, expect, it } from 'vitest'
import { applyMarkdownEdit, applyMarkdownTextStyle, markdownContainerSnippet } from '../packages/markdown-editor/src/runtime/app/utils/markdownEditor'

describe('Markdown editor transforms', () => {
  it('wraps a selection and preserves the selected range', () => {
    const result = applyMarkdownEdit('helpful tip', 0, 7, 'bold')
    expect(result.text).toBe('**helpful** tip')
    expect(result.text.slice(result.selectionFrom, result.selectionTo)).toBe('helpful')
  })

  it('adds a prefix to every selected line', () => {
    const result = applyMarkdownEdit('one\ntwo', 0, 7, 'taskList')
    expect(result.text).toBe('- [ ] one\n- [ ] two')
  })

  it('selects the URL after inserting a link', () => {
    const result = applyMarkdownEdit('PSRay', 0, 5, 'link')
    expect(result.text).toBe('[PSRay](https://)')
    expect(result.text.slice(result.selectionFrom, result.selectionTo)).toBe('https://')
  })

  it('creates advanced container snippets around selected content', () => {
    expect(markdownContainerSnippet('warning', 'Watch out')).toContain('::: warning')
    expect(markdownContainerSnippet('warning', 'Watch out')).toContain('Watch out')
    expect(markdownContainerSnippet('steps')).toContain('1.')
    expect(markdownContainerSnippet('checklist')).toContain('- [x]')
    expect(markdownContainerSnippet('checklist')).toContain('- [ ]')
  })

  it('applies highlighting, color and size to selected text', () => {
    expect(applyMarkdownEdit('Important', 0, 9, 'mark').text).toBe('==Important==')
    expect(applyMarkdownEdit('Secret', 0, 6, 'inlineSpoiler').text).toBe('||Secret||')
    expect(applyMarkdownTextStyle('Important', 0, 9, 'color', 'red').text)
      .toBe('[Important]{color=red}')
    expect(applyMarkdownTextStyle('Important', 0, 9, 'size', 'large').text)
      .toBe('[Important]{size=large}')
    expect(applyMarkdownTextStyle('Important', 0, 9, 'underline', 'blue').text)
      .toBe('[Important]{underline=blue}')
  })
})
