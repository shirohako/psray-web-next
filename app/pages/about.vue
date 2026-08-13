<script setup lang="ts">
import {
  BookOpen,
  Bug,
  CircleHelp,
  Code2,
  Database,
  ExternalLink,
  FileText,
  FilePenLine,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserRoundCog,
} from 'lucide'

const updatedAt = '2026年8月12日'
const toc = [
  { id: 'about', label: 'PSRay について' },
  { id: 'policies', label: '規約・プライバシー' },
  { id: 'data', label: 'データについて' },
  { id: 'removal', label: '削除・非表示' },
  { id: 'contact', label: '運営・お問い合わせ' },
  { id: 'docs', label: 'ドキュメント' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'open-source', label: 'オープンソース' },
]

const faqs = [
  {
    question: 'PSRay は PlayStation の公式サービスですか？',
    answer: 'いいえ。PSRay は独立して運営されるコミュニティサービスであり、Sony Interactive Entertainment Inc. およびその関連会社から承認、提携、運営されているものではありません。',
  },
  {
    question: 'PSRay を見るためにアカウントは必要ですか？',
    answer: 'いいえ。公開されているプロフィール、トロフィー情報、ランキング、コメントの閲覧には PSRay アカウントは必要ありません。コメントの投稿や一部のコミュニティ機能には登録が必要です。',
  },
  {
    question: 'プレイヤーを検索しても見つかりません。',
    answer: 'まだ PSRay に同期されていないか、PSN 側の公開設定により情報を取得できない可能性があります。PSN ID の表記を確認したうえで、同期ページから更新をお試しください。',
  },
  {
    question: 'トロフィーやプロフィールが最新ではありません。',
    answer: 'PSRay のデータはリアルタイムではありません。同期処理、キャッシュ、PSN 側の反映状況により時間差が生じます。しばらく待ってから再度同期してください。',
  },
  {
    question: 'PSN で非公開にした情報も表示されますか？',
    answer: 'PSRay は取得時点で公開されていた情報を保持している場合があります。公開設定を変更しても、保存済みデータへ直ちに反映されるとは限りません。削除を希望する場合は、データ非表示申請をご利用ください。',
  },
  {
    question: '削除後にもう一度掲載されることはありますか？',
    answer: '所有者確認が完了した非表示申請については、既存の公開プロフィールを非表示にし、同じアカウントが通常の同期操作で再び公開されないようにします。',
  },
  {
    question: 'データの間違いや不具合はどこへ報告できますか？',
    answer: 'PSN ID、対象ページの URL、問題の内容、可能であれば発生手順を添えてメールでご連絡ください。機密情報やパスワードは送らないでください。',
  },
  {
    question: 'トロフィー攻略は誰でも投稿できますか？',
    answer: 'PSRay に登録し、必要な利用条件を満たしたユーザーが投稿できます。投稿には利用規約とコミュニティ上のルールが適用されます。Markdown の詳しい書き方はガイドをご覧ください。',
  },
  {
    question: 'PSRayのAPIは利用できますか？',
    answer: '開発者向けAPIは現在準備中です。仕様、利用条件、認証方法、レート制限を整備したうえで公開する予定です。',
  },
]

const faqNumberClasses = [
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

const openFaqs = ref(new Set<number>())

function toggleFaq(index: number) {
  const next = new Set(openFaqs.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  openFaqs.value = next
}

function mailto(subject: string) {
  return `mailto:ame@abyss.moe?subject=${encodeURIComponent(`[PSRay] ${subject}`)}`
}

useSeo({
  title: 'PSRay について',
  description: 'PSRay のサービス概要、PSN データの取得と更新、削除・非表示の申請方法、利用規約・プライバシーポリシー、運営情報、ドキュメント、よくある質問をご案内します。',
  staticLocale: 'ja',
})
</script>

<template>
  <StaticPageLayout
    class="px-1 py-2 sm:px-0 sm:py-0"
    eyebrow="About PSRay"
    title="遊ぶ。集める。振り返る。"
    lead="PSRay は、PlayStation のトロフィー情報を探し、整理し、プレイヤー同士で攻略を共有するためのコミュニティサービスです。このページでは、掲載データの扱いと運営方針をご案内します。"
    :updated-at="updatedAt"
    :items="toc"
  >
    <section id="about" class="scroll-mt-24 rounded-2xl border border-violet-200 bg-linear-to-br from-white to-violet-50/70 p-5 shadow-sm sm:p-7">
      <div class="flex items-center gap-3">
        <span class="grid size-12 shrink-0 place-items-center rounded-xl border border-violet-200 bg-white p-1.5 shadow-sm shadow-violet-900/10">
          <img src="/logo.png" alt="" class="size-full object-contain" />
        </span>
        <h2 class="text-xl font-bold tracking-tight text-slate-950">PSRay について</h2>
      </div>
      <div class="mt-4 space-y-3 text-sm leading-7 text-slate-600">
        <p>プロフィール、獲得トロフィー、最近遊んだゲーム、ランキングなどを見やすくまとめ、トロフィーごとの攻略情報を共有できる場所を目指しています。</p>
        <p>PSRay は、Claude や GPT などの AI を活用して制作されています。</p>
        <p>PSRay は個人による独立したサービスです。Sony Interactive Entertainment Inc.、PlayStation、およびその関連会社との提携・承認・公式な関係はありません。PlayStation および関連する名称・商標は、それぞれの権利者に帰属します。</p>
      </div>
    </section>

    <section id="policies" class="scroll-mt-24 space-y-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.15em] text-sky-700">Policies</p>
        <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-950">利用規約・プライバシー</h2>
        <p class="mt-2 text-sm leading-7 text-slate-500">PSRay を安心してご利用いただくための条件と、データの取扱いをご案内します。</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink to="/terms" class="group rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
          <LucideIcon :icon="FileText" class="size-5 text-amber-700" />
          <div class="mt-3 flex items-center justify-between gap-3">
            <h3 class="font-bold text-slate-900">利用規約</h3>
            <span class="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600">→</span>
          </div>
          <p class="mt-2 text-sm leading-6 text-slate-500">アカウント、投稿、禁止事項、サービスの利用条件をご確認ください。</p>
        </NuxtLink>
        <NuxtLink to="/privacy" class="group rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
          <LucideIcon :icon="ShieldCheck" class="size-5 text-emerald-700" />
          <div class="mt-3 flex items-center justify-between gap-3">
            <h3 class="font-bold text-slate-900">プライバシーポリシー</h3>
            <span class="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600">→</span>
          </div>
          <p class="mt-2 text-sm leading-6 text-slate-500">個人データ、PSN 公開情報、Cookie、削除申請の取扱いをご確認ください。</p>
        </NuxtLink>
      </div>
    </section>

    <section id="data" class="scroll-mt-24 space-y-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.15em] text-sky-700">Data</p>
        <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-950">掲載データについて</h2>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <article class="rounded-xl border border-sky-200 bg-sky-50/60 p-5 shadow-sm shadow-sky-900/5">
          <span class="grid size-9 place-items-center rounded-lg bg-sky-100 text-sky-700"><LucideIcon :icon="Database" class="size-4.5" /></span>
          <h3 class="mt-3 font-bold text-slate-900">データの取得について</h3>
          <p class="mt-2 text-sm leading-7 text-slate-600">PlayStation Network 上で公開されているプレイヤープロフィール、ゲーム、トロフィーおよび獲得状況を取得します。コメントなど、ユーザーが PSRay に直接投稿した情報も表示します。</p>
        </article>
        <article class="rounded-xl border border-cyan-200 bg-cyan-50/60 p-5 shadow-sm shadow-cyan-900/5">
          <span class="grid size-9 place-items-center rounded-lg bg-cyan-100 text-cyan-700"><LucideIcon :icon="RefreshCw" class="size-4.5" /></span>
          <h3 class="mt-3 font-bold text-slate-900">データの更新について</h3>
          <p class="mt-2 text-sm leading-7 text-slate-600">PSRayのデータは、PSNから情報を読み込むことで更新されます。PSN 側の反映状況によって表示に時間差が生じることがあります。</p>
        </article>
      </div>
      <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
        PSN の公開設定を変更しても、PSRay に保存済みの情報が直ちに更新・削除されるとは限りません。掲載を希望しない場合は、下記の非表示申請をご利用ください。
      </div>
    </section>

    <section id="removal" class="scroll-mt-24 rounded-2xl border border-emerald-200 bg-linear-to-br from-white to-emerald-50/60 p-5 shadow-sm sm:p-7">
      <div class="flex items-center gap-3">
        <LucideIcon :icon="ShieldCheck" class="size-5 text-emerald-700" />
        <h2 class="text-xl font-bold tracking-tight text-slate-950">データの削除・非表示</h2>
      </div>
      <p class="mt-3 text-sm leading-7 text-slate-600">公開 PSN データの非表示と、PSRay に登録したアカウントの削除は別の手続きです。</p>
      <ol class="mt-5 grid gap-3 sm:grid-cols-3">
        <li class="rounded-xl border border-sky-100 bg-sky-50/80 p-4">
          <span class="text-xs font-bold text-sky-700">01</span>
          <h3 class="mt-1 text-sm font-bold text-slate-900">申請する</h3>
          <p class="mt-1.5 text-xs leading-6 text-slate-500">対象の PSN ID と希望する手続きをメールでお知らせください。</p>
        </li>
        <li class="rounded-xl border border-violet-100 bg-violet-50/80 p-4">
          <span class="text-xs font-bold text-violet-700">02</span>
          <h3 class="mt-1 text-sm font-bold text-slate-900">所有者を確認</h3>
          <p class="mt-1.5 text-xs leading-6 text-slate-500">一時的な確認文を PSN の自己紹介へ設定するなど、安全な方法で確認します。</p>
        </li>
        <li class="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
          <span class="text-xs font-bold text-emerald-700">03</span>
          <h3 class="mt-1 text-sm font-bold text-slate-900">非表示にする</h3>
          <p class="mt-1.5 text-xs leading-6 text-slate-500">確認後、公開表示を停止し、通常の同期による再収録を防止します。</p>
        </li>
      </ol>
      <div class="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-bold text-slate-900">PSN のパスワードは絶対に送らないでください</p>
          <p class="mt-1 text-xs leading-5 text-slate-500">PSRay運営が PSN のパスワード、認証コード、秘密の質問を求めることはありません。</p>
        </div>
        <a :href="mailto('データ削除申請')" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
          <LucideIcon :icon="Mail" class="size-4" />
          非表示を申請
        </a>
      </div>
    </section>

    <section id="contact" class="scroll-mt-24 space-y-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.15em] text-sky-700">Contact</p>
        <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-950">運営・お問い合わせ</h2>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <article class="rounded-xl border border-violet-200 bg-violet-50/50 p-5 shadow-sm">
          <LucideIcon :icon="UserRoundCog" class="size-5 text-violet-700" />
          <h3 class="mt-3 font-bold text-slate-900">メンテナンス</h3>
          <p class="mt-2 text-sm leading-7 text-slate-600">PSRay は現在も開発を続けており、一部の機能は順次提供する予定です。メンテナンスや機能更新に関するお知らせは、運営者の Twitter (X) アカウントで随時発信します。</p>
          <a href="https://x.com/shionari_" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:underline">
            運営者の Twitter (X) を見る
            <LucideIcon :icon="ExternalLink" class="size-3.5" />
          </a>
        </article>
        <article class="rounded-xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
          <LucideIcon :icon="Bug" class="size-5 text-rose-700" />
          <h3 class="mt-3 font-bold text-slate-900">不具合・データ訂正</h3>
          <p class="mt-2 text-sm leading-7 text-slate-600">不具合やデータの誤りは、対象ページの URL、PSN ID、詳細を添えてお知らせください。連絡は、運営者の Twitter (X) アカウントまでお寄せください。</p>
        </article>
      </div>
    </section>

    <section id="docs" class="scroll-mt-24 space-y-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.15em] text-sky-700">Documentation</p>
        <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-950">ドキュメント</h2>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink to="/docs/markdown" class="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
          <LucideIcon :icon="FilePenLine" class="size-5 text-sky-700" />
          <div class="mt-3 flex items-center justify-between gap-3">
            <h3 class="font-bold text-slate-900">Markdown の書き方</h3>
            <span class="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600">→</span>
          </div>
          <p class="mt-2 text-sm leading-6 text-slate-500">コメントで使える書式、画像、ネタバレ、拡張ブロックを紹介します。</p>
        </NuxtLink>
        <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
          <LucideIcon :icon="Code2" class="size-5 text-slate-500" />
          <div class="mt-3 flex items-center justify-between gap-3">
            <h3 class="font-bold text-slate-700">API ドキュメント</h3>
            <span class="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600">準備中</span>
          </div>
          <p class="mt-2 text-sm leading-6 text-slate-500">仕様、認証、利用条件、レート制限を整備しています。</p>
        </div>
      </div>
    </section>

    <section id="faq" class="scroll-mt-24 space-y-4">
      <div class="flex items-center gap-3">
        <LucideIcon :icon="CircleHelp" class="size-5 text-sky-700" />
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.15em] text-sky-700">FAQ</p>
          <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-950">よくある質問</h2>
        </div>
      </div>
      <div class="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm shadow-sky-900/5">
        <div v-for="(faq, index) in faqs" :key="faq.question" class="border-b border-slate-100 last:border-b-0">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-slate-800 transition-colors duration-200 hover:bg-slate-50 sm:px-6"
            :class="openFaqs.has(index) ? 'bg-sky-50/60' : 'bg-white'"
            :aria-expanded="openFaqs.has(index)"
            :aria-controls="`faq-answer-${index}`"
            @click="toggleFaq(index)"
          >
            <span class="flex items-center gap-3">
              <span
                class="faq-motion grid size-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold tabular-nums transition-transform duration-300"
                :class="[faqNumberClasses[index % faqNumberClasses.length], openFaqs.has(index) ? 'scale-105' : '']"
              >
                {{ String(index + 1).padStart(2, '0') }}
              </span>
              <span>{{ faq.question }}</span>
            </span>
            <span class="faq-motion shrink-0 text-lg font-light text-slate-400 transition-transform duration-300" :class="openFaqs.has(index) ? 'rotate-45' : ''">+</span>
          </button>
          <div
            :id="`faq-answer-${index}`"
            class="faq-answer-grid grid transition-[grid-template-rows,opacity] duration-300 ease-out"
            :class="openFaqs.has(index) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
          >
            <div class="overflow-hidden">
              <p class="border-t border-slate-100 bg-slate-50/70 pb-5 pl-16 pr-5 pt-4 text-sm leading-7 text-slate-600 sm:pl-19 sm:pr-6">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="open-source" class="scroll-mt-24 rounded-2xl border border-indigo-200 bg-linear-to-br from-white to-indigo-50/60 p-5 shadow-sm sm:p-7">
      <div class="flex items-center gap-3">
        <LucideIcon :icon="BookOpen" class="size-5 text-indigo-700" />
        <div>
          <h2 class="text-xl font-bold tracking-tight text-slate-950">オープンソースへの感謝</h2>
          <p class="mt-1 text-sm text-slate-500">PSRay は、以下のオープンソースプロジェクトに支えられています。</p>
        </div>
      </div>
      <a
        href="https://github.com/achievements-app/psn-api"
        target="_blank"
        rel="noopener noreferrer"
        class="group mt-5 flex items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-white/80 px-4 py-3.5 transition hover:border-indigo-300 hover:bg-white hover:shadow-sm"
      >
        <span class="flex min-w-0 items-center gap-3">
          <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-900 text-white">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="size-4 fill-current">
              <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.23.7-3.91-1.37-3.91-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.26 3.38.97.1-.75.4-1.26.74-1.55-2.58-.29-5.29-1.29-5.29-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.72 5.39-5.3 5.68.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
            </svg>
          </span>
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-slate-800 group-hover:text-indigo-700">psn-api</span>
            <span class="block truncate text-xs text-slate-400">github.com/achievements-app/psn-api</span>
          </span>
        </span>
        <LucideIcon :icon="ExternalLink" class="size-3.5 shrink-0 text-slate-300 group-hover:text-indigo-600" />
      </a>
    </section>
  </StaticPageLayout>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .faq-answer-grid,
  .faq-motion {
    transition: none;
  }
}
</style>
