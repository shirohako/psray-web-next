<script setup lang="ts">
import { ThumbsUp, ThumbsDown, EyeOff } from 'lucide'
import type { TrophyTip } from '~/services/trophies'

/**
 * A single trophy tip: author, body (HTML/Markdown via {@link RichContent}),
 * tags and votes. Spoiler tips stay masked behind a reveal button until the
 * reader opts in.
 */
const props = defineProps<{ tip: TrophyTip }>()

const tagList = computed(() =>
  props.tip.tags ? props.tip.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
)

const revealed = ref(false)
const masked = computed(() => props.tip.spoiler === 1 && !revealed.value)
</script>

<template>
  <article class="flex gap-3 px-5 py-4">
    <NuxtLink :to="`/p/${tip.user.psnid}`" class="shrink-0">
      <img :src="tip.user.avatar_url" :alt="tip.user.psnid" class="size-9 rounded-full bg-slate-100 object-cover" />
    </NuxtLink>

    <div class="min-w-0 flex-1">
      <!-- Author -->
      <div class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <RegionFlag :country="tip.user.country" class="text-xs" />
        <NuxtLink
          :to="`/p/${tip.user.psnid}`"
          class="truncate text-sm font-semibold text-slate-900 transition hover:text-slate-600"
        >
          {{ tip.user.psnid }}
        </NuxtLink>
        <span class="rounded bg-slate-100 px-1.5 text-[11px] font-semibold tabular-nums text-slate-500">
          Lv {{ tip.user.trophy_level }}
        </span>
      </div>

      <!-- Body (masked when it contains spoilers) -->
      <button
        v-if="masked"
        type="button"
        class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-4 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        @click="revealed = true"
      >
        <LucideIcon :icon="EyeOff" class="size-4" />
        包含剧透，点击显示
      </button>
      <RichContent v-else class="mt-1.5" :content="tip.content" :format="tip.content_type" />

      <!-- Meta + tags + votes -->
      <div class="mt-2.5 flex items-center gap-x-2 gap-y-1 text-xs text-slate-400">
        <span class="tabular-nums">{{ fmtDateTime(tip.created_at) }}</span>
        <span class="text-slate-300">·</span>
        <span>{{ langLabel(tip.language) }}</span>

        <div v-if="tagList.length" class="flex flex-wrap items-center gap-1">
          <span
            v-for="t in tagList"
            :key="t"
            class="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500"
          >#{{ t }}</span>
        </div>

        <div class="ml-auto flex shrink-0 items-center gap-3 font-medium">
          <span class="inline-flex items-center gap-1">
            <LucideIcon :icon="ThumbsUp" class="size-3.5" />
            <span class="tabular-nums">{{ tip.vote_up }}</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <LucideIcon :icon="ThumbsDown" class="size-3.5" />
            <span class="tabular-nums">{{ tip.vote_down }}</span>
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
