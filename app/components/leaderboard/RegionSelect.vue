<script setup lang="ts">
import { ChevronDown, Check } from 'lucide'

/**
 * Region picker. A styled trigger that opens an anchored, height-capped
 * dropdown of {@link REGIONS}, each rendered with its `RegionFlag` + English
 * name. Closes on select / outside-click / Esc.
 *
 * ```vue
 * <LeaderboardRegionSelect v-model="region" />
 * ```
 */
const model = defineModel<string>({ required: true })

const open = ref(false)
const root = ref<HTMLElement | null>(null)

// Label for the trigger: the selected region's name, falling back to its code.
const selectedName = computed(() => REGIONS.find(r => r.code === model.value)?.name ?? model.value)

function select(code: string) {
  model.value = code
  open.value = false
}

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

function bindGlobals(on: boolean) {
  if (!import.meta.client) return
  if (on) {
    window.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKey)
  } else {
    window.removeEventListener('mousedown', onDocClick)
    window.removeEventListener('keydown', onKey)
  }
}

watch(open, bindGlobals)
onUnmounted(() => bindGlobals(false))
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex w-40 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      @click="open = !open"
    >
      <RegionFlag :country="model" class="shrink-0 text-base" />
      <span class="min-w-0 flex-1 truncate text-left">{{ selectedName }}</span>
      <LucideIcon :icon="ChevronDown" class="size-4 shrink-0 text-slate-400" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute left-0 z-30 mt-1 w-60 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5"
      >
        <ul class="max-h-64 overflow-y-auto py-1">
          <li v-for="r in REGIONS" :key="r.code">
            <button
              type="button"
              class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-slate-50"
              :class="r.code === model ? 'font-semibold text-slate-900' : 'text-slate-600'"
              @click="select(r.code)"
            >
              <RegionFlag :country="r.code" class="text-base" />
              <span class="min-w-0 flex-1 truncate">{{ r.name }}</span>
              <LucideIcon v-if="r.code === model" :icon="Check" class="size-4 shrink-0 text-slate-900" />
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
