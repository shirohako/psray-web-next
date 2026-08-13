<script setup lang="ts">
const updatedAt = '2026年8月12日'
const toc = [
  { id: 'operator', label: '基本方針' },
  { id: 'data', label: '取得する情報' },
  { id: 'purpose', label: '利用目的' },
  { id: 'cookies', label: 'Cookie 等' },
  { id: 'sharing', label: '提供・国外処理' },
  { id: 'retention', label: '保存・安全管理' },
  { id: 'rights', label: '請求・削除' },
  { id: 'other', label: '外部サービス等' },
  { id: 'contact', label: '変更・連絡先' },
]

useSeo({
  title: 'プライバシーポリシー',
  description: 'PSRay における個人データ、PSN 公開情報、Cookie、ログ、投稿内容の取扱いと、アクセス・訂正・削除の申請方法をご案内します。',
  staticLocale: 'ja',
})
</script>

<template>
  <StaticPageLayout
    class="px-1 py-2 sm:px-0 sm:py-0"
    eyebrow="Privacy Policy"
    title="プライバシーポリシー"
    lead="PSRay運営は、サービスの提供に必要な情報を適切に取り扱い、何を取得し、なぜ利用するのかを分かりやすくお伝えするよう努めます。"
    :updated-at="updatedAt"
    :items="toc"
    narrow
  >
    <div class="rounded-xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-7 text-sky-950">
      本ポリシーは、香港の Personal Data (Privacy) Ordinance（Cap. 486）を踏まえ、PSRay における個人データの取扱いを説明するものです。
    </div>

    <section id="operator" class="legal-section scroll-mt-24">
      <h2>1. 基本方針およびデータ利用者</h2>
      <p>PSRay運営（以下「運営者」といいます）は、PSRay（以下「本サービス」といいます）において取り扱う個人データを、適用される法令およびデータ保護原則に従い、公正かつ必要な範囲で取り扱います。</p>
      <dl class="mt-4 grid gap-2 rounded-lg bg-slate-50 p-4 sm:grid-cols-[8rem_1fr]">
        <dt class="font-semibold text-slate-700">データ利用者</dt>
        <dd>PSRay運営</dd>
        <dt class="font-semibold text-slate-700">連絡先</dt>
        <dd><a href="mailto:ame@abyss.moe?subject=%5BPSRay%5D%20%E3%83%97%E3%83%A9%E3%82%A4%E3%83%90%E3%82%B7%E3%83%BC%E3%81%AB%E9%96%A2%E3%81%99%E3%82%8B%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B">ame@abyss.moe</a></dd>
      </dl>
      <p>本サービスへ情報を提供するかどうかは原則として任意です。ただし、登録、本人確認、ログイン、投稿等に必要な情報を提供しない場合、該当する機能を利用できません。</p>
    </section>

    <section id="data" class="legal-section scroll-mt-24">
      <h2>2. 取得または保有する情報</h2>
      <p>運営者は、次の情報を取得または保有する場合があります。</p>
      <ul>
        <li><strong>PSN の公開情報：</strong>PSN ID、アカウント識別子、アバター、自己紹介、国・地域、言語、PlayStation Plus の表示、ゲーム、トロフィー、獲得日時、進行状況その他公開プロフィールから取得できる情報</li>
        <li><strong>登録情報：</strong>メールアドレス、認証状態、PSRay 内の設定および登録日時</li>
        <li><strong>認証情報：</strong>パスワードを安全に検証するために必要な情報、ログイン用トークン、メール認証コードおよび PSN アカウント所有者確認に関する記録</li>
        <li><strong>投稿および交流：</strong>攻略コメント、評価、投票、フォロー、通報、お問い合わせその他ユーザーが送信した内容</li>
        <li><strong>プロフィール素材：</strong>ユーザーが指定またはアップロードするアバター、バナー画像およびその URL</li>
        <li><strong>利用および技術情報：</strong>IP アドレス、アクセス日時、閲覧ページ、ブラウザー、端末・OS の種類、言語設定、参照元、API リクエスト、同期処理、エラーおよびセキュリティログ</li>
        <li><strong>端末内の設定：</strong>Cookie または localStorage に保存される言語、表示密度、獲得率表示、ネタバレ表示、サイドバー状態および編集中の下書き</li>
      </ul>

      <h2>3. 情報の取得元</h2>
      <p>情報は、利用者本人からの入力、利用者のブラウザーや端末による自動送信、PlayStation Network 上で公開されている情報、本サービス内で行われた操作、および不具合・不正利用の調査過程から取得します。</p>
    </section>

    <section id="purpose" class="legal-section scroll-mt-24">
      <h2>4. 利用目的</h2>
      <p>取得した情報は、次の目的で必要な範囲に限り利用します。</p>
      <ul>
        <li>プロフィール、ゲーム、トロフィー、ランキングおよび同期機能の提供</li>
        <li>アカウントの登録、所有者確認、認証、設定および問い合わせ対応</li>
        <li>攻略コメント、投票、フォローその他コミュニティ機能の提供</li>
        <li>表示言語や表示方法など、利用者が選択した設定の保持</li>
        <li>不具合の調査、品質改善、利用状況の把握および新機能の開発</li>
        <li>スパム、不正アクセス、規約違反、権利侵害その他の不正利用の防止と対応</li>
        <li>データの訂正、アクセス、削除、非表示および再収録防止の申請処理</li>
        <li>法令上の義務への対応、権利の保護および紛争への対応</li>
      </ul>
      <p>運営者は、上記と両立しない新たな目的で情報を利用する場合、必要に応じて事前に説明し、同意その他適切な根拠を得ます。現時点で、個人データを第三者のダイレクトマーケティングに利用しません。</p>
    </section>

    <section id="cookies" class="legal-section scroll-mt-24">
      <h2>5. Cookie およびブラウザー保存領域</h2>
      <p>本サービスは、動作に必要な Cookie およびブラウザー保存領域を利用します。</p>
      <div class="mt-4 overflow-x-auto">
        <table class="min-w-full border-separate border-spacing-0 overflow-hidden text-left text-xs">
          <thead>
            <tr class="bg-slate-50 text-slate-700">
              <th class="border-y border-l border-slate-200 px-3 py-2.5 font-semibold">種類</th>
              <th class="border-y border-slate-200 px-3 py-2.5 font-semibold">目的</th>
              <th class="border-y border-r border-slate-200 px-3 py-2.5 font-semibold">無効化した場合</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border-b border-l border-slate-200 px-3 py-3 font-medium text-slate-700">認証 Cookie</td>
              <td class="border-b border-slate-200 px-3 py-3">ログイン状態と認証トークンの保持</td>
              <td class="border-b border-r border-slate-200 px-3 py-3">ログインが必要な機能を利用できません</td>
            </tr>
            <tr>
              <td class="border-b border-l border-slate-200 px-3 py-3 font-medium text-slate-700">設定 Cookie</td>
              <td class="border-b border-slate-200 px-3 py-3">言語、表示密度、獲得率、ネタバレ等の設定</td>
              <td class="border-b border-r border-slate-200 px-3 py-3">選択が保持されない場合があります</td>
            </tr>
            <tr>
              <td class="border-b border-l border-slate-200 px-3 py-3 font-medium text-slate-700">localStorage</td>
              <td class="border-b border-slate-200 px-3 py-3">サイドバー状態、移行用設定、攻略コメントの下書き</td>
              <td class="border-b border-r border-slate-200 px-3 py-3">下書きや画面設定が保持されません</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>これらはブラウザーの設定から削除または制限できます。現在の本サービスは、広告目的の第三者 Cookie を設置しません。将来、分析または広告目的の仕組みを導入する場合は、本ポリシーを更新し、必要な案内または同意手続を行います。</p>
    </section>

    <section id="sharing" class="legal-section scroll-mt-24">
      <h2>6. 委託、提供および開示</h2>
      <p>運営者は、次の場合を除き、個人データを第三者へ販売または提供しません。</p>
      <ul>
        <li>ホスティング、メール配信、ストレージ、セキュリティその他、本サービスの提供に必要な処理をサービス提供者へ委託する場合</li>
        <li>本人の指示または同意がある場合</li>
        <li>法令、裁判所、行政機関その他権限を有する機関から適法な要請を受けた場合</li>
        <li>利用者、運営者または第三者の生命、安全、権利および財産を保護するため合理的に必要な場合</li>
        <li>事業またはサービスの承継に伴い、適切な保護措置のもとで移転する場合</li>
      </ul>
      <p>本サービスのインフラまたは委託先が香港以外に所在する場合、情報が香港以外で処理または保存されることがあります。その場合、運営者は委託先の選定、アクセス制限その他合理的な方法により、情報の保護に努めます。</p>
      <p>PSN ID、アバター、ゲーム・トロフィー情報、公開プロフィール、投稿者名および投稿内容など、本サービス上で公開されることを前提とする情報は、インターネット上の閲覧者に公開されます。</p>
    </section>

    <section id="retention" class="legal-section scroll-mt-24">
      <h2>7. 保存期間</h2>
      <p>運営者は、サービスの提供、利用目的の達成、バックアップ、不正利用防止、紛争対応および法令上の義務に必要な期間、情報を保存します。必要性がなくなった情報は、合理的な期間内に削除、匿名化またはアクセス不能な状態にします。保存期間は、情報の種類、利用目的、機密性、技術上の制約および法的必要性により異なります。</p>
      <p>公開 PSN データの非表示申請を受けた場合、公開表示を停止し、再収録を防ぐために必要な PSN ID、アカウント識別子、申請および確認の記録を保持する場合があります。削除済みデータは、循環バックアップから直ちに消去されず、バックアップの更新に伴って利用不能となる場合があります。</p>

      <h2>8. 安全管理</h2>
      <p>運営者は、アクセス制限、認証、通信の保護、ログ、バックアップおよびソフトウェア更新など、情報の性質とリスクに応じた合理的な技術上・運用上の措置を講じます。ただし、インターネット上の送信または保存について絶対的な安全性を保証することはできません。</p>
    </section>

    <section id="rights" class="legal-section scroll-mt-24">
      <h2>9. アクセス、訂正および削除等の請求</h2>
      <p>本人は、適用法令の範囲で、自身に関する個人データへのアクセス、訂正、アカウント削除、公開 PSN データの非表示その他の対応を請求できます。請求時は、希望する手続、PSN ID、対象ページおよび必要な説明をメールでお知らせください。</p>
      <p>他人の情報を誤って変更または削除しないため、運営者は請求者の本人確認を行います。PSN アカウントの所有者確認では、一時的な確認文を PSN の自己紹介へ設定する方法等を案内する場合があります。PSN のパスワード、PSN の二段階認証コード、メールのパスワードを求めることはありません。</p>
      <p>請求への対応には、法令上認められる範囲で追加情報、本人確認または合理的な手数料が必要となる場合があります。また、法令上の例外、他者の権利保護、不正利用防止等の理由により、請求の全部または一部に対応できない場合は、その理由を可能な範囲で説明します。</p>
    </section>

    <section id="other" class="legal-section scroll-mt-24">
      <h2>10. 外部リンクおよび外部画像</h2>
      <p>本サービスには、PlayStation Network、ユーザーが指定した画像、関連ドキュメントその他の外部サイトや外部リソースへのリンクが含まれます。外部画像を表示すると、利用者のブラウザーから画像の提供元へ IP アドレス、ブラウザー情報、参照元等が送信される場合があります。外部サービスにおける情報の取扱いは、それぞれの提供者のポリシーをご確認ください。</p>

      <h2>11. 未成年者</h2>
      <p>未成年者は、居住地域の法令により必要な場合、保護者等の同意を得て本サービスを利用してください。運営者が、必要な同意なく不適切に未成年者の個人データを取得したことを認識した場合は、合理的な対応を行います。</p>
    </section>

    <section id="contact" class="legal-section scroll-mt-24">
      <h2>12. 本ポリシーの変更</h2>
      <p>運営者は、法令、サービス内容または情報の取扱いの変更に応じて、本ポリシーを改定する場合があります。重要な変更は、本サービスまたは運営者の X アカウント等、合理的な方法で案内します。ページ上部の最終更新日をご確認ください。</p>

      <h2>13. お問い合わせ</h2>
      <p>本ポリシー、個人データの取扱い、アクセス・訂正請求、データ非表示またはセキュリティに関するお問い合わせは、本ページ上部に記載の連絡先までお寄せください。</p>
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
.legal-section ul { margin-top: 0.75rem; list-style: disc; padding-left: 1.4rem; }
.legal-section li + li { margin-top: 0.45rem; }
.legal-section strong { color: var(--color-slate-800); font-weight: 650; }
.legal-section a { color: var(--color-sky-700); font-weight: 650; text-decoration: underline; }

@media (min-width: 640px) {
  .legal-section { padding: 1.75rem; }
}
</style>
