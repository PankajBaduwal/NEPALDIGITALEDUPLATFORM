/**
 * Lesson 3 · Numbers up to 1000
 * Thousand Town — build any number up to 999 with hundred flats, ten rods and unit cubes.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, toNp } from '../class1-math-kit/nepali';
import { Base10Blocks2D } from './Base10Blocks2D';
import { fmt, enName1000, npBig, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

export const ThousandTown: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L3-01',
    chapter: 3,
    titleNp: 'हजार सहर (1000 सम्मका सङ्ख्या)',
    titleEn: 'Thousand Town (Numbers up to 1000)',
  });

  const [h, setH] = useState(3);
  const [t, setT] = useState(4);
  const [o, setO] = useState(5);
  const [target, setTarget] = useState(() => rnd(101, 899));
  const [li, setLi] = useState(0);

  const value = h * 100 + t * 10 + o;

  const sayNumber = () => {
    kit.say(
      `${npBig(value)} — ${toNp(h)} सय, ${toNp(t)} दशक, ${toNp(o)} एकाइ`,
      `${enName1000(value)} — ${h} hundreds, ${t} tens, ${o} ones`
    );
  };

  const addHundred = () => {
    if (h >= 9) {
      kit.oops('999 भन्दा बढी हुँदैन', 'Stay below 1000');
      return;
    }
    setH((v) => v + 1);
    kit.tap();
  };

  const delHundred = () => {
    if (h <= 0) return;
    setH((v) => v - 1);
    kit.tap();
  };

  const addTen = () => {
    kit.tap();
    if (t >= 9) {
      if (h >= 9) {
        kit.oops('999 भन्दा बढी हुँदैन', 'Stay below 1000');
        return;
      }
      setT(0);
      setH((v) => v + 1);
      kit.say('10 दशक मिलेर 1 सय बन्यो!', '10 tens bundled into 1 hundred!');
    } else {
      setT((v) => v + 1);
    }
  };

  const delTen = () => {
    if (t > 0) {
      setT((v) => v - 1);
      kit.tap();
    } else if (h > 0) {
      setH((v) => v - 1);
      setT(9);
      kit.say('1 सय फुकेर 10 दशक भयो', '1 hundred broke into 10 tens');
    }
  };

  const addOne = () => {
    kit.tap();
    if (o >= 9) {
      if (t >= 9 && h >= 9) {
        kit.oops('999 भन्दा बढी हुँदैन', 'Stay below 1000');
        return;
      }
      setO(0);
      if (t >= 9) {
        setT(0);
        setH((v) => v + 1);
        kit.say('10 दशक मिलेर 1 सय बन्यो!', '10 tens bundled into 1 hundred!');
      } else {
        setT((v) => v + 1);
        kit.say('10 एकाइ मिलेर 1 दशक बन्यो!', '10 ones bundled into 1 ten!');
      }
    } else {
      setO((v) => v + 1);
    }
  };

  const delOne = () => {
    if (o > 0) {
      setO((v) => v - 1);
      kit.tap();
    } else if (t > 0) {
      setT((v) => v - 1);
      setO(9);
      kit.say('1 दशक फुकेर 10 एकाइ भयो', '1 ten broke into 10 ones');
    } else if (h > 0) {
      setH((v) => v - 1);
      setT(9);
      setO(9);
      kit.say('1 सय फुकेर 10 दशक र 10 एकाइ भयो', '1 hundred unbundled');
    }
  };

  const setExact = (hh: number, tt: number, oo: number) => {
    setH(hh);
    setT(tt);
    setO(oo);
  };

  const nextPlayTarget = () => {
    const tg = rnd(101, 899);
    setTarget(tg);
    setExact(0, 0, 0);
    kit.say(`${npBig(tg)} बनाऔँ।`, `Build ${enName1000(tg)} (${tg}).`);
  };

  const checkPlay = () => {
    if (value === target) {
      kit.good(`उत्कृष्ट! ${target} सङ्ख्या बनाउनुभयो!`, `Excellent! You built ${target}!`);
      kit.star();
      setTimeout(nextPlayTarget, 1400);
    } else {
      kit.oops('सङ्ख्या मिलेन, ध्यान दिएर ब्लक थप्नुहोस् वा घटाउनुहोस्', 'Numbers do not match. Check your blocks.');
    }
  };

  const LEARN_PRESETS = [
    [1, 2, 4],
    [3, 0, 8],
    [4, 5, 0],
    [6, 7, 2],
    [8, 9, 5],
  ];

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      const p = LEARN_PRESETS[li % LEARN_PRESETS.length];
      setExact(p[0], p[1], p[2]);
      sayNumber();
    } else if (kit.mode === 'PLAY') {
      nextPlayTarget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Quiz questions for Challenge Mode
  const quizNumbers = [234, 405, 560, 718, 892, 340];
  const questions: QuizQuestion[] = quizNumbers.map((num, i) => {
    const hh = Math.floor(num / 100);
    const tt = Math.floor((num % 100) / 10);
    const oo = num % 10;
    return {
      np: `${toNp(hh)} सय, ${toNp(tt)} दशक र ${toNp(oo)} एकाइ मिलेर कुन सङ्ख्या बन्छ?`,
      en: `Which number has ${hh} hundreds, ${tt} tens and ${oo} ones?`,
      answer: String(num),
      options: numChoices(num, i * 11 + 4, [10, -10, 100, -100]).map((v) => ({
        key: String(v),
        label: fmt(kit.lang, v),
      })),
    };
  });

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #187C68',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}
    >
      {kit.mode === 'PLAY' ? (
        <div>
          <span style={{ fontSize: 13, color: '#64748B' }}>{kit.t('बनाउनुपर्ने सङ्ख्या', 'Target')}:</span>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#D97706' }}>
            🎯 {fmt(kit.lang, target)}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#187C68' }}>
            {fmt(kit.lang, value)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
            {kit.lang === 'ne' ? npBig(value) : enName1000(value)}
          </div>
        </div>
      )}
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Hundred buttons */}
        <div style={{ display: 'inline-flex', gap: 4, background: '#F0FDF4', padding: '4px 8px', borderRadius: 12, border: '1px solid #BBF7D0' }}>
          <CBtn color="#166534" onClick={addHundred}>+1 {kit.t('सय', 'Hundred')}</CBtn>
          <CBtn color="#166534" onClick={delHundred}>-1 {kit.t('सय', 'Hundred')}</CBtn>
        </div>

        {/* Ten buttons */}
        <div style={{ display: 'inline-flex', gap: 4, background: '#EFF6FF', padding: '4px 8px', borderRadius: 12, border: '1px solid #BFDBFE' }}>
          <CBtn color="#1E40AF" onClick={addTen}>+1 {kit.t('दशक', 'Ten')}</CBtn>
          <CBtn color="#1E40AF" onClick={delTen}>-1 {kit.t('दशक', 'Ten')}</CBtn>
        </div>

        {/* One buttons */}
        <div style={{ display: 'inline-flex', gap: 4, background: '#FFFBEB', padding: '4px 8px', borderRadius: 12, border: '1px solid #FDE68A' }}>
          <CBtn color="#92400E" onClick={addOne}>+1 {kit.t('एकाइ', 'One')}</CBtn>
          <CBtn color="#92400E" onClick={delOne}>-1 {kit.t('एकाइ', 'One')}</CBtn>
        </div>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को सङ्ख्या', 'Next')} ➜
          </CBtn>
        )}

        {kit.mode === 'PLAY' && (
          <CBtn color="#D97706" onClick={checkPlay}>
            ✓ {kit.t('जाँचौँ', 'Check Answer')}
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
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 20px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 760 }}>
          <Base10Blocks2D
            hundreds={h}
            tens={t}
            ones={o}
            lang={kit.lang}
            title={kit.t('स्थानमान ब्लकहरू (1000 सम्म)', 'Place Value Blocks (Up to 1000)')}
          />
        </div>
      </div>
    </SimFrame2D>
  );
};
