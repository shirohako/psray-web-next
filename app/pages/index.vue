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

useHead({ title: 'PSRay' })
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
    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-base font-semibold text-slate-900">查看个人资料</h2>
      <p class="mt-1 text-sm text-slate-500">输入 PSN ID 进入对应的个人资料页面。</p>

      <form class="mt-4 flex gap-2" @submit.prevent="goToProfile">
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
        <button
          type="submit"
          :disabled="!psnid.trim()"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/30 transition hover:bg-slate-800 active:bg-slate-950 disabled:opacity-40 disabled:hover:bg-slate-900"
        >
          <LucideIcon :icon="Search" class="size-4" />
          查看
        </button>
        <button
          type="button"
          :disabled="!psnid.trim()"
          @click="goToSync"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white"
        >
          <LucideIcon :icon="RefreshCw" class="size-4" />
          同步
        </button>
      </form>
    </section>
  </div>
</template>
