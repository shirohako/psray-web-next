<script setup lang="ts">
import { Globe, Languages, Trophy, Clock, Calendar, RefreshCw, History } from 'lucide'
import type { Profile } from '~/services/profile'

const props = defineProps<{ profile: Profile }>()
const { t } = useI18n()

const syncIntervalText = computed(() => {
  const interval = formatHourInterval(props.profile.sync_interval)
  return interval
    ? t('profile.account.every', { interval })
    : t('profile.account.never')
})

const nextSyncText = computed(() => props.profile.sync_next_at == null
  ? t('profile.account.never')
  : fmtDateTime(props.profile.sync_next_at))
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="mb-4 text-sm font-semibold text-slate-900">{{ $t('profile.account.title') }}</h2>
    <div class="divide-y divide-slate-100 text-sm">
      <dl class="space-y-3 pb-2.5">
        <div class="flex items-center justify-between gap-3">
          <dt class="inline-flex items-center gap-2 text-slate-500">
            <LucideIcon :icon="Globe" class="size-4 text-slate-400" />{{ $t('profile.account.region') }}
          </dt>
          <dd class="inline-flex items-center gap-1.5 font-medium text-slate-900">
            <RegionFlag :country="profile.country" />{{ regionName(profile.country) }}
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="inline-flex items-center gap-2 text-slate-500">
            <LucideIcon :icon="Languages" class="size-4 text-slate-400" />{{ $t('profile.account.language') }}
          </dt>
          <dd class="text-right font-medium text-slate-900">
            {{ formatList(profile.language.map(langLabel)) || '—' }}
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="inline-flex items-center gap-2 text-slate-500">
            <LucideIcon :icon="Calendar" class="size-4 text-slate-400" />{{ $t('profile.account.joined') }}
          </dt>
          <dd class="text-right font-mono font-medium text-slate-900">{{ fmtDateTime(profile.registered_at) }}</dd>
        </div>
      </dl>

      <dl class="space-y-3 py-2.5">
        <div class="flex items-center justify-between gap-3">
          <dt class="inline-flex items-center gap-2 text-slate-500">
            <LucideIcon :icon="Trophy" class="size-4 text-slate-400" />{{ $t('profile.account.firstTrophy') }}
          </dt>
          <dd class="text-right font-mono font-medium text-slate-900">{{ fmtDateTime(profile.first_trophy_at) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="inline-flex items-center gap-2 text-slate-500">
            <LucideIcon :icon="Clock" class="size-4 text-slate-400" />{{ $t('profile.account.lastTrophy') }}
          </dt>
          <dd class="text-right font-mono font-medium text-slate-900">{{ fmtDateTime(profile.last_trophy_at) }}</dd>
        </div>
      </dl>

      <dl class="space-y-3 pt-2.5">
        <div class="flex items-center justify-between gap-3">
          <dt class="inline-flex items-center gap-2 text-slate-500">
            <LucideIcon :icon="RefreshCw" class="size-4 text-slate-400" />{{ $t('profile.account.syncInterval') }}
          </dt>
          <dd class="text-right font-medium text-slate-900">{{ syncIntervalText }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="inline-flex items-center gap-2 text-slate-500">
            <LucideIcon :icon="History" class="size-4 text-slate-400" />{{ $t('profile.account.lastSync') }}
          </dt>
          <dd class="text-right font-mono font-medium text-slate-900">{{ fmtDateTime(profile.updated_at) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="inline-flex items-center gap-2 text-slate-500">
            <LucideIcon :icon="Clock" class="size-4 text-slate-400" />{{ $t('profile.account.nextSync') }}
          </dt>
          <dd class="text-right font-mono font-medium text-slate-900">{{ nextSyncText }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>
