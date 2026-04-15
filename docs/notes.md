# Notes

## テンプレート構成

- 共通ベース: `slides/base.css`
- テーマ差分: `slides/<style>/theme.css`
- 実データ: `slides/<style>/`

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

各スタイルには以下のページを用意しています。文面は「業務例」ではなく「このページは何用か」が分かる説明寄りです。

1. 表紙
2. problem
3. current-state
4. scope
5. proposed-solution
6. comparison-horizontal
7. trade-off
8. decision
9. flow
10. architecture
11. kpi-highlight
12. kpi-detailed
13. risk-faq
14. dependency-constraint
15. timeline-roadmap
16. conclusion
17. next-action
18. heading + body
19. bullets
20. image
21. 1 column
22. 2 column
23. before-after
24. comparison-vertical
25. charts
26. code
27. quote
28. deep-dive / appendix
29. table
30. image appendix
31. flowchart
32. mindmap
33. gantt-chart
34. line-chart
35. decision-matrix

## モバイル縦型テンプレート

`slides/mobile/` にはスマホ縦型のサンプルを用意しています。

1. cover
2. overview
3. feature-list
4. user-flow
5. kpi-cta

## 今後の候補

1. 1 ファイル内に複数 `.slide` を持てるようにする
2. frontmatter や JSON から変数注入できるようにする
3. テーマ切り替えと部品化を進める
4. 役割ごとのテンプレート選択を GUI 上で支援する
