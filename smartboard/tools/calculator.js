/**
 * Smart Board "Normal" calculator — a clean, touch-friendly everyday calculator in a floating, draggable panel.
 * The "Scientific" tab opens the Casio-style calculator (tools/casio.js).
 *
 * Features: + − × ÷ with immediate (chain) arithmetic, repeat "=", %, √x, x², 1/x, ±, backspace, CE / C,
 * memory (MC MR M+ M− MS), history (click an entry to reuse it), copy result, keyboard input, thousands separators.
 */
var Calculator = (function () {
  'use strict';

  var STORE = 'sb_calc_v2';
  var MINUS = '−';

  function MathErr(msg) { this.message = msg || 'Math error'; this.isCalc = true; }

  function fmt(x) {
    if (typeof x !== 'number' || !isFinite(x)) return 'Math error';
    var r = Number(x.toPrecision(15));
    if (r === 0) return '0';
    var a = Math.abs(r);
    if (a >= 1e16 || a < 1e-9) return r.toExponential(9).replace(/\.?0+e/, 'e');
    return String(r);
  }
  /** "-1234567.891" → "−1,234,567.891" */
  function group(raw) {
    if (/e/.test(raw)) return raw.replace('-', MINUS);
    var neg = raw.charAt(0) === '-', body = neg ? raw.slice(1) : raw;
    var parts = body.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? MINUS : '') + parts.join('.');
  }

  /* ─────────── state ─────────── */
  var st = {
    open: false, historyOpen: false, mem: 0, hasMem: false, history: [], pos: null,
    acc: null, op: null, cur: '0', fresh: true, lastOp: null, lastB: 0, justEq: false, exprText: '', err: ''
  };

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!raw) return;
      if (typeof raw.mem === 'number') { st.mem = raw.mem; st.hasMem = !!raw.hasMem; }
      if (Array.isArray(raw.history)) st.history = raw.history.slice(0, 40);
      if (raw.pos && typeof raw.pos.x === 'number') st.pos = raw.pos;
    } catch (e) { /* defaults */ }
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify({ mem: st.mem, hasMem: st.hasMem, history: st.history.slice(0, 40), pos: st.pos })); } catch (e) { /* ignore */ }
  }

  /* ─────────── engine ─────────── */
  function applyBin(a, op, b) {
    var r;
    if (op === '+') r = a + b;
    else if (op === MINUS) r = a - b;
    else if (op === '×') r = a * b;
    else {
      if (b === 0) throw new MathErr(a === 0 ? 'Result is undefined' : 'Cannot divide by zero');
      r = a / b;
    }
    if (!isFinite(r)) throw new MathErr('Overflow');
    return r;
  }
  function reset() {
    st.acc = null; st.op = null; st.cur = '0'; st.fresh = true; st.lastOp = null; st.lastB = 0; st.justEq = false; st.exprText = ''; st.err = '';
  }
  function pushHistory(e, r) {
    st.history.unshift({ e: e, r: r });
    if (st.history.length > 40) st.history.length = 40;
    save();
  }
  function startNew() { if (st.justEq) { st.exprText = ''; st.justEq = false; st.lastOp = null; } }

  function press(k) {
    if (st.err && k !== 'C' && k !== 'CE') reset();
    var n = function () { return Number(st.cur); };
    try {
      if (/^[0-9]$/.test(k)) {
        startNew();
        if (st.fresh || st.cur === '0') st.cur = k;
        else if (st.cur.replace(/[-.]/g, '').length < 16) st.cur += k;
        st.fresh = false;
      } else if (k === '.') {
        startNew();
        if (st.fresh) { st.cur = '0.'; st.fresh = false; }
        else if (st.cur.indexOf('.') < 0) st.cur += '.';
      } else if (k === '⌫') {
        if (st.fresh) return;
        st.cur = st.cur.length > 1 && !(st.cur.length === 2 && st.cur.charAt(0) === '-') ? st.cur.slice(0, -1) : '0';
      } else if (k === 'CE') {
        st.cur = '0'; st.fresh = true; st.err = '';
      } else if (k === 'C') {
        reset();
      } else if (k === '+' || k === MINUS || k === '×' || k === '÷') {
        if (st.op !== null && !st.fresh) {
          var r = applyBin(st.acc, st.op, n());
          st.acc = r; st.cur = fmt(r);
        } else if (st.op === null) {
          st.acc = n();
        }
        st.op = k; st.fresh = true; st.justEq = false;
        st.exprText = fmt(st.acc) + ' ' + k;
      } else if (k === '=') {
        if (st.op !== null) {
          var a = st.acc, b = n(), res = applyBin(a, st.op, b), text = fmt(a) + ' ' + st.op + ' ' + fmt(b);
          pushHistory(text, fmt(res));
          st.exprText = text + ' =';
          st.lastOp = st.op; st.lastB = b;
          st.cur = fmt(res); st.op = null; st.acc = null; st.fresh = true; st.justEq = true;
        } else if (st.lastOp !== null && st.justEq) {
          var a2 = n(), res2 = applyBin(a2, st.lastOp, st.lastB), text2 = fmt(a2) + ' ' + st.lastOp + ' ' + fmt(st.lastB);
          pushHistory(text2, fmt(res2));
          st.exprText = text2 + ' =';
          st.cur = fmt(res2); st.fresh = true;
        } else {
          st.exprText = group(st.cur) + ' =';
          st.justEq = true; st.fresh = true;
        }
      } else if (k === '±') {
        if (st.cur !== '0') st.cur = st.cur.charAt(0) === '-' ? st.cur.slice(1) : '-' + st.cur;
      } else if (k === '%') {
        var v = n();
        var pct = (st.op === '+' || st.op === MINUS) && st.acc !== null ? (st.acc * v) / 100 : v / 100;
        st.cur = fmt(pct); st.fresh = true;
        st.exprText = (st.op ? fmt(st.acc) + ' ' + st.op + ' ' : '') + st.cur;
      } else if (k === 'sqrt' || k === 'sqr' || k === 'inv') {
        var x = n(), out, label;
        if (k === 'sqrt') { if (x < 0) throw new MathErr('Invalid input'); out = Math.sqrt(x); label = '√(' + fmt(x) + ')'; }
        else if (k === 'sqr') { out = x * x; label = 'sqr(' + fmt(x) + ')'; }
        else { if (x === 0) throw new MathErr('Cannot divide by zero'); out = 1 / x; label = '1/(' + fmt(x) + ')'; }
        if (!isFinite(out)) throw new MathErr('Overflow');
        st.cur = fmt(out); st.fresh = true;
        st.exprText = (st.op ? fmt(st.acc) + ' ' + st.op + ' ' : '') + label;
        if (!st.op) pushHistory(label, st.cur);
      } else if (k === 'MC') { st.mem = 0; st.hasMem = false; save(); }
      else if (k === 'MR') { if (st.hasMem) { startNew(); st.cur = fmt(st.mem); st.fresh = true; } }
      else if (k === 'M+') { st.mem += n(); st.hasMem = true; st.fresh = true; save(); }
      else if (k === 'M-') { st.mem -= n(); st.hasMem = true; st.fresh = true; save(); }
      else if (k === 'MS') { st.mem = n(); st.hasMem = true; st.fresh = true; save(); }
    } catch (e) {
      if (!e || !e.isCalc) throw e;
      st.err = e.message; st.cur = '0'; st.op = null; st.acc = null; st.fresh = true;
    }
  }

  /* ─────────── UI (a desk calculator: body, solar panel, LCD, rubber keys) ─────────── */
  // [id, label, class]  — 5 columns, like a real desk calculator
  var SMALL_ROWS = [
    [['MC', 'MC'], ['MR', 'MR'], ['M-', 'M−'], ['M+', 'M+'], ['MS', 'MS']],
    [['sqr', 'x²'], ['inv', '1/x'], ['sqrt', '√'], ['%', '%'], ['CE', 'CE']]
  ];
  var KEYS = [
    ['7', '7', 'white'], ['8', '8', 'white'], ['9', '9', 'white'], ['⌫', '', 'orange back'], ['C', 'AC', 'orange'],
    ['4', '4', 'white'], ['5', '5', 'white'], ['6', '6', 'white'], ['×', '×', 'dark'], ['÷', '÷', 'dark'],
    ['1', '1', 'white'], ['2', '2', 'white'], ['3', '3', 'white'], ['+', '+', 'dark'], [MINUS, MINUS, 'dark'],
    ['0', '0', 'white'], ['.', '.', 'white'], ['±', '+/−', 'white'], ['=', '=', 'eq wide']
  ];
  var ICON_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="M17 9.5l-5 5M12 9.5l5 5"/></svg>';

  var root = null, els = {};

  function css() {
    if (document.getElementById('sb-calc-css')) return;
    var s = document.createElement('style');
    s.id = 'sb-calc-css';
    s.textContent = [
      '#sb-calc{position:fixed;z-index:8000;display:none;flex-direction:column;width:340px;color:#f1f5f9;border-radius:26px;overflow:hidden;user-select:none;-webkit-user-select:none;',
      'background:linear-gradient(165deg,#12283e 0%,#0a1727 100%);border:1px solid rgba(125,230,200,.3);box-shadow:0 26px 64px rgba(0,0,0,.6),0 0 0 1px rgba(0,0,0,.35);',
      'font-family:"Plus Jakarta Sans","Inter",system-ui,sans-serif;max-height:calc(100vh - 12px);outline:none}',
      '#sb-calc.open{display:flex}',
      '.sbc-head{display:flex;align-items:center;gap:8px;padding:9px 12px;cursor:grab;touch-action:none;background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.07)}',
      '.sbc-head:active{cursor:grabbing}',
      '.sbc-tabs{display:flex;gap:3px;background:rgba(0,0,0,.3);border-radius:12px;padding:3px;flex:1}',
      '.sbc-tabs button{flex:1;border:0;border-radius:9px;padding:7px 6px;font:700 12.5px inherit;font-family:inherit;color:#9fb6c6;background:transparent;cursor:pointer}',
      '.sbc-tabs button.on{background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;box-shadow:0 2px 10px rgba(20,184,166,.35)}',
      '.sbc-tabs button:not(.on):hover{color:#fff}',
      '.sbc-hbtn{width:32px;height:32px;display:grid;place-items:center;border:0;border-radius:10px;background:rgba(255,255,255,.07);color:#cfe3ee;cursor:pointer}',
      '.sbc-hbtn:hover{background:rgba(255,255,255,.15)}.sbc-hbtn.on{background:rgba(20,184,166,.32);color:#fff}',
      '.sbc-hbtn svg{width:16px;height:16px}',
      /* the calculator body */
      '.sbc-body{margin:12px;padding:12px 12px 14px;border-radius:20px;background:linear-gradient(180deg,#2c3a49 0%,#1c2733 55%,#161f2a 100%);border:1px solid rgba(255,255,255,.12);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),inset 0 -3px 8px rgba(0,0,0,.45),0 6px 18px rgba(0,0,0,.4)}',
      '.sbc-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}',
      '.sbc-brand{line-height:1.15}.sbc-brand{white-space:nowrap}.sbc-brand b{display:block;font:800 10px inherit;font-family:inherit;color:#e6fffa;letter-spacing:.05em}.sbc-brand span{font:700 8px inherit;font-family:inherit;color:#7f98a8;letter-spacing:.12em}',
      '.sbc-solar{width:84px;height:30px;border-radius:6px;border:2px solid #0a1019;background:repeating-linear-gradient(90deg,transparent 0 12px,rgba(0,0,0,.55) 12px 13px),linear-gradient(180deg,#3d3558 0%,#241d3c 100%);box-shadow:inset 0 2px 5px rgba(0,0,0,.6),0 1px 0 rgba(255,255,255,.1);position:relative;overflow:hidden}',
      '.sbc-solar:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.2),transparent 45%)}',
      /* LCD */
      '.sbc-screen{border-radius:12px;padding:6px 12px 8px;color:#16251c;background:linear-gradient(180deg,#bccfb8 0%,#cddcc9 100%);border:3px solid #0a1019;box-shadow:inset 0 3px 8px rgba(0,0,0,.4),0 1px 0 rgba(255,255,255,.12);min-height:104px;display:flex;flex-direction:column;justify-content:flex-end;position:relative}',
      '.sbc-meta{display:flex;align-items:center;gap:6px;min-height:18px}',
      '.sbc-badge{font:800 10px "Consolas",monospace;padding:1px 6px;border-radius:4px;background:#16251c;color:#c4d6c0;display:none;letter-spacing:.05em}',
      '.sbc-badge.show{display:inline-block}',
      '.sbc-op{font:800 13px "Consolas",monospace;opacity:.85}',
      '.sbc-copy{margin-left:auto;border:0;background:rgba(0,0,0,.14);color:#2a3a2e;cursor:pointer;padding:2px 8px;border-radius:5px;font:800 10px system-ui}',
      '.sbc-copy:hover{background:rgba(0,0,0,.28)}',
      '.sbc-expr{min-height:20px;text-align:right;font:700 13px "Consolas","Menlo",monospace;opacity:.7;overflow-x:auto;white-space:nowrap;scrollbar-width:none}',
      '.sbc-main{text-align:right;font:700 40px/1.1 "Consolas","Menlo","DejaVu Sans Mono",monospace;color:#0f1d14;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:none;letter-spacing:-.01em;text-shadow:1px 1px 0 rgba(255,255,255,.18)}',
      '.sbc-main.m1{font-size:32px}.sbc-main.m2{font-size:25px}.sbc-main.m3{font-size:20px}',
      '.sbc-main.err{color:#7a1d1d;font-size:19px;letter-spacing:0}',
      /* keys */
      '.sbc-small{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:11px}',
      '.sbc-small+.sbc-small{margin-top:7px}',
      '.sbc-keys{display:grid;grid-template-columns:repeat(5,1fr);gap:9px 7px;margin-top:12px}',
      '.sbc-s{height:25px;border:0;border-radius:13px;font:800 11.5px inherit;font-family:inherit;cursor:pointer;color:#cfe3ee;background:linear-gradient(180deg,#3a4a5b,#27343f);box-shadow:0 2px 0 #0c141c,0 3px 5px rgba(0,0,0,.35);padding:0;transition:transform .05s,box-shadow .05s,filter .1s}',
      '.sbc-s:hover{filter:brightness(1.2)}.sbc-s:active{transform:translateY(2px);box-shadow:0 0 0 #0c141c}',
      '.sbc-key{height:48px;border:0;border-radius:12px 12px 17px 17px;font:800 20px inherit;font-family:inherit;cursor:pointer;padding:0;display:grid;place-items:center;touch-action:manipulation;transition:transform .05s,box-shadow .05s,filter .1s}',
      '.sbc-key:hover{filter:brightness(1.1)}',
      '.sbc-key.white{color:#142231;background:linear-gradient(180deg,#f6f8fa 0%,#d3dce3 100%);box-shadow:0 3px 0 #77899a,0 5px 8px rgba(0,0,0,.4),inset 0 1px 0 #fff;font-size:22px}',
      '.sbc-key.dark{color:#e9f1f6;background:linear-gradient(180deg,#3a4c5e 0%,#243241 100%);box-shadow:0 3px 0 #0b141d,0 5px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.18);font-size:24px}',
      '.sbc-key.orange{color:#fff;background:linear-gradient(180deg,#ffa05c 0%,#ec7222 100%);box-shadow:0 3px 0 #9a4a14,0 5px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.4);font-size:17px}',
      '.sbc-key.eq{color:#042320;background:linear-gradient(180deg,#46e0cb 0%,#0fa592 100%);box-shadow:0 3px 0 #08605a,0 5px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.45);font-size:28px}',
      '.sbc-key.wide{grid-column:span 2}',
      '.sbc-key:active{transform:translateY(3px)}.sbc-key.white:active{box-shadow:0 0 0 #77899a}.sbc-key.dark:active{box-shadow:0 0 0 #0b141d}.sbc-key.orange:active{box-shadow:0 0 0 #9a4a14}.sbc-key.eq:active{box-shadow:0 0 0 #08605a}',
      '.sbc-key svg{width:24px;height:24px}',
      '.sbc-hist{display:none;flex-direction:column;max-height:230px;overflow:auto;background:rgba(0,0,0,.34);border-top:1px solid rgba(255,255,255,.07)}',
      '.sbc-hist.show{display:flex}',
      '.sbc-hist-row{display:flex;flex-direction:column;align-items:flex-end;padding:8px 18px;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer}',
      '.sbc-hist-row:hover{background:rgba(255,255,255,.07)}',
      '.sbc-hist-row .e{font-size:12.5px;color:#8fb0c4;word-break:break-all;text-align:right}',
      '.sbc-hist-row .r{font-size:20px;font-weight:800;color:#fff}',
      '.sbc-hist-empty{padding:18px;text-align:center;color:#7f98a8;font-size:13px}',
      '.sbc-hist-clear{margin:10px 14px;border:0;border-radius:10px;padding:8px;background:rgba(255,255,255,.08);color:#cfe3ee;font:700 12px inherit;font-family:inherit;cursor:pointer}',
      '.floating-left-palette #btn-fp-calc.calc-on{background:#e6fffa !important;border:2px solid #0d9488 !important;border-radius:10px !important;color:#0f766e !important}',
      '@media (max-height:720px){.sbc-key{height:40px;font-size:18px}.sbc-main{font-size:32px}.sbc-screen{min-height:88px}.sbc-keys{gap:7px 6px;margin-top:9px}.sbc-solar{height:24px}}'
    ].join('');
    document.head.appendChild(s);
  }

  function build() {
    if (root) return;
    css();
    root = document.createElement('div');
    root.id = 'sb-calc';
    root.tabIndex = -1;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Calculator');
    root.innerHTML =
      '<div class="sbc-head" id="sbc-head">' +
        '<div class="sbc-tabs"><button type="button" class="on" data-mode="std">Normal</button><button type="button" data-mode="fx">Scientific</button></div>' +
        '<button type="button" class="sbc-hbtn" data-h="history" title="History" aria-label="History"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg></button>' +
        '<button type="button" class="sbc-hbtn" data-h="close" title="Close (Esc)" aria-label="Close calculator"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '</div>' +
      '<div class="sbc-body">' +
        '<div class="sbc-top"><div class="sbc-brand"><b>NEPAL DIGITAL EDUCATION</b><span>12 DIGITS · SOLAR</span></div><div class="sbc-solar" aria-hidden="true"></div></div>' +
        '<div class="sbc-screen">' +
          '<div class="sbc-meta"><span class="sbc-badge" data-b="mem">M</span><span class="sbc-op" data-s="op"></span><button type="button" class="sbc-copy" data-h="copy" title="Copy result">COPY</button></div>' +
          '<div class="sbc-expr" data-s="expr"></div>' +
          '<div class="sbc-main" data-s="main">0</div>' +
        '</div>' +
        '<div data-s="small"></div>' +
        '<div class="sbc-keys" data-s="keys"></div>' +
      '</div>' +
      '<div class="sbc-hist" data-s="hist"></div>';
    document.body.appendChild(root);
    els.expr = root.querySelector('[data-s="expr"]');
    els.main = root.querySelector('[data-s="main"]');
    els.keys = root.querySelector('[data-s="keys"]');
    els.small = root.querySelector('[data-s="small"]');
    els.hist = root.querySelector('[data-s="hist"]');
    els.badge = root.querySelector('[data-b="mem"]');
    els.op = root.querySelector('[data-s="op"]');
    SMALL_ROWS.forEach(function (row) {
      var d = document.createElement('div');
      d.className = 'sbc-small';
      row.forEach(function (m) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'sbc-s'; b.setAttribute('data-k', m[0]); b.textContent = m[1];
        d.appendChild(b);
      });
      els.small.appendChild(d);
    });
    KEYS.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sbc-key ' + d[2]; b.setAttribute('data-k', d[0]);
      if (d[0] === '⌫') { b.innerHTML = ICON_BACK; b.setAttribute('aria-label', 'Backspace'); } else b.textContent = d[1];
      els.keys.appendChild(b);
    });
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
    attachDrag();
  }

  function render() {
    if (!root) return;
    var isErr = !!st.err;
    var text = isErr ? st.err : group(st.cur);
    els.main.textContent = text;
    els.main.className = 'sbc-main' + (isErr ? ' err' : text.length > 17 ? ' m3' : text.length > 13 ? ' m2' : text.length > 9 ? ' m1' : '');
    els.expr.textContent = st.exprText;
    els.op.textContent = st.op && !st.justEq ? st.op : '';
    els.main.scrollLeft = els.main.scrollWidth;
    els.badge.classList.toggle('show', st.hasMem);
    renderHistory();
    var sb = document.getElementById('btn-fp-calc');
    if (sb) sb.classList.toggle('calc-on', st.open);
  }

  function renderHistory() {
    els.hist.classList.toggle('show', st.historyOpen);
    var hb = root.querySelector('[data-h="history"]');
    if (hb) hb.classList.toggle('on', st.historyOpen);
    if (!st.historyOpen) return;
    els.hist.innerHTML = '';
    if (!st.history.length) {
      var em = document.createElement('div'); em.className = 'sbc-hist-empty'; em.textContent = 'No calculations yet';
      els.hist.appendChild(em);
      return;
    }
    st.history.forEach(function (h, i) {
      var row = document.createElement('div');
      row.className = 'sbc-hist-row'; row.setAttribute('data-i', String(i)); row.title = 'Use this result';
      var e = document.createElement('div'); e.className = 'e'; e.textContent = h.e + ' =';
      var r = document.createElement('div'); r.className = 'r'; r.textContent = group(h.r);
      row.appendChild(e); row.appendChild(r);
      els.hist.appendChild(row);
    });
    var clr = document.createElement('button');
    clr.type = 'button'; clr.className = 'sbc-hist-clear'; clr.setAttribute('data-h', 'clearhist'); clr.textContent = 'Clear history';
    els.hist.appendChild(clr);
  }

  function copyResult() {
    if (st.err) return;
    var text = st.cur;
    var done = function () {
      var b = root.querySelector('[data-h="copy"]');
      if (b) { var o = b.textContent; b.textContent = 'Copied'; setTimeout(function () { b.textContent = o; }, 1100); }
    };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () {}); return; } } catch (e) { /* fall through */ }
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  function onClick(e) {
    var t = e.target.closest('button, .sbc-hist-row');
    if (!t || !root.contains(t)) return;
    if (t.hasAttribute('data-mode')) { if (t.getAttribute('data-mode') === 'fx') switchToFx(); return; }
    var h = t.getAttribute('data-h');
    if (h === 'close') { close(); return; }
    if (h === 'history') { st.historyOpen = !st.historyOpen; render(); return; }
    if (h === 'copy') { copyResult(); return; }
    if (h === 'clearhist') { st.history = []; save(); render(); return; }
    if (t.classList.contains('sbc-hist-row')) {
      var it = st.history[Number(t.getAttribute('data-i'))];
      if (it) { st.cur = it.r; st.fresh = true; st.err = ''; st.op = null; st.acc = null; st.exprText = it.e + ' ='; st.justEq = false; render(); }
      return;
    }
    var k = t.getAttribute('data-k');
    if (k) { press(k); render(); }
  }

  function onKey(e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    var key = e.key;
    if (key === 'Escape') { close(); e.preventDefault(); e.stopPropagation(); return; }
    var map = { '*': '×', '/': '÷', '-': MINUS, 'x': '×', 'X': '×', 'Enter': '=', '=': '=', 'Backspace': '⌫', 'Delete': 'C', 'c': 'C', 'C': 'C', '%': '%', '+': '+', '.': '.', ',': '.' };
    var k = /^[0-9]$/.test(key) ? key : map[key];
    if (!k) return;
    e.preventDefault(); e.stopPropagation();
    press(k); render();
  }

  function attachDrag() {
    var head = root.querySelector('#sbc-head'), drag = null;
    head.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      var r = root.getBoundingClientRect();
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId };
      try { head.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    head.addEventListener('pointermove', function (e) { if (drag && e.pointerId === drag.id) place(e.clientX - drag.dx, e.clientY - drag.dy); });
    function end(e) {
      if (!drag) return;
      drag = null;
      try { head.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      var r = root.getBoundingClientRect();
      st.pos = { x: Math.round(r.left), y: Math.round(r.top) };
      save();
    }
    head.addEventListener('pointerup', end);
    head.addEventListener('pointercancel', end);
  }
  function place(x, y) {
    var w = root.offsetWidth || 352, h = root.offsetHeight || 560;
    root.style.left = Math.max(6, Math.min(x, window.innerWidth - w - 6)) + 'px';
    root.style.top = Math.max(6, Math.min(y, window.innerHeight - Math.min(h, window.innerHeight - 12) - 6)) + 'px';
  }
  function clampIntoView() {
    if (!root || !st.open) return;
    var r = root.getBoundingClientRect();
    place(r.left, r.top);
  }

  /* ─────────── open / close / tabs ─────────── */
  function open() {
    build();
    st.open = true;
    root.classList.add('open');
    render();
    var p = st.pos || { x: 92, y: 40 };
    place(p.x, p.y);
    try { root.focus({ preventScroll: true }); } catch (e) { root.focus(); }
  }
  function close() {
    if (!root) return;
    st.open = false;
    root.classList.remove('open');
    var sb = document.getElementById('btn-fp-calc');
    if (sb) sb.classList.remove('calc-on');
  }

  var lastFx = false;
  try { lastFx = localStorage.getItem('sb_calc_tab') === 'fx'; } catch (e) { /* default */ }
  function rememberTab(fx) { lastFx = fx; try { localStorage.setItem('sb_calc_tab', fx ? 'fx' : 'basic'); } catch (e) { /* ignore */ } }

  function switchToFx() {
    if (typeof CasioCalc === 'undefined') return;
    var r = root.getBoundingClientRect();
    close();
    rememberTab(true);
    CasioCalc.open({ x: Math.round(r.left), y: Math.max(6, Math.round(r.top) - 20) });
  }
  /** Called by the Scientific calculator's "Normal" tab. */
  function openMode(mode, pos) {
    rememberTab(false);
    build();
    if (pos) st.pos = { x: pos.x, y: pos.y };
    open();
  }
  function toggle() {
    if (typeof CasioCalc !== 'undefined' && CasioCalc.isOpen()) { CasioCalc.close(); return; }
    if (st.open) { close(); return; }
    if (lastFx && typeof CasioCalc !== 'undefined') CasioCalc.open(); else open();
  }

  load();
  window.addEventListener('resize', clampIntoView);

  return {
    open: open, close: close, toggle: toggle, openMode: openMode, isOpen: function () { return st.open; },
    _state: st, _fmt: fmt, _press: function (k) { build(); press(k); render(); }, _reset: function () { reset(); st.mem = 0; st.hasMem = false; }
  };
})();
