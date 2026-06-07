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
  /**
   * Auth pages (`/login`, `/register`). The two-column layout shows this image
   * with a frosted-glass quote panel on the left, and the form on the right.
   *
   * Extend freely — e.g. add `image` per-page, an array of rotating images,
   * social-login toggles, etc. Everything here is public, client-safe branding.
   */
  auth: {
    /** Background image for the left showcase panel. */
    image: 'https://i2.abyss.moe/i/2026/06/07/6a24c0096dc63.jpg',
    /** One is picked at random on each page load for the glass panel. */
    quotes: [
      { text: 'この世に奇跡なんて無い。あるのは偶然と必然、そして誰が何をするかだけ。', author: '火村夕' },
    ] as { text: string; author: string }[],
  },
})
