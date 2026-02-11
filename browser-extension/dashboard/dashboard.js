let allLogs = [];

document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadLogs();

  document.getElementById('filterCategory').addEventListener('change', renderLogs);
  document.getElementById('filterTime').addEventListener('change', renderLogs);
  document.getElementById('filterDomain').addEventListener('input', debounce(renderLogs, 300));

  document.getElementById('exportJsonBtn').addEventListener('click', exportJSON);
  document.getElementById('exportCsvBtn').addEventListener('click', exportCSV);
  document.getElementById('clearLogsBtn').addEventListener('click', clearLogs);
  document.getElementById('nuclearBtn').addEventListener('click', nuclearOption);
}

async function loadLogs() {
  allLogs = await chrome.runtime.sendMessage({ type: 'getLogs', filter: {} }) || [];
  updateSummary();
  renderLogs();
}

function updateSummary() {
  document.getElementById('totalBlocked').textContent = allLogs.length;
  document.getElementById('totalTracking').textContent = allLogs.filter(l => l.category === 'tracking').length;
  document.getElementById('totalFingerprint').textContent = allLogs.filter(l => l.category === 'fingerprint').length;
  document.getElementById('totalPII').textContent = allLogs.filter(l => l.category === 'network' || l.category === 'form').length;
  document.getElementById('totalScripts').textContent = allLogs.filter(l => l.category === 'script').length;

  const domains = new Set(allLogs.map(l => l.domain).filter(Boolean));
  document.getElementById('uniqueDomains').textContent = domains.size;
}

function renderLogs() {
  const category = document.getElementById('filterCategory').value;
  const timeRange = parseInt(document.getElementById('filterTime').value) || 0;
  const domainFilter = document.getElementById('filterDomain').value.toLowerCase();

  let filtered = allLogs;

  if (category) {
    filtered = filtered.filter(l => l.category === category);
  }
  if (timeRange) {
    const since = Date.now() - timeRange;
    filtered = filtered.filter(l => l.timestamp >= since);
  }
  if (domainFilter) {
    filtered = filtered.filter(l => l.domain && l.domain.toLowerCase().includes(domainFilter));
  }

  // Show most recent first
  filtered = [...filtered].reverse();

  const body = document.getElementById('logBody');
  const emptyState = document.getElementById('emptyState');
  const table = document.getElementById('logTable');

  if (filtered.length === 0) {
    table.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  table.style.display = 'table';
  emptyState.style.display = 'none';

  // Render max 500 rows for performance
  const rows = filtered.slice(0, 500);
  body.innerHTML = rows.map(log => `
    <tr>
      <td>${formatTime(log.timestamp)}</td>
      <td><span class="badge badge-${log.category}">${log.category}</span></td>
      <td>${escapeHtml(log.action)}</td>
      <td title="${escapeHtml(log.detail)}">${escapeHtml(truncate(log.detail, 80))}</td>
      <td>${escapeHtml(log.domain || '-')}</td>
    </tr>
  `).join('');
}

function formatTime(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

function truncate(str, len) {
  if (!str) return '-';
  return str.length > len ? str.substring(0, len) + '...' : str;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(allLogs, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `privacy-shield-logs-${Date.now()}.json`);
}

function exportCSV() {
  const headers = ['timestamp', 'category', 'action', 'detail', 'domain', 'tabId'];
  const rows = allLogs.map(l =>
    headers.map(h => `"${String(l[h] || '').replace(/"/g, '""')}"`).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  downloadBlob(blob, `privacy-shield-logs-${Date.now()}.csv`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function clearLogs() {
  if (!confirm('Clear all log entries?')) return;
  await chrome.runtime.sendMessage({ type: 'clearLogs' });
  allLogs = [];
  updateSummary();
  renderLogs();
}

async function nuclearOption() {
  if (!confirm('WARNING: This will clear ALL browsing data (cookies, cache, history, localStorage) and reset Privacy Shield settings.\n\nThis cannot be undone. Continue?')) return;
  await chrome.runtime.sendMessage({ type: 'nuclearOption' });
  allLogs = [];
  updateSummary();
  renderLogs();
  alert('All browsing data has been cleared and Privacy Shield has been reset.');
}
