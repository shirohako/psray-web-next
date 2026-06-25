<script setup lang="ts">
import { QrCode, Copy } from 'lucide'
import QRCode from 'qrcode'

/**
 * Translucent banner button that opens a dialog with a QR code of the current
 * page URL. Styled for dark/banner backdrops — drop it into a positioned
 * wrapper (e.g. `absolute right-4 top-4`) in a banner's top-right corner.
 *
 * The QR is rendered with the `qrcode` library into a data URL on the client
 * when the dialog opens, so it always reflects the live page (incl. query).
 */
withDefaults(defineProps<{
  /** Dialog heading. */
  title?: string
  /** Optional caption shown above the URL (e.g. the page's name). */
  caption?: string
}>(), { title: '页面二维码' })

const open = ref(false)
const url = ref('')
const dataUrl = ref('')
const toast = useToast()

async function show() {
  open.value = true
  if (!import.meta.client) return
  url.value = window.location.href
  dataUrl.value = ''
  try {
    dataUrl.value = await QRCode.toDataURL(url.value, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 480,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
  } catch {
    toast.error({ title: '二维码生成失败' })
  }
}

async function copyLink() {
  if (!import.meta.client || !url.value) return
  try {
    await navigator.clipboard.writeText(url.value)
    toast.success({ title: '已复制链接' })
  } catch {
    toast.error({ title: '复制失败', description: '请检查浏览器的剪贴板权限。' })
  }
}
</script>

<template>
  <button
    type="button"
    title="页面二维码"
    aria-label="页面二维码"
    class="inline-flex size-9 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20"
    @click="show"
  >
    <LucideIcon :icon="QrCode" class="size-4.5" />
  </button>

  <Dialog v-model:open="open" :title="title" size="sm">
    <div class="flex flex-col items-center gap-4 px-6 py-6">
      <div class="rounded-xl bg-white p-3 ring-1 ring-slate-200">
        <img v-if="dataUrl" :src="dataUrl" alt="二维码" width="208" height="208" class="size-52" />
        <div v-else class="size-52 animate-pulse rounded bg-slate-100" />
      </div>
      <p v-if="caption" class="max-w-full truncate text-center text-sm font-semibold text-slate-800">{{ caption }}</p>
      <p class="max-w-full break-all text-center text-xs text-slate-400">{{ url }}</p>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
        @click="copyLink"
      >
        <LucideIcon :icon="Copy" class="size-4 text-slate-400" />
        复制链接
      </button>
    </div>
  </Dialog>
</template>
