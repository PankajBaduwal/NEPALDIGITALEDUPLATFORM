import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface LawItem {
  id: string;
  nameNp: string;
  nameEn: string;
  formula: string;
  descriptionNp: string;
  descriptionEn: string;
  defaultBase: number;
  defaultM: number;
  defaultN: number;
  renderVisual: (a: number, m: number, n: number, isNe: boolean) => {
    expanded: string;
    simplified: string;
    numericalVal: number;
  };
}

const LAWS: LawItem[] = [
  {
    id: 'product',
    nameNp: 'गुणनको नियम (Product Law)',
    nameEn: 'Product Law: aᵐ × aⁿ = aᵐ⁺ⁿ',
    formula: 'aᵐ × aⁿ = aᵐ⁺ⁿ',
    descriptionNp: 'समान आधार (base) भएका घाताङ्कहरू गुणन गर्दा तिनीहरूका घातहरू (powers) जोडिन्छन्।',
    descriptionEn: 'When multiplying powers with the same base, add their exponents together.',
    defaultBase: 2,
    defaultM: 3,
    defaultN: 2,
    renderVisual: (a, m, n, isNe) => {
      const part1 = Array(m).fill(`${a}`).join(' × ');
      const part2 = Array(n).fill(`${a}`).join(' × ');
      return {
        expanded: `(${part1}) × (${part2})`,
        simplified: `${a}^${m + n}`,
        numericalVal: Math.pow(a, m + n),
      };
    },
  },
  {
    id: 'quotient',
    nameNp: 'भागको नियम (Quotient Law)',
    nameEn: 'Quotient Law: aᵐ ÷ aⁿ = aᵐ⁻ⁿ',
    formula: 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ (a ≠ 0)',
    descriptionNp: 'समान आधार भएका घाताङ्कहरू भाग गर्दा भाजकको घात भाज्यको घातबाट घटाइन्छ।',
    descriptionEn: 'When dividing powers with the same base, subtract the denominator exponent from the numerator exponent.',
    defaultBase: 3,
    defaultM: 4,
    defaultN: 2,
    renderVisual: (a, m, n, isNe) => {
      const num = Array(m).fill(`${a}`).join(' × ');
      const den = Array(n).fill(`${a}`).join(' × ');
      return {
        expanded: `(${num}) ÷ (${den})`,
        simplified: `${a}^${m - n}`,
        numericalVal: Math.pow(a, m - n),
      };
    },
  },
  {
    id: 'power_of_power',
    nameNp: 'घातको घात नियम (Power of a Power)',
    nameEn: 'Power of a Power: (aᵐ)ⁿ = aᵐⁿ',
    formula: '(aᵐ)ⁿ = aᵐⁿ',
    descriptionNp: 'कुनै घाताङ्कीय राशिलाई पुनः अर्को घातमा लैजाँदा दुई घातहरूको आपसमा गुणन हुन्छ।',
    descriptionEn: 'Raising a power to another power multiplies the exponents.',
    defaultBase: 2,
    defaultM: 2,
    defaultN: 3,
    renderVisual: (a, m, n, isNe) => {
      const single = `(${Array(m).fill(`${a}`).join(' × ')})`;
      const repeated = Array(n).fill(single).join(' × ');
      return {
        expanded: repeated,
        simplified: `${a}^${m * n}`,
        numericalVal: Math.pow(a, m * n),
      };
    },
  },
  {
    id: 'power_of_product',
    nameNp: 'गुणनफलको घात नियम (Power of a Product)',
    nameEn: 'Power of a Product: (ab)ᵐ = aᵐ × bᵐ',
    formula: '(a × b)ᵐ = aᵐ × bᵐ',
    descriptionNp: 'दुई संख्याको गुणनफलको समग्र घात प्रत्येक संख्याको व्यक्तिगत घात बराबर हुन्छ।',
    descriptionEn: 'The power of a product is equal to the product of each base raised to that power.',
    defaultBase: 2, // will act as a, n will act as b
    defaultM: 3,
    defaultN: 3,
    renderVisual: (a, m, b, isNe) => {
      const pairs = Array(m).fill(`(${a} × ${b})`).join(' × ');
      return {
        expanded: pairs,
        simplified: `${a}^${m} × ${b}^${m}`,
        numericalVal: Math.pow(a * b, m),
      };
    },
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'घाताङ्कको गुणन नियम अनुसार a⁵ × a³ को मान कति हुन्छ?',
    en: 'According to the product law of indices, what is a⁵ × a³?',
    options: [
      { key: 'A', label: 'a⁸ (a⁵⁺³)' },
      { key: 'B', label: 'a¹⁵ (a⁵ˣ³)' },
      { key: 'C', label: 'a²' },
      { key: 'D', label: '2a⁸' },
    ],
    answer: 'A',
  },
  {
    np: '(२³)² को सरलीकृत मान कति हुन्छ?',
    en: 'What is the simplified value of (2³)²?',
    options: [
      { key: 'A', label: '२⁶ = ६४' },
      { key: 'B', label: '२⁵ = ३२' },
      { key: 'C', label: '२⁹ = ५१२' },
      { key: 'D', label: '१२' },
    ],
    answer: 'A',
  },
  {
    np: 'x⁷ ÷ x³ को मान कति हुन्छ?',
    en: 'What is the value of x⁷ ÷ x³?',
    options: [
      { key: 'A', label: 'x⁴ (x⁷⁻³)' },
      { key: 'B', label: 'x¹⁰' },
      { key: 'C', label: 'x²¹' },
      { key: 'D', label: 'x^(7/3)' },
    ],
    answer: 'A',
  },
];

export const IndicesLawsExplorer: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U12-01',
    chapter: 12,
    titleNp: 'घाताङ्कका नियमहरू अन्वेषक',
    titleEn: 'Introduction to Indices and Laws Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeLawId, setActiveLawId] = useState<string>('product');
  const law = LAWS.find((l) => l.id === activeLawId) || LAWS[0];

  const [baseA, setBaseA] = useState<number>(law.defaultBase);
  const [expM, setExpM] = useState<number>(law.defaultM);
  const [expN, setExpN] = useState<number>(law.defaultN);

  const handleSelectLaw = (item: LawItem) => {
    setActiveLawId(item.id);
    setBaseA(item.defaultBase);
    setExpM(item.defaultM);
    setExpN(item.defaultN);
  };

  const visualData = law.renderVisual(baseA, expM, expN, isNe);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! घाताङ्क (Indices) का आधारभूत नियमहरू: गुणन नियम, भाग नियम र घातको घात नियमलाई दृश्य रूपमा प्रत्यक्ष परिवर्तन गरी बुझौं!',
        'Welcome! Explore fundamental laws of indices: product, quotient, and power laws through interactive visual expansions!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Law Selectors */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {LAWS.map((l) => (
            <button
              key={l.id}
              onClick={() => handleSelectLaw(l)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: activeLawId === l.id ? '2px solid #0D9488' : '1px solid #CBD5E1',
                backgroundColor: activeLawId === l.id ? '#F0FDFA' : '#FFFFFF',
                color: activeLawId === l.id ? '#0F766E' : '#475569',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: isNe ? FONT_NP : 'inherit',
                fontSize: 13,
              }}
            >
              {L(l.nameNp, l.nameEn)}
            </button>
          ))}
        </div>

        {/* Formula & Concept Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>
              {L('नियमको सूत्र (Law Formula):', 'Law Formula:')}
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 22,
                fontWeight: 800,
                color: '#0F766E',
                marginTop: 4,
              }}
            >
              {law.formula}
            </div>
            <div style={{ fontSize: 13, color: '#334155', marginTop: 4 }}>
              {L(law.descriptionNp, law.descriptionEn)}
            </div>
          </div>
        </div>

        {/* Interactive Sliders: Base and Powers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
            backgroundColor: '#F8FAFC',
            borderRadius: 10,
            padding: 14,
            border: '1px solid #E2E8F0',
          }}
        >
          {/* Base A */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
              <span>{L('आधार (Base a):', 'Base a:')}</span>
              <strong>{fmt(baseA)}</strong>
            </div>
            <input
              type="range"
              min={2}
              max={5}
              step={1}
              value={baseA}
              onChange={(e) => setBaseA(Number(e.target.value))}
              style={{ width: '100%', marginTop: 6, accentColor: '#0D9488' }}
            />
          </div>

          {/* Power m */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
              <span>{L('पहिलो घात (Exponent m):', 'Exponent m:')}</span>
              <strong>{fmt(expM)}</strong>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={expM}
              onChange={(e) => setExpM(Number(e.target.value))}
              style={{ width: '100%', marginTop: 6, accentColor: '#0D9488' }}
            />
          </div>

          {/* Power n */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
              <span>
                {activeLawId === 'power_of_product'
                  ? L('दोस्रो आधार (Base b):', 'Base b:')
                  : L('दोस्रो घात (Exponent n):', 'Exponent n:')}
              </span>
              <strong>{fmt(expN)}</strong>
            </div>
            <input
              type="range"
              min={1}
              max={activeLawId === 'quotient' ? expM : 4}
              step={1}
              value={expN}
              onChange={(e) => setExpN(Number(e.target.value))}
              style={{ width: '100%', marginTop: 6, accentColor: '#0D9488' }}
            />
          </div>
        </div>

        {/* Visual Expansion & Result */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
            {L('विस्तारित रूप (Expanded Multiplication Representation):', 'Expanded Form:')}
          </div>

          <div
            style={{
              padding: 12,
              backgroundColor: '#F1F5F9',
              borderRadius: 8,
              fontFamily: 'monospace',
              fontSize: 16,
              color: '#334155',
              wordBreak: 'break-all',
            }}
          >
            {visualData.expanded}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginTop: 6,
            }}
          >
            <div
              style={{
                backgroundColor: '#ECFDF5',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #A7F3D0',
              }}
            >
              <div style={{ fontSize: 12, color: '#065F46', fontWeight: 700 }}>
                {L('सरलीकृत घाताङ्क रूप (Simplified Index Form):', 'Simplified Index Form:')}
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#065F46',
                  marginTop: 4,
                }}
              >
                = {visualData.simplified}
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#EFF6FF',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #BFDBFE',
              }}
            >
              <div style={{ fontSize: 12, color: '#1E40AF', fontWeight: 700 }}>
                {L('संख्यात्मक मान (Evaluated Numerical Value):', 'Evaluated Value:')}
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#1E40AF',
                  marginTop: 4,
                }}
              >
                = {fmt(visualData.numericalVal)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default IndicesLawsExplorer;
