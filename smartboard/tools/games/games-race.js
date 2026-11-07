'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — BOARD RACE (split screen, local)
// • 2–4 named teams, each with its own lane on the board (multi-touch: lanes never interfere)
// • Questions: generated quick maths (+ − × ÷, Easy/Medium/Hard) or question sets
//   (Quiz Path samples and the teacher's own sets)
// • Answer with: 🔢 keypad (auto-checked) · 🅰 multiple choice (auto-checked) · ✍ scratch pad + teacher awards
// • Same question for everyone (first correct wins the point) or separate questions per lane
// • First to 3/5/10 points, optional game timer, streaks, fastest answer, race track, sound
// Rules live in GameEngine.race; this file is only the screens.
// ═══════════════════════════════════════════════════════════
(() => {
  if (typeof GamesHub === 'undefined') return;
  const { h } = GamesHub;

  const SETTINGS_KEY = 'gm_race_settings_v1';
  const PATH_SETS_KEY = 'gm_path_sets_v1';   // teacher sets made in Quiz Path are offered here too
  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea'];
  const DEFAULT_NAMES = ['Team A', 'Team B', 'Team C', 'Team D'];
  const OPS = [{ value: '+', label: '+ Add' }, { value: '-', label: '− Subtract' }, { value: 'x', label: '× Multiply' }, { value: '/', label: '÷ Divide' }];
  const WRONG_LOCK = 1500;

  const store = {
    get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  function chips(label, options, value, onChange, { multi = false } = {}) {
    const wrap = h('div', { class: 'gm-choice', role: 'group', 'aria-label': label }, [h('span', { class: 'gm-choice-label', text: label })]);
    options.forEach((o, i) => wrap.appendChild(h('button', {
      type: 'button', class: 'gm-chip', 'aria-pressed': String(multi ? value.includes(o.value) : o.value === value), text: o.label, disabled: !!o.disabled,
      on: { click: (e) => {
        if (multi) { onChange(o.value, e.currentTarget); return; }
        wrap.querySelectorAll('.gm-chip').forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); onChange(o.value);
      } }
    })));
    return wrap;
  }
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const fmtMs = (ms) => (ms == null ? '—' : `${(ms / 1000).toFixed(1)} s`);

  GamesHub.register('race', (ctx) => {
    const { E, C, session } = ctx;
    const R = E.race;
    const saved = store.get(SETTINGS_KEY) || {};
    const cfg = {
      names: Array.isArray(saved.names) && saved.names.length >= 2 ? saved.names.slice(0, 4).map((n, i) => String(n || DEFAULT_NAMES[i]).slice(0, 20)) : DEFAULT_NAMES.slice(0, 2),
      source: saved.source === 'sets' ? 'sets' : 'maths',
      ops: Array.isArray(saved.ops) && saved.ops.length ? saved.ops.filter((o) => OPS.some((x) => x.value === o)) : ['+', '-', 'x', '/'],
      level: ['easy', 'medium', 'hard'].includes(saved.level) ? saved.level : 'medium',
      picks: Array.isArray(saved.picks) && saved.picks.length ? saved.picks : [C.quizPathSets[0].id],
      answer: ['keypad', 'choice', 'pad'].includes(saved.answer) ? saved.answer : 'keypad',
      mode: saved.mode === 'separate' ? 'separate' : 'same',
      target: [3, 5, 10].includes(saved.target) ? saved.target : 5,
      minutes: [0, 2, 3, 5].includes(saved.minutes) ? saved.minutes : 0,
      sound: saved.sound !== false
    };
    if (!cfg.ops.length) cfg.ops = ['+'];
    let s = null, lanes = [], deck = [], gameTimer = null, audio = null, root = null, roundTimer = null;
    const saveCfg = () => store.set(SETTINGS_KEY, cfg);
    const color = (i) => COLORS[i % COLORS.length];

    const mySets = () => (store.get(PATH_SETS_KEY) || []).map((r) => { const n = E.normalizeQuizPathSet(r); return n.set ? Object.assign(n.set, { id: r.id }) : null; }).filter(Boolean);
    const allSets = () => C.quizPathSets.concat(mySets());
    /** Questions usable with the chosen answer style (multiple choice needs wrong options; keypad needs numbers). */
    function setPool() {
      const qs = cfg.picks.map((id) => allSets().find((x) => x.id === id)).filter(Boolean).flatMap((x) => x.questions);
      if (cfg.answer === 'choice') return qs.filter((q) => q.choices && q.choices.length);
      if (cfg.answer === 'keypad') return qs.filter((q) => /^\s*-?[\d.,\s]+\s*$/.test(q.a));
      return qs;
    }

    ctx.setHelp([
      'Each team has its own lane on the board — several people can tap or draw at the same time.',
      '🔢 Keypad: tap the digits and ✓ to answer. 🅰 Choices: tap one answer. Both are checked automatically.',
      '✍ Scratch pad: work it out on the pad; the teacher presses ✓ Point for the team that was first and right.',
      'Same question: everyone races on one question — the first correct answer wins the point. Separate: each lane has its own questions.',
      'A wrong answer locks that lane for a moment (and, on a shared multiple-choice question, until the next question).',
      'First team to the target wins. With a game timer, the highest score when time runs out wins.'
    ]);

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
    function clearLaneTimers() { lanes.forEach((ln) => { if (ln && ln.timer !== null) { session.clearTimeout(ln.timer); ln.timer = null; } }); if (roundTimer !== null) { session.clearTimeout(roundTimer); roundTimer = null; } }
    function stopAll() { clearLaneTimers(); if (gameTimer) { gameTimer.stop(); gameTimer = null; } }
    session.onDispose(() => { stopAll(); if (audio) { try { audio.close(); } catch (e) { /* ignore */ } audio = null; } });

    // ════════ SETUP ════════
    function setup() {
      stopAll();
      s = null; root = null;
      ctx.setPhase('idle'); ctx.setHud([]);
      const sets = allSets();
      cfg.picks = cfg.picks.filter((id) => sets.some((x) => x.id === id));
      if (!cfg.picks.length) cfg.picks = [C.quizPathSets[0].id];
      const names = h('div', { class: 'gm-team-names' });
      const count = h('span', { class: 'gm-stepper-value' });
      const minus = h('button', { type: 'button', class: 'gm-btn gm-stepper-btn', 'aria-label': 'Fewer teams', text: '−', on: { click: () => { if (cfg.names.length > 2) { cfg.names.pop(); drawNames(); saveCfg(); } } } });
      const plus = h('button', { type: 'button', class: 'gm-btn gm-stepper-btn', 'aria-label': 'More teams', text: '+', on: { click: () => { if (cfg.names.length < 4) { cfg.names.push(DEFAULT_NAMES[cfg.names.length]); drawNames(); saveCfg(); } } } });
      function drawNames() {
        count.textContent = String(cfg.names.length);
        minus.disabled = cfg.names.length <= 2; plus.disabled = cfg.names.length >= 4;
        names.replaceChildren(...cfg.names.map((n, i) => h('label', { class: 'gm-name-field', style: `--team:${color(i)}` }, [
          h('span', { class: 'gm-name-dot', 'aria-hidden': 'true', text: String(i + 1) }),
          h('input', { type: 'text', class: 'gm-input', value: n, maxlength: '20', 'aria-label': `Name of team ${i + 1}`, on: { input: (e) => { cfg.names[i] = e.target.value.slice(0, 20); }, change: saveCfg } })
        ])));
      }
      drawNames();
      const info = h('p', { class: 'gm-note', 'data-info': '' });
      const startBtn = h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-startgame': '', text: '▶ Start', on: { click: start } });
      const mathsBox = h('div', { class: 'gm-setup-col', hidden: cfg.source !== 'maths' }, [
        chips('Operations', OPS, cfg.ops, (v, btn) => {
          const on = cfg.ops.includes(v);
          if (on && cfg.ops.length === 1) { ctx.toast('Keep at least one operation'); return; }
          cfg.ops = on ? cfg.ops.filter((x) => x !== v) : cfg.ops.concat(v);
          btn.setAttribute('aria-pressed', String(!on)); saveCfg(); updateInfo();
        }, { multi: true }),
        chips('Level', [{ value: 'easy', label: '🙂 Easy' }, { value: 'medium', label: '🎯 Medium' }, { value: 'hard', label: '🔥 Hard' }], cfg.level, (v) => { cfg.level = v; saveCfg(); updateInfo(); })
      ]);
      const setsBox = h('div', { class: 'gm-setup-col', hidden: cfg.source !== 'sets' }, [
        chips('Question sets', sets.map((x) => ({ value: x.id, label: (String(x.id).startsWith('my-') ? '⭐ ' : '') + x.title })), cfg.picks, (v, btn) => {
          const on = cfg.picks.includes(v);
          if (on && cfg.picks.length === 1) { ctx.toast('Keep at least one question set'); return; }
          cfg.picks = on ? cfg.picks.filter((x) => x !== v) : cfg.picks.concat(v);
          btn.setAttribute('aria-pressed', String(!on)); saveCfg(); updateInfo();
        }, { multi: true }),
        h('p', { class: 'gm-note', text: 'Make your own question sets in Quiz Path (+ New question set) — they appear here too.' })
      ]);
      function updateInfo() {
        const ex = cfg.source === 'maths' ? E.makeMathQuestion(ctx.rng, { ops: cfg.ops, level: cfg.level }).q.replace(' = ?', '') : null;
        const n = cfg.source === 'sets' ? setPool().length : null;
        info.textContent = cfg.source === 'maths' ? `Example: ${ex}` : `${n} question${n === 1 ? '' : 's'} can be used with ${cfg.answer === 'choice' ? 'multiple choice' : cfg.answer === 'keypad' ? 'the number keypad' : 'the scratch pad'}`
          + (cfg.source === 'sets' && cfg.answer === 'keypad' ? ' (number answers only)' : cfg.source === 'sets' && cfg.answer === 'choice' ? ' (questions with wrong options only)' : '');
        startBtn.disabled = cfg.source === 'sets' && n < 1;
      }
      const left = h('section', { class: 'gm-setup-col', 'aria-label': 'Players' }, [
        h('div', { class: 'gm-choice' }, [h('span', { class: 'gm-choice-label', text: 'Teams' }), h('div', { class: 'gm-stepper', role: 'group', 'aria-label': 'Number of teams' }, [minus, count, plus])]),
        names,
        chips('Questions', [{ value: 'same', label: '🤝 Same for all' }, { value: 'separate', label: '↔ Separate' }], cfg.mode, (v) => { cfg.mode = v; saveCfg(); }),
        chips('First to', [3, 5, 10].map((n) => ({ value: n, label: `${n} points` })), cfg.target, (v) => { cfg.target = v; saveCfg(); }),
        chips('Game timer', [{ value: 0, label: '😌 Off' }, { value: 2, label: '⏱ 2 min' }, { value: 3, label: '⏱ 3 min' }, { value: 5, label: '⏱ 5 min' }], cfg.minutes, (v) => { cfg.minutes = v; saveCfg(); })
      ]);
      const right = h('section', { class: 'gm-setup-col', 'aria-label': 'Question settings' }, [
        chips('Ask', [{ value: 'maths', label: '🔢 Quick maths' }, { value: 'sets', label: '📚 Question sets' }], cfg.source, (v) => { cfg.source = v; mathsBox.hidden = v !== 'maths'; setsBox.hidden = v !== 'sets'; saveCfg(); updateInfo(); }),
        mathsBox, setsBox,
        chips('Answer with', [{ value: 'keypad', label: '🔢 Keypad' }, { value: 'choice', label: '🅰 Choices' }, { value: 'pad', label: '✍ Scratch pad' }], cfg.answer, (v) => { cfg.answer = v; saveCfg(); updateInfo(); }),
        info,
        chips('Sound', [{ value: true, label: 'On' }, { value: false, label: 'Off' }], cfg.sound, (v) => { cfg.sound = v; saveCfg(); })
      ]);
      ctx.body.replaceChildren(h('div', { class: 'gm-setup gm-setup-wide' }, [
        h('h3', { text: '🏁 Board Race' }),
        h('p', { text: 'Teams race side by side on the board — the first correct answer scores!' }),
        h('div', { class: 'gm-setup-2col' }, [left, right]),
        cfg.source === 'sets' ? h('p', { class: 'gm-sample', text: C.LABEL + '.' }) : null,
        startBtn
      ].filter(Boolean)));
      updateInfo();
    }

    // ════════ QUESTIONS ════════
    function makeQuestion() {
      if (cfg.source === 'maths') return E.makeMathQuestion(ctx.rng, { ops: cfg.ops, level: cfg.level });
      if (!deck.length) deck = E.shuffle(setPool(), ctx.rng);
      return deck.pop();
    }

    // ════════ GAME ════════
    function start() {
      stopAll();
      if (cfg.source === 'sets' && !setPool().length) { ctx.toast('No questions can be used with this answer style'); return; }
      cfg.names = cfg.names.map((n, i) => (n || '').trim() || DEFAULT_NAMES[i]); saveCfg();
      s = E.createRace({ target: cfg.target, names: cfg.names.slice() });
      deck = [];
      ctx.clearResult();
      ctx.setPhase('playing');
      build();
      if (cfg.minutes) {
        gameTimer = session.countdown(cfg.minutes * 60, {
          onTick: (l) => { const t = root && root.querySelector('[data-gametimer]'); if (t) { t.textContent = `⏱ ${fmtTime(l)}`; t.classList.toggle('is-low', l <= 15); } if (l > 0 && l <= 5) tone([880], 0.05); },
          onEnd: () => { gameTimer = null; if (s && !s.over) { R.end(s); finish('time'); } }
        });
        gameTimer.start();
      }
      if (cfg.mode === 'same') newRound(true); else lanes.forEach((_, i) => newQuestion(i));
    }

    function build() {
      const n = s.teams.list.length;
      lanes = s.teams.list.map((t, i) => ({ id: i, q: null, input: '', locked: false, done: false, timer: null, shownAt: 0, picked: [] }));
      const zones = s.teams.list.map((t, i) => {
        const z = h('section', { class: `gm-race-zone gm-team-${i}`, 'data-team': i, style: `--team:${color(i)}`, 'aria-label': t.name }, [
          h('div', { class: 'gm-race-head' }, [
            h('h3', { text: t.name }),
            h('span', { class: 'gm-race-streak', 'data-streak': i }),
            h('span', { class: 'gm-race-score', 'data-score': i, text: '0' })
          ]),
          h('p', { class: 'gm-race-q', 'data-q': i, 'aria-live': 'polite' }),
          h('div', { class: 'gm-race-body', 'data-body': i }),
          h('p', { class: 'gm-race-feedback', 'data-feedback': i, 'aria-live': 'polite' }),
          h('div', { class: 'gm-row gm-center gm-race-actions', 'data-actions': i })
        ]);
        return z;
      });
      const track = h('div', { class: 'gm-race-track', 'aria-label': 'Race track' }, s.teams.list.map((t, i) => h('div', { class: 'gm-race-lane', style: `--team:${color(i)}` }, [
        h('span', { class: 'gm-race-flag', 'aria-hidden': 'true', text: '🏁' }),
        h('div', { class: 'gm-race-bar' }, [h('span', { class: 'gm-race-fill', 'data-fill': i })]),
        h('span', { class: 'gm-race-tag', text: String(i + 1) })
      ])));
      const centre = h('div', { class: 'gm-race-centre' }, [
        h('span', { class: 'gm-pill', 'data-round': '', text: `Round ${s.round}` }),
        h('span', { class: 'gm-pill', text: `First to ${s.target}` }),
        cfg.minutes ? h('span', { class: 'gm-pill gm-timer', 'data-gametimer': '', text: `⏱ ${fmtTime(cfg.minutes * 60)}` }) : null,
        track,
        cfg.mode === 'same' ? h('button', { type: 'button', class: 'gm-btn gm-primary', 'data-nextq': '', text: cfg.answer === 'pad' ? '⏭ Next question' : '⏭ Skip', on: { click: () => { if (cfg.answer !== 'pad') reveal(); else { R.next(s); newRound(); } } } }) : null,
        h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '🏁 End game', on: { click: async () => { if (await ctx.confirm({ title: 'End the game now?', ok: 'End game' })) { R.end(s); finish('ended'); } } } }),
        h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '⟲ Reset scores', on: { click: resetScores } })
      ].filter(Boolean));
      root = h('div', { class: `gm-race gm-race-n${n} gm-race-ans-${cfg.answer}` }, n === 2 ? [zones[0], centre, zones[1]] : [centre, ...zones]);
      ctx.body.replaceChildren(root);
      ctx.setHud([
        h('span', { class: 'gm-pill', text: cfg.source === 'maths' ? `🔢 ${cfg.ops.map((o) => ({ '+': '+', '-': '−', x: '×', '/': '÷' }[o])).join(' ')} · ${cfg.level[0].toUpperCase()}${cfg.level.slice(1)}` : '📚 Question sets' }),
        h('span', { class: 'gm-pill', text: cfg.mode === 'same' ? '🤝 Same question' : '↔ Separate questions' })
      ]);
      // each lane builds its answer area once (a scratch pad keeps its own pointer capture)
      lanes.forEach((ln, i) => buildLane(i));
    }
    const laneEl = (i, sel) => root && root.querySelector(`[data-${sel}="${i}"]`);
    function buildLane(i) {
      const body = laneEl(i, 'body'), actions = laneEl(i, 'actions');
      const t = s.teams.list[i];
      if (cfg.answer === 'pad') {
        const canvas = h('canvas', { class: 'gm-race-pad', 'aria-label': `${t.name} working area — draw with finger, pen or mouse` });
        body.replaceChildren(h('div', { class: 'gm-race-padwrap' }, [canvas]));
        lanes[i].pad = ctx.createPad(canvas, { color: color(i), width: ctx.px(4) });
        actions.replaceChildren(
          h('button', { type: 'button', class: 'gm-btn gm-good', 'data-award': i, text: `✓ Point`, 'aria-label': `Point to ${t.name}`, on: { click: () => teacherAward(i) } }),
          h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-show': i, text: '👁 Answer', on: { click: () => { const f = laneEl(i, 'feedback'); f.textContent = f.textContent ? '' : `Answer: ${lanes[i].q.a}`; } } }),
          h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '🧽 Clear', on: { click: () => lanes[i].pad.clear() } }),
          cfg.mode === 'separate' ? h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-next': i, text: '⏭ Next', on: { click: () => newQuestion(i) } }) : null
        );
      } else {
        actions.replaceChildren(cfg.mode === 'separate' ? h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-next': i, text: '⏭ Skip', on: { click: () => { R.miss(s, i); showStreak(i); newQuestion(i); } } }) : '');
      }
    }
    /** Draw the answer area of a lane for its current question. */
    function renderLane(i) {
      const ln = lanes[i];
      laneEl(i, 'q').textContent = ln.q ? ln.q.q : '';
      const zone = root.querySelector(`.gm-team-${i}`);
      zone.classList.toggle('is-locked', ln.locked || ln.done);
      if (cfg.answer === 'keypad') {
        const disp = h('div', { class: 'gm-race-display', 'data-display': i, 'aria-label': 'Your answer' }, ln.input || ' ');
        const key = (label, v, cls = '') => h('button', { type: 'button', class: 'gm-btn gm-race-key ' + cls, 'data-key': v, disabled: ln.locked || ln.done, text: label, 'aria-label': v === 'back' ? 'Delete' : v === 'ok' ? 'Check answer' : label, on: { click: () => press(i, v) } });
        laneEl(i, 'body').replaceChildren(disp, h('div', { class: 'gm-race-keypad' }, [
          ...['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((d) => key(d, d)),
          key('⌫', 'back', 'gm-ghost'), key('0', '0'), key('✓', 'ok', 'gm-good')
        ]));
      } else if (cfg.answer === 'choice') {
        const opts = ln.opts || [];
        laneEl(i, 'body').replaceChildren(h('div', { class: 'gm-race-choices' }, opts.map((o, k) => h('button', {
          type: 'button', 'data-choice': o, disabled: ln.locked || ln.done || ln.picked.includes(o),
          class: 'gm-btn gm-race-choice' + (ln.picked.includes(o) ? ' is-wrong' : '') + (ln.reveal && o === ln.q.a ? ' is-right' : ''),
          on: { click: () => submit(i, o) }
        }, [h('span', { class: 'gm-qp-letter', text: 'ABCD'[k] }), h('span', { text: o })]))));
      }
    }
    function setQuestion(i, q) {
      const ln = lanes[i];
      ln.q = q; ln.input = ''; ln.locked = false; ln.done = false; ln.picked = []; ln.reveal = false; ln.shownAt = performance.now();
      ln.opts = q && q.choices ? E.shuffle([q.a, ...q.choices.slice(0, 3)], ctx.rng) : null;
      if (ln.timer !== null) { session.clearTimeout(ln.timer); ln.timer = null; }
      laneEl(i, 'feedback').textContent = '';
      laneEl(i, 'feedback').className = 'gm-race-feedback';
      if (ln.pad) ln.pad.clear();
      renderLane(i);
    }
    function newRound(first) {
      if (!s || s.over) return;
      if (!first) clearLaneTimers();
      const q = makeQuestion();
      lanes.forEach((_, i) => setQuestion(i, q));
      refresh();
    }
    function newQuestion(i) { if (!s || s.over) return; setQuestion(i, makeQuestion()); }

    function press(i, v) {
      const ln = lanes[i];
      if (ln.locked || ln.done || s.over) return;
      if (v === 'back') ln.input = ln.input.slice(0, -1);
      else if (v === 'ok') { if (ln.input) submit(i, ln.input); return; }
      else if (ln.input.length < 7) ln.input += v;
      tone([620], 0.03);
      const d = laneEl(i, 'display'); if (d) d.textContent = ln.input || ' ';
    }
    function submit(i, given) {
      const ln = lanes[i];
      if (!s || s.over || ln.locked || ln.done || ctx.lifecycle.phase !== 'playing') return;
      if (E.sameAnswer(given, ln.q.a)) correct(i); else wrong(i, given);
    }
    function correct(i) {
      const ln = lanes[i], ms = Math.round(performance.now() - ln.shownAt);
      R.award(s, i, ms);
      tone([523, 659, 784], 0.1);
      flash(i, 'is-hit');
      const name = s.teams.list[i].name;
      if (cfg.mode === 'same') {
        lanes.forEach((l, k) => { l.done = true; l.reveal = true; const f = laneEl(k, 'feedback'); f.textContent = k === i ? `✓ First! +1 · ${fmtMs(ms)}` : `${name} got it: ${ln.q.a}`; f.className = 'gm-race-feedback ' + (k === i ? 'is-good' : 'is-info'); renderLane(k); });
        ctx.announce(`${name} got it first. The answer was ${ln.q.a}`);
      } else {
        ln.done = true;
        const f = laneEl(i, 'feedback'); f.textContent = `✓ +1 · ${fmtMs(ms)}`; f.className = 'gm-race-feedback is-good';
        renderLane(i);
      }
      refresh();
      if (s.over) { roundTimer = session.setTimeout(() => { roundTimer = null; finish('target'); }, 900); return; }
      if (cfg.mode === 'same') roundTimer = session.setTimeout(() => { roundTimer = null; R.next(s); newRound(); }, 1400);
      else ln.timer = session.setTimeout(() => { ln.timer = null; newQuestion(i); }, 700);
    }
    function wrong(i, given) {
      const ln = lanes[i];
      R.miss(s, i);
      tone([260, 200], 0.1);
      flash(i, 'is-miss');
      showStreak(i);
      const f = laneEl(i, 'feedback');
      if (cfg.answer === 'choice') {
        ln.picked.push(given);
        if (cfg.mode === 'same') {
          ln.locked = true;
          f.textContent = '✗ Not that one — wait for the next question'; f.className = 'gm-race-feedback is-bad';
          renderLane(i);
          if (lanes.every((l) => l.locked || l.done)) reveal();
          return;
        }
        // separate: show the right answer, then a new question for this lane
        ln.done = true; ln.reveal = true;
        f.textContent = `✗ It was ${ln.q.a}`; f.className = 'gm-race-feedback is-bad';
        renderLane(i);
        ln.timer = session.setTimeout(() => { ln.timer = null; newQuestion(i); }, WRONG_LOCK);
        return;
      }
      // keypad: lock briefly, clear the input, try again
      ln.locked = true; ln.input = '';
      f.textContent = `✗ ${given} is not right — try again`; f.className = 'gm-race-feedback is-bad';
      renderLane(i);
      ln.timer = session.setTimeout(() => { ln.timer = null; ln.locked = false; if (!ln.done) { f.textContent = ''; f.className = 'gm-race-feedback'; renderLane(i); } }, WRONG_LOCK);
    }
    /** Nobody got it (or Skip): show the answer to everyone, then the next shared question. */
    function reveal() {
      if (!s || s.over || cfg.mode !== 'same' || roundTimer !== null) return;   // a round is already ending
      clearLaneTimers();
      const a = lanes[0].q.a;
      lanes.forEach((l, k) => { l.done = true; l.reveal = true; const f = laneEl(k, 'feedback'); f.textContent = `The answer was ${a}`; f.className = 'gm-race-feedback is-info'; renderLane(k); });
      tone([392, 330], 0.12);
      ctx.announce(`No point. The answer was ${a}`);
      roundTimer = session.setTimeout(() => { roundTimer = null; R.next(s); newRound(); }, 1600);
    }
    function teacherAward(i) {
      if (!s || s.over) return;
      const ms = Math.round(performance.now() - lanes[i].shownAt);
      if (!R.award(s, i, ms)) return;
      tone([523, 659, 784], 0.1);
      flash(i, 'is-hit');
      ctx.announce(`Point to ${s.teams.list[i].name}`);
      refresh();
      if (s.over) { finish('target'); return; }
      if (cfg.mode === 'same') { R.next(s); newRound(); } else newQuestion(i);
    }
    function flash(i, cls) {
      const z = root && root.querySelector(`.gm-team-${i}`);
      if (!z) return;
      z.classList.remove(cls); void z.offsetWidth; z.classList.add(cls);
      session.setTimeout(() => z.classList.remove(cls), 650);
    }
    function showStreak(i) {
      const st = s.stats[i], el = laneEl(i, 'streak');
      if (el) el.textContent = st.streak >= 2 ? `🔥 ${st.streak}` : '';
    }
    function refresh() {
      if (!root) return;
      s.teams.list.forEach((t, i) => {
        const el = laneEl(i, 'score'); if (el) el.textContent = String(t.score);
        const fill = laneEl(i, 'fill'); if (fill) fill.style.setProperty('--p', String(Math.min(1, t.score / s.target)));
        showStreak(i);
      });
      const r = root.querySelector('[data-round]'); if (r) r.textContent = `Round ${s.round}`;
    }
    async function resetScores() {
      if (s.teams.hasProgress() && !(await ctx.confirm({ title: 'Reset all scores?', text: 'Scores go back to 0.', ok: 'Reset', danger: true }))) return;
      R.reset(s); refresh();
    }
    function finish(how) {
      stopAll();
      tone([523, 659, 784, 1047], 0.14);
      const o = R.outcome(s);
      const rank = s.teams.list.slice().sort((a, b) => b.score - a.score);
      let place = 0, last = null;
      ctx.showResult({
        icon: o.tie ? '🤝' : '🏁',
        title: o.tie ? `It's a tie: ${o.teams.map((t) => t.name).join(' & ')}` : `${o.winner.name} wins!`,
        lines: [how === 'time' ? "⏰ Time's up!" : how === 'ended' ? 'Game ended by the teacher.' : `First to ${s.target} points.`],
        extra: h('div', { class: 'gm-final-body' }, [h('ol', { class: 'gm-podium' }, rank.map((t, i) => {
          if (t.score !== last) { place = i + 1; last = t.score; }
          const st = s.stats[t.id];
          return h('li', { style: `--team:${color(t.id)}` }, [
            h('span', { class: 'gm-podium-medal', text: place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.` }),
            h('span', { class: 'gm-podium-name', text: `${t.name}  ·  ✓${st.right} ✗${st.wrong}${st.best != null ? ` · ⚡${fmtMs(st.best)}` : ''}${st.bestStreak >= 2 ? ` · 🔥${st.bestStreak}` : ''}` }),
            h('span', { class: 'gm-podium-score', text: `${t.score} pts` })
          ]);
        }))]),
        actions: [{ label: '↻ Rematch', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
      });
      ctx.body.querySelector('.gm-result')?.classList.add('gm-result-wide');
    }

    setup();
    return {
      hasProgress: () => !!s && s.teams.hasProgress() && !s.over,
      unmount: stopAll,
      _state: () => s, _lanes: () => lanes, _pads: () => lanes.map((l) => l.pad), _timer: () => gameTimer
    };
  });
})();
