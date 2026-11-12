# テーマ

テーマは、[共通トークン契約](../tokens/README.md)の値を一式埋めたもの。light/darkも別のテーマとして管理する。
名前の正本は[contract.json](../tokens/contract.json)、値の正本は各CSS。`template`は新しいテーマの出発点になる中立のlightテーマ。`luma-light`(温かい紙色と深緑の文字)と`luma-dark`(深緑の面と淡い文字)は作例。

## 使う

CSSを読み込み、適用する要素の`data-theme`へファイル名と同じ名前を指定する。Tailwindで使う場合は[対応表](../tailwind/theme.css)も読み込み、部品は`bg-primary`・`text-caption`・`rounded-field`等のutilityで参照する。

```css
@import "tailwindcss";
@import "./tailwind/theme.css";
@import "./themes/luma-light.css";
@import "./themes/luma-dark.css";
```

```html
<html data-theme="luma-light">
```

切替は`data-theme`を`luma-dark`へ変更する。テーマは値と`color-scheme`だけを定義し、本文やbuttonへstyleを自動適用しない。対応表はtokenを直接参照するutilityだけを生成し、Tailwind既定の色paletteや文字・角丸・影のscaleを消す。余白の数値utilityは`space-1`の倍数(`p-3`は`space-3`と同値)になる。テーマ指定を外すことを別テーマへの自動fallbackにしない。

## サービスで調整する

テーマCSSの後で、同じ要素を対象に値を上書きする。

```css
[data-theme="luma-light"] {
  --primary: #57452c;
  --primary-foreground: #fffaf2;
  --radius: 0.75rem;
}
```

hover・pressedや役割別の角丸は基準値から導出され、同じ要素での上書きに追従する。面を変えたら、そのforegroundと各状態の可読性も確認する。
CSS変数の派生値は定義した要素で計算される。子要素へ基準値だけを上書きしても、親から継承した派生値は再計算されない。サービスの調整はテーマを指定した要素で行い、別のテーマ領域なら`data-theme`もその要素へ付ける。

## テーマを追加する

[template.css](template.css)を`<名前>.css`へ複製し、selectorを`[data-theme="<名前>"]`に変えて始める。templateは冒頭の基本の色だけを変えれば残りが導出される中立のlightテーマで、Lumaは作例の一つにすぎない。テーマは`<名前>.css`に`[data-theme="<名前>"]`の単一ruleで全tokenを定義する。他テーマの値の継承を前提にせず、同じ名前を独立した配色や材質・motionで満たす。定義漏れ・余分な名前・未定義参照・循環参照はrepository rootで`bun run check:themes`を実行して確認する。この検査はCSSの構文・値の型を保証しない。contrastは[contrast.mjs](../skills/setup/scripts/contrast.mjs)で、文字は4.5、境界とfocusは`--min 3`で確かめる。

Lumaから既存の汎用配色・文字・寸法・focus・押下の値を引き継いだ。lightの入力境界とfocus色は、紙色の上で識別しやすい濃さに補正した。popover・sidebar・chart・feedback・一部の状態色・共通shadowは、契約を埋めるための追加または派生。hover色は元アプリの固定値の単純コピーにせず、サービスが変えた基準色に追従する。部品固有の多層反射・光源追従・reduced motionの動作は部品側が担当する。
