# 材質

ほかのプロジェクトで作った質感の作例。標準の部品ではなく、通常の画面では使わない。作り込みや独自性が要るプロジェクトだけが、合う材質を選んで複製する。

repository rootで`bun run catalog`を実行し、`/materials/`を開く。各材質を全テーマで、単色と写真の上に描く。上部の操作で光の向きと強さを変えられる。

## 置き方

- 元のプロジェクトごとに`materials/<名前>/`へコードとCSSを置く。見本は[page.tsx](page.tsx)に足す。
- 材質が読む値は、その材質のCSSに既定値つきで置く。共通契約とテーマには足さない。既定値はテーマのtokenから導く。
- 元の場所と、移していないものをこのファイルに残す。

## Luma

一つの光源を共有する材質の一式。[luma/material.ts](luma/material.ts)の`materialClassName(kind)`を、形(大きさ・角丸・余白)を持つ要素のclassへ足す。多くは`::before`と`::after`で描くので、それらを自分で描く要素には足さない。

| kind | 使いどころ |
| --- | --- |
| `lens` | 内容の上に浮く透明なガラスの帯や面 |
| `lens-rimmed` | ガラスの単独の操作。縁の両側が光る |
| `lens-inset` | `lens`の中で選ばれている項目 |
| `frosted` | 地図のような細かい背景をぼかして透かす面 |
| `ceramic`・`opal`・`paper-relief` | 塗りのある操作。セラミック、乳白ガラス、紙のレリーフ |
| `paper`・`illuminated-paper` | 本文を載せる紙の面。光を弱く受けるものと、強く受けるもの |

- `materialClassName(kind, { press: true })`で押下の反応が付く。沈みながら、光る縁と影の縁が入れ替わる。レンズと塗りのある操作に使う。
- [PhotoAfterlight](luma/photo-afterlight.tsx)は、写真の色をまわりの面へ淡くにじませる。
- [useSurfaceLighting](luma/use-surface-lighting.ts)は、光の向きと強さを要素の`--light-*`へ滑らかに書く。祖先に一度かければ、中の材質すべてが従う。使わなければ左上の固定の光で描く。reduced motionでは固定の光に戻る。

| 値 | 既定 |
| --- | --- |
| `--material-light` | 光の色。lightは`card`、darkは`foreground` |
| `--material-shadow` | 影の色。共通契約のtokenをそのまま読む |
| `--material-surface` | 塗りのある面の色。lightは`card`、darkは`primary` |
| `--material-ink` | 塗りのある面の文字色。lightは`primary`、darkは`primary-foreground` |
| `--material-fill` | セラミックの面の色。既定は`--material-surface` |
| `--material-relief` | 塗りのある面の凹凸の強さ。既定0.45。darkのテーマでは1を指定する |
| `--lens-blur`・`--lens-saturation` | レンズ越しのぼかしと彩度。20px、150% |
| `--paper-surface-color` | 紙の色。既定は`background` |

`lens`と`frosted`は面の塗りが無いか薄いので、上の文字のcontrastは背後で決まる。写真や地図の上では、文字の色を使う側で決める。

元はpomesaka/lumaの`src/presentation/components/`(2026-11-13時点)の`lens`・`raised-surface`・`paper-surface`・`frosted-search`・`surface-press`・`photo-afterlight`・`use-surface-lighting`。次のものは移していない。

- 太陽の位置と端末の向きから光源を求める計算(`sunlight`)。位置情報とsensor、`suncalc`に依存する
- 検索欄としての`frosted`の部品と、読む面へつながる`connected`の見た目
- 子要素へ材質を渡す`Material`・`asChild`(Radix Slot)。ここではclass名で渡す
- Lumaのボタンの状態の色(`surface-press`の`filledControl`等)
