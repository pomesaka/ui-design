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
| Jesse James Garrett『The Elements of User Experience』 | 戦略・要件・構造・骨格(interface・navigation・information design)・表層(visual design)の五段。抽象から具体へ、下の段で上の段の選択肢が決まる | 配置を見た目より先に決める順。書籍本文は未読で、二次資料で確認 |
| ソシオメディア『オブジェクト指向UIデザイン』(技術評論社、2020)・[紹介記事](https://gihyo.jp/book/pickup/2020/0034) | タスク(動詞)でなくオブジェクト(名詞)を起点に画面を構成する | 進め方2の、扱う対象から骨格を作る手順 |

## 伝える順の出典

[DESIGN.md](../DESIGN.md#内容と操作)の、伝えたいことをレイアウト → デザイン → 言葉の順で伝える決まりが依拠するもの。この順はpomesakaの原則で、下の資料は同じ方向の主張を持つ。

| 資料 | 主張 | 対応する箇所 |
| --- | --- | --- |
| Don Norman『誰のためのデザイン?』 | 「When simple things need pictures, labels, or instructions, the design has failed.」(1章)。自然な対応付け(mapping)はlabelの必要を減らす。原著の該当箇所は未確認で、複数の読書メモで同じ文を確認 | 言葉は最後の手段 |
| Steve Krug『超明快 Webユーザビリティ』(Don't Make Me Think) | 第三法則「各ページの言葉を半分に減らし、残りをさらに半分に」。挨拶の文(happy talk)と使い方の説明が、削れる言葉の主な出どころ。説明は読まれず、ページそのものを説明不要にする | 補足の文・使い方の説明を足さない |
| [Refactoring UI: Labels are a last resort](https://www.refactoringui.com/previews/labels-are-a-last-resort) | 「項目名:値」は全部を同じ強さにする。形や文脈で分かる値は項目名を外し、項目名を値に入れる。残す項目名は控えめにする。入力欄のlabelの話ではない | composition.mdの「項目名:値」の決定 |
| Robin Williams『ノンデザイナーズ・デザインブック』 | 近接・整列・反復・対比の四原則。関係のある物を近づけて一つのまとまりにする | 1. レイアウト、2. デザイン |
| [Nielsen Norman Group: 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) | 8「Every extra unit of information in an interface competes with the relevant units of information」。10「It's best if the system doesn't need any additional explanation.」 | 言葉が操作と値を埋もれさせる |
| WCAG 2.2 [1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)・[3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)・[4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) | 色だけで伝えない。入力にはlabelか説明を付ける(意図は不要な情報で画面を埋めないこと)。操作の部品の名前を支援技術が読める | 減らさない言葉 |

## 件数が増える一覧と表の出典

[件数が増える一覧と表](composition.md#件数が増える一覧と表)が依拠するもの。

| 資料 | 主張 | 対応する箇所 |
| --- | --- | --- |
| [NN/g: Data Tables: Four Major User Tasks](https://www.nngroup.com/articles/data-tables/)(2022) | 表の作業は、探す・比べる・1行を見る編集する・操作する。最初の列は読める識別にし、関係する列を隣に置く。画面より大きい表は見出しの行と列を固定する。離れた列を横scrollで比べさせない | 手段の表、列の決定 |
| [NN/g: Infinite Scrolling: When to Use It, When to Avoid It](https://www.nngroup.com/articles/infinite-scrolling-tips/)(2022) | 無限scrollは目的なく眺める同種の項目向き。特定の物を探す・比べるには向かない。footerに届かず、戻ると位置を失う。「さらに表示」とページ送りが代わりになり、どれも常に優れるわけではない | 無限scrollを使わない、眺めるときは「さらに表示」 |
| [GOV.UK Design System: Pagination](https://design-system.service.gov.uk/components/pagination/) | 一ページでは読み込みが遅すぎるか、多くの人が最初の数ページで済むときに分ける。一ページで収まるなら出さない。無限scrollは避ける。絞り込みと並べ替えは全件に効かせる | ページ送りの決定 |
| [Baymard Institute: Inline Scroll Areas](https://baymard.com/blog/inline-scroll-areas)(2014) | 入れ子のscrollは理解しにくく、範囲の外を覚えさせ、ページのscrollを奪い、切れた中身が無いと思わせる。使うなら最小限にし、切ったことが分かる短縮表示を選ぶ | 縦のscrollは一か所 |
| [WCAG 2.2 1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow) | 幅320 CSS pxで二方向のscrollを要しない。表や地図は例外だが、例外はほかの部分に及ばない | ページを横にscrollさせない |

## エラーの文の出典

[失敗の伝え方](../DESIGN.md#状態と復帰)が依拠するもの。どれも本文を読んで確かめた(2026-11-25)。

| 資料 | 主張 | 対応する箇所 |
| --- | --- | --- |
| [SmartHR Design System: エラーメッセージの基本的な考え方](https://smarthr.design/products/contents/error-messages/overview/) | 目的は、利用者がメッセージを見て問題を解決し次の操作に進めること。含めるのは事象・原因・対処で、全部を出せないときは原因 > 対処 > 事象の順 | 原因と直し方、次の操作を一つに決められるか |
| [NN/g: Error-Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/)(2023) | 誤りの近くに出す。問題を述べるだけでなく直し方を示す。「An error occurred」のような一般的な文を避ける。人の読める語にし、利用者を責めず、入力を保つ | 操作の近く、避ける文、内部の語を出さない、入力を保つ |
| [GOV.UK Design System: Error message](https://design-system.service.gov.uk/components/error-message/) | 何が起きたかと直し方を書く。質問やlabelの語をそのまま使う(「Enter your first name」)。「This field is required」「invalid」等を避ける | labelと同じ語ですべきことを書く |
| [NN/g: 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) 9 | エラーは平易な語で、問題を正確に示し、建設的に直し方を示す | 原因と直し方 |

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
| [Tailwind CSS: Theme variables](https://tailwindcss.com/docs/theme) | `@theme`の名前空間と`inline`・`reference`。[対応表](../tailwind/tokens.css)の仕組み |
