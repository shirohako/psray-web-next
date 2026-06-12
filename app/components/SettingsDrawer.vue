<script setup lang="ts">
import { Languages, Check } from 'lucide'
import type { TrophyLangPref } from '~/composables/usePreferences'

/** Site preferences drawer. Open via `v-model:open`. */
const open = defineModel<boolean>('open', { default: false })

const { trophyLang, saveTrophyLang } = usePreferences()
const toast = useToast()

// Edit a local draft so nothing commits until "保存"; re-sync on each open.
const draft = ref<TrophyLangPref>({ ...trophyLang.value })
watch(open, (v) => {
  if (v) draft.value = { ...trophyLang.value }
})

const languages = TROPHY_LANGUAGE_CODES.map(code => ({
  code,
  label: `${langNameEn(code)} (${code})`,
}))

const sameLanguage = computed(
  () => !!draft.value.primary && draft.value.primary === draft.value.secondary,
)
const incomplete = computed(
  () => draft.value.enabled && (!draft.value.primary || !draft.value.secondary),
)
const invalid = computed(() => draft.value.enabled && (incomplete.value || sameLanguage.value))

const error = computed(() => {
  if (!draft.value.enabled) return ''
  if (incomplete.value) return '启用后需同时选择首选语言和备选语言。'
  if (sameLanguage.value) return '首选语言与备选语言不能相同。'
  return ''
})

function save() {
  if (invalid.value) return
  saveTrophyLang(draft.value)
  open.value = false
  toast.success({ title: '设置已保存', description: '偏好已保存到本地。' })
}
</script>

<template>
  <Drawer v-model:open="open" side="left" title="设置">
    <div class="space-y-6 p-5">
      <!-- Trophy language preference -->
      <section>
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-2.5">
            <span class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
              <LucideIcon :icon="Languages" class="size-4.5" />
            </span>
            <div>
              <h3 class="text-sm font-semibold text-slate-900">奖杯语言偏好</h3>
              <p class="mt-0.5 text-xs leading-relaxed text-slate-500">
                启用后，所有请求将携带你选择的语言，服务器会据此优先返回对应的奖杯翻译。
              </p>
            </div>
          </div>

          <!-- Enable toggle -->
          <button
            type="button"
            role="switch"
            :aria-checked="draft.enabled"
            class="mt-0.5 shrink-0"
            @click="draft.enabled = !draft.enabled"
          >
            <span class="relative block h-5 w-9 rounded-full transition-colors" :class="draft.enabled ? 'bg-slate-900' : 'bg-slate-300'">
              <span class="absolute top-0.5 size-4 rounded-full bg-white shadow transition-all" :class="draft.enabled ? 'left-4.5' : 'left-0.5'" />
            </span>
          </button>
        </div>

        <!-- Language selectors -->
        <div v-if="draft.enabled" class="mt-4 space-y-3">
          <label class="block">
            <span class="mb-1 block text-xs font-medium text-slate-600">首选语言</span>
            <select
              v-model="draft.primary"
              class="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition focus:border-slate-400 focus:outline-none"
            >
              <option value="" disabled>请选择…</option>
              <option v-for="l in languages" :key="l.code" :value="l.code">{{ l.label }}</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-1 block text-xs font-medium text-slate-600">备选语言</span>
            <select
              v-model="draft.secondary"
              class="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition focus:border-slate-400 focus:outline-none"
            >
              <option value="" disabled>请选择…</option>
              <option
                v-for="l in languages"
                :key="l.code"
                :value="l.code"
                :disabled="l.code === draft.primary"
              >
                {{ l.label }}
              </option>
            </select>
          </label>

          <p v-if="error" class="text-xs font-medium text-rose-500">{{ error }}</p>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <button
          type="button"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          @click="open = false"
        >
          取消
        </button>
        <button
          type="button"
          :disabled="invalid"
          class="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          @click="save"
        >
          <LucideIcon :icon="Check" class="size-4" stroke-width="2.5" />
          保存
        </button>
      </div>
    </template>
  </Drawer>
</template>
