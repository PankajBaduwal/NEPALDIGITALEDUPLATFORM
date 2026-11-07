'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — QUIZ PATH (turn-based board game)
// • 2–6 named teams race along a snake-shaped path (short 20 / normal 30 / long 40 spaces)
// • ❓ question spaces, ⏩ boosts, ⏪ slips and 🎲 roll-again spaces
// • Questions from one or more sets (samples or the teacher's own): multiple choice is checked
//   automatically, open questions are judged by the teacher (Reveal → ✓ / ✗)
// • Optional answer timer, animated dice and token walk, sound, ranking with correct answers at the end
// • Teacher sets: one question per line  "Question | Answer | wrong ; wrong ; wrong", import/export .json
// Rules live in GameEngine.board; this file is only the screens.
// ═══════════════════════════════════════════════════════════
(() => {
  if (typeof GamesHub === 'undefined') return;
  const { h } = GamesHub;

  const SETTINGS_KEY = 'gm_path_settings_v1';
  const SETS_KEY = 'gm_path_sets_v1';
  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];
  const DEFAULT_NAMES = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'];
  const LENGTHS = [{ value: 20, label: 'Short · 20', cols: 5 }, { value: 30, label: 'Normal · 30', cols: 6 }, { value: 40, label: 'Long · 40', cols: 8 }];
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  const NS = 'http://www.w3.org/2000/svg';

  const store = {
    get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
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
  /** A die face drawn with pips (3×3 grid). */
  const dieFace = (v) => h('div', { class: 'gm-die gm-die-pips', role: 'img', 'aria-label': v ? `Dice shows ${v}` : 'Dice' },
    Array.from({ length: 9 }, (_, i) => h('span', { class: 'gm-pip' + (v && PIPS[v].includes(i) ? ' is-on' : '') })));

  GamesHub.register('boardgame', (ctx) => {
    const { E, C, session } = ctx;
    const B = E.board;
    const saved = store.get(SETTINGS_KEY) || {};
    const cfg = {
      names: Array.isArray(saved.names) && saved.names.length >= 2 ? saved.names.slice(0, 6).map((n, i) => String(n || DEFAULT_NAMES[i]).slice(0, 24)) : DEFAULT_NAMES.slice(0, 2),
      length: LENGTHS.some((x) => x.value === saved.length) ? saved.length : 30,
      qtime: [0, 15, 30, 60].includes(saved.qtime) ? saved.qtime : 0,
      sound: saved.sound !== false,
      picks: Array.isArray(saved.picks) && saved.picks.length ? saved.picks : [C.quizPathSets[0].id]
    };
    let s = null, def = null, deck = [], busy = false, stepTimer = null, qTimer = null, audio = null, note = '', instant = false, lastEvent = null, shownPos = null, dieValue = null, asked = 0;

    const mySets = () => (store.get(SETS_KEY) || []).map((r) => { const n = E.normalizeQuizPathSet(r); return n.set ? Object.assign(n.set, { id: r.id }) : null; }).filter(Boolean);
    const allSets = () => C.quizPathSets.concat(mySets());
    const byId = (id) => allSets().find((x) => x.id === id);
    const saveCfg = () => store.set(SETTINGS_KEY, cfg);
    const color = (id) => COLORS[id % COLORS.length];
    const cols = () => (LENGTHS.find((x) => x.value === def.length) || LENGTHS[1]).cols;

    const rules = [
      'Teams take turns: press 🎲 Roll (or the R key) and your token walks forward.',
      '❓ Question space: answer correctly to keep the move and go 1 space further. A wrong answer sends you back to where you started this turn.',
      '⏩ Boost: jump 2 spaces forward.  ⏪ Slip: slide 2 spaces back.  🎲 Roll again: take another turn.',
      'If your roll goes past the finish you stop on the finish — and win!'
    ];
    ctx.setHelp(rules.concat([
      'Multiple-choice questions are checked automatically. Open questions: press Reveal, then the teacher marks ✓ or ✗.',
      'Teachers: “+ New question set” — one question per line: Question | Answer | wrong ; wrong ; wrong.'
    ]));

    function tone(freqs, dur = 0.12, type = 'sine') {
      if (!cfg.sound) return;
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        let t = audio.currentTime;
        freqs.forEach((f) => {
          const o = audio.createOscillator(), gn = audio.createGain();
          o.type = type; o.frequency.value = f;
          gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.08, t + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          o.connect(gn); gn.connect(audio.destination); o.start(t); o.stop(t + dur + 0.02);
          t += dur * 0.9;
        });
      } catch (e) { /* audio unavailable */ }
    }
    function stopTimers() { if (stepTimer !== null) { session.clearTimeout(stepTimer); stepTimer = null; } if (qTimer) { qTimer.stop(); qTimer = null; } }
    session.onDispose(() => { stopTimers(); if (audio) { try { audio.close(); } catch (e) { /* ignore */ } audio = null; } });

    // ════════ SETUP ════════
    function setup() {
      stopTimers();
      s = null; busy = false;
      ctx.setPhase('idle'); ctx.setHud([]);
      const all = allSets();
      cfg.picks = cfg.picks.filter((id) => all.some((x) => x.id === id));
      if (!cfg.picks.length) cfg.picks = [C.quizPathSets[0].id];
      const mine = mySets();
      const names = h('div', { class: 'gm-team-names' });
      const count = h('span', { class: 'gm-stepper-value' });
      const minus = h('button', { type: 'button', class: 'gm-btn gm-stepper-btn', 'aria-label': 'Fewer teams', text: '−', on: { click: () => { if (cfg.names.length > 2) { cfg.names.pop(); drawNames(); saveCfg(); } } } });
      const plus = h('button', { type: 'button', class: 'gm-btn gm-stepper-btn', 'aria-label': 'More teams', text: '+', on: { click: () => { if (cfg.names.length < 6) { cfg.names.push(DEFAULT_NAMES[cfg.names.length]); drawNames(); saveCfg(); } } } });
      function drawNames() {
        count.textContent = String(cfg.names.length);
        minus.disabled = cfg.names.length <= 2; plus.disabled = cfg.names.length >= 6;
        names.replaceChildren(...cfg.names.map((n, i) => h('label', { class: 'gm-name-field', style: `--team:${color(i)}` }, [
          h('span', { class: 'gm-name-dot', 'aria-hidden': 'true', text: String.fromCharCode(65 + i) }),
          h('input', { type: 'text', class: 'gm-input', value: n, maxlength: '24', 'aria-label': `Name of team ${i + 1}`, on: { input: (e) => { cfg.names[i] = e.target.value.slice(0, 24); }, change: saveCfg } })
        ])));
      }
      drawNames();
      const info = h('span', { class: 'gm-note' });
      const updateInfo = () => {
        const n = cfg.picks.map(byId).filter(Boolean).reduce((t, x) => t + x.questions.length, 0);
        info.textContent = `${cfg.picks.length} set${cfg.picks.length === 1 ? '' : 's'} selected · ${n} questions, shuffled`;
      };
      const left = h('section', { class: 'gm-setup-col', 'aria-label': 'Players' }, [
        h('div', { class: 'gm-choice' }, [h('span', { class: 'gm-choice-label', text: 'Teams' }), h('div', { class: 'gm-stepper', role: 'group', 'aria-label': 'Number of teams' }, [minus, count, plus])]),
        names,
        h('ul', { class: 'gm-rules gm-qp-rules' }, rules.map((r) => h('li', { text: r })))
      ]);
      const right = h('section', { class: 'gm-setup-col', 'aria-label': 'Game settings' }, [
        chips('Questions', all.map((x) => ({ value: x.id, label: (String(x.id).startsWith('my-') ? '⭐ ' : '') + x.title })), cfg.picks, (v, btn) => {
          const on = cfg.picks.includes(v);
          if (on && cfg.picks.length === 1) { ctx.toast('Keep at least one question set'); return; }
          cfg.picks = on ? cfg.picks.filter((x) => x !== v) : cfg.picks.concat(v);
          btn.setAttribute('aria-pressed', String(!on)); saveCfg(); updateInfo();
        }, { multi: true }),
        info,
        h('div', { class: 'gm-row' }, [
          h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-new': '', text: '+ New question set', on: { click: () => editor(null) } }),
          ...mine.map((m) => h('span', { class: 'gm-mine-chip' }, [
            h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'data-edit': m.id, 'aria-label': `Edit ${m.title}`, text: `✎ ${m.title}`, on: { click: () => editor(m) } }),
            h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'data-delete': m.id, 'aria-label': `Delete ${m.title}`, text: '🗑', on: { click: async () => {
              if (!(await ctx.confirm({ title: `Delete “${m.title}”?`, text: 'This question set will be removed from this device.', ok: 'Delete', danger: true }))) return;
              store.set(SETS_KEY, (store.get(SETS_KEY) || []).filter((r) => r.id !== m.id)); setup();
            } } })
          ]))
        ]),
        chips('Board', LENGTHS.map((x) => ({ value: x.value, label: x.label })), cfg.length, (v) => { cfg.length = v; saveCfg(); }),
        chips('Answer time', [{ value: 0, label: '😌 Off' }, { value: 15, label: '⏱ 15 s' }, { value: 30, label: '⏱ 30 s' }, { value: 60, label: '⏱ 60 s' }], cfg.qtime, (v) => { cfg.qtime = v; saveCfg(); }),
        chips('Sound', [{ value: true, label: 'On' }, { value: false, label: 'Off' }], cfg.sound, (v) => { cfg.sound = v; saveCfg(); })
      ]);
      ctx.body.replaceChildren(h('div', { class: 'gm-setup gm-setup-wide' }, [
        h('h3', { text: '🎲 Quiz Path' }),
        h('p', { text: 'Teams roll the dice and race along the path — question spaces test what you know.' }),
        h('div', { class: 'gm-setup-2col' }, [left, right]),
        cfg.picks.some((id) => !String(id).startsWith('my-')) ? h('p', { class: 'gm-sample', text: C.LABEL + '.' }) : null,
        h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-startgame': '', text: '▶ Start', on: { click: start } })
      ].filter(Boolean)));
      updateInfo();
    }

    // ════════ QUESTION SET EDITOR ════════
    const toLines = (set) => set.questions.map((q) => [q.q, q.a, (q.choices || []).join(' ; ')].filter((x, i) => i < 2 || x).join(' | ')).join('\n');
    function editor(base) {
      stopTimers();
      ctx.setPhase('idle'); ctx.setHud([]);
      const editingId = base && String(base.id).startsWith('my-') ? base.id : null;
      const titleIn = h('input', { type: 'text', class: 'gm-input gm-set-title', maxlength: '40', placeholder: 'Name of this question set (e.g. Fractions review)', value: base ? base.title : '', 'aria-label': 'Question set name' });
      const text = h('textarea', { class: 'gm-textarea gm-qp-lines', rows: '12', 'aria-label': 'Questions, one per line', placeholder: 'One question per line:\nWhat is 6 × 7? | 42 | 36 ; 48 ; 49\nName the capital of Japan. | Tokyo\n\nWith wrong options (after the second |, separated by ;) it is multiple choice.\nWithout them the teacher judges the answer.' });
      text.value = base ? toLines(base) : '';
      const errorsEl = h('div', { class: 'gm-editor-errors', role: 'alert' });
      const fileIn = h('input', { type: 'file', accept: '.json,.txt,application/json,text/plain', hidden: true });
      const sampleSel = h('select', { class: 'gm-input gm-select', 'aria-label': 'Start from a sample set', on: { change: (e) => {
        const smp = C.quizPathSets.find((x) => x.id === e.target.value);
        if (smp) { titleIn.value = `${smp.title} (copy)`; text.value = toLines(smp); }
        e.target.value = '';
      } } }, [h('option', { value: '', text: '⧉ Start from a sample…' }), ...C.quizPathSets.map((x) => h('option', { value: x.id, text: x.title }))]);
      const raw = () => ({ title: titleIn.value, text: text.value });
      function save() {
        const n = E.normalizeQuizPathSet(raw());
        errorsEl.replaceChildren(...n.errors.slice(0, 4).map((m) => h('p', { text: '⚠ ' + m })));
        if (!n.set) { ctx.toast('Please fix the points above, then save'); return; }
        const list = (store.get(SETS_KEY) || []).filter((r) => r.id !== editingId);
        const id = editingId || `my-${Date.now().toString(36)}`;
        list.push({ id, title: n.set.title, questions: n.set.questions });
        if (!store.set(SETS_KEY, list)) { ctx.toast('Could not save on this device (storage is blocked or full)'); return; }
        if (!cfg.picks.includes(id)) cfg.picks = [id];
        saveCfg();
        ctx.toast(`Saved “${n.set.title}” — ${n.set.questions.length} questions`);
        setup();
      }
      fileIn.addEventListener('change', () => {
        const f = fileIn.files && fileIn.files[0];
        fileIn.value = '';
        if (!f) return;
        if (f.size > 200000) { ctx.toast('That file is too large'); return; }
        const rd = new FileReader();
        rd.onload = () => {
          const body = String(rd.result);
          let parsed = null;
          try { parsed = JSON.parse(body); } catch (e) { parsed = null; }
          if (parsed) {
            const n = E.normalizeQuizPathSet(parsed);
            if (!n.set) { ctx.toast('No usable questions found in that file'); return; }
            titleIn.value = n.set.title; text.value = toLines(n.set);
          } else text.value = body;
          ctx.toast('Imported — press Save to keep it');
        };
        rd.readAsText(f);
      });
      function exportSet() {
        const n = E.normalizeQuizPathSet(raw());
        if (!n.set) { ctx.toast('Finish the questions before exporting'); return; }
        const blob = new Blob([JSON.stringify({ app: 'PiyushDhara Quiz Path', version: 1, title: n.set.title, questions: n.set.questions }, null, 2)], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: 'quiz-path-questions.json' });
        document.body.appendChild(a); a.click(); a.remove();
        session.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }
      ctx.body.replaceChildren(h('div', { class: 'gm-editor' }, [
        h('div', { class: 'gm-editor-head' }, [
          h('h3', { text: editingId ? '✎ Edit question set' : '✎ New question set' }),
          h('div', { class: 'gm-row' }, [
            sampleSel,
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '📂 Import', on: { click: () => fileIn.click() } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '💾 Export', on: { click: exportSet } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: 'Cancel', on: { click: setup } }),
            h('button', { type: 'button', class: 'gm-btn gm-primary', 'data-save': '', text: '✔ Save questions', on: { click: save } })
          ])
        ]),
        titleIn,
        h('p', { class: 'gm-note', text: '3–60 questions, one per line:  Question | Answer | wrong ; wrong ; wrong  (wrong options optional, up to 3). Saved on this device only.' }),
        errorsEl, text, fileIn
      ]));
      titleIn.focus();
    }

    // ════════ GAME ════════
    function start() {
      stopTimers();
      const sets = cfg.picks.map(byId).filter(Boolean);
      if (!sets.length) { ctx.toast('Choose at least one question set'); return; }
      cfg.names = cfg.names.map((n, i) => (n || '').trim() || DEFAULT_NAMES[i]); saveCfg();
      def = E.makeBoardDef(cfg.length);
      s = E.createBoardGame(def, cfg.names.slice(), ctx.rng);
      deck = []; busy = false; note = ''; lastEvent = null; shownPos = null; dieValue = null; asked = 0;
      ctx.clearResult();
      ctx.setPhase('playing');
      render();
    }
    function nextQuestion() {
      if (!deck.length) {
        const pool = cfg.picks.map(byId).filter(Boolean).flatMap((x) => x.questions);
        deck = E.shuffle(pool, ctx.rng);
      }
      return deck.pop();
    }
    const cellXY = (i) => {
      const c = cols(), rows = Math.ceil(def.length / c), row = Math.floor(i / c), col = row % 2 === 0 ? i % c : c - 1 - (i % c);
      return { x: col * 100 + 50, y: (rows - 1 - row) * 100 + 50 };
    };
    function boardSvg(pos) {
      const c = cols(), rows = Math.ceil(def.length / c);
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', `0 0 ${c * 100} ${rows * 100}`);
      svg.setAttribute('class', 'gm-path');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'Game board: ' + s.players.map((p) => `${p.name} on space ${pos[p.id]}`).join(', '));
      const add = (tag, attrs, text, parent = svg) => { const el = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); if (text != null) el.textContent = text; parent.appendChild(el); return el; };
      let d = '';
      for (let i = 0; i < def.length; i++) { const p = cellXY(i); d += (i ? 'L' : 'M') + p.x + ' ' + p.y; }
      add('path', { d, fill: 'none', stroke: 'rgba(100,116,139,.45)', 'stroke-width': 16, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
      const last = def.length - 1, active = s.winner === null ? s.players[s.turn] : null;
      for (let i = 0; i < def.length; i++) {
        const p = cellXY(i), sp = def.specials[i];
        const fill = i === 0 ? '#bbf7d0' : i === last ? '#fde68a' : sp === 'question' ? '#c7d2fe' : sp === 'boost' ? '#bbf7d0' : sp === 'slip' ? '#fecaca' : sp === 'again' ? '#fbcfe8' : '#f8fafc';
        const here = lastEvent && i === lastEvent.to && !busy;
        add('rect', { x: p.x - 43, y: p.y - 43, width: 86, height: 86, rx: 14, fill, stroke: here ? '#f59e0b' : '#334155', 'stroke-width': here ? 6 : 2, class: here ? 'gm-qp-landed' : '' });
        add('text', { x: p.x - 36, y: p.y - 24, 'font-size': 17, fill: '#475569', 'font-weight': 800 }, String(i));
        const label = i === 0 ? 'START' : i === last ? 'FINISH' : sp === 'question' ? '❓' : sp === 'boost' ? '⏩+2' : sp === 'slip' ? '⏪−2' : sp === 'again' ? '🎲↻' : '';
        if (label) add('text', { x: p.x, y: p.y + (label.length > 3 ? 2 : 6), 'font-size': label.length > 3 ? 17 : 26, 'text-anchor': 'middle', fill: '#0f172a', 'font-weight': 900 }, label);
      }
      // tokens: up to 6 on a cell, in two rows of three (never overlapping); the active team's token glows
      s.players.forEach((pl, k) => {
        const p = cellXY(pos[pl.id]);
        const ox = -26 + (k % 3) * 26, oy = 15 + Math.floor(k / 3) * 18;
        const g = add('g', { class: 'gm-token' + (active && active.id === pl.id ? ' is-active' : '') });
        if (active && active.id === pl.id) add('circle', { cx: p.x + ox, cy: p.y + oy, r: 12.5, fill: 'none', stroke: '#f59e0b', 'stroke-width': 3 }, null, g);
        add('circle', { cx: p.x + ox, cy: p.y + oy, r: 9, fill: color(k), stroke: '#fff', 'stroke-width': 2.5 }, null, g);
        add('text', { x: p.x + ox, y: p.y + oy + 4.3, 'text-anchor': 'middle', 'font-size': 12, fill: '#fff', 'font-weight': 900 }, String.fromCharCode(65 + k), g);
      });
      return svg;
    }
    function render() {
      const pos = shownPos || s.players.map((p) => p.pos);
      const cur = s.players[s.turn];
      ctx.setHud([
        h('span', { class: 'gm-pill', text: `🏁 ${def.length - 1} spaces` }),
        h('span', { class: 'gm-pill', text: `❓ ${asked} asked` }),
        s.winner === null ? h('span', { class: 'gm-pill is-active', style: `border-color:${color(cur.id)}`, text: `▶ ${cur.name}` }) : null
      ].filter(Boolean));
      const standings = h('ol', { class: 'gm-qp-standings', 'aria-label': 'Teams' }, s.players.map((p) => h('li', { class: p.id === s.turn && s.winner === null ? 'is-turn' : '', style: `--team:${color(p.id)}` }, [
        h('span', { class: 'gm-name-dot', 'aria-hidden': 'true', text: String.fromCharCode(65 + p.id) }),
        h('span', { class: 'gm-qp-name', text: p.name }),
        h('span', { class: 'gm-qp-pos', text: `${pos[p.id]}` , title: 'Space' }),
        h('span', { class: 'gm-qp-right', text: `✓${p.right || 0}`, title: 'Correct answers' })
      ])));
      const side = h('div', { class: 'gm-bg-side' }, [
        h('p', { class: 'gm-turn', 'data-turn': '', style: `border-color:${color(s.winner !== null ? s.winner : s.turn)}`, text: s.winner !== null ? `🏆 ${s.players[s.winner].name} wins!` : `▶ ${cur.name} — your turn` }),
        h('div', { class: 'gm-qp-dice' + (busy ? ' is-rolling' : '') }, [dieFace(dieValue)]),
        h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-roll': '', disabled: busy || !!s.pending || s.winner !== null, text: '🎲 Roll dice', on: { click: roll } }),
        note ? h('p', { class: 'gm-note gm-qp-note', 'aria-live': 'polite', text: note }) : null,
        standings,
        h('details', { class: 'gm-details' }, [h('summary', { text: 'Rules' }), h('ul', { class: 'gm-rules' }, rules.map((r) => h('li', { text: r })))]),
        h('div', { class: 'gm-row' }, [
          h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '⟲ Restart', on: { click: async () => { if (await ctx.confirm({ title: 'Restart the game?', text: 'All tokens go back to Start.', ok: 'Restart', danger: true })) start(); } } }),
          h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '⚙ Settings', on: { click: async () => { if (!s.players.some((p) => p.pos > 0) || await ctx.confirm({ title: 'Leave this game?', text: 'The game in progress will end.', ok: 'Settings' })) setup(); } } })
        ])
      ].filter(Boolean));
      const wrap = h('div', { class: 'gm-path-wrap', style: `--cols:${cols()};--rows:${Math.ceil(def.length / cols())}` }, [boardSvg(pos)]);
      ctx.body.replaceChildren(h('div', { class: 'gm-boardgame' }, [wrap, side]));
    }

    function roll() {
      if (busy || !s || s.pending || s.winner !== null || ctx.lifecycle.phase !== 'playing') return;
      const before = s.players.map((p) => p.pos);
      const ev = B.roll(s);
      if (!ev) return;
      busy = true; lastEvent = null;
      const name = s.players[ev.player].name;
      const landed = Math.min(def.length - 1, ev.from + ev.value);
      const effectNote = { boost: '⏩ Boost! Forward 2 spaces.', slip: '⏪ Slip! Back 2 spaces.', question: '❓ Question space!', finish: '🏁 Reached the finish!', again: '🎲 Roll again!' }[ev.effect] || '';
      const finishMove = () => {
        busy = false; shownPos = null; lastEvent = ev; dieValue = ev.value;
        note = `${name} rolled ${ev.value}. ${effectNote}`.trim();
        if (ev.effect === 'question') asked++;
        if (ev.effect === 'boost') tone([523, 784], 0.1); else if (ev.effect === 'slip') tone([392, 262], 0.12); else if (ev.effect === 'again') tone([659, 659], 0.08);
        render();
        ctx.announce(note);
        if (ev.effect === 'question') askQuestion();
        else if (s.winner !== null) win();
      };
      if (ctx.reducedMotion || instant) { finishMove(); return; }
      // 1) the die tumbles  2) the token walks one space at a time  3) a boost/slip slides it on
      shownPos = before.slice();
      const path = []; for (let i = ev.from + 1; i <= landed; i++) path.push(i);
      if (ev.effect === 'boost' || ev.effect === 'slip') path.push(ev.to);
      let frame = 0;
      const tumble = () => {
        if (frame < 7) { dieValue = 1 + Math.floor(Math.random() * 6); frame++; tone([180 + frame * 30], 0.03, 'square'); render(); stepTimer = session.setTimeout(tumble, 70); return; }
        dieValue = ev.value; render();
        stepTimer = session.setTimeout(walk, 260);
      };
      let k = 0;
      const walk = () => {
        if (k >= path.length) { stepTimer = null; finishMove(); return; }
        shownPos[ev.player] = path[k++];
        tone([440 + k * 40], 0.05);
        render();
        stepTimer = session.setTimeout(walk, k === path.length - 1 && (ev.effect === 'boost' || ev.effect === 'slip') ? 380 : 220);
      };
      tumble();
    }

    function askQuestion() {
      const q = nextQuestion();
      const pl = s.players[s.pending.player];
      ctx.setPhase('checking');
      const timerEl = cfg.qtime ? h('span', { class: 'gm-pill gm-timer', 'data-qtimer': '', text: `⏱ ${cfg.qtime} s` }) : null;
      const head = h('div', { class: 'gm-qp-qhead' }, [h('span', { class: 'gm-team-badge', style: `--team:${color(pl.id)}`, text: pl.name }), timerEl].filter(Boolean));
      const finish = (correct, how, picked) => {
        if (qTimer) { qTimer.stop(); qTimer = null; }
        tone(correct ? [523, 659, 784] : [330, 247], 0.12);
        const resultBody = h('div', { class: 'gm-qp-question' }, [
          h('div', { class: 'gm-qp-qhead' }, [h('span', { class: 'gm-team-badge', style: `--team:${color(pl.id)}`, text: pl.name })]),
          h('p', { class: 'gm-question-text', text: q.q }),
          q.choices ? choiceGrid(picked, true) : null,
          h('p', { class: 'gm-answer' }, [h('span', { class: 'gm-answer-label', text: 'Answer: ' }), q.a])
        ]);
        ctx.showResult({
          icon: correct ? '✅' : how === 'time' ? '⏰' : '❌',
          title: correct ? `Correct! ${pl.name} moves on` : how === 'time' ? "Time's up!" : `Not this time, ${pl.name}`,
          extra: resultBody, hub: false,
          actions: [{ label: correct ? '▶ +1 space' : '↩ Go back', primary: true, onClick: () => resolve(correct) }]
        });
        ctx.body.querySelector('.gm-result')?.classList.add('gm-result-wide');
      };
      let opts = null;
      const choiceGrid = (picked, locked) => h('div', { class: 'gm-qp-choices', role: 'group', 'aria-label': 'Answers' }, opts.map((o, i) => h('button', {
        type: 'button', 'data-choice': o, disabled: locked,
        class: 'gm-btn gm-qp-choice' + (locked && o === q.a ? ' is-right' : '') + (locked && picked === o && o !== q.a ? ' is-wrong' : ''),
        on: { click: () => finish(o === q.a, 'pick', o) }
      }, [h('span', { class: 'gm-qp-letter', text: 'ABCD'[i] }), h('span', { text: o })])));
      let extra;
      if (q.choices) {
        opts = E.shuffle([q.a, ...q.choices], ctx.rng);
        extra = h('div', { class: 'gm-qp-question' }, [head, h('p', { class: 'gm-question-text', text: q.q }), choiceGrid(null, false)]);
        ctx.showResult({ icon: '❓', title: 'Question space', extra, hub: false, actions: [] });
      } else {
        const ans = h('p', { class: 'gm-answer', hidden: true }, [h('span', { class: 'gm-answer-label', text: 'Answer: ' }), q.a]);
        extra = h('div', { class: 'gm-qp-question' }, [head, h('p', { class: 'gm-question-text', text: q.q }), ans,
          h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-reveal': '', text: '👁 Reveal answer', on: { click: (e) => { ans.hidden = false; e.currentTarget.hidden = true; } } })]);
        ctx.showResult({ icon: '❓', title: 'Question space', extra, hub: false,
          actions: [{ label: '✓ Correct (+1 space)', primary: true, onClick: () => { if (qTimer) { qTimer.stop(); qTimer = null; } tone([523, 659, 784], 0.12); resolve(true); } },
            { label: '✗ Incorrect (go back)', onClick: () => { if (qTimer) { qTimer.stop(); qTimer = null; } tone([330, 247], 0.12); resolve(false); } }] });
      }
      ctx.body.querySelector('.gm-result')?.classList.add('gm-result-wide');
      if (cfg.qtime) {
        qTimer = session.countdown(cfg.qtime, {
          onTick: (l) => { const t = document.querySelector('[data-qtimer]'); if (t) { t.textContent = `⏱ ${l} s`; t.classList.toggle('is-low', l <= 5); } if (l > 0 && l <= 3) tone([880], 0.05); },
          onEnd: () => { qTimer = null; if (s && s.pending) finish(false, 'time', null); }
        });
        qTimer.start();
      }
    }
    function resolve(correct) {
      const r = B.answer(s, correct);
      if (!r) return;
      ctx.clearResult();
      ctx.setPhase('playing');
      lastEvent = { to: r.to };
      note = correct ? `✓ Correct! ${s.players[r.player].name} moves to space ${r.to}.` : `✗ ${s.players[r.player].name} goes back to space ${r.to}.`;
      render();
      ctx.announce(note);
      if (s.winner !== null) win();
    }
    function win() {
      stopTimers();
      tone([523, 659, 784, 1047, 1319], 0.14);
      const rank = B.ranking(s);
      ctx.showResult({
        icon: '🏆', title: `${s.players[s.winner].name} wins!`, lines: ['First to reach the finish.'],
        extra: h('div', { class: 'gm-final-body' }, [h('ol', { class: 'gm-podium' }, rank.map((t, i) => h('li', { style: `--team:${color(t.id)}` }, [
          h('span', { class: 'gm-podium-medal', text: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.` }),
          h('span', { class: 'gm-podium-name', text: t.name }),
          h('span', { class: 'gm-podium-score', text: t.id === s.winner ? `🏁 · ✓${t.right || 0}` : `space ${t.pos} · ✓${t.right || 0}` })
        ])))]),
        actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
      });
      ctx.body.querySelector('.gm-result')?.classList.add('gm-result-wide');
    }

    setup();
    return {
      onKey(e) {
        if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && s && !busy && !s.pending && s.winner === null && ctx.lifecycle.phase === 'playing' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) { e.preventDefault(); roll(); }
      },
      hasProgress: () => !!s && s.winner === null && s.players.some((p) => p.pos > 0),
      unmount: stopTimers,
      _state: () => s, _def: () => def, _busy: () => busy, _qTimer: () => qTimer, _instant: (v) => { instant = !!v; }
    };
  });
})();
