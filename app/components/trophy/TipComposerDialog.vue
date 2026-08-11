<script setup lang="ts">
import { Loader2, Save, Send, Trash2 } from 'lucide'
import { useTips } from '~/services/tips'
import type { TipLanguage } from '~/types/tip'
import { ApiError } from '~/utils/ApiError'
import { TIP_LANGUAGE_CODES, normalizeTipLanguage } from '~/utils/tip'

const props = defineProps<{
  trophyId: number | string
  trophyName?: string
  displayLanguage: string
  editing: boolean
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  published: []
  deleted: []
  cancelled: []
  closed: []
}>()

const { t } = useI18n()
const toast = useToast()
const { user } = useAuth()
const { mine, remove, save } = useTips()
const publishing = ref(false)
const preparing = ref(false)
const deleting = ref(false)
const confirmingDelete = ref(false)
const draftPaused = ref(false)
const content = ref('')
const language = ref<TipLanguage>(normalizeTipLanguage(props.displayLanguage))
const spoiler = ref(false)
const missable = ref<boolean | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const draftKey = computed(() => user.value?.id
  ? `trophy-tip-draft:${user.value.id}:${props.trophyId}`
  : '')

function saveDraft() {
  if (!import.meta.client || !draftKey.value || publishing.value || deleting.value || draftPaused.value) return
  const hasDraft = content.value || spoiler.value || missable.value !== null
  if (!hasDraft) {
    localStorage.removeItem(draftKey.value)
    return
  }
  localStorage.setItem(draftKey.value, JSON.stringify({
    content: content.value,
    language: language.value,
    spoiler: spoiler.value,
    missable: missable.value,
  }))
}

function restoreDraft() {
  if (!import.meta.client || !draftKey.value) return false
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey.value) || 'null')
    if (!draft) return false
    content.value = typeof draft.content === 'string' ? draft.content : ''
    language.value = TIP_LANGUAGE_CODES.includes(draft.language)
      ? draft.language
      : normalizeTipLanguage(props.displayLanguage)
    spoiler.value = draft.spoiler === true
    missable.value = typeof draft.missable === 'boolean' ? draft.missable : null
    return true
  }
  catch {
    localStorage.removeItem(draftKey.value)
    return false
  }
}

function resetForm() {
  content.value = ''
  language.value = normalizeTipLanguage(props.displayLanguage)
  spoiler.value = false
  missable.value = null
}

async function prepareForm() {
  draftPaused.value = true
  preparing.value = true
  confirmingDelete.value = false
  fieldErrors.value = {}
  try {
    if (props.editing) {
      const tip = await mine(props.trophyId)
      content.value = tip.content
      language.value = tip.language
      spoiler.value = tip.has_spoiler
      missable.value = tip.missable
    }
    else {
      resetForm()
    }
    restoreDraft()
  }
  catch (error) {
    toast.error({
      title: t('trophy.tips.form.loadFailed'),
      description: error instanceof ApiError ? error.message : undefined,
    })
    emit('update:open', false)
    emit('cancelled')
  }
  finally {
    preparing.value = false
    await nextTick()
    draftPaused.value = false
  }
}

watch([content, language, spoiler, missable], saveDraft)

function validate() {
  const errors: Record<string, string> = {}
  const trimmed = content.value.trim()
  if (!trimmed) errors.content = t('trophy.tips.form.errors.contentRequired')
  else if (trimmed.length > 20_000) errors.content = t('trophy.tips.form.errors.contentLength')
  if (!TIP_LANGUAGE_CODES.includes(language.value)) errors.language = t('trophy.tips.form.errors.language')
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function publish() {
  if (!validate() || publishing.value || preparing.value || deleting.value) return
  publishing.value = true
  try {
    await save(props.trophyId, {
      content: content.value.trim(),
      language: language.value,
      has_spoiler: spoiler.value,
      missable: missable.value,
    })
    if (draftKey.value) localStorage.removeItem(draftKey.value)
    resetForm()
    fieldErrors.value = {}
    emit('published')
    emit('update:open', false)
    toast.success({ title: t(props.editing ? 'trophy.tips.form.updated' : 'trophy.tips.form.published') })
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

async function deleteTip() {
  if (!props.editing || deleting.value || publishing.value) return
  deleting.value = true
  try {
    await remove(props.trophyId)
    if (draftKey.value) localStorage.removeItem(draftKey.value)
    resetForm()
    confirmingDelete.value = false
    emit('deleted')
    emit('update:open', false)
    toast.success({ title: t('trophy.tips.form.deleted') })
  }
  catch (error) {
    toast.error({
      title: t('trophy.tips.form.deleteFailed'),
      description: error instanceof ApiError ? error.message : undefined,
    })
  }
  finally {
    deleting.value = false
  }
}

function onOpenChange(value: boolean) {
  if (!value && (publishing.value || deleting.value)) return
  emit('update:open', value)
  if (!value) emit('cancelled')
}

watch(() => props.open, (value) => {
  if (!value) return
  prepareForm()
}, { immediate: true })
</script>

<template>
  <Dialog :open="open" size="4xl" @update:open="onOpenChange" @closed="emit('closed')">
    <template #title>
      {{ $t(editing ? 'trophy.tips.form.headingEdit' : 'trophy.tips.form.heading') }}
      <span v-if="trophyName" class="ml-1 font-normal text-slate-400">· {{ trophyName }}</span>
    </template>

    <div v-if="preparing" class="flex items-center justify-center gap-2 px-5 py-20 text-sm text-slate-400">
      <LucideIcon :icon="Loader2" class="size-5 animate-spin" />
      {{ $t('trophy.tips.form.loading') }}
    </div>

    <form v-else class="space-y-5 p-4 sm:p-5" @submit.prevent="publish">
      <p class="text-xs text-slate-400">{{ $t('trophy.tips.form.draftHint') }}</p>

      <LazyMarkdownEditor v-model="content" :disabled="publishing || deleting" :error="fieldErrors.content" />

      <div class="space-y-3">
        <label class="block w-full">
          <span class="mb-1.5 block text-xs font-semibold text-slate-600">{{ $t('trophy.tips.form.language') }}</span>
          <select
            v-model="language"
            :disabled="publishing || deleting"
            class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-4"
            :class="fieldErrors.language ? 'border-rose-300 focus:ring-rose-500/10' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'"
          >
            <option v-for="code in TIP_LANGUAGE_CODES" :key="code" :value="code">{{ langLabel(code) }}</option>
          </select>
          <span v-if="fieldErrors.language" class="mt-1 block text-xs font-medium text-rose-600">{{ fieldErrors.language }}</span>
        </label>

        <div>
          <p class="mb-1.5 text-xs font-semibold text-slate-600">{{ $t('markdown.blocks.spoiler.title') }}</p>
          <label class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <input v-model="spoiler" type="checkbox" :disabled="publishing || deleting" class="size-4 accent-slate-900" />
            <span>
              <span class="block text-xs font-semibold text-slate-700">{{ $t('trophy.tips.form.spoiler') }}</span>
              <span class="block text-[11px] text-slate-400">{{ $t('trophy.tips.form.spoilerHint') }}</span>
            </span>
          </label>
        </div>

        <fieldset :disabled="publishing || deleting" class="disabled:opacity-60">
          <legend class="mb-1.5 text-xs font-semibold text-slate-600">{{ $t('trophy.tips.form.missable') }}</legend>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label class="cursor-pointer rounded-lg focus-within:ring-2 focus-within:ring-slate-400/40">
              <input v-model="missable" type="radio" :name="`tip-missable-${trophyId}`" :value="null" class="sr-only" />
              <span
                class="flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold transition"
                :class="missable === null ? 'border-slate-400 bg-slate-100 text-slate-800 ring-1 ring-slate-300/60' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'"
              >{{ $t('trophy.tips.form.missableUnset') }}</span>
            </label>
            <label class="cursor-pointer rounded-lg focus-within:ring-2 focus-within:ring-amber-400/40">
              <input v-model="missable" type="radio" :name="`tip-missable-${trophyId}`" :value="true" class="sr-only" />
              <span
                class="flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold transition"
                :class="missable === true ? 'border-amber-300 bg-amber-50 text-amber-700 ring-1 ring-amber-200/60' : 'border-slate-200 bg-white text-slate-500 hover:bg-amber-50/50'"
              >{{ $t('trophy.tips.form.missableYes') }}</span>
            </label>
            <label class="cursor-pointer rounded-lg focus-within:ring-2 focus-within:ring-emerald-400/40">
              <input v-model="missable" type="radio" :name="`tip-missable-${trophyId}`" :value="false" class="sr-only" />
              <span
                class="flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold transition"
                :class="missable === false ? 'border-emerald-300 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60' : 'border-slate-200 bg-white text-slate-500 hover:bg-emerald-50/50'"
              >{{ $t('trophy.tips.form.missableNo') }}</span>
            </label>
          </div>
        </fieldset>
      </div>

      <div v-if="editing && confirmingDelete" class="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs font-medium text-rose-700">{{ $t('trophy.tips.form.deleteConfirm') }}</p>
        <div class="flex shrink-0 items-center gap-2">
          <button type="button" class="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white/70" @click="confirmingDelete = false">
            {{ $t('common.cancel') }}
          </button>
          <button type="button" :disabled="deleting" class="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60" @click="deleteTip">
            <LucideIcon :icon="deleting ? Loader2 : Trash2" class="size-3.5" :class="{ 'animate-spin': deleting }" />
            {{ deleting ? $t('trophy.tips.form.deleting') : $t('trophy.tips.form.deleteConfirmAction') }}
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="text-xs tabular-nums" :class="content.length > 20000 ? 'font-semibold text-rose-600' : 'text-slate-400'">
          {{ content.length.toLocaleString() }} / 20,000
        </span>
        <div class="flex items-center gap-2">
          <button
            v-if="editing"
            type="button"
            :disabled="publishing || deleting"
            class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
            @click="confirmingDelete = true"
          >
            <LucideIcon :icon="Trash2" class="size-4" />
            {{ $t('trophy.tips.form.delete') }}
          </button>
          <button
            type="submit"
            :disabled="publishing || deleting"
            class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LucideIcon :icon="publishing ? Loader2 : (editing ? Save : Send)" class="size-4" :class="{ 'animate-spin': publishing }" />
            {{ publishing
              ? $t(editing ? 'trophy.tips.form.updating' : 'trophy.tips.form.publishing')
              : $t(editing ? 'trophy.tips.form.update' : 'trophy.tips.form.publish') }}
          </button>
        </div>
      </div>
    </form>
  </Dialog>
</template>
