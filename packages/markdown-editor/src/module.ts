import { addComponent, addImports, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import type {} from '@nuxtjs/i18n'

export interface ModuleOptions {
  /** Register the bundled locale messages through @nuxtjs/i18n. */
  i18n: boolean
}

const localeCodes = ['en', 'ja', 'ko', 'zh-Hans', 'zh-Hant'] as const
const optimizeDependencies = [
  '@psray/editor > markdown-it',
  '@psray/editor > markdown-it-container',
  '@psray/editor > markdown-it-mark',
  '@psray/editor > markdown-it-task-lists',
] as const

const markdownEditorModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@psray/editor',
    configKey: 'markdownEditor',
    compatibility: { nuxt: '>=4.0.0' },
  },
  defaults: {
    i18n: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const appRuntime = resolver.resolve('./runtime/app')

    nuxt.options.alias['#markdown-editor'] = appRuntime
    nuxt.options.css.push(resolver.resolve('./runtime/markdown.css'))
    nuxt.options.vite.optimizeDeps ??= {}
    nuxt.options.vite.optimizeDeps.include = [
      ...new Set([
        ...(nuxt.options.vite.optimizeDeps.include ?? []),
        ...optimizeDependencies,
      ]),
    ]

    addComponent({
      name: 'MarkdownEditor',
      filePath: resolver.resolve('./runtime/app/components/MarkdownEditor.vue'),
    })
    addComponent({
      name: 'MarkdownContent',
      filePath: resolver.resolve('./runtime/app/components/MarkdownContent.vue'),
    })

    addImports([
      { name: 'renderMarkdown', from: resolver.resolve('./runtime/app/utils/markdown') },
      { name: 'markdownContainers', from: resolver.resolve('./runtime/app/utils/markdown') },
      { name: 'applyMarkdownEdit', from: resolver.resolve('./runtime/app/utils/markdownEditor') },
      { name: 'applyMarkdownTextStyle', from: resolver.resolve('./runtime/app/utils/markdownEditor') },
      { name: 'markdownContainerSnippet', from: resolver.resolve('./runtime/app/utils/markdownEditor') },
    ])

    if (options.i18n) {
      nuxt.hook('i18n:registerModule', (register) => {
        register({
          langDir: resolver.resolve('./runtime/locales'),
          locales: localeCodes.map(code => ({ code, file: `${code}.json` })),
        })
      })
    }
  },
})

export default markdownEditorModule
