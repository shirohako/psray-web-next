<script setup lang="ts">
import { Trophy } from 'lucide'
</script>

<template>
  <div class="grid place-items-center px-6 py-20 text-center">
    <div class="space-y-2">
      <div class="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
        <LucideIcon :icon="Trophy" class="size-6" />
      </div>
      <p class="text-sm text-slate-500">{{ $t('profile.log.comingSoon') }}</p>
    </div>
  </div>
</template>
