'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — SEQUENCE BUILDER
// • Pick one or more sequences to play in a row (samples or the teacher's own)
// • Teacher sequences: title + one step per line (identical steps become interchangeable),
//   copy a sample to edit, saved on this device, import/export .json
// • Whole class or 2–6 teams taking turns (one sequence per turn; 10/7/5/3 points by checks, −2 per hint)
// • Drag with a drop marker, or ▲▼ buttons / keyboard; Check, 💡 Place one step, Reveal, Shuffle
// • Optional timer per sequence, stars, celebration and a summary at the end
// Rules live in GameEngine.sequence; this file is only the screens.
// ═══════════════════════════════════════════════════════════
(() => {
  if (typeof GamesHub === 'undefined') return;
  const { h } = GamesHub;

  const SETTINGS_KEY = 'gm_seq_settings_v1';
  const SEQS_KEY = 'gm_seq_list_v1';
  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];
  const DEFAULT_NAMES = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'];

  const store = {
    get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
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

  GamesHub.register('sequence', (ctx) => {
    const { E, C, session } = ctx;
    const Q = E.sequence;
    const saved = store.get(SETTINGS_KEY) || {};
    const cfg = {
      mode: saved.mode === 'teams' ? 'teams' : 'class',
      names: Array.isArray(saved.names) && saved.names.length >= 2 ? saved.names.slice(0, 6).map((n, i) => String(n || DEFAULT_NAMES[i]).slice(0, 24)) : DEFAULT_NAMES.slice(0, 2),
      turns: [1, 2, 3].includes(saved.turns) ? saved.turns : 1,
      timer: [0, 60, 90, 120].includes(saved.timer) ? saved.timer : 0,
      sound: saved.sound !== false,
      picks: Array.isArray(saved.picks) && saved.picks.length ? saved.picks : [C.sequences[0].id]
    };
    let game = null, s = null, root = null, drag = null, timer = null, clock = null, elapsed = 0, audio = null, flashIds = [];

    const mySeqs = () => (store.get(SEQS_KEY) || []).map((r) => { const n = E.normalizeSequence(r); return n.seq ? Object.assign(n.seq, { id: r.id }) : null; }).filter(Boolean);
    const allSeqs = () => C.sequences.concat(mySeqs());
    const byId = (id) => allSeqs().find((x) => x.id === id);
    const saveCfg = () => store.set(SETTINGS_KEY, cfg);
    const color = (id) => COLORS[id % COLORS.length];

    ctx.setHelp([
      'Put the cards in order from first (top) to last (bottom): drag a card, or use its ▲ ▼ buttons.',
      'Press Check order: ✓ cards are in the right place, ✗ cards are not. Keep going until all are ✓.',
      '💡 Place one step moves one card to its right place (costs 2 points). Reveal shows the answer.',
      'Teams take turns — one sequence per turn. Solving at the first check scores 10, then 7, 5, 3.',
      'Teachers: “+ New sequence” lets you type your own steps, one per line. Steps with the same text can swap places.'
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
      game = null; s = null;
      ctx.setPhase('idle'); ctx.setHud([]);
      const all = allSeqs();
      cfg.picks = cfg.picks.filter((id) => all.some((x) => x.id === id));
      if (!cfg.picks.length) cfg.picks = [C.sequences[0].id];
      const mine = mySeqs();

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
        chips('Turns each', [1, 2, 3].map((n) => ({ value: n, label: `${n} turn${n > 1 ? 's' : ''}` })), cfg.turns, (v) => { cfg.turns = v; saveCfg(); })
      ]);
      const info = h('span', { class: 'gm-note' });
      const startBtn = h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-startgame': '', text: '▶ Start', on: { click: start } });
      const updateInfo = () => { info.textContent = `${cfg.picks.length} sequence${cfg.picks.length === 1 ? '' : 's'} selected — played in a row`; startBtn.disabled = !cfg.picks.length; };
      const pickChips = chips('Sequences', all.map((x) => ({ value: x.id, label: (String(x.id).startsWith('my-') ? '⭐ ' : '') + x.title })), cfg.picks, (v, btn) => {
        const on = cfg.picks.includes(v);
        if (on && cfg.picks.length === 1) { ctx.toast('Keep at least one sequence'); return; }
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
          h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-new': '', text: '+ New sequence', on: { click: () => editor(null) } }),
          ...mine.map((m) => h('span', { class: 'gm-mine-chip' }, [
            h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'data-edit': m.id, 'aria-label': `Edit ${m.title}`, text: `✎ ${m.title}`, on: { click: () => editor(m) } }),
            h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'data-delete': m.id, 'aria-label': `Delete ${m.title}`, text: '🗑', on: { click: async () => {
              if (!(await ctx.confirm({ title: `Delete “${m.title}”?`, text: 'This sequence will be removed from this device.', ok: 'Delete', danger: true }))) return;
              store.set(SEQS_KEY, (store.get(SEQS_KEY) || []).filter((r) => r.id !== m.id)); setup();
            } } })
          ]))
        ]),
        chips('Timer', [{ value: 0, label: '😌 Off' }, { value: 60, label: '⏱ 60 s' }, { value: 90, label: '⏱ 90 s' }, { value: 120, label: '⏱ 120 s' }], cfg.timer, (v) => { cfg.timer = v; saveCfg(); }),
        chips('Sound', [{ value: true, label: 'On' }, { value: false, label: 'Off' }], cfg.sound, (v) => { cfg.sound = v; saveCfg(); })
      ]);
      ctx.body.replaceChildren(h('div', { class: 'gm-setup gm-setup-wide' }, [
        h('h3', { text: '🔢 Sequence Builder' }),
        h('p', { text: 'Put the steps of a process, story or timeline in the right order — fewer checks, more points!' }),
        h('div', { class: 'gm-setup-2col' }, [left, right]),
        cfg.picks.some((id) => !String(id).startsWith('my-')) ? h('p', { class: 'gm-sample', text: C.LABEL + '.' }) : null,
        startBtn
      ]));
      updateInfo();
    }

    // ════════ SEQUENCE EDITOR ════════
    function editor(base) {
      stopClocks();
      ctx.setPhase('idle'); ctx.setHud([]);
      const editingId = base && String(base.id).startsWith('my-') ? base.id : null;
      const titleIn = h('input', { type: 'text', class: 'gm-input gm-set-title', maxlength: '40', placeholder: 'Name of this sequence (e.g. How a bill becomes law)', value: base ? base.title : '', 'aria-label': 'Sequence name' });
      const steps = h('textarea', { class: 'gm-textarea gm-seq-steps-in', rows: '12', 'aria-label': 'Steps in the right order, one per line', placeholder: 'Type the steps in the RIGHT order — one per line.\nThe game shuffles them for the class.' });
      steps.value = base ? base.steps.map((x) => x.text).join('\n') : '';
      const errorsEl = h('div', { class: 'gm-editor-errors', role: 'alert' });
      const fileIn = h('input', { type: 'file', accept: '.json,.txt,application/json,text/plain', hidden: true });
      const sampleSel = h('select', { class: 'gm-input gm-select', 'aria-label': 'Start from a sample sequence', on: { change: (e) => {
        const smp = C.sequences.find((x) => x.id === e.target.value);
        if (smp) { titleIn.value = `${smp.title} (copy)`; steps.value = smp.steps.map((x) => x.text).join('\n'); }
        e.target.value = '';
      } } }, [h('option', { value: '', text: '⧉ Start from a sample…' }), ...C.sequences.map((x) => h('option', { value: x.id, text: x.title }))]);
      const raw = () => ({ title: titleIn.value, steps: steps.value.split(/\r?\n/) });
      function save() {
        const n = E.normalizeSequence(raw());
        errorsEl.replaceChildren(...n.errors.slice(0, 4).map((m) => h('p', { text: '⚠ ' + m })));
        if (!n.seq) { ctx.toast('Please fix the points above, then save'); return; }
        const list = (store.get(SEQS_KEY) || []).filter((r) => r.id !== editingId);
        const id = editingId || `my-${Date.now().toString(36)}`;
        list.push({ id, title: n.seq.title, steps: n.seq.steps.map((x) => x.text) });
        if (!store.set(SEQS_KEY, list)) { ctx.toast('Could not save on this device (storage is blocked)'); return; }
        if (!cfg.picks.includes(id)) cfg.picks = [id];
        saveCfg();
        ctx.toast(`Saved “${n.seq.title}” — ${n.seq.steps.length} steps`);
        setup();
      }
      fileIn.addEventListener('change', () => {
        const f = fileIn.files && fileIn.files[0];
        if (!f) return;
        if (f.size > 100000) { ctx.toast('That file is too large'); return; }
        const rd = new FileReader();
        rd.onload = () => {
          const text = String(rd.result);
          let parsed = null;
          try { parsed = JSON.parse(text); } catch (e) { parsed = null; }
          if (parsed) {
            const n = E.normalizeSequence(parsed);
            if (!n.seq) { ctx.toast('No usable sequence found in that file'); return; }
            titleIn.value = n.seq.title; steps.value = n.seq.steps.map((x) => x.text).join('\n');
          } else steps.value = text;
          ctx.toast('Imported — press Save to keep it');
        };
        rd.readAsText(f);
        fileIn.value = '';
      });
      function exportSeq() {
        const n = E.normalizeSequence(raw());
        if (!n.seq) { ctx.toast('Finish the sequence before exporting'); return; }
        const blob = new Blob([JSON.stringify({ app: 'PiyushDhara Sequence Builder', version: 1, title: n.seq.title, steps: n.seq.steps.map((x) => x.text) }, null, 2)], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: 'sequence.json' });
        document.body.appendChild(a); a.click(); a.remove();
        session.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }
      ctx.body.replaceChildren(h('div', { class: 'gm-editor' }, [
        h('div', { class: 'gm-editor-head' }, [
          h('h3', { text: editingId ? '✎ Edit sequence' : '✎ New sequence' }),
          h('div', { class: 'gm-row' }, [
            sampleSel,
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '📂 Import', on: { click: () => fileIn.click() } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '💾 Export', on: { click: exportSeq } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: 'Cancel', on: { click: setup } }),
            h('button', { type: 'button', class: 'gm-btn gm-primary', 'data-save': '', text: '✔ Save sequence', on: { click: save } })
          ])
        ]),
        titleIn,
        h('p', { class: 'gm-note', text: '3–12 steps, up to 80 characters each, in the correct order. Steps with exactly the same text are treated as interchangeable. Saved on this device only.' }),
        errorsEl, steps, fileIn
      ]));
      titleIn.focus();
    }

    // ════════ GAME ════════
    function start() {
      stopClocks();
      const list = cfg.picks.map(byId).filter(Boolean);
      if (!list.length) { ctx.toast('Choose at least one sequence'); return; }
      const teams = cfg.mode === 'teams' ? E.createTeams(cfg.names.map((x, i) => (x || '').trim() || DEFAULT_NAMES[i])) : null;
      if (teams) { cfg.names = teams.list.map((t) => t.name); saveCfg(); }
      const total = teams ? teams.list.length * cfg.turns : list.length;
      game = { list, teams, total, round: 0, history: [], totalTime: 0 };
      next();
    }
    const curSeq = () => game.list[game.round % game.list.length];
    const turnTeam = () => (game.teams ? game.round % game.teams.list.length : null);

    function next() {
      stopClocks();
      ctx.clearResult();
      if (game.round >= game.total) { final(); return; }
      s = E.createSequence(curSeq(), ctx.rng);
      elapsed = 0; flashIds = [];
      ctx.setPhase('playing');
      root = h('div', { class: 'gm-seq' });
      ctx.body.replaceChildren(root);
      /** Where a dragged card would land: next to the nearest other card (works for one or two columns). */
      const dropIndex = (el, x, y) => {
        const others = [...root.querySelectorAll('.gm-seq-item')].filter((o) => o !== el);
        let best = 0, bestD = Infinity;
        others.forEach((o, k) => { const r = o.getBoundingClientRect(); const d = Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom)); if (d < bestD) { bestD = d; best = k; } });
        if (!others.length) return { others, to: 0 };
        const r = others[best].getBoundingClientRect();
        return { others, to: y > r.top + r.height / 2 ? best + 1 : best };
      };
      drag = ctx.delegateDrag(root, '.gm-seq-item', {
        onMove: (el, x, y) => {
          const { others, to } = dropIndex(el, x, y);
          others.forEach((o, k) => { o.classList.toggle('gm-drop-before', k === to); o.classList.toggle('gm-drop-after', to === others.length && k === others.length - 1); });
        },
        onDrop: (el, x, y, cancelled) => {
          root.querySelectorAll('.gm-drop-before, .gm-drop-after').forEach((o) => o.classList.remove('gm-drop-before', 'gm-drop-after'));
          if (!cancelled) {
            const from = +el.dataset.index;
            const { to } = dropIndex(el, x, y);
            if (to !== from && Q.move(s, from, to)) { tone([520], 0.04); flashIds = [el.dataset.id]; }
          }
          render();
        }
      });
      if (cfg.timer) {
        timer = session.countdown(cfg.timer, { onTick: (l) => { const t = document.querySelector('[data-timer]'); if (t) { t.textContent = `⏱ ${fmtTime(l)}`; t.classList.toggle('is-low', l <= 10); } if (l > 0 && l <= 5) tone([880], 0.05); }, onEnd: () => { timer = null; endRound('time'); } });
        timer.start();
      } else {
        clock = session.setInterval(() => { elapsed++; const t = document.querySelector('[data-timer]'); if (t) t.textContent = `⏱ ${fmtTime(elapsed)}`; }, 1000);
      }
      render();
    }

    function move(from, to, focusId) {
      if (!Q.move(s, from, to)) return;
      tone([520], 0.04);
      flashIds = [focusId];
      render();
      ctx.announce(`Moved to position ${to + 1}`);
      const li = root.querySelector(`[data-id="${focusId}"]`);
      const same = li && li.querySelector(`[data-dir="${to < from ? 'up' : 'down'}"]`);
      const other = li && li.querySelector(`[data-dir="${to < from ? 'down' : 'up'}"]`);
      (same && !same.disabled ? same : other)?.focus({ preventScroll: true });
    }

    function render() {
      const seq = curSeq();
      const team = turnTeam();
      ctx.setHud([
        h('span', { class: 'gm-pill', text: `${game.teams ? 'Turn' : 'Sequence'} ${game.round + 1}/${game.total}` }),
        h('span', { class: 'gm-pill gm-timer', 'data-timer': '', text: `⏱ ${fmtTime(timer ? timer.left : elapsed)}` }),
        h('span', { class: 'gm-pill', text: `Checks ${s.checks}` }),
        s.hints ? h('span', { class: 'gm-pill', text: `💡 ${s.hints}` }) : null
      ]);
      const n = s.order.length;
      root.classList.toggle('is-long', n > 7);
      root.replaceChildren(...[
        h('div', { class: 'gm-seq-head' }, [
          h('h3', { class: 'gm-seq-title', text: seq.title }),
          team !== null ? h('span', { class: 'gm-team-badge', style: `--team:${color(team)}`, text: `▶ ${game.teams.list[team].name}` }) : null,
          h('span', { class: 'gm-note', text: '⬆ First  ·  Last ⬇' })
        ]),
        h('ol', { class: 'gm-seq-list', style: `--rows:${Math.ceil(n / 2)}` }, s.order.map((it, i) => {
          const mark = s.checked ? (s.checked[i] ? 'ok' : 'bad') : null;
          return h('li', { class: 'gm-seq-item' + (mark ? ' is-' + mark : '') + (flashIds.includes(it.id) ? ' is-moved' : ''), 'data-index': i, 'data-id': it.id, 'aria-disabled': String(s.revealed), style: `--i:${i}`,
            'aria-label': `Position ${i + 1}: ${it.text}${mark === 'ok' ? ', in the right place' : mark === 'bad' ? ', not in the right place' : ''}` }, [
            h('span', { class: 'gm-seq-num', 'aria-hidden': 'true', text: String(i + 1) }),
            h('span', { class: 'gm-seq-grip', 'aria-hidden': 'true', text: '⋮⋮' }),
            h('span', { class: 'gm-seq-text', text: it.text }),
            mark ? h('span', { class: 'gm-mark', 'aria-hidden': 'true', text: mark === 'ok' ? '✓' : '✗' }) : null,
            h('span', { class: 'gm-seq-btns', 'data-nodrag': '' }, [
              h('button', { type: 'button', class: 'gm-btn gm-mini', 'data-dir': 'up', disabled: i === 0 || s.revealed, 'aria-label': `Move “${it.text}” up`, text: '▲', on: { click: () => move(i, i - 1, it.id) } }),
              h('button', { type: 'button', class: 'gm-btn gm-mini', 'data-dir': 'down', disabled: i === n - 1 || s.revealed, 'aria-label': `Move “${it.text}” down`, text: '▼', on: { click: () => move(i, i + 1, it.id) } })
            ])
          ]);
        })),
        h('div', { class: 'gm-row gm-center gm-seq-actions' }, [
          h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-check': '', disabled: s.revealed, text: '✔ Check order', on: { click: check } }),
          h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-hint': '', disabled: s.revealed, text: '💡 Place one step (−2)', on: { click: hint } }),
          h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '👁 Reveal order', disabled: s.revealed, on: { click: reveal } }),
          h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '🔀 Shuffle', disabled: s.revealed, on: { click: () => { const ch = s.checks, hi = s.hints; Q.reset(s, ctx.rng); s.checks = ch; s.hints = hi; flashIds = []; render(); } } })
        ]),
        game.teams ? h('div', { class: 'gm-scoreboard gm-seq-scores', role: 'group', 'aria-label': 'Scores' }, game.teams.list.map((t) => h('div', { class: 'gm-scorecard' + (t.id === team ? ' is-turn' : ''), style: `--team:${color(t.id)}` }, [
          h('span', { class: 'gm-scorecard-name', text: (t.id === team ? '▶ ' : '') + t.name }), h('span', { class: 'gm-scorecard-score', text: String(t.score) })
        ]))) : null
      ].filter(Boolean));
      flashIds = [];
    }

    function check() {
      ctx.setPhase('checking');
      const r = Q.check(s);
      ctx.setPhase('playing');
      render();
      ctx.announce(`${r.correct} of ${r.total} in the right place`);
      if (r.correct === r.total) { endRound('solved'); return; }
      tone([300, 220], 0.1);
      ctx.toast(`${r.correct} of ${r.total} in the right place — keep going!`);
    }
    function hint() {
      const r = Q.hint(s);
      if (!r) { ctx.toast('Everything is already in place — press Check order'); return; }
      tone([700, 900], 0.08);
      flashIds = [r.id];
      render();
      ctx.toast(`💡 Step ${r.to + 1} is now in place`);
    }
    async function reveal() {
      if (!(await ctx.confirm({ title: 'Reveal the correct order?', text: 'This ends the round with no points.', ok: 'Reveal' }))) return;
      Q.reveal(s);
      render();
      ctx.announce('Correct order shown');
      endRound('revealed');
    }

    function endRound(how) {
      const time = cfg.timer ? cfg.timer - (timer ? timer.left : 0) : elapsed;
      stopClocks();
      const seq = curSeq(), team = turnTeam();
      const solved = how === 'solved';
      const pts = solved ? Q.points(s) : 0;
      if (game.teams && pts) game.teams.award(team, pts);
      game.history.push({ title: seq.title, solved, checks: s.checks, hints: s.hints, team, pts, time, stars: solved ? Q.stars(s) : 0 });
      game.round++;
      if (solved) {
        tone([523, 659, 784, 1047], 0.12);
        root.querySelector('.gm-seq-list')?.classList.add('is-celebrate');
      } else tone([440, 330, 220], 0.16);
      const done = game.round >= game.total;
      const st = solved ? Q.stars(s) : 0;
      ctx.showResult({
        icon: solved ? '🎉' : how === 'time' ? '⏰' : '👁',
        title: solved ? 'Perfect order!' : how === 'time' ? "Time's up!" : 'Correct order shown',
        lines: [
          seq.title,
          solved ? `Solved with ${s.checks} check${s.checks === 1 ? '' : 's'}${s.hints ? ` and ${s.hints} hint${s.hints === 1 ? '' : 's'}` : ''} in ${fmtTime(time)}.` : 'No points this time.',
          game.teams && solved ? `${game.teams.list[team].name} +${pts} points!` : ''
        ].filter(Boolean),
        extra: solved && !game.teams ? h('div', { class: 'gm-stars', 'aria-label': `${st} out of 3 stars` }, [1, 2, 3].map((i) => h('span', { class: 'gm-star' + (i <= st ? ' is-on' : ''), 'aria-hidden': 'true', text: '★' }))) : null,
        peekable: true, hub: false,
        actions: [{ label: done ? '🏆 See results' : (game.teams ? `▶ ${game.teams.list[game.round % game.teams.list.length].name}'s turn` : '▶ Next sequence'), primary: true, onClick: () => (done ? final() : next()) }]
      });
    }

    function final() {
      stopClocks();
      tone([523, 659, 784, 1047], 0.14);
      const summary = h('ul', { class: 'gm-word-summary gm-seq-summary' }, game.history.map((r) => h('li', { class: r.solved ? 'is-hit' : 'is-miss' }, [
        h('span', { text: r.solved ? '✓' : '✗' }), h('strong', { text: r.title }),
        h('span', { class: 'gm-note', text: r.solved ? `${r.checks} check${r.checks === 1 ? '' : 's'}${r.team !== null && game.teams ? ` · ${game.teams.list[r.team].name} +${r.pts}` : ''}` : 'revealed / time' })
      ])));
      if (game.teams) {
        const rank = game.teams.list.slice().sort((a, b) => b.score - a.score);
        const winners = rank.filter((t) => t.score === rank[0].score);
        let place = 0, last = null;
        ctx.showResult({
          icon: '🏆', title: winners.length > 1 ? `It's a tie: ${winners.map((t) => t.name).join(' & ')}` : `${winners[0].name} wins!`,
          extra: h('div', { class: 'gm-final-body' }, [h('ol', { class: 'gm-podium' }, rank.map((t, i) => { if (t.score !== last) { place = i + 1; last = t.score; } return h('li', { style: `--team:${color(t.id)}` }, [
            h('span', { class: 'gm-podium-medal', text: place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.` }), h('span', { class: 'gm-podium-name', text: t.name }), h('span', { class: 'gm-podium-score', text: `${t.score} pts` })
          ]); })), h('h4', { class: 'gm-gallery-title', text: 'Turns' }), summary]),
          actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
        });
      } else {
        const solved = game.history.filter((r) => r.solved).length;
        const stars = Math.round(game.history.reduce((n, r) => n + r.stars, 0) / Math.max(1, game.history.length));
        ctx.showResult({
          icon: '🔢', title: `${solved} of ${game.history.length} sequence${game.history.length === 1 ? '' : 's'} solved!`,
          extra: h('div', { class: 'gm-final-body' }, [
            h('div', { class: 'gm-stars', 'aria-label': `${stars} out of 3 stars` }, [1, 2, 3].map((i) => h('span', { class: 'gm-star' + (i <= stars ? ' is-on' : ''), 'aria-hidden': 'true', text: '★' }))),
            summary
          ]),
          actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
        });
      }
      ctx.body.querySelector('.gm-result')?.classList.add('gm-result-wide');
    }

    setup();
    return {
      hasProgress: () => !!game && game.round < game.total && (game.round > 0 || (s && s.checks > 0)),
      unmount: stopClocks,
      _state: () => s, _game: () => game, _timer: () => timer
    };
  });
})();
