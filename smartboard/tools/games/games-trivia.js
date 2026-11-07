'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — TRIVIA BOARD
// • Any number of teams (2–8) with editable names and colours
// • Teacher-made question sets: categories, questions, answers and points typed in on the board,
//   saved on this device, with import/export as a .json file
// • A countdown starts as soon as a question opens (Off / 15–90 s), with pause and +10 s
// • Optional "steal" (a wrong answer passes the question to the next team) and wrong-answer penalty
// • Answer stays hidden until Reveal; final ranking with 🥇🥈🥉
// Rules live in GameEngine.trivia; this file is only the screens.
// ═══════════════════════════════════════════════════════════
(() => {
  if (typeof GamesHub === 'undefined') return;
  const { h } = GamesHub;

  const SETTINGS_KEY = 'gm_trivia_settings_v1';
  const SET_KEY = 'gm_trivia_set_v1';
  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#db2777', '#65a30d'];
  const MIN_TEAMS = 2, MAX_TEAMS = 8, MAX_CATS = 6, MAX_ROWS = 6;
  const DEFAULT_NAMES = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F', 'Team G', 'Team H'];

  const store = {
    get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(key) { try { localStorage.removeItem(key); } catch (e) { /* storage blocked */ } }
  };

  function chips(label, options, value, onChange) {
    const wrap = h('div', { class: 'gm-choice', role: 'group', 'aria-label': label }, [h('span', { class: 'gm-choice-label', text: label })]);
    options.forEach((o, i) => wrap.appendChild(h('button', {
      type: 'button', class: 'gm-chip', 'aria-pressed': String(o.value === value), text: o.label,
      on: { click: () => { wrap.querySelectorAll('.gm-chip').forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); onChange(o.value); } }
    })));
    return wrap;
  }

  GamesHub.register('trivia', (ctx) => {
    const { E, C, session } = ctx;
    const saved = store.get(SETTINGS_KEY) || {};
    const cfg = {
      names: Array.isArray(saved.names) && saved.names.length >= MIN_TEAMS ? saved.names.slice(0, MAX_TEAMS).map((n, i) => String(n || DEFAULT_NAMES[i]).slice(0, 24)) : DEFAULT_NAMES.slice(0, 2),
      timer: [0, 15, 30, 45, 60, 90].includes(saved.timer) ? saved.timer : 30,
      penalty: !!saved.penalty,
      steal: saved.steal !== false,
      sound: saved.sound !== false,
      source: saved.source === 'mine' ? 'mine' : 'sample'
    };
    let s = null, qTimer = null, audio = null;

    const mySet = () => { const raw = store.get(SET_KEY); const n = raw ? E.normalizeTriviaSet(raw) : null; return n && n.categories.length ? n.categories : null; };
    const activeSet = () => (cfg.source === 'mine' && mySet()) || C.trivia.categories;
    const saveCfg = () => store.set(SETTINGS_KEY, cfg);
    const color = (id) => COLORS[id % COLORS.length];

    ctx.setHelp([
      'Set the number of teams and their names, choose the questions and the time limit, then press Start.',
      'The team shown with ▶ picks a category and points value. The timer starts as soon as the question opens.',
      'Press Reveal answer, then Correct or Wrong. With "steal" on, a wrong answer passes the same question to the next team.',
      'Teachers: press "✎ Create / edit my questions" to type your own categories, questions, answers and points. They are saved on this device; use Export to share them.',
      'Keyboard: R reveal · C correct · W wrong · S skip · P pause the timer.'
    ]);

    // ── sound (Web Audio, quiet; never loaded from the network) ──
    function tone(freqs, dur = 0.16) {
      if (!cfg.sound) return;
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        let t = audio.currentTime;
        freqs.forEach((f) => {
          const o = audio.createOscillator(), g = audio.createGain();
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + dur + 0.02);
          t += dur * 0.9;
        });
      } catch (e) { /* audio unavailable */ }
    }
    session.onDispose(() => { stopTimer(); if (audio) { try { audio.close(); } catch (e) { /* ignore */ } audio = null; } });

    // ════════ SETUP ════════
    function setup() {
      stopTimer();
      ctx.setPhase('idle'); ctx.setHud([]);
      const mine = mySet();
      if (cfg.source === 'mine' && !mine) cfg.source = 'sample';
      const nameGrid = h('div', { class: 'gm-team-names' });
      const count = h('span', { class: 'gm-stepper-value', 'aria-live': 'polite', text: String(cfg.names.length) });
      const minus = h('button', { type: 'button', class: 'gm-btn gm-stepper-btn', 'aria-label': 'Fewer teams', text: '−' });
      const plus = h('button', { type: 'button', class: 'gm-btn gm-stepper-btn', 'aria-label': 'More teams', text: '+' });
      function drawNames() {
        count.textContent = String(cfg.names.length);
        minus.disabled = cfg.names.length <= MIN_TEAMS; plus.disabled = cfg.names.length >= MAX_TEAMS;
        nameGrid.replaceChildren(...cfg.names.map((n, i) => h('label', { class: 'gm-name-field', style: `--team:${color(i)}` }, [
          h('span', { class: 'gm-name-dot', 'aria-hidden': 'true', text: String(i + 1) }),
          h('input', { type: 'text', class: 'gm-input', value: n, maxlength: '24', 'aria-label': `Name of team ${i + 1}`,
            on: { input: (e) => { cfg.names[i] = e.target.value.slice(0, 24); }, change: saveCfg } })
        ])));
      }
      minus.addEventListener('click', () => { if (cfg.names.length > MIN_TEAMS) { cfg.names.pop(); drawNames(); saveCfg(); } });
      plus.addEventListener('click', () => { if (cfg.names.length < MAX_TEAMS) { cfg.names.push(DEFAULT_NAMES[cfg.names.length]); drawNames(); saveCfg(); } });
      drawNames();

      const setInfo = (cats) => `${cats.length} categor${cats.length === 1 ? 'y' : 'ies'} · ${cats.reduce((n, c) => n + c.questions.length, 0)} questions`;
      const left = h('section', { class: 'gm-setup-col', 'aria-label': 'Teams' }, [
        h('div', { class: 'gm-choice' }, [h('span', { class: 'gm-choice-label', text: 'Teams' }),
          h('div', { class: 'gm-stepper', role: 'group', 'aria-label': 'Number of teams' }, [minus, count, plus])]),
        h('p', { class: 'gm-note', text: 'Tap a name to change it.' }),
        nameGrid
      ]);
      const right = h('section', { class: 'gm-setup-col', 'aria-label': 'Game settings' }, [
        chips('Questions', [{ value: 'sample', label: 'Sample set' }].concat(mine ? [{ value: 'mine', label: `My questions (${mine.reduce((n, c) => n + c.questions.length, 0)})` }] : []), cfg.source, (v) => { cfg.source = v; saveCfg(); setup(); }),
        h('div', { class: 'gm-row' }, [
          h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-edit': '', text: mine ? '✎ Edit my questions' : '✎ Create my questions', on: { click: editor } }),
          h('span', { class: 'gm-note', text: setInfo(activeSet()) })
        ]),
        chips('Time per question', [0, 15, 30, 45, 60, 90].map((v) => ({ value: v, label: v ? `${v} s` : 'Off' })), cfg.timer, (v) => { cfg.timer = v; saveCfg(); }),
        chips('Wrong answer', [{ value: true, label: 'Next team can steal' }, { value: false, label: 'No steal' }], cfg.steal, (v) => { cfg.steal = v; saveCfg(); }),
        chips('Penalty', [{ value: false, label: 'No penalty' }, { value: true, label: 'Lose the points' }], cfg.penalty, (v) => { cfg.penalty = v; saveCfg(); }),
        chips('Sound', [{ value: true, label: 'On' }, { value: false, label: 'Off' }], cfg.sound, (v) => { cfg.sound = v; saveCfg(); })
      ]);
      ctx.body.replaceChildren(h('div', { class: 'gm-setup gm-setup-wide' }, [
        h('h3', { text: '🏆 Trivia Board' }),
        h('p', { text: 'Teams take turns choosing a category and a points value — answer before the timer runs out!' }),
        h('div', { class: 'gm-setup-2col' }, [left, right]),
        cfg.source === 'sample' ? h('p', { class: 'gm-sample', text: C.LABEL + '.' }) : null,
        h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-startgame': '', text: '▶ Start', on: { click: start } })
      ]));
    }

    // ════════ QUESTION EDITOR ════════
    function editor() {
      stopTimer();
      ctx.setPhase('idle'); ctx.setHud([]);
      // work on a copy: own set if there is one, otherwise the sample set as a starting point
      let cats = JSON.parse(JSON.stringify(mySet() || C.trivia.categories));
      const errorsEl = h('div', { class: 'gm-editor-errors', role: 'alert' });
      const body = h('div', { class: 'gm-editor-body' });
      const fileIn = h('input', { type: 'file', accept: '.json,application/json', hidden: true });

      function draw() {
        body.replaceChildren(...cats.map((c, ci) => h('section', { class: 'gm-ed-cat', 'aria-label': `Category ${ci + 1}` }, [
          h('div', { class: 'gm-ed-cat-head' }, [
            h('input', { type: 'text', class: 'gm-input gm-ed-catname', value: c.name, maxlength: '40', placeholder: `Category ${ci + 1}`, 'aria-label': `Category ${ci + 1} name`, on: { input: (e) => { c.name = e.target.value; } } }),
            h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', title: 'Remove this category', 'aria-label': `Remove category ${ci + 1}`, text: '🗑',
              on: { click: async () => { if (cats.length <= 1) { ctx.toast('Keep at least one category'); return; } if (await ctx.confirm({ title: `Remove “${c.name || 'this category'}”?`, text: 'Its questions will be deleted from this set.', ok: 'Remove', danger: true })) { cats.splice(ci, 1); draw(); } } } })
          ]),
          ...c.questions.map((q, qi) => h('div', { class: 'gm-ed-q' }, [
            h('div', { class: 'gm-ed-q-top' }, [
              h('label', { class: 'gm-ed-points' }, [h('span', { text: 'Points' }), h('input', { type: 'number', class: 'gm-input', min: '1', step: '50', value: String(q.value), 'aria-label': `${c.name} question ${qi + 1} points`, on: { input: (e) => { q.value = e.target.value; } } })]),
              h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'aria-label': `Delete question ${qi + 1} in ${c.name}`, text: '✕', on: { click: () => { c.questions.splice(qi, 1); draw(); } } })
            ]),
            h('textarea', { class: 'gm-textarea', rows: '2', maxlength: '300', placeholder: 'Question', 'aria-label': `${c.name} question ${qi + 1}`, on: { input: (e) => { q.q = e.target.value; } } }),
            h('input', { type: 'text', class: 'gm-input', maxlength: '200', placeholder: 'Answer', value: q.a || '', 'aria-label': `${c.name} answer ${qi + 1}`, on: { input: (e) => { q.a = e.target.value; } } })
          ])),
          c.questions.length < MAX_ROWS ? h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '+ Add question',
            on: { click: () => { const last = c.questions[c.questions.length - 1]; c.questions.push({ value: last ? (Number(last.value) || 0) + 100 : 100, q: '', a: '' }); draw(); body.querySelectorAll('.gm-ed-cat')[ci].querySelectorAll('textarea')[c.questions.length - 1]?.focus(); } } }) : h('p', { class: 'gm-note', text: `Up to ${MAX_ROWS} questions per category.` })
        ])));
        // textareas take their text after creation (value is not an attribute)
        body.querySelectorAll('.gm-ed-cat').forEach((sec, ci) => sec.querySelectorAll('textarea').forEach((ta, qi) => { ta.value = cats[ci].questions[qi].q || ''; }));
        addCat.disabled = cats.length >= MAX_CATS;
      }
      const addCat = h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '+ Add category',
        on: { click: () => { if (cats.length < MAX_CATS) { cats.push({ name: '', questions: [{ value: 100, q: '', a: '' }] }); draw(); body.lastChild?.querySelector('input')?.focus(); body.scrollLeft = body.scrollWidth; } } } });

      function save() {
        const n = E.normalizeTriviaSet({ categories: cats });
        errorsEl.replaceChildren(...n.errors.slice(0, 4).map((m) => h('p', { text: '⚠ ' + m })));
        if (!n.categories.length) { ctx.toast('Nothing to save yet — add a question and its answer'); return; }
        if (n.errors.length) { ctx.toast('Some rows are incomplete — fix or delete them, then save'); return; }
        if (!store.set(SET_KEY, { categories: n.categories })) { ctx.toast('Could not save on this device (storage is blocked)'); return; }
        cfg.source = 'mine'; saveCfg();
        ctx.toast(`Saved: ${n.categories.reduce((k, c) => k + c.questions.length, 0)} questions in ${n.categories.length} categories`);
        setup();
      }
      fileIn.addEventListener('change', () => {
        const f = fileIn.files && fileIn.files[0];
        if (!f) return;
        if (f.size > 500000) { ctx.toast('That file is too large for a question set'); return; }
        const rd = new FileReader();
        rd.onload = () => {
          let parsed = null;
          try { parsed = JSON.parse(String(rd.result)); } catch (e) { ctx.toast('That file is not a valid question set (.json)'); return; }
          const n = E.normalizeTriviaSet(parsed);
          if (!n.categories.length) { ctx.toast('No usable questions found in that file'); return; }
          cats = n.categories; draw();
          ctx.toast(`Imported ${n.categories.length} categories — press Save to keep them`);
        };
        rd.readAsText(f);
        fileIn.value = '';
      });
      function exportSet() {
        const n = E.normalizeTriviaSet({ categories: cats });
        if (!n.categories.length) { ctx.toast('Nothing to export yet'); return; }
        const blob = new Blob([JSON.stringify({ app: 'PiyushDhara Trivia', version: 1, categories: n.categories }, null, 2)], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: 'trivia-questions.json' });
        document.body.appendChild(a); a.click(); a.remove();
        session.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }

      ctx.body.replaceChildren(h('div', { class: 'gm-editor' }, [
        h('div', { class: 'gm-editor-head' }, [
          h('h3', { text: '✎ My trivia questions' }),
          h('div', { class: 'gm-row' }, [
            addCat,
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '📂 Import', on: { click: () => fileIn.click() } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '💾 Export', on: { click: exportSet } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '↺ Start from sample', on: { click: async () => { if (await ctx.confirm({ title: 'Replace these questions with the sample set?', text: 'Unsaved changes will be lost.', ok: 'Replace', danger: true })) { cats = JSON.parse(JSON.stringify(C.trivia.categories)); draw(); } } } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: 'Cancel', on: { click: setup } }),
            h('button', { type: 'button', class: 'gm-btn gm-primary', 'data-save': '', text: '✔ Save questions', on: { click: save } })
          ])
        ]),
        h('p', { class: 'gm-note', text: `Up to ${MAX_CATS} categories and ${MAX_ROWS} questions each. Every question needs an answer. Saved on this device only.` }),
        errorsEl, body, fileIn
      ]));
      draw();
      body.querySelector('input')?.focus();
    }

    // ════════ GAME ════════
    function start() {
      const names = cfg.names.map((n, i) => (n || '').trim() || DEFAULT_NAMES[i]);
      cfg.names = names; saveCfg();
      s = E.createTrivia(activeSet(), names, { penalty: cfg.penalty, steal: cfg.steal });
      ctx.setPhase('playing');
      board();
    }

    function scoreboard(flashId) {
      return h('div', { class: 'gm-scoreboard', role: 'group', 'aria-label': 'Scores' }, s.teams.list.map((t) => h('div', {
        class: 'gm-scorecard' + (t.id === s.turn && !s.open ? ' is-turn' : '') + (s.open && t.id === s.answering ? ' is-answering' : '') + (flashId === t.id ? ' is-flash' : ''),
        style: `--team:${color(t.id)}`, 'data-team': t.id
      }, [
        h('span', { class: 'gm-scorecard-name', text: (t.id === s.turn && !s.open ? '▶ ' : '') + t.name }),
        h('span', { class: 'gm-scorecard-score', 'aria-label': `${t.name}: ${t.score} points`, text: String(t.score) })
      ])));
    }

    function hud(withActions) {
      ctx.setHud([
        h('span', { class: 'gm-pill', title: 'Questions left', text: `${E.trivia.remaining(s)} left` }),
        cfg.timer ? h('span', { class: 'gm-pill', title: 'Time per question', text: `⏱ ${cfg.timer}s` }) : null,
        withActions ? h('button', { type: 'button', class: 'gm-btn gm-ghost gm-mini', text: '⟲ Reset', 'aria-label': 'Reset board', on: { click: resetBoard } }) : null,
        withActions ? h('button', { type: 'button', class: 'gm-btn gm-ghost gm-mini', text: '⚙ New game', on: { click: newGame } }) : null
      ]);
    }

    function board(flash) {
      stopTimer();
      hud(true);
      const cats = [...new Set(s.tiles.map((t) => t.ci))].map((ci) => s.tiles.find((t) => t.ci === ci).category);
      const grid = h('div', { class: 'gm-trivia-grid', style: `--cols:${cats.length}`, role: 'grid', 'aria-label': 'Question board' });
      cats.forEach((c) => grid.appendChild(h('div', { class: 'gm-trivia-cat', role: 'columnheader', text: c })));
      const rows = Math.max(...cats.map((_, ci) => s.tiles.filter((t) => t.ci === ci).length));
      for (let r = 0; r < rows; r++) cats.forEach((c, ci) => {
        const t = s.tiles.find((x) => x.ci === ci && x.qi === r);
        if (!t) { grid.appendChild(h('div')); return; }
        const used = t.status !== 'open';
        const mark = t.status === 'correct' ? `✓ ${s.teams.list[t.by].name}` : t.status === 'incorrect' ? '✗ No points' : t.status === 'skip' ? '↷ Skipped' : '';
        grid.appendChild(h('button', {
          type: 'button', class: 'gm-tile' + (used ? ' is-used is-' + t.status : ''), disabled: used,
          style: t.status === 'correct' ? `--team:${color(t.by)}` : null,
          'aria-label': used ? `${c} ${t.value}: ${mark}` : `${c} for ${t.value} points`,
          on: { click: () => openTile(t.id) }
        }, used ? [h('span', { class: 'gm-tile-mark', text: mark })] : [String(t.value)]));
      });
      ctx.body.replaceChildren(h('div', { class: 'gm-trivia' }, [
        grid,
        h('div', { class: 'gm-trivia-foot' }, [scoreboard(flash ? flash.team : null)])
      ]));
      if (flash) {
        const pop = h('div', { class: 'gm-flash', style: `--team:${color(flash.team)}`, role: 'status', text: flash.text });
        ctx.body.appendChild(pop);
        session.setTimeout(() => pop.remove(), 1400);
      }
      if (E.trivia.remaining(s) === 0) finish();
    }

    // ── question view with countdown ──
    function stopTimer() { if (qTimer) { qTimer.stop(); qTimer = null; } }
    function openTile(id) {
      if (!E.trivia.openTile(s, id)) return;
      tone([660], 0.08);
      question();
    }
    function question(note) {
      stopTimer();
      const t = s.open, team = s.teams.list[s.answering];
      let award = s.answering;
      const total = cfg.timer;
      const secs = h('span', { class: 'gm-qtimer-secs', 'aria-live': 'off', text: total ? String(total) : '' });
      const fill = h('span', { class: 'gm-qtimer-fill' });
      const timesUp = h('p', { class: 'gm-timesup', hidden: true, role: 'alert', text: "⏰ Time's up!" });
      const pauseBtn = h('button', { type: 'button', class: 'gm-btn gm-ghost gm-mini', 'data-pause': '', text: '⏸ Pause' });
      const moreBtn = h('button', { type: 'button', class: 'gm-btn gm-ghost gm-mini', text: '+10 s' });
      const timerBox = total ? h('div', { class: 'gm-qtimer', role: 'timer', 'aria-label': 'Time left' }, [
        h('div', { class: 'gm-qtimer-bar' }, [fill]), secs, pauseBtn, moreBtn
      ]) : null;
      const answer = h('div', { class: 'gm-answer', hidden: true }, [h('span', { class: 'gm-answer-label', text: 'Answer: ' }), t.a]);
      const reveal = h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-reveal': '', text: '👁 Reveal answer' });
      const pick = h('div', { class: 'gm-row gm-center gm-pick', hidden: true }, [h('span', { text: 'Points go to:' }),
        ...s.teams.list.map((tm) => h('button', { type: 'button', class: 'gm-chip', style: `--team:${color(tm.id)}`, 'aria-pressed': String(tm.id === award), text: tm.name,
          on: { click: (ev) => { award = tm.id; pick.querySelectorAll('.gm-chip').forEach((b) => b.setAttribute('aria-pressed', String(b === ev.currentTarget))); } } }))]);
      const lastChance = cfg.steal && s.tried.length + 1 >= s.teams.list.length;
      const wrongLabel = cfg.steal && !lastChance ? '✗ Wrong — next team steals' : '✗ Wrong';

      const doReveal = () => { if (s.revealed) return; E.trivia.reveal(s); answer.hidden = false; pick.hidden = false; reveal.hidden = true; stopTimer(); setPaused(true, true); };
      const outcome = (o) => {
        if (!s.open) return;
        const who = o === 'correct' ? award : s.answering;
        const value = t.value, name = s.teams.list[who].name;
        const res = E.trivia.answer(s, o, who);
        if (!res) return;
        stopTimer();
        if (res === 'passed') { tone([300, 220], 0.14); ctx.announce(`Wrong. ${s.teams.list[s.answering].name} can steal!`); question(`❌ Not quite — ${s.teams.list[s.answering].name} can steal!`); return; }
        if (o === 'correct') { tone([523, 659, 784], 0.13); board({ team: award, text: `+${value}  ${name} 🎉` }); ctx.announce(`${value} points to ${name}`); }
        else if (o === 'incorrect') { tone([300, 220], 0.14); board(cfg.penalty ? { team: who, text: `−${value}  ${name}` } : null); ctx.announce('No points'); }
        else { board(); ctx.announce('Skipped'); }
      };
      reveal.addEventListener('click', doReveal);

      let paused = false;
      function setPaused(p, final) {
        paused = p;
        pauseBtn.textContent = p ? '▶ Resume' : '⏸ Pause';
        pauseBtn.disabled = !!final; moreBtn.disabled = !!final;
      }
      function paint(left) {
        if (!total) return;
        secs.textContent = String(left);
        fill.style.width = `${Math.max(0, Math.min(100, (left / Math.max(total, left)) * 100))}%`;
        timerBox.classList.toggle('is-low', left <= 5 && left > 0);
        timerBox.classList.toggle('is-out', left === 0);
      }
      if (total) {
        qTimer = session.countdown(total, {
          onTick: (left) => { paint(left); if (left > 0 && left <= 3) tone([880], 0.06); },
          onEnd: () => { qTimer = null; timesUp.hidden = false; setPaused(true, true); tone([440, 330, 220], 0.18); ctx.announce("Time's up"); }
        });
        pauseBtn.addEventListener('click', () => { if (!qTimer) return; if (paused) { qTimer.start(); setPaused(false); } else { qTimer.pause(); setPaused(true); } });
        moreBtn.addEventListener('click', () => { if (!qTimer) return; const wasRunning = !paused; qTimer.reset(qTimer.left + 10); paint(qTimer.left); if (wasRunning) qTimer.start(); });
        qTimer.start();
        paint(total);
      }

      ctx.body.replaceChildren(h('div', { class: 'gm-question' }, [
        h('div', { class: 'gm-question-meta' }, [
          `${t.category} · ${t.value} points · `,
          h('span', { class: 'gm-team-badge', style: `--team:${color(team.id)}`, text: `${team.name} answering` })
        ]),
        note ? h('p', { class: 'gm-steal-note', role: 'status', text: note }) : null,
        h('p', { class: 'gm-question-text', text: t.q }),
        timerBox, timesUp, answer, reveal, pick,
        h('div', { class: 'gm-row gm-center' }, [
          h('button', { type: 'button', class: 'gm-btn gm-good gm-big', 'data-correct': '', text: '✓ Correct', on: { click: () => outcome('correct') } }),
          h('button', { type: 'button', class: 'gm-btn gm-bad gm-big', 'data-wrong': '', text: wrongLabel, on: { click: () => outcome('incorrect') } }),
          h('button', { type: 'button', class: 'gm-btn gm-ghost gm-big', 'data-skip': '', text: '↷ Skip', on: { click: () => outcome('skip') } })
        ]),
        h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '← Back to board (question stays open)', on: { click: () => { E.trivia.close(s); board(); } } })
      ]));
      reveal.focus({ preventScroll: true });
      instance.reveal = doReveal; instance.outcome = outcome;
      instance.togglePause = () => pauseBtn.click();
    }

    function finish() {
      stopTimer();
      const rank = E.trivia.ranking(s);
      const medal = (p) => (p === 1 ? '🥇' : p === 2 ? '🥈' : p === 3 ? '🥉' : `${p}.`);
      const winners = rank.filter((r) => r.place === 1).map((r) => r.team.name);
      tone([523, 659, 784, 1047], 0.15);
      ctx.showResult({
        icon: '🏆', title: winners.length > 1 ? `It's a tie: ${winners.join(' & ')}` : `${winners[0]} wins!`,
        extra: h('ol', { class: 'gm-podium' }, rank.map((r) => h('li', { style: `--team:${color(r.team.id)}` }, [
          h('span', { class: 'gm-podium-medal', text: medal(r.place) }), h('span', { class: 'gm-podium-name', text: r.team.name }), h('span', { class: 'gm-podium-score', text: String(r.team.score) })
        ]))),
        actions: [
          { label: '↻ Play again', primary: true, onClick: () => { E.trivia.reset(s); ctx.setPhase('playing'); board(); } },
          { label: '⚙ New game', onClick: setup }
        ]
      });
    }
    async function resetBoard() {
      if (E.trivia.hasProgress(s) && !(await ctx.confirm({ title: 'Reset the board?', text: 'All questions reopen and every score goes back to 0.', ok: 'Reset', danger: true }))) return;
      E.trivia.reset(s); board();
    }
    async function newGame() {
      if (E.trivia.hasProgress(s) && !(await ctx.confirm({ title: 'Start a new game?', text: 'Scores will be lost.', ok: 'New game', danger: true }))) return;
      s = null; setup();
    }

    const instance = {
      hasProgress: () => !!s && E.trivia.hasProgress(s),
      unmount: stopTimer,
      onKey(e) {
        if (!s || !s.open || ctx.body.querySelector('.gm-result')) return;
        const k = e.key.toLowerCase();
        if (k === 'r') { e.preventDefault(); instance.reveal && instance.reveal(); }
        else if (k === 'c') { e.preventDefault(); instance.outcome && instance.outcome('correct'); }
        else if (k === 'w') { e.preventDefault(); instance.outcome && instance.outcome('incorrect'); }
        else if (k === 's') { e.preventDefault(); instance.outcome && instance.outcome('skip'); }
        else if (k === 'p') { e.preventDefault(); instance.togglePause && instance.togglePause(); }
      },
      _state: () => s, _cfg: () => cfg, _timer: () => qTimer
    };
    setup();
    return instance;
  });
})();
