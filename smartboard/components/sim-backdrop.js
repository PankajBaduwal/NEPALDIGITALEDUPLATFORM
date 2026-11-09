/**
 * "Simulation on the board" (additive; does nothing without the `simbg` parameter):
 *
 *   index.html?simbg=/simulations/<id>/play%3Fembed%3D1&title=…&id=<id>
 *
 * The simulation runs live BEHIND the board's drawing layers, so every sidebar tool works over it exactly as on a
 * normal board: pen, highlighter, eraser, text, shapes and instruments, tables, undo / redo, page tools.
 *
 *  - Select tool  → clicks pass through to the simulation (use its buttons and sliders); selecting one of your own
 *    annotations lets you move it, and clicking empty board gives the clicks back to the simulation.
 *  - Any other tool → you write / draw / erase on top of the simulation.
 *  - The pill at the top can switch the Select tool to "move my annotations" instead, and close the simulation.
 *
 * The board's own background is made see-through, and the default dark ink is replaced by a bright colour so
 * writing is visible on dark simulations. Nothing else in the board is changed.
 */
(function () {
  'use strict';
  var params;
  try { params = new URLSearchParams(window.location.search); } catch (e) { return; }
  var src = params.get('simbg');
  if (!src) return;
  // same-site simulation pages only (same rule the board applies to its embed launches)
  if (!/^\/(simulations\/[A-Za-z0-9._-]+\/play|smartboard\/(?:simulations\/)?[a-z0-9-]+\.html)(\?[^#]*)?$/i.test(src)) return;
  var title = (params.get('title') || 'Simulation').slice(0, 120);
  var simId = (params.get('id') || '').slice(0, 120);

  function token() {
    try { return localStorage.getItem('nepal_edu_token') || localStorage.getItem('eduverse_token') || ''; } catch (e) { return ''; }
  }

  var state = { frame: null, selectPassThrough: true, timer: 0, closed: false, pill: null };

  function injectCss() {
    var css = document.createElement('style');
    css.id = 'sbg-css';
    css.textContent = [
      '#canvas-zone.sbg-on{background:#0b1220 !important}',
      '#canvas-zone.sbg-on #grid-canvas{display:none !important}',
      '#sbg-frame{position:absolute;top:0;left:64px;width:calc(100% - 64px);height:100%;border:0;z-index:0;background:#0b1220}',
      'body.sbg-interact #canvas-viewport,body.sbg-interact #canvas-viewport canvas{pointer-events:none !important}',
      '#sbg-pill{position:fixed;left:72px;bottom:46px;z-index:9500;display:flex;align-items:center;gap:8px;',
      'background:rgba(8,18,40,.92);border:1px solid rgba(125,211,252,.35);border-radius:999px;padding:5px 6px 5px 14px;',
      'font:600 12px Inter,system-ui,sans-serif;color:#e2e8f0;box-shadow:0 8px 24px rgba(0,0,0,.4);backdrop-filter:blur(6px)}',
      '#sbg-pill .sbg-title{max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '#sbg-pill button{font:700 12px Inter,system-ui,sans-serif;border:0;border-radius:999px;padding:6px 12px;cursor:pointer;color:#fff;background:#0f766e}',
      '#sbg-pill button.sbg-alt{background:#1e3a5f}',
      '#sbg-pill button.sbg-x{background:#7f1d1d}',
      '#sbg-pill .sbg-mode{color:#7dd3fc;font-weight:700}'
    ].join('');
    document.head.appendChild(css);
  }

  function modeLabel() {
    return state.selectPassThrough ? '🖱 Select = use the simulation' : '✋ Select = move my annotations';
  }

  function buildPill() {
    var pill = document.createElement('div');
    pill.id = 'sbg-pill';
    pill.innerHTML =
      '<span class="sbg-title"></span><span class="sbg-mode"></span>' +
      '<button type="button" class="sbg-alt" title="Choose what the Select tool does">Switch</button>' +
      '<button type="button" class="sbg-x" title="Remove the simulation and keep the board">✕ Close</button>';
    pill.querySelector('.sbg-title').textContent = '🔬 ' + title;
    var modeEl = pill.querySelector('.sbg-mode');
    modeEl.textContent = modeLabel();
    pill.querySelector('.sbg-alt').addEventListener('click', function () {
      state.selectPassThrough = !state.selectPassThrough;
      modeEl.textContent = modeLabel();
      sync();
    });
    pill.querySelector('.sbg-x').addEventListener('click', close);
    document.body.appendChild(pill);
    state.pill = pill;
  }

  /** Select (when set to "use the simulation") passes clicks through the board layers; every other tool draws. */
  function hasSelection() {
    try {
      if (typeof Canvas === 'undefined' || !Canvas.getSelected) return false;
      var sel = Canvas.getSelected();
      return Array.isArray(sel) ? sel.length > 0 : !!sel;
    } catch (e) { return false; }
  }

  function sync() {
    if (state.closed) return;
    var tool = (typeof App !== 'undefined') ? App.currentTool : 'pen';
    // Select hands clicks to the simulation — except while one of my annotations is selected, so it can be moved or resized
    // (clicking empty board deselects it and gives the simulation back its clicks)
    var interact = tool === 'select' && state.selectPassThrough && !hasSelection();
    document.body.classList.toggle('sbg-interact', interact);
  }

  function brightInk() {
    try {
      if (typeof App === 'undefined' || !App.setColor) return;
      var c = String(App.currentColor || '').toLowerCase();
      // the default ink is dark navy, which disappears on a dark simulation
      if (c === '#0f172a' || c === '#000000' || c === '#000' || c === '') App.setColor('#fde047');
      if (App.penSize !== undefined && App.penSize < 3) App.penSize = 4;
    } catch (e) { /* the board keeps its defaults */ }
  }

  function close() {
    state.closed = true;
    clearInterval(state.timer);
    document.body.classList.remove('sbg-interact');
    var zone = document.getElementById('canvas-zone');
    if (zone) zone.classList.remove('sbg-on');
    if (state.frame && state.frame.parentNode) state.frame.parentNode.removeChild(state.frame);
    if (state.pill && state.pill.parentNode) state.pill.parentNode.removeChild(state.pill);
    var css = document.getElementById('sbg-css');
    if (css && css.parentNode) css.parentNode.removeChild(css);
    try {
      var url = new URL(window.location.href);
      ['simbg', 'title', 'id', 'returnUrl'].forEach(function (k) { url.searchParams.delete(k); });
      window.history.replaceState({}, '', url.toString());
    } catch (e) { /* ignore */ }
    if (typeof Drawing !== 'undefined' && Drawing.syncPointerEvents) Drawing.syncPointerEvents();
  }

  function mount() {
    var zone = document.getElementById('canvas-zone');
    if (!zone || typeof App === 'undefined') return false;
    if (state.frame || state.closed) return true;
    injectCss();
    zone.classList.add('sbg-on');
    var f = document.createElement('iframe');
    f.id = 'sbg-frame';
    f.src = src;
    f.title = title;
    f.setAttribute('allow', 'fullscreen; accelerometer; gyroscope');
    zone.insertBefore(f, zone.firstChild);
    state.frame = f;
    buildPill();
    state.timer = setInterval(sync, 100);
    setTimeout(brightInk, 300);
    setTimeout(brightInk, 1500); // a restored board session may reset the colour once
    sync();
    if (typeof App.showToast === 'function') App.showToast('🔬 ' + title + ' — pick any tool to write over it; Select to use the simulation');
    return true;
  }

  function start() {
    var tries = 0;
    (function attempt() {
      if (mount()) return;
      if (tries++ < 60) setTimeout(attempt, 100);
    })();
  }

  function guarded() {
    var tok = token();
    if (!tok) { window.location.href = '/login'; return; }
    if (!simId) { start(); return; }
    // same access check the board's other simulation launches use; if the API cannot be reached the board still opens
    fetch('/api/v1/simulations/' + encodeURIComponent(simId) + '/access', { headers: { Accept: 'application/json', Authorization: 'Bearer ' + tok } })
      .then(function (r) { if (r.status === 401) { window.location.href = '/login'; } else { start(); } })
      .catch(function () { start(); });
  }

  if (document.readyState === 'complete') guarded();
  else window.addEventListener('load', guarded);
})();
