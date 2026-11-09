'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — CIRCLE CHALLENGE
// • Opens straight onto the drawing area: just draw. No Start button.
// • Live accuracy % appears inside the circle while drawing; the final % is shown in its centre,
//   with the ideal circle dashed and the stroke coloured by how far each part is from it.
// • Settings in the side panel apply immediately: Perfect circle / Geometry target, Easy–Hard goal,
//   optional time limit (starts when the pen touches), whole class or 2–6 teams taking turns, sound.
// • Best % per mode is kept on this device. Scoring is pure maths in CircleScore (no network).
// ═══════════════════════════════════════════════════════════
(() => {
  if (typeof GamesHub === 'undefined' || typeof CircleScore === 'undefined') return;
  const { h } = GamesHub;
  const CS = CircleScore;

  const SETTINGS_KEY = 'gm_circle_settings_v1';
  const BEST_KEY = 'gm_circle_best_v1';
  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];
  const DEFAULT_NAMES = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'];
  /** Difficulty sets the goal and the time limit; the % itself is the same objective measure. */
  const LEVELS = {
    easy: { label: 'Easy', goal: 70, seconds: 15 },
    medium: { label: 'Medium', goal: 80, seconds: 10 },
    hard: { label: 'Hard', goal: 90, seconds: 6 }
  };
  const TARGETS = [{ cx: 0, cy: 0, r: 5 }, { cx: 0, cy: 0, r: 4 }, { cx: 1, cy: -2, r: 4 }, { cx: -2, cy: 1, r: 3 }, { cx: 0, cy: 0, r: 6 }, { cx: 2, cy: 2, r: 3 }];
  const INK = '#1d4ed8';

  const store = {
    get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  function chips(label, options, value, onChange) {
    const wrap = h('div', { class: 'gm-choice', role: 'group', 'aria-label': label }, [h('span', { class: 'gm-choice-label', text: label })]);
    options.forEach((o, i) => wrap.appendChild(h('button', {
      type: 'button', class: 'gm-chip', 'aria-pressed': String(o.value === value), text: o.label,
      on: { click: () => { wrap.querySelectorAll('.gm-chip').forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); onChange(o.value); } }
    })));
    return wrap;
  }
  /** Colour for a part of the stroke by its distance from the ideal circle (share of the radius). */
  const errColor = (e) => (e <= 0.03 ? '#16a34a' : e <= 0.07 ? '#65a30d' : e <= 0.12 ? '#f59e0b' : '#dc2626');
  const pctColor = (p, goal) => (p >= goal ? '#15803d' : p >= goal - 15 ? '#b45309' : '#b91c1c');
  const fmt = (p) => `${p.toFixed(1)}%`;
  const sign = (n) => (n > 0 ? ` − ${n}` : n < 0 ? ` + ${-n}` : '');
  const equation = (t) => `${t.cx ? `(x${sign(t.cx)})²` : 'x²'} + ${t.cy ? `(y${sign(t.cy)})²` : 'y²'} = ${t.r * t.r}`;
  function verdict(p) {
    if (p >= 97) return 'Nearly perfect!';
    if (p >= 90) return 'Excellent!';
    if (p >= 80) return 'Great circle!';
    if (p >= 70) return 'Good!';
    if (p >= 55) return 'Not bad — try again';
    return 'Keep practising';
  }

  GamesHub.register('circle', (ctx) => {
    const { session } = ctx;
    const saved = store.get(SETTINGS_KEY) || {};
    const cfg = {
      kind: saved.kind === 'geometry' ? 'geometry' : 'free',
      level: LEVELS[saved.level] ? saved.level : 'medium',
      limit: saved.limit === true,
      mode: saved.mode === 'teams' ? 'teams' : 'class',
      names: Array.isArray(saved.names) && saved.names.length >= 2 ? saved.names.slice(0, 6).map((n, i) => String(n || DEFAULT_NAMES[i]).slice(0, 24)) : DEFAULT_NAMES.slice(0, 2),
      turns: [1, 2, 3].includes(saved.turns) ? saved.turns : 1,
      showCentre: saved.showCentre !== false,
      sound: saved.sound !== false
    };
    const saveCfg = () => store.set(SETTINGS_KEY, cfg);
    const best = store.get(BEST_KEY) || {};
    const bestKey = () => `${cfg.kind}-${cfg.level}`;
    const color = (id) => COLORS[id % COLORS.length];

    let canvas = null, g2 = null, cssW = 0, cssH = 0, dpr = 1;
    let pts = null, drawSize = null, pid = null, live = null, result = null, lastLive = 0, liveTimer = null, timer = null, audio = null;
    let attempts = [], targetIdx = 0, added = false, game = null, waitingNext = false, side = null;

    ctx.setHelp([
      'Just draw: put your finger, pen or mouse on the white area and draw ONE circle, then lift to finish.',
      'The percentage appears inside your circle — live while you draw, then the final score. 100% is a perfect circle.',
      'Green dashes show the perfect circle that fits your drawing; green parts of your line are close to it, red parts are far.',
      'Drawing a little past the start is fine. Start a new circle any time by drawing again.',
      'Easy / Medium / Hard set the goal (70% / 80% / 90%) and, if the time limit is on, the time (15 / 10 / 6 s from the first touch).',
      'Geometry target: draw the circle with the given equation on the grid — your % includes how close the centre and radius are.',
      'Teams take turns, one circle each turn; the highest total wins.'
    ]);

    function tone(freqs, dur = 0.12) {
      if (!cfg.sound) return;
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        let t = audio.currentTime;
        freqs.forEach((f) => {
          const o = audio.createOscillator(), gn = audio.createGain();
          o.type = 'sine'; o.frequency.value = f;
          gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.08, t + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          o.connect(gn); gn.connect(audio.destination); o.start(t); o.stop(t + dur + 0.02);
          t += dur * 0.9;
        });
      } catch (e) { /* audio unavailable */ }
    }
    function stopTimer() { if (timer) { timer.stop(); timer = null; } }
    session.onDispose(() => { stopTimer(); if (audio) { try { audio.close(); } catch (e) { /* ignore */ } audio = null; } });

    const target = () => (cfg.kind === 'geometry' ? TARGETS[targetIdx % TARGETS.length] : null);
    const unitPx = () => Math.min(cssW, cssH) / 16;
    const minSize = () => Math.max(60, Math.min(cssW, cssH) * 0.15);
    /** Stroke points are kept in the pixels of the pad size they were drawn at; scale for the current size. */
    /** Map a point from the pad size it was drawn at to the current size, scaling about the centre (the grid's origin). */
    const mapNow = () => {
      if (!drawSize || (drawSize.w === cssW && drawSize.h === cssH)) return { k: 1, M: (q) => q };
      const k = Math.min(cssW, cssH) / Math.min(drawSize.w, drawSize.h);
      return { k, M: (q) => ({ x: (q.x - drawSize.w / 2) * k + cssW / 2, y: (q.y - drawSize.h / 2) * k + cssH / 2 }) };
    };

    // ════════ SCREEN ════════
    function build() {
      stopTimer();
      ctx.clearResult();
      ctx.setPhase('playing');
      canvas = h('canvas', { class: 'gm-pad gm-circle-pad', role: 'img', 'aria-label': 'Drawing area — draw one circle with your finger, pen or mouse' });
      side = h('div', { class: 'gm-side gm-circle-side' });
      ctx.body.replaceChildren(h('div', { class: 'gm-draw gm-circle' }, [
        h('div', { class: 'gm-pad-wrap' }, [canvas, h('div', { class: 'gm-circle-prompt', 'aria-hidden': 'true' })]),
        side
      ]));
      g2 = canvas.getContext('2d');
      canvas.style.touchAction = 'none';
      session.on(canvas, 'pointerdown', down);
      session.on(canvas, 'pointermove', move);
      session.on(canvas, 'pointerup', (e) => up(e, false));
      session.on(canvas, 'pointercancel', (e) => up(e, true));
      session.on(canvas, 'lostpointercapture', (e) => { if (pid !== null && e.pointerId === pid) up(e, false); });
      session.observe(canvas, size);
      size();
      hud();
      renderSide();
    }
    function size() {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      cssW = Math.max(1, Math.round(r.width)); cssH = Math.max(1, Math.round(r.height));
      const bw = Math.round(cssW * dpr), bh = Math.round(cssH * dpr);
      if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
      draw();
    }
    function newGame() {
      game = cfg.mode === 'teams' ? { teams: ctx.E.createTeams(cfg.names.map((x, i) => (x || '').trim() || DEFAULT_NAMES[i])), total: cfg.names.length * cfg.turns, turn: 0, log: [] } : null;
      if (game) { cfg.names = game.teams.list.map((t) => t.name); saveCfg(); }
      attempts = []; targetIdx = 0; waitingNext = false;
      clearDrawing();
      build();
    }
    function clearDrawing() { stopTimer(); pts = null; live = null; result = null; added = false; drawSize = null; if (pid !== null) pid = null; }
    const teamNow = () => (game ? game.teams.list[game.turn % game.teams.list.length] : null);

    // ════════ DRAWING ════════
    const local = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    function down(e) {
      if (pid !== null || (e.pointerType === 'mouse' && e.button !== 0) || ctx.lifecycle.phase !== 'playing') return;
      if (waitingNext) { ctx.toast(`Press “${nextLabel()}” first`); return; }
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* synthetic events */ }
      clearDrawing();
      size();   // always measure against the pad's real size right now
      pid = e.pointerId;
      drawSize = { w: cssW, h: cssH };
      pts = [local(e)];
      if (cfg.limit) {
        timer = session.countdown(LEVELS[cfg.level].seconds, {
          onTick: (l) => { const t = document.querySelector('[data-timer]'); if (t) { t.textContent = `⏱ ${l} s`; t.classList.toggle('is-low', l <= 3); } if (l > 0 && l <= 3) tone([880], 0.05); },
          onEnd: () => { timer = null; if (pid !== null) { ctx.toast("Time's up — measuring what you drew"); finish(); } }
        });
        timer.start();
      }
      hud();
      draw();
    }
    function move(e) {
      if (e.pointerId !== pid || !pts) return;
      const evs = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
      (evs.length ? evs : [e]).forEach((ev) => {
        const p = local(ev), last = pts[pts.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) >= 0.75) pts.push(p);
      });
      // live % at most ~20 times a second; the line itself is redrawn on every move
      const now = performance.now();
      if (now - lastLive > 50) updateLive();
      else if (!liveTimer) liveTimer = session.setTimeout(() => { liveTimer = null; if (pid !== null && pts) { updateLive(); draw(); } }, 50);   // trailing update so the % never goes stale
      draw();
    }
    function updateLive() {
      lastLive = performance.now();
      live = CS.liveAccuracy(pts, { minSize: Math.min(40, minSize()) });
    }
    function up(e, cancelled) {
      if (pid === null || (e && e.pointerId !== pid)) return;
      if (cancelled) { clearDrawing(); draw(); hud(); ctx.toast('Drawing was interrupted — draw your circle again.'); return; }
      finish();
    }
    function finish() {
      if (pid === null) return;
      pid = null; live = null;
      stopTimer();
      const t = target();
      if (t) {
        const u = unitPx(), ox = cssW / 2, oy = cssH / 2;
        const grid = pts.map((p) => ({ x: (p.x - ox) / u, y: (oy - p.y) / u }));
        const r = CS.accuracyAgainstTarget(grid, t, { minSize: Math.max(1.5, minSize() / u) });
        // the fit back in pad pixels for drawing
        result = r.ok ? Object.assign({}, r, { metrics: Object.assign({}, r.metrics, { center: { x: ox + r.metrics.center.x * u, y: oy - r.metrics.center.y * u }, radius: r.metrics.radius * u }) })
          : Object.assign({}, r, r.box ? { box: { x: ox + r.box.x * u, y: oy - r.box.y * u } } : {});
      } else {
        result = CS.accuracy(pts, { minSize: minSize() });
      }
      if (!result.box && pts.length) { const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y); result.box = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }; }
      const goal = LEVELS[cfg.level].goal;
      if (result.ok) {
        const k = bestKey(), isBest = !best[k] || result.percent > best[k];
        result.isBest = isBest && !game;
        if (isBest) { best[k] = result.percent; store.set(BEST_KEY, best); }
        attempts.unshift(result.percent); attempts = attempts.slice(0, 8);
        tone(result.percent >= goal ? [523, 659, 784, 1047] : result.percent >= goal - 15 ? [523, 659] : [330, 262], 0.11);
        ctx.announce(`${fmt(result.percent)}. ${verdict(result.percent)} ${result.feedback[0] || ''}`);
      } else {
        tone([260, 200], 0.1);
        ctx.announce(result.message);
      }
      if (game && result.ok) {
        const team = teamNow();
        game.teams.award(team.id, result.percent);
        game.log.push({ team: team.id, percent: result.percent, target: t ? equation(t) : null });
        waitingNext = true;
      }
      draw(); hud(); renderSide();
    }

    // ════════ CANVAS ════════
    function background() {
      g2.fillStyle = '#ffffff'; g2.fillRect(0, 0, cssW, cssH);
      const t = target();
      if (!t) return;
      const u = unitPx(), ox = cssW / 2, oy = cssH / 2;
      for (let i = -Math.ceil(ox / u); i <= Math.ceil(ox / u); i++) { g2.strokeStyle = i === 0 ? '#334155' : '#e2e8f0'; g2.lineWidth = i === 0 ? 2 : 1; g2.beginPath(); g2.moveTo(ox + i * u, 0); g2.lineTo(ox + i * u, cssH); g2.stroke(); }
      for (let j = -Math.ceil(oy / u); j <= Math.ceil(oy / u); j++) { g2.strokeStyle = j === 0 ? '#334155' : '#e2e8f0'; g2.lineWidth = j === 0 ? 2 : 1; g2.beginPath(); g2.moveTo(0, oy + j * u); g2.lineTo(cssW, oy + j * u); g2.stroke(); }
      g2.fillStyle = '#64748b'; g2.font = `${Math.max(11, u * 0.4)}px system-ui, sans-serif`; g2.textAlign = 'left'; g2.textBaseline = 'alphabetic';
      for (let i = -7; i <= 7; i++) if (i) g2.fillText(String(i), ox + i * u + 3, oy + u * 0.45);
      for (let j = -7; j <= 7; j++) if (j) g2.fillText(String(-j), ox + 4, oy + j * u - 4);
      if (cfg.showCentre) { g2.fillStyle = '#dc2626'; g2.beginPath(); g2.arc(ox + t.cx * u, oy - t.cy * u, ctx.px(5), 0, Math.PI * 2); g2.fill(); }
    }
    /** The stroke, coloured part by part by its distance from the fitted circle (when there is one). */
    function strokeLine(P0, fit, M) {
      const P = P0.map(M);
      g2.lineCap = 'round'; g2.lineJoin = 'round'; g2.lineWidth = ctx.px(5);
      if (!fit) {
        g2.strokeStyle = INK; g2.beginPath();
        P.forEach((p, i) => (i ? g2.lineTo(p.x, p.y) : g2.moveTo(p.x, p.y)));
        if (P.length === 1) g2.lineTo(P[0].x + 0.01, P[0].y);
        g2.stroke(); return;
      }
      let col = null;
      for (let i = 1; i < P.length; i++) {
        const a = P[i - 1], b = P[i];
        const e = Math.abs(Math.hypot(b.x - fit.cx, b.y - fit.cy) - fit.r) / fit.r;
        const c = errColor(e);
        if (c !== col) { if (col) g2.stroke(); col = c; g2.strokeStyle = c; g2.beginPath(); g2.moveTo(a.x, a.y); }
        g2.lineTo(b.x, b.y);
      }
      if (col) g2.stroke();
    }
    function bubble(x, y, big, small, colr, alpha = 1) {
      const fs = Math.round(big.size);
      g2.save();
      g2.globalAlpha = alpha;
      g2.textAlign = 'center'; g2.textBaseline = 'middle';
      g2.font = `900 ${fs}px system-ui, sans-serif`;
      const w1 = g2.measureText(big.text).width;
      const fs2 = Math.round(Math.max(ctx.px(14), fs * 0.3));
      g2.font = `800 ${fs2}px system-ui, sans-serif`;
      const w2 = small ? g2.measureText(small).width : 0;
      const bw = Math.max(w1, w2) + fs * 0.6, bh = fs * 1.15 + (small ? fs2 * 1.5 : 0);
      // keep the label on screen even when the circle runs off an edge
      const cx = Math.min(cssW - bw / 2 - 4, Math.max(bw / 2 + 4, x)), cy = Math.min(cssH - bh / 2 - 4, Math.max(bh / 2 + 4, y));
      g2.fillStyle = 'rgba(255,255,255,.88)';
      g2.beginPath();
      if (g2.roundRect) g2.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, fs * 0.3); else g2.rect(cx - bw / 2, cy - bh / 2, bw, bh);
      g2.fill();
      g2.fillStyle = colr; g2.font = `900 ${fs}px system-ui, sans-serif`;
      g2.fillText(big.text, cx, cy - (small ? fs2 * 0.7 : 0));
      if (small) { g2.fillStyle = '#334155'; g2.font = `800 ${fs2}px system-ui, sans-serif`; g2.fillText(small, cx, cy + fs * 0.5); }
      g2.restore();
    }
    function draw() {
      if (!g2) return;
      g2.setTransform(dpr, 0, 0, dpr, 0, 0);
      g2.clearRect(0, 0, cssW, cssH);
      background();
      const { M, k } = mapNow(), t = target(), goal = LEVELS[cfg.level].goal;
      const prompt = canvas.parentElement.querySelector('.gm-circle-prompt');
      const team = teamNow();
      if (prompt) {
        prompt.textContent = pts ? '' : (team ? `${team.name}: ` : '') + (t ? `Draw  ${equation(t)}` : 'Draw a circle anywhere — lift to finish');
        prompt.hidden = !!pts;
      }
      if (!pts) return;
      if (pid !== null) {
        // drawing now: colour by the live fit and show the live % inside the circle
        const fit = live ? { cx: live.center.x, cy: live.center.y, r: live.radius } : null;
        strokeLine(pts, fit, (q) => q);
        if (live) bubble(live.center.x, live.center.y, { text: fmt(live.percent), size: Math.min(ctx.px(84), Math.max(ctx.px(26), live.radius * 0.42)) }, null, pctColor(live.percent, goal), 0.8);
        return;
      }
      if (!result) { strokeLine(pts, null, M); return; }
      if (!result.ok) {
        strokeLine(pts, null, M);
        const b = result.box || { x: cssW / 2, y: cssH / 2 };
        const bb = M(b);
        bubble(bb.x, bb.y, { text: '✗', size: ctx.px(44) }, result.message, '#b91c1c');
        return;
      }
      const m = result.metrics, mc = M(m.center), fit = { cx: mc.x, cy: mc.y, r: m.radius * k };
      // ideal circle (dashed) that best fits the drawing, and the geometry target
      g2.save();
      g2.setLineDash([ctx.px(10), ctx.px(8)]); g2.strokeStyle = 'rgba(22,163,74,.75)'; g2.lineWidth = ctx.px(3);
      g2.beginPath(); g2.arc(fit.cx, fit.cy, fit.r, 0, Math.PI * 2); g2.stroke();
      if (t) {
        const u = unitPx();
        g2.setLineDash([ctx.px(3), ctx.px(6)]); g2.strokeStyle = '#dc2626'; g2.lineWidth = ctx.px(2.5);
        g2.beginPath(); g2.arc(cssW / 2 + t.cx * u, cssH / 2 - t.cy * u, t.r * u, 0, Math.PI * 2); g2.stroke();
      }
      g2.restore();
      strokeLine(pts, fit, M);
      if (!result.closed && pts.length > 1) {
        const a = M(pts[0]), b = M(pts[pts.length - 1]);
        g2.save(); g2.setLineDash([ctx.px(4), ctx.px(4)]); g2.strokeStyle = '#f97316'; g2.lineWidth = ctx.px(3);
        g2.beginPath(); g2.moveTo(a.x, a.y); g2.lineTo(b.x, b.y); g2.stroke(); g2.restore();
      }
      g2.fillStyle = '#16a34a'; g2.beginPath(); g2.arc(fit.cx, fit.cy, ctx.px(3.5), 0, Math.PI * 2); g2.fill();
      const label = result.isBest && attempts.length > 1 ? `🏅 New best! ${verdict(result.percent)}` : verdict(result.percent);
      bubble(fit.cx, fit.cy, { text: fmt(result.percent), size: Math.min(ctx.px(110), Math.max(ctx.px(34), fit.r * 0.5)) }, label, pctColor(result.percent, goal));
    }

    // ════════ HUD & SIDE PANEL ════════
    function hud() {
      const lv = LEVELS[cfg.level];
      ctx.setHud([
        h('span', { class: 'gm-pill', text: `${cfg.kind === 'geometry' ? '📐 Geometry' : '⭕ Circle'} · ${lv.label}` }),
        h('span', { class: 'gm-pill', text: `🎯 Goal ${lv.goal}%` }),
        cfg.limit ? h('span', { class: 'gm-pill gm-timer', 'data-timer': '', text: `⏱ ${timer ? timer.left : lv.seconds} s` }) : null,
        game ? h('span', { class: 'gm-pill', text: `Turn ${Math.min(game.turn + 1, game.total)}/${game.total}` }) : h('span', { class: 'gm-pill', 'data-best': '', text: `🏅 Best ${best[bestKey()] ? fmt(best[bestKey()]) : '—'}` })
      ].filter(Boolean));
    }
    const nextLabel = () => (game && game.turn + 1 >= game.total ? '🏆 See results' : game ? `▶ ${game.teams.list[(game.turn + 1) % game.teams.list.length].name}'s turn` : '');
    function nextTurn() {
      if (!game || !waitingNext) return;
      waitingNext = false;
      game.turn++;
      if (game.turn >= game.total) { final(); return; }
      if (cfg.kind === 'geometry') targetIdx++;
      clearDrawing(); draw(); hud(); renderSide();
      ctx.announce(`${teamNow().name}'s turn`);
    }
    function renderSide() {
      if (!side) return;
      const lv = LEVELS[cfg.level], t = target(), team = teamNow();
      const r = result;
      const status = [];
      if (team) status.push(h('div', { class: 'gm-circle-turn' }, [h('span', { class: 'gm-team-badge', style: `--team:${color(team.id)}`, 'data-turn': '', text: `▶ ${team.name}` }), h('span', { class: 'gm-note', text: waitingNext ? 'circle scored' : 'draw your circle' })]));
      if (t) status.push(h('p', { class: 'gm-circle-eq', text: equation(t) }), cfg.showCentre ? h('p', { class: 'gm-note', text: `Centre (${t.cx}, ${t.cy}) · radius ${t.r} squares` }) : null);
      if (r && r.ok) {
        status.push(h('ul', { class: 'gm-feedback', 'aria-label': 'Tips' }, r.feedback.slice(0, 3).map((f) => h('li', { text: f }))));
        status.push(h('p', { class: 'gm-note', text: r.percent >= lv.goal ? `✓ Goal ${lv.goal}% reached` : `Goal ${lv.goal}% — ${(lv.goal - r.percent).toFixed(1)}% to go` }));
      } else if (r && !r.ok) status.push(h('p', { class: 'gm-circle-warn', text: r.message }));
      else if (!pts) status.push(h('p', { class: 'gm-note', text: team ? 'One circle per turn. Lift your pen to finish.' : 'Draw again any time to try for a better score.' }));
      const actions = h('div', { class: 'gm-row gm-circle-actions' }, [
        waitingNext ? h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-next': '', text: nextLabel(), on: { click: nextTurn } }) : null,
        !game && r ? h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-clear': '', text: '↻ Clear', on: { click: () => { clearDrawing(); draw(); hud(); renderSide(); } } }) : null,
        !game && t ? h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-newtarget': '', text: '⏭ New target', on: { click: () => { targetIdx++; clearDrawing(); draw(); renderSide(); } } }) : null,
        r && r.ok && !added ? h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-addboard': '', text: '📋 Add to board', on: { click: () => {
          const { M } = mapNow();
          const n = ctx.addStrokesToBoard([{ color: INK, width: ctx.px(4), points: pts.map(M) }]);
          added = n > 0; ctx.toast(n ? 'Circle added to the board — Undo on the board removes it' : 'Nothing to add'); renderSide();
        } } }) : null
      ].filter(Boolean));
      const recent = !game && attempts.length ? h('div', { class: 'gm-circle-recent', 'aria-label': 'Recent scores' }, [h('span', { class: 'gm-choice-label', text: 'Recent' }), ...attempts.map((p) => h('span', { class: 'gm-circle-score' + (p >= lv.goal ? ' is-goal' : ''), text: fmt(p) }))]) : null;
      const scores = game ? h('div', { class: 'gm-scoreboard gm-circle-scores', role: 'group', 'aria-label': 'Scores' }, game.teams.list.map((tm) => h('div', { class: 'gm-scorecard' + (tm.id === team.id ? ' is-turn' : ''), style: `--team:${color(tm.id)}` }, [
        h('span', { class: 'gm-scorecard-name', text: tm.name }), h('span', { class: 'gm-scorecard-score', text: (Math.round(tm.score * 10) / 10).toFixed(1) })
      ]))) : null;
      side.replaceChildren(...[...status, actions, recent, scores,
        h('button', { type: 'button', class: 'gm-btn gm-ghost gm-circle-settings-btn', 'data-settings': '', text: `⚙ Settings · ${cfg.kind === 'geometry' ? 'Geometry' : 'Circle'} · ${lv.label}${cfg.mode === 'teams' ? ` · ${cfg.names.length} teams` : ''}`, on: { click: settings } })
      ].filter(Boolean));
    }

    // ════════ SETTINGS (same layout as the other games' setup; drawing never waits for it) ════════
    function settings() {
      if (pid !== null) return;
      stopTimer();
      const snap = () => JSON.stringify([cfg.kind, cfg.level, cfg.mode, cfg.names, cfg.turns]);
      const before = snap();
      ctx.setHud([]);
      const names = h('div', { class: 'gm-team-names' });
      const count = h('span', { class: 'gm-stepper-value' });
      const minus = h('button', { type: 'button', class: 'gm-btn gm-stepper-btn', 'aria-label': 'Fewer teams', text: '−', on: { click: () => { if (cfg.names.length > 2) { cfg.names.pop(); drawNames(); } } } });
      const plus = h('button', { type: 'button', class: 'gm-btn gm-stepper-btn', 'aria-label': 'More teams', text: '+', on: { click: () => { if (cfg.names.length < 6) { cfg.names.push(DEFAULT_NAMES[cfg.names.length]); drawNames(); } } } });
      function drawNames() {
        count.textContent = String(cfg.names.length);
        minus.disabled = cfg.names.length <= 2; plus.disabled = cfg.names.length >= 6;
        names.replaceChildren(...cfg.names.map((n, i) => h('label', { class: 'gm-name-field', style: `--team:${color(i)}` }, [
          h('span', { class: 'gm-name-dot', 'aria-hidden': 'true', text: String(i + 1) }),
          h('input', { type: 'text', class: 'gm-input', value: n, maxlength: '24', 'aria-label': `Name of team ${i + 1}`, on: { input: (e) => { cfg.names[i] = e.target.value.slice(0, 24); } } })
        ])));
      }
      drawNames();
      const teamBox = h('div', { class: 'gm-setup-col', hidden: cfg.mode !== 'teams' }, [
        h('div', { class: 'gm-choice' }, [h('span', { class: 'gm-choice-label', text: 'Teams' }), h('div', { class: 'gm-stepper', role: 'group', 'aria-label': 'Number of teams' }, [minus, count, plus])]),
        names,
        chips('Turns each', [1, 2, 3].map((n) => ({ value: n, label: `${n} turn${n > 1 ? 's' : ''}` })), cfg.turns, (v) => { cfg.turns = v; }),
        h('p', { class: 'gm-note', text: 'Teams take turns, one circle each turn. Each team scores its accuracy %; the highest total wins.' })
      ]);
      const geoBox = h('div', { hidden: cfg.kind !== 'geometry' }, [chips('Centre & radius', [{ value: true, label: 'Show (learning)' }, { value: false, label: 'Hide (challenge)' }], cfg.showCentre, (v) => { cfg.showCentre = v; })]);
      const limitWrap = h('div');
      const drawLimit = () => limitWrap.replaceChildren(chips('Time limit', [{ value: false, label: '😌 Off' }, { value: true, label: `⏱ On · ${LEVELS[cfg.level].seconds} s` }], cfg.limit, (v) => { cfg.limit = v; }));
      drawLimit();
      const done = () => {
        cfg.names = cfg.names.map((n, i) => (n || '').trim() || DEFAULT_NAMES[i]);
        saveCfg();
        if (snap() !== before) { if (JSON.parse(before)[0] !== cfg.kind || JSON.parse(before)[1] !== cfg.level) attempts = []; targetIdx = 0; newGame(); }
        else build();
      };
      ctx.body.replaceChildren(h('div', { class: 'gm-setup gm-setup-wide gm-circle-setup' }, [
        h('h3', { text: 'Circle Challenge — settings' }),
        h('p', { text: 'Your accuracy % appears inside the circle you draw. 100% is a perfect circle.' }),
        h('div', { class: 'gm-setup-2col' }, [
          h('section', { class: 'gm-setup-col', 'aria-label': 'Players' }, [
            chips('Players', [{ value: 'class', label: '👥 Whole class' }, { value: 'teams', label: '🏁 Teams' }], cfg.mode, (v) => { cfg.mode = v; teamBox.hidden = v !== 'teams'; }),
            teamBox
          ]),
          h('section', { class: 'gm-setup-col', 'aria-label': 'Game settings' }, [
            chips('Mode', [{ value: 'free', label: '⭕ Perfect circle' }, { value: 'geometry', label: '📐 Geometry target' }], cfg.kind, (v) => { cfg.kind = v; geoBox.hidden = v !== 'geometry'; }),
            chips('Level', Object.entries(LEVELS).map(([k, x]) => ({ value: k, label: `${x.label} · goal ${x.goal}%` })), cfg.level, (v) => { cfg.level = v; drawLimit(); }),
            limitWrap,
            h('p', { class: 'gm-note', text: 'The time limit starts when the pen first touches the board.' }),
            geoBox,
            chips('Sound', [{ value: true, label: 'On' }, { value: false, label: 'Off' }], cfg.sound, (v) => { cfg.sound = v; })
          ])
        ]),
        h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-done': '', text: '✓ Back to drawing', on: { click: done } })
      ]));
    }

    function final() {
      stopTimer();
      tone([523, 659, 784, 1047], 0.14);
      const rank = game.teams.list.slice().sort((a, b) => b.score - a.score);
      const winners = rank.filter((t) => Math.abs(t.score - rank[0].score) < 0.05);
      const turnsOf = (id) => game.log.filter((x) => x.team === id);
      let place = 0, last = null;
      ctx.showResult({
        icon: '🏆', title: winners.length > 1 ? `It's a tie: ${winners.map((t) => t.name).join(' & ')}` : `${winners[0].name} wins!`,
        extra: h('div', { class: 'gm-final-body' }, [h('ol', { class: 'gm-podium' }, rank.map((t, i) => {
          if (last === null || Math.abs(t.score - last) >= 0.05) { place = i + 1; last = t.score; }
          const mine = turnsOf(t.id);
          return h('li', { style: `--team:${color(t.id)}` }, [
            h('span', { class: 'gm-podium-medal', text: place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.` }),
            h('span', { class: 'gm-podium-name', text: `${t.name}${mine.length ? ` (${mine.map((x) => fmt(x.percent)).join(', ')})` : ''}` }),
            h('span', { class: 'gm-podium-score', text: `${(Math.round(t.score * 10) / 10).toFixed(1)} pts` })
          ]);
        }))]),
        actions: [{ label: '↻ Play again', primary: true, onClick: newGame }, { label: '⭕ Practise alone', onClick: () => { cfg.mode = 'class'; saveCfg(); newGame(); } }]
      });
      ctx.body.querySelector('.gm-result')?.classList.add('gm-result-wide');
    }

    newGame();
    return {
      hasProgress: () => pid !== null || (!!game && game.turn < game.total && game.log.length > 0),
      unmount: stopTimer,
      _result: () => result, _cfg: () => cfg, _game: () => game, _timer: () => timer, _live: () => live, _points: () => pts, _resize: () => size()
    };
  });
})();
