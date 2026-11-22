/**
 * Class 4 lesson 5 · Basic operations (गणितका आधारभूत क्रियाहरू)
 * AddTowers4 — 7-digit column addition with carrying.
 * SubTowers4 — 7-digit column subtraction with borrowing.
 * MultiplyGrid — 2D Area model multiplication grid (2-digit × 2-digit).
 * LongDivision — 2D step-by-step long division workbench.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, near, Props, numQ, indian, digitsOf, PL7 } from './h4';

const inl = (lang: 'ne' | 'en', n: number) => fmt(lang, indian(n));

/* ───────────── 1 & 2. 7-Digit Column Addition & Subtraction ───────────── */
type Op = 'add' | 'sub';
const W = 7;
interface Step {
  c: number;
  x: number;
  y: number;
  cin: number;
  res: number;
  cout: number;
  np: string;
  en: string;
}

const gen7 = (op: Op): [number, number] => {
  if (op === 'add') {
    const a = rnd(100000, 6999999);
    return [a, rnd(10000, Math.min(9999999 - a, 2999999))];
  }
  const a = rnd(1000000, 9999999);
  return [a, rnd(100000, a - 10000)];
};

const getSteps7 = (a: number, b: number, op: Op): Step[] => {
  const da = digitsOf(a, W);
  const db = digitsOf(b, W);
  const out: Step[] = [];
  let carry = 0;

  for (let c = W - 1; c >= 0; c--) {
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
        np: `${x} + ${y}${carry ? ` + ${carry} (हातमा)` : ''} = ${sum}${cout ? ` → ${res} लेख्ने, १ हातमा` : ` → ${res} लेख्ने`}`,
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
        np: `${top < 0 ? top : x}${carry ? ` − १ (सापटी दिएको) = ${top}` : ''}${borrow ? `; ${top} < ${y} त्यसैले १० सापट लिने → ${top + 10} − ${y} = ${res}` : ` − ${y} = ${res}`}`,
        en: `${x}${carry ? ` − 1 (lent) = ${top}` : ''}${borrow ? `; ${top} < ${y} so borrow 10 → ${top + 10} − ${y} = ${res}` : ` − ${y} = ${res}`}`,
      });
      carry = borrow;
    }
  }
  return out;
};

const make7Sim = (
  op: Op,
  cfg: { code: string; chapter: number; titleNp: string; titleEn: string; color: string; sign: string }
): React.FC<Props> => {
  const SimComp: React.FC<Props> = ({ onBackToLibrary }) => {
    const kit = useSimKit({
      code: cfg.code,
      chapter: cfg.chapter,
      titleNp: cfg.titleNp,
      titleEn: cfg.titleEn,
    });

    const [ab, setAb] = useState<[number, number]>(() => gen7(op));
    const [stepIdx, setStepIdx] = useState(0); // 0 to 7
    const [seed, setSeed] = useState(0);

    const st = useMemo(() => getSteps7(ab[0], ab[1], op), [ab]);
    const da = useMemo(() => digitsOf(ab[0], W), [ab]);
    const db = useMemo(() => digitsOf(ab[1], W), [ab]);
    const total = op === 'add' ? ab[0] + ab[1] : ab[0] - ab[1];

    const currentStep = stepIdx < W ? st[stepIdx] : null;
    const activeCol = currentStep ? currentStep.c : -1;

    const fresh = () => {
      const next = gen7(op);
      setAb(next);
      setStepIdx(0);
      setSeed((s) => s + 1);
    };

    const handleNext = () => {
      if (stepIdx < W) {
        const step = st[stepIdx];
        kit.tap();
        kit.say(step.np, step.en);
        setStepIdx((p) => p + 1);
        if (stepIdx === W - 1) {
          kit.star();
          kit.say(`उत्तर: ${indian(total)}`, `Answer: ${indian(total)}`);
        }
      } else {
        fresh();
      }
    };

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

    const questions: QuizQuestion[] = useMemo(() => {
      return Array.from({ length: 8 }, (_, i) => {
        const [a, b] = gen7(op);
        const res = op === 'add' ? a + b : a - b;
        return numQ(
          `${indian(a)} ${cfg.sign} ${indian(b)} = ?`,
          `${indian(a)} ${cfg.sign} ${indian(b)} = ?`,
          res,
          i + 3,
          [10, -10, 100, -100, 1000, -1000, 1, -1],
          (x) => inl(kit.lang, x)
        );
      });
    }, [kit.lang]);

    return (
      <SimFrame2D
        kit={kit}
        onBack={onBackToLibrary}
        mascotGreeting={
          currentStep
            ? `${kit.t(PL7[currentStep.c].np, PL7[currentStep.c].en)}: ${kit.t(currentStep.np, currentStep.en)}`
            : kit.t(`हिसाब सम्पन्न भयो! उत्तर: ${inl(kit.lang, total)}`, `Completed! Answer: ${indian(total)}`)
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
              }}
            >
              {stepIdx < W ? `➡️ ${kit.t('अर्को स्तम्भ', 'Next Column')}` : `🔄 ${kit.t('नयाँ हिसाब', 'New Problem')}`}
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 760, gap: 16 }}>
          {/* Working Column Tablet */}
          <div
            style={{
              width: '100%',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '2px solid #E2E8F0',
              padding: '20px 24px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Headers: Place values */}
            <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
              <div />
              {PL7.map((p, i) => (
                <div
                  key={p.k}
                  style={{
                    background: i === activeCol ? '#FEF3C7' : '#F8FAFC',
                    border: i === activeCol ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: '5px 2px',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 900, color: p.color }}>{kit.t(p.np, p.en)}</div>
                </div>
              ))}
            </div>

            {/* Carry / Borrow Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(7, 1fr)', gap: 6, textAlign: 'center', minHeight: 28 }}>
              <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 800, alignSelf: 'center' }}>
                {op === 'add' ? 'हातमा' : 'सापट'}
              </div>
              {[0, 1, 2, 3, 4, 5, 6].map((c) => {
                const s = st.find((step) => step.c === c);
                const cin = s ? s.cin : 0;
                return (
                  <div
                    key={c}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 900,
                      color: '#DC2626',
                    }}
                  >
                    {cin ? `(${fmt(kit.lang, cin)})` : ''}
                  </div>
                );
              })}
            </div>

            {/* Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
              <div />
              {da.map((d, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: i === activeCol ? '#187C68' : '#1E293B',
                    background: i === activeCol ? '#E6F3E9' : '#F8FAFC',
                    borderRadius: 8,
                    padding: '6px 0',
                    border: i === activeCol ? '2px solid #187C68' : '1px solid #CBD5E1',
                  }}
                >
                  {fmt(kit.lang, d)}
                </div>
              ))}
            </div>

            {/* Row 2 with Sign */}
            <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(7, 1fr)', gap: 6, textAlign: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: cfg.color }}>{cfg.sign}</div>
              {db.map((d, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: i === activeCol ? '#187C68' : '#1E293B',
                    background: i === activeCol ? '#E6F3E9' : '#F8FAFC',
                    borderRadius: 8,
                    padding: '6px 0',
                    border: i === activeCol ? '2px solid #187C68' : '1px solid #CBD5E1',
                  }}
                >
                  {fmt(kit.lang, d)}
                </div>
              ))}
            </div>

            <div style={{ height: 3, background: '#334155', borderRadius: 2, margin: '2px 0' }} />

            {/* Result Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#187C68', alignSelf: 'center' }}>=</div>
              {[0, 1, 2, 3, 4, 5, 6].map((c) => {
                const stepIdxForCol = 6 - c;
                const isSolved = stepIdxForCol < stepIdx;
                const step = st[stepIdxForCol];
                const resVal = isSolved && step ? step.res : null;

                return (
                  <div
                    key={c}
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: '#187C68',
                      background: isSolved ? '#E6F3E9' : '#F1F5F9',
                      borderRadius: 8,
                      padding: '6px 0',
                      border: isSolved ? '2px solid #187C68' : '2px dashed #CBD5E1',
                      minHeight: 46,
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

          {/* Interactive Column Choices */}
          {currentStep && (
            <div
              style={{
                width: '100%',
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E2E8F0',
                padding: '14px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>
                {kit.t('यस स्तम्भको उत्तर छान्नुहोस्:', 'Select the digit for this column:')}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                {options.map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePickAnswer(digit)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      border: '2px solid #187C68',
                      background: '#FFFFFF',
                      color: '#187C68',
                      fontWeight: 900,
                      fontSize: 20,
                      cursor: 'pointer',
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
  return SimComp;
};

export const AddTowers4 = make7Sim('add', {
  code: 'SIM-MATH-G4-L5-01',
  chapter: 5,
  titleNp: 'जोडको टावर (७ अङ्क)',
  titleEn: 'Addition Towers (7 digits)',
  color: '#16A34A',
  sign: '+',
});

export const SubTowers4 = make7Sim('sub', {
  code: 'SIM-MATH-G4-L5-02',
  chapter: 5,
  titleNp: 'घटाउको टावर (७ अङ्क)',
  titleEn: 'Subtraction Towers (7 digits)',
  color: '#EA580C',
  sign: '−',
});

/* ───────────── 3. MultiplyGrid (2D Area Model) ───────────── */
const QUAD_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#0EA5E9'];

export const MultiplyGrid: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L5-03',
    chapter: 5,
    titleNp: 'गुणन ग्रिड (क्षेत्रफल मोडेल)',
    titleEn: 'Multiplication Grid (Area Model)',
  });

  const [a, setA] = useState(23);
  const [b, setB] = useState(14);
  const [revealed, setRevealed] = useState(4); // 1 to 4 quadrants

  const at = Math.floor(a / 10) * 10;
  const ao = a % 10;
  const bt = Math.floor(b / 10) * 10;
  const bo = b % 10;

  const quads = useMemo(
    () => [
      { id: 0, x: at, y: bt, val: at * bt, label: `${at} × ${bt}` },
      { id: 1, x: ao, y: bt, val: ao * bt, label: `${ao} × ${bt}` },
      { id: 2, x: at, y: bo, val: at * bo, label: `${at} × ${bo}` },
      { id: 3, x: ao, y: bo, val: ao * bo, label: `${ao} × ${bo}` },
    ],
    [at, ao, bt, bo]
  );

  const total = a * b;

  const handleNext = () => {
    if (revealed < 4) {
      setRevealed(revealed + 1);
      const q = quads[revealed];
      kit.tap();
      kit.say(`${q.label} = ${q.val}`, `${q.label} = ${q.val}`);
      if (revealed === 3) kit.star();
    } else {
      setRevealed(1);
    }
  };

  const fresh = () => {
    setA(rnd(12, 49));
    setB(rnd(11, 24));
    setRevealed(4);
    kit.tap();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qa = rnd(12, 45);
      const qb = rnd(11, 25);
      const qans = qa * qb;
      return numQ(
        `${qa} × ${qb} = ?`,
        `${qa} × ${qb} = ?`,
        qans,
        i + 2,
        [10, -10, 100, -100, qa, -qb],
        (x) => fmt(kit.lang, x),
        1
      );
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `${a} × ${b} लाई चार खण्डमा बाँडौँ: (${at} + ${ao}) × (${bt} + ${bo})`,
        `Split ${a} × ${b} into 4 parts: (${at} + ${ao}) × (${bt} + ${bo})`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleNext}
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
            {revealed < 4 ? `➡️ ${kit.t('अर्को खण्ड', 'Next Part')}` : `🔄 ${kit.t('सुरुबाट हेर', 'Restart')}`}
          </button>
          <button
            onClick={fresh}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🎲 {kit.t('नयाँ सङ्ख्या', 'Random')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 680, gap: 16 }}>
        {/* Multiplication Banner */}
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
          <div style={{ fontSize: 26, fontWeight: 900, color: '#187C68' }}>
            {fmt(kit.lang, a)} × {fmt(kit.lang, b)} = {fmt(kit.lang, total)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginTop: 4 }}>
            = {quads.map((q) => q.val).join(' + ')}
          </div>
        </div>

        {/* 2D Area Model Grid */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            border: '2px solid #E2E8F0',
            padding: '24px 30px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Top dimension headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 200px 90px', gap: 8, textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#64748B' }}>×</div>
            <div style={{ background: '#E0F2FE', padding: '6px', borderRadius: 8, fontWeight: 900, color: '#0369A1' }}>
              {at}
            </div>
            <div style={{ background: '#FEF3C7', padding: '6px', borderRadius: 8, fontWeight: 900, color: '#B45309' }}>
              {ao}
            </div>
          </div>

          {/* Row 1 (bt) */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 200px 90px', gap: 8, alignItems: 'stretch' }}>
            <div style={{ background: '#DCFCE7', padding: '12px', borderRadius: 8, fontWeight: 900, color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {bt}
            </div>
            {/* Quad 0 */}
            <div
              style={{
                background: revealed > 0 ? '#FEE2E2' : '#F8FAFC',
                border: '2px solid #EF4444',
                borderRadius: 10,
                padding: '16px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: '#991B1B' }}>{quads[0].label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#B91C1C', marginTop: 4 }}>
                {revealed > 0 ? fmt(kit.lang, quads[0].val) : '?'}
              </div>
            </div>
            {/* Quad 1 */}
            <div
              style={{
                background: revealed > 1 ? '#FEF3C7' : '#F8FAFC',
                border: '2px solid #F59E0B',
                borderRadius: 10,
                padding: '16px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E' }}>{quads[1].label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#B45309', marginTop: 4 }}>
                {revealed > 1 ? fmt(kit.lang, quads[1].val) : '?'}
              </div>
            </div>
          </div>

          {/* Row 2 (bo) */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 200px 90px', gap: 8, alignItems: 'stretch', marginTop: 8 }}>
            <div style={{ background: '#F3E8FF', padding: '12px', borderRadius: 8, fontWeight: 900, color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {bo}
            </div>
            {/* Quad 2 */}
            <div
              style={{
                background: revealed > 2 ? '#DCFCE7' : '#F8FAFC',
                border: '2px solid #10B981',
                borderRadius: 10,
                padding: '16px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: '#065F46' }}>{quads[2].label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                {revealed > 2 ? fmt(kit.lang, quads[2].val) : '?'}
              </div>
            </div>
            {/* Quad 3 */}
            <div
              style={{
                background: revealed > 3 ? '#E0F2FE' : '#F8FAFC',
                border: '2px solid #0EA5E9',
                borderRadius: 10,
                padding: '16px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: '#075985' }}>{quads[3].label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0284C7', marginTop: 4 }}>
                {revealed > 3 ? fmt(kit.lang, quads[3].val) : '?'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

/* ───────────── 4. LongDivision (2D Long Division Bracket) ───────────── */
interface DStep {
  c: number;
  cur: number;
  q: number;
  rem: number;
}
const getDSteps = (n: number, k: number): DStep[] => {
  const ds = digitsOf(n, 3);
  let rem = 0;
  return ds.map((d, c) => {
    const cur = rem * 10 + d;
    const q = Math.floor(cur / k);
    rem = cur - q * k;
    return { c, cur, q, rem };
  });
};

const PL3 = [PL7[4], PL7[5], PL7[6]]; // Hundreds, Tens, Ones

export const LongDivision: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L5-04',
    chapter: 5,
    titleNp: 'भाग प्रयोगशाला (लामो भाग विधि)',
    titleEn: 'Long Division Lab',
  });

  const [n, setN] = useState(486);
  const [k, setK] = useState(4);
  const [stepIdx, setStepIdx] = useState(0); // 0 to 3

  const st = useMemo(() => getDSteps(n, k), [n, k]);
  const quotient = Math.floor(n / k);
  const remainder = n % k;

  const currentStep = stepIdx < 3 ? st[stepIdx] : null;

  const handleNext = () => {
    if (stepIdx < 3) {
      const s = st[stepIdx];
      kit.tap();
      kit.say(
        `${PL3[s.c].np}: ${s.cur} ÷ ${k} = ${s.q}, बाँकी ${s.rem}`,
        `${PL3[s.c].en}: ${s.cur} ÷ ${k} = ${s.q}, remainder ${s.rem}`
      );
      setStepIdx(stepIdx + 1);
      if (stepIdx === 2) kit.star();
    } else {
      fresh();
    }
  };

  const fresh = () => {
    setK(rnd(2, 9));
    setN(rnd(120, 999));
    setStepIdx(0);
    kit.tap();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qn = rnd(120, 999);
      const qk = rnd(2, 9);
      const qq = Math.floor(qn / qk);
      const qr = qn % qk;

      if (i % 2 === 0) {
        return numQ(
          `${qn} ÷ ${qk} को भागफल (Quotient) कति हुन्छ?`,
          `${qn} ÷ ${qk}: what is the quotient?`,
          qq,
          i + 2,
          [1, -1, 10, -10, 5],
          (x) => fmt(kit.lang, x),
          1
        );
      } else {
        return numQ(
          `${qn} ÷ ${qk} मा शेष (Remainder) कति बाँकी रहन्छ?`,
          `${qn} ÷ ${qk}: what is the remainder?`,
          qr,
          i + 5,
          [1, -1, 2, qk - 1],
          (x) => fmt(kit.lang, x),
          0
        );
      }
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={
        currentStep
          ? `${kit.t(PL3[currentStep.c].np, PL3[currentStep.c].en)}: ${currentStep.cur} ÷ ${k} = ${currentStep.q}`
          : kit.t(`भाग सम्पन्न भयो! भागफल = ${quotient}, बाँकी = ${remainder}`, `Division complete! Quotient = ${quotient}, Remainder = ${remainder}`)
      }
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleNext}
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
            {stepIdx < 3 ? `➡️ ${kit.t('अर्को चरण (Step)', 'Next Step')}` : `🔄 ${kit.t('नयाँ भाग', 'New Division')}`}
          </button>
          <button
            onClick={fresh}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🎲 {kit.t('नयाँ अङ्क', 'Random')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 580, gap: 16 }}>
        {/* Banner Card */}
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
          <div style={{ fontSize: 26, fontWeight: 900, color: '#187C68' }}>
            {fmt(kit.lang, n)} ÷ {fmt(kit.lang, k)} = {fmt(kit.lang, quotient)}{' '}
            {remainder > 0 && <span style={{ color: '#DC2626', fontSize: 18 }}>({kit.t('बाँकी', 'rem')} {fmt(kit.lang, remainder)})</span>}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginTop: 4 }}>
            {fmt(kit.lang, k)} × {fmt(kit.lang, quotient)} + {fmt(kit.lang, remainder)} = {fmt(kit.lang, n)}
          </div>
        </div>

        {/* 2D Long Division Bracket Workbench */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            border: '2px solid #E2E8F0',
            padding: '24px 32px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 320,
          }}
        >
          {/* Top Quotient Line */}
          <div style={{ display: 'flex', gap: 14, marginLeft: 70, borderBottom: '2px solid #334155', paddingBottom: 4, width: 140, justifyContent: 'space-around' }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: i < stepIdx ? '#187C68' : '#CBD5E1',
                }}
              >
                {i < stepIdx ? fmt(kit.lang, st[i].q) : '_'}
              </span>
            ))}
          </div>

          {/* Divisor and Dividend Bracket */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#0369A1' }}>{fmt(kit.lang, k)}</span>
            <div style={{ borderLeft: '2px solid #334155', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, paddingLeft: 12 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#1E293B', letterSpacing: 8 }}>
                {fmt(kit.lang, n)}
              </span>
            </div>
          </div>

          {/* Subtraction Work Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12, marginLeft: 60, fontSize: 16, fontWeight: 800, color: '#475569' }}>
            {st.slice(0, stepIdx).map((s, idx) => (
              <div key={idx} style={{ borderBottom: idx < stepIdx - 1 ? '1px dashed #CBD5E1' : 'none', paddingBottom: 4 }}>
                <div>− {s.q * k}</div>
                <div style={{ color: '#DC2626' }}>= {s.rem}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default AddTowers4;
