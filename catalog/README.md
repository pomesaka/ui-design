# カタログ

repository rootで`bun install`の後、`bun run catalog`を実行し、表示されたローカルURLの`/catalog/`を開く。認証・外部APIは不要。portは`CATALOG_PORT`で指定できる(既定4318)。

初期表示は全テーマの比較。画面上部の切替で一つにも絞れ、URLの`?theme=`に残る。広い画面ではテーマを横並び、狭い画面では縦に並べる。`themes/`のCSSは自動で読み込まれる。

- 各部品の状態を固定見本で並べる。hover・押下・focusは`data-preview-state`で固定する。[catalog.css](catalog.css)がTailwindの`hover`・`active`・`focus-visible`へこの属性を足し、実際のpseudo classと同じ宣言を使う。採用先はこのCSSを読み込まない。
- 固定見本の操作要素は`inert`で操作対象から外し、motionを止める。状態名は読める。
- 末尾の「操作して確認」は実部品をそのまま操作する。送信・削除の待ち時間はカタログの合成処理で、部品の契約ではない。
- popupは各テーマ領域の中へ描画し、そのテーマの値で表示する。

静止画は見た目の比較用。keyboard・操作の成立・scroll・reduced motion等は実操作で確認する。新しい部品には意味のある状態と同時状態を追加する。
