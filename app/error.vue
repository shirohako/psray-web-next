<script setup lang="ts">
import { House, XCircle } from 'lucide'
import type { NuxtError } from '#app'

/**
 * Full-page error boundary. Pages that can legitimately 404 (`/p/:psnid`,
 * `/trophies/:id`) `throw createError(...)` so crawlers see a real status code
 * instead of a "not found" card served at HTTP 200.
 *
 * `<html lang>` comes from `app.vue`, which wraps this too, so the copy below
 * renders in the visitor's locale.
 */
const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()

const isNotFound = computed(() => props.error.statusCode === 404)
const messageKey = computed(() => (isNotFound.value ? 'errors.notFound' : 'errors.generic'))

useSeoMeta({
  title: () => `${t(`${messageKey.value}.title`)} | PSRay`,
  robots: 'noindex, follow',
})

// `clearError` unmounts this component and navigates, so the app recovers
// without a full reload.
const goHome = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-800">
    <div class="space-y-3 text-center">
      <div class="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 text-rose-500">
        <LucideIcon :icon="XCircle" class="size-7" />
      </div>
      <p class="text-sm font-semibold tabular-nums text-slate-400">{{ error.statusCode }}</p>
      <h1 class="text-lg font-semibold text-slate-900">{{ $t(`${messageKey}.title`) }}</h1>
      <p class="text-sm text-slate-500">{{ $t(`${messageKey}.description`) }}</p>
      <button
        type="button"
        class="mx-auto inline-flex cursor-pointer items-center gap-1.5 pt-2 text-sm font-medium text-slate-900 transition hover:text-slate-700"
        @click="goHome"
      >
        <LucideIcon :icon="House" class="size-4" />
        {{ $t('common.backHome') }}
      </button>
    </div>
  </div>
</template>
