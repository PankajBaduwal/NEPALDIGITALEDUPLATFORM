'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — RULES ENGINE (pure logic, no DOM)
// Every game's rules live here, separate from rendering, so they can be unit-tested in Node
// (module.exports) and used by the board UI (window.GameEngine).
// State objects are plain data; functions return a result describing what happened.
// ═══════════════════════════════════════════════════════════
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GameEngine = api;
})(typeof self !== 'undefined' ? self : this, function () {

  // ── Shared: random source, shuffle, text normalisation, lifecycle ──

  /** Seeded PRNG (mulberry32). Same seed → same sequence; used for testable shuffles and dice. */
  function createRng(seed) {
    let s = (Number.isFinite(seed) ? seed : Math.floor(Math.random() * 2 ** 32)) >>> 0;
    const next = () => {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return { next, int: (min, max) => min + Math.floor(next() * (max - min + 1)) };
  }

  /** Fisher–Yates shuffle into a new array. */
  function shuffle(arr, rng) {
    const a = Array.isArray(arr) ? arr.slice() : [];
    const r = rng || createRng();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /** Lower-case, trim, collapse inner whitespace. */
  function normalize(text) {
    return String(text == null ? '' : text).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  /** Explicit lifecycle: idle → ready → playing ⇄ checking → result → (ready | closed). */
  const TRANSITIONS = {
    idle: ['ready', 'playing', 'closed'],
    ready: ['playing', 'result', 'idle', 'closed'],
    playing: ['checking', 'result', 'ready', 'idle', 'closed'],
    checking: ['playing', 'result', 'ready', 'closed'],
    result: ['ready', 'playing', 'idle', 'closed'],
    closed: []
  };
  function createLifecycle(onChange) {
    let phase = 'idle';
    return {
      get phase() { return phase; },
      can: (to) => (TRANSITIONS[phase] || []).includes(to),
      to(next) {
        if (next === phase) return true;
        if (!(TRANSITIONS[phase] || []).includes(next)) return false;
        const prev = phase; phase = next;
        if (typeof onChange === 'function') onChange(next, prev);
        return true;
      }
    };
  }

  /** Countdown driven by an injectable clock (real timers in the board, fake ones in tests). */
  function createCountdown(seconds, { onTick, onEnd, clock } = {}) {
    const c = clock || { setInterval: (f, ms) => setInterval(f, ms), clearInterval: (id) => clearInterval(id) };
    let left = Math.max(0, Math.round(seconds)), id = null, done = false;
    const stop = () => { if (id !== null) { c.clearInterval(id); id = null; } };
    return {
      get left() { return left; },
      get running() { return id !== null; },
      start() {
        if (id !== null || done) return false;            // never two intervals for one countdown
        id = c.setInterval(() => {
          left = Math.max(0, left - 1);
          if (onTick) onTick(left);
          if (left === 0) { stop(); done = true; if (onEnd) onEnd(); }
        }, 1000);
        return true;
      },
      pause: stop,
      stop() { stop(); done = true; },
      reset(sec) { stop(); done = false; left = Math.max(0, Math.round(sec ?? seconds)); }
    };
  }

  /** Team scores that can only change through award(): one team's action never touches another. */
  function createTeams(names) {
    const teams = (names && names.length ? names : ['Team A', 'Team B']).map((name, i) => ({ id: i, name, score: 0 }));
    return {
      list: teams,
      award(id, points) {
        const t = teams[id];
        if (!t || !Number.isFinite(points)) return false;
        t.score += points;
        return true;
      },
      reset() { teams.forEach((t) => { t.score = 0; }); },
      leaders() {
        const top = Math.max(...teams.map((t) => t.score));
        return teams.filter((t) => t.score === top);
      },
      hasProgress: () => teams.some((t) => t.score !== 0)
    };
  }

  // ── 1. Trivia board ──
  /**
   * opts.penalty: a wrong answer loses the tile's points.
   * opts.steal:   a wrong answer passes the question to the next team that has not tried it yet;
   *               the tile closes when someone is right, it is skipped, or every team has tried.
   */
  function createTrivia(categories, teamNames, opts = {}) {
    const tiles = [];
    (categories || []).forEach((cat, ci) => (cat.questions || []).forEach((q, qi) => {
      tiles.push({ id: `${ci}-${qi}`, category: cat.name, ci, qi, value: q.value, q: q.q, a: q.a, status: 'open', by: null });
    }));
    return { tiles, teams: createTeams(teamNames), turn: 0, open: null, revealed: false, answering: null, tried: [], penalty: !!opts.penalty, steal: !!opts.steal };
  }
  const trivia = {
    openTile(s, id) {
      const t = s.tiles.find((x) => x.id === id);
      if (!t || t.status !== 'open' || s.open) return false;
      s.open = t; s.revealed = false; s.answering = s.turn; s.tried = [];
      return true;
    },
    reveal(s) { if (!s.open) return false; s.revealed = true; return true; },
    /**
     * outcome: 'correct' | 'incorrect' | 'skip'. Returns false (refused), true (tile closed) or
     * 'passed' (steal mode: the same question now goes to the next team). A tile scores only once.
     */
    answer(s, outcome, teamId = s.answering ?? s.turn) {
      const t = s.open;
      if (!t || t.status !== 'open' || !['correct', 'incorrect', 'skip'].includes(outcome)) return false;
      if (!s.teams.list[teamId]) return false;
      if (outcome === 'correct') s.teams.award(teamId, t.value);
      if (outcome === 'incorrect') {
        if (s.penalty) s.teams.award(teamId, -t.value);
        if (s.steal) {
          if (!s.tried.includes(teamId)) s.tried.push(teamId);
          const n = s.teams.list.length;
          for (let k = 1; k <= n; k++) {
            const next = (teamId + k) % n;
            if (!s.tried.includes(next)) { s.answering = next; s.revealed = false; return 'passed'; }
          }
        }
      }
      t.status = outcome; t.by = outcome === 'correct' ? teamId : null;
      s.open = null; s.revealed = false; s.answering = null; s.tried = [];
      s.turn = (s.turn + 1) % s.teams.list.length;
      return true;
    },
    close(s) { s.open = null; s.revealed = false; s.answering = null; s.tried = []; },
    remaining: (s) => s.tiles.filter((t) => t.status === 'open').length,
    hasProgress: (s) => s.tiles.some((t) => t.status !== 'open') || s.teams.hasProgress(),
    reset(s) { s.tiles.forEach((t) => { t.status = 'open'; t.by = null; }); s.teams.reset(); s.turn = 0; s.open = null; s.revealed = false; s.answering = null; s.tried = []; },
    /** Teams ranked by score (ties share a place). */
    ranking(s) {
      const sorted = s.teams.list.slice().sort((a, b) => b.score - a.score);
      let place = 0, last = null;
      return sorted.map((t, i) => { if (t.score !== last) { place = i + 1; last = t.score; } return { place, team: t }; });
    }
  };

  /**
   * Clean a teacher-made (or imported) question set. Drops empty questions/categories, trims and limits
   * text, keeps point values to whole numbers 1–100000. Returns { categories, errors } — categories is
   * empty when nothing usable remains. Never throws.
   */
  function normalizeTriviaSet(raw, { maxCategories = 6, maxQuestions = 6 } = {}) {
    const errors = [];
    const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
    const cats = raw && Array.isArray(raw.categories) ? raw.categories : (Array.isArray(raw) ? raw : null);
    if (!cats) return { categories: [], errors: ['No categories found.'] };
    const out = [];
    cats.slice(0, maxCategories).forEach((c, ci) => {
      const name = str(c && c.name, 40) || `Category ${ci + 1}`;
      const qs = [];
      ((c && c.questions) || []).slice(0, maxQuestions).forEach((q, qi) => {
        const text = str(q && q.q, 300), ans = str(q && q.a, 200);
        if (!text && !ans) return;
        if (!text || !ans) { errors.push(`${name}, row ${qi + 1}: needs both a question and an answer.`); return; }
        let value = Math.round(Number(q.value));
        if (!Number.isFinite(value) || value < 1) value = (qi + 1) * 100;
        qs.push({ value: Math.min(100000, value), q: text, a: ans });
      });
      if (qs.length) out.push({ name, questions: qs });
    });
    if (!out.length) errors.push('Add at least one question with an answer.');
    return { categories: out, errors };
  }

  // ── 2. Memory match ──
  /**
   * opts.teams: team names → teams take turns; a match scores 1 and the same team goes again,
   * a mismatch passes the turn (after resolve()). Without teams it is one player / the whole class.
   */
  function createMemory(pairs, rng, opts = {}) {
    const cards = [];
    (pairs || []).forEach((p, i) => {
      cards.push({ id: `p${i}a`, pair: i, side: 'a', text: p.a, faceUp: false, matched: false, by: null });
      cards.push({ id: `p${i}b`, pair: i, side: 'b', text: p.b, faceUp: false, matched: false, by: null });
    });
    return {
      cards: shuffle(cards, rng), picked: [], locked: false, attempts: 0, matches: 0, pairs: (pairs || []).length,
      teams: opts.teams && opts.teams.length ? createTeams(opts.teams) : null, turn: 0,
      streak: 0, bestStreak: 0, hints: 0
    };
  }
  const memory = {
    /** Returns 'flipped' | 'match' | 'mismatch' | 'ignored'. After 'mismatch' call resolve() (the UI waits first). */
    flip(s, id) {
      const c = s.cards.find((x) => x.id === id);
      if (s.locked || !c || c.faceUp || c.matched || s.picked.length >= 2) return 'ignored';
      c.faceUp = true; s.picked.push(c);
      if (s.picked.length < 2) return 'flipped';
      s.attempts++;
      const [a, b] = s.picked;
      if (a.pair === b.pair) {
        a.matched = b.matched = true; s.matches++; s.picked = [];
        a.by = b.by = s.teams ? s.turn : null;
        if (s.teams) s.teams.award(s.turn, 1);
        s.streak++; s.bestStreak = Math.max(s.bestStreak, s.streak);
        return 'match';
      }
      s.locked = true; s.streak = 0;
      return 'mismatch';
    },
    /** Turn the mismatched pair back over; in team play the turn passes to the next team. */
    resolve(s) {
      if (!s.locked) return false;
      s.picked.forEach((c) => { c.faceUp = false; }); s.picked = []; s.locked = false;
      if (s.teams) s.turn = (s.turn + 1) % s.teams.list.length;
      return true;
    },
    /** A hint: the two card ids of one unmatched pair (not counted as an attempt). */
    hint(s) {
      if (s.locked || s.picked.length) return null;
      const c = s.cards.find((x) => !x.matched);
      if (!c) return null;
      s.hints++;
      return s.cards.filter((x) => x.pair === c.pair).map((x) => x.id);
    },
    done: (s) => s.matches === s.pairs && s.pairs > 0,
    /** 3 stars: close to perfect; each hint counts as two extra attempts. */
    stars(s) {
      if (!s.pairs) return 0;
      const ratio = (s.attempts + s.hints * 2) / s.pairs;
      return ratio <= 1.4 ? 3 : ratio <= 2 ? 2 : 1;
    },
    accuracy: (s) => (s.attempts ? Math.round((s.matches / s.attempts) * 100) : 0)
  };

  /** Clean a teacher-made pair set: [{a: term, b: meaning}]. Reports blanks and duplicate cards. Never throws. */
  function normalizePairSet(raw, { max = 15 } = {}) {
    const errors = [];
    const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
    const list = raw && Array.isArray(raw.pairs) ? raw.pairs : (Array.isArray(raw) ? raw : null);
    if (!list) return { pairs: [], errors: ['No pairs found.'] };
    const out = [], seen = new Set();
    list.forEach((p, i) => {
      if (out.length >= max) return;
      const a = str(p && p.a, 40), b = str(p && p.b, 80);
      if (!a && !b) return;
      if (!a || !b) { errors.push(`Pair ${i + 1}: needs both a term and its match.`); return; }
      const ka = normalize(a), kb = normalize(b);
      if (seen.has(ka) || seen.has(kb) || ka === kb) { errors.push(`Pair ${i + 1}: “${a}” would make two identical cards.`); return; }
      seen.add(ka); seen.add(kb);
      out.push({ a, b });
    });
    if (out.length < 2) errors.push('Add at least 2 pairs.');
    return { pairs: out.length >= 2 ? out : [], errors };
  }

  // ── 3. Hangman (neutral "energy meter" progress) ──
  function createHangman(answer, { maxWrong = 6, hint = '' } = {}) {
    const word = String(answer || '').toUpperCase().replace(/\s+/g, ' ').trim();
    return { word, hint, maxWrong, guessed: [], wrong: 0, status: word ? 'playing' : 'lost', revealed: false };
  }
  const isLetter = (ch) => /^[A-Z]$/.test(ch);
  const hangman = {
    /** Returns 'hit' | 'miss' | 'repeat' | 'invalid' | 'over'. Repeats never count twice. */
    guess(s, letter) {
      if (s.status !== 'playing') return 'over';
      const L = String(letter || '').trim().toUpperCase();
      if (!isLetter(L)) return 'invalid';
      if (s.guessed.includes(L)) return 'repeat';
      s.guessed.push(L);
      const hit = s.word.includes(L);
      if (!hit) s.wrong++;
      if (hangman.solved(s)) s.status = 'won';
      else if (s.wrong >= s.maxWrong) s.status = 'lost';
      return hit ? 'hit' : 'miss';
    },
    solved: (s) => [...s.word].every((ch) => !isLetter(ch) || s.guessed.includes(ch)),
    /** Display pattern: letters not yet guessed are null; spaces/punctuation are shown. */
    pattern: (s) => [...s.word].map((ch) => (!isLetter(ch) || s.guessed.includes(ch) || s.status !== 'playing' ? ch : null)),
    reveal(s) { if (s.status === 'playing') { s.status = 'lost'; s.revealed = true; } },
    /** How many times a letter appears in the word. */
    occurrences: (s, L) => [...s.word].filter((ch) => ch === String(L || '').toUpperCase()).length,
    /** Guess the whole word. Right → 'win'; wrong → costs one energy cell → 'wrong' (or 'over' if that was the last). */
    guessWord(s, text) {
      if (s.status !== 'playing') return 'over';
      const g = normalize(text).toUpperCase();
      if (!g) return 'invalid';
      if (g === normalize(s.word).toUpperCase()) {
        [...s.word].forEach((ch) => { if (isLetter(ch) && !s.guessed.includes(ch)) s.guessed.push(ch); });
        s.status = 'won';
        return 'win';
      }
      s.wrong++;
      if (s.wrong >= s.maxWrong) { s.status = 'lost'; return 'over'; }
      return 'wrong';
    },
    /** Power-up: reveal one hidden letter for the price of one energy cell. Refused if it would use the last cell. */
    revealLetter(s, rng) {
      if (s.status !== 'playing' || s.wrong + 1 >= s.maxWrong) return null;
      const hidden = [...new Set([...s.word].filter((ch) => isLetter(ch) && !s.guessed.includes(ch)))];
      if (hidden.length <= 1) return null;           // never give away the final letter
      const L = hidden[Math.floor((rng ? rng.next() : Math.random()) * hidden.length)];
      s.guessed.push(L); s.wrong++;
      if (hangman.solved(s)) s.status = 'won';
      return L;
    }
  };

  /**
   * A multi-word Word Guess game. teamNames → teams take turns: a right letter scores 1 point per
   * time it appears and the team guesses again; a wrong letter passes the turn. Completing the word
   * scores a bonus. Without teams the whole class plays.
   */
  function createWordGame(words, teamNames, { rounds = 5, maxWrong = 6, bonus = 5, rng } = {}) {
    const r = rng || createRng();
    const list = shuffle((words || []).filter((w) => w && String(w.word || '').trim()), r);
    return { teams: teamNames && teamNames.length ? createTeams(teamNames) : null, turn: 0, rng: r, deck: list,
      total: Math.max(1, Math.min(Math.round(rounds), list.length || 1)), index: 0, maxWrong, bonus, current: null, history: [], solved: 0 };
  }
  const wordGame = {
    /** Start the next word (null when the game is over). */
    next(s) {
      if (s.index >= s.total || !s.deck.length) { s.current = null; return null; }
      const w = s.deck[s.index % s.deck.length];
      s.current = createHangman(w.word, { maxWrong: s.maxWrong, hint: w.hint || '' });
      return s.current;
    },
    /** Letter guess with team scoring. Returns { result, points }. */
    letter(s, L) {
      const h = s.current;
      if (!h) return { result: 'over', points: 0 };
      const result = hangman.guess(h, L);
      let points = 0;
      if (s.teams) {
        if (result === 'hit') { points = hangman.occurrences(h, L); if (h.status === 'won') points += s.bonus; s.teams.award(s.turn, points); }
        else if (result === 'miss' && h.status === 'playing') s.turn = (s.turn + 1) % s.teams.list.length;
      }
      return { result, points };
    },
    /** Whole-word guess with team scoring: bonus plus 1 per letter still hidden. */
    word(s, text) {
      const h = s.current;
      if (!h) return { result: 'over', points: 0 };
      const hiddenBefore = [...h.word].filter((ch) => /[A-Z]/.test(ch) && !h.guessed.includes(ch)).length;
      const result = hangman.guessWord(h, text);
      let points = 0;
      if (s.teams) {
        if (result === 'win') { points = s.bonus + hiddenBefore; s.teams.award(s.turn, points); }
        else if (result === 'wrong') s.turn = (s.turn + 1) % s.teams.list.length;
      }
      return { result, points };
    },
    /** Close the current word and record it. */
    finish(s) {
      const h = s.current;
      if (!h) return false;
      s.history.push({ word: h.word, solved: h.status === 'won', wrong: h.wrong, by: s.teams && h.status === 'won' ? s.turn : null });
      if (h.status === 'won') s.solved++;
      s.index++; s.current = null;
      if (s.teams) s.turn = (s.turn + 1) % s.teams.list.length;   // the next word starts with the next team
      return true;
    },
    done: (s) => s.index >= s.total
  };

  // ── 5. Category sorting ──
  /** opts.teams: team names → teams take turns placing one card each (instant feedback). */
  function createSorting(set, rng, opts = {}) {
    const items = shuffle((set.items || []).map((it) => ({ id: it.id, text: it.text, cat: it.cat, place: null, locked: false, mark: null, tries: 0 })), rng);
    return { categories: set.categories || [], items, checks: 0, done: false, mistakes: 0, streak: 0, bestStreak: 0,
      teams: opts.teams && opts.teams.length ? createTeams(opts.teams) : null, turn: 0 };
  }
  const sorting = {
    /** Move an item to a category id, or to the pool (null). Locked (correct) items stay put. */
    place(s, itemId, catId) {
      const it = s.items.find((x) => x.id === itemId);
      if (!it || it.locked) return false;
      if (catId !== null && !s.categories.some((c) => c.id === catId)) return false;
      it.place = catId; it.mark = null;
      return true;
    },
    /** Rule: correct cards lock in place; incorrect cards go back to the pool marked ✗. */
    check(s) {
      const placed = s.items.filter((it) => !it.locked && it.place !== null);
      if (!placed.length) return { checked: 0, correct: 0, wrong: 0 };
      s.checks++;
      let correct = 0, wrong = 0;
      placed.forEach((it) => {
        it.tries++;
        if (it.place === it.cat) { it.locked = true; it.mark = 'correct'; correct++; }
        else { it.place = null; it.mark = 'wrong'; wrong++; s.mistakes++; }
      });
      s.done = s.items.every((it) => it.locked);
      return { checked: placed.length, correct, wrong };
    },
    /**
     * Instant mode: the card is judged as soon as it is dropped. Returns 'correct' | 'wrong' | 'ignored'
     * and, in team play, the points scored (1 for a correct card); the turn then passes on.
     */
    drop(s, itemId, catId) {
      const it = s.items.find((x) => x.id === itemId);
      if (!it || it.locked || s.done || !s.categories.some((c) => c.id === catId)) return { result: 'ignored', points: 0 };
      it.tries++;
      let result, points = 0;
      if (it.cat === catId) {
        it.place = catId; it.locked = true; it.mark = 'correct'; result = 'correct';
        s.streak++; s.bestStreak = Math.max(s.bestStreak, s.streak);
        if (s.teams) { points = 1; s.teams.award(s.turn, 1); }
      } else {
        it.place = null; it.mark = 'wrong'; result = 'wrong'; s.mistakes++; s.streak = 0;
      }
      if (s.teams) s.turn = (s.turn + 1) % s.teams.list.length;
      s.done = s.items.every((x) => x.locked);
      return { result, points };
    },
    score: (s) => ({ correct: s.items.filter((it) => it.locked).length, total: s.items.length }),
    /** Share of cards placed correctly at the first try (0–100). */
    firstTry: (s) => { const done = s.items.filter((it) => it.locked); return done.length ? Math.round((done.filter((it) => it.tries === 1).length / s.items.length) * 100) : 0; },
    stars: (s) => { const f = sorting.firstTry(s); return f >= 90 ? 3 : f >= 65 ? 2 : 1; }
  };

  /**
   * Clean a teacher-made card set: { title, categories: [{ name, items: [text] }] } →
   * { set: { id, title, categories:[{id,name}], items:[{id,text,cat}] } | null, errors }.
   * 2–5 groups, 4–40 cards, no card text used twice. Never throws.
   */
  function normalizeSortSet(raw, { maxCats = 5, maxItems = 40 } = {}) {
    const errors = [];
    const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
    if (!raw || !Array.isArray(raw.categories)) return { set: null, errors: ['No groups found.'] };
    const title = str(raw.title, 40) || 'My card set';
    const totalCards = raw.categories.slice(0, maxCats).reduce((n, c) => n + ((c && c.items) || []).filter((t) => str(typeof t === 'string' ? t : t && t.text, 40)).length, 0);
    if (totalCards > maxItems) return { set: null, errors: [`Use at most ${maxItems} cards in total (this set has ${totalCards}).`] };
    const cats = [], items = [], names = new Set(), texts = new Set();
    raw.categories.slice(0, maxCats).forEach((c, ci) => {
      const name = str(c && c.name, 24);
      const list = ((c && c.items) || []).map((t) => str(typeof t === 'string' ? t : t && t.text, 40)).filter(Boolean);
      if (!name && !list.length) return;
      if (!name) { errors.push(`Group ${ci + 1} needs a name.`); return; }
      if (names.has(normalize(name))) { errors.push(`Two groups are called “${name}”.`); return; }
      names.add(normalize(name));
      const id = 'c' + cats.length;
      cats.push({ id, name });
      list.forEach((text) => {
        if (texts.has(normalize(text))) { errors.push(`The card “${text}” is used twice.`); return; }
        texts.add(normalize(text));
        items.push({ id: 'i' + items.length, text, cat: id });
      });
    });
    if (cats.length < 2) errors.push('Make at least 2 groups.');
    if (items.length < 4) errors.push('Add at least 4 cards in total.');
    const empty = cats.filter((c) => !items.some((it) => it.cat === c.id));
    if (empty.length && cats.length >= 2) errors.push(`Add cards to: ${empty.map((c) => c.name).join(', ')}.`);
    const ok = cats.length >= 2 && items.length >= 4 && !empty.length;
    return { set: ok ? { id: raw.id || 'mine', title, categories: cats, items } : null, errors };
  }

  // ── 6. Sequence / timeline ──
  function createSequence(seq, rng) {
    const steps = (seq.steps || []).map((st) => ({ id: st.id, text: st.text, group: st.same || st.id }));
    let order = shuffle(steps, rng);
    // never start already solved (when there is more than one distinct arrangement)
    for (let i = 0; i < 6 && steps.length > 1 && sequence.correctCount({ steps, order }) === steps.length; i++) order = shuffle(steps, rng);
    return { steps, order, checked: null, revealed: false, checks: 0, hints: 0 };
  }
  const sequence = {
    move(s, from, to) {
      const n = s.order.length;
      if (s.revealed || !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || from >= n || to < 0 || to >= n) return false;
      const [it] = s.order.splice(from, 1);
      s.order.splice(to, 0, it);
      s.checked = null;
      return true;
    },
    /** Identity is the stable id; steps sharing a `same` group are interchangeable (identical labels). */
    correctCount: (s) => s.order.reduce((n, it, i) => n + (it.group === s.steps[i].group ? 1 : 0), 0),
    check(s) {
      const marks = s.order.map((it, i) => it.group === s.steps[i].group);
      s.checked = marks;
      s.checks++;
      return { correct: marks.filter(Boolean).length, total: marks.length, marks };
    },
    solved: (s) => sequence.correctCount(s) === s.steps.length,
    /** Hint: move the right step into the first wrong position. Returns { id, to } or null when nothing is wrong. */
    hint(s) {
      if (s.revealed) return null;
      const i = s.order.findIndex((it, k) => it.group !== s.steps[k].group);
      if (i < 0) return null;
      const j = s.order.findIndex((it, k) => k > i && it.group === s.steps[i].group);
      if (j < 0) return null;
      const id = s.order[j].id;
      sequence.move(s, j, i);
      s.hints++;
      return { id, to: i };
    },
    /** Points for a solved sequence: 10 on the first check, then 7, 5, 3; −2 per hint; at least 1; 0 if revealed. */
    points(s) {
      if (s.revealed) return 0;
      const base = [10, 10, 7, 5][Math.min(s.checks, 3)] || 3;
      return Math.max(1, (s.checks > 3 ? 3 : base) - 2 * s.hints);
    },
    stars: (s) => (s.revealed ? 0 : s.checks <= 1 && !s.hints ? 3 : s.checks <= 2 && s.hints <= 1 ? 2 : 1),
    reveal(s) { s.order = s.steps.slice(); s.revealed = true; s.checked = s.order.map(() => true); },
    reset(s, rng) { const fresh = createSequence({ steps: s.steps.map((st) => ({ id: st.id, text: st.text, same: st.group === st.id ? undefined : st.group })) }, rng); Object.assign(s, fresh); }
  };

  /**
   * Clean a teacher-made sequence: { title, steps: [text] } → { seq: { id, title, steps:[{id,text,same?}] } | null, errors }.
   * 3–12 steps; steps with identical text become interchangeable automatically. Never throws.
   */
  function normalizeSequence(raw, { max = 12 } = {}) {
    const errors = [];
    const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
    if (!raw || !Array.isArray(raw.steps)) return { seq: null, errors: ['No steps found.'] };
    const title = str(raw.title, 40) || 'My sequence';
    const texts = raw.steps.map((t) => str(typeof t === 'string' ? t : t && t.text, 80)).filter(Boolean);
    if (texts.length > max) errors.push(`Use at most ${max} steps (this has ${texts.length}).`);
    if (texts.length < 3) errors.push('Add at least 3 steps.');
    const keys = texts.map((t) => normalize(t));
    if (texts.length && new Set(keys).size === 1) errors.push('The steps cannot all be the same.');
    if (errors.length) return { seq: null, errors };
    const steps = texts.map((text, i) => {
      const dup = keys.filter((k) => k === keys[i]).length > 1;
      return dup ? { id: 's' + i, text, same: 'g:' + keys[i] } : { id: 's' + i, text };
    });
    return { seq: { id: raw.id || 'mine', title, steps }, errors };
  }

  // ── 7. Spot the difference (hotspots in normalised 0–1 coordinates) ──
  function createSpot(scene) {
    return { scene, found: [], misses: 0, hints: 0 };
  }
  const spot = {
    /**
     * nx, ny: tap position normalised to the image (0–1). minR: minimum hit radius in the same
     * normalised units (so touch targets stay usable when the image is small). Returns the hotspot id,
     * 'repeat' or null. Distances use the image aspect so circles stay round.
     */
    tap(s, nx, ny, { aspect = 4 / 3, minR = 0 } = {}) {
      if (![nx, ny].every(Number.isFinite) || nx < 0 || nx > 1 || ny < 0 || ny > 1) return null;
      let best = null, bestD = Infinity;
      for (const h of s.scene.hotspots) {
        const d = Math.hypot((nx - h.x) * aspect, ny - h.y);
        const r = Math.max(h.r, minR);
        if (d <= r && d < bestD) { best = h; bestD = d; }
      }
      if (!best) { s.misses++; return null; }
      if (s.found.includes(best.id)) return 'repeat';
      s.found.push(best.id);
      return best.id;
    },
    /** Hint: the next difference not found yet (counted). */
    hint(s) {
      const h = s.scene.hotspots.find((x) => !s.found.includes(x.id));
      if (!h) return null;
      s.hints++;
      return h;
    },
    done: (s) => s.found.length === s.scene.hotspots.length,
    /** 3 stars: no more than 1 slip (wrong taps + 2 per hint); 2 stars: up to 4; otherwise 1. 0 if unfinished. */
    stars(s) {
      if (!spot.done(s)) return 0;
      const slips = s.misses + 2 * s.hints;
      return slips <= 1 ? 3 : slips <= 4 ? 2 : 1;
    }
  };

  /**
   * Clean a teacher-made picture pair: { title, w, h, imgA, imgB (data:image/… URLs), hotspots:[{x,y,r,label}] }.
   * 1–10 differences inside the picture; returns { scene | null, errors }. Never throws.
   */
  function normalizeSpotScene(raw, { maxSpots = 10, maxImage = 1500000 } = {}) {
    const errors = [];
    if (!raw || typeof raw !== 'object') return { scene: null, errors: ['No picture found.'] };
    const title = String(raw.title || '').replace(/\s+/g, ' ').trim().slice(0, 40) || 'My picture';
    const isImg = (u) => typeof u === 'string' && /^data:image\/(png|jpe?g|webp|gif);base64,/.test(u) && u.length <= maxImage;
    if (!isImg(raw.imgA)) errors.push('Add the first picture (the original).');
    if (!isImg(raw.imgB)) errors.push('Add the second picture (with the differences).');
    const w = Math.round(Number(raw.w)), h = Math.round(Number(raw.h));
    if (!(w > 0 && h > 0)) errors.push('The picture size is missing.');
    const spots = (Array.isArray(raw.hotspots) ? raw.hotspots : []).filter((p) => p && [p.x, p.y, p.r].every(Number.isFinite) && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1);
    if (!spots.length) errors.push('Tap the second picture to mark at least one difference.');
    if (spots.length > maxSpots) errors.push(`Mark at most ${maxSpots} differences.`);
    if (errors.length) return { scene: null, errors };
    return { scene: { id: raw.id || 'my', title, w, h, imgA: raw.imgA, imgB: raw.imgB,
      hotspots: spots.map((p, i) => ({ id: 'd' + i, x: p.x, y: p.y, r: Math.min(0.3, Math.max(0.03, p.r)), label: String(p.label || '').trim().slice(0, 50) || `Difference ${i + 1}` })) }, errors };
  }

  // ── 8. Split-screen race ──
  function createRace({ target = 5, names } = {}) {
    const teams = createTeams(names || ['Team A', 'Team B']);
    return { teams, target, round: 1, over: false, stats: teams.list.map(() => ({ right: 0, wrong: 0, best: null, streak: 0, bestStreak: 0 })) };
  }
  const race = {
    /** A point for a team; `ms` (optional) is how long the correct answer took. */
    award(s, teamId, ms) {
      if (s.over || !s.teams.award(teamId, 1)) return false;
      const st = s.stats && s.stats[teamId];
      if (st) {
        st.right++; st.streak++; st.bestStreak = Math.max(st.bestStreak, st.streak);
        if (Number.isFinite(ms) && ms >= 0 && (st.best === null || ms < st.best)) st.best = ms;
      }
      if (s.teams.list[teamId].score >= s.target) s.over = true;
      return true;
    },
    /** A wrong answer (no points lost; breaks the streak). */
    miss(s, teamId) {
      const st = s.stats && s.stats[teamId];
      if (s.over || !st) return false;
      st.wrong++; st.streak = 0;
      return true;
    },
    next(s) { if (s.over) return false; s.round++; return true; },
    end(s) { s.over = true; },
    outcome(s) {
      const leaders = s.teams.leaders();
      return leaders.length > 1 ? { tie: true, teams: leaders } : { tie: false, winner: leaders[0] };
    },
    reset(s) { s.teams.reset(); s.round = 1; s.over = false; if (s.stats) s.stats.forEach((st) => Object.assign(st, { right: 0, wrong: 0, best: null, streak: 0, bestStreak: 0 })); }
  };

  /**
   * Quick arithmetic for Board Race, generated on the fly (no curriculum claims).
   * ops: any of '+', '-', 'x', '/'; level: easy | medium | hard. Answers are whole numbers ≥ 0 and
   * division is always exact. Also returns 3 nearby wrong options for multiple choice.
   */
  const MATH_RANGES = { easy: { add: [1, 20], mul: [2, 5] }, medium: { add: [10, 99], mul: [2, 12] }, hard: { add: [100, 999], mul: [6, 25] } };
  function makeMathQuestion(rng, { ops = ['+', '-', 'x', '/'], level = 'medium' } = {}) {
    const r = rng || createRng();
    const R = MATH_RANGES[level] || MATH_RANGES.medium;
    const list = (Array.isArray(ops) ? ops : []).filter((o) => ['+', '-', 'x', '/'].includes(o));
    const op = (list.length ? list : ['+'])[r.int(0, (list.length || 1) - 1)];
    let text, a, step;
    if (op === '+') { const x = r.int(...R.add), y = r.int(...R.add); text = `${x} + ${y}`; a = x + y; step = 10; }
    else if (op === '-') { let x = r.int(...R.add), y = r.int(...R.add); if (y > x) [x, y] = [y, x]; text = `${x} − ${y}`; a = x - y; step = 10; }
    else if (op === 'x') { const x = r.int(...R.mul), y = r.int(...R.mul); text = `${x} × ${y}`; a = x * y; step = Math.min(x, y); }
    else { const y = r.int(...R.mul), q = r.int(...R.mul); text = `${y * q} ÷ ${y}`; a = q; step = 2; }
    // believable wrong options: off by one, off by the step, digits swapped
    const cand = [a + 1, a - 1, a + step, a - step, a + 2, a - 2, Number(String(a).split('').reverse().join('')), a + 10, a - 10];
    const wrong = [];
    for (const c of shuffle(cand, r)) if (Number.isInteger(c) && c >= 0 && c !== a && !wrong.includes(c) && wrong.length < 3) wrong.push(c);
    for (let k = 3; wrong.length < 3; k++) if (!wrong.includes(a + k)) wrong.push(a + k);
    return { q: `${text} = ?`, a: String(a), choices: wrong.map(String), numeric: true, op };
  }
  /** Does a typed answer match? Numbers compare by value (spaces, commas and “−” allowed); text ignores case and spacing. */
  function sameAnswer(given, answer) {
    const num = (v) => { const t = String(v == null ? '' : v).replace(/[\s,]/g, '').replace(/−/g, '-'); return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null; };
    const x = num(given), y = num(answer);
    if (x !== null && y !== null) return x === y;
    return normalize(given) !== '' && normalize(given) === normalize(answer);
  }

  // ── 9. Turn-based board game ──
  /** def: { length, specials: { [space]: 'question' | 'boost' | 'slip' }, boost, slip } */
  function createBoardGame(def, playerNames, rng) {
    return {
      def, rng: rng || createRng(),
      players: (playerNames || ['Player 1', 'Player 2']).map((name, id) => ({ id, name, pos: 0, right: 0, wrong: 0 })),
      turn: 0, pending: null, winner: null, lastRoll: null, log: []
    };
  }
  const board = {
    /** Rolls 1–6 and moves the active player. Overshooting the finish stops on the finish (and wins). */
    roll(s) {
      if (s.winner !== null || s.pending) return null;
      const p = s.players[s.turn];
      const value = s.rng.int(1, 6);
      const last = s.def.length - 1;
      const from = p.pos;
      let to = Math.min(last, from + value);
      p.pos = to;
      s.lastRoll = value;
      const event = { player: p.id, value, from, to, effect: null };
      if (to === last) { s.winner = p.id; event.effect = 'finish'; return event; }
      const special = s.def.specials[to];
      if (special === 'question') { s.pending = { player: p.id, from, to }; event.effect = 'question'; return event; }
      if (special === 'boost') { p.pos = Math.min(last, to + s.def.boost); event.effect = 'boost'; event.to = p.pos; }
      if (special === 'slip') { p.pos = Math.max(0, to - s.def.slip); event.effect = 'slip'; event.to = p.pos; }
      if (p.pos === last) { s.winner = p.id; event.effect = 'finish'; return event; }
      if (special === 'again') { event.effect = 'again'; return event; }   // same player rolls again
      s.turn = (s.turn + 1) % s.players.length;
      return event;
    },
    /** Question space: correct → bonus spaces forward; incorrect → back to where the move started. */
    answer(s, correct) {
      if (!s.pending) return null;
      const p = s.players[s.pending.player];
      const last = s.def.length - 1;
      p.pos = correct ? Math.min(last, s.pending.to + s.def.bonus) : s.pending.from;
      if (correct) p.right = (p.right || 0) + 1; else p.wrong = (p.wrong || 0) + 1;
      const res = { player: p.id, correct: !!correct, to: p.pos };
      s.pending = null;
      if (p.pos === last) { s.winner = p.id; res.effect = 'finish'; return res; }
      s.turn = (s.turn + 1) % s.players.length;
      return res;
    },
    /** Places: the winner first, then by position on the path, then by correct answers. */
    ranking(s) {
      return s.players.slice().sort((a, b) => (b.id === s.winner) - (a.id === s.winner) || b.pos - a.pos || (b.right || 0) - (a.right || 0));
    },
    restart(s) { s.players.forEach((p) => { p.pos = 0; p.right = 0; p.wrong = 0; }); s.turn = 0; s.pending = null; s.winner = null; s.lastRoll = null; }
  };

  /**
   * Board layout for a path of `length` spaces (16–48): a question about every 4th space and a few
   * boosts, slips and roll-again spaces. Deterministic, never on Start/Finish, one effect per space.
   */
  function makeBoardDef(length = 30, { boost = 2, slip = 2, bonus = 1 } = {}) {
    const L = Math.max(16, Math.min(48, Math.round(Number(length)) || 30));
    const specials = {};
    for (let i = 3; i < L - 1; i++) {
      if (i % 4 === 0) specials[i] = 'question';
      else if (i % 9 === 7) specials[i] = 'boost';
      else if (i % 10 === 1 && i > 5) specials[i] = 'slip';
      else if (i % 13 === 10) specials[i] = 'again';
    }
    // a boost or slip always lands on a plain space (effects never chain)
    for (const [k, v] of Object.entries(specials)) {
      const to = v === 'boost' ? +k + boost : v === 'slip' ? +k - slip : null;
      if (to !== null && (specials[to] || to >= L - 1 || to <= 0)) delete specials[k];
    }
    return { length: L, specials, boost, slip, bonus };
  }

  /**
   * Teacher question set for Quiz Path. Accepts { title, questions:[{q,a,choices?}] } or { title, text } where each
   * line is  Question | Answer | wrong option ; wrong option ; wrong option  (wrong options are optional:
   * with 1–3 of them the question is multiple choice, otherwise the teacher judges the spoken answer).
   * 3–60 questions. Returns { set: { title, questions } | null, errors } and never throws.
   */
  function normalizeQuizPathSet(raw, { min = 3, max = 60 } = {}) {
    const errors = [];
    if (!raw || typeof raw !== 'object') return { set: null, errors: ['No questions found.'] };
    const clean = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
    const title = clean(raw.title, 40) || 'My questions';
    let items = Array.isArray(raw.questions) ? raw.questions.map((x, i) => ({ line: i + 1, q: x && x.q, a: x && x.a, choices: x && x.choices })) : [];
    if (!items.length && typeof raw.text === 'string') {
      items = raw.text.split(/\r?\n/).map((ln, i) => ({ ln: ln.trim(), line: i + 1 })).filter((x) => x.ln).map(({ ln, line }) => {
        const [q, a, rest] = ln.split('|');
        return { line, q, a, choices: rest ? rest.split(';') : [] };
      });
    }
    const questions = [];
    for (const it of items) {
      const q = clean(it.q, 160), a = clean(it.a, 60);
      if (!q && !a) continue;
      if (!q || !a) { errors.push(`Line ${it.line}: write the question, then | and the answer.`); continue; }
      const seen = new Set([normalize(a)]);
      const wrong = [];
      for (const c of Array.isArray(it.choices) ? it.choices : []) {
        const w = clean(c, 60);
        if (!w || seen.has(normalize(w))) continue;
        seen.add(normalize(w)); wrong.push(w);
      }
      if (wrong.length > 3) errors.push(`Line ${it.line}: only the first 3 wrong options are used.`);
      questions.push(wrong.length ? { q, a, choices: wrong.slice(0, 3) } : { q, a });
    }
    if (questions.length < min) errors.push(`Write at least ${min} questions (one per line).`);
    if (questions.length > max) errors.push(`Use at most ${max} questions.`);
    const blocking = questions.length < min || questions.length > max || errors.some((e) => /write the question/.test(e));
    return { set: blocking ? null : { title, questions }, errors };
  }

  // ── 3b. Draw & Guess (Pictionary) ──
  function editDistance(a, b) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 3) return 99;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  const isLetterChar = (ch) => /[\p{L}\p{N}]/u.test(ch);
  const pictionary = {
    /** A typed guess is correct when it matches the prompt ignoring case/extra spaces. */
    isCorrectGuess: (guess, prompt) => normalize(guess) !== '' && normalize(guess) === normalize(prompt),
    /** "So close!": one typo away (two for longer words), but not correct. */
    isClose(guess, prompt) {
      const g = normalize(guess), w = normalize(prompt);
      if (!g || !w || g === w) return false;
      return editDistance(g, w) <= (w.length > 6 ? 2 : 1);
    },
    deck: (prompts, rng) => shuffle((prompts || []).map((p) => String(p).trim()).filter(Boolean), rng),
    /** Letters shown as hints: shown indexes keep their letter, other letters become '_', spaces/punctuation stay. */
    mask: (word, shown = []) => [...String(word || '')].map((ch, i) => (!isLetterChar(ch) ? ch : shown.includes(i) ? ch : '_')),
    /** Order in which letters are revealed as hints (random, letters only, at most a third of them). */
    revealOrder(word, rng) {
      const idx = [...String(word || '')].map((ch, i) => (isLetterChar(ch) ? i : -1)).filter((i) => i >= 0);
      return shuffle(idx, rng).slice(0, Math.floor(idx.length / 3));
    },
    /** Speed points: 3 if guessed in the first third of the time, 2 in the second, 1 after that. */
    points(left, total) {
      if (!(total > 0)) return 1;
      const f = Math.max(0, Math.min(1, left / total));
      return f > 2 / 3 ? 3 : f > 1 / 3 ? 2 : 1;
    }
  };

  /**
   * A Draw & Guess game. teamNames → teams take turns drawing (`rounds` turns each);
   * without teams the whole class plays `rounds` words. Words: [{ word, hint? }].
   */
  function createDrawGame(words, teamNames, { rounds = 3, rng } = {}) {
    const r = rng || createRng();
    const teams = teamNames && teamNames.length ? createTeams(teamNames) : null;
    const total = Math.max(1, Math.round(rounds)) * (teams ? teams.list.length : 1);
    const list = (words || []).filter((w) => w && String(w.word || '').trim());
    return { teams, total, round: 0, deck: shuffle(list, r), used: 0, rng: r, classScore: 0, history: [] };
  }
  const drawGame = {
    drawer: (s) => (s.teams ? s.round % s.teams.list.length : null),
    /** The word for this round (reshuffles the list if it runs out). */
    word(s) {
      if (!s.deck.length) return null;
      if (s.used >= s.deck.length) { s.deck = shuffle(s.deck, s.rng); s.used = 0; }
      return s.deck[s.used];
    },
    /** End the round. guessedBy: team id, 'class', or null (nobody). */
    finish(s, { guessedBy = null, points = 0, word = null, image = null } = {}) {
      if (drawGame.done(s)) return false;
      if (guessedBy === 'class') s.classScore += 1;
      else if (guessedBy !== null && s.teams) { if (!s.teams.award(guessedBy, points)) return false; }
      s.history.push({ round: s.round, drawer: drawGame.drawer(s), word: word || (drawGame.word(s) || {}).word, guessedBy, points, image });
      s.round++; s.used++;
      return true;
    },
    skip(s) { s.used++; },
    done: (s) => s.round >= s.total
  };

  /** Clean a teacher word list: [{ word, hint }] or plain strings. Dedupes (case-insensitive). Never throws. */
  function normalizeWordList(raw, { max = 200 } = {}) {
    const errors = [];
    const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
    const list = raw && Array.isArray(raw.words) ? raw.words : (Array.isArray(raw) ? raw : null);
    if (!list) return { words: [], errors: ['No words found.'] };
    const out = [], seen = new Set();
    list.forEach((w) => {
      if (out.length >= max) return;
      const word = str(typeof w === 'string' ? w : w && w.word, 40);
      const hint = str(typeof w === 'string' ? '' : w && w.hint, 60);
      if (!word) return;
      const k = normalize(word);
      if (seen.has(k)) { errors.push(`“${word}” is in the list twice.`); return; }
      seen.add(k);
      out.push(hint ? { word, hint } : { word });
    });
    if (out.length < 3) errors.push('Add at least 3 words.');
    return { words: out.length >= 3 ? out : [], errors };
  }

  return {
    createRng, shuffle, normalize, createLifecycle, createCountdown, createTeams, TRANSITIONS,
    createTrivia, trivia, normalizeTriviaSet, createMemory, memory, normalizePairSet, createHangman, hangman, createWordGame, wordGame,
    createSorting, sorting, normalizeSortSet, createSequence, sequence, normalizeSequence, createSpot, spot, normalizeSpotScene,
    createRace, race, makeMathQuestion, sameAnswer, createBoardGame, board, makeBoardDef, normalizeQuizPathSet, pictionary, createDrawGame, drawGame, normalizeWordList
  };
});
