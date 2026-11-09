'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — WORD GUESS (hangman with a friendly rocket / energy meter)
// • Whole class or 2–6 teams taking turns (a right letter scores per time it appears and the team
//   goes again; a wrong letter passes the turn; finishing the word scores a bonus)
// • Several words per game from sample categories or the teacher's own list (with clues),
//   saved on this device, import/export, paste many at once
// • Energy cells (4 / 6 / 8 wrong guesses), optional timer per word
// • Power-ups: free clue, reveal a letter (costs 1 energy), solve the whole word
// • Animated letters, rocket launch on a win, summary of every word at the end
// Rules live in GameEngine.hangman / GameEngine.wordGame; this file is only the screens.
// ═══════════════════════════════════════════════════════════
(() => {
  if (typeof GamesHub === 'undefined') return;
  const { h } = GamesHub;

  const SETTINGS_KEY = 'gm_word_settings_v1';
  const WORDS_KEY = 'gm_word_list_v1';
  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];
  const DEFAULT_NAMES = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'];
  const MAX_WORDS = 200;
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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

  GamesHub.register('hangman', (ctx) => {
    const { E, C, session } = ctx;
    const H = E.hangman, W = E.wordGame;
    const allCats = C.wordCategories.map((c) => c.id);
    const saved = store.get(SETTINGS_KEY) || {};
    const cfg = {
      mode: saved.mode === 'teams' ? 'teams' : 'class',
      names: Array.isArray(saved.names) && saved.names.length >= 2 ? saved.names.slice(0, 6).map((n, i) => String(n || DEFAULT_NAMES[i]).slice(0, 24)) : DEFAULT_NAMES.slice(0, 2),
      rounds: [3, 5, 10].includes(saved.rounds) ? saved.rounds : 5,
      energy: [4, 6, 8].includes(saved.energy) ? saved.energy : 6,
      timer: [0, 60, 90, 120].includes(saved.timer) ? saved.timer : 0,
      powerups: saved.powerups !== false,
      sound: saved.sound !== false,
      cats: Array.isArray(saved.cats) ? saved.cats.filter((c) => allCats.includes(c) || c === 'mine') : allCats.slice()
    };
    if (!cfg.cats.length) cfg.cats = allCats.slice();
    let g = null, timer = null, audio = null, clueShown = false, lastNew = [], wordStart = 0;

    const myWords = () => { const raw = store.get(WORDS_KEY); const n = raw ? E.normalizeWordList(raw) : null; return n && n.words.length ? n.words : null; };
    const pool = () => {
      const out = [];
      cfg.cats.forEach((id) => {
        if (id === 'mine') (myWords() || []).forEach((w) => out.push(w));
        else { const c = C.wordCategories.find((x) => x.id === id); if (c) c.words.forEach((w) => out.push(w)); }
      });
      return out.map((w) => ({ word: String(w.word).toUpperCase(), hint: w.hint || '' }));
    };
    const saveCfg = () => store.set(SETTINGS_KEY, cfg);
    const color = (id) => COLORS[id % COLORS.length];

    ctx.setHelp([
      'Guess the hidden word one letter at a time — tap a letter or type it on the keyboard.',
      'A wrong letter uses one ⚡ energy cell. Solve the word before the energy runs out to launch the rocket! 🚀',
      'Teams: a right letter scores 1 point for each time it appears and your team goes again; a wrong letter passes the turn. Finishing the word scores a bonus.',
      'Power-ups: 💡 Clue is free, 🔍 Reveal a letter costs one energy cell, 🧩 Solve lets you guess the whole word (a wrong guess costs one cell).',
      'Teachers: “✎ My words” lets you type or paste your own words and clues; they are saved on this device.'
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
        names
      ]);
      const wordInfo = h('span', { class: 'gm-note' });
      const startBtn = h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-startgame': '', text: '▶ Start', on: { click: start } });
      const updateInfo = () => { const n = pool().length; wordInfo.textContent = `${n} words selected`; startBtn.disabled = n < 1; };
      const catChips = chips('Word lists', C.wordCategories.map((c) => ({ value: c.id, label: c.name })).concat(mine ? [{ value: 'mine', label: `⭐ My words (${mine.length})` }] : []), cfg.cats, (v, btn) => {
        const on = cfg.cats.includes(v);
        if (on && cfg.cats.length === 1) { ctx.toast('Keep at least one word list'); return; }
        cfg.cats = on ? cfg.cats.filter((x) => x !== v) : cfg.cats.concat(v);
        btn.setAttribute('aria-pressed', String(!on)); saveCfg(); updateInfo();
      }, { multi: true });
      const left = h('section', { class: 'gm-setup-col', 'aria-label': 'Players' }, [
        chips('Players', [{ value: 'class', label: '👥 Whole class' }, { value: 'teams', label: '🏁 Teams' }], cfg.mode, (v) => { cfg.mode = v; saveCfg(); teamBox.hidden = v !== 'teams'; }),
        teamBox,
        chips('Words per game', [3, 5, 10].map((n) => ({ value: n, label: `${n} words` })), cfg.rounds, (v) => { cfg.rounds = v; saveCfg(); })
      ]);
      const right = h('section', { class: 'gm-setup-col', 'aria-label': 'Game settings' }, [
        catChips,
        h('div', { class: 'gm-row' }, [h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-edit': '', text: mine ? '✎ Edit my words' : '✎ Add my own words', on: { click: editor } }), wordInfo]),
        chips('Energy', [{ value: 8, label: '⚡ 8 · Easy' }, { value: 6, label: '⚡ 6 · Normal' }, { value: 4, label: '⚡ 4 · Hard' }], cfg.energy, (v) => { cfg.energy = v; saveCfg(); }),
        chips('Time per word', [{ value: 0, label: 'Off' }, { value: 60, label: '60 s' }, { value: 90, label: '90 s' }, { value: 120, label: '120 s' }], cfg.timer, (v) => { cfg.timer = v; saveCfg(); }),
        chips('Power-ups', [{ value: true, label: '🔍 🧩 On' }, { value: false, label: 'Off' }], cfg.powerups, (v) => { cfg.powerups = v; saveCfg(); }),
        chips('Sound', [{ value: true, label: 'On' }, { value: false, label: 'Off' }], cfg.sound, (v) => { cfg.sound = v; saveCfg(); })
      ]);
      ctx.body.replaceChildren(h('div', { class: 'gm-setup gm-setup-wide' }, [
        h('h3', { text: 'Word Guess' }),
        h('p', { text: 'Guess the hidden word letter by letter — fill the rocket’s energy and launch it! 🚀' }),
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
      const bulk = h('textarea', { class: 'gm-textarea', rows: '3', placeholder: 'Paste many words — one per line. Add a clue after a | sign, e.g.  VOLCANO | A mountain that can erupt', 'aria-label': 'Paste many words, one per line' });
      const addBtn = h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '+ Add word', on: { click: () => { if (rows.length < MAX_WORDS) { rows.push({ word: '', hint: '' }); draw(); list.querySelectorAll('.gm-pair-row')[rows.length - 1]?.querySelector('input')?.focus(); } } } });
      function draw() {
        list.replaceChildren(...rows.map((r, i) => h('div', { class: 'gm-pair-row gm-word-row' }, [
          h('span', { class: 'gm-pair-num', text: String(i + 1) }),
          h('input', { type: 'text', class: 'gm-input gm-upper', maxlength: '24', placeholder: 'WORD', value: r.word, 'aria-label': `Word ${i + 1}`, on: { input: (e) => { r.word = e.target.value; } } }),
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
        const filled = rows.filter((r) => r.word.trim() || r.hint.trim());
        const n = E.normalizeWordList({ words: filled.map((r) => ({ word: r.word.toUpperCase(), hint: r.hint })) });
        const errors = n.errors.slice();
        n.words.forEach((w) => { if ((w.word.match(/[A-Z]/g) || []).length < 2) errors.push(`“${w.word}” needs at least 2 letters A–Z to guess.`); });
        errorsEl.replaceChildren(...errors.slice(0, 4).map((m) => h('p', { text: '⚠ ' + m })));
        if (!n.words.length) { ctx.toast('Add at least 3 words, then save'); return; }
        if (errors.length) { ctx.toast('Please fix the highlighted words, then save'); return; }
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
          } else addMany(text);
          ctx.toast(`Imported ${rows.length} words — press Save to keep them`);
        };
        rd.readAsText(f);
        fileIn.value = '';
      });
      function exportList() {
        const n = E.normalizeWordList({ words: rows.map((r) => ({ word: r.word.toUpperCase(), hint: r.hint })) });
        if (!n.words.length) { ctx.toast('Nothing to export yet'); return; }
        const blob = new Blob([JSON.stringify({ app: 'PiyushDhara Word Guess', version: 1, words: n.words }, null, 2)], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: 'word-guess-words.json' });
        document.body.appendChild(a); a.click(); a.remove();
        session.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }
      ctx.body.replaceChildren(h('div', { class: 'gm-editor' }, [
        h('div', { class: 'gm-editor-head' }, [
          h('h3', { text: 'My words to guess' }),
          h('div', { class: 'gm-row' }, [
            addBtn,
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '📂 Import', on: { click: () => fileIn.click() } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '💾 Export', on: { click: exportList } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: 'Cancel', on: { click: setup } }),
            h('button', { type: 'button', class: 'gm-btn gm-primary', 'data-save': '', text: '✔ Save words', on: { click: save } })
          ])
        ]),
        h('div', { class: 'gm-row gm-bulk' }, [bulk, h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-bulk': '', text: '⇩ Add these', on: { click: () => { const k = addMany(bulk.value); bulk.value = ''; ctx.toast(k ? `Added ${k} words` : 'Type or paste some words first'); } } })]),
        h('p', { class: 'gm-note', text: `3–${MAX_WORDS} words, up to 24 characters (spaces allowed). Only A–Z can be guessed; other characters are shown automatically. Saved on this device only.` }),
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
      g = E.createWordGame(words, teams, { rounds: cfg.rounds, maxWrong: cfg.energy, rng: ctx.rng });
      nextWord();
    }

    function nextWord() {
      stopTimer();
      ctx.clearResult();
      if (!W.next(g)) { final(); return; }
      clueShown = false; lastNew = [];
      wordStart = Date.now();
      ctx.setPhase('playing');
      render();
      if (cfg.timer) {
        timer = session.countdown(cfg.timer, {
          onTick: (left) => { const t = ctx.body.ownerDocument.querySelector('[data-timer]'); if (t) { t.textContent = `⏱ ${fmtTime(left)}`; t.classList.toggle('is-low', left <= 10); } if (left > 0 && left <= 5) tone([880], 0.05); },
          onEnd: () => { timer = null; if (g.current && g.current.status === 'playing') { H.reveal(g.current); g.current.revealed = false; endWord('time'); } }
        });
        timer.start();
      }
    }

    function hud() {
      const s = g.current;
      ctx.setHud([
        h('span', { class: 'gm-pill', text: `Word ${Math.min(g.index + 1, g.total)}/${g.total}` }),
        cfg.timer ? h('span', { class: 'gm-pill gm-timer', 'data-timer': '', text: `⏱ ${fmtTime(timer ? timer.left : cfg.timer)}` }) : null,
        g.teams ? null : h('span', { class: 'gm-pill', text: `🚀 ${g.solved} solved` }),
        s ? h('span', { class: 'gm-pill', text: `⚡ ${s.maxWrong - s.wrong}/${s.maxWrong}` }) : null
      ]);
    }

    /** Draws the current word; after a word has finished, shows it fully as the backdrop of the result card. */
    function render(shake) { if (!g.current) { if (g.history.length) renderFinished(); return; } renderWord(shake); }

    function renderWord(shake) {
      const s = g.current;
      hud();
      const left = s.maxWrong - s.wrong;
      const pattern = H.pattern(s);
      const meter = h('div', { class: 'gm-launch' + (shake ? ' is-shake' : '') + (s.status === 'won' ? ' is-won' : '') + (s.status === 'lost' ? ' is-lost' : ''), role: 'img', 'aria-label': `Energy: ${left} of ${s.maxWrong} cells left` }, [
        h('span', { class: 'gm-rocket', 'aria-hidden': 'true', text: s.status === 'lost' ? '🪫' : '🚀' }),
        h('div', { class: 'gm-meter-cells gm-energy' }, Array.from({ length: s.maxWrong }, (_, i) => h('span', { class: 'gm-cell' + (i < left ? ' is-full' : '') + (i < left && left <= 2 ? ' is-low' : '') }))),
        h('span', { class: 'gm-meter-text', text: `⚡ ${left} energy left` })
      ]);
      const word = h('div', { class: 'gm-word', 'aria-label': 'Word: ' + pattern.map((c) => (c === null ? 'blank' : c === ' ' ? 'space' : c)).join(', ') },
        pattern.map((c, i) => (c === ' ' ? h('span', { class: 'gm-gap' }) : h('span', { class: 'gm-letter' + (c === null ? '' : ' is-shown') + (c !== null && lastNew.includes(c) ? ' is-new' : ''), text: c === null ? '' : c }))));
      const turnName = g.teams ? g.teams.list[g.turn].name : null;
      const keys = h('div', { class: 'gm-keys', role: 'group', 'aria-label': 'Letters' }, LETTERS.map((L) => {
        const used = s.guessed.includes(L), hit = used && s.word.includes(L);
        return h('button', { type: 'button', class: 'gm-key' + (used ? (hit ? ' is-hit' : ' is-miss') : ''), disabled: used || s.status !== 'playing',
          'aria-label': used ? `${L}, ${hit ? 'in the word' : 'not in the word'}` : L, text: used ? (hit ? `${L}✓` : `${L}✗`) : L, on: { click: () => guess(L) } });
      }));
      const solveIn = h('input', { type: 'text', class: 'gm-input gm-upper', autocomplete: 'off', maxlength: '30', 'aria-label': 'Guess the whole word', placeholder: 'Whole word…' });
      const tools = h('div', { class: 'gm-row gm-center gm-powerups' }, [
        clueShown ? h('p', { class: 'gm-hint', text: '💡 ' + (s.hint || 'No clue for this word.') }) : h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-clue': '', text: '💡 Clue', on: { click: () => { clueShown = true; tone([660], 0.06); render(); } } }),
        cfg.powerups ? h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-revealletter': '', disabled: s.status !== 'playing' || left <= 1, text: '🔍 Reveal a letter (−1 ⚡)', on: { click: revealLetter } }) : null,
        cfg.powerups ? h('form', { class: 'gm-row gm-solve', on: { submit: (e) => { e.preventDefault(); solve(solveIn.value); } } }, [solveIn, h('button', { type: 'submit', class: 'gm-btn gm-primary', text: '🧩 Solve' })]) : null,
        h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '📣 Give up', on: { click: async () => { if (await ctx.confirm({ title: 'Show the answer?', text: 'This ends the word with no points.', ok: 'Show it' })) { H.reveal(s); endWord('revealed'); } } } })
      ]);
      const parts = [
        h('div', { class: 'gm-word-top' }, [meter, h('div', { class: 'gm-word-centre' }, [
          turnName ? h('p', { class: 'gm-turn-banner', style: `--team:${color(g.turn)}` }, [h('span', { class: 'gm-team-badge', style: `--team:${color(g.turn)}`, text: `▶ ${turnName}` }), ' — pick a letter']) : null,
          word, tools
        ])]),
        keys
      ];
      if (g.teams) parts.push(h('div', { class: 'gm-scoreboard gm-word-scores', role: 'group', 'aria-label': 'Scores' }, g.teams.list.map((t) => h('div', { class: 'gm-scorecard' + (t.id === g.turn ? ' is-turn' : ''), style: `--team:${color(t.id)}` }, [
        h('span', { class: 'gm-scorecard-name', text: (t.id === g.turn ? '▶ ' : '') + t.name }),
        h('span', { class: 'gm-scorecard-score', 'aria-label': `${t.name}: ${t.score} points`, text: String(t.score) })
      ]))));
      ctx.body.replaceChildren(h('div', { class: 'gm-hangman gm-wordgame' }, parts));
      lastNew = [];
    }

    function afterMove() { const s = g.current; if (s.status !== 'playing') endWord(s.status === 'won' ? 'won' : 'lost'); }

    function guess(L) {
      const s = g.current;
      if (!s || s.status !== 'playing') return;
      const who = g.teams ? g.teams.list[g.turn].name : null;
      const { result, points } = W.letter(g, L);
      if (result === 'repeat' || result === 'invalid' || result === 'over') return;
      if (result === 'hit') {
        lastNew = [L]; tone([660, 880], 0.08);
        ctx.announce(`${L} is in the word${points ? `. ${who} +${points}` : ''}`);
        if (g.teams && points && s.status === 'playing') ctx.toast(`✓ ${L} ×${H.occurrences(s, L)} — ${who} +${points}, go again!`);
        render();
      } else {
        tone([300, 220], 0.1);
        ctx.announce(`${L} is not in the word`);
        if (g.teams && s.status === 'playing') ctx.toast(`✗ No ${L} — ${g.teams.list[g.turn].name}'s turn`);
        render(true);
      }
      afterMove();
    }

    function revealLetter() {
      const s = g.current;
      const L = H.revealLetter(s, ctx.rng);
      if (!L) { ctx.toast('Not enough energy to reveal a letter'); return; }
      lastNew = [L];
      tone([700, 900], 0.08);
      ctx.announce(`Revealed the letter ${L}`);
      render(true);
      afterMove();
    }

    function solve(text) {
      const s = g.current;
      if (!s || s.status !== 'playing' || !String(text || '').trim()) return;
      const who = g.teams ? g.teams.list[g.turn].name : null;
      const { result, points } = W.word(g, text);
      if (result === 'win') { lastNew = [...new Set([...s.word])]; ctx.announce(`Solved${who ? ` by ${who}` : ''}`); if (g.teams) ctx.toast(`🧩 ${who} solved it! +${points}`); render(); afterMove(); return; }
      tone([300, 220], 0.1);
      ctx.toast(result === 'over' ? 'Not quite — and that was the last energy cell!' : (E.pictionary.isClose(text, s.word) ? '🔥 So close! (−1 ⚡)' : `Not “${String(text).trim().toUpperCase()}” (−1 ⚡)${g.teams ? ` — ${g.teams.list[g.turn].name}'s turn` : ''}`));
      render(true);
      afterMove();
      if (g.current && g.current.status === 'playing') ctx.body.querySelector('.gm-solve input')?.focus({ preventScroll: true });
    }

    function endWord(how) {
      const s = g.current;
      if (!s) return;
      stopTimer();
      const won = how === 'won';
      const solverName = g.teams && won ? g.teams.list[g.turn].name : null;
      W.finish(g);
      const secs = Math.max(1, Math.round((Date.now() - wordStart) / 1000));
      render();
      if (won) tone([523, 659, 784, 1047], 0.12); else tone([440, 330, 220], 0.16);
      const done = W.done(g);
      ctx.showResult({
        icon: won ? '🚀' : how === 'time' ? '⏰' : how === 'revealed' ? '📣' : '🪫',
        title: won ? 'Lift-off! You solved it!' : how === 'time' ? "Time's up!" : how === 'revealed' ? 'Answer shown' : 'Out of energy',
        lines: [`The word was: ${s.word}`, s.hint ? `💡 ${s.hint}` : '', won ? (solverName ? `${solverName} finished it — +${g.bonus} bonus!` : `Solved in ${secs} s with ${s.wrong} wrong guess${s.wrong === 1 ? '' : 'es'}.`) : 'Try the next one!'].filter(Boolean),
        hub: false,
        actions: [{ label: done ? '🏆 See results' : '▶ Next word', primary: true, onClick: () => (done ? final() : nextWord()) }]
      });
      const res = ctx.body.querySelector('.gm-result');
      if (res && won && !ctx.reducedMotion) res.classList.add('gm-launching');
    }
    function renderFinished() {
      const last = g.history[g.history.length - 1];
      hud();
      const wordEl = h('div', { class: 'gm-word' }, [...last.word].map((c) => (c === ' ' ? h('span', { class: 'gm-gap' }) : h('span', { class: 'gm-letter is-shown' + (last.solved ? '' : ' is-missed'), text: c }))));
      ctx.body.replaceChildren(h('div', { class: 'gm-hangman gm-wordgame' }, [h('div', { class: 'gm-word-top' }, [h('div', { class: 'gm-launch' + (last.solved ? ' is-won' : ' is-lost') }, [h('span', { class: 'gm-rocket', 'aria-hidden': 'true', text: last.solved ? '🚀' : '🪫' })]), h('div', { class: 'gm-word-centre' }, [wordEl])])]));
    }

    function final() {
      stopTimer();
      tone([523, 659, 784, 1047], 0.14);
      const list = h('ul', { class: 'gm-word-summary' }, g.history.map((r) => h('li', { class: r.solved ? 'is-hit' : 'is-miss' }, [h('span', { text: r.solved ? '✓' : '✗' }), h('strong', { text: r.word }), r.by !== null && r.by !== undefined && g.teams ? h('span', { class: 'gm-note', text: g.teams.list[r.by].name }) : null])));
      if (g.teams) {
        const rank = g.teams.list.slice().sort((a, b) => b.score - a.score);
        const winners = rank.filter((t) => t.score === rank[0].score);
        let place = 0, last = null;
        ctx.showResult({
          icon: '🏆', title: winners.length > 1 ? `It's a tie: ${winners.map((t) => t.name).join(' & ')}` : `${winners[0].name} wins!`,
          extra: h('div', { class: 'gm-final-body' }, [h('ol', { class: 'gm-podium' }, rank.map((t, i) => { if (t.score !== last) { place = i + 1; last = t.score; } return h('li', { style: `--team:${color(t.id)}` }, [
            h('span', { class: 'gm-podium-medal', text: place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.` }), h('span', { class: 'gm-podium-name', text: t.name }), h('span', { class: 'gm-podium-score', text: `${t.score} pts` })
          ]); })), h('h4', { class: 'gm-gallery-title', text: 'Words' }), list]),
          actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
        });
      } else {
        const stars = g.solved === g.total ? 3 : g.solved >= g.total * 0.6 ? 2 : g.solved > 0 ? 1 : 0;
        ctx.showResult({
          icon: '🚀', title: `You solved ${g.solved} of ${g.total} words!`,
          extra: h('div', { class: 'gm-final-body' }, [
            h('div', { class: 'gm-stars', 'aria-label': `${stars} out of 3 stars` }, [1, 2, 3].map((i) => h('span', { class: 'gm-star' + (i <= stars ? ' is-on' : ''), 'aria-hidden': 'true', text: '★' }))),
            list
          ]),
          actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
        });
      }
      ctx.body.querySelector('.gm-result')?.classList.add('gm-result-wide');
    }

    setup();
    return {
      onKey(e) {
        if (!g || !g.current || g.current.status !== 'playing' || ctx.body.querySelector('.gm-result')) return;
        if (/^[a-z]$/i.test(e.key)) { e.preventDefault(); guess(e.key.toUpperCase()); }
      },
      hasProgress: () => !!g && !W.done(g) && (g.index > 0 || (g.current && g.current.guessed.length > 0)),
      unmount: stopTimer,
      _game: () => g, _state: () => g && g.current, _timer: () => timer
    };
  });
})();
