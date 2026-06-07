# SlideForge Book Theme

商業技術書の本文図解向けに設計した SlideForge 用テーマです。白・黒・アクセント1色だけで成立すること、2色印刷になっても意味が崩れないこと、HTML と CSS の差分で管理しやすいことを重視しています。

## 目的

- 技術書本文に載せる図解、節扉、注意枠、比較表、コード例を再利用しやすくする
- フルカラー前提の装飾を避け、2色印刷でも読みやすい部品を揃える
- Git 差分で追いやすい HTML / CSS ベースの素材集にする

## 想定用途

- 章扉、節扉
- POINT / 注意 / MEMO / AI コメント枠
- コード例
- 2列 / 3列の比較表
- 処理フロー図
- Mermaid 出力の整形ベース

## ディレクトリ構成

```text
slideforge-book-theme/
  README.md
  package.json
  examples/
    boxes.html
    chapter.html
    code.html
    flow.html
    mermaid.html
    section.html
    table.html
  theme/
    book.css
    boxes.css
    chapter.css
    code.css
    fit.js
    flow.css
    mermaid.css
    print.css
    table.css
```

## 使い方

1. `examples/*.html` をブラウザで開き、部品と印刷時の見え方を確認します。
2. ベースにしたい HTML を複製し、本文内容に合わせてテキストやノード数を調整します。
3. 内容量が読めないページは `theme/fit.js` を読み込み、`.book-page` へ `data-auto-fit="shrink"` を付けます。
4. PNG / PDF 化するときは SlideForge の既存レンダラーを使います。

```bash
cd vendor/SlideForge
npm run render -- --input slideforge-book-theme/examples/chapter.html --format png
npm run render -- --input slideforge-book-theme/examples --format pdf
```

`slideforge-book-theme/package.json` にも同等のショートカットを入れています。

### 1枚に収める自動フィット

本文図版では、内容を増やした結果として 1 ページからはみ出すケースがあります。Book テーマには、そういうページだけを少し縮めて 1 枚へ収める `theme/fit.js` を入れています。

使い方:

```html
<head>
  <link rel="stylesheet" href="../theme/book.css" />
  <script defer src="../theme/fit.js"></script>
</head>
<body>
  <main class="slide">
    <div class="book-page page-shell" data-auto-fit="shrink">
      ...
    </div>
  </main>
</body>
```

- 縮小は必要なときだけ行い、収まっているページはそのままです。
- 対象は `data-auto-fit="shrink"` を付けた `.book-page` だけです。
- 先に内容を整理し、それでも超えるページの保険として使う前提です。

### レンダリング時の余白トリミング

固定サイズスライドを画像化すると、レイアウトによっては下側などに余白が残ります。SlideForge の PNG レンダラは、要素内の実際の内容量を見て余白を自動で詰められます。Book テーマでは既定で下側の空白を自動トリムする設定にしています。

```css
:root {
  --slideforge-auto-trim: block-end;
  --slideforge-trim-padding-bottom: 24px;
}
```

- 単位は `px` です。
- PNG レンダリング時だけ反映します。
- `--slideforge-auto-trim` は `none`, `block-end`, `block`, `box` を使えます。
- `:root` に置けばテーマ全体、`.slide.some-layout` に置けばレイアウト単位、個別ページに置けばそのページだけ調整できます。
- さらに明示的に削りたい場合は `--slideforge-crop-*` を追加で指定できます。

## デザイン原則

- 白・黒・アクセント1色だけで構成する
- 色だけで意味を伝えず、線種・太さ・網掛け・ラベルを併用する
- 商業技術書の本文中で読める文字サイズと余白を優先する
- CSS は用途別に分割し、差分を追いやすくする
- JavaScript や外部 CDN に依存しない

## 2色印刷対応方針

- アクセント色は `--color-accent` のみを使用する
- 強調は色だけでなく、太線、二重線、網掛け、左帯、ラベルでも表現する
- 表のヘッダや注意枠は薄いグレーの網掛けと黒罫線で区別する
- Mermaid ラッパーは塗りを白または薄いグレー、線を黒基調に固定する
- `print.css` で `print-color-adjust: exact;` を指定し、印刷時の余白と線幅を調整する

## コンポーネント一覧

- `Chapter`: 章番号、タイトル、サブタイトル、アクセント線
- `Section`: 左縦線付きの節タイトル
- `Point Box`: `POINT` ラベル付きの重要ポイント枠
- `Warning Box`: `! 注意` ラベル、太枠、斜線背景
- `Memo Box`: 左帯付きの補足メモ
- `AI Comment Box`: 実務文書風の AI 指示 / 出力枠
- `Code Block`: 左太線、薄グレー背景、折り返し対応
- `Compare Table`: 2列 / 3列比較表
- `Flow Diagram`: 分岐付きフロー図
- `Mermaid Wrapper`: Mermaid SVG の書籍向け整形

## サンプルの開き方

- 直接開く: `vendor/SlideForge/slideforge-book-theme/examples/*.html`
- 画像化する: `npm run render -- --input slideforge-book-theme/examples/<file>.html --format png`
- 一括 PDF: `npm run render -- --input slideforge-book-theme/examples --format pdf`

## 今後追加する候補

- 系統図や責務分離図向けのブロック図テンプレート
- Re:VIEW 原稿に貼る前提の縦長図版テンプレート
- より大きい比較マトリクス向けの表スタイル
- 手順番号付きのチェックリスト部品
