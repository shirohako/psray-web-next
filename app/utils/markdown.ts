import MarkdownIt from 'markdown-it'

/**
 * Shared markdown-it instance for rendering user tips (and any other Markdown
 * in the app). Configured once here so custom rules / plugins live in one
 * place — register them on `md` (e.g. `md.use(plugin)` or `md.renderer.rules`)
 * to add custom tags, inline buttons, etc. later.
 *
 * `html: true` lets authored Markdown embed raw HTML. Tips are community
 * content, so sanitize before rendering if the source is ever untrusted.
 */
export const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true,
})

// Open links in a new tab safely (preserve any existing target attrs).
const defaultLinkOpen = md.renderer.rules.link_open
  ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]!
  token.attrSet('target', '_blank')
  token.attrSet('rel', 'noopener noreferrer')
  return defaultLinkOpen(tokens, idx, options, env, self)
}

/** Render a Markdown string to an HTML string. */
export const renderMarkdown = (src: string) => md.render(src ?? '')
