<template>
  <!-- Loading -->
  <div v-if="pending && !data" class="space-y-6">
    <div class="h-56 animate-pulse rounded-lg bg-slate-200" />
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="h-96 animate-pulse rounded-lg bg-slate-200 lg:col-span-2" />
      <div class="h-96 animate-pulse rounded-lg bg-slate-200" />
    </div>
  </div>

  <!-- Content. Failures never reach here: `raiseFetchError` shows `error.vue`
       with a real HTTP status instead. -->
  <div v-else-if="data" class="space-y-6">
    <TrophyBanner :trophy-set="data.trophy_set" :display-name="displayName" />

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Main: grouped trophy list -->
      <div class="lg:col-span-2">
        <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
            <h2 class="inline-flex items-baseline gap-2 font-semibold text-slate-900">
              {{ $t('trophy.list.heading') }}
              <span class="text-sm font-normal text-slate-400">
                {{ $t('trophy.list.count', totalDefined(data.trophy_set.defined_trophies)) }}
              </span>
            </h2>
            <div v-if="availableLanguages.length" class="flex items-center gap-2.5">
              <span class="hidden items-center gap-1 text-xs font-medium text-slate-400 sm:inline-flex">
                <i18n-t keypath="trophy.lang.available" scope="global" tag="span" class="inline-flex items-center gap-1" :plural="availableLanguages.length">
                  <template #badge>
                    <span class="rounded-full bg-slate-100 px-1.5 py-0.5 font-semibold tabular-nums text-slate-600">{{ availableLanguages.length }}</span>
                  </template>
                </i18n-t>
              </span>
              <TrophyLanguagePicker
                :languages="availableLanguages"
                :current="data.display_language"
                :loading="pending"
                @select="switchLanguage"
              />
            </div>
          </div>

          <!-- Filter + sort toolbar -->
          <div class="flex flex-col gap-2.5 border-b border-slate-200 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
            <div class="grid grid-cols-3 rounded-lg bg-slate-100 p-0.5 sm:inline-flex">
              <button
                v-for="f in filterOptions"
                :key="f.value"
                type="button"
                :disabled="f.value !== 'all' && !hasViewer"
                :title="f.value !== 'all' && !hasViewer ? $t('trophy.filter.needsPsnid') : undefined"
                class="rounded-md px-3 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
                :class="filter === f.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
                @click="filter = f.value"
              >
                {{ $t(f.labelKey) }}
              </button>
            </div>

            <div class="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
              <!-- Spoiler toggle -->
              <button
                type="button"
                role="switch"
                :aria-checked="showSpoilers"
                class="inline-flex min-w-0 items-center justify-between gap-2 rounded-lg px-1 py-1 text-sm font-medium text-slate-600 sm:justify-normal sm:p-0"
                @click="showSpoilers = !showSpoilers"
              >
                <span>{{ $t('trophy.list.showHidden') }}</span>
                <span class="relative h-5 w-9 rounded-full transition-colors" :class="showSpoilers ? 'bg-slate-900' : 'bg-slate-300'">
                  <span class="absolute top-0.5 size-4 rounded-full bg-white shadow transition-all" :class="showSpoilers ? 'left-4.5' : 'left-0.5'" />
                </span>
              </button>

              <label class="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 transition focus-within:border-slate-400 sm:shrink-0">
                <LucideIcon :icon="ArrowUpDown" class="size-4 text-slate-400" />
                <select v-model="sort" class="min-w-0 flex-1 cursor-pointer bg-transparent pr-1 font-medium text-slate-900 focus:outline-none sm:flex-none" :aria-label="$t('trophy.sort.label')">
                  <option value="default">{{ $t('trophy.sort.default') }}</option>
                  <option value="earned" :disabled="!hasViewer">{{ $t('trophy.sort.earned') }}</option>
                  <option value="rarity">{{ $t('trophy.sort.rarity') }}</option>
                </select>
              </label>
            </div>
          </div>

          <div class="relative">
            <div
              class="divide-y divide-slate-200 transition-[max-height] duration-500 ease-out max-sm:overflow-hidden"
              :class="trophyListExpanded ? 'max-sm:max-h-[9999px]' : 'max-sm:max-h-136'"
            >
              <TrophyGroupSection
                v-for="group in sortedGroups"
                :key="group.id"
                :group="group"
                :earned-info="earnedInfo"
                :has-viewer="hasViewer"
                :filter="filter"
                :sort="sort"
                :show-spoilers="showSpoilers"
                :numbers="trophyNumbers"
                :tip-counts="tipCounts"
                @detail="dialogHost?.open('detail', $event)"
                @earners="dialogHost?.open('earners', $event)"
                @tips="dialogHost?.open('tips', $event)"
              />
            </div>

            <div
              v-if="visibleTrophyCount > 6"
              class="sm:hidden"
              :class="trophyListExpanded ? 'border-t border-slate-200 bg-white px-4 py-3' : 'pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-white via-white/95 to-white/0 px-4 pb-4 pt-18'"
            >
              <button
                type="button"
                class="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm shadow-slate-900/5 transition active:scale-[0.99]"
                @click="trophyListExpanded = !trophyListExpanded"
              >
                {{ trophyListExpanded ? $t('trophy.list.collapse') : $t('trophy.list.expand') }}
                <LucideIcon
                  :icon="ChevronDown"
                  class="size-4 transition-transform duration-300"
                  :class="trophyListExpanded ? 'rotate-180' : ''"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Side: viewer progress (when ?psnid= resolves) + recent players -->
      <aside class="space-y-6">
        <TrophyViewerProgress
          v-if="data.viewer_progress"
          :progress="data.viewer_progress"
          :country="viewerCountry"
          :total="totalDefined(data.trophy_set.defined_trophies)"
          :defined-trophies="data.trophy_set.defined_trophies"
        />

        <TrophySimilarSets v-if="data.similar_trophy_sets?.length" :sets="data.similar_trophy_sets" />

        <TrophyRecentPlayers :id="data.trophy_set.id" :players="data.recent_players" />
      </aside>
    </div>

    <TrophyDialogHost
      ref="dialogHost"
      :trophies="allTrophies"
      :display-language="data.display_language"
      @count="updateTipCount"
    />
  </div>
</template>

<script setup lang="ts">
import { ArrowUpDown, ChevronDown } from 'lucide'
import type { Trophy, TrophyGroup, TrophySetDetail } from '~/services/trophies'
import { DEFAULT_LOCALE, PSN_LANG, canonicalContentLang, canonicalLang, isUiLocale, type UiLocale } from '#shared/locales'

definePageMeta({ path: '/trophies/:id(\\d+)' })

type FilterMode = 'all' | 'earned' | 'unearned'
type SortMode = 'default' | 'earned' | 'rarity'
type TrophyDialogKind = 'detail' | 'earners' | 'tips'

const dialogHost = useTemplateRef<{
  open: (kind: TrophyDialogKind, trophy: Trophy) => void
}>('dialogHost')
const tipCounts = reactive<Record<number, number>>({})

function updateTipCount(trophyId: number, value: number) {
  tipCounts[trophyId] = value
}

const route = useRoute()
const { t, locale } = useI18n()
const id = computed(() => String(route.params.id))

// Optional viewer progress is driven entirely by the `?psnid=` query param.
// The player may have no record for this title — the API decides via
// `viewer_progress` (null when absent), so we just render what comes back.
const psnid = computed(() =>
  typeof route.query.psnid === 'string' ? route.query.psnid : '',
)
const hasViewer = computed(() => Boolean(psnid.value))

// Trophy body text has its own param, `?tlang=`, deliberately separate from the
// interface language in `?lang=`: a set ships in up to 25 PSN languages, most of
// which we have no interface for, and reading French trophy names shouldn't drag
// the rest of the site out of the reader's own language.
//
// Without the param we ask for whatever the interface language implies, so a
// bare URL renders identically for every visitor instead of following whatever
// `Accept-Language` the browser happened to send.
const uiContentLang = computed(() =>
  PSN_LANG[isUiLocale(locale.value) ? locale.value as UiLocale : DEFAULT_LOCALE])
const contentLangParam = computed(() => canonicalContentLang(route.query.tlang))
const requestedLang = computed(() => contentLangParam.value || uiContentLang.value)

const { data, status, error } = await useApiFetch<TrophySetDetail>(
  () => `/trophies/${id.value}`,
  {
    query: computed(() => ({
      psnid: psnid.value || undefined,
      lang: requestedLang.value,
    })),
  },
)

const pending = computed(() => status.value === 'pending')

const viewerCountry = computed(() => {
  const progress = data.value?.viewer_progress
  if (!progress) return ''
  return progress.country
    || data.value?.recent_players.find(player => player.psnid === progress.psnid)?.country
    || ''
})

// A missing set has to answer 404, not a 200 page that says "not found".
// Watched rather than checked once: navigating between two trophy pages reuses
// this component, so setup doesn't re-run but `error` does change.
function raiseFetchError(err: typeof error.value) {
  if (!err) return
  const notFound = (err as { statusCode?: number }).statusCode === 404
  showError(createError({
    statusCode: notFound ? 404 : 502,
    statusMessage: notFound ? 'Trophy set not found' : 'Trophy service unavailable',
    fatal: true,
  }))
}
raiseFetchError(error.value)
watch(error, raiseFetchError)

const availableLanguages = computed(() => data.value?.available_languages ?? [])

/**
 * Switching the trophy language is a navigation, not a patch: the URL carries
 * the choice, so the result is shareable, survives a reload, and gives each
 * translation its own indexable address. It writes `?tlang=` only — `?lang=`,
 * and with it the interface language, is left exactly as the reader set it.
 */
function switchLanguage(code: string) {
  if (!code || code === data.value?.display_language) return
  const query = { ...route.query }
  // Back to what the interface language already implies: drop the param rather
  // than spell it out, so each variant keeps a single canonical URL.
  if (canonicalLang(code) === canonicalLang(uiContentLang.value)) delete query.tlang
  else query.tlang = code
  return navigateTo({ path: route.path, query, hash: route.hash })
}

// Parse an API date (unix seconds or ISO string) to epoch ms, or null.
function toMs(value: number | string | null): number | null {
  if (value == null || value === '') return null
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  const t = date.getTime()
  return Number.isNaN(t) ? null : t
}

// Maps each earned trophy's db id to its chronological earned position (0-based
// `rank`, also drives the "by earned time" sort), timestamp, and seconds since the
// previously earned trophy (`null` for the first). The raw `earned_trophies`
// list isn't guaranteed to be time-sorted, so we order by `earned_trophies_at`
// to get the true "this is the Nth trophy earned" sequence and gaps (trophies
// missing a timestamp sort last).
const earnedInfo = computed(() => {
  const m = new Map<number, { rank: number, earnedAt: number | string | null, sincePrev: number | null }>()
  const progress = data.value?.viewer_progress
  if (!progress) return m

  // Platinum is awarded in the same instant as the trophy that completes the
  // set, so they share a timestamp. Treat platinum as earned last in any tie so
  // it ranks after the trophy that actually triggered it.
  const isPlatinum = new Set<number>()
  for (const group of data.value?.groups ?? []) {
    for (const t of group.trophies) {
      if (t.type === 'platinum') isPlatinum.add(t.id)
    }
  }

  const times = progress.earned_trophies_at ?? {}
  const ordered = progress.earned_trophies
    .map(id => ({ id, earnedAt: times[id] ?? null, ms: toMs(times[id] ?? null) }))
    .sort((a, b) => {
      if (a.ms == null) return b.ms == null ? 0 : 1
      if (b.ms == null) return -1
      if (a.ms !== b.ms) return a.ms - b.ms
      // Same timestamp: platinum sorts after non-platinum.
      return Number(isPlatinum.has(a.id)) - Number(isPlatinum.has(b.id))
    })

  let prevMs: number | null = null
  ordered.forEach(({ id, earnedAt, ms }, i) => {
    const sincePrev = i > 0 && ms != null && prevMs != null
      ? Math.round((ms - prevMs) / 1000)
      : null
    m.set(id, { rank: i, earnedAt, sincePrev })
    if (ms != null) prevMs = ms
  })

  return m
})

function groupSortKey(group: TrophyGroup) {
  if (group.psn_group_id === 'default') return -1
  const numeric = Number(group.psn_group_id)
  return Number.isFinite(numeric) ? numeric : Number.MAX_SAFE_INTEGER
}

// PSN groups are ordered as base game first (`default`), then DLC groups
// (`001`, `002`, ...). Trophies inside each group follow PSN's own id.
const sortedGroups = computed(() =>
  [...(data.value?.groups ?? [])]
    .sort((a, b) =>
      groupSortKey(a) - groupSortKey(b)
      || a.psn_group_id.localeCompare(b.psn_group_id)
      || a.id - b.id,
    )
    .map(group => ({
      ...group,
      trophies: [...group.trophies].sort((a, b) =>
        a.psn_trophy_id - b.psn_trophy_id || a.id - b.id,
      ),
    })),
)

const allTrophies = computed(() => sortedGroups.value.flatMap(group => group.trophies))

function isTrophyEarned(trophy: Trophy) {
  return hasViewer.value && (trophy.earned_by_viewer ?? earnedInfo.value.has(trophy.id))
}

const visibleTrophyCount = computed(() => {
  let count = 0
  for (const group of sortedGroups.value) {
    for (const trophy of group.trophies) {
      if (hasViewer.value && filter.value !== 'all') {
        const want = filter.value === 'earned'
        if (isTrophyEarned(trophy) !== want) continue
      }
      count += 1
    }
  }
  return count
})

// Trophy row number is PSN's zero-based trophy id shifted to user-facing 1-based.
const trophyNumbers = computed(() => {
  const m = new Map<number, number>()
  for (const group of data.value?.groups ?? []) {
    for (const t of group.trophies) m.set(t.id, t.psn_trophy_id + 1)
  }
  return m
})

// Filter + sort controls for the trophy list.
const filterOptions: { value: FilterMode; labelKey: string }[] = [
  { value: 'all', labelKey: 'trophy.filter.all' },
  { value: 'earned', labelKey: 'trophy.filter.earned' },
  { value: 'unearned', labelKey: 'trophy.filter.unearned' },
]
const filter = ref<FilterMode>('all')
const sort = ref<SortMode>('default')
// URL fragments are unavailable to SSR. Start collapsed on both server and
// client, then reveal and re-scroll after hydration to avoid a class mismatch.
const trophyListExpanded = ref(false)

// Mask spoiler (PSN-hidden) trophies until toggled on; earned ones stay visible.
// Persisted in a cookie so the preference survives reloads / navigation.
const showSpoilers = useCookie<boolean>('show_spoilers', {
  default: () => false,
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
})

// Earned-based filter/sort need a viewer; reset them when the lookup is cleared.
watch(hasViewer, (v) => {
  if (!v) {
    filter.value = 'all'
    if (sort.value === 'earned') sort.value = 'default'
  }
})

watch([filter, sort, showSpoilers], () => {
  trophyListExpanded.value = false
})

async function revealHashTarget(hash: string) {
  if (!/^#trophy-\d+$/.test(hash)) return
  trophyListExpanded.value = true
  await nextTick()
  document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
}

onMounted(() => revealHashTarget(route.hash))
watch(() => route.hash, revealHashTarget)

/**
 * The set's title in the language actually being displayed. `available_languages`
 * carries a localized `name` per language; `trophy_set.name` is the raw default.
 */
const displayName = computed(() => {
  const detail = data.value
  if (!detail) return ''
  const match = detail.available_languages
    ?.find(l => l.language_code === detail.display_language)
  return match?.name || detail.trophy_set.name
})

useSeo({
  title: () => (displayName.value
    ? t('seo.trophy.title', { name: displayName.value })
    : t('seo.trophy.titleFallback')),
  description: () => (data.value
    ? t('seo.trophy.description', {
        name: displayName.value,
        count: totalDefined(data.value.trophy_set.defined_trophies),
        platform: data.value.trophy_set.platform.join(' / '),
      })
    : ''),
  image: () => data.value?.trophy_set.icon_url,
  // Spell the body language out only when it isn't what the interface language
  // already implies, and go by what the server actually served rather than what
  // we asked for — a `?tlang=` the API fell back on must not claim to be its
  // own variant.
  contentLang: () => {
    const served = canonicalContentLang(data.value?.display_language)
    return served && canonicalLang(served) !== canonicalLang(uiContentLang.value) ? served : ''
  },
  // Every PSN language this set exists in is a genuinely different page and
  // worth advertising, on top of the five UI locales `useSeo` always emits.
  altContentLangs: () => availableLanguages.value.map(l => l.language_code),
  // `?psnid=` renders one visitor's progress: same set, personalised. Keep it
  // out of the index rather than spending crawl budget on id × psnid.
  noindex: () => hasViewer.value,
})
</script>
