<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: number | null | undefined
  duration?: number
  from?: number
  animateInitial?: boolean
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}>(), {
  duration: 700,
  from: 0,
  animateInitial: true,
  locale: 'zh-CN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function normalized(value: number | null | undefined) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function rounded(value: number) {
  const digits = props.maximumFractionDigits
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

const targetValue = computed(() => normalized(props.value))
const displayValue = ref(props.animateInitial ? normalized(props.from) : targetValue.value)
let frame: number | null = null

const formatted = computed(() => new Intl.NumberFormat(props.locale, {
  minimumFractionDigits: props.minimumFractionDigits,
  maximumFractionDigits: props.maximumFractionDigits,
}).format(displayValue.value))

function cancelAnimation() {
  if (frame == null) return
  cancelAnimationFrame(frame)
  frame = null
}

function animateTo(to: number) {
  cancelAnimation()
  if (!import.meta.client) return

  const from = displayValue.value
  const duration = Math.max(0, props.duration)
  if (duration === 0 || from === to) {
    displayValue.value = rounded(to)
    return
  }

  const startedAt = performance.now()
  const tick = (now: number) => {
    const elapsed = now - startedAt
    const ratio = Math.min(1, elapsed / duration)
    displayValue.value = rounded(from + (to - from) * easeOutCubic(ratio))

    if (ratio < 1) {
      frame = requestAnimationFrame(tick)
      return
    }

    displayValue.value = rounded(to)
    frame = null
  }

  frame = requestAnimationFrame(tick)
}

watch(targetValue, value => animateTo(value), { immediate: true })
onBeforeUnmount(cancelAnimation)
</script>

<template>
  <span>{{ formatted }}</span>
</template>
