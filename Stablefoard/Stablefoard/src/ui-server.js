/**
 * Simple Web UI server for the Stock Analysis Agent
 *
 * - Serves a minimal HTML page at http://localhost:3000
 * - Accepts JSON stock data and runs either the simple analyzer or workflow mode
 * - Displays the raw JSON response (pretty-printed), matching the schema:
 *   overallScore, recommendation, financialHealth, valuation, futureGrowth,
 *   competitiveAdvantage, managementQuality, riskFactors, technicalTrend,
 *   portfolioFit, timeHorizon, aiSummary, finalVerdict
 */

import 'dotenv/config';
import http from 'http';
import url from 'url';
import { StockAnalyzer, StockAnalysisWorkflow } from './index.js';
import { validateConfig } from './config/settings.js';

const PORT = process.env.PORT || 3000;

function renderHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Stock Analysis Agent UI</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 0;
      padding: 0;
      background: #0f172a;
      color: #e5e7eb;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
    }
    .container {
      width: 100%;
      max-width: 1100px;
      margin: 32px;
      background: #020617;
      border-radius: 16px;
      box-shadow: 0 24px 60px rgba(15,23,42,0.7);
      border: 1px solid rgba(148,163,184,0.3);
      padding: 24px 28px 28px;
      box-sizing: border-box;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .subtitle {
      color: #9ca3af;
      font-size: 14px;
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-weight: 600;
      margin-bottom: 6px;
      font-size: 13px;
      color: #e5e7eb;
    }
    textarea {
      width: 100%;
      min-height: 220px;
      border-radius: 10px;
      border: 1px solid rgba(148,163,184,0.4);
      background: #020617;
      color: #e5e7eb;
      padding: 10px 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 12px;
      resize: vertical;
      box-sizing: border-box;
    }
    textarea:focus {
      outline: none;
      border-color: #38bdf8;
      box-shadow: 0 0 0 1px rgba(56,189,248,0.5);
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 14px;
      align-items: center;
      justify-content: space-between;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 20px;
      align-items: center;
    }
    .toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #d1d5db;
      cursor: pointer;
      user-select: none;
    }
    .toggle input {
      accent-color: #38bdf8;
      cursor: pointer;
    }
    button {
      appearance: none;
      border: none;
      border-radius: 999px;
      padding: 8px 18px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      background: linear-gradient(to right, #38bdf8, #6366f1);
      color: #0b1120;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 12px 30px rgba(15,23,42,0.9);
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
      box-shadow: none;
    }
    button span.icon {
      font-size: 16px;
    }
    .status {
      font-size: 13px;
      color: #9ca3af;
      min-height: 18px;
    }
    .status.error {
      color: #fecaca;
    }
    .status.success {
      color: #bbf7d0;
    }
    .result-wrapper {
      margin-top: 18px;
    }
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .badge {
      border-radius: 999px;
      padding: 2px 10px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border: 1px solid rgba(148,163,184,0.5);
      color: #9ca3af;
    }
    pre {
      margin: 0;
      padding: 10px 12px;
      background: #020617;
      border-radius: 10px;
      border: 1px solid rgba(148,163,184,0.4);
      max-height: 360px;
      overflow: auto;
      font-size: 12px;
      line-height: 1.4;
      color: #e5e7eb;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    .hint {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
    @media (max-width: 768px) {
      .container {
        margin: 12px;
        padding: 18px 16px 20px;
      }
      h1 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Stock Analysis Agent UI</h1>
    <div class="subtitle">
      Paste stock JSON and run the AI analysis. The result below will be raw JSON with fields like <code>overallScore</code>, <code>recommendation</code>, and detailed paragraph sections, similar to your example.
    </div>

    <label for="inputJson">Input JSON</label>
    <textarea id="inputJson" spellcheck="false" placeholder='Paste JSON matching the schema (e.g., contents of input-example.json)…'></textarea>
    <div class="hint">
      Tip: open <code>input-example.json</code> from the repo and paste its contents here for a realistic test.
    </div>

    <div class="row">
      <div class="controls">
        <label class="toggle">
          <input type="checkbox" id="useWorkflow" />
          <span>Use LangGraph workflow mode</span>
        </label>
        <div class="status" id="statusText"></div>
      </div>
      <div>
        <button id="runBtn">
          <span class="icon">▶</span>
          <span>Run Analysis</span>
        </button>
      </div>
    </div>

    <div class="result-wrapper">
      <div class="result-header">
        <div>Result JSON</div>
        <div class="badge" id="modeBadge">Mode: Simple Analyzer</div>
      </div>
      <pre id="output"><code>// Result will appear here as pretty-printed JSON, with fields like overallScore, recommendation, financialHealth, valuation, futureGrowth, competitiveAdvantage, managementQuality, riskFactors, technicalTrend, portfolioFit, timeHorizon, aiSummary, and finalVerdict.</code></pre>
    </div>
  </div>

  <script>
    const runBtn = document.getElementById('runBtn');
    const inputEl = document.getElementById('inputJson');
    const statusEl = document.getElementById('statusText');
    const outputEl = document.getElementById('output');
    const workflowEl = document.getElementById('useWorkflow');
    const modeBadge = document.getElementById('modeBadge');

    function setStatus(text, type) {
      statusEl.textContent = text || '';
      statusEl.className = 'status' + (type ? ' ' + type : '');
    }

    workflowEl.addEventListener('change', () => {
      modeBadge.textContent = workflowEl.checked ? 'Mode: LangGraph Parallel Workflow ⚡' : 'Mode: Simple Analyzer';
    });
    
    // Default to Parallel Workflow
    workflowEl.checked = true;
    modeBadge.textContent = 'Mode: LangGraph Parallel Workflow ⚡';

    runBtn.addEventListener('click', async () => {
      const raw = inputEl.value.trim();
      if (!raw) {
        setStatus('Please paste JSON input first.', 'error');
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        setStatus('Invalid JSON: ' + e.message, 'error');
        return;
      }

      runBtn.disabled = true;
      setStatus('Running analysis…', '');
      outputEl.textContent = '// Running…';

      try {
        const res = await fetch('/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: parsed,
            mode: workflowEl.checked ? 'workflow' : 'simple'
          })
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const msg = (data && data.error) || ('Request failed with status ' + res.status);
          setStatus(msg, 'error');
          outputEl.textContent = JSON.stringify(data || { error: msg }, null, 2);
          return;
        }

        setStatus('Analysis completed successfully.', 'success');
        outputEl.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        console.error(err);
        setStatus('Network or server error: ' + err.message, 'error');
        outputEl.textContent = '// ' + err.message;
      } finally {
        runBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`;
}

async function handleAnalyze(req, res) {
  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk.toString();
    }

    let parsed;
    try {
      parsed = JSON.parse(body || '{}');
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      return;
    }

    const { input, mode } = parsed;
    if (!input || typeof input !== 'object') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing or invalid \"input\" object in request body' }));
      return;
    }

    try {
      validateConfig();
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Configuration error: ' + err.message }));
      return;
    }

    const useWorkflow = mode === 'workflow' || true; // FORCE PARALLEL WORKFLOW FOR SPEED
    let result;

    if (useWorkflow) {
      const workflow = new StockAnalysisWorkflow();
      result = await workflow.execute(input);
    } else {
      const analyzer = new StockAnalyzer();
      result = await analyzer.analyze(input);
    }

    // result is already the JSON object with keys like overallScore, recommendation, etc.
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (err) {
    console.error('Error handling /analyze:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error: ' + err.message }));
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'GET' && parsedUrl.pathname === '/') {
    const html = renderHtml();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/analyze') {
    await handleAnalyze(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🌐 UI server running at http://localhost:${PORT}`);
});



