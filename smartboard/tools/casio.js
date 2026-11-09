/**
 * CasioCalc — an fx-991ES PLUS style scientific calculator for the Smart Board (UI).
 * Uses CasioEngine for every calculation. Same keypad layout as the real calculator: SHIFT / ALPHA / REPLAY / MODE / SETUP,
 * natural textbook display, and the eight modes COMP, CMPLX, STAT, BASE-N, EQN, MATRIX, TABLE and VECTOR.
 */
var CasioCalc = (function () {
  'use strict';
  var E = CasioEngine;
  var STORE = 'sb_casio_v1';
  var MINUS = '−';
  var MODES = [['COMP', 'COMP'], ['CMPLX', 'CMPLX'], ['STAT', 'STAT'], ['BASE', 'BASE-N'], ['EQN', 'EQN'], ['MATRIX', 'MATRIX'], ['TABLE', 'TABLE'], ['VECTOR', 'VECTOR']];
  var VARS = ['A', 'B', 'C', 'D', 'E', 'F', 'X', 'Y', 'M'];

  /* ═══════════ state ═══════════ */
  var st = {
    open: false, mode: 'COMP', shift: false, alpha: false, hyp: false, pending: null,
    setup: { angle: 'DEG', io: 'math', disp: 'norm1', digits: 0, fraction: 'mixed', cfmt: 'rect', freq: false, comma: false, contrast: 3 },
    vars: {}, ans: 0, preAns: 0,
    mats: { A: [[0, 0], [0, 0]], B: [[0, 0], [0, 0]], C: [[0, 0], [0, 0]], Ans: null },
    vcts: { A: [0, 0, 0], B: [0, 0, 0], C: [0, 0, 0], Ans: null },
    ed: { t: [], c: 0 }, res: null, resDec: false, dms: false, engShift: undefined, hist: [], hpos: -1,
    menu: null, scr: 'expr', g: null, out: null, base: 10,
    stat: { type: 'one', rows: [['', '', '']], tab: 'data' },
    eqn: { type: 0, coef: null },
    mtab: 'A', vtab: 'A',
    tbl: { f: [], start: '1', end: '5', step: '1' },
    pos: null, last: ''
  };

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!raw) return;
      if (raw.setup) Object.assign(st.setup, raw.setup);
      if (raw.vars) st.vars = raw.vars;
      if (typeof raw.ans === 'number') st.ans = raw.ans;
      if (raw.mats) Object.assign(st.mats, raw.mats);
      if (raw.vcts) Object.assign(st.vcts, raw.vcts);
      if (raw.pos) st.pos = raw.pos;
      if (raw.mode) st.mode = raw.mode;
      if (raw.stat) st.stat = raw.stat;
      if (Array.isArray(raw.hist)) st.hist = raw.hist.slice(0, 30);
    } catch (e) { /* defaults */ }
  }
  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({ setup: st.setup, vars: st.vars, ans: st.ans, mats: st.mats, vcts: st.vcts, pos: st.pos, mode: st.mode, stat: st.stat, hist: st.hist.slice(0, 30) }));
    } catch (e) { /* ignore */ }
  }

  /* ═══════════ helpers ═══════════ */
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function ctx(noStat) {
    return {
      angle: st.setup.angle, complex: st.mode === 'CMPLX', ans: st.ans, preAns: st.preAns, vars: st.vars,
      mats: st.mats, vcts: st.vcts, stat: noStat ? undefined : statCtx()
    };
  }
  function fmtOpts() { return { mode: st.setup.disp, digits: st.setup.digits, engShift: st.engShift, comma: st.setup.comma }; }
  function evalNum(text, noStat) {
    var t = String(text).trim();
    if (t === '') return 0;
    var v = E.evaluate(t, ctx(noStat));
    if (typeof v !== 'number') throw new E.Err('Math ERROR');
    return v;
  }

  /** textbook-style rendering of an expression string; \u0001 marks the cursor. */
  function nat(s) {
    var i = 0;
    var BOX = '<span class="cx-box"></span>';
    function seq(stop) {
      var out = '', depth = 0;
      while (i < s.length) {
        var c = s.charAt(i);
        if (stop && depth === 0 && stop.indexOf(c) >= 0) break;
        if (c === '\u0001') { out += '<span class="cx-caret"></span>'; i++; continue; }
        if (c === '⟨') {
          i++;
          var n = seq('∕⟩');
          if (s.charAt(i) === '∕') i++;
          var d = seq('⟩');
          if (s.charAt(i) === '⟩') i++;
          out += '<span class="cx-fr"><span class="n">' + (n || BOX) + '</span><span class="d">' + (d || BOX) + '</span></span>';
          continue;
        }
        if (c === '^' && s.charAt(i + 1) === '(') {
          i += 2;
          var e = seq(')');
          if (s.charAt(i) === ')') i++;
          out += '<sup>' + (e || BOX) + '</sup>';
          continue;
        }
        if ((c === '√' || c === '∛') && s.charAt(i + 1) === '(') {
          i += 2;
          var r = seq(')');
          if (s.charAt(i) === ')') i++;
          out += '<span class="cx-rad">' + (c === '∛' ? '<sup class="ix">3</sup>' : '') + '√<span class="rb">' + (r || BOX) + '</span></span>';
          continue;
        }
        if (s.substr(i, 5) === 'logb(') {
          i += 5;
          var b = seq(',');
          if (s.charAt(i) === ',') i++;
          var x = seq(')');
          if (s.charAt(i) === ')') i++;
          out += 'log<sub>' + (b || BOX) + '</sub>(' + (x || BOX) + ')';
          continue;
        }
        if (c === 'ᴇ') {
          var m = /^ᴇ([-−+]?\d+)/.exec(s.slice(i));
          if (m) { out += '×10<sup>' + esc(m[1].replace('-', '−')) + '</sup>'; i += m[0].length; continue; }
        }
        if (c === '(') depth++;
        if (c === ')') depth--;
        out += esc(c);
        i++;
      }
      return out;
    }
    return seq(null);
  }

  /* ═══════════ editor ═══════════ */
  function edText() { return st.ed.t.join(''); }
  function insertTokens(toks, cur) {
    var a = st.ed.t.slice(0, st.ed.c), b = st.ed.t.slice(st.ed.c);
    st.ed.t = a.concat(toks, b);
    st.ed.c += cur === undefined ? toks.length : cur;
  }
  function delToken() {
    if (st.ed.c === 0) return;
    var t = st.ed.t, c = st.ed.c, k = t[c - 1];
    // deleting the opening part of a template removes the whole empty template
    if (t[c] === '∕' && t[c - 1] === '⟨' && t[c + 1] === '⟩') { t.splice(c - 1, 3); st.ed.c = c - 1; return; }
    t.splice(c - 1, 1);
    st.ed.c = c - 1;
    if (k === '(' && t[c - 1] === ')' && c - 1 >= 0) { /* keep the bracket pair: user removes it separately */ }
  }
  function moveCursor(d) { st.ed.c = Math.max(0, Math.min(st.ed.t.length, st.ed.c + d)); }
  function caretText() {
    var s = '', i;
    for (i = 0; i < st.ed.t.length; i++) { if (i === st.ed.c) s += '\u0001'; s += st.ed.t[i]; }
    if (st.ed.c >= st.ed.t.length) s += '\u0001';
    return s;
  }
  function clearEditor() { st.ed = { t: [], c: 0 }; st.res = null; st.resDec = false; st.dms = false; st.engShift = undefined; }

  /* ═══════════ statistics model ═══════════ */
  var statCache = { sig: '', val: null };
  function statTwoVar() { return st.stat.type !== 'one'; }
  function statRows() {
    var two = statTwoVar(), rows = [];
    st.stat.rows.forEach(function (r) {
      if (String(r[0]).trim() === '') return;
      var x = evalNum(r[0], true);
      var o = { x: x };
      if (two) { if (String(r[1]).trim() === '') return; o.y = evalNum(r[1], true); }
      if (st.setup.freq) { var f = String(r[2]).trim() === '' ? 1 : evalNum(r[2], true); o.f = Math.max(0, Math.round(f)); }
      rows.push(o);
    });
    return rows;
  }
  function statCtx() {
    try {
      var sig = JSON.stringify([st.stat, st.setup.freq]);
      if (statCache.sig === sig) return statCache.val;
      var rows = statRows();
      var v = rows.length ? E.statistics(rows, st.stat.type) : null;
      statCache = { sig: sig, val: v };
      return v;
    } catch (e) { return null; }
  }

  /* ═══════════ results ═══════════ */
  function numHTML(x, allowExact, res) {
    var neg = x < 0;
    if (allowExact && !st.resDec && !(res && res.noExact)) {
      var ex = E.exact(x, res && res.hasPi);
      if (ex) return exactHTML(ex);
    }
    var s = E.fmtReal(x, fmtOpts());
    return nat(s.replace('-', MINUS));
  }
  function fracHTML(n, d) { return '<span class="cx-fr"><span class="n">' + n + '</span><span class="d">' + d + '</span></span>'; }
  function exactHTML(ex) {
    var sign = ex.neg ? MINUS : '';
    if (ex.kind === 'frac') {
      if (st.setup.io === 'line') return sign + ex.n + '⌋' + ex.d;
      if (st.setup.fraction === 'mixed' && ex.n > ex.d) {
        var w = Math.floor(ex.n / ex.d), rem = ex.n - w * ex.d;
        return sign + w + (rem ? (st.setup.io === 'line' ? '⌋' + rem + '⌋' + ex.d : fracHTML(rem, ex.d)) : '');
      }
      return sign + fracHTML(ex.n, ex.d);
    }
    if (ex.kind === 'pi') {
      var top = (ex.n === 1 ? '' : ex.n) + 'π';
      return sign + (ex.d === 1 ? top : (st.setup.io === 'line' ? top + '⌋' + ex.d : fracHTML(top, ex.d)));
    }
    var rad = (ex.k === 1 ? '' : ex.k) + '<span class="cx-rad">√<span class="rb">' + ex.r + '</span></span>';
    return sign + (ex.d === 1 ? rad : fracHTML(rad, ex.d));
  }
  function matHTML(m) {
    return '<table class="cx-mt">' + m.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + numHTML(x, true, { noExact: false }) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
  }
  function resultHTML() {
    var r = st.res;
    if (!r) return '';
    if (r.kind === 'err') return '<div class="cx-err">' + esc(r.msg) + '</div><div class="cx-hint">[◄][►] : Goto &nbsp; [AC] : Cancel</div>';
    if (r.kind === 'base') {
      var v = r.v, b = st.base;
      return '<div class="cx-bases"><div><b>DEC</b> ' + esc(E.toBase(v, 10)) + '</div><div><b>HEX</b> ' + esc(E.toBase(v, 16)) + '</div><div><b>BIN</b> ' + esc(E.toBase(v, 2)) + '</div><div><b>OCT</b> ' + esc(E.toBase(v, 8)) + '</div></div>';
    }
    if (r.kind === 'real') {
      if (st.dms) return esc(E.toDMS(r.v));
      return numHTML(r.v, true, r);
    }
    if (r.kind === 'cx') {
      var z = r.v;
      if (st.setup.cfmt === 'polar') {
        var mag = E.cabs(z), ang = E.clean(E.fromRad(E.carg(z), { angle: st.setup.angle }));
        return numHTML(mag, false, r) + '∠' + numHTML(ang, false, r);
      }
      var re = E.re(z), im = E.im(z), out = '';
      if (re !== 0 || im === 0) out += numHTML(re, true, r);
      if (im !== 0) {
        var ai = Math.abs(im), part = ai === 1 ? '' : numHTML(ai, true, r);
        out += (re !== 0 ? (im < 0 ? ' − ' : ' + ') : (im < 0 ? MINUS : '')) + part + 'i';
      }
      return out;
    }
    if (r.kind === 'pair') return r.v.pair.map(function (x, i) { return '<div class="cx-pair"><b>' + r.v.names[i] + '=</b> ' + numHTML(x, false, r) + '</div>'; }).join('');
    if (r.kind === 'mat') return matHTML(r.v.m);
    if (r.kind === 'vec') return '<span class="cx-vec">[ ' + r.v.v.map(function (x) { return numHTML(x, true, r); }).join(' &nbsp; ') + ' ]</span>';
    return esc(r.text || '');
  }

  function wrapResult(v, text) {
    var base = { noExact: /[.]|Ran|ln\(|log|∫|d\/dx|Σ|e\^|ᴇ|Rnd|sinh|cosh|tanh|P\(|Q\(|R\(|t\(|Reg|x̂|ŷ/.test(text) || /σ|Σx|Σy|x̄|ȳ/.test(text), hasPi: /π/.test(text) || (st.setup.angle === 'RAD' && /⁻¹\(/.test(text)) };
    if (typeof v === 'number') return Object.assign({ kind: 'real', v: v }, base);
    if (E.isC(v)) return Object.assign({ kind: 'cx', v: v }, base);
    if (E.isM(v)) return Object.assign({ kind: 'mat', v: v }, base);
    if (E.isV(v)) return Object.assign({ kind: 'vec', v: v }, base);
    if (E.isP(v)) return Object.assign({ kind: 'pair', v: v }, base);
    return { kind: 'real', v: 0 };
  }
  function setErr(e) {
    if (!e || !e.isCasio) throw e;
    st.res = { kind: 'err', msg: e.message };
  }

  function equals() {
    var text = edText();
    if (!text) { if (st.res && st.res.kind !== 'err') { /* "=" again repeats nothing */ } return; }
    st.engShift = undefined; st.dms = false; st.resDec = false;
    try {
      if (st.mode === 'BASE') {
        var bv = E.evalBase(text, st.base);
        st.res = { kind: 'base', v: bv };
        st.preAns = st.ans; st.ans = bv;
      } else {
        var v = E.evaluate(text, ctx());
        st.res = wrapResult(v, text);
        if (typeof v === 'number' || E.isC(v)) { st.preAns = st.ans; st.ans = v; }
        if (E.isM(v)) st.mats.Ans = v.m;
        if (E.isV(v)) st.vcts.Ans = v.v;
        if (E.isP(v)) { st.preAns = st.ans; st.ans = v.pair[0]; }
      }
      st.hist.unshift({ t: st.ed.t.slice() });
      if (st.hist.length > 30) st.hist.length = 30;
      st.hpos = -1;
      save();
    } catch (e) { setErr(e); }
  }

  /* ═══════════ grids (STAT data, EQN, MATRIX, VECTOR, TABLE, prompts) ═══════════ */
  function openGrid(kind, o) {
    st.scr = 'grid';
    st.g = Object.assign({ kind: kind, r: 0, c: 0, typing: false }, o);
  }
  function gridInsert(txt) {
    var g = st.g;
    if (!g.typing) { g.cells[g.r][g.c] = ''; g.typing = true; }
    g.cells[g.r][g.c] += txt;
  }
  function gridDel() {
    var g = st.g;
    if (!g.typing) { g.cells[g.r][g.c] = ''; return; }
    var s = g.cells[g.r][g.c];
    g.cells[g.r][g.c] = s.length ? s.slice(0, -1) : '';
  }
  function gridMove(dr, dc) {
    var g = st.g;
    commitCell();
    g.typing = false;
    if (g.kind === 'stat' && dr > 0 && g.r === g.cells.length - 1 && g.cells.length < 80) { g.cells.push(g.cells[0].map(function () { return ''; })); }
    g.r = Math.max(0, Math.min(g.cells.length - 1, g.r + dr));
    g.c = Math.max(0, Math.min(g.cells[0].length - 1, g.c + dc));
  }
  function commitCell() {
    var g = st.g;
    if (!g) return;
    if (g.kind === 'stat') {
      st.stat.rows = g.cells.map(function (r) { return r.slice(); });
    } else if (g.kind === 'mat' || g.kind === 'vct') {
      try {
        var nums = g.cells.map(function (r) { return r.map(function (x) { return evalNum(x); }); });
        if (g.kind === 'mat') st.mats[st.mtab] = nums; else st.vcts[st.vtab] = nums[0];
      } catch (e) { /* keep text until valid */ }
    } else if (g.kind === 'eqn') {
      st.eqn.coef = g.cells.map(function (r) { return r.slice(); });
    } else if (g.kind === 'tblp') {
      st.tbl.start = g.cells[0][0]; st.tbl.end = g.cells[1][0]; st.tbl.step = g.cells[2][0];
    }
  }
  function gridEnter() {
    var g = st.g;
    commitCell();
    g.typing = false;
    try {
      if (g.kind === 'prompt') { g.onDone(g); return; }
      if (g.kind === 'tblp') { if (g.r < g.cells.length - 1) { g.r++; return; } buildTable(); return; }
      if (g.kind === 'eqn') {
        var last = g.r === g.cells.length - 1 && g.c === g.cells[0].length - 1;
        if (last) { solveEqn(); return; }
        if (g.c < g.cells[0].length - 1) g.c++; else { g.r++; g.c = 0; }
        return;
      }
      if (g.kind === 'stat') { gridMove(1, 0); return; }
      if (g.kind === 'mat') { if (g.c < g.cells[0].length - 1) g.c++; else if (g.r < g.cells.length - 1) { g.r++; g.c = 0; } return; }
      if (g.kind === 'vct') { if (g.c < g.cells[0].length - 1) g.c++; return; }
    } catch (e) { st.out = { err: e.isCasio ? e.message : 'Math ERROR' }; st.scr = 'out'; if (!e.isCasio) throw e; }
  }

  /* STAT */
  function openStatData() {
    var two = statTwoVar(), cols = ['X'];
    if (two) cols.push('Y');
    if (st.setup.freq) cols.push('FREQ');
    var width = cols.length, cells = st.stat.rows.map(function (r) {
      var row = [r[0] || ''];
      if (two) row.push(r[1] || '');
      if (st.setup.freq) row.push(r[2] || '');
      return row;
    });
    if (!cells.length) cells = [new Array(width).fill('')];
    // pad rows to the width (if the type changed)
    cells = cells.map(function (r) { while (r.length < width) r.push(''); return r.slice(0, width); });
    // keep the model in the 3-column layout
    st.stat.tab = 'data';
    openGrid('stat', { cols: cols, cells: cells, title: 'STAT  ' + (st.stat.type === 'one' ? '1-VAR' : E.REG[st.stat.type]) });
    st.g.sync = function () {
      st.stat.rows = st.g.cells.map(function (r) { var x = r[0] || '', y = two ? r[1] || '' : '', f = st.setup.freq ? r[two ? 2 : 1] || '' : ''; return [x, y, f]; });
    };
  }
  var origCommit = commitCell;
  commitCell = function () {
    var g = st.g;
    if (g && g.kind === 'stat' && g.sync) { g.sync(); return; }
    origCommit();
  };
  function statTypeMenu() {
    var items = [['one', '1-VAR'], ['lin', 'A+BX'], ['quad', '_+CX²'], ['ln', 'ln X'], ['exp', 'e^X'], ['ab', 'A·B^X'], ['pow', 'A·X^B'], ['inv', '1/X']];
    st.menu = {
      title: 'STAT', pages: [items.map(function (it, i) { return { k: String(i + 1), label: it[1], run: function () { st.stat.type = it[0]; st.stat.rows = [['', '', '']]; statCache.sig = ''; closeMenu(); openStatData(); save(); } }; })]
    };
  }
  function statResults() {
    var s = statCtx();
    st.scr = 'out';
    if (!s) { st.out = { err: 'No data — enter values first' }; return; }
    var two = statTwoVar(), rows = [];
    function row(label, tok, v) { if (v !== undefined && v !== null) rows.push({ label: label, tok: tok, v: v }); }
    row('n', 'n', s.n); row('x̄', 'x̄', s.xbar); row('Σx', 'Σx', s.sx1); row('Σx²', 'Σx²', s.sx2); row('σx', 'σx', s.sigx); row('sx', 'sx', s.sdx);
    row('minX', 'minX', s.minx); row('maxX', 'maxX', s.maxx);
    if (!two) { row('Q1', null, s.q1); row('Med', null, s.med); row('Q3', null, s.q3); }
    if (two) {
      row('ȳ', 'ȳ', s.ybar); row('Σy', 'Σy', s.sy1); row('Σy²', 'Σy²', s.sy2); row('σy', 'σy', s.sigy); row('sy', 'sy', s.sdy); row('Σxy', 'Σxy', s.sxy);
      row('a (A)', 'RegA', s.A); row('b (B)', 'RegB', s.B); if (st.stat.type === 'quad') row('c (C)', 'RegC', s.C);
      if (s.r !== undefined) row('r', 'Reg_r', s.r);
    }
    st.out = { kind: 'stat', rows: rows, title: 'STAT  ' + (st.stat.type === 'one' ? '1-VAR' : E.REG[st.stat.type]), est: two, estX: '', estY: '' };
  }

  /* EQN */
  var EQN_TYPES = ['aX+bY=c', 'aX+bY+cZ=d', 'aX²+bX+c=0', 'aX³+bX²+cX+d=0'];
  function eqnTypeMenu() {
    st.menu = { title: 'EQN', pages: [EQN_TYPES.map(function (t, i) { return { k: String(i + 1), label: t, run: function () { closeMenu(); openEqn(i); } }; })] };
  }
  function openEqn(type) {
    st.eqn.type = type;
    var dims = [[2, 3], [3, 4], [1, 3], [1, 4]][type];
    var cells = [];
    for (var r = 0; r < dims[0]; r++) cells.push(new Array(dims[1]).fill('0'));
    var names = [['a', 'b', 'c'], ['a', 'b', 'c', 'd'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd']][type];
    openGrid('eqn', { cells: cells, cols: names, title: EQN_TYPES[type], rowLabels: dims[0] > 1 ? cells.map(function (_, i) { return String(i + 1); }) : null });
  }
  function solveEqn() {
    var g = st.g, type = st.eqn.type;
    try {
      var nums = g.cells.map(function (r) { return r.map(function (x) { return evalNum(x); }); });
      var res = [];
      var cx = st.mode === 'EQN';
      if (type === 0 || type === 1) {
        var s = E.eqnLinear(nums), names = ['X', 'Y', 'Z'];
        s.forEach(function (v, i) { res.push([names[i], v]); });
      } else {
        var roots = E.eqnPoly(nums[0]);
        if (nums[0][0] === 0) throw new E.Err('Math ERROR');
        if (type === 2 && roots.length === 2) {
          var disc = nums[0][1] * nums[0][1] - 4 * nums[0][0] * nums[0][2];
          if (disc === 0) { res.push(['X', roots[0]]); }
          else { res.push(['X₁', roots[0]]); res.push(['X₂', roots[1]]); }
          if (disc !== 0) { /* complex roots keep their pair */ }
        } else roots.forEach(function (v, i) { res.push(['X' + (i + 1 < 2 && roots.length === 1 ? '' : ['₁', '₂', '₃'][i]), v]); });
      }
      st.out = { kind: 'eqn', rows: res, title: EQN_TYPES[type] };
      st.scr = 'out';
    } catch (e) {
      st.out = { err: e.isCasio ? (e.message === 'Math ERROR' ? 'Math ERROR (no unique solution)' : e.message) : String(e) };
      st.scr = 'out';
    }
  }

  /* MATRIX / VECTOR */
  function openMatrixEditor() {
    var m = st.mats[st.mtab];
    openGrid('mat', { cells: m.map(function (r) { return r.map(String); }), title: 'Mat' + st.mtab });
    st.scr = 'grid';
  }
  function openVectorEditor() {
    var v = st.vcts[st.vtab];
    openGrid('vct', { cells: [v.map(String)], title: 'Vct' + st.vtab });
  }
  function resizeMat(dr, dc) {
    commitCell();
    var m = st.mats[st.mtab].map(function (r) { return r.slice(); });
    var nr = Math.max(1, Math.min(3, m.length + dr)), nc = Math.max(1, Math.min(3, m[0].length + dc));
    var out = [];
    for (var i = 0; i < nr; i++) { out.push([]); for (var j = 0; j < nc; j++) out[i].push(m[i] && m[i][j] !== undefined ? m[i][j] : 0); }
    st.mats[st.mtab] = out;
    openMatrixEditor(); save();
  }
  function resizeVct(dc) {
    commitCell();
    var v = st.vcts[st.vtab].slice(), n = Math.max(2, Math.min(3, v.length + dc));
    while (v.length < n) v.push(0);
    st.vcts[st.vtab] = v.slice(0, n);
    openVectorEditor(); save();
  }

  /* TABLE */
  function openTableF() {
    st.scr = 'expr';
    st.ed = { t: st.tbl.f.slice(), c: st.tbl.f.length };
    st.res = null;
  }
  function openTableParams() {
    openGrid('tblp', { cells: [[st.tbl.start], [st.tbl.end], [st.tbl.step]], cols: [''], rowLabels: ['Start', 'End', 'Step'], title: 'TABLE  f(X)=' + st.tbl.f.join('') });
  }
  function buildTable() {
    try {
      var s = evalNum(st.tbl.start), e = evalNum(st.tbl.end), step = evalNum(st.tbl.step);
      if (step === 0 || (e - s) / step < 0) throw new E.Err('Math ERROR');
      var n = Math.floor((e - s) / step + 1e-9) + 1;
      if (n > 30) throw new E.Err('Too many rows (max 30)');
      var f = E.compile(st.tbl.f.join('')), rows = [], c = ctx();
      for (var i = 0; i < n; i++) {
        var x = E.clean(s + i * step), v;
        try { var env = { ctx: c, vars: Object.assign({}, c.vars, { X: x }) }; v = E.finish(f(env), c); if (typeof v !== 'number') v = NaN; } catch (er) { v = NaN; }
        rows.push([x, v]);
      }
      st.out = { kind: 'table', rows: rows, title: 'TABLE  f(X)=' + st.tbl.f.join('') };
      st.scr = 'out';
    } catch (er) {
      if (!er.isCasio) throw er;
      st.out = { err: er.message }; st.scr = 'out';
    }
  }

  /* CALC / SOLVE prompts */
  function usedVars(text) {
    var found = [];
    E.tokenize(text).forEach(function (t) { if (t.t === 'id' && VARS.indexOf(t.v) >= 0 && found.indexOf(t.v) < 0) found.push(t.v); });
    return found;
  }
  function startCalc() {
    var text = edText();
    if (!text) return;
    var vs = usedVars(text);
    if (!vs.length) { equals(); return; }
    openGrid('prompt', {
      title: 'CALC', cols: [''], rowLabels: vs, cells: vs.map(function (v) { return [String(st.vars[v] === undefined ? 0 : fmtPlain(st.vars[v]))]; }),
      onDone: function (g) {
        try {
          vs.forEach(function (v, i) { st.vars[v] = evalNum(g.cells[i][0]); });
          st.scr = 'expr'; st.g = null;
          equals();
        } catch (e) { st.scr = 'expr'; st.g = null; setErr(e); }
      }
    });
  }
  function fmtPlain(x) { return typeof x === 'number' ? String(Number(x.toPrecision(12))) : '0'; }
  function startSolve() {
    var text = edText();
    if (!text) return;
    openGrid('prompt', {
      title: 'Solve for X', cols: [''], rowLabels: ['X ≈'], cells: [[fmtPlain(st.vars.X || 0)]],
      onDone: function (g) {
        try {
          var guess = evalNum(g.cells[0][0]);
          var r = E.solve(text, ctx(), guess);
          st.vars.X = r.x;
          st.scr = 'expr'; st.g = null;
          st.res = { kind: 'solve', x: r.x, res: r.res };
          st.preAns = st.ans; st.ans = r.x;
          save();
        } catch (e) { st.scr = 'expr'; st.g = null; setErr(e); }
      }
    });
  }

  /* ═══════════ menus ═══════════ */
  function closeMenu() { st.menu = null; }
  function openModeMenu() {
    st.menu = { title: 'MODE', cols: 2, pages: [MODES.map(function (m, i) { return { k: String(i + 1), label: m[1], run: function () { closeMenu(); setMode(m[0]); } }; })] };
  }
  function setOpt(label, run) { return { label: label, run: function () { run(); closeMenu(); save(); } }; }
  function openSetup() {
    var s = st.setup;
    function mark(c, t) { return (c ? '● ' : '') + t; }
    var p1 = [
      setOpt(mark(s.io === 'math', 'MthIO'), function () { s.io = 'math'; }),
      setOpt(mark(s.io === 'line', 'LineIO'), function () { s.io = 'line'; }),
      setOpt(mark(s.angle === 'DEG', 'Deg'), function () { s.angle = 'DEG'; }),
      setOpt(mark(s.angle === 'RAD', 'Rad'), function () { s.angle = 'RAD'; }),
      setOpt(mark(s.angle === 'GRA', 'Gra'), function () { s.angle = 'GRA'; }),
      { label: mark(s.disp === 'fix', 'Fix'), run: function () { digitMenu('fix'); } },
      { label: mark(s.disp === 'sci', 'Sci'), run: function () { digitMenu('sci'); } },
      { label: mark(s.disp === 'norm1' || s.disp === 'norm2', 'Norm'), run: function () { st.menu = { title: 'Norm', pages: [[setOpt(mark(s.disp === 'norm1', 'Norm1'), function () { s.disp = 'norm1'; }), setOpt(mark(s.disp === 'norm2', 'Norm2'), function () { s.disp = 'norm2'; })].map(function (o, i) { o.k = String(i + 1); return o; })] }; } }
    ];
    var p2 = [
      setOpt(mark(s.fraction === 'mixed', 'ab/c'), function () { s.fraction = 'mixed'; }),
      setOpt(mark(s.fraction === 'improper', 'd/c'), function () { s.fraction = 'improper'; }),
      setOpt(mark(s.cfmt === 'rect', 'a+bi'), function () { s.cfmt = 'rect'; }),
      setOpt(mark(s.cfmt === 'polar', 'r∠θ'), function () { s.cfmt = 'polar'; }),
      setOpt(mark(s.freq, 'STAT freq ON'), function () { s.freq = true; st.stat.rows = [['', '', '']]; statCache.sig = ''; }),
      setOpt(mark(!s.freq, 'STAT freq OFF'), function () { s.freq = false; st.stat.rows = [['', '', '']]; statCache.sig = ''; }),
      setOpt(mark(!s.comma, 'Dot decimal'), function () { s.comma = false; }),
      setOpt(mark(s.comma, 'Comma decimal'), function () { s.comma = true; })
    ];
    var p3 = [
      { label: 'Contrast  −', keep: true, run: function () { s.contrast = Math.max(0, s.contrast - 1); save(); } },
      { label: 'Contrast  +', keep: true, run: function () { s.contrast = Math.min(6, s.contrast + 1); save(); } }
    ];
    [p1, p2, p3].forEach(function (p) { p.forEach(function (o, i) { o.k = String(i + 1); }); });
    st.menu = { title: 'SETUP', cols: 2, pages: [p1, p2, p3], page: 0 };
  }
  function digitMenu(kind) {
    var items = [];
    for (var d = 0; d <= 9; d++) (function (dd) {
      items.push({ k: String(dd), label: String(dd), run: function () { st.setup.disp = kind; st.setup.digits = kind === 'sci' && dd === 0 ? 10 : dd; closeMenu(); save(); } });
    })(d);
    st.menu = { title: (kind === 'fix' ? 'Fix' : 'Sci') + ' 0~9?', cols: 5, pages: [items] };
  }
  function clrMenu() {
    function reset(what) {
      return function () {
        if (what === 'setup' || what === 'all') st.setup = { angle: 'DEG', io: 'math', disp: 'norm1', digits: 0, fraction: 'mixed', cfmt: 'rect', freq: false, comma: false, contrast: 3 };
        if (what === 'mem' || what === 'all') { st.vars = {}; st.ans = 0; st.preAns = 0; st.mats = { A: [[0, 0], [0, 0]], B: [[0, 0], [0, 0]], C: [[0, 0], [0, 0]], Ans: null }; st.vcts = { A: [0, 0, 0], B: [0, 0, 0], C: [0, 0, 0], Ans: null }; st.stat.rows = [['', '', '']]; statCache.sig = ''; }
        if (what === 'all') st.hist = [];
        clearEditor(); save();
        st.menu = { title: 'Reset done', pages: [[{ k: '', label: 'OK  (press AC)', run: closeMenu }]] };
      };
    }
    st.menu = { title: 'CLR', pages: [[{ k: '1', label: 'Setup Data', run: reset('setup') }, { k: '2', label: 'Memory', run: reset('mem') }, { k: '3', label: 'All', run: reset('all') }]] };
  }
  function insMenu(title, items, cols) {
    st.menu = { title: title, cols: cols || 1, pages: [items.map(function (it, i) { return { k: String(i + 1), label: it[0], run: function () { closeMenu(); if (it[2]) it[2](); else insertTokens(it[1], it[3]); } }; })] };
  }
  function constMenu() {
    var pages = [], per = 8;
    for (var p = 0; p < E.CONSTANTS.length; p += per) pages.push(E.CONSTANTS.slice(p, p + per).map(function (c, i) {
      return { k: String(i + 1), label: String(p + i + 1).padStart(2, '0') + ' ' + c[0] + '  ' + c[1], run: function () { closeMenu(); insertTokens(String(c[2]).replace('e-', 'ᴇ-').replace('e+', 'ᴇ').replace('e', 'ᴇ').split('')); }, hint: c[2] };
    }));
    st.menu = { title: 'CONST  (' + E.CONSTANTS.length + ')', pages: pages, page: 0, wide: true };
  }
  function convMenu() {
    var pages = [], per = 8;
    for (var p = 0; p < E.CONVERSIONS.length; p += per) pages.push(E.CONVERSIONS.slice(p, p + per).map(function (c, i) {
      return { k: String(i + 1), label: String(p + i + 1).padStart(2, '0') + ' ' + c[0], run: function () { closeMenu(); applyConv(c); } };
    }));
    st.menu = { title: 'CONV  (' + E.CONVERSIONS.length + ')', pages: pages, page: 0, cols: 2 };
  }
  function applyConv(c) {
    try {
      var text = edText(), v;
      v = text ? evalNum(text) : st.ans;
      var out = E.clean(c[1](v));
      st.res = { kind: 'real', v: out, noExact: true };
      st.ed = { t: (text ? text : String(fmtPlain(v))).split(''), c: 0 }; st.ed.c = st.ed.t.length;
      st.preAns = st.ans; st.ans = out;
      st.lastConv = c[0];
    } catch (e) { setErr(e); }
  }

  /* ═══════════ mode switching ═══════════ */
  function setMode(m) {
    st.mode = m; st.menu = null; st.g = null; st.out = null; st.scr = 'expr'; st.shift = st.alpha = false; st.hyp = false;
    clearEditor();
    if (m === 'STAT') statTypeMenu();
    else if (m === 'EQN') eqnTypeMenu();
    else if (m === 'MATRIX') { st.mtab = 'A'; openMatrixEditor(); }
    else if (m === 'VECTOR') { st.vtab = 'A'; openVectorEditor(); }
    else if (m === 'TABLE') { openTableF(); }
    else if (m === 'BASE') { st.base = 10; }
    save();
  }

  /* ═══════════ key actions ═══════════ */
  var KEYS = {
    calc: ['CALC', 'SOLVE', '='], int: ['∫', 'd/dx', ':'], xinv: ['x⁻¹', 'x!', ''], logb: ['logₐ', 'Σ', ''],
    frac: ['a⁄b', 'a b/c', ''], sqrt: ['√', '∛', ''], sq: ['x²', 'x³', ''], pow: ['xʸ', 'ʸ√x', ''], log: ['log', '10ˣ', ''], ln: ['ln', 'eˣ', ''],
    neg: ['(−)', '', 'A'], dms: ['°′″', '▸DMS', 'B'], hyp: ['hyp', '', 'C'], sin: ['sin', 'sin⁻¹', 'D'], cos: ['cos', 'cos⁻¹', 'E'], tan: ['tan', 'tan⁻¹', 'F'],
    rcl: ['RCL', 'STO', ''], eng: ['ENG', '←', 'i'], lp: ['(', 'Abs', 'X'], rp: [')', ',', 'Y'], sd: ['S⇔D', 'a b/c⇔d/c', ''], mplus: ['M+', 'M−', 'M'],
    '7': ['7', 'CONST', ''], '8': ['8', 'CONV', ''], '9': ['9', 'CLR', ''], del: ['DEL', 'INS', ''], ac: ['AC', 'OFF', ''],
    '4': ['4', 'MATRIX', ''], '5': ['5', 'VECTOR', ''], '6': ['6', '', ''], mul: ['×', 'nPr', ''], div: ['÷', 'nCr', ''],
    '1': ['1', 'STAT', ''], '2': ['2', 'CMPLX', ''], '3': ['3', 'BASE', ''], add: ['+', 'Pol', ''], sub: ['−', 'Rec', ''],
    '0': ['0', 'Rnd', ''], dot: ['.', 'Ran#', ''], x10: ['×10ˣ', 'π', 'e'], ans: ['Ans', 'DRG▸', 'PreAns'], eq: ['=', '', '']
  };
  var ALPHA_VAR = { neg: 'A', dms: 'B', hyp: 'C', sin: 'D', cos: 'E', tan: 'F', lp: 'X', rp: 'Y', mplus: 'M', eng: 'i' };

  function ins(s, cur) { return { ins: Array.isArray(s) ? s : s.split(''), cur: cur }; }
  function fnTok(name) { return { ins: [name, '('] }; }

  /** key → action descriptor */
  function resolve(id, sh, al) {
    if (al) {
      if (ALPHA_VAR[id]) return ins([ALPHA_VAR[id]]);
      if (id === 'calc') return ins(['=']);
      if (id === 'int') return ins([':']);
      if (id === 'x10') return ins(['e']);
      if (id === 'ans') return ins(['PreAns']);
      return null;
    }
    if (st.mode === 'BASE' && !sh) {
      if (id === 'sq') return { fn: 'base', v: 10 };
      if (id === 'pow') return { fn: 'base', v: 16 };
      if (id === 'log') return { fn: 'base', v: 2 };
      if (id === 'ln') return { fn: 'base', v: 8 };
    }
    var trig = { sin: 1, cos: 1, tan: 1 };
    if (trig[id]) {
      var nm = id + (st.hyp ? 'h' : '');
      st.hyp = false;
      return fnTok(sh ? nm + '⁻¹' : nm);
    }
    if (sh) {
      switch (id) {
        case 'calc': return { fn: 'solve' };
        case 'int': return ins(['d/dx', '(', ',', ')'], 2);
        case 'xinv': return ins(['!']);
        case 'logb': return ins(['Σ', '(', ',', ',', ')'], 2);
        case 'frac': return ins(['(', '+', '⟨', '∕', '⟩', ')'], 1);
        case 'sqrt': return ins(['∛', '(', ')'], 2);
        case 'sq': return ins(['^', '(', '3', ')']);
        case 'pow': return ins(['ʸ√']);
        case 'log': return ins(['1', '0', '^', '(', ')'], 4);
        case 'ln': return ins(['e', '^', '(', ')'], 3);
        case 'dms': return { fn: 'toDMS' };
        case 'rcl': return { fn: 'pend', v: 'STO' };
        case 'eng': return { fn: 'eng', v: -1 };
        case 'lp': return fnTok('Abs');
        case 'rp': return ins([',']);
        case 'sd': return { fn: 'fmtToggle' };
        case 'mplus': return { fn: 'mminus' };
        case '7': return { fn: 'const' };
        case '8': return { fn: 'conv' };
        case '9': return { fn: 'clr' };
        case '4': return { fn: 'matrixMenu' };
        case '5': return { fn: 'vectorMenu' };
        case '1': return { fn: 'statMenu' };
        case '2': return { fn: 'cmplxMenu' };
        case '3': return { fn: 'baseMenu' };
        case 'mul': return ins(['nPr']);
        case 'div': return ins(['nCr']);
        case 'add': return ins(['Pol', '('], 2);
        case 'sub': return ins(['Rec', '('], 2);
        case '0': return fnTok('Rnd');
        case 'dot': return { fn: 'randMenu' };
        case 'x10': return ins(['π']);
        case 'ans': return { fn: 'drg' };
        case 'del': return { fn: 'toast', v: 'Insert mode is always on' };
        case 'ac': return { fn: 'off' };
      }
      return null;
    }
    switch (id) {
      case 'calc': return { fn: 'calc' };
      case 'int': return ins(['∫', '(', ',', ',', ')'], 2);
      case 'xinv': return ins(['^', '(', MINUS, '1', ')']);
      case 'logb': return ins(['logb', '(', ',', ')'], 2);
      case 'frac': return ins(['⟨', '∕', '⟩'], 1);
      case 'sqrt': return ins(['√', '(', ')'], 2);
      case 'sq': return ins(['^', '(', '2', ')']);
      case 'pow': return ins(['^', '(', ')'], 2);
      case 'log': return fnTok('log');
      case 'ln': return fnTok('ln');
      case 'neg': return ins([MINUS]);
      case 'dms': return { fn: 'dms' };
      case 'hyp': return { fn: 'hyp' };
      case 'rcl': return { fn: 'pend', v: 'RCL' };
      case 'eng': return { fn: 'eng', v: 1 };
      case 'lp': return ins(['(']);
      case 'rp': return ins([')']);
      case 'sd': return { fn: 'sd' };
      case 'mplus': return { fn: 'mplus' };
      case 'del': return { fn: 'del' };
      case 'ac': return { fn: 'ac' };
      case 'mul': return ins(['×']);
      case 'div': return ins(['÷']);
      case 'add': return ins(['+']);
      case 'sub': return ins([MINUS]);
      case 'dot': return ins(['.']);
      case 'x10': return ins(['ᴇ']);
      case 'ans': return ins(['Ans']);
      case 'eq': return { fn: 'eq' };
    }
    if (/^[0-9]$/.test(id)) return ins([id]);
    return null;
  }

  function toast(msg) {
    var el = document.getElementById('cx-toast');
    if (!el) return;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('show'); }, 1500);
  }

  function dmsInsert() {
    var t = st.ed.t, i = st.ed.c - 1, last = null;
    while (i >= 0 && /^[0-9.]$/.test(t[i])) i--;
    if (i >= 0 && (t[i] === '°' || t[i] === '′' || t[i] === '″')) last = t[i];
    insertTokens([last === '°' ? '′' : last === '′' ? '″' : '°']);
  }

  function currentValueForMemory() {
    var text = edText();
    if (text) { var v = E.evaluate(text, ctx()); if (typeof v !== 'number') throw new E.Err('Math ERROR'); return v; }
    if (typeof st.ans === 'number') return st.ans;
    throw new E.Err('Math ERROR');
  }

  function runAct(a) {
    if (!a) return;
    // inside a grid, only insertion keys and the editing keys are used
    if (st.scr === 'grid' && st.g) {
      if (a.ins) { gridInsert(a.ins.join('').replace('ᴇ', 'ᴇ')); return; }
      if (a.fn === 'del') { gridDel(); return; }
      if (a.fn === 'ac') { gridAc(); return; }
      if (a.fn === 'eq') { gridEnter(); return; }
      return;
    }
    if (a.ins) {
      if (st.res && st.res.kind !== 'err' && st.scr === 'expr') {
        // after a result, starting with an operator continues from Ans; anything else starts a new line
        var first = a.ins[0];
        if (['+', '×', '÷', '^', '!', 'ʸ√', 'nPr', 'nCr'].indexOf(first) >= 0 || (first === MINUS && a.ins.length === 1)) { st.ed = { t: ['Ans'], c: 1 }; }
        else if (!/^(Ans|PreAns)$/.test(first) || true) { st.ed = { t: [], c: 0 }; }
        st.res = null; st.dms = false; st.engShift = undefined;
      } else if (st.res && st.res.kind === 'err') { st.res = null; }
      insertTokens(a.ins, a.cur);
      return;
    }
    switch (a.fn) {
      case 'del': if (st.res) { st.res = null; } else delToken(); break;
      case 'ac': ac(); break;
      case 'eq': st.scr === 'expr' && (st.mode === 'TABLE' && st.tbl.stage !== 'done' ? tableNext() : equals()); break;
      case 'calc': startCalc(); break;
      case 'solve': startSolve(); break;
      case 'hyp': st.hyp = !st.hyp; break;
      case 'dms': dmsInsert(); break;
      case 'toDMS': if (st.res && st.res.kind === 'real') st.dms = !st.dms; break;
      case 'eng': if (st.res && st.res.kind === 'real') st.engShift = (st.engShift === undefined ? 0 : st.engShift) + (a.v > 0 ? (st.engShift === undefined ? 0 : 1) : -1); break;
      case 'sd': if (st.res) st.resDec = !st.resDec; break;
      case 'fmtToggle': st.setup.fraction = st.setup.fraction === 'mixed' ? 'improper' : 'mixed'; break;
      case 'pend': st.pending = a.v; break;
      case 'mplus': try { var mv = currentValueForMemory(); st.vars.M = (st.vars.M || 0) + mv; save(); toast('M = ' + fmtPlain(st.vars.M)); } catch (e) { setErr(e); } break;
      case 'mminus': try { var mv2 = currentValueForMemory(); st.vars.M = (st.vars.M || 0) - mv2; save(); toast('M = ' + fmtPlain(st.vars.M)); } catch (e) { setErr(e); } break;
      case 'base': st.base = a.v; st.res = null; break;
      case 'const': constMenu(); break;
      case 'conv': convMenu(); break;
      case 'clr': clrMenu(); break;
      case 'matrixMenu': matrixMenu(); break;
      case 'vectorMenu': vectorMenu(); break;
      case 'statMenu': statMenu(); break;
      case 'cmplxMenu': cmplxMenu(); break;
      case 'baseMenu': baseMenu(); break;
      case 'randMenu': insMenu('RAN', [['Ran#', ['Ran#']], ['RanInt#', ['RanInt#', '(', ',', ')'], null, 2]], 1); break;
      case 'drg': insMenu('DRG▸', [['°', ['°']], ['ʳ', ['ʳ']], ['ᵍ', ['ᵍ']]], 3); break;
      case 'toast': toast(a.v); break;
      case 'off': close(); break;
    }
  }

  function matrixMenu() {
    if (st.mode !== 'MATRIX') { toast('Use MODE ▸ MATRIX'); return; }
    insMenu('MATRIX', [['Dim', null, function () { st.scr = 'grid'; openMatrixEditor(); }], ['Data (edit)', null, function () { openMatrixEditor(); }],
      ['MatA', ['MatA']], ['MatB', ['MatB']], ['MatC', ['MatC']], ['MatAns', ['MatAns']], ['det(', ['Det', '(']], ['Trn(', ['Trn', '(']]], 2);
  }
  function vectorMenu() {
    if (st.mode !== 'VECTOR') { toast('Use MODE ▸ VECTOR'); return; }
    insMenu('VECTOR', [['Dim', null, function () { openVectorEditor(); }], ['Data (edit)', null, function () { openVectorEditor(); }],
      ['VctA', ['VctA']], ['VctB', ['VctB']], ['VctC', ['VctC']], ['VctAns', ['VctAns']], ['Dot', ['Dot']], ['Angle(', ['Angle', '(', ',', ')'], null, 2]], 2);
  }
  function statMenu() {
    var s = statCtx();
    if (st.mode === 'STAT') {
      var items = [['Type', null, function () { statTypeMenu(); }], ['Data', null, function () { openStatData(); }], ['Results', null, function () { statResults(); }],
        ['x̄', ['x̄']], ['σx', ['σx']], ['sx', ['sx']], ['Σx', ['Σx']], ['Σx²', ['Σx²']], ['n', ['n']], ['minX', ['minX']], ['maxX', ['maxX']]];
      if (statTwoVar()) items.push(['ȳ', ['ȳ']], ['σy', ['σy']], ['sy', ['sy']], ['Σy', ['Σy']], ['Σy²', ['Σy²']], ['Σxy', ['Σxy']], ['A', ['RegA']], ['B', ['RegB']], ['r', ['Reg_r']], ['ŷ(', ['ŷ', '(', ')'], null, 2], ['x̂(', ['x̂', '(', ')'], null, 2]);
      items.push(['P(', ['P', '(']], ['Q(', ['Q', '(']], ['R(', ['R', '(']], ['t(', ['t', '(']]);
      insMenu('STAT', items, 2);
    } else insMenu('DISTR', [['P(', ['P', '(']], ['Q(', ['Q', '(']], ['R(', ['R', '(']], ['t(', ['t', '(']]], 2);
  }
  function cmplxMenu() {
    if (st.mode !== 'CMPLX') { toast('Use MODE ▸ CMPLX'); return; }
    insMenu('CMPLX', [['arg(', ['Arg', '(']], ['Conjg(', ['Conjg', '(']], ['Re(', ['Re', '(']], ['Im(', ['Im', '(']],
      ['▸r∠θ', null, function () { st.setup.cfmt = 'polar'; }], ['▸a+bi', null, function () { st.setup.cfmt = 'rect'; }], ['Abs(', ['Abs', '(']], ['i', ['i']]], 2);
  }
  function baseMenu() {
    if (st.mode !== 'BASE') { toast('Use MODE ▸ BASE-N'); return; }
    insMenu('LOGIC', [['and', ['and']], ['or', ['or']], ['xor', ['xor']], ['xnor', ['xnor']], ['Not(', ['Not', '(']], ['Neg(', ['Neg', '(']]], 2);
  }

  function ac() {
    if (st.scr === 'out') { st.out = null; st.scr = 'expr'; st.g = null; st.shift = st.alpha = false; backFromOut(); return; }
    clearEditor();
    st.pending = null; st.hyp = false;
    if (st.scr === 'expr' && st.mode === 'TABLE') { st.tbl.f = []; }
  }
  function backFromOut() {
    if (st.mode === 'EQN') { openEqn(st.eqn.type); }
    else if (st.mode === 'TABLE') { openTableF(); }
    else if (st.mode === 'STAT') { st.scr = 'expr'; clearEditor(); }
  }
  function gridAc() {
    commitCell();
    var k = st.g.kind;
    if (k === 'prompt') { st.g = null; st.scr = 'expr'; return; }
    st.g = null;
    if (k === 'stat') { st.scr = 'expr'; clearEditor(); }
    else if (k === 'eqn') { st.scr = 'expr'; st.out = null; eqnTypeMenu(); }
    else if (k === 'tblp') { openTableF(); }
    else if (k === 'mat' || k === 'vct') { st.scr = 'expr'; clearEditor(); }
  }
  function tableNext() {
    st.tbl.f = st.ed.t.slice();
    if (!st.tbl.f.length) return;
    openTableParams();
  }

  /* ═══════════ press ═══════════ */
  function menuPress(id) {
    var m = st.menu;
    if (id === 'ac' || id === 'on' || id === 'mode') { closeMenu(); return; }
    var pg = m.pages[m.page || 0];
    if (/^[0-9]$/.test(id)) {
      var it = pg.filter(function (x) { return x.k === id; })[0];
      if (it) { var keep = it.keep; it.run(); if (keep && st.menu === m) { /* stay open */ } }
      return;
    }
    if (id === 'down' && m.pages.length > 1) m.page = Math.min(m.pages.length - 1, (m.page || 0) + 1);
    if (id === 'up' && m.pages.length > 1) m.page = Math.max(0, (m.page || 0) - 1);
  }

  function press(id) {
    if (!st.open) return;
    if (st.menu) { menuPress(id); draw(); return; }
    if (id === 'shift') { st.shift = !st.shift; st.alpha = false; draw(); return; }
    if (id === 'alpha') { st.alpha = !st.alpha; st.shift = false; draw(); return; }
    if (id === 'mode') { var sh = st.shift; st.shift = st.alpha = false; if (sh) openSetup(); else openModeMenu(); draw(); return; }
    if (id === 'on') { st.shift = st.alpha = false; st.menu = null; if (st.scr === 'expr') clearEditor(); draw(); return; }
    if (id === 'left' || id === 'right' || id === 'up' || id === 'down') { pad(id); draw(); return; }
    var sh2 = st.shift, al2 = st.alpha;
    st.shift = st.alpha = false;
    // STO / RCL waiting for a variable
    if (st.pending) {
      var letter = ALPHA_VAR[id], mode = st.pending;
      st.pending = null;
      if (letter && letter !== 'i') {
        if (mode === 'STO') {
          try {
            var val = st.ans;
            if (typeof val !== 'number') val = E.re(val);
            if (edText()) { var ev = E.evaluate(edText(), ctx()); if (typeof ev === 'number') val = ev; }
            st.vars[letter] = val; save(); toast(letter + ' = ' + fmtPlain(val));
          } catch (e) { setErr(e); }
        } else {
          if (st.scr === 'grid' && st.g) gridInsert(letter); else { st.res = null; insertTokens([letter]); }
        }
      }
      draw(); return;
    }
    // letters (A–F, X, Y, M) work directly in grids and in the STO/RCL flow
    var a = resolve(id, sh2, al2);
    runAct(a);
    save();
    draw();
  }

  function pad(dir) {
    if (st.scr === 'grid' && st.g) {
      if (dir === 'left') gridMove(0, -1); else if (dir === 'right') gridMove(0, 1); else if (dir === 'up') gridMove(-1, 0); else gridMove(1, 0);
      return;
    }
    if (st.scr !== 'expr') return;
    if (dir === 'left' || dir === 'right') {
      if (st.res) { // replay: bring the last expression back for editing
        st.res = null; st.dms = false;
        st.ed.c = dir === 'left' ? st.ed.t.length : 0;
        return;
      }
      moveCursor(dir === 'left' ? -1 : 1);
    } else {
      if (!st.hist.length) return;
      st.hpos = dir === 'up' ? Math.min(st.hist.length - 1, st.hpos + 1) : Math.max(-1, st.hpos - 1);
      if (st.hpos >= 0) { var h = st.hist[st.hpos]; st.ed = { t: h.t.slice(), c: h.t.length }; st.res = null; }
      else clearEditor();
    }
  }

  /* ═══════════ drawing ═══════════ */
  var root = null, els = {};

  var KEY_ROWS = [
    ['calc', 'int', null, 'xinv', 'logb'],
    ['frac', 'sqrt', 'sq', 'pow', 'log', 'ln'],
    ['neg', 'dms', 'hyp', 'sin', 'cos', 'tan'],
    ['rcl', 'eng', 'lp', 'rp', 'sd', 'mplus'],
    ['7', '8', '9', 'del', 'ac'],
    ['4', '5', '6', 'mul', 'div'],
    ['1', '2', '3', 'add', 'sub'],
    ['0', 'dot', 'x10', 'ans', 'eq']
  ];
  var KEY_CLASS = { del: 'orange', ac: 'orange', eq: 'eq', '0': 'white', '1': 'white', '2': 'white', '3': 'white', '4': 'white', '5': 'white', '6': 'white', '7': 'white', '8': 'white', '9': 'white', dot: 'white', x10: 'white', ans: 'white', mul: 'white', div: 'white', add: 'white', sub: 'white' };

  function css() {
    if (document.getElementById('cx-css')) return;
    var s = document.createElement('style');
    s.id = 'cx-css';
    s.textContent = [
      '#sb-casio{position:fixed;z-index:8100;display:none;flex-direction:column;width:404px;color:#e8f1f6;border-radius:22px;overflow:hidden;user-select:none;-webkit-user-select:none;',
      'background:linear-gradient(165deg,#13283d 0%,#0a1727 100%);border:1px solid rgba(125,230,200,.3);box-shadow:0 26px 64px rgba(0,0,0,.6);font-family:"Plus Jakarta Sans","Inter",system-ui,sans-serif;outline:none}',
      '#sb-casio.open{display:flex}',
      '.cx-head{display:flex;align-items:center;gap:8px;padding:8px 10px 8px 12px;cursor:grab;touch-action:none;background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.07)}',
      '.cx-tabs{display:flex;gap:3px;background:rgba(0,0,0,.28);border-radius:11px;padding:3px;flex:1}',
      '.cx-tabs button{flex:1;border:0;border-radius:8px;padding:6px 4px;font:700 11.5px inherit;font-family:inherit;color:#9fb6c6;background:transparent;cursor:pointer;white-space:nowrap}',
      '.cx-tabs button.on{background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff}',
      '.cx-x{width:30px;height:30px;display:grid;place-items:center;border:0;border-radius:9px;background:rgba(255,255,255,.07);color:#cfe3ee;cursor:pointer}',
      '.cx-x:hover{background:rgba(255,255,255,.15)}.cx-x svg{width:15px;height:15px}',
      '.cx-brand{display:flex;justify-content:space-between;align-items:baseline;padding:8px 14px 0;font-size:9.5px;color:#7f98a8;letter-spacing:.04em;white-space:nowrap}',
      '.cx-brand b{color:#e6fffa;font-size:12px;letter-spacing:.02em}',
      /* LCD */
      '.cx-lcd{margin:7px 12px 6px;border-radius:12px;padding:5px 8px 7px;color:#16251c;background:linear-gradient(180deg,#c3d4bf,#cfdecb);border:2px solid #0a1220;box-shadow:inset 0 2px 6px rgba(0,0,0,.35);position:relative;height:148px;display:flex;flex-direction:column;overflow:hidden}',
      '.cx-lcd[data-c="0"]{color:#4a5a4e}.cx-lcd[data-c="1"]{color:#37483c}.cx-lcd[data-c="2"]{color:#233427}.cx-lcd[data-c="4"]{color:#0c1810}.cx-lcd[data-c="5"]{color:#050d08}.cx-lcd[data-c="6"]{color:#000}',
      '.cx-status{display:flex;gap:6px;font:800 9.5px/1 "Plus Jakarta Sans",system-ui;letter-spacing:.03em;min-height:12px;margin-bottom:2px;flex-wrap:wrap}',
      '.cx-status span{padding:1px 4px;border-radius:3px;background:rgba(0,0,0,.14)}.cx-status .md{background:#16251c;color:#c9d9c5}',
      '.cx-main{flex:1;min-height:0;overflow:auto;scrollbar-width:thin;display:flex;flex-direction:column}',
      '.cx-line{font:600 19px/1.5 "Consolas","Menlo","DejaVu Sans Mono",monospace;white-space:nowrap;overflow-x:auto;scrollbar-width:none;min-height:30px;padding-top:2px}',
      '.cx-line.edit{flex:1}',
      '.cx-res{margin-top:auto;text-align:right;font:700 25px/1.25 "Consolas","Menlo","DejaVu Sans Mono",monospace;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;white-space:nowrap;padding-bottom:2px}',
      '.cx-res .cx-line{text-align:right}',
      '.cx-caret{display:inline-block;width:2px;height:1.1em;background:currentColor;vertical-align:text-bottom;margin:0 0 0 -1px;animation:cx-blink 1s steps(1) infinite}',
      '@keyframes cx-blink{50%{opacity:0}}',
      '.cx-box{display:inline-block;width:.55em;height:.8em;border:1.5px solid currentColor;vertical-align:-.1em;opacity:.55;margin:0 1px}',
      '.cx-fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 2px;line-height:1.1}',
      '.cx-fr .n{border-bottom:2px solid currentColor;padding:0 3px;font-size:.88em}.cx-fr .d{padding:0 3px;font-size:.88em}',
      '.cx-rad{display:inline-flex;align-items:flex-end}.cx-rad .rb{border-top:2px solid currentColor;padding:0 2px;margin-left:1px}',
      '.cx-line sup,.cx-res sup{font-size:.62em;vertical-align:.5em;line-height:0}.cx-line sub{font-size:.62em}',
      '.cx-err{color:#7a1d1d;font:800 17px "Plus Jakarta Sans",system-ui;text-align:left;padding:4px 2px}.cx-hint{font:600 10.5px system-ui;text-align:left;opacity:.8;padding:0 2px}',
      '.cx-bases div{font:700 14px/1.45 "Consolas",monospace;text-align:right}.cx-bases b{font:800 10px system-ui;margin-right:6px;opacity:.75}',
      '.cx-pair{font:700 17px/1.4 "Consolas",monospace;text-align:right}.cx-mt td{padding:0 8px;font:700 15px "Consolas",monospace;text-align:right}.cx-mt{margin-left:auto}',
      /* menus & grids inside the LCD */
      '.cx-title{font:800 11px system-ui;letter-spacing:.04em;padding:0 2px 3px;border-bottom:1px solid rgba(0,0,0,.25);margin-bottom:3px;display:flex;justify-content:space-between}',
      '.cx-menu{display:grid;gap:2px 8px}.cx-mi{display:flex;gap:6px;align-items:center;padding:2px 5px;border-radius:5px;cursor:pointer;font:700 13px "Consolas",monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.cx-mi:hover{background:#16251c;color:#c9d9c5}.cx-mi i{font-style:normal;font-weight:800;opacity:.7}',
      '.cx-tbl{border-collapse:collapse;font:700 13px "Consolas",monospace;width:100%}.cx-tbl th,.cx-tbl td{padding:1px 6px;text-align:right;border-bottom:1px solid rgba(0,0,0,.15)}.cx-tbl th{font:800 11px system-ui;opacity:.75}',
      '.cx-tbl td.cell{cursor:pointer}.cx-tbl td.cur{background:#16251c;color:#c9d9c5}.cx-tbl td.lab{text-align:left;font:800 11px system-ui;opacity:.8;width:1%}',
      '.cx-chips{display:flex;gap:4px;flex-wrap:wrap;padding:2px 0}.cx-chip{font:800 10.5px system-ui;padding:2px 7px;border-radius:6px;background:rgba(0,0,0,.16);cursor:pointer;border:0;color:inherit}.cx-chip.on{background:#16251c;color:#c9d9c5}',
      '.cx-stat-row{display:flex;justify-content:space-between;padding:1px 6px;cursor:pointer;font:700 13px "Consolas",monospace;border-radius:4px}.cx-stat-row:hover{background:rgba(0,0,0,.14)}',
      /* keys */
      '.cx-pad{padding:4px 12px 14px;display:grid;gap:5px}',
      '.cx-r6{display:grid;grid-template-columns:repeat(6,1fr);gap:5px}.cx-r5{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}',
      '.cx-top{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;align-items:end}',
      '.cx-kw{position:relative;padding-top:12px}',
      '.cx-kw .s{position:absolute;top:0;left:2px;font:800 8.5px/1 system-ui;color:#f2c45a;white-space:nowrap;letter-spacing:.01em}',
      '.cx-kw .a{position:absolute;top:0;right:2px;font:800 8.5px/1 system-ui;color:#ff8d8d}',
      '.cx-k{width:100%;height:30px;border:0;border-radius:10px 10px 14px 14px;font:800 12.5px inherit;font-family:inherit;cursor:pointer;color:#eaf2f7;background:linear-gradient(180deg,#2a3f58,#1c2e44);box-shadow:0 2px 0 #0a1626,0 3px 6px rgba(0,0,0,.35);transition:transform .05s,filter .1s;padding:0}',
      '.cx-k:hover{filter:brightness(1.18)}.cx-k:active{transform:translateY(2px);box-shadow:0 0 0 #0a1626}',
      '.cx-k.white{background:linear-gradient(180deg,#f4f7f9,#d6dee4);color:#10202e;font-size:14px;box-shadow:0 2px 0 #7e8e9a,0 3px 6px rgba(0,0,0,.3)}',
      '.cx-k.orange{background:linear-gradient(180deg,#ff9a55,#ee7424);color:#fff;font-size:13px;box-shadow:0 2px 0 #9c4a12,0 3px 6px rgba(0,0,0,.3)}',
      '.cx-k.eq{background:linear-gradient(180deg,#f4f7f9,#d6dee4);color:#0f766e;font-size:16px;box-shadow:0 2px 0 #7e8e9a,0 3px 6px rgba(0,0,0,.3)}',
      '.cx-k.shift{background:linear-gradient(180deg,#f7d472,#e4aa2c);color:#3a2900;box-shadow:0 2px 0 #8f6a12}',
      '.cx-k.alpha{background:linear-gradient(180deg,#ff9e9e,#e45d5d);color:#3a0909;box-shadow:0 2px 0 #8f2b2b}',
      '.cx-k.shift.on{outline:3px solid #fff7d1}.cx-k.alpha.on{outline:3px solid #ffe0e0}',
      '.cx-k.mini{height:24px;font-size:11px;border-radius:12px}',
      '.cx-replay{grid-column:span 2;grid-row:span 2;position:relative;height:60px;margin:2px 0;display:grid;place-items:center}',
      '.cx-dpad{position:relative;width:62px;height:62px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#b9c8d6,#8798a8);box-shadow:0 3px 0 #4f5f6e,0 4px 10px rgba(0,0,0,.4)}',
      '.cx-dpad button{position:absolute;border:0;background:transparent;color:#1b2a38;font-size:14px;cursor:pointer;width:22px;height:20px;padding:0;font-weight:900}',
      '.cx-dpad .u{top:3px;left:20px}.cx-dpad .dn{bottom:3px;left:20px}.cx-dpad .l{left:3px;top:21px}.cx-dpad .r{right:3px;top:21px}',
      '.cx-dpad .mid{position:absolute;left:19px;top:21px;width:24px;height:20px;border-radius:10px;background:#d3dde6;font:800 6.5px/20px system-ui;text-align:center;color:#33414f}',
      '#cx-toast{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);background:#0b1b2c;color:#9fe7d4;font:700 11px system-ui;padding:5px 12px;border-radius:999px;opacity:0;transition:opacity .15s;pointer-events:none}#cx-toast.show{opacity:1}',
      '#btn-fp-calc.calc-on{background:#e6fffa !important}'
    ].join('');
    document.head.appendChild(s);
  }

  function keyEl(id) {
    var def = KEYS[id];
    var wrap = document.createElement('div');
    wrap.className = 'cx-kw';
    var sl = def[1], al = def[2];
    wrap.innerHTML = (sl ? '<span class="s"></span>' : '') + (al ? '<span class="a"></span>' : '') + '<button type="button" class="cx-k ' + (KEY_CLASS[id] || '') + '" data-k="' + id + '"></button>';
    if (sl) wrap.querySelector('.s').textContent = sl;
    if (al) wrap.querySelector('.a').textContent = al;
    wrap.querySelector('button').textContent = def[0];
    return wrap;
  }

  function build() {
    if (root) return;
    css();
    root = document.createElement('div');
    root.id = 'sb-casio';
    root.tabIndex = -1;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Scientific calculator');
    var topKeys = '<div class="cx-top">' +
      '<div class="cx-kw"><button type="button" class="cx-k shift" data-k="shift">SHIFT</button></div>' +
      '<div class="cx-kw"><button type="button" class="cx-k alpha" data-k="alpha">ALPHA</button></div>' +
      '<div class="cx-replay"><div class="cx-dpad"><button class="u" data-k="up" aria-label="Up">▲</button><button class="dn" data-k="down" aria-label="Down">▼</button><button class="l" data-k="left" aria-label="Left">◀</button><button class="r" data-k="right" aria-label="Right">▶</button><div class="mid">REPLAY</div></div></div>' +
      '<div class="cx-kw"><span class="s">SETUP</span><button type="button" class="cx-k mini" data-k="mode">MODE</button></div>' +
      '<div class="cx-kw"><span class="s">OFF</span><button type="button" class="cx-k mini" data-k="on">ON</button></div>' +
      '</div>';
    root.innerHTML =
      '<div class="cx-head" id="cx-head"><div class="cx-tabs"><button type="button" data-tab="std">Normal</button><button type="button" data-tab="fx" class="on">Scientific</button></div>' +
      '<button type="button" class="cx-x" data-close="1" title="Close (Esc)" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="cx-brand"><b>NEPAL DIGITAL EDUCATION</b><span>SCIENTIFIC CALCULATOR</span></div>' +
      '<div class="cx-lcd" id="cx-lcd"><div class="cx-status" id="cx-status"></div><div class="cx-main" id="cx-main"></div><div id="cx-toast"></div></div>' +
      '<div class="cx-pad" id="cx-pad">' + topKeys + '</div>';
    document.body.appendChild(root);
    var pad = root.querySelector('#cx-pad');
    // row 2 (calc, ∫, [replay], x⁻¹, log▫) sits beside the pad
    var r2 = document.createElement('div');
    r2.className = 'cx-top';
    ['calc', 'int'].forEach(function (id) { r2.appendChild(keyEl(id)); });
    var spacer = document.createElement('div'); spacer.style.gridColumn = 'span 2'; r2.appendChild(spacer);
    ['xinv', 'logb'].forEach(function (id) { r2.appendChild(keyEl(id)); });
    var topWrap = pad.firstChild;
    // pad spans 2 rows: place r2's keys into the same grid
    topWrap.style.gridTemplateRows = 'auto auto';
    topWrap.querySelector('.cx-replay').style.gridRow = '1 / span 2';
    topWrap.querySelector('.cx-replay').style.gridColumn = '3 / span 2';
    var row2keys = [keyEl('calc'), keyEl('int'), keyEl('xinv'), keyEl('logb')];
    row2keys[0].style.gridColumn = '1'; row2keys[0].style.gridRow = '2';
    row2keys[1].style.gridColumn = '2'; row2keys[1].style.gridRow = '2';
    row2keys[2].style.gridColumn = '5'; row2keys[2].style.gridRow = '2';
    row2keys[3].style.gridColumn = '6'; row2keys[3].style.gridRow = '2';
    row2keys.forEach(function (k) { topWrap.appendChild(k); });
    KEY_ROWS.slice(1).forEach(function (row, i) {
      var d = document.createElement('div');
      d.className = row.length === 6 ? 'cx-r6' : 'cx-r5';
      row.forEach(function (id) { d.appendChild(keyEl(id)); });
      pad.appendChild(d);
    });
    els.status = root.querySelector('#cx-status');
    els.main = root.querySelector('#cx-main');
    els.lcd = root.querySelector('#cx-lcd');
    els.pad = pad;
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
    attachDrag();
  }

  function statusHTML() {
    var s = st.setup, parts = [];
    if (st.shift) parts.push('<span>S</span>');
    if (st.alpha) parts.push('<span>A</span>');
    if (st.hyp) parts.push('<span>hyp</span>');
    if (st.pending) parts.push('<span>' + st.pending + '</span>');
    if (st.vars.M) parts.push('<span>M</span>');
    parts.push('<span class="md">' + (MODES.filter(function (m) { return m[0] === st.mode; })[0][1]) + '</span>');
    parts.push('<span>' + (s.angle === 'DEG' ? 'D' : s.angle === 'RAD' ? 'R' : 'G') + '</span>');
    if (s.disp === 'fix') parts.push('<span>FIX</span>'); else if (s.disp === 'sci') parts.push('<span>SCI</span>');
    parts.push('<span>' + (s.io === 'math' ? 'Math' : 'Line') + '</span>');
    if (st.mode === 'BASE') parts.push('<span>' + ({ 10: 'DEC', 16: 'HEX', 2: 'BIN', 8: 'OCT' }[st.base]) + '</span>');
    return parts.join('');
  }

  function menuHTML() {
    var m = st.menu, pg = m.pages[m.page || 0], cols = m.cols || 1;
    var html = '<div class="cx-title"><span>' + esc(m.title) + '</span><span>' + (m.pages.length > 1 ? 'page ' + ((m.page || 0) + 1) + '/' + m.pages.length + '  ▲▼' : '[AC] cancel') + '</span></div>';
    html += '<div class="cx-menu" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">';
    pg.forEach(function (it, i) {
      html += '<div class="cx-mi" data-mi="' + i + '" title="' + esc(it.hint === undefined ? it.label : it.hint) + '">' + (it.k !== '' ? '<i>' + esc(it.k) + '</i>' : '') + esc(it.label) + '</div>';
    });
    return html + '</div>';
  }
  function gridHTML() {
    var g = st.g, html = '<div class="cx-title"><span>' + esc(g.title || '') + '</span><span>' + gridHint(g) + '</span></div>';
    if (g.kind === 'mat') {
      html += '<div class="cx-chips">' + ['A', 'B', 'C'].map(function (n) { return '<button class="cx-chip' + (st.mtab === n ? ' on' : '') + '" data-mat="' + n + '">Mat' + n + '</button>'; }).join('') +
        '<button class="cx-chip" data-dim="r+">rows +</button><button class="cx-chip" data-dim="r-">rows −</button><button class="cx-chip" data-dim="c+">cols +</button><button class="cx-chip" data-dim="c-">cols −</button></div>';
    }
    if (g.kind === 'vct') {
      html += '<div class="cx-chips">' + ['A', 'B', 'C'].map(function (n) { return '<button class="cx-chip' + (st.vtab === n ? ' on' : '') + '" data-vct="' + n + '">Vct' + n + '</button>'; }).join('') +
        '<button class="cx-chip" data-dim="v+">dim +</button><button class="cx-chip" data-dim="v-">dim −</button></div>';
    }
    html += '<table class="cx-tbl">';
    if (g.cols && g.cols[0] !== '' && (g.kind === 'stat' || g.kind === 'eqn')) html += '<tr>' + (g.rowLabels ? '<th></th>' : '<th></th>') + g.cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>';
    g.cells.forEach(function (row, r) {
      html += '<tr>' + (g.kind === 'stat' ? '<td class="lab">' + (r + 1) + '</td>' : g.rowLabels ? '<td class="lab">' + esc(g.rowLabels[r]) + '</td>' : '<td class="lab"></td>');
      row.forEach(function (c, ci) {
        html += '<td class="cell' + (g.r === r && g.c === ci ? ' cur' : '') + '" data-r="' + r + '" data-c="' + ci + '">' + (esc(String(c).replace('-', MINUS)) || '&nbsp;') + '</td>';
      });
      html += '</tr>';
    });
    return html + '</table>';
  }
  function gridHint(g) {
    if (g.kind === 'stat') return '[=] next · [AC] calc';
    if (g.kind === 'eqn') return '[=] next / solve';
    if (g.kind === 'prompt') return '[=] go';
    if (g.kind === 'tblp') return '[=] table';
    return '[=] next · [AC] calc';
  }
  function outHTML() {
    var o = st.out;
    if (!o) return '';
    if (o.err) return '<div class="cx-err">' + esc(o.err) + '</div><div class="cx-hint">[AC] : Back</div>';
    var html = '<div class="cx-title"><span>' + esc(o.title || '') + '</span><span>[AC] back</span></div>';
    if (o.kind === 'stat') {
      o.rows.forEach(function (r, i) {
        html += '<div class="cx-stat-row" data-sr="' + i + '"><span>' + esc(r.label) + '</span><span>' + numHTML(r.v, false, { noExact: true }) + '</span></div>';
      });
      return html;
    }
    if (o.kind === 'eqn') {
      o.rows.forEach(function (r) {
        var v = r[1], txt;
        if (E.isC(v)) { var a = E.re(v), b = E.im(v); txt = numHTML(a, true, {}) + (b < 0 ? ' − ' : ' + ') + (Math.abs(b) === 1 ? '' : numHTML(Math.abs(b), true, {})) + 'i'; }
        else txt = numHTML(v, true, {});
        html += '<div class="cx-pair"><b>' + esc(r[0]) + ' =</b> ' + txt + '</div>';
      });
      return html;
    }
    if (o.kind === 'table') {
      html += '<table class="cx-tbl"><tr><th></th><th>X</th><th>F(X)</th></tr>';
      o.rows.forEach(function (r, i) { html += '<tr><td class="lab">' + (i + 1) + '</td><td>' + numHTML(r[0], false, {}) + '</td><td>' + (isNaN(r[1]) ? 'ERROR' : numHTML(r[1], false, {})) + '</td></tr>'; });
      return html + '</table>';
    }
    return html;
  }

  function exprHTML() {
    var label = '';
    if (st.mode === 'TABLE') label = '<div class="cx-title"><span>TABLE · f(X)=</span><span>[=] next</span></div>';
    if (st.mode === 'BASE') label = '<div class="cx-chips">' + [10, 16, 2, 8].map(function (b) { return '<button class="cx-chip' + (st.base === b ? ' on' : '') + '" data-base="' + b + '">' + ({ 10: 'DEC', 16: 'HEX', 2: 'BIN', 8: 'OCT' }[b]) + '</button>'; }).join('') + ['and', 'or', 'xor', 'xnor', 'Not', 'Neg'].map(function (w) { return '<button class="cx-chip" data-logic="' + w + '">' + w + '</button>'; }).join('') + '</div>';
    if (st.mode === 'STAT') label = '<div class="cx-chips"><button class="cx-chip" data-stat="type">Type</button><button class="cx-chip" data-stat="data">Data</button><button class="cx-chip" data-stat="res">Results</button><button class="cx-chip on">Calc</button></div>';
    var html = label;
    var line = st.mode === 'BASE' || st.setup.io === 'line' ? esc(caretText()).replace(/\u0001/g, '<span class="cx-caret"></span>') : nat(caretText());
    if (st.res && st.res.kind !== 'err') line = st.setup.io === 'line' || st.mode === 'BASE' ? esc(edText()) : nat(edText());
    html += '<div class="cx-line edit" id="cx-ed">' + line + '</div>';
    if (st.res && st.res.kind === 'err') html += resultHTML();
    else if (st.res && st.res.kind === 'solve') {
      html += '<div class="cx-res"><div class="cx-pair"><b>X =</b> ' + numHTML(st.res.x, true, {}) + '</div><div class="cx-pair"><b>L−R =</b> ' + numHTML(st.res.res, false, { noExact: true }) + '</div></div>';
    } else if (st.res) html += '<div class="cx-res">' + resultHTML() + '</div>';
    return html;
  }

  function draw() {
    if (!root) return;
    els.status.innerHTML = statusHTML();
    els.lcd.setAttribute('data-c', String(st.setup.contrast));
    if (st.menu) els.main.innerHTML = menuHTML();
    else if (st.scr === 'grid' && st.g) els.main.innerHTML = gridHTML();
    else if (st.scr === 'out') els.main.innerHTML = outHTML();
    else els.main.innerHTML = exprHTML();
    root.querySelector('[data-k="shift"]').classList.toggle('on', st.shift);
    root.querySelector('[data-k="alpha"]').classList.toggle('on', st.alpha);
    var ed = els.main.querySelector('#cx-ed');
    if (ed) ed.scrollLeft = ed.scrollWidth;
    var rs = els.main.querySelector('.cx-res');
    if (rs) rs.scrollLeft = rs.scrollWidth;
    var sb = document.getElementById('btn-fp-calc');
    if (sb) sb.classList.toggle('calc-on', st.open);
    fit();
  }

  /* ═══════════ events ═══════════ */
  function onClick(e) {
    var t = e.target.closest('button, .cx-mi, td.cell, .cx-stat-row');
    if (!t || !root.contains(t)) return;
    if (t.hasAttribute('data-close')) { close(); return; }
    var tab = t.getAttribute('data-tab');
    if (tab) { switchTab(tab); return; }
    var k = t.getAttribute('data-k');
    if (k) { press(k); return; }
    if (t.hasAttribute('data-mi')) { var it = st.menu.pages[st.menu.page || 0][Number(t.getAttribute('data-mi'))]; if (it) { var m = st.menu; it.run(); draw(); } return; }
    if (t.matches('td.cell')) { commitCell(); st.g.r = Number(t.getAttribute('data-r')); st.g.c = Number(t.getAttribute('data-c')); st.g.typing = false; draw(); return; }
    if (t.hasAttribute('data-mat')) { commitCell(); st.mtab = t.getAttribute('data-mat'); openMatrixEditor(); draw(); return; }
    if (t.hasAttribute('data-vct')) { commitCell(); st.vtab = t.getAttribute('data-vct'); openVectorEditor(); draw(); return; }
    var dim = t.getAttribute('data-dim');
    if (dim) { if (dim === 'r+') resizeMat(1, 0); else if (dim === 'r-') resizeMat(-1, 0); else if (dim === 'c+') resizeMat(0, 1); else if (dim === 'c-') resizeMat(0, -1); else if (dim === 'v+') resizeVct(1); else resizeVct(-1); draw(); return; }
    if (t.hasAttribute('data-base')) { st.base = Number(t.getAttribute('data-base')); st.res = null; draw(); return; }
    var logic = t.getAttribute('data-logic');
    if (logic) { st.res = null; insertTokens(logic === 'Not' || logic === 'Neg' ? [logic, '('] : [logic]); draw(); return; }
    var sc = t.getAttribute('data-stat');
    if (sc) { if (sc === 'type') statTypeMenu(); else if (sc === 'data') openStatData(); else statResults(); draw(); return; }
    if (t.hasAttribute('data-sr') && st.out && st.out.kind === 'stat') {
      var row = st.out.rows[Number(t.getAttribute('data-sr'))];
      if (row && row.tok) { st.out = null; st.scr = 'expr'; clearEditor(); insertTokens([row.tok]); equals(); draw(); }
      return;
    }
  }

  var KMAP = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'div', '.': 'dot', ',': 'dot', '(': 'lp', ')': 'rp', '=': 'eq', Enter: 'eq', Backspace: 'del', Delete: 'ac', Escape: null, '^': 'pow', '!': null, '%': null, ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var key = e.key;
    if (key === 'Escape') { if (st.menu) { closeMenu(); draw(); } else close(); e.preventDefault(); e.stopPropagation(); return; }
    var id = null;
    if (/^[0-9]$/.test(key)) id = key;
    else if (KMAP[key]) id = KMAP[key];
    else if (key === 'p' || key === 'P') { if (!st.menu) { runAct(ins(['π'])); draw(); } e.preventDefault(); e.stopPropagation(); return; }
    else if (key === '!') { if (!st.menu) { runAct(ins(['!'])); draw(); } e.preventDefault(); e.stopPropagation(); return; }
    else if (key === '%') { if (!st.menu) { runAct(ins(['%'])); draw(); } e.preventDefault(); e.stopPropagation(); return; }
    else if (/^[a-fA-FxXyYmM]$/.test(key) && !st.menu) { var ch = key.toUpperCase(); if (ch === 'M' || 'ABCDEFXY'.indexOf(ch) >= 0) { if (st.scr === 'grid' && st.g) gridInsert(ch); else { st.res = null; insertTokens([ch]); } draw(); } e.preventDefault(); e.stopPropagation(); return; }
    if (!id) return;
    e.preventDefault(); e.stopPropagation();
    press(id);
  }

  /* drag */
  function attachDrag() {
    var head = root.querySelector('#cx-head'), drag = null;
    head.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      var r = root.getBoundingClientRect();
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId };
      try { head.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
    });
    head.addEventListener('pointermove', function (e) { if (drag && e.pointerId === drag.id) place(e.clientX - drag.dx, e.clientY - drag.dy); });
    function end(e) {
      if (!drag) return;
      drag = null;
      try { head.releasePointerCapture(e.pointerId); } catch (er) { /* ignore */ }
      var r = root.getBoundingClientRect();
      st.pos = { x: Math.round(r.left), y: Math.round(r.top) };
      save();
    }
    head.addEventListener('pointerup', end);
    head.addEventListener('pointercancel', end);
  }
  function place(x, y) {
    var w = root.offsetWidth * (zoom || 1), h = root.offsetHeight * (zoom || 1);
    root.style.left = Math.max(4, Math.min(x, window.innerWidth - w - 4)) + 'px';
    root.style.top = Math.max(4, Math.min(y, window.innerHeight - h - 4)) + 'px';
  }
  var zoom = 1;
  function fit() {
    if (!root || !st.open) return;
    root.style.zoom = '';
    var h = root.offsetHeight, avail = window.innerHeight - 12;
    zoom = h > avail ? Math.max(0.55, avail / h) : 1;
    root.style.zoom = zoom < 1 ? String(zoom) : '';
  }

  /* tabs: Standard / Scientific / fx */
  function switchTab(tab) {
    if (tab === 'fx') return;
    var pos = root.getBoundingClientRect();
    st.pos = { x: Math.round(pos.left), y: Math.round(pos.top) };
    close(true);
    if (window.Calculator && Calculator.openMode) Calculator.openMode(tab, st.pos);
  }

  /* ═══════════ open / close ═══════════ */
  function open(pos) {
    build();
    st.open = true;
    root.classList.add('open');
    if (st.scr === 'expr' && st.mode === 'COMP' && !st.ed.t.length) clearEditor();
    draw();
    var p = pos || st.pos || { x: 92, y: 20 };
    place(p.x, p.y);
    try { root.focus({ preventScroll: true }); } catch (e) { root.focus(); }
  }
  function close(silent) {
    if (!root) return;
    st.open = false;
    root.classList.remove('open');
    var sb = document.getElementById('btn-fp-calc');
    if (sb && !silent) sb.classList.remove('calc-on');
    save();
  }
  function toggle() { if (st.open) close(); else open(); }

  load();
  window.addEventListener('resize', function () { if (st.open) { fit(); var r = root.getBoundingClientRect(); place(r.left, r.top); } });

  return {
    open: open, close: close, toggle: toggle, isOpen: function () { return st.open; },
    _state: st, _press: function (id) { build(); press(id); }, _setMode: function (m) { build(); setMode(m); draw(); },
    _text: function () { return edText(); }, _resHTML: resultHTML, _ctx: ctx, _build: build
  };
})();
