<template>
  <!-- Loading -->
  <div v-if="pending && !data" class="space-y-6">
    <div class="h-56 animate-pulse rounded-lg bg-slate-200" />
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="h-96 animate-pulse rounded-lg bg-slate-200 lg:col-span-2" />
      <div class="h-96 animate-pulse rounded-lg bg-slate-200" />
    </div>
  </div>

  <!-- Error -->
  <div
    v-else-if="error || !data"
    class="grid place-items-center rounded-lg border border-slate-200 bg-white py-24 text-center shadow-sm"
  >
    <div class="space-y-2">
      <div class="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 text-rose-500">
        <LucideIcon :icon="XCircle" class="size-7" />
      </div>
      <h1 class="text-lg font-semibold text-slate-900">找不到该奖杯组</h1>
      <p class="text-sm text-slate-500">奖杯组「{{ id }}」不存在。</p>
      <NuxtLink to="/" class="inline-block pt-2 text-sm font-medium text-slate-900 hover:text-slate-700">
        返回首页
      </NuxtLink>
    </div>
  </div>

  <!-- Content -->
  <div v-else class="space-y-6">
    <TrophyBanner :trophy-set="data.trophy_set" />

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Main: grouped trophy list -->
      <div class="lg:col-span-2">
        <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
            <h2 class="inline-flex items-baseline gap-2 font-semibold text-slate-900">
              奖杯
              <span class="text-sm font-normal text-slate-400">共 {{ totalDefined(data.trophy_set.defined_trophies) }} 个</span>
            </h2>
            <div v-if="availableLanguages.length" class="flex items-center gap-2.5">
              <span class="hidden items-center gap-1 text-xs font-medium text-slate-400 sm:inline-flex">
                支持
                <span class="rounded-full bg-slate-100 px-1.5 py-0.5 font-semibold tabular-nums text-slate-600">{{ availableLanguages.length }}</span>
                种语言
              </span>
              <TrophyLanguagePicker
                :languages="availableLanguages"
                :current="data.display_language"
                :loading="switching"
                @select="switchLanguage"
              />
            </div>
          </div>

          <!-- Filter + sort toolbar -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5 sm:px-5">
            <div class="inline-flex rounded-lg bg-slate-100 p-0.5">
              <button
                v-for="f in filterOptions"
                :key="f.value"
                type="button"
                :disabled="f.value !== 'all' && !hasViewer"
                :title="f.value !== 'all' && !hasViewer ? '输入 PSN ID 后可用' : undefined"
                class="rounded-md px-3 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
                :class="filter === f.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
                @click="filter = f.value"
              >
                {{ f.label }}
              </button>
            </div>

            <div class="flex items-center gap-3">
              <!-- Spoiler toggle -->
              <button
                type="button"
                role="switch"
                :aria-checked="showSpoilers"
                class="inline-flex items-center gap-2 text-sm font-medium text-slate-600"
                @click="showSpoilers = !showSpoilers"
              >
                <span>显示隐藏奖杯</span>
                <span class="relative h-5 w-9 rounded-full transition-colors" :class="showSpoilers ? 'bg-slate-900' : 'bg-slate-300'">
                  <span class="absolute top-0.5 size-4 rounded-full bg-white shadow transition-all" :class="showSpoilers ? 'left-4.5' : 'left-0.5'" />
                </span>
              </button>

              <label class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 transition focus-within:border-slate-400">
                <LucideIcon :icon="ArrowUpDown" class="size-4 text-slate-400" />
                <select v-model="sort" class="cursor-pointer bg-transparent pr-1 font-medium text-slate-900 focus:outline-none" aria-label="排序">
                  <option value="default">默认</option>
                  <option value="earned" :disabled="!hasViewer">获得时间</option>
                  <option value="rarity">PSN 稀有度</option>
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
                {{ trophyListExpanded ? '收起奖杯列表' : '展开全部奖杯' }}
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
          :total="totalDefined(data.trophy_set.defined_trophies)"
          :defined-trophies="data.trophy_set.defined_trophies"
        />

        <TrophySimilarSets v-if="data.similar_trophy_sets?.length" :sets="data.similar_trophy_sets" />

        <TrophyRecentPlayers :id="data.trophy_set.id" :players="data.recent_players" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XCircle, ArrowUpDown, ChevronDown } from 'lucide'
import { useTrophies, type Trophy, type TrophyGroup, type TrophySetDetail } from '~/services/trophies'

type FilterMode = 'all' | 'earned' | 'unearned'
type SortMode = 'default' | 'earned' | 'rarity'

const route = useRoute()
const id = computed(() => String(route.params.id))

// Optional viewer progress is driven entirely by the `?psnid=` query param;
// it's included in the fetch URL so the request re-runs when the param changes.
// The player may have no record for this title — the API decides via
// `viewer_progress` (null when absent), so we just render what comes back.
const psnid = computed(() =>
  typeof route.query.psnid === 'string' ? route.query.psnid : '',
)
const hasViewer = computed(() => Boolean(psnid.value))

// `deep: true` keeps the payload deeply reactive (Nuxt 4 defaults to a
// shallowRef). The language switch patches `localized_*` onto nested groups /
// trophies in place, and only deep reactivity propagates that to the children.
const { data, pending, error } = await useApiFetch<TrophySetDetail>(() => {
  const base = `/trophies/${id.value}`
  return psnid.value ? `${base}?psnid=${encodeURIComponent(psnid.value)}` : base
}, { deep: true })

// The detail payload arrives in the server's best-matched `display_language`.
// Switching language re-fetches only the localized text and patches it onto
// the rendered groups/trophies by id — progress, players and similar sets stay.
const { localization } = useTrophies()
const toast = useToast()
const switching = ref(false)

const availableLanguages = computed(() => data.value?.available_languages ?? [])

async function switchLanguage(code: string) {
  const detail = data.value
  if (!detail || switching.value || code === detail.display_language) return

  switching.value = true
  try {
    const loc = await localization(id.value, { lang: code })

    const groupById = new Map(detail.groups.map(g => [g.id, g]))
    for (const lg of loc.groups) {
      const group = groupById.get(lg.id)
      if (!group) continue
      group.localized_name = lg.localized_name
      group.localized_detail = lg.localized_detail

      const trophyById = new Map(group.trophies.map(t => [t.id, t]))
      for (const lt of lg.trophies) {
        const trophy = trophyById.get(lt.id)
        if (!trophy) continue
        trophy.localized_name = lt.localized_name
        trophy.localized_detail = lt.localized_detail
      }
    }

    detail.display_language = loc.display_language
  } catch {
    toast.error({ title: '语言切换失败', description: '请稍后再试。' })
  } finally {
    switching.value = false
  }
}

// Parse an API date (unix seconds or ISO string) to epoch ms, or null.
function toMs(value: number | string | null): number | null {
  if (value == null || value === '') return null
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  const t = date.getTime()
  return Number.isNaN(t) ? null : t
}

// Maps each earned trophy's db id to its chronological earned position (0-based
// `rank`, also drives the "获得时间" sort), timestamp, and seconds since the
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
const filterOptions: { value: FilterMode; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'earned', label: '已获得' },
  { value: 'unearned', label: '未获得' },
]
const filter = ref<FilterMode>('all')
const sort = ref<SortMode>('default')
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

useHead(() => ({
  title: data.value
    ? `${data.value.trophy_set.name} · 奖杯`
    : '奖杯组',
}))
</script>
