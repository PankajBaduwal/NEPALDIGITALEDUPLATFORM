/**
 * CasioEngine — the maths behind the fx-991ES PLUS style calculator on the Smart Board.
 * Pure logic, no DOM. Covers: COMP expressions (fractions, powers, roots, logs, trig + hyperbolic, DMS, nPr/nCr, factorial,
 * Pol/Rec, Int/Intg/Rnd, random, integrals, derivatives, sums, SOLVE), CMPLX, STAT (1-var / 2-var / 7 regressions / normal
 * distribution), BASE-N (32-bit), EQN (2/3 unknowns, quadratic, cubic, quartic), MATRIX (up to 3x3), VECTOR (2D/3D), TABLE,
 * the 40 scientific constants, the 40 unit conversions, and number formatting (Norm 1/2, Fix, Sci, ENG, exact fractions / roots / pi).
 */
var CasioEngine = (function () {
  'use strict';
  var PI = Math.PI;

  /* ───────── errors & value kinds ───────── */
  function Err(m) { this.message = m; this.isCasio = true; }
  function mathErr() { throw new Err('Math ERROR'); }
  function synErr() { throw new Err('Syntax ERROR'); }
  function argErr() { throw new Err('Argument ERROR'); }
  function dimErr() { throw new Err('Dimension ERROR'); }
  function isC(v) { return v !== null && typeof v === 'object' && v.c === 1; }
  function isM(v) { return v !== null && typeof v === 'object' && !!v.m; }
  function isV(v) { return v !== null && typeof v === 'object' && !!v.v; }
  function isP(v) { return v !== null && typeof v === 'object' && !!v.pair; }
  function isS(v) { return typeof v === 'number'; }
  function C(re, im) { return { c: 1, re: re, im: im }; }
  function simp(z) {
    if (!isC(z)) return z;
    var s = Math.max(Math.abs(z.re), Math.abs(z.im), 1);
    return Math.abs(z.im) <= 1e-13 * s ? z.re : z;
  }
  function re(v) { return isC(v) ? v.re : v; }
  function im(v) { return isC(v) ? v.im : 0; }
  function clean(x) { return x === 0 || !isFinite(x) ? x : Number(x.toPrecision(15)); }
  function fin(x) { if (!isFinite(x) || isNaN(x)) mathErr(); return x; }

  /* ───────── complex helpers ───────── */
  function cadd(a, b) { return C(re(a) + re(b), im(a) + im(b)); }
  function csub(a, b) { return C(re(a) - re(b), im(a) - im(b)); }
  function cmul(a, b) { return C(re(a) * re(b) - im(a) * im(b), re(a) * im(b) + im(a) * re(b)); }
  function cdiv(a, b) {
    var d = re(b) * re(b) + im(b) * im(b);
    if (d === 0) mathErr();
    return C((re(a) * re(b) + im(a) * im(b)) / d, (im(a) * re(b) - re(a) * im(b)) / d);
  }
  function cabs(z) { return Math.hypot(re(z), im(z)); }
  function carg(z) { return Math.atan2(im(z), re(z)); }
  function cexp(z) { var e = Math.exp(re(z)); return C(e * Math.cos(im(z)), e * Math.sin(im(z))); }
  function cln(z) { if (re(z) === 0 && im(z) === 0) mathErr(); return C(Math.log(cabs(z)), carg(z)); }
  function csqrt(z) {
    var r = cabs(z), a = Math.sqrt((r + re(z)) / 2), b = Math.sqrt((r - re(z)) / 2);
    return C(a, im(z) < 0 ? -b : b);
  }
  function cpow(a, b) {
    if (re(a) === 0 && im(a) === 0) { if (re(b) === 0 && im(b) === 0) mathErr(); return C(0, 0); }
    return cexp(cmul(b, cln(a)));
  }
  var I = C(0, 1);
  function csin(z) { return C(Math.sin(re(z)) * Math.cosh(im(z)), Math.cos(re(z)) * Math.sinh(im(z))); }
  function ccos(z) { return C(Math.cos(re(z)) * Math.cosh(im(z)), -Math.sin(re(z)) * Math.sinh(im(z))); }
  function csinh(z) { return C(Math.sinh(re(z)) * Math.cos(im(z)), Math.cosh(re(z)) * Math.sin(im(z))); }
  function ccosh(z) { return C(Math.cosh(re(z)) * Math.cos(im(z)), Math.sinh(re(z)) * Math.sin(im(z))); }

  /* ───────── generic arithmetic (numbers, complex, matrices, vectors) ───────── */
  function matMap2(a, b, f) {
    if (a.m.length !== b.m.length || a.m[0].length !== b.m[0].length) dimErr();
    return { m: a.m.map(function (r, i) { return r.map(function (x, j) { return f(x, b.m[i][j]); }); }) };
  }
  function add(a, b) {
    if (isM(a) && isM(b)) return matMap2(a, b, function (x, y) { return x + y; });
    if (isV(a) && isV(b)) { if (a.v.length !== b.v.length) dimErr(); return { v: a.v.map(function (x, i) { return x + b.v[i]; }) }; }
    if (isM(a) || isM(b) || isV(a) || isV(b)) argErr();
    if (isC(a) || isC(b)) return simp(C(re(a) + re(b), im(a) + im(b)));
    return a + b;
  }
  function sub(a, b) {
    if (isM(a) && isM(b)) return matMap2(a, b, function (x, y) { return x - y; });
    if (isV(a) && isV(b)) { if (a.v.length !== b.v.length) dimErr(); return { v: a.v.map(function (x, i) { return x - b.v[i]; }) }; }
    if (isM(a) || isM(b) || isV(a) || isV(b)) argErr();
    if (isC(a) || isC(b)) return simp(C(re(a) - re(b), im(a) - im(b)));
    return a - b;
  }
  function matMul(a, b) {
    if (a.m[0].length !== b.m.length) dimErr();
    var out = [];
    for (var i = 0; i < a.m.length; i++) {
      out.push([]);
      for (var j = 0; j < b.m[0].length; j++) {
        var s = 0;
        for (var k = 0; k < b.m.length; k++) s += a.m[i][k] * b.m[k][j];
        out[i].push(s);
      }
    }
    return { m: out };
  }
  function mul(a, b) {
    if (isM(a) && isM(b)) return matMul(a, b);
    if (isM(a) && isS(b)) return { m: a.m.map(function (r) { return r.map(function (x) { return x * b; }); }) };
    if (isS(a) && isM(b)) return mul(b, a);
    if (isV(a) && isV(b)) return cross(a, b);
    if (isV(a) && isS(b)) return { v: a.v.map(function (x) { return x * b; }) };
    if (isS(a) && isV(b)) return mul(b, a);
    if (isM(a) || isM(b) || isV(a) || isV(b)) argErr();
    if (isC(a) || isC(b)) return simp(cmul(a, b));
    return a * b;
  }
  function div(a, b) {
    if ((isM(a) || isV(a)) && isS(b)) { if (b === 0) mathErr(); return mul(a, 1 / b); }
    if (isM(a) || isM(b) || isV(a) || isV(b)) argErr();
    if (isC(a) || isC(b)) return simp(cdiv(a, b));
    if (b === 0) mathErr();
    return a / b;
  }
  function cross(a, b) {
    var x = a.v.length === 2 ? [a.v[0], a.v[1], 0] : a.v, y = b.v.length === 2 ? [b.v[0], b.v[1], 0] : b.v;
    if (x.length !== 3 || y.length !== 3) dimErr();
    var r = [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
    return { v: a.v.length === 2 && b.v.length === 2 ? r : r };
  }
  function dot(a, b) {
    if (!isV(a) || !isV(b)) argErr();
    if (a.v.length !== b.v.length) dimErr();
    var s = 0;
    a.v.forEach(function (x, i) { s += x * b.v[i]; });
    return s;
  }
  function det(a) {
    if (!isM(a)) argErr();
    var n = a.m.length;
    if (n !== a.m[0].length) dimErr();
    var m = a.m.map(function (r) { return r.slice(); }), d = 1;
    for (var c = 0; c < n; c++) {
      var p = c;
      for (var r = c + 1; r < n; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
      if (Math.abs(m[p][c]) < 1e-14) return 0;
      if (p !== c) { var t = m[p]; m[p] = m[c]; m[c] = t; d = -d; }
      d *= m[c][c];
      for (r = c + 1; r < n; r++) {
        var f = m[r][c] / m[c][c];
        for (var k = c; k < n; k++) m[r][k] -= f * m[c][k];
      }
    }
    return d;
  }
  function inv(a) {
    var n = a.m.length;
    if (n !== a.m[0].length) dimErr();
    var m = a.m.map(function (r, i) { return r.concat(r.map(function (_, j) { return i === j ? 1 : 0; })); });
    for (var c = 0; c < n; c++) {
      var p = c;
      for (var r = c + 1; r < n; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
      if (Math.abs(m[p][c]) < 1e-12) mathErr();
      var t = m[p]; m[p] = m[c]; m[c] = t;
      var d = m[c][c];
      for (var k = 0; k < 2 * n; k++) m[c][k] /= d;
      for (r = 0; r < n; r++) if (r !== c) {
        var f = m[r][c];
        if (f !== 0) for (k = 0; k < 2 * n; k++) m[r][k] -= f * m[c][k];
      }
    }
    return { m: m.map(function (r) { return r.slice(n).map(clean); }) };
  }
  function trn(a) {
    return { m: a.m[0].map(function (_, j) { return a.m.map(function (r) { return r[j]; }); }) };
  }
  function isInt(x) { return Math.abs(x - Math.round(x)) < 1e-9; }
  function ratOddRoot(b) { // b = p/q with q odd ⇒ real root of a negative base
    for (var q = 1; q <= 99; q += 2) { var p = b * q; if (Math.abs(p - Math.round(p)) < 1e-9 * q) return { p: Math.round(p), q: q }; }
    return null;
  }
  function pow(a, b, ctx) {
    if (isM(a)) {
      if (!isS(b) || !isInt(b)) argErr();
      b = Math.round(b);
      if (b === -1) return inv(a);
      if (b === 2) return mul(a, a);
      if (b === 3) return mul(mul(a, a), a);
      if (b === 1) return a;
      argErr();
    }
    if (isV(b) || isM(b) || isV(a)) argErr();
    if (isC(a) || isC(b)) {
      if (!ctx.complex) mathErr();
      if (isS(b) && isInt(b) && Math.abs(b) <= 64) { // exact integer powers
        var r = C(1, 0), n = Math.abs(Math.round(b));
        for (var i = 0; i < n; i++) r = cmul(r, a);
        return simp(b < 0 ? cdiv(C(1, 0), r) : r);
      }
      return simp(cpow(a, b));
    }
    if (a === 0 && b === 0) mathErr();
    if (a === 0 && b < 0) mathErr();
    if (a < 0 && !isInt(b)) {
      var rr = ratOddRoot(b);
      if (rr) { var v = Math.pow(-a, b); return rr.p % 2 === 0 ? fin(v) : -fin(v); }
      if (ctx.complex) return simp(cpow(C(a, 0), b));
      mathErr();
    }
    return fin(Math.pow(a, b));
  }

  /* ───────── angle helpers ───────── */
  function toRad(x, ctx) { return ctx.angle === 'DEG' ? x * PI / 180 : ctx.angle === 'GRA' ? x * PI / 200 : x; }
  function fromRad(x, ctx) { return ctx.angle === 'DEG' ? x * 180 / PI : ctx.angle === 'GRA' ? x * 200 / PI : x; }
  function snap(x) { return Math.abs(x) < 1e-14 ? 0 : x; }

  /* ───────── factorial, nPr, nCr ───────── */
  function fact(n) {
    if (!isS(n) || n < 0 || !isInt(n) || n > 69) mathErr();
    n = Math.round(n);
    var r = 1;
    for (var i = 2; i <= n; i++) r *= i;
    return r;
  }
  function nPr(n, r) {
    if (!isS(n) || !isS(r) || n < 0 || r < 0 || !isInt(n) || !isInt(r) || r > n) mathErr();
    n = Math.round(n); r = Math.round(r);
    var o = 1;
    for (var i = n - r + 1; i <= n; i++) o *= i;
    return o;
  }
  function nCr(n, r) {
    if (!isS(n) || !isS(r) || n < 0 || r < 0 || !isInt(n) || !isInt(r) || r > n) mathErr();
    n = Math.round(n); r = Math.round(r);
    var k = Math.min(r, n - r), o = 1;
    for (var i = 1; i <= k; i++) o = o * (n - k + i) / i;
    return Math.round(o);
  }

  /* ───────── normal distribution ───────── */
  function erf(x) {
    var ax = Math.abs(x), r;
    if (ax < 3) { // Taylor series
      var sum = ax, term = ax, n = 0;
      while (Math.abs(term) > 1e-17 * Math.abs(sum) && n < 200) { n++; term *= -ax * ax / n; sum += term / (2 * n + 1); }
      r = 2 / Math.sqrt(PI) * sum;
    } else { // continued fraction for erfc
      var f = 0;
      for (var k = 60; k >= 1; k--) f = k / 2 / (ax + f);
      r = 1 - Math.exp(-ax * ax) / Math.sqrt(PI) / (ax + f);
    }
    return x < 0 ? -r : r;
  }
  function phi(t) { return 0.5 * (1 + erf(t / Math.SQRT2)); }

  /* ───────── numerical calculus ───────── */
  var GK_X = [0.991455371120813, 0.949107912342759, 0.864864423359769, 0.741531185599394, 0.586087235467691, 0.405845151377397, 0.207784955007898, 0];
  var GK_WK = [0.022935322010529, 0.063092092629979, 0.104790010322250, 0.140653259715525, 0.169004726639267, 0.190350578064785, 0.204432940075298, 0.209482141084728];
  var GK_WG = [0, 0.129484966168870, 0, 0.279705391489277, 0, 0.381830050505119, 0, 0.417959183673469];
  function gk(f, a, b) {
    var c = (a + b) / 2, h = (b - a) / 2, k = GK_WK[7] * f(c), g = GK_WG[7] * f(c);
    for (var i = 0; i < 7; i++) {
      var dx = h * GK_X[i], s = f(c - dx) + f(c + dx);
      k += GK_WK[i] * s; g += GK_WG[i] * s;
    }
    return { v: k * h, e: Math.abs((k - g) * h) };
  }
  function adapt(f, a, b, tol, depth) {
    var r = gk(f, a, b);
    if (r.e < tol || depth > 24) return r.v;
    var m = (a + b) / 2;
    return adapt(f, a, m, tol / 2, depth + 1) + adapt(f, m, b, tol / 2, depth + 1);
  }
  function integrate(f, a, b) {
    if (a === b) return 0;
    var sgn = 1;
    if (a > b) { var t = a; a = b; b = t; sgn = -1; }
    var v = adapt(function (x) { var y = f(x); if (!isS(y)) argErr(); return fin(y); }, a, b, 1e-11, 0);
    return sgn * Number(v.toPrecision(11));
  }
  function derivative(f, a) {
    var h = 1e-3 * Math.max(1, Math.abs(a));
    function d(hh) { return (-f(a + 2 * hh) + 8 * f(a + hh) - 8 * f(a - hh) + f(a - 2 * hh)) / (12 * hh); }
    var d1 = d(h), d2 = d(h / 2);
    var v = (16 * d2 - d1) / 15; // Richardson extrapolation
    return Number(fin(v).toPrecision(10));
  }
  function summation(f, a, b) {
    a = Math.round(a); b = Math.round(b);
    if (b < a || b - a > 100000) argErr();
    var s = 0;
    for (var k = a; k <= b; k++) s += f(k);
    return s;
  }
  function solveEq(f, guess) { // f(x) = 0 near the guess
    function fn(x) { var y = f(x); return isS(y) ? y : NaN; }
    function newton(x0) {
      var x = x0;
      for (var i = 0; i < 80; i++) {
        var y = fn(x);
        if (isNaN(y)) return null;
        if (Math.abs(y) < 1e-12) return x;
        var h = 1e-6 * Math.max(1, Math.abs(x)), d = (fn(x + h) - fn(x - h)) / (2 * h);
        if (!d || isNaN(d)) return null;
        var nx = x - y / d;
        if (Math.abs(nx - x) < 1e-13 * Math.max(1, Math.abs(x))) return Math.abs(fn(nx)) < 1e-8 ? nx : null;
        x = nx;
      }
      return Math.abs(fn(x)) < 1e-8 ? x : null;
    }
    var r = newton(guess);
    if (r === null) { // widen the search around the guess
      for (var s = 1; s <= 40 && r === null; s *= 1.6) {
        var cand = [guess + s, guess - s, guess + s / 2, guess - s / 2];
        for (var i = 0; i < cand.length && r === null; i++) r = newton(cand[i]);
      }
    }
    if (r === null) throw new Err('Can\'t Solve');
    if (Math.abs(r) < 1e-12) r = 0;
    return { x: Number(r.toPrecision(12)), res: fn(Number(r.toPrecision(12))) };
  }

  /* ───────── tokenizer ───────── */
  var NAMES = ['sinh⁻¹', 'cosh⁻¹', 'tanh⁻¹', 'sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'sinh', 'cosh', 'tanh', 'sin', 'cos', 'tan', 'logb', 'log', 'ln',
    'Abs', 'Intg', 'Int', 'Rnd', 'Pol', 'Rec', 'Conjg', 'Arg', 'Re', 'Im', 'Det', 'Trn', 'RanInt#', 'Ran#', 'Angle', 'Dot', 'PreAns', 'Ans',
    'MatAns', 'MatA', 'MatB', 'MatC', 'VctAns', 'VctA', 'VctB', 'VctC', 'Σx²', 'Σy²', 'Σxy', 'Σx', 'Σy', 'σx', 'σy', 'minX', 'maxX',
    'RegA', 'RegB', 'RegC', 'Reg_r', 'x̄', 'ȳ', 'x̂', 'ŷ', 'sx', 'sy', 'd/dx', '∫', 'Σ', '√', '∛', 'π'];
  NAMES.sort(function (a, b) { return b.length - a.length; });
  var CALL_ONLY = { P: 1, Q: 1, R: 1, t: 1 };
  var NUM_RE = /^(?:\d+\.?\d*|\.\d+)(?:ᴇ[-−+]?\d+)?/;
  var SINGLE = 'ABCDEFXYMein';

  function tokenize(src) {
    var out = [], i = 0;
    while (i < src.length) {
      var ch = src.charAt(i), rest = src.slice(i);
      if (ch === ' ') { i++; continue; }
      var m = NUM_RE.exec(rest);
      if (m) { out.push({ t: 'n', v: parseFloat(m[0].replace('ᴇ', 'e').replace('−', '-')) }); i += m[0].length; continue; }
      if (rest.indexOf('nPr') === 0) { out.push({ t: 'op', v: 'nPr' }); i += 3; continue; }
      if (rest.indexOf('nCr') === 0) { out.push({ t: 'op', v: 'nCr' }); i += 3; continue; }
      var hit = null;
      for (var k = 0; k < NAMES.length; k++) if (rest.indexOf(NAMES[k]) === 0) { hit = NAMES[k]; break; }
      if (hit) { out.push({ t: 'id', v: hit }); i += hit.length; continue; }
      if (CALL_ONLY[ch] && rest.charAt(1) === '(') { out.push({ t: 'id', v: ch }); i++; continue; }
      if (SINGLE.indexOf(ch) >= 0) { out.push({ t: 'id', v: ch }); i++; continue; }
      if ('+−-×÷*/()^!%°′″∠:=,⟨⟩∕ʸ√ʳᵍ'.indexOf(ch) >= 0) {
        if (ch === 'ʸ' && rest.charAt(1) === '√') { out.push({ t: 'op', v: 'ʸ√' }); i += 2; continue; }
        out.push({ t: 'op', v: ch === '-' ? '−' : ch === '*' ? '×' : ch === '/' ? '÷' : ch });
        i++; continue;
      }
      synErr();
    }
    return out;
  }

  /* ───────── parser → closures ───────── */
  function compile(src) {
    var toks = tokenize(src), p = 0;
    function peek() { return toks[p]; }
    function isOp(v) { var t = toks[p]; return !!t && t.t === 'op' && t.v === v; }
    function isId(v) { var t = toks[p]; return !!t && t.t === 'id' && t.v === v; }
    function eat(v) { if (isOp(v)) { p++; return true; } return false; }

    function statements() {
      var list = [expr()];
      while (eat(':')) list.push(expr());
      return function (env) { var v; for (var i = 0; i < list.length; i++) v = list[i](env); return v; };
    }
    function expr() {
      var l = term();
      for (;;) {
        if (isOp('+')) { p++; var r1 = term(); l = (function (a, b) { return function (e) { return add(a(e), b(e)); }; })(l, r1); }
        else if (isOp('−')) { p++; var r2 = term(); l = (function (a, b) { return function (e) { return sub(a(e), b(e)); }; })(l, r2); }
        else break;
      }
      return l;
    }
    function term() {
      var l = signed();
      for (;;) {
        if (isOp('×')) { p++; var r1 = signed(); l = (function (a, b) { return function (e) { return mul(a(e), b(e)); }; })(l, r1); }
        else if (isOp('÷')) { p++; var r2 = signed(); l = (function (a, b) { return function (e) { return div(a(e), b(e)); }; })(l, r2); }
        else break;
      }
      return l;
    }
    function signed() {
      if (isOp('−')) { p++; var a = signed(); return function (e) { var v = a(e); return isM(v) || isV(v) ? mul(v, -1) : isC(v) ? C(-v.re, -v.im) : -v; }; }
      if (isOp('+')) { p++; return signed(); }
      return nxr();
    }
    function nxr() {
      var l = implicit();
      for (;;) {
        if (isOp('nPr')) { p++; var a = implicit(); l = (function (x, y) { return function (e) { return nPr(x(e), y(e)); }; })(l, a); }
        else if (isOp('nCr')) { p++; var b = implicit(); l = (function (x, y) { return function (e) { return nCr(x(e), y(e)); }; })(l, b); }
        else if (isId('Dot')) { p++; var c = implicit(); l = (function (x, y) { return function (e) { return dot(x(e), y(e)); }; })(l, c); }
        else break;
      }
      return l;
    }
    function startsFactor(t) {
      if (!t) return false;
      if (t.t === 'n') return true;
      if (t.t === 'op') return t.v === '(' || t.v === '⟨' || t.v === '√';
      return t.v !== 'Dot';
    }
    function implicit() {
      var l = power();
      while (startsFactor(peek())) { var r = power(); l = (function (a, b) { return function (e) { return mul(a(e), b(e)); }; })(l, r); }
      return l;
    }
    function power() {
      var l = postfix();
      for (;;) {
        if (isOp('^')) {
          p++;
          var ex = isOp('−') ? (p++, (function () { var q = power(); return function (e) { return -q(e); }; })()) : power();
          l = (function (a, b) { return function (e) { return pow(a(e), b(e), e.ctx); }; })(l, ex);
        } else if (isOp('ʸ√')) {
          p++;
          var rad = postfix();
          l = (function (n, x) { return function (e) { var nn = n(e); if (nn === 0) mathErr(); return pow(x(e), div(1, nn), e.ctx); }; })(l, rad);
        } else if (isOp('∠')) {
          p++;
          var th = postfix();
          l = (function (r, t) { return function (e) { var a = toRad(t(e), e.ctx), rr = r(e); return simp(C(clean(snap(rr * Math.cos(a))), clean(snap(rr * Math.sin(a))))); }; })(l, th);
        } else break;
      }
      return l;
    }
    function postfix() {
      var l = primary();
      for (;;) {
        if (isOp('!')) { p++; l = (function (a) { return function (e) { return fact(a(e)); }; })(l); }
        else if (isOp('%')) { p++; l = (function (a) { return function (e) { return div(a(e), 100); }; })(l); }
        else if (isOp('ʳ')) { p++; l = (function (a) { return function (e) { return clean(fromRad(a(e), e.ctx)); }; })(l); }
        else if (isOp('ᵍ')) { p++; l = (function (a) { return function (e) { return clean(fromRad(a(e) * PI / 200, e.ctx)); }; })(l); }
        else break;
      }
      return l;
    }
    function args() {
      if (!eat('(')) synErr();
      var list = [expr()];
      while (eat(',')) list.push(expr());
      eat(')');
      return list;
    }
    function dmsTail(first) { // 12°30′45″ → degrees (converted to the current angle unit at evaluation time)
      var deg = first, parts = 0;
      var res = dmsParts(first);
      return res;
    }
    function dmsParts(first) {
      var deg = first, parts = 0;
      if (isOp('°')) { p++; parts = 1; }
      var t = peek();
      if (parts && t && t.t === 'n' && toks[p + 1] && toks[p + 1].t === 'op' && toks[p + 1].v === '′') { deg += t.v / 60; p += 2; }
      t = peek();
      if (parts && t && t.t === 'n' && toks[p + 1] && toks[p + 1].t === 'op' && toks[p + 1].v === '″') { deg += t.v / 3600; p += 2; }
      if (parts && isOp('′')) p++;
      if (parts && isOp('″')) p++;
      return parts ? { deg: deg } : deg;
    }
    function primary() {
      var t = peek();
      if (!t) synErr();
      if (t.t === 'n') {
        p++;
        var v = dmsTail(t.v);
        if (typeof v === 'object') return function (e) { return clean(fromRad(v.deg * PI / 180, e.ctx)); };
        return function () { return v; };
      }
      if (t.t === 'op') {
        if (t.v === '(') { p++; var inner = expr(); eat(')'); return inner; }
        if (t.v === '⟨') {
          p++;
          var num = expr();
          if (!eat('∕')) synErr();
          var den = expr();
          eat('⟩');
          return function (e) { return div(num(e), den(e)); };
        }
        if (t.v === '√') { p++; return sqrtOf(); }
        synErr();
      }
      p++;
      var id = t.v;
      switch (id) {
        case 'π': return function () { return PI; };
        case 'e': return function () { return Math.E; };
        case 'i': return function (e) { if (!e.ctx.complex) mathErr(); return C(0, 1); };
        case 'Ans': return function (e) { return e.ctx.ans === undefined ? 0 : e.ctx.ans; };
        case 'PreAns': return function (e) { return e.ctx.preAns === undefined ? 0 : e.ctx.preAns; };
        case 'Ran#': return function (e) { return Math.floor((e.ctx.rand ? e.ctx.rand() : Math.random()) * 1000) / 1000; };
        case '√': return sqrtOf();
        case '∛': { var a3 = isOp('(') ? parenExpr() : primary(); return function (e) { var x = a3(e); return isS(x) ? Math.cbrt(x) : pow(x, 1 / 3, e.ctx); }; }
        case 'MatA': case 'MatB': case 'MatC': case 'MatAns':
          return function (e) { var m = e.ctx.mats && e.ctx.mats[id.slice(3)]; if (!m) mathErr(); return { m: m.map(function (r) { return r.slice(); }) }; };
        case 'VctA': case 'VctB': case 'VctC': case 'VctAns':
          return function (e) { var v = e.ctx.vcts && e.ctx.vcts[id.slice(3)]; if (!v) mathErr(); return { v: v.slice() }; };
        case 'A': case 'B': case 'C': case 'D': case 'E': case 'F': case 'X': case 'Y': case 'M':
          return function (e) { var x = e.vars && e.vars[id] !== undefined ? e.vars[id] : e.ctx.vars && e.ctx.vars[id]; return x === undefined ? 0 : x; };
        case 'x̄': case 'ȳ': case 'Σx': case 'Σy': case 'Σx²': case 'Σy²': case 'Σxy': case 'σx': case 'σy': case 'sx': case 'sy': case 'minX': case 'maxX':
        case 'RegA': case 'RegB': case 'RegC': case 'Reg_r': case 'n':
          return function (e) { var s = e.ctx.stat; var key = { 'x̄': 'xbar', 'ȳ': 'ybar', 'Σx': 'sx1', 'Σy': 'sy1', 'Σx²': 'sx2', 'Σy²': 'sy2', 'Σxy': 'sxy', 'σx': 'sigx', 'σy': 'sigy', sx: 'sdx', sy: 'sdy', minX: 'minx', maxX: 'maxx', RegA: 'A', RegB: 'B', RegC: 'C', Reg_r: 'r', n: 'n' }[id]; if (!s || s[key] === undefined) mathErr(); return s[key]; };
      }
      return func(id);
    }
    function parenExpr() { if (!eat('(')) synErr(); var x = expr(); eat(')'); return x; }
    function sqrtOf() {
      var a = isOp('(') ? parenExpr() : primary();
      return function (e) {
        var x = a(e);
        if (isC(x)) return simp(csqrt(x));
        if (!isS(x)) argErr();
        if (x < 0) { if (e.ctx.complex) return simp(C(0, Math.sqrt(-x))); mathErr(); }
        return Math.sqrt(x);
      };
    }
    function func(id) {
      var a = args();
      var f0 = a[0];
      function real(e, k) { var x = (k === undefined ? f0 : a[k])(e); if (!isS(x)) argErr(); return x; }
      switch (id) {
        case 'sin': case 'cos': case 'tan':
          return function (e) {
            var x = f0(e);
            if (isC(x)) { if (!e.ctx.complex) mathErr(); return simp(id === 'sin' ? csin(x) : id === 'cos' ? ccos(x) : cdiv(csin(x), ccos(x))); }
            if (!isS(x)) argErr();
            var r = toRad(x, e.ctx);
            if (id === 'sin') return snap(Math.sin(r));
            if (id === 'cos') return snap(Math.cos(r));
            if (Math.abs(Math.cos(r)) < 1e-12) mathErr();
            return snap(Math.tan(r));
          };
        case 'sin⁻¹': case 'cos⁻¹': case 'tan⁻¹':
          return function (e) {
            var x = real(e);
            if (id === 'tan⁻¹') return clean(fromRad(Math.atan(x), e.ctx));
            if (Math.abs(x) > 1) mathErr();
            return clean(fromRad(id === 'sin⁻¹' ? Math.asin(x) : Math.acos(x), e.ctx));
          };
        case 'sinh': case 'cosh': case 'tanh':
          return function (e) {
            var x = f0(e);
            if (isC(x)) { if (!e.ctx.complex) mathErr(); return simp(id === 'sinh' ? csinh(x) : id === 'cosh' ? ccosh(x) : cdiv(csinh(x), ccosh(x))); }
            if (!isS(x)) argErr();
            return fin(id === 'sinh' ? Math.sinh(x) : id === 'cosh' ? Math.cosh(x) : Math.tanh(x));
          };
        case 'sinh⁻¹': return function (e) { return Math.asinh(real(e)); };
        case 'cosh⁻¹': return function (e) { var x = real(e); if (x < 1) mathErr(); return Math.acosh(x); };
        case 'tanh⁻¹': return function (e) { var x = real(e); if (Math.abs(x) >= 1) mathErr(); return Math.atanh(x); };
        case 'log': return function (e) {
          var x = f0(e);
          if (isC(x)) { if (!e.ctx.complex) mathErr(); return simp(cdiv(cln(x), C(Math.LN10, 0))); }
          if (!isS(x) || x <= 0) mathErr();
          return clean(Math.log10(x));
        };
        case 'ln': return function (e) {
          var x = f0(e);
          if (isC(x)) { if (!e.ctx.complex) mathErr(); return simp(cln(x)); }
          if (!isS(x) || x <= 0) mathErr();
          return Math.log(x);
        };
        case 'logb': return function (e) {
          if (a.length < 2) synErr();
          var b = real(e, 0), x = real(e, 1);
          if (b <= 0 || b === 1 || x <= 0) mathErr();
          return clean(Math.log(x) / Math.log(b));
        };
        case 'Abs': return function (e) {
          var x = f0(e);
          if (isM(x)) return { m: x.m.map(function (r) { return r.map(Math.abs); }) };
          if (isV(x)) return Math.sqrt(x.v.reduce(function (s, y) { return s + y * y; }, 0));
          return isC(x) ? cabs(x) : Math.abs(x);
        };
        case 'Int': return function (e) { return Math.trunc(real(e)); };
        case 'Intg': return function (e) { return Math.floor(real(e)); };
        case 'Rnd': return function (e) { return Number(real(e).toPrecision(10)); };
        case 'Conjg': return function (e) { var x = f0(e); return isC(x) ? C(x.re, -x.im) : x; };
        case 'Re': return function (e) { return re(f0(e)); };
        case 'Im': return function (e) { return im(f0(e)); };
        case 'Arg': return function (e) { var x = f0(e); return clean(fromRad(carg(toC(x)), e.ctx)); };
        case 'Det': return function (e) { return clean(det(f0(e))); };
        case 'Trn': return function (e) { var x = f0(e); if (!isM(x)) argErr(); return trn(x); };
        case 'Angle': return function (e) {
          if (a.length < 2) synErr();
          var u = a[0](e), w = a[1](e), nu = Math.sqrt(dot(u, u)), nw = Math.sqrt(dot(w, w));
          if (!nu || !nw) mathErr();
          return clean(fromRad(Math.acos(Math.max(-1, Math.min(1, dot(u, w) / (nu * nw)))), e.ctx));
        };
        case 'Pol': return function (e) {
          if (a.length < 2) synErr();
          var x = real(e, 0), y = real(e, 1), r = Math.hypot(x, y), th = fromRad(Math.atan2(y, x), e.ctx);
          if (e.ctx.vars) { e.ctx.vars.X = clean(r); e.ctx.vars.Y = clean(th); }
          return { pair: [clean(r), clean(th)], names: ['r', 'θ'] };
        };
        case 'Rec': return function (e) {
          if (a.length < 2) synErr();
          var r = real(e, 0), th = toRad(real(e, 1), e.ctx), x = snap(r * Math.cos(th)), y = snap(r * Math.sin(th));
          if (e.ctx.vars) { e.ctx.vars.X = clean(x); e.ctx.vars.Y = clean(y); }
          return { pair: [clean(x), clean(y)], names: ['x', 'y'] };
        };
        case 'RanInt#': return function (e) {
          if (a.length < 2) synErr();
          var lo = Math.round(real(e, 0)), hi = Math.round(real(e, 1));
          if (hi < lo) argErr();
          return lo + Math.floor((e.ctx.rand ? e.ctx.rand() : Math.random()) * (hi - lo + 1));
        };
        case 'P': case 'Q': case 'R': return function (e) {
          var t = real(e);
          return clean(id === 'P' ? phi(t) : id === 'Q' ? phi(t) - 0.5 : 1 - phi(t));
        };
        case 't': return function (e) { var s = e.ctx.stat; if (!s) mathErr(); return clean((real(e) - s.xbar) / s.sigx); };
        case 'x̂': return function (e) { var s = e.ctx.stat; if (!s || !s.estX) mathErr(); return s.estX(real(e))[0]; };
        case 'ŷ': return function (e) { var s = e.ctx.stat; if (!s || !s.estY) mathErr(); return s.estY(real(e)); };
        case '∫': return function (e) {
          if (a.length < 3) synErr();
          var lo = real(e, 1), hi = real(e, 2);
          return integrate(function (x) { return a[0](withVar(e, 'X', x)); }, lo, hi);
        };
        case 'd/dx': return function (e) {
          if (a.length < 2) synErr();
          var at = real(e, 1);
          return derivative(function (x) { var v = a[0](withVar(e, 'X', x)); if (!isS(v)) argErr(); return v; }, at);
        };
        case 'Σ': return function (e) {
          if (a.length < 3) synErr();
          return summation(function (x) { var v = a[0](withVar(e, 'X', x)); if (!isS(v)) argErr(); return v; }, real(e, 1), real(e, 2));
        };
      }
      synErr();
    }
    var prog = statements();
    if (p < toks.length) synErr();
    return prog;
  }
  function toC(x) { return isC(x) ? x : C(x, 0); }
  function withVar(env, name, val) {
    var vars = {};
    for (var k in env.vars) vars[k] = env.vars[k];
    vars[name] = val;
    return { ctx: env.ctx, vars: vars };
  }

  /** Evaluates an expression. ctx: { angle:'DEG'|'RAD'|'GRA', complex:bool, ans, preAns, vars:{}, mats:{}, vcts:{}, stat, rand } */
  function evaluate(src, ctx) {
    ctx = ctx || {};
    ctx.angle = ctx.angle || 'DEG';
    if (!ctx.vars) ctx.vars = {};
    var f = compile(String(src));
    var v = f({ ctx: ctx, vars: ctx.vars });
    return finish(v, ctx);
  }
  function finish(v, ctx) {
    if (isS(v)) { if (!isFinite(v)) mathErr(); return clean(v); }
    if (isC(v)) {
      if (!ctx.complex) mathErr();
      return simp(C(clean(v.re), clean(v.im)));
    }
    if (isM(v)) return { m: v.m.map(function (r) { return r.map(clean); }) };
    if (isV(v)) return { v: v.v.map(clean) };
    return v;
  }

  /** f(X) = L − R for SOLVE; splits "L=R". */
  function solve(src, ctx, guess) {
    var parts = String(src).split('=');
    var left = parts[0], right = parts.length > 1 ? parts[1] : '0';
    if (parts.length > 2) synErr();
    var fl = compile(left), fr = compile(right);
    var res = solveEq(function (x) {
      var env = { ctx: ctx, vars: Object.assign({}, ctx.vars, { X: x }) };
      return sub(fl(env), fr(env));
    }, guess || 0);
    return res;
  }

  /* ───────── number formatting ───────── */
  function frac(x, maxDen, eps) { // continued fraction approximation of |x|
    var ax = Math.abs(x), h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = ax;
    for (var i = 0; i < 40; i++) {
      var a = Math.floor(b), h2 = a * h1 + h0, k2 = a * k1 + k0;
      if (k2 > maxDen) return null;
      h0 = h1; h1 = h2; k0 = k1; k1 = k2;
      if (Math.abs(ax - h1 / k1) <= eps * Math.max(1, ax)) return { n: h1, d: k1 };
      var fr = b - a;
      if (fr < 1e-15) break;
      b = 1 / fr;
    }
    return null;
  }
  function squareFree(n) { // n = s² · r
    var s = 1, r = n;
    for (var f = 2; f * f <= r; f++) while (r % (f * f) === 0) { r /= f * f; s *= f; }
    return { s: s, r: r };
  }
  /** exact form of a real number: fraction, root or pi multiple (or null). */
  function exact(x, hasPi) {
    if (!isFinite(x) || x === 0) return null;
    var neg = x < 0, ax = Math.abs(x);
    if (hasPi) {
      var fp = frac(ax / PI, 360, 1e-11);
      if (fp && !(fp.n === 0)) return { kind: 'pi', neg: neg, n: fp.n, d: fp.d };
    }
    var f = frac(ax, 99999, 1e-11);
    if (f && f.d > 1 && f.n <= 1e9) return { kind: 'frac', neg: neg, n: f.n, d: f.d };
    if (f && f.d === 1) return null; // integers are shown plainly
    var sq = frac(ax * ax, 5000, 1e-11);
    if (sq && sq.n <= 1e8) {
      var sf = squareFree(sq.n * sq.d), outer = sf.s, rad = sf.r;
      if (rad > 1) return { kind: 'root', neg: neg, k: outer, r: rad, d: sq.d };
    }
    return null;
  }
  function trimMant(s) { return s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s; }
  /** settings: { mode:'norm1'|'norm2'|'fix'|'sci', digits:n, eng:k, comma } */
  function fmtReal(x, S) {
    S = S || {};
    if (!isFinite(x)) return 'Math ERROR';
    if (x === 0) return S.mode === 'fix' ? (0).toFixed(S.digits || 0) : S.mode === 'sci' ? (0).toExponential(Math.max(0, (S.digits || 10) - 1)).replace('e+0', 'ᴇ0') : '0';
    var out, ax = Math.abs(x), engOn = typeof S.engShift === 'number';
    function expForm(mantDigits) {
      var s = x.toExponential(Math.max(0, mantDigits - 1));
      var m = s.split('e'), mant = trimMant(m[0]), e = parseInt(m[1], 10);
      if (engOn) { // engineering: exponent a multiple of 3; engShift 0 = standard form, +1 / -1 move it by three
        var e3 = Math.floor(Math.log10(ax) / 3) * 3 + 3 * S.engShift;
        var mm = x / Math.pow(10, e3);
        return trimMant(Number(mm.toPrecision(10)).toString()) + 'ᴇ' + e3;
      }
      return mant + 'ᴇ' + e;
    }
    if (engOn) out = expForm(10);
    else if (S.mode === 'sci') out = (function () { var d = S.digits || 10; var s = x.toExponential(d - 1).split('e'); return s[0] + 'ᴇ' + parseInt(s[1], 10); })();
    else if (S.mode === 'fix') {
      if (ax >= 1e10) out = expForm(10);
      else out = x.toFixed(S.digits || 0);
    } else {
      var lo = S.mode === 'norm2' ? 1e-9 : 1e-2;
      if (ax >= 1e10 || ax < lo) out = expForm(10);
      else {
        var p = Number(x.toPrecision(10));
        out = String(p);
        if (/e/.test(out)) out = expForm(10);
      }
    }
    if (S.comma) out = out.replace('.', ',');
    return out;
  }

  /* ───────── DMS ───────── */
  function toDMS(x) {
    var neg = x < 0, a = Math.abs(x), d = Math.floor(a + 1e-12), mFull = (a - d) * 60, m = Math.floor(mFull + 1e-9), s = (mFull - m) * 60;
    s = Number(s.toFixed(2));
    if (s >= 60) { s -= 60; m += 1; }
    if (m >= 60) { m -= 60; d += 1; }
    return (neg ? '-' : '') + d + '°' + m + '′' + trimMant(s.toFixed(2)) + '″';
  }

  /* ───────── BASE-N (32-bit) ───────── */
  var BASE_MAP = { DEC: 10, HEX: 16, BIN: 2, OCT: 8 };
  function wrap32(n) { n = n % 4294967296; if (n < 0) n += 4294967296; return n >= 2147483648 ? n - 4294967296 : n; }
  function evalBase(src, base) {
    var toks = [], i = 0, digits = '0123456789ABCDEF'.slice(0, base);
    var s = String(src).replace(/\s+/g, '');
    var words = ['xnor', 'xor', 'and', 'or', 'Not(', 'Neg('];
    while (i < s.length) {
      var rest = s.slice(i), w = null;
      for (var k = 0; k < words.length; k++) if (rest.indexOf(words[k]) === 0) { w = words[k]; break; }
      if (w) { toks.push(w === 'Not(' || w === 'Neg(' ? { f: w.slice(0, 3) } : { b: w }); if (w === 'Not(' || w === 'Neg(') toks.push('('); i += w.length; continue; }
      var ch = s.charAt(i);
      if ('+−-×÷*/()'.indexOf(ch) >= 0) { toks.push(ch === '-' ? '−' : ch === '*' ? '×' : ch === '/' ? '÷' : ch); i++; continue; }
      var j = i, str = '';
      while (j < s.length && digits.indexOf(s.charAt(j).toUpperCase()) >= 0) { str += s.charAt(j).toUpperCase(); j++; }
      if (!str) synErr();
      var val = parseInt(str, base);
      if (base === 10 && (val > 2147483647)) mathErr();
      if (base !== 10 && val > 4294967295) mathErr();
      if (base === 2 && str.length > 32) mathErr();
      toks.push({ n: base === 10 ? val : wrap32(val) });
      i = j;
    }
    var p = 0;
    function cur() { return toks[p]; }
    function prim() {
      var t = toks[p];
      if (t === undefined) synErr();
      if (t === '(') { p++; var v = orLevel(); if (toks[p] === ')') p++; return v; }
      if (t && t.f) { p++; if (toks[p] === '(') { p++; var x = orLevel(); if (toks[p] === ')') p++; return t.f === 'Not' ? wrap32(~x) : wrap32(-x); } synErr(); }
      if (t === '−') { p++; return wrap32(-prim()); }
      if (t && t.n !== undefined) { p++; return t.n; }
      synErr();
    }
    function mulLevel() { var l = prim(); while (toks[p] === '×' || toks[p] === '÷') { var op = toks[p++], r = prim(); if (op === '÷') { if (r === 0) mathErr(); l = Math.trunc(l / r); } else l = wrap32(l * r); } return l; }
    function addLevel() { var l = mulLevel(); while (toks[p] === '+' || toks[p] === '−') { var op = toks[p++], r = mulLevel(); l = wrap32(op === '+' ? l + r : l - r); } return l; }
    function andLevel() { var l = addLevel(); while (cur() && cur().b === 'and') { p++; l = wrap32(l & addLevel()); } return l; }
    function orLevel() {
      var l = andLevel();
      while (cur() && (cur().b === 'or' || cur().b === 'xor' || cur().b === 'xnor')) {
        var op = toks[p++].b, r = andLevel();
        l = wrap32(op === 'or' ? (l | r) : op === 'xor' ? (l ^ r) : ~(l ^ r));
      }
      return l;
    }
    var out = orLevel();
    if (p < toks.length) synErr();
    return out;
  }
  function toBase(n, base) {
    if (base === 10) return String(n);
    var u = n < 0 ? n + 4294967296 : n;
    return u.toString(base).toUpperCase();
  }

  /* ───────── polynomial roots ───────── */
  function polyRoots(coef) { // coef[0] x^n + ... ; returns complex roots
    while (coef.length > 1 && coef[0] === 0) coef = coef.slice(1);
    var n = coef.length - 1;
    if (n < 1) mathErr();
    var a = coef.map(function (c) { return c / coef[0]; });
    function ev(z) { var r = C(a[0], 0); for (var i = 1; i <= n; i++) r = cadd(cmul(r, z), C(a[i], 0)); return r; }
    var roots = [], R = 1 + Math.max.apply(null, a.slice(1).map(Math.abs));
    for (var k = 0; k < n; k++) roots.push(cmul(C(0.4, 0.9), cpow(C(R * 0.8 + 0.01 * k, 0), C(k, 0)))); // spread starting points
    roots = roots.map(function (_, k) { return C(R * 0.7 * Math.cos(2 * PI * k / n + 0.4), R * 0.7 * Math.sin(2 * PI * k / n + 0.4)); });
    for (var it = 0; it < 500; it++) {
      var maxd = 0;
      for (var i = 0; i < n; i++) {
        var den = C(1, 0);
        for (var j = 0; j < n; j++) if (j !== i) den = cmul(den, csub(roots[i], roots[j]));
        var d = cdiv(ev(roots[i]), den);
        roots[i] = csub(roots[i], d);
        maxd = Math.max(maxd, cabs(d));
      }
      if (maxd < 1e-15) break;
    }
    return roots.map(function (z) {
      var r = Math.abs(z.re) < 1e-9 ? 0 : Number(z.re.toPrecision(12)), q = Math.abs(z.im) < 1e-9 ? 0 : Number(z.im.toPrecision(12));
      return q === 0 ? r : C(r, q);
    }).sort(function (x, y) { return (re(x) - re(y)) || (im(x) - im(y)); });
  }
  function solveLinear(A, b) { // Gauss with partial pivoting
    var n = A.length, m = A.map(function (r, i) { return r.concat([b[i]]); });
    for (var c = 0; c < n; c++) {
      var p = c;
      for (var r = c + 1; r < n; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
      if (Math.abs(m[p][c]) < 1e-12) mathErr();
      var t = m[p]; m[p] = m[c]; m[c] = t;
      for (r = 0; r < n; r++) if (r !== c) {
        var f = m[r][c] / m[c][c];
        for (var k = c; k <= n; k++) m[r][k] -= f * m[c][k];
      }
    }
    return m.map(function (r, i) { return clean(r[n] / r[i]); });
  }

  /* ───────── statistics ───────── */
  var REG = { lin: 'A+BX', quad: '_+CX²', ln: 'ln X', exp: 'e^X', ab: 'A·B^X', pow: 'A·X^B', inv: '1/X' };
  /** rows: [{x, y, f}] ; type: 'one' or a REG key */
  function statistics(rows, type) {
    var n = 0, sx = 0, sx2 = 0, sy = 0, sy2 = 0, sxy = 0, minx = Infinity, maxx = -Infinity;
    rows.forEach(function (r) {
      var f = r.f === undefined ? 1 : r.f;
      n += f; sx += f * r.x; sx2 += f * r.x * r.x;
      if (r.y !== undefined) { sy += f * r.y; sy2 += f * r.y * r.y; sxy += f * r.x * r.y; }
      if (f > 0) { minx = Math.min(minx, r.x); maxx = Math.max(maxx, r.x); }
    });
    if (n === 0) throw new Err('Data empty');
    var out = { n: n, sx1: sx, sx2: sx2, xbar: sx / n, minx: minx, maxx: maxx };
    out.sigx = Math.sqrt(Math.max(0, sx2 / n - out.xbar * out.xbar));
    out.sdx = n > 1 ? Math.sqrt(Math.max(0, (sx2 - sx * sx / n) / (n - 1))) : undefined;
    if (type === 'one') {
      var sorted = [];
      rows.forEach(function (r) { var f = r.f === undefined ? 1 : r.f; for (var i = 0; i < f && sorted.length < 5000; i++) sorted.push(r.x); });
      sorted.sort(function (a, b) { return a - b; });
      function med(a) { var k = a.length; return k ? (k % 2 ? a[(k - 1) / 2] : (a[k / 2 - 1] + a[k / 2]) / 2) : undefined; }
      out.med = med(sorted);
      out.q1 = med(sorted.slice(0, Math.floor(sorted.length / 2)));
      out.q3 = med(sorted.slice(Math.ceil(sorted.length / 2)));
      return out;
    }
    out.sy1 = sy; out.sy2 = sy2; out.sxy = sxy; out.ybar = sy / n;
    out.sigy = Math.sqrt(Math.max(0, sy2 / n - out.ybar * out.ybar));
    out.sdy = n > 1 ? Math.sqrt(Math.max(0, (sy2 - sy * sy / n) / (n - 1))) : undefined;
    out.miny = Math.min.apply(null, rows.map(function (r) { return r.y; }));
    out.maxy = Math.max.apply(null, rows.map(function (r) { return r.y; }));
    // regression
    var tx = function (x) { return x; }, ty = function (y) { return y; }, back = function (a, b) { return [a, b]; };
    if (type === 'ln') tx = function (x) { if (x <= 0) mathErr(); return Math.log(x); };
    if (type === 'inv') tx = function (x) { if (x === 0) mathErr(); return 1 / x; };
    if (type === 'exp' || type === 'ab') ty = function (y) { if (y <= 0) mathErr(); return Math.log(y); };
    if (type === 'pow') { tx = function (x) { if (x <= 0) mathErr(); return Math.log(x); }; ty = function (y) { if (y <= 0) mathErr(); return Math.log(y); }; }
    if (type === 'quad') {
      var s1 = 0, s2 = 0, s3 = 0, s4 = 0, t0 = 0, t1 = 0, t2 = 0;
      rows.forEach(function (r) {
        var f = r.f === undefined ? 1 : r.f, x = r.x, y = r.y;
        s1 += f * x; s2 += f * x * x; s3 += f * Math.pow(x, 3); s4 += f * Math.pow(x, 4);
        t0 += f * y; t1 += f * x * y; t2 += f * x * x * y;
      });
      var co = solveLinear([[n, s1, s2], [s1, s2, s3], [s2, s3, s4]], [t0, t1, t2]);
      out.A = co[0]; out.B = co[1]; out.C = co[2];
      out.estY = function (x) { return clean(out.A + out.B * x + out.C * x * x); };
      out.estX = function (y) {
        var d = out.B * out.B - 4 * out.C * (out.A - y);
        if (d < 0) mathErr();
        return [clean((-out.B + Math.sqrt(d)) / (2 * out.C)), clean((-out.B - Math.sqrt(d)) / (2 * out.C))];
      };
      return out;
    }
    var X = rows.map(function (r) { return tx(r.x); }), Y = rows.map(function (r) { return ty(r.y); });
    var F = rows.map(function (r) { return r.f === undefined ? 1 : r.f; });
    var mx = 0, my = 0, N = 0;
    X.forEach(function (_, i) { N += F[i]; mx += F[i] * X[i]; my += F[i] * Y[i]; });
    mx /= N; my /= N;
    var sxx = 0, syy = 0, sxy2 = 0;
    X.forEach(function (_, i) { sxx += F[i] * (X[i] - mx) * (X[i] - mx); syy += F[i] * (Y[i] - my) * (Y[i] - my); sxy2 += F[i] * (X[i] - mx) * (Y[i] - my); });
    if (sxx === 0) mathErr();
    var b = sxy2 / sxx, a0 = my - b * mx;
    out.r = syy === 0 ? undefined : clean(sxy2 / Math.sqrt(sxx * syy));
    if (type === 'lin' || type === 'ln' || type === 'inv') { out.A = clean(a0); out.B = clean(b); }
    else if (type === 'exp') { out.A = clean(Math.exp(a0)); out.B = clean(b); }
    else if (type === 'ab') { out.A = clean(Math.exp(a0)); out.B = clean(Math.exp(b)); }
    else if (type === 'pow') { out.A = clean(Math.exp(a0)); out.B = clean(b); }
    var A = out.A, B = out.B;
    out.estY = function (x) {
      if (type === 'lin') return clean(A + B * x);
      if (type === 'ln') { if (x <= 0) mathErr(); return clean(A + B * Math.log(x)); }
      if (type === 'exp') return clean(A * Math.exp(B * x));
      if (type === 'ab') return clean(A * Math.pow(B, x));
      if (type === 'pow') { if (x <= 0) mathErr(); return clean(A * Math.pow(x, B)); }
      if (x === 0) mathErr();
      return clean(A + B / x);
    };
    out.estX = function (y) {
      var v;
      if (type === 'lin') { if (B === 0) mathErr(); v = (y - A) / B; }
      else if (type === 'ln') { if (B === 0) mathErr(); v = Math.exp((y - A) / B); }
      else if (type === 'exp') { if (y <= 0 || A <= 0 || B === 0) mathErr(); v = Math.log(y / A) / B; }
      else if (type === 'ab') { if (y <= 0 || A <= 0 || B <= 0 || B === 1) mathErr(); v = Math.log(y / A) / Math.log(B); }
      else if (type === 'pow') { if (y <= 0 || A <= 0 || B === 0) mathErr(); v = Math.pow(y / A, 1 / B); }
      else { if (y === A) mathErr(); v = B / (y - A); }
      return [clean(fin(v))];
    };
    return out;
  }

  /* ───────── equations (EQN) ───────── */
  function eqnLinear(coef) { // rows of [a,b,c] or [a,b,c,d]
    var n = coef.length, A = coef.map(function (r) { return r.slice(0, n); }), b = coef.map(function (r) { return r[n]; });
    return solveLinear(A, b);
  }
  function eqnPoly(coef) { return polyRoots(coef); }

  /* ───────── constants & conversions ───────── */
  var CONSTANTS = [
    ['mp', 'Proton mass', 1.672621777e-27], ['mn', 'Neutron mass', 1.674927351e-27], ['me', 'Electron mass', 9.10938291e-31],
    ['mμ', 'Muon mass', 1.883531475e-28], ['a0', 'Bohr radius', 5.2917721092e-11], ['h', 'Planck constant', 6.62606957e-34],
    ['μN', 'Nuclear magneton', 5.05078353e-27], ['μB', 'Bohr magneton', 9.27400968e-24], ['ħ', 'Dirac constant', 1.054571726e-34],
    ['α', 'Fine-structure constant', 7.2973525698e-3], ['re', 'Classical electron radius', 2.8179403267e-15],
    ['λc', 'Compton wavelength', 2.4263102389e-12], ['γp', 'Proton gyromagnetic ratio', 2.675222005e8],
    ['λcp', 'Proton Compton wavelength', 1.32140985623e-15], ['λcn', 'Neutron Compton wavelength', 1.31959090468e-15],
    ['R∞', 'Rydberg constant', 10973731.568539], ['u', 'Atomic mass unit', 1.660538921e-27], ['μp', 'Proton magnetic moment', 1.410606743e-26],
    ['μe', 'Electron magnetic moment', -9.28476430e-24], ['μn', 'Neutron magnetic moment', -9.6623647e-27],
    ['μμ', 'Muon magnetic moment', -4.49044807e-26], ['F', 'Faraday constant', 96485.3365], ['e', 'Elementary charge', 1.602176565e-19],
    ['NA', 'Avogadro constant', 6.02214129e23], ['k', 'Boltzmann constant', 1.3806488e-23], ['Vm', 'Molar volume (ideal gas)', 0.022710953],
    ['R', 'Molar gas constant', 8.3144621], ['C0', 'Speed of light', 299792458], ['C1', 'First radiation constant', 3.74177153e-16],
    ['C2', 'Second radiation constant', 0.014387770], ['σ', 'Stefan–Boltzmann constant', 5.670373e-8], ['ε0', 'Electric constant', 8.854187817e-12],
    ['μ0', 'Magnetic constant', 1.256637061e-6], ['Φ0', 'Magnetic flux quantum', 2.067833758e-15], ['g', 'Standard gravity', 9.80665],
    ['G0', 'Conductance quantum', 7.7480917346e-5], ['Z0', 'Impedance of vacuum', 376.730313461], ['t', 'Celsius temperature', 273.15],
    ['G', 'Gravitational constant', 6.67384e-11], ['atm', 'Standard atmosphere', 101325]
  ];
  var CONVERSIONS = [
    ['in▸cm', function (x) { return x * 2.54; }], ['cm▸in', function (x) { return x / 2.54; }],
    ['ft▸m', function (x) { return x * 0.3048; }], ['m▸ft', function (x) { return x / 0.3048; }],
    ['yd▸m', function (x) { return x * 0.9144; }], ['m▸yd', function (x) { return x / 0.9144; }],
    ['mile▸km', function (x) { return x * 1.609344; }], ['km▸mile', function (x) { return x / 1.609344; }],
    ['n mile▸m', function (x) { return x * 1852; }], ['m▸n mile', function (x) { return x / 1852; }],
    ['acre▸m²', function (x) { return x * 4046.8564224; }], ['m²▸acre', function (x) { return x / 4046.8564224; }],
    ['gal(US)▸L', function (x) { return x * 3.785411784; }], ['L▸gal(US)', function (x) { return x / 3.785411784; }],
    ['gal(UK)▸L', function (x) { return x * 4.54609; }], ['L▸gal(UK)', function (x) { return x / 4.54609; }],
    ['pc▸km', function (x) { return x * 30856775814913.67; }], ['km▸pc', function (x) { return x / 30856775814913.67; }],
    ['km/h▸m/s', function (x) { return x / 3.6; }], ['m/s▸km/h', function (x) { return x * 3.6; }],
    ['oz▸g', function (x) { return x * 28.349523125; }], ['g▸oz', function (x) { return x / 28.349523125; }],
    ['lb▸kg', function (x) { return x * 0.45359237; }], ['kg▸lb', function (x) { return x / 0.45359237; }],
    ['atm▸Pa', function (x) { return x * 101325; }], ['Pa▸atm', function (x) { return x / 101325; }],
    ['mmHg▸Pa', function (x) { return x * 133.322387415; }], ['Pa▸mmHg', function (x) { return x / 133.322387415; }],
    ['hp▸kW', function (x) { return x * 0.745699872; }], ['kW▸hp', function (x) { return x / 0.745699872; }],
    ['kgf/cm²▸Pa', function (x) { return x * 98066.5; }], ['Pa▸kgf/cm²', function (x) { return x / 98066.5; }],
    ['kgf·m▸J', function (x) { return x * 9.80665; }], ['J▸kgf·m', function (x) { return x / 9.80665; }],
    ['lbf/in²▸kPa', function (x) { return x * 6.8947572932; }], ['kPa▸lbf/in²', function (x) { return x / 6.8947572932; }],
    ['°F▸°C', function (x) { return (x - 32) * 5 / 9; }], ['°C▸°F', function (x) { return x * 9 / 5 + 32; }],
    ['J▸cal', function (x) { return x / 4.18605; }], ['cal▸J', function (x) { return x * 4.18605; }]
  ];

  return {
    Err: Err, evaluate: evaluate, compile: compile, tokenize: tokenize, solve: solve, finish: finish,
    fmtReal: fmtReal, exact: exact, frac: frac, toDMS: toDMS, trimMant: trimMant,
    evalBase: evalBase, toBase: toBase, BASE_MAP: BASE_MAP, wrap32: wrap32,
    polyRoots: polyRoots, solveLinear: solveLinear, eqnLinear: eqnLinear, eqnPoly: eqnPoly,
    statistics: statistics, REG: REG, phi: phi,
    CONSTANTS: CONSTANTS, CONVERSIONS: CONVERSIONS,
    det: det, inv: inv, trn: trn, add: add, sub: sub, mul: mul,
    isC: isC, isM: isM, isV: isV, isP: isP, re: re, im: im, cabs: cabs, carg: carg, clean: clean, fromRad: fromRad
  };
})();
if (typeof module !== 'undefined') module.exports = CasioEngine;
