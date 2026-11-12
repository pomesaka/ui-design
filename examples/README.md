# 画面の例

部品とtokenを[画面の組み立て方](../docs/composition.md)に従って組んだ画面。採用先と同じ読み込み方([app.css](app.css))を使い、カタログ専用の状態固定は使わない。

repository rootで`bun run catalog`を実行し、`/examples/<名前>/`を開く。各例は`examples/<名前>/`に`index.html`・`main.tsx`と画面のコードを置き、データは合成する。画面の前提(利用者・状況・目的と、事実と仮定の区別)は同じ場所の`README.md`に残す。

## 例の約束

- `main.tsx`は[mount.tsx](mount.tsx)の`mountExample`で描画する。テーマの指定と共通のproviderをそこで行う。
- 状態はURL引数で出し分け、例のREADMEに一覧を置く。共通の名前は次のとおり。例に固有のもの(視点・件数等)は例ごとに決める。

| 引数 | 意味 |
| --- | --- |
| `theme=<名前>` | テーマ(`themes/`のファイル名) |
| `state=loading`・`state=error`・`state=refresh-error`・`state=empty` | 初回読み込み・取得失敗・既存内容の更新失敗・空 |
| `fail=1` | 変更の操作が失敗する |

レビューでは状態ごとのURLを[撮影スクリプト](../skills/review/scripts/capture.mjs)へ並べて渡す。

