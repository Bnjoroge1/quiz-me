export function renderIndex(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>quiz-me Developer Studio</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0d1117;
      --fg: #c9d1d9;
      --card: #161b22;
      --border: #30363d;
      --accent: #21262d;
      --accent-hover: #30363d;
      --primary: #1f6feb;
      --ok: #238636;
      --ok-hover: #2ea043;
      --bad: #da3633;
      --code-bg: #090d16;
      --font-mono: ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--fg);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    header {
      background: #161b22;
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    header h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge {
      font-size: 0.75rem;
      background: var(--primary);
      color: #fff;
      padding: 0.12rem 0.4rem;
      border-radius: 12px;
      font-weight: bold;
    }
    main {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    .pane {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    /* LEFT PANE: Codebase Explorer & Trace Viewer */
    #left-pane {
      flex: 1;
      border-right: 1px solid var(--border);
      background: var(--code-bg);
      display: flex;
      flex-direction: column;
    }
    /* RIGHT PANE: Quiz Studio */
    #right-pane {
      width: 42%;
      padding: 1.5rem;
      overflow-y: auto;
      background: var(--bg);
    }
    .pane-title {
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #8b949e;
      background: #161b22;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 1.25rem;
      margin-bottom: 1rem;
    }
    .interactive-item {
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .interactive-item:hover {
      background: var(--accent);
      border-color: #8b949e;
    }
    .meta {
      font-size: 0.8rem;
      color: #8b949e;
      margin-top: 0.25rem;
    }
    button {
      background: var(--accent);
      color: var(--fg);
      border: 1px solid var(--border);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.1s, border-color 0.1s;
    }
    button:hover:not(:disabled) {
      background: var(--accent-hover);
      border-color: #8b949e;
    }
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    button.primary {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
    button.primary:hover:not(:disabled) {
      background: #238636;
      border-color: #2ea043;
    }
    .options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .option-label {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #0d1117;
      border: 1px solid var(--border);
      border-radius: 6px;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .option-label:hover {
      border-color: #8b949e;
    }
    .option-label input[type="radio"] {
      margin-top: 0.2rem;
    }
    textarea {
      width: 100%;
      min-height: 120px;
      background: #0d1117;
      color: var(--fg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.75rem;
      font-family: inherit;
      resize: vertical;
    }
    textarea:focus {
      outline: none;
      border-color: var(--primary);
    }
    .correct-alert {
      border-left: 4px solid var(--ok);
      padding-left: 0.75rem;
      color: #3fb950;
    }
    .incorrect-alert {
      border-left: 4px solid var(--bad);
      padding-left: 0.75rem;
      color: #f85149;
    }
    .code-viewer-container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    /* @pierre/trees integration overrides */
    .file-tree {
      width: 250px;
      border-right: 1px solid var(--border);
      overflow-y: auto;
      background: #0d1117;
      padding: 0.75rem 0.5rem;
      user-select: none;
    }
    .code-editor {
      flex: 1;
      overflow: auto;
      margin: 0;
      padding: 1rem;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      line-height: 1.5;
      background: var(--code-bg);
    }
    .code-line {
      display: flex;
      white-space: pre-wrap;
    }
    .line-number {
      width: 3rem;
      text-align: right;
      color: #484f58;
      padding-right: 1rem;
      user-select: none;
      border-right: 1px solid #21262d;
      margin-right: 1rem;
    }
    .code-text {
      flex: 1;
    }
    .highlighted-line {
      background: rgba(31, 111, 235, 0.15);
      border-left: 3px solid var(--primary);
    }
    .highlighted-line .line-number {
      color: var(--fg);
      background: rgba(31, 111, 235, 0.2);
    }
    .search-bar {
      margin-bottom: 1rem;
      display: flex;
      gap: 0.5rem;
    }
    .search-bar input {
      flex: 1;
      background: var(--card);
      border: 1px solid var(--border);
      padding: 0.5rem;
      border-radius: 6px;
      color: var(--fg);
    }
    .search-bar input:focus {
      outline: none;
      border-color: var(--primary);
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      padding: 1rem;
      border-radius: 6px;
      text-align: center;
    }
    .stat-val {
      font-size: 1.8rem;
      font-weight: bold;
      color: var(--primary);
      margin-top: 0.25rem;
    }
    .hidden { display: none !important; }
    .trace-link {
      color: var(--primary);
      text-decoration: underline;
      cursor: pointer;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .action-row {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  </style>
  
  <!-- Import @pierre/trees styles directly from jsDelivr -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@pierre/trees/dist/index.css" />
</head>
<body>
  <header>
    <h1>quiz-me <span class="badge">Developer Studio</span></h1>
    <div id="header-meta" class="meta"></div>
  </header>

  <main>
    <!-- LEFT PANE: Codebase Explorer & Trace Viewer -->
    <div id="left-pane" class="pane">
      <div class="pane-title">
        <span>Codebase Explorer & Trace Viewer</span>
        <span id="active-file-path" class="meta">No file open</span>
      </div>
      <div class="code-viewer-container">
        <div class="file-tree" id="explorer-tree">
          <div style="font-size:0.8rem; color:#8b949e; padding:0.5rem;">No files loaded.</div>
        </div>
        <pre class="code-editor" id="code-content"><code style="color:#484f58;">Select a file to inspect lines, or click "Trace Source Code" in a question to highlight grounded code sections.</code></pre>
      </div>
    </div>

    <!-- RIGHT PANE: Quiz Studio -->
    <div id="right-pane" class="pane">
      <!-- LIST VIEW -->
      <section id="list-view">
        <div class="search-bar">
          <input type="text" id="search-input" placeholder="Search quizzes..." />
          <button id="refresh-btn">Refresh</button>
        </div>
        <div id="quiz-list"></div>
      </section>

      <!-- TAKE VIEW -->
      <section id="take-view" class="hidden">
        <div class="card">
          <h2 id="quiz-title" style="margin-bottom: 0.5rem;"></h2>
          <div id="progress" class="meta" style="margin-bottom: 1rem;"></div>
          <div id="question-prompt" style="font-size: 1.1rem; font-weight: 500; line-height: 1.4;"></div>
          <div id="trace-indicator"></div>
          <div id="question-options" class="options"></div>
          
          <div class="action-row">
            <button id="prev-btn">Previous</button>
            <button id="next-btn">Next</button>
            <button id="submit-btn" class="primary hidden">Submit Answers</button>
            <button id="back-btn">Back to List</button>
          </div>
        </div>
      </section>

      <!-- RESULTS VIEW -->
      <section id="results-view" class="hidden">
        <h2>Quiz Results Summary</h2>
        <div class="dashboard-grid">
          <div class="stat-card">
            <div>Score Percentage</div>
            <div id="stat-score" class="stat-val">0%</div>
          </div>
          <div class="stat-card">
            <div>Auto-Graded</div>
            <div id="stat-graded" class="stat-val">0 / 0</div>
          </div>
          <div class="stat-card">
            <div>Short Answer Self-Grade</div>
            <div id="stat-self" class="stat-val">0</div>
          </div>
        </div>
        <div id="review-list"></div>
        <button id="results-back-btn" class="primary">Back to List</button>
      </section>
    </div>
  </main>

  <!-- Import @pierre/trees natively as ES Module -->
  <script type="module">
    import { FileTree } from "https://cdn.jsdelivr.net/npm/@pierre/trees/+esm";

    window._fileTreeInstance = null;

    // Expose init function to standard script
    window.initPierreTree = function(paths, onSelectCallback) {
      const container = document.getElementById('explorer-tree');
      if (!container) return;

      container.innerHTML = '';
      if (!paths || !paths.length) {
        container.innerHTML = '<div style="font-size:0.8rem; color:#8b949e; padding:0.5rem;">No files available in this quiz scope.</div>';
        return;
      }

      // Instantiate FileTree using @pierre/trees
      window._fileTreeInstance = new FileTree({
        paths: paths,
        search: false,
        density: 'compact',
        onSelect: (path) => {
          if (onSelectCallback) onSelectCallback(path);
        }
      });

      window._fileTreeInstance.render({ fileTreeContainer: container });
    };

    // Expose programatic focus selection for tracing
    window.focusPierreTreePath = function(path) {
      if (window._fileTreeInstance && typeof window._fileTreeInstance.focusPath === 'function') {
        try {
          window._fileTreeInstance.focusPath(path);
        } catch (e) {
          console.warn('Failed to programmatically focus path', e);
        }
      }
    };
  </script>

  <script>
    let quizzes = [];
    let currentQuiz = null;
    let currentIndex = 0;
    let answers = {};
    let activeFilePath = null;
    let filesData = [];

    // Initialize application
    window.addEventListener('load', () => {
      loadQuizzes();
      document.getElementById('refresh-btn').addEventListener('click', loadQuizzes);
      document.getElementById('search-input').addEventListener('input', filterQuizzes);
      document.getElementById('prev-btn').addEventListener('click', prevQuestion);
      document.getElementById('next-btn').addEventListener('click', nextQuestion);
      document.getElementById('submit-btn').addEventListener('click', submitQuiz);
      document.getElementById('back-btn').addEventListener('click', () => show('list-view'));
      document.getElementById('results-back-btn').addEventListener('click', () => show('list-view'));
    });

    async function loadQuizzes() {
      try {
        const res = await fetch('/api/quizzes');
        quizzes = await res.json();
        renderQuizList(quizzes);
        checkHash();
      } catch (err) {
        console.error('Failed to load quizzes', err);
      }
    }

    function renderQuizList(list) {
      const el = document.getElementById('quiz-list');
      if (!list.length) {
        el.innerHTML = '<div class="card meta">No quizzes found. Run quiz-me in your terminal to start.</div>';
        return;
      }
      el.innerHTML = list.map(q => \`
        <div class="card interactive-item" onclick="startQuiz('\${q.id}')">
          <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.25rem;">\${escapeHtml(q.summary)}</div>
          <div class="meta">
            <span>Scope: <strong>\${q.scope}</strong></span> &middot;
            <span>Questions: <strong>\${q.questions.length}</strong></span> &middot;
            <span>Created: <strong>\${new Date(q.createdAt).toLocaleString()}</strong></span>
          </div>
        </div>
      \`).join('');
    }

    function filterQuizzes() {
      const q = document.getElementById('search-input').value.toLowerCase();
      const filtered = quizzes.filter(x => x.summary.toLowerCase().includes(q));
      renderQuizList(filtered);
    }

    function show(viewId) {
      ['list-view', 'take-view', 'results-view'].forEach(id => {
        document.getElementById(id).classList.toggle('hidden', id !== viewId);
      });
      if (viewId === 'list-view') {
        location.hash = '';
        currentQuiz = null;
        filesData = [];
        renderFileTree();
        document.getElementById('code-content').innerHTML = '<code style="color:#484f58;">Select a file to inspect lines, or click \"Trace Source Code\" in a question to highlight grounded code sections.</code>';
        document.getElementById('active-file-path').textContent = 'No file open';
      }
    }

    async function startQuiz(id) {
      try {
        const res = await fetch('/api/quizzes/' + id);
        currentQuiz = await res.json();
        currentIndex = 0;
        answers = {};
        location.hash = '/quiz/' + id;
        
        // Parse the codefiles
        if (currentQuiz.filesJson) {
          try {
            filesData = JSON.parse(currentQuiz.filesJson);
          } catch (e) {
            filesData = [];
          }
        } else {
          filesData = [];
        }

        renderFileTree();
        show('take-view');
        renderQuestion();
      } catch (err) {
        console.error('Failed to load quiz details', err);
      }
    }

    function renderFileTree() {
      if (typeof window.initPierreTree === 'function') {
        const paths = filesData.map(f => f.path);
        window.initPierreTree(paths, (path) => {
          openFile(path);
        });
      } else {
        // Fallback if ESM script not initialized yet
        setTimeout(renderFileTree, 100);
      }
    }

    function openFile(path, highlightLines = null) {
      activeFilePath = path;
      document.getElementById('active-file-path').textContent = path;
      
      // Sync focus with @pierre/trees
      if (typeof window.focusPierreTreePath === 'function') {
        window.focusPierreTreePath(path);
      }

      const f = filesData.find(x => x.path === path);
      if (!f) {
        document.getElementById('code-content').innerHTML = '<code style="color:#da3633;">File content not available.</code>';
        return;
      }

      const lines = f.content.split('\\n');
      const container = document.getElementById('code-content');
      container.innerHTML = '';

      let targetEl = null;

      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const lineDiv = document.createElement('div');
        lineDiv.className = 'code-line';
        
        const numSpan = document.createElement('span');
        numSpan.className = 'line-number';
        numSpan.textContent = lineNum;
        
        const textSpan = document.createElement('span');
        textSpan.className = 'code-text';
        textSpan.textContent = line;
        
        lineDiv.appendChild(numSpan);
        lineDiv.appendChild(textSpan);

        if (highlightLines && lineNum >= highlightLines.start && lineNum <= highlightLines.end) {
          lineDiv.className += ' highlighted-line';
          if (!targetEl) targetEl = lineDiv;
        }

        container.appendChild(lineDiv);
      });

      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }

    function renderQuestion() {
      const q = currentQuiz.questions[currentIndex];
      const total = currentQuiz.questions.length;
      
      document.getElementById('quiz-title').textContent = currentQuiz.summary;
      document.getElementById('progress').textContent = \`Question \${currentIndex + 1} / \${total} &middot; Difficulty: \${q.difficulty} &middot; Category: \${q.kind}\`;
      document.getElementById('question-prompt').textContent = q.prompt;

      const traceEl = document.getElementById('trace-indicator');
      traceEl.innerHTML = '';
      if (q.codeRef && q.codeRef.path) {
        traceEl.innerHTML = \`
          <div class="trace-link" onclick="openFile('\${escapeJs(q.codeRef.path)}', {start: \${q.codeRef.startLine}, end: \${q.codeRef.endLine}})">
            🔍 Trace source code: \${q.codeRef.path} (Lines \${q.codeRef.startLine}-\${q.codeRef.endLine})
          </div>
        \`;
        // Auto-open trace file
        openFile(q.codeRef.path, { start: q.codeRef.startLine, end: q.codeRef.endLine });
      }

      const optionsContainer = document.getElementById('question-options');
      optionsContainer.innerHTML = '';

      if (q.type === 'multiple-choice' && q.options) {
        optionsContainer.innerHTML = q.options.map(opt => \`
          <label class="option-label">
            <input type="radio" name="option" value="\${escapeHtml(opt)}" \${answers[q.id] === opt ? 'checked' : ''} onchange="saveAnswer('\${q.id}', this.value)" />
            <span>\${escapeHtml(opt)}</span>
          </label>
        \`).join('');
      } else if (q.type === 'true-false') {
        optionsContainer.innerHTML = ['true', 'false'].map(val => \`
          <label class="option-label">
            <input type="radio" name="option" value="\${val}" \${answers[q.id] === val ? 'checked' : ''} onchange="saveAnswer('\${q.id}', this.value)" />
            <span>\${val}</span>
          </label>
        \`).join('');
      } else {
        const txt = document.createElement('textarea');
        txt.placeholder = 'Type your answer here...';
        txt.value = answers[q.id] || '';
        txt.oninput = (e) => saveAnswer(q.id, e.target.value);
        optionsContainer.appendChild(txt);
      }

      document.getElementById('prev-btn').disabled = currentIndex === 0;
      document.getElementById('next-btn').classList.toggle('hidden', currentIndex === total - 1);
      document.getElementById('submit-btn').classList.toggle('hidden', currentIndex !== total - 1);
    }

    function saveAnswer(qId, val) {
      answers[qId] = val;
    }

    // Helper functions
    function prevQuestion() {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
      }
    }

    function nextQuestion() {
      if (currentIndex < currentQuiz.questions.length - 1) {
        currentIndex++;
        renderQuestion();
      }
    }

    async function submitQuiz() {
      const payload = {
        answers: currentQuiz.questions.map(q => ({
          questionId: q.id,
          given: answers[q.id] || ''
        }))
      };
      try {
        const res = await fetch(\`/api/quizzes/\${currentQuiz.id}/attempts\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const attempt = await res.json();
        renderResults(attempt);
      } catch (err) {
        console.error('Failed to submit attempt', err);
      }
    }

    function renderResults(attempt) {
      const auto = attempt.answers.filter(a => {
        const q = currentQuiz.questions.find(x => x.id === a.questionId);
        return q && q.type !== 'short-answer';
      });
      const correct = auto.filter(a => a.correct).length;
      const pct = auto.length ? Math.round((correct / auto.length) * 100) : 0;

      document.getElementById('stat-score').textContent = pct + '%';
      document.getElementById('stat-graded').textContent = correct + ' / ' + auto.length;
      document.getElementById('stat-self').textContent = attempt.answers.length - auto.length;

      const reviewContainer = document.getElementById('review-list');
      reviewContainer.innerHTML = currentQuiz.questions.map(q => {
        const a = attempt.answers.find(x => x.questionId === q.id);
        const traceLink = q.codeRef && q.codeRef.path 
          ? \`<div class="trace-link" style="margin-top:0.25rem;" onclick="openFile('\${escapeJs(q.codeRef.path)}', {start:\${q.codeRef.startLine}, end:\${q.codeRef.endLine}})">🔍 Trace source: \${q.codeRef.path} (Lines \${q.codeRef.startLine}-\${q.codeRef.endLine})</div>\`
          : '';

        let gradingHtml = '';
        if (q.type === 'short-answer') {
          gradingHtml = \`
            <div class="meta" style="margin-top: 0.5rem; border-top: 1px solid var(--border); padding-top: 0.5rem;">
              <strong>Model Expected Answer:</strong>
              <div style="font-family: var(--font-mono); font-size:0.85rem; margin-top:0.25rem; background:#0d1117; padding:0.5rem; border-radius:4px;">\${escapeHtml(q.answer)}</div>
            </div>
          \`;
        } else {
          const isCorrect = a ? a.correct : false;
          gradingHtml = \`
            <div class="\${isCorrect ? 'correct-alert' : 'incorrect-alert'}" style="margin-top: 0.5rem; font-weight: 500;">
              \${isCorrect ? 'Correct' : 'Incorrect &middot; Correct Answer: ' + escapeHtml(q.answer)}
            </div>
          \`;
        }

        return \`
          <div class="card">
            <div style="font-weight: 600; margin-bottom:0.25rem;">\${escapeHtml(q.prompt)}</div>
            \${traceLink}
            <div style="font-size:0.9rem; margin-top:0.5rem;">Your answer: <em>\${escapeHtml(a ? a.given : '(No answer)')}</em></div>
            \${gradingHtml}
            <div class="meta" style="margin-top:0.5rem; background: var(--accent); padding:0.5rem; border-radius:4px;">
              <strong>Explanation:</strong> \${escapeHtml(q.explanation)}
            </div>
          </div>
        \`;
      }).join('');

      show('results-view');
    }

    function checkHash() {
      const match = location.hash.match(/#\\/quiz\\/(.+)/);
      if (match && match[1]) {
        startQuiz(match[1]);
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function escapeJs(str) {
      if (!str) return '';
      return str.replace(/\\\\/g, '\\\\\\\\').replace(/'/g, "\\\\'");
    }
  </script>
</body>
</html>`;
}
