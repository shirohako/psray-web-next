<script setup lang="ts">
import { ChevronRight, MessageSquare } from 'lucide'
import type { ProfileRecentTip } from '~/types/tip'
import { hasTipTrophy } from '~/utils/tip'

const props = defineProps<{
  psnid: string
  tipCount: number
  tips: ProfileRecentTip[]
}>()

const dialogOpen = ref(false)
const recentTips = computed(() => props.tips.filter(hasTipTrophy))
</script>

<template>
  <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <header class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <h2 class="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900">
        <LucideIcon :icon="MessageSquare" class="size-4 shrink-0 text-slate-500" />
        {{ $t('profile.tips.title') }}
      </h2>
      <button
        v-if="tipCount > 0"
        type="button"
        class="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
        @click="dialogOpen = true"
      >
        {{ $t('profile.tips.viewAll') }}
        <LucideIcon :icon="ChevronRight" class="size-3.5" />
      </button>
    </header>

    <p v-if="!recentTips.length" class="px-4 py-8 text-center text-xs text-slate-400">
      {{ $t('profile.tips.empty') }}
    </p>

    <div v-else class="divide-y divide-slate-100">
      <ProfileTipItem v-for="tip in recentTips" :key="tip.id" :tip="tip" compact />
    </div>
  </section>

  <ProfileTipsDialog :psnid="psnid" v-model:open="dialogOpen" />
</template>
