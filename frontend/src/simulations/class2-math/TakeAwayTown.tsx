/**
 * Lesson 8 · Subtraction — three-digit numbers
 * Take Away Town — take blocks away; break a hundred into tens or a ten into ones when you need more.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, toNp } from '../class1-math-kit/nepali';
import { Base10Blocks2D } from './Base10Blocks2D';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const LEARN_PAIRS = [
  [468, 235],
  [352, 127],
  [600, 243],
  [745, 368],
  [530, 176],
];

export const TakeAwayTown: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L8-01',
    chapter: 8,
    titleNp: 'घटाउ सहर (तीन अङ्क)',
    titleEn: 'Take Away Town (three-digit subtraction)',
  });

  const [a, setA] = useState(468);
  const [b, setB] = useState(235);
  const [h, setH] = useState(4);
  const [t, setT] = useState(6);
  const [o, setO] = useState(8);
  const [remH, setRemH] = useState(2);
  const [remT, setRemT] = useState(3);
  const [remO, setRemO] = useState(5);
  const [li, setLi] = useState(0);

  const setup = (x: number, y: number) => {
    setA(x);
    setB(y);
    setH(Math.floor(x / 100));
    setT(Math.floor((x % 100) / 10));
    setO(x % 10);
    setRemH(Math.floor(y / 100));
    setRemT(Math.floor((y % 100) / 10));
    setRemO(y % 10);
  };

  const isComplete = remH === 0 && remT === 0 && remO === 0;

  const takeOne = () => {
    if (remO === 0) {
      kit.oops('एकाइ पहिले नै घटाइसक्यौँ', 'Already took all needed ones');
      return;
    }
    if (o === 0) {
      kit.oops('एकाइ पुगेन! 1 दशक फुकाऔँ 🔨', 'Not enough ones! Break a ten 🔨');
      return;
    }
    kit.tap();
    setO((v) => v - 1);
    setRemO((v) => v - 1);
  };

  const takeTen = () => {
    if (remT === 0) {
      kit.oops('दशक पहिले नै घटाइसक्यौँ', 'Already took all needed tens');
      return;
    }
    if (t === 0) {
      kit.oops('दशक पुगेन! 1 सय फुकाऔँ 🔨', 'Not enough tens! Break a hundred 🔨');
      return;
    }
    kit.tap();
    setT((v) => v - 1);
    setRemT((v) => v - 1);
  };

  const takeHundred = () => {
    if (remH === 0) {
      kit.oops('सय पहिले नै घटाइसक्यौँ', 'Already took all needed hundreds');
      return;
    }
    if (h === 0) return;
    kit.tap();
    setH((v) => v - 1);
    setRemH((v) => v - 1);
  };

  const breakTen = () => {
    if (t <= 0) {
      kit.oops('फुकाउनको लागि दशक बाँकी छैन!', 'No tens left to break!');
      return;
    }
    kit.tap();
    setT((v) => v - 1);
    setO((v) => v + 10);
    kit.say('1 दशक फुकेर 10 एकाइ भयो!', '1 ten unbundled into 10 ones!');
  };

  const breakHundred = () => {
    if (h <= 0) {
      kit.oops('फुकाउनको लागि सय बाँकी छैन!', 'No hundreds left to break!');
      return;
    }
    kit.tap();
    setH((v) => v - 1);
    setT((v) => v + 10);
    kit.say('1 सय फुकेर 10 दशक भयो!', '1 hundred unbundled into 10 tens!');
  };

  useEffect(() => {
    if (isComplete && kit.mode !== 'CHALLENGE') {
      kit.good(`${toNp(a)} − ${toNp(b)} = ${toNp(a - b)}`, `${a} − ${b} = ${a - b}`);
      kit.star();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      const pair = LEARN_PAIRS[li % LEARN_PAIRS.length];
      setup(pair[0], pair[1]);
      kit.say(
        `${toNp(pair[0])} बाट ${toNp(pair[1])} घटाऔँ।`,
        `Let us subtract ${pair[1]} from ${pair[0]}.`
      );
    } else if (kit.mode === 'PLAY') {
      let x = rnd(250, 890);
      let y = rnd(100, x - 20);
      setup(x, y);
      kit.say('घटाउने ब्लकहरू हटाउँदै जानुहोस्।', 'Take away blocks according to the subtrahend.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Quiz Questions for Challenge Mode
  const data = useMemo(() => Array.from({ length: 6 }, () => {
    const x = rnd(250, 890);
    const y = rnd(100, x - 20);
    return { x, y, diff: x - y };
  }), []);

  const questions: (QuizQuestion & { x: number; y: number })[] = data.map((d, i) => ({
    np: `${toNp(d.x)} − ${toNp(d.y)} = ?`,
    en: `${d.x} − ${d.y} = ?`,
    x: d.x,
    y: d.y,
    answer: String(d.diff),
    options: numChoices(d.diff, i * 19 + 5, [10, -10, 100, 1, -1]).map((v) => ({
      key: String(v),
      label: fmt(kit.lang, v),
    })),
  }));

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #187C68',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        fontSize: 22,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      <span style={{ color: '#0284C7' }}>{toNp(a)}</span> −{' '}
      <span style={{ color: '#E11D48' }}>{toNp(b)}</span> ={' '}
      <span style={{ color: isComplete ? '#16A34A' : '#94A3B8' }}>
        {isComplete ? toNp(a - b) : '?'}
      </span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => setup(q.x, q.y)} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Step-by-step subtraction buttons */}
        <div style={{ display: 'inline-flex', gap: 4, background: '#FFFBEB', padding: '4px 8px', borderRadius: 10, border: '1px solid #FDE68A' }}>
          <CBtn color="#92400E" disabled={remO === 0} onClick={takeOne}>
            -1 {kit.t('एकाइ घटाऔँ', 'Take One')} ({toNp(remO)})
          </CBtn>
          <CBtn color="#D97706" disabled={t <= 0} onClick={breakTen}>
            🔨 {kit.t('1 दशक फुकाऔँ', 'Break 1 Ten')}
          </CBtn>
        </div>

        <div style={{ display: 'inline-flex', gap: 4, background: '#EFF6FF', padding: '4px 8px', borderRadius: 10, border: '1px solid #BFDBFE' }}>
          <CBtn color="#1E40AF" disabled={remT === 0} onClick={takeTen}>
            -1 {kit.t('दशक घटाऔँ', 'Take Ten')} ({toNp(remT)})
          </CBtn>
          <CBtn color="#2563EB" disabled={h <= 0} onClick={breakHundred}>
            🔨 {kit.t('1 सय फुकाऔँ', 'Break 1 Hundred')}
          </CBtn>
        </div>

        <div style={{ display: 'inline-flex', gap: 4, background: '#F0FDF4', padding: '4px 8px', borderRadius: 10, border: '1px solid #BBF7D0' }}>
          <CBtn color="#166534" disabled={remH === 0} onClick={takeHundred}>
            -1 {kit.t('सय घटाऔँ', 'Take Hundred')} ({toNp(remH)})
          </CBtn>
        </div>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को घटाउ', 'Next Problem')} ➜
          </CBtn>
        )}

        {kit.mode === 'PLAY' && (
          <CBtn
            color="#D97706"
            onClick={() => {
              const x = rnd(250, 890);
              const y = rnd(100, x - 20);
              setup(x, y);
            }}
          >
            🎲 {kit.t('नयाँ प्रश्न', 'Random')}
          </CBtn>
        )}
      </div>
    </Controls>
  );

  return (
    <SimFrame2D kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} grade={2}>
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          gap: 16,
        }}
      >
        {/* Remaining to take away status chip */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E11D48',
            borderRadius: 14,
            padding: '8px 20px',
            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 900, color: '#E11D48' }}>
            {kit.t('घटाउन बाँकी:', 'Still to take away:')}
          </span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#1E293B' }}>
            {kit.t('सय', 'Hundreds')}: <b style={{ color: '#166534' }}>{toNp(remH)}</b> |{' '}
            {kit.t('दशक', 'Tens')}: <b style={{ color: '#1E40AF' }}>{toNp(remT)}</b> |{' '}
            {kit.t('एकाइ', 'Ones')}: <b style={{ color: '#92400E' }}>{toNp(remO)}</b>
          </span>
        </div>

        {/* The Blocks Board */}
        <div style={{ width: '100%', maxWidth: 840 }}>
          <Base10Blocks2D
            hundreds={h}
            tens={t}
            ones={o}
            lang={kit.lang}
            title={
              isComplete
                ? kit.t(`बाँकी घटाउफल: ${toNp(a - b)} ✅`, `Remaining Difference: ${a - b} ✅`)
                : kit.t(`हालको ब्लक संख्या: ${toNp(h * 100 + t * 10 + o)}`, `Current Blocks: ${h * 100 + t * 10 + o}`)
            }
            color={isComplete ? '#16A34A' : '#0284C7'}
          />
        </div>
      </div>
    </SimFrame2D>
  );
};
