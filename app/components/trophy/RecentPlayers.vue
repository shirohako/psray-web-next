<script setup lang="ts">
import { Trophy, ChevronRight } from 'lucide'
import type { RecentPlayer } from '~/services/trophies'

defineProps<{ players: RecentPlayer[] }>()
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
    <h2 class="border-b border-slate-100 px-5 py-3.5 text-sm font-semibold text-slate-900">最近玩家</h2>

    <p v-if="!players.length" class="px-5 py-10 text-center text-sm text-slate-400">
      还没有玩家记录。
    </p>

    <ul v-else class="divide-y divide-slate-100">
      <li v-for="p in players" :key="p.psnid">
        <NuxtLink :to="`/p/${p.psnid}`" class="group flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50">
          <img :src="p.avatar_url" :alt="p.psnid" class="size-10 shrink-0 rounded-full bg-slate-100 object-cover" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="min-w-0 truncate text-sm font-semibold text-slate-900 group-hover:text-slate-700">{{ p.psnid }}</span>
              <LucideIcon v-if="p.earned_platinum > 0" :icon="Trophy" class="size-3.5 shrink-0 text-cyan-500" title="已获白金" />
            </div>
            <div class="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span>{{ formatRegion(p.country) }}</span>
              <span>·</span>
              <span>{{ fromNow(p.last_updated_at) }}</span>
            </div>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full"
                :class="p.progress === 100 ? 'bg-cyan-400' : 'bg-slate-900'"
                :style="{ width: `${p.progress}%` }"
              />
            </div>
          </div>
          <span class="w-9 shrink-0 text-right text-xs font-semibold text-slate-600">{{ p.progress }}%</span>
        </NuxtLink>
      </li>
    </ul>

    <div v-if="players.length" class="border-t border-slate-100 p-2">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
      >
        查看更多
        <LucideIcon :icon="ChevronRight" class="size-4" />
      </button>
    </div>
  </div>
</template>
