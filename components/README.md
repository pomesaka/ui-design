# 部品

React・Tailwind CSS v4・[Base UI](https://base-ui.com)で作った部品の原本。採用先へ複製して使う。focus管理・keyboard操作・ARIAはBase UIが担い、ここでは見た目・状態表現・使いどころを持つ。

## 採用先で使う

1. `@base-ui/react`・`clsx`・`tailwind-merge`を依存に加える(版は[package.json](../package.json)に合わせる)。
2. `components/lib/`と、使う`components/ui/*.tsx`を同じ相対配置で複製する。部品同士の参照(`dialog`→`button`等)も一緒に複製する。
3. CSSで読み込む。テーマは一つ選び、適用する要素の`data-theme`へ指定する。

```css
@import "tailwindcss";
@import "./tailwind/theme.css";
@import "./themes/luma-light.css";
@source "./components";
```

複製後の変更は採用先の判断で行う。共通にしたい改善はこのrepositoryへ戻す。テーマを`<html>`以外へ付ける場合、popupの`container`へテーマ領域内の要素を渡す。portalはbody直下へ描画され、テーマの値を受け取れないため。

## 部品と使いどころ

| 部品 | 使う場面 |
| --- | --- |
| `Button` | 操作の実行。`variant`で主・補助・枠線・控えめ・破壊・控えめな破壊を分け、主操作は一つの操作領域(ページ・Dialog)に一つ。`size="sm"`は密な行やツールバー用で、タッチ端末では44pxに戻る。処理中は`pending`。linkの見た目は`buttonStyles`で`<a>`へ付ける |
| `Toggle` | 押下状態が残る切替(お気に入り等)。画面遷移には使わない |
| `Field`・`Input`・`Textarea` | 入力。label・説明・errorの関連付けを`Field`が行う。外部で決まったerrorは`Field invalid`と`<FieldError match>` |
| `Checkbox`・`Switch`・`RadioGroup` | 選択。`children`がlabelになり、行全体が操作領域になる。即時に反映する設定は`Switch`、送信までの選択は`Checkbox` |
| `Select` | ラジオでは長すぎる単一選択。`items`を渡し、`Field`で包んで`SelectLabel`で名前を付ける |
| `Menu` | 二次的な操作の一覧。頻繁な操作は画面に出す |
| `Dialog`・`AlertDialog` | 背景を止める作業・確認。確認ボタンは操作名で書き、処理中は閉じさせない |
| `Tabs` | 同じ対象の見方の切替。ページ間の移動はlinkにする |
| `Tooltip` | iconボタン等の補足。唯一の情報源にしない。triggerには別に名前を付ける |
| `Banner` | ページ・領域・Dialog本文の上部に置く、時間で消えないメッセージ。失敗・画面に表れない結果・システムの状態 |
| `Notice` | 特定の場所(一覧・ボタン群等)の横に置くメッセージ |
| `AnnouncerProvider`・`useAnnounce` | 画面に出さずスクリーンリーダーへ結果を伝える。rootに一つ置く |
| `Spinner` | 進行中の表示。名前やbusy状態と併用する |

各部品の制約と理由はファイル先頭のコメントにある。

## 結果の伝え方

トーストは用意しない。時間で消え、操作した場所から離れて表示され、拡大表示や大きな画面で見落とされるため。結果は操作の近くに残し、読み上げは`useAnnounce`で行う。

| 状況 | 伝え方 |
| --- | --- |
| 結果が画面に表れる成功(編集内容が表示される、行が消える) | 追加の表示はしない。`useAnnounce`で読み上げる |
| 結果が画面に表れない成功(一括処理、別画面への反映) | 閉じられる`Banner`と`useAnnounce` |
| 入力の誤り | `FieldError`。複数の項目にまたがる場合はフォーム上部の`Banner`も使う |
| 操作の失敗 | 解決まで閉じられない`Banner`に原因と復帰操作。`useAnnounce`は`assertive` |
| 作業を止めて判断が要る | `AlertDialog` |
| システムの状態・お知らせ | `Banner` |
| Dialog内の結果 | Dialogを閉じず、本文上部の`Banner`に出す |

## 部品を追加・変更する

Base UIに該当する部品があれば、その上に作る。`node_modules/@base-ui/react/docs/`に版と一致する説明がある。

- 色・寸法・角丸・影・動きは`tailwind/theme.css`のutilityで指定する。token外の値が必要なら、先に共通契約へ足すかを判断する。
- 状態はBase UIのdata属性(`data-disabled`・`data-checked`・`data-highlighted`等)で表す。focusは`focus-visible:focus-ring`、無効の見た目は`disabled-dim`を使う。
- `className`は文字列で受け、`cn`で後勝ちに合成する。状態ごとのclassName関数は使わない。
- 動きには`motion-reduce:`での代替を付ける。
- [カタログ](../catalog/README.md)へ状態一覧と操作例を加え、壊したくない操作の約束はテストにする。
