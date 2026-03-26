# Notes

## テンプレート構成

- 共通ベース: `slides/templates/base/`
- テーマ差分: `slides/templates/<style>/theme.css`
- 実データ: `slides/<style>/`

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
