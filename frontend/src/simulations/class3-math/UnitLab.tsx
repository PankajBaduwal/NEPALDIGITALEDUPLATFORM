/**
 * Unit conversion lab used by Class 3 lessons:
 * - Lesson 8: Metre and Centimetre (m ↔ cm)
 * - Lesson 16: Hours, Minutes, and Seconds (h ↔ min ↔ s)
 * - Lesson 18: Litre and Millilitre (L ↔ mL)
 * - Lesson 19: Road Trip (km ↔ m)
 * - Lesson 20: Kilogram and Gram (kg ↔ g)
 *
 * Converted to 100% 2D SVG and HTML5 interactive components.
 */
import React, { useMemo, useState, useEffect } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { shuffle, rnd } from '../class1-math-kit/nepali';
import { big as bigFmt, fmt, near } from './h3';

export type Visual = 'jug' | 'ruler' | 'road' | 'scale' | 'hours' | 'minutes';
export interface Pair {
  bigNp: string;
  bigEn: string;
  smallNp: string;
  smallEn: string;
  factor: number;
  max: number;
  step: number;
  visual: Visual;
  color: string;
  bs?: string;
  ss?: string;
}

export interface UnitCfg {
  code: string;
  chapter: number;
  titleNp: string;
  titleEn: string;
  pairs: Pair[];
  hintNp: string;
  hintEn: string;
}

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const asText = (p: Pair, lang: 'ne' | 'en', big: boolean) =>
  lang === 'ne' ? (big ? p.bigNp : p.smallNp) : big ? p.bigEn : p.smallEn;

export const makeUnitSim = (cfg: UnitCfg): React.FC<Props> => {
  const SimComponent: React.FC<Props> = ({ onBackToLibrary }) => {
    const kit = useSimKit({
      code: cfg.code,
      chapter: cfg.chapter,
      titleNp: cfg.titleNp,
      titleEn: cfg.titleEn,
    });

    const [pairIdx, setPairIdx] = useState(0);
    const [bigVal, setBigVal] = useState(2);
    const [extraVal, setExtraVal] = useState(0);

    const P = cfg.pairs[pairIdx];
    const totalSmall = bigVal * P.factor + extraVal;
    const maxCapacity = P.max * P.factor;

    const setValues = (b: number, e: number, speak = false) => {
      setBigVal(b);
      setExtraVal(e);
      kit.tap();
      if (speak) {
        kit.say(
          `${b} ${P.bigNp}${e ? ` र ${e} ${P.smallNp}` : ''} = ${b * P.factor + e} ${P.smallNp}`,
          `${b} ${P.bigEn}${e ? ` and ${e} ${P.smallEn}` : ''} = ${b * P.factor + e} ${P.smallEn}`
        );
      }
    };

    useEffect(() => {
      if (kit.mode === 'LEARN') {
        setValues(2, 0, true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kit.mode, pairIdx]);

    // Quiz Questions
    const questions: QuizQuestion[] = useMemo(() => {
      return Array.from({ length: 8 }, (_, i) => {
        const p = cfg.pairs[i % cfg.pairs.length];
        const k = rnd(1, p.max);
        const e = rnd(1, Math.max(1, p.factor / p.step - 1)) * p.step;
        const sb = (l: 'ne' | 'en') => asText(p, l, true);
        const ss = (l: 'ne' | 'en') => asText(p, l, false);
        const lbl = (v: number) => ({ key: String(v), label: `${bigFmt(kit.lang, v)}` });

        if (i % 4 === 0) {
          return {
            np: `${fmt('ne', k)} ${sb('ne')} = कति ${ss('ne')}?`,
            en: `${k} ${sb('en')} = how many ${ss('en')}?`,
            answer: String(k * p.factor),
            options: near(k * p.factor, i + 2, [p.factor, -p.factor, p.factor / 10, p.step], 1).map(lbl),
          };
        } else if (i % 4 === 1) {
          return {
            np: `${bigFmt('ne', k * p.factor)} ${ss('ne')} = कति ${sb('ne')}?`,
            en: `${k * p.factor} ${ss('en')} = how many ${sb('en')}?`,
            answer: String(k),
            options: near(k, i + 4, [1, -1, 2, 10], 1).map(lbl),
          };
        } else if (i % 4 === 2) {
          return {
            np: `${fmt('ne', k)} ${sb('ne')} ${fmt('ne', e)} ${ss('ne')} = कति ${ss('ne')}?`,
            en: `${k} ${sb('en')} ${e} ${ss('en')} = how many ${ss('en')}?`,
            answer: String(k * p.factor + e),
            options: near(k * p.factor + e, i + 6, [p.step, -p.step, p.factor, -p.factor], 1).map(lbl),
          };
        } else {
          return {
            np: `1 ${sb('ne')} मा कति ${ss('ne')} हुन्छन्?`,
            en: `How many ${ss('en')} are in 1 ${sb('en')}?`,
            answer: String(p.factor),
            options: shuffle([p.factor, Math.floor(p.factor / 10), p.factor * 10].filter((x) => x >= 1), i + 9).map(lbl),
          };
        }
      });
    }, [cfg.pairs, kit.lang]);

    return (
      <SimFrame2D
        kit={kit}
        onBack={onBackToLibrary}
        mascotGreeting={kit.t(
          `1 ${P.bigNp} = ${fmt('ne', P.factor)} ${P.smallNp}। मान परिवर्तन गरेर सम्बन्ध हेरौँ!`,
          `1 ${P.bigEn} = ${P.factor} ${P.smallEn}. Adjust the values to see the conversion!`
        )}
        questions={questions}
        controls={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', width: '100%' }}>
            {/* Multiple Pairs Switcher */}
            {cfg.pairs.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {cfg.pairs.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPairIdx(i);
                      setBigVal(2);
                      setExtraVal(0);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      border: i === pairIdx ? `2px solid ${p.color}` : '1px solid #CBD5E1',
                      background: i === pairIdx ? '#FFFFFF' : '#F1F5F9',
                      color: i === pairIdx ? p.color : '#475569',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {kit.t(`${p.bigNp} ↔ ${p.smallNp}`, `${p.bigEn} ↔ ${p.smallEn}`)}
                  </button>
                ))}
              </div>
            )}

            {/* Value Steppers */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => bigVal > 0 && setValues(bigVal - 1, extraVal, true)}
                style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
              >
                −1 {asText(P, kit.lang, true)}
              </button>
              <button
                onClick={() => bigVal < P.max && setValues(bigVal + 1, extraVal, true)}
                style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
              >
                +1 {asText(P, kit.lang, true)}
              </button>
              <button
                onClick={() => extraVal >= P.step && setValues(bigVal, extraVal - P.step, true)}
                style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
              >
                −{P.step} {asText(P, kit.lang, false)}
              </button>
              <button
                onClick={() => extraVal + P.step < P.factor && setValues(bigVal, extraVal + P.step, true)}
                style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
              >
                +{P.step} {asText(P, kit.lang, false)}
              </button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 700, gap: 16 }}>
          {/* Unit Conversion Header Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: `2px solid ${P.color}`,
              borderRadius: 16,
              padding: '14px 28px',
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
              {kit.t(`1 ${P.bigNp} = ${fmt('ne', P.factor)} ${P.smallNp}`, `1 ${P.bigEn} = ${P.factor} ${P.smallEn}`)}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#1E293B', marginTop: 4 }}>
              {fmt(kit.lang, bigVal)} {asText(P, kit.lang, true)}
              {extraVal > 0 && ` ${fmt(kit.lang, extraVal)} ${asText(P, kit.lang, false)}`}
              {' = '}
              <span style={{ color: P.color }}>
                {bigFmt(kit.lang, totalSmall)} {asText(P, kit.lang, false)}
              </span>
            </div>
          </div>

          {/* 2D Visual Presentation per Type */}
          <div
            style={{
              width: '100%',
              minHeight: 240,
              background: '#FFFFFF',
              borderRadius: 18,
              border: '2px solid #E2E8F0',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            {/* Visual 1: Capacity Jug / Tank */}
            {P.visual === 'jug' && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32 }}>
                {/* Measuring Tank */}
                <svg width="180" height="220" viewBox="0 0 180 220">
                  <rect x="25" y="10" width="130" height="190" rx="10" fill="#F0F9FF" stroke="#0284C7" strokeWidth="3" />
                  {/* Liquid fill */}
                  {totalSmall > 0 && (
                    <rect
                      x="28"
                      y={200 - Math.min(185, (185 * totalSmall) / maxCapacity)}
                      width="124"
                      height={Math.min(185, (185 * totalSmall) / maxCapacity)}
                      rx="6"
                      fill="#38BDF8"
                      fillOpacity="0.8"
                    />
                  )}
                  {/* Graduation ticks */}
                  {Array.from({ length: P.max + 1 }).map((_, idx) => {
                    const y = 200 - (185 * idx) / P.max;
                    return (
                      <g key={idx}>
                        <line x1="25" y1={y} x2="45" y2={y} stroke="#0369A1" strokeWidth="2" />
                        <text x="50" y={y + 4} fill="#0369A1" fontSize="11" fontWeight="800">
                          {idx} L
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* 1L Bottles Display */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0369A1' }}>
                    {kit.t(`${bigVal} वटा 1 लिटरका बोतलहरू`, `${bigVal} × 1-Litre bottles`)}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 220 }}>
                    {Array.from({ length: bigVal }).map((_, bIdx) => (
                      <div
                        key={bIdx}
                        style={{
                          width: 32,
                          height: 54,
                          background: '#0284C7',
                          borderRadius: '8px 8px 4px 4px',
                          border: '2px solid #0369A1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: 10,
                          fontWeight: 900,
                        }}
                      >
                        1L
                      </div>
                    ))}
                  </div>
                  {extraVal > 0 && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#D97706', marginTop: 4 }}>
                      + {extraVal} mL {kit.t('थप पानी', 'extra liquid')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Visual 2: Metre Stick Ruler */}
            {P.visual === 'ruler' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
                <svg viewBox="0 0 540 100" style={{ width: '100%', maxWidth: 540 }}>
                  {/* Wooden Ruler body */}
                  <rect x="20" y="20" width="500" height="60" rx="8" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2.5" />
                  {/* Active measurement bar */}
                  <rect
                    x="20"
                    y="20"
                    width={Math.min(500, (500 * totalSmall) / maxCapacity)}
                    height="60"
                    rx="8"
                    fill="#F97316"
                    fillOpacity="0.4"
                  />
                  {/* Calibration ticks */}
                  {Array.from({ length: P.max * 10 + 1 }).map((_, idx) => {
                    const isMajor = idx % 10 === 0;
                    const isMid = idx % 5 === 0;
                    const x = 20 + (500 * idx) / (P.max * 10);
                    return (
                      <g key={idx}>
                        <line
                          x1={x}
                          y1="20"
                          x2={x}
                          y2={isMajor ? 48 : isMid ? 38 : 30}
                          stroke="#713F12"
                          strokeWidth={isMajor ? 2 : 1}
                        />
                        {isMajor && (
                          <text x={x} y="68" textAnchor="middle" fill="#713F12" fontSize="12" fontWeight="900">
                            {idx / 10} m
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#713F12' }}>
                  {kit.t(
                    `रुलरमा चिन्ह: ${bigVal} मिटर + ${extraVal} सेन्टिमिटर = ${totalSmall} सेन्टिमिटर`,
                    `Ruler marks: ${bigVal} m + ${extraVal} cm = ${totalSmall} cm`
                  )}
                </div>
              </div>
            )}

            {/* Visual 3: Road Trip (km ↔ m) */}
            {P.visual === 'road' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <svg viewBox="0 0 540 120" style={{ width: '100%', maxWidth: 540 }}>
                  {/* Road */}
                  <rect x="20" y="35" width="500" height="50" rx="6" fill="#334155" />
                  {/* White dashed centerline */}
                  <line x1="25" y1="60" x2="515" y2="60" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="16 10" />
                  {/* Km Milestones */}
                  {Array.from({ length: P.max + 1 }).map((_, idx) => {
                    const x = 20 + (500 * idx) / P.max;
                    return (
                      <g key={idx}>
                        {/* Milestone post */}
                        <rect x={x - 14} y="5" width="28" height="24" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
                        <rect x={x - 14} y="5" width="28" height="8" rx="2" fill="#EF4444" />
                        <text x={x} y="24" textAnchor="middle" fill="#1E293B" fontSize="9" fontWeight="900">
                          {idx} km
                        </text>
                      </g>
                    );
                  })}
                  {/* Car at current position */}
                  {(() => {
                    const carX = 20 + Math.min(480, (500 * totalSmall) / maxCapacity);
                    return (
                      <g transform={`translate(${carX - 20}, 44)`}>
                        <rect x="0" y="8" width="40" height="18" rx="5" fill="#EF4444" />
                        <rect x="8" y="2" width="22" height="10" rx="3" fill="#FEE2E2" />
                        <circle cx="10" cy="26" r="5" fill="#1E293B" />
                        <circle cx="30" cy="26" r="5" fill="#1E293B" />
                      </g>
                    );
                  })()}
                </svg>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#334155' }}>
                  🚗 {kit.t(`गाडीको दूरी: ${bigVal} किमी ${extraVal ? `${extraVal} मि.` : ''} = ${totalSmall} मिटर`, `Car travelled: ${bigVal} km ${extraVal ? `${extraVal} m` : ''} = ${totalSmall} metres`)}
                </div>
              </div>
            )}

            {/* Visual 4: Weighing Scale (kg ↔ g) */}
            {P.visual === 'scale' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                {/* Dial Scale */}
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="80" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="6" />
                  <circle cx="90" cy="90" r="70" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                  {/* Kilogram numbers around dial */}
                  {Array.from({ length: P.max }).map((_, idx) => {
                    const angle = (idx / P.max) * 2 * Math.PI - Math.PI / 2;
                    const tx = 90 + 52 * Math.cos(angle);
                    const ty = 90 + 52 * Math.sin(angle);
                    return (
                      <text key={idx} x={tx} y={ty + 4} textAnchor="middle" fill="#334155" fontSize="12" fontWeight="900">
                        {idx}
                      </text>
                    );
                  })}
                  <text x="90" y="115" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="700">
                    kg
                  </text>
                  {/* Rotating Needle */}
                  {(() => {
                    const needleAngle = (totalSmall / maxCapacity) * 360 - 90;
                    return (
                      <g transform={`rotate(${needleAngle}, 90, 90)`}>
                        <line x1="90" y1="90" x2="90" y2="30" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="90" cy="90" r="6" fill="#1E293B" />
                      </g>
                    );
                  })()}
                </svg>

                {/* Weights Display */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#A16207' }}>
                    {kit.t(`${bigVal} वटा 1 केजीका ढकहरू`, `${bigVal} × 1 kg weights`)}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 220 }}>
                    {Array.from({ length: bigVal }).map((_, wIdx) => (
                      <div
                        key={wIdx}
                        style={{
                          width: 44,
                          height: 38,
                          background: '#78350F',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FEF3C7',
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        1 kg
                      </div>
                    ))}
                  </div>
                  {extraVal > 0 && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#D97706', marginTop: 4 }}>
                      + {extraVal} ग्राम (g)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Visual 5 & 6: Clock Time Units */}
            {(P.visual === 'hours' || P.visual === 'minutes') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="80" fill="#FFFFFF" stroke="#0284C7" strokeWidth="5" />
                  {/* Hour markers */}
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const angle = ((idx + 1) / 12) * 2 * Math.PI - Math.PI / 2;
                    const tx = 90 + 62 * Math.cos(angle);
                    const ty = 90 + 62 * Math.sin(angle);
                    return (
                      <text key={idx} x={tx} y={ty + 4} textAnchor="middle" fill="#0369A1" fontSize="12" fontWeight="900">
                        {idx + 1}
                      </text>
                    );
                  })}
                  {/* Clock Hands */}
                  {(() => {
                    const hAngle = ((bigVal % 12) / 12) * 360 + (extraVal / 60) * 30 - 90;
                    const mAngle = (extraVal / 60) * 360 - 90;
                    return (
                      <>
                        {/* Hour Hand */}
                        <g transform={`rotate(${hAngle}, 90, 90)`}>
                          <line x1="90" y1="90" x2="90" y2="48" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" />
                        </g>
                        {/* Minute Hand */}
                        <g transform={`rotate(${mAngle}, 90, 90)`}>
                          <line x1="90" y1="90" x2="90" y2="30" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
                        </g>
                        <circle cx="90" cy="90" r="5" fill="#EF4444" />
                      </>
                    );
                  })()}
                </svg>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0369A1' }}>
                  ⏰ {kit.t(
                    `${bigVal} घण्टा ${extraVal ? `${extraVal} मिनेट` : ''} = ${totalSmall} मिनेट`,
                    `${bigVal} hr ${extraVal ? `${extraVal} min` : ''} = ${totalSmall} minutes`
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </SimFrame2D>
    );
  };
  return SimComponent;
};
export default makeUnitSim;
