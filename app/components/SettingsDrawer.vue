<script setup lang="ts">
import { Languages, Percent, Check, Gamepad2, Trophy } from 'lucide'
import type { DisplayDensity, RateBasis, TrophyLangPref } from '~/composables/usePreferences'

/** Site preferences drawer. Open via `v-model:open`. */
const open = defineModel<boolean>('open', { default: false })

const {
  trophyLang,
  rateBasis,
  profileGameDensity,
  trophyDensity,
  saveTrophyLang,
  saveRateBasis,
  saveDensity,
} = usePreferences()
const { t } = useI18n()
const toast = useToast()

// Edit local drafts so nothing commits until save; re-sync on each open.
const draft = ref<TrophyLangPref>({ ...trophyLang.value })
const rateDraft = ref<RateBasis>(rateBasis.value)
const profileGameDensityDraft = ref<DisplayDensity>(profileGameDensity.value)
const trophyDensityDraft = ref<DisplayDensity>(trophyDensity.value)
watch(open, (v) => {
  if (v) {
    draft.value = { ...trophyLang.value }
    rateDraft.value = rateBasis.value
    profileGameDensityDraft.value = profileGameDensity.value
    trophyDensityDraft.value = trophyDensity.value
  }
})

const rateBasisOptions: { value: RateBasis; label: string }[] = [
  { value: 'psn', label: 'PSN' },
  { value: 'psray', label: 'PSRay' },
]

const densityOptions: DisplayDensity[] = ['dense', 'compact', 'standard']

// English names deliberately: this list picks the language the *API* should
// answer in, and PSN's own codes read the same way to everyone.
const languages = TROPHY_LANGUAGE_CODES.map(code => ({
  code,
  label: `${langNameEn(code)} (${code})`,
}))

// The only invalid combination is picking the same code twice; leaving both
// unset is allowed — on save it collapses into turning the preference off.
const sameLanguage = computed(
  () => !!draft.value.primary && draft.value.primary === draft.value.secondary,
)
const invalid = computed(() => draft.value.enabled && sameLanguage.value)

const error = computed(() => {
  if (!draft.value.enabled) return ''
  if (sameLanguage.value) return t('settings.prefs.lang.sameError')
  return ''
})

function save() {
  if (invalid.value) return
  // Drop unset slots (and any dupe) and promote what remains: with the toggle
  // on but no language chosen, the preference saves as disabled — same as
  // flipping the switch off.
  const [primary = '', secondary = ''] = [...new Set([draft.value.primary, draft.value.secondary].filter(Boolean))]
  saveTrophyLang(
    draft.value.enabled && primary
      ? { enabled: true, primary, secondary }
      : { enabled: false, primary: '', secondary: '' },
  )
  saveRateBasis(rateDraft.value)
  saveDensity('profileGame', profileGameDensityDraft.value)
  saveDensity('trophy', trophyDensityDraft.value)
  open.value = false
  toast.success({
    title: t('settings.prefs.saved.title'),
    description: t('settings.prefs.saved.description'),
  })
}
</script>

<template>
  <Drawer v-model:open="open" side="right" :title="$t('settings.prefs.title')">
    <div class="space-y-6 p-5">
      <!-- Trophy language preference -->
      <section>
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-2.5">
            <span class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
              <LucideIcon :icon="Languages" class="size-4.5" />
            </span>
            <div>
              <h3 class="text-sm font-semibold text-slate-900">{{ $t('settings.prefs.lang.title') }}</h3>
              <p class="mt-0.5 text-xs leading-relaxed text-slate-500">
                {{ $t('settings.prefs.lang.hint') }}
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
            <span class="mb-1 block text-xs font-medium text-slate-600">{{ $t('settings.prefs.lang.primary') }}</span>
            <select
              v-model="draft.primary"
              class="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition focus:border-slate-400 focus:outline-none"
            >
              <option value="">{{ $t('settings.prefs.lang.unset') }}</option>
              <option v-for="l in languages" :key="l.code" :value="l.code">{{ l.label }}</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-1 block text-xs font-medium text-slate-600">{{ $t('settings.prefs.lang.secondary') }}</span>
            <select
              v-model="draft.secondary"
              class="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition focus:border-slate-400 focus:outline-none"
            >
              <option value="">{{ $t('settings.prefs.lang.unset') }}</option>
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

      <!-- Profile recently-played row density -->
      <section>
        <div class="flex items-start gap-2.5">
          <span class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
            <LucideIcon :icon="Gamepad2" class="size-4.5" />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold text-slate-900">{{ $t('settings.prefs.density.profile.title') }}</h3>
            <p class="mt-0.5 text-xs leading-relaxed text-slate-500">
              {{ $t('settings.prefs.density.profile.hint') }}
            </p>
            <div class="mt-3 grid grid-cols-3 rounded-lg bg-slate-100 p-0.5">
              <button
                v-for="density in densityOptions"
                :key="density"
                type="button"
                :aria-pressed="profileGameDensityDraft === density"
                class="min-w-0 rounded-md px-1 py-1.5 text-xs font-medium transition"
                :class="profileGameDensityDraft === density ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
                @click="profileGameDensityDraft = density"
              >
                {{ $t(`settings.prefs.density.options.${density}`) }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Trophy row density -->
      <section>
        <div class="flex items-start gap-2.5">
          <span class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
            <LucideIcon :icon="Trophy" class="size-4.5" />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold text-slate-900">{{ $t('settings.prefs.density.trophy.title') }}</h3>
            <p class="mt-0.5 text-xs leading-relaxed text-slate-500">
              {{ $t('settings.prefs.density.trophy.hint') }}
            </p>
            <div class="mt-3 grid grid-cols-3 rounded-lg bg-slate-100 p-0.5">
              <button
                v-for="density in densityOptions"
                :key="density"
                type="button"
                :aria-pressed="trophyDensityDraft === density"
                class="min-w-0 rounded-md px-1 py-1.5 text-xs font-medium transition"
                :class="trophyDensityDraft === density ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
                @click="trophyDensityDraft = density"
              >
                {{ $t(`settings.prefs.density.options.${density}`) }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Trophy earn-rate basis -->
      <section>
        <div class="flex items-start gap-2.5">
          <span class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
            <LucideIcon :icon="Percent" class="size-4.5" />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold text-slate-900">{{ $t('settings.prefs.rate.title') }}</h3>
            <p class="mt-0.5 text-xs leading-relaxed text-slate-500">
              {{ $t('settings.prefs.rate.hint') }}
            </p>
            <div class="mt-3 inline-flex rounded-lg bg-slate-100 p-0.5">
              <button
                v-for="opt in rateBasisOptions"
                :key="opt.value"
                type="button"
                class="rounded-md px-3.5 py-1 text-sm font-medium transition"
                :class="rateDraft === opt.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
                @click="rateDraft = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
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
          {{ $t('common.cancel') }}
        </button>
        <button
          type="button"
          :disabled="invalid"
          class="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          @click="save"
        >
          <LucideIcon :icon="Check" class="size-4" stroke-width="2.5" />
          {{ $t('common.save') }}
        </button>
      </div>
    </template>
  </Drawer>
</template>
