<script setup lang="ts">
import { Languages, Check, Loader2 } from 'lucide'
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

function choose(code: string) {
  open.value = false
  if (code !== props.current) emit('select', code)
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
  </button>

  <Dialog v-model:open="open" size="sm" title="选择语言">
    <ul class="space-y-1 p-2">
      <li v-for="l in languages" :key="l.language_code">
        <button
          type="button"
          class="group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition"
          :class="l.language_code === current
            ? 'border-slate-900/10 bg-slate-50 ring-1 ring-slate-900/5'
            : 'border-transparent hover:border-slate-200 hover:bg-slate-50'"
          @click="choose(l.language_code)"
        >
          <!-- Language code badge -->
          <span
            class="shrink-0 rounded-lg px-2 py-1 font-mono text-[11px] font-semibold tracking-tight tabular-nums transition"
            :class="l.language_code === current
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'"
          >
            {{ l.language_code }}
          </span>

          <!-- English name + localized title -->
          <span class="min-w-0 flex-1">
            <span class="flex items-center gap-1.5">
              <span class="truncate font-medium text-slate-900">{{ langNameEn(l.language_code) }}</span>
              <span
                v-if="l.is_default"
                class="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium leading-none text-amber-600"
              >
                默认
              </span>
            </span>
            <span class="mt-0.5 block truncate text-xs text-slate-400">{{ l.name }}</span>
          </span>

          <LucideIcon
            v-if="l.language_code === current"
            :icon="Check"
            class="size-4 shrink-0 text-slate-900"
            stroke-width="3"
          />
        </button>
      </li>
    </ul>
  </Dialog>
</template>
