import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd(), "slides");

const themes = {
  light: {
    label: "ライト",
    tag: "明るい背景で読みやすい標準サンプル",
    accent: "#2563eb",
    accent2: "#0f766e",
    accentKpi: "#2563eb",
    accentFlow: "#0f766e",
    bg: "#f7f9fc",
    surface: "#ffffff",
    text: "#101828",
    muted: "#475467",
    border: "#d0d5dd",
    soft: "#e8f1ff",
    chartA: "#2563eb",
    chartB: "#0f766e",
    chartC: "#f59e0b",
    chartD: "#dc2626",
    codeBg: "#111827",
    codeText: "#e5e7eb"
  },
  dark: {
    label: "ダーク",
    tag: "暗い背景で画面共有しやすいサンプル",
    accent: "#38bdf8",
    accent2: "#34d399",
    accentKpi: "#38bdf8",
    accentFlow: "#34d399",
    bg: "#0b1020",
    surface: "#111827",
    text: "#f8fafc",
    muted: "#cbd5e1",
    border: "#334155",
    soft: "#12263a",
    chartA: "#38bdf8",
    chartB: "#34d399",
    chartC: "#fbbf24",
    chartD: "#f87171",
    codeBg: "#020617",
    codeText: "#e2e8f0"
  }
};

const slides = [
  ["cover", "新サービス提案書", "表紙: 目的、対象、日付を大きく見せる", cover],
  ["section", "第1章 課題の整理", "セクション: 話題の切り替わりを明示する", section],
  ["single", "結論を1つだけ伝える", "1カラム: 主張と根拠を短く置く", single],
  ["two_column", "現状と提案を並べて比較", "2カラム: 左右に情報を分ける", twoColumn],
  ["list", "導入前に確認すること", "リスト: 条件や手順を大きく並べる", list],
  ["highlight", "最重要KPIを強調", "強調: 数値を大きく、説明を短くする", highlight],
  ["comparison", "3案の選定比較", "比較: 判断軸ごとに違いを見せる", comparison],
  ["cards", "4つの改善ポイント", "カード: 同格の情報を2列2行で整理する", cards],
  ["chart", "今月の指標サマリー", "グラフ: 代表値を短く確認する", chartOverview],
  ["flow", "申し込みから利用開始まで", "フロー: 矢印で順序を追いやすくする", flow],
  ["timeline", "リリースまでの時系列", "タイムライン: 日付と節目を横方向に並べる", timeline],
  ["gantt", "導入スケジュール", "ガント: 期間と担当を横棒で示す", gantt],
  ["diagram", "HTMLとCSSの関係図", "図解: 上下左右の関係を分けて見せる", diagram],
  ["system", "サービス構成図", "構成図: 利用者、クラウド、データの流れを示す", systemDiagram],
  ["code", "設定ファイルの例", "コード: 実装例を大きく読みやすく表示する", code],
  ["before_after", "改善前後の違い", "ビフォーアフター: 差分を左右で見せる", beforeAfter],
  ["faq", "想定質問と回答", "Q&A: 懸念に短く答える", faq],
  ["contact", "Thank you", "問い合わせ先: 次のアクションを明確にする", contact],
  ["chart-bar", "部門別の対応件数", "棒グラフ: カテゴリごとの量を比較する", chartBar],
  ["chart-line", "月別アクティブ率", "折れ線グラフ: 時系列の傾きを見る", chartLine],
  ["chart-pie", "問い合わせ内訳", "円グラフ: 全体に対する構成比を見る", chartPie],
  ["chart-stacked", "四半期別の売上内訳", "積み上げ: 合計と内訳を同時に見る", chartStacked],
  ["chart-area", "利用量の推移", "面グラフ: 推移と量感を合わせて見る", chartArea],
  ["chart-scatter", "利用時間と満足度", "散布図: 2指標の関係を見る", chartScatter],
  ["chart-radar", "機能評価のバランス", "レーダー: 複数指標の強弱を見る", chartRadar],
  ["chart-histogram", "処理時間の分布", "ヒストグラム: 分布の山と偏りを見る", chartHistogram],
  ["chart-waterfall", "利益増減の要因", "ウォーターフォール: 増減要因を順に示す", chartWaterfall]
];

function page(title, themeName, theme, index, [type, ja, purpose, content]) {
  const total = String(slides.length).padStart(2, "0");
  const no = String(index + 1).padStart(2, "0");
  const variant = type.startsWith("chart-") ? type.replace("chart-", "") : "default";
  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${theme.label} ${ja}</title>
    <style>@page { size: 1920px 1080px; margin: 0; }</style>
    <link rel="stylesheet" href="../base.css" />
    <link rel="stylesheet" href="./theme.css" />
  </head>
  <body>
    <main class="slide" data-theme="${themeName}" data-slide-type="${type}" data-slide-variant="${variant}">
      <div class="slide__shell">
        <header class="slide__header">
          <div class="brand">テンプレートサンプル</div>
          <div class="slide-id">${no}</div>
        </header>
        <section class="slide__body">
          <p class="kicker">${theme.tag}</p>
          <h1 class="title">${ja}</h1>
          <p class="lead">${purpose}</p>
          ${content(themeName, theme)}
        </section>
        <footer class="slide__footer">
          <span>${type}</span>
          <span>${no} / ${total}</span>
        </footer>
      </div>
    </main>
  </body>
</html>
`;
}

function cover() {
  return `<div class="cover-grid">
    <div class="hero-copy">
      <span class="deck-tag">2026.04</span>
      <h2>顧客対応を30%速くする新しい運用案</h2>
      <p>対象: カスタマーサポート部門 / 目的: 次期改善方針の合意</p>
    </div>
    <div class="meta-panel">
      <div><strong>発表者</strong><span>プロダクト企画</span></div>
      <div><strong>対象</strong><span>部門責任者</span></div>
      <div><strong>結論</strong><span>小さく始める</span></div>
    </div>
  </div>`;
}

function section() {
  return `<div class="section-band">
    <span>Section 01</span>
    <strong>課題を確認する</strong>
    <p>まず、現在の待ち時間と対応負荷を整理します。</p>
  </div>`;
}

function single() {
  return `<div class="panel wide">
    <h2>一次回答の遅れが、満足度低下の主因です。</h2>
    <p>問い合わせの初回返信を短縮すると、再問い合わせとエスカレーションを減らせます。</p>
  </div>`;
}

function twoColumn() {
  return `<div class="two-column">
    <div class="panel"><h2>現状</h2><p>担当者が履歴を探す時間が長く、初動が遅れています。</p></div>
    <div class="panel accent"><h2>提案</h2><p>問い合わせ分類と回答候補を先に提示します。</p></div>
  </div>`;
}

function list() {
  return `<div class="panel wide">
    <ul class="big-list">
      <li>対象チャネルを3つに絞る</li>
      <li>回答テンプレートを先に整備する</li>
      <li>初回返信時間を毎日確認する</li>
      <li>例外対応は人が判断する</li>
    </ul>
  </div>`;
}

function highlight() {
  return `<div class="highlight-grid">
    <div class="stat"><span>目標短縮</span><strong>30%</strong><em>初回返信時間</em></div>
    <div class="stat"><span>開始範囲</span><strong>3</strong><em>主要チャネル</em></div>
    <div class="stat"><span>検証期間</span><strong>4週</strong><em>小さく開始</em></div>
  </div>`;
}

function comparison() {
  return `<div class="compare-grid">
    <div class="compare-card"><h2>案A</h2><p>FAQを整理する。</p><strong>低コスト</strong></div>
    <div class="compare-card"><h2>案B</h2><p>回答候補を自動提示する。</p><strong>効果大</strong></div>
    <div class="compare-card"><h2>案C</h2><p>外部委託を増やす。</p><strong>即効性</strong></div>
  </div>`;
}

function cards() {
  return `<div class="cards-grid">
    <div class="card"><span>01</span><h2>分類</h2><p>問い合わせを自動で振り分ける。</p></div>
    <div class="card"><span>02</span><h2>候補</h2><p>回答文のたたきを提示する。</p></div>
    <div class="card"><span>03</span><h2>確認</h2><p>担当者が内容を確定する。</p></div>
    <div class="card"><span>04</span><h2>改善</h2><p>結果を次の候補に反映する。</p></div>
  </div>`;
}

function chartOverview() {
  return `<div class="chart-layout">
    ${barSvg()}
    <div class="panel"><h2>今月の傾向</h2><p>問い合わせ件数は増加。初回返信の改善余地が大きいです。</p></div>
  </div>`;
}

function flow() {
  return `<div class="flow-grid">
    ${["問い合わせ", "自動分類", "回答確認", "送信"].map((x, i) => `<div class="step"><span>0${i + 1}</span><strong>${x}</strong></div>`).join("")}
  </div>`;
}

function timeline() {
  return `<div class="timeline">
    ${[
      ["4/20", "要件確認", "対象チャネルを決める"],
      ["5/01", "試験開始", "回答候補を出す"],
      ["5/15", "中間確認", "精度と時間を確認"],
      ["6/01", "本番判断", "継続可否を決める"]
    ].map(([date, title, body]) => `<div class="time-item"><span>${date}</span><strong>${title}</strong><p>${body}</p></div>`).join("")}
  </div>`;
}

function gantt() {
  return `<div class="gantt">
    ${[
      ["要件整理", "4/20", 8, 28],
      ["テンプレ整備", "5/01", 24, 36],
      ["試験運用", "5/15", 46, 34],
      ["本番判断", "6/01", 74, 18]
    ].map(([title, date, start, width]) => `<div class="gantt-row"><strong>${title}</strong><span>${date}</span><i style="--start:${start};--width:${width};"></i></div>`).join("")}
  </div>`;
}

function diagram() {
  return `<div class="diagram diagram--stacked">
    <div class="node node--top">HTML<br><small>構造</small></div>
    <div class="node node--top">CSS<br><small>見た目</small></div>
    <div class="node primary">Render<br><small>結合</small></div>
    <div class="node">PNG<br><small>画像</small></div>
    <div class="node">PDF<br><small>配布</small></div>
  </div>`;
}

function systemDiagram() {
  return `<div class="system-map">
    <div class="sys-node user">利用者<br><small>Web / App</small></div>
    <div class="sys-node cloud">API<br><small>分類・候補生成</small></div>
    <div class="sys-node ops">担当者<br><small>確認・送信</small></div>
    <div class="sys-node db">DB<br><small>履歴・FAQ</small></div>
    <div class="sys-line sys-line--a"></div>
    <div class="sys-line sys-line--b"></div>
    <div class="sys-line sys-line--c"></div>
  </div>`;
}

function code() {
  return `<pre class="code-block"><code>const slide = {
  theme: "light | dark",
  type: "cover | chart | code",
  export: ["png", "pdf"]
};

await render(slide);</code></pre>`;
}

function beforeAfter() {
  return `<div class="before-after">
    <div class="impact-card before"><span>!</span><h2>現状のコスト</h2><p>履歴確認に時間がかかり、初回返信が遅れる。</p></div>
    <div class="impact-arrow">→</div>
    <div class="impact-card after"><span>+</span><h2>解決後の利益</h2><p>候補提示により、判断と送信に集中できる。</p></div>
  </div>`;
}

function faq() {
  return `<div class="faq-grid">
    <div class="qa"><h2>Q. テーマで構造は変わる?</h2><p>A. 変えません。見た目だけを差し替えます。</p></div>
    <div class="qa"><h2>Q. グラフはどこに入る?</h2><p>A. chart 系ページとして独立して確認します。</p></div>
    <div class="qa"><h2>Q. 出力確認は?</h2><p>A. render:all でPNGとPDFを書き出します。</p></div>
  </div>`;
}

function contact() {
  return `<div class="contact-slide">
    <div class="watermark">SF</div>
    <div class="contact-card">
      <span>Next Action</span>
      <h2>Thank you</h2>
      <p>導入相談: product@example.com</p>
      <p>次回レビュー: 2026.05.15</p>
    </div>
  </div>`;
}

function chartBar() {
  return `<div class="chart-layout">${barSvg()}<div class="panel"><h2>カテゴリ比較</h2><p>横軸に項目、縦軸に値を置き、差がすぐ分かるようにします。</p></div></div>`;
}

function chartLine() {
  return `<div class="chart-layout">${lineSvg()}<div class="panel"><h2>時系列推移</h2><p>点ではなく傾きを読むため、グリッド線と凡例を添えます。</p></div></div>`;
}

function chartPie() {
  return `<div class="chart-layout">${pieSvg()}<div class="panel"><h2>構成比</h2><p>内訳は凡例に分け、中心には最も重要な比率を表示します。</p></div></div>`;
}

function chartStacked() {
  return `<div class="panel wide">${stackedSvg()}<p class="chart-note">合計値を比較しながら、どの要素が増減したかを確認します。</p></div>`;
}

function chartArea() {
  return `<div class="chart-layout">${areaSvg()}<div class="panel"><h2>量感のある推移</h2><p>折れ線よりも面を強調し、累積量やボリュームの変化を見せます。</p></div></div>`;
}

function chartScatter() {
  return `<div class="chart-layout">${scatterSvg()}<div class="panel"><h2>相関を見る</h2><p>外れ値やクラスタが見えるよう、点の重なりを避けます。</p></div></div>`;
}

function chartRadar() {
  return `<div class="chart-layout">${radarSvg()}<div class="panel"><h2>複数軸の比較</h2><p>強みと弱みの輪郭を短時間で把握できます。</p></div></div>`;
}

function chartHistogram() {
  return `<div class="chart-layout">${histogramSvg()}<div class="panel"><h2>分布を見る</h2><p>平均値だけでは見えない偏りや山の位置を確認します。</p></div></div>`;
}

function chartWaterfall() {
  return `<div class="chart-layout">${waterfallSvg()}<div class="panel"><h2>増減要因</h2><p>開始値から最終値まで、どの要因が押し上げたかを示します。</p></div></div>`;
}

function barSvg() {
  return `<svg class="chart-svg" viewBox="0 0 760 430" role="img" aria-label="棒グラフ">
    <line class="axis" x1="90" y1="350" x2="700" y2="350"/><line class="axis" x1="90" y1="60" x2="90" y2="350"/>
    ${[["A", 210, 92], ["B", 150, 232], ["C", 270, 372], ["D", 190, 512]].map(([l, h, x]) => `<rect class="bar" x="${x}" y="${350 - h}" width="82" height="${h}"/><text x="${Number(x) + 41}" y="390">${l}</text>`).join("")}
  </svg>`;
}

function lineSvg() {
  return `<svg class="chart-svg" viewBox="0 0 760 430" role="img" aria-label="折れ線グラフ">
    <line class="axis" x1="80" y1="350" x2="700" y2="350"/><line class="axis" x1="80" y1="60" x2="80" y2="350"/>
    <polyline class="line-a" points="110,310 220,270 330,240 440,170 550,150 660,95"/>
    <polyline class="line-b" points="110,330 220,300 330,255 440,230 550,190 660,175"/>
    ${[[110,310],[220,270],[330,240],[440,170],[550,150],[660,95]].map(([x,y]) => `<circle class="point-a" cx="${x}" cy="${y}" r="8"/>`).join("")}
  </svg>`;
}

function pieSvg() {
  return `<svg class="chart-svg" viewBox="0 0 760 430" role="img" aria-label="円グラフ">
    <circle class="donut-track" cx="250" cy="215" r="120"/>
    <circle class="donut-a" cx="250" cy="215" r="120"/>
    <circle class="donut-b" cx="250" cy="215" r="120"/>
    <circle class="donut-c" cx="250" cy="215" r="120"/>
    <circle class="donut-hole" cx="250" cy="215" r="74"/>
    <text class="donut-text" x="250" y="225">52%</text>
    <text x="460" y="160">既存 52%</text><text x="460" y="220">新規 31%</text><text x="460" y="280">調整 17%</text>
  </svg>`;
}

function stackedSvg() {
  return `<svg class="chart-svg chart-svg--wide" viewBox="0 0 1200 360" role="img" aria-label="積み上げグラフ">
    ${[90, 170, 250].map((y, i) => `<text x="80" y="${y + 36}">Q${i + 1}</text><rect class="stack-a" x="160" y="${y}" width="${260 + i * 40}" height="46"/><rect class="stack-b" x="${420 + i * 40}" y="${y}" width="${180 + i * 30}" height="46"/><rect class="stack-c" x="${600 + i * 70}" y="${y}" width="${130 + i * 45}" height="46"/>`).join("")}
  </svg>`;
}

function areaSvg() {
  return `<svg class="chart-svg" viewBox="0 0 760 430" role="img" aria-label="面グラフ">
    <line class="axis" x1="80" y1="350" x2="700" y2="350"/><line class="axis" x1="80" y1="70" x2="80" y2="350"/>
    <path class="area" d="M100 330 L200 285 L310 260 L420 205 L530 150 L660 115 L660 350 L100 350 Z"/>
    <polyline class="line-a" points="100,330 200,285 310,260 420,205 530,150 660,115"/>
  </svg>`;
}

function scatterSvg() {
  const points = [[140,300],[190,255],[230,285],[285,220],[330,245],[390,190],[450,175],[505,145],[570,160],[625,105]];
  return `<svg class="chart-svg" viewBox="0 0 760 430" role="img" aria-label="散布図">
    <line class="axis" x1="80" y1="350" x2="700" y2="350"/><line class="axis" x1="80" y1="70" x2="80" y2="350"/>
    ${points.map(([x,y]) => `<circle class="scatter-point" cx="${x}" cy="${y}" r="12"/>`).join("")}
  </svg>`;
}

function radarSvg() {
  return `<svg class="chart-svg" viewBox="0 0 760 430" role="img" aria-label="レーダーチャート">
    <polygon class="radar-grid" points="380,70 520,170 465,325 295,325 240,170"/>
    <polygon class="radar-grid" points="380,125 465,185 430,280 330,280 295,185"/>
    <polygon class="radar-area" points="380,95 500,178 430,292 315,300 270,175"/>
    <text x="370" y="50">A</text><text x="535" y="174">B</text><text x="465" y="355">C</text><text x="270" y="355">D</text><text x="210" y="174">E</text>
  </svg>`;
}

function histogramSvg() {
  return `<svg class="chart-svg" viewBox="0 0 760 430" role="img" aria-label="ヒストグラム">
    <line class="axis" x1="80" y1="350" x2="700" y2="350"/><line class="axis" x1="80" y1="70" x2="80" y2="350"/>
    ${[60,110,180,250,205,150,95,55].map((h, i) => `<rect class="bar" x="${120 + i * 68}" y="${350 - h}" width="52" height="${h}"/>`).join("")}
  </svg>`;
}

function waterfallSvg() {
  const bars = [[220,130,"start"],[120,180,"up"],[70,300,"down"],[140,160,"up"],[90,250,"down"],[250,100,"end"]];
  return `<svg class="chart-svg" viewBox="0 0 760 430" role="img" aria-label="ウォーターフォールチャート">
    <line class="axis" x1="80" y1="350" x2="700" y2="350"/>
    ${bars.map(([h,y,t], i) => `<rect class="${t === "down" ? "fall" : "rise"}" x="${110 + i * 100}" y="${y}" width="70" height="${h}"/>`).join("")}
  </svg>`;
}

const baseCss = `:root {
  --slide-width: 1920px;
  --slide-height: 1080px;
  --page-padding: 64px;
  --radius: 8px;
  --font-body: "Noto Sans CJK JP", "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif;
  --font-mono: "JetBrains Mono", "Consolas", monospace;
}
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body { display: flex; flex-direction: column; align-items: center; padding: 24px; background: #d7dde8; font-family: var(--font-body); color: var(--text); }
.slide { position: relative; width: var(--slide-width); height: var(--slide-height); overflow: hidden; flex: 0 0 auto; background: var(--bg); border-radius: var(--radius); box-shadow: 0 20px 60px rgba(16,24,40,.18); break-after: page; page-break-after: always; }
.slide:last-child { break-after: auto; page-break-after: auto; }
.slide::before { content: ""; position: absolute; inset: 0; background: linear-gradient(135deg, var(--soft), transparent 44%); opacity: .7; pointer-events: none; }
.slide__shell { position: relative; z-index: 1; height: 100%; display: grid; grid-template-rows: auto 1fr auto; gap: 24px; padding: var(--page-padding); }
.slide__header, .slide__footer { display: flex; align-items: center; justify-content: space-between; color: var(--muted); font-size: 24px; font-weight: 700; }
.brand { color: var(--accent); }
.slide-id, .deck-tag { border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 16px; background: var(--surface); }
.slide__body { display: grid; align-content: start; gap: 20px; }
.kicker { margin: 0; color: var(--accent); font-size: 28px; font-weight: 800; }
.title { margin: 0; font-size: 78px; line-height: 1.05; letter-spacing: 0; }
.lead { margin: 0; max-width: 1280px; color: var(--muted); font-size: 36px; line-height: 1.35; }
h2, p { margin-top: 0; }
.cover-grid, .chart-layout, .two-column, .compare-grid, .cards-grid, .highlight-grid, .faq-grid { display: grid; gap: 24px; }
.cover-grid { grid-template-columns: 1.25fr .75fr; align-items: stretch; gap: 64px; }
.hero-copy h2 { margin: 18px 0; font-size: 64px; line-height: 1.12; }
.hero-copy p, .panel p, .card p, .qa p, .compare-card p { color: var(--muted); font-size: 34px; line-height: 1.38; }
.meta-panel, .panel, .card, .compare-card, .qa, .stat, .step { border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); box-shadow: 0 8px 24px rgba(16,24,40,.10); }
.meta-panel { display: grid; align-content: center; gap: 16px; padding: 32px; }
.meta-panel div { display: grid; gap: 8px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
.meta-panel strong, .meta-panel span { font-size: 32px; }
.meta-panel strong { color: var(--accent); }
.section-band { position: relative; display: grid; gap: 16px; align-content: center; min-height: 500px; padding: 48px; border-left: 16px solid transparent; background: linear-gradient(var(--surface), var(--surface)) padding-box, linear-gradient(180deg, var(--accent), var(--accent-flow)) border-box; border-radius: var(--radius); overflow: hidden; }
.section-band::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px); background-size: 42px 42px; opacity: .55; pointer-events: none; }
.section-band > * { position: relative; z-index: 1; }
.section-band span { color: var(--accent); font-size: 30px; font-weight: 800; }
.section-band strong { font-size: 92px; line-height: 1.03; }
.section-band p { color: var(--muted); font-size: 38px; line-height: 1.35; }
.panel { padding: 34px 38px; }
.panel.wide { max-width: 1280px; }
.panel h2, .card h2, .compare-card h2, .qa h2 { margin-bottom: 12px; font-size: 46px; line-height: 1.16; }
.panel.accent { border-color: var(--accent); }
.big-list { margin: 0; padding-left: 1.2em; font-size: 46px; line-height: 1.55; }
.highlight-grid { grid-template-columns: repeat(3, 1fr); }
.stat { display: grid; gap: 8px; padding: 32px; min-height: 250px; }
.stat span { color: var(--muted); font-size: 30px; }
.stat strong { color: var(--accent-kpi); font-size: 112px; line-height: 1; }
.stat em { color: var(--muted); font-size: 28px; font-style: normal; }
.compare-grid { grid-template-columns: repeat(3, 1fr); }
.compare-card { padding: 30px; display: grid; gap: 12px; }
.compare-card strong { color: var(--accent); font-size: 34px; }
.two-column { grid-template-columns: 1fr 1fr; align-items: stretch; }
.cards-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 1fr; gap: 20px; max-width: 1280px; }
.card { min-height: 190px; padding: 26px 30px; }
.card span { color: var(--accent); font-size: 28px; font-weight: 800; }
.chart-layout { grid-template-columns: 1.5fr .5fr; align-items: stretch; gap: 28px; }
.chart-layout .panel { align-self: center; background: var(--surface-soft); box-shadow: none; }
.chart-svg { width: 100%; height: 540px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
.chart-svg--wide { height: 480px; }
.axis { stroke: var(--muted); stroke-width: 3; }
.bar, .rise { fill: var(--chart-a); }
.fall { fill: var(--chart-d); }
.line-a { fill: none; stroke: var(--chart-a); stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; }
.line-b { fill: none; stroke: var(--chart-b); stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; opacity: .75; }
.point-a, .scatter-point { fill: var(--chart-a); }
.area, .radar-area { fill: var(--chart-a); opacity: .28; }
.donut-track { fill: none; stroke: var(--border); stroke-width: 44; }
.donut-a, .donut-b, .donut-c { fill: none; stroke-width: 44; transform: rotate(-90deg); transform-origin: 250px 215px; }
.donut-a { stroke: var(--chart-a); stroke-dasharray: 392 754; }
.donut-b { stroke: var(--chart-b); stroke-dasharray: 234 754; stroke-dashoffset: -392; }
.donut-c { stroke: var(--chart-c); stroke-dasharray: 128 754; stroke-dashoffset: -626; }
.donut-hole { fill: var(--surface); }
.donut-text { fill: var(--text); text-anchor: middle; font-size: 42px; font-weight: 800; }
svg text { fill: var(--text); font-size: 30px; font-weight: 700; text-anchor: middle; }
.stack-a { fill: var(--chart-a); } .stack-b { fill: var(--chart-b); } .stack-c { fill: var(--chart-c); }
.radar-grid { fill: none; stroke: var(--border); stroke-width: 3; }
.flow-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 46px; align-items: stretch; }
.step { position: relative; padding: 28px; min-height: 210px; display: grid; align-content: center; gap: 16px; }
.step:not(:last-child)::after { content: "→"; position: absolute; right: -42px; top: 50%; transform: translateY(-50%); color: var(--accent-flow); font-size: 54px; font-weight: 800; }
.step span { color: var(--accent-flow); font-size: 34px; font-weight: 800; }
.step strong { font-size: 42px; line-height: 1.2; }
.timeline { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; padding-top: 86px; }
.timeline::before { content: ""; position: absolute; left: 8%; right: 8%; top: 44px; height: 6px; background: var(--border); }
.time-item { position: relative; display: grid; gap: 10px; min-height: 220px; padding: 28px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
.time-item::before { content: ""; position: absolute; left: 32px; top: -54px; width: 26px; height: 26px; border: 6px solid var(--accent); border-radius: 50%; background: var(--bg); }
.time-item span { color: var(--accent); font-size: 32px; font-weight: 800; }
.time-item strong { font-size: 38px; line-height: 1.18; }
.time-item p { margin: 0; color: var(--muted); font-size: 30px; line-height: 1.35; }
.gantt { display: grid; gap: 22px; padding: 28px 34px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
.gantt::before { content: "4月        5月        6月"; display: block; margin-left: 300px; color: var(--muted); font-size: 26px; font-weight: 800; letter-spacing: 0; }
.gantt-row { position: relative; display: grid; grid-template-columns: 220px 70px 1fr; align-items: center; gap: 18px; min-height: 70px; }
.gantt-row strong { font-size: 34px; line-height: 1.2; }
.gantt-row span { color: var(--muted); font-size: 26px; font-weight: 800; }
.gantt-row::after { content: ""; height: 2px; background: var(--border); grid-column: 3; grid-row: 1; }
.gantt-row i { position: relative; z-index: 1; grid-column: 3; grid-row: 1; height: 28px; margin-left: calc(var(--start) * 1%); width: calc(var(--width) * 1%); border-radius: var(--radius); background: linear-gradient(90deg, var(--accent), var(--accent-flow)); box-shadow: 0 0 24px var(--accent-glow); }
.diagram { position: relative; height: 560px; display: grid; gap: 22px; }
.diagram--stacked { grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, 1fr); align-items: stretch; }
.diagram--stacked::before { content: ""; position: absolute; left: 12%; right: 12%; top: 50%; height: 4px; background: var(--border); }
.node { position: relative; z-index: 1; display: grid; place-items: center; min-height: 140px; padding: 20px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); color: var(--text); font-size: 38px; font-weight: 800; text-align: center; line-height: 1.18; }
.node small { color: var(--muted); font-size: 26px; }
.node--top:nth-child(1) { grid-column: 1; grid-row: 1; }
.node--top:nth-child(2) { grid-column: 2; grid-row: 1; }
.diagram--stacked .primary { grid-column: 2 / 4; grid-row: 2; }
.diagram--stacked .node:nth-child(4) { grid-column: 4; grid-row: 1; }
.diagram--stacked .node:nth-child(5) { grid-column: 4; grid-row: 2; }
.node.primary { border-color: var(--accent); color: var(--accent); }
.system-map { position: relative; height: 560px; display: grid; grid-template-columns: 1fr 1.15fr 1fr; grid-template-rows: 1fr 1fr; gap: 44px 84px; align-items: center; }
.sys-node { position: relative; z-index: 2; display: grid; place-items: center; min-height: 150px; padding: 24px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); font-size: 38px; font-weight: 800; line-height: 1.15; text-align: center; box-shadow: 0 0 28px var(--accent-glow); }
.sys-node small { color: var(--muted); font-size: 24px; }
.sys-node.user { grid-column: 1; grid-row: 1; }
.sys-node.cloud { grid-column: 2; grid-row: 1; border-color: var(--accent); color: var(--accent); min-height: 180px; }
.sys-node.ops { grid-column: 3; grid-row: 1; }
.sys-node.db { grid-column: 2; grid-row: 2; align-self: end; }
.sys-line { position: absolute; z-index: 1; height: 3px; background: var(--accent-flow); box-shadow: 0 0 18px var(--accent-glow); transform-origin: left center; }
.sys-line--a { left: 23%; right: 52%; top: 28%; }
.sys-line--b { left: 58%; right: 21%; top: 28%; }
.sys-line--c { left: 49%; width: 3px; height: 120px; top: 42%; }
.code-block { margin: 0; padding: 36px; border-radius: var(--radius); background: var(--code-bg); color: var(--code-text); font-family: var(--font-mono); font-size: 34px; line-height: 1.45; }
.before-after { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 34px; }
.impact-card { min-height: 300px; padding: 34px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
.impact-card span { display: grid; place-items: center; width: 58px; height: 58px; margin-bottom: 20px; border-radius: var(--radius); font-size: 34px; font-weight: 800; }
.impact-card h2 { margin-bottom: 14px; font-size: 46px; }
.impact-card p { color: var(--muted); font-size: 34px; line-height: 1.38; }
.impact-arrow { color: var(--accent-flow); font-size: 86px; font-weight: 800; }
.before { border-color: var(--chart-d); } .before span { color: var(--chart-d); background: var(--danger-soft); }
.after { border-color: var(--accent-flow); } .after span { color: var(--accent-flow); background: var(--flow-soft); }
.faq-grid { grid-template-columns: 1fr; }
.qa { padding: 26px 32px; }
.chart-note { color: var(--muted); font-size: 26px; }
.contact-slide { position: relative; min-height: 600px; display: grid; place-items: center; overflow: hidden; }
.watermark { position: absolute; color: var(--watermark); font-size: 420px; font-weight: 900; line-height: 1; }
.contact-card { position: relative; z-index: 1; display: grid; gap: 14px; min-width: 760px; padding: 44px 54px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-soft); text-align: center; }
.contact-card span { color: var(--accent-flow); font-size: 30px; font-weight: 800; }
.contact-card h2 { margin: 0; color: var(--accent); font-size: 104px; line-height: 1; }
.contact-card p { margin: 0; color: var(--text); font-size: 34px; line-height: 1.35; }
`;

function themeCss(t) {
  return `:root {
  --bg: ${t.bg};
  --surface: ${t.surface};
  --text: ${t.text};
  --muted: ${t.muted};
  --border: ${t.border};
  --accent: ${t.accent};
  --accent-2: ${t.accent2};
  --accent-kpi: ${t.accentKpi};
  --accent-flow: ${t.accentFlow};
  --soft: ${t.soft};
  --surface-soft: color-mix(in srgb, ${t.surface} 82%, transparent);
  --grid-line: color-mix(in srgb, ${t.accent} 18%, transparent);
  --accent-glow: color-mix(in srgb, ${t.accent} 30%, transparent);
  --danger-soft: color-mix(in srgb, ${t.chartD} 16%, transparent);
  --flow-soft: color-mix(in srgb, ${t.accentFlow} 16%, transparent);
  --watermark: color-mix(in srgb, ${t.accent} 10%, transparent);
  --chart-a: ${t.chartA};
  --chart-b: ${t.chartB};
  --chart-c: ${t.chartC};
  --chart-d: ${t.chartD};
  --code-bg: ${t.codeBg};
  --code-text: ${t.codeText};
}
`;
}

async function main() {
  await fs.rm(root, { recursive: true, force: true });
  await fs.mkdir(root, { recursive: true });
  await fs.writeFile(path.join(root, "base.css"), baseCss, "utf8");

  for (const [themeName, theme] of Object.entries(themes)) {
    const dir = path.join(root, themeName);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "theme.css"), themeCss(theme), "utf8");

    for (let index = 0; index < slides.length; index += 1) {
      const slide = slides[index];
      const no = String(index + 1).padStart(2, "0");
      const file = `${no}-${slide[0]}.html`;
      await fs.writeFile(path.join(dir, file), page(slide[1], themeName, theme, index, slide), "utf8");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
