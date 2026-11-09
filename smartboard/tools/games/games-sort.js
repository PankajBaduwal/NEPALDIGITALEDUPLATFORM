'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — CATEGORY SORT
// • Sample card sets or any number of the teacher's own sets (2–5 groups, up to 40 cards),
//   saved on this device, import/export .json
// • Instant feedback (each card judged as it lands) or "check at the end"
// • Whole class or 2–6 teams taking turns (one card each, +1 for a correct card)
// • Optional beat-the-clock timer, streaks, star rating and a review of every group at the end
// • Drag with finger / pen / mouse, or tap a card then tap a group (also works with the keyboard)
// Rules live in GameEngine.sorting; this file is only the screens.
// ═══════════════════════════════════════════════════════════
(() => {
  if (typeof GamesHub === 'undefined') return;
  const { h, hitEl } = GamesHub;

  const SETTINGS_KEY = 'gm_sort_settings_v1';
  const SETS_KEY = 'gm_sort_sets_v1';
  const TEAM_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];
  const GROUP_COLORS = ['#0ea5e9', '#f59e0b', '#a855f7', '#22c55e', '#f43f5e'];
  const DEFAULT_NAMES = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'];

  const store = {
    get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  function chips(label, options, value, onChange) {
    const wrap = h('div', { class: 'gm-choice', role: 'group', 'aria-label': label }, [h('span', { class: 'gm-choice-label', text: label })]);
    options.forEach((o, i) => wrap.appendChild(h('button', {
      type: 'button', class: 'gm-chip', 'aria-pressed': String(o.value === value), text: o.label,
      on: { click: () => { wrap.querySelectorAll('.gm-chip').forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); onChange(o.value); } }
    })));
    return wrap;
  }

  GamesHub.register('sorting', (ctx) => {
    const { E, C, session } = ctx;
    const S = E.sorting;
    const saved = store.get(SETTINGS_KEY) || {};
    const cfg = {
      mode: saved.mode === 'teams' ? 'teams' : 'class',
      names: Array.isArray(saved.names) && saved.names.length >= 2 ? saved.names.slice(0, 6).map((n, i) => String(n || DEFAULT_NAMES[i]).slice(0, 24)) : DEFAULT_NAMES.slice(0, 2),
      check: saved.check === 'end' ? 'end' : 'instant',
      timer: [0, 60, 90, 120].includes(saved.timer) ? saved.timer : 0,
      sound: saved.sound !== false,
      setId: typeof saved.setId === 'string' ? saved.setId : C.sorting[0].id
    };
    let s = null, set = null, selected = null, drag = null, root = null, timer = null, clock = null, elapsed = 0, audio = null, shakeId = null;

    const mySets = () => {
      const raw = store.get(SETS_KEY);
      return (Array.isArray(raw) ? raw : []).map((r) => { const n = E.normalizeSortSet(r); return n.set ? Object.assign(n.set, { id: r.id, raw: r }) : null; }).filter(Boolean);
    };
    const allSets = () => C.sorting.concat(mySets());
    const findSet = (id) => allSets().find((x) => x.id === id) || C.sorting[0];
    const isMine = (id) => String(id).startsWith('my-');
    const saveCfg = () => store.set(SETTINGS_KEY, cfg);
    const color = (id) => TEAM_COLORS[id % TEAM_COLORS.length];
    const gColor = (catId) => GROUP_COLORS[Math.max(0, set.categories.findIndex((c) => c.id === catId)) % GROUP_COLORS.length];
    const instant = () => cfg.check === 'instant' || cfg.mode === 'teams';

    ctx.setHelp([
      'Drag each card into the group it belongs to — or tap a card, then tap a group.',
      'Instant feedback: a right card locks in with ✓, a wrong one bounces back with ✗. “Check at the end”: place them all, then press Check answers.',
      'Teams take turns placing one card each: +1 point for every correct card.',
      'Keyboard: Tab to a card and press Enter to pick it up, then Tab to a group’s “Place here” button and press Enter.',
      'Teachers: “+ New card set” lets you type your own groups and cards; they are saved on this device.'
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
      s = null;
      ctx.setPhase('idle'); ctx.setHud([]);
      if (!allSets().some((x) => x.id === cfg.setId)) cfg.setId = C.sorting[0].id;
      const cur = findSet(cfg.setId);

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
        names, h('p', { class: 'gm-note', text: 'Teams take turns placing one card; feedback is instant.' })
      ]);
      const checkBox = h('div', { hidden: cfg.mode === 'teams' }, [chips('Checking', [{ value: 'instant', label: '✅ Instant feedback' }, { value: 'end', label: '📝 Check at the end' }], cfg.check, (v) => { cfg.check = v; saveCfg(); })]);
      const left = h('section', { class: 'gm-setup-col', 'aria-label': 'Players' }, [
        chips('Players', [{ value: 'class', label: '👥 Whole class' }, { value: 'teams', label: '🏁 Teams' }], cfg.mode, (v) => { cfg.mode = v; saveCfg(); teamBox.hidden = v !== 'teams'; checkBox.hidden = v === 'teams'; }),
        teamBox, checkBox
      ]);
      const right = h('section', { class: 'gm-setup-col', 'aria-label': 'Game settings' }, [
        chips('Card set', allSets().map((x) => ({ value: x.id, label: (isMine(x.id) ? '⭐ ' : '') + x.title })), cfg.setId, (v) => { cfg.setId = v; saveCfg(); setup(); }),
        h('div', { class: 'gm-row' }, [
          h('span', { class: 'gm-note', text: `${cur.categories.length} groups · ${cur.items.length} cards: ${cur.categories.map((c) => c.name).join(', ')}` })
        ]),
        h('div', { class: 'gm-row' }, [
          h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-new': '', text: '+ New card set', on: { click: () => editor(null) } }),
          isMine(cur.id) ? h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-edit': '', text: '✎ Edit this set', on: { click: () => editor(cur) } }) : h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-copy': '', text: '⧉ Copy & edit', on: { click: () => editor(cur, true) } }),
          isMine(cur.id) ? h('button', { type: 'button', class: 'gm-btn gm-ghost', 'data-delete': '', text: '🗑 Delete', on: { click: async () => {
            if (!(await ctx.confirm({ title: `Delete “${cur.title}”?`, text: 'This card set will be removed from this device.', ok: 'Delete', danger: true }))) return;
            store.set(SETS_KEY, (store.get(SETS_KEY) || []).filter((r) => r.id !== cur.id));
            cfg.setId = C.sorting[0].id; saveCfg(); setup();
          } } }) : null
        ]),
        chips('Timer', [{ value: 0, label: '😌 Off' }, { value: 60, label: '⏱ 60 s' }, { value: 90, label: '⏱ 90 s' }, { value: 120, label: '⏱ 120 s' }], cfg.timer, (v) => { cfg.timer = v; saveCfg(); }),
        chips('Sound', [{ value: true, label: 'On' }, { value: false, label: 'Off' }], cfg.sound, (v) => { cfg.sound = v; saveCfg(); })
      ]);
      ctx.body.replaceChildren(h('div', { class: 'gm-setup gm-setup-wide' }, [
        h('h3', { text: 'Category Sort' }),
        h('p', { text: 'Drag every card into the right group — as a class or team against team.' }),
        h('div', { class: 'gm-setup-2col' }, [left, right]),
        isMine(cur.id) ? null : h('p', { class: 'gm-sample', text: C.LABEL + '.' }),
        h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-startgame': '', text: '▶ Start', on: { click: start } })
      ]));
    }

    // ════════ CARD SET EDITOR ════════
    function editor(base, copy) {
      stopClocks();
      ctx.setPhase('idle'); ctx.setHud([]);
      const editingId = base && isMine(base.id) && !copy ? base.id : null;
      let title = base ? (copy ? `${base.title} (copy)` : base.title) : '';
      let groups = base ? base.categories.map((c) => ({ name: c.name, text: base.items.filter((it) => it.cat === c.id).map((it) => it.text).join('\n') }))
        : [{ name: '', text: '' }, { name: '', text: '' }];
      const errorsEl = h('div', { class: 'gm-editor-errors', role: 'alert' });
      const body = h('div', { class: 'gm-editor-body' });
      const fileIn = h('input', { type: 'file', accept: '.json,application/json', hidden: true });
      const titleIn = h('input', { type: 'text', class: 'gm-input gm-set-title', maxlength: '40', placeholder: 'Name of this card set (e.g. Fractions or decimals?)', value: title, 'aria-label': 'Card set name', on: { input: (e) => { title = e.target.value; } } });
      const addGroup = h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '+ Add group', on: { click: () => { if (groups.length < 5) { groups.push({ name: '', text: '' }); draw(); body.lastChild?.querySelector('input')?.focus(); } } } });
      const toRaw = () => ({ title, categories: groups.map((g) => ({ name: g.name, items: g.text.split(/\r?\n/) })) });
      function draw() {
        body.replaceChildren(...groups.map((g, gi) => h('section', { class: 'gm-ed-cat', style: `--group:${GROUP_COLORS[gi % GROUP_COLORS.length]}`, 'aria-label': `Group ${gi + 1}` }, [
          h('div', { class: 'gm-ed-cat-head' }, [
            h('input', { type: 'text', class: 'gm-input gm-ed-catname gm-ed-group', maxlength: '24', placeholder: `Group ${gi + 1} name`, value: g.name, 'aria-label': `Group ${gi + 1} name`, on: { input: (e) => { g.name = e.target.value; } } }),
            h('button', { type: 'button', class: 'gm-btn gm-mini gm-ghost', 'aria-label': `Remove group ${gi + 1}`, text: '🗑', on: { click: () => { if (groups.length <= 2) { ctx.toast('Keep at least 2 groups'); return; } groups.splice(gi, 1); draw(); } } })
          ]),
          h('textarea', { class: 'gm-textarea gm-ed-cards', rows: '8', maxlength: '1600', placeholder: 'Cards in this group —\none per line', 'aria-label': `Cards in group ${gi + 1}, one per line`, on: { input: (e) => { g.text = e.target.value; } } })
        ])));
        body.querySelectorAll('.gm-ed-cards').forEach((ta, gi) => { ta.value = groups[gi].text; });
        addGroup.disabled = groups.length >= 5;
      }
      function save() {
        const raw = toRaw();
        const n = E.normalizeSortSet(raw);
        errorsEl.replaceChildren(...n.errors.slice(0, 4).map((m) => h('p', { text: '⚠ ' + m })));
        if (!n.set || n.errors.length) { ctx.toast('Please fix the points above, then save'); return; }
        const list = (store.get(SETS_KEY) || []).filter((r) => r.id !== editingId);
        const id = editingId || `my-${Date.now().toString(36)}`;
        list.push({ id, title: n.set.title, categories: n.set.categories.map((c) => ({ name: c.name, items: n.set.items.filter((it) => it.cat === c.id).map((it) => it.text) })) });
        if (!store.set(SETS_KEY, list)) { ctx.toast('Could not save on this device (storage is blocked)'); return; }
        cfg.setId = id; saveCfg();
        ctx.toast(`Saved “${n.set.title}” — ${n.set.items.length} cards in ${n.set.categories.length} groups`);
        setup();
      }
      fileIn.addEventListener('change', () => {
        const f = fileIn.files && fileIn.files[0];
        if (!f) return;
        if (f.size > 200000) { ctx.toast('That file is too large for a card set'); return; }
        const rd = new FileReader();
        rd.onload = () => {
          let parsed = null;
          try { parsed = JSON.parse(String(rd.result)); } catch (e) { ctx.toast('That file is not a valid card set (.json)'); return; }
          const n = E.normalizeSortSet(parsed);
          if (!n.set) { ctx.toast('No usable card set found in that file'); return; }
          title = n.set.title; titleIn.value = title;
          groups = n.set.categories.map((c) => ({ name: c.name, text: n.set.items.filter((it) => it.cat === c.id).map((it) => it.text).join('\n') }));
          draw();
          ctx.toast('Imported — press Save to keep it');
        };
        rd.readAsText(f);
        fileIn.value = '';
      });
      function exportSet() {
        const n = E.normalizeSortSet(toRaw());
        if (!n.set) { ctx.toast('Finish the set before exporting'); return; }
        const out = { app: 'PiyushDhara Category Sort', version: 1, title: n.set.title, categories: n.set.categories.map((c) => ({ name: c.name, items: n.set.items.filter((it) => it.cat === c.id).map((it) => it.text) })) };
        const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: 'category-sort-set.json' });
        document.body.appendChild(a); a.click(); a.remove();
        session.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }
      ctx.body.replaceChildren(h('div', { class: 'gm-editor' }, [
        h('div', { class: 'gm-editor-head' }, [
          h('h3', { text: editingId ? '✎ Edit card set' : '✎ New card set' }),
          h('div', { class: 'gm-row' }, [
            addGroup,
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '📂 Import', on: { click: () => fileIn.click() } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: '💾 Export', on: { click: exportSet } }),
            h('button', { type: 'button', class: 'gm-btn gm-ghost', text: 'Cancel', on: { click: setup } }),
            h('button', { type: 'button', class: 'gm-btn gm-primary', 'data-save': '', text: '✔ Save set', on: { click: save } })
          ])
        ]),
        titleIn,
        h('p', { class: 'gm-note', text: '2–5 groups, 4–40 cards. Type one card per line under its group. Saved on this device only.' }),
        errorsEl, body, fileIn
      ]));
      draw();
      titleIn.focus();
    }

    // ════════ GAME ════════
    function start() {
      stopClocks();
      set = findSet(cfg.setId);
      const teams = cfg.mode === 'teams' ? cfg.names.map((x, i) => (x || '').trim() || DEFAULT_NAMES[i]) : null;
      if (teams) { cfg.names = teams.slice(); saveCfg(); }
      s = E.createSorting(set, ctx.rng, { teams });
      selected = null; elapsed = 0;
      ctx.setPhase('playing');
      root = h('div', { class: 'gm-sort' });
      ctx.body.replaceChildren(root);
      drag = ctx.delegateDrag(root, '.gm-card-item', {
        onStart: () => { selected = null; root.querySelectorAll('.gm-zone').forEach((z) => z.classList.add('gm-droppable')); },
        onMove: (el, x, y) => root.querySelectorAll('.gm-zone').forEach((z) => z.classList.toggle('gm-over', hitEl(z, x, y))),
        onDrop: (el, x, y, cancelled) => {
          const id = el.dataset.item;
          root.querySelectorAll('.gm-zone').forEach((z) => z.classList.remove('gm-droppable', 'gm-over'));
          if (!cancelled) {
            const zone = [...root.querySelectorAll('.gm-zone')].find((z) => hitEl(z, x, y));
            if (zone) { put(id, zone.dataset.cat === '' ? null : zone.dataset.cat); return; }
          }
          render();   // dropped anywhere else: the card simply returns
        }
      });
      if (cfg.timer) {
        timer = session.countdown(cfg.timer, { onTick: (l) => { const t = document.querySelector('[data-timer]'); if (t) { t.textContent = `⏱ ${fmtTime(l)}`; t.classList.toggle('is-low', l <= 10); } if (l > 0 && l <= 5) tone([880], 0.05); }, onEnd: () => { timer = null; finish(true); } });
        timer.start();
      } else {
        clock = session.setInterval(() => { elapsed++; const t = document.querySelector('[data-timer]'); if (t) t.textContent = `⏱ ${fmtTime(elapsed)}`; }, 1000);
      }
      render();
    }

    /** Place a card in a group (or the pool). Instant mode judges it right away. */
    function put(id, catId) {
      if (!instant() || catId === null) {
        if (S.place(s, id, catId)) { selected = null; render(); focusItem(id); }
        return;
      }
      const it = s.items.find((x) => x.id === id);
      const who = s.teams ? s.teams.list[s.turn].name : null;
      const { result } = S.drop(s, id, catId);
      if (result === 'ignored') { render(); return; }
      selected = null;
      const groupName = set.categories.find((c) => c.id === catId).name;
      if (result === 'correct') {
        tone([660, 880], 0.08);
        ctx.announce(`${it.text} is correct${who ? `, ${who} +1` : ''}`);
        if (s.streak >= 3 && !s.teams) ctx.toast(`🔥 ${s.streak} in a row!`);
        else if (who) ctx.toast(`✓ ${who} +1 — ${s.teams.list[s.turn].name}'s turn`);
      } else {
        tone([300, 220], 0.1);
        shakeId = id;
        ctx.announce(`${it.text} is not ${groupName}`);
        ctx.toast(`✗ “${it.text}” is not ${groupName}${who ? ` — ${s.teams.list[s.turn].name}'s turn` : ' — try again'}`);
      }
      render();
      if (s.done) finish(false);
    }
    function focusItem(id) { root.querySelector(`[data-item="${id}"]`)?.focus({ preventScroll: true }); }

    function hud() {
      const sc = S.score(s);
      ctx.setHud([
        h('span', { class: 'gm-pill gm-timer', 'data-timer': '', text: `⏱ ${fmtTime(timer ? timer.left : elapsed)}` }),
        h('span', { class: 'gm-pill', text: `✓ ${sc.correct}/${sc.total}` }),
        h('span', { class: 'gm-pill', text: `✗ ${s.mistakes}` }),
        s.streak >= 2 && !s.teams ? h('span', { class: 'gm-pill gm-streak', text: `🔥 ${s.streak}` }) : null
      ]);
    }

    function card(it) {
      const status = it.locked ? 'Correct' : it.mark === 'wrong' ? 'Try again' : '';
      return h('button', {
        type: 'button', class: 'gm-card-item' + (it.locked ? ' is-correct' : '') + (it.mark === 'wrong' ? ' is-wrong' : '') + (selected === it.id ? ' is-selected' : '') + (shakeId === it.id ? ' is-shake' : ''),
        style: it.locked ? `--group:${gColor(it.cat)}` : null,
        'data-item': it.id, 'aria-pressed': String(selected === it.id), 'aria-disabled': String(it.locked),
        'aria-label': `${it.text}${status ? ', ' + status : ''}${selected === it.id ? ', picked up' : ''}`,
        on: { click: (e) => { if (drag.justDragged(e.currentTarget) || it.locked) return; selected = selected === it.id ? null : it.id; render(); focusItem(it.id); } }
      }, [it.text, it.locked ? h('span', { class: 'gm-mark', text: ' ✓' }) : it.mark === 'wrong' ? h('span', { class: 'gm-mark', text: ' ✗' }) : null]);
    }
    function zone(cat, items, label) {
      const catId = cat ? cat.id : '';
      return h('section', { class: 'gm-zone' + (cat ? '' : ' gm-pool'), style: cat ? `--group:${gColor(cat.id)}` : null, 'data-cat': catId, 'aria-label': label,
        on: { click: (e) => { if (selected && !e.target.closest('.gm-card-item')) put(selected, cat ? cat.id : null); } } }, [
        h('div', { class: 'gm-zone-head' }, [h('h3', { text: label }), h('span', { class: 'gm-count', text: String(items.length) }),
          selected && (cat || !instant()) ? h('button', { type: 'button', class: 'gm-btn gm-mini gm-primary', 'data-place': catId, text: 'Place here', on: { click: (e) => { e.stopPropagation(); put(selected, cat ? cat.id : null); } } }) : null]),
        h('div', { class: 'gm-zone-items' }, items.map(card))
      ]);
    }
    function render() {
      hud();
      const pool = s.items.filter((it) => it.place === null);
      root.classList.toggle('is-dense', s.items.length > 20);
      root.replaceChildren(...[
        s.teams ? h('p', { class: 'gm-turn-banner gm-sort-turn' }, [h('span', { class: 'gm-team-badge', style: `--team:${color(s.turn)}`, text: `▶ ${s.teams.list[s.turn].name}` }), ' — place one card']) : null,
        h('div', { class: 'gm-zones', style: `--cols:${s.categories.length}` }, s.categories.map((c) => zone(c, s.items.filter((it) => it.place === c.id), c.name))),
        zone(null, pool, pool.length ? 'Cards to sort' : (instant() ? 'All sorted!' : 'All cards placed — check your answers!')),
        instant() ? null : h('div', { class: 'gm-row gm-center' }, [
          h('button', { type: 'button', class: 'gm-btn gm-primary gm-big', 'data-check': '', disabled: !s.items.some((it) => !it.locked && it.place !== null), text: '✔ Check answers', on: { click: check } })
        ]),
        s.teams ? h('div', { class: 'gm-scoreboard gm-sort-scores', role: 'group', 'aria-label': 'Scores' }, s.teams.list.map((t) => h('div', { class: 'gm-scorecard' + (t.id === s.turn ? ' is-turn' : ''), style: `--team:${color(t.id)}` }, [
          h('span', { class: 'gm-scorecard-name', text: (t.id === s.turn ? '▶ ' : '') + t.name }), h('span', { class: 'gm-scorecard-score', text: String(t.score) })
        ]))) : null
      ].filter(Boolean));   // replaceChildren would turn a null into the text "null"
      shakeId = null;
    }
    function check() {
      ctx.setPhase('checking');
      const r = S.check(s);
      selected = null;
      ctx.setPhase('playing');
      ctx.announce(`${r.correct} correct, ${r.wrong} to try again`);
      if (r.wrong) tone([300, 220], 0.1); else tone([660, 880], 0.08);
      render();
      if (r.wrong) ctx.toast(`${r.correct} correct · ${r.wrong} went back to the pool — try again`);
      if (s.done) finish(false);
    }

    function finish(timeUp) {
      const time = cfg.timer ? cfg.timer - (timer ? timer.left : 0) : elapsed;
      stopClocks();
      tone(timeUp ? [440, 330, 220] : [523, 659, 784, 1047], 0.13);
      const sc = S.score(s);
      const review = h('div', { class: 'gm-sort-review' }, set.categories.map((c) => h('div', { class: 'gm-review-group', style: `--group:${gColor(c.id)}` }, [
        h('h4', { text: c.name }),
        h('ul', null, s.items.filter((it) => it.cat === c.id).map((it) => h('li', { class: !it.locked ? 'is-missed' : it.tries > 1 ? 'is-retry' : '' }, [it.text, !it.locked ? ' (not sorted)' : it.tries > 1 ? ` (${it.tries} tries)` : ''])))
      ])));
      const statTable = h('table', { class: 'gm-metrics' }, [
        ['Sorted', `${sc.correct} of ${sc.total}`], ['Right first time', `${S.firstTry(s)}%`], ['Mistakes', String(s.mistakes)], ['Best streak', `🔥 ${s.bestStreak}`], ['Time', fmtTime(time)]
      ].map(([a, b]) => h('tr', null, [h('th', { scope: 'row', text: a }), h('td', { text: b })])));
      if (s.teams) {
        const rank = s.teams.list.slice().sort((a, b) => b.score - a.score);
        const winners = rank.filter((t) => t.score === rank[0].score);
        let place = 0, last = null;
        ctx.showResult({
          icon: timeUp ? '⏰' : '🏆', title: (timeUp ? "Time's up! " : '') + (winners.length > 1 ? `It's a tie: ${winners.map((t) => t.name).join(' & ')}` : `${winners[0].name} wins!`),
          extra: h('div', { class: 'gm-final-body' }, [h('ol', { class: 'gm-podium' }, rank.map((t, i) => { if (t.score !== last) { place = i + 1; last = t.score; } return h('li', { style: `--team:${color(t.id)}` }, [
            h('span', { class: 'gm-podium-medal', text: place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.` }), h('span', { class: 'gm-podium-name', text: t.name }), h('span', { class: 'gm-podium-score', text: `${t.score} cards` })
          ]); })), h('h4', { class: 'gm-gallery-title', text: 'The right groups' }), review]),
          actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
        });
      } else {
        const st = timeUp ? (sc.correct >= sc.total / 2 ? 1 : 0) : S.stars(s);
        ctx.showResult({
          icon: timeUp ? '⏰' : '🗂️', title: timeUp ? `Time's up! ${sc.correct} of ${sc.total} sorted` : st === 3 ? 'Perfectly sorted!' : 'All sorted!',
          extra: h('div', { class: 'gm-final-body' }, [
            h('div', { class: 'gm-stars', 'aria-label': `${st} out of 3 stars` }, [1, 2, 3].map((i) => h('span', { class: 'gm-star' + (i <= st ? ' is-on' : ''), 'aria-hidden': 'true', text: '★' }))),
            statTable, h('h4', { class: 'gm-gallery-title', text: 'The right groups' }), review
          ]),
          actions: [{ label: '↻ Play again', primary: true, onClick: start }, { label: '⚙ Settings', onClick: setup }]
        });
      }
      ctx.body.querySelector('.gm-result')?.classList.add('gm-result-wide');
    }

    setup();
    return { hasProgress: () => !!s && !s.done && s.items.some((it) => it.place !== null || it.tries > 0), unmount: stopClocks, _state: () => s, _cfg: () => cfg, _timer: () => timer };
  });
})();
