# 参考文献

設計判断の出典と、必要になったときに辿る外部資料。通常の作業で読む必要はない。規則として採用したものは`DESIGN.md`等へ書き、ここから写して使わない。
文章やコードを取り込む場合は、利用条件を一次情報で確認し、[開発方針](development.md)に従って出典を残す。

## 考え方の出典

[画面の組み立て方](composition.md)の「利用者から始める」が依拠する、広く使われる枠組み。

| 資料 | 内容 | 対応する箇所 |
| --- | --- | --- |
| ISO 9241-11(ユーザビリティの定義)・ISO 9241-210(人間中心設計) | 特定の利用者が特定の利用状況で特定の目的を達成する際の有効さ・効率・満足度。利用状況の把握と検証の繰り返し | 誰が・どんな状況で・何をしたいか、叶えられるか・阻害していないか |
| Don Norman『誰のためのデザイン?』 | 実行の溝(何をすればよいか)と評価の溝(結果が分かるか) | 迷わないか |
| [Nielsen Norman Group: 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) | システム状態の可視化、誤りの防止、記憶より認識等のレビュー観点 | 確認 |
| ペルソナ・シナリオ・Jobs to be Done | 利用者像、利用の流れ、利用者が片付けたい用事から考える方法 | 利用者のストーリー |

## エージェント向けのデザイン指針・スキル

| 資料 | 内容 | 参考にする点 | 利用条件 |
| --- | --- | --- | --- |
| [Anthropic frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | 主題に固有の見た目へ導くスキル。計画→見直し→実装の手順 | 既定の作風の名指しでの回避、計画の自己レビュー、仕上げ前に要素を一つ削る | 第三者の掲載ではApache-2.0。未確認 |
| [Anthropic: Prompting for frontend aesthetics](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics) | 出力がありがちな選択へ収束する傾向と、その対策プロンプト | 次元別(文字・色・動き・背景)の指示、避ける既定値の明示 | 未確認 |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | frontend-designを発展させたスキル群。意図別コマンド、品質の下限、検出CLI | `skill/reference/craft-floor.md`の品質下限と禁止事項、`mode-operate.md`の業務UIの扱い、意図別のskill分割、決定的な検出 | Apache-2.0 |
| [OpenAI: Designing delightful frontends with GPT-5.4](https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4) | 事前のデザインシステム定義、参照画像、Playwrightでの確認 | 実装前の視覚方針の明文化、cardを操作の容器に限る、業務UIの文言、複数幅での検証 | 未確認 |
| [OpenAI frontend prompt guide](https://developers.openai.com/ja-JP/api/docs/guides/frontend-prompt) | そのまま使える前端向けプロンプト | cardの入れ子禁止等の具体的な制約 | 未確認 |
| [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines) | 操作・動き・レイアウト・内容・フォーム・性能・見た目の規則。レビュー用skillあり | 数値を伴う規則(操作領域、spinnerの表示遅延、`transition: all`禁止、入れ子の角丸、`tabular-nums`) | 未確認 |
| [ibelick/ui-skills](https://github.com/ibelick/ui-skills) | baseline-ui等、生成UIの基準を整えるskill群 | ファイル単位の監査と修正案の出し方 | 未確認 |
| [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | YAMLのtokenと文章で設計体系を記すDESIGN.md形式(alpha)とlint | 章立て(Do's and Don'tsを含む)、contrastや未使用tokenの機械検査 | Apache-2.0と報じられている。未確認 |

外部の規則は互いに矛盾することがある。例えばVercelは境界と影の併用を勧め、impeccableは境界と広い影の二重を避ける。frontend-designやOpenAIのsystem font回避は主にマーケティングページ向けで、日本語の業務UIへそのまま当てはめない。

## 日本語UI・公的なデザインシステム

| 資料 | 内容 | 参考にする点 | 利用条件 |
| --- | --- | --- | --- |
| [SmartHR Design System ライティング](https://smarthr.design/products/contents/) | 用字用語、UIテキスト、エラーメッセージ、ヘルプの指針 | 文言の判断基準(一貫性・統一感・検索性等)、エラーメッセージの型 | 未確認 |
| [デジタル庁デザインシステム](https://www.digital.go.jp/policies/servicedesign/designsystem) | 行政サービス向けのデザインシステム(β)。JIS X 8341-3・WCAG 2.2準拠 | 日本語の組版、アクセシビリティの実装指針 | デザインデータCC BY 4.0、コードMITと紹介されている。未確認 |

## 通知・メッセージ

| 資料 | 内容 | 参考にする点 | 利用条件 |
| --- | --- | --- | --- |
| [Primer: Accessible notifications and messages](https://primer.style/accessibility/toasts/) | トーストを推奨しない理由(WCAG 2.2.1・1.3.2・4.1.3・1.4.4等)と、場面別の代替 | トーストを用意しない判断の根拠、成功は画面の変化で伝える方針 | 未確認 |
| [Primer: Notification messaging](https://primer.style/product/ui-patterns/notification-messaging/) | Banner・InlineMessage・Dialogの使い分け | 場所に応じた選択、Dialog内ではBannerで結果を出す | 未確認 |
| [Adam Silver: Can toast messages be accessible?](https://adam-silver-2.kit.com/posts/can-toast-messages-be-accessible) | トーストの是非についての反対意見を含む議論 | 判断を見直すときの論点 | 未確認 |

## 破壊操作

| 資料 | 参考にする点 |
| --- | --- |
| [Primer: Delete pattern](https://primer.style/product/scenario-patterns/delete) | 確定ボタンに`danger`と操作名、手間を被害の大きさに合わせる、Remove/Deleteの使い分け |
| [Visa: Button usage](https://design.visa.com/components/button/usage/) | 破壊操作のボタンは控えめに使う |
| [Pleo: Action menu](https://telescope.pleo.io/components/action-menu/action-menu.guidelines)・[Mirakl: Deletion](https://design.mirakl.com/design/patterns/deletion) | 行の破壊操作をメニューの最後へ置く |
| [Shopify Polaris: Common actions](https://polaris-react.shopify.com/patterns/common-actions/overview) | 行の削除を右端の控えめなボタンで置く |

## トークン・部品の基盤

| 資料 | 内容 |
| --- | --- |
| [shadcn/ui Theming](https://ui.shadcn.com/docs/theming#theme-tokens) | 色の役割名の土台。[共通トークン契約](../tokens/README.md)で参照 |
| [Base UI](https://base-ui.com) | 部品の振る舞いの土台(MIT)。導入した版の説明は`node_modules/@base-ui/react/docs/` |
| [Tailwind CSS: Theme variables](https://tailwindcss.com/docs/theme) | `@theme`の名前空間と`inline`・`reference`。[対応表](../tailwind/theme.css)の仕組み |
