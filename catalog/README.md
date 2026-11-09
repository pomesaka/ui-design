# カタログ

repository rootで`bun run catalog`を実行し、表示されたローカルURLを開く。追加依存・認証・外部APIは不要。portは`CATALOG_PORT`で指定できる。

初期表示は全テーマの比較。画面内の切替で一つにも絞れる。幅がある画面ではテーマを横並び、狭い画面では縦に並べ、全状態を表示する。スクリーンショット用にhoverやfocusを再現する操作は不要。

- 通常・hover・pressed・focus-visible・disabled・pending、選択/currentとfocus、入力不正とfocus、read-only、結果、初回読み込み・空・利用不可・取得失敗・既存内容の更新失敗を並べる。
- transientな状態は`data-preview-state`で固定する。[共通CSS](../components/controls.css)の実際のpseudo classと同じ宣言を使い、色・寸法を展示側へ複製しない。disabled・busy・invalid・read-only等はHTMLの属性も使う。
- 固定見本の操作要素は`inert`で操作対象から外し、motionを停止する。状態名や説明は読み上げ可能なまま残す。状態を説明するlabelは見本用。末尾の「操作して確認」は同じrecipeで動く。
- pendingの二重実行抑止はcatalogの合成処理が持つ。CSSだけで操作契約を満たすものではない。採用先でも実際の無効化・busy・label・errorとの関連付けを実装する。

静止画は見た目の比較用。keyboard・操作の成立・scroll・reduced motion等は実操作で確認する。新しい部品には意味のある状態と同時状態を追加する。
