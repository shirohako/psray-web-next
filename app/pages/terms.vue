<script setup lang="ts">
const updatedAt = '2026年8月12日'
const toc = [
  { id: 'application', label: '適用・定義' },
  { id: 'account', label: 'アカウント' },
  { id: 'prohibited', label: '禁止事項' },
  { id: 'content', label: '投稿コンテンツ' },
  { id: 'data', label: '外部データ' },
  { id: 'operation', label: '運営・変更' },
  { id: 'disclaimer', label: '免責・責任' },
  { id: 'termination', label: '利用終了' },
  { id: 'law', label: '準拠法・連絡先' },
]

useSeo({
  title: '利用規約',
  description: 'PSRay の利用条件、アカウント、投稿コンテンツ、禁止事項、免責事項などを定める利用規約です。',
  staticLocale: 'ja',
})
</script>

<template>
  <StaticPageLayout
    class="px-1 py-2 sm:px-0 sm:py-0"
    eyebrow="Terms of Service"
    title="利用規約"
    lead="この利用規約は、PSRay が提供するウェブサイトおよび関連機能をご利用いただく際の条件を定めるものです。ご利用前に内容をご確認ください。"
    :updated-at="updatedAt"
    :items="toc"
    narrow
  >
    <div class="rounded-xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-7 text-sky-950">
      本サービスを利用した場合、本規約に同意したものとみなします。アカウント登録時には、表示される同意手続を完了する必要があります。
    </div>

    <section id="application" class="legal-section scroll-mt-24">
      <h2>第1条（適用）</h2>
      <ol>
        <li>本規約は、PSRay運営（以下「運営者」といいます）が提供する PSRay（以下「本サービス」といいます）と、その利用者との間の一切の関係に適用されます。</li>
        <li>本規約と、本サービス上に掲載される個別の説明、注意事項またはガイドラインが異なる場合、個別の定めが優先されます。</li>
        <li>本サービスは個人により独立して運営されており、Sony Interactive Entertainment Inc.、PlayStation およびその関連会社の公式サービスではありません。</li>
      </ol>

      <h2>第2条（定義）</h2>
      <p>「登録ユーザー」とは、本規約およびプライバシーポリシーに同意し、所定の登録手続を完了した利用者をいいます。「投稿コンテンツ」とは、攻略コメント、文章、画像、プロフィール装飾その他、利用者が本サービスへ送信または掲載する情報をいいます。</p>
    </section>

    <section id="account" class="legal-section scroll-mt-24">
      <h2>第3条（登録およびアカウント）</h2>
      <ol>
        <li>登録希望者は、正確かつ最新の情報を提供し、運営者が定める方法により PSN アカウントの所有者確認を行うものとします。</li>
        <li>登録希望者が未成年である場合、居住地域の法令に従い、必要に応じて保護者等の同意を得たうえで利用してください。</li>
        <li>運営者は、虚偽の申告、不正利用のおそれ、過去の重大な違反その他合理的な理由がある場合、登録を拒否または取り消すことができます。</li>
        <li>登録ユーザーは、メールアドレス、パスワードおよび認証情報を自己の責任で管理し、第三者に利用させてはなりません。</li>
        <li>アカウントを通じて行われた操作は、運営者の責めに帰すべき事由がある場合を除き、当該登録ユーザーによるものとして取り扱います。不正利用に気付いた場合は、速やかに運営者へ連絡してください。</li>
      </ol>
    </section>

    <section id="prohibited" class="legal-section scroll-mt-24">
      <h2>第4条（禁止事項）</h2>
      <p>利用者は、本サービスの利用にあたり、次の行為を行ってはなりません。</p>
      <ul>
        <li>法令、公序良俗、本規約または第三者の権利に違反する行為</li>
        <li>他者への嫌がらせ、差別、脅迫、なりすまし、個人情報の無断公開</li>
        <li>虚偽、誤解を招く情報、マルウェア、迷惑広告または不正なリンクの投稿</li>
        <li>著作権、商標権、プライバシーその他の権利を侵害するコンテンツの投稿</li>
        <li>アカウント、認証コード、投票、ランキング、同期機能等の不正操作</li>
        <li>本サービスまたは第三者のシステムに過度な負荷を与えるアクセス、スクレイピング、自動化、脆弱性の悪用または回避</li>
        <li>公開前の API や内部エンドポイントを推測し、許可なく継続的に利用する行為</li>
        <li>本サービスの運営、安全性または他の利用者の利用を妨げる行為</li>
        <li>上記行為を援助、勧誘または準備する行為</li>
      </ul>
    </section>

    <section id="content" class="legal-section scroll-mt-24">
      <h2>第5条（投稿コンテンツ）</h2>
      <ol>
        <li>投稿者は、投稿コンテンツについて必要な権利を有し、その掲載が法令および第三者の権利を侵害しないことを保証するものとします。</li>
        <li>投稿コンテンツの権利は投稿者または正当な権利者に留保されます。投稿者は運営者に対し、本サービスの提供、表示、配信、検索、バックアップ、改善および告知に必要な範囲で、投稿コンテンツを無償で利用、複製、形式変換および公衆送信する非独占的な許諾を与えます。</li>
        <li>投稿者は、自身の投稿コンテンツを本サービスの機能により編集または削除できます。ただし、バックアップ、法令上必要な記録、他の利用者とのやり取りに組み込まれた情報等は直ちに消去されない場合があります。</li>
        <li>運営者は、違反の通報、権利者からの申立て、安全性またはサービス品質の確保のため、投稿コンテンツを確認、非表示、編集または削除できます。ただし、すべての投稿を事前に監視する義務を負いません。</li>
      </ol>
    </section>

    <section id="data" class="legal-section scroll-mt-24">
      <h2>第6条（PlayStation Network 等の外部情報）</h2>
      <ol>
        <li>本サービスは、PlayStation Network 上で公開されているプロフィール、ゲームおよびトロフィー情報を取得、整理して表示します。</li>
        <li>外部サービスの仕様、公開設定、障害、更新時期等により、情報が不完全、遅延または不正確となる場合があります。表示内容は公式記録を保証するものではありません。</li>
        <li>外部サービス、外部サイトおよび外部画像は各提供者の規約と方針に従います。運営者は外部サービスの継続提供、安全性または内容について管理しません。</li>
        <li>PlayStation、そのロゴ、製品名その他の商標は、それぞれの権利者に帰属します。</li>
      </ol>
    </section>

    <section id="operation" class="legal-section scroll-mt-24">
      <h2>第7条（知的財産権）</h2>
      <p>投稿コンテンツおよび第三者に帰属する素材を除き、本サービスを構成する独自の文章、デザイン、プログラム、データ編集物その他の成果物に関する権利は、運営者または正当な権利者に帰属します。オープンソースソフトウェアは、それぞれのライセンスに従います。</p>

      <h2>第8条（サービスの変更、停止および終了）</h2>
      <ol>
        <li>運営者は、保守、障害、安全上の必要、外部サービスの変更、法令対応その他合理的な理由により、本サービスの全部または一部を変更、制限、停止または終了できます。</li>
        <li>可能な場合、重要な変更や計画停止は本サービスまたは運営者の X アカウントで案内します。ただし、緊急時は事前通知を行わない場合があります。</li>
        <li>本サービスの特定の機能が将来にわたり提供されること、またはデータが永久に保存されることは保証されません。</li>
      </ol>
    </section>

    <section id="disclaimer" class="legal-section scroll-mt-24">
      <h2>第9条（保証の否認）</h2>
      <p>本サービスは現状有姿かつ提供可能な範囲で提供されます。運営者は、正確性、完全性、最新性、特定目的への適合性、継続性、セキュリティ、エラーや損失が生じないことについて、明示または黙示を問わず保証しません。利用者は、重要な情報を PlayStation の公式表示等でも確認してください。</p>

      <h2>第10条（責任の制限）</h2>
      <ol>
        <li>運営者の故意または重大な過失による場合、あるいは適用法令上制限できない場合を除き、本サービスの利用または利用不能から生じる損害について、運営者は責任を負いません。</li>
        <li>運営者が責任を負う場合でも、適用法令上許される範囲で、通常かつ直接の損害に限るものとし、逸失利益、データ喪失、間接損害または特別損害について責任を負いません。</li>
      </ol>
    </section>

    <section id="termination" class="legal-section scroll-mt-24">
      <h2>第11条（利用制限および登録抹消）</h2>
      <ol>
        <li>運営者は、利用者が本規約に違反した場合、または本サービスの安全な運営に必要な場合、事前通知なくコンテンツの非表示、機能制限、アカウント停止または登録抹消を行えます。</li>
        <li>登録ユーザーは、運営者へ連絡することによりアカウント削除を申請できます。アカウント削除と、公開 PSN データの非表示は別の手続きです。</li>
        <li>利用終了後も、その性質上存続すべき投稿利用許諾、知的財産、免責、責任制限および準拠法に関する条項は有効に存続します。</li>
      </ol>

      <h2>第12条（規約の変更）</h2>
      <p>運営者は、法令、サービス内容または運営上の必要に応じて本規約を変更できます。重要な変更は合理的な方法で案内し、変更後に本サービスを利用した場合は、変更後の規約に同意したものとみなします。</p>
    </section>

    <section id="law" class="legal-section scroll-mt-24">
      <h2>第13条（準拠法および管轄）</h2>
      <p>本規約は香港特別行政区の法律に準拠し、同法に従って解釈されます。本サービスまたは本規約に関して紛争が生じた場合、当事者はまず誠実に協議し、解決しない場合は香港特別行政区の管轄裁判所に付託するものとします。ただし、適用される消費者保護法その他の強行法規により別段の取扱いが必要な場合を除きます。</p>

      <h2>第14条（お問い合わせ）</h2>
      <p>本規約に関するお問い合わせは、<NuxtLink to="/about#contact">PSRay について</NuxtLink>ページに記載の窓口からご連絡ください。</p>
    </section>
  </StaticPageLayout>
</template>

<style scoped>
.legal-section {
  border: 1px solid var(--color-slate-200);
  border-radius: 0.875rem;
  background: white;
  padding: 1.25rem;
  box-shadow: 0 1px 2px rgb(15 23 42 / 4%);
  color: var(--color-slate-600);
  font-size: 0.875rem;
  line-height: 1.9;
}

.legal-section h2 {
  margin-top: 1.75rem;
  color: var(--color-slate-950);
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.5;
}

.legal-section h2:first-child { margin-top: 0; }
.legal-section p { margin-top: 0.75rem; }
.legal-section ol, .legal-section ul { margin-top: 0.75rem; padding-left: 1.4rem; }
.legal-section ol { list-style: decimal; }
.legal-section ul { list-style: disc; }
.legal-section li + li { margin-top: 0.45rem; }
.legal-section a { color: var(--color-sky-700); font-weight: 650; text-decoration: underline; }

@media (min-width: 640px) {
  .legal-section { padding: 1.75rem; }
}
</style>
