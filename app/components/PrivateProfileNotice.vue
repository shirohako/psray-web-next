<script setup lang="ts">
import { Lock } from 'lucide'

// Empty-state shown when a PSN profile is private: its trophy data can't be
// displayed (profile page) or synced (sync page). Title is overridable; the
// default slot holds the description so callers can tailor the wording.
withDefaults(defineProps<{ title?: string }>(), {
  title: '这是一个非公开的账户',
})
</script>

<template>
  <div class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-linear-to-b from-slate-50 to-transparent px-6 py-9 text-center">
    <div class="grid size-12 place-items-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-100">
      <LucideIcon :icon="Lock" class="size-5" />
    </div>
    <div class="space-y-1">
      <p class="text-sm font-semibold text-slate-900">{{ title }}</p>
      <p class="text-xs leading-relaxed text-slate-500">
        <slot>
          该用户的奖杯资料为私密，无法展示详细信息。<br>
          可在 PlayStation 隐私设置中更改此设定。
        </slot>
      </p>
    </div>
  </div>
</template>
