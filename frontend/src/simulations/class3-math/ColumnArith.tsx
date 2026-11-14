/**
 * Lessons 12 and 13 · Addition and subtraction of five-digit numbers (जोड र घटाउ)
 * Column Towers — three sets of towers (first number, second number, answer); work column by column from the ones, with carrying or borrowing.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { Pillars, PLACES, digitsOf, big, fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
type Op = 'add' | 'sub';
interface Step { c: number; x: number; y: number; cin: number; res: number; cout: number; np: string; en: string }
const gen = (op: Op): [number, number] => {
  if (op === 'add') { const a = rnd(2000, 69999); return [a, rnd(1000, Math.min(99999 - a, 49999))]; }
  const a = rnd(20000, 99999); return [a, rnd(2000, a - 1000)];
};
const steps = (a: number, b: number, op: Op): Step[] => {
  const da = digitsOf(a), db = digitsOf(b); const out: Step[] = []; let carry = 0;
  for (let c = 4; c >= 0; c--) {
    const x = da[c], y = db[c];
    if (op === 'add') {
      const sum = x + y + carry; const res = sum % 10; const cout = Math.floor(sum / 10);
      out.push({ c, x, y, cin: carry, res, cout, np: `${x} + ${y}${carry ? ` + ${carry} (हातमा)` : ''} = ${sum}${cout ? ` → ${res} लेख्ने, १ हातमा` : ''}`, en: `${x} + ${y}${carry ? ` + ${carry} (carry)` : ''} = ${sum}${cout ? ` → write ${res}, carry 1` : ''}` }); carry = cout;
    } else {
      const top = x - carry; const borrow = top < y ? 1 : 0; const res = top + borrow * 10 - y;
      out.push({ c, x, y, cin: carry, res, cout: borrow, np: `${top < 0 ? top : x}${carry ? ` − १ (सापटी दिएको) = ${top}` : ''}${borrow ? `; ${top} < ${y} त्यसैले १० सापट लिने → ${top + 10} − ${y} = ${res}` : ` − ${y} = ${res}`}`, en: `${x}${carry ? ` − 1 (lent) = ${top}` : ''}${borrow ? `; ${top} < ${y} so borrow 10 → ${top + 10} − ${y} = ${res}` : ` − ${y} = ${res}`}` }); carry = borrow;
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

  useStage(kit.stageRef, (ctx) => {
    const o = { u: 0.42, colors: PLACES.map((p) => p.color), names: PLACES };
    const A = new Pillars(ctx, 5, { ...o, x: -9.5 }), B = new Pillars(ctx, 5, { ...o, x: -0.5 }), R = new Pillars(ctx, 5, { ...o, x: 8.5 });
    sc.current = { A, B, R };
    return () => { sc.current = null; A.dispose(); B.dispose(); R.dispose(); };
  }, [], { camera: [0, 7, 21], target: [-0.5, 2.6, 0], minDistance: 10, maxDistance: 32 });

  const showNums = (a: number, b: number) => { sc.current?.A.set(digitsOf(a), false); sc.current?.B.set(digitsOf(b), false); sc.current?.R.set([0, 0, 0, 0, 0], false); };
  const upto = (n: number) => { const d = [0, 0, 0, 0, 0]; for (let i = 0; i < n; i++) d[st[i].c] = st[i].res; sc.current?.R.set(d); sc.current?.A.highlight(n < 5 ? st[n].c : -1); sc.current?.B.highlight(n < 5 ? st[n].c : -1); };
  const fresh = () => { const p = gen(op); setAb(p); setDone(0); showNums(p[0], p[1]); };
  useEffect(() => { if (kit.mode !== 'CHALLENGE') fresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode, seed]);

  const advance = () => { if (done >= 5) { kit.star(); setSeed((s) => s + 1); return; } const n = done + 1; setDone(n); upto(n); const s = st[done]; kit.say(s.np, s.en); if (n === 5) kit.say(`उत्तर: ${result}`, `Answer: ${result.toLocaleString('en-US')}`); };
  const opts = useMemo(() => (done < 5 ? near(st[done].res, seed * 5 + done, [1, -1, 2, 3, 9, -2, 5]).filter((x) => x <= 9).concat([]) : []), [done, st, seed]);
  const pick = (v: number) => { if (done >= 5) return; if (v === st[done].res) { kit.good(); kit.star(); advance(); } else kit.oops(st[done].np, st[done].en); };

  const data = useMemo(() => Array.from({ length: 8 }, () => gen(op)), []);
  const questions: (QuizQuestion & { p: [number, number] })[] = data.map((p, i) => { const r = op === 'add' ? p[0] + p[1] : p[0] - p[1]; return { p, np: `${p[0].toLocaleString('en-US')} ${cfg.sign} ${p[1].toLocaleString('en-US')} = ?`, en: `${p[0].toLocaleString('en-US')} ${cfg.sign} ${p[1].toLocaleString('en-US')} = ?`, answer: String(r), options: near(r, i + 3, [10, -10, 100, -100, 1000, -1000, 1, -1]).map((x) => ({ key: String(x), label: big(kit.lang, x) })) }; });

  const cur = done < 5 ? st[done] : null;
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: `3px solid ${cfg.color}`, textAlign: 'center', maxWidth: 520 }}>
      <div style={{ fontSize: 24, fontWeight: 900 }}>{big(kit.lang, ab[0])} {cfg.sign} {big(kit.lang, ab[1])} = {done >= 5 ? big(kit.lang, result) : '?'}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#475569' }}>{cur ? `${kit.t(PLACES[cur.c].np, PLACES[cur.c].en)}: ${kit.t(cur.np, cur.en)}` : kit.t('सबै स्तम्भ सकियो!', 'All columns done!')}</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{op === 'add' ? kit.t('एकाइबाट सुरु गरौँ · १० भए हातमा १ राखौँ', 'Start from the ones · 10 or more → carry 1') : kit.t('एकाइबाट सुरु गरौँ · नपुगे अर्को स्तम्भबाट १० सापट लिऔँ', 'Start from the ones · not enough? borrow 10 from the next column')}</div><CBtn color="#16a34a" onClick={advance}>{done >= 5 ? kit.t('नयाँ', 'New') : kit.t('अर्को स्तम्भ', 'Next column')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 16, flex: 1, minWidth: 180 }}>{cur ? `${kit.t(PLACES[cur.c].np, PLACES[cur.c].en)}: ${cur.x} ${cfg.sign} ${cur.y}${cur.cin ? (op === 'add' ? ` + ${cur.cin}` : ` (−${cur.cin})`) : ''} = ?` : kit.t('शाबास!', 'Well done!')}</div>{cur ? opts.map((v) => <CBtn key={v} color={cfg.color} style={{ minWidth: 60, fontSize: 22 }} onClick={() => pick(v)}>{fmt(kit.lang, v)}</CBtn>) : <CBtn color="#16a34a" onClick={() => setSeed(seed + 1)}>🎲 {kit.t('नयाँ', 'New')}</CBtn>}</Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { setAb(q.p); showNums(q.p[0], q.p[1]); }} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};

export const AddColumns = make('add', { code: 'SIM-MATH-G3-L12-01', chapter: 12, titleNp: 'जोडको स्तम्भ टावर', titleEn: 'Addition Column Towers', color: '#16a34a', sign: '+' });
export const SubColumns = make('sub', { code: 'SIM-MATH-G3-L13-01', chapter: 13, titleNp: 'घटाउको स्तम्भ टावर', titleEn: 'Subtraction Column Towers', color: '#ea580c', sign: '−' });
void shuffle;
