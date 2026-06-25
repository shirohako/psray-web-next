import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['./app/assets/css/main.css'],
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
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        'lucide',
        'markdown-it',
        'qrcode',
      ]
    }
  },

  modules: ['@nuxt/icon'],
})
