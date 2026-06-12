<script setup lang="ts">
import { Languages, Check, Loader2, ChevronDown, Tag } from 'lucide'
import type { AvailableLanguage } from '~/services/trophies'

const props = defineProps<{
  /** Every language the set can be displayed in. */
  languages: AvailableLanguage[]
  /** Currently displayed `language_code`. */
  current: string
  /** True while a switch request is in flight. */
  loading?: boolean
}>()

const emit = defineEmits<{ select: [code: string] }>()

const open = ref(false)
// The row the user just tapped — keeps the sheet open with a spinner on it
// until the parent finishes fetching, then we close.
const pendingCode = ref('')

function choose(code: string) {
  if (props.loading) return
  if (code === props.current) {
    open.value = false
    return
  }
  pendingCode.value = code
  emit('select', code)
}

// Close once the switch settles (loading true → false).
watch(() => props.loading, (now, was) => {
  if (was && !now) open.value = false
})

// Drop stale pending state whenever the sheet is closed.
watch(open, (v) => {
  if (!v) pendingCode.value = ''
})

function isActive(code: string) {
  return code === pendingCode.value || (!pendingCode.value && code === props.current)
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-900 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
    :disabled="loading"
    @click="open = true"
  >
    <LucideIcon :icon="loading ? Loader2 : Languages" class="size-4 text-slate-400" :class="{ 'animate-spin': loading }" />
    <span>{{ langNameEn(current) }}</span>
    <LucideIcon :icon="ChevronDown" class="size-3.5 text-slate-400" />
  </button>

  <Dialog v-model:open="open" size="md">
    <template #title>
      <span class="inline-flex items-center gap-2">
        <span class="grid size-7 place-items-center rounded-lg bg-slate-100 text-slate-600">
          <LucideIcon :icon="Languages" class="size-4" />
        </span>
        选择显示语言
      </span>
    </template>

    <p class="px-5 pb-1 pt-1 text-xs text-slate-400">
      选择奖杯名称与描述的显示语言。
    </p>

    <ul class="space-y-0.5 p-2 pt-1">
      <li v-for="l in languages" :key="l.language_code">
        <button
          type="button"
          :disabled="loading"
          class="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition duration-200"
          :class="isActive(l.language_code)
            ? 'bg-slate-900/4 ring-1 ring-inset ring-slate-900/10'
            : loading
              ? 'cursor-default opacity-40'
              : 'hover:bg-slate-50'"
          @click="choose(l.language_code)"
        >
          <!-- Leading status: spinner while switching, filled check when active,
               blank (aligned) placeholder otherwise. -->
          <LucideIcon
            v-if="pendingCode === l.language_code"
            :icon="Loader2"
            class="size-5 shrink-0 animate-spin text-slate-500"
          />
          <span
            v-else-if="isActive(l.language_code)"
            class="grid size-5 shrink-0 place-items-center rounded-full bg-slate-900 text-white"
          >
            <LucideIcon :icon="Check" class="size-3" stroke-width="3.5" />
          </span>
          <span v-else class="size-5 shrink-0" />

          <!-- Name (with default tag) + code · localized title meta -->
          <span class="min-w-0 flex-1">
            <span class="flex items-center gap-1.5">
              <span class="truncate text-sm font-semibold text-slate-900">{{ langNameEn(l.language_code) }}</span>
              <span
                v-if="l.is_default"
                class="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium leading-none text-amber-600"
              >
                默认
              </span>
            </span>
            <span class="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span class="inline-flex shrink-0 items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none text-slate-500">
                <LucideIcon :icon="Tag" class="size-3" />
                {{ l.language_code.toLowerCase() }}
              </span>
              <span class="truncate">{{ l.name }}</span>
            </span>
          </span>
        </button>
      </li>
    </ul>
  </Dialog>
</template>
