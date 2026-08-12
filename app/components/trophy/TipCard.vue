<script setup lang="ts">
import { AlertTriangle, ThumbsUp, ThumbsDown, EyeOff } from 'lucide'
import { useTips } from '~/services/tips'
import type { TrophyTip } from '~/types/tip'
import { ApiError } from '~/utils/ApiError'

/**
 * A single trophy tip: author, body (HTML/Markdown via {@link RichContent}),
 * metadata and votes. Spoiler tips stay masked behind a reveal button until the
 * reader opts in.
 */
const props = defineProps<{ tip: TrophyTip }>()

const route = useRoute()
const { t } = useI18n()
const { loggedIn } = useAuth()
const { vote, removeVote } = useTips()
const toast = useToast()
const revealed = ref(false)
const masked = computed(() => props.tip.has_spoiler && !revealed.value)
const edited = computed(() => isTipEdited(props.tip))
const viewerVote = ref(props.tip.viewer_vote)
const voteUpCount = ref(props.tip.vote_up_count)
const voteDownCount = ref(props.tip.vote_down_count)
const votePending = ref(false)

watch(() => props.tip.viewer_vote, value => { viewerVote.value = value })
watch(() => props.tip.vote_up_count, value => { voteUpCount.value = value })
watch(() => props.tip.vote_down_count, value => { voteDownCount.value = value })

function applyVote(next: 1 | -1 | null) {
  if (viewerVote.value === 1) voteUpCount.value = Math.max(0, voteUpCount.value - 1)
  if (viewerVote.value === -1) voteDownCount.value = Math.max(0, voteDownCount.value - 1)
  if (next === 1) voteUpCount.value += 1
  if (next === -1) voteDownCount.value += 1
  viewerVote.value = next
}

async function evaluate(choice: 1 | -1) {
  if (!loggedIn.value) {
    await navigateTo({ path: '/auth/login', query: { redirect: route.fullPath } })
    return
  }
  if (!props.tip.can_vote || votePending.value) return

  const previousVote = viewerVote.value
  const previousUp = voteUpCount.value
  const previousDown = voteDownCount.value
  const nextVote = previousVote === choice ? null : choice
  applyVote(nextVote)
  votePending.value = true

  try {
    if (nextVote === null) await removeVote(props.tip.id)
    else await vote(props.tip.id, nextVote)
  }
  catch (error) {
    viewerVote.value = previousVote
    voteUpCount.value = previousUp
    voteDownCount.value = previousDown
    toast.error({
      title: t('trophy.tips.voteFailed'),
      description: error instanceof ApiError ? error.message : undefined,
    })
  }
  finally {
    votePending.value = false
  }
}
</script>

<template>
  <article class="flex gap-3 px-5 py-4">
    <NuxtLink :to="`/p/${tip.user.psnid}`" class="shrink-0">
      <img v-if="tip.user.avatar_url" :src="tip.user.avatar_url" :alt="tip.user.psnid" class="size-9 rounded-full bg-slate-100 object-cover" />
      <span v-else class="grid size-9 place-items-center rounded-full bg-slate-100 text-sm font-bold uppercase text-slate-500">
        {{ tip.user.psnid.slice(0, 1) }}
      </span>
    </NuxtLink>

    <div class="min-w-0 flex-1">
      <!-- Author -->
      <div class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <RegionFlag v-if="tip.user.country" :country="tip.user.country" class="text-xs" />
        <NuxtLink
          :to="`/p/${tip.user.psnid}`"
          class="truncate text-sm font-semibold text-slate-900 transition hover:text-slate-600"
        >
          {{ tip.user.psnid }}
        </NuxtLink>
        <span v-if="tip.user.trophy_level != null" class="rounded bg-slate-100 px-1.5 text-[11px] font-semibold tabular-nums text-slate-500">
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
        {{ $t('trophy.tips.spoiler') }}
      </button>
      <RichContent v-else class="mt-1.5" :content="tip.content" :format="tip.content_type" />

      <!-- Meta + helpfulness totals -->
      <div class="mt-2.5 flex flex-col items-start gap-1.5 text-xs text-slate-400 sm:flex-row sm:items-center sm:gap-2">
        <div class="flex flex-wrap items-center gap-1.5">
          <time :datetime="tip.updated_at" class="whitespace-nowrap tabular-nums">{{ fmtDateTime(tip.updated_at) }}</time>
          <span v-if="edited" class="whitespace-nowrap rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-500">{{ $t('trophy.tips.edited') }}</span>
        </div>
        <span class="hidden text-slate-300 sm:inline">·</span>
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="whitespace-nowrap rounded-md bg-sky-50 px-1.5 py-0.5 font-medium text-sky-700">{{ langLabel(tip.language) }}</span>
          <span v-if="tip.missable === true" class="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
            <LucideIcon :icon="AlertTriangle" class="size-3 shrink-0" />
            {{ $t('trophy.tips.missable') }}
          </span>
        </div>
      </div>

      <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          :disabled="votePending || (loggedIn && !tip.can_vote)"
          :aria-pressed="viewerVote === 1"
          class="inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
          :class="viewerVote === 1
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60'
            : 'border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50'"
          @click="evaluate(1)"
        >
          <LucideIcon :icon="ThumbsUp" class="size-2.5" :class="{ 'fill-current': viewerVote === 1 }" />
          {{ $t('trophy.tips.helpful') }}
          <span class="tabular-nums opacity-70">{{ voteUpCount }}</span>
        </button>
        <button
          type="button"
          :disabled="votePending || (loggedIn && !tip.can_vote)"
          :aria-pressed="viewerVote === -1"
          class="inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
          :class="viewerVote === -1
            ? 'border-rose-300 bg-rose-50 text-rose-700 ring-1 ring-rose-200/60'
            : 'border-rose-200 bg-white text-rose-600 hover:bg-rose-50'"
          @click="evaluate(-1)"
        >
          <LucideIcon :icon="ThumbsDown" class="size-2.5" :class="{ 'fill-current': viewerVote === -1 }" />
          {{ $t('trophy.tips.notHelpful') }}
          <span class="tabular-nums opacity-70">{{ voteDownCount }}</span>
        </button>
      </div>
    </div>
  </article>
</template>
