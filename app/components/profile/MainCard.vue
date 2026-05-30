<script setup lang="ts">
import { Gamepad2, Milestone, type IconNode } from 'lucide'

defineProps<{ psnid: string }>()

// Tabbed main card. Each tab renders its own content component; add new tabs
// here as their components land.
type TabKey = 'recent' | 'milestones'
const tabs: { key: TabKey; label: string; icon: IconNode }[] = [
  { key: 'recent', label: '最近玩过', icon: Gamepad2 },
  { key: 'milestones', label: '里程碑', icon: Milestone },
]
const activeTab = ref<TabKey>('recent')
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
    <!-- Tab bar -->
    <div class="flex gap-1 border-b border-slate-200 px-4 py-2.5 sm:px-5">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        @click="activeTab = tab.key"
        class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition"
        :class="activeTab === tab.key
          ? 'bg-slate-900 text-white'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'"
      >
        <LucideIcon :icon="tab.icon" class="size-4" stroke-width="2" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab content -->
    <ProfileRecentlyPlayed v-if="activeTab === 'recent'" :psnid="psnid" />
    <ProfileMilestones v-else-if="activeTab === 'milestones'" :psnid="psnid" />
  </div>
</template>
