import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const themes = ["book", "dark", "light", "tech_news_catalog"];
const sharedCssPath = path.join(root, "slides", "sample-catalog.css");
const distDir = path.join(root, "dist");

const themeMeta = {
  book: {
    label: "Book",
    brand: "SlideForge / Book",
    tagline: "技術書・資料調の読みやすい構成"
  },
  dark: {
    label: "Dark",
    brand: "SlideForge / Dark",
    tagline: "暗色背景で画面共有しやすい構成"
  },
  light: {
    label: "Light",
    brand: "SlideForge / Light",
    tagline: "明るい背景で読みやすい標準構成"
  },
  tech_news_catalog: {
    label: "Tech News Catalog",
    brand: "Tech News Catalog",
    tagline: "IT解説・ニュース解説動画向け構成"
  }
};

const groups = {
  p0: [
    ["title", "生成AIとセキュリティ事故を読み解く", "ニュースの事実、技術的な論点、再発防止を1枚ずつ整理します。"],
    ["agenda", "本日の流れ", "何が起きたか / 技術的な原因 / 守るための設計 / まとめ"],
    ["section_divider", "01", "事実関係を整理する", "報道・公式発表・推測を混ぜずに分けます。"],
    ["key_message", "最重要メッセージ", "AIが悪い、ではなく、権限設計と監視の弱さが被害を広げます。"],
    ["three_cards", "押さえる3点", "被害範囲 / 攻撃経路 / 再発防止"],
    ["comparison_table", "安全な実装と危ない実装", "観点別に差分を比較します。"],
    ["timeline_horizontal", "時系列で見る対応", "検知から復旧までの流れを横方向で追います。"],
    ["timeline_vertical", "調査ログの流れ", "イベントを縦方向に整理します。"],
    ["flowchart", "確認フロー", "入力、判定、対応の分岐を整理します。"],
    ["architecture", "安全なWebサービス構成", "フロント、API、認証、DB、監視の責務を分けます。"],
    ["code", "設定例", "危険な権限を避ける設定例を示します。"],
    ["summary", "まとめ", "事実、技術、運用の3層で再確認します。"]
  ],
  p1: [
    ["terminal_log", "ターミナル / ログ表示", "調査時に見るべきログの粒度を示します。"],
    ["api_request_response", "APIリクエスト / レスポンス", "リクエストとレスポンスを左右で比較します。"],
    ["database_table", "データベース / テーブル表示", "漏えい対象やカラムの意味を整理します。"],
    ["browser_mock", "ブラウザ画面モック", "管理画面やユーザー画面を説明します。"],
    ["file_tree", "ファイル構成ツリー", "プロジェクト構成と責務を示します。"],
    ["security_attack_flow", "セキュリティ / 攻撃フロー", "攻撃者から持ち出しまでの流れを分解します。"],
    ["incident_report", "インシデントレポート", "発生日時、影響、原因、対応を表で整理します。"],
    ["risk_matrix", "リスクマトリクス", "発生確率と影響度で優先順位を判断します。"]
  ],
  p2: [
    ["news_headline", "ニュース見出し風", "視聴者に何の話題かを即時に伝えます。"],
    ["issue_summary", "論点整理", "ニュースの争点を質問形式で整理します。"],
    ["cause_effect_solution", "原因・影響・対策", "3段構成で全体像を見せます。"],
    ["number_highlight", "数字強調スライド", "重要な数値を大きく見せます。"],
    ["quote", "引用・発言スライド", "公式発表や関係者発言を読みやすく配置します。"],
    ["sns_reaction_summary", "SNS反応まとめ", "反応を肯定・否定・疑問に分類します。"],
    ["what_happened_timeline", "何が起きたのか", "出来事の流れを時系列で整理します。"],
    ["final_opinion", "最後の見解・まとめ", "結論と今後の見通しを短く締めます。"]
  ]
};

const slides = Object.entries(groups).flatMap(([phase, items]) =>
  items.map(([type, title, lead, extra]) => ({ phase, type, title, lead, extra }))
);

const sharedCss = `/* Shared catalog components for book / dark / light / tech_news_catalog. */
.slide[data-catalog="tech-news"] {
  --catalog-safe-bottom: 150px;
  --catalog-header-bg: linear-gradient(90deg, var(--accent-2, #07142f), var(--accent, #2458e6));
  --catalog-card-bg: var(--surface);
  --catalog-panel-bg: var(--surface-soft, var(--surface));
  --catalog-code-bg: var(--code-bg, #111827);
  --catalog-code-text: var(--code-text, #e5e7eb);
}
.slide[data-catalog="tech-news"] .slide__shell { grid-template-rows: 92px 1fr 54px; padding: 0 var(--page-padding) 34px; }
.slide[data-catalog="tech-news"] .slide__header { margin: 0 calc(var(--page-padding) * -1); padding: 0 var(--page-padding); background: var(--catalog-header-bg); color: #fff; }
.slide[data-catalog="tech-news"] .brand { color: #fff; display: flex; align-items: center; gap: 18px; }
.slide[data-catalog="tech-news"] .brand::before { content: ""; width: 34px; height: 34px; border-radius: max(4px, var(--radius)); background: var(--accent); box-shadow: inset 0 0 0 1px rgba(255,255,255,.35); }
.slide[data-catalog="tech-news"] .slide-id { border-color: rgba(255,255,255,.34); background: rgba(255,255,255,.08); color: #fff; border-radius: 999px; }
.slide[data-catalog="tech-news"] .slide__body { align-content: start; gap: 20px; padding-top: 34px; padding-bottom: var(--catalog-safe-bottom); }
.slide[data-catalog="tech-news"] .title { font-size: 62px; line-height: 1.12; letter-spacing: -.02em; }
.slide[data-catalog="tech-news"] .lead { max-width: 1320px; font-size: 32px; line-height: 1.42; }
.slide[data-catalog="tech-news"] .surface,
.slide[data-catalog="tech-news"] .catalog-card,
.slide[data-catalog="tech-news"] .catalog-panel,
.slide[data-catalog="tech-news"] .catalog-table,
.slide[data-catalog="tech-news"] .catalog-code {
  background: var(--catalog-card-bg);
  border: 1px solid var(--border);
  border-radius: max(8px, var(--radius));
  box-shadow: 0 8px 22px rgba(16,24,40,.08);
}
.slide[data-catalog="tech-news"] .label { display: inline-flex; width: fit-content; padding: 8px 14px; border-radius: 999px; background: var(--soft); color: var(--accent); font-size: 22px; font-weight: 900; }
.slide[data-catalog="tech-news"] .catalog-cover { display: grid; grid-template-columns: 1.1fr .9fr; gap: 44px; align-items: stretch; }
.slide[data-catalog="tech-news"] .catalog-hero { min-height: 560px; padding: 54px; border-radius: max(10px, var(--radius)); color: #fff; background: var(--catalog-header-bg); overflow: hidden; }
.slide[data-catalog="tech-news"] .catalog-hero h2 { margin: 44px 0 20px; font-size: 74px; line-height: 1.08; }
.slide[data-catalog="tech-news"] .catalog-hero p { color: rgba(255,255,255,.82); font-size: 30px; line-height: 1.45; }
.slide[data-catalog="tech-news"] .meta-grid { display: grid; gap: 18px; align-content: center; }
.slide[data-catalog="tech-news"] .meta { padding: 28px; }
.slide[data-catalog="tech-news"] .meta strong { display: block; color: var(--accent); font-size: 25px; }
.slide[data-catalog="tech-news"] .meta span { display: block; margin-top: 8px; font-size: 31px; font-weight: 800; }
.slide[data-catalog="tech-news"] .agenda { display: grid; grid-template-columns: .55fr 1fr; gap: 42px; align-items: center; }
.slide[data-catalog="tech-news"] .agenda-word { color: var(--accent); font-size: 56px; font-weight: 900; }
.slide[data-catalog="tech-news"] .agenda-list { display: grid; gap: 17px; }
.slide[data-catalog="tech-news"] .agenda-item { display: grid; grid-template-columns: 62px 1fr; align-items: center; gap: 18px; padding: 20px 24px; }
.slide[data-catalog="tech-news"] .agenda-item b { display: grid; place-items: center; width: 54px; height: 54px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 22px; }
.slide[data-catalog="tech-news"] .agenda-item span { font-size: 31px; font-weight: 800; }
.slide[data-catalog="tech-news"] .section-band { display: grid; grid-template-columns: 280px 1fr; gap: 54px; align-items: center; min-height: 560px; padding: 54px; color: #fff; background: var(--catalog-header-bg); border-radius: max(10px, var(--radius)); }
.slide[data-catalog="tech-news"] .section-no { font-size: 122px; font-weight: 900; color: rgba(255,255,255,.88); border-right: 2px solid rgba(255,255,255,.25); }
.slide[data-catalog="tech-news"] .section-copy h2 { margin: 0 0 18px; font-size: 62px; }
.slide[data-catalog="tech-news"] .section-copy p { margin: 0; color: rgba(255,255,255,.82); font-size: 32px; line-height: 1.45; }
.slide[data-catalog="tech-news"] .keybox { display: grid; place-items: center; min-height: 530px; padding: 60px; text-align: center; }
.slide[data-catalog="tech-news"] .quote-mark { color: var(--accent); font-size: 86px; line-height: .8; }
.slide[data-catalog="tech-news"] .keybox h2 { margin: 0; max-width: 1240px; font-size: 58px; line-height: 1.22; }
.slide[data-catalog="tech-news"] .keybox p { margin: 18px 0 0; color: var(--muted); font-size: 28px; }
.slide[data-catalog="tech-news"] .cards3,
.slide[data-catalog="tech-news"] .cause,
.slide[data-catalog="tech-news"] .sns { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
.slide[data-catalog="tech-news"] .catalog-card { min-height: 320px; padding: 30px; }
.slide[data-catalog="tech-news"] .icon { display: grid; place-items: center; width: 62px; height: 62px; margin-bottom: 20px; border-radius: max(8px, var(--radius)); background: var(--accent); color: #fff; font-size: 32px; font-weight: 900; }
.slide[data-catalog="tech-news"] .catalog-card h2 { margin: 0 0 14px; font-size: 37px; line-height: 1.18; }
.slide[data-catalog="tech-news"] .catalog-card p,
.slide[data-catalog="tech-news"] .catalog-panel p { color: var(--muted); font-size: 27px; line-height: 1.45; }
.slide[data-catalog="tech-news"] .catalog-table { overflow: hidden; }
.slide[data-catalog="tech-news"] table { width: 100%; border-collapse: collapse; font-size: 27px; }
.slide[data-catalog="tech-news"] th { background: var(--catalog-header-bg); color: #fff; }
.slide[data-catalog="tech-news"] th,
.slide[data-catalog="tech-news"] td { padding: 22px 24px; border: 1px solid var(--border); text-align: left; }
.slide[data-catalog="tech-news"] td.good { color: var(--chart-b, var(--accent-flow)); font-weight: 900; }
.slide[data-catalog="tech-news"] td.bad { color: var(--chart-d, #dc2626); font-weight: 900; }
.slide[data-catalog="tech-news"] .timeline-h { position: relative; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; padding-top: 86px; }
.slide[data-catalog="tech-news"] .timeline-h::before { content: ""; position: absolute; left: calc((100% - 72px) / 8); right: calc((100% - 72px) / 8); top: 42px; height: 5px; background: var(--border); }
.slide[data-catalog="tech-news"] .time { position: relative; min-height: 230px; padding: 24px; }
.slide[data-catalog="tech-news"] .time::before { content: ""; position: absolute; left: 50%; top: -58px; transform: translateX(-50%); width: 26px; height: 26px; border: 7px solid var(--accent); border-radius: 50%; background: var(--bg); }
.slide[data-catalog="tech-news"] .time b { color: var(--accent); font-size: 29px; }
.slide[data-catalog="tech-news"] .time h3 { margin: 10px 0; font-size: 32px; }
.slide[data-catalog="tech-news"] .time p { margin: 0; color: var(--muted); font-size: 24px; line-height: 1.38; }
.slide[data-catalog="tech-news"] .timeline-v { display: grid; width: 100%; gap: 16px; grid-auto-rows: minmax(88px, 1fr); }
.slide[data-catalog="tech-news"] .vitem { display: grid; grid-template-columns: 150px 1fr; gap: 24px; align-items: center; min-height: 88px; padding: 20px 26px; }
.slide[data-catalog="tech-news"] .vitem b { color: var(--accent); font-size: 28px; }
.slide[data-catalog="tech-news"] .vitem span { font-size: 31px; font-weight: 800; }
.slide[data-catalog="tech-news"] .flowchart-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 78px 46px 210px 46px 78px; gap: 10px 36px; align-items: center; justify-items: center; max-width: 1120px; margin: 0 auto; }
.slide[data-catalog="tech-news"] .flow-node { min-width: 250px; padding: 20px 30px; border-radius: 999px; background: var(--accent-2); color: #fff; text-align: center; font-size: 30px; font-weight: 900; }
.slide[data-catalog="tech-news"] .flow-node.start { grid-column: 2; grid-row: 1; }
.slide[data-catalog="tech-news"] .flow-node.left { grid-column: 1; grid-row: 3; }
.slide[data-catalog="tech-news"] .flow-node.right { grid-column: 3; grid-row: 3; }
.slide[data-catalog="tech-news"] .flow-node.end { grid-column: 2; grid-row: 5; }
.slide[data-catalog="tech-news"] .flow-decision { grid-column: 2; grid-row: 3; width: 190px; height: 190px; display: grid; place-items: center; background: var(--accent-2); color: #fff; transform: rotate(45deg); border-radius: 10px; font-size: 30px; font-weight: 900; text-align: center; }
.slide[data-catalog="tech-news"] .flow-decision span { transform: rotate(-45deg); }
.slide[data-catalog="tech-news"] .flow-arrow { color: var(--accent); font-size: 46px; font-weight: 900; line-height: 1; }
.slide[data-catalog="tech-news"] .flow-arrow.down-a { grid-column: 2; grid-row: 2; }
.slide[data-catalog="tech-news"] .flow-arrow.left-a { grid-column: 1 / 2; grid-row: 3; justify-self: end; margin-right: -18px; }
.slide[data-catalog="tech-news"] .flow-arrow.right-a { grid-column: 3 / 4; grid-row: 3; justify-self: start; margin-left: -18px; }
.slide[data-catalog="tech-news"] .flow-arrow.down-b { grid-column: 2; grid-row: 4; }
.slide[data-catalog="tech-news"] .flow-label { color: var(--muted); font-size: 22px; font-weight: 800; }
.slide[data-catalog="tech-news"] .arch { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; align-items: center; min-height: 460px; }
.slide[data-catalog="tech-news"] .arch .catalog-card { min-height: 230px; text-align: center; }
.slide[data-catalog="tech-news"] .catalog-code { overflow: hidden; background: var(--catalog-code-bg); }
.slide[data-catalog="tech-news"] .code-window { display: flex; gap: 10px; padding: 16px 22px; background: color-mix(in srgb, var(--catalog-code-bg) 82%, white); }
.slide[data-catalog="tech-news"] .dot { width: 16px; height: 16px; border-radius: 50%; background: #f87171; }
.slide[data-catalog="tech-news"] .dot:nth-child(2) { background: #fbbf24; }
.slide[data-catalog="tech-news"] .dot:nth-child(3) { background: #34d399; }
.slide[data-catalog="tech-news"] pre { margin: 0; padding: 30px 34px; color: var(--catalog-code-text); font: 29px/1.45 var(--font-mono); white-space: pre-wrap; }
.slide[data-catalog="tech-news"] .summary { display: grid; grid-template-columns: 1fr 360px; gap: 36px; align-items: stretch; }
.slide[data-catalog="tech-news"] .checklist { display: grid; gap: 17px; }
.slide[data-catalog="tech-news"] .check { padding: 22px 26px; font-size: 31px; font-weight: 800; }
.slide[data-catalog="tech-news"] .circle-message { display: grid; place-items: center; text-align: center; border-radius: 50%; background: var(--catalog-card-bg); border: 1px solid var(--border); color: var(--accent-2); font-size: 38px; font-weight: 900; }
.slide[data-catalog="tech-news"] .log-ok { color: #7ddc7a; } .slide[data-catalog="tech-news"] .log-warn { color: #facc15; } .slide[data-catalog="tech-news"] .log-bad { color: #fb7185; }
.slide[data-catalog="tech-news"] .api-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 28px; align-items: center; }
.slide[data-catalog="tech-news"] .api-card h3 { margin: 0; padding: 16px 24px; background: var(--accent); color: #fff; font-size: 28px; }
.slide[data-catalog="tech-news"] .api-card pre { background: var(--catalog-card-bg); color: var(--text); font-size: 24px; }
.slide[data-catalog="tech-news"] .browser { overflow: hidden; }
.slide[data-catalog="tech-news"] .browser-bar { display: flex; gap: 12px; align-items: center; padding: 15px 20px; background: var(--soft); }
.slide[data-catalog="tech-news"] .url { flex: 1; padding: 9px 16px; border-radius: 999px; background: var(--catalog-card-bg); color: var(--muted); font-size: 20px; }
.slide[data-catalog="tech-news"] .browser-body { display: grid; grid-template-columns: 210px 1fr; min-height: 390px; }
.slide[data-catalog="tech-news"] .browser-nav { padding: 28px; background: var(--accent-2); color: #fff; font-size: 24px; line-height: 2.1; }
.slide[data-catalog="tech-news"] .browser-main { padding: 28px; display: grid; gap: 20px; }
.slide[data-catalog="tech-news"] .filetree { display: grid; grid-template-columns: .65fr 1fr; gap: 28px; }
.slide[data-catalog="tech-news"] .tree { background: var(--catalog-code-bg); color: var(--catalog-code-text); font: 26px/1.45 var(--font-mono); }
.slide[data-catalog="tech-news"] .attack { display: grid; grid-template-columns: repeat(5,1fr); gap: 18px; align-items: center; }
.slide[data-catalog="tech-news"] .attack .catalog-card { min-height: 230px; text-align: center; }
.slide[data-catalog="tech-news"] .incident { display: grid; grid-template-columns: 1.2fr .8fr; gap: 28px; }
.slide[data-catalog="tech-news"] .risk { display: grid; grid-template-columns: 1fr .62fr; gap: 34px; align-items: center; }
.slide[data-catalog="tech-news"] .matrix { display: grid; grid-template-columns: repeat(3,140px); grid-template-rows: repeat(3,112px); gap: 6px; }
.slide[data-catalog="tech-news"] .cell { display: grid; place-items: center; border-radius: max(6px, var(--radius)); font-size: 33px; font-weight: 900; }
.slide[data-catalog="tech-news"] .low { background: #7bcf8a; } .slide[data-catalog="tech-news"] .mid { background: #ffe166; } .slide[data-catalog="tech-news"] .high { background: #f59e42; } .slide[data-catalog="tech-news"] .critical { background: #ef4444; color: #fff; }
.slide[data-catalog="tech-news"] .headline { min-height: 540px; padding: 54px; color: #fff; background: var(--catalog-header-bg); border-radius: max(10px, var(--radius)); }
.slide[data-catalog="tech-news"] .headline .label { color: #fff; background: #dc2626; }
.slide[data-catalog="tech-news"] .headline h2 { margin: 34px 0 22px; font-size: 68px; line-height: 1.15; }
.slide[data-catalog="tech-news"] .headline p { color: rgba(255,255,255,.82); font-size: 30px; }
.slide[data-catalog="tech-news"] .issue-list { display: grid; gap: 18px; }
.slide[data-catalog="tech-news"] .issue { display: grid; grid-template-columns: 80px 1fr; gap: 18px; align-items: center; padding: 22px 26px; }
.slide[data-catalog="tech-news"] .issue b { display: grid; place-items: center; width: 60px; height: 60px; border-radius: 50%; background: var(--soft); color: var(--accent); }
.slide[data-catalog="tech-news"] .cause .catalog-card:nth-child(1) .icon { background: var(--chart-d, #dc2626); }
.slide[data-catalog="tech-news"] .cause .catalog-card:nth-child(2) .icon { background: var(--chart-c, #f59e0b); }
.slide[data-catalog="tech-news"] .cause .catalog-card:nth-child(3) .icon { background: var(--chart-b, var(--accent-flow)); }
.slide[data-catalog="tech-news"] .number { display: grid; place-items: center; text-align: center; min-height: 500px; }
.slide[data-catalog="tech-news"] .number strong { color: var(--accent); font-size: 128px; line-height: 1; }
.slide[data-catalog="tech-news"] .number p { color: var(--muted); font-size: 31px; }
.slide[data-catalog="tech-news"] .quote { display: grid; place-items: center; min-height: 510px; padding: 48px; text-align: center; }
.slide[data-catalog="tech-news"] .quote blockquote { margin: 0; max-width: 1260px; font-size: 45px; line-height: 1.45; font-weight: 800; }
.slide[data-catalog="tech-news"] .quote cite { margin-top: 28px; color: var(--muted); font-size: 25px; font-style: normal; }
.slide[data-catalog="tech-news"] .opinion { display: grid; grid-template-columns: 360px 1fr; gap: 28px; }
.slide[data-catalog="tech-news"] .opinion-label { display: grid; place-items: center; color: #fff; background: var(--catalog-header-bg); border-radius: max(10px, var(--radius)); font-size: 40px; font-weight: 900; text-align: center; }
`;

const techNewsThemeCss = `:root {
  --bg: #f4f7fb;
  --surface: #ffffff;
  --text: #111827;
  --muted: #526071;
  --border: #d8e0ec;
  --accent: #2458e6;
  --accent-2: #07142f;
  --accent-kpi: #2458e6;
  --accent-flow: #2f7cff;
  --soft: #edf4ff;
  --surface-soft: rgba(255,255,255,.92);
  --grid-line: color-mix(in srgb, #2458e6 16%, transparent);
  --accent-glow: color-mix(in srgb, #2458e6 24%, transparent);
  --danger-soft: color-mix(in srgb, #df2f3a 14%, transparent);
  --flow-soft: color-mix(in srgb, #2f7cff 14%, transparent);
  --watermark: color-mix(in srgb, #2458e6 10%, transparent);
  --chart-a: #2458e6;
  --chart-b: #2fa66a;
  --chart-c: #f18a28;
  --chart-d: #df2f3a;
  --code-bg: #101827;
  --code-text: #dbeafe;
}
.slide { background: var(--bg); }
.slide::before { background: radial-gradient(circle at 90% 8%, rgba(36,88,230,.16), transparent 30%), linear-gradient(135deg, rgba(255,255,255,.9), transparent 46%); }
`;

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function fileName(index, type) {
  return `${String(index + 1).padStart(2, "0")}-${type.replaceAll("_", "-")}.html`;
}

function page(slide, theme, index) {
  const no = String(index + 1).padStart(2, "0");
  const meta = themeMeta[theme];

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(meta.label)} ${esc(slide.title)}</title>
    <style>@page { size: 1920px 1080px; margin: 0; }</style>
    <link rel="stylesheet" href="../base.css" />
    <link rel="stylesheet" href="./theme.css" />
    <link rel="stylesheet" href="../sample-catalog.css" />
  </head>
  <body>
    <main class="slide" data-catalog="tech-news" data-theme="${theme}" data-slide-type="${slide.type}" data-slide-phase="${slide.phase}">
      <div class="slide__shell">
        <header class="slide__header">
          <div class="brand">${esc(meta.brand)}</div>
          <div class="slide-id">${slide.phase.toUpperCase()}-${no}</div>
        </header>
        <section class="slide__body">
          <p class="kicker">${esc(slide.type)}</p>
          <h1 class="title">${esc(slide.title)}</h1>
          <p class="lead">${esc(slide.lead)}</p>
          ${body(slide, meta)}
        </section>
        <footer class="slide__footer">
          <span>slides/${theme}/${fileName(index, slide.type)}</span>
          <span>${no} / ${String(slides.length).padStart(2, "0")}</span>
        </footer>
      </div>
    </main>
  </body>
</html>
`;
}

function body(slide, meta) {
  switch (slide.type) {
    case "title":
      return `<div class="catalog-cover"><div class="catalog-hero"><span class="label">NEWS / IT EXPLAINER</span><h2>${esc(slide.title)}</h2><p>${esc(meta.tagline)}。テキストを差し替えて、技術解説・ニュース解説に使えます。</p></div><div class="meta-grid"><div class="meta surface"><strong>用途</strong><span>IT解説・ニュース解説</span></div><div class="meta surface"><strong>比率</strong><span>16:9 Wide</span></div><div class="meta surface"><strong>安全余白</strong><span>下部字幕を避ける</span></div></div></div>`;
    case "agenda":
      return `<div class="agenda"><div class="agenda-word">Agenda</div><div class="agenda-list">${["事実関係を整理する","技術的な論点を見る","対策と運用を分ける","視聴者への結論を出す"].map((item, i) => `<div class="agenda-item surface"><b>${String(i + 1).padStart(2, "0")}</b><span>${esc(item)}</span></div>`).join("")}</div></div>`;
    case "section_divider":
      return `<div class="section-band"><div class="section-no">${esc(slide.title)}</div><div class="section-copy"><h2>${esc(slide.lead)}</h2><p>${esc(slide.extra)}</p></div></div>`;
    case "key_message":
      return `<div class="keybox surface"><div class="quote-mark">“</div><h2>${esc(slide.lead)}</h2><p>結論を1つだけ強く見せ、補足は台本側で説明します。</p></div>`;
    case "three_cards":
      return cards(["被害範囲", "攻撃経路", "再発防止"], ["何が、どこまで影響したかを分離します。", "認証・権限・入力のどこが突破されたかを見ます。", "設計、監視、運用の3層で対策します。"]);
    case "comparison_table":
      return table([["観点", "安全な実装", "危ない実装"], ["権限", "最小権限", "広すぎる管理権限"], ["入力", "検証と制限", "未検証の直通処理"], ["監視", "異常検知あり", "ログを見ない"], ["復旧", "手順化済み", "担当者依存"]]);
    case "timeline_horizontal":
      return `<div class="timeline-h">${["検知", "遮断", "調査", "復旧判断"].map((item, i) => `<div class="time surface"><b>Day ${i + 1}</b><h3>${esc(item)}</h3><p>事実、影響、次の対応を短く記録します。</p></div>`).join("")}</div>`;
    case "timeline_vertical":
      return timeline(["10:00 異常リクエストを検知", "10:15 対象APIを制限", "11:00 影響範囲を確認", "13:30 利用者向け告知", "15:00 再発防止策を開始"]);
    case "flowchart":
      return `<div class="flowchart-grid"><div class="flow-node start">開始</div><div class="flow-arrow down-a">↓</div><div class="flow-node left">監視継続</div><div class="flow-arrow left-a">←</div><div class="flow-decision"><span>異常?</span></div><div class="flow-arrow right-a">→</div><div class="flow-node right">遮断・調査</div><div class="flow-arrow down-b">↓</div><div class="flow-node end">報告</div></div>`;
    case "architecture":
      return cards(["ユーザー", "フロントエンド", "API / 認証", "DB / 監視"], ["Web / App", "入力制御と画面表示", "認可・レート制限", "保存・監査ログ"], "arch");
    case "code":
      return code(`// 権限を用途ごとに分ける例\nconst policy = {\n  user: [\"read:own_profile\"],\n  support: [\"read:tickets\", \"write:reply\"],\n  admin: [\"read:audit_log\"]\n};\n\nassertLeastPrivilege(policy);`);
    case "summary":
      return `<div class="summary"><div class="checklist">${["事実と推測を分ける", "AI利用より権限設計を見る", "監視と復旧手順を用意する"].map((item) => `<div class="check surface">✓ ${esc(item)}</div>`).join("")}</div><div class="circle-message">結論を<br>短く<br>残す</div></div>`;
    case "terminal_log":
      return `<div class="terminal catalog-code"><div class="code-window"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><pre><span class="log-ok">[INFO]</span> audit log loaded\n<span class="log-warn">[WARN]</span> unusual request burst detected\n<span class="log-bad">[ERROR]</span> permission mismatch on /admin/export\n<span class="log-ok">[INFO]</span> token revoked and session closed</pre></div>`;
    case "api_request_response":
      return `<div class="api-grid"><div class="api-card surface"><h3>Request</h3><pre>POST /api/users\nAuthorization: Bearer ***\n\n{\"action\":\"cancel\"}</pre></div><div class="arrow">↔</div><div class="api-card surface"><h3>Response</h3><pre>HTTP/1.1 403 Forbidden\n\n{\"error\":\"scope denied\"}</pre></div></div>`;
    case "database_table":
      return table([["id", "email", "role", "risk"], ["1", "taro@example.com", "user", "low"], ["2", "admin@example.com", "admin", "high"], ["3", "ops@example.com", "support", "mid"]]);
    case "browser_mock":
      return `<div class="browser surface"><div class="browser-bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="url">https://example.com/dashboard</span></div><div class="browser-body"><div class="browser-nav">Dashboard<br>Users<br>Reports<br>Settings</div><div class="browser-main">${cards(["ユーザー数", "アラート", "監査ログ"], ["12,340", "3件", "最新100件"])}</div></div></div>`;
    case "file_tree":
      return `<div class="filetree"><pre class="tree surface">my-project/\n├─ src/\n│  ├─ api/\n│  └─ auth/\n├─ tests/\n├─ docs/\n└─ package.json</pre>${cards(["src/", "tests/", "docs/"], ["実装コード", "自動テスト", "運用メモ"])}</div>`;
    case "security_attack_flow":
      return `<div class="attack">${["攻撃者", "脆弱性", "侵入", "権限昇格", "持ち出し"].map((item, i) => `<div class="catalog-card"><div class="icon">${i + 1}</div><h2>${esc(item)}</h2><p>段階ごとに遮断ポイントを置きます。</p></div>`).join("")}</div>`;
    case "incident_report":
      return `<div class="incident">${table([["項目", "内容"], ["発生日時", "2026-07-07 10:15"], ["影響範囲", "一部ユーザー情報"], ["原因", "調査中"], ["対応", "遮断・告知・監視強化"]])}<div class="catalog-panel surface"><span class="label">Status</span><p>報告スライドでは、断定できる事実だけを太く扱います。</p></div></div>`;
    case "risk_matrix":
      return `<div class="risk"><div class="matrix">${["low", "mid", "high", "mid", "high", "critical", "high", "critical", "critical"].map((level, i) => `<div class="cell ${level}">${i + 1}</div>`).join("")}</div><div class="catalog-panel surface"><p>縦軸は影響度、横軸は発生確率。右上ほど優先対応です。</p></div></div>`;
    case "news_headline":
      return `<div class="headline"><span class="label">速報</span><h2>大手サービスで情報流出の可能性</h2><p>何が起きたのか、影響範囲、今後の対応を短く整理します。</p></div>`;
    case "issue_summary":
      return `<div class="issue-list">${["セキュリティ対策は十分だったのか？", "ユーザーへの影響はどこまであるのか？", "運営側の対応は適切だったのか？"].map((item, i) => `<div class="issue surface"><b>Q${i + 1}</b><span>${esc(item)}</span></div>`).join("")}</div>`;
    case "cause_effect_solution":
      return `<div class="cause">${["原因", "影響", "対策"].map((item, i) => `<div class="catalog-card"><div class="icon">${i + 1}</div><h2>${esc(item)}</h2><p>${esc(["設定ミス、権限過多、監視不足を切り分けます。", "利用者、サービス、信頼への影響を分けます。", "短期対応と恒久対応を分けて説明します。"][i])}</p></div>`).join("")}</div>`;
    case "number_highlight":
      return `<div class="number surface"><p>影響を受けた可能性のあるユーザー数</p><strong>約10,000件</strong><p>数値は出典と条件を台本または注記で補足します。</p></div>`;
    case "quote":
      return `<div class="quote surface"><blockquote>「現在、原因の調査を進めており、判明次第、速やかにお知らせします。」</blockquote><cite>公式発表より / 日付を明記</cite></div>`;
    case "sns_reaction_summary":
      return `<div class="sns">${["肯定的な意見", "否定的な意見", "疑問・不安"].map((item, i) => `<div class="catalog-card"><div class="icon">${["✓", "!", "?"][i]}</div><h2>${esc(item)}</h2><p>代表的な反応を分類し、偏りすぎないように扱います。</p></div>`).join("")}</div>`;
    case "what_happened_timeline":
      return timeline(["5/20 10:00 不正アクセスを検知", "5/20 11:30 一部情報が流出した可能性を確認", "5/20 14:00 調査を開始", "5/20 18:00 公式サイトで発表・お知らせ"]);
    case "final_opinion":
      return `<div class="opinion"><div class="opinion-label">結論<br>今後の<br>見通し</div><div class="checklist">${["今回の焦点は、AIそのものではなく権限と運用です。", "再発防止には入力制御、権限分離、監査ログが必要です。", "視聴者は、利用サービスの通知とパスワード管理を確認しましょう。"].map((item) => `<div class="check surface">✓ ${esc(item)}</div>`).join("")}</div></div>`;
    default:
      return `<div class="catalog-panel surface"><p>${esc(slide.lead)}</p></div>`;
  }
}

function cards(titles, bodies, className = "cards3") {
  return `<div class="${className}">${titles.map((title, index) => `<div class="catalog-card"><div class="icon">${index + 1}</div><h2>${esc(title)}</h2><p>${esc(bodies[index])}</p></div>`).join("")}</div>`;
}

function table(rows) {
  const [head, ...bodyRows] = rows;
  return `<div class="catalog-table"><table><thead><tr>${head.map((item) => `<th>${esc(item)}</th>`).join("")}</tr></thead><tbody>${bodyRows.map((row) => `<tr>${row.map((item, index) => `<td class="${index === 1 ? "good" : index === 2 ? "bad" : ""}">${esc(item)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function code(source) {
  return `<div class="catalog-code"><div class="code-window"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><pre>${esc(source)}</pre></div>`;
}

function timeline(items) {
  return `<div class="timeline-v">${items.map((item, index) => `<div class="vitem surface"><b>${String(index + 1).padStart(2, "0")}</b><span>${esc(item)}</span></div>`).join("")}</div>`;
}

async function writeTheme(theme) {
  const slideDir = path.join(root, "slides", theme);
  await fs.mkdir(slideDir, { recursive: true });

  if (theme === "tech_news_catalog") {
    await fs.writeFile(path.join(slideDir, "theme.css"), techNewsThemeCss, "utf8");
  }

  const entries = await fs.readdir(slideDir);
  await Promise.all(
    entries
      .filter((entry) => /^[0-9][0-9]-.*\.html$/u.test(entry))
      .map((entry) => fs.rm(path.join(slideDir, entry), { force: true }))
  );

  for (const [index, slide] of slides.entries()) {
    await fs.writeFile(path.join(slideDir, fileName(index, slide.type)), page(slide, theme, index), "utf8");
  }
}

async function main() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.writeFile(sharedCssPath, sharedCss, "utf8");
  for (const theme of themes) {
    await writeTheme(theme);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
