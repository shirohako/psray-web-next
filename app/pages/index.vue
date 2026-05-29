<script setup lang="ts">
const stats = [
  { label: '总用户', value: '1,248', delta: '+12.5%' },
  { label: '活跃会话', value: '326', delta: '+4.1%' },
  { label: '今日请求', value: '8,901', delta: '+18.2%' },
  { label: '错误率', value: '0.4%', delta: '-0.2%' },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">欢迎回来 👋</h1>
      <p class="mt-1 text-sm text-slate-500">这是使用 Tailwind CSS 构建的固定上边栏 + 可折叠侧边栏布局。</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="s in stats"
        :key="s.label"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <p class="text-sm font-medium text-slate-500">{{ s.label }}</p>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900">{{ s.value }}</span>
          <span
            class="text-xs font-semibold"
            :class="s.delta.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'"
          >
            {{ s.delta }}
          </span>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-slate-900">开始使用</h2>
      <p class="mt-2 text-sm text-slate-500">
        点击左上角的按钮可以折叠或展开左侧菜单栏；上边栏会始终固定在顶部。
      </p>
    </div>
  </div>
</template>
