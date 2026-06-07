<script setup lang="ts">
import { Quote } from 'lucide'

const appConfig = useAppConfig()

// Initialise with the first quote so SSR and the first client render agree
// (no hydration mismatch), then shuffle to a random one once mounted.
const quote = ref(appConfig.auth.quotes[0])

onMounted(() => {
  const quotes = appConfig.auth.quotes
  quote.value = quotes[Math.floor(Math.random() * quotes.length)] ?? quote.value
})
</script>

<template>
  <div class="relative h-full w-full overflow-hidden bg-slate-900">
    <!-- Background image with a slow ambient zoom -->
    <img
      :src="appConfig.auth.image"
      alt=""
      class="absolute inset-0 size-full origin-center animate-kenburns object-cover"
    />

    <!-- Legibility overlay: darken the top where the quote sits, fading down -->
    <div class="absolute inset-0 bg-linear-to-b from-slate-950/75 via-slate-950/25 to-slate-950/10" />

    <!-- Content: quote anchored to the top, no glass -->
    <div class="relative flex h-full flex-col p-9 xl:p-12">
      <figure class="animate-rise max-w-md" style="animation-delay: 0.15s">
        <LucideIcon :icon="Quote" class="size-9 text-white/35" />

        <Transition
          mode="out-in"
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          leave-active-class="transition duration-200 ease-in"
          leave-to-class="opacity-0"
        >
          <blockquote :key="quote.text" class="mt-5">
            <p
              class="text-lg font-medium leading-relaxed tracking-wide text-white drop-shadow-sm xl:text-xl xl:leading-relaxed"
            >
              {{ quote.text }}
            </p>
            <figcaption class="mt-6 flex items-center gap-3">
              <span class="h-px w-8 bg-white/50" />
              <span class="text-sm font-medium tracking-wide text-white/80">{{ quote.author }}</span>
            </figcaption>
          </blockquote>
        </Transition>
      </figure>
    </div>
  </div>
</template>
