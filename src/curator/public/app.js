/**
 * Curator Workspace — app.js
 * Vanilla JS, no build step, no framework.
 * Handles all three pages: Feed, Memos, Sources.
 */

'use strict';

/* ============================================================
   CONFIG & CONSTANTS
   ============================================================ */

const API_BASE = '';
const PAGE_SIZE = 20;

/* ============================================================
   API HELPERS
   ============================================================ */

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const defaults = {
    headers: { 'Content-Type': 'application/json' },
  };
  const config = Object.assign({}, defaults, options);
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(url, config);
  if (!res.ok) {
    const msg = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const api = {
  get:    (path)         => apiFetch(path, { method: 'GET' }),
  post:   (path, body)   => apiFetch(path, { method: 'POST', body }),
  patch:  (path, body)   => apiFetch(path, { method: 'PATCH', body }),
  delete: (path)         => apiFetch(path, { method: 'DELETE' }),
};


/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */

function showToast(message, type = 'default', duration = 2800) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('visible'));
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 250);
  }, duration);
}


/* ============================================================
   UTILITY HELPERS
   ============================================================ */

function relativeTime(isoString) {
  if (!isoString) return '';
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60)    return '방금 전';
  if (diff < 3600)  return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

  return new Date(isoString).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function formatDatetime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(str, maxLen = 180) {
  if (!str || str.length <= maxLen) return str || '';
  return str.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

/**
 * Simple markdown renderer for memo bodies.
 * Handles: bold, italic, inline code, links, headings, lists.
 */
function renderMarkdown(text) {
  if (!text) return '';

  // Escape HTML first
  let html = escapeHtml(text);

  // Headings (### ## #)
  html = html.replace(/^### (.+)$/gm, '<strong style="font-size:0.95em">$1</strong>');
  html = html.replace(/^## (.+)$/gm,  '<strong>$1</strong>');
  html = html.replace(/^# (.+)$/gm,   '<strong>$1</strong>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  );

  // Unordered lists (- or *)
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)(?=\n<li>|$)/gs, '<ul>$1</ul>');

  // Line breaks: double newline → paragraph break
  html = html
    .split(/\n{2,}/)
    .map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<ul>') || trimmed.startsWith('<li>')) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');

  return html;
}

/**
 * Determine trust bar color class from score (0–1).
 */
function trustClass(score) {
  if (score < 0.35) return 'low';
  if (score < 0.65) return 'mid';
  return 'high';
}

/**
 * Get display label for status.
 */
function statusLabel(status) {
  const labels = {
    unread:     '안 읽음',
    read:       '읽음',
    bookmarked: '북마크',
    dismissed:  '무시됨',
  };
  return labels[status] || status;
}


/* ============================================================
   NAV STATS
   ============================================================ */

async function loadNavStats() {
  const el = document.getElementById('nav-stats');
  if (!el) return;

  try {
    const stats = await api.get('/api/stats');
    el.innerHTML = `
      <div class="nav-stat">
        <div class="nav-stat-dot"></div>
        <span class="nav-stat-count">${stats.unread ?? 0}</span>
        <span>안 읽음</span>
      </div>
      <div class="nav-stat">
        <span class="nav-stat-count">${stats.total ?? 0}</span>
        <span>전체</span>
      </div>
    `;
  } catch (_) {
    // Stats are non-critical; fail silently
  }
}


/* ============================================================
   FEED PAGE
   ============================================================ */

let currentFilter = 'all';
let currentPage   = 1;
let totalPages    = 1;
let feedCounts    = { all: 0, unread: 0, bookmarked: 0, dismissed: 0 };

async function loadFeed(filter = currentFilter, page = 1) {
  const listEl = document.getElementById('feed-list');
  if (!listEl) return;

  currentFilter = filter;
  currentPage   = page;

  listEl.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <div>불러오는 중...</div>
    </div>
  `;

  try {
    const params = new URLSearchParams({ limit: PAGE_SIZE });
    const offset = (page - 1) * PAGE_SIZE;
    if (offset > 0) params.set('offset', offset);

    if (filter === 'dossier') {
      params.set('found_by', 'dossier');
    } else if (filter && filter !== 'all') {
      params.set('status', filter);
    }

    const data = await api.get(`/api/feed?${params}`);
    const items = data.items || [];
    totalPages = data.totalPages || 1;

    // Update counts from response meta
    if (data.counts) {
      feedCounts = { ...feedCounts, ...data.counts };
      updateFilterCounts();
    }

    renderFeedList(items, listEl);
    renderPagination();
  } catch (err) {
    listEl.innerHTML = `
      <div class="error-state">
        <div>피드를 불러오지 못했습니다</div>
        <div class="error-state-msg">${escapeHtml(err.message)}</div>
      </div>
    `;
  }
}

function renderFeedList(items, container) {
  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-title">아직 아이템이 없습니다</div>
        <div class="empty-state-desc">위의 입력창에 링크를 붙여넣어 추가하거나,<br>AI가 수집해 오기를 기다려 보세요.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(renderFeedItem).join('');
}

function renderFeedItem(item) {
  const statusClass    = item.status || 'unread';
  const foundByLabel   = item.found_by === 'ai' ? '🤖 AI'
                       : item.found_by === 'dossier' ? '📋 도시에'
                       : '👤 직접';
  const foundByClass   = item.found_by === 'ai' ? 'ai'
                       : item.found_by === 'dossier' ? 'dossier'
                       : 'curator';

  // Dossier metadata badges
  const signalBadgeHtml = (item.item_type === 'signal' && item.signal_strength)
    ? `<span class="signal-strength-badge strength-${escapeHtml(item.signal_strength)}">${escapeHtml(item.signal_strength)}</span>`
    : '';
  const signalTypeBadgeHtml = (item.item_type === 'signal' && item.signal_type)
    ? `<span class="signal-type-badge">${escapeHtml(item.signal_type)}</span>`
    : '';
  const itemTypeBadgeHtml = (item.item_type === 'deep_dive')
    ? `<span class="item-type-badge deep-dive">심층 탐구</span>`
    : '';

  const timeLabel      = relativeTime(item.created_at);
  const sourceDisplay  = escapeHtml(item.source_origin || '');
  const titleDisplay   = escapeHtml(item.title || item.url || '(제목 없음)');
  const summaryDisplay = escapeHtml(item.summary || '');
  const analysisHtml   = item.analysis
    ? `<div class="card-section">
        <div class="card-section-label">분석</div>
        <div class="card-analysis">${escapeHtml(item.analysis)}</div>
       </div>`
    : '';
  const whyHtml        = item.why_picked
    ? `<div class="why-picked">${escapeHtml(item.why_picked)}</div>`
    : '';

  const isRead       = item.status === 'read'       || item.status === 'bookmarked';
  const isBookmarked = item.status === 'bookmarked';
  const isDismissed  = item.status === 'dismissed';

  const memoChips = (item.memo_ids && item.memo_ids.length > 0)
    ? `<div class="card-memos">
        ${item.memo_ids.slice(0, 3).map(id =>
          `<div class="card-memo-chip" data-memo-id="${escapeHtml(id)}">메모 ${escapeHtml(id.slice(0, 6))}…</div>`
        ).join('')}
       </div>`
    : '';

  const dossierChips = (item.dossier_ids && item.dossier_ids.length > 0)
    ? `<div class="card-dossiers">
        ${item.dossier_ids.map(id =>
          `<a href="/output/${escapeHtml(id)}.html" class="card-dossier-chip" target="_blank" rel="noopener">📋 도시에</a>`
        ).join('')}
       </div>`
    : '';

  return `
    <div class="feed-card status-${escapeHtml(statusClass)}" data-id="${escapeHtml(item.id)}" data-found-by="${escapeHtml(item.found_by || '')}" role="listitem">
      <div class="card-header" onclick="toggleCard(this)" style="cursor:pointer">
        <div class="card-header-left">
          <div class="status-dot ${escapeHtml(statusClass)}" title="${statusLabel(statusClass)}"></div>
          <div style="flex:1;min-width:0">
            <div class="card-meta-row">
              ${sourceDisplay ? `<span class="source-badge" title="${sourceDisplay}">${sourceDisplay}</span>` : ''}
              <span class="found-by-badge ${foundByClass}">${foundByLabel}</span>
              ${signalBadgeHtml}
              ${signalTypeBadgeHtml}
              ${itemTypeBadgeHtml}
            </div>
            <div class="card-title">
              <a href="${escapeHtml(item.url || '#')}" target="_blank" rel="noopener" onclick="markRead('${escapeHtml(item.id)}', event); event.stopPropagation();">
                ${titleDisplay}
              </a>
            </div>
          </div>
        </div>
        <div class="card-header-right">
          <span class="card-time" title="${formatDatetime(item.created_at)}">${timeLabel}</span>
          <span class="card-chevron">▾</span>
        </div>
      </div>

      ${summaryDisplay ? `<div class="card-summary">${summaryDisplay}</div>` : ''}

      <div class="card-body">
        <div class="card-body-inner">
          ${analysisHtml}
          ${whyHtml}
          ${memoChips}
          ${dossierChips}

          <div class="card-actions">
            <button
              class="card-action action-read${isRead ? ' active' : ''}"
              onclick="updateStatus('${escapeHtml(item.id)}', 'read')"
              title="읽음으로 표시"
            >읽음</button>
            <button
              class="card-action action-bookmark${isBookmarked ? ' active' : ''}"
              onclick="updateStatus('${escapeHtml(item.id)}', 'bookmarked')"
              title="북마크"
            >★ 북마크</button>
            <button
              class="card-action action-dismiss${isDismissed ? ' active' : ''}"
              onclick="updateStatus('${escapeHtml(item.id)}', 'dismissed')"
              title="무시"
            >무시</button>
            <button
              class="card-action action-memo"
              onclick="toggleInlineMemo('${escapeHtml(item.id)}')"
              title="메모 달기"
            >메모</button>
          </div>

          <!-- Inline memo area (hidden by default) -->
          <div class="inline-memo" id="inline-memo-${escapeHtml(item.id)}">
            <textarea
              id="memo-text-${escapeHtml(item.id)}"
              placeholder="이 아이템에 대한 생각을 적어보세요... 마크다운 지원"
              rows="3"
            ></textarea>
            <div class="inline-memo-actions">
              <button class="btn-secondary" onclick="toggleInlineMemo('${escapeHtml(item.id)}')">취소</button>
              <button class="btn-primary" onclick="addMemoToItem('${escapeHtml(item.id)}')">저장</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function addLink() {
  const urlInput     = document.getElementById('url-input');
  const titleInput   = document.getElementById('title-input');
  const thoughtInput = document.getElementById('thought-input');
  const addBtn       = document.getElementById('add-btn');

  const url = (urlInput?.value || '').trim();
  if (!url) { showToast('URL을 입력해 주세요', 'error'); return; }

  addBtn.disabled = true;
  addBtn.textContent = '추가 중...';

  try {
    await api.post('/api/feed', {
      url,
      title:       (titleInput?.value || '').trim() || undefined,
      why_picked:  (thoughtInput?.value || '').trim() || undefined,
      found_by:    'curator',
    });

    // Clear inputs
    if (urlInput)     urlInput.value = '';
    if (titleInput)   titleInput.value = '';
    if (thoughtInput) thoughtInput.value = '';
    addBtn.disabled = true;

    showToast('추가되었습니다', 'success');
    await loadFeed('all', 1);
    setActiveFilter('all');
  } catch (err) {
    showToast(`오류: ${err.message}`, 'error');
  } finally {
    addBtn.textContent = '추가';
  }
}

async function markRead(id, event) {
  // Don't block the link navigation
  const card = document.querySelector(`[data-id="${id}"]`);
  if (card && card.dataset.status === 'unread') {
    await updateStatus(id, 'read', false);
  }
}

async function updateStatus(id, newStatus, reload = true) {
  try {
    await api.patch(`/api/feed/${id}`, { status: newStatus });
    if (reload) {
      await loadFeed(currentFilter, currentPage);
      await loadNavStats();
      // Refresh learning panel on bookmark/dismiss (feedback actions)
      if (newStatus === 'bookmarked' || newStatus === 'dismissed') {
        loadLearningPanel();
      }
    }
  } catch (err) {
    showToast(`상태 변경 실패: ${err.message}`, 'error');
  }
}

function toggleCard(header) {
  const card = header.closest('.feed-card');
  if (!card) return;
  card.classList.toggle('expanded');
}

function toggleInlineMemo(feedItemId) {
  const memoDiv = document.getElementById(`inline-memo-${feedItemId}`);
  if (!memoDiv) return;

  const isVisible = memoDiv.classList.contains('visible');
  // Close all open inline memos first
  document.querySelectorAll('.inline-memo.visible').forEach(el => el.classList.remove('visible'));

  if (!isVisible) {
    memoDiv.classList.add('visible');
    const textarea = document.getElementById(`memo-text-${feedItemId}`);
    if (textarea) textarea.focus();
  }
}

async function addMemoToItem(feedItemId) {
  const textarea = document.getElementById(`memo-text-${feedItemId}`);
  const content = (textarea?.value || '').trim();

  if (!content) { showToast('내용을 입력해 주세요', 'error'); return; }

  try {
    await api.post('/api/memos', {
      content,
      feed_item_ids: [feedItemId],
    });

    showToast('메모가 저장되었습니다', 'success');
    toggleInlineMemo(feedItemId);
    await loadFeed(currentFilter, currentPage);
  } catch (err) {
    showToast(`메모 저장 실패: ${err.message}`, 'error');
  }
}

function updateFilterCounts() {
  ['all', 'unread', 'bookmarked', 'dismissed'].forEach(key => {
    const el = document.getElementById(`count-${key}`);
    if (el && feedCounts[key] !== undefined) {
      el.textContent = feedCounts[key];
    }
  });
}

function setActiveFilter(filter) {
  document.querySelectorAll('.filter-tab').forEach(btn => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  currentFilter = filter;
}

function renderPagination() {
  const el = document.getElementById('pagination');
  if (!el) return;

  if (totalPages <= 1) {
    el.innerHTML = '';
    return;
  }

  const pages = [];

  // Prev button
  pages.push(`
    <button class="page-btn" ${currentPage <= 1 ? 'disabled' : ''}
      onclick="loadFeed('${currentFilter}', ${currentPage - 1})"
    >←</button>
  `);

  // Page numbers (compact: show up to 5 around current)
  const range = [];
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    range.push(i);
  }

  if (range[0] > 1) {
    pages.push(`<button class="page-btn" onclick="loadFeed('${currentFilter}', 1)">1</button>`);
    if (range[0] > 2) pages.push(`<span class="page-info">…</span>`);
  }

  range.forEach(p => {
    pages.push(`
      <button class="page-btn${p === currentPage ? ' active' : ''}"
        onclick="loadFeed('${currentFilter}', ${p})"
      >${p}</button>
    `);
  });

  if (range[range.length - 1] < totalPages) {
    if (range[range.length - 1] < totalPages - 1) pages.push(`<span class="page-info">…</span>`);
    pages.push(`<button class="page-btn" onclick="loadFeed('${currentFilter}', ${totalPages})">${totalPages}</button>`);
  }

  // Next button
  pages.push(`
    <button class="page-btn" ${currentPage >= totalPages ? 'disabled' : ''}
      onclick="loadFeed('${currentFilter}', ${currentPage + 1})"
    >→</button>
  `);

  el.innerHTML = pages.join('');
}

/* ============================================================
   LEARNING PANEL
   ============================================================ */

async function loadLearningPanel() {
  const body = document.getElementById('learning-body');
  const hint = document.getElementById('learning-hint');
  if (!body) return;

  try {
    const data = await api.get('/api/brief');
    const profile = data.profile;
    if (!profile) { body.innerHTML = '<div class="learning-empty">프로필 없음</div>'; return; }

    // Sort domains by weight
    const domains = Object.entries(profile.interests.domains || {})
      .sort(([, a], [, b]) => b - a);

    const connections = profile.learned_patterns?.connections || [];
    const likes = profile.learned_patterns?.likes || [];
    const dislikes = profile.learned_patterns?.dislikes || [];

    // Hint text in summary
    const topDomains = domains.slice(0, 3).map(([k]) => k).join(', ');
    if (hint) hint.textContent = topDomains ? `${topDomains}` : '';

    let html = '';

    // Domain weights
    html += '<div class="learning-section">';
    html += '<div class="learning-section-label">관심 도메인</div>';
    html += '<div class="domain-bars">';
    for (const [domain, weight] of domains) {
      const pct = Math.round(weight * 100);
      const barClass = pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low';
      html += `
        <div class="domain-bar-row">
          <span class="domain-bar-name">${escapeHtml(domain)}</span>
          <div class="domain-bar-track">
            <div class="domain-bar-fill ${barClass}" style="width:${pct}%"></div>
          </div>
          <span class="domain-bar-pct">${pct}%</span>
        </div>
      `;
    }
    html += '</div></div>';

    // Recent interests (connections)
    if (connections.length > 0) {
      html += '<div class="learning-section">';
      html += '<div class="learning-section-label">최근 북마크 주제</div>';
      html += '<div class="learning-chips">';
      for (const topic of connections.slice(-8).reverse()) {
        html += `<span class="learning-chip bookmark">${escapeHtml(topic)}</span>`;
      }
      html += '</div></div>';
    }

    // Likes / Dislikes
    if (likes.length > 0 || dislikes.length > 0) {
      html += '<div class="learning-section">';
      html += '<div class="learning-section-label">학습된 선호</div>';
      html += '<div class="learning-prefs">';
      if (likes.length > 0) {
        html += '<div class="learning-pref-group">';
        html += '<span class="pref-label like">선호</span>';
        html += likes.map(l => `<span class="learning-chip like">${escapeHtml(l)}</span>`).join('');
        html += '</div>';
      }
      if (dislikes.length > 0) {
        html += '<div class="learning-pref-group">';
        html += '<span class="pref-label dislike">비선호</span>';
        html += dislikes.map(d => `<span class="learning-chip dislike">${escapeHtml(d)}</span>`).join('');
        html += '</div>';
      }
      html += '</div></div>';
    }

    // Meta
    const depth = profile.interests.depth_preference || '-';
    const hype = profile.interests.hype_sensitivity || '-';
    html += `<div class="learning-meta">깊이: ${escapeHtml(depth)} · 과대포장 민감도: ${escapeHtml(hype)}</div>`;

    body.innerHTML = html;
  } catch (err) {
    body.innerHTML = `<div class="learning-empty">학습 데이터를 불러올 수 없습니다</div>`;
  }
}

function initFeedPage() {
  // Filter tab click handlers
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      setActiveFilter(filter);
      loadFeed(filter, 1);
    });
  });

  // URL input — enable add button when URL is present
  const urlInput = document.getElementById('url-input');
  const addBtn   = document.getElementById('add-btn');

  if (urlInput && addBtn) {
    urlInput.addEventListener('input', () => {
      addBtn.disabled = !urlInput.value.trim();
    });

    // Enter key shortcut on URL input
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && urlInput.value.trim()) addLink();
    });
  }

  loadFeed('all', 1);
  loadNavStats();
  loadLearningPanel();
}


/* ============================================================
   MEMOS PAGE
   ============================================================ */

let allMemos   = [];
let memoSearch = '';

async function loadMemos() {
  const timelineEl = document.getElementById('memo-timeline');
  if (!timelineEl) return;

  try {
    const data  = await api.get('/api/memos');
    allMemos    = (data.memos || data || []).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    renderMemoTimeline();
  } catch (err) {
    timelineEl.innerHTML = `
      <div class="error-state">
        <div>메모를 불러오지 못했습니다</div>
        <div class="error-state-msg">${escapeHtml(err.message)}</div>
      </div>
    `;
  }
}

function renderMemoTimeline() {
  const timelineEl = document.getElementById('memo-timeline');
  const countEl    = document.getElementById('memo-count');
  if (!timelineEl) return;

  const query    = memoSearch.toLowerCase();
  const filtered = query
    ? allMemos.filter(m => m.content.toLowerCase().includes(query))
    : allMemos;

  if (countEl) {
    countEl.textContent = filtered.length
      ? `총 ${filtered.length}개${query ? ` (검색: "${memoSearch}")` : ''}`
      : '';
  }

  if (!filtered.length) {
    timelineEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-title">${query ? '검색 결과가 없습니다' : '아직 메모가 없습니다'}</div>
        <div class="empty-state-desc">${query ? '다른 검색어를 입력해 보세요.' : '위에서 첫 번째 메모를 작성해 보세요.'}</div>
      </div>
    `;
    return;
  }

  timelineEl.innerHTML = filtered.map(renderMemo).join('');
}

function renderMemo(memo) {
  const renderedBody = renderMarkdown(memo.content);
  const timeLabel    = relativeTime(memo.created_at);
  const fullDate     = formatDatetime(memo.created_at);

  const linkedItemsHtml = (memo.feed_item_ids && memo.feed_item_ids.length > 0)
    ? `<div class="memo-linked-items">
        ${memo.feed_item_ids.map(id =>
          `<span class="linked-item-chip" title="피드 아이템 연결됨">🔗 ${escapeHtml(id.slice(0, 8))}…</span>`
        ).join('')}
       </div>`
    : '';

  return `
    <div class="memo-entry" data-id="${escapeHtml(memo.id)}">
      <div class="memo-timeline-dot" title="${fullDate}"></div>
      <div class="memo-entry-inner">
        <div class="memo-card">
          <div class="memo-timestamp" title="${fullDate}">${timeLabel}</div>
          <div class="memo-body">${renderedBody}</div>
          ${linkedItemsHtml}
          <div class="memo-card-actions">
            <button class="btn-secondary" onclick="deleteMemo('${escapeHtml(memo.id)}')">삭제</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function addMemo() {
  const textarea = document.getElementById('memo-textarea');
  const saveBtn  = document.getElementById('save-memo-btn');
  const content  = (textarea?.value || '').trim();

  if (!content) { showToast('내용을 입력해 주세요', 'error'); return; }

  saveBtn.disabled    = true;
  saveBtn.textContent = '저장 중...';

  try {
    await api.post('/api/memos', { content, feed_item_ids: [] });
    textarea.value      = '';
    saveBtn.disabled    = true;
    saveBtn.textContent = '메모 저장';
    showToast('메모가 저장되었습니다', 'success');
    await loadMemos();
  } catch (err) {
    showToast(`오류: ${err.message}`, 'error');
  } finally {
    saveBtn.disabled    = false;
    saveBtn.textContent = '메모 저장';
  }
}

async function deleteMemo(id) {
  if (!confirm('이 메모를 삭제하시겠습니까?')) return;

  try {
    await api.delete(`/api/memos/${id}`);
    allMemos = allMemos.filter(m => m.id !== id);
    renderMemoTimeline();
    showToast('삭제되었습니다');
  } catch (err) {
    showToast(`삭제 실패: ${err.message}`, 'error');
  }
}

function initMemosPage() {
  const textarea = document.getElementById('memo-textarea');
  const saveBtn  = document.getElementById('save-memo-btn');
  const searchEl = document.getElementById('memo-search');

  if (textarea && saveBtn) {
    textarea.addEventListener('input', () => {
      saveBtn.disabled = !textarea.value.trim();
    });

    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        addMemo();
      }
    });
  }

  if (searchEl) {
    let searchDebounce;
    searchEl.addEventListener('input', () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        memoSearch = searchEl.value.trim();
        renderMemoTimeline();
      }, 200);
    });
  }

  loadMemos();
  loadNavStats();
}


/* ============================================================
   SOURCES PAGE
   ============================================================ */

let allSources = [];

async function loadSources() {
  const container = document.getElementById('sources-container');
  if (!container) return;

  try {
    const data = await api.get('/api/sources');
    allSources  = data.sources || data || [];
    renderSources();
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <div>소스를 불러오지 못했습니다</div>
        <div class="error-state-msg">${escapeHtml(err.message)}</div>
      </div>
    `;
  }
}

function renderSources() {
  const container = document.getElementById('sources-container');
  if (!container) return;

  const active    = allSources.filter(s => s.status === 'active');
  const suggested = allSources.filter(s => s.status === 'suggested');
  const inactive  = allSources.filter(s => s.status === 'inactive');

  let html = '';

  if (active.length) {
    html += `
      <div class="source-section">
        <div class="source-section-title">활성 (${active.length})</div>
        <div class="source-list">
          ${active.map(renderSource).join('')}
        </div>
      </div>
    `;
  }

  if (suggested.length) {
    html += `
      <div class="source-section">
        <div class="source-section-title">제안됨 (${suggested.length})</div>
        <div class="source-list">
          ${suggested.map(renderSource).join('')}
        </div>
      </div>
    `;
  }

  if (inactive.length) {
    html += `
      <div class="source-section">
        <div class="source-section-title">비활성 (${inactive.length})</div>
        <div class="source-list">
          ${inactive.map(renderSource).join('')}
        </div>
      </div>
    `;
  }

  if (!allSources.length) {
    html = `
      <div class="empty-state">
        <div class="empty-state-icon">🌐</div>
        <div class="empty-state-title">소스가 없습니다</div>
        <div class="empty-state-desc">위 폼으로 첫 번째 소스를 추가해 보세요.</div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function renderSource(source) {
  const score      = typeof source.trust_score === 'number' ? source.trust_score : 0;
  const tClass     = trustClass(score);
  const scoreLabel = `${Math.round(score * 100)}%`;
  const barWidth   = `${Math.round(score * 100)}%`;
  const isInactive = source.status === 'inactive';
  const addedLabel = source.added_by === 'system'  ? '시스템'
                   : source.added_by === 'ai'       ? 'AI'
                   : '큐레이터';

  const stats = source.stats || {};
  const noteHtml = source.curator_note
    ? `<div class="source-note">${escapeHtml(source.curator_note)}</div>`
    : '';

  const toggleAction = (source.status === 'active' || source.status === 'suggested')
    ? `<button class="toggle-btn deactivate" onclick="updateSource('${escapeHtml(source.id)}', { status: 'inactive' })">비활성화</button>`
    : `<button class="toggle-btn activate" onclick="updateSource('${escapeHtml(source.id)}', { status: 'active' })">활성화</button>`;

  return `
    <div class="source-card${isInactive ? ' inactive' : ''}" data-id="${escapeHtml(source.id)}">
      <div>
        <div class="source-name">${escapeHtml(source.name || '(이름 없음)')}</div>
        <div class="source-pattern">${escapeHtml(source.url_pattern || '')}</div>

        <div class="trust-bar-wrap">
          <span class="trust-bar-label">신뢰도</span>
          <div class="trust-bar-track">
            <div class="trust-bar-fill ${tClass}" style="width:${barWidth}"></div>
          </div>
          <span class="trust-score-text ${tClass}">${scoreLabel}</span>
        </div>

        <div class="source-stats">
          <span class="source-stat" title="피드에 등장한 횟수">
            수집 <span class="source-stat-value">${stats.times_picked ?? 0}</span>
          </span>
          <span class="source-stat" title="읽은 횟수">
            읽음 <span class="source-stat-value">${stats.times_read ?? 0}</span>
          </span>
          <span class="source-stat" title="메모가 달린 횟수">
            메모 <span class="source-stat-value">${stats.times_memo ?? 0}</span>
          </span>
          <span class="source-stat" title="무시한 횟수">
            무시 <span class="source-stat-value">${stats.times_dismissed ?? 0}</span>
          </span>
        </div>

        ${noteHtml}
      </div>

      <div class="source-actions">
        <span class="added-by-badge">${addedLabel}</span>
        ${toggleAction}
      </div>
    </div>
  `;
}

async function addSource() {
  const nameEl    = document.getElementById('source-name-input');
  const patternEl = document.getElementById('source-pattern-input');
  const noteEl    = document.getElementById('source-note-input');
  const addBtn    = document.getElementById('add-source-btn');

  const name    = (nameEl?.value    || '').trim();
  const pattern = (patternEl?.value || '').trim();
  const note    = (noteEl?.value    || '').trim();

  if (!name || !pattern) {
    showToast('이름과 URL 패턴을 입력해 주세요', 'error');
    return;
  }

  addBtn.disabled    = true;
  addBtn.textContent = '추가 중...';

  try {
    await api.post('/api/sources', {
      name,
      url_pattern:   pattern,
      curator_note:  note || undefined,
      added_by:      'curator',
      status:        'active',
    });

    if (nameEl)    nameEl.value    = '';
    if (patternEl) patternEl.value = '';
    if (noteEl)    noteEl.value    = '';
    addBtn.disabled = true;

    showToast('소스가 추가되었습니다', 'success');
    await loadSources();
  } catch (err) {
    showToast(`오류: ${err.message}`, 'error');
  } finally {
    addBtn.textContent = '소스 추가';
  }
}

async function updateSource(id, updates) {
  try {
    await api.patch(`/api/sources/${id}`, updates);
    // Optimistic update
    allSources = allSources.map(s => s.id === id ? { ...s, ...updates } : s);
    renderSources();
    showToast('업데이트되었습니다');
  } catch (err) {
    showToast(`업데이트 실패: ${err.message}`, 'error');
    await loadSources(); // Re-sync on error
  }
}

function initSourcesPage() {
  const nameEl    = document.getElementById('source-name-input');
  const patternEl = document.getElementById('source-pattern-input');
  const addBtn    = document.getElementById('add-source-btn');

  function checkAddable() {
    if (addBtn) {
      addBtn.disabled = !(nameEl?.value.trim() && patternEl?.value.trim());
    }
  }

  nameEl?.addEventListener('input', checkAddable);
  patternEl?.addEventListener('input', checkAddable);

  loadSources();
  loadNavStats();
}


/* ============================================================
   DOSSIERS PAGE
   ============================================================ */

async function loadDossiers() {
  const listEl = document.getElementById('dossier-list');
  if (!listEl) return;

  try {
    const data = await api.get('/api/dossiers');
    const dossiers = data.dossiers || [];
    renderDossierList(dossiers, listEl);
  } catch (err) {
    listEl.innerHTML = `
      <div class="error-state">
        <div>도시에를 불러오지 못했습니다</div>
        <div class="error-state-msg">${escapeHtml(err.message)}</div>
      </div>
    `;
  }
}

function renderDossierList(dossiers, container) {
  if (!dossiers.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">&#x1F4CB;</div>
        <div class="empty-state-title">아직 도시에가 없습니다</div>
        <div class="empty-state-desc">
          터미널에서 Claude Code에게 분석을 요청하세요:<br>
          <code style="display:inline-block;margin-top:0.5rem;padding:0.4rem 0.8rem;background:var(--code-bg);border-radius:4px;font-size:0.85rem">"최신 AI 뉴스 분석해줘"</code>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = dossiers.map(renderDossierCard).join('');
}

function renderDossierCard(dossier) {
  const sizeKb = Math.round(dossier.size / 1024);

  let title = dossier.title || dossier.id;
  if (title === dossier.id) {
    title = title
      .replace(/^dossier-/, '')
      .replace(/^\d{4}-\d{2}-\d{2}-?/, '')
      .replace(/-/g, ' ')
      .trim();
    if (!title) title = `${dossier.date} 도시에`;
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  const oneLinerHtml = dossier.one_liner
    ? `<div class="dossier-card-oneliner">${escapeHtml(dossier.one_liner)}</div>`
    : '';

  const feedCount = (dossier.feed_item_ids || []).length;
  const memoCount = (dossier.memo_ids || []).length;
  const sourceCount = (dossier.source_urls || []).length;

  const linkBadges = [];
  if (sourceCount > 0) linkBadges.push(`소스 ${sourceCount}`);
  if (feedCount > 0) linkBadges.push(`피드 ${feedCount}`);
  if (memoCount > 0) linkBadges.push(`메모 ${memoCount}`);

  const badgesHtml = linkBadges.length > 0
    ? `<div class="dossier-link-badges">${linkBadges.map(b => `<span class="dossier-link-badge">${b}</span>`).join('')}</div>`
    : dossier.linked ? '' : '<div class="dossier-link-badges"><span class="dossier-link-badge unlinked">연결 없음</span></div>';

  return `
    <a href="${escapeHtml(dossier.url)}" class="dossier-card${dossier.linked ? ' linked' : ''}" target="_blank" rel="noopener">
      <div class="dossier-card-inner">
        <div class="dossier-card-date">${escapeHtml(dossier.date)}</div>
        <div class="dossier-card-title">${escapeHtml(title)}</div>
        ${oneLinerHtml}
        ${badgesHtml}
        <div class="dossier-card-meta">
          <span>${sizeKb} KB</span>
          <span>HTML</span>
        </div>
      </div>
      <div class="dossier-card-arrow">→</div>
    </a>
  `;
}

function initDossiersPage() {
  loadDossiers();
  loadNavStats();
}


/* ============================================================
   ROUTER — init correct page on DOMContentLoaded
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  // Normalize: /index.html and / both lead to feed
  if (path === '/' || path === '/index.html' || path.endsWith('/') && !path.includes('memos') && !path.includes('sources') && !path.includes('dossiers')) {
    initFeedPage();
  } else if (path.includes('dossiers')) {
    initDossiersPage();
  } else if (path.includes('memos')) {
    initMemosPage();
  } else if (path.includes('sources')) {
    initSourcesPage();
  } else {
    // Fallback: try to detect by element presence
    if (document.getElementById('dossier-list'))        initDossiersPage();
    else if (document.getElementById('feed-list'))      initFeedPage();
    else if (document.getElementById('memo-timeline'))  initMemosPage();
    else if (document.getElementById('sources-container')) initSourcesPage();
  }
});
