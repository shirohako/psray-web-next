<script setup lang="ts">
import { ArrowRight } from 'lucide'

/** Step 5 — registration complete. Registration does not auto-login, so the CTA goes to sign-in. */
defineEmits<{ login: [] }>()

const animationSrc = ref('')

onMounted(() => {
  animationSrc.value = `/animations/success-confetti.svg?t=${Date.now()}`
})
</script>

<template>
  <div class="flex flex-col items-center py-4 text-center">
    <div class="relative size-28 overflow-visible animate-rise" style="animation-delay: 0.02s">
      <img
        v-if="animationSrc"
        :src="animationSrc"
        alt=""
        class="absolute left-1/2 top-1/2 size-48 max-w-none -translate-x-1/2 -translate-y-1/2"
        draggable="false"
      />
    </div>

    <h1 class="mt-2 text-xl font-bold tracking-tight text-slate-900 animate-rise" style="animation-delay: 0.1s">
      {{ $t('auth.register.done.title') }}
    </h1>
    <p class="mt-2 max-w-xs text-sm leading-relaxed text-slate-500 animate-rise" style="animation-delay: 0.16s">
      {{ $t('auth.register.done.description') }}
    </p>

    <button
      type="button"
      class="group mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/30 transition-all duration-200 hover:bg-slate-800 hover:shadow-md active:scale-[0.99] active:bg-slate-950 animate-rise"
      style="animation-delay: 0.22s"
      @click="$emit('login')"
    >
      {{ $t('auth.register.done.cta') }}
      <LucideIcon :icon="ArrowRight" class="size-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  </div>
</template>

<style scoped>
</style>
