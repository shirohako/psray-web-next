<script setup lang="ts">
import {
  ChevronDown, Loader2, PawPrint, RefreshCw, UserCheck, UserMinus, UserPlus,
} from 'lucide'
import type { Profile } from '~/services/profile'

/**
 * Sync + follow actions overlaid at the banner's bottom-right (needs a
 * `relative` banner parent). On mobile they collapse into a single "interact"
 * dropdown; on sm+ they render inline. Follow / unfollow only appear when the
 * viewer can actually follow (`profile.can_follow`).
 */
defineProps<{ profile: Profile, followPending?: boolean }>()
defineEmits<{ toggleFollow: [] }>()

const actionButtonBase =
  'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-white/20 px-3 text-xs font-semibold leading-none shadow-sm shadow-slate-950/20 backdrop-blur transition sm:h-9 sm:px-4 sm:text-sm'
</script>

<template>
  <div class="absolute bottom-4 right-4 z-20 flex items-center gap-2">
    <!-- Mobile: everything behind a single "interact" dropdown -->
    <DropdownMenu
      align="right"
      panel-class="!min-w-36 !rounded-lg !py-1"
      :class="[actionButtonBase, 'h-9! gap-2! px-4! text-sm! cursor-pointer bg-zinc-900/90 text-white hover:bg-zinc-950 sm:hidden']"
    >
      <LucideIcon :icon="PawPrint" class="size-4" />
      {{ $t('profile.actions.interact') }}
      <LucideIcon :icon="ChevronDown" class="size-3.5 text-zinc-400" />

      <template #menu="{ close }">
        <NuxtLink
          :to="{ path: '/sync', query: { psnid: profile.psnid } }"
          class="flex w-full items-center gap-2 px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          @click="close"
        >
          <LucideIcon :icon="RefreshCw" class="size-3.5 text-slate-400" />
          {{ $t('profile.actions.sync') }}
        </NuxtLink>

        <!-- Follow/unfollow only when the viewer can actually follow. -->
        <template v-if="profile.can_follow">
          <div class="mx-2 my-0.5 border-t border-slate-100" />

          <button
            v-if="profile.is_following"
            type="button"
            role="menuitem"
            :disabled="followPending"
            class="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
            @click="$emit('toggleFollow'); close()"
          >
            <LucideIcon :icon="UserMinus" class="size-3.5 text-rose-500" />
            {{ $t('profile.actions.unfollow') }}
          </button>

          <button
            v-else
            type="button"
            role="menuitem"
            :disabled="followPending"
            class="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60"
            @click="$emit('toggleFollow'); close()"
          >
            <LucideIcon
              :icon="followPending ? Loader2 : UserPlus"
              class="size-3.5 text-slate-400"
              :class="followPending && 'animate-spin'"
            />
            {{ $t('profile.actions.follow') }}
          </button>
        </template>
      </template>
    </DropdownMenu>

    <!-- sm+: inline buttons -->
    <div class="hidden items-center gap-2 sm:flex">
      <NuxtLink
        :to="{ path: '/sync', query: { psnid: profile.psnid } }"
        :class="[actionButtonBase, 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900']"
      >
        <LucideIcon :icon="RefreshCw" class="size-4" />
        {{ $t('profile.actions.sync') }}
      </NuxtLink>

      <!-- Follow/unfollow only when the viewer can actually follow. -->
      <template v-if="profile.can_follow">
        <!-- Following: a menu trigger; "unfollow" lives in the dropdown. -->
        <DropdownMenu
          v-if="profile.is_following"
          align="right"
          panel-class="!min-w-32"
          :class="[actionButtonBase, 'cursor-pointer bg-zinc-900/90 text-white hover:bg-zinc-950']"
        >
          <LucideIcon
            :icon="followPending ? Loader2 : UserCheck"
            class="size-4"
            :class="followPending && 'animate-spin'"
          />
          {{ $t('profile.actions.following') }}
          <LucideIcon :icon="ChevronDown" class="size-3.5 text-zinc-400" />
          <template #menu="{ close }">
            <button
              type="button"
              role="menuitem"
              :disabled="followPending"
              class="flex w-full items-center gap-2 px-3 py-2 text-left text-zinc-700 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
              @click="$emit('toggleFollow'); close()"
            >
              <LucideIcon :icon="UserMinus" class="size-4 text-rose-500" />
              {{ $t('profile.actions.unfollow') }}
            </button>
          </template>
        </DropdownMenu>

        <!-- Not following: call-to-action. -->
        <button
          v-else
          type="button"
          :disabled="followPending"
          :class="[actionButtonBase, 'bg-zinc-900/90 text-white hover:bg-zinc-950 active:bg-zinc-950 disabled:opacity-60']"
          @click="$emit('toggleFollow')"
        >
          <LucideIcon
            :icon="followPending ? Loader2 : UserPlus"
            class="size-4"
            :class="followPending && 'animate-spin'"
          />
          {{ $t('profile.actions.follow') }}
        </button>
      </template>
    </div>
  </div>
</template>
