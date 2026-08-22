# @psray/editor

A Nuxt 4 Markdown editor with CodeMirror, live preview, safe Markdown rendering,
task lists, callouts, steps, spoilers, highlighting and allow-listed text styles.

## Install

```bash
pnpm add @psray/editor
```

The consuming Nuxt project must already use Tailwind CSS 4,
`@tailwindcss/typography` and `@nuxtjs/i18n`.

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n',
    '@psray/editor',
  ],
})
```

The module registers `MarkdownEditor`, `MarkdownContent`, the Markdown helper
auto-imports, its stylesheet, and locale messages for English, Japanese, Korean,
Simplified Chinese and Traditional Chinese. Application locale messages override
the bundled defaults.

```vue
<MarkdownEditor v-model="content" help-url="/docs/markdown" />
<MarkdownContent :content="content" />
```

Set `help-url=""` or `:help-url="false"` to hide the syntax-guide link.

## Publish

From the repository root:

```bash
pnpm --filter @psray/editor build
pnpm --filter @psray/editor publish --access public
```

Change the package name before publishing if the `@psray` npm scope is not
owned by the publisher.
