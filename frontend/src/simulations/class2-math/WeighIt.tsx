/**
 * Lesson 6 · Weight (तौल)
 * Weigh It — heavier goes down. Balance an object with 1 kg, 2 kg and 5 kg weights to find its weight.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, rnd } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const ITEMS = [
  { np: 'किताब', en: 'Book', emoji: '📕', w: 1, color: '#EF4444' },
  { np: 'झोला', en: 'School Bag', emoji: '🎒', w: 2, color: '#0284C7' },
  { np: 'तरबुजा', en: 'Watermelon', emoji: '🍉', w: 3, color: '#16A34A' },
  { np: 'बिरालो', en: 'Cat', emoji: '🐱', w: 4, color: '#F59E0B' },
  { np: 'चामलको बोरा', en: 'Rice sack', emoji: '🌾', w: 5, color: '#D97706' },
  { np: 'ठूलो ढुङ्गा', en: 'Big stone', emoji: '🪨', w: 8, color: '#64748B' },
];

export const WeighIt: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L6-01',
    chapter: 6,
    titleNp: 'तौलौँ (तौल)',
    titleEn: 'Weigh It (Weight)',
  });

  const [itemIndex, setItemIndex] = useState(2); // default Watermelon 3kg
  const [weights, setWeights] = useState<number[]>([]);
  const [li, setLi] = useState(0);

  const targetItem = ITEMS[itemIndex];
  const totalRightWeight = weights.reduce((a, b) => a + b, 0);
  const isBalanced = targetItem.w === totalRightWeight;

  const tiltAngle =
    targetItem.w === totalRightWeight
      ? 0
      : targetItem.w > totalRightWeight
        ? 10
        : -10;

  const addWeight = (w: number) => {
    kit.tap();
    const next = [...weights, w];
    setWeights(next);
    const sum = next.reduce((a, b) => a + b, 0);

    if (sum === targetItem.w) {
      kit.good(
        `स्याबास! तराजु सन्तुलित भयो! ${targetItem.np}को तौल ${toNp(targetItem.w)} के.जी. हो।`,
        `Balanced! The ${targetItem.en} weighs exactly ${targetItem.w} kg.`
      );
      kit.star();
    } else if (sum > targetItem.w) {
      kit.oops('ढक बढी भयो! केही ढक हटाउनुहोस्', 'Too heavy on the right! Remove some weights.');
    }
  };

  const removeWeight = (idx: number) => {
    kit.tap();
    setWeights((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearWeights = () => {
    setWeights([]);
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      setItemIndex(li % ITEMS.length);
      setWeights([]);
      const it = ITEMS[li % ITEMS.length];
      kit.say(
        `${it.np}लाई तौलन दायाँ पल्लामा १, २ वा ५ के.जी. का ढकहरू राख्नुहोस्।`,
        `Place 1kg, 2kg, or 5kg weights on the right pan to weigh the ${it.en}.`
      );
    } else if (kit.mode === 'PLAY') {
      setItemIndex(rnd(0, ITEMS.length - 1));
      setWeights([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Quiz questions for Challenge Mode
  const questions: QuizQuestion[] = ITEMS.map((it, i) => ({
    np: `यदि तराजुमा ${it.np} र ${toNp(it.w)} के.जी. को ढक बराबर भएमा ${it.np}को तौल कति हो?`,
    en: `If the ${it.en} balances with ${it.w} kg weight, how much does the ${it.en} weigh?`,
    answer: String(it.w),
    options: numChoices(it.w, i * 17 + 3, [1, -1, 2, -2]).map((v) => ({
      key: String(v),
      label: `${fmt(kit.lang, v)} ${kit.t('के.जी.', 'kg')}`,
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
        fontSize: 15,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      {kit.t('दायाँ पल्लाको ढक', 'Right Weights')}:{' '}
      <span style={{ color: isBalanced ? '#16A34A' : '#0284C7', fontSize: 18 }}>
        {toNp(totalRightWeight)} {kit.t('के.जी.', 'kg')}
      </span>{' '}
      {isBalanced && <span style={{ color: '#16A34A' }}>✅ {kit.t('बराबर!', 'Balanced!')}</span>}
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#26332E' }}>
          {kit.t('ढक थप्नुहोस्:', 'Add Weights:')}
        </span>
        <CBtn color="#334155" onClick={() => addWeight(1)}>+१ {kit.t('के.जी.', 'kg')}</CBtn>
        <CBtn color="#475569" onClick={() => addWeight(2)}>+२ {kit.t('के.जी.', 'kg')}</CBtn>
        <CBtn color="#1E293B" onClick={() => addWeight(5)}>+५ {kit.t('के.जी.', 'kg')}</CBtn>
        <CBtn color="#EF4444" disabled={weights.length === 0} onClick={clearWeights}>
          ↺ {kit.t('ढक खाली', 'Clear')}
        </CBtn>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को वस्तु', 'Next Item')} ➜
          </CBtn>
        )}

        {kit.mode === 'PLAY' && (
          <CBtn
            color="#D97706"
            onClick={() => {
              setItemIndex(rnd(0, ITEMS.length - 1));
              setWeights([]);
            }}
          >
            🎲 {kit.t('नयाँ वस्तु', 'Random Item')}
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
          padding: 20,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 820,
            background: '#FFFFFF',
            borderRadius: 24,
            padding: '30px 24px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Double-Pan Balance Scale SVG */}
          <svg width="640" height="260" viewBox="0 0 640 260">
            {/* Stand Post */}
            <rect x="314" y="90" width="12" height="150" fill="#92400E" rx="4" />
            <ellipse cx="320" cy="240" rx="60" ry="14" fill="#78350F" />
            <circle cx="320" cy="90" r="8" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />

            {/* Tilting Beam & Hanging Pans */}
            <g
              transform={`rotate(${tiltAngle} 320 90)`}
              style={{ transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              {/* Beam */}
              <line x1="80" y1="90" x2="560" y2="90" stroke="#D97706" strokeWidth="8" strokeLinecap="round" />

              {/* Left Pan Chains & Pan */}
              <g transform="translate(80, 90)">
                <line x1="0" y1="0" x2="-40" y2="70" stroke="#94A3B8" strokeWidth="2" />
                <line x1="0" y1="0" x2="40" y2="70" stroke="#94A3B8" strokeWidth="2" />
                <ellipse cx="0" cy="74" rx="55" ry="12" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
                {/* Item emoji & text */}
                <text x="0" y="55" textAnchor="middle" fontSize="36">
                  {targetItem.emoji}
                </text>
                <text x="0" y="98" textAnchor="middle" fill="#1E293B" fontSize="13" fontWeight="900">
                  {kit.t(targetItem.np, targetItem.en)}
                </text>
              </g>

              {/* Right Pan Chains & Pan */}
              <g transform="translate(560, 90)">
                <line x1="0" y1="0" x2="-40" y2="70" stroke="#94A3B8" strokeWidth="2" />
                <line x1="0" y1="0" x2="40" y2="70" stroke="#94A3B8" strokeWidth="2" />
                <ellipse cx="0" cy="74" rx="55" ry="12" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />

                {/* Standard Weights piled on right pan */}
                {weights.map((w, idx) => (
                  <g
                    key={idx}
                    transform={`translate(${(idx % 3 - 1) * 22}, ${54 - Math.floor(idx / 3) * 16})`}
                    onClick={() => removeWeight(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x="-10" y="-8" width="20" height="16" rx="4" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
                    <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900">
                      {w}k
                    </text>
                  </g>
                ))}
              </g>
            </g>
          </svg>

          {/* Feedback footer */}
          <div style={{ fontSize: 14, fontWeight: 800, color: '#64748B', textAlign: 'center' }}>
            {isBalanced ? (
              <span style={{ color: '#16A34A', fontSize: 16 }}>
                🎉 {kit.t('तराजु बराबर छ! दुवै पल्लाको तौल बराबर भयो।', 'Perfect! The scale is in balance.')}
              </span>
            ) : targetItem.w > totalRightWeight ? (
              <span>
                {kit.t('वस्तु गह्रुँगो छ, दायाँ पल्लामा अझै ढक थप्नुहोस्।', 'The item is heavier. Add more weights to the right pan.')}
              </span>
            ) : (
              <span style={{ color: '#EF4444' }}>
                {kit.t('दायाँ पल्ला गह्रुँगो भयो! ढकमा थिचेर हटाउनुहोस्।', 'The right pan is heavier! Click on a weight to remove it.')}
              </span>
            )}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
