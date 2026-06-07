<template>
  <!-- Sits inside the default layout (top bar + sidebar stay visible). The
       card hugs its content and is centered in the remaining viewport height
       (viewport - top bar - layout padding). -->
  <div class="flex min-h-[calc(100dvh-6rem)] items-center justify-center lg:min-h-[calc(100dvh-8rem)]">
    <div
      class="w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid lg:min-h-136 lg:grid-cols-[3fr_2fr]"
    >
      <!-- Left showcase: image + frosted quote. Hidden on small screens. -->
      <aside class="relative hidden lg:block">
        <AuthAside />
      </aside>

      <!-- Right: the form column. Fills height on mobile so the form is
           vertically centered; the grid governs sizing on lg+. -->
      <div class="flex flex-1 items-center justify-center p-8 sm:p-12">
        <div class="w-full max-w-sm">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
