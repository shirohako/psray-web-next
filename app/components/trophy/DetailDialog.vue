<script setup lang="ts">
import { Trophy } from 'lucide'
import type { Trophy as TrophyData } from '~/services/trophies'

const props = defineProps<{
  trophy: TrophyData
  open: boolean
}>()
const emit = defineEmits<{ 'update:open': [v: boolean] }>()

const name = computed(() => props.trophy.localized_name || props.trophy.name)
const detail = computed(() => props.trophy.localized_detail || props.trophy.detail)
const rarity = computed(() => rarityMeta(props.trophy.rarity))
function fmtRate(rate: number | string) {
  const n = Number(rate)
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : '—'
}

const TYPE_LABEL: Record<TrophyData['type'], string> = {
  platinum: '白金',
  gold: '黄金',
  silver: '白银',
  bronze: '青铜',
}
</script>

<template>
  <Dialog :open="open" size="xl" title="奖杯详情" @update:open="emit('update:open', $event)">
    <div class="p-5">
      <!-- Icon + name + tier/rarity -->
      <div class="flex gap-4">
        <div class="relative shrink-0">
          <img :src="trophy.icon_url" :alt="name" class="size-20 rounded-lg object-cover shadow-sm" />
          <span
            class="absolute -bottom-1.5 -right-1.5 grid size-7 place-items-center rounded-full border-2 border-white bg-white shadow-sm"
            :class="trophyTierColor(trophy.type)"
            :title="trophy.type"
          >
            <LucideIcon :icon="Trophy" class="size-4" />
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-slate-900">{{ name }}</h3>
          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {{ TYPE_LABEL[trophy.type] }}
            </span>
            <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="rarity.pill">
              {{ rarity.label }}
            </span>
            <span
              v-if="trophy.is_hidden"
              class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
            >
              隐藏奖杯
            </span>
          </div>
        </div>
      </div>

      <!-- Detail -->
      <p v-if="detail" class="mt-4 text-sm leading-relaxed text-slate-600">{{ detail }}</p>

      <!-- Stats -->
      <dl class="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4 text-sm">
        <div class="flex items-center justify-between gap-2">
          <dt class="text-slate-400">奖杯 ID</dt>
          <dd class="font-semibold tabular-nums text-slate-900">{{ trophy.id }}</dd>
        </div>
        <div class="flex items-center justify-between gap-2">
          <dt class="text-slate-400">留言数</dt>
          <dd class="font-semibold tabular-nums text-slate-900">{{ trophy.tip_count }}</dd>
        </div>
        <div class="flex items-center justify-between gap-2">
          <dt class="text-slate-400">PSN 完成率</dt>
          <dd class="font-semibold tabular-nums text-slate-900">{{ fmtRate(trophy.psn_earned_rate) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-2">
          <dt class="text-slate-400">PSRay 完成率</dt>
          <dd class="font-semibold tabular-nums text-slate-900">{{ fmtRate(trophy.psray_rate) }}</dd>
        </div>
      </dl>
    </div>
  </Dialog>
</template>
