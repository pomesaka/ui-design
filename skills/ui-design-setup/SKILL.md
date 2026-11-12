---
name: ui-design-setup
description: プロジェクトにui-designのtoken・テーマ・部品を入れ、画面を合わせる。新しいプロジェクトの立ち上げと、既存プロジェクトへの導入の両方に使う。導入の前後で同じ物差しを取り、効果を測る。
---

# ui-design-setup

新規と既存は、最初に既存のものがあるかだけが違い、同じ手順で進める。判断基準は書き写さず、ui-designの文書を正本として読む。

- [配置と責務](../../ARCHITECTURE.md)、[部品の使い方](../../components/README.md)、[tokenの役割](../../tokens/README.md)、[テーマ](../../themes/README.md)
- 画面は[DESIGN.md](../../DESIGN.md)と[画面の組み立て方](../../docs/composition.md)

前提はReactとTailwind CSS v4。ui-designのrepositoryを参照できる場所(複製・submodule等)に置き、そこから必要なファイルを複製する。対象の前提が違う(別framework等)ときは、進める前に利用者へ伝え、tokenとテーマだけを使うか相談する。

## 進め方

決めたことと理由は、対象プロジェクトの記録(例:`docs/ui-design.md`)に残す。仮定は事実と分けて書く。

1. **現状を把握する。** プロダクトの利用者と目的、ブランドの色・書体等の手掛かりを集める。既存なら、主要な画面を[ui-design-review](../ui-design-review/SKILL.md)の撮影手順で撮り、`node scripts/inventory.mjs <対象のroot> --json <記録先>`で基準値を取る。既存の色・余白・文字・部品が、tokenのどの役割に当たるかを対応表にする。
2. **テーマを決める。** 既存のテーマを選んで調整するか、新しいテーマを作るかを決める。ブランドの色をtokenの役割へ割り当て、面と文字の対ごとにcontrastを確かめる。新しいテーマは共通契約の全tokenを埋め、ui-design側で`bun run check:themes`を通す。
3. **基盤と部品を入れる。** 依存を加え、`tailwind/theme.css`・テーマ・`components/lib/`と使う部品を同じ相対配置で複製する。既存なら、Tailwindの既定paletteが消えることで崩れる箇所を先に洗い出し、置き換えの順番(使う頻度の高い部品から等)を決める。
4. **画面に当てはめる。** 新規は最初の画面を組み立て方に沿って作る。既存は画面を一枚ずつ置き換える。各画面を`ui-design-review`で確かめ、目的を阻害する指摘を残さない。
5. **効果を測る。** 手順1と同じ物差しを取り、記録に並べる。複製した`components/`は`--ignore`で除いて数える。

## 物差し

前後で同じ方法で取る。新規は最初の画面ができた時点を基準にする。

- `inventory.mjs`の数:色の直接指定とその種類、既定paletteのclass、tokenを参照しない任意値、段外の余白、inline style、文字の大きさの直接指定
- `ui-design-review`の指摘の数と重大度(阻害・迷わせる・不一致)
- 撮影で出た横scrollとpage error
- 利用者(依頼者)の評価:主要な画面ごとに、目的に届くか・迷わないか・見た目の満足を5段階で

## 出力

- 対象プロジェクトの記録:利用者と目的、テーマの選択と役割の対応表、置き換えた範囲と残り、前後の物差し
- ui-designへ戻すべき改善(足りない部品・token・文書の不足)の一覧。利用者に伝え、ui-design側で扱う
