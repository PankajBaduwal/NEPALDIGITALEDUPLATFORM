/**
 * Class 4 lessons 8 and 13 · Currency (मुद्रा), Bill and budget (बिल र बजेट)
 * Note Counter, Bill Shop, Budget Towers.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, big, Hud, Tip, Props, numQ } from './h4';

const rs = (lang: 'ne' | 'en', n: number) => `${lang === 'ne' ? 'रु' : 'Rs'} ${big(lang, n)}`;

/* ───────────── Note Counter ───────────── */
const DEN = [1000, 500, 100, 50, 20, 10, 5, 2, 1];
const DCOL = ['#a855f7', '#ec4899', '#f97316', '#22c55e', '#0ea5e9', '#eab308', '#14b8a6', '#94a3b8', '#a8a29e'];
const greedy = (amt: number) => { let r = amt; return DEN.map((d) => { const c = Math.floor(r / d); r -= c * d; return c; }); };

export const NoteCounter: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L8-01', chapter: 8, titleNp: 'नोट गणक', titleEn: 'Note Counter' });
  const [cnt, setCnt] = useState<number[]>(new Array(9).fill(0));
  const [target, setTarget] = useState(275);
  const [lstep, setLstep] = useState(0);
  const [amt, setAmt] = useState(275);
  const scene = useRef<{ set: (c: number[]) => void } | null>(null);
  const total = cnt.reduce((s, c, i) => s + c * DEN[i], 0);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const set = (c: number[]) => {
      g.clear();
      DEN.forEach((d, i) => {
        const x = (i - 4) * 2.1; const coin = d < 5; const col = DCOL[i];
        const pad = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 1.5), mat('#e2e8f0', 0.8))); pad.position.set(x, 0.05, 0); pad.userData.den = i; g.add(pad);
        for (let k = 0; k < Math.min(c[i], 14); k++) {
          const m = shadowed(coin ? new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.14, 24), mat(col, 0.3, 0.4)) : new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 1.0), mat(col, 0.6))); m.position.set(x, 0.17 + k * 0.15, 0); g.add(m);
        }
        const lab = textSprite(`${d}`, 1.3, { px: 54, w: 160, h: 80, bg: col, color: '#fff' }); lab.position.set(x, 3.2 + 0.3, 0); g.add(lab);
        const cn = textSprite(`× ${c[i]}`, 1.2, { px: 44, w: 160, h: 72, bg: '#ffffff', border: col }); cn.position.set(x, 2.5, 0); g.add(cn);
      });
    };
    scene.current = { set }; set(new Array(9).fill(0));
    ctx.onTap(() => g.children.filter((o) => o.userData.den !== undefined), (hit) => { if (hit) tapRef.current?.(hit.object.userData.den); });
    return () => { scene.current = null; };
  }, [], { camera: [0, 6, 13], target: [0, 1.4, 0], minDistance: 8, maxDistance: 24, ground: 0xfef9c3 });
  const tapRef = useRef<((i: number) => void) | null>(null);

  const put = (c: number[]) => { setCnt(c); scene.current?.set(c); };
  const add = (i: number, d = 1) => { const c = cnt.slice(); c[i] = Math.max(0, Math.min(30, c[i] + d)); put(c); kit.tap(); };
  tapRef.current = (i: number) => { if (kit.mode !== 'CHALLENGE') add(i); };
  const newTarget = () => { const v = rnd(20, 999); setTarget(v); put(new Array(9).fill(0)); kit.say(`${rs('ne', v)} बनाऔँ`, `Make ${rs('en', v)}`); };
  const freshLearn = () => { const v = rnd(120, 989); setAmt(v); setLstep(0); put(new Array(9).fill(0)); kit.say(`${rs('ne', v)} कम से कम नोटमा कसरी बनाउने?`, `How can we make ${rs('en', v)} with the fewest notes?`); };
  useEffect(() => { if (kit.mode === 'LEARN') freshLearn(); else if (kit.mode === 'PLAY') newTarget(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const learnNext = () => {
    const g = greedy(amt); let s = lstep; while (s < 9 && g[s] === 0) s++;
    if (s >= 9) { kit.star(); freshLearn(); return; }
    const c = new Array(9).fill(0); for (let i = 0; i <= s; i++) c[i] = g[i]; put(c); setLstep(s + 1);
    kit.say(`${fmt('ne', g[s])} × ${fmt('ne', DEN[s])} = ${fmt('ne', g[s] * DEN[s])}`, `${g[s]} × ${DEN[s]} = ${g[s] * DEN[s]}`);
  };
  const check = () => { if (total === target) { kit.good(); kit.star(); window.setTimeout(newTarget, 1200); } else kit.oops(total < target ? 'अझै थपौँ' : 'धेरै भयो', total < target ? 'Add more' : 'That is too much'); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const c = new Array(9).fill(0); const pick = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, 3); pick.forEach((p) => (c[p] = rnd(1, 3))); return { c, i, v: rnd(3, 90) * 10 + rnd(0, 9) }; }), []);
  const questions: (QuizQuestion & { c: number[] })[] = data.map((d, i) => {
    const tot = d.c.reduce((s: number, x: number, j: number) => s + x * DEN[j], 0);
    if (i % 3 === 0) return { c: d.c, ...numQ('सबै नोट जोड्दा कति रुपैयाँ हुन्छ?', 'What is the total value of all the notes?', tot, i, [10, -10, 50, -50, 100, -100], (x) => rs(kit.lang, x), 1) };
    if (i % 3 === 1) { const f = greedy(d.v).reduce((s, x) => s + x, 0); return { c: greedy(d.v).map((x, j) => (DEN[j] >= 1 ? x : 0)), ...numQ(`${rs('ne', d.v)} लाई कम से कम कति नोट/सिक्का चाहिन्छ?`, `Fewest notes and coins needed for ${rs('en', d.v)}?`, f, i + 2, [1, -1, 2, -2], (x) => fmt(kit.lang, x), 1) }; }
    const r = rnd(2, 9); return { c: new Array(9).fill(0), ...numQ(`रु ${fmt('ne', r)} = कति पैसा? (१ रुपैयाँ = १०० पैसा)`, `Rs ${r} = how many paisa? (Rs 1 = 100 paisa)`, r * 100, i + 4, [100, -100, 10, 1000], (x) => fmt(kit.lang, x), 1) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color="#16a34a">
      {kit.mode === 'PLAY' && <div style={{ fontSize: 15, fontWeight: 900 }}>🎯 {rs(kit.lang, target)}</div>}
      {kit.mode === 'LEARN' && <div style={{ fontSize: 15, fontWeight: 900 }}>{rs(kit.lang, amt)}</div>}
      <div style={{ fontSize: 26, fontWeight: 900 }}>{rs(kit.lang, total)}</div>
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('सबैभन्दा ठूलो नोटबाट सुरु गरौँ', 'Start with the biggest note')}</Tip><CBtn color="#16a34a" onClick={learnNext}>{kit.t('अर्को', 'Next')} ➜</CBtn><CBtn color="#8b5cf6" onClick={freshLearn}>🎲</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{DEN.map((d, i) => <CBtn key={d} color={DCOL[i]} style={{ minWidth: 52 }} onClick={() => add(i)} onContextMenu={(e) => { e.preventDefault(); add(i, -1); }}>+{d}</CBtn>)}<CBtn color="#64748b" onClick={() => put(new Array(9).fill(0))}>↺</CBtn><CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => put(q.c)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};

/* ───────────── Bill Shop ───────────── */
const ITEMS = [
  { np: 'चामल (१ किलो)', en: 'Rice (1 kg)', price: 120, color: '#f59e0b' }, { np: 'दाल (१ किलो)', en: 'Lentils (1 kg)', price: 180, color: '#ef4444' },
  { np: 'चिनी (१ किलो)', en: 'Sugar (1 kg)', price: 110, color: '#94a3b8' }, { np: 'तेल (१ लिटर)', en: 'Oil (1 L)', price: 250, color: '#eab308' },
  { np: 'कापी', en: 'Copy', price: 30, color: '#0ea5e9' }, { np: 'पेन्सिल', en: 'Pencil', price: 10, color: '#22c55e' },
];
export const BillShop: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L13-01', chapter: 13, titleNp: 'बिल पसल', titleEn: 'Bill Shop' });
  const [q, setQ] = useState<number[]>([2, 0, 1, 0, 3, 0]);
  const [paid, setPaid] = useState(1000);
  const scene = useRef<{ set: (q: number[]) => void } | null>(null);
  const total = q.reduce((s, x, i) => s + x * ITEMS[i].price, 0);
  const rows = q.map((x, i) => ({ x, i })).filter((r) => r.x > 0);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const set = (qq: number[]) => {
      g.clear();
      ITEMS.forEach((it, i) => {
        const x = (i - 2.5) * 3.3;
        const shelf = shadowed(new THREE.Mesh(new THREE.BoxGeometry(3, 0.25, 1.6), mat('#a16207', 0.8))); shelf.position.set(x, 0.12, 0); g.add(shelf);
        for (let k = 0; k < qq[i]; k++) { const b = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat(it.color, 0.5))); b.position.set(x - 0.9 + (k % 3) * 1.0, 0.7 + Math.floor(k / 3) * 0.95, 0); g.add(b); }
        const t = textSprite(`${kit.lang === 'ne' ? it.np.split(' ')[0] : it.en.split(' ')[0]} · Rs ${it.price}`, 2.6, { px: 44, w: 320, h: 80, bg: '#ffffff', border: it.color }); t.position.set(x, 4.3, 0); g.add(t);
      });
    };
    scene.current = { set }; set([2, 0, 1, 0, 3, 0]);
    return () => { scene.current = null; };
  }, [], { camera: [0, 5, 14], target: [0, 1.8, 0], minDistance: 8, maxDistance: 24, ground: 0xfef9c3 });

  const put = (qq: number[]) => { setQ(qq); scene.current?.set(qq); };
  const bump = (i: number, d: number) => { const qq = q.slice(); qq[i] = Math.max(0, Math.min(9, qq[i] + d)); put(qq); };
  const basket = () => { const qq = [0, 0, 0, 0, 0, 0]; [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, 3).forEach((i) => (qq[i] = rnd(1, 4))); return qq; };
  const [lrev, setLrev] = useState(0);
  const fresh = () => { const b = basket(); put(b); setLrev(0); setPaid(1000); };
  useEffect(() => { if (kit.mode === 'LEARN') fresh(); else if (kit.mode === 'PLAY') { put([0, 0, 0, 0, 0, 0]); kit.say('रु ५०० भित्र सामान किनौँ', 'Shop with Rs 500 — stay within budget'); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const learnNext = () => {
    const lines = rows; if (lrev < lines.length) { const r = lines[lrev]; setLrev(lrev + 1); kit.say(`${fmt('ne', r.x)} × ${fmt('ne', ITEMS[r.i].price)} = ${fmt('ne', r.x * ITEMS[r.i].price)}`, `${r.x} × ${ITEMS[r.i].price} = ${r.x * ITEMS[r.i].price}`); }
    else if (lrev === lines.length) { setLrev(lrev + 1); kit.say(`जम्मा ${rs('ne', total)}, रु १००० दिँदा फिर्ता ${rs('ne', 1000 - total)}`, `Total ${rs('en', total)}. Paying Rs 1000 → change ${rs('en', 1000 - total)}`); kit.star(); }
    else fresh();
  };
  const pay = () => { if (total === 0) return; if (total <= 500) { kit.good(`फिर्ता ${rs('ne', 500 - total)}`, `Change ${rs('en', 500 - total)}`); kit.star(); window.setTimeout(() => put([0, 0, 0, 0, 0, 0]), 1200); } else kit.oops('रु ५०० भन्दा बढी भयो', 'Over the Rs 500 budget'); };

  const data = useMemo(() => Array.from({ length: 8 }, () => ({ q: basket(), pay: [500, 1000][rnd(0, 1)] })), []);
  const questions: (QuizQuestion & { q: number[] })[] = data.map((d, i) => {
    const tot = d.q.reduce((s, x, j) => s + x * ITEMS[j].price, 0); const isChange = i % 2 === 1 && tot < d.pay;
    return isChange ? { q: d.q, ...numQ(`बिल ${rs('ne', tot)} छ। ${rs('ne', d.pay)} दिँदा कति फिर्ता आउँछ?`, `The bill is ${rs('en', tot)}. Paying ${rs('en', d.pay)}, what is the change?`, d.pay - tot, i, [10, -10, 20, -20, 100], (x) => rs(kit.lang, x), 1) }
      : { q: d.q, ...numQ('चित्रमा देखाएका सबै सामानको जम्मा बिल कति?', 'What is the total bill for the goods shown?', tot, i + 3, [10, -10, 30, -30, 100, -100], (x) => rs(kit.lang, x), 1) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color="#f59e0b">
      <table style={{ margin: '0 auto', fontSize: 12, fontWeight: 700, borderCollapse: 'collapse' }}><tbody>
        {(kit.mode === 'LEARN' ? rows.slice(0, lrev) : rows).map((r) => <tr key={r.i}><td style={{ padding: '0 6px', textAlign: 'left' }}>{kit.t(ITEMS[r.i].np, ITEMS[r.i].en)}</td><td>{fmt(kit.lang, r.x)} × {fmt(kit.lang, ITEMS[r.i].price)}</td><td style={{ padding: '0 6px', textAlign: 'right' }}>= {fmt(kit.lang, r.x * ITEMS[r.i].price)}</td></tr>)}
      </tbody></table>
      <div style={{ fontSize: 20, fontWeight: 900 }}>{kit.t('जम्मा', 'Total')}: {kit.mode === 'LEARN' && lrev < rows.length ? '…' : rs(kit.lang, total)}</div>
      {kit.mode === 'PLAY' && <div style={{ fontSize: 12, fontWeight: 800, color: total > 500 ? '#dc2626' : '#16a34a' }}>{kit.t('बजेट रु ५००', 'Budget Rs 500')} · {total > 500 ? kit.t('बढी!', 'over!') : kit.t('बाँकी', 'left') + ' ' + rs(kit.lang, 500 - total)}</div>}
    </Hud>
  );
  void paid;
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('परिमाण × दर = रकम, सबै रकम जोडेर जम्मा बिल', 'Quantity × rate = amount; add all amounts for the total')}</Tip><CBtn color="#16a34a" onClick={learnNext}>{kit.t('अर्को', 'Next')} ➜</CBtn><CBtn color="#8b5cf6" onClick={fresh}>🎲</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{ITEMS.map((it, i) => <span key={i} style={{ display: 'inline-flex', gap: 4 }}><CBtn color={it.color} style={{ minWidth: 44 }} onClick={() => bump(i, -1)}>−</CBtn><CBtn color={it.color} onClick={() => bump(i, 1)}>+ {kit.t(it.np.split(' ')[0], it.en.split(' ')[0])}</CBtn></span>)}<CBtn color="#16a34a" onClick={pay}>💰 {kit.t('तिरौँ', 'Pay')}</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(qq: any) => put(qq.q)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};

/* ───────────── Budget Towers ───────────── */
const BCAT = [
  { np: 'खाना', en: 'Food', color: '#ef4444' }, { np: 'शिक्षा', en: 'School', color: '#0ea5e9' }, { np: 'यातायात', en: 'Travel', color: '#eab308' }, { np: 'घरायसी', en: 'Household', color: '#8b5cf6' },
];
export const BudgetTowers: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L13-02', chapter: 13, titleNp: 'बजेट टावर', titleEn: 'Budget Towers' });
  const [inc, setInc] = useState(30000);
  const [ex, setEx] = useState<number[]>([10000, 6000, 3000, 5000]);
  const [lstep, setLstep] = useState(4);
  const scene = useRef<{ set: (inc: number, ex: number[], upto: number) => void } | null>(null);
  const spent = ex.reduce((s, x) => s + x, 0), save = inc - spent;

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const set = (income: number, exs: number[], upto: number) => {
      g.clear(); const S = 0.2 / 1000; const tower = (x: number, v: number, col: string, label: string) => {
        const h = Math.max(0.05, Math.abs(v) * S); const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2, h, 2), mat(v < 0 ? '#dc2626' : col, 0.5))); m.position.set(x, h / 2, 0); g.add(m);
        const t = textSprite(label, 2.4, { px: 44, w: 320, h: 80, bg: '#ffffff', border: col }); t.position.set(x, h + 0.9, 0); g.add(t);
      };
      tower(-7.5, income, '#64748b', `${kit.lang === 'ne' ? 'आम्दानी' : 'Income'} ${income}`);
      exs.forEach((v, i) => { if (i < upto) tower(-3.8 + i * 2.7, v, BCAT[i].color, `${kit.lang === 'ne' ? BCAT[i].np : BCAT[i].en} ${v}`); });
      if (upto >= exs.length) { const sv = income - exs.reduce((s, x) => s + x, 0); tower(7.3, sv, '#16a34a', `${kit.lang === 'ne' ? (sv < 0 ? 'घाटा' : 'बचत') : sv < 0 ? 'Deficit' : 'Saving'} ${Math.abs(sv)}`); }
    };
    scene.current = { set }; set(30000, [10000, 6000, 3000, 5000], 4);
    return () => { scene.current = null; };
  }, [], { camera: [0, 7, 19], target: [0, 3, 0], minDistance: 10, maxDistance: 30, ground: 0xecfccb });

  const put = (i: number, e: number[], u = 4) => { setInc(i); setEx(e); scene.current?.set(i, e, u); };
  const freshLearn = () => { const i = rnd(2, 5) * 10000; const e = BCAT.map((_, k) => rnd(1, 3) * 1000 + [4000, 2000, 1000, 2000][k]); put(i, e, 0); setLstep(0); kit.say(`आम्दानी ${rs('ne', i)}। खर्चको योजना बनाऔँ`, `Income is ${rs('en', i)}. Let us plan the spending`); };
  const newPlay = () => { put(30000, [8000, 6000, 4000, 4000]); kit.say('कम्तीमा रु ५,००० बचत गर', 'Try to save at least Rs 5,000'); };
  useEffect(() => { if (kit.mode === 'LEARN') freshLearn(); else if (kit.mode === 'PLAY') newPlay(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const learnNext = () => {
    if (lstep < 4) { const n = lstep + 1; setLstep(n); scene.current?.set(inc, ex, n); kit.say(`${BCAT[lstep].np}मा ${rs('ne', ex[lstep])} खर्च`, `${BCAT[lstep].en}: ${rs('en', ex[lstep])}`); }
    else if (lstep === 4) { setLstep(5); scene.current?.set(inc, ex, 4); kit.say(`बचत = ${fmt('ne', inc)} − ${fmt('ne', spent)} = ${rs('ne', save)}`, `Saving = ${inc} − ${spent} = ${rs('en', save)}`); kit.star(); }
    else freshLearn();
  };
  const bump = (i: number, d: number) => { const e = ex.slice(); e[i] = Math.max(0, Math.min(20000, e[i] + d)); put(inc, e); };
  const check = () => { if (save >= 5000) { kit.good(`बचत ${rs('ne', save)}`, `Saved ${rs('en', save)}`); kit.star(); window.setTimeout(newPlay, 1400); } else kit.oops(save < 0 ? 'घाटा भयो — खर्च घटाऔँ' : 'अझै बचत गरौँ', save < 0 ? 'Deficit — cut some spending' : 'Save a little more'); };

  const data = useMemo(() => Array.from({ length: 8 }, () => { const e = BCAT.map(() => rnd(2, 9) * 1000); const i = rnd(3, 6) * 10000; return { i, e }; }), []);
  const questions: (QuizQuestion & { d: { i: number; e: number[] } })[] = data.map((d, k) => {
    const sp = d.e.reduce((s, x) => s + x, 0);
    if (k % 2) return { d, ...numQ(`आम्दानी ${rs('ne', d.i)}, खर्च ${rs('ne', d.e[0])}, ${rs('ne', d.e[1])}, ${rs('ne', d.e[2])} र ${rs('ne', d.e[3])}। बचत वा घाटा कति?`, `Income ${rs('en', d.i)}; spending ${d.e.join(', ')}. How much is saved (negative = deficit)?`, d.i - sp, k, [1000, -1000, 5000, -5000, 10000], (x) => (x < 0 ? '−' : '') + rs(kit.lang, Math.abs(x)), -99999999) };
    return { d, ...numQ('चित्रका सबै खर्चको जम्मा कति?', 'What is the total of all the spending shown?', sp, k + 3, [1000, -1000, 2000, -2000, 10000], (x) => rs(kit.lang, x), 1) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color="#16a34a">
      <div style={{ fontSize: 14, fontWeight: 800, color: '#475569' }}>{kit.t('आम्दानी', 'Income')} {rs(kit.lang, inc)} − {kit.t('खर्च', 'Spent')} {rs(kit.lang, kit.mode === 'LEARN' ? ex.slice(0, Math.min(lstep, 4)).reduce((s, x) => s + x, 0) : spent)}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: save < 0 ? '#dc2626' : '#16a34a' }}>{kit.mode === 'LEARN' && lstep < 5 ? '…' : `${save < 0 ? kit.t('घाटा', 'Deficit') : kit.t('बचत', 'Saving')} ${rs(kit.lang, Math.abs(save))}`}</div>
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('बजेट = आम्दानीको योजना · बचत = आम्दानी − खर्च', 'A budget is a plan · Saving = income − spending')}</Tip><CBtn color="#16a34a" onClick={learnNext}>{lstep >= 5 ? kit.t('नयाँ', 'New') : kit.t('अर्को', 'Next')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{BCAT.map((c, i) => <span key={i} style={{ display: 'inline-flex', gap: 4 }}><CBtn color={c.color} style={{ minWidth: 44 }} onClick={() => bump(i, -1000)}>−</CBtn><CBtn color={c.color} onClick={() => bump(i, 1000)}>+ {kit.t(c.np, c.en)}</CBtn></span>)}<CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => put(q.d.i, q.d.e)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
