/**
 * Lesson 11 · Multiplication 1 — equal groups
 * Equal Groups Garden — baskets with the same number of apples: 3 + 3 + 3 = 3 × 3 = 9.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, shuffle, toNp } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const LEARN_PRESETS = [
  [3, 2], // 2 baskets of 3
  [2, 4], // 4 baskets of 2
  [5, 3], // 3 baskets of 5
  [4, 4], // 4 baskets of 4
  [10, 3], // 3 baskets of 10
];

export const EqualGroups: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L11-01',
    chapter: 11,
    titleNp: 'बराबर समूह बगैँचा (गुणन)',
    titleEn: 'Equal Groups Garden (Multiplication)',
  });

  const [per, setPer] = useState(3); // apples per basket
  const [groups, setGroups] = useState(2); // number of baskets
  const [li, setLi] = useState(0);

  const total = groups * per;

  const addGroup = () => {
    if (groups >= 8) {
      kit.oops('8 टोकरीसम्म मात्र', 'Up to 8 baskets');
      return;
    }
    kit.tap();
    const nextG = groups + 1;
    setGroups(nextG);
    kit.say(
      `${toNp(nextG)} × ${toNp(per)} = ${toNp(nextG * per)}`,
      `${nextG} × ${per} = ${nextG * per}`
    );
  };

  const delGroup = () => {
    if (groups <= 1) return;
    kit.tap();
    setGroups((v) => v - 1);
  };

  const setApplesPerBasket = (p: number) => {
    kit.tap();
    setPer(p);
    kit.say(`प्रत्येक टोकरीमा ${toNp(p)} स्याउ`, `${p} apples per basket`);
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      const [p, g] = LEARN_PRESETS[li % LEARN_PRESETS.length];
      setPer(p);
      setGroups(g);
      kit.say(
        `प्रत्येक टोकरीमा ${toNp(p)} स्याउ छन्। जम्मा ${toNp(g)} टोकरी।`,
        `Every basket has ${p} apples. There are ${g} baskets.`
      );
    } else if (kit.mode === 'PLAY') {
      setPer(rnd(2, 5));
      setGroups(rnd(2, 5));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Quiz questions for Challenge Mode
  const data = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const p = [2, 3, 4, 5, 10][rnd(0, 4)];
    const g = rnd(2, 5);
    return { p, g, kind: i % 2 === 0 ? 'total' : 'sentence' };
  }), []);

  const questions: (QuizQuestion & { p: number; g: number })[] = data.map((d, i) =>
    d.kind === 'total'
      ? {
        np: `${toNp(d.g)} वटा टोकरी, प्रत्येकमा ${toNp(d.p)} स्याउ। जम्मा कति स्याउ हुन्छन्?`,
        en: `${d.g} baskets with ${d.p} apples each. How many apples in total?`,
        p: d.p,
        g: d.g,
        answer: String(d.p * d.g),
        options: numChoices(d.p * d.g, i * 5 + 1, [d.p, -d.p, 1, -1]).map((v) => ({
          key: String(v),
          label: fmt(kit.lang, v),
        })),
      }
      : {
        np: `चित्रमा ${toNp(d.g)} टोकरीमा ${toNp(d.p)}–${toNp(d.p)} स्याउ छन्। यसको गुणन वाक्य कुन हो?`,
        en: `Which multiplication sentence matches ${d.g} baskets of ${d.p} apples?`,
        p: d.p,
        g: d.g,
        answer: `${d.g}x${d.p}`,
        options: shuffle([`${d.g}x${d.p}`, `${d.p}x${d.g + 1}`, `${d.g + 1}x${d.p}`], i + 9).map((v) => ({
          key: v,
          label: v.replace('x', ' × ') + ` = ${v.split('x').map(Number).reduce((a, b) => a * b, 1)}`,
        })),
      }
  );

  const additionSentence = Array.from({ length: groups })
    .map(() => toNp(per))
    .join(' + ');

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #187C68',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        fontSize: 18,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      <span style={{ color: '#059669' }}>
        {toNp(groups)} × {toNp(per)} = {toNp(total)}
      </span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Apple per basket selector */}
        <div style={{ display: 'inline-flex', gap: 4, background: '#FEF2F2', padding: '4px 8px', borderRadius: 10, border: '1px solid #FECACA' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#DC2626', alignSelf: 'center', marginRight: 4 }}>
            {kit.t('स्याउ संख्या:', 'Apples:')}
          </span>
          {[2, 3, 4, 5, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setApplesPerBasket(num)}
              style={{
                width: 34,
                height: 32,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                background: per === num ? '#DC2626' : '#FFFFFF',
                color: per === num ? '#FFFFFF' : '#1E293B',
              }}
            >
              {kit.lang === 'ne' ? toNp(num) : num}
            </button>
          ))}
        </div>

        {/* Group Adjusters */}
        <CBtn color="#059669" disabled={groups >= 8} onClick={addGroup}>
          🧺 {kit.t('+1 टोकरी थपौँ', '+1 Basket')}
        </CBtn>
        <CBtn color="#DC2626" disabled={groups <= 1} onClick={delGroup}>
          -1 {kit.t('टोकरी घटाऔँ', '-1 Basket')}
        </CBtn>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को उदाहरण', 'Next Example')} ➜
          </CBtn>
        )}

        {kit.mode === 'PLAY' && (
          <CBtn
            color="#D97706"
            onClick={() => {
              setPer(rnd(2, 5));
              setGroups(rnd(2, 5));
            }}
          >
            🎲 {kit.t('नयाँ समूह', 'Random')}
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
          gap: 20,
        }}
      >
        {/* Equations Explanation Banner */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 800, color: '#64748B' }}>
            {kit.t('बारम्बार जोड', 'Repeated Addition')}:{' '}
            <span style={{ color: '#0284C7', fontWeight: 900 }}>
              {additionSentence} = {toNp(total)}
            </span>
          </div>
          <div style={{ fontSize: 20, color: '#CBD5E1' }}>➔</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#059669' }}>
            {kit.t('गुणन रूप', 'Multiplication')}: {toNp(groups)} × {toNp(per)} = {toNp(total)}
          </div>
        </div>

        {/* 2D Baskets Display Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16,
            width: '100%',
            maxWidth: 820,
            justifyContent: 'center',
          }}
        >
          {Array.from({ length: groups }).map((_, gIdx) => (
            <div
              key={gIdx}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '12px',
                border: '2px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B' }}>
                {kit.t(`टोकरी #${toNp(gIdx + 1)}`, `Basket #${gIdx + 1}`)}
              </div>

              {/* Basket with apples */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  justifyContent: 'center',
                  alignItems: 'center',
                  maxWidth: 120,
                  minHeight: 50,
                  background: '#FEF2F2',
                  padding: '6px 8px',
                  borderRadius: 12,
                  border: '1.5px solid #FECACA',
                }}
              >
                {Array.from({ length: per }).map((_, aIdx) => (
                  <span key={aIdx} style={{ fontSize: per > 6 ? 16 : 22 }}>
                    🍎
                  </span>
                ))}
              </div>

              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: 8,
                  padding: '2px 8px',
                  fontSize: 12,
                  fontWeight: 900,
                  color: '#1E293B',
                }}
              >
                {toNp(per)} {kit.t('स्याउ', 'apples')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SimFrame2D>
  );
};
