/**
 * Class 4 lesson 5 · Basic operations (गणितका आधारभूत क्रियाहरू)
 * Add / Subtract Towers (7-digit column work), Multiplication Grid (area model), Long Division.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, near, Hud, Tip, Props, numQ, indian, Pillars, digitsOf, PL7 } from './h4';

const inl = (lang: 'ne' | 'en', n: number) => fmt(lang, indian(n));

/* ───────────── Column addition and subtraction (7 digits) ───────────── */
type Op = 'add' | 'sub';
const W = 7;
interface Step { c: number; x: number; y: number; cin: number; res: number; cout: number; np: string; en: string }
const gen = (op: Op): [number, number] => {
  if (op === 'add') { const a = rnd(100000, 6999999); return [a, rnd(10000, Math.min(9999999 - a, 2999999))]; }
  const a = rnd(1000000, 9999999); return [a, rnd(100000, a - 10000)];
};
const steps = (a: number, b: number, op: Op): Step[] => {
  const da = digitsOf(a, W), db = digitsOf(b, W); const out: Step[] = []; let carry = 0;
  for (let c = W - 1; c >= 0; c--) {
    const x = da[c], y = db[c];
    if (op === 'add') {
      const sum = x + y + carry; const res = sum % 10; const cout = Math.floor(sum / 10);
      out.push({ c, x, y, cin: carry, res, cout, np: `${x} + ${y}${carry ? ` + ${carry} (हातमा)` : ''} = ${sum}${cout ? ` → ${res} लेख्ने, १ हातमा` : ''}`, en: `${x} + ${y}${carry ? ` + ${carry} (carry)` : ''} = ${sum}${cout ? ` → write ${res}, carry 1` : ''}` }); carry = cout;
    } else {
      const top = x - carry; const borrow = top < y ? 1 : 0; const res = top + borrow * 10 - y;
      out.push({ c, x, y, cin: carry, res, cout: borrow, np: `${x}${carry ? ` − १ (सापटी दिएको) = ${top}` : ''}${borrow ? `; ${top} < ${y} त्यसैले १० सापट लिने → ${top + 10} − ${y} = ${res}` : ` − ${y} = ${res}`}`, en: `${x}${carry ? ` − 1 (lent) = ${top}` : ''}${borrow ? `; ${top} < ${y} so borrow 10 → ${top + 10} − ${y} = ${res}` : ` − ${y} = ${res}`}` }); carry = borrow;
    }
  }
  return out;
};

const make = (op: Op, cfg: { code: string; chapter: number; titleNp: string; titleEn: string; color: string; sign: string }): React.FC<Props> => ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: cfg.code, chapter: cfg.chapter, titleNp: cfg.titleNp, titleEn: cfg.titleEn });
  const [ab, setAb] = useState<[number, number]>(() => gen(op));
  const [done, setDone] = useState(0);
  const [seed, setSeed] = useState(0);
  const sc = useRef<{ A: Pillars; B: Pillars; R: Pillars } | null>(null);
  const st = useMemo(() => steps(ab[0], ab[1], op), [ab]);
  const result = op === 'add' ? ab[0] + ab[1] : ab[0] - ab[1];
  const zeros = new Array(W).fill(0);

  useStage(kit.stageRef, (ctx) => {
    const o = { u: 0.34, colors: PL7.map((p) => p.color), names: PL7 };
    const A = new Pillars(ctx, W, { ...o, x: -11.5 }), B = new Pillars(ctx, W, { ...o, x: 0 }), R = new Pillars(ctx, W, { ...o, x: 11.5 });
    sc.current = { A, B, R };
    return () => { sc.current = null; A.dispose(); B.dispose(); R.dispose(); };
  }, [], { camera: [0, 7, 27], target: [0, 2.4, 0], minDistance: 12, maxDistance: 38 });

  const showNums = (a: number, b: number) => { sc.current?.A.set(digitsOf(a, W), false); sc.current?.B.set(digitsOf(b, W), false); sc.current?.R.set(zeros, false); };
  const upto = (n: number) => { const d = new Array(W).fill(0); for (let i = 0; i < n; i++) d[st[i].c] = st[i].res; sc.current?.R.set(d); sc.current?.A.highlight(n < W ? st[n].c : -1); sc.current?.B.highlight(n < W ? st[n].c : -1); };
  const fresh = () => { const p = gen(op); setAb(p); setDone(0); showNums(p[0], p[1]); };
  useEffect(() => { if (kit.mode !== 'CHALLENGE') fresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode, seed]);

  const advance = () => { if (done >= W) { kit.star(); setSeed((s) => s + 1); return; } const n = done + 1; setDone(n); upto(n); const s = st[done]; kit.say(s.np, s.en); if (n === W) kit.say(`उत्तर: ${indian(result)}`, `Answer: ${indian(result)}`); };
  const opts = useMemo(() => (done < W ? near(st[done].res, seed * 5 + done, [1, -1, 2, 3, 9, -2, 5]).filter((x) => x <= 9) : []), [done, st, seed]);
  const pick = (v: number) => { if (done >= W) return; if (v === st[done].res) { kit.good(); kit.star(); advance(); } else kit.oops(st[done].np, st[done].en); };

  const data = useMemo(() => Array.from({ length: 8 }, () => gen(op)), []);
  const questions: (QuizQuestion & { p: [number, number] })[] = data.map((p, i) => { const r = op === 'add' ? p[0] + p[1] : p[0] - p[1]; return { p, ...numQ(`${indian(p[0])} ${cfg.sign} ${indian(p[1])} = ?`, `${indian(p[0])} ${cfg.sign} ${indian(p[1])} = ?`, r, i + 3, [10, -10, 100, -100, 1000, -1000, 1, -1], (x) => inl(kit.lang, x)) }; });

  const cur = done < W ? st[done] : null;
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color={cfg.color}>
      <div style={{ fontSize: 20, fontWeight: 900 }}>{inl(kit.lang, ab[0])} {cfg.sign} {inl(kit.lang, ab[1])} = {done >= W ? inl(kit.lang, result) : '?'}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#475569' }}>{cur ? `${kit.t(PL7[cur.c].np, PL7[cur.c].en)}: ${kit.t(cur.np, cur.en)}` : kit.t('सबै स्तम्भ सकियो!', 'All columns done!')}</div>
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{op === 'add' ? kit.t('एकाइबाट सुरु गरौँ · १० भए हातमा १ राखौँ', 'Start from the ones · 10 or more → carry 1') : kit.t('एकाइबाट सुरु गरौँ · नपुगे अर्को स्तम्भबाट १० सापट लिऔँ', 'Start from the ones · not enough? borrow 10 from the next column')}</Tip><CBtn color="#16a34a" onClick={advance}>{done >= W ? kit.t('नयाँ', 'New') : kit.t('अर्को स्तम्भ', 'Next column')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 16, flex: 1, minWidth: 180 }}>{cur ? `${kit.t(PL7[cur.c].np, PL7[cur.c].en)}: ${cur.x} ${cfg.sign} ${cur.y}${cur.cin ? (op === 'add' ? ` + ${cur.cin}` : ` (−${cur.cin})`) : ''} = ?` : kit.t('शाबास!', 'Well done!')}</div>{cur ? opts.map((v) => <CBtn key={v} color={cfg.color} style={{ minWidth: 60, fontSize: 22 }} onClick={() => pick(v)}>{fmt(kit.lang, v)}</CBtn>) : <CBtn color="#16a34a" onClick={() => setSeed(seed + 1)}>🎲 {kit.t('नयाँ', 'New')}</CBtn>}</Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { setAb(q.p); showNums(q.p[0], q.p[1]); }} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
export const AddTowers4 = make('add', { code: 'SIM-MATH-G4-L5-01', chapter: 5, titleNp: 'जोडको टावर (७ अङ्क)', titleEn: 'Addition Towers (7 digits)', color: '#16a34a', sign: '+' });
export const SubTowers4 = make('sub', { code: 'SIM-MATH-G4-L5-02', chapter: 5, titleNp: 'घटाउको टावर (७ अङ्क)', titleEn: 'Subtraction Towers (7 digits)', color: '#ea580c', sign: '−' });

/* ───────────── Multiplication Grid (area model) ───────────── */
const RC = ['#ef4444', '#f59e0b', '#22c55e', '#0ea5e9'];
export const MultiplyGrid: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L5-03', chapter: 5, titleNp: 'गुणन ग्रिड', titleEn: 'Multiplication Grid' });
  const [a, setA] = useState(23);
  const [b, setB] = useState(14);
  const [shown, setShown] = useState(4);
  const scene = useRef<{ set: (a: number, b: number, shown: number) => void } | null>(null);
  const parts = (x: number, y: number) => { const at = Math.floor(x / 10) * 10, ao = x % 10, bt = Math.floor(y / 10) * 10, bo = y % 10; return [[at, bt], [ao, bt], [at, bo], [ao, bo]] as [number, number][]; };

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const set = (x: number, y: number, sh: number) => {
      g.clear(); const s = 0.3; const pr = parts(x, y); const at = pr[0][0], ao = pr[1][0], bt = pr[0][1], bo = pr[2][1];
      const x0 = -(x * s) / 2, z0 = -(y * s) / 2 + 1; const wx = [at * s, ao * s, at * s, ao * s], dz = [bt * s, bt * s, bo * s, bo * s];
      const cx = [x0 + wx[0] / 2, x0 + wx[0] + wx[1] / 2, x0 + wx[0] / 2, x0 + wx[0] + wx[1] / 2], cz = [z0 + dz[0] / 2, z0 + dz[1] / 2, z0 + dz[0] + dz[2] / 2, z0 + dz[0] + dz[3] / 2];
      const foot = new THREE.Mesh(new THREE.BoxGeometry(x * s, 0.06, y * s), new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.9 })); foot.position.set(0, 0.03, z0 + (y * s) / 2); g.add(foot);
      for (let i = 0; i < 4; i++) {
        if (i >= sh || pr[i][0] === 0 || pr[i][1] === 0) continue;
        const bx = shadowed(new THREE.Mesh(new THREE.BoxGeometry(wx[i], 0.4, dz[i]), mat(RC[i], 0.5))); bx.position.set(cx[i], 0.2, cz[i]); g.add(bx);
        const lab = textSprite(`${pr[i][0]} × ${pr[i][1]} = ${pr[i][0] * pr[i][1]}`, 3, { px: 54, w: 320, h: 96, bg: '#ffffff', border: RC[i] }); lab.position.set(-6.6 + i * 4.4, 3.4, -4); g.add(lab);
      }
      if (sh >= 4) { const t = textSprite(`${x} × ${y} = ${x * y}`, 4, { px: 64, w: 360, h: 112, bg: '#0f172a', color: '#fff' }); t.position.set(0, 5.2, -4); g.add(t); }
      const wl = textSprite(`${x}`, 1.6, { px: 56, w: 160, h: 80, bg: null, color: '#0f172a' }); wl.position.set(0, 0.2, z0 - 0.7); g.add(wl);
      const hl = textSprite(`${y}`, 1.6, { px: 56, w: 160, h: 80, bg: null, color: '#0f172a' }); hl.position.set(x0 - 0.9, 0.2, z0 + (y * s) / 2); g.add(hl);
    };
    scene.current = { set }; set(23, 14, 4);
    return () => { scene.current = null; };
  }, [], { camera: [0, 11, 12], target: [0, 1, 0], minDistance: 6, maxDistance: 26, ground: 0xfef9c3 });

  const apply = (x: number, y: number, sh: number) => { setA(x); setB(y); setShown(sh); scene.current?.set(x, y, sh); };
  const fresh = () => { const x = rnd(12, 49), y = rnd(11, 24); apply(x, y, 0); kit.say(`${x} × ${y}: चार टुक्रामा बाँडौँ`, `${x} × ${y}: split into four parts`); };
  useEffect(() => { if (kit.mode === 'LEARN') fresh(); else if (kit.mode === 'PLAY') apply(23, 14, 4); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const learnNext = () => { if (shown >= 4) { kit.star(); fresh(); return; } const n = shown + 1; setShown(n); scene.current?.set(a, b, n); const p = parts(a, b)[n - 1]; kit.say(n === 4 ? `जोडौँ: ${a * b}` : `${p[0]} × ${p[1]} = ${p[0] * p[1]}`, n === 4 ? `Add them up: ${a * b}` : `${p[0]} × ${p[1]} = ${p[0] * p[1]}`); };
  const bump = (da: number, db: number) => { const x = Math.min(49, Math.max(11, a + da)), y = Math.min(29, Math.max(11, b + db)); apply(x, y, 4); };

  const data = useMemo(() => Array.from({ length: 8 }, () => ({ x: rnd(12, 49), y: rnd(11, 24) })), []);
  const questions: (QuizQuestion & { d: { x: number; y: number } })[] = data.map((d, i) => {
    if (i % 2) { const p = parts(d.x, d.y)[2]; return { d, ...numQ(`${d.x} × ${d.y} मा पहिलो भाग ${p[0]} × ${p[1]} कति हुन्छ?`, `In ${d.x} × ${d.y}, what is ${p[0]} × ${p[1]}?`, p[0] * p[1], i, [10, -10, 100, -p[0], p[1]], (x) => fmt(kit.lang, x), 1) }; }
    return { d, ...numQ(`${d.x} × ${d.y} = ?`, `${d.x} × ${d.y} = ?`, d.x * d.y, i + 2, [10, -10, 100, -100, d.x, -d.y], (x) => fmt(kit.lang, x), 1) };
  });
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color="#f59e0b">
      <div style={{ fontSize: 24, fontWeight: 900 }}>{fmt(kit.lang, a)} × {fmt(kit.lang, b)} = {shown >= 4 ? fmt(kit.lang, a * b) : '?'}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{fmt(kit.lang, a)} = {fmt(kit.lang, Math.floor(a / 10) * 10)} + {fmt(kit.lang, a % 10)} · {fmt(kit.lang, b)} = {fmt(kit.lang, Math.floor(b / 10) * 10)} + {fmt(kit.lang, b % 10)}</div>
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('प्रत्येक भाग अलग गुणन गरेर जोडौँ', 'Multiply each part, then add')}</Tip><CBtn color="#16a34a" onClick={learnNext}>{shown >= 4 ? kit.t('नयाँ', 'New') : kit.t('अर्को भाग', 'Next part')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls><CBtn color="#ef4444" onClick={() => bump(-1, 0)}>{kit.t('लम्बाइ', 'First')} −1</CBtn><CBtn color="#ef4444" onClick={() => bump(1, 0)}>{kit.t('लम्बाइ', 'First')} +1</CBtn><CBtn color="#0ea5e9" onClick={() => bump(0, -1)}>{kit.t('दोस्रो', 'Second')} −1</CBtn><CBtn color="#0ea5e9" onClick={() => bump(0, 1)}>{kit.t('दोस्रो', 'Second')} +1</CBtn><CBtn color="#f59e0b" onClick={() => bump(-10, 0)}>−10</CBtn><CBtn color="#f59e0b" onClick={() => bump(10, 0)}>+10</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.d.x, q.d.y, 4)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};

/* ───────────── Long Division ───────────── */
interface DStep { c: number; cur: number; q: number; rem: number }
const dsteps = (n: number, k: number): DStep[] => { const ds = digitsOf(n, 3); let rem = 0; return ds.map((d, c) => { const cur = rem * 10 + d; const q = Math.floor(cur / k); rem = cur - q * k; return { c, cur, q, rem }; }); };
const PL3 = [PL7[4], PL7[5], PL7[6]];

export const LongDivision: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L5-04', chapter: 5, titleNp: 'भाग प्रयोगशाला', titleEn: 'Long Division Lab' });
  const [nk, setNk] = useState<[number, number]>([delta(), 4]);
  const [done, setDone] = useState(0);
  const [seed, setSeed] = useState(0);
  const sc = useRef<{ A: Pillars; Q: Pillars; setRem: (r: number, k: number) => void } | null>(null);
  const st = useMemo(() => dsteps(nk[0], nk[1]), [nk]);

  function delta() { return rnd(120, 999); }
  useStage(kit.stageRef, (ctx) => {
    const o = { u: 0.4, colors: PL3.map((p) => p.color), names: PL3 };
    const A = new Pillars(ctx, 3, { ...o, x: -7 }), Q = new Pillars(ctx, 3, { ...o, x: 7 });
    const info = new THREE.Group(); ctx.scene.add(info);
    const setRem = (r: number, k: number) => { info.clear(); const d = textSprite(`÷ ${k}`, 3.2, { px: 80, w: 256, h: 112, bg: '#0f172a', color: '#fff' }); d.position.set(0, 5.5, 0); info.add(d); const t = textSprite(`rem ${r}`, 2.6, { px: 60, w: 256, h: 96, bg: '#fff7ed', border: '#ea580c' }); t.position.set(0, 3.2, 0); info.add(t); };
    sc.current = { A, Q, setRem };
    return () => { sc.current = null; A.dispose(); Q.dispose(); ctx.scene.remove(info); };
  }, [], { camera: [0, 6, 18], target: [0, 2.6, 0], minDistance: 9, maxDistance: 30 });

  const load = (n: number, k: number) => { sc.current?.A.set(digitsOf(n, 3), false); sc.current?.Q.set([0, 0, 0], false); sc.current?.setRem(0, k); sc.current?.A.highlight(-1); };
  const fresh = () => { const k = rnd(2, 9); const n = rnd(120, 999); setNk([n, k]); setDone(0); load(n, k); };
  useEffect(() => { if (kit.mode !== 'CHALLENGE') fresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode, seed]);
  const text = (i: number) => { const s = st[i]; return [`${PL3[s.c].np}: ${fmt('ne', s.cur)} ÷ ${nk[1]} = ${fmt('ne', s.q)}, बाँकी ${fmt('ne', s.rem)}`, `${PL3[s.c].en}: ${s.cur} ÷ ${nk[1]} = ${s.q}, remainder ${s.rem}`] as const; };
  const apply = (n: number) => { const q = [0, 0, 0]; for (let i = 0; i < n; i++) q[st[i].c] = st[i].q; sc.current?.Q.set(q); sc.current?.A.highlight(n < 3 ? n : -1); sc.current?.setRem(n ? st[n - 1].rem : 0, nk[1]); };
  const advance = () => { if (done >= 3) { kit.star(); setSeed((s) => s + 1); return; } const n = done + 1; setDone(n); apply(n); const [np, en] = text(done); kit.say(np, en); if (n === 3) kit.say(`भागफल ${Math.floor(nk[0] / nk[1])}, बाँकी ${nk[0] % nk[1]}`, `Quotient ${Math.floor(nk[0] / nk[1])}, remainder ${nk[0] % nk[1]}`); };
  const opts = useMemo(() => (done < 3 ? near(st[done].q, seed * 7 + done, [1, -1, 2, 3, -2], 0).filter((x) => x <= 9) : []), [done, st, seed]);
  const pick = (v: number) => { if (done >= 3) return; if (v === st[done].q) { kit.good(); kit.star(); advance(); } else kit.oops(text(done)[0], text(done)[1]); };

  const data = useMemo(() => Array.from({ length: 8 }, () => ({ n: rnd(120, 999), k: rnd(2, 9) })), []);
  const questions: (QuizQuestion & { d: { n: number; k: number } })[] = data.map((d, i) => i % 2
    ? { d, ...numQ(`${d.n} ÷ ${d.k} मा बाँकी कति?`, `${d.n} ÷ ${d.k}: what is the remainder?`, d.n % d.k, i, [1, -1, 2, d.k - 1], (x) => fmt(kit.lang, x), 0) }
    : { d, ...numQ(`${d.n} ÷ ${d.k} को भागफल कति?`, `${d.n} ÷ ${d.k}: what is the quotient?`, Math.floor(d.n / d.k), i + 4, [1, -1, 10, -10, 11], (x) => fmt(kit.lang, x), 1) });
  questions.forEach((q) => { if (!q.options.some((o) => o.key === q.answer)) q.options[0] = { key: q.answer, label: fmt(kit.lang, q.answer) }; });

  const quo = Math.floor(nk[0] / nk[1]);
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color="#8b5cf6">
      <div style={{ fontSize: 24, fontWeight: 900 }}>{fmt(kit.lang, nk[0])} ÷ {fmt(kit.lang, nk[1])} = {done >= 3 ? <>{fmt(kit.lang, quo)} <span style={{ fontSize: 14, color: '#ea580c' }}>{kit.t('बाँकी', 'rem')} {fmt(kit.lang, nk[0] % nk[1])}</span></> : '?'}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#475569' }}>{done < 3 ? kit.t(PL3[done].np + ' बाट सुरु', 'Start with the ' + PL3[done].en.toLowerCase()) : `${fmt(kit.lang, nk[1])} × ${fmt(kit.lang, quo)} + ${fmt(kit.lang, nk[0] % nk[1])} = ${fmt(kit.lang, nk[0])}`}</div>
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('सयबाट सुरु गरौँ · बाँकी अर्को अङ्कसँग जोडौँ', 'Start from the hundreds · carry the remainder to the next digit')}</Tip><CBtn color="#16a34a" onClick={advance}>{done >= 3 ? kit.t('नयाँ', 'New') : kit.t('अर्को चरण', 'Next step')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 16, flex: 1, minWidth: 180 }}>{done < 3 ? `${fmt(kit.lang, st[done].cur)} ÷ ${fmt(kit.lang, nk[1])} = ?` : kit.t('शाबास!', 'Well done!')}</div>{done < 3 ? opts.map((v) => <CBtn key={v} color="#8b5cf6" style={{ minWidth: 60, fontSize: 22 }} onClick={() => pick(v)}>{fmt(kit.lang, v)}</CBtn>) : <CBtn color="#16a34a" onClick={() => setSeed(seed + 1)}>🎲 {kit.t('नयाँ', 'New')}</CBtn>}</Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => load(q.d.n, q.d.k)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
