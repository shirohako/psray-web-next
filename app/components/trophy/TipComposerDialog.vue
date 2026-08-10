<script setup lang="ts">
import { Loader2, Send } from 'lucide'
import { useTrophies } from '~/services/trophies'
import { ApiError } from '~/utils/ApiError'
import { TROPHY_LANGUAGE_CODES } from '~/utils/trophy'

const props = defineProps<{
  trophyId: number | string
  trophyName?: string
  displayLanguage: string
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  published: []
  cancelled: []
  closed: []
}>()

const { t } = useI18n()
const toast = useToast()
const { user } = useAuth()
const { createTrophyTip } = useTrophies()
const publishing = ref(false)
const content = ref('')
const language = ref(props.displayLanguage)
const spoiler = ref(false)
const fieldErrors = ref<Record<string, string>>({})

const draftKey = computed(() => user.value?.id
  ? `trophy-tip-draft:${user.value.id}:${props.trophyId}`
  : '')

function supportedLanguage(value: string) {
  if (TROPHY_LANGUAGE_CODES.includes(value)) return value
  return ({ ja: 'ja-JP', en: 'en-US', ko: 'ko-KR' } as Record<string, string>)[value] ?? 'ja-JP'
}

function saveDraft() {
  if (!import.meta.client || !draftKey.value || publishing.value) return
  const hasDraft = content.value || spoiler.value
  if (!hasDraft) {
    localStorage.removeItem(draftKey.value)
    return
  }
  localStorage.setItem(draftKey.value, JSON.stringify({
    content: content.value,
    language: language.value,
    spoiler: spoiler.value,
  }))
}

function restoreDraft() {
  language.value = supportedLanguage(props.displayLanguage || language.value)
  if (!import.meta.client || !draftKey.value) return
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey.value) || 'null')
    if (!draft) return
    content.value = typeof draft.content === 'string' ? draft.content : ''
    language.value = TROPHY_LANGUAGE_CODES.includes(draft.language)
      ? draft.language
      : supportedLanguage(props.displayLanguage)
    spoiler.value = draft.spoiler === true
  }
  catch {
    localStorage.removeItem(draftKey.value)
  }
}

watch([content, language, spoiler], saveDraft)

function validate() {
  const errors: Record<string, string> = {}
  const trimmed = content.value.trim()
  if (!trimmed) errors.content = t('trophy.tips.form.errors.contentRequired')
  else if (trimmed.length > 10_000) errors.content = t('trophy.tips.form.errors.contentLength')
  if (!TROPHY_LANGUAGE_CODES.includes(language.value)) errors.language = t('trophy.tips.form.errors.language')
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function publish() {
  if (!validate() || publishing.value) return
  publishing.value = true
  try {
    await createTrophyTip(props.trophyId, {
      content: content.value.trim(),
      content_type: 'markdown',
      language: language.value,
      spoiler: spoiler.value,
    })
    if (draftKey.value) localStorage.removeItem(draftKey.value)
    content.value = ''
    spoiler.value = false
    fieldErrors.value = {}
    emit('published')
    emit('update:open', false)
    toast.success({ title: t('trophy.tips.form.published') })
  }
  catch (error) {
    if (error instanceof ApiError && error.isValidation) {
      fieldErrors.value = { ...fieldErrors.value, ...error.fieldErrors() }
    }
    toast.error({
      title: t('trophy.tips.form.publishFailed'),
      description: error instanceof ApiError ? error.message : undefined,
    })
  }
  finally {
    publishing.value = false
  }
}

function onOpenChange(value: boolean) {
  if (!value && publishing.value) return
  emit('update:open', value)
  if (!value) emit('cancelled')
}

watch(() => props.open, (value) => {
  if (!value) return
  fieldErrors.value = {}
  restoreDraft()
})
</script>

<template>
  <Dialog :open="open" size="4xl" @update:open="onOpenChange" @closed="emit('closed')">
    <template #title>
      {{ $t('trophy.tips.form.heading') }}
      <span v-if="trophyName" class="ml-1 font-normal text-slate-400">· {{ trophyName }}</span>
    </template>

    <form class="space-y-5 p-4 sm:p-5" @submit.prevent="publish">
      <p class="text-xs text-slate-400">{{ $t('trophy.tips.form.draftHint') }}</p>

      <LazyMarkdownEditor v-model="content" :disabled="publishing" :error="fieldErrors.content" />

      <div class="space-y-3">
        <label class="block w-full">
          <span class="mb-1.5 block text-xs font-semibold text-slate-600">{{ $t('trophy.tips.form.language') }}</span>
          <select
            v-model="language"
            :disabled="publishing"
            class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-4"
            :class="fieldErrors.language ? 'border-rose-300 focus:ring-rose-500/10' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'"
          >
            <option v-for="code in TROPHY_LANGUAGE_CODES" :key="code" :value="code">{{ langLabel(code) }}</option>
          </select>
          <span v-if="fieldErrors.language" class="mt-1 block text-xs font-medium text-rose-600">{{ fieldErrors.language }}</span>
        </label>

        <label class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <input v-model="spoiler" type="checkbox" :disabled="publishing" class="size-4 accent-slate-900" />
          <span>
            <span class="block text-xs font-semibold text-slate-700">{{ $t('trophy.tips.form.spoiler') }}</span>
            <span class="block text-[11px] text-slate-400">{{ $t('trophy.tips.form.spoilerHint') }}</span>
          </span>
        </label>
      </div>

      <div class="flex items-center justify-between gap-3">
        <span class="text-xs tabular-nums" :class="content.length > 10000 ? 'font-semibold text-rose-600' : 'text-slate-400'">
          {{ content.length.toLocaleString() }} / 10,000
        </span>
        <button
          type="submit"
          :disabled="publishing"
          class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LucideIcon :icon="publishing ? Loader2 : Send" class="size-4" :class="{ 'animate-spin': publishing }" />
          {{ publishing ? $t('trophy.tips.form.publishing') : $t('trophy.tips.form.publish') }}
        </button>
      </div>
    </form>
  </Dialog>
</template>
