'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES HUB — shell, shared lifecycle and helpers
// A full-screen overlay on top of the board. Games never touch board content, except
// "Add to Board", which goes through Canvas.addStroke (normal undo/redo and saving).
// While the hub is open, keyboard events are captured so board shortcuts (tools, undo, pages)
// cannot fire; on close the previous tool and focus are restored.
// Each game runs in a Session that tracks every timer, interval, animation frame, listener and
// observer it creates, and disposes them all on restart, back-to-hub and close.
// ═══════════════════════════════════════════════════════════
const GamesHub = (() => {
  const E = (typeof GameEngine !== 'undefined') ? GameEngine : null;
  const C = (typeof GameContent !== 'undefined') ? GameContent : null;
  const registry = {};
  let overlay = null, els = {}, isOpen = false, view = 'hub', filter = 'All';
  let current = null;           // { id, session, instance, lifecycle }
  let prevTool = null, prevFocus = null, dialog = null;
  let sessionsCreated = 0, sessionsDisposed = 0;

  const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** Tiny element helper: h('button', { class: 'x', on: { click } }, ['text', child]) */
  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'on') { for (const [ev, fn] of Object.entries(v)) el.addEventListener(ev, fn); }
      else if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k in el && typeof v !== 'string') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    (Array.isArray(children) ? children : children != null ? [children] : []).forEach((c) => {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    });
    return el;
  }

  // ── Session: owns every async resource a game creates ──
  function createSession() {
    sessionsCreated++;
    const timeouts = new Set(), intervals = new Set(), rafs = new Set(), listeners = [], observers = [], disposers = [];
    let alive = true;
    const s = {
      get alive() { return alive; },
      setTimeout(fn, ms) { const id = setTimeout(() => { timeouts.delete(id); if (alive) fn(); }, ms); timeouts.add(id); return id; },
      clearTimeout(id) { clearTimeout(id); timeouts.delete(id); },
      setInterval(fn, ms) { const id = setInterval(() => { if (alive) fn(); }, ms); intervals.add(id); return id; },
      clearInterval(id) { clearInterval(id); intervals.delete(id); },
      raf(fn) { const id = requestAnimationFrame((t) => { rafs.delete(id); if (alive) fn(t); }); rafs.add(id); return id; },
      cancelRaf(id) { cancelAnimationFrame(id); rafs.delete(id); },
      on(target, type, fn, opts) {
        if (!target) return () => {};
        target.addEventListener(type, fn, opts);
        const rec = [target, type, fn, opts];
        listeners.push(rec);
        return () => { target.removeEventListener(type, fn, opts); const i = listeners.indexOf(rec); if (i >= 0) listeners.splice(i, 1); };
      },
      observe(el, fn) {
        if (typeof ResizeObserver === 'undefined' || !el) return;
        const ro = new ResizeObserver(() => { if (alive) fn(); });
        ro.observe(el); observers.push(ro);
      },
      onDispose(fn) { disposers.push(fn); },
      countdown(seconds, handlers) {
        return E.createCountdown(seconds, Object.assign({}, handlers, { clock: { setInterval: (f, ms) => s.setInterval(f, ms), clearInterval: (id) => s.clearInterval(id) } }));
      },
      stats: () => ({ timeouts: timeouts.size, intervals: intervals.size, rafs: rafs.size, listeners: listeners.length, observers: observers.length }),
      dispose() {
        if (!alive) return;
        alive = false;
        disposers.splice(0).forEach((fn) => { try { fn(); } catch (e) { /* keep disposing */ } });
        timeouts.forEach(clearTimeout); timeouts.clear();
        intervals.forEach(clearInterval); intervals.clear();
        rafs.forEach(cancelAnimationFrame); rafs.clear();
        listeners.splice(0).forEach(([t, ty, fn, o]) => t.removeEventListener(ty, fn, o));
        observers.splice(0).forEach((ro) => ro.disconnect());
        sessionsDisposed++;
      }
    };
    return s;
  }

  // ── Overlay DOM ──
  function build() {
    if (overlay) return overlay;
    overlay = h('div', { id: 'games-overlay', class: 'gm-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'gm-title', hidden: true });
    const lbl = (icon, text) => [h('span', { 'aria-hidden': 'true', text: icon }), h('span', { class: 'gm-lbl', text })];
    els.back = h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-act': 'back', title: 'Back to all games', 'aria-label': 'All games' }, lbl('←', 'All games'));
    els.title = h('h2', { id: 'gm-title', class: 'gm-title', text: 'Classroom Games' });
    els.hud = h('div', { class: 'gm-hud', 'aria-live': 'off' });
    els.help = h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-act': 'help', 'aria-expanded': 'false', 'aria-label': 'How to play', title: 'How to play' }, lbl('❔', 'How to play'));
    els.restart = h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-act': 'restart', 'aria-label': 'Restart', title: 'Restart this game' }, lbl('↻', 'Restart'));
    els.close = h('button', { type: 'button', class: 'gm-btn gm-close', 'data-act': 'close', 'aria-label': 'Back to board', title: 'Close games and return to the board (Esc)' }, lbl('✕', 'Back to board'));
    const header = h('header', { class: 'gm-header' }, [
      h('div', { class: 'gm-header-left' }, [els.back, els.title]), els.hud,
      h('div', { class: 'gm-header-actions' }, [els.help, els.restart, els.close])
    ]);
    els.main = h('main', { class: 'gm-main' });
    els.helpPanel = h('aside', { class: 'gm-help-panel', hidden: true, 'aria-label': 'How to play' });
    els.layer = h('div', { class: 'gm-layer' });
    els.live = h('div', { class: 'gm-sr', 'aria-live': 'polite', role: 'status' });
    els.toast = h('div', { class: 'gm-toast', role: 'status', 'aria-live': 'polite', hidden: true });
    overlay.append(header, els.main, els.helpPanel, els.layer, els.live, els.toast);
    overlay.addEventListener('click', onOverlayClick);
    overlay.addEventListener('contextmenu', (e) => { if (!e.target.closest('input, textarea')) e.preventDefault(); });
    document.body.appendChild(overlay);
    return overlay;
  }

  function onOverlayClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn || !overlay.contains(btn) || btn.closest('.gm-layer')) return;
    const act = btn.getAttribute('data-act');
    if (act === 'close') requestClose();
    else if (act === 'back') requestBack();
    else if (act === 'restart') requestRestart();
    else if (act === 'help') toggleHelp();
  }

  // ── Keyboard isolation (capture phase on window: runs before every board shortcut handler) ──
  function onKeyCapture(e) {
    if (!isOpen) return;
    e.stopPropagation();                   // board/global shortcuts never see keys while games are open
    if (e.type !== 'keydown') return;
    if (e.key === 'Tab') { trapFocus(e); return; }
    if (dialog) { if (e.key === 'Escape') { e.preventDefault(); dialog.cancel(); } return; }
    if (e.key === 'Escape') {
      e.preventDefault();
      if (!els.helpPanel.hidden) toggleHelp(false);
      else if (view === 'game') requestBack();
      else close();
      return;
    }
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (view === 'game' && current && current.instance && typeof current.instance.onKey === 'function' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      current.instance.onKey(e);
    }
  }

  function trapFocus(e) {
    const scope = dialog ? dialog.el : overlay;
    const items = [...scope.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter((el) => !el.disabled && !el.closest('[hidden]') && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (!scope.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // ── Dialogs (confirm + result) — rendered in the overlay's own layer ──
  function confirm({ title, text, ok = 'Yes', cancel = 'Cancel', danger = false } = {}) {
    return new Promise((resolve) => {
      closeDialog(false);
      const okBtn = h('button', { type: 'button', class: 'gm-btn ' + (danger ? 'gm-danger' : 'gm-primary'), text: ok });
      const cancelBtn = h('button', { type: 'button', class: 'gm-btn gm-ghost', text: cancel });
      const el = h('div', { class: 'gm-modal', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'gm-confirm-title', 'aria-describedby': 'gm-confirm-text' }, [
        h('div', { class: 'gm-modal-card' }, [
          h('h3', { id: 'gm-confirm-title', text: title || 'Are you sure?' }),
          h('p', { id: 'gm-confirm-text', text: text || '' }),
          h('div', { class: 'gm-modal-actions' }, [cancelBtn, okBtn])
        ])
      ]);
      const finish = (v) => { if (dialog && dialog.el === el) { el.remove(); dialog = null; } resolve(v); };
      okBtn.addEventListener('click', () => finish(true));
      cancelBtn.addEventListener('click', () => finish(false));
      el.addEventListener('pointerdown', (ev) => { if (ev.target === el) finish(false); });
      dialog = { el, cancel: () => finish(false), resolve: finish };
      els.layer.appendChild(el);
      cancelBtn.focus();
    });
  }
  function closeDialog(value) { if (dialog) dialog.resolve(value); }

  function toast(msg, ms = 2200) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { if (els.toast) els.toast.hidden = true; }, ms);
  }
  function announce(msg) { if (els.live) { els.live.textContent = ''; els.live.textContent = msg; } }

  function toggleHelp(force) {
    const show = typeof force === 'boolean' ? force : els.helpPanel.hidden;
    els.helpPanel.hidden = !show;
    els.help.setAttribute('aria-expanded', String(show));
    if (show) els.helpPanel.focus();
  }

  // ── Hub ──
  function renderHub() {
    disposeCurrent();
    view = 'hub';
    overlay.dataset.view = 'hub';
    els.title.textContent = 'Classroom Games';
    els.back.hidden = true; els.help.hidden = true; els.restart.hidden = true;
    els.hud.replaceChildren();
    toggleHelp(false);
    const cats = ['All', ...new Set(C.catalog.map((g) => g.category))];
    const chips = h('div', { class: 'gm-chips', role: 'toolbar', 'aria-label': 'Filter games by type' }, cats.map((c) => h('button', {
      type: 'button', class: 'gm-chip', 'aria-pressed': String(c === filter), text: c,
      on: { click: () => { filter = c; renderHub(); overlay.querySelector(`.gm-chip[aria-pressed="true"]`)?.focus(); } }
    })));
    const list = C.catalog.filter((g) => filter === 'All' || g.category === filter);
    const grid = h('div', { class: 'gm-grid' }, list.map((g) => {
      const ready = !!registry[g.id];
      return h('article', { class: 'gm-card', 'data-game': g.id }, [
        h('div', { class: 'gm-card-icon', 'aria-hidden': 'true', text: g.icon }),
        h('div', { class: 'gm-card-body' }, [
          h('span', { class: 'gm-tag', text: g.category }),
          h('h3', { class: 'gm-card-title', text: g.name }),
          h('p', { class: 'gm-card-desc', text: g.desc })
        ]),
        h('button', { type: 'button', class: 'gm-btn gm-primary gm-play', disabled: !ready, 'aria-label': `Play ${g.name}`, text: ready ? '▶ Play' : 'Coming soon', on: { click: () => launch(g.id) } })
      ]);
    }));
    els.main.replaceChildren(h('div', { class: 'gm-hub' }, [
      h('p', { class: 'gm-hub-intro' }, ['Pick a game to play on the board. ', h('span', { class: 'gm-sample', text: C.LABEL + '.' })]),
      chips, grid
    ]));
  }

  // ── Launch / lifecycle ──
  function disposeCurrent() {
    if (!current) return;
    const c = current;
    current = null;
    try { if (c.instance && typeof c.instance.unmount === 'function') c.instance.unmount(); } catch (e) { console.warn('[Games] unmount', e); }
    c.lifecycle.to('closed');
    c.session.dispose();
    closeDialog(false);
  }

  function launch(id) {
    const factory = registry[id];
    const meta = C.catalog.find((g) => g.id === id);
    if (!factory || !meta) return false;
    if (!isOpen) open();
    disposeCurrent();
    view = 'game';
    overlay.dataset.view = 'game';
    els.title.textContent = `${meta.icon} ${meta.name}`;
    els.back.hidden = false; els.help.hidden = false; els.restart.hidden = false;
    els.hud.replaceChildren();
    els.helpPanel.replaceChildren();
    toggleHelp(false);
    const session = createSession();
    const body = h('div', { class: 'gm-game', 'data-game': id });
    els.main.replaceChildren(body);
    const lifecycle = E.createLifecycle((to) => { body.dataset.phase = to; });
    const ctx = makeContext(id, body, session, lifecycle);
    current = { id, session, lifecycle, instance: null };
    try {
      current.instance = factory(ctx) || {};
    } catch (err) {
      console.error('[Games] failed to start', id, err);
      body.replaceChildren(h('p', { class: 'gm-error', text: 'Sorry — this game could not start. Please go back and try again.' }));
    }
    const focusable = body.querySelector('button:not([disabled]), input, [tabindex="0"]');
    if (focusable) focusable.focus({ preventScroll: true });
    return true;
  }

  function makeContext(id, body, session, lifecycle) {
    const ctx = {
      id, body, session, E, C, h, esc,
      rng: E.createRng(),
      reducedMotion: reducedMotion(),
      /** Scale a design size (px at a 20px base) to this screen: lines, dots and hit radii grow on big panels. */
      px: (n) => n * (parseFloat(getComputedStyle(overlay).fontSize) || 20) / 20,
      lifecycle,
      setPhase: (p) => lifecycle.to(p),
      setHud(nodes) { els.hud.replaceChildren(...(Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean)); },
      setHelp(lines) {
        els.helpPanel.replaceChildren(h('h3', { text: 'How to play' }), h('ul', null, (lines || []).map((l) => h('li', { text: l }))),
          h('p', { class: 'gm-sample', text: C.LABEL + '.' }),
          h('button', { type: 'button', class: 'gm-btn gm-ghost', text: 'Got it', on: { click: () => toggleHelp(false) } }));
        els.helpPanel.tabIndex = -1;
      },
      toast, announce, confirm,
      restart: () => launch(id),
      backToHub: () => renderHub(),
      /** Result panel over the game body; actions: [{ label, primary, onClick }] */
      showResult({ icon = '🎉', title, lines = [], actions = [], extra, hub = true, peekable = false } = {}) {
        lifecycle.to('result');
        const panel = h('div', { class: 'gm-result', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'gm-result-title' }, [
          h('div', { class: 'gm-result-card' }, [
            h('div', { class: 'gm-result-icon', 'aria-hidden': 'true', text: icon }),
            h('h3', { id: 'gm-result-title', text: title || '' }),
            ...lines.map((l) => h('p', { text: l })),
            extra || null,
            h('div', { class: 'gm-modal-actions' }, [
              ...actions.map((a) => h('button', { type: 'button', class: 'gm-btn ' + (a.primary ? 'gm-primary' : 'gm-ghost'), text: a.label, on: { click: () => { panel.remove(); a.onClick && a.onClick(); } } })),
              hub ? h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '← All games', on: { click: () => renderHub() } }) : null
            ])
          ])
        ]);
        if (peekable) {
          // lets players shrink the card to compare it with their drawing underneath
          const peek = h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost gm-peek', 'aria-pressed': 'false', text: '👁 See drawing' });
          peek.addEventListener('click', () => {
            const min = panel.classList.toggle('is-min');
            peek.setAttribute('aria-pressed', String(min));
            peek.textContent = min ? '▲ Show results' : '👁 See drawing';
          });
          panel.firstChild.prepend(peek);
        }
        body.querySelector('.gm-result')?.remove();
        body.appendChild(panel);
        announce(title || '');
        panel.querySelector('button')?.focus({ preventScroll: true });
        return panel;
      },
      clearResult() { body.querySelector('.gm-result')?.remove(); },
      createPad: (canvas, opts) => createPad(canvas, session, opts),
      delegateDrag: (container, selector, handlers) => delegateDrag(container, session, selector, handlers),
      addStrokesToBoard,
      teamPanel: (teams, opts) => teamPanel(teams, opts)
    };
    return ctx;
  }

  async function requestBack() {
    if (dialog) return;
    if (await confirmLeave('Leave this game?')) renderHub();
  }
  async function requestRestart() {
    if (dialog || !current) return;
    if (await confirmLeave('Restart this game?', 'Restart')) launch(current.id);
  }
  async function requestClose() {
    if (dialog) return;
    if (view === 'game' && !(await confirmLeave('Close the game and return to the board?', 'Close'))) return;
    close();
  }
  function confirmLeave(title, ok = 'Leave') {
    const inst = current && current.instance;
    const busy = inst && typeof inst.hasProgress === 'function' && inst.hasProgress() && current.lifecycle.phase !== 'result';
    if (!busy) return Promise.resolve(true);
    return confirm({ title, text: 'The current round and its scores will be lost.', ok, danger: true });
  }

  // ── Open / close ──
  function open(gameId) {
    build();
    if (!E || !C) { console.error('[Games] engine/content missing'); return false; }
    if (!isOpen) {
      prevFocus = document.activeElement;
      prevTool = (typeof App !== 'undefined') ? App.currentTool : null;
      if (typeof CompassTool !== 'undefined' && CompassTool.cancelGesture) CompassTool.cancelGesture();
      if (typeof UI !== 'undefined') { try { UI.closeInsertFlyout && UI.closeInsertFlyout(); UI.closeShapesFlyout && UI.closeShapesFlyout(); } catch (e) { /* optional */ } }
      overlay.hidden = false;
      isOpen = true;
      window.addEventListener('keydown', onKeyCapture, true);
      window.addEventListener('keyup', onKeyCapture, true);
      document.documentElement.classList.add('gm-open');
    }
    if (gameId && registry[gameId]) launch(gameId);
    else { renderHub(); overlay.querySelector('.gm-play:not([disabled])')?.focus({ preventScroll: true }); }
    return true;
  }

  function close() {
    if (!isOpen) return;
    disposeCurrent();
    closeDialog(false);
    isOpen = false;
    view = 'hub';
    overlay.hidden = true;
    els.main.replaceChildren();
    window.removeEventListener('keydown', onKeyCapture, true);
    window.removeEventListener('keyup', onKeyCapture, true);
    document.documentElement.classList.remove('gm-open');
    if (typeof App !== 'undefined' && prevTool && App.currentTool !== prevTool && App.setTool) App.setTool(prevTool);
    if (typeof Canvas !== 'undefined' && Canvas.resize) Canvas.resize();   // re-sync after any window/fullscreen change while open
    if (prevFocus && document.contains(prevFocus) && prevFocus.focus) prevFocus.focus({ preventScroll: true });
  }

  // ── Shared drawing pad (isolated canvas; never part of the board) ──
  function createPad(canvas, session, opts = {}) {
    const ctx2d = canvas.getContext('2d');
    const state = { strokes: [], active: null, pointerId: null, enabled: opts.enabled !== false, color: opts.color || '#0f172a', width: opts.width || 5 };
    let cssW = 0, cssH = 0, dpr = 1;
    canvas.style.touchAction = 'none';

    function size() {
      const r = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      cssW = Math.max(1, Math.round(r.width)); cssH = Math.max(1, Math.round(r.height));
      const bw = Math.round(cssW * dpr), bh = Math.round(cssH * dpr);
      if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
      redraw();
    }
    // strokes are stored normalised to the pad width so a resize scales them uniformly (no stretching)
    const toPx = (p) => ({ x: p.x * cssW, y: p.y * cssW });
    function strokePath(s) {
      const pts = s.points.map(toPx);
      ctx2d.strokeStyle = s.color; ctx2d.lineWidth = s.width; ctx2d.lineCap = 'round'; ctx2d.lineJoin = 'round';
      ctx2d.beginPath();
      pts.forEach((p, i) => (i ? ctx2d.lineTo(p.x, p.y) : ctx2d.moveTo(p.x, p.y)));
      if (pts.length === 1) ctx2d.lineTo(pts[0].x + 0.01, pts[0].y);
      ctx2d.stroke();
    }
    function redraw() {
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2d.clearRect(0, 0, cssW, cssH);
      if (typeof opts.background === 'function') opts.background(ctx2d, cssW, cssH);
      state.strokes.forEach(strokePath);
      if (state.active) strokePath(state.active);
      if (typeof opts.overlay === 'function') opts.overlay(ctx2d, cssW, cssH);
    }
    const local = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

    function down(e) {
      if (!state.enabled || state.pointerId !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* synthetic events */ }
      state.pointerId = e.pointerId;
      const p = local(e);
      state.active = { color: state.color, width: state.width, points: [{ x: p.x / cssW, y: p.y / cssW }], raw: [p] };
      if (opts.onStart) opts.onStart();
      redraw();
    }
    function move(e) {
      if (e.pointerId !== state.pointerId || !state.active) return;
      const evs = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
      (evs.length ? evs : [e]).forEach((ev) => {
        const p = local(ev);
        const last = state.active.raw[state.active.raw.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) < 0.75) return;
        state.active.raw.push(p);
        state.active.points.push({ x: p.x / cssW, y: p.y / cssW });
        // incremental segment (no full redraw during the move)
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx2d.strokeStyle = state.active.color; ctx2d.lineWidth = state.active.width; ctx2d.lineCap = 'round';
        ctx2d.beginPath(); ctx2d.moveTo(last.x, last.y); ctx2d.lineTo(p.x, p.y); ctx2d.stroke();
      });
    }
    function finish(e, cancelled) {
      if (e && e.pointerId !== state.pointerId) return;
      const s = state.active;
      state.active = null; state.pointerId = null;
      if (!s) return;
      if (cancelled) { redraw(); if (opts.onCancel) opts.onCancel(); return; }
      const stroke = { color: s.color, width: s.width, points: s.points };
      if (!opts.single) state.strokes.push(stroke);
      redraw();
      if (opts.onEnd) opts.onEnd(s.raw.slice(), stroke);
    }
    session.on(canvas, 'pointerdown', down);
    session.on(canvas, 'pointermove', move);
    session.on(canvas, 'pointerup', (e) => finish(e, false));
    session.on(canvas, 'pointercancel', (e) => finish(e, true));
    session.on(canvas, 'lostpointercapture', (e) => { if (state.active && e.pointerId === state.pointerId) finish(e, false); });
    session.observe(canvas, size);
    size();

    return {
      get strokes() { return state.strokes; },
      get size() { return { w: cssW, h: cssH }; },
      get drawing() { return !!state.active; },
      clear() { state.strokes = []; state.active = null; state.pointerId = null; redraw(); },
      undo() { state.strokes.pop(); redraw(); },
      setEnabled(v) { state.enabled = !!v; if (!v && state.active) finish({ pointerId: state.pointerId }, true); },
      setColor(c) { state.color = c; },
      setWidth(w) { state.width = w; },
      /** Force-end an in-progress stroke (e.g. time ran out) and deliver it. */
      endNow() { if (state.active) finish({ pointerId: state.pointerId }, false); },
      redraw, resize: size,
      /** Strokes in pad pixel coordinates (for Add to Board). */
      pixelStrokes() { return state.strokes.map((s) => ({ color: s.color, width: s.width, points: s.points.map(toPx) })); }
    };
  }

  // ── Shared drag helper (delegated): one set of listeners on a container that survives re-renders.
  // Items matching `selector` can be dragged with mouse, touch or stylus. A press that does not move
  // past `threshold` is left to the normal click event (which also covers keyboard activation).
  // The dragged element is only translated visually; on drop/cancel the transform is always reset,
  // so an item can never be left stuck outside its container.
  function delegateDrag(container, session, selector, { onStart, onMove, onDrop, threshold = 8 } = {}) {
    let pid = null, el = null, start = null, dragging = false, lastDragEnd = 0, lastDragged = null;
    const reset = () => {
      if (el) { el.classList.remove('gm-dragging'); el.style.transform = ''; el.style.zIndex = ''; }
      pid = null; el = null; start = null; dragging = false;
    };
    session.on(container, 'pointerdown', (e) => {
      if (pid !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const target = e.target.closest(selector);
      if (!target || !container.contains(target) || target.getAttribute('aria-disabled') === 'true') return;
      if (e.target.closest('[data-nodrag]')) return;
      pid = e.pointerId; el = target; start = { x: e.clientX, y: e.clientY }; dragging = false;
      try { target.setPointerCapture(e.pointerId); } catch (_) { /* synthetic events */ }
    });
    session.on(container, 'pointermove', (e) => {
      if (e.pointerId !== pid || !el) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!dragging && Math.hypot(dx, dy) < threshold) return;
      if (!dragging) { dragging = true; el.classList.add('gm-dragging'); el.style.zIndex = '50'; if (onStart) onStart(el, e); }
      e.preventDefault();
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      if (onMove) onMove(el, e.clientX, e.clientY);
    });
    const end = (e, cancelled) => {
      if (e.pointerId !== pid) return;
      const item = el, wasDrag = dragging, x = e.clientX, y = e.clientY;
      reset();
      if (!wasDrag) return;
      lastDragEnd = Date.now(); lastDragged = item;
      if (onDrop) onDrop(item, cancelled ? null : x, cancelled ? null : y, !!cancelled);
    };
    session.on(container, 'pointerup', (e) => end(e, false));
    session.on(container, 'pointercancel', (e) => end(e, true));
    session.on(container, 'lostpointercapture', (e) => { if (e.pointerId === pid && dragging) end(e, true); else if (e.pointerId === pid) reset(); });
    return {
      /** true for the element that was just dragged — ignores the click some browsers fire after a drag */
      justDragged: (target) => !!target && target === lastDragged && Date.now() - lastDragEnd < 350,
      get active() { return dragging; },
      cancel: reset
    };
  }

  /** Is the point (clientX, clientY) inside the element's current box? (recomputed every time: survives resize) */
  function hitEl(el, x, y) {
    if (!el || x == null) return false;
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  // ── Team score panel ──
  function teamPanel(teams, { active = null, onAward = null, step = 1 } = {}) {
    return h('div', { class: 'gm-teams', role: 'group', 'aria-label': 'Team scores' }, teams.list.map((t) => h('div', {
      class: 'gm-team' + (active === t.id ? ' is-active' : ''), 'data-team': t.id
    }, [
      h('span', { class: 'gm-team-name', text: (active === t.id ? '▶ ' : '') + t.name }),
      h('span', { class: 'gm-team-score', 'aria-label': `${t.name} score ${t.score}`, text: String(t.score) }),
      onAward ? h('button', { type: 'button', class: 'gm-btn gm-mini', 'aria-label': `Give ${t.name} ${step} point`, text: `+${step}`, on: { click: () => onAward(t.id) } }) : null
    ])));
  }

  // ── Add a game drawing to the board (through the board's own stroke model) ──
  function addStrokesToBoard(strokes) {
    if (typeof Canvas === 'undefined' || !Canvas.addStroke || !Canvas.screenToBoard) return 0;
    const pts = strokes.flatMap((s) => s.points).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (!pts.length) return 0;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    pts.forEach((p) => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
    const { W, H } = Canvas.getCanvasSize();
    const zoom = Canvas.getZoom ? Canvas.getZoom() : 1;
    const centre = Canvas.screenToBoard(W / 2, H / 2);
    const fit = Math.min(1, (W * 0.6) / Math.max(1, maxX - minX), (H * 0.6) / Math.max(1, maxY - minY));
    const k = fit / zoom, cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    let n = 0;
    strokes.forEach((s) => {
      const points = s.points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
        .map((p) => ({ x: Math.round((centre.x + (p.x - cx) * k) * 10) / 10, y: Math.round((centre.y + (p.y - cy) * k) * 10) / 10, p: 0.5 }));
      if (!points.length) return;
      Canvas.addStroke({ tool: 'pen', color: s.color, size: Math.max(1, Math.round(s.width * k * 10) / 10), points });
      n++;
    });
    if (Canvas.renderStrokes) Canvas.renderStrokes();
    return n;
  }

  function register(id, factory) { registry[id] = factory; }

  return {
    open, close, launch, register,
    isOpen: () => isOpen,
    current: () => (current ? { id: current.id, phase: current.lifecycle.phase } : null),
    hitEl, h, esc,
    /** For tests: resource counts of the running game and session bookkeeping. */
    _debug: () => ({ open: isOpen, view, game: current && current.id, stats: current ? current.session.stats() : null, sessionsCreated, sessionsDisposed, dialog: !!dialog }),
    _instance: () => current && current.instance
  };
})();

if (typeof window !== 'undefined') window.GamesHub = GamesHub;
