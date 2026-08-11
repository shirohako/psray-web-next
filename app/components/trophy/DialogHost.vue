<script setup lang="ts">
import type { Trophy } from '~/services/trophies'

const props = defineProps<{
  trophies: Trophy[]
  displayLanguage: string
}>()

const emit = defineEmits<{
  count: [trophyId: number, value: number]
}>()

type DialogKind = 'detail' | 'earners' | 'tips'

const route = useRoute()
const selected = shallowRef<Trophy | null>(null)
const detailOpen = ref(false)
const earnersOpen = ref(false)
const tipsOpen = ref(false)
const composerOpen = ref(false)
const detailMounted = ref(false)
const earnersMounted = ref(false)
const tipsMounted = ref(false)
const composerMounted = ref(false)
const composerMode = ref<'create' | 'edit'>('create')
const destination = ref<'tips' | 'composer' | null>(null)

const trophyName = computed(() => {
  const trophy = selected.value
  return trophy?.localized_name || trophy?.name || ''
})

function open(kind: DialogKind, trophy: Trophy) {
  selected.value = trophy
  destination.value = null
  if (kind === 'detail') {
    detailMounted.value = true
    detailOpen.value = true
  }
  else if (kind === 'earners') {
    earnersMounted.value = true
    earnersOpen.value = true
  }
  else {
    tipsMounted.value = true
    tipsOpen.value = true
  }
}

function openTipComposer(mode: 'create' | 'edit') {
  composerMode.value = mode
  destination.value = 'composer'
  tipsOpen.value = false
}

function onTipsClosed() {
  tipsMounted.value = false
  if (destination.value !== 'composer') return
  destination.value = null
  composerMounted.value = true
  composerOpen.value = true
}

function returnToTips() {
  destination.value = 'tips'
}

function onComposerClosed() {
  composerMounted.value = false
  if (destination.value !== 'tips') return
  destination.value = null
  tipsMounted.value = true
  tipsOpen.value = true
}

function updateCount(value: number) {
  if (selected.value) emit('count', selected.value.id, value)
}

function openRouteTip(value: unknown) {
  const id = Array.isArray(value) ? value[0] : value
  if (typeof id !== 'string' && typeof id !== 'number') return
  const trophy = props.trophies.find(item => String(item.id) === String(id))
  if (trophy) open('tips', trophy)
}

watch(() => route.query.tips, openRouteTip, { immediate: true })

defineExpose({ open })
</script>

<template>
  <div class="contents">
    <LazyTrophyDetailDialog
      v-if="detailMounted && selected"
      v-model:open="detailOpen"
      :trophy="selected"
      @closed="detailMounted = false"
    />
    <LazyTrophyEarnersDialog
      v-if="earnersMounted && selected"
      v-model:open="earnersOpen"
      :trophy-id="selected.id"
      :trophy-name="trophyName"
      @closed="earnersMounted = false"
    />
    <LazyTrophyTipsDialog
      v-if="tipsMounted && selected"
      v-model:open="tipsOpen"
      :trophy-id="selected.id"
      :trophy-name="trophyName"
      @compose="openTipComposer"
      @closed="onTipsClosed"
      @count="updateCount"
    />
    <LazyTrophyTipComposerDialog
      v-if="composerMounted && selected"
      v-model:open="composerOpen"
      :trophy-id="selected.id"
      :trophy-name="trophyName"
      :display-language="displayLanguage"
      :editing="composerMode === 'edit'"
      @published="returnToTips"
      @deleted="returnToTips"
      @cancelled="returnToTips"
      @closed="onComposerClosed"
    />
  </div>
</template>
