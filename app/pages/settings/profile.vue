<script setup lang="ts">
import { AlertTriangle, IdCard, Image, Loader2, RefreshCw, User } from 'lucide'
import type { UpdateSettingPayload, UserSetting } from '~/services/account'
import { useAccountApi } from '~/services/account'
import { ApiError } from '~/utils/ApiError'

const { user, fetchMe } = useAuth()
const { t } = useI18n()
const appConfig = useAppConfig()
const toast = useToast()
const accountApi = useAccountApi()

// Load the current banner/avatar settings when the page opens — `useAuth()`'s
// `user` only carries the PSN-synced `avatar_url` plus the `has_custom_avatar`
// flag, not the raw `banner_url` / custom `avatar_url` pair this form edits.
// Awaited (like `p/[psnid].vue`) so the form seeds from real data on first
// paint instead of racing an un-awaited fetch on client-side navigation.
const { data: setting, pending: settingPending, error: settingError, refresh: refreshSetting }
  = await useApiFetch<UserSetting>('/user/setting')

interface AvatarBannerFields {
  bannerUrl: string
  avatarMode: 'psn' | 'custom'
  avatarUrl: string
}

// `form` is what the inputs bind to. `preview` drives the header-bar preview
// above — it only follows `form` on demand, via the "update preview" buttons,
// so typing doesn't cause a flickering live preview. `saved` is the last-synced
// snapshot from the server, used to diff against on save so we only send the
// fields that actually changed (the API expects changed fields only).
const form = reactive<AvatarBannerFields>({ bannerUrl: '', avatarMode: 'psn', avatarUrl: '' })
const preview = reactive<AvatarBannerFields>({ bannerUrl: '', avatarMode: 'psn', avatarUrl: '' })
const saved = reactive<AvatarBannerFields>({ bannerUrl: '', avatarMode: 'psn', avatarUrl: '' })

const saving = ref(false)
const fieldErrors = ref<Record<string, string>>({})

const avatarOptions = [
  { value: 'psn', labelKey: 'settings.profile.avatar.usePsn' },
  { value: 'custom', labelKey: 'settings.profile.avatar.useCustom' },
] as const

// Seed the form + preview once `/user/setting` loads; re-seed if it's
// refetched (e.g. after a save). When custom, `avatar_url` already holds the
// custom image.
watch(setting, (s) => {
  if (!s) return
  const custom = s.use_custom_avatar
  form.bannerUrl = s.banner_url ?? ''
  form.avatarMode = custom ? 'custom' : 'psn'
  form.avatarUrl = custom ? (s.avatar_url ?? '') : ''
  Object.assign(preview, form)
  Object.assign(saved, form)
}, { immediate: true })

// Preview mirrors the profile header bar (see components/profile/Header.vue).
const previewBanner = computed(() => preview.bannerUrl.trim() || appConfig.profile.defaultBanner)
const previewAvatar = computed(() =>
  preview.avatarMode === 'custom' && preview.avatarUrl.trim()
    ? preview.avatarUrl.trim()
    : (user.value?.avatar_url || ''),
)
const initial = computed(() => user.value?.psnid?.slice(0, 1).toUpperCase() ?? '?')

function applyBannerPreview() {
  preview.bannerUrl = form.bannerUrl
}
// The mode toggle is a discrete choice, so it applies to the preview instantly;
// only the free-text URL waits for the "update preview" button.
function selectAvatarMode(mode: 'psn' | 'custom') {
  form.avatarMode = mode
  preview.avatarMode = mode
}
function applyAvatarPreview() {
  preview.avatarMode = form.avatarMode
  preview.avatarUrl = form.avatarUrl
}

async function save() {
  if (saving.value) return
  fieldErrors.value = {}

  const payload: UpdateSettingPayload = {}
  const trimmedBanner = form.bannerUrl.trim()
  if (trimmedBanner !== saved.bannerUrl) {
    payload.banner_url = trimmedBanner || null
  }

  if (form.avatarMode === 'custom') {
    const trimmedAvatar = form.avatarUrl.trim()
    if (!trimmedAvatar) {
      fieldErrors.value.avatar_url = t('settings.profile.avatar.urlRequired')
      return
    }
    if (trimmedAvatar !== saved.avatarUrl || saved.avatarMode !== 'custom') {
      payload.avatar_url = trimmedAvatar
      payload.use_custom_avatar = true
    }
  }
  else if (saved.avatarMode !== 'psn') {
    payload.use_custom_avatar = false
  }

  if (Object.keys(payload).length === 0) {
    toast.success({ title: t('settings.profile.noChanges') })
    return
  }

  saving.value = true
  try {
    await accountApi.updateSetting(payload)
    await Promise.all([fetchMe(), refreshSetting()])
    toast.success({ title: t('settings.profile.saved') })
  }
  catch (error) {
    if (error instanceof ApiError && error.isValidation) fieldErrors.value = error.fieldErrors()
    toast.error({
      title: t('settings.profile.saveFailed'),
      description: error instanceof ApiError ? error.message : undefined,
    })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div class="space-y-7 p-5">
      <div class="overflow-hidden rounded-lg border border-stone-800 bg-stone-900 text-white shadow-sm">
        <div class="p-5">
          <div class="flex min-w-0 items-start gap-3">
            <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-white/10 text-sky-200 ring-1 ring-white/15">
              <LucideIcon :icon="User" class="size-5.5" />
            </span>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wide text-sky-200">Profile center</p>
              <h3 class="mt-1 text-xl font-bold tracking-tight text-white">{{ $t('settings.profile.heading') }}</h3>
              <p class="mt-1 max-w-xl text-sm leading-relaxed text-stone-300">
                {{ $t('settings.profile.subheading') }}
              </p>
            </div>
          </div>
        </div>
      </div>

    <!-- Loading -->
    <div v-if="settingPending" class="space-y-7">
      <div class="h-48 animate-pulse rounded-xl bg-slate-200" />
      <div class="h-32 animate-pulse rounded-lg bg-slate-200" />
      <div class="h-32 animate-pulse rounded-lg bg-slate-200" />
    </div>

    <!-- Error -->
    <div
      v-else-if="settingError"
      class="flex items-center justify-between gap-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3"
    >
      <p class="flex items-center gap-2 text-sm font-medium text-rose-700">
        <LucideIcon :icon="AlertTriangle" class="size-4.5 shrink-0" />
        {{ $t('settings.profile.loadFailed') }}
      </p>
      <button
        type="button"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
        @click="refreshSetting()"
      >
        <LucideIcon :icon="RefreshCw" class="size-4" />
        {{ $t('common.retry') }}
      </button>
    </div>

    <div v-else class="space-y-7">
      <!-- Live preview of the profile header bar -->
      <div>
        <div class="overflow-hidden rounded-xl border border-slate-200 ring-1 ring-slate-900/5">
          <div
            class="relative h-48 bg-slate-300 bg-cover bg-center sm:h-64"
            :style="{ backgroundImage: `url(${previewBanner})` }"
          >
            <div class="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-black/5" />
          </div>
          <div class="px-4 pb-4">
            <img
              v-if="previewAvatar"
              :src="previewAvatar"
              :alt="user?.psnid"
              class="relative z-10 -mt-18 size-24 rounded-xl border-4 border-white bg-white object-cover shadow-md sm:-mt-22 sm:size-28"
            />
            <span
              v-else
              class="relative z-10 -mt-18 grid size-24 place-items-center rounded-xl border-4 border-white bg-slate-900 text-2xl font-bold text-white shadow-md sm:-mt-22 sm:size-28"
            >
              {{ initial }}
            </span>
            <h3 class="mt-3 text-lg font-bold text-slate-900">{{ user?.psnid }}</h3>
          </div>
        </div>
      </div>

      <!-- Banner -->
      <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/3">
        <div class="flex items-start gap-3">
          <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100">
            <LucideIcon :icon="Image" class="size-4.5" />
          </span>
          <div class="min-w-0">
            <h4 class="text-sm font-semibold text-slate-900">{{ $t('settings.profile.banner.title') }}</h4>
            <p class="mt-0.5 text-xs text-slate-500">{{ $t('settings.profile.banner.hint') }}</p>
          </div>
        </div>
        <div class="mt-3 space-y-2">
          <div>
            <label for="banner-url" class="mb-1.5 block text-sm font-medium text-slate-700">{{ $t('settings.profile.banner.urlLabel') }}</label>
            <div class="flex items-center gap-2">
              <input
                id="banner-url"
                v-model="form.bannerUrl"
                type="url"
                placeholder="https://…/banner.jpg"
                class="w-full flex-1 rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-900 transition placeholder:text-slate-400 hover:bg-white focus:bg-white focus:outline-none focus:ring-4"
                :class="fieldErrors.banner_url
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-slate-900/10'"
              />
              <button
                type="button"
                class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                @click="applyBannerPreview"
              >
                <LucideIcon :icon="RefreshCw" class="size-4" />
                {{ $t('settings.profile.updatePreview') }}
              </button>
            </div>
            <p v-if="fieldErrors.banner_url" class="mt-1.5 text-xs font-medium text-rose-600">{{ fieldErrors.banner_url }}</p>
          </div>
          <p class="text-xs leading-relaxed text-slate-400">
            {{ $t('settings.profile.banner.sizeHint') }}
          </p>
          <p class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-relaxed text-slate-400">
            {{ $t('settings.profile.banner.uploadHint') }}
          </p>
        </div>
      </section>

      <!-- Avatar -->
      <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/3">
        <div class="flex items-start gap-3">
          <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-violet-100">
            <LucideIcon :icon="IdCard" class="size-4.5" />
          </span>
          <div class="min-w-0">
            <h4 class="text-sm font-semibold text-slate-900">{{ $t('settings.profile.avatar.title') }}</h4>
            <p class="mt-0.5 text-xs text-slate-500">{{ $t('settings.profile.avatar.hint') }}</p>
          </div>
        </div>

        <div class="mt-3 inline-flex rounded-lg bg-slate-100 p-0.5">
          <button
            v-for="opt in avatarOptions"
            :key="opt.value"
            type="button"
            class="rounded-md px-3.5 py-1.5 text-sm font-medium transition"
            :class="form.avatarMode === opt.value ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
            @click="selectAvatarMode(opt.value)"
          >
            {{ $t(opt.labelKey) }}
          </button>
        </div>

        <div v-if="form.avatarMode === 'custom'" class="mt-3 space-y-2">
          <div>
            <label for="avatar-url" class="mb-1.5 block text-sm font-medium text-slate-700">{{ $t('settings.profile.avatar.urlLabel') }}</label>
            <div class="flex items-center gap-2">
              <input
                id="avatar-url"
                v-model="form.avatarUrl"
                type="url"
                placeholder="https://…/avatar.jpg"
                class="w-full flex-1 rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-900 transition placeholder:text-slate-400 hover:bg-white focus:bg-white focus:outline-none focus:ring-4"
                :class="fieldErrors.avatar_url
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-slate-900/10'"
              />
              <button
                type="button"
                class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                @click="applyAvatarPreview"
              >
                <LucideIcon :icon="RefreshCw" class="size-4" />
                {{ $t('settings.profile.updatePreview') }}
              </button>
            </div>
            <p v-if="fieldErrors.avatar_url" class="mt-1.5 text-xs font-medium text-rose-600">{{ fieldErrors.avatar_url }}</p>
          </div>
          <p class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-relaxed text-slate-400">
            {{ $t('settings.profile.avatar.uploadHint') }}
          </p>
        </div>
      </section>
      </div>
    </div>

    <div v-if="!settingPending && !settingError" class="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
      <button
        type="button"
        :disabled="saving"
        class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        @click="save"
      >
        <LucideIcon v-if="saving" :icon="Loader2" class="size-4 animate-spin" />
        {{ saving ? $t('common.saving') : $t('common.save') }}
      </button>
    </div>
  </section>
</template>
