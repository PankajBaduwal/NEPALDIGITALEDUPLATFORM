'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — MEMORY MATCH
// • Whole class or 2–6 teams taking turns (a match scores and the same team goes again)
// • Teacher-made pairs (term ↔ meaning) typed on the board, saved on this device, import/export .json
// • 6–15 pairs, relaxed (count-up) or "beat the clock" (60/90/120 s)
// • Optional memorise preview, 3D card flips, streaks, hints, star rating and saved best scores
// Rules live in GameEngine.memory; this file is only the screens.
// ═══════════════════════════════════════════════════════════
(() => {
  if (typeof GamesHub === 'undefined') return;
  const { h } = GamesHub;

  const SETTINGS_KEY = 'gm_memory_settings_v1';
  const SET_KEY = 'gm_memory_set_v1';
  const BEST_KEY = 'gm_memory_best_v1';
  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];
  const DEFAULT_NAMES = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'];
  const MAX_PAIRS = 15;

  const store = {
    get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  function chips(label, options, value, onChange) {
    const wrap = h('div', { class: 'gm-choice', role: 'group', 'aria-label': label }, [h('span', { class: 'gm-choice-label', text: label })]);
    options.forEach((o, i) => wrap.appendChild(h('button', {
      type: 'button', class: 'gm-chip', 'aria-pressed': String(o.value === value), disabled: !!o.disabled, title: o.title || null, text: o.label,
      on: { click: () => { wrap.querySelectorAll('.gm-chip').forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); onChange(o.value); } }
    })));
    return wrap;
  }

  GamesHub.register('memory', (ctx) => {
    const { E, C, session } = ctx;
    const saved = store.get(SETTINGS_KEY) || {};
    const cfg = {
      mode: saved.mode === 'teams' ? 'teams' : 'class',
      names: Array.isArray(saved.names) && saved.names.length >= 2 ? saved.names.slice(0, 6).map((n, i) => String(n || DEFAULT_NAMES[i]).slice(0, 24)) : DEFAULT_NAMES.slice(0, 2),
      pairs: [6, 8, 10, 12, 15].includes(saved.pairs) ? saved.pairs : 8,
      clock: [0, 60, 90, 120].includes(saved.clock) ? saved.clock : 0,
      preview: [0, 3, 5].includes(saved.preview) ? saved.preview : 3,
      sound: saved.sound !== false,
      source: saved.source === 'mine' ? 'mine' : 'sample'
    };
    let s = null, elapsed = 0, clock = null, countdown = null, flipBack = null, busy = false, audio = null, cardEls = new Map(), grid = null;

    const myPairs = () => { const raw = store.get(SET_KEY); const n = raw ? E.normalizePairSet(raw) : null; return n && n.pairs.length ? n.pairs : null; };
    const activePairs = () => (cfg.source === 'mine' && myPairs()) || C.memory;
    const saveCfg = () => store.set(SETTINGS_KEY, cfg);
    const color = (id) => COLORS[id % COLORS.length];
    const bestKey = () => `${cfg.source}|${Math.min(cfg.pairs, activePairs().length)}|${cfg.clock}`;

    ctx.setHelp([
      'Turn over two cards. If they match (a term and its meaning) they stay up. If not, they turn back — remember where they were!',
      'Teams: a match scores a point and the same team goes again; a miss passes the turn.',
      'Beat the clock: find every pair before the time runs out. Memorise preview shows all cards for a few seconds first.',
      'Teachers: “✎ Create my pairs” lets you type your own terms and meanings. They are saved on this device; Export shares them.',
      'Keyboard: arrow keys move between cards, Enter or Space turns a card, H gives a hint.'
    ]);

    function tone(freqs, dur = 0.14) {
      if (!cfg.sound) return;
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        let t = audio.currentTime;
        freqs.forEach((f) => {
          const o = audio.createOscillator(), g = audio.createGain();
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + dur + 0.02);
          t += dur * 0.9;
        });
      } catch (e) { /* audio unavailable */ }
    }
    function stopClocks() {
      if (clock !== null) { session.clearInterval(clock); clock = null; }
      if (countdown) { countdown.stop(); countdown = null; }
      if (flipBack !== null) { session.clearTimeout(flipBack); flipBack = null; }
    }
    session.onDispose(() => { stopClocks(); if (audio) { try { audio.close(); } catch (e) { /* ignore */ } audio = null; } });

    // ════════ SETUP ════════
    function setup() {
      stopClocks();
      s = null;
      ctx.setPhase('idle'); ctx.setHud([]);
      const mine = myPairs();
      if (cfg.source === 'mine' && !mine) cfg.source = 'sample';
      const available = activePairs().length;
      const sizes = [6, 8, 10, 12, 15].filter((n) => n <= Math.max(available, 6));
      if (cfg.pairs > available) cfg.pairs = sizes.filter((n) => n <= available).pop() || available;

      // teams
      const names = h('div', { class: 'gm-team-names' });
      const count = h('span', { class: 'gm-stepper-value', text: String(cfg.names.length) });
      const minus = h('button', { type: 'button', class: 'gm-btn gm-stepper-btn', 'aria-label': 'Fewer teams', text: '−' });
      const plus = h('button', { type: 'button', class: 'gm-btn gm-stepper-btn', 'aria-label': 'More teams', text: '+' });
      const teamBox = h('div', { class: 'gm-setup-col', hidden: cfg.mode !== 'teams' }, [
        h('div', { class: 'gm-choice' }, [h('span', { class: 'gm-choice-label', text: 'Teams' }), h('div', { class: 'gm-stepper', role: 'group', 'aria-label': 'Number of teams' }, [minus, count, plus])]),
        names
      ]);
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

      const best = store.get(BEST_KEY) || {};
      const rec = best[bestKey()];
      const left = h('section', { class: 'gm-setup-col', 'aria-label': 'Players' }, [
        chips('Players', [{ value: 'class', label: '👥 Whole class' }, { value: 'teams', label: '🏁 Teams' }], cfg.mode, (v) => { cfg.mode = v; saveCfg(); teamBox.hidden = v !== 'teams'; }),
        teamBox,
        rec ? h('p', { class: 'gm-note gm-best', text: `🏅 Best (whole class, these settings): ${rec.attempts} attempts · ${fmtTime(rec.time)}` }) : null
      ]);
      const right = h('section', { class: 'gm-setup-col', 'aria-label': 'Game settings' }, [
        chips('Cards', [{ value: 'sample', label: 'Sample pairs' }].concat(mine ? [{ value: 'mine', label: `My pairs (${mine.length})` }] : []), cfg.source, (v) => { cfg.source = v; saveCfg(); setup(); }),
        h('div', { class: 'gm-row' }, [
          h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-edit': '', text: mine ? '✎ Edit my pairs' : '✎ Create my pairs', on: { click: editor } }),
          h('span', { class: 'gm-note', text: `${available} pairs available` })
        ]),
        chips('Pairs', sizes.map((n) => ({ value: n, label: `${n} pairs · ${n * 2} cards`, disabled: n > available, title: n > available ? 'Not enough pairs in this set' : null })), cfg.pairs, (v) => { cfg.pairs = v; saveCfg(); }),
        chips('Mode', [{ value: 0, label: '😌 Relaxed' }, { value: 60, label: '⏱ 60 s' }, { value: 90, label: '⏱ 90 s' }, { value: 120, label: '⏱ 120 s' }], cfg.clock, (v) => { cfg.clock = v; saveCfg(); }),
        chips('Memorise first', [{ value: 0, label: 'Off' }, { value: 3, label: '3 s' }, { value: 5, label: '5 s' }], cfg.preview, (v) => { cfg.preview = v; saveCfg(); }),
        chips('Sound', [{ value: true, label: 'On' }, { value: false, label: 'Off' }], cfg.sound, (v) => { cfg.sound = v; saveCfg(); })
      ]);
      ctx.body.replaceChildren(h('div', { class: 'gm-setup gm-setup-wide' }, [
        h('h3', { text: '🃏 Memory Match' }),
        h('p', { text: 'Flip two cards at a time and match every term with its meaning — alone, as a class, or team against team.' }),
        h('div', { class: 'gm-setup-2col' }, [left, right]),
        cfg.source === 'sample' ? h('p', { class: 'gm-sample', text: C.LABEL + '.' }) : null,
        h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-startgame': '', text: '▶ Start', on: { click: start } })
      ]));
    }

    // ════════ PAIR EDITOR ════════
    function editor() {
      stopClocks();
      ctx.setPhase('idle'); ctx.setHud([]);
      let rows = (myPairs() || C.memory).map((p) => ({ a: p.a, b: p.b }));
      const errorsEl = h('div', { class: 'gm-editor-errors', role: 'alert' });
      const list = h('div', { class: 'gm-editor-body gm-pair-list' });
      const fileIn = h('input', { type: 'file', accept: '.json,application/json', hidden: true });
      const addBtn = h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '+ Add pair',
        on: { click: () => { if (rows.length < MAX_PAIRS) { rows.push({ a: '', b: '' }); draw(); list.querySelectorAll('.gm-pair-row input')[rows.length * 2 - 2]?.focus(); } } } });
      function draw() {
        list.replaceChildren(...rows.map((r, i) => h('div', { class: 'gm-pair-row' }, [
          h('span', { class: 'gm-pair-num', text: String(i + 1) }),
          h('input', { type: 'text', class: 'gm-input', maxlength: '40', placeholder: 'Term (e.g. Photosynthesis)', value: r.a, 'aria-label': `Pair ${i + 1} term`, on: { input: (e) => { r.a = e.target.value; } } }),
          h('span', { class: 'gm-pair-link', 'aria-hidden': 'true', text: '↔' }),
          h('input', { type: 'text', class: 'gm-input', maxlength: '80', placeholder: 'Its match (e.g. How plants make food)', value: r.b, 'aria-label': `Pair ${i + 1} match`, on: { input: (e) => { r.b = e.target.value; } } }),
          h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'aria-label': `Delete pair ${i + 1}`, text: '✕', on: { click: () => { rows.splice(i, 1); draw(); } } })
        ])));
        addBtn.disabled = rows.length >= MAX_PAIRS;
      }
      function save() {
        const n = E.normalizePairSet({ pairs: rows });
        errorsEl.replaceChildren(...n.errors.slice(0, 4).map((m) => h('p', { text: '⚠ ' + m })));
        if (n.errors.length || !n.pairs.length) { ctx.toast('Please fix the highlighted rows, then save'); return; }
        if (!store.set(SET_KEY, { pairs: n.pairs })) { ctx.toast('Could not save on this device (storage is blocked)'); return; }
        cfg.source = 'mine'; saveCfg();
        ctx.toast(`Saved ${n.pairs.length} pairs`);
        setup();
      }
      fileIn.addEventListener('change', () => {
        const f = fileIn.files && fileIn.files[0];
        if (!f) return;
        if (f.size > 200000) { ctx.toast('That file is too large for a pair set'); return; }
        const rd = new FileReader();
        rd.onload = () => {
          let parsed = null;
          try { parsed = JSON.parse(String(rd.result)); } catch (e) { ctx.toast('That file is not a valid pair set (.json)'); return; }
          const n = E.normalizePairSet(parsed);
          if (!n.pairs.length) { ctx.toast('No usable pairs found in that file'); return; }
          rows = n.pairs.map((p) => ({ a: p.a, b: p.b })); draw();
          ctx.toast(`Imported ${rows.length} pairs — press Save to keep them`);
        };
        rd.readAsText(f);
        fileIn.value = '';
      });
      function exportSet() {
        const n = E.normalizePairSet({ pairs: rows });
        if (!n.pairs.length) { ctx.toast('Nothing to export yet'); return; }
        const blob = new Blob([JSON.stringify({ app: 'PiyushDhara Memory Match', version: 1, pairs: n.pairs }, null, 2)], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: 'memory-pairs.json' });
        document.body.appendChild(a); a.click(); a.remove();
        session.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }
      ctx.body.replaceChildren(h('div', { class: 'gm-editor' }, [
        h('div', { class: 'gm-editor-head' }, [
          h('h3', { text: '✎ My memory pairs' }),
          h('div', { class: 'gm-row' }, [
            addBtn,
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '📂 Import', on: { click: () => fileIn.click() } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '💾 Export', on: { click: exportSet } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '↺ Start from sample', on: { click: async () => { if (await ctx.confirm({ title: 'Replace these pairs with the sample set?', text: 'Unsaved changes will be lost.', ok: 'Replace', danger: true })) { rows = C.memory.map((p) => ({ a: p.a, b: p.b })); draw(); } } } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: 'Cancel', on: { click: setup } }),
            h('button', { type: 'button', class: 'gm-btn gm-primary', 'data-save': '', text: '✔ Save pairs', on: { click: save } })
          ])
        ]),
        h('p', { class: 'gm-note', text: `Each pair makes two cards: a term and its match (a meaning, answer, symbol or translation). 2–${MAX_PAIRS} pairs. Saved on this device only.` }),
        errorsEl, list, fileIn
      ]));
      draw();
      list.querySelector('input')?.focus();
    }

    // ════════ GAME ════════
    function start() {
      stopClocks();
      const pool = activePairs();
      const n = Math.min(cfg.pairs, pool.length);
      const teams = cfg.mode === 'teams' ? cfg.names.map((x, i) => (x || '').trim() || DEFAULT_NAMES[i]) : null;
      if (teams) { cfg.names = teams.slice(); saveCfg(); }
      s = E.createMemory(E.shuffle(pool, ctx.rng).slice(0, n), ctx.rng, { teams });
      elapsed = 0; busy = false;
      ctx.setPhase('playing');
      build();
      if (cfg.preview) preview(cfg.preview); else beginClock();
    }
    const cols = () => (s.pairs <= 8 ? 4 : s.pairs <= 10 ? 5 : 6);

    function build() {
      cardEls = new Map();
      grid = h('div', { class: 'gm-memory-grid', style: `--cols:${cols()}`, role: 'grid', 'aria-label': 'Cards' });
      s.cards.forEach((c, i) => {
        const btn = h('button', { type: 'button', class: 'gm-mcard', 'data-id': c.id, 'data-index': i, on: { click: () => flip(c.id) } }, [
          h('span', { class: 'gm-mcard-inner', 'aria-hidden': 'true' }, [
            h('span', { class: 'gm-mcard-face gm-mcard-cover' }, [h('span', { class: 'gm-mcard-back', text: '?' })]),
            h('span', { class: 'gm-mcard-face gm-mcard-front' }, [
              h('span', { class: 'gm-mcard-kind', text: c.side === 'a' ? 'Term' : 'Meaning' }),
              h('span', { class: 'gm-mcard-text', text: c.text }),
              h('span', { class: 'gm-mcard-ok', text: '✓ Match' })
            ])
          ])
        ]);
        cardEls.set(c.id, btn);
        grid.appendChild(btn);
      });
      const banner = h('div', { class: 'gm-mem-banner', role: 'status', hidden: true });
      ctx.body.replaceChildren(h('div', { class: 'gm-memory' + (s.teams ? ' has-teams' : '') }, [
        grid, banner,
        s.teams ? h('div', { class: 'gm-trivia-foot' }, [h('div', { class: 'gm-scoreboard', 'data-board': '' })]) : null
      ]));
      paint();
    }

    function paint(peekIds) {
      s.cards.forEach((c, i) => {
        const el = cardEls.get(c.id);
        if (!el) return;
        const up = c.faceUp || c.matched || (peekIds && peekIds.includes(c.id));
        el.classList.toggle('is-up', !!up);
        el.classList.toggle('is-matched', c.matched);
        el.style.setProperty('--team', c.by !== null && c.by !== undefined ? color(c.by) : '#16a34a');
        el.setAttribute('aria-label', up ? `${c.side === 'a' ? 'Term' : 'Meaning'}: ${c.text}${c.matched ? ', matched' : ''}` : `Card ${i + 1}, face down`);
        el.setAttribute('aria-disabled', String(c.matched || s.locked || busy));
      });
      hud();
      if (s.teams) {
        const board = ctx.body.querySelector('[data-board]');
        if (board) board.replaceChildren(...s.teams.list.map((t) => h('div', { class: 'gm-scorecard' + (t.id === s.turn ? ' is-turn' : ''), style: `--team:${color(t.id)}` }, [
          h('span', { class: 'gm-scorecard-name', text: (t.id === s.turn ? '▶ ' : '') + t.name }),
          h('span', { class: 'gm-scorecard-score', 'aria-label': `${t.name}: ${t.score} pairs`, text: String(t.score) })
        ])));
      }
    }

    function hud() {
      const timeText = countdown ? `⏱ ${fmtTime(countdown.left)}` : `⏱ ${fmtTime(elapsed)}`;
      ctx.setHud([
        h('span', { class: 'gm-pill gm-timer' + (countdown && countdown.left <= 10 ? ' is-low' : ''), 'data-timer': '', text: timeText }),
        h('span', { class: 'gm-pill', text: `Pairs ${s.matches}/${s.pairs}` }),
        h('span', { class: 'gm-pill', title: 'Attempts', text: `Tries ${s.attempts}` }),
        s.streak >= 2 ? h('span', { class: 'gm-pill gm-streak', text: `🔥 ${s.streak} in a row` }) : null,
        h('button', { type: 'button', class: 'gm-btn gm-ghost gm-mini', 'data-hint': '', text: '💡 Hint', disabled: busy || s.locked || E.memory.done(s), on: { click: hint } })
      ]);
    }

    function banner(text, ms) {
      const b = ctx.body.querySelector('.gm-mem-banner');
      if (!b) return;
      b.textContent = text; b.hidden = false;
      if (ms) session.setTimeout(() => { if (b.textContent === text) b.hidden = true; }, ms);
    }

    function preview(sec) {
      busy = true;
      const all = s.cards.map((c) => c.id);
      paint(all);
      let left = sec;
      banner(`👀 Memorise! ${left}`);
      const id = session.setInterval(() => {
        left--;
        if (left > 0) { banner(`👀 Memorise! ${left}`); tone([660], 0.05); return; }
        session.clearInterval(id);
        busy = false;
        banner('Go!', 900);
        paint();
        beginClock();
      }, 1000);
    }

    function beginClock() {
      if (cfg.clock) {
        countdown = session.countdown(cfg.clock, {
          onTick: (l) => { hud(); if (l > 0 && l <= 5) tone([880], 0.05); },
          onEnd: () => { countdown = null; timeUp(); }
        });
        countdown.start();
      } else {
        clock = session.setInterval(() => { elapsed++; const t = document.querySelector('[data-timer]'); if (t) t.textContent = `⏱ ${fmtTime(elapsed)}`; }, 1000);
      }
      hud();
    }

    function flip(id) {
      if (!s || busy || ctx.lifecycle.phase !== 'playing') return;
      const r = E.memory.flip(s, id);
      if (r === 'ignored') return;
      if (cfg.clock && countdown) elapsed = cfg.clock - countdown.left;
      paint();
      if (r === 'flipped') { tone([520], 0.05); return; }
      if (r === 'match') {
        tone([523, 784], 0.12);
        const who = s.teams ? s.teams.list[s.turn].name : null;
        ctx.announce(who ? `Match! ${who} scores and goes again` : 'Match!');
        if (s.streak >= 3) banner(`🔥 ${s.streak} in a row!`, 1100);
        else if (who) banner(`✓ ${who} found a pair — go again!`, 1100);
        if (E.memory.done(s)) finish();
        return;
      }
      // mismatch: shake, then turn back (and pass the turn in team play)
      tone([300, 240], 0.12);
      s.picked.forEach((c) => cardEls.get(c.id)?.classList.add('is-wrong'));
      ctx.announce('Not a match');
      flipBack = session.setTimeout(() => {
        flipBack = null;
        s.picked.forEach((c) => cardEls.get(c.id)?.classList.remove('is-wrong'));
        E.memory.resolve(s);
        paint();
        if (s.teams) banner(`▶ ${s.teams.list[s.turn].name}'s turn`, 1100);
      }, ctx.reducedMotion ? 1100 : 1000);
    }

    function hint() {
      if (!s || busy || s.locked) return;
      const ids = E.memory.hint(s);
      if (!ids) return;
      busy = true;
      ids.forEach((x) => cardEls.get(x)?.classList.add('is-hint'));
      paint(ids);
      tone([700, 900], 0.08);
      session.setTimeout(() => { busy = false; ids.forEach((x) => cardEls.get(x)?.classList.remove('is-hint')); paint(); }, 1300);
    }

    function stars(n) { return h('div', { class: 'gm-stars', 'aria-label': `${n} out of 3 stars` }, [1, 2, 3].map((i) => h('span', { class: 'gm-star' + (i <= n ? ' is-on' : ''), 'aria-hidden': 'true', text: '★' }))); }

    function finish() {
      const time = cfg.clock ? cfg.clock - (countdown ? countdown.left : 0) : elapsed;
      stopClocks();
      tone([523, 659, 784, 1047], 0.14);
      if (s.teams) {
        const rank = s.teams.list.slice().sort((a, b) => b.score - a.score);
        const top = rank[0].score, winners = rank.filter((t) => t.score === top);
        let place = 0, last = null;
        ctx.showResult({
          icon: '🏆', title: winners.length > 1 ? `It's a tie: ${winners.map((t) => t.name).join(' & ')}` : `${winners[0].name} wins!`,
          lines: [`All ${s.pairs} pairs found in ${fmtTime(time)}.`],
          extra: h('ol', { class: 'gm-podium' }, rank.map((t, i) => { if (t.score !== last) { place = i + 1; last = t.score; } return h('li', { style: `--team:${color(t.id)}` }, [
            h('span', { class: 'gm-podium-medal', text: place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.` }), h('span', { class: 'gm-podium-name', text: t.name }), h('span', { class: 'gm-podium-score', text: `${t.score} pair${t.score === 1 ? '' : 's'}` })
          ]); })),
          actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
        });
        return;
      }
      const st = E.memory.stars(s);
      const best = store.get(BEST_KEY) || {};
      const k = bestKey(), prev = best[k];
      const isBest = !prev || s.attempts < prev.attempts || (s.attempts === prev.attempts && time < prev.time);
      if (isBest) { best[k] = { attempts: s.attempts, time }; store.set(BEST_KEY, best); }
      ctx.showResult({
        icon: '🧠', title: st === 3 ? 'Amazing memory!' : st === 2 ? 'Great job!' : 'All pairs found!',
        extra: h('div', { class: 'gm-mem-result' }, [
          stars(st),
          isBest ? h('p', { class: 'gm-newbest', text: prev ? '🏅 New best score!' : '🏅 Best score saved!' }) : null,
          h('table', { class: 'gm-metrics' }, [
            ['Time', fmtTime(time)], ['Attempts', `${s.attempts} (perfect = ${s.pairs})`], ['Accuracy', `${E.memory.accuracy(s)}%`], ['Best streak', `🔥 ${s.bestStreak}`], ['Hints used', String(s.hints)]
          ].concat(prev && !isBest ? [['Best so far', `${prev.attempts} attempts · ${fmtTime(prev.time)}`]] : []).map(([a, b]) => h('tr', null, [h('th', { scope: 'row', text: a }), h('td', { text: b })])))
        ]),
        actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
      });
    }

    function timeUp() {
      stopClocks();
      busy = true;
      paint(s.cards.map((c) => c.id));   // show where everything was
      tone([440, 330, 220], 0.18);
      ctx.showResult({
        icon: '⏰', title: "Time's up!",
        lines: [`You found ${s.matches} of ${s.pairs} pairs in ${fmtTime(cfg.clock)}.`, s.matches >= s.pairs / 2 ? 'So close — try again!' : 'Try the Relaxed mode or a longer time first.'],
        actions: [{ label: '↻ Try again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
      });
    }

    function onKey(e) {
      if (!s || !grid || ctx.body.querySelector('.gm-result')) return;
      if (e.key === 'h' || e.key === 'H') { e.preventDefault(); hint(); return; }
      const cur = document.activeElement && document.activeElement.closest ? document.activeElement.closest('.gm-mcard') : null;
      const move = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols(), ArrowDown: cols() }[e.key];
      if (move === undefined) return;
      e.preventDefault();
      const i = cur ? +cur.dataset.index : -1;
      const next = Math.max(0, Math.min(s.cards.length - 1, i < 0 ? 0 : i + move));
      grid.querySelector(`[data-index="${next}"]`)?.focus();
    }

    setup();
    return {
      hasProgress: () => !!s && s.attempts > 0 && !E.memory.done(s) && ctx.lifecycle.phase === 'playing',
      unmount: stopClocks, onKey,
      _state: () => s, _cfg: () => cfg, _busy: () => busy
    };
  });
})();
