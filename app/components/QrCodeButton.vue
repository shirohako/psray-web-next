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
  /** Optional detail rows shown below the caption. */
  meta?: { label: string, value: string | number | null | undefined, copyable?: boolean }[]
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

async function copyMeta(value: string | number | null | undefined) {
  if (!import.meta.client || value == null) return
  try {
    await navigator.clipboard.writeText(String(value))
    toast.success({ title: '已复制' })
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
    <div class="flex flex-col items-center gap-3.5 px-6 py-5">
      <div class="rounded-lg bg-white p-2.5 ring-1 ring-slate-200">
        <img v-if="dataUrl" :src="dataUrl" alt="二维码" width="152" height="152" class="size-38" />
        <div v-else class="size-38 animate-pulse rounded bg-slate-100" />
      </div>
      <p v-if="caption" class="max-w-full truncate text-center text-sm font-semibold text-slate-800">{{ caption }}</p>
      <dl v-if="meta?.length" class="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs">
        <div
          v-for="item in meta"
          :key="item.label"
          class="flex items-start justify-between gap-3 py-1 first:pt-0 last:pb-0"
        >
          <dt class="shrink-0 text-slate-400">{{ item.label }}</dt>
          <dd class="flex min-w-0 items-center justify-end gap-1.5 text-right font-medium tabular-nums text-slate-700">
            <button
              v-if="item.copyable && item.value != null"
              type="button"
              class="grid size-5 shrink-0 place-items-center rounded text-slate-400 transition hover:bg-white hover:text-slate-700"
              title="复制"
              @click="copyMeta(item.value)"
            >
              <LucideIcon :icon="Copy" class="size-3" />
            </button>
            <span class="min-w-0 break-all">{{ item.value ?? '—' }}</span>
          </dd>
        </div>
      </dl>
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
