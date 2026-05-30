<script setup lang="ts">
import { Gamepad2, Milestone, Trophy, type IconNode } from 'lucide'

defineProps<{ psnid: string }>()

// Tabbed main card. Each tab renders its own content component; add new tabs
// here as their components land.
type TabKey = 'recent' | 'trophies' | 'milestones'
const tabs: { key: TabKey; label: string; icon: IconNode }[] = [
  { key: 'recent', label: '最近玩过', icon: Gamepad2 },
  { key: 'trophies', label: '获得的奖杯', icon: Trophy },
  { key: 'milestones', label: '里程碑', icon: Milestone },
]

// Each tab's content component fetches its data with a top-level `await`, so
// switching tabs suspends until that data lands. The <Suspense> below (see
// template) surfaces a skeleton during the wait.
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

    <!-- Tab content. <Suspense timeout="0"> shows the skeleton fallback the
         moment a tab starts loading its data (timeout 0 = fall back at once
         rather than keeping the previous tab visible). Pagination within a tab
         doesn't re-suspend, so it keeps its list and dims it (per component).
         The surrounding <Transition> fades between skeleton and content. -->
    <Transition name="tab-fade" mode="out-in">
      <Suspense timeout="0">
        <ProfileRecentlyPlayed v-if="activeTab === 'recent'" :psnid="psnid" />
        <ProfileEarnedTrophies v-else-if="activeTab === 'trophies'" :psnid="psnid" />
        <ProfileMilestones v-else :psnid="psnid" />

        <template #fallback>
          <div class="divide-y divide-slate-100">
            <div
              v-for="i in 6"
              :key="i"
              class="flex items-center gap-4 px-4 py-4 sm:px-5"
            >
              <div class="size-14 shrink-0 animate-pulse rounded-lg bg-slate-200" />
              <div class="flex-1 space-y-2.5">
                <div class="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                <div class="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                <div class="h-1.5 w-full animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        </template>
      </Suspense>
    </Transition>
  </div>
</template>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.18s ease;
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}
</style>
