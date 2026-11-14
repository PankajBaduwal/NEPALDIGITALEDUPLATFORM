/**
 * Class 4 lesson 4 · Number sense (सङ्ख्याको ज्ञान)
 * Lakh Towers (7-digit place value) and Round-Off Line (rounding to the nearest 10, 100 or 1000).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite, ball } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, big, Hud, Tip, Props, mcq, numQ, indian, lakhWords, Pillars, digitsOf, PL7 } from './h4';

const inl = (lang: 'ne' | 'en', n: number) => fmt(lang, indian(n));

/* ───────────── Lakh Towers ───────────── */
export const LakhTowers: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L4-01', chapter: 4, titleNp: 'लाख टावर', titleEn: 'Lakh Towers' });
  const [n, setN] = useState(4560789);
  const [rev, setRev] = useState(7);
  const [sel, setSel] = useState(6);
  const sc = useRef<Pillars | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const P = new Pillars(ctx, 7, { u: 0.46, colors: PL7.map((p) => p.color), names: PL7 }); sc.current = P;
    return () => { sc.current = null; P.dispose(); };
  }, [], { camera: [0, 5, 12.5], target: [0, 2.5, 0], minDistance: 7, maxDistance: 26 });

  const show = (v: number, upto = 7) => { const d = digitsOf(v, 7).map((x, i) => (i < upto ? x : 0)); sc.current?.set(d); };
  const fresh = () => { const v = rnd(1000000, 9999999); setN(v); setRev(0); show(v, 0); kit.say('अंक एक एक गरेर खोलौँ', 'Let us reveal the digits one by one'); };
  useEffect(() => { if (kit.mode === 'LEARN') fresh(); else if (kit.mode === 'PLAY') { setN(2305040); setSel(6); show(2305040); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);

  const learnNext = () => {
    if (rev >= 7) { kit.star(); fresh(); return; }
    const c = rev, d = digitsOf(n, 7)[c]; setRev(c + 1); show(n, c + 1); sc.current?.highlight(c);
    const val = d * Math.pow(10, 6 - c);
    kit.say(`${PL7[c].np}: ${fmt('ne', d)} → ${fmt('ne', indian(val))}`, `${PL7[c].en}: ${d} → ${indian(val)}`);
  };
  const bump = (dd: number) => { const d = digitsOf(n, 7); d[sel] = (d[sel] + dd + 10) % 10; const v = Number(d.join('')); setN(v); sc.current?.set(d); sc.current?.highlight(sel); };
  useEffect(() => { if (kit.mode === 'PLAY') sc.current?.highlight(sel); }, [sel, kit.mode]);

  const data = useMemo(() => Array.from({ length: 8 }, () => rnd(1000000, 9999999)), []);
  const questions: (QuizQuestion & { n: number })[] = data.map((v, i) => {
    const ds = digitsOf(v, 7); const c = rnd(1, 6); const d = ds[c] || 3; ds[c] = d; const vv = Number(ds.join(''));
    if (i % 3 === 0) { const val = d * Math.pow(10, 6 - c); return { n: vv, ...numQ(`${inl('ne', vv)} मा ${PL7[c].np} स्थानको अङ्क ${fmt('ne', d)} को स्थानीय मान कति?`, `In ${indian(vv)}, what is the place value of the digit ${d} in the ${PL7[c].en.toLowerCase()} place?`, val, i, [val * 10, val / 10, -val + d, d], (x) => inl(kit.lang, x), 1) }; }
    if (i % 3 === 1) return { n: vv, ...numQ(`${inl('ne', vv)} भन्दा १ ले ठूलो सङ्ख्या कुन हो?`, `Which number is 1 more than ${indian(vv)}?`, vv + 1, i, [-1, 10, 100, 2], (x) => inl(kit.lang, x)) };
    return { n: vv, ...mcq(`${inl('ne', vv)} को लाख स्थानको अङ्क कुन हो?`, `What is the digit in the lakhs place of ${indian(vv)}?`, String(ds[1]), [String((ds[1] + 1) % 10), String((ds[1] + 3) % 10), String(ds[0]), String((ds[1] + 6) % 10)], i) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color="#14b8a6">
      <div style={{ fontSize: 28, fontWeight: 900 }}>{kit.mode === 'LEARN' && rev < 7 ? '…' : inl(kit.lang, n)}</div>
      {(kit.mode !== 'LEARN' || rev >= 7) && kit.lang === 'en' && <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{lakhWords(n)}</div>}
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('दायाँबाट ३ अङ्क, त्यसपछि २-२ अङ्कमा अल्पविराम', 'Commas: first 3 digits from the right, then every 2')}</Tip><CBtn color="#16a34a" onClick={learnNext}>{rev >= 7 ? kit.t('नयाँ', 'New') : kit.t('अर्को अङ्क', 'Next digit')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{PL7.map((p, i) => <CBtn key={i} color={i === sel ? p.color : '#94a3b8'} style={{ minWidth: 48 }} onClick={() => setSel(i)}>{kit.t(p.np, p.en)}</CBtn>)}<CBtn color="#16a34a" onClick={() => bump(1)}>▲</CBtn><CBtn color="#ef4444" onClick={() => bump(-1)}>▼</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => show(q.n)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};

/* ───────────── Round-Off Line ───────────── */
const rr = (u: number) => { let v = 0; do v = rnd(u, u * 10 - 1); while (v % u === 0); return v; };
export const RoundingLine: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L4-02', chapter: 4, titleNp: 'अनुमान रेखा (नजिकको मान)', titleEn: 'Round-Off Line' });
  const [n, setN] = useState(47);
  const [u, setU] = useState(10);
  const [rolled, setRolled] = useState(false);
  const scene = useRef<{ set: (n: number, u: number, roll: boolean) => void } | null>(null);
  const lower = Math.floor(n / u) * u, up = n % u >= u / 2; const ans = up ? lower + u : lower;

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const set = (nn: number, uu: number, roll: boolean) => {
      g.clear(); const lo = Math.floor(nn / uu) * uu; const goUp = nn % uu >= uu / 2; const L = 20;
      const bar = shadowed(new THREE.Mesh(new THREE.BoxGeometry(L + 1, 0.2, 1.4), mat('#fde68a', 0.7))); bar.position.y = 0.1; g.add(bar);
      for (let i = 0; i <= 10; i++) {
        const x = -L / 2 + (L * i) / 10; const end = i === 0 || i === 10;
        const t = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.12, end ? 2.2 : i === 5 ? 1.4 : 0.6, 0.12), mat(end ? (i === 0 ? '#0ea5e9' : '#f97316') : i === 5 ? '#dc2626' : '#7c2d12'))); t.position.set(x, (end ? 2.2 : i === 5 ? 1.4 : 0.6) / 2 + 0.2, 0.8); g.add(t);
        const lab = textSprite(String(lo + (uu * i) / 10), end ? 2 : 1.2, { px: end ? 56 : 40, w: 192, h: 96, bg: end ? '#ffffff' : null, border: end ? (i === 0 ? '#0ea5e9' : '#f97316') : undefined, color: '#0f172a' }); lab.position.set(x, end ? 3.3 : 1.2, 0.8); g.add(lab);
      }
      const mid = textSprite(kit.lang === 'ne' ? 'बीचको बिन्दु' : 'halfway', 1.8, { px: 40, w: 256, h: 80, bg: '#fee2e2', border: '#dc2626' }); mid.position.set(0, 2.5, 0.8); g.add(mid);
      const bx = -L / 2 + (L * (nn - lo)) / uu; const bl = ball('#16a34a', 0.5); bl.position.set(bx, 0.7, 0); g.add(bl);
      const tag = textSprite(String(nn), 2.2, { px: 60, w: 256, h: 96, bg: '#16a34a', color: '#fff' }); tag.position.set(bx, 2.2, 0); g.add(tag);
      if (roll) { const tx = goUp ? L / 2 : -L / 2; ctx.tween(900, (k) => { bl.position.x = bx + (tx - bx) * k; tag.position.x = bl.position.x; bl.rotation.z = -k * 6; }, undefined, ease.inOut); }
    };
    scene.current = { set }; set(47, 10, false);
    return () => { scene.current = null; };
  }, [], { camera: [0, 6, 15], target: [0, 1.4, 0], minDistance: 8, maxDistance: 26, ground: 0xecfccb });

  const apply = (nn: number, uu: number, roll = false) => { setN(nn); setU(uu); setRolled(roll); scene.current?.set(nn, uu, roll); };
  const nextEx = (uu = u) => apply(rr(uu), uu);
  useEffect(() => { nextEx(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const doRound = () => { apply(n, u, true); setRolled(true); const lo = Math.floor(n / u) * u; kit.say(`${fmt('ne', n)} ${n - lo >= u / 2 ? 'बीचभन्दा माथि' : 'बीचभन्दा तल'} → ${fmt('ne', ans)}`, `${n} is ${n - lo >= u / 2 ? 'at or past' : 'before'} halfway → ${ans}`); kit.star(); };
  const guess = (g: number) => { if (g === ans) { kit.good(); kit.star(); apply(n, u, true); window.setTimeout(() => nextEx(), 1700); } else kit.oops(`${fmt('ne', n)} कुन अङ्कको नजिक छ?`, 'Which end is it closer to?'); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const uu = [10, 100, 1000][i % 3]; return { n: rr(uu), u: uu }; }), []);
  const questions: (QuizQuestion & { d: { n: number; u: number } })[] = data.map((d, i) => {
    const lo = Math.floor(d.n / d.u) * d.u; const a = d.n % d.u >= d.u / 2 ? lo + d.u : lo;
    return { d, ...mcq(`${big('ne', d.n)} लाई नजिकको ${fmt('ne', d.u)} मा मिलाऔँ`, `Round ${d.n.toLocaleString('en-US')} to the nearest ${d.u}`, String(a), [String(lo), String(lo + d.u), String(lo - d.u), String(lo + 2 * d.u)], i) };
  }).map((q) => ({ ...q, options: q.options.map((o) => ({ key: o.key, label: big(kit.lang, Number(o.key)) })) }));

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color="#16a34a">
      <div style={{ fontSize: 15, fontWeight: 800, color: '#475569' }}>{kit.t(`नजिकको ${fmt('ne', u)}`, `Nearest ${u}`)}</div>
      <div style={{ fontSize: 26, fontWeight: 900 }}>{big(kit.lang, n)} ≈ {rolled ? <span style={{ color: '#16a34a' }}>{big(kit.lang, ans)}</span> : '?'}</div>
    </Hud>
  );
  const unitBtns = [10, 100, 1000].map((x) => <CBtn key={x} color={x === u ? '#16a34a' : '#94a3b8'} onClick={() => nextEx(x)}>{fmt(kit.lang, x)}</CBtn>);
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('बीचको बिन्दु वा त्यसभन्दा माथि भए माथि, नत्र तल', 'At halfway or past it → round up; before it → round down')}</Tip>{unitBtns}<CBtn color="#16a34a" onClick={doRound}>⚽ {kit.t('गुडाऔँ', 'Roll')}</CBtn><CBtn color="#8b5cf6" onClick={() => nextEx()}>🎲</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{unitBtns}<CBtn color="#0ea5e9" onClick={() => guess(lower)}>{big(kit.lang, lower)}</CBtn><CBtn color="#f97316" onClick={() => guess(lower + u)}>{big(kit.lang, lower + u)}</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.d.n, q.d.u)} />;
  void shuffle;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
