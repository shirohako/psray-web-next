<script setup lang="ts">
import { ShieldCheck, User } from 'lucide'

/** Step 2 — verify that the PSN ID is eligible before collecting account details. */
defineProps<{ psnidError?: string }>()
const psnid = defineModel<string>('psnid', { required: true })

const requirements = [
  '已在站内至少同步过一次。',
  'PSN 奖杯等级大于 100。',
  'PSN 游戏资料隐私设置为公开。',
]
</script>

<template>
  <div class="space-y-5">
    <AuthField
      v-model="psnid"
      label="PSN ID"
      type="text"
      :icon="User"
      placeholder="你的 PlayStation Network ID"
      autocomplete="username"
      :error="psnidError"
    />

    <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <LucideIcon :icon="ShieldCheck" class="size-4 text-slate-500" />
        新用户需要满足
      </div>
      <p class="mb-3 text-xs leading-relaxed text-slate-400">
        我们希望过滤掉垃圾账户，创造一个真正属于玩家的聚集地。
      </p>
      <ul class="space-y-1.5 text-xs leading-relaxed text-slate-500">
        <li v-for="item in requirements" :key="item" class="flex gap-2">
          <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-300" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
