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
      /* oklch theme variables from developer-training-studio globals.css */
      --background: oklch(0.155 0.005 285);
      --foreground: oklch(0.96 0 0);
      --card: oklch(0.19 0.005 285);
      --border: oklch(1 0 0 / 9%);
      --primary: oklch(0.62 0.17 250);
      --primary-foreground: oklch(0.98 0 0);
      --secondary: oklch(0.26 0.006 285);
      --secondary-foreground: oklch(0.96 0 0);
      --muted-foreground: oklch(0.66 0.006 285);
      --accent: oklch(0.28 0.007 285);
      --accent-foreground: oklch(0.98 0 0);
      
      --success: oklch(0.7 0.16 155);
      --success-foreground: oklch(0.16 0.02 155);
      --warning: oklch(0.78 0.15 75);
      --warning-foreground: oklch(0.2 0.03 75);
      --destructive: oklch(0.62 0.21 22);
      
      --font-mono: ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      background: var(--background);
      color: var(--foreground);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    header {
      background: var(--card);
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      height: 48px;
    }
    header h1 {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-wrap: balance;
    }
    .badge {
      font-size: 0.7rem;
      background: var(--secondary);
      color: var(--muted-foreground);
      padding: 0.12rem 0.4rem;
      border-radius: 8px;
      font-weight: 500;
      font-family: var(--font-mono);
      border: 1px solid var(--border);
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
      background: var(--background);
      display: flex;
      flex-direction: column;
      transition: width 200ms cubic-bezier(0.2, 0, 0, 1), min-width 200ms cubic-bezier(0.2, 0, 0, 1);
      min-width: 300px;
    }
    
    /* RIGHT PANE: Quiz Studio */
    #right-pane {
      width: 42%;
      overflow-y: auto;
      background: var(--background);
      transition: width 200ms cubic-bezier(0.2, 0, 0, 1);
      display: flex;
      flex-direction: column;
    }
    
    /* Collapsed State modifications */
    .explorer-collapsed #left-pane {
      width: 40px !important;
      min-width: 40px !important;
      background: var(--card);
    }
    .explorer-collapsed #right-pane {
      width: calc(100% - 40px) !important;
    }
    .explorer-collapsed .code-viewer-container,
    .explorer-collapsed #active-file-path,
    .explorer-collapsed .pane-title span:first-child {
      display: none !important;
    }
    .explorer-collapsed .pane-title {
      justify-content: center !important;
      padding: 0.5rem 0 !important;
      border-bottom: none !important;
    }
    
    .pane-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      background: var(--card);
      padding: 0.5rem 1rem;
      height: 40px;
      flex-shrink: 0;
    }
    .pane-title {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted-foreground);
    }
    
    /* Card layout matching shadcn / developer-training-studio */
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius, 10px);
      padding: 1.25rem;
      margin-bottom: 1rem;
      transition: border-color 150ms ease-out;
    }
    
    .interactive-item {
      cursor: pointer;
    }
    .interactive-item:hover {
      border-color: rgba(255, 255, 255, 0.15);
    }
    .interactive-item:active {
      scale: 0.99;
    }
    
    .meta {
      font-size: 0.75rem;
      color: var(--muted-foreground);
      margin-top: 0.25rem;
      font-family: var(--font-mono);
    }
    
    button {
      background: var(--secondary);
      color: var(--foreground);
      border: 1px solid var(--border);
      height: 32px;
      padding: 0 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.8rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition-property: background-color, border-color, scale;
      transition-duration: 150ms;
      transition-timing-function: ease-out;
    }
    button:hover:not(:disabled) {
      background: var(--accent);
      border-color: rgba(255, 255, 255, 0.15);
    }
    button:active:not(:disabled) {
      scale: 0.96;
    }
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    button.primary {
      background: var(--primary);
      border-color: var(--primary);
      color: var(--primary-foreground);
    }
    button.primary:hover:not(:disabled) {
      background: oklch(0.67 0.17 250);
    }
    button.outline {
      background: transparent;
      border-color: var(--border);
    }
    button.outline:hover:not(:disabled) {
      background: var(--secondary);
    }
    
    /* Interactive Question Choices matching QuestionCard */
    .options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .option-btn {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.65rem 0.75rem;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      font-size: 0.85rem;
      width: 100%;
      height: auto;
      transition-property: border-color, background-color;
      transition-duration: 150ms;
    }
    .option-btn:hover:not(:disabled) {
      border-color: rgba(255, 255, 255, 0.15);
      background: var(--accent);
    }
    .option-btn.selected {
      border-color: var(--primary);
      background: rgba(31, 111, 235, 0.1);
    }
    .option-btn.correct {
      border-color: var(--success);
      background: rgba(35, 134, 54, 0.12);
    }
    .option-btn.incorrect {
      border-color: var(--destructive);
      background: rgba(248, 81, 73, 0.12);
    }
    .option-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 1px solid var(--border);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .option-btn.selected .option-badge {
      border-color: var(--primary);
      color: var(--primary);
    }
    .option-btn.correct .option-badge {
      border-color: var(--success);
      background: var(--success);
      color: var(--success-foreground);
    }
    .option-btn.incorrect .option-badge {
      border-color: var(--destructive);
      background: var(--destructive);
      color: var(--foreground);
    }
    
    /* Code Viewer highlighting and status tags */
    .code-viewer-container {
      display: flex;
      flex: 1;
      overflow: hidden;
      background: var(--code-bg);
    }
    .file-tree {
      width: 250px;
      border-right: 1px solid var(--border);
      overflow-y: auto;
      background: var(--background);
      padding: 0.5rem 0.25rem;
    }
    .code-editor {
      flex: 1;
      overflow: auto;
      margin: 0;
      padding: 0.5rem 0;
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.6;
      background: var(--code-bg);
    }
    .code-line {
      display: flex;
      white-space: pre;
      min-width: max-content;
    }
    .line-number {
      width: 3.2rem;
      text-align: right;
      color: var(--muted-foreground);
      padding-right: 0.75rem;
      user-select: none;
      border-right: 1px solid var(--border);
      margin-right: 1rem;
      font-variant-numeric: tabular-nums;
      opacity: 0.6;
    }
    .code-text {
      flex: 1;
      padding-right: 1.5rem;
    }
    .highlighted-line {
      background: rgba(31, 111, 235, 0.12);
    }
    .highlighted-line .line-number {
      color: var(--primary);
      border-right-color: rgba(31, 111, 235, 0.4);
    }
    
    /* Feedback Dashboard Stats cards */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .stat-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      padding: 0.65rem 0.75rem;
      border-radius: 8px;
    }
    .stat-lbl {
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted-foreground);
    }
    .stat-val {
      font-size: 1.25rem;
      font-weight: bold;
      margin-top: 0.15rem;
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
    }
    .progress-bar-container {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.75rem;
    }
    .progress-track {
      height: 6px;
      border-radius: 9999px;
      background: var(--secondary);
      overflow: hidden;
      margin-top: 0.5rem;
    }
    .progress-fill {
      height: 100%;
      border-radius: 9999px;
      background: var(--primary);
      transition: width 300ms ease-out;
    }
    .progress-kind-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .progress-kind-lbl {
      width: 80px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--muted-foreground);
      text-transform: capitalize;
    }
    
    .hidden { display: none !important; }
    .trace-badge {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--muted-foreground);
      border: 1px solid var(--border);
      padding: 0.15rem 0.4rem;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      transition: border-color 150ms;
    }
    .trace-badge:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    .kind-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.12rem 0.4rem;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 500;
    }
    .kind-code { color: var(--primary); background: rgba(31, 111, 235, 0.12); }
    .kind-plan-vs-code { color: var(--warning); background: rgba(186, 122, 0, 0.12); }
    .kind-concept { color: var(--success); background: rgba(35, 134, 54, 0.12); }
  </style>
  <link rel="stylesheet" href="/assets/trees.css" />
</head>
<body>
  <header>
    <h1>quiz-me <span class="badge">Developer Studio</span></h1>
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <div class="meta" id="session-meta"></div>
    </div>
  </header>

  <main id="app-container">
    <!-- LEFT PANE: Codebase Explorer & Trace Viewer -->
    <div id="left-pane" class="pane">
      <div class="pane-header">
        <span class="pane-title">Codebase Explorer</span>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span id="active-file-path" class="meta" style="margin-right: 0.25rem;">No file open</span>
          <button id="toggle-explorer-btn" style="height: 24px; padding: 0 0.4rem; font-size: 0.7rem; border-radius: 4px;">◀ Collapse</button>
        </div>
      </div>
      <div class="code-viewer-container">
        <div class="file-tree" id="explorer-tree"></div>
        <pre class="code-editor" id="code-content"><code style="color:var(--muted-foreground);">Select a file to inspect lines, or click a location pin in a question card to highlight code lines.</code></pre>
      </div>
    </div>

    <!-- RIGHT PANE: Quiz Studio (All question cards rendered in a scrollable container) -->
    <div id="right-pane" class="pane">
      <!-- LIST VIEW -->
      <section id="list-view" style="padding: 1.5rem;">
        <div class="search-bar">
          <input type="text" id="search-input" placeholder="Search quizzes..." />
          <button id="refresh-btn">Refresh</button>
        </div>
        <div id="quiz-list"></div>
      </section>

      <!-- TAKE VIEW (Scrollable questions card stack + Dashboard) -->
      <section id="take-view" class="hidden" style="display: flex; flex-direction: column; height: 100%;">
        <div class="pane-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="pane-title">Quiz Studio</span>
            <span id="total-questions-badge" class="badge"></span>
          </div>
          <button id="reset-btn" class="outline" style="height: 24px; padding: 0 0.5rem; font-size: 0.7rem;">Reset Session</button>
        </div>
        
        <!-- Live Feedback Dashboard -->
        <div style="border-bottom: 1px solid var(--border); padding: 1rem; flex-shrink: 0; background: rgba(255,255,255,0.01);">
          <div class="dashboard-grid">
            <div class="stat-card">
              <div class="stat-lbl">Answered</div>
              <div id="stat-answered" class="stat-val">0/0</div>
            </div>
            <div class="stat-card">
              <div class="stat-lbl">Accuracy</div>
              <div id="stat-accuracy" class="stat-val">0%</div>
            </div>
            <div class="stat-card">
              <div class="stat-lbl">Correct</div>
              <div id="stat-correct" class="stat-val">0</div>
            </div>
          </div>
          
          <div class="progress-bar-container">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
              <span class="stat-lbl">Session Progress</span>
              <span id="stat-progress-pct" class="meta">0%</span>
            </div>
            <div class="progress-track">
              <div id="stat-progress-bar" class="progress-fill" style="width: 0%;"></div>
            </div>
            <div id="kind-progress-container" style="margin-top: 0.75rem;"></div>
          </div>
        </div>

        <!-- Question Cards Container -->
        <div id="questions-list-container" style="flex: 1; overflow-y: auto; padding: 1rem; space-y: 1rem;"></div>
      </section>
    </div>
  </main>

  <!-- Import @pierre/trees natively as ES Module -->
  <script type="module">
    import { FileTree } from "/assets/trees/index.js";

    window._fileTreeInstance = null;

    window.initPierreTree = function(paths, onSelectCallback) {
      const container = document.getElementById('explorer-tree');
      if (!container) return;

      container.innerHTML = '';
      if (!paths || !paths.length) {
        container.innerHTML = '<div style="font-size:0.8rem; color:var(--muted-foreground); padding:0.5rem;">No files loaded.</div>';
        return;
      }

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

    window.focusPierreTreePath = function(path) {
      if (window._fileTreeInstance && typeof window._fileTreeInstance.focusPath === 'function') {
        try {
          window._fileTreeInstance.focusPath(path);
        } catch (e) {
          console.warn('Failed to focus path', e);
        }
      }
    };
  </script>

  <script>
    let quizzes = [];
    let currentQuiz = null;
    let answers = {};
    let activeFilePath = null;
    let filesData = [];
    let isExplorerCollapsed = false;

    window.addEventListener('load', () => {
      loadQuizzes();
      document.getElementById('refresh-btn').addEventListener('click', loadQuizzes);
      document.getElementById('search-input').addEventListener('input', filterQuizzes);
      document.getElementById('reset-btn').addEventListener('click', resetQuiz);
      document.getElementById('toggle-explorer-btn').addEventListener('click', toggleExplorer);
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
          <div style="font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem;">\${escapeHtml(q.summary)}</div>
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

    function toggleExplorer() {
      isExplorerCollapsed = !isExplorerCollapsed;
      const app = document.getElementById('app-container');
      const btn = document.getElementById('toggle-explorer-btn');
      app.classList.toggle('explorer-collapsed', isExplorerCollapsed);
      btn.textContent = isExplorerCollapsed ? '▶' : '◀ Collapse';
    }

    function show(viewId) {
      ['list-view', 'take-view'].forEach(id => {
        document.getElementById(id).classList.toggle('hidden', id !== viewId);
      });
      if (viewId === 'list-view') {
        location.hash = '';
        currentQuiz = null;
        filesData = [];
        renderFileTree();
        document.getElementById('code-content').innerHTML = '<code style="color:var(--muted-foreground);">Select a file to inspect lines, or click a location pin in a question card to highlight code lines.</code>';
        document.getElementById('active-file-path').textContent = 'No file open';
      }
    }

    async function startQuiz(id) {
      try {
        const res = await fetch('/api/quizzes/' + id);
        currentQuiz = await res.json();
        answers = {};
        
        // Restore answers
        currentQuiz.questions.forEach(q => {
          answers[q.id] = { value: undefined, submitted: false };
        });

        location.hash = '/quiz/' + id;
        
        if (currentQuiz.filesJson) {
          try { filesData = JSON.parse(currentQuiz.filesJson); } catch (e) { filesData = []; }
        } else {
          filesData = [];
        }

        renderFileTree();
        show('take-view');
        
        // Render headers and dashboard
        document.getElementById('session-meta').innerHTML = \`
          <span>scope: <strong>\${currentQuiz.scope}</strong></span> &middot;
          <span>digest: <strong>\${currentQuiz.contextDigest.slice(0, 8)}</strong></span>
        \`;
        document.getElementById('total-questions-badge').textContent = currentQuiz.questions.length + ' questions';
        
        renderQuestionStack();
        updateDashboard();
      } catch (err) {
        console.error('Failed to load quiz details', err);
      }
    }

    function renderFileTree() {
      if (typeof window.initPierreTree === 'function') {
        window.initPierreTree(filesData.map(f => f.path), (path) => {
          openFile(path);
        });
      } else {
        setTimeout(renderFileTree, 100);
      }
    }

    function openFile(path, highlightLines = null) {
      activeFilePath = path;
      document.getElementById('active-file-path').textContent = path;
      if (isExplorerCollapsed && highlightLines) toggleExplorer();
      if (typeof window.focusPierreTreePath === 'function') window.focusPierreTreePath(path);

      const f = filesData.find(x => x.path === path);
      if (!f) {
        document.getElementById('code-content').innerHTML = '<code style="color:var(--destructive);">File content not available.</code>';
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
        setTimeout(() => targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      }
    }

    function renderQuestionStack() {
      const container = document.getElementById('questions-list-container');
      container.innerHTML = '';

      currentQuiz.questions.forEach((q, idx) => {
        const card = document.createElement('article');
        card.id = 'card-' + q.id;
        card.className = 'card';
        card.style.marginBottom = '1rem';
        
        const ans = answers[q.id] || { submitted: false };
        const graded = ans.submitted;
        
        let traceHtml = '';
        if (q.codeRef && q.codeRef.path) {
          traceHtml = \`
            <span class="trace-badge" onclick="openFile('\${escapeJs(q.codeRef.path)}', {start: \${q.codeRef.startLine}, end: \${q.codeRef.endLine}})">
              📍 \${q.codeRef.path.split('/').pop()}:\${q.codeRef.startLine}
            </span>
          \`;
        }

        let kindClass = 'kind-code';
        let kindLabel = 'Code';
        if (q.kind === 'plan-vs-code') {
          kindClass = 'kind-plan-vs-code';
          kindLabel = 'Plan vs Code';
        } else if (q.kind === 'concept') {
          kindClass = 'kind-concept';
          kindLabel = 'Concept';
        }

        let optionsHtml = '';
        if (q.type === 'multiple-choice' && q.options) {
          optionsHtml = '<div class="options">';
          q.options.forEach((opt, oIdx) => {
            const isSelected = ans.value === String(oIdx);
            const isCorrectAnswer = graded && String(oIdx) === q.answer;
            const isWrongSelection = graded && isSelected && String(oIdx) !== q.answer;
            
            let btnClass = '';
            if (isCorrectAnswer) btnClass = 'correct';
            else if (isWrongSelection) btnClass = 'incorrect';
            else if (isSelected) btnClass = 'selected';

            const badgeContent = isCorrectAnswer ? '✓' : isWrongSelection ? '✗' : String.fromCharCode(65 + oIdx);
            optionsHtml += \`
              <button class="option-btn \${btnClass}" \${graded ? 'disabled' : ''} onclick="handleAnswer('\${q.id}', '\${oIdx}')">
                <span class="option-badge">\${badgeContent}</span>
                <span>\${escapeHtml(opt)}</span>
              </button>
            \`;
          });
          optionsHtml += '</div>';
        } else if (q.type === 'true-false') {
          optionsHtml = '<div class="options" style="flex-direction:row;">';
          ['true', 'false'].forEach(val => {
            const isSelected = ans.value === val;
            const isCorrectAnswer = graded && val === q.answer;
            const isWrongSelection = graded && isSelected && val !== q.answer;

            let btnClass = '';
            if (isCorrectAnswer) btnClass = 'correct';
            else if (isWrongSelection) btnClass = 'incorrect';
            else if (isSelected) btnClass = 'selected';

            optionsHtml += \`
              <button class="option-btn \${btnClass}" style="justify-content:center;" \${graded ? 'disabled' : ''} onclick="handleAnswer('\${q.id}', '\${val}')">
                \${val.toUpperCase()}
              </button>
            \`;
          });
          optionsHtml += '</div>';
        } else {
          optionsHtml = \`
            <div class="options">
              <textarea \${graded ? 'disabled' : ''} oninput="handleAnswer('\${q.id}', this.value)" placeholder="Type your answer here..." style="font-size:13px; font-family:var(--font-mono);">\${ans.value || ''}</textarea>
            </div>
          \`;
        }

        let feedbackHtml = '';
        if (graded) {
          const correct = q.type === 'short-answer' ? ans.selfGrade === 'correct' : ans.value === q.answer;
          
          let alertHtml = '';
          if (q.type !== 'short-answer') {
            alertHtml = \`
              <div class="\${correct ? 'correct-alert' : 'incorrect-alert'}" style="font-weight: 500; font-size:0.85rem; margin-top:0.5rem;">
                \${correct ? 'Correct' : 'Incorrect &middot; Correct Answer: ' + escapeHtml(q.answer)}
              </div>
            \`;
          }

          let selfGradeHtml = '';
          if (q.type === 'short-answer') {
            selfGradeHtml = \`
              <div class="meta" style="margin-top:0.5rem; border-top:1px solid var(--border); padding-top:0.5rem;">
                <strong>Expected Model Answer:</strong>
                <div style="font-family: var(--font-mono); font-size:12px; margin-top:0.25rem; background:rgba(0,0,0,0.2); padding:0.5rem; border-radius:4px; border:1px solid var(--border);">\${escapeHtml(q.answer)}</div>
              </div>
            \`;
            if (!ans.selfGrade) {
              selfGradeHtml += \`
                <div style="margin-top:0.75rem;">
                  <p class="meta" style="margin-bottom:0.4rem;">How did your answer compare?</p>
                  <div style="display:flex; gap:0.5rem;">
                    <button class="primary" style="height:28px;" onclick="handleSelfGrade('\${q.id}', 'correct')">Got it</button>
                    <button class="outline" style="height:28px;" onclick="handleSelfGrade('\${q.id}', 'incorrect')">Missed it</button>
                  </div>
                </div>
              \`;
            } else {
              selfGradeHtml += \`
                <div class="\${ans.selfGrade === 'correct' ? 'correct-alert' : 'incorrect-alert'}" style="font-weight: 500; font-size:0.85rem; margin-top:0.5rem;">
                  Self-Graded: \${ans.selfGrade === 'correct' ? 'Correct' : 'Incorrect'}
                </div>
              \`;
            }
          }

          feedbackHtml = \`
            <div style="margin-top:0.75rem; border-top:1px solid var(--border); padding-top:0.75rem;">
              \${alertHtml}
              \${selfGradeHtml}
              <div class="meta" style="margin-top:0.5rem; background: rgba(255,255,255,0.02); border:1px solid var(--border); padding:0.5rem; border-radius:6px;">
                <strong>Explanation:</strong> \${escapeHtml(q.explanation)}
              </div>
            </div>
          \`;
        } else {
          feedbackHtml = \`
            <button class="primary" id="submit-btn-\${q.id}" style="margin-top:0.75rem; height:28px;" \${!ans.value ? 'disabled' : ''} onclick="handleSubmitQuestion('\${q.id}')">
              \${q.type === 'short-answer' ? 'Reveal model answer' : 'Check answer'}
            </button>
          \`;
        }

        card.innerHTML = \`
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom:1px solid var(--border); padding-bottom:0.5rem; margin-bottom:0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-family: var(--font-mono); font-size:11px; font-weight:bold; color:var(--muted-foreground);">Q\${idx + 1}</span>
              <span class="kind-badge \${kindClass}">\${kindLabel}</span>
              <span class="badge" style="background:transparent;">\${q.difficulty.toUpperCase()}</span>
            </div>
            \${traceHtml}
          </div>
          <div style="font-size: 0.9rem; line-height: 1.5; color: var(--foreground);">\${escapeHtml(q.prompt)}</div>
          \${optionsHtml}
          \${feedbackHtml}
        \`;
        
        container.appendChild(card);
      });
    }

    window.handleAnswer = function(qId, val) {
      if (!answers[qId]) answers[qId] = { submitted: false };
      answers[qId].value = val;
      
      const btn = document.getElementById('submit-btn-' + qId);
      if (btn) btn.disabled = !val;

      const q = currentQuiz.questions.find(x => x.id === qId);
      if (q && q.type !== 'short-answer') {
        const labels = document.querySelectorAll('#card-' + qId + ' .option-btn');
        labels.forEach((lbl, idx) => {
          const isSelected = String(idx) === val || lbl.textContent.trim().toLowerCase() === val;
          lbl.classList.toggle('selected', isSelected);
        });
      }
    };

    window.handleSubmitQuestion = function(qId) {
      if (!answers[qId] || !answers[qId].value) return;
      answers[qId].submitted = true;
      renderQuestionStack();
      updateDashboard();
      saveAttempt();
    };

    window.handleSelfGrade = function(qId, grade) {
      if (!answers[qId]) return;
      answers[qId].selfGrade = grade;
      renderQuestionStack();
      updateDashboard();
      saveAttempt();
    };

    async function saveAttempt() {
      // Auto-save attempt when questions are checked
      const payload = {
        answers: currentQuiz.questions.map(q => ({
          questionId: q.id,
          given: (answers[q.id] && answers[q.id].value) || ''
        }))
      };
      try {
        await fetch(\`/api/quizzes/\${currentQuiz.id}/attempts\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn('Failed to auto-save attempt to SQLite database', e);
      }
    }

    function resetQuiz() {
      if (!currentQuiz) return;
      answers = {};
      currentQuiz.questions.forEach(q => {
        answers[q.id] = { value: undefined, submitted: false };
      });
      renderQuestionStack();
      updateDashboard();
    }

    function updateDashboard() {
      const total = currentQuiz.questions.length;
      let answered = 0;
      let correct = 0;
      const byKind = {};

      currentQuiz.questions.forEach(q => {
        byKind[q.kind] = byKind[q.kind] || { total: 0, correct: 0, answered: 0 };
        byKind[q.kind].total++;

        const ans = answers[q.id];
        const isAnswered = ans && ans.submitted && (q.type !== 'short-answer' || ans.selfGrade);
        
        if (isAnswered) {
          answered++;
          byKind[q.kind].answered++;
          const ok = q.type === 'short-answer' ? ans.selfGrade === 'correct' : ans.value === q.answer;
          if (ok) {
            correct++;
            byKind[q.kind].correct++;
          }
        }
      });

      const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
      const progress = Math.round((answered / total) * 100);

      document.getElementById('stat-answered').textContent = answered + ' / ' + total;
      document.getElementById('stat-accuracy').textContent = accuracy + '%';
      document.getElementById('stat-correct').textContent = correct;
      document.getElementById('stat-progress-pct').textContent = progress + '%';
      document.getElementById('stat-progress-bar').style.width = progress + '%';

      // Render kind bars
      const kindContainer = document.getElementById('kind-progress-container');
      kindContainer.innerHTML = Object.entries(byKind).map(([kind, k]) => {
        const pct = k.answered > 0 ? Math.round((k.correct / k.answered) * 100) : 0;
        const color = pct >= 70 ? 'var(--success)' : pct > 0 ? 'var(--warning)' : 'var(--muted-foreground)';
        return \`
          <div class="progress-kind-row">
            <span class="progress-kind-lbl">\${kind.replace('-', ' ')}</span>
            <div class="progress-track" style="flex:1; margin-top:0; height:4px;">
              <div class="progress-fill" style="width:\${k.answered > 0 ? pct : 0}%; background:\${color};"></div>
            </div>
            <span class="meta" style="width:30px; text-align:right; font-size:11px;">\${k.correct}/\${k.total}</span>
          </div>
        \`;
      }).join('');
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
