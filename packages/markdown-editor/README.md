# @psray/editor

A Nuxt 4 Markdown editor powered by CodeMirror, with a responsive live preview
and a safe, shared Markdown renderer.

It supports task lists, callouts, collapsible details, steps, spoilers,
highlighting, image dimensions, and allow-listed text colors and sizes.

## Live Demo

[https://psray.net/docs/markdown](https://psray.net/docs/markdown)

## Requirements

- Nuxt 4.4 or later
- Vue 3.5 or later
- Tailwind CSS 4.3 or later
- `@tailwindcss/typography` 0.5 or later
- `@nuxtjs/i18n` 10.4 or later
- Node.js 20.19 or later

## Installation

Install the required peer dependencies:

```bash
npm install @nuxtjs/i18n @tailwindcss/typography
```

Then install the editor:

```bash
npm install @psray/editor
```

## Nuxt Configuration

Register `@nuxtjs/i18n` before the editor module:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n',
    '@psray/editor',
  ],
})
```

Enable the Tailwind Typography plugin in your application stylesheet:

```css
/* app/assets/css/main.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

The module automatically registers its components, stylesheet, Markdown
helpers, and locale messages. No package CSS import is required.

Bundled translations are available for `en`, `ja`, `ko`, `zh-Hans`, and
`zh-Hant`. Messages defined by the consuming application take precedence.

To disable the bundled messages, set `i18n` to `false`. The consuming
application must then provide the required `markdown.*` messages itself.

```ts
export default defineNuxtConfig({
  markdownEditor: {
    i18n: false,
  },
})
```

## Module Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `i18n` | `boolean` | `true` | Registers the bundled locale messages through `@nuxtjs/i18n`. |

## Editor Usage

`MarkdownEditor` uses `v-model` for its Markdown source:

```vue
<script setup lang="ts">
const content = ref('# Hello, Markdown!')
const error = ref('')
</script>

<template>
  <MarkdownEditor
    v-model="content"
    placeholder="Write something..."
    help-url="https://psray.net/docs/markdown"
    :error="error"
  />
</template>
```

Set `help-url=""` or `:help-url="false"` to hide the syntax-guide link:

```vue
<MarkdownEditor v-model="content" :help-url="false" />
```

## Rendering Markdown

Use `MarkdownContent` when the saved Markdown needs to be rendered outside the
editor:

```vue
<MarkdownContent :content="article.body" />
```

The renderer disables arbitrary HTML, validates links, and only emits custom
classes and attributes from fixed allow lists. Links open in a new tab with
`noopener noreferrer`.

## Component API

### `MarkdownEditor`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `v-model` | `string` | Required | Markdown source. |
| `disabled` | `boolean` | `false` | Makes the CodeMirror editor read-only and disables toolbar actions. |
| `error` | `string` | `''` | Displays an error message and error border below the editor. |
| `help-url` | `string \| false` | `'/docs/markdown'` | Syntax-guide URL. Use `false` or an empty string to hide it. |
| `placeholder` | `string` | `''` | Editor placeholder. An empty value uses the bundled localized placeholder. |

The component emits `update:modelValue` through `v-model`.

### `MarkdownContent`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | `string` | Required | Markdown source to render. |

## Auto-imported Helpers

The Nuxt module makes these helpers available without explicit imports:

| Helper | Description |
| --- | --- |
| `renderMarkdown(source)` | Converts Markdown into safe HTML using the same renderer as `MarkdownContent`. |
| `markdownContainers` | Metadata for the supported `details`, `info`, `tip`, `warning`, `danger`, `checklist`, `steps`, and `spoiler` blocks. |
| `applyMarkdownEdit(source, from, to, action)` | Applies a toolbar-style text edit and returns the updated text and selection. |
| `applyMarkdownTextStyle(source, from, to, kind, value)` | Applies an allow-listed color, size, or underline style. |
| `markdownContainerSnippet(name, content?)` | Creates a Markdown container snippet. |

Example:

```ts
const html = renderMarkdown('**Hello**')
const snippet = markdownContainerSnippet('tip', 'Save your work often.')
```

## Supported Markdown Extensions

In addition to standard Markdown, the renderer supports:

- GitHub-style task lists
- `==highlighted text==`
- `||inline spoilers||`
- Callouts and rich blocks using `::: name ... :::`
- Allow-listed text styles such as `[text]{color=red size=large}`
- Image dimensions such as `![Alt](image.jpg){width=640}`

See the [live syntax guide](https://psray.net/docs/markdown) for complete
examples.

## License

[MIT](./LICENSE)
