<script setup lang="ts">
import { Lock } from 'lucide'

// Empty-state shown when a PSN profile is private: its trophy data can't be
// displayed (profile page) or synced (sync page). Title is overridable; the
// default slot holds the description so callers can tailor the wording.
const props = withDefaults(defineProps<{ title?: string }>(), { title: '' })
const { t } = useI18n()

const resolvedTitle = computed(() => props.title || t('profile.private.title'))
</script>

<template>
  <div class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-linear-to-b from-slate-50 to-transparent px-6 py-9 text-center">
    <div class="grid size-12 place-items-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-100">
      <LucideIcon :icon="Lock" class="size-5" />
    </div>
    <div class="space-y-1">
      <p class="text-sm font-semibold text-slate-900">{{ resolvedTitle }}</p>
      <p class="text-xs leading-relaxed text-slate-500">
        <slot>
          {{ $t('profile.private.line1') }}<br>
          {{ $t('profile.private.line2') }}
        </slot>
      </p>
    </div>
  </div>
</template>
