<script setup lang="ts">
import { Mail, Lock, ArrowRight } from 'lucide'

useHead({ title: '登录 · PSRay' })

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)

const canSubmit = computed(() => email.value.trim() !== '' && password.value !== '')

function onSubmit() {
  if (!canSubmit.value || loading.value) return
  // TODO: wire up to the auth service once the API is ready.
  loading.value = true
  setTimeout(() => (loading.value = false), 800)
}
</script>

<template>
  <AuthShell>
    <div class="space-y-8">
      <header class="animate-rise" style="animation-delay: 0.05s">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">欢迎回来</h1>
        <p class="mt-2 text-sm text-slate-500">旅途还没有结束，尽头是星辰大海。</p>
      </header>

      <form class="space-y-5" @submit.prevent="onSubmit">
        <div class="animate-rise" style="animation-delay: 0.12s">
          <AuthField
            v-model="email"
            label="邮箱"
            type="email"
            :icon="Mail"
            placeholder="you@example.com"
            autocomplete="email"
          />
        </div>

        <div class="animate-rise" style="animation-delay: 0.18s">
          <AuthField
            v-model="password"
            label="密码"
            type="password"
            :icon="Lock"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>

        <div class="flex items-center justify-between animate-rise" style="animation-delay: 0.24s">
          <label class="group flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              v-model="remember"
              type="checkbox"
              class="size-4 cursor-pointer rounded accent-slate-900"
            />
            <span class="transition-colors group-hover:text-slate-900">记住我</span>
          </label>
          <a href="#" class="text-sm font-medium text-slate-500 transition hover:text-slate-900">
            忘记密码？
          </a>
        </div>

        <button
          type="submit"
          :disabled="!canSubmit || loading"
          class="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/30 transition-all duration-200 hover:bg-slate-800 hover:shadow-md hover:shadow-slate-900/20 active:scale-[0.99] active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-slate-900 animate-rise"
          style="animation-delay: 0.3s"
        >
          {{ loading ? '登录中…' : '登录功能维护中' }}
          <LucideIcon
            v-if="!loading"
            :icon="ArrowRight"
            class="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </form>

      <p class="text-center text-sm text-slate-500 animate-rise" style="animation-delay: 0.36s">
        还没有账号？
        <NuxtLink to="/auth/register" class="font-semibold text-slate-900 transition hover:underline">
          立即注册
        </NuxtLink>
      </p>
    </div>
  </AuthShell>
</template>
