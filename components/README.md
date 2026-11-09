# 共通のcontrol recipe

`controls.css`はテーマのCSS変数を読む、framework非依存のstyle。`ui-button`はnative button、`ui-field`はinput、`ui-choice`はtoggle buttonまたは現在の項目へのlink、`ui-notice`はfeedbackの外観に使う。variantはbuttonの`data-variant="secondary|destructive"`、noticeの`data-tone="success|warning|error"`で指定する。未指定はそれぞれprimary・info。

選択は`aria-pressed`、現在のlinkは`aria-current="page"`、無効化はnativeの`disabled`、入力不正は`aria-invalid`、読み取り専用は`readonly`を使う。入力label・errorとの関連付け・通知のlive region・pending時の二重実行抑止等の操作契約は、採用先の描画とevent処理が担当する。`aria-busy`やCSSだけでは操作は無効にならない。

`data-preview-state`は[カタログ](../catalog/README.md)でhover・pressed・focusを固定するための属性。採用先で状態を判定するAPIにしない。カタログは同じCSSで全状態を並べ、実操作も確認できる。
