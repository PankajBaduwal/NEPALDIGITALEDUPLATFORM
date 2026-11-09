/**
 * Board History panel — every board you worked on in the last 2 days, with a thumbnail, and one tap to re-open it.
 * The board itself always opens as a new, empty board; this is where earlier work lives. Entries older than
 * 2 days are removed automatically (App.listHistory prunes them).
 */
var BoardHistory = (function () {
  'use strict';
  var root = null, listEl = null, countEl = null, open = false, busy = false;

  var ICON_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg>';
  var ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';

  function css() {
    if (document.getElementById('bh-css')) return;
    var s = document.createElement('style');
    s.id = 'bh-css';
    s.textContent = [
      '#bh-root{position:fixed;inset:0;z-index:9800;display:none;align-items:center;justify-content:center;background:rgba(3,10,20,.62);backdrop-filter:blur(3px)}',
      '#bh-root.show{display:flex}',
      '.bh-card{width:min(560px,calc(100vw - 20px));max-height:min(660px,calc(100vh - 24px));display:flex;flex-direction:column;border-radius:22px;overflow:hidden;color:#e8f1f6;',
      'background:linear-gradient(165deg,#13283d,#0a1727);border:1px solid rgba(125,230,200,.3);box-shadow:0 28px 70px rgba(0,0,0,.6);font-family:"Plus Jakarta Sans","Inter",system-ui,sans-serif}',
      '.bh-head{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03)}',
      '.bh-ic{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#0f766e,#14b8a6);flex:none}.bh-ic svg{width:22px;height:22px}',
      '.bh-t{flex:1;min-width:0}.bh-t b{display:block;font-size:16px;font-weight:800;color:#fff}.bh-t span{font-size:12px;color:#8fb0c4}',
      '.bh-btn{border:0;border-radius:10px;padding:8px 13px;font:700 12.5px inherit;font-family:inherit;cursor:pointer;color:#cfe3ee;background:rgba(255,255,255,.08)}',
      '.bh-btn:hover{background:rgba(255,255,255,.16);color:#fff}',
      '.bh-btn.pri{background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff}.bh-btn.pri:hover{filter:brightness(1.1)}',
      '.bh-x{width:34px;height:34px;padding:0;display:grid;place-items:center}.bh-x svg{width:16px;height:16px}',
      '.bh-list{flex:1;overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:#27465f transparent}',
      '.bh-item{display:flex;gap:12px;padding:10px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);align-items:center;cursor:pointer}',
      '.bh-item:hover{background:rgba(20,184,166,.12);border-color:rgba(125,230,200,.4)}',
      '.bh-item.now{border-color:rgba(125,230,200,.55);background:rgba(20,184,166,.1);cursor:default}',
      '.bh-th{width:120px;height:68px;border-radius:9px;flex:none;background:#e9eef2 center/cover no-repeat;border:1px solid rgba(255,255,255,.12);display:grid;place-items:center;color:#7f98a8;font-size:11px;overflow:hidden}',
      '.bh-th img{width:100%;height:100%;object-fit:cover;display:block}',
      '.bh-in{flex:1;min-width:0}.bh-in b{display:block;font-size:13.5px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.bh-in span{display:block;font-size:11.5px;color:#8fb0c4;margin-top:2px}',
      '.bh-badge{display:inline-block;font:800 10px inherit;font-family:inherit;padding:2px 7px;border-radius:6px;background:#14b8a6;color:#04201c;margin-left:6px;vertical-align:middle}',
      '.bh-acts{display:flex;flex-direction:column;gap:6px;align-items:stretch;flex:none}',
      '.bh-del{padding:6px 9px;display:grid;place-items:center}.bh-del svg{width:15px;height:15px}.bh-del:hover{background:rgba(220,38,38,.3);color:#fecaca}',
      '.bh-empty{padding:40px 20px;text-align:center;color:#8fb0c4;font-size:13.5px;line-height:1.6}.bh-empty b{display:block;color:#fff;font-size:15px;margin-bottom:4px}',
      '.bh-foot{padding:11px 18px;border-top:1px solid rgba(255,255,255,.08);font-size:11.5px;color:#7f98a8;display:flex;justify-content:space-between;align-items:center;gap:10px}',
      '@media (max-width:520px){.bh-th{width:84px;height:50px}}'
    ].join('');
    document.head.appendChild(s);
  }

  function ago(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    if (s < 45) return 'just now';
    var m = Math.round(s / 60);
    if (m < 60) return m + ' min ago';
    var h = Math.round(m / 60);
    if (h < 24) return h + ' h ago';
    var d = Math.round(h / 24);
    return d + ' day' + (d > 1 ? 's' : '') + ' ago';
  }
  function left(ms) {
    var m = Math.max(0, Math.round(ms / 60000));
    if (m < 60) return 'removed in ' + m + ' min';
    var h = Math.floor(m / 60);
    if (h < 24) return 'removed in ' + h + ' h';
    return 'removed in ' + Math.floor(h / 24) + ' d ' + (h % 24) + ' h';
  }
  function title(m) {
    var subj = m.subject ? String(m.subject).replace(/[-_]/g, ' ') : 'Board';
    subj = subj.charAt(0).toUpperCase() + subj.slice(1);
    var when;
    try { when = new Date(m.createdAt).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); }
    catch (e) { when = new Date(m.createdAt).toString(); }
    return subj + ' · ' + when;
  }

  function build() {
    if (root) return;
    css();
    root = document.createElement('div');
    root.id = 'bh-root';
    root.innerHTML =
      '<div class="bh-card" role="dialog" aria-modal="true" aria-label="Board history">' +
        '<div class="bh-head"><div class="bh-ic">' + ICON_CLOCK + '</div>' +
          '<div class="bh-t"><b>History</b><span>Boards from the last 2 days — older ones are removed automatically</span></div>' +
          '<button type="button" class="bh-btn pri" data-a="new">New board</button>' +
          '<button type="button" class="bh-btn bh-x" data-a="close" aria-label="Close" title="Close (Esc)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '</div>' +
        '<div class="bh-list" id="bh-list"></div>' +
        '<div class="bh-foot"><span id="bh-count"></span><button type="button" class="bh-btn" data-a="clear">Clear all</button></div>' +
      '</div>';
    document.body.appendChild(root);
    listEl = root.querySelector('#bh-list');
    countEl = root.querySelector('#bh-count');
    root.addEventListener('click', onClick);
    document.addEventListener('keydown', function (e) { if (open && e.key === 'Escape') { close(); e.stopPropagation(); } }, true);
  }

  function render(list) {
    listEl.innerHTML = '';
    if (!list.length) {
      listEl.innerHTML = '<div class="bh-empty"><b>No history yet</b>Boards you draw on are saved here automatically and kept for 2 days.</div>';
      countEl.textContent = '';
      return;
    }
    var now = Date.now();
    list.forEach(function (m) {
      var it = document.createElement('div');
      it.className = 'bh-item' + (m.current ? ' now' : '');
      it.setAttribute('data-id', m.id);
      var th = document.createElement('div');
      th.className = 'bh-th';
      if (m.thumb) { var im = document.createElement('img'); im.src = m.thumb; im.alt = ''; im.loading = 'lazy'; th.appendChild(im); } else th.textContent = 'No preview';
      var info = document.createElement('div');
      info.className = 'bh-in';
      var b = document.createElement('b');
      b.textContent = title(m);
      if (m.current) { var bd = document.createElement('i'); bd.className = 'bh-badge'; bd.style.fontStyle = 'normal'; bd.textContent = 'OPEN NOW'; b.appendChild(bd); }
      var s1 = document.createElement('span');
      s1.textContent = m.pageCount + ' page' + (m.pageCount === 1 ? '' : 's') + ' · saved ' + ago(now - m.savedAt);
      var s2 = document.createElement('span');
      s2.textContent = left(m.expiresAt - now);
      info.appendChild(b); info.appendChild(s1); info.appendChild(s2);
      var acts = document.createElement('div');
      acts.className = 'bh-acts';
      if (!m.current) {
        var op = document.createElement('button'); op.type = 'button'; op.className = 'bh-btn pri'; op.setAttribute('data-a', 'open'); op.textContent = 'Open';
        acts.appendChild(op);
      }
      var del = document.createElement('button'); del.type = 'button'; del.className = 'bh-btn bh-del'; del.setAttribute('data-a', 'del'); del.title = 'Delete'; del.setAttribute('aria-label', 'Delete'); del.innerHTML = ICON_TRASH;
      if (!m.current) acts.appendChild(del);
      it.appendChild(th); it.appendChild(info); it.appendChild(acts);
      listEl.appendChild(it);
    });
    countEl.textContent = list.length + ' saved board' + (list.length === 1 ? '' : 's');
  }

  function refresh() {
    if (typeof App === 'undefined' || !App.listHistory) return;
    App.listHistory().then(function (list) { if (open) render(list || []); });
  }

  function onClick(e) {
    var t = e.target.closest('[data-a]');
    var item = e.target.closest('.bh-item');
    if (!t && e.target === root) { close(); return; }
    var a = t ? t.getAttribute('data-a') : (item && !item.classList.contains('now') ? 'open' : null);
    if (!a || busy) return;
    var id = item ? item.getAttribute('data-id') : null;
    if (a === 'close') { close(); return; }
    if (a === 'new') { busy = true; App.startNewBoard(); return; }
    if (a === 'open' && id) { busy = true; if (typeof App.showToast === 'function') App.showToast('Opening…'); App.openHistoryEntry(id); return; }
    if (a === 'del' && id) {
      busy = true;
      Promise.resolve(App.deleteHistoryEntry(id)).then(function () { busy = false; refresh(); });
      e.stopPropagation();
      return;
    }
    if (a === 'clear') {
      if (!window.confirm('Delete all saved boards from history? The board you have open now is kept.')) return;
      busy = true;
      Promise.resolve(App.clearHistory()).then(function () { busy = false; refresh(); });
    }
  }

  function show() {
    build();
    open = true; busy = false;
    root.classList.add('show');
    listEl.innerHTML = '<div class="bh-empty">Loading…</div>';
    refresh();
  }
  function close() { if (!root) return; open = false; root.classList.remove('show'); }
  function toggle() { if (open) close(); else show(); }

  return { open: show, close: close, toggle: toggle, isOpen: function () { return open; } };
})();
