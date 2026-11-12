# 共通トークンの契約

トークンの名前・意味・状態表現を共通の契約とし、その値一式を埋めたものを一つのテーマとして管理する。具体的な名前の一覧は[contract.json](contract.json)、値と利用手順は[themes](../themes/README.md)を参照する。

## 共通契約・テーマ・サービス差分

- 各テーマだけで、共通部品の通常状態・操作状態・feedbackを表現できる値を一式持つ。light/darkも`luma-light`・`luma-dark`のように独立したテーマとし、どちらも同じ名前を満たす。
- サービスはテーマを一つ選んで読み込み、必要な色・書体・密度・角丸・材質・motionの値を上書きする。token名や部品の状態判定をサービスごとに作り直さない。
- 状態別の値も各テーマが供給する。色の派生計算を使う場合は、サービスが変更した基準色から導出される定義にする。値を単に固定コピーして上書きに追従しなくしない。
- 正本は通常のCSS custom propertiesとし、frameworkへ依存させない。Tailwindとの対応表は[tailwind/theme.css](../tailwind/theme.css)に置き、値の定義から分ける。

## 色の役割

変数は`--primary`のように定義する。shadcnに合わせ、面は`primary`、その上の文字・iconは`primary-foreground`という対で扱い、面の名前に`-background`を足さない。

| 種類 | 基本の名前 |
| --- | --- |
| ページ | `background` / `foreground` |
| コンテンツの面 | `card` / `card-foreground` |
| 浮く面 | `popover` / `popover-foreground` |
| 主操作 | `primary` / `primary-foreground` |
| 補助操作 | `secondary` / `secondary-foreground` |
| 弱い面とフォーム等の補助 | `muted` / `muted-foreground` |
| 対話のハイライト | `accent` / `accent-foreground` |
| 破壊操作・入力不正の強調 | `destructive` |
| 境界・入力・focus | `border` / `input` / `ring` |
| グラフ | `chart-1`〜`chart-5` |
| サイドバー | `sidebar` / `sidebar-foreground`、`sidebar-primary` / `sidebar-primary-foreground`、`sidebar-accent` / `sidebar-accent-foreground`、`sidebar-border` / `sidebar-ring` |

命名と元の意味は[shadcn Theming](https://ui.shadcn.com/docs/theming#theme-tokens)を参考にする。テーマに含めても、部品を全種類使う必要はない。`muted-foreground`はplaceholder・フォーム補助・emptyの案内に使い、読書metadataや操作の文字色は下の専用役割と使い分ける。

### ui-designで追加する役割

以下はshadcnの標準名と区別する拡張。Lumaで使った分離を土台に、サービス固有の名称を外して定義する。

| 名前 | 意味 |
| --- | --- |
| `destructive-foreground` | destructiveの面に載せる文字・icon |
| `reading-secondary` / `control-foreground` | 前者は時刻・件数等の読書metadata、後者は独自の面を持たない操作icon・文言。filled操作はその面のforegroundを使う。役割を分けて調整でき、テーマ内の初期値は同値でもよい |
| `selected` / `selected-foreground` / `selected-border` | 一覧等の継続した選択の面・文字・縁。主操作や押下中の色と区別する |
| `success` / `success-foreground`、`warning` / `warning-foreground`、`info` / `info-foreground` | 成功・注意・情報のfeedback。Lumaの既存定義をそのまま移したものではなく、共通契約として加える役割 |
| `primary-hover` / `primary-pressed`、`secondary-hover` / `secondary-pressed`、`destructive-hover` / `destructive-pressed` | 主操作・補助操作・破壊操作で、独立して調整する状態の面。文字は元のforegroundと組にして確認する |

Lumaの`selection`・`selection-surface`・`selection-edge`の分離は、ここでは`selected-*`の役割へ整理する。文字列の選択`::selection`とは区別する。混雑・天気・地図・リアクション等の業務上の色はサービス側の拡張で持つ。

## 状態と表現

状態ごとに、使う役割・動き・操作を部品の共通recipeで揃える。全役割と全状態の組合せで色tokenを機械的に増やさない。

| 状態 | 共通の扱い |
| --- | --- |
| default | 部品の役割に対応する面・foregroundを使う |
| hover | 操作の種類に応じて`accent`または該当する`*-hover`を使う。hoverだけに操作の入口を置かない |
| pressed | 押している間。`*-pressed`や押下の深さ・影で示す。継続した選択とは別で、`active`という名前で両者を兼ねない |
| selected / current | 継続した選択・現在の項目。一覧等では`selected-*`、checkbox等ではその部品の選択recipeを使い、押下を終えても状態を保つ |
| focus-visible | `ring`と共通のoutline幅・offsetで示す。選択中や入力不正と同時でもfocusを識別できるようにする |
| disabled | 操作不可。共通のdisabled-opacityと実際の無効化を合わせる。見た目だけ無効にしない |
| pending | 処理中。表示中の役割を保ち、進捗・busy・必要な操作抑止で示す。警告色に置き換えず、disabledと同じ意味にしない |
| invalid / error | 入力不正には`destructive`と理由を使う。取得失敗等は原因と復帰操作を示し、すべてを赤い面にしない |
| success / warning / info | 内容に対応するfeedbackの役割を使う。色だけで結果を伝えない |
| empty / unavailable / read-only | 内容なし・利用不可・編集不可の意味と可能な操作を明確にする。disabledにまとめず、専用色を一律に要求しない |

色以外も含め、同時に成立する状態を扱う。disabledは実行を抑止する。pending中に何を抑止するか、invalidやselectedとfocusが重なった場合に何を残すかは部品の契約で定め、色一つの優先順に押し込まない。

## 色以外の種類

| 種類 | 定義するもの |
| --- | --- |
| 文字 | `font-sans` / `font-serif` / `font-mono`と、本文・補足・操作等のsize / line-height / weight |
| 寸法 | 余白のscale、control・iconのsize。見える形と操作領域を分ける |
| 形・影 | shadcnの`radius`を土台に、field・card・dialog・drawerの役割別角丸、共通のshadow |
| 操作状態 | `disabled-opacity`、`press-depth`、`focus-outline-width` / `focus-outline-offset` |
| 動き・材質 | 共通のduration / easing、部品間で共有する光・影等の値。動作・描画の実装は部品が所有する |

テーマの確認では、共通契約からの定義漏れ、サービス差分への派生値の追従、面とforeground・境界・focusの可読性、代表部品の各状態と同時状態をカタログで確かめる。
