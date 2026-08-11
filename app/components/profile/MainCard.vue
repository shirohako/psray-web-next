<script setup lang="ts">
import { Check, ChevronDown, Gamepad2, Milestone, Trophy, type IconNode } from 'lucide'

const props = defineProps<{ psnid: string }>()

// Tabbed main card. Each tab renders its own content component; add new tabs
// here as their components land.
type TabKey = 'recent' | 'trophies' | 'milestones'
const tabs: { key: TabKey; labelKey: string; icon: IconNode }[] = [
  { key: 'recent', labelKey: 'profile.tabs.recent', icon: Gamepad2 },
  { key: 'trophies', labelKey: 'profile.tabs.trophies', icon: Trophy },
  { key: 'milestones', labelKey: 'profile.tabs.milestones', icon: Milestone },
]
type TabItem = (typeof tabs)[number]

// Each tab's content component fetches its data with a top-level `await`, so
// switching tabs suspends until that data lands. The <Suspense> below (see
// template) surfaces a skeleton during the wait.
const activeTab = ref<TabKey>('recent')
const defaultTab = tabs[0] as TabItem
const activeTabItem = computed<TabItem>(() => tabs.find(tab => tab.key === activeTab.value) ?? defaultTab)
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
    <!-- Tab bar -->
    <div class="border-b border-slate-200 px-3 py-2.5 sm:hidden">
      <DropdownMenu
        align="left"
        panel-class="!w-[calc(100vw-3.5rem)] !min-w-0 !rounded-lg !border-slate-200 !py-1.5 !shadow-xl !shadow-slate-900/10"
        class="inline-flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm shadow-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span class="inline-flex min-w-0 items-center gap-2">
          <LucideIcon :icon="activeTabItem.icon" class="size-4 shrink-0 text-slate-500" stroke-width="2" />
          <span class="truncate">{{ $t(activeTabItem.labelKey) }}</span>
        </span>
        <LucideIcon :icon="ChevronDown" class="size-4 shrink-0 text-slate-400" />

        <template #menu="{ close }">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium transition"
            :class="activeTab === tab.key
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
            @click="activeTab = tab.key; close()"
          >
            <LucideIcon
              :icon="tab.icon"
              class="size-4 shrink-0"
              :class="activeTab === tab.key ? 'text-slate-700' : 'text-slate-400'"
              stroke-width="2"
            />
            <span class="min-w-0 flex-1">{{ $t(tab.labelKey) }}</span>
            <LucideIcon
              v-if="activeTab === tab.key"
              :icon="Check"
              class="size-4 shrink-0 text-slate-500"
              stroke-width="2"
            />
          </button>
        </template>
      </DropdownMenu>
    </div>

    <div class="hidden gap-1 border-b border-slate-200 px-5 py-2.5 sm:flex">
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
        <LucideIcon :icon="tab.icon" class="size-4 shrink-0" stroke-width="2" />
        {{ $t(tab.labelKey) }}
      </button>
    </div>

    <!-- Tab content. <Suspense timeout="0"> shows the skeleton fallback the
         moment a tab starts loading its data (timeout 0 = fall back at once
         rather than keeping the previous tab visible). Pagination within a tab
         doesn't re-suspend, so it keeps its list and dims it (per component).
         The surrounding <Transition> fades between skeleton and content. -->
    <Transition name="tab-fade" mode="out-in">
      <Suspense timeout="0">
        <ProfileRecentlyPlayed v-if="activeTab === 'recent'" :psnid="props.psnid" />
        <ProfileEarnedTrophies v-else-if="activeTab === 'trophies'" :psnid="props.psnid" />
        <ProfileMilestones v-else :psnid="props.psnid" />

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
