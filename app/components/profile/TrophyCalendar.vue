<script setup lang="ts">
import { CalendarDays } from 'lucide'
import type { CalendarDay } from '~/services/profile'

const props = defineProps<{ calendar: CalendarDay[] }>()

type DayCell = {
  date: string
  count: number
  label: string
}

const DAY_MS = 86_400_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const pad = (n: number) => String(n).padStart(2, '0')
const dateKey = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
const parseDate = (date: string) => new Date(`${date}T00:00:00Z`)
const shiftDays = (date: Date, amount: number) => new Date(date.getTime() + amount * DAY_MS)
const previousYearAnniversary = (date: Date) => {
  const year = date.getUTCFullYear() - 1
  const month = date.getUTCMonth()
  const day = Math.min(date.getUTCDate(), new Date(Date.UTC(year, month + 1, 0)).getUTCDate())
  return new Date(Date.UTC(year, month, day))
}
const fmtCalendarDate = (date: Date) =>
  `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`

const countByDate = computed(() => {
  const counts = new Map<string, number>()
  for (const day of props.calendar) {
    counts.set(day.date, (counts.get(day.date) ?? 0) + day.count)
  }
  return counts
})

// Anchor to today (browser date), not the latest API row — the API's most
// recent entry isn't guaranteed to be current. The graph always shows the
// trailing 12 months; any API rows outside that window (e.g. a stale 2024
// entry) fall outside the iterated range and are simply ignored.
const endDate = computed(() => parseDate(dateKey(new Date())))
const startDate = computed(() => shiftDays(previousYearAnniversary(endDate.value), 1))
const dayCount = computed(() =>
  Math.round((endDate.value.getTime() - startDate.value.getTime()) / DAY_MS) + 1,
)

const days = computed<DayCell[]>(() =>
  Array.from({ length: dayCount.value }, (_, index) => {
    const date = shiftDays(startDate.value, index)
    const key = dateKey(date)
    const count = countByDate.value.get(key) ?? 0
    return {
      date: key,
      count,
      label: `${fmtCalendarDate(date)} · ${count ? `获取 ${count} 个奖杯` : '没有获取奖杯'}`,
    }
  }),
)

const weeks = computed(() => {
  const cells: (DayCell | null)[] = [
    ...Array.from({ length: startDate.value.getUTCDay() }, () => null),
    ...days.value,
  ]
  return Array.from({ length: Math.ceil(cells.length / 7) }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  )
})

const monthLabels = computed(() => weeks.value.map((week) => {
  const firstDay = week.find(day => day?.date.endsWith('-01'))
  if (!firstDay) return ''
  return MONTHS[Number(firstDay.date.slice(5, 7)) - 1] ?? ''
}))

const total = computed(() => days.value.reduce((sum, day) => sum + day.count, 0))
const activeDays = computed(() => days.value.filter(day => day.count > 0).length)
const maxCount = computed(() => Math.max(...days.value.map(day => day.count), 0))
const dateRange = computed(() =>
  `${fmtCalendarDate(startDate.value)} - ${fmtCalendarDate(endDate.value)}`,
)

function activityClass(count: number) {
  if (!count) return 'bg-slate-100 ring-slate-200/60'
  if (count >= 20) return 'bg-slate-900 ring-slate-900'
  if (count >= 10) return 'bg-slate-700 ring-slate-700'
  if (count >= 5) return 'bg-slate-500 ring-slate-500'
  return 'bg-slate-300 ring-slate-300'
}
</script>

<template>
  <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-4 py-3 sm:px-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="grid size-8 place-items-center rounded-lg bg-slate-900 text-white shadow-sm">
            <LucideIcon :icon="CalendarDays" class="size-4" />
          </span>
          <div>
            <h2 class="text-sm font-semibold text-slate-900">最近一年的活动</h2>
            <p class="text-xs text-slate-400">{{ dateRange }}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-5 text-right">
        <div>
          <div class="text-base font-bold text-slate-900">{{ fmt(total) }}</div>
          <div class="text-[11px] text-slate-400">获得奖杯</div>
        </div>
        <div>
          <div class="text-base font-bold text-slate-900">{{ fmt(activeDays) }}</div>
          <div class="text-[11px] text-slate-400">活跃天数</div>
        </div>
        <div class="max-sm:hidden">
          <div class="text-base font-bold text-slate-900">{{ fmt(maxCount) }}</div>
          <div class="text-[11px] text-slate-400">单日最高</div>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto px-4 py-3 sm:px-5">
      <div class="min-w-max">
        <div class="ml-8 flex h-4 gap-0.75 text-[10px] leading-none text-slate-400">
          <span
            v-for="(month, index) in monthLabels"
            :key="index"
            class="w-2.75 shrink-0 whitespace-nowrap"
          >{{ month }}</span>
        </div>

        <div class="flex gap-2">
          <div class="grid w-6 grid-rows-7 gap-0.75 text-[9px] text-slate-400">
            <span
              v-for="(label, index) in WEEKDAY_LABELS"
              :key="index"
              class="flex h-2.75 items-center justify-end leading-none"
            >{{ label }}</span>
          </div>
          <div class="flex gap-0.75">
            <div v-for="(week, index) in weeks" :key="index" class="flex flex-col gap-0.75">
              <template v-for="(day, dayIndex) in week" :key="day?.date ?? dayIndex">
                <Tooltip
                  v-if="day"
                  :content="day.label"
                  placement="top"
                >
                  <span
                    class="size-2.75 rounded-[3px] ring-1 ring-inset transition duration-150 hover:scale-125 hover:ring-slate-900"
                    :class="activityClass(day.count)"
                    :aria-label="day.label"
                  />
                </Tooltip>
                <span v-else class="size-2.75" aria-hidden="true" />
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-400 sm:px-5">
      <span class="inline-flex items-center gap-1.5">
        少
        <i v-for="level in [0, 1, 5, 10, 20]" :key="level" class="size-2.75 rounded-[3px] ring-1 ring-inset" :class="activityClass(level)" />
        多
      </span>
    </div>
  </section>
</template>
