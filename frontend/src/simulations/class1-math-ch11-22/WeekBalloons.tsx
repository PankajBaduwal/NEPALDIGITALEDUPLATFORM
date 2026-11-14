/**
 * Chapter 19 · Time (समय) — Days of the week
 * Week Balloons — seven balloons float in a rainbow; learn the order of the days and put them in order.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { balloon, textSprite } from '../class1-math-kit/models';
import { DAYS, ORD_EN, ORD_NP, shuffle, toNp } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }

export const WeekBalloons: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH19-01', chapter: 19, titleNp: 'हप्ताका बेलुन (बारहरू)', titleEn: 'Week Balloons (Days of the Week)' });
  const [next, setNext] = useState(0);
  const [order, setOrder] = useState<number[]>(() => shuffle([0, 1, 2, 3, 4, 5, 6]));
  const [sung, setSung] = useState(-1);
  const scene = useRef<{ arrange: (mode: 'arc' | 'mixed', ord?: number[]) => void; pulse: (i: number) => void; setLabels: (lang: 'ne' | 'en') => void; pop: (i: number) => void } | null>(null);
  const live = useRef({ mode: kit.mode, next: 0, lang: kit.lang, onTapDay: (_i: number) => {} });
  live.current.mode = kit.mode; live.current.next = next; live.current.lang = kit.lang;
  live.current.onTapDay = (i) => {
    if (kit.mode === 'LEARN') {
      kit.tap(); scene.current?.pulse(i);
      kit.say(`${DAYS[i].np} हप्ताको ${ORD_NP[i + 1]} दिन हो।`, `${DAYS[i].en} is the ${ORD_EN[i + 1]} day of the week.`);
    } else if (kit.mode === 'PLAY') {
      if (i === next) {
        kit.tap(); scene.current?.pop(i); kit.say(`${DAYS[i].np}!`, `${DAYS[i].en}!`);
        if (next === 6) { kit.good('सबै बार मिले!', 'All days in order!'); kit.star(); setNext(7); } else setNext(next + 1);
      } else { scene.current?.pulse(i); kit.oops(`${DAYS[next].np} खोजौँ`, `Find ${DAYS[next].en} first`); }
    }
  };

  useStage(kit.stageRef, (ctx) => {
    const group = new THREE.Group(); ctx.scene.add(group);
    const items: THREE.Group[] = [];
    DAYS.forEach((d, i) => {
      const g = new THREE.Group();
      const b = balloon(d.color); b.scale.setScalar(1.6); g.add(b);
      const lab = textSprite('', 2.1, { px: 56, w: 256, h: 128, bg: 'rgba(255,255,255,.9)', border: d.color, radius: 24 }); lab.position.set(0, 2.6, 0.9); g.add(lab);
      const num = textSprite(String(i + 1), 0.8, { px: 90, w: 128, h: 128, color: '#ffffff', bg: d.color, radius: 64 }); num.position.set(0, 1.1, 0.9); g.add(num);
      g.userData.day = i; g.userData.lab = lab; g.userData.num = num; g.userData.base = new THREE.Vector3();
      group.add(g); items.push(g);
    });
    const posArc = (slot: number) => { const a = Math.PI * (0.12 + 0.76 * (slot / 6)); return new THREE.Vector3(-Math.cos(a) * 6.6, 0.8 + Math.sin(a) * 2.5, 0); };
    const arrange = (mode: 'arc' | 'mixed', ord?: number[]) => {
      items.forEach((g, i) => {
        const slot = mode === 'arc' ? i : (ord || [0, 1, 2, 3, 4, 5, 6]).indexOf(i);
        const p = posArc(slot);
        if (mode === 'mixed') p.y += (slot % 2) * 0.9;
        const p0 = g.userData.base.clone().lengthSq() ? g.userData.base.clone() : g.position.clone();
        ctx.tween(600, (k) => { g.userData.base.lerpVectors(p0, p, k); }, undefined, ease.inOut);
        g.visible = true; g.scale.setScalar(1);
        g.userData.num.visible = mode === 'arc';
      });
    };
    const pulse = (i: number) => { const g = items[i]; ctx.tween(500, (k) => g.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.25)); };
    const pop = (i: number) => { const g = items[i]; g.userData.num.visible = true; ctx.tween(500, (k) => g.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.3)); g.userData.done = true; };
    const setLabels = (lang: 'ne' | 'en') => items.forEach((g, i) => {
      const m: any = g.userData.lab.material; m.map?.dispose?.();
      const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d')!;
      x.fillStyle = 'rgba(255,255,255,.92)'; x.beginPath(); x.roundRect(4, 4, 248, 120, 24); x.fill(); x.lineWidth = 8; x.strokeStyle = DAYS[i].color; x.stroke();
      x.fillStyle = '#0f172a'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `800 ${lang === 'ne' ? 50 : 44}px "Noto Sans Devanagari","Nirmala UI",sans-serif`;
      x.fillText(lang === 'ne' ? DAYS[i].np : DAYS[i].en, 128, 66);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; m.map = tex; m.needsUpdate = true;
    });
    scene.current = { arrange, pulse, setLabels, pop };
    setLabels('ne'); arrange('arc');
    ctx.onFrame((_d, t) => items.forEach((g, i) => { g.position.copy(g.userData.base); g.position.y += Math.sin(t * 1.6 + i) * 0.18; }));
    ctx.onTap(() => items, (hit) => {
      if (!hit) return;
      let o: THREE.Object3D | null = hit.object;
      while (o && o.userData.day === undefined) o = o.parent;
      if (o) live.current.onTapDay(o.userData.day);
    });
    return () => { scene.current = null; };
  }, [], { camera: [0, 4.5, 14.5], target: [0, 3.2, 0], minDistance: 8, maxDistance: 20, sky: 0xc4e8ff });

  useEffect(() => { scene.current?.setLabels(kit.lang); }, [kit.lang]);
  useEffect(() => {
    const s = scene.current; if (!s) return;
    if (kit.mode === 'LEARN') { s.arrange('arc'); setSung(-1); kit.say('हप्तामा सात दिन हुन्छन्। बेलुन छोऔँ!', 'There are seven days in a week. Tap a balloon!'); }
    else if (kit.mode === 'PLAY') { const o = shuffle([0, 1, 2, 3, 4, 5, 6]); setOrder(o); setNext(0); s.arrange('mixed', o); kit.say('आइतबारदेखि क्रमैसँग बेलुन छोऔँ।', 'Tap the balloons in order, starting with Sunday.'); }
    else s.arrange('arc');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const sing = () => {
    let i = 0;
    const step = () => {
      if (i > 6) { setSung(7); kit.star(); return; }
      setSung(i); scene.current?.pulse(i); kit.say(`${DAYS[i].np}`, `${DAYS[i].en}`);
      i += 1; window.setTimeout(step, 1100);
    };
    step();
  };

  const data = useMemo(() => {
    const qs: { np: string; en: string; ans: number; fixed?: number[] }[] = [
      { np: 'हप्तामा कति दिन हुन्छन्?', en: 'How many days are there in a week?', ans: 7 },
      { np: 'हप्ताको पहिलो दिन कुन हो?', en: 'Which is the first day of the week?', ans: 0 },
      { np: 'हप्ताको अन्तिम दिन कुन हो?', en: 'Which is the last day of the week?', ans: 6 },
      { np: 'आइतबारपछि कुन बार आउँछ?', en: 'Which day comes after Sunday?', ans: 1 },
      { np: 'बुधबारपछि कुन बार आउँछ?', en: 'Which day comes after Wednesday?', ans: 4 },
      { np: 'शुक्रबारभन्दा अगाडि कुन बार आउँछ?', en: 'Which day comes before Friday?', ans: 4 },
      { np: 'हप्ताको चौथो दिन कुन हो?', en: 'Which is the fourth day of the week?', ans: 3 },
      { np: 'सोमबार हप्ताको कतिौँ दिन हो?', en: 'Monday is which day of the week?', ans: 1 },
    ];
    return qs;
  }, []);
  const questions: QuizQuestion[] = data.map((d, qi) => {
    if (qi === 0) return { np: d.np, en: d.en, answer: '7', options: ['5', '6', '7'].map((v) => ({ key: v, label: kit.lang === 'ne' ? toNp(v) : v })) };
    if (qi === 7) return { np: d.np, en: d.en, answer: '1', options: [0, 1, 2].map((v) => ({ key: String(v), label: kit.lang === 'ne' ? ORD_NP[v + 1] : ORD_EN[v + 1] })) };
    const pool = shuffle([0, 1, 2, 3, 4, 5, 6].filter((x) => x !== d.ans), qi * 13 + 5).slice(0, 2);
    const opts = shuffle([d.ans, ...pool], qi * 7 + 3);
    return { np: d.np, en: d.en, answer: String(d.ans), options: opts.map((v) => ({ key: String(v), label: kit.lang === 'ne' ? DAYS[v].np : DAYS[v].en })) };
  });

  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{sung === 7 ? kit.t('🎉 सातै दिन गाइयो!', '🎉 All seven days!') : kit.t('बेलुन छोएर बार सुनौँ', 'Tap a balloon to hear its day')}</div>
      <CBtn color="#8b5cf6" onClick={sing}>🎵 {kit.t('हप्ता गाऔँ', 'Sing the week')}</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      <div style={{ fontWeight: 900, fontSize: 18, flex: 1, minWidth: 220 }}>{next > 6 ? kit.t('🎉 शाबास! सबै मिल्यो', '🎉 Well done! All in order') : kit.t(`अब छोऔँ: ${DAYS[next].np}`, `Now tap: ${DAYS[next].en}`)}</div>
      <CBtn color="#f59e0b" onClick={() => { const o = shuffle([0, 1, 2, 3, 4, 5, 6]); setOrder(o); setNext(0); scene.current?.arrange('mixed', o); }}>🔀 {kit.t('फेरि मिसाऔँ', 'Shuffle')}</CBtn>
    </Controls>
  ) : <QuizPanel kit={kit} questions={questions} />;
  void order;
  return <SimFrame kit={kit} onBack={onBackToLibrary} panel={panel} />;
};
