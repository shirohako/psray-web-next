/**
 * Global app config — non-sensitive branding/theme values that are safe to ship
 * to the client and may be tweaked without an env change.
 *
 * Read anywhere with `useAppConfig()`. For secrets or per-environment values use
 * `runtimeConfig` in `nuxt.config.ts` instead.
 */
export default defineAppConfig({
  brand: {
    /**
     * Logo icon shown in the fixed top-left menu (the layout header). When empty
     * the layout falls back to the built-in Zap icon. Use a local asset (e.g.
     * `/logo.svg` in `public/`) or any URL.
     */
    logo: 'https://i2.abyss.moe/i/2026/05/29/6a19a6ec6aba5.png',
  },
  profile: {
    /**
     * Fallback banner shown on `/p/:psnid` when the user has no custom banner.
     * Swap for a local asset (e.g. `/banner-default.jpg` in `public/`) or any URL.
     */
    defaultBanner:
      'https://i2.abyss.moe/i/2026/05/29/6a1993a296529.webp',
  },
})
