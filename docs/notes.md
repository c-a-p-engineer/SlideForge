# Notes

## テンプレート構成

- 共通ベース: `slides/base.css`
- テーマ差分: `slides/<style>/theme.css`
- 実データ: `slides/<style>/`
- サンプル再生成: `scripts/build-requested-slides.mjs`
- 現在のテーマ: `slides/light/`, `slides/dark/`

## デザイン思想

SlideForge は、HTML スライドを PDF / PNG に変換するだけでなく、情報を誰にでも読みやすい順序へ整えるための制作基盤として扱います。

デジタル庁デザインシステム beta 版の考え方を参考に、以下を基本方針にします。

- 利用者を取り残さないために、文字サイズ、コントラスト、読み順、余白を先に決める
- 色や装飾だけで意味を伝えず、見出し、ラベル、位置、形を併用する
- 余白は飾りではなく、情報同士の関係を示す構造として扱う
- 影や角丸は階層表現に必要な範囲に抑える
- テーマは見た目の差分に限定し、slide type と情報構造は共通化する

詳細は `docs/slide-design-guide.md` を参照してください。テーマの使い分けは `docs/theme-catalog.md` にまとめています。

## サンプルページ

各テーマには以下の 27 ページを用意しています。文面は実資料に近いサンプルにし、スマホ閲覧でも読めるよう大きめの文字サイズを基準にしています。

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

## 出力確認

全サンプルを書き出す場合は次を実行します。

```bash
npm run render:all
```

個別に確認する場合:

```bash
npm run render -- --input slides/light --format png
npm run render -- --input slides/dark --format pdf
```

## 今後の候補

1. 1 ファイル内に複数 `.slide` を持てるようにする
2. frontmatter や JSON から変数注入できるようにする
3. テーマ切り替えと部品化を進める
4. 役割ごとのテンプレート選択を GUI 上で支援する
