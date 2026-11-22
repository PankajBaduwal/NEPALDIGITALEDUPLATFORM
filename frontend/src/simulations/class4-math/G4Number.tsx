/**
 * Class 4 lesson 4 · Number sense (सङ्ख्याको ज्ञान)
 * LakhTowers — 7-digit place-value 2D pillars (दशलाख, लाख, दशहजार, हजार, सय, दशक, एकाइ).
 * RoundingLine — 2D interactive number line for rounding to the nearest 10, 100, or 1000.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, big, Props, mcq, numQ, indian, lakhWords, digitsOf, PL7 } from './h4';

const inl = (lang: 'ne' | 'en', n: number) => fmt(lang, indian(n));

/* ───────────── 1. LakhTowers ───────────── */
export const LakhTowers: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L4-01',
    chapter: 4,
    titleNp: 'लाख टावर (७ अङ्कको स्थानीय मान)',
    titleEn: 'Lakh Towers (7-Digit Place Value)',
  });

  const [n, setN] = useState(4560789);
  const [selPlace, setSelPlace] = useState(0); // 0 (Ten-Lakhs) to 6 (Ones)

  const digits = useMemo(() => digitsOf(n, 7), [n]);

  const bump = (idx: number, delta: number) => {
    const d = [...digits];
    d[idx] = (d[idx] + delta + 10) % 10;
    const nextVal = Number(d.join(''));
    setN(nextVal);
    setSelPlace(idx);
    kit.tap();
    const place = PL7[idx];
    const placeVal = d[idx] * place.val;
    kit.say(
      `${place.np}: ${d[idx]} × ${place.val} = ${fmt('ne', indian(placeVal))}`,
      `${place.en}: ${d[idx]} × ${place.val} = ${indian(placeVal)}`
    );
  };

  const fresh = () => {
    const nextVal = rnd(1000000, 9999999);
    setN(nextVal);
    kit.tap();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const v = rnd(1000000, 9999999);
      const ds = digitsOf(v, 7);
      const c = rnd(0, 6);
      const d = ds[c] || 4;
      const place = PL7[c];
      const placeVal = d * place.val;

      if (i % 2 === 0) {
        return numQ(
          `${inl('ne', v)} मा ${place.np} स्थानको अङ्क ${fmt('ne', d)} को स्थानीय मान कति?`,
          `In ${indian(v)}, what is the place value of the digit ${d} in the ${place.en.toLowerCase()} place?`,
          placeVal,
          i,
          [placeVal * 10, Math.floor(placeVal / 10), placeVal + 100, placeVal - 100],
          (x) => inl(kit.lang, x),
          1
        );
      } else {
        return mcq(
          `${inl('ne', v)} को ${place.np} स्थानको अङ्क कुन हो?`,
          `What is the digit in the ${place.en.toLowerCase()} place of ${indian(v)}?`,
          String(d),
          [String((d + 1) % 10), String((d + 3) % 10), String((d + 7) % 10)],
          i
        );
      }
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `७ अङ्कको सङ्ख्या: ${inl(kit.lang, n)}। नेपाली पद्धतिमा पहिलो ३ अङ्क, त्यसपछि २-२ अङ्कमा अल्पविराम लगाइन्छ।`,
        `7-Digit Number: ${indian(n)}. Commas: first 3 digits from the right, then every 2 digits.`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => bump(selPlace, 1)}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              border: 'none',
              background: '#187C68',
              color: '#FFFFFF',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ▲ {kit.t('अङ्क बढाऊ (+१)', 'Increase (+1)')}
          </button>
          <button
            onClick={() => bump(selPlace, -1)}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              border: 'none',
              background: '#EF4444',
              color: '#FFFFFF',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ▼ {kit.t('अङ्क घटाऊ (-१)', 'Decrease (-1)')}
          </button>
          <button
            onClick={fresh}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🎲 {kit.t('नयाँ सङ्ख्या', 'Random Number')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 780, gap: 16 }}>
        {/* Large Number & Words Banner */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 900, color: '#187C68', letterSpacing: 1.5 }}>
            {inl(kit.lang, n)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>
            {lakhWords(n)}
          </div>
        </div>

        {/* 7-Pillar Place Value Representation */}
        <div
          style={{
            width: '100%',
            background: '#FFFFFF',
            borderRadius: 18,
            border: '2px solid #E2E8F0',
            padding: '20px 16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
          }}
        >
          {PL7.map((place, idx) => {
            const digit = digits[idx];
            const isSelected = selPlace === idx;

            return (
              <div
                key={place.k}
                onClick={() => {
                  setSelPlace(idx);
                  kit.tap();
                  kit.say(
                    `${place.np}: ${digit} (स्थानीय मान: ${fmt('ne', indian(digit * place.val))})`,
                    `${place.en}: ${digit} (Place value: ${indian(digit * place.val)})`
                  );
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: isSelected ? '#F8FAFC' : 'transparent',
                  borderRadius: 12,
                  padding: '8px 2px',
                  border: isSelected ? `2px solid ${place.color}` : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Place Name Header */}
                <div style={{ fontSize: 11, fontWeight: 900, color: place.color, textAlign: 'center', height: 26 }}>
                  {kit.t(place.np, place.en)}
                </div>

                {/* Vertical Pillar with Stacked Beads */}
                <div
                  style={{
                    position: 'relative',
                    width: 32,
                    height: 150,
                    background: '#F1F5F9',
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    alignItems: 'center',
                    padding: '4px 0',
                    gap: 3,
                    margin: '8px 0',
                  }}
                >
                  {/* Central wire */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      bottom: 4,
                      width: 3,
                      background: '#CBD5E1',
                      borderRadius: 2,
                    }}
                  />
                  {/* Beads */}
                  {Array.from({ length: digit }).map((_, bIdx) => (
                    <div
                      key={bIdx}
                      style={{
                        zIndex: 1,
                        width: 24,
                        height: 12,
                        borderRadius: 6,
                        background: place.color,
                        border: '1px solid rgba(0,0,0,0.15)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      }}
                    />
                  ))}
                </div>

                {/* Big Digit Box */}
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: place.color,
                    background: '#FFFFFF',
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    border: `2px solid ${place.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {fmt(kit.lang, digit)}
                </div>

                {/* Place Value Multiplier */}
                <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, marginTop: 4, textAlign: 'center' }}>
                  {place.val >= 1000 ? `${place.val / 1000}k` : place.val}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SimFrame2D>
  );
};

/* ───────────── 2. RoundingLine ───────────── */
const getRandVal = (u: number) => {
  let v = 0;
  do v = rnd(u, u * 10 - 1);
  while (v % u === 0);
  return v;
};

export const RoundingLine: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L4-02',
    chapter: 4,
    titleNp: 'अनुमान रेखा (नजिकको मान)',
    titleEn: 'Round-Off Line (Nearest 10, 100, 1000)',
  });

  const [u, setU] = useState(10); // 10, 100, or 1000
  const [n, setN] = useState(47);
  const [rolled, setRolled] = useState(false);

  const lower = Math.floor(n / u) * u;
  const upper = lower + u;
  const isUp = n % u >= u / 2;
  const roundedAnswer = isUp ? upper : lower;

  const nextNumber = (newU = u) => {
    setU(newU);
    setN(getRandVal(newU));
    setRolled(false);
    kit.tap();
  };

  const handleRoll = () => {
    setRolled(true);
    kit.tap();
    kit.say(
      `${n} लाई नजिकको ${u} मा मिलाउँदा ${roundedAnswer} हुन्छ।`,
      `Rounding ${n} to the nearest ${u} gives ${roundedAnswer}.`
    );
    kit.star();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qu = [10, 100, 1000][i % 3];
      const qn = getRandVal(qu);
      const qLower = Math.floor(qn / qu) * qu;
      const qAns = qn % qu >= qu / 2 ? qLower + qu : qLower;

      return mcq(
        `${big('ne', qn)} लाई नजिकको ${fmt('ne', qu)} मा मिलाउँदा कति हुन्छ?`,
        `Round ${qn.toLocaleString('en-US')} to the nearest ${qu}:`,
        String(qAns),
        [String(qLower), String(qLower + qu), String(qLower - qu)],
        i
      );
    });
  }, []);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={
        rolled
          ? kit.t(
            `${n} बीचको बिन्दुभन्दा ${isUp ? 'माथि वा बराबर' : 'तल'} छ, त्यसैले नजिकको मान = ${roundedAnswer}`,
            `${n} is ${isUp ? 'at or past' : 'before'} halfway, so it rounds to ${roundedAnswer}`
          )
          : kit.t(
            `${n} लाई नजिकको ${u} मा मिलाऔँ। बीचको बिन्दु हेर्नुहोस्!`,
            `Round ${n} to nearest ${u}. Check the halfway mark!`
          )
      }
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[10, 100, 1000].map((unit) => (
            <button
              key={unit}
              onClick={() => nextNumber(unit)}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: u === unit ? '2px solid #187C68' : '1px solid #CBD5E1',
                background: u === unit ? '#E6F3E9' : '#FFFFFF',
                color: u === unit ? '#187C68' : '#334155',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {fmt(kit.lang, unit)}
            </button>
          ))}
          <button
            onClick={handleRoll}
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
            ⚽ {kit.t('गुडाऔँ (Round Off)', 'Roll / Round Off')}
          </button>
          <button
            onClick={() => nextNumber(u)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🎲 {kit.t('नयाँ सङ्ख्या', 'Random')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 720, gap: 16 }}>
        {/* Banner Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
            {kit.t(`नजिकको ${fmt('ne', u)} मा सन्निकट मान`, `Rounding to Nearest ${u}`)}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#1E293B', marginTop: 4 }}>
            {big(kit.lang, n)} ≈{' '}
            <span style={{ color: rolled ? '#187C68' : '#94A3B8' }}>
              {rolled ? big(kit.lang, roundedAnswer) : '?'}
            </span>
          </div>
        </div>

        {/* 2D SVG Number Line */}
        <div
          style={{
            width: '100%',
            background: '#FFFFFF',
            borderRadius: 18,
            border: '2px solid #E2E8F0',
            padding: '24px 20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <svg viewBox="0 0 520 130" style={{ width: '100%', maxWidth: 520 }}>
            {/* Number Line Track */}
            <line x1="40" y1="70" x2="480" y2="70" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />

            {/* Lower Bound & Upper Bound Ticks */}
            {/* 10 divisions */}
            {Array.from({ length: 11 }).map((_, i) => {
              const x = 40 + (440 * i) / 10;
              const isEnd = i === 0 || i === 10;
              const isMid = i === 5;
              const val = lower + (u * i) / 10;

              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={isEnd ? 48 : isMid ? 54 : 62}
                    x2={x}
                    y2="78"
                    stroke={isEnd ? '#187C68' : isMid ? '#EF4444' : '#94A3B8'}
                    strokeWidth={isEnd ? 3 : isMid ? 2.5 : 1.5}
                  />
                  {isEnd && (
                    <text x={x} y="102" textAnchor="middle" fill="#187C68" fontSize="13" fontWeight="900">
                      {val}
                    </text>
                  )}
                  {isMid && (
                    <text x={x} y="102" textAnchor="middle" fill="#EF4444" fontSize="11" fontWeight="800">
                      {val}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Halfway Label Tag */}
            <rect x="215" y="10" width="90" height="24" rx="6" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
            <text x="260" y="26" textAnchor="middle" fill="#DC2626" fontSize="10" fontWeight="900">
              {kit.t('बीचको बिन्दु', 'Halfway')}
            </text>

            {/* Ball Marker */}
            {(() => {
              const fraction = (n - lower) / u;
              const initialX = 40 + 440 * fraction;
              const finalX = isUp ? 480 : 40;
              const ballX = rolled ? finalX : initialX;

              return (
                <g style={{ transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <circle
                    cx={ballX}
                    cy="70"
                    r="14"
                    fill={rolled ? '#187C68' : '#F59E0B'}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                  />
                  {/* Tag on top of ball */}
                  <rect
                    x={ballX - 22}
                    y="32"
                    width="44"
                    height="20"
                    rx="5"
                    fill={rolled ? '#187C68' : '#F59E0B'}
                  />
                  <text
                    x={ballX}
                    y="46"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="900"
                  >
                    {n}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default LakhTowers;
