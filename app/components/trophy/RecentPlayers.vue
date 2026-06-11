<script setup lang="ts">
import { Trophy, ChevronRight } from 'lucide'
import type { RecentPlayer } from '~/services/trophies'

defineProps<{ id: number | string; players: RecentPlayer[] }>()

const dialogOpen = ref(false)
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
    <h2 class="border-b border-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900">最近玩家</h2>

    <p v-if="!players.length" class="px-4 py-8 text-center text-sm text-slate-400">
      还没有玩家记录。
    </p>

    <ul v-else class="divide-y divide-slate-100">
      <li v-for="p in players" :key="p.psnid">
        <NuxtLink :to="`/p/${p.psnid}`" class="group flex items-center gap-2.5 px-4 py-2.5 transition hover:bg-slate-50">
          <img :src="p.avatar_url" :alt="p.psnid" class="size-8 shrink-0 rounded-full bg-slate-100 object-cover" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 leading-none">
              <RegionFlag :country="p.country" class="text-xs" />
              <span class="min-w-0 truncate text-sm font-semibold leading-none text-slate-900 group-hover:text-slate-700">{{ p.psnid }}</span>
              <LucideIcon v-if="p.earned_platinum > 0" :icon="Trophy" class="size-3.5 shrink-0 text-cyan-500" title="已获白金" />
            </div>
            <div class="mt-1 text-xs text-slate-400 tabular-nums">
              {{ fmtDateTime(p.last_earned_at) }}
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-1.5">
            <div class="h-1 w-10 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full"
                :class="p.progress === 100 ? 'bg-cyan-400' : 'bg-slate-900'"
                :style="{ width: `${p.progress}%` }"
              />
            </div>
            <span class="w-9 text-right text-xs font-semibold text-slate-600 tabular-nums">{{ p.progress }}%</span>
          </div>
        </NuxtLink>
      </li>
    </ul>

    <div v-if="players.length" class="border-t border-slate-100 p-1.5">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        @click="dialogOpen = true"
      >
        查看更多
        <LucideIcon :icon="ChevronRight" class="size-4" />
      </button>
    </div>

    <TrophyPlayersDialog :id="id" v-model:open="dialogOpen" />
  </div>
</template>
