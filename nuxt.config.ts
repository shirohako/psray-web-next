import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['./app/assets/css/main.css'],
  devtools: { enabled: true },
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
  },
})
