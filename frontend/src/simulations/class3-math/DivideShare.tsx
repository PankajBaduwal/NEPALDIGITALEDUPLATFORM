/**
 * Lesson 15 · Division (भाग)
 * Sharing Plates — 2D equal sharing of sweets among plates with remainder (भागफल र शेष).
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

const PLATE_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#0EA5E9', '#8B5CF6'];

export const DivideShare: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L15-01',
    chapter: 15,
    titleNp: 'थालमा बराबर बाँडौँ (भाग)',
    titleEn: 'Sharing Plates (Division)',
  });

  const [n, setN] = useState(14); // total sweets
  const [k, setK] = useState(4);  // plates
  const [isDistributed, setIsDistributed] = useState(false);

  const quotient = Math.floor(n / k);
  const remainder = n % k;

  const handleShare = () => {
    setIsDistributed(true);
    kit.tap();
    kit.say(
      `${n} मिठाईलाई ${k} थालमा बराबर बाँड्दा हरेकमा ${quotient}, र ${remainder} बाँकी रहन्छ।`,
      `Sharing ${n} sweets into ${k} plates gives ${quotient} each, with ${remainder} left over.`
    );
    kit.star();
  };

  const handleReset = () => {
    setIsDistributed(false);
    kit.tap();
  };

  const fresh = () => {
    const nextK = rnd(2, 5);
    const nextN = rnd(2, 7) * nextK + rnd(0, nextK - 1);
    setN(nextN);
    setK(nextK);
    setIsDistributed(false);
    kit.tap();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qk = rnd(2, 6);
      const qq = rnd(2, 7);
      const qr = i % 2 === 0 ? 0 : rnd(1, qk - 1);
      const qn = qk * qq + qr;

      if (i % 3 === 0) {
        return {
          np: `${qn} ÷ ${qk} गर्दा हरेक थालमा कति पर्छ?`,
          en: `${qn} sweets shared into ${qk} plates: how many in each?`,
          answer: String(qq),
          options: near(qq, i + 1, [1, -1, 2, -2], 1).map((x) => ({
            key: String(x),
            label: fmt(kit.lang, x),
          })),
        };
      } else if (i % 3 === 1) {
        return {
          np: `${qn} ÷ ${qk} मा कति शेष (बाँकी) रहन्छ?`,
          en: `${qn} ÷ ${qk}: what is the remainder?`,
          answer: String(qr),
          options: near(qr, i + 5, [1, -1, 2, qk - 1], 0)
            .filter((x) => x >= 0 && x < qk)
            .map((x) => ({
              key: String(x),
              label: fmt(kit.lang, x),
            })),
        };
      } else {
        return {
          np: `${qk} × ${qq} + ${qr} = ?`,
          en: `${qk} × ${qq} + ${qr} = ?`,
          answer: String(qn),
          options: near(qn, i + 8, [qk, -qk, 1, -1]).map((x) => ({
            key: String(x),
            label: fmt(kit.lang, x),
          })),
        };
      }
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={
        isDistributed
          ? kit.t(
            `बराबर बाँडियो! हरेक थालमा ${quotient} वटा, बाँकी ${remainder} वटा।`,
            `Shared equally! Each plate gets ${quotient}, with ${remainder} remainder.`
          )
          : kit.t(
            `जम्मा ${n} वटा मिठाईलाई ${k} वटा थालमा बराबर बाँडौँ!`,
            `Let's share ${n} sweets equally among ${k} plates!`
          )
      }
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => n > 6 && (setN(n - 1), setIsDistributed(false))}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('मिठाई', 'Sweets')} −
          </button>
          <button
            onClick={() => n < 36 && (setN(n + 1), setIsDistributed(false))}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('मिठाई', 'Sweets')} +
          </button>
          <button
            onClick={() => k > 2 && (setK(k - 1), setIsDistributed(false))}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('थाल', 'Plates')} −
          </button>
          <button
            onClick={() => k < 6 && (setK(k + 1), setIsDistributed(false))}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('थाल', 'Plates')} +
          </button>
          <button
            onClick={isDistributed ? handleReset : handleShare}
            style={{
              padding: '9px 20px',
              borderRadius: 12,
              border: 'none',
              background: '#187C68',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(24,124,104,0.2)',
            }}
          >
            {isDistributed ? `🔄 ${kit.t('फिर्ता लैजाऊ', 'Reset')}` : `🍬 ${kit.t('बराबर बाँडौँ', 'Share Equally')}`}
          </button>
          <button
            onClick={fresh}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🎲 {kit.t('नयाँ', 'Random')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 740, gap: 16 }}>
        {/* Division Equation Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '14px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 900, color: '#1E293B' }}>
            {fmt(kit.lang, n)} ÷ {fmt(kit.lang, k)} = {isDistributed ? fmt(kit.lang, quotient) : '?'}{' '}
            {isDistributed && remainder > 0 && (
              <span style={{ fontSize: 20, color: '#DC2626', marginLeft: 8 }}>
                ({kit.t('बाँकी / शेष', 'R')} {fmt(kit.lang, remainder)})
              </span>
            )}
          </div>
          {isDistributed && (
            <div style={{ fontSize: 13, fontWeight: 700, color: '#187C68' }}>
              {fmt(kit.lang, k)} × {fmt(kit.lang, quotient)} + {fmt(kit.lang, remainder)} = {fmt(kit.lang, n)}
            </div>
          )}
        </div>

        {/* 2D Plates View */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${k <= 3 ? k : Math.ceil(k / 2)}, 1fr)`,
            gap: 16,
            width: '100%',
          }}
        >
          {Array.from({ length: k }).map((_, pIdx) => (
            <div
              key={pIdx}
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: `3px solid ${PLATE_COLORS[pIdx % PLATE_COLORS.length]}`,
                padding: '16px',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: PLATE_COLORS[pIdx % PLATE_COLORS.length] }}>
                {kit.t(`थाल ${fmt(kit.lang, pIdx + 1)}`, `Plate ${pIdx + 1}`)}
              </div>

              {/* Sweets on this plate */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 10,
                  minHeight: 60,
                }}
              >
                {isDistributed &&
                  Array.from({ length: quotient }).map((_, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 35% 35%, #FDE047, #EA580C)',
                        border: '2px solid #C2410C',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                      }}
                      title="Sweet"
                    />
                  ))}
              </div>

              <div style={{ fontSize: 13, fontWeight: 900, color: '#475569' }}>
                {isDistributed ? `${fmt(kit.lang, quotient)} ${kit.t('मिठाई', 'sweets')}` : '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Remainder / Main Tray */}
        <div
          style={{
            width: '100%',
            background: '#F8FAFC',
            borderRadius: 16,
            border: '2px dashed #CBD5E1',
            padding: '14px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
            {isDistributed
              ? kit.t(`बाँकी (Remainder / शेष): ${remainder} वटा`, `Leftover (Remainder): ${remainder}`)
              : kit.t(`बाँड्न बाँकी मिठाई: ${n} वटा`, `Sweets to distribute: ${n}`)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {Array.from({ length: isDistributed ? remainder : n }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #FDE047, #EA580C)',
                  border: '2px solid #C2410C',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default DivideShare;
