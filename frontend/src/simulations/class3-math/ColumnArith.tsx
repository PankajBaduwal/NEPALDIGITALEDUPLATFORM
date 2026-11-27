/**
 * Lessons 12 and 13 · Addition and subtraction of five-digit numbers
 * Column Towers & Tablet — step-by-step column addition with carry and subtraction with borrowing.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { digitsOf, PLACES, fmt, near, big } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
type Op = 'add' | 'sub';

interface Step {
  c: number; // column index 0 (T-Th) to 4 (Ones)
  x: number;
  y: number;
  cin: number;
  res: number;
  cout: number;
  np: string;
  en: string;
}

const gen = (op: Op): [number, number] => {
  if (op === 'add') {
    const a = rnd(2000, 69999);
    return [a, rnd(1000, Math.min(99999 - a, 49999))];
  }
  const a = rnd(20000, 99999);
  return [a, rnd(2000, a - 1000)];
};

const getSteps = (a: number, b: number, op: Op): Step[] => {
  const da = digitsOf(a, 5);
  const db = digitsOf(b, 5);
  const out: Step[] = [];
  let carry = 0;

  for (let c = 4; c >= 0; c--) {
    const x = da[c];
    const y = db[c];
    if (op === 'add') {
      const sum = x + y + carry;
      const res = sum % 10;
      const cout = Math.floor(sum / 10);
      out.push({
        c,
        x,
        y,
        cin: carry,
        res,
        cout,
        np: `${x} + ${y}${carry ? ` + ${carry} (हातमा)` : ''} = ${sum}${cout ? ` → ${res} लेख्ने, 1 हातमा` : ` → ${res} लेख्ने`}`,
        en: `${x} + ${y}${carry ? ` + ${carry} (carry)` : ''} = ${sum}${cout ? ` → write ${res}, carry ${cout}` : ` → write ${res}`}`,
      });
      carry = cout;
    } else {
      const top = x - carry;
      const borrow = top < y ? 1 : 0;
      const res = top + borrow * 10 - y;
      out.push({
        c,
        x,
        y,
        cin: carry,
        res,
        cout: borrow,
        np: `${top < 0 ? top : x}${carry ? ` − 1 = ${top}` : ''}${borrow ? `; ${top} < ${y} त्यसैले 10 सापट लिने → ${top + 10} − ${y} = ${res}` : ` − ${y} = ${res}`}`,
        en: `${x}${carry ? ` − 1 (lent) = ${top}` : ''}${borrow ? `; ${top} < ${y} so borrow 10 → ${top + 10} − ${y} = ${res}` : ` − ${y} = ${res}`}`,
      });
      carry = borrow;
    }
  }
  return out;
};

const makeSim = (
  op: Op,
  cfg: { code: string; chapter: number; titleNp: string; titleEn: string; color: string; sign: string }
): React.FC<Props> => {
  const Component: React.FC<Props> = ({ onBackToLibrary }) => {
    const kit = useSimKit({
      code: cfg.code,
      chapter: cfg.chapter,
      titleNp: cfg.titleNp,
      titleEn: cfg.titleEn,
    });

    const [ab, setAb] = useState<[number, number]>(() => gen(op));
    const [stepIdx, setStepIdx] = useState(0); // 0 to 5 completed columns
    const [seed, setSeed] = useState(0);

    const st = useMemo(() => getSteps(ab[0], ab[1], op), [ab]);
    const da = useMemo(() => digitsOf(ab[0], 5), [ab]);
    const db = useMemo(() => digitsOf(ab[1], 5), [ab]);
    const total = op === 'add' ? ab[0] + ab[1] : ab[0] - ab[1];

    const currentStep = stepIdx < 5 ? st[stepIdx] : null;
    const activeCol = currentStep ? currentStep.c : -1;

    const fresh = () => {
      const next = gen(op);
      setAb(next);
      setStepIdx(0);
      setSeed((s) => s + 1);
    };

    const handleNext = () => {
      if (stepIdx < 5) {
        const step = st[stepIdx];
        kit.tap();
        kit.say(step.np, step.en);
        setStepIdx((prev) => prev + 1);
        if (stepIdx === 4) {
          kit.star();
          kit.say(`पूरा भयो! उत्तर: ${total}`, `Done! Result: ${total.toLocaleString('en-US')}`);
        }
      } else {
        fresh();
      }
    };

    // Column answer options when asking student
    const activeRes = currentStep ? currentStep.res : 0;
    const options = useMemo(() => {
      if (!currentStep) return [];
      return near(activeRes, seed * 7 + stepIdx, [1, -1, 2, 3, 9, -2, 5])
        .filter((x) => x >= 0 && x <= 9)
        .slice(0, 4);
    }, [currentStep, activeRes, seed, stepIdx]);

    const handlePickAnswer = (digit: number) => {
      if (!currentStep) return;
      if (digit === currentStep.res) {
        kit.good();
        handleNext();
      } else {
        kit.oops(currentStep.np, currentStep.en);
      }
    };

    // Quiz Questions
    const questions: QuizQuestion[] = useMemo(() => {
      return Array.from({ length: 8 }, (_, i) => {
        const [a, b] = gen(op);
        const res = op === 'add' ? a + b : a - b;
        return {
          np: `${a.toLocaleString('en-US')} ${cfg.sign} ${b.toLocaleString('en-US')} = ?`,
          en: `${a.toLocaleString('en-US')} ${cfg.sign} ${b.toLocaleString('en-US')} = ?`,
          answer: String(res),
          options: near(res, i + 3, [10, -10, 100, -100, 1000, -1000, 1, -1]).map((x) => ({
            key: String(x),
            label: big(kit.lang, x),
          })),
        };
      });
    }, [kit.lang]);

    return (
      <SimFrame2D
        kit={kit}
        onBack={onBackToLibrary}
        mascotGreeting={
          currentStep
            ? kit.t(currentStep.np, currentStep.en)
            : kit.t(
              `उत्कृष्ट! उत्तर: ${fmt(kit.lang, total)}`,
              `Great job! The final answer is ${fmt(kit.lang, total)}`
            )
        }
        questions={questions}
        controls={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={handleNext}
              style={{
                padding: '10px 22px',
                borderRadius: 12,
                border: 'none',
                background: '#187C68',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(24,124,104,0.25)',
              }}
            >
              {stepIdx < 5 ? `➡️ ${kit.t('अर्को चरण (Step)', 'Next Column')}` : `🔄 ${kit.t('नयाँ हिसाब', 'New Problem')}`}
            </button>
            <button
              onClick={fresh}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#334155',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              🎲 {kit.t('अर्को अङ्क', 'Random')}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 650, gap: 16 }}>
          {/* Working Column Tablet */}
          <div
            style={{
              width: '100%',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '2px solid #E2E8F0',
              padding: '24px 28px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Headers: Place values */}
            <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(5, 1fr)', gap: 8, textAlign: 'center' }}>
              <div />
              {PLACES.map((p, i) => (
                <div
                  key={p.en}
                  style={{
                    background: i === activeCol ? '#FEF3C7' : '#F8FAFC',
                    border: i === activeCol ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: '6px 4px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 900, color: p.color }}>{kit.t(p.np, p.en)}</div>
                  <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>10^{4 - i}</div>
                </div>
              ))}
            </div>

            {/* Carry / Borrow Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(5, 1fr)', gap: 8, textAlign: 'center', minHeight: 32 }}>
              <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 800, alignSelf: 'center' }}>
                {op === 'add' ? 'Carry' : 'Borrow'}
              </div>
              {[0, 1, 2, 3, 4].map((c) => {
                // Find if there was a carry/borrow for this column
                const s = st.find((step) => step.c === c);
                const cin = s ? s.cin : 0;
                const isCurrentActive = c === activeCol;
                return (
                  <div
                    key={c}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#DC2626',
                      background: isCurrentActive && cin ? '#FEE2E2' : 'transparent',
                      borderRadius: 6,
                    }}
                  >
                    {cin ? `(${fmt(kit.lang, cin)})` : ''}
                  </div>
                );
              })}
            </div>

            {/* Number 1 Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(5, 1fr)', gap: 8, textAlign: 'center' }}>
              <div />
              {da.map((d, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: i === activeCol ? '#187C68' : '#1E293B',
                    background: i === activeCol ? '#E6F3E9' : '#F8FAFC',
                    borderRadius: 10,
                    padding: '8px 0',
                    border: i === activeCol ? '2px solid #187C68' : '1px solid #CBD5E1',
                  }}
                >
                  {fmt(kit.lang, d)}
                </div>
              ))}
            </div>

            {/* Number 2 Row with Sign */}
            <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(5, 1fr)', gap: 8, textAlign: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: cfg.color }}>{cfg.sign}</div>
              {db.map((d, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: i === activeCol ? '#187C68' : '#1E293B',
                    background: i === activeCol ? '#E6F3E9' : '#F8FAFC',
                    borderRadius: 10,
                    padding: '8px 0',
                    border: i === activeCol ? '2px solid #187C68' : '1px solid #CBD5E1',
                  }}
                >
                  {fmt(kit.lang, d)}
                </div>
              ))}
            </div>

            <div style={{ height: 3, background: '#334155', borderRadius: 2, margin: '4px 0' }} />

            {/* Result Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(5, 1fr)', gap: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#187C68', alignSelf: 'center' }}>=</div>
              {[0, 1, 2, 3, 4].map((c) => {
                // Find if this column has been solved yet
                // st has order 4 (ones), 3, 2, 1, 0
                const stepIdxForCol = 4 - c;
                const isSolved = stepIdxForCol < stepIdx;
                const step = st[stepIdxForCol];
                const resVal = isSolved && step ? step.res : null;

                return (
                  <div
                    key={c}
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: '#187C68',
                      background: isSolved ? '#E6F3E9' : '#F1F5F9',
                      borderRadius: 10,
                      padding: '8px 0',
                      border: isSolved ? '2px solid #187C68' : '2px dashed #CBD5E1',
                      minHeight: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {resVal !== null ? fmt(kit.lang, resVal) : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Column Keypad */}
          {currentStep && (
            <div
              style={{
                width: '100%',
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E2E8F0',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: '#475569' }}>
                {kit.t('यस स्तम्भको उत्तर छान्नुहोस्:', 'Select the digit for this column:')}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {options.map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePickAnswer(digit)}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      border: '2px solid #187C68',
                      background: '#FFFFFF',
                      color: '#187C68',
                      fontWeight: 900,
                      fontSize: 22,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {fmt(kit.lang, digit)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SimFrame2D>
    );
  };
  return Component;
};

export const AddColumns = makeSim('add', {
  code: 'SIM-MATH-G3-L12-01',
  chapter: 12,
  titleNp: 'पाँच अङ्कको जोड (स्तम्भ विधि)',
  titleEn: 'Five-Digit Addition (Column Method)',
  color: '#2563EB',
  sign: '+',
});

export const SubColumns = makeSim('sub', {
  code: 'SIM-MATH-G3-L13-01',
  chapter: 13,
  titleNp: 'पाँच अङ्कको घटाउ (स्तम्भ विधि)',
  titleEn: 'Five-Digit Subtraction (Column Method)',
  color: '#DC2626',
  sign: '−',
});

export default AddColumns;
