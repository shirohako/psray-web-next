<script setup lang="ts">
import { Gamepad2, type IconNode } from 'lucide'

defineProps<{ psnid: string }>()

// Tabbed main card. Each tab renders its own content component; add new tabs
// here as their components land (奖杯墙 / 游戏评测 …).
type TabKey = 'recent'
const tabs: { key: TabKey; label: string; icon: IconNode }[] = [
  { key: 'recent', label: '最近玩过', icon: Gamepad2 },
]
const activeTab = ref<TabKey>('recent')
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
    <!-- Tab bar -->
    <div class="flex gap-1 border-b border-slate-200 px-2 sm:px-4">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        @click="activeTab = tab.key"
        class="-mb-px flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition sm:px-4"
        :class="activeTab === tab.key
          ? 'border-slate-900 text-slate-900'
          : 'border-transparent text-slate-500 hover:text-slate-800'"
      >
        <LucideIcon :icon="tab.icon" class="size-4" stroke-width="1.75" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab content -->
    <ProfileRecentlyPlayed v-if="activeTab === 'recent'" :psnid="psnid" />
  </div>
</template>
