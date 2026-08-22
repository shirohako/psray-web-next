/** Request-scoped translation access for renderer and text transform helpers. */
export function tr(key: string, named?: Record<string, unknown>): string {
  try {
    const { t } = useNuxtApp().$i18n
    return named ? t(key, named) : t(key)
  }
  catch {
    return key
  }
}
