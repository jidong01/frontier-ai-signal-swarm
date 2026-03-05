/**
 * HTML Template Generator for Frontier AI Signal Swarm Dossiers
 *
 * Produces self-contained, editorial-quality HTML with embedded CSS.
 * Supports Korean text, dark mode, print, responsive layout.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DossierHTMLContent {
  title: string;
  date: string;
  oneLiner: string;
  signals: Array<{ name: string; type: string; strength: string; summary: string }>;
  deepDives: Array<{ title: string; content: string }>;
  conceptualToolkit: Array<{ concept: string; description: string }>;
  crossSignalNarrative: string;
  openQuestions: string[];
  learningPoints: string[];
  sources: Array<{ title: string; url: string }>;
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

function getCSS(): string {
  return `
    /* === Reset & Base === */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #fafaf8;
      --text: #1a1a1a;
      --heading: #111;
      --accent: #c45d2c;
      --secondary: #6b7280;
      --card-bg: #f5f3ef;
      --border: #e5e2db;
      --badge-noise: #9ca3af;
      --badge-weak: #60a5fa;
      --badge-moderate: #f59e0b;
      --badge-strong: #f97316;
      --badge-critical: #ef4444;
      --blockquote-bg: #f9f7f4;
      --blockquote-border: #c45d2c;
      --code-bg: #f0ede8;
      --table-header-bg: #f0ede8;
      --table-stripe: #faf8f5;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #1a1a1e;
        --text: #e4e4e4;
        --heading: #f0f0f0;
        --accent: #e07a4f;
        --secondary: #9ca3af;
        --card-bg: #252528;
        --border: #3a3a3e;
        --blockquote-bg: #222225;
        --blockquote-border: #e07a4f;
        --code-bg: #2a2a2e;
        --table-header-bg: #28282c;
        --table-stripe: #1f1f23;
      }
    }

    html {
      font-size: 17px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Noto Serif KR', 'Georgia', serif;
      line-height: 1.8;
      padding: 2rem 1rem 4rem;
    }

    /* === Layout === */
    .container {
      max-width: 720px;
      margin: 0 auto;
    }

    /* === Typography === */
    h1, h2, h3, h4 {
      font-family: 'Inter', sans-serif;
      color: var(--heading);
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    h1 {
      font-size: 2.2rem;
      line-height: 1.25;
      margin-bottom: 0.5rem;
    }

    h2 {
      font-size: 1.6rem;
      line-height: 1.3;
      margin-top: 3rem;
      margin-bottom: 1rem;
      padding-bottom: 0.4rem;
      border-bottom: 1px solid var(--border);
    }

    h3 {
      font-size: 1.3rem;
      line-height: 1.35;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
    }

    p {
      margin-bottom: 1.2rem;
    }

    a {
      color: var(--accent);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.15s;
    }
    a:hover {
      border-bottom-color: var(--accent);
    }

    strong { font-weight: 700; }
    em { font-style: italic; }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.88em;
      background: var(--code-bg);
      padding: 0.15em 0.4em;
      border-radius: 3px;
    }

    pre {
      background: var(--code-bg);
      border-radius: 6px;
      padding: 1.2rem 1.4rem;
      overflow-x: auto;
      margin-bottom: 1.5rem;
      line-height: 1.55;
    }
    pre code {
      background: none;
      padding: 0;
      font-size: 0.85rem;
    }

    /* === Header === */
    .dossier-header {
      margin-bottom: 2.5rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border);
    }

    .dossier-meta {
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      color: var(--secondary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.8rem;
    }

    .one-liner {
      font-size: 1.25rem;
      line-height: 1.6;
      color: var(--secondary);
      margin-top: 1rem;
      font-style: italic;
    }

    /* === Section Dividers === */
    .section-divider {
      width: 40px;
      height: 1px;
      background: var(--border);
      margin: 3rem auto;
    }

    /* === Signal Table === */
    .signal-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0 2rem;
      font-size: 0.92rem;
    }

    .signal-table thead {
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--secondary);
    }

    .signal-table th {
      background: var(--table-header-bg);
      text-align: left;
      padding: 0.7rem 1rem;
      border-bottom: 2px solid var(--border);
    }

    .signal-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }

    .signal-table tbody tr:nth-child(even) {
      background: var(--table-stripe);
    }

    .signal-table .signal-name {
      font-weight: 600;
      color: var(--heading);
    }

    /* === Signal Badges === */
    .badge {
      display: inline-block;
      font-family: 'Inter', sans-serif;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.2em 0.6em;
      border-radius: 3px;
      color: #fff;
      white-space: nowrap;
    }

    .badge-noise    { background: var(--badge-noise); }
    .badge-weak     { background: var(--badge-weak); }
    .badge-moderate { background: var(--badge-moderate); color: #1a1a1a; }
    .badge-strong   { background: var(--badge-strong); color: #1a1a1a; }
    .badge-critical { background: var(--badge-critical); }

    .badge-type {
      background: transparent;
      border: 1px solid var(--secondary);
      color: var(--secondary);
    }

    /* === Deep Dive === */
    .deep-dive {
      margin-bottom: 2.5rem;
    }

    .deep-dive h3 {
      color: var(--accent);
    }

    /* === Blockquote === */
    blockquote {
      border-left: 3px solid var(--blockquote-border);
      background: var(--blockquote-bg);
      padding: 1rem 1.4rem;
      margin: 1.5rem 0;
      border-radius: 0 6px 6px 0;
      font-style: italic;
      color: var(--secondary);
    }
    blockquote p:last-child {
      margin-bottom: 0;
    }

    /* === Conceptual Toolkit Cards === */
    .toolkit-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      margin: 1.5rem 0 2rem;
    }

    @media (min-width: 560px) {
      .toolkit-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .toolkit-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.2rem 1.4rem;
      transition: box-shadow 0.15s;
    }

    .toolkit-card:hover {
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }

    @media (prefers-color-scheme: dark) {
      .toolkit-card:hover {
        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      }
    }

    .toolkit-card h4 {
      font-size: 1.05rem;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    .toolkit-card p {
      font-size: 0.92rem;
      line-height: 1.65;
      margin-bottom: 0;
      color: var(--text);
    }

    /* === Open Questions Callout === */
    .open-questions {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-left: 4px solid var(--accent);
      border-radius: 0 8px 8px 0;
      padding: 1.5rem 1.8rem;
      margin: 1.5rem 0 2rem;
    }

    .open-questions h2 {
      margin-top: 0;
      border-bottom: none;
      padding-bottom: 0;
      font-size: 1.3rem;
    }

    .open-questions ol {
      margin: 1rem 0 0;
      padding-left: 1.4rem;
    }

    .open-questions li {
      margin-bottom: 0.6rem;
      line-height: 1.65;
    }

    /* === Lists === */
    ul, ol {
      margin: 0.8rem 0 1.5rem;
      padding-left: 1.6rem;
    }

    li {
      margin-bottom: 0.4rem;
    }

    li::marker {
      color: var(--accent);
    }

    /* === Learning Points === */
    .learning-points li {
      padding: 0.2rem 0;
      line-height: 1.65;
    }

    /* === Sources === */
    .sources-list {
      list-style: none;
      padding: 0;
      margin: 1rem 0;
    }

    .sources-list li {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.92rem;
    }

    .sources-list li:last-child {
      border-bottom: none;
    }

    .sources-list a {
      font-weight: 500;
    }

    /* === Footer === */
    .dossier-footer {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
      text-align: center;
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem;
      color: var(--secondary);
      letter-spacing: 0.03em;
    }

    .dossier-footer .brand {
      font-weight: 700;
      color: var(--accent);
    }

    /* === Generic table (for markdown tables) === */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.92rem;
    }

    thead {
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--secondary);
    }

    th {
      background: var(--table-header-bg);
      text-align: left;
      padding: 0.7rem 1rem;
      border-bottom: 2px solid var(--border);
    }

    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }

    tbody tr:nth-child(even) {
      background: var(--table-stripe);
    }

    /* === HR === */
    hr {
      border: none;
      height: 1px;
      background: var(--border);
      margin: 2.5rem 0;
    }

    /* === PDF Download Button === */
    .pdf-download-btn {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
      background: var(--accent);
      border: none;
      border-radius: 8px;
      padding: 0.7rem 1.2rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
      z-index: 1000;
    }

    .pdf-download-btn:hover {
      background: #a84920;
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      transform: translateY(-1px);
    }

    .pdf-download-btn:active {
      transform: translateY(0);
    }

    @media (prefers-color-scheme: dark) {
      .pdf-download-btn:hover {
        background: #c45d2c;
      }
    }

    .pdf-download-btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    /* === Print === */
    @media print {
      .pdf-download-btn { display: none !important; }
      body {
        background: #fff;
        color: #000;
        padding: 0;
        font-size: 11pt;
      }
      .container {
        max-width: 100%;
      }
      h1, h2, h3, h4 { color: #000; }
      a { color: #000; border-bottom: none; text-decoration: underline; }
      .badge { border: 1px solid #999; color: #000 !important; background: #eee !important; }
      .toolkit-card { break-inside: avoid; box-shadow: none; border: 1px solid #ccc; }
      .open-questions { break-inside: avoid; }
      .deep-dive { break-inside: avoid; }
      .dossier-footer { margin-top: 2rem; }
    }

    /* === Responsive === */
    @media (max-width: 480px) {
      html { font-size: 15px; }
      h1 { font-size: 1.7rem; }
      h2 { font-size: 1.35rem; }
      body { padding: 1rem 0.75rem 3rem; }
      .signal-table { font-size: 0.82rem; }
      .signal-table th, .signal-table td { padding: 0.5rem 0.6rem; }
      .toolkit-grid { grid-template-columns: 1fr; }
    }

    /* === Annotation System === */
    :root {
      --ann-highlight: rgba(255, 213, 79, 0.35);
      --ann-highlight-hover: rgba(255, 213, 79, 0.55);
      --ann-toolbar-bg: #2d2d2d;
      --ann-sidebar-width: 320px;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --ann-highlight: rgba(255, 213, 79, 0.2);
        --ann-highlight-hover: rgba(255, 213, 79, 0.35);
        --ann-toolbar-bg: #1a1a1e;
      }
    }
    .ann-highlight {
      background: var(--ann-highlight);
      border-radius: 2px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .ann-highlight:hover { background: var(--ann-highlight-hover); }
    .ann-highlight.has-memo { border-bottom: 2px solid var(--accent); }
    .ann-toolbar {
      position: absolute;
      display: none;
      background: var(--ann-toolbar-bg);
      border-radius: 8px;
      padding: 4px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      z-index: 9000;
      gap: 2px;
    }
    .ann-toolbar.visible { display: flex; }
    .ann-toolbar button {
      background: transparent;
      border: none;
      color: #fff;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem;
      white-space: nowrap;
      transition: background 0.1s;
    }
    .ann-toolbar button:hover { background: rgba(255,255,255,0.15); }
    .ann-section-actions {
      position: absolute;
      right: -44px;
      top: 4px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .deep-dive, .toolkit-card { position: relative; }
    .deep-dive:hover .ann-section-actions,
    .toolkit-card:hover .ann-section-actions { opacity: 1; }
    .ann-section-btn {
      width: 28px; height: 28px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--card-bg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      transition: border-color 0.1s;
    }
    .ann-section-btn:hover { border-color: var(--accent); }
    .ann-section-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
    .ann-memo-indicator {
      display: inline-block;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--accent);
      margin-left: 6px;
      vertical-align: middle;
    }
    .ann-sidebar {
      position: fixed;
      top: 0; right: 0;
      width: var(--ann-sidebar-width);
      height: 100vh;
      background: var(--bg);
      border-left: 1px solid var(--border);
      overflow-y: auto;
      transform: translateX(100%);
      transition: transform 0.25s ease;
      z-index: 8000;
      padding: 1.5rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
    }
    .ann-sidebar.open { transform: translateX(0); }
    .ann-sidebar h3 { font-size: 1rem; margin-bottom: 1rem; color: var(--heading); }
    .ann-sidebar-item {
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 0.5rem;
      cursor: pointer;
      transition: border-color 0.15s;
    }
    .ann-sidebar-item:hover { border-color: var(--accent); }
    .ann-sidebar-item .ann-type { font-size: 0.7rem; text-transform: uppercase; color: var(--secondary); }
    .ann-sidebar-item .ann-text { margin-top: 4px; color: var(--text); line-height: 1.4; }
    .ann-sidebar-item .ann-memo-content { margin-top: 6px; padding: 6px 8px; background: var(--card-bg); border-radius: 4px; font-size: 0.82rem; }
    .ann-sidebar-item .ann-actions { margin-top: 6px; display: flex; gap: 8px; }
    .ann-sidebar-item .ann-actions button {
      background: none; border: none; cursor: pointer;
      color: var(--secondary); font-size: 0.75rem;
      font-family: 'Inter', sans-serif;
    }
    .ann-sidebar-item .ann-actions button:hover { color: var(--accent); }
    .ann-sidebar-toggle {
      position: fixed; bottom: 5rem; right: 2rem;
      background: var(--accent); color: #fff;
      border: none; border-radius: 50%;
      width: 44px; height: 44px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      z-index: 8001;
      transition: transform 0.1s;
    }
    .ann-sidebar-toggle:hover { transform: translateY(-2px); }
    .ann-sidebar-toggle .ann-count {
      position: absolute; top: -4px; right: -4px;
      background: #ef4444; color: #fff;
      border-radius: 50%; width: 18px; height: 18px;
      font-size: 0.65rem; display: flex;
      align-items: center; justify-content: center;
    }
    .ann-memo-modal {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      display: none;
      align-items: center; justify-content: center;
      z-index: 9500;
    }
    .ann-memo-modal.visible { display: flex; }
    .ann-memo-modal-content {
      background: var(--bg);
      border-radius: 12px;
      padding: 1.5rem;
      width: 90%; max-width: 480px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    .ann-memo-modal-content h4 { margin-bottom: 0.75rem; font-family: 'Inter', sans-serif; }
    .ann-memo-modal-content textarea {
      width: 100%; height: 120px;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.75rem;
      font-family: 'Noto Serif KR', Georgia, serif;
      font-size: 0.9rem;
      resize: vertical;
      background: var(--bg);
      color: var(--text);
    }
    .ann-memo-modal-content .ann-modal-buttons {
      margin-top: 0.75rem;
      display: flex; gap: 8px; justify-content: flex-end;
    }
    .ann-memo-modal-content .ann-modal-buttons button {
      padding: 6px 16px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
    }
    .ann-memo-modal-content .ann-modal-buttons .ann-btn-primary {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    @media print {
      .ann-toolbar, .ann-sidebar, .ann-sidebar-toggle,
      .ann-section-actions, .ann-memo-modal,
      .ann-memo-indicator { display: none !important; }
      .ann-highlight { background: none !important; border-bottom: none !important; }
    }
    @media (max-width: 480px) {
      .ann-section-actions { right: -36px; }
      .ann-sidebar { width: 100%; }
    }
  `;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function strengthBadge(strength: string): string {
  const s = strength.toLowerCase();
  return `<span class="badge badge-${s}">${escapeHTML(strength)}</span>`;
}

function typeBadge(type: string): string {
  return `<span class="badge badge-type">${escapeHTML(type)}</span>`;
}

/**
 * Very simple inline-markdown to HTML for deep-dive content blocks.
 * Handles bold, italic, inline code, links, and line breaks.
 */
function inlineMarkdown(text: string): string {
  let out = escapeHTML(text);
  // inline code (process first to avoid inner formatting)
  out = out.replace(/`(.+?)`/g, '<code>$1</code>');
  // bold ** or __
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // italic * or _
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  out = out.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');
  // links
  out = out.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return out;
}

/**
 * Convert markdown-like text to HTML paragraphs / lists.
 * Intended for deep-dive content blocks.
 */
function markdownBlockToHTML(text: string): string {
  const lines = text.split('\n');
  const parts: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let buffer: string[] = [];

  function flushParagraph() {
    if (buffer.length > 0) {
      const content = buffer.join(' ').trim();
      if (content) {
        parts.push(`<p>${inlineMarkdown(content)}</p>`);
      }
      buffer = [];
    }
  }

  function closeList() {
    if (inList) {
      parts.push(`</${listType}>`);
      inList = false;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // empty line
    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }

    // blockquote
    if (trimmed.startsWith('> ')) {
      flushParagraph();
      closeList();
      parts.push(`<blockquote><p>${inlineMarkdown(trimmed.slice(2))}</p></blockquote>`);
      continue;
    }

    // bullet list
    if (/^[-*]\s/.test(trimmed)) {
      flushParagraph();
      if (!inList || listType !== 'ul') {
        closeList();
        parts.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      parts.push(`<li>${inlineMarkdown(trimmed.replace(/^[-*]\s/, ''))}</li>`);
      continue;
    }

    // numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph();
      if (!inList || listType !== 'ol') {
        closeList();
        parts.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      parts.push(`<li>${inlineMarkdown(trimmed.replace(/^\d+\.\s/, ''))}</li>`);
      continue;
    }

    // heading inside deep-dive
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      closeList();
      parts.push(`<h4>${inlineMarkdown(trimmed.slice(4))}</h4>`);
      continue;
    }

    // otherwise accumulate paragraph
    buffer.push(trimmed);
  }

  flushParagraph();
  closeList();

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Annotation JavaScript (IIFE injected into both generators)
// ---------------------------------------------------------------------------

function getAnnotationJS(): string {
  return `(function() {
  'use strict';

  // === Config ===
  var DOSSIER_ID = (function() {
    var m = location.pathname.match(/\\/(dossier-[^.]+)\\.html/);
    return m ? m[1] : null;
  })();
  if (!DOSSIER_ID) return;

  var annotations = [];

  // === API ===
  var API = {
    list: function() {
      return fetch('/api/annotations?dossier_id=' + encodeURIComponent(DOSSIER_ID))
        .then(function(r) { return r.json(); })
        .then(function(d) { return d.annotations || []; });
    },
    create: function(data) {
      return fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ dossier_id: DOSSIER_ID }, data))
      }).then(function(r) { return r.json(); });
    },
    update: function(id, content) {
      return fetch('/api/annotations/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content })
      }).then(function(r) { return r.json(); });
    },
    remove: function(id) {
      return fetch('/api/annotations/' + id, { method: 'DELETE' });
    }
  };

  // === DOM Helpers ===
  function getCSSPath(el) {
    if (!el || el === document.body) return 'body';
    if (el.id) return '#' + el.id;
    var parent = el.parentElement;
    if (!parent) return el.tagName.toLowerCase();
    var siblings = Array.from(parent.children).filter(function(c) { return c.tagName === el.tagName; });
    var idx = siblings.indexOf(el);
    var nth = siblings.length > 1 ? ':nth-of-type(' + (idx + 1) + ')' : '';
    return getCSSPath(parent) + ' > ' + el.tagName.toLowerCase() + nth;
  }

  function getTextAround(range, chars, before) {
    var container = before ? range.startContainer : range.endContainer;
    var offset = before ? range.startOffset : range.endOffset;
    if (container.nodeType !== 3) return '';
    var text = container.textContent || '';
    return before ? text.slice(Math.max(0, offset - chars), offset) : text.slice(offset, offset + chars);
  }

  function findSectionId(el) {
    while (el && el !== document.body) {
      if (el.id && (el.id.indexOf('deep-dive') === 0 || el.id.indexOf('signal-row') === 0 ||
          el.id.indexOf('toolkit-card') === 0 || el.id === 'cross-signal' ||
          el.id === 'open-questions' || el.id === 'learning-points' ||
          (el.dataset && el.dataset.sectionId))) {
        return el.id || el.dataset.sectionId;
      }
      el = el.parentElement;
    }
    return null;
  }

  function findSignalType(sectionId) {
    if (!sectionId) return null;
    var el = document.getElementById(sectionId);
    if (!el) return null;
    var badge = el.querySelector('.badge-type');
    return badge ? badge.textContent.trim() : null;
  }

  // === Toolbar ===
  var toolbar = document.createElement('div');
  toolbar.className = 'ann-toolbar';
  toolbar.innerHTML = '<button data-action="highlight">하이라이트</button><button data-action="highlight-memo">하이라이트 + 메모</button>';
  document.body.appendChild(toolbar);
  var currentRange = null;

  var containerEl = document.querySelector('.container');
  if (containerEl) {
    containerEl.addEventListener('mouseup', function(e) {
      if (e.target.closest('.ann-toolbar') || e.target.closest('.ann-sidebar') || e.target.closest('.ann-memo-modal')) return;
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        toolbar.classList.remove('visible');
        return;
      }
      currentRange = sel.getRangeAt(0).cloneRange();
      var rect = currentRange.getBoundingClientRect();
      toolbar.style.left = (rect.left + rect.width / 2 - 100 + window.scrollX) + 'px';
      toolbar.style.top = (rect.top - 44 + window.scrollY) + 'px';
      toolbar.classList.add('visible');
    });
  }

  document.addEventListener('mousedown', function(e) {
    if (!e.target.closest('.ann-toolbar')) {
      toolbar.classList.remove('visible');
    }
  });

  toolbar.addEventListener('click', function(e) {
    var btn = e.target.closest('button');
    if (!btn || !currentRange) return;
    var action = btn.dataset.action;
    var text = currentRange.toString().trim();
    if (!text) return;

    var sectionId = findSectionId(currentRange.startContainer.parentElement);
    var position = {
      start_path: getCSSPath(currentRange.startContainer.nodeType === 3 ? currentRange.startContainer.parentElement : currentRange.startContainer),
      start_offset: currentRange.startOffset,
      end_path: getCSSPath(currentRange.endContainer.nodeType === 3 ? currentRange.endContainer.parentElement : currentRange.endContainer),
      end_offset: currentRange.endOffset,
      context_before: getTextAround(currentRange, 30, true),
      context_after: getTextAround(currentRange, 30, false)
    };

    toolbar.classList.remove('visible');
    window.getSelection().removeAllRanges();

    if (action === 'highlight') {
      API.create({
        type: 'highlight',
        selected_text: text,
        section_id: sectionId,
        position: position,
        signal_type: findSignalType(sectionId)
      }).then(function(ann) {
        annotations.push(ann);
        wrapHighlight(currentRange, ann.id, false);
        updateSidebar();
      });
    } else if (action === 'highlight-memo') {
      showMemoModal(text, sectionId, position, currentRange);
    }
  });

  // === Memo Modal ===
  var modal = document.createElement('div');
  modal.className = 'ann-memo-modal';
  modal.innerHTML = '<div class="ann-memo-modal-content"><h4>메모 추가</h4><div class="ann-selected-preview" style="padding:8px;background:var(--card-bg);border-radius:6px;margin-bottom:12px;font-size:0.85rem;color:var(--secondary);max-height:80px;overflow:hidden"></div><textarea placeholder="이 부분에 대한 생각을 적어주세요..."></textarea><div class="ann-modal-buttons"><button class="ann-btn-cancel">취소</button><button class="ann-btn-primary ann-btn-save">저장</button></div></div>';
  document.body.appendChild(modal);

  var pendingMemo = null;

  function showMemoModal(text, sectionId, position, range) {
    modal.querySelector('.ann-selected-preview').textContent = text.length > 100 ? text.slice(0, 100) + '...' : text;
    modal.querySelector('textarea').value = '';
    modal.classList.add('visible');
    modal.querySelector('textarea').focus();
    pendingMemo = { text: text, sectionId: sectionId, position: position, range: range };
  }

  function showEditModal(ann) {
    modal.querySelector('.ann-selected-preview').textContent = ann.selected_text || '(섹션 메모)';
    modal.querySelector('textarea').value = ann.content || '';
    modal.classList.add('visible');
    modal.querySelector('textarea').focus();
    pendingMemo = { editId: ann.id };
  }

  modal.querySelector('.ann-btn-cancel').addEventListener('click', function() {
    modal.classList.remove('visible');
    pendingMemo = null;
  });

  modal.querySelector('.ann-btn-save').addEventListener('click', function() {
    var content = modal.querySelector('textarea').value.trim();
    if (!content) return;
    modal.classList.remove('visible');

    if (pendingMemo.editId) {
      API.update(pendingMemo.editId, content).then(function(updated) {
        var idx = -1;
        for (var j = 0; j < annotations.length; j++) {
          if (annotations[j].id === pendingMemo.editId) { idx = j; break; }
        }
        if (idx >= 0) annotations[idx] = updated;
        pendingMemo = null;
        updateSidebar();
      });
    } else {
      var pm = pendingMemo;
      API.create({
        type: 'highlight',
        selected_text: pm.text,
        content: content,
        section_id: pm.sectionId,
        position: pm.position,
        signal_type: findSignalType(pm.sectionId)
      }).then(function(ann) {
        annotations.push(ann);
        if (pm.range) {
          wrapHighlight(pm.range, ann.id, true);
        }
        pendingMemo = null;
        updateSidebar();
      });
    }
  });

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('visible');
      pendingMemo = null;
    }
  });

  // === Highlight Renderer ===
  function wrapHighlight(range, annId, hasMemo) {
    try {
      var mark = document.createElement('mark');
      mark.className = 'ann-highlight' + (hasMemo ? ' has-memo' : '');
      mark.dataset.annId = annId;
      range.surroundContents(mark);
    } catch(ex) {
      // surroundContents fails if range spans multiple elements - use extractContents
      try {
        var mark2 = document.createElement('mark');
        mark2.className = 'ann-highlight' + (hasMemo ? ' has-memo' : '');
        mark2.dataset.annId = annId;
        mark2.appendChild(range.extractContents());
        range.insertNode(mark2);
      } catch(ex2) { /* give up gracefully */ }
    }
  }

  function restoreHighlights() {
    for (var i = 0; i < annotations.length; i++) {
      var ann = annotations[i];
      if (ann.type !== 'highlight' || !ann.position) continue;
      try {
        var startEl = document.querySelector(ann.position.start_path);
        var endEl = document.querySelector(ann.position.end_path);
        if (!startEl || !endEl) { restoreByText(ann); continue; }

        var startNode = findTextNode(startEl, ann.position.start_offset, ann.position.context_before);
        var endNode = findTextNode(endEl, ann.position.end_offset, ann.position.context_after);
        if (!startNode || !endNode) { restoreByText(ann); continue; }

        var range = document.createRange();
        range.setStart(startNode.node, startNode.offset);
        range.setEnd(endNode.node, endNode.offset);
        wrapHighlight(range, ann.id, !!ann.content);
      } catch(ex) {
        restoreByText(ann);
      }
    }
  }

  function findTextNode(el, offset, context) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var text = node.textContent || '';
      if (context && text.indexOf(context) >= 0) {
        var idx = text.indexOf(context);
        return { node: node, offset: idx + context.length };
      }
      if (offset <= text.length) {
        return { node: node, offset: offset };
      }
    }
    return null;
  }

  function restoreByText(ann) {
    if (!ann.selected_text) return;
    var ctn = document.querySelector('.container');
    if (!ctn) return;
    var walker = document.createTreeWalker(ctn, NodeFilter.SHOW_TEXT);
    var node;
    var searchText = ann.selected_text.slice(0, 60);
    while ((node = walker.nextNode())) {
      var text = node.textContent || '';
      var idx = text.indexOf(searchText);
      if (idx >= 0) {
        try {
          var range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, Math.min(idx + ann.selected_text.length, text.length));
          wrapHighlight(range, ann.id, !!ann.content);
        } catch(ex) { /* skip */ }
        break;
      }
    }
  }

  // === Section Actions ===
  function injectSectionActions() {
    document.querySelectorAll('.deep-dive, .toolkit-card').forEach(function(el) {
      if (el.querySelector('.ann-section-actions')) return;
      var actions = document.createElement('div');
      actions.className = 'ann-section-actions';
      actions.innerHTML = '<button class="ann-section-btn" data-action="bookmark" title="북마크">\\u2605</button><button class="ann-section-btn" data-action="section-memo" title="메모">\\u270E</button>';
      el.appendChild(actions);

      var sectionId = el.id;
      var existing = annotations.filter(function(a) { return a.section_id === sectionId && (a.type === 'bookmark' || a.type === 'memo'); });
      if (existing.length > 0) {
        var bookmarkBtn = actions.querySelector('[data-action="bookmark"]');
        if (existing.some(function(a) { return a.type === 'bookmark'; })) bookmarkBtn.classList.add('active');
      }
    });

    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.ann-section-btn');
      if (!btn) return;
      var section = btn.closest('.deep-dive, .toolkit-card');
      if (!section) return;
      var sectionId = section.id;
      var action = btn.dataset.action;

      if (action === 'bookmark') {
        var existing = null;
        for (var j = 0; j < annotations.length; j++) {
          if (annotations[j].section_id === sectionId && annotations[j].type === 'bookmark') {
            existing = annotations[j]; break;
          }
        }
        if (existing) {
          API.remove(existing.id).then(function() {
            annotations = annotations.filter(function(a) { return a.id !== existing.id; });
            btn.classList.remove('active');
            updateSidebar();
          });
        } else {
          var headingEl = section.querySelector('h3, h4');
          API.create({
            type: 'bookmark',
            section_id: sectionId,
            selected_text: headingEl ? headingEl.textContent : '',
            signal_type: findSignalType(sectionId)
          }).then(function(ann) {
            annotations.push(ann);
            btn.classList.add('active');
            updateSidebar();
          });
        }
      } else if (action === 'section-memo') {
        var headingEl2 = section.querySelector('h3, h4');
        showMemoModal(
          headingEl2 ? headingEl2.textContent : '(섹션)',
          sectionId, null, null
        );
      }
    });
  }

  // === Sidebar ===
  var sidebar = document.createElement('div');
  sidebar.className = 'ann-sidebar';
  sidebar.innerHTML = '<h3>어노테이션</h3><div class="ann-sidebar-list"></div>';
  document.body.appendChild(sidebar);

  var sidebarToggle = document.createElement('button');
  sidebarToggle.className = 'ann-sidebar-toggle';
  sidebarToggle.innerHTML = '\\u270E<span class="ann-count" style="display:none">0</span>';
  document.body.appendChild(sidebarToggle);

  sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('open');
  });

  function updateSidebar() {
    var list = sidebar.querySelector('.ann-sidebar-list');
    var count = sidebarToggle.querySelector('.ann-count');
    count.textContent = String(annotations.length);
    count.style.display = annotations.length > 0 ? 'flex' : 'none';

    if (annotations.length === 0) {
      list.innerHTML = '<p style="color:var(--secondary);font-size:0.85rem">텍스트를 선택하여 하이라이트하거나,<br>섹션의 \\u2605 버튼으로 북마크하세요.</p>';
      return;
    }

    var typeLabels = { highlight: '하이라이트', memo: '메모', bookmark: '북마크', dismiss: '무시' };
    list.innerHTML = annotations.map(function(ann) {
      var typeLabel = typeLabels[ann.type] || ann.type;
      var text = ann.selected_text ? (ann.selected_text.length > 80 ? ann.selected_text.slice(0, 80) + '...' : ann.selected_text) : '';
      var memo = ann.content ? '<div class="ann-memo-content">' + escapeForHTML(ann.content) + '</div>' : '';
      return '<div class="ann-sidebar-item" data-ann-id="' + ann.id + '">' +
        '<div class="ann-type">' + typeLabel + '</div>' +
        (text ? '<div class="ann-text">' + escapeForHTML(text) + '</div>' : '') +
        memo +
        '<div class="ann-actions">' +
        (ann.type === 'highlight' ? '<button data-action="edit">편집</button>' : '') +
        '<button data-action="delete">삭제</button>' +
        '</div></div>';
    }).join('');
  }

  function escapeForHTML(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  sidebar.addEventListener('click', function(e) {
    var actionBtn = e.target.closest('[data-action]');
    var item = e.target.closest('.ann-sidebar-item');
    if (!item) return;
    var annId = item.dataset.annId;
    var ann = null;
    for (var j = 0; j < annotations.length; j++) {
      if (annotations[j].id === annId) { ann = annotations[j]; break; }
    }
    if (!ann) return;

    if (actionBtn) {
      var action = actionBtn.dataset.action;
      if (action === 'delete') {
        API.remove(annId).then(function() {
          annotations = annotations.filter(function(a) { return a.id !== annId; });
          document.querySelectorAll('[data-ann-id="' + annId + '"]').forEach(function(el) {
            if (el.tagName === 'MARK') {
              var parent = el.parentNode;
              while (el.firstChild) parent.insertBefore(el.firstChild, el);
              parent.removeChild(el);
            }
          });
          updateSidebar();
        });
      } else if (action === 'edit') {
        showEditModal(ann);
      }
    } else {
      // Scroll to annotation
      var el = document.querySelector('mark[data-ann-id="' + annId + '"]') ||
               (ann.section_id ? document.getElementById(ann.section_id) : null);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'outline 0.3s';
        el.style.outline = '2px solid var(--accent)';
        setTimeout(function() { el.style.outline = 'none'; }, 1500);
      }
    }
  });

  // === Auto-assign IDs (for markdown-generated pages) ===
  function autoAssignIds() {
    document.querySelectorAll('.container h2, .container h3').forEach(function(h, i) {
      if (h.id) return;
      var slug = (h.textContent || '').trim().toLowerCase()
        .replace(/[^a-z0-9\\uAC00-\\uD7A3\\s]/g, '').replace(/\\s+/g, '-').slice(0, 40);
      h.id = 'section-' + (slug || i);
      var parent = h.closest('section, article, div');
      if (parent && !parent.id) parent.dataset.sectionId = h.id;
    });
  }

  // === Init ===
  function init() {
    autoAssignIds();
    API.list().then(function(list) {
      annotations = list;
      restoreHighlights();
      injectSectionActions();
      updateSidebar();
    }).catch(function(err) {
      console.warn('Annotation system unavailable:', err.message);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();`;
}

// ---------------------------------------------------------------------------
// Main structured generator
// ---------------------------------------------------------------------------

export function generateDossierHTML(content: DossierHTMLContent): string {
  const {
    title, date, oneLiner, signals, deepDives,
    conceptualToolkit, crossSignalNarrative, openQuestions,
    learningPoints, sources,
  } = content;

  // --- Signal table rows ---
  const signalRows = signals.map((s, i) => `
        <tr id="signal-row-${i}">
          <td class="signal-name">${escapeHTML(s.name)}</td>
          <td>${typeBadge(s.type)}</td>
          <td>${strengthBadge(s.strength)}</td>
          <td>${escapeHTML(s.summary)}</td>
        </tr>`).join('');

  // --- Deep dives ---
  const deepDiveBlocks = deepDives.map((d, i) => `
      <div class="deep-dive" id="deep-dive-${i}">
        <h3>${escapeHTML(d.title)}</h3>
        ${markdownBlockToHTML(d.content)}
      </div>`).join('\n<div class="section-divider"></div>\n');

  // --- Toolkit cards ---
  const toolkitCards = conceptualToolkit.map((c, i) => `
        <div class="toolkit-card" id="toolkit-card-${i}">
          <h4>${escapeHTML(c.concept)}</h4>
          <p>${inlineMarkdown(c.description)}</p>
        </div>`).join('');

  // --- Open questions ---
  const oqItems = openQuestions.map(q =>
    `<li>${inlineMarkdown(q)}</li>`).join('\n          ');

  // --- Learning points ---
  const lpItems = learningPoints.map(l =>
    `<li>${inlineMarkdown(l)}</li>`).join('\n          ');

  // --- Sources ---
  const sourceItems = sources.map(s =>
    `<li><a href="${escapeHTML(s.url)}" target="_blank" rel="noopener">${escapeHTML(s.title)}</a></li>`).join('\n          ');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Serif+KR:wght@400;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <style>${getCSS()}</style>
</head>
<body>
  <div class="container">

    <!-- Header -->
    <header class="dossier-header">
      <div class="dossier-meta">Frontier AI Signal Swarm &middot; ${escapeHTML(date)}</div>
      <h1>${escapeHTML(title)}</h1>
      <p class="one-liner">${inlineMarkdown(oneLiner)}</p>
    </header>

    <!-- Signal Summary Table -->
    <section>
      <h2>시그널 요약</h2>
      <table class="signal-table">
        <thead>
          <tr>
            <th>시그널</th>
            <th>유형</th>
            <th>강도</th>
            <th>요약</th>
          </tr>
        </thead>
        <tbody>
          ${signalRows}
        </tbody>
      </table>
    </section>

    <!-- Deep Dives -->
    <section>
      <h2>심층 탐구</h2>
      ${deepDiveBlocks}
    </section>

    <!-- Conceptual Toolkit -->
    <section>
      <h2>이번 주 개념 도구</h2>
      <div class="toolkit-grid">
        ${toolkitCards}
      </div>
    </section>

    <!-- Cross-Signal Narrative -->
    <section id="cross-signal">
      <h2>시그널 간 연결</h2>
      ${markdownBlockToHTML(crossSignalNarrative)}
    </section>

    <!-- Open Questions -->
    <div class="open-questions" id="open-questions">
      <h2>열린 질문들</h2>
      <ol>
          ${oqItems}
      </ol>
    </div>

    <!-- Learning Points -->
    <section id="learning-points">
      <h2>이번 주 학습 포인트</h2>
      <ul class="learning-points">
          ${lpItems}
      </ul>
    </section>

    <!-- Sources -->
    <section>
      <h2>참고 소스</h2>
      <ul class="sources-list">
          ${sourceItems}
      </ul>
    </section>

    <!-- Footer -->
    <footer class="dossier-footer">
      <span class="brand">Frontier AI Signal Swarm</span> &mdash; AI 트렌드 인텔리전스 엔진
    </footer>

  </div>

  <!-- PDF Download Button -->
  <button class="pdf-download-btn" onclick="window.print()" title="PDF로 저장">
    <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
    PDF 저장
  </button>

  <script>${getAnnotationJS()}</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Full markdown-to-HTML converter
// ---------------------------------------------------------------------------

/**
 * Convert a full markdown string to HTML.
 * Handles headings, bold, italic, bullet/numbered lists, inline code,
 * fenced code blocks, links, blockquotes, horizontal rules, and tables.
 */
function convertMarkdownToHTML(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];

  let i = 0;

  // helper: are we in a list?
  let inUl = false;
  let inOl = false;

  function closeUl() { if (inUl) { out.push('</ul>'); inUl = false; } }
  function closeOl() { if (inOl) { out.push('</ol>'); inOl = false; } }
  function closeLists() { closeUl(); closeOl(); }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // --- fenced code block ---
    if (trimmed.startsWith('```')) {
      closeLists();
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const codeContent = escapeHTML(codeLines.join('\n'));
      out.push(`<pre><code${lang ? ` class="language-${escapeHTML(lang)}"` : ''}>${codeContent}</code></pre>`);
      continue;
    }

    // --- empty line ---
    if (!trimmed) {
      closeLists();
      i++;
      continue;
    }

    // --- horizontal rule ---
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
      closeLists();
      out.push('<hr>');
      i++;
      continue;
    }

    // --- table ---
    if (trimmed.includes('|') && i + 1 < lines.length && /^\|?\s*[-:]+/.test(lines[i + 1].trim())) {
      closeLists();
      // parse header
      const headerCells = parsePipeRow(trimmed);
      // skip separator
      i += 2;
      // collect body rows
      const bodyRows: string[][] = [];
      while (i < lines.length && lines[i].trim().includes('|')) {
        const trimmedRow = lines[i].trim();
        if (!trimmedRow || /^[-:|]+$/.test(trimmedRow.replace(/\s/g, ''))) { i++; continue; }
        bodyRows.push(parsePipeRow(trimmedRow));
        i++;
      }
      out.push('<table>');
      out.push('<thead><tr>');
      for (const cell of headerCells) {
        out.push(`<th>${inlineMarkdown(cell)}</th>`);
      }
      out.push('</tr></thead>');
      out.push('<tbody>');
      for (const row of bodyRows) {
        out.push('<tr>');
        for (const cell of row) {
          out.push(`<td>${inlineMarkdown(cell)}</td>`);
        }
        out.push('</tr>');
      }
      out.push('</tbody></table>');
      continue;
    }

    // --- headings ---
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)/);
    if (headingMatch) {
      closeLists();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      out.push(`<h${level}>${inlineMarkdown(text)}</h${level}>`);
      i++;
      continue;
    }

    // --- blockquote ---
    if (trimmed.startsWith('> ')) {
      closeLists();
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        bqLines.push(lines[i].trim().slice(2));
        i++;
      }
      out.push(`<blockquote><p>${inlineMarkdown(bqLines.join(' '))}</p></blockquote>`);
      continue;
    }

    // --- unordered list ---
    if (/^[-*]\s/.test(trimmed)) {
      closeOl();
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${inlineMarkdown(trimmed.replace(/^[-*]\s/, ''))}</li>`);
      i++;
      continue;
    }

    // --- ordered list ---
    if (/^\d+\.\s/.test(trimmed)) {
      closeUl();
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push(`<li>${inlineMarkdown(trimmed.replace(/^\d+\.\s/, ''))}</li>`);
      i++;
      continue;
    }

    // --- paragraph ---
    closeLists();
    const paraLines: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('> ') &&
      !/^[-*]\s/.test(lines[i].trim()) &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !/^(-{3,}|_{3,}|\*{3,})$/.test(lines[i].trim()) &&
      !(lines[i].trim().includes('|') && i + 1 < lines.length && /^\|?\s*[-:]+/.test((lines[i + 1] || '').trim()))
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    out.push(`<p>${inlineMarkdown(paraLines.join(' '))}</p>`);
  }

  closeLists();
  return out.join('\n');
}

function parsePipeRow(line: string): string[] {
  // Split on | and trim; ignore leading/trailing empty cells from outer pipes
  const parts = line.split('|').map(s => s.trim());
  // Remove leading/trailing empty strings from outer pipes
  if (parts.length > 0 && parts[0] === '') parts.shift();
  if (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
  return parts;
}

// ---------------------------------------------------------------------------
// Wrap raw markdown in editorial HTML
// ---------------------------------------------------------------------------

export function wrapMarkdownInHTML(markdownContent: string, title: string, date: string): string {
  // Strip the leading markdown title and date metadata lines to avoid
  // duplication — the HTML header already renders title and date.
  let stripped = markdownContent;
  // Remove leading # heading
  stripped = stripped.replace(/^#\s+[^\n]*\n*/, '');
  // Remove **날짜:** and **분석 기간:** lines that follow
  stripped = stripped.replace(/^\*\*날짜:\*\*[^\n]*\n*/m, '');
  stripped = stripped.replace(/^\*\*분석 기간:\*\*[^\n]*\n*/m, '');
  // Remove leading --- separator
  stripped = stripped.replace(/^---\n*/, '');

  const htmlBody = convertMarkdownToHTML(stripped.trim());

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Serif+KR:wght@400;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <style>${getCSS()}</style>
</head>
<body>
  <div class="container">

    <header class="dossier-header">
      <div class="dossier-meta">Frontier AI Signal Swarm &middot; ${escapeHTML(date)}</div>
      <h1>${escapeHTML(title)}</h1>
    </header>

    <article>
      ${htmlBody}
    </article>

    <footer class="dossier-footer">
      <span class="brand">Frontier AI Signal Swarm</span> &mdash; AI 트렌드 인텔리전스 엔진
    </footer>

  </div>

  <!-- PDF Download Button -->
  <button class="pdf-download-btn" onclick="window.print()" title="PDF로 저장">
    <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
    PDF 저장
  </button>

  <script>${getAnnotationJS()}</script>
</body>
</html>`;
}
