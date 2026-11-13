---
name: setup
description: プロジェクトにui-designのtoken・テーマ・部品を入れ、画面を合わせる。新しいプロジェクトの立ち上げと、既存プロジェクトへの導入の両方に使う。導入の前後で同じ物差しを取り、効果を測る。
---

# ui-design:setup

新規と既存は、最初に既存のものがあるかだけが違い、同じ手順で進める。判断基準は書き写さず、ui-designの文書を正本として読む。

- [配置と責務](../../ARCHITECTURE.md)、[部品の使い方](../../components/README.md)、[tokenの役割](../../tokens/README.md)、[テーマ](../../themes/README.md)
- 画面は[DESIGN.md](../../DESIGN.md)と[画面の組み立て方](../../docs/composition.md)

前提はReactとTailwind CSS v4。ui-designのrepositoryを参照できる場所(複製・submodule等)に置き、そこから必要なファイルを複製する。対象の前提が違う(別framework等)ときは、進める前に利用者へ伝え、[tokenとテーマだけを使う](#reactを使わない採用先)か相談する。

## 進め方

決めたことと理由は、対象プロジェクトの記録(例:`docs/ui-design.md`)に残す。仮定は事実と分けて書く。

1. **現状を把握する。** プロダクトの利用者と目的、ブランドの色・書体等の手掛かりを集める。既存なら、主要な画面を[review](../review/SKILL.md)の撮影手順で撮り、`node scripts/inventory.mjs <対象のroot> --json <記録先>`で基準値と、共通契約との名前の衝突を取る。既存の色・余白・文字・部品が、tokenのどの役割に当たるかを対応表にする。
2. **テーマを決める。** 既存のテーマを選んで調整するか、[テンプレート](../../themes/template.css)から新しいテーマを作るかを決める。ブランドの色をtokenの役割へ割り当て、`node scripts/contrast.mjs <URL> --themes <テーマ,...>`で面と文字の対ごとにcontrastを確かめる。できたテーマは[カタログ](../../catalog/README.md)に`CATALOG_THEMES`で読ませ、全tokenと部品、足した役割を利用者と見る。業務の色は[サービスで役割を足す](../../tokens/README.md#サービスで役割を足す)に従う。新しいテーマは共通契約の全tokenを埋め、ui-design側で`bun run check:themes`を通す。
3. **基盤と部品を入れる。** [部品の使い方](../../components/README.md#採用先で使う)に従って複製し、複製したものは採用先のlint・formatから外す。既存なら、既定と名前が重なるutility(影・書体・余白)の値が変わることで崩れる箇所と、[既存のclassと同じ名前のutility](../../docs/migration.md#名前の衝突)を先に洗い出し、置き換えの順番(使う頻度の高い部品から等)を決める。
4. **画面に当てはめる。** 新規は最初の画面を組み立て方に沿って作る。既存は[移行の型](../../docs/migration.md)に従って画面を一枚ずつ置き換える。各画面を`review`で確かめ、目的を阻害する指摘を残さない。
5. **効果を測る。** 手順1と同じ物差しを取り、記録に並べる。複製した`components/`は`--ignore`で除いて数える。

## Reactを使わない採用先

部品(`components/`)はReactとBase UIに依存するので複製しない。入れるのは次の二つ。

- `tailwind/tokens.css`と、テーマのCSS(`themes/<名前>.css`、または[テンプレート](../../themes/template.css)から作ったもの)
- 足す役割の値を書く`*theme.css`([サービスで役割を足す](../../tokens/README.md#サービスで役割を足す))

操作の部品の見た目は、tokenのutilityで採用先が書く。繰り返す形はTailwindの`@utility`にまとめる。状態(hover・押下・focus・無効・処理中・選択中)の出し方と使うtokenは、同じ種類の部品の実装(`components/ui/`)と[カタログ](../../catalog/README.md)の「使うtoken」を仕様として読む。focusは`focus-ring`、無効は`disabled-dim`のutilityを使い、選択中は`aria-pressed`・`aria-current`等の属性で示す。

手順は同じ。手順3は部品の複製を除き、[結果の伝え方](../../components/README.md#結果の伝え方)等の部品の文書は、同じ振る舞いを採用先で実装するときの基準として読む。

## 物差し

前後で同じ方法で取る。新規は最初の画面ができた時点を基準にする。

- `inventory.mjs`の数:色の直接指定とその種類、既定paletteのclass、tokenを参照しない任意値、段外の余白、inline style、文字の大きさの直接指定
- `review`の指摘の数と重大度(阻害・迷わせる・不一致)
- 撮影で出た横scrollとpage error
- 利用者(依頼者)の評価:主要な画面ごとに、目的に届くか・迷わないか・見た目の満足を5段階で

## 出力

- 対象プロジェクトの記録:利用者と目的、テーマの選択と役割の対応表、置き換えた範囲と残り、前後の物差し
- ui-designへ戻すべき改善(足りない部品・token・文書の不足)の一覧。利用者に伝え、ui-design側で扱う
