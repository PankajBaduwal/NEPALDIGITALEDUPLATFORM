/**
 * Lesson 14 · Multiplication (गुणन)
 * MultTrays — 2D equal trays with tens-rods and ones-units to multiply 2-digit by 1-digit.
 * TimesWall — 2D 10×10 interactive array wall for multiplication tables.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

export const MultTrays: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L14-01',
    chapter: 14,
    titleNp: 'गुणन ट्रे (दशक र एकाइ)',
    titleEn: 'Multiplication Trays (Tens and Ones)',
  });

  const [a, setA] = useState(23); // e.g. 23
  const [b, setB] = useState(4);  // e.g. 4 trays
  const [step, setStep] = useState(0); // 0=start, 1=ones, 2=tens, 3=total

  const tens = Math.floor(a / 10);
  const ones = a % 10;
  const total = a * b;

  const nextStep = () => {
    const s = step >= 3 ? 1 : step + 1;
    setStep(s);
    kit.tap();
    if (s === 1) {
      kit.say(`एकाइ: ${ones} × ${b} = ${ones * b}`, `Ones: ${ones} × ${b} = ${ones * b}`);
    } else if (s === 2) {
      kit.say(`दशक: ${tens} × ${b} = ${tens * b} दशक = ${tens * b * 10}`, `Tens: ${tens} × ${b} = ${tens * b} tens = ${tens * b * 10}`);
    } else {
      kit.say(`जोडौँ: ${tens * b * 10} + ${ones * b} = ${total}`, `Add: ${tens * b * 10} + ${ones * b} = ${total}`);
      kit.star();
    }
  };

  const fresh = () => {
    setA(rnd(12, 35));
    setB(rnd(2, 5));
    setStep(0);
    kit.tap();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qa = rnd(12, 39);
      const qb = rnd(2, 6);
      const ans = qa * qb;
      return {
        np: `${qa} × ${qb} = ?`,
        en: `${qa} × ${qb} = ?`,
        answer: String(ans),
        options: near(ans, i + 2, [qb, -qb, 10, -10, 1, -1]).map((x) => ({
          key: String(x),
          label: fmt(kit.lang, x),
        })),
      };
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={
        step === 0
          ? kit.t(`${b} वटा ट्रे, हरेकमा ${a} ( ${tens} दशक र ${ones} एकाइ )`, `${b} trays, each holding ${a} (${tens} tens and ${ones} ones)`)
          : step === 1
          ? kit.t(`एकाइ गुणन: ${ones} × ${b} = ${ones * b}`, `Multiply ones: ${ones} × ${b} = ${ones * b}`)
          : step === 2
          ? kit.t(`दशक गुणन: ${tens} × ${b} = ${tens * b} दशक = ${tens * b * 10}`, `Multiply tens: ${tens} × ${b} = ${tens * b} tens = ${tens * b * 10}`)
          : kit.t(`कुल जम्मा: ${tens * b * 10} + ${ones * b} = ${total}`, `Total product: ${tens * b * 10} + ${ones * b} = ${total}`)
      }
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => a > 11 && (setA(a - 1), setStep(0))}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('सङ्ख्या', 'Number')} −
          </button>
          <button
            onClick={() => a < 45 && (setA(a + 1), setStep(0))}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('सङ्ख्या', 'Number')} +
          </button>
          <button
            onClick={() => b > 2 && (setB(b - 1), setStep(0))}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('ट्रे', 'Trays')} −
          </button>
          <button
            onClick={() => b < 6 && (setB(b + 1), setStep(0))}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('ट्रे', 'Trays')} +
          </button>
          <button
            onClick={nextStep}
            style={{
              padding: '9px 20px',
              borderRadius: 12,
              border: 'none',
              background: '#187C68',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {kit.t('चरण ➜', 'Step ➜')}
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 720, gap: 16 }}>
        {/* Math Equation Banner */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 900, color: '#1E293B' }}>
            {fmt(kit.lang, a)} × {fmt(kit.lang, b)} = {step === 3 ? fmt(kit.lang, total) : '?'}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginTop: 4 }}>
            {fmt(kit.lang, tens)} {kit.t('दशक (Tens)', 'tens')} + {fmt(kit.lang, ones)} {kit.t('एकाइ (Ones)', 'ones')} × {fmt(kit.lang, b)} {kit.t('ट्रे', 'trays')}
          </div>
        </div>

        {/* Trays Canvas Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${b <= 3 ? b : Math.ceil(b / 2)}, 1fr)`,
            gap: 14,
            width: '100%',
          }}
        >
          {Array.from({ length: b }).map((_, trayIdx) => (
            <div
              key={trayIdx}
              style={{
                background: '#FFFBEB',
                border: '2px solid #FCD34D',
                borderRadius: 16,
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                boxShadow: '0 4px 12px rgba(245,158,11,0.08)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: '#B45309', borderBottom: '1px solid #FDE68A', paddingBottom: 4 }}>
                {kit.t(`ट्रे ${fmt(kit.lang, trayIdx + 1)}`, `Tray ${trayIdx + 1}`)}
              </div>

              {/* Tens Rods */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                  background: step === 2 || step === 3 ? '#E0F2FE' : 'transparent',
                  padding: 4,
                  borderRadius: 8,
                }}
              >
                {Array.from({ length: tens }).map((_, rIdx) => (
                  <div
                    key={rIdx}
                    style={{
                      width: 14,
                      height: 54,
                      background: '#0284C7',
                      borderRadius: 4,
                      border: '1px solid #0369A1',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '2px 0',
                    }}
                    title="10"
                  >
                    {Array.from({ length: 5 }).map((_, d) => (
                      <div key={d} style={{ height: 1, background: '#7DD3FC' }} />
                    ))}
                  </div>
                ))}
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0369A1', marginLeft: 4 }}>
                  {tens * 10}
                </span>
              </div>

              {/* Ones Units */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                  background: step === 1 || step === 3 ? '#FEE2E2' : 'transparent',
                  padding: 4,
                  borderRadius: 8,
                }}
              >
                {Array.from({ length: ones }).map((_, oIdx) => (
                  <div
                    key={oIdx}
                    style={{
                      width: 16,
                      height: 16,
                      background: '#EF4444',
                      borderRadius: 3,
                      border: '1px solid #B91C1C',
                    }}
                    title="1"
                  />
                ))}
                <span style={{ fontSize: 11, fontWeight: 700, color: '#B91C1C', marginLeft: 2, alignSelf: 'center' }}>
                  {ones}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SimFrame2D>
  );
};

export const TimesWall: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L14-02',
    chapter: 14,
    titleNp: 'पहाडा पर्खाल (१०×१०)',
    titleEn: 'Times-Table Wall (10×10)',
  });

  const [r, setR] = useState(3);
  const [c, setC] = useState(4);

  const apply = (newR: number, newC: number) => {
    setR(newR);
    setC(newC);
    kit.tap();
    kit.say(`${newR} × ${newC} = ${newR * newC}`, `${newR} rows of ${newC} = ${newR * newC}`);
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qr = rnd(2, 10);
      const qc = rnd(2, 10);
      const ans = qr * qc;
      return {
        np: `${qr} × ${qc} = ?`,
        en: `${qr} × ${qc} = ?`,
        answer: String(ans),
        options: near(ans, i + 3, [qr, -qr, qc, -qc, 1, -1]).map((x) => ({
          key: String(x),
          label: fmt(kit.lang, x),
        })),
      };
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `${r} पङ्क्ति (Rows) र ${c} स्तम्भ (Columns) = ${r * c} वटा कोठा`,
        `${r} rows and ${c} columns = ${r * c} blocks`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => r > 1 && apply(r - 1, c)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('पङ्क्ति', 'Rows')} −
          </button>
          <button
            onClick={() => r < 10 && apply(r + 1, c)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('पङ्क्ति', 'Rows')} +
          </button>
          <button
            onClick={() => c > 1 && apply(r, c - 1)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('स्तम्भ', 'Cols')} −
          </button>
          <button
            onClick={() => c < 10 && apply(r, c + 1)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('स्तम्भ', 'Cols')} +
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 540, gap: 16 }}>
        {/* Product Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 900, color: '#187C68' }}>
            {fmt(kit.lang, r)} × {fmt(kit.lang, c)} = {fmt(kit.lang, r * c)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginTop: 4 }}>
            {Array.from({ length: r }).map(() => String(c)).join(' + ')} = {r * c}
          </div>
        </div>

        {/* 10x10 Interactive Grid Wall */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: 16,
            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            width: '100%',
            maxWidth: 420,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 4,
            }}
          >
            {Array.from({ length: 10 }).map((_, rowIdx) =>
              Array.from({ length: 10 }).map((__, colIdx) => {
                const isActive = rowIdx < r && colIdx < c;
                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    onClick={() => apply(rowIdx + 1, colIdx + 1)}
                    style={{
                      aspectRatio: '1/1',
                      borderRadius: 6,
                      background: isActive
                        ? (rowIdx % 2 === 0 ? '#187C68' : '#22C55E')
                        : '#F1F5F9',
                      border: isActive ? '1px solid #0F5143' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 4px rgba(24,124,104,0.2)' : 'none',
                    }}
                    title={`${rowIdx + 1} × ${colIdx + 1}`}
                  />
                );
              })
            )}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textAlign: 'center', marginTop: 10 }}>
            {kit.t('कोठामा ट्याप गरेर पहाडा आकार बदल्नुहोस्', 'Tap any square to change the array size')}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default MultTrays;
