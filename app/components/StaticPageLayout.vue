<script setup lang="ts">
import { CalendarDays } from 'lucide'

const props = defineProps<{
  eyebrow: string
  title: string
  lead: string
  updatedAt: string
  items: { id: string, label: string }[]
  narrow?: boolean
}>()

const activeId = ref(props.items[0]?.id ?? '')
let frame: number | undefined

function updateActiveSection() {
  frame = undefined
  const activationLine = 132
  let current = props.items[0]?.id ?? ''

  for (const item of props.items) {
    const section = document.getElementById(item.id)
    if (!section) continue
    if (section.getBoundingClientRect().top <= activationLine) current = item.id
    else break
  }

  // The final section can be shorter than the viewport and never cross the
  // activation line. Treat reaching the document end as viewing that section.
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    current = props.items.at(-1)?.id ?? current
  }

  activeId.value = current
}

function scheduleUpdate() {
  if (frame !== undefined) return
  frame = window.requestAnimationFrame(updateActiveSection)
}

onMounted(() => {
  updateActiveSection()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
  if (frame !== undefined) window.cancelAnimationFrame(frame)
})
</script>

<template>
  <article lang="ja" class="mx-auto" :class="narrow ? 'max-w-5xl' : 'max-w-6xl'">
    <header class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-sky-50/60 px-5 py-6 sm:px-7 sm:py-8 lg:px-8">
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">{{ eyebrow }}</p>
        <h1 class="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{{ title }}</h1>
        <p class="mt-2.5 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{{ lead }}</p>
        <p class="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
          <LucideIcon :icon="CalendarDays" class="size-3.5" />
          最終更新日：{{ updatedAt }}
        </p>
      </div>
    </header>

    <nav aria-label="ページ内目次" class="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm lg:hidden">
      <ul class="flex min-w-max gap-1">
        <li v-for="item in items" :key="item.id">
          <a
            :href="`#${item.id}`"
            :aria-current="activeId === item.id ? 'location' : undefined"
            class="block rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200"
            :class="activeId === item.id
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </nav>

    <div class="mt-6 grid items-start gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
      <nav aria-label="ページ内目次" class="sticky top-24 hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:block">
        <p class="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">目次</p>
        <ul class="space-y-0.5">
          <li v-for="item in items" :key="item.id">
            <a
              :href="`#${item.id}`"
              :aria-current="activeId === item.id ? 'location' : undefined"
              class="toc-link relative block rounded-lg py-2 pl-4 pr-3 text-sm font-medium transition-all duration-200"
              :class="activeId === item.id
                ? 'translate-x-1 bg-slate-100 text-slate-950'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'"
            >
              <span
                aria-hidden="true"
                class="absolute inset-y-0 left-0 w-1 origin-center rounded-full bg-slate-950 transition-all duration-200"
                :class="activeId === item.id ? 'scale-y-100 opacity-100' : 'scale-y-50 opacity-0'"
              />
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="min-w-0 space-y-6">
        <slot />
      </div>
    </div>
  </article>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .toc-link,
  .toc-link > span {
    transition: none;
  }
}
</style>
