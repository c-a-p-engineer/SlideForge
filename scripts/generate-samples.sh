#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

styles=(pop fancy business engineer)
TOTAL_PAGES=35
MOBILE_TOTAL_PAGES=5

style_label() {
  case "$1" in
    pop) echo "Pop" ;;
    fancy) echo "Fancy" ;;
    business) echo "Business" ;;
    engineer) echo "Engineer" ;;
    mobile) echo "Mobile" ;;
  esac
}

style_descriptor() {
  case "$1" in
    pop) echo "短時間で要点を伝える提案向けデザイン" ;;
    fancy) echo "上質感と余白で読ませる提案向けデザイン" ;;
    business) echo "意思決定に必要な情報を整理する標準デザイン" ;;
    engineer) echo "構成、責務、技術情報を扱いやすい技術向けデザイン" ;;
    mobile) echo "スマホ縦型で情報を短く区切って見せるモバイル向けデザイン" ;;
  esac
}

slide_page_width() {
  case "$1" in
    mobile) echo "1080" ;;
    *) echo "1920" ;;
  esac
}

slide_page_height() {
  case "$1" in
    mobile) echo "1920" ;;
    *) echo "1080" ;;
  esac
}

slide_type_for_file() {
  case "$1" in
    *cover*) echo "cover" ;;
    *problem*) echo "problem" ;;
    *current-state*) echo "problem" ;;
    *scope*) echo "decision" ;;
    *proposed-solution*) echo "solution" ;;
    *comparison-*) echo "comparison" ;;
    *before-after*) echo "comparison" ;;
    *trade-off*) echo "decision" ;;
    *decision*) echo "decision" ;;
    *flow*) echo "solution" ;;
    *flowchart*) echo "solution" ;;
    *architecture*) echo "solution" ;;
    *mindmap*) echo "solution" ;;
    *gantt-chart*) echo "action" ;;
    *line-chart*) echo "evidence" ;;
    *decision-matrix*) echo "comparison" ;;
    *timeline-roadmap*) echo "action" ;;
    *kpi-*) echo "evidence" ;;
    *charts*) echo "evidence" ;;
    *risk-faq*) echo "decision" ;;
    *dependency-constraint*) echo "decision" ;;
    *conclusion*) echo "decision" ;;
    *next-action*) echo "action" ;;
    *deep-dive-appendix*) echo "appendix" ;;
    *code*) echo "appendix" ;;
    *quote*) echo "appendix" ;;
    *table*) echo "appendix" ;;
    *heading-body*) echo "appendix" ;;
    *bullets*) echo "appendix" ;;
    *image*) echo "appendix" ;;
    *layout-*) echo "appendix" ;;
    *) echo "appendix" ;;
  esac
}

slide_variant_for_file() {
  case "$1" in
    *comparison-horizontal*) echo "horizontal" ;;
    *comparison-vertical*) echo "vertical" ;;
    *kpi-highlight*) echo "highlight" ;;
    *kpi-detailed*) echo "detailed" ;;
    *layout-1column*) echo "one-column" ;;
    *layout-2column*) echo "two-column" ;;
    *before-after*) echo "before-after" ;;
    *timeline-roadmap*) echo "roadmap" ;;
    *gantt-chart*) echo "roadmap" ;;
    *line-chart*) echo "trend" ;;
    *decision-matrix*) echo "matrix" ;;
    *deep-dive-appendix*) echo "appendix" ;;
    *) echo "default" ;;
  esac
}

write_page() {
  local style="$1"
  local file_name="$2"
  local slide_id="$3"
  local page_number="$4"
  local title="$5"
  local slide_type
  local slide_variant
  slide_type="$(slide_type_for_file "$file_name")"
  slide_variant="$(slide_variant_for_file "$file_name")"

  mkdir -p "slides/$style"

  {
    cat <<EOF
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      @page {
        size: $(slide_page_width "$style")px $(slide_page_height "$style")px;
        margin: 0;
      }
    </style>
    <link rel="stylesheet" href="../base.css" />
    <link rel="stylesheet" href="./theme.css" />
  </head>
  <body>
    <main class="slide" data-slide-type="${slide_type}" data-slide-variant="${slide_variant}">
      <div class="slide__shell">
        <header class="slide__header">
          <div class="brand">SlideForge / $(style_label "$style")</div>
          <div class="slide-id">${slide_id}</div>
        </header>
        <section class="slide__body">
EOF
    cat
    cat <<EOF
        </section>
        <footer class="slide__footer">
          <span>slides/${style}/${file_name}</span>
          <span class="page-number">${page_number}</span>
        </footer>
      </div>
    </main>
  </body>
</html>
EOF
  } > "slides/$style/$file_name"
}

for style in "${styles[@]}"; do
  label="$(style_label "$style")"
  descriptor="$(style_descriptor "$style")"

  mkdir -p "slides/$style"
  find "slides/$style" -maxdepth 1 -type f -name '[0-9][0-9]-*.html' -delete

  write_page "$style" "01-cover.html" "Cover" "01 / ${TOTAL_PAGES}" "${label} Cover" <<EOF
          <div class="deck-tag">${descriptor}</div>
          <div class="card-stack">
            <div>
              <p class="kicker">このページは何用か</p>
              <h1 class="title">資料のタイトル、作成者、日付、所属を最初に示す表紙ページ</h1>
            </div>
            <p class="lead">
              表紙は「誰が」「何のために」「いつ出した資料か」を最初に伝えるためのページです。
              タイトルだけでなく、作者、所属、日付を入れると実務資料として扱いやすくなります。
            </p>
          </div>
          <div class="meta-grid">
            <div class="meta-card">
              <strong>Title</strong>
              <span>SlideForge Template Guide</span>
            </div>
            <div class="meta-card">
              <strong>Author</strong>
              <span>こぴぺたん</span>
            </div>
            <div class="meta-card">
              <strong>Date</strong>
              <span>2026-03-26</span>
            </div>
            <div class="meta-card">
              <strong>Affiliation</strong>
              <span>SlideForge Team</span>
            </div>
          </div>
EOF

  write_page "$style" "02-problem.html" "Problem" "02 / ${TOTAL_PAGES}" "${label} Problem" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">問題提起をするときに使う problem ページ</h1>
          <p class="purpose-note">用途: まず何が問題なのかを読み手に共有する</p>
          <div class="section-grid">
            <div class="compare-card">
              <span class="compare-card__tag">Problem</span>
              <h3>載せる内容の例</h3>
              <ul class="problem-list">
                <li>現場で起きている具体的な困りごと</li>
                <li>放置した場合の影響</li>
                <li>なぜ今取り上げる必要があるか</li>
              </ul>
            </div>
            <div class="card-stack">
              <div class="metric-card">
                <span class="label">Point</span>
                <div class="metric-card__value">課題</div>
                <p>数字よりも論点整理を優先する導入ページです</p>
              </div>
              <div class="metric-card">
                <span class="label">When To Use</span>
                <div class="metric-card__value">冒頭</div>
                <p>背景説明より先に、問題を明確にしたいときに使います</p>
              </div>
            </div>
          </div>
EOF

  write_page "$style" "03-current-state.html" "Current State" "03 / ${TOTAL_PAGES}" "${label} Current State" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">現状整理や before 側の状況説明に使う current-state ページ</h1>
          <p class="purpose-note">用途: 問題の背景や現在のやり方を具体化する</p>
          <div class="compare-grid">
            <div class="compare-card">
              <span class="compare-card__tag">Current</span>
              <h3>記載例</h3>
              <ul>
                <li>現行フローや運用状況</li>
                <li>誰に依存しているか</li>
                <li>ばらつきや再現性の低さ</li>
              </ul>
            </div>
            <div class="compare-card">
              <span class="compare-card__tag">Why It Matters</span>
              <h3>このページの役割</h3>
              <ul>
                <li>Problem と Solution をつなぐ</li>
                <li>読み手の認識を揃える</li>
                <li>対策の必要性を自然に導く</li>
              </ul>
            </div>
          </div>
EOF

  write_page "$style" "04-scope.html" "Scope" "04 / ${TOTAL_PAGES}" "${label} Scope" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">対象範囲と対象外を先に決める scope ページ</h1>
          <p class="purpose-note">用途: 議論の広がりすぎを防ぐ</p>
          <div class="compare-grid">
            <div class="compare-card">
              <span class="compare-card__tag">In Scope</span>
              <ul>
                <li>今回の資料で決めること</li>
                <li>今回検証する対象</li>
                <li>今期中に触る範囲</li>
              </ul>
            </div>
            <div class="compare-card">
              <span class="compare-card__tag">Out Of Scope</span>
              <ul>
                <li>今回は決めないこと</li>
                <li>別案件で扱う内容</li>
                <li>長期課題として残す項目</li>
              </ul>
            </div>
          </div>
EOF

  write_page "$style" "05-proposed-solution.html" "Proposed Solution" "05 / ${TOTAL_PAGES}" "${label} Proposed Solution" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">提案の方向性を要約して示す solution ページ</h1>
          <p class="purpose-note">用途: 読み手に「何をやるのか」を先に渡す</p>
          <div class="section-grid">
            <div class="panel">
              <h3>載せる内容の例</h3>
              <ul class="decision-list">
                <li>提案の骨子</li>
                <li>採用する方針</li>
                <li>他ページで詳しく説明する要素の要約</li>
              </ul>
            </div>
            <div class="callout-card">
              <h3>使いどころ</h3>
              <p>Problem の次に置き、読み手が迷わないように「この資料の答え」を早めに示したいときに使います。</p>
            </div>
          </div>
EOF

  write_page "$style" "06-comparison-horizontal.html" "Comparison H" "06 / ${TOTAL_PAGES}" "${label} Comparison Horizontal" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">2案を左右に比較する comparison-horizontal ページ</h1>
          <p class="purpose-note">用途: 選択肢が 2 つのときに短時間で比較させる</p>
          <div class="compare-grid">
            <div class="compare-card">
              <span class="compare-card__tag">Left Option</span>
              <h3>左側に置く内容</h3>
              <ul>
                <li>案 A の特徴</li>
                <li>メリット / デメリット</li>
                <li>採用した場合の注意点</li>
              </ul>
            </div>
            <div class="compare-card">
              <span class="compare-card__tag">Right Option</span>
              <h3>右側に置く内容</h3>
              <ul>
                <li>案 B の特徴</li>
                <li>メリット / デメリット</li>
                <li>採用した場合の注意点</li>
              </ul>
            </div>
          </div>
EOF

  write_page "$style" "07-trade-off.html" "Trade-off" "07 / ${TOTAL_PAGES}" "${label} Trade-off" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">得られるものと失うものを説明する trade-off ページ</h1>
          <p class="purpose-note">用途: 完璧な解決ではないことを正直に示す</p>
          <div class="compare-grid">
            <div class="compare-card">
              <span class="compare-card__tag">Gain</span>
              <ul>
                <li>導入で改善できる点</li>
                <li>意思決定が速くなる点</li>
                <li>再利用しやすくなる点</li>
              </ul>
            </div>
            <div class="compare-card">
              <span class="compare-card__tag">Cost</span>
              <ul>
                <li>自由度が下がる部分</li>
                <li>保守が必要になる部分</li>
                <li>例外判断が必要なケース</li>
              </ul>
            </div>
          </div>
EOF

  write_page "$style" "08-decision.html" "Decision" "08 / ${TOTAL_PAGES}" "${label} Decision" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">最終的に何を決めたいかを明文化する decision ページ</h1>
          <p class="purpose-note">用途: 会議の着地点を曖昧にしない</p>
          <div class="section-grid">
            <div class="decision-card">
              <h3>記載すること</h3>
              <ul class="decision-list">
                <li>採用する方針</li>
                <li>今決めること / 後で決めること</li>
                <li>判断基準</li>
              </ul>
            </div>
            <div class="callout-card">
              <h3>使いどころ</h3>
              <p>比較や evidence の後に置き、結論に向かう流れを止めずに意思決定へつなげたいときに使います。</p>
            </div>
          </div>
EOF

  write_page "$style" "09-flow.html" "Flow" "09 / ${TOTAL_PAGES}" "${label} Flow" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">手順や処理順を示す flow ページ</h1>
          <p class="purpose-note">用途: 手順や受け渡し順を一目で伝える</p>
          <div class="flow-diagram">
            <div class="flow-step">
              <div class="flow-step__index">Step 1</div>
              <div class="flow-step__title">論点整理</div>
              <div class="flow-step__body">何を決める会議かを定義する</div>
            </div>
            <div class="flow-step">
              <div class="flow-step__index">Step 2</div>
              <div class="flow-step__title">初稿作成</div>
              <div class="flow-step__body">必要な role のページを並べる</div>
            </div>
            <div class="flow-step">
              <div class="flow-step__index">Step 3</div>
              <div class="flow-step__title">レビュー</div>
              <div class="flow-step__body">内容と表現を分けて確認する</div>
            </div>
            <div class="flow-step">
              <div class="flow-step__index">Step 4</div>
              <div class="flow-step__title">出力</div>
              <div class="flow-step__body">PDF / PNG に変換して配布する</div>
            </div>
          </div>
EOF

  write_page "$style" "10-architecture.html" "Architecture" "10 / ${TOTAL_PAGES}" "${label} Architecture" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">構成要素、責務、データフローを説明する architecture ページ</h1>
          <p class="purpose-note">用途: システム構成や責務分離を見せる</p>
          <div class="architecture-grid">
            <div class="architecture-card">
              <div class="architecture-lane">
                <div class="architecture-layer">
                  <div class="architecture-layer__label">Presentation</div>
                  <div class="architecture-layer__items">
                    <div class="architecture-node">Theme CSS</div>
                    <div class="architecture-node">Role Slides</div>
                    <div class="architecture-node">Assets</div>
                  </div>
                </div>
                <div class="architecture-layer">
                  <div class="architecture-layer__label">Orchestration</div>
                  <div class="architecture-layer__items">
                    <div class="architecture-node">generate-samples</div>
                    <div class="architecture-node">render.mjs</div>
                    <div class="architecture-node">render-all</div>
                  </div>
                </div>
                <div class="architecture-layer">
                  <div class="architecture-layer__label">Output</div>
                  <div class="architecture-layer__items">
                    <div class="architecture-node">PNG</div>
                    <div class="architecture-node">PDF</div>
                    <div class="architecture-node">Docs</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="signal-list">
              <div class="signal">
                <strong>Layers</strong>
                <span>層ごとに責務を分けたいときに使います。</span>
              </div>
              <div class="signal">
                <strong>Responsibilities</strong>
                <span>どこが何を担当しているかを説明できます。</span>
              </div>
              <div class="signal">
                <strong>Flow</strong>
                <span>入力から出力までの流れを一緒に置けます。</span>
              </div>
            </div>
          </div>
EOF

  write_page "$style" "11-kpi-highlight.html" "KPI Highlight" "11 / ${TOTAL_PAGES}" "${label} KPI Highlight" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">重要指標だけを強く見せる kpi-highlight ページ</h1>
          <p class="purpose-note">用途: まず結論に効く数字を見せる</p>
          <div class="kpi-grid">
            <div class="metric-card">
              <span class="label">Main KPI</span>
              <div class="metric-card__value">-46%</div>
              <div class="metric-card__delta">例: 初稿作成時間</div>
              <p>1 枚でインパクトを伝えたいときに使う</p>
            </div>
            <div class="metric-card">
              <span class="label">Second KPI</span>
              <div class="metric-card__value">-2回</div>
              <div class="metric-card__delta">例: レビュー往復回数</div>
              <p>補助指標を並べて説得力を補う</p>
            </div>
            <div class="metric-card">
              <span class="label">Third KPI</span>
              <div class="metric-card__value">68%</div>
              <div class="metric-card__delta">例: 再利用率</div>
              <p>改善後の広がりを示せる</p>
            </div>
          </div>
EOF

  write_page "$style" "12-kpi-detailed.html" "KPI Detailed" "12 / ${TOTAL_PAGES}" "${label} KPI Detailed" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">目標値と実績値を説明する kpi-detailed ページ</h1>
          <p class="purpose-note">用途: target / actual の差や根拠を示す</p>
          <div class="evidence-grid">
            <div class="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Target</th>
                    <th>Actual</th>
                    <th>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>初稿時間</td>
                    <td>1.5日</td>
                    <td>1.3日</td>
                    <td>達成</td>
                  </tr>
                  <tr>
                    <td>レビュー回数</td>
                    <td>2回</td>
                    <td>2回</td>
                    <td>達成</td>
                  </tr>
                  <tr>
                    <td>再利用率</td>
                    <td>60%</td>
                    <td>68%</td>
                    <td>達成</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="panel">
              <h3>使いどころ</h3>
              <p>数字の見せ方だけでなく、目標との関係や達成度の意味まで説明したいときに使います。</p>
            </div>
          </div>
EOF

  write_page "$style" "13-risk-faq.html" "Risk / FAQ" "13 / ${TOTAL_PAGES}" "${label} Risk FAQ" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">懸念点と回答を整理する risk-faq ページ</h1>
          <p class="purpose-note">用途: 反対意見や想定質問に先回りする</p>
          <div class="qa-grid">
            <div class="faq-card">
              <h3>想定質問</h3>
              <ul class="faq-list">
                <li>テンプレート化で自由度が落ちないか</li>
                <li>構造が固定されすぎないか</li>
                <li>運用保守が重くならないか</li>
              </ul>
            </div>
            <div class="faq-card">
              <h3>回答の置き方</h3>
              <ul class="faq-list">
                <li>どこまで固定するか</li>
                <li>例外をどう扱うか</li>
                <li>保守責任を誰が持つか</li>
              </ul>
            </div>
          </div>
EOF

  write_page "$style" "14-dependency-constraint.html" "Dependency" "14 / ${TOTAL_PAGES}" "${label} Dependency Constraint" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">依存関係や制約条件を明示する dependency / constraint ページ</h1>
          <p class="purpose-note">用途: 後から「聞いていない」を防ぐ</p>
          <div class="compare-grid">
            <div class="compare-card">
              <span class="compare-card__tag">Dependencies</span>
              <ul>
                <li>レビュー運用の整備</li>
                <li>共通 CSS の管理</li>
                <li>Docker 出力環境の固定</li>
              </ul>
            </div>
            <div class="compare-card">
              <span class="compare-card__tag">Constraints</span>
              <ul>
                <li>構造をテーマで変えない</li>
                <li>出力崩れを起こす CSS を避ける</li>
                <li>1 枚に情報を詰め込みすぎない</li>
              </ul>
            </div>
          </div>
EOF

  write_page "$style" "15-timeline-roadmap.html" "Roadmap" "15 / ${TOTAL_PAGES}" "${label} Timeline Roadmap" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">導入スケジュールや段階計画を示す timeline / roadmap ページ</h1>
          <p class="purpose-note">用途: いつ何をやるかを段階で見せる</p>
          <div class="timeline">
            <div class="timeline__item">
              <div class="timeline__phase">Phase 1</div>
              <div class="timeline__title">Trial</div>
              <div class="timeline__body">試行案件を選定し、役割ページで初稿を作る</div>
            </div>
            <div class="timeline__item">
              <div class="timeline__phase">Phase 2</div>
              <div class="timeline__title">Adoption</div>
              <div class="timeline__body">営業、企画、開発で共通運用を始める</div>
            </div>
            <div class="timeline__item">
              <div class="timeline__phase">Phase 3</div>
              <div class="timeline__title">Optimize</div>
              <div class="timeline__body">KPI と再利用率を見ながら部品を改善する</div>
            </div>
            <div class="timeline__item">
              <div class="timeline__phase">Phase 4</div>
              <div class="timeline__title">Expand</div>
              <div class="timeline__body">appendix や派生テンプレートを追加する</div>
            </div>
          </div>
EOF

  write_page "$style" "16-conclusion.html" "Conclusion" "16 / ${TOTAL_PAGES}" "${label} Conclusion" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">最終結論を簡潔にまとめる conclusion ページ</h1>
          <p class="purpose-note">用途: 読み手に最終判断を渡す</p>
          <div class="section-grid">
            <div class="decision-card">
              <h3>記載すること</h3>
              <ul class="decision-list">
                <li>採用する方針</li>
                <li>その理由</li>
                <li>次につながる判断条件</li>
              </ul>
            </div>
            <div class="callout-card">
              <h3>使いどころ</h3>
              <p>Problem、Evidence、Trade-off を経たあとに置き、資料全体の着地点を明文化したいときに使います。</p>
            </div>
          </div>
EOF

  write_page "$style" "17-next-action.html" "Next Action" "17 / ${TOTAL_PAGES}" "${label} Next Action" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">担当、期限、成果物を示す next-action ページ</h1>
          <p class="purpose-note">用途: 資料を読んだあとに何をするかを明確にする</p>
          <div class="action-grid">
            <div class="compare-card">
              <span class="compare-card__tag">Action</span>
              <ul class="action-list">
                <li>試行案件を選ぶ</li>
                <li>レビュー観点を整える</li>
                <li>運用ルールを共有する</li>
              </ul>
            </div>
            <div class="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Owner</th>
                    <th>Task</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PM</td>
                    <td>対象案件の選定</td>
                    <td>4/05</td>
                  </tr>
                  <tr>
                    <td>Design</td>
                    <td>レビュー観点整理</td>
                    <td>4/08</td>
                  </tr>
                  <tr>
                    <td>Eng</td>
                    <td>出力確認</td>
                    <td>4/10</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
EOF

  write_page "$style" "18-heading-body.html" "Heading + Body" "18 / ${TOTAL_PAGES}" "${label} Heading Body" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">シンプルな説明や前提共有に使う heading-body ページ</h1>
          <p class="purpose-note">用途: 1 メッセージだけを短く説明する</p>
          <p class="lead">タイトルで方向性を伝え、本文で理由や補足を添える最も基本的な説明ページです。</p>
          <div class="panel">
            <h3>向いている場面</h3>
            <p>前提共有、背景説明、方針の短い説明など、構造より文章で伝える方が早い場面に使います。</p>
          </div>
EOF

  write_page "$style" "19-bullets.html" "Bullets" "19 / ${TOTAL_PAGES}" "${label} Bullets" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">要件や論点を箇条書きで整理する bullets ページ</h1>
          <p class="purpose-note">用途: 判断材料を抜けなく列挙する</p>
          <div class="compare-grid">
            <div class="card">
              <h3>載せる内容の例</h3>
              <ul class="bullet-list">
                <li>要件一覧</li>
                <li>採用理由</li>
                <li>前提条件</li>
              </ul>
            </div>
            <div class="card">
              <h3>気をつけること</h3>
              <ul class="check-list">
                <li>粒度をそろえる</li>
                <li>1 行を長くしすぎない</li>
                <li>本文と重複させない</li>
              </ul>
            </div>
          </div>
EOF

  write_page "$style" "20-image.html" "Image" "20 / ${TOTAL_PAGES}" "${label} Image" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">画面や図版を見せる image ページ</h1>
          <p class="purpose-note">用途: テキストだけでは伝わりにくい内容を補う</p>
          <div class="image-layout">
            <div class="media-card">
              <img class="visual visual--tall" src="../assets/placeholder-visual.svg" alt="Placeholder visual" />
            </div>
            <div class="card">
              <h3>向いている場面</h3>
              <p>プロダクト画面、ワイヤー、導入後イメージ、補足図版などを置くときに使います。</p>
            </div>
          </div>
EOF

  write_page "$style" "21-layout-1column.html" "1 Column" "21 / ${TOTAL_PAGES}" "${label} One Column" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">長めの説明を流れよく読ませる 1column ページ</h1>
          <p class="purpose-note">用途: 方針整理や前提説明を視線移動少なく読ませる</p>
          <div class="panel">
            <h3>使いどころ</h3>
            <p>導入方針、設計方針、背景整理など、比較よりも説明の流れを優先したいときに使います。</p>
          </div>
          <div class="metrics">
            <div class="card">
              <span class="label">Background</span>
              <p>背景説明</p>
            </div>
            <div class="card">
              <span class="label">Policy</span>
              <p>判断基準</p>
            </div>
            <div class="card">
              <span class="label">Outcome</span>
              <p>結論</p>
            </div>
          </div>
EOF

  write_page "$style" "22-layout-2column.html" "2 Column" "22 / ${TOTAL_PAGES}" "${label} Two Column" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">2 つの論点や選択肢を並べる 2column ページ</h1>
          <p class="purpose-note">用途: 左右比較や役割分担を並列で見せる</p>
          <div class="two-column">
            <div class="panel">
              <h3>左側に置く内容</h3>
              <p>現状案、代替案、担当 A、入力側など、基準となる情報を置きます。</p>
            </div>
            <div class="panel">
              <h3>右側に置く内容</h3>
              <p>比較対象、改善案、担当 B、出力側など、対になる情報を置きます。</p>
            </div>
          </div>
EOF

  write_page "$style" "23-before-after.html" "Before / After" "23 / ${TOTAL_PAGES}" "${label} Before After" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">導入前後の変化を明快に見せる before-after ページ</h1>
          <p class="purpose-note">用途: 改善の意味を直感的に伝える</p>
          <div class="compare-grid">
            <div class="compare-card">
              <span class="compare-card__tag">Before</span>
              <ul>
                <li>資料構成が毎回変わる</li>
                <li>レビューコメントが広がる</li>
                <li>会議直前に修正が増える</li>
              </ul>
            </div>
            <div class="compare-card">
              <span class="compare-card__tag">After</span>
              <ul>
                <li>必要な role が最初から入る</li>
                <li>レビュー観点が整理される</li>
                <li>意思決定ページが抜けなく揃う</li>
              </ul>
            </div>
          </div>
EOF

  write_page "$style" "24-comparison-vertical.html" "Comparison V" "24 / ${TOTAL_PAGES}" "${label} Comparison Vertical" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">観点ごとの比較を縦積みで見せる comparison-vertical ページ</h1>
          <p class="purpose-note">用途: 評価軸が多い比較を読みやすくする</p>
          <div class="card-stack">
            <div class="compare-card">
              <span class="compare-card__tag">観点 1</span>
              <h3>作成速度</h3>
              <p>初稿を速く揃えられるかを見る比較観点です。</p>
            </div>
            <div class="compare-card">
              <span class="compare-card__tag">観点 2</span>
              <h3>レビュー容易性</h3>
              <p>コメントが集約されるかを見る比較観点です。</p>
            </div>
            <div class="compare-card">
              <span class="compare-card__tag">観点 3</span>
              <h3>再利用性</h3>
              <p>過去資産を使い回せるかを見る比較観点です。</p>
            </div>
          </div>
EOF

  write_page "$style" "25-charts.html" "Charts" "25 / ${TOTAL_PAGES}" "${label} Charts" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">棒・円・折れ線を使い分ける charts ページ</h1>
          <p class="purpose-note">用途: before/after、distribution、trend を 1 枚で見せる</p>
          <div class="chart-multi-grid">
            <div class="chart-card">
              <h3>Before / After / Target</h3>
              <div class="bars">
                <div class="bar">
                  <span>Before</span>
                  <div class="bar__track"><div class="bar__fill" style="width: 45%;"></div></div>
                  <strong>45%</strong>
                </div>
                <div class="bar">
                  <span>Target</span>
                  <div class="bar__track"><div class="bar__fill" style="width: 76%;"></div></div>
                  <strong>76%</strong>
                </div>
                <div class="bar">
                  <span>After</span>
                  <div class="bar__track"><div class="bar__fill" style="width: 82%;"></div></div>
                  <strong>82%</strong>
                </div>
              </div>
            </div>
            <div class="chart-card">
              <h3>Distribution</h3>
              <div class="donut-chart" aria-label="配分グラフ">
                <svg viewBox="0 0 200 200" role="img" aria-hidden="true">
                  <circle class="donut-chart__track" cx="100" cy="100" r="60"></circle>
                  <circle class="donut-chart__segment donut-chart__segment--a" cx="100" cy="100" r="60"></circle>
                  <circle class="donut-chart__segment donut-chart__segment--b" cx="100" cy="100" r="60"></circle>
                  <circle class="donut-chart__segment donut-chart__segment--c" cx="100" cy="100" r="60"></circle>
                  <circle class="donut-chart__center" cx="100" cy="100" r="38"></circle>
                  <text class="donut-chart__value" x="100" y="106">58%</text>
                </svg>
              </div>
              <ul class="legend">
                <li>既存資産 58%</li>
                <li>新規作成 24%</li>
                <li>レビュー 18%</li>
              </ul>
            </div>
          </div>
          <div class="chart-card">
            <h3>Trend / Line</h3>
            <div class="line-chart">
              <svg viewBox="0 0 640 280" role="img" aria-hidden="true">
                <line class="line-chart__grid" x1="60" y1="60" x2="600" y2="60"></line>
                <line class="line-chart__grid" x1="60" y1="120" x2="600" y2="120"></line>
                <line class="line-chart__grid" x1="60" y1="180" x2="600" y2="180"></line>
                <line class="line-chart__axis" x1="60" y1="220" x2="600" y2="220"></line>
                <line class="line-chart__axis" x1="60" y1="30" x2="60" y2="220"></line>
                <polyline class="line-chart__series-a" points="90,190 180,168 270,142 360,118 450,92 540,76"></polyline>
                <polyline class="line-chart__series-b" points="90,200 180,192 270,170 360,154 450,138 540,122"></polyline>
                <circle class="line-chart__point-a" cx="90" cy="190" r="7"></circle>
                <circle class="line-chart__point-a" cx="180" cy="168" r="7"></circle>
                <circle class="line-chart__point-a" cx="270" cy="142" r="7"></circle>
                <circle class="line-chart__point-a" cx="360" cy="118" r="7"></circle>
                <circle class="line-chart__point-a" cx="450" cy="92" r="7"></circle>
                <circle class="line-chart__point-a" cx="540" cy="76" r="7"></circle>
                <circle class="line-chart__point-b" cx="90" cy="200" r="7"></circle>
                <circle class="line-chart__point-b" cx="180" cy="192" r="7"></circle>
                <circle class="line-chart__point-b" cx="270" cy="170" r="7"></circle>
                <circle class="line-chart__point-b" cx="360" cy="154" r="7"></circle>
                <circle class="line-chart__point-b" cx="450" cy="138" r="7"></circle>
                <circle class="line-chart__point-b" cx="540" cy="122" r="7"></circle>
              </svg>
              <p class="muted">折れ線は推移や改善トレンドを見せたいときに使います。</p>
            </div>
          </div>
EOF

  write_page "$style" "26-code.html" "Code" "26 / ${TOTAL_PAGES}" "${label} Code" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">コードや CLI を見せる code ページ</h1>
          <p class="purpose-note">用途: 実行方法や実装断片を補足する</p>
          <pre class="code-block"><code>npm run render -- \\
  --input slides/${style} \\
  --format png

docker compose run --rm slideforge npm run render -- \\
  -- --input slides/${style} \\
  --format pdf

// type と variant は HTML の data 属性に埋め込み、
// 見た目ではなく論理構造の分類に使います。</code></pre>
EOF

  write_page "$style" "27-quote.html" "Quote" "27 / ${TOTAL_PAGES}" "${label} Quote" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">引用や指針を補足的に見せる quote ページ</h1>
          <p class="purpose-note">用途: 本論を補強する考え方を短く示す</p>
          <div class="quote-card">
            <blockquote>
              「良い資料は、情報量ではなく、判断までの距離を短くする。」
            </blockquote>
            <cite>SlideForge Working Note / Editorial Principle</cite>
          </div>
EOF

  write_page "$style" "28-deep-dive-appendix.html" "Appendix" "28 / ${TOTAL_PAGES}" "${label} Appendix" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">詳細説明や補足根拠を置く deep-dive / appendix ページ</h1>
          <p class="purpose-note">用途: 本編から切り離した詳細情報を置く</p>
          <div class="section-grid">
            <div class="panel">
              <h3>載せる内容の例</h3>
              <ul class="decision-list">
                <li>詳細な前提条件</li>
                <li>評価メモ</li>
                <li>構成図の補足</li>
                <li>コードや表の詳細</li>
              </ul>
            </div>
            <div class="callout-card">
              <h3>使いどころ</h3>
              <p>本編を細く保ちながら、質問が来たときにすぐ参照したい情報をまとめて置くためのページです。</p>
            </div>
          </div>
EOF

  write_page "$style" "29-table.html" "Table" "29 / ${TOTAL_PAGES}" "${label} Table" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">評価条件や比較一覧を圧縮する table ページ</h1>
          <p class="purpose-note">用途: 比較軸が多いときに一覧化する</p>
          <div class="table-card">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>When To Use</th>
                  <th>Main Value</th>
                  <th>Typical Position</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>problem</td>
                  <td>課題導入</td>
                  <td>問題の明確化</td>
                  <td>序盤</td>
                </tr>
                <tr>
                  <td>comparison</td>
                  <td>選択肢比較</td>
                  <td>評価しやすさ</td>
                  <td>中盤</td>
                </tr>
                <tr>
                  <td>decision</td>
                  <td>結論提示</td>
                  <td>会議の着地点明示</td>
                  <td>終盤</td>
                </tr>
                <tr>
                  <td>action</td>
                  <td>実行計画</td>
                  <td>次アクション明示</td>
                  <td>最後</td>
                </tr>
              </tbody>
            </table>
          </div>
EOF

  write_page "$style" "30-image-appendix.html" "Image Appendix" "30 / ${TOTAL_PAGES}" "${label} Visual Appendix" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">補足図版を置く image appendix ページ</h1>
          <p class="purpose-note">用途: マインドマップや補足図を appendix に置く</p>
          <div class="diagram-grid">
            <div class="mindmap">
              <svg viewBox="0 0 600 420" aria-hidden="true">
                <path class="mindmap__link" d="M300 210 C300 150, 300 120, 300 92"></path>
                <path class="mindmap__link" d="M300 210 C220 210, 180 210, 146 210"></path>
                <path class="mindmap__link" d="M300 210 C380 210, 420 210, 454 210"></path>
                <path class="mindmap__link" d="M300 210 C300 270, 300 300, 300 328"></path>
              </svg>
              <div class="mindmap__center">このページは何用かを中心に置く</div>
              <div class="mindmap__node mindmap__node--top">要件整理</div>
              <div class="mindmap__node mindmap__node--left">比較観点</div>
              <div class="mindmap__node mindmap__node--right">出力形式</div>
              <div class="mindmap__node mindmap__node--bottom">次アクション</div>
            </div>
            <div class="card-stack">
              <div class="card">
                <h3>マインドマップの使いどころ</h3>
                <p>論点の枝分かれや、会議で確認したい観点を俯瞰させたいときに使います。</p>
              </div>
              <div class="card">
                <h3>補足図ページの使い方</h3>
                <p>本編に入れると重くなる図を appendix に分けると、必要な人だけ深掘りできます。</p>
              </div>
            </div>
          </div>
EOF

  write_page "$style" "31-flowchart.html" "Flowchart" "31 / ${TOTAL_PAGES}" "${label} Flowchart" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">分岐や判定を含む処理手順を見せる flowchart ページ</h1>
          <p class="purpose-note">用途: Yes / No 分岐や承認フローを説明する</p>
          <div class="diagram-grid">
            <div class="flowchart">
              <svg viewBox="0 0 900 420" aria-hidden="true">
                <path class="flowchart__link" d="M450 116 L450 140"></path>
                <path class="flowchart__link" d="M450 318 L450 360"></path>
                <path class="flowchart__link" d="M360 228 L304 228"></path>
                <path class="flowchart__link" d="M540 228 L596 228"></path>
                <path class="flowchart__link" d="M184 270 L184 360 L450 360"></path>
                <path class="flowchart__link" d="M716 270 L716 360 L450 360"></path>
              </svg>
              <div class="flowchart__label flowchart__label--yes">Yes</div>
              <div class="flowchart__label flowchart__label--no">No</div>
              <div class="flowchart__node flowchart__node--start">開始: 要件確認</div>
              <div class="flowchart__node flowchart__node--decision"><span>資料の目的は明確か</span></div>
              <div class="flowchart__node flowchart__node--left">role を選び、初稿を作成する</div>
              <div class="flowchart__node flowchart__node--right">問題と結論を先に整理する</div>
              <div class="flowchart__node flowchart__node--end">出力してレビューへ進む</div>
            </div>
            <div class="card-stack">
              <div class="card">
                <h3>向いている内容</h3>
                <p>承認フロー、問い合わせ対応、条件分岐のある業務手順、システム処理の分岐説明に向きます。</p>
              </div>
              <div class="card">
                <h3>使い分け</h3>
                <p>順序だけを見せたいなら flow、分岐や判定を見せたいなら flowchart を使うと整理しやすくなります。</p>
              </div>
            </div>
          </div>
EOF

  write_page "$style" "32-mindmap.html" "Mindmap" "32 / ${TOTAL_PAGES}" "${label} Mindmap" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">論点の広がりや関係性を俯瞰する mindmap ページ</h1>
          <p class="purpose-note">用途: 要件整理、論点の棚卸し、議論の全体像共有に使う</p>
          <div class="diagram-grid">
            <div class="mindmap">
              <svg viewBox="0 0 600 420" aria-hidden="true">
                <path class="mindmap__link" d="M300 210 C300 150, 300 120, 300 92"></path>
                <path class="mindmap__link" d="M300 210 C220 210, 180 210, 146 210"></path>
                <path class="mindmap__link" d="M300 210 C380 210, 420 210, 454 210"></path>
                <path class="mindmap__link" d="M300 210 C300 270, 300 300, 300 328"></path>
              </svg>
              <div class="mindmap__center">資料設計で整理したい論点</div>
              <div class="mindmap__node mindmap__node--top">対象読者</div>
              <div class="mindmap__node mindmap__node--left">必要データ</div>
              <div class="mindmap__node mindmap__node--right">構成パターン</div>
              <div class="mindmap__node mindmap__node--bottom">次アクション</div>
            </div>
            <div class="card-stack">
              <div class="card">
                <h3>向いている場面</h3>
                <p>要件定義の初期、会議で論点を洗い出したい場面、思考の分岐をそのまま見せたい場面に向きます。</p>
              </div>
              <div class="card">
                <h3>書き方の目安</h3>
                <p>中心に主題を置き、周辺に観点を 4 から 6 個程度置くと、1 枚で把握しやすくなります。</p>
              </div>
            </div>
          </div>
EOF

  write_page "$style" "33-gantt-chart.html" "Gantt" "33 / ${TOTAL_PAGES}" "${label} Gantt Chart" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">工程、担当、期間の重なりを示す gantt-chart ページ</h1>
          <p class="purpose-note">用途: 実行計画や依存関係を週単位で確認する</p>
          <div class="section-grid">
            <div class="chart-card">
              <h3>Execution Schedule</h3>
              <div class="gantt">
                <div class="gantt__header">
                  <div>Task</div>
                  <div>W1</div>
                  <div>W2</div>
                  <div>W3</div>
                  <div>W4</div>
                  <div>W5</div>
                </div>
                <div class="gantt__row">
                  <div class="gantt__task">要件整理</div>
                  <div class="gantt__slot gantt__slot--fill"></div>
                  <div class="gantt__slot gantt__slot--fill"></div>
                  <div class="gantt__slot"></div>
                  <div class="gantt__slot"></div>
                  <div class="gantt__slot"></div>
                </div>
                <div class="gantt__row">
                  <div class="gantt__task">テンプレート作成</div>
                  <div class="gantt__slot"></div>
                  <div class="gantt__slot gantt__slot--fill"></div>
                  <div class="gantt__slot gantt__slot--fill"></div>
                  <div class="gantt__slot gantt__slot--fill"></div>
                  <div class="gantt__slot"></div>
                </div>
                <div class="gantt__row">
                  <div class="gantt__task">レビュー反映</div>
                  <div class="gantt__slot"></div>
                  <div class="gantt__slot"></div>
                  <div class="gantt__slot gantt__slot--fill"></div>
                  <div class="gantt__slot gantt__slot--fill"></div>
                  <div class="gantt__slot"></div>
                </div>
                <div class="gantt__row">
                  <div class="gantt__task">最終出力</div>
                  <div class="gantt__slot"></div>
                  <div class="gantt__slot"></div>
                  <div class="gantt__slot"></div>
                  <div class="gantt__slot gantt__slot--fill"></div>
                  <div class="gantt__slot gantt__slot--fill"></div>
                </div>
              </div>
            </div>
            <div class="card-stack">
              <div class="card">
                <h3>向いている場面</h3>
                <p>計画レビュー、進行会議、依存関係の説明、担当と時期の重なりを確認したい場面に向きます。</p>
              </div>
              <div class="card">
                <h3>補足の入れ方</h3>
                <p>重要タスクだけを 4 から 6 行に絞ると、PDF でも潰れずに読めます。詳細は appendix に分けるのが安全です。</p>
              </div>
            </div>
          </div>
EOF

  write_page "$style" "34-line-chart.html" "Line Chart" "34 / ${TOTAL_PAGES}" "${label} Line Chart" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">推移、季節性、改善傾向を示す line-chart ページ</h1>
          <p class="purpose-note">用途: 時系列の変化や目標との差分を見せる</p>
          <div class="section-grid">
            <div class="chart-card">
              <h3>Monthly Trend</h3>
              <div class="line-chart line-chart--large">
                <svg viewBox="0 0 760 320" role="img" aria-hidden="true">
                  <line class="line-chart__grid" x1="70" y1="70" x2="710" y2="70"></line>
                  <line class="line-chart__grid" x1="70" y1="140" x2="710" y2="140"></line>
                  <line class="line-chart__grid" x1="70" y1="210" x2="710" y2="210"></line>
                  <line class="line-chart__axis" x1="70" y1="260" x2="710" y2="260"></line>
                  <line class="line-chart__axis" x1="70" y1="40" x2="70" y2="260"></line>
                  <polyline class="line-chart__series-a" points="100,228 180,214 260,196 340,170 420,148 500,122 580,96 660,82"></polyline>
                  <polyline class="line-chart__series-b" points="100,238 180,230 260,220 340,206 420,190 500,174 580,164 660,152"></polyline>
                  <circle class="line-chart__point-a" cx="100" cy="228" r="7"></circle>
                  <circle class="line-chart__point-a" cx="180" cy="214" r="7"></circle>
                  <circle class="line-chart__point-a" cx="260" cy="196" r="7"></circle>
                  <circle class="line-chart__point-a" cx="340" cy="170" r="7"></circle>
                  <circle class="line-chart__point-a" cx="420" cy="148" r="7"></circle>
                  <circle class="line-chart__point-a" cx="500" cy="122" r="7"></circle>
                  <circle class="line-chart__point-a" cx="580" cy="96" r="7"></circle>
                  <circle class="line-chart__point-a" cx="660" cy="82" r="7"></circle>
                  <circle class="line-chart__point-b" cx="100" cy="238" r="7"></circle>
                  <circle class="line-chart__point-b" cx="180" cy="230" r="7"></circle>
                  <circle class="line-chart__point-b" cx="260" cy="220" r="7"></circle>
                  <circle class="line-chart__point-b" cx="340" cy="206" r="7"></circle>
                  <circle class="line-chart__point-b" cx="420" cy="190" r="7"></circle>
                  <circle class="line-chart__point-b" cx="500" cy="174" r="7"></circle>
                  <circle class="line-chart__point-b" cx="580" cy="164" r="7"></circle>
                  <circle class="line-chart__point-b" cx="660" cy="152" r="7"></circle>
                </svg>
              </div>
              <ul class="legend legend--inline">
                <li>改善後の利用率</li>
                <li>従来運用の推移</li>
              </ul>
            </div>
            <div class="card-stack">
              <div class="metric-card">
                <span class="label">Best Use</span>
                <div class="metric-card__value">時系列</div>
                <p>週次、月次、四半期のように並び順が重要なデータに向きます。</p>
              </div>
              <div class="card">
                <h3>補足の書き方</h3>
                <p>折れ線だけでは意味が伝わりにくいため、何の推移か、どこを見てほしいかを注記すると実務で使いやすくなります。</p>
              </div>
            </div>
          </div>
EOF

  write_page "$style" "35-decision-matrix.html" "Decision Matrix" "35 / ${TOTAL_PAGES}" "${label} Decision Matrix" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">選択肢を評価軸で位置付ける decision-matrix ページ</h1>
          <p class="purpose-note">用途: 比較候補の優先度や推奨案を一目で示す</p>
          <div class="diagram-grid">
            <div class="matrix">
              <div class="matrix__y-label">実現難易度</div>
              <div class="matrix__x-label">期待効果</div>
              <div class="matrix__grid">
                <div class="matrix__point matrix__point--a" style="left: 26%; top: 62%;">案 A</div>
                <div class="matrix__point matrix__point--b" style="left: 58%; top: 44%;">案 B</div>
                <div class="matrix__point matrix__point--c" style="left: 78%; top: 26%;">推奨案</div>
              </div>
            </div>
            <div class="card-stack">
              <div class="card">
                <h3>向いている場面</h3>
                <p>複数案の比較を 1 枚で終わらせたい場面や、会議で推奨案の位置付けを示したい場面に向きます。</p>
              </div>
              <div class="card">
                <h3>使い方のコツ</h3>
                <p>軸は 2 つに絞り、推奨案だけ色やラベルで強調すると、結論までの距離を短くできます。</p>
              </div>
            </div>
          </div>
EOF
done

mkdir -p "slides/mobile"
find "slides/mobile" -maxdepth 1 -type f -name '[0-9][0-9]-*.html' -delete

write_page "mobile" "01-cover.html" "Mobile Cover" "01 / ${MOBILE_TOTAL_PAGES}" "Mobile Cover" <<EOF
          <div class="deck-tag">スマホ縦型 UI 向けテンプレート</div>
          <div class="card-stack">
            <div>
              <p class="kicker">このページは何用か</p>
              <h1 class="title">タイトル、作者、日付を短く見せる mobile cover ページ</h1>
            </div>
            <p class="lead">スマホ画面では視線移動が短いため、タイトルと要点を上から順に素直に並べるのが基本です。</p>
          </div>
          <div class="meta-grid">
            <div class="meta-card">
              <strong>Title</strong>
              <span>Mobile Story Template</span>
            </div>
            <div class="meta-card">
              <strong>Author</strong>
              <span>こぴぺたん</span>
            </div>
            <div class="meta-card">
              <strong>Date</strong>
              <span>2026-03-26</span>
            </div>
            <div class="meta-card">
              <strong>Use</strong>
              <span>SNS / LP / App Intro</span>
            </div>
          </div>
EOF

write_page "mobile" "02-overview.html" "Mobile Overview" "02 / ${MOBILE_TOTAL_PAGES}" "Mobile Overview" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">画面全体の要点を 3 つ程度で見せる overview ページ</h1>
          <p class="purpose-note">用途: スマホ向け資料の冒頭で、何を見せるのかを短く共有する</p>
          <div class="card-stack">
            <div class="metric-card">
              <span class="label">Point 1</span>
              <div class="metric-card__value">短文</div>
              <p>1 ブロック 2 行から 3 行までに抑えると視認性が安定します。</p>
            </div>
            <div class="metric-card">
              <span class="label">Point 2</span>
              <div class="metric-card__value">縦積み</div>
              <p>左右比較より、上から順に理解できる構成のほうがスマホでは強いです。</p>
            </div>
            <div class="metric-card">
              <span class="label">Point 3</span>
              <div class="metric-card__value">CTA</div>
              <p>最後に行動を置くと、縦スクロールと相性が良くなります。</p>
            </div>
          </div>
EOF

write_page "mobile" "03-feature-list.html" "Mobile Features" "03 / ${MOBILE_TOTAL_PAGES}" "Mobile Features" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">機能や訴求ポイントをカードで並べる feature-list ページ</h1>
          <p class="purpose-note">用途: アプリ紹介、LP、SNS スライドで利点を見せる</p>
          <div class="card-stack">
            <div class="card">
              <h3>Feature 1</h3>
              <p>テンプレートを選んで、役割ベースのページをすぐ組み始められます。</p>
            </div>
            <div class="card">
              <h3>Feature 2</h3>
              <p>HTML を正本にするため、レビューと差分確認を Git 上で進めやすくなります。</p>
            </div>
            <div class="card">
              <h3>Feature 3</h3>
              <p>PNG と PDF の両方へ出力できるため、SNS 用と配布用を同じ元データから作れます。</p>
            </div>
          </div>
EOF

write_page "mobile" "04-user-flow.html" "Mobile Flow" "04 / ${MOBILE_TOTAL_PAGES}" "Mobile Flow" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">操作の流れや利用手順を上から下に見せる user-flow ページ</h1>
          <p class="purpose-note">用途: オンボーディング、導線説明、SNS 連投向けの手順紹介</p>
          <div class="card-stack">
            <div class="flow-step">
              <span class="flow-step__index">Step 1</span>
              <div class="flow-step__title">テンプレートを選ぶ</div>
              <div class="flow-step__body">用途に合う見た目を決め、最初のストーリーを組みます。</div>
            </div>
            <div class="flow-step">
              <span class="flow-step__index">Step 2</span>
              <div class="flow-step__title">内容を差し替える</div>
              <div class="flow-step__body">タイトル、要点、図表だけを差し替えて初稿を作ります。</div>
            </div>
            <div class="flow-step">
              <span class="flow-step__index">Step 3</span>
              <div class="flow-step__title">書き出して配布する</div>
              <div class="flow-step__body">PNG は SNS 向け、PDF は共有資料向けに使い分けます。</div>
            </div>
          </div>
EOF

write_page "mobile" "05-kpi-cta.html" "Mobile KPI CTA" "05 / ${MOBILE_TOTAL_PAGES}" "Mobile KPI CTA" <<EOF
          <p class="kicker">このページは何用か</p>
          <h1 class="title">数字と行動喚起を最後に置く kpi / cta ページ</h1>
          <p class="purpose-note">用途: 成果の提示と次の行動を 1 枚にまとめる</p>
          <div class="card-stack">
            <div class="metric-card">
              <span class="label">Reach</span>
              <div class="metric-card__value">3.2x</div>
              <p>スマホ向け縦型サンプルは SNS 掲載や LP 冒頭の見せ方確認に向きます。</p>
            </div>
            <div class="card">
              <h3>Next Action</h3>
              <p>slideforge render --input ./slides/mobile --format png --preset mobile のように指定して、そのまま画像を書き出せます。</p>
            </div>
          </div>
EOF
