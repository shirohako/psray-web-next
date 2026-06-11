<script setup lang="ts">
import { Globe, Users, ChevronRight } from 'lucide'
import type { SimilarTrophySet } from '~/services/trophies'

defineProps<{ set: SimilarTrophySet }>()

// A small Twitter-style hovercard: the chip just shows the set id (the only
// guaranteed-unique handle) + region; hovering or tapping it pops a card with
// the cover, full name, trophy breakdown and a link through to the set. The card
// is teleported to <body> and fixed-positioned so it never gets clipped by the
// sidebar, flipping above the chip when there isn't room below.
const triggerEl = ref<HTMLElement>()
const cardEl = ref<HTMLElement>()
const open = ref(false)
const pos = reactive({ top: 0, left: 0, above: false })
let timer: ReturnType<typeof setTimeout> | undefined

const CARD_W = 248
const CARD_H = 215
const GAP = 8

function place() {
  const el = triggerEl.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const left = Math.max(GAP, Math.min(r.left + r.width / 2 - CARD_W / 2, window.innerWidth - CARD_W - GAP))
  const above = window.innerHeight - r.bottom < CARD_H + GAP && r.top > CARD_H + GAP
  pos.left = left
  pos.top = above ? r.top - GAP - CARD_H : r.bottom + GAP
  pos.above = above
}

function show() {
  clearTimeout(timer)
  place()
  open.value = true
}
function hide() {
  timer = setTimeout(() => { open.value = false }, 100)
}
function close() {
  open.value = false
}
function onPointerDown(e: PointerEvent) {
  const t = e.target as Node
  if (triggerEl.value?.contains(t) || cardEl.value?.contains(t)) return
  close()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

// Wire global dismissers only while open; scroll/resize just close (cheaper and
// less jarring than re-anchoring a card the pointer has likely left).
function bindDismissers(on: boolean) {
  if (on) {
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
  }
  else {
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('scroll', close, true)
    window.removeEventListener('resize', close)
  }
}

watch(open, bindDismissers)

onBeforeUnmount(() => {
  clearTimeout(timer)
  bindDismissers(false)
})
</script>

<template>
  <div class="inline-flex" @mouseenter="show" @mouseleave="hide">
    <button
      ref="triggerEl"
      type="button"
      class="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs leading-none transition"
      :class="open ? 'border-slate-300 bg-slate-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'"
      @click="show"
    >
      <span class="font-bold tabular-nums text-slate-800">#{{ set.id }}</span>
      <span v-if="set.region" class="inline-flex items-center gap-0.5 text-slate-400">
        <LucideIcon :icon="Globe" class="size-3" />
        <span class="font-medium tracking-wide text-slate-500">{{ set.region }}</span>
      </span>
    </button>

    <ClientOnly>
      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="opacity-0 scale-95"
          leave-active-class="transition duration-75 ease-in"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="open"
            ref="cardEl"
            class="fixed z-50 w-62 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            :class="pos.above ? 'origin-bottom' : 'origin-top'"
            :style="{ top: `${pos.top}px`, left: `${pos.left}px` }"
            @mouseenter="show"
            @mouseleave="hide"
          >
            <!-- Centered & stacked so neither aspect ratio looks lopsided: a
                 side-by-side split leaves PS4's short landscape art floating in
                 empty space and crams a long PS5 title into a narrow column. -->
            <div class="px-3 pt-3 pb-2.5 text-center">
              <div class="flex justify-center">
                <!-- max-w mainly reins in PS4's wide landscape art; PS5's square
                     cover is bounded by max-h instead. -->
                <img
                  :src="set.icon_url"
                  :alt="set.name"
                  class="max-h-16 max-w-24 rounded-md object-contain shadow-sm ring-1 ring-black/5"
                />
              </div>
              <div class="mt-2.5 flex items-center justify-center gap-2">
                <span
                  v-for="platform in platformList(set.platform)"
                  :key="platform"
                  class="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold leading-none"
                  :class="platformBadgeClass(platform)"
                >
                  {{ platform }}
                </span>
                <span v-if="set.region" class="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500">
                  <LucideIcon :icon="Globe" class="size-3 text-slate-400" />{{ set.region }}
                </span>
              </div>
              <h3 class="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{{ set.name }}</h3>
            </div>

            <!-- Trophy tier breakdown -->
            <div class="flex items-center justify-around border-t border-slate-100 px-3 py-2.5">
              <span v-for="t in trophyKinds" :key="t.key" class="inline-flex items-center gap-1">
                <span class="size-2.5 rounded-full" :class="t.dot" />
                <span class="text-xs font-bold tabular-nums text-slate-700">{{ set.defined_trophies[t.key] }}</span>
              </span>
            </div>

            <div class="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
              <span class="inline-flex items-center gap-1 text-xs text-slate-400">
                <LucideIcon :icon="Users" class="size-3.5" />{{ fmt(set.owners) }} 玩过
              </span>
              <NuxtLink
                :to="`/trophies/${set.id}`"
                class="inline-flex items-center gap-0.5 rounded-md bg-slate-900 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
              >
                查看<LucideIcon :icon="ChevronRight" class="size-3.5" />
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>
