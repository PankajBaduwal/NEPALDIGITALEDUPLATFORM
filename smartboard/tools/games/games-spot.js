'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — SPOT THE DIFFERENCE
// • Pick one or more pictures to play in a row (samples or the teacher's own photos)
// • Teacher pictures: upload an original and a changed copy, tap to mark each difference
//   (label + size), saved on this device, import/export .json
// • Whole class or 2–6 teams taking turns (a find scores 1 and keeps the turn; a miss passes it)
// • Difficulty: tap size, hints per picture and (Hard) a short lock after a wrong tap
// • Optional timer per picture (time up shows the rest), stars and a summary at the end
// • Keyboard: Tab to a picture, arrows move a crosshair, Enter checks that spot
// Rules live in GameEngine.spot; this file is only the screens.
// ═══════════════════════════════════════════════════════════
(() => {
  if (typeof GamesHub === 'undefined') return;
  const { h } = GamesHub;

  const SETTINGS_KEY = 'gm_spot_settings_v1';
  const SCENES_KEY = 'gm_spot_scenes_v1';
  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];
  const DEFAULT_NAMES = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'];
  const NS = 'http://www.w3.org/2000/svg';
  /** Tap radius (CSS px), hints per picture and the lock after a wrong tap (ms). */
  const LEVELS = {
    easy: { minR: 36, hints: Infinity, lock: 0 },
    normal: { minR: 24, hints: 3, lock: 0 },
    hard: { minR: 16, hints: 1, lock: 1500 }
  };
  const SIZES = [{ value: 0.05, label: 'S' }, { value: 0.08, label: 'M' }, { value: 0.12, label: 'L' }];
  const MAX_SIDE = 1000;

  const store = {
    get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    /** Returns true, or the reason it failed ('quota' | 'blocked'). */
    set(key, v) {
      try { localStorage.setItem(key, JSON.stringify(v)); return true; }
      catch (e) { return e && (e.name === 'QuotaExceededError' || e.code === 22) ? 'quota' : 'blocked'; }
    }
  };
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  function chips(label, options, value, onChange, { multi = false } = {}) {
    const wrap = h('div', { class: 'gm-choice', role: 'group', 'aria-label': label }, [h('span', { class: 'gm-choice-label', text: label })]);
    options.forEach((o, i) => wrap.appendChild(h('button', {
      type: 'button', class: 'gm-chip', 'aria-pressed': String(multi ? value.includes(o.value) : o.value === value), text: o.label,
      on: { click: (e) => {
        if (multi) { onChange(o.value, e.currentTarget); return; }
        wrap.querySelectorAll('.gm-chip').forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); onChange(o.value);
      } }
    })));
    return wrap;
  }
  function svgEl(parent, tag, attrs, text) {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  /** One picture of a scene as SVG: sample scenes are drawn from shapes, teacher scenes are images. */
  function sceneSvg(sc, variant) {
    const svg = svgEl(null, 'svg', { viewBox: `0 0 ${sc.w} ${sc.h}`, preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' });
    if (sc.imgA) {
      const img = svgEl(svg, 'image', { x: 0, y: 0, width: sc.w, height: sc.h, preserveAspectRatio: 'none' });
      img.setAttribute('href', variant === 'a' ? sc.imgA : sc.imgB);
    } else {
      sc.elements.filter((el) => !el.only || el.only === variant).forEach((el) => {
        const tag = { rect: 'rect', circle: 'circle', ellipse: 'ellipse', line: 'line', poly: 'polygon', path: 'path' }[el.t];
        const map = { rect: ['x', 'y', ['width', 'w'], ['height', 'h']], circle: ['cx', 'cy', 'r'], ellipse: ['cx', 'cy', 'rx', 'ry'], line: ['x1', 'y1', 'x2', 'y2'], poly: ['points'], path: ['d'] }[el.t];
        const attrs = {};
        map.forEach((k) => { const [attr, key] = Array.isArray(k) ? k : [k, k]; attrs[attr] = el[key]; });
        attrs.fill = el.fill || 'none';
        if (el.stroke) { attrs.stroke = el.stroke; attrs['stroke-width'] = el.sw || 2; }
        svgEl(svg, tag, attrs);
      });
    }
    svgEl(svg, 'g', { class: 'gm-spot-marks' });
    return svg;
  }
  /** A numbered green circle around a difference (sizes scale with the picture). */
  function drawFound(g, sc, hs, num, { color = '#16a34a', dashed = false } = {}) {
    const k = sc.h / 300, cx = hs.x * sc.w, cy = hs.y * sc.h, r = hs.r * sc.h;
    svgEl(g, 'circle', { cx, cy, r, fill: 'none', stroke: '#fff', 'stroke-width': 7 * k, opacity: 0.85 });
    svgEl(g, 'circle', { cx, cy, r, fill: 'none', stroke: color, 'stroke-width': 4 * k, ...(dashed ? { 'stroke-dasharray': `${7 * k} ${5 * k}` } : {}) });
    const bx = Math.min(sc.w - 12 * k, cx + r * 0.75), by = Math.max(12 * k, cy - r * 0.75);
    svgEl(g, 'circle', { cx: bx, cy: by, r: 11 * k, fill: color, stroke: '#fff', 'stroke-width': 2 * k });
    svgEl(g, 'text', { x: bx, y: by + 5 * k, 'text-anchor': 'middle', 'font-size': 14 * k, 'font-weight': 800, fill: '#fff' }, String(num));
  }
  /** Read an image file and scale it to at most MAX_SIDE px. Resolves an HTMLImageElement. */
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => (img.naturalWidth && img.naturalHeight ? resolve(img) : reject(new Error('empty')));
      img.onerror = () => reject(new Error('unreadable'));
      img.src = src;
    });
  }
  function encode(img, w, hgt) {
    const c = document.createElement('canvas');
    c.width = w; c.height = hgt;
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, hgt);
    g.drawImage(img, 0, 0, w, hgt);
    return c.toDataURL('image/jpeg', 0.82);
  }

  GamesHub.register('spot', (ctx) => {
    const { E, C, session } = ctx;
    const S = E.spot;
    const saved = store.get(SETTINGS_KEY) || {};
    const cfg = {
      mode: saved.mode === 'teams' ? 'teams' : 'class',
      names: Array.isArray(saved.names) && saved.names.length >= 2 ? saved.names.slice(0, 6).map((n, i) => String(n || DEFAULT_NAMES[i]).slice(0, 24)) : DEFAULT_NAMES.slice(0, 2),
      level: LEVELS[saved.level] ? saved.level : 'normal',
      timer: [0, 60, 90, 120].includes(saved.timer) ? saved.timer : 0,
      sound: saved.sound !== false,
      picks: Array.isArray(saved.picks) && saved.picks.length ? saved.picks : [C.spot[0].id]
    };
    let game = null, s = null, root = null, timer = null, clock = null, elapsed = 0, audio = null;
    let hintsLeft = 0, locked = false, hintId = null, cursor = { x: 0.5, y: 0.5 };

    const myScenes = () => (store.get(SCENES_KEY) || []).map((r) => { const n = E.normalizeSpotScene(r); return n.scene ? Object.assign(n.scene, { id: r.id }) : null; }).filter(Boolean);
    const allScenes = () => C.spot.concat(myScenes());
    const byId = (id) => allScenes().find((x) => x.id === id);
    const saveCfg = () => store.set(SETTINGS_KEY, cfg);
    const color = (id) => COLORS[id % COLORS.length];
    const level = () => LEVELS[cfg.level];

    ctx.setHelp([
      'The two pictures look the same, but some things are different. Tap a difference on either picture.',
      'Found differences are circled and numbered on both pictures. A wrong tap shows a small ✗.',
      'Teams take turns: a correct find scores 1 point and the team keeps going; a wrong tap passes the turn.',
      '💡 Hint rings the area of a difference. Easy: unlimited hints · Normal: 3 · Hard: 1 per picture, and a wrong tap locks the pictures for a moment.',
      'Keyboard: Tab to a picture, move the crosshair with the arrow keys (Shift = bigger steps) and press Enter to check that spot.',
      'Teachers: “+ Add my picture” lets you upload two photos and tap the differences yourself.'
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
    function stopClocks() { if (timer) { timer.stop(); timer = null; } if (clock !== null) { session.clearInterval(clock); clock = null; } }
    session.onDispose(() => { stopClocks(); if (audio) { try { audio.close(); } catch (e) { /* ignore */ } audio = null; } });

    // ════════ SETUP ════════
    function setup() {
      stopClocks();
      game = null; s = null; root = null;
      ctx.setPhase('idle'); ctx.setHud([]);
      const all = allScenes();
      cfg.picks = cfg.picks.filter((id) => all.some((x) => x.id === id));
      if (!cfg.picks.length) cfg.picks = [C.spot[0].id];
      const mine = myScenes();

      const names = h('div', { class: 'gm-team-names' });
      const count = h('span', { class: 'gm-stepper-value', text: String(cfg.names.length) });
      const minus = h('button', { type: 'button', class: 'gm-btn gm-stepper-btn', 'aria-label': 'Fewer teams', text: '−' });
      const plus = h('button', { type: 'button', class: 'gm-btn gm-stepper-btn', 'aria-label': 'More teams', text: '+' });
      function drawNames() {
        count.textContent = String(cfg.names.length);
        minus.disabled = cfg.names.length <= 2; plus.disabled = cfg.names.length >= 6;
        names.replaceChildren(...cfg.names.map((n, i) => h('label', { class: 'gm-name-field', style: `--team:${color(i)}` }, [
          h('span', { class: 'gm-name-dot', 'aria-hidden': 'true', text: String(i + 1) }),
          h('input', { type: 'text', class: 'gm-input', value: n, maxlength: '24', 'aria-label': `Name of team ${i + 1}`, on: { input: (e) => { cfg.names[i] = e.target.value.slice(0, 24); }, change: saveCfg } })
        ])));
      }
      minus.addEventListener('click', () => { if (cfg.names.length > 2) { cfg.names.pop(); drawNames(); saveCfg(); } });
      plus.addEventListener('click', () => { if (cfg.names.length < 6) { cfg.names.push(DEFAULT_NAMES[cfg.names.length]); drawNames(); saveCfg(); } });
      drawNames();
      const teamBox = h('div', { class: 'gm-setup-col', hidden: cfg.mode !== 'teams' }, [
        h('div', { class: 'gm-choice' }, [h('span', { class: 'gm-choice-label', text: 'Teams' }), h('div', { class: 'gm-stepper', role: 'group', 'aria-label': 'Number of teams' }, [minus, count, plus])]),
        names,
        h('p', { class: 'gm-note', text: 'A find scores 1 and the team keeps going; a wrong tap passes the turn.' })
      ]);
      const info = h('span', { class: 'gm-note' });
      const startBtn = h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-startgame': '', text: '▶ Start', on: { click: start } });
      const updateInfo = () => {
        const n = cfg.picks.map(byId).filter(Boolean).reduce((t, x) => t + x.hotspots.length, 0);
        info.textContent = `${cfg.picks.length} picture${cfg.picks.length === 1 ? '' : 's'} selected · ${n} differences — played in a row`;
        startBtn.disabled = !cfg.picks.length;
      };
      const pickChips = chips('Pictures', all.map((x) => ({ value: x.id, label: (String(x.id).startsWith('my-') ? '⭐ ' : '') + x.title })), cfg.picks, (v, btn) => {
        const on = cfg.picks.includes(v);
        if (on && cfg.picks.length === 1) { ctx.toast('Keep at least one picture'); return; }
        cfg.picks = on ? cfg.picks.filter((x) => x !== v) : cfg.picks.concat(v);
        btn.setAttribute('aria-pressed', String(!on)); saveCfg(); updateInfo();
      }, { multi: true });
      const left = h('section', { class: 'gm-setup-col', 'aria-label': 'Players' }, [
        chips('Players', [{ value: 'class', label: '👥 Whole class' }, { value: 'teams', label: '🏁 Teams' }], cfg.mode, (v) => { cfg.mode = v; saveCfg(); teamBox.hidden = v !== 'teams'; }),
        teamBox
      ]);
      const right = h('section', { class: 'gm-setup-col', 'aria-label': 'Game settings' }, [
        pickChips, info,
        h('div', { class: 'gm-row' }, [
          h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-new': '', text: '+ Add my picture', on: { click: () => editor(null) } }),
          ...mine.map((m) => h('span', { class: 'gm-mine-chip' }, [
            h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'data-edit': m.id, 'aria-label': `Edit ${m.title}`, text: `✎ ${m.title}`, on: { click: () => editor(m) } }),
            h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'data-delete': m.id, 'aria-label': `Delete ${m.title}`, text: '🗑', on: { click: async () => {
              if (!(await ctx.confirm({ title: `Delete “${m.title}”?`, text: 'This picture will be removed from this device.', ok: 'Delete', danger: true }))) return;
              store.set(SCENES_KEY, (store.get(SCENES_KEY) || []).filter((r) => r.id !== m.id)); setup();
            } } })
          ]))
        ]),
        chips('Difficulty', [{ value: 'easy', label: '🙂 Easy' }, { value: 'normal', label: '🎯 Normal' }, { value: 'hard', label: '🔥 Hard' }], cfg.level, (v) => { cfg.level = v; saveCfg(); }),
        chips('Timer', [{ value: 0, label: '😌 Off' }, { value: 60, label: '⏱ 60 s' }, { value: 90, label: '⏱ 90 s' }, { value: 120, label: '⏱ 120 s' }], cfg.timer, (v) => { cfg.timer = v; saveCfg(); }),
        chips('Sound', [{ value: true, label: 'On' }, { value: false, label: 'Off' }], cfg.sound, (v) => { cfg.sound = v; saveCfg(); })
      ]);
      ctx.body.replaceChildren(h('div', { class: 'gm-setup gm-setup-wide' }, [
        h('h3', { text: 'Spot the Difference' }),
        h('p', { text: 'Find every difference between the two pictures — sharp eyes and few wrong taps earn more stars!' }),
        h('div', { class: 'gm-setup-2col' }, [left, right]),
        cfg.picks.some((id) => !String(id).startsWith('my-')) ? h('p', { class: 'gm-sample', text: C.LABEL + '.' }) : null,
        startBtn
      ].filter(Boolean)));
      updateInfo();
    }

    // ════════ PICTURE EDITOR ════════
    function editor(base) {
      stopClocks();
      ctx.setPhase('idle'); ctx.setHud([]);
      const editingId = base && String(base.id).startsWith('my-') ? base.id : null;
      const ed = { srcA: null, srcB: null, w: base ? base.w : 0, h: base ? base.h : 0, imgA: base ? base.imgA : null, imgB: base ? base.imgB : null,
        spots: base ? base.hotspots.map((p) => ({ x: p.x, y: p.y, r: p.r, label: p.label })) : [] };
      const titleIn = h('input', { type: 'text', class: 'gm-input gm-set-title', maxlength: '40', placeholder: 'Name of this picture (e.g. Our school garden)', value: base ? base.title : '', 'aria-label': 'Picture name' });
      const errorsEl = h('div', { class: 'gm-editor-errors', role: 'alert' });
      const fileA = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', hidden: true, 'data-file': 'a' });
      const fileB = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', hidden: true, 'data-file': 'b' });
      const fileJson = h('input', { type: 'file', accept: '.json,application/json', hidden: true });
      const pics = h('div', { class: 'gm-spot-pics gm-spot-edit-pics' });
      const list = h('ol', { class: 'gm-spot-edit-list', 'aria-label': 'Differences' });
      const sizeNote = h('p', { class: 'gm-note' });
      let busy = false;

      // Picture 1 sets the size; picture 2 is scaled to the same size so the differences line up.
      function reencode() {
        const b = ed.srcA || ed.srcB;
        if (!b) return;
        const sc = Math.min(1, MAX_SIDE / Math.max(b.naturalWidth, b.naturalHeight));
        ed.w = Math.max(1, Math.round(b.naturalWidth * sc)); ed.h = Math.max(1, Math.round(b.naturalHeight * sc));
        if (ed.srcA) ed.imgA = encode(ed.srcA, ed.w, ed.h);
        if (ed.srcB) ed.imgB = encode(ed.srcB, ed.w, ed.h);
      }
      async function pick(which, file) {
        if (!file) return;
        if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) { ctx.toast('Please choose a PNG, JPEG, WebP or GIF picture'); return; }
        if (file.size > 15e6) { ctx.toast('That picture is too large (max 15 MB)'); return; }
        busy = true;
        try {
          const url = URL.createObjectURL(file);
          try { ed['src' + which] = await loadImage(url); } finally { URL.revokeObjectURL(url); }
          // keep the other picture's original pixels when both are loaded later from saved data
          const other = which === 'A' ? 'B' : 'A';
          if (!ed['src' + other] && ed['img' + other]) ed['src' + other] = await loadImage(ed['img' + other]);
          reencode();
          const a = ed.srcA, b2 = ed.srcB;
          if (a && b2 && Math.abs(a.naturalWidth / a.naturalHeight - b2.naturalWidth / b2.naturalHeight) > 0.02) ctx.toast('The two pictures have different shapes — picture 2 was stretched to match picture 1');
          else ctx.toast(`Picture ${which === 'A' ? 1 : 2} added`);
        } catch (e) { ctx.toast('Could not read that picture'); }
        busy = false;
        draw();
      }
      fileA.addEventListener('change', () => { pick('A', fileA.files && fileA.files[0]); fileA.value = ''; });
      fileB.addEventListener('change', () => { pick('B', fileB.files && fileB.files[0]); fileB.value = ''; });

      function draw() {
        const sc = { w: ed.w || 4, h: ed.h || 3, imgA: ed.imgA, imgB: ed.imgB };
        pics.style.setProperty('--ar', String(sc.w / sc.h));
        pics.replaceChildren(...['a', 'b'].map((v) => {
          const img = v === 'a' ? ed.imgA : ed.imgB;
          const fileIn = v === 'a' ? fileA : fileB;
          if (!img) {
            return h('button', { type: 'button', class: 'gm-spot-pic gm-spot-empty', 'data-upload': v, on: { click: () => fileIn.click() } }, [
              h('span', { text: v === 'a' ? '📷 Picture 1' : '📷 Picture 2' }),
              h('span', { class: 'gm-note', text: v === 'a' ? 'the original' : 'with the differences' })
            ]);
          }
          const svg = sceneSvg(Object.assign({}, sc, { imgA: sc.imgA || sc.imgB, imgB: sc.imgB || sc.imgA }), v);
          const wrap = h('div', { class: 'gm-spot-pic', 'data-variant': v, role: 'button', tabindex: '0', 'aria-label': `Picture ${v === 'a' ? 1 : 2}: tap to mark a difference` }, [svg]);
          wrap.addEventListener('pointerup', (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            const r = wrap.getBoundingClientRect();
            addSpot((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
          });
          wrap.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addSpot(0.5, 0.5); } });
          const g = svg.querySelector('.gm-spot-marks');
          ed.spots.forEach((p, i) => drawFound(g, sc, p, i + 1, { color: '#f59e0b' }));
          return wrap;
        }));
        list.replaceChildren(...ed.spots.map((p, i) => h('li', { class: 'gm-spot-edit-row' }, [
          h('span', { class: 'gm-name-dot', style: '--team:#f59e0b', 'aria-hidden': 'true', text: String(i + 1) }),
          h('input', { type: 'text', class: 'gm-input', maxlength: '50', value: p.label || '', placeholder: `What changed? (Difference ${i + 1})`, 'aria-label': `Description of difference ${i + 1}`, on: { input: (e) => { p.label = e.target.value; } } }),
          h('span', { class: 'gm-row gm-spot-sizes', role: 'group', 'aria-label': `Size of difference ${i + 1}` }, SIZES.map((z) => h('button', {
            type: 'button', class: 'gm-btn gm-mini gm-chip', 'aria-pressed': String(Math.abs(p.r - z.value) < 0.015), text: z.label,
            on: { click: () => { p.r = z.value; draw(); } }
          }))),
          h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'data-remove': String(i), 'aria-label': `Remove difference ${i + 1}`, text: '🗑', on: { click: () => { ed.spots.splice(i, 1); draw(); } } })
        ])));
        sizeNote.textContent = ed.imgA || ed.imgB
          ? `${ed.spots.length} of 10 differences marked. Tap a picture where something is different.`
          : 'Add both pictures first: the original and a copy where you changed a few things.';
      }
      function addSpot(x, y) {
        if (ed.spots.length >= 10) { ctx.toast('Up to 10 differences per picture'); return; }
        ed.spots.push({ x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)), r: 0.08, label: '' });
        draw();
        const inputs = list.querySelectorAll('input');
        inputs[inputs.length - 1]?.focus({ preventScroll: false });
      }
      const raw = () => ({ title: titleIn.value, w: ed.w, h: ed.h, imgA: ed.imgA, imgB: ed.imgB, hotspots: ed.spots });
      function save() {
        if (busy) { ctx.toast('Still loading the picture…'); return; }
        const n = E.normalizeSpotScene(raw());
        errorsEl.replaceChildren(...n.errors.slice(0, 4).map((m) => h('p', { text: '⚠ ' + m })));
        if (!n.scene) { ctx.toast('Please fix the points above, then save'); return; }
        const list2 = (store.get(SCENES_KEY) || []).filter((r) => r.id !== editingId);
        const id = editingId || `my-${Date.now().toString(36)}`;
        const sc = n.scene;
        list2.push({ id, title: sc.title, w: sc.w, h: sc.h, imgA: sc.imgA, imgB: sc.imgB, hotspots: sc.hotspots.map((p) => ({ x: p.x, y: p.y, r: p.r, label: p.label })) });
        const ok = store.set(SCENES_KEY, list2);
        if (ok !== true) { ctx.toast(ok === 'quota' ? 'This device is out of space for pictures — delete one of your pictures first' : 'Could not save on this device (storage is blocked)'); return; }
        if (!cfg.picks.includes(id)) cfg.picks = [id];
        saveCfg();
        ctx.toast(`Saved “${sc.title}” — ${sc.hotspots.length} difference${sc.hotspots.length === 1 ? '' : 's'}`);
        setup();
      }
      fileJson.addEventListener('change', () => {
        const f = fileJson.files && fileJson.files[0];
        fileJson.value = '';
        if (!f) return;
        if (f.size > 4e6) { ctx.toast('That file is too large'); return; }
        const rd = new FileReader();
        rd.onload = () => {
          let parsed = null;
          try { parsed = JSON.parse(String(rd.result)); } catch (e) { parsed = null; }
          const n = parsed ? E.normalizeSpotScene(parsed) : { scene: null };
          if (!n.scene) { ctx.toast('No usable picture found in that file'); return; }
          titleIn.value = n.scene.title;
          Object.assign(ed, { srcA: null, srcB: null, w: n.scene.w, h: n.scene.h, imgA: n.scene.imgA, imgB: n.scene.imgB, spots: n.scene.hotspots.map((p) => ({ x: p.x, y: p.y, r: p.r, label: p.label })) });
          draw();
          ctx.toast('Imported — press Save to keep it');
        };
        rd.readAsText(f);
      });
      function exportScene() {
        const n = E.normalizeSpotScene(raw());
        if (!n.scene) { ctx.toast('Finish the picture before exporting'); return; }
        const sc = n.scene;
        const blob = new Blob([JSON.stringify({ app: 'PiyushDhara Spot the Difference', version: 1, title: sc.title, w: sc.w, h: sc.h, imgA: sc.imgA, imgB: sc.imgB, hotspots: sc.hotspots.map((p) => ({ x: p.x, y: p.y, r: p.r, label: p.label })) })], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: 'spot-the-difference.json' });
        document.body.appendChild(a); a.click(); a.remove();
        session.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }
      ctx.body.replaceChildren(h('div', { class: 'gm-editor gm-spot-edit' }, [
        h('div', { class: 'gm-editor-head' }, [
          h('h3', { text: editingId ? '✎ Edit picture' : '✎ New picture' }),
          h('div', { class: 'gm-row' }, [
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '📷 Picture 1', on: { click: () => fileA.click() } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '📷 Picture 2', on: { click: () => fileB.click() } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '📂 Import', on: { click: () => fileJson.click() } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '💾 Export', on: { click: exportScene } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: 'Cancel', on: { click: setup } }),
            h('button', { type: 'button', class: 'gm-btn gm-primary', 'data-save': '', text: '✔ Save picture', on: { click: save } })
          ])
        ]),
        titleIn,
        sizeNote,
        errorsEl,
        h('div', { class: 'gm-editor-body gm-spot-edit-body' }, [pics, list]),
        fileA, fileB, fileJson
      ]));
      draw();
      titleIn.focus();
    }

    // ════════ GAME ════════
    function start() {
      stopClocks();
      const list = cfg.picks.map(byId).filter(Boolean);
      if (!list.length) { ctx.toast('Choose at least one picture'); return; }
      const teams = cfg.mode === 'teams' ? E.createTeams(cfg.names.map((x, i) => (x || '').trim() || DEFAULT_NAMES[i])) : null;
      if (teams) { cfg.names = teams.list.map((t) => t.name); saveCfg(); }
      game = { list, teams, idx: 0, turn: 0, history: [] };
      next();
    }
    const curScene = () => game.list[game.idx];

    function next() {
      stopClocks();
      ctx.clearResult();
      if (game.idx >= game.list.length) { final(); return; }
      const sc = curScene();
      s = E.createSpot(sc);
      elapsed = 0; locked = false; hintId = null; cursor = { x: 0.5, y: 0.5 };
      hintsLeft = level().hints;
      ctx.setPhase('playing');
      const pics = ['a', 'b'].map((v) => {
        const wrap = h('div', { class: 'gm-spot-pic', tabindex: '0', role: 'application', 'data-variant': v,
          'aria-label': `Picture ${v === 'a' ? '1' : '2'}. Use arrow keys to move the crosshair and Enter to check a spot.` }, [sceneSvg(sc, v)]);
        wrap.addEventListener('pointerup', (e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; const r = wrap.getBoundingClientRect(); tap((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, wrap); });
        wrap.addEventListener('focus', drawCursor);
        wrap.addEventListener('blur', drawCursor);
        return wrap;
      });
      root = h('div', { class: 'gm-spot' + (game.teams ? ' has-teams' : '') }, [
        h('div', { class: 'gm-spot-head' }),
        h('div', { class: 'gm-spot-pics', style: `--ar:${sc.w / sc.h}` }, pics),
        h('div', { class: 'gm-spot-bar' }),
        game.teams ? h('div', { class: 'gm-scoreboard gm-spot-scores', role: 'group', 'aria-label': 'Scores' }) : null
      ].filter(Boolean));
      ctx.body.replaceChildren(root);
      if (cfg.timer) {
        timer = session.countdown(cfg.timer, { onTick: (l) => { const t = document.querySelector('[data-timer]'); if (t) { t.textContent = `⏱ ${fmtTime(l)}`; t.classList.toggle('is-low', l <= 10); } if (l > 0 && l <= 5) tone([880], 0.05); }, onEnd: () => { timer = null; endPicture('time'); } });
        timer.start();
      } else {
        clock = session.setInterval(() => { elapsed++; const t = document.querySelector('[data-timer]'); if (t) t.textContent = `⏱ ${fmtTime(elapsed)}`; }, 1000);
      }
      render();
    }

    function render() {
      const sc = s.scene, total = sc.hotspots.length;
      ctx.setHud([
        h('span', { class: 'gm-pill', text: `Picture ${game.idx + 1}/${game.list.length}` }),
        h('span', { class: 'gm-pill', text: `Found ${s.found.length}/${total}` }),
        h('span', { class: 'gm-pill gm-timer', 'data-timer': '', text: `⏱ ${fmtTime(timer ? timer.left : elapsed)}` }),
        h('span', { class: 'gm-pill', text: `✗ ${s.misses}` })
      ]);
      const team = game.teams ? game.teams.list[game.turn] : null;
      root.querySelector('.gm-spot-head').replaceChildren(...[
        h('h3', { class: 'gm-spot-title', text: sc.title }),
        team ? h('span', { class: 'gm-team-badge', style: `--team:${color(team.id)}`, 'data-turn': '', text: `▶ ${team.name}` }) : null,
        h('span', { class: 'gm-spot-dots', role: 'img', 'aria-label': `${s.found.length} of ${total} found` }, sc.hotspots.map((x) => h('span', { class: 'gm-spot-dot' + (s.found.includes(x.id) ? ' is-on' : '') })))
      ].filter(Boolean));
      const unlimited = hintsLeft === Infinity;
      root.querySelector('.gm-spot-bar').replaceChildren(
        h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-hint': '', disabled: !unlimited && hintsLeft <= 0, text: unlimited ? '💡 Hint' : `💡 Hint (${hintsLeft} left)`, on: { click: hint } }),
        h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-reveal': '', text: '👁 Show all', on: { click: reveal } }),
        h('ol', { class: 'gm-found', 'aria-label': 'Differences found' }, s.found.map((id) => h('li', { text: sc.hotspots.find((x) => x.id === id).label })))
      );
      if (game.teams) {
        root.querySelector('.gm-spot-scores').replaceChildren(...game.teams.list.map((t) => h('div', { class: 'gm-scorecard' + (t.id === game.turn ? ' is-turn' : ''), style: `--team:${color(t.id)}` }, [
          h('span', { class: 'gm-scorecard-name', text: (t.id === game.turn ? '▶ ' : '') + t.name }), h('span', { class: 'gm-scorecard-score', text: String(t.score) })
        ])));
      }
      drawMarks();
    }
    const marksAll = () => (root ? [...root.querySelectorAll('.gm-spot-marks')] : []);
    function drawMarks(revealAll) {
      const sc = s.scene;
      marksAll().forEach((g) => {
        g.replaceChildren();
        s.found.forEach((id, i) => drawFound(g, sc, sc.hotspots.find((x) => x.id === id), i + 1));
        if (revealAll) sc.hotspots.filter((x) => !s.found.includes(x.id)).forEach((x, i) => drawFound(g, sc, x, s.found.length + i + 1, { color: '#f59e0b', dashed: true }));
        else if (hintId && !s.found.includes(hintId)) {
          const x = sc.hotspots.find((q) => q.id === hintId), k = sc.h / 300;
          svgEl(g, 'circle', { cx: x.x * sc.w, cy: x.y * sc.h, r: x.r * sc.h * 1.6, fill: 'none', stroke: '#f59e0b', 'stroke-width': 4 * k, 'stroke-dasharray': `${8 * k} ${6 * k}`, class: 'gm-hint-ring' });
        }
      });
      drawCursor();
    }
    function pulse(cls) {
      root.querySelectorAll('.gm-spot-pic').forEach((p) => { p.classList.remove(cls); void p.offsetWidth; p.classList.add(cls); });
      session.setTimeout(() => root && root.querySelectorAll('.gm-spot-pic').forEach((p) => p.classList.remove(cls)), 600);
    }

    function tap(nx, ny, wrap) {
      if (!s || !root || ctx.lifecycle.phase !== 'playing') return;
      if (locked) { ctx.toast('Wait a moment…'); return; }
      const r = wrap.getBoundingClientRect();
      // touch-friendly: a minimum hit radius in CSS px, expressed in picture heights
      const res = S.tap(s, nx, ny, { aspect: s.scene.w / s.scene.h, minR: ctx.px(level().minR) / Math.max(1, r.height) });
      const sc = s.scene, k = sc.h / 300;
      if (res === null) {
        tone([260, 200], 0.09);
        if (game.teams) {
          game.turn = (game.turn + 1) % game.teams.list.length;
          const t = game.teams.list[game.turn];
          ctx.toast(`Not there — ${t.name}'s turn`);
          ctx.announce(`Miss. ${t.name}'s turn`);
        }
        render();
        marksAll().forEach((g) => { const m = svgEl(g, 'text', { x: nx * sc.w, y: ny * sc.h + 9 * k, 'text-anchor': 'middle', 'font-size': 26 * k, 'font-weight': 900, fill: '#dc2626', stroke: '#fff', 'stroke-width': 1.5 * k, class: 'gm-miss' }, '✗'); session.setTimeout(() => m.remove(), 800); });
        pulse('is-miss');
        if (level().lock) {
          locked = true;
          root.classList.add('is-locked');
          session.setTimeout(() => { locked = false; root && root.classList.remove('is-locked'); }, level().lock);
        }
        return;
      }
      if (res === 'repeat') { ctx.toast('Already found that one'); return; }
      const hs = sc.hotspots.find((x) => x.id === res);
      if (hintId === res) hintId = null;
      tone([660, 880], 0.08);
      if (game.teams) game.teams.award(game.turn, 1);
      ctx.announce(`Found: ${hs.label}${game.teams ? `. ${game.teams.list[game.turn].name} +1` : ''}`);
      render();
      pulse('is-hit');
      if (S.done(s)) endPicture('done');
    }
    function hint() {
      if (!s || ctx.lifecycle.phase !== 'playing') return;
      if (hintsLeft !== Infinity && hintsLeft <= 0) { ctx.toast('No hints left for this picture'); return; }
      const hs = S.hint(s);
      if (!hs) return;
      if (hintsLeft !== Infinity) hintsLeft--;
      hintId = hs.id;
      tone([700, 900], 0.08);
      render();
      ctx.toast('💡 Look inside the orange ring');
    }
    async function reveal() {
      if (!(await ctx.confirm({ title: 'Show all the differences?', text: 'This ends the picture. Differences found so far still count.', ok: 'Show all' }))) return;
      if (s && ctx.lifecycle.phase === 'playing') endPicture('revealed');
    }

    function endPicture(how) {
      const time = cfg.timer ? cfg.timer - (timer ? timer.left : 0) : elapsed;
      stopClocks();
      const sc = s.scene, total = sc.hotspots.length, done = how === 'done';
      hintId = null;
      if (root) { drawMarks(!done); root.classList.remove('is-locked'); }
      locked = false;
      const st = S.stars(s);
      game.history.push({ title: sc.title, found: s.found.length, total, misses: s.misses, hints: s.hints, time, stars: st, done });
      game.idx++;
      const last = game.idx >= game.list.length;
      if (done) tone([523, 659, 784, 1047], 0.12); else tone([440, 330, 220], 0.16);
      const missed = sc.hotspots.filter((x) => !s.found.includes(x.id)).map((x) => x.label);
      ctx.showResult({
        icon: done ? '🎉' : how === 'time' ? '⏰' : '👁',
        title: done ? 'You found them all!' : how === 'time' ? "Time's up!" : 'All differences shown',
        lines: [
          `${sc.title}: ${s.found.length} of ${total} found in ${fmtTime(time)}.`,
          `Wrong taps: ${s.misses}${s.hints ? ` · Hints: ${s.hints}` : ''}`,
          missed.length ? `Missed (orange): ${missed.join(', ')}` : ''
        ].filter(Boolean),
        extra: done && !game.teams ? h('div', { class: 'gm-stars', 'aria-label': `${st} out of 3 stars` }, [1, 2, 3].map((i) => h('span', { class: 'gm-star' + (i <= st ? ' is-on' : ''), 'aria-hidden': 'true', text: '★' }))) : null,
        peekable: true, hub: false,
        actions: [{ label: last ? '🏆 See results' : '▶ Next picture', primary: true, onClick: () => (last ? final() : next()) }]
      });
    }

    function final() {
      stopClocks();
      tone([523, 659, 784, 1047], 0.14);
      const summary = h('ul', { class: 'gm-word-summary gm-spot-summary' }, game.history.map((r) => h('li', { class: r.done ? 'is-hit' : 'is-miss' }, [
        h('span', { text: r.done ? '✓' : '✗' }), h('strong', { text: r.title }),
        h('span', { class: 'gm-note', text: `${r.found}/${r.total} found · ${fmtTime(r.time)} · ✗ ${r.misses}${r.hints ? ` · 💡 ${r.hints}` : ''}` })
      ])));
      const found = game.history.reduce((n, r) => n + r.found, 0), total = game.history.reduce((n, r) => n + r.total, 0);
      if (game.teams) {
        const rank = game.teams.list.slice().sort((a, b) => b.score - a.score);
        const winners = rank.filter((t) => t.score === rank[0].score);
        let place = 0, lastScore = null;
        ctx.showResult({
          icon: '🏆', title: winners.length > 1 ? `It's a tie: ${winners.map((t) => t.name).join(' & ')}` : `${winners[0].name} wins!`,
          extra: h('div', { class: 'gm-final-body' }, [h('ol', { class: 'gm-podium' }, rank.map((t, i) => { if (t.score !== lastScore) { place = i + 1; lastScore = t.score; } return h('li', { style: `--team:${color(t.id)}` }, [
            h('span', { class: 'gm-podium-medal', text: place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.` }), h('span', { class: 'gm-podium-name', text: t.name }), h('span', { class: 'gm-podium-score', text: `${t.score} found` })
          ]); })), h('h4', { class: 'gm-gallery-title', text: 'Pictures' }), summary]),
          actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
        });
      } else {
        const stars = Math.round(game.history.reduce((n, r) => n + r.stars, 0) / Math.max(1, game.history.length));
        ctx.showResult({
          icon: '🔍', title: `${found} of ${total} differences found!`,
          extra: h('div', { class: 'gm-final-body' }, [
            h('div', { class: 'gm-stars', 'aria-label': `${stars} out of 3 stars` }, [1, 2, 3].map((i) => h('span', { class: 'gm-star' + (i <= stars ? ' is-on' : ''), 'aria-hidden': 'true', text: '★' }))),
            summary
          ]),
          actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
        });
      }
      ctx.body.querySelector('.gm-result')?.classList.add('gm-result-wide');
    }

    function drawCursor() {
      if (!root) return;
      root.querySelectorAll('.gm-cursor').forEach((n) => n.remove());
      const wrap = document.activeElement && document.activeElement.closest ? document.activeElement.closest('.gm-spot-pic') : null;
      if (!wrap || !s || !root.contains(wrap)) return;
      const sc = s.scene, k = sc.h / 300, g = wrap.querySelector('.gm-spot-marks');
      const x = cursor.x * sc.w, y = cursor.y * sc.h;
      const c = svgEl(g, 'g', { class: 'gm-cursor' });
      [['#fff', 5], ['#0f172a', 2]].forEach(([col, w]) => {
        svgEl(c, 'circle', { cx: x, cy: y, r: 14 * k, fill: 'none', stroke: col, 'stroke-width': w * k });
        svgEl(c, 'line', { x1: x - 20 * k, y1: y, x2: x + 20 * k, y2: y, stroke: col, 'stroke-width': w * k });
        svgEl(c, 'line', { x1: x, y1: y - 20 * k, x2: x, y2: y + 20 * k, stroke: col, 'stroke-width': w * k });
      });
    }

    setup();
    return {
      onKey(e) {
        const wrap = document.activeElement && document.activeElement.closest ? document.activeElement.closest('.gm-spot-pic') : null;
        if (!wrap || !s || !root || !root.contains(wrap)) return;
        const step = e.shiftKey ? 0.1 : 0.03;
        const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
        if (d) { e.preventDefault(); cursor = { x: Math.min(1, Math.max(0, cursor.x + d[0])), y: Math.min(1, Math.max(0, cursor.y + d[1])) }; drawCursor(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(cursor.x, cursor.y, wrap); }
      },
      hasProgress: () => !!game && game.idx < game.list.length && (game.idx > 0 || (s && (s.found.length > 0 || s.misses > 0))),
      unmount: stopClocks,
      _state: () => s, _game: () => game, _timer: () => timer, _hintsLeft: () => hintsLeft, _locked: () => locked
    };
  });
})();
