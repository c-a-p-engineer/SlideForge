# SlideForge

HTML スライドを `PDF` / `PNG` に変換するためのリポジトリです。

## 前提

- ランタイム: `Node.js + Playwright`
- 日本語フォント: `Noto Sans CJK JP`, `IPAGothic`
- 入力: `slides/<style>/` または単体 `html`
- 出力:
  - 個別 PNG: `dist/slides/<style>/`
  - 複数ページ PDF: `dist/decks/`

詳細な設計メモは [docs/notes.md](./docs/notes.md) に分けています。
スライドの使い分けは [docs/slide-selection-guide.md](./docs/slide-selection-guide.md) を参照してください。
スライド全体のデザイン判断は [docs/slide-design-guide.md](./docs/slide-design-guide.md)、テーマ一覧は [docs/theme-catalog.md](./docs/theme-catalog.md) にまとめています。

現在のサンプルテーマは `light` と `dark` の 2 種類です。各テーマに 27 枚の横型テンプレートを用意しています。

- コア: `cover`, `section`, `single`, `two_column`, `list`, `highlight`
- 実用: `comparison`, `cards`, `chart`, `flow`, `timeline`, `gantt`
- 拡張: `diagram`, `system`, `code`, `before_after`, `faq`, `contact`
- グラフ: `bar`, `line`, `pie`, `stacked`, `area`, `scatter`, `radar`, `histogram`, `waterfall`

テンプレートはスマホ閲覧でも読みやすい大きめの文字サイズを基準にしています。実資料では、長文を入れるよりも本文を削り、必要な説明を発話や補足資料で補う運用を想定しています。

サンプルのページ順:

1. `cover`
2. `section`
3. `single`
4. `two_column`
5. `list`
6. `highlight`
7. `comparison`
8. `cards`
9. `chart`
10. `flow`
11. `timeline`
12. `gantt`
13. `diagram`
14. `system`
15. `code`
16. `before_after`
17. `faq`
18. `contact`
19. `chart-bar`
20. `chart-line`
21. `chart-pie`
22. `chart-stacked`
23. `chart-area`
24. `chart-scatter`
25. `chart-radar`
26. `chart-histogram`
27. `chart-waterfall`

## AI でスライドを作る手順

AI に依頼するときは、まず次の 4 点を渡すと作業が安定します。

- 何の資料か
- 誰向けか
- 何ページ程度か
- どのテーマを使うか

依頼の基本形:

```text
SlideForge のテンプレートを使ってスライドを作成してください。
テーマは light / dark のどちらかを使ってください。
出力先は slides/<style>/ 配下です。
各ページは 01-cover.html, 02-section.html のような連番ファイルで作成してください。
必要なら既存サンプルの role を流用し、最後に render コマンドも実行してください。
```

AI に伝えるとよい追加条件:

- 表紙に入れるタイトル、作者、日付、所属
- 必要な role
  例: `cover`, `section`, `single`, `two_column`, `comparison`, `chart`, `timeline`, `gantt`, `system`, `contact`
- 必要な図
  例: `flow`, `timeline`, `gantt`, `system`, `bar`, `line`, `waterfall`
- 出力形式
  例: `png`, `pdf`
- 画面サイズ
  例: `widescreen`

実務向けの依頼例:

```text
SlideForge を使って 8 ページの提案資料を作成してください。
対象は経営層です。テーマは light を使ってください。
構成は cover, section, single, comparison, chart, gantt, before_after, contact にしてください。
各ページは slides/light/ 配下に連番 HTML で作成してください。
最後に PDF を出力してください。
```

技術説明向けの依頼例:

```text
SlideForge を使って dark テーマで技術説明資料を作成してください。
構成は cover, section, flow, system, code, line-chart, faq, contact にしてください。
システム構成図とフロー図を含めてください。
最後に PNG を一括出力してください。
```

AI が編集する場所の基本ルール:

- 横型資料は `slides/light/` または `slides/dark/`
- 共通スタイルは `slides/base.css`
- テーマ差分は `slides/<style>/theme.css`
- サンプル一括再生成は `scripts/build-requested-slides.mjs`

AI が最後に実行すべきコマンドの例:

```bash
npm run render -- --input slides/light --format pdf
npm run render -- --input slides/dark --format png
npm run render:all
```

## 変換コマンド

セットアップ:

```bash
npm install
node scripts/build-requested-slides.mjs
```

ディレクトリ内の全 HTML を個別 PNG に変換:

```bash
npm run render -- --input slides/light --format png
```

ディレクトリ内の全 HTML を複数ページ PDF に変換:

```bash
npm run render -- --input slides/light --format pdf
```

単体 HTML を PNG に変換:

```bash
npm run render -- --input slides/dark/15-code.html --format png
```

全サンプル出力:

```bash
npm run render:all
```

主なオプション:

- `--input`: 入力 HTML またはディレクトリ
- `--output`: 出力先。省略時は HTML なら `dist/<input-path>.拡張子`、ディレクトリ + PNG なら `dist/<input-dir>/`、ディレクトリ + PDF なら `dist/decks/<style>.pdf`
- `--format`: `png` または `pdf`
- `--preset`: `widescreen` または `mobile`。現在の同梱サンプルは `widescreen` 前提
- `--width`, `--height`: プリセットを上書き
- `--scale`: PNG 出力の解像度倍率
- `--selector`: PNG 切り出し対象。デフォルトは `.slide`

出力例:

```bash
npm run render -- --input slides/light --format png
npm run render -- --input slides/light --format pdf
npm run render -- --input slides/dark --format png
npm run render -- --input slides/dark --format pdf
npm run render -- --input slides/light --format png --output dist/custom/light
npm run render -- --input slides/dark/15-code.html --format png --scale 2
```

## Web ページのスクリーンショット

指定 URL を Playwright で開き、PNG として保存できます。出力先を省略した場合は `dist/captures/<hostname>-<timestamp>.png` に保存します。

```bash
npm run capture -- --url https://example.com
slideforge capture --url https://example.com --output assets/screenshots/example.png
```

指定要素だけを撮る:

```bash
npm run capture -- --url https://example.com --selector ".hero"
```

ウィンドウサイズと解像度倍率を指定する:

```bash
npm run capture -- --url https://example.com --width 1440 --height 900 --scale 2
```

ページ全体を撮る:

```bash
npm run capture -- --url https://example.com --full-page
```

遅延表示や邪魔な要素に対応する:

```bash
npm run capture -- \
  --url https://example.com \
  --wait-until networkidle \
  --wait-for ".main-content" \
  --delay 500 \
  --hide ".cookie-banner,.chat-widget"
```

主なオプション:

- `--url`: 撮影対象 URL。`http` / `https` に対応
- `--output`: 出力先 PNG。省略時は `dist/captures/<hostname>-<timestamp>.png`
- `--selector`: 指定 CSS selector の最初の要素だけを撮影
- `--width`: viewport 幅。デフォルトは `1440`
- `--height`: viewport 高さ。デフォルトは `900`
- `--scale`: device scale factor。デフォルトは `1`
- `--full-page`: selector 未指定時にページ全体を撮影。デフォルトは viewport のみ
- `--wait-until`: `load`, `domcontentloaded`, `networkidle`, `commit`。デフォルトは `networkidle`
- `--wait-for`: 撮影前に表示を待つ CSS selector
- `--timeout`: タイムアウト ms。デフォルトは `30000`
- `--delay`: 読み込み後に追加で待つ ms。デフォルトは `0`
- `--hide`: 撮影前に隠す CSS selector。カンマ区切りで複数指定可能

### X / Twitter のスクリーンショット

X / Twitter は未ログインの自動ブラウザだと、プロフィールページがロゴ画面やログイン誘導で止まることがあります。基本方針として、プロフィールやタイムラインを直接撮るのではなく、単体ポストを `publish.twitter.com` の埋め込みに変換して撮影します。

単体ポストの埋め込み HTML は oEmbed で取得できます。

```bash
curl -L \
  "https://publish.twitter.com/oembed?url=https%3A%2F%2Fx.com%2Fkawai_shichiten%2Fstatus%2F2044178592222028035"
```

返ってきた `html` をローカル HTML に置き、`platform.twitter.com/widgets.js` でカード表示させてから撮影します。スライド素材にする場合は、説明用のサイドバーや余白を入れず、ポストカードだけを囲む要素を `--selector` で切り出すと扱いやすくなります。

```bash
npm run capture -- \
  --url http://127.0.0.1:8765/x-post-embed.html \
  --selector ".tweet-capture" \
  --output assets/screenshots/x-post.png \
  --width 900 \
  --height 900 \
  --wait-until networkidle \
  --delay 8000
```

どうしても X / Twitter のページを直接撮る場合は、右サイドバー、ログイン誘導、下部バナーなど不要な箇所を `--hide` で消してから撮影します。ただし表示は不安定なので、単体ポストは埋め込み方式を優先します。

```bash
npm run capture -- \
  --url https://x.com/kawai_shichiten/status/2044178592222028035 \
  --output assets/screenshots/x-post-direct.png \
  --width 1440 \
  --height 900 \
  --delay 8000 \
  --hide "[data-testid='sidebarColumn'],[data-testid='BottomBar']"
```

## 別リポジトリで使う

このリポジトリを別プロジェクトから使う場合は、インストール後に `slideforge` コマンドで入力ファイルまたはディレクトリを直接指定できます。

```bash
slideforge render --input ./slides/proposal --format pdf
slideforge render --input ./slides/proposal/01-cover.html --format png
slideforge capture --url https://example.com --output ./assets/screenshots/example.png
```

ディレクトリ指定時は `01-*.html`, `02-*.html` のような連番 HTML を順番に処理します。`pdf` は複数ページ化、`png` は各 HTML を個別画像として出力します。

## Docker

通常実行:

```bash
docker compose build
docker compose run --rm slideforge node scripts/build-requested-slides.mjs
docker compose run --rm slideforge npm run render -- --input slides/light --format png
docker compose run --rm slideforge npm run render -- --input slides/light --format pdf
docker compose run --rm slideforge npm run render:all
```

ビルドから実行、後始末までを 1 行で行う例:

```bash
docker compose build && docker compose run --rm slideforge npm run render -- --input slides/light --format pdf && docker compose down --rmi local --remove-orphans
```

全サンプルを 1 行で出力して後始末する例:

```bash
docker compose build && docker compose run --rm slideforge npm run render:all && docker compose down --rmi local --remove-orphans
```
