import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // Module id, not a path relative to this file — Nuxt 4.5 warns on the latter.
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/logo.png' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      // Override with NUXT_PUBLIC_API_BASE in .env
      apiBase: 'http://localhost:8000/api',
      // Absolute origin, no trailing slash. Used to build canonical/hreflang/OG
      // URLs. Override with NUXT_PUBLIC_SITE_URL in .env.
      siteUrl: 'http://localhost:3000',
    },
  },

  /**
   * UI locales are driven by a `?lang=` query param (Steam-style), never a path
   * prefix — hence `no_prefix`. We resolve the locale ourselves (query → cookie
   * → `ja`) in `app/plugins/i18n-locale.server.ts` + `app/middleware/i18n.global.ts`,
   * so `detectBrowserLanguage` is off: the module then neither sniffs
   * `Accept-Language` nor writes its own `i18n_redirected` cookie.
   *
   * Note `no_prefix` also disables the module's `useLocaleHead()` hreflang
   * output. That's fine — canonical/alternate links are emitted by our own
   * `useSeo()` composable, which the trophy page needs anyway to advertise a
   * per-trophy-set list of PSN languages.
   *
   * Message catalogs live in `<rootDir>/i18n/locales`, a sibling of `app/`.
   */
  i18n: {
    defaultLocale: 'ja',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    // Array order is the order of the top-bar language menu.
    locales: [
      { code: 'ja', language: 'ja-JP', name: '日本語', file: 'ja.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'ko', language: 'ko-KR', name: '한국어', file: 'ko.json' },
      { code: 'zh-Hant', language: 'zh-Hant', name: '繁體中文', file: 'zh-Hant.json' },
      { code: 'zh-Hans', language: 'zh-Hans', name: '简体中文', file: 'zh-Hans.json' },
    ],
    experimental: {
      // `$t()` key autocompletion, typed from the default locale's catalog.
      typedOptionsAndMessages: 'default',
      prerenderMessages: true,
      httpCacheDuration: 60 * 60 * 24,
      // `preload` is deliberately off: it server-loads every locale, and its
      // companion `stripMessagesPayload` only keeps keys touched during SSR —
      // which would leave every dialog/toast string rendering as a raw key.
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        'animejs',
        'lucide',
        'markdown-it',
        'qrcode', // CJS
      ]
    }
  },

  modules: ['@nuxt/icon', '@nuxtjs/i18n'],
})
