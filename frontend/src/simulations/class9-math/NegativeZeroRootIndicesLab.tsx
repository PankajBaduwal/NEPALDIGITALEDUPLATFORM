import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface PresetEval {
  id: string;
  expr: string;
  exprNp: string;
  baseNumber: number;
  primeBase: number;
  primePower: number;
  fractionExpNum: number;
  fractionExpDen: number;
  isNegative: boolean;
  step1: string;
  step2: string;
  step3: string;
  finalAns: string;
}

const PRESET_EVALS: PresetEval[] = [
  {
    id: 'e1',
    expr: '64^(2/3)',
    exprNp: '६४^(२/३)',
    baseNumber: 64,
    primeBase: 4,
    primePower: 3,
    fractionExpNum: 2,
    fractionExpDen: 3,
    isNegative: false,
    step1: '६४ लाई आधार ४ को घातमा बदल्दा: ६४ = ४³',
    step2: '(४³)^(२/३) = ४^(३ × २/३) = ४²',
    step3: '४² = ४ × ४ = १६',
    finalAns: '16',
  },
  {
    id: 'e2',
    expr: '81^(-3/4)',
    exprNp: '८१^(-३/४)',
    baseNumber: 81,
    primeBase: 3,
    primePower: 4,
    fractionExpNum: -3,
    fractionExpDen: 4,
    isNegative: true,
    step1: '८१ लाई आधार ३ को घातमा बदल्दा: ८१ = ३⁴',
    step2: '(३⁴)^(-३/४) = ३^(४ × (-३/४)) = ३^(-३)',
    step3: '३^(-३) = १ / ३³ = १ / २७',
    finalAns: '1/27',
  },
  {
    id: 'e3',
    expr: '27^(-2/3)',
    exprNp: '२७^(-२/३)',
    baseNumber: 27,
    primeBase: 3,
    primePower: 3,
    fractionExpNum: -2,
    fractionExpDen: 3,
    isNegative: true,
    step1: '२७ = ३³',
    step2: '(३³)^(-२/३) = ३^(-२)',
    step3: '३^(-२) = १ / ३² = १ / ९',
    finalAns: '1/9',
  },
  {
    id: 'e4',
    expr: '32^(3/5)',
    exprNp: '३२^(३/५)',
    baseNumber: 32,
    primeBase: 2,
    primePower: 5,
    fractionExpNum: 3,
    fractionExpDen: 5,
    isNegative: false,
    step1: '३२ लाई आधार २ को घातमा बदल्दा: ३२ = २⁵',
    step2: '(२⁵)^(३/५) = २^(५ × ३/५) = २³',
    step3: '२³ = ८',
    finalAns: '8',
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'कुनै पनि गैर-शून्य संख्याको शून्य घात (a⁰, जहाँ a ≠ 0) को मान कति हुन्छ?',
    en: 'What is the value of any non-zero number raised to the power zero (a⁰, a ≠ 0)?',
    options: [
      { key: 'A', label: '1 (एक)' },
      { key: 'B', label: '0 (शून्य)' },
      { key: 'C', label: 'a' },
      { key: 'D', label: 'अनन्त' },
    ],
    answer: 'A',
  },
  {
    np: '२⁻³ को मान कति हुन्छ?',
    en: 'What is the value of 2⁻³?',
    options: [
      { key: 'A', label: '1/8 (१/२³)' },
      { key: 'B', label: '-8' },
      { key: 'C', label: '-6' },
      { key: 'D', label: '1/6' },
    ],
    answer: 'A',
  },
  {
    np: '६४^(१/३) वा ³√६४ को मान कति हुन्छ?',
    en: 'What is the value of 64^(1/3) or ³√64?',
    options: [
      { key: 'A', label: '4 (४³ = ६४)' },
      { key: 'B', label: '8' },
      { key: 'C', label: '16' },
      { key: 'D', label: '2' },
    ],
    answer: 'A',
  },
];

export const NegativeZeroRootIndicesLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U12-02',
    chapter: 12,
    titleNp: 'ऋणात्मक, शून्य र मूल घाताङ्क प्रयोगशाला',
    titleEn: 'Negative, Zero and Root Indices Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'pattern' | 'fractional'>('pattern');
  const [basePattern, setBasePattern] = useState<number>(2);
  const [selectedEvalId, setSelectedEvalId] = useState<string>('e1');

  const currEval = PRESET_EVALS.find((e) => e.id === selectedEvalId) || PRESET_EVALS[0];

  // Pattern steps for basePattern: +3 down to -3
  const patternRows = [3, 2, 1, 0, -1, -2, -3].map((exp) => {
    let valStr = '';
    let explanation = '';
    if (exp > 0) {
      valStr = `${Math.pow(basePattern, exp)}`;
      explanation = `अघिल्लो मान ÷ ${basePattern}`;
    } else if (exp === 0) {
      valStr = '1';
      explanation = `${basePattern} ÷ ${basePattern} = 1 (प्रमाणित: a⁰ = 1)`;
    } else {
      const positivePower = Math.pow(basePattern, Math.abs(exp));
      valStr = `1/${positivePower}`;
      explanation = `1 ÷ ${positivePower} = 1/${basePattern}^${Math.abs(exp)}`;
    }
    return { exp, valStr, explanation };
  });

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! शून्य घाताङ्क (a⁰ = १), ऋणात्मक घाताङ्क (a⁻ᵐ = १/aᵐ) र भिन्न घाताङ्क (aᵐ/ⁿ) कसरी काम गर्छन्, यहाँ प्रत्यक्ष परीक्षण गरौं!',
        'Welcome! Explore zero exponents (a⁰ = 1), negative exponents (a⁻ᵐ = 1/aᵐ), and rational/root powers through descending patterns and guided evaluations!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Lab Section Mode Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
          <button
            onClick={() => setActiveTab('pattern')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: activeTab === 'pattern' ? '2px solid #0D9488' : '1px solid #CBD5E1',
              backgroundColor: activeTab === 'pattern' ? '#F0FDFA' : '#FFFFFF',
              color: activeTab === 'pattern' ? '#0F766E' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            📉 {L('शून्य र ऋणात्मक ढाँचा (Descending Pattern)', 'Descending Pattern (a⁰ & a⁻ᵐ)')}
          </button>
          <button
            onClick={() => setActiveTab('fractional')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: activeTab === 'fractional' ? '2px solid #2563EB' : '1px solid #CBD5E1',
              backgroundColor: activeTab === 'fractional' ? '#EFF6FF' : '#FFFFFF',
              color: activeTab === 'fractional' ? '#1D4ED8' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            🌱 {L('भिन्न तथा मूल घाताङ्क मान (Root Powers Lab)', 'Root / Fractional Powers')}
          </button>
        </div>

        {activeTab === 'pattern' ? (
          /* Pattern Section */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 14, color: '#1E293B' }}>
                  {L('आधार छनोट गरी घट्दो क्रम ढाँचा हेर्नुहोस्:', 'Select base to observe pattern:')}
                </strong>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  {L('प्रत्येक एक घात घट्दा मान आधार संख्याले भाग हुन्छ।', 'Each step down divides by the base.')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[2, 3, 5, 10].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBasePattern(b)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: basePattern === b ? '2px solid #0D9488' : '1px solid #CBD5E1',
                      backgroundColor: basePattern === b ? '#CCFBF1' : '#FFFFFF',
                      color: basePattern === b ? '#0F766E' : '#334155',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    आधार {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', color: '#475569' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                    {L('घाताङ्कीय रूप', 'Power')}
                  </th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                    {L('मान (Value)', 'Value')}
                  </th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                    {L('कारण / नियम', 'Explanation / Rule')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {patternRows.map((r, i) => {
                  const isZero = r.exp === 0;
                  const isNeg = r.exp < 0;
                  return (
                    <tr
                      key={i}
                      style={{
                        backgroundColor: isZero ? '#ECFDF5' : isNeg ? '#FFFBEB' : '#FFFFFF',
                        fontWeight: isZero ? 700 : 'normal',
                      }}
                    >
                      <td style={{ padding: '8px 12px', border: '1px solid #E2E8F0', fontFamily: 'monospace' }}>
                        {basePattern}
                        <sup>{r.exp}</sup>
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #E2E8F0', fontFamily: 'monospace', color: isZero ? '#065F46' : isNeg ? '#B45309' : '#1E293B' }}>
                        {r.valStr}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #E2E8F0', color: '#475569' }}>
                        {r.explanation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Fractional Evaluation Section */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* Presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {PRESET_EVALS.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEvalId(e.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: selectedEvalId === e.id ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    backgroundColor: selectedEvalId === e.id ? '#EFF6FF' : '#FFFFFF',
                    color: selectedEvalId === e.id ? '#1D4ED8' : '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontSize: 14,
                  }}
                >
                  {e.expr}
                </button>
              ))}
            </div>

            {/* Step-by-Step Card */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>
                  {L('दिइएको अभिव्यक्ति:', 'Given Expression:')}
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#1D4ED8',
                    backgroundColor: '#EFF6FF',
                    padding: '4px 12px',
                    borderRadius: 8,
                  }}
                >
                  {currEval.expr}
                </span>
              </div>

              <div style={{ borderBottom: '1px solid #E2E8F0', margin: '4px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                    १. {L('आधारलाई रूढ गुणनखण्ड वा पूर्ण घातमा बदल्ने:', 'Convert base to prime power:')}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#0F766E', marginTop: 4 }}>
                    {currEval.step1}
                  </div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                    २. {L('घातको घात नियम (aᵐ)ⁿ = aᵐⁿ प्रयोग गर्ने:', 'Apply power of a power law (aᵐ)ⁿ = aᵐⁿ:')}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#0F766E', marginTop: 4 }}>
                    {currEval.step2}
                  </div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                    ३. {L('सरलीकरण गरी अन्तिम मान निकाल्ने:', 'Simplify for final value:')}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#0F766E', marginTop: 4 }}>
                    {currEval.step3}
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  borderRadius: 8,
                  border: '1px solid #A7F3D0',
                  padding: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>
                  {L('अन्तिम उत्तर (Final Answer):', 'Final Answer:')}
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#065F46',
                  }}
                >
                  = {currEval.finalAns}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default NegativeZeroRootIndicesLab;
