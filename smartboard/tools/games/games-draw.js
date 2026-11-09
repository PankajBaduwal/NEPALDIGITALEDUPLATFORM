'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — DRAW & GUESS (Pictionary)
// • Teams (2–6) take turns drawing for their own team, with speed points (3 / 2 / 1),
//   or the whole class guesses together
// • Sample word categories or the teacher's own words (with optional clues), saved on this device,
//   import/export .json, paste many at once
// • Secret word: hold-to-peek for the drawer only; automatic hints (word length, then letters)
// • Drawing toolbox: 6 colours, 3 sizes, eraser, undo, clear
// • Typed guesses with "So close!", steal for other teams when time runs out, drawing gallery at the end
// Rules live in GameEngine.pictionary / GameEngine.drawGame; this file is only the screens.
// ═══════════════════════════════════════════════════════════
(() => {
  if (typeof GamesHub === 'undefined') return;
  const { h } = GamesHub;

  const SETTINGS_KEY = 'gm_draw_settings_v1';
  const WORDS_KEY = 'gm_draw_words_v1';
  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];
  const DEFAULT_NAMES = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'];
  const PENS = [['#0f172a', 'Black'], ['#2563eb', 'Blue'], ['#dc2626', 'Red'], ['#16a34a', 'Green'], ['#ea580c', 'Orange'], ['#9333ea', 'Purple']];
  const SIZES = [['S', 3], ['M', 6], ['L', 12]];
  const MAX_WORDS = 200;

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

  GamesHub.register('pictionary', (ctx) => {
    const { E, C, session } = ctx;
    const P = E.pictionary, G = E.drawGame;
    const allCats = C.drawCategories.map((c) => c.id);
    const saved = store.get(SETTINGS_KEY) || {};
    const cfg = {
      mode: saved.mode === 'class' ? 'class' : 'teams',
      names: Array.isArray(saved.names) && saved.names.length >= 2 ? saved.names.slice(0, 6).map((n, i) => String(n || DEFAULT_NAMES[i]).slice(0, 24)) : DEFAULT_NAMES.slice(0, 2),
      rounds: [1, 2, 3, 5].includes(saved.rounds) ? saved.rounds : 2,
      classRounds: [5, 10, 15].includes(saved.classRounds) ? saved.classRounds : 10,
      seconds: [30, 60, 90, 120].includes(saved.seconds) ? saved.seconds : 60,
      hints: ['off', 'length', 'letters'].includes(saved.hints) ? saved.hints : 'letters',
      steal: saved.steal !== false,
      sound: saved.sound !== false,
      cats: Array.isArray(saved.cats) ? saved.cats.filter((c) => allCats.includes(c) || c === 'mine') : allCats.slice(),
    };
    if (!cfg.cats.length) cfg.cats = allCats.slice();
    let g = null, word = null, pad = null, timer = null, audio = null, shown = [], order = [], outcome = null, recorded = false, addedToBoard = false, roundStart = 0;

    const myWords = () => { const raw = store.get(WORDS_KEY); const n = raw ? E.normalizeWordList(raw) : null; return n && n.words.length ? n.words : null; };
    const pool = () => {
      const out = [];
      cfg.cats.forEach((id) => {
        if (id === 'mine') (myWords() || []).forEach((w) => out.push(w));
        else { const c = C.drawCategories.find((x) => x.id === id); if (c) c.words.forEach((w) => out.push(w)); }
      });
      return out;
    };
    const saveCfg = () => store.set(SETTINGS_KEY, cfg);
    const color = (id) => COLORS[id % COLORS.length];

    ctx.setHelp([
      'Teams take turns: one player from the drawing team comes to the board, holds “Hold to peek” to see the secret word, then presses Start drawing.',
      'Draw — no letters or numbers! Your own team shouts guesses. Faster guesses score more: 3, 2 or 1 points.',
      'Press “✓ Guessed it!” (or type the guess in the box). If time runs out, another team can steal it for 1 point.',
      'Hints appear automatically: the number of letters, then a few letters as the time runs down.',
      'Teachers: “✎ My words” lets you type your own words and clues, paste a whole list, and save them on this device.',
      'Keyboard: G = guessed it, P = pause.'
    ]);

    function tone(freqs, dur = 0.14) {
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

    // ════════ SETUP ════════
    function setup() {
      stopTimer();
      g = null;
      ctx.setPhase('idle'); ctx.setHud([]);
      const mine = myWords();
      if (!mine) cfg.cats = cfg.cats.filter((c) => c !== 'mine');
      if (!cfg.cats.length) cfg.cats = allCats.slice();

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
        chips('Turns each', [1, 2, 3, 5].map((n) => ({ value: n, label: `${n} turn${n > 1 ? 's' : ''}` })), cfg.rounds, (v) => { cfg.rounds = v; saveCfg(); }),
        chips('If time runs out', [{ value: true, label: 'Others can steal' }, { value: false, label: 'No steal' }], cfg.steal, (v) => { cfg.steal = v; saveCfg(); })
      ]);
      const classBox = h('div', { class: 'gm-setup-col', hidden: cfg.mode !== 'class' }, [
        chips('Words', [5, 10, 15].map((n) => ({ value: n, label: `${n} words` })), cfg.classRounds, (v) => { cfg.classRounds = v; saveCfg(); })
      ]);
      const wordInfo = h('span', { class: 'gm-note' });
      const updateInfo = () => { const n = pool().length; wordInfo.textContent = `${n} words selected`; startBtn.disabled = n < 1; };
      const catChips = chips('Word lists', C.drawCategories.map((c) => ({ value: c.id, label: c.name })).concat(mine ? [{ value: 'mine', label: `⭐ My words (${mine.length})` }] : []), cfg.cats, (v, btn) => {
        const on = cfg.cats.includes(v);
        if (on && cfg.cats.length === 1) { ctx.toast('Keep at least one word list'); return; }
        cfg.cats = on ? cfg.cats.filter((x) => x !== v) : cfg.cats.concat(v);
        btn.setAttribute('aria-pressed', String(!on)); saveCfg(); updateInfo();
      }, { multi: true });
      const startBtn = h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-startgame': '', text: '▶ Start', on: { click: start } });

      const left = h('section', { class: 'gm-setup-col', 'aria-label': 'Players' }, [
        chips('Players', [{ value: 'teams', label: '🏁 Teams' }, { value: 'class', label: '👥 Whole class' }], cfg.mode, (v) => { cfg.mode = v; saveCfg(); teamBox.hidden = v !== 'teams'; classBox.hidden = v !== 'class'; }),
        teamBox, classBox
      ]);
      const right = h('section', { class: 'gm-setup-col', 'aria-label': 'Game settings' }, [
        catChips,
        h('div', { class: 'gm-row' }, [h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-edit': '', text: mine ? '✎ Edit my words' : '✎ Add my own words', on: { click: editor } }), wordInfo]),
        chips('Time to draw', [30, 60, 90, 120].map((v) => ({ value: v, label: `${v} s` })), cfg.seconds, (v) => { cfg.seconds = v; saveCfg(); }),
        chips('Hints', [{ value: 'off', label: 'Off' }, { value: 'length', label: 'Word length' }, { value: 'letters', label: 'Length + letters' }], cfg.hints, (v) => { cfg.hints = v; saveCfg(); }),
        chips('Sound', [{ value: true, label: 'On' }, { value: false, label: 'Off' }], cfg.sound, (v) => { cfg.sound = v; saveCfg(); })
      ]);
      ctx.body.replaceChildren(h('div', { class: 'gm-setup gm-setup-wide' }, [
        h('h3', { text: 'Draw & Guess' }),
        h('p', { text: 'One player draws a secret word — their team races to guess it before the time runs out!' }),
        h('div', { class: 'gm-setup-2col' }, [left, right]),
        cfg.cats.some((c) => c !== 'mine') ? h('p', { class: 'gm-sample', text: C.LABEL + '.' }) : null,
        startBtn
      ]));
      updateInfo();
    }

    // ════════ WORD EDITOR ════════
    function editor() {
      stopTimer();
      ctx.setPhase('idle'); ctx.setHud([]);
      let rows = (myWords() || []).map((w) => ({ word: w.word, hint: w.hint || '' }));
      if (!rows.length) rows = [{ word: '', hint: '' }, { word: '', hint: '' }, { word: '', hint: '' }];
      const errorsEl = h('div', { class: 'gm-editor-errors', role: 'alert' });
      const list = h('div', { class: 'gm-editor-body gm-pair-list' });
      const fileIn = h('input', { type: 'file', accept: '.json,.txt,application/json,text/plain', hidden: true });
      const bulk = h('textarea', { class: 'gm-textarea', rows: '3', placeholder: 'Paste many words — one per line. Add a clue after a | sign, e.g.  Volcano | A mountain that erupts', 'aria-label': 'Paste many words, one per line' });
      const addBtn = h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '+ Add word', on: { click: () => { if (rows.length < MAX_WORDS) { rows.push({ word: '', hint: '' }); draw(); list.querySelectorAll('.gm-pair-row')[rows.length - 1]?.querySelector('input')?.focus(); } } } });
      function draw() {
        list.replaceChildren(...rows.map((r, i) => h('div', { class: 'gm-pair-row gm-word-row' }, [
          h('span', { class: 'gm-pair-num', text: String(i + 1) }),
          h('input', { type: 'text', class: 'gm-input', maxlength: '40', placeholder: 'Word to draw', value: r.word, 'aria-label': `Word ${i + 1}`, on: { input: (e) => { r.word = e.target.value; } } }),
          h('span', { class: 'gm-pair-link', 'aria-hidden': 'true', text: '💡' }),
          h('input', { type: 'text', class: 'gm-input', maxlength: '60', placeholder: 'Clue (optional)', value: r.hint, 'aria-label': `Clue for word ${i + 1}`, on: { input: (e) => { r.hint = e.target.value; } } }),
          h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'aria-label': `Delete word ${i + 1}`, text: '✕', on: { click: () => { rows.splice(i, 1); draw(); } } })
        ])));
        addBtn.disabled = rows.length >= MAX_WORDS;
      }
      const addMany = (text) => {
        const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        rows = rows.filter((r) => r.word.trim());
        lines.forEach((l) => { const [w, hnt] = l.split('|'); if (rows.length < MAX_WORDS) rows.push({ word: (w || '').trim(), hint: (hnt || '').trim() }); });
        draw();
        return lines.length;
      };
      function save() {
        const n = E.normalizeWordList({ words: rows.filter((r) => r.word.trim() || r.hint.trim()) });
        errorsEl.replaceChildren(...n.errors.slice(0, 4).map((m) => h('p', { text: '⚠ ' + m })));
        if (!n.words.length) { ctx.toast('Add at least 3 words, then save'); return; }
        if (n.errors.length) { ctx.toast('Please fix the duplicates, then save'); return; }
        if (!store.set(WORDS_KEY, { words: n.words })) { ctx.toast('Could not save on this device (storage is blocked)'); return; }
        if (!cfg.cats.includes('mine')) cfg.cats = ['mine'];
        saveCfg();
        ctx.toast(`Saved ${n.words.length} words`);
        setup();
      }
      fileIn.addEventListener('change', () => {
        const f = fileIn.files && fileIn.files[0];
        if (!f) return;
        if (f.size > 200000) { ctx.toast('That file is too large for a word list'); return; }
        const rd = new FileReader();
        rd.onload = () => {
          const text = String(rd.result);
          let parsed = null;
          try { parsed = JSON.parse(text); } catch (e) { parsed = null; }
          if (parsed) {
            const n = E.normalizeWordList(parsed);
            if (!n.words.length) { ctx.toast('No usable words found in that file'); return; }
            rows = n.words.map((w) => ({ word: w.word, hint: w.hint || '' })); draw();
          } else addMany(text);   // a plain .txt list
          ctx.toast(`Imported ${rows.length} words — press Save to keep them`);
        };
        rd.readAsText(f);
        fileIn.value = '';
      });
      function exportList() {
        const n = E.normalizeWordList({ words: rows });
        if (!n.words.length) { ctx.toast('Nothing to export yet'); return; }
        const blob = new Blob([JSON.stringify({ app: 'PiyushDhara Draw & Guess', version: 1, words: n.words }, null, 2)], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: 'draw-and-guess-words.json' });
        document.body.appendChild(a); a.click(); a.remove();
        session.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }
      ctx.body.replaceChildren(h('div', { class: 'gm-editor' }, [
        h('div', { class: 'gm-editor-head' }, [
          h('h3', { text: 'My words to draw' }),
          h('div', { class: 'gm-row' }, [
            addBtn,
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '📂 Import', on: { click: () => fileIn.click() } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '💾 Export', on: { click: exportList } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: 'Cancel', on: { click: setup } }),
            h('button', { type: 'button', class: 'gm-btn gm-primary', 'data-save': '', text: '✔ Save words', on: { click: save } })
          ])
        ]),
        h('div', { class: 'gm-row gm-bulk' }, [bulk, h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-bulk': '', text: '⇩ Add these', on: { click: () => { const k = addMany(bulk.value); bulk.value = ''; ctx.toast(k ? `Added ${k} words` : 'Type or paste some words first'); } } })]),
        h('p', { class: 'gm-note', text: `3–${MAX_WORDS} words. A clue is optional (the drawer sees it when peeking). Saved on this device only.` }),
        errorsEl, list, fileIn
      ]));
      draw();
    }

    // ════════ GAME ════════
    function start() {
      const words = pool();
      if (!words.length) { ctx.toast('Choose at least one word list'); return; }
      const teams = cfg.mode === 'teams' ? cfg.names.map((x, i) => (x || '').trim() || DEFAULT_NAMES[i]) : null;
      if (teams) { cfg.names = teams.slice(); saveCfg(); }
      g = E.createDrawGame(words, teams, { rounds: teams ? cfg.rounds : cfg.classRounds, rng: ctx.rng });
      ready();
    }

    function scoreboard() {
      if (!g.teams) return null;
      const d = G.drawer(g);
      return h('div', { class: 'gm-scoreboard gm-draw-scores', role: 'group', 'aria-label': 'Scores' }, g.teams.list.map((t) => h('div', { class: 'gm-scorecard' + (t.id === d ? ' is-turn' : ''), style: `--team:${color(t.id)}` }, [
        h('span', { class: 'gm-scorecard-name', text: (t.id === d ? '🎨 ' : '') + t.name }),
        h('span', { class: 'gm-scorecard-score', 'aria-label': `${t.name}: ${t.score} points`, text: String(t.score) })
      ])));
    }
    function hud() {
      ctx.setHud([
        h('span', { class: 'gm-pill', text: `Round ${Math.min(g.round + 1, g.total)}/${g.total}` }),
        g.teams ? null : h('span', { class: 'gm-pill', text: `✓ ${g.classScore} guessed` })
      ]);
    }

    /** Builds the drawing screen. Phase 'ready' = word chosen, drawer peeking; 'playing' = drawing. */
    function ready() {
      stopTimer();
      clearResultSafe();
      outcome = null; recorded = false; addedToBoard = false; shown = [];
      word = G.word(g);
      order = cfg.hints === 'letters' ? P.revealOrder(word.word, ctx.rng) : [];
      ctx.setPhase('ready');
      hud();
      const d = G.drawer(g);
      const teamName = g.teams ? g.teams.list[d].name : 'The class';

      // drawing area + toolbox
      const canvas = h('canvas', { class: 'gm-pad', 'aria-label': 'Drawing area for the secret word' });
      const toolbox = h('div', { class: 'gm-toolbox', role: 'toolbar', 'aria-label': 'Drawing tools' });
      const penBtns = PENS.map(([c, n], i) => h('button', { type: 'button', class: 'gm-swatch', style: `--sw:${c}`, 'aria-label': `${n} pen`, 'aria-pressed': String(i === 0), on: { click: () => pick('color', c, penBtns[i]) } }));
      const sizeBtns = SIZES.map(([n, w], i) => h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost gm-size', 'aria-label': `${n === 'S' ? 'Thin' : n === 'M' ? 'Medium' : 'Thick'} pen`, 'aria-pressed': String(i === 1), on: { click: () => pick('size', w, sizeBtns[i]) } }, [h('span', { class: 'gm-size-dot', style: `--d:${0.25 + i * 0.22}em` })]));
      const eraser = h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'aria-label': 'Eraser', 'aria-pressed': 'false', text: '🧽', on: { click: () => pick('eraser', null, eraser) } });
      let penColor = PENS[0][0], penSize = SIZES[1][1], erasing = false;
      function pick(kind, v, btn) {
        if (kind === 'color') { penColor = v; erasing = false; penBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn))); eraser.setAttribute('aria-pressed', 'false'); }
        if (kind === 'size') { penSize = v; sizeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn))); }
        if (kind === 'eraser') { erasing = !erasing; eraser.setAttribute('aria-pressed', String(erasing)); penBtns.forEach((b) => b.setAttribute('aria-pressed', String(!erasing && b.style.getPropertyValue('--sw').trim() === penColor))); }
        pad.setColor(erasing ? '#ffffff' : penColor);
        pad.setWidth(ctx.px(erasing ? penSize * 3 : penSize));
      }
      toolbox.append(...penBtns, h('span', { class: 'gm-tool-sep' }), ...sizeBtns, eraser, h('span', { class: 'gm-tool-sep' }),
        h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'aria-label': 'Undo last line', text: '↶', on: { click: () => pad.undo() } }),
        h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'data-clear': '', 'aria-label': 'Clear drawing', text: '🗑', on: { click: () => pad.clear() } }));

      // side panel
      const secret = h('div', { class: 'gm-secret', 'aria-live': 'polite' }, [h('span', { class: 'gm-secret-hidden', text: '🔒 Secret word hidden' })]);
      let peekTimer = null;
      const showSecret = (on) => {
        if (peekTimer) { session.clearTimeout(peekTimer); peekTimer = null; }
        secret.replaceChildren(on ? h('span', { class: 'gm-secret-word', text: word.word }) : h('span', { class: 'gm-secret-hidden', text: '🔒 Secret word hidden' }));
        if (on && word.hint) secret.appendChild(h('span', { class: 'gm-secret-clue', text: '💡 ' + word.hint }));
      };
      const peek = h('button', { type: 'button', class: 'gm-btn gm-ghost', 'aria-label': 'Hold to peek at the secret word (drawer only)', text: '👁 Hold to peek (drawer only)' });
      session.on(peek, 'pointerdown', (e) => { e.preventDefault(); showSecret(true); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => session.on(peek, t, () => showSecret(false)));
      session.on(peek, 'click', (e) => { if (e.detail === 0) { showSecret(true); peekTimer = session.setTimeout(() => showSecret(false), 2500); } });

      const secs = h('span', { class: 'gm-qtimer-secs', text: String(cfg.seconds) });
      const fill = h('span', { class: 'gm-qtimer-fill' });
      const pauseBtn = h('button', { type: 'button', class: 'gm-btn gm-ghost gm-mini', 'data-pause': '', disabled: true, text: '⏸' , 'aria-label': 'Pause the timer' });
      const timerBox = h('div', { class: 'gm-qtimer gm-draw-timer', role: 'timer', 'aria-label': 'Time left' }, [h('div', { class: 'gm-qtimer-bar' }, [fill]), secs, pauseBtn]);
      const maskEl = h('div', { class: 'gm-mask', 'aria-live': 'polite' });
      const startBtn = h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-start': '', text: '▶ Start drawing', on: { click: startDrawing } });
      const gotBtn = h('button', { type: 'button', class: 'gm-btn gm-good gm-big', 'data-got': '', disabled: true, text: '✓ Guessed it!', on: { click: () => endRound('guessed') } });
      const guessIn = h('input', { type: 'text', class: 'gm-input', autocomplete: 'off', 'aria-label': 'Type a guess (optional)', placeholder: 'Type a guess…' });
      const guessForm = h('form', { class: 'gm-row gm-guess', on: { submit: (e) => {
        e.preventDefault();
        if (ctx.lifecycle.phase !== 'playing') return;
        const v = guessIn.value;
        if (P.isCorrectGuess(v, word.word)) { endRound('guessed'); return; }
        tone([300], 0.08);
        ctx.toast(P.isClose(v, word.word) ? `🔥 So close! “${v.trim()}” is nearly right` : `“${v.trim()}” — not it, keep guessing!`);
        guessIn.select();
      } } }, [guessIn, h('button', { type: 'submit', class: 'gm-btn gm-ghost', text: 'Check' })]);

      const side = h('div', { class: 'gm-side' }, [
        h('p', { class: 'gm-drawer', style: g.teams ? `--team:${color(d)}` : null }, [h('span', { class: 'gm-team-badge', style: `--team:${g.teams ? color(d) : '#475569'}`, text: `🎨 ${teamName}` }), ' is drawing']),
        timerBox, maskEl, secret, peek, startBtn, gotBtn, guessForm,
        h('div', { class: 'gm-row' }, [
          h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '⏭ New word', on: { click: newWord } }),
          h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '📣 Reveal', on: { click: async () => { if (await ctx.confirm({ title: 'Reveal the word to everyone?', text: 'This ends the round with no points.', ok: 'Reveal' })) endRound('revealed'); } } })
        ])
      ]);
      ctx.body.replaceChildren(h('div', { class: 'gm-drawgame' }, [
        h('div', { class: 'gm-draw' }, [h('div', { class: 'gm-pad-col' }, [toolbox, h('div', { class: 'gm-pad-wrap' }, [canvas])]), side]),
        scoreboard()
      ]));
      pad = ctx.createPad(canvas, { color: penColor, width: ctx.px(penSize), enabled: false, background: (c, w, hh) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, hh); } });

      function paintMask() {
        if (cfg.hints === 'off') { maskEl.hidden = true; return; }
        const letters = [...word.word].filter((ch) => /[\p{L}\p{N}]/u.test(ch)).length;
        maskEl.replaceChildren(h('span', { class: 'gm-mask-letters', 'aria-label': `Hint: ${letters} letters` }, P.mask(word.word, shown).map((ch) => h('span', { class: ch === ' ' ? 'gm-mask-gap' : 'gm-mask-ch', text: ch === ' ' ? '' : ch }))), h('span', { class: 'gm-mask-count', text: `${letters} letters` }));
      }
      paintMask();

      function paint(left) {
        secs.textContent = String(left);
        fill.style.width = `${Math.max(0, Math.min(100, (left / cfg.seconds) * 100))}%`;
        timerBox.classList.toggle('is-low', left <= 10 && left > 0);
        timerBox.classList.toggle('is-out', left === 0);
      }
      function startDrawing() {
        if (ctx.lifecycle.phase !== 'ready') return;
        ctx.setPhase('playing');
        showSecret(false);
        pad.setEnabled(true);
        startBtn.hidden = true; gotBtn.disabled = false; pauseBtn.disabled = false;
        roundStart = Date.now();
        tone([523, 659], 0.1);
        let paused = false;
        timer = session.countdown(cfg.seconds, {
          onTick: (left) => {
            paint(left);
            const elapsed = cfg.seconds - left;
            // reveal letters at 50% and 75% of the time
            const due = order.filter((_, k) => elapsed >= cfg.seconds * (0.5 + 0.25 * k)).length;
            if (due > shown.length) { shown = order.slice(0, due); paintMask(); tone([880, 990], 0.07); ctx.announce('A letter was revealed'); }
            if (left > 0 && left <= 5) tone([880], 0.05);
          },
          onEnd: () => { timer = null; endRound('time'); }
        });
        pauseBtn.addEventListener('click', () => { if (!timer) return; if (paused) { timer.start(); paused = false; pauseBtn.textContent = '⏸'; pad.setEnabled(true); } else { timer.pause(); paused = true; pauseBtn.textContent = '▶'; pad.setEnabled(false); } });
        timer.start();
        instance.togglePause = () => pauseBtn.click();
      }
      paint(cfg.seconds);
      instance.startDrawing = startDrawing;
      startBtn.focus({ preventScroll: true });
    }

    function newWord() {
      if (!g) return;
      G.skip(g);
      ready();
      ctx.toast('New word chosen — peek again');
    }

    function thumbnail() {
      try {
        const src = ctx.body.querySelector('.gm-pad');
        if (!src || !src.width) return null;
        const w = 360, hh = Math.max(1, Math.round((src.height / src.width) * w));
        const c = document.createElement('canvas'); c.width = w; c.height = hh;
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, hh); x.drawImage(src, 0, 0, w, hh);
        return c.toDataURL('image/jpeg', 0.75);
      } catch (e) { return null; }
    }

    function record(guessedBy, points) {
      if (recorded) return;
      recorded = true;
      G.finish(g, { guessedBy, points, word: word.word, image: thumbnail() });
    }

    function endRound(how) {
      if (outcome || !g) return;
      outcome = how;
      const left = timer ? timer.left : 0;
      stopTimer();
      if (pad) { pad.endNow(); pad.setEnabled(false); }
      const d = G.drawer(g);
      if (how === 'guessed') {
        const pts = g.teams ? P.points(left, cfg.seconds) : 1;
        record(g.teams ? d : 'class', pts);
        tone([523, 659, 784], 0.13);
        roundResult({ pts, secs: Math.max(1, Math.round((Date.now() - roundStart) / 1000)) });
      } else {
        tone([440, 330, 220], 0.16);
        if (!g.teams || !cfg.steal || how === 'revealed') record(null, 0);
        roundResult({});
      }
    }

    function roundResult({ pts, secs }) {
      const d = G.drawer(g) === null ? null : (recorded ? g.history[g.history.length - 1].drawer : G.drawer(g));
      const how = outcome;
      const lines = [`The word was: ${word.word}`];
      let extra = null;
      if (how === 'guessed') lines.unshift(g.teams ? `${g.teams.list[d].name} guessed it in ${secs} s — +${pts} point${pts === 1 ? '' : 's'}!` : `The class guessed it in ${secs} s!`);
      else if (g.teams && cfg.steal && how === 'time' && !recorded) {
        lines.push('Did another team guess it? They steal 1 point.');
        extra = h('div', { class: 'gm-row gm-center gm-steal' }, g.teams.list.filter((t) => t.id !== d).map((t) => h('button', {
          type: 'button', class: 'gm-btn gm-good', style: `--team:${color(t.id)}`, text: `+1 ${t.name}`,
          on: { click: () => { record(t.id, 1); tone([523, 784], 0.1); roundResult({}); ctx.toast(`${t.name} stole it! +1`); } }
        })).concat(h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-nobody': '', text: 'Nobody', on: { click: () => { record(null, 0); roundResult({}); } } })));
      } else if (g.teams && how === 'time' && recorded) {
        const last = g.history[g.history.length - 1];
        lines.push(last.guessedBy !== null ? `${g.teams.list[last.guessedBy].name} stole it — +1 point.` : 'Nobody got it this time.');
      }
      if (addedToBoard) lines.push('✓ Drawing added to the board.');
      const finished = recorded && G.done(g);
      ctx.showResult({
        icon: how === 'guessed' ? '🎉' : how === 'time' ? '⏰' : '📣',
        title: how === 'guessed' ? 'Guessed it!' : how === 'time' ? "Time's up!" : 'Word revealed',
        lines, extra, peekable: true, hub: false,
        actions: [
          recorded ? { label: finished ? '🏆 See results' : '▶ Next round', primary: true, onClick: () => (finished ? final() : ready()) } : null,
          addedToBoard ? null : { label: '📋 Add drawing to board', onClick: () => {
            const n = ctx.addStrokesToBoard(pad.pixelStrokes().filter((st) => st.color !== '#ffffff'));
            addedToBoard = n > 0;
            ctx.toast(n ? 'Drawing added to the board — Undo on the board removes it' : 'Nothing drawn to add');
            roundResult({ pts, secs });
          } }
        ].filter(Boolean)
      });
      const sb = ctx.body.querySelector('.gm-draw-scores');
      if (sb && g.teams) sb.replaceWith(scoreboard());
      hud();
    }

    function final() {
      stopTimer();
      const gallery = h('div', { class: 'gm-gallery' }, g.history.map((r) => h('figure', { class: 'gm-gallery-item' + (r.guessedBy !== null ? ' is-hit' : '') }, [
        r.image ? h('img', { src: r.image, alt: `Drawing of ${r.word}` }) : h('div', { class: 'gm-gallery-empty', text: '—' }),
        h('figcaption', null, [h('strong', { text: r.word }), h('span', { text: r.guessedBy === null ? ' ✗' : r.guessedBy === 'class' ? ' ✓' : ` ✓ ${g.teams.list[r.guessedBy].name}` })])
      ])));
      tone([523, 659, 784, 1047], 0.14);
      if (g.teams) {
        const rank = g.teams.list.slice().sort((a, b) => b.score - a.score);
        const winners = rank.filter((t) => t.score === rank[0].score);
        let place = 0, last = null;
        ctx.showResult({
          icon: '🏆', title: winners.length > 1 ? `It's a tie: ${winners.map((t) => t.name).join(' & ')}` : `${winners[0].name} wins!`,
          extra: h('div', { class: 'gm-final-body' }, [h('ol', { class: 'gm-podium' }, rank.map((t, i) => { if (t.score !== last) { place = i + 1; last = t.score; } return h('li', { style: `--team:${color(t.id)}` }, [
            h('span', { class: 'gm-podium-medal', text: place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.` }), h('span', { class: 'gm-podium-name', text: t.name }), h('span', { class: 'gm-podium-score', text: `${t.score} pts` })
          ]); })), h('h4', { class: 'gm-gallery-title', text: '🖼 Drawing gallery' }), gallery]),
          actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
        });
      } else {
        ctx.showResult({
          icon: '🎨', title: `The class guessed ${g.classScore} of ${g.total} words!`,
          extra: h('div', { class: 'gm-final-body' }, [h('h4', { class: 'gm-gallery-title', text: '🖼 Drawing gallery' }), gallery]),
          actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
        });
      }
      const card = ctx.body.querySelector('.gm-result');
      if (card) card.classList.add('gm-result-wide');
    }

    function clearResultSafe() { ctx.clearResult(); }

    const instance = {
      hasProgress: () => !!g && (g.round > 0 || ctx.lifecycle.phase === 'playing') && !G.done(g),
      unmount: stopTimer,
      onKey(e) {
        if (!g || ctx.body.querySelector('.gm-result')) return;
        const k = e.key.toLowerCase();
        if (k === 'g' && ctx.lifecycle.phase === 'playing') { e.preventDefault(); endRound('guessed'); }
        else if (k === 'p' && instance.togglePause) { e.preventDefault(); instance.togglePause(); }
      },
      _game: () => g, _word: () => word && word.word, _pad: () => pad, _timer: () => timer, _shown: () => shown.slice(), _teams: () => g && g.teams
    };
    setup();
    return instance;
  });
})();
