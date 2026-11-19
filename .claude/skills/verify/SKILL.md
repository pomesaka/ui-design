---
name: verify
description: ui-designの道具（scripts/check-themes.mjs、skills/*/scripts/）をCLIから走らせ、カタログを起動してcontrastを測り、変更が動くかを確かめる手順。
when_to_use: テーマの検査、contrast.mjsなど同梱の道具、カタログの変更を、テストでなく実際に動かして確かめるとき。
---

# ui-designの道具を動かして確かめる

`bun run check`とユニットテストはここでは走らせない。証拠は、道具の出力と終了コード。コマンドはリポジトリのrootで打つ。シェルの変数と`cd`は次の呼び出しに残らないので、パスはそのまま書く。

## カタログを起動する

```bash
bunx vite --port 48732 --strictPort
```

- `run_in_background`で走らせる。既定のポート（5173）は別のセッションが使っていることがある。
- URLは`http://127.0.0.1:48732/catalog/`。画面の例は`/examples/members/`。
- 止めるときは、そのバックグラウンドの処理を止める。`pkill vite`は使わない（別のセッションのviteも止まる）。

## テーマの検査（scripts/check-themes.mjs）

引数なしはこのリポジトリの`themes/`、引数はcwdから解決するファイルかディレクトリ。

```bash
bun scripts/check-themes.mjs
bun scripts/check-themes.mjs themes/luma-light.css themes
```

採用先の使い方は、作業用のフォルダに`src/web/themes/<名前>.css`を置き、そのフォルダから`bun /path/to/ui-design/scripts/check-themes.mjs src/web/themes`。selectorの名前はファイル名と同じにする（`service-light.css`なら`[data-theme="service-light"]`）。macOSのsedは`0,/re/`を解さないので、壊したテーマを作るときはperlを使う。

## contrastを測る（skills/setup/scripts/contrast.mjs）

```bash
node skills/setup/scripts/contrast.mjs http://127.0.0.1:48732/catalog/ --themes luma-light,luma-dark
node skills/setup/scripts/contrast.mjs http://127.0.0.1:48732/catalog/ --themes luma-light,luma-dark --pairs background/border,card/input,background/ring --min 3
```

- Playwrightはこのリポジトリの依存に無い。`skills/review/scripts/browser.mjs`が`playwright-cli`の同梱版を探し、Chromiumが無ければ入っているChromeを使う（`! Playwright's own Chromium is not installed`の行は正常）。
- 終了コードは、基準を下回る対があれば1、引数の誤りと、ページに無い`--pairs`の名前で2。2つめの例は、luma-lightの`background / border`が1.54なので1で終わる（2026-11-19の時点）。

### 依存を入れていない場所で走らせる

同梱の道具は採用先で動く物なので、rootのほかにここでも走らせる（`docs/development.md`）。相対importの構成を保って写す。

```bash
mkdir -p /tmp/ui-design-verify/skills/setup /tmp/ui-design-verify/skills/review
cp -R skills/setup/scripts /tmp/ui-design-verify/skills/setup/
cp -R skills/review/scripts /tmp/ui-design-verify/skills/review/
node /tmp/ui-design-verify/skills/setup/scripts/contrast.mjs http://127.0.0.1:48732/catalog/ --themes luma-light --pairs background/border --min 3
```

cwdも依存の無い場所にするなら、Bashの呼び出しで作業フォルダを`/tmp/ui-design-verify`にしてから`node skills/setup/scripts/contrast.mjs ...`を打つ。

## つつく価値のある流れ

- `--pairs`の名前の打ち間違い（`background/nope`）。以前は対を黙って落とし、合格に見えていた。
- `--pairs`と`--min`の値の抜け。`--pairs`を最後に置いて値を渡さないと、自動の対で走る（2026-11-19に確認）。`--min ""`と`--min abc`は2で止まる。
- 採用先のcwdから`check-themes.mjs`に壊したテーマ（tokenの欠け、未定義の参照、selectorとファイル名の不一致）、無いパス、`.css`でないファイル、空のディレクトリを渡す。
