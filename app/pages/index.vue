<script setup lang="ts">
import { Megaphone, Search, RefreshCw } from 'lucide'

const psnid = ref('')

function goToProfile() {
  const id = psnid.value.trim()
  if (!id) return
  navigateTo(`/p/${encodeURIComponent(id)}`)
}

function goToSync() {
  const id = psnid.value.trim()
  if (!id) return
  navigateTo(`/sync?psnid=${encodeURIComponent(id)}`)
}

const { t } = useI18n()

useSeo({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <!-- Announcement (English) -->
    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex items-start gap-3.5">
        <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-900 text-white">
          <LucideIcon :icon="Megaphone" class="size-5" />
        </span>
        <div>
          <h2 class="text-base font-semibold text-slate-900">A new PSRay is on the way</h2>
          <p class="mt-1.5 text-sm leading-relaxed text-slate-500">
            PSRay is being rebuilt with a cleaner foundation and a better long-term experience.
            Features will return gradually during the transition, and your historical data will
            remain intact. Thank you for sticking with us while we bring the new site online.
          </p>
        </div>
      </div>
    </section>

    <!-- Profile lookup -->
    <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 class="text-base font-semibold text-slate-900">{{ $t('home.lookup.heading') }}</h2>
      <p class="mt-1 text-sm text-slate-500">{{ $t('home.lookup.hint') }}</p>

      <form class="mt-4 flex flex-col gap-2 sm:flex-row" @submit.prevent="goToProfile">
        <div class="relative flex-1">
          <LucideIcon
            :icon="Search"
            class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />
          <input
            v-model="psnid"
            type="text"
            class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
        </div>
        <div class="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <button
            type="submit"
            :disabled="!psnid.trim()"
            class="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/30 transition hover:bg-slate-800 active:bg-slate-950 disabled:opacity-40 disabled:hover:bg-slate-900 sm:shrink-0"
          >
            <LucideIcon :icon="Search" class="size-4" />
            {{ $t('home.lookup.view') }}
          </button>
          <button
            type="button"
            :disabled="!psnid.trim()"
            @click="goToSync"
            class="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white sm:shrink-0"
          >
            <LucideIcon :icon="RefreshCw" class="size-4" />
            {{ $t('home.lookup.sync') }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
