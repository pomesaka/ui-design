# 既存プロジェクトの移行

既存の画面を一枚ずつui-designへ移すときの型。導入全体の手順は[setup](../skills/setup/SKILL.md)に置く。

## 読み込み

`tailwind/tokens.css`を読み込む。Tailwindの既定(palette・`text-sm`・`rounded`等)を残したまま、tokenのutilityが加わる。既定は移行後も残るので、既定paletteのclassが残っていないかは[inventory](../skills/setup/scripts/inventory.mjs)で確かめる。

```css
@import "tailwindcss";
@import "./tailwind/tokens.css";
@import "./themes/<テーマ>.css";
```

既定と名前が重なる`shadow-sm`・`shadow-md`・`shadow-lg`、`font-sans`・`font-serif`・`font-mono`、余白の数値utility(`p-3`等は`space-1`の倍数)は、読み込んだ時点でtokenの値になる。未移行の画面の見た目が変わり得るので、読み込みを変えた直後に主要な画面を撮って確かめる。`rounded`等の既定は変わらない。

テーマのCSSに`color-mix()`の宣言が複数あるとき、buildの道具によっては式が失われる。`bun-plugin-tailwind` 0.1.2 + `tailwindcss` 4.3.5でtemplateのテーマを通すと、22個のうち最初の1個だけが`@supports`の中に残り、ほかは混ぜる前の色になった(2026-11-13に確認)。`@tailwindcss/vite` 4.3.3では全て残る。失われる道具では、テーマと`*theme.css`をTailwindへ通さず、組み立てたCSSの後ろへそのままつなぐ。読み込みを変えたら、`--border`等の導出した値がbrowserで混ざった色になっているかを確かめる。

## 名前の衝突

導入前にinventoryの「共通契約と同じ名前の変数」を見る。既存の`--muted`や`--color-primary`等が契約の名前と重なると、画面が意図しない値を読む。既存側を`--legacy-muted`等へ改名してから入れる。

既存の画面が、Tailwindのutilityと同じ名前のclassを自分の意味で使っていることがある(`container`・`table`・`grow`等)。Tailwindがその名前を見つけてutilityを出すと、既存の要素に効く。`container`は画面の幅に合わせた`max-width`が付き、広い要素が細くなる。組み立てたCSSに、既存のclassと同じ名前のutilityが出ていないかを探し、出ていたら除く。

```css
@source not inline("container table grow");
```

## 旧い色と値

既存の独自の色変数は一つのファイル(例:`legacy-palette.css`)へ集め、移した画面から参照を消していく。参照が無くなったら削除する。inventoryの色の直接指定の数が、移行の残りの物差しになる。

サービスで値を調整する上書きCSSは`*theme.css`という名前にし、inventoryの数から外す。業務の色を足すときは[サービスで役割を足す](../tokens/README.md#サービスで役割を足す)に従う。

## 一画面ずつ

1. 画面の部品を`components/ui/`へ置き換える。
2. 画面のclassの色・余白・文字をtokenのutilityへ置き換える。
3. [review](../skills/review/SKILL.md)で確かめ、目的を阻害する指摘を残さない。
4. inventoryを取り、残りを記録する。

複製した`components/`・`tailwind/`・`themes/`は採用先のlint・formatから外す([理由](../components/README.md#採用先で使う))。
