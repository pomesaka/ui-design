# カタログ

repository rootで`bun install`の後、`bun run catalog`を実行し、表示されたローカルURLの`/catalog/`を開く。認証・外部APIは不要。portは`CATALOG_PORT`で指定できる(既定4318)。

初期表示は全テーマの比較。画面上部の切替で一つにも絞れ、URLの`?theme=`に残る。広い画面ではテーマを横並び、狭い画面では縦に並べる。`themes/`のCSSは自動で読み込まれる。

採用先のテーマで見るときは、`CATALOG_THEMES`にそのテーマのCSSをcomma区切りで渡す(`CATALOG_THEMES=<契約の値のCSS>,<足した役割のCSS> bun run catalog`)。同じ`data-theme`を持つファイルは一つのテーマとして扱う。共通契約に無い名前は「このテーマが足したtoken」に並び、名前と値から色・文字の大きさ・影を判定して描く。

- 先頭に共通契約のtokenを種類ごとに並べ、そのテーマでの値で描く。色は名前から役割を読み、面・文字・線・focusの形で描く。上部の切替でtokenだけ・部品だけに絞れ、URLの`?show=`に残る。
- 部品の区画には、固定見本の部品に実際に付いたclassから導いたtokenを並べる。手で書き足さない。ボタンは種類の行ごとに色を出す。別の部品の中身として置いた部品(一覧の行のボタン等)は`data-legend="skip"`で外す。全部品に共通の`focus-ring`・`disabled-dim`と、閉じているpopupのtokenは出ない。
- 各部品の状態を固定見本で並べる。hover・押下・focusは`data-preview-state`で固定する。[catalog.css](catalog.css)がTailwindの`hover`・`active`・`focus-visible`へこの属性を足し、実際のpseudo classと同じ宣言を使う。採用先はこのCSSを読み込まない。
- 固定見本の操作要素は`inert`で操作対象から外し、motionを止める。状態名は読める。
- 末尾の「操作して確認」は実部品をそのまま操作する。送信・削除の待ち時間はカタログの合成処理で、部品の契約ではない。
- popupは各テーマ領域の中へ描画し、そのテーマの値で表示する。

静止画は見た目の比較用。keyboard・操作の成立・scroll・reduced motion等は実操作で確認する。新しい部品には意味のある状態と同時状態を追加する。
