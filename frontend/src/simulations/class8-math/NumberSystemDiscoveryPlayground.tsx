/**
 * NumberSystemDiscoveryPlayground.tsx
 * Grade 8 Mathematics – Unit 2: WHOLE NUMBERS
 * Simulation 1: Number System Discovery Playground
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 2)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Binary, Layers, Power, ToggleLeft, ToggleRight, Sparkles, Check, HelpCircle, ArrowRight } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दशमलव सङ्ख्या पद्धति (Decimal System) को आधार (Base) कति हुन्छ र यसमा कुन-कुन अङ्कहरू प्रयोग गरिन्छन्?',
    en: 'What is the base of the Decimal Number System and which digits are used in it?',
    options: [
      { key: 'A', label: 'Base 10, digits 0–9' },
      { key: 'B', label: 'Base 2, digits 0 and 1' },
      { key: 'C', label: 'Base 5, digits 0 to 4' },
      { key: 'D', label: 'Base 8, digits 0 to 7' },
    ],
    answer: 'A',
  },
  {
    np: 'कम्प्युटर र विद्युतीय सर्किटमा स्विच अन (ON) र अफ (OFF) जनाउन कुन सङ्ख्या पद्धति प्रयोग गरिन्छ?',
    en: 'Which number system is used to represent switch ON and OFF in electrical circuits and computers?',
    options: [
      { key: 'A', label: 'Binary system (ON = 1, OFF = 0)' },
      { key: 'B', label: 'Quinary system' },
      { key: 'C', label: 'Decimal system' },
      { key: 'D', label: 'Roman system' },
    ],
    answer: 'A',
  },
  {
    np: 'द्विआधार सङ्ख्या 10101₂ (10101₂) को दशमलव मान (Decimal Value) कति हुन्छ?',
    en: 'What is the decimal equivalent of the binary number 10101₂?',
    options: [
      { key: 'A', label: '21 [ 16 + 0 + 4 + 0 + 1 = 21 ]' },
      { key: 'B', label: '15' },
      { key: 'C', label: '31' },
      { key: 'D', label: '10' },
    ],
    answer: 'A',
  },
  {
    np: 'पञ्चआधार सङ्ख्या पद्धति (Quinary System) मा कुन अङ्क प्रयोग गर्न पाइँदैन?',
    en: 'Which digit cannot be used in the Quinary (Base-5) number system?',
    options: [
      { key: 'A', label: '5' },
      { key: 'B', label: '4' },
      { key: 'C', label: '0' },
      { key: 'D', label: '3' },
    ],
    answer: 'A',
  },
  {
    np: 'पञ्चआधार सङ्ख्या 234₅ (234₅) को विस्तारित रूप (Expanded Form) कुन हो?',
    en: 'What is the correct expanded form of the quinary number 234₅?',
    options: [
      { key: 'A', label: '2 × 5² + 3 × 5¹ + 4 × 5⁰' },
      { key: 'B', label: '2 × 10² + 3 × 10¹ + 4 × 10⁰' },
      { key: 'C', label: '2 × 2² + 3 × 2¹ + 4 × 2⁰' },
      { key: 'D', label: '23 × 5 + 4' },
    ],
    answer: 'A',
  },
];

export const NumberSystemDiscoveryPlayground: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U2-01',
    chapter: 2,
    titleNp: 'सङ्ख्या पद्धति खोजी खेलमैदान (Number System Discovery)',
    titleEn: 'Number System Discovery Playground',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'decimal' | 'binary' | 'quinary' | 'compare'>('decimal');

  // Decimal interactive state (4 digits: d3, d2, d1, d0)
  const [decDigits, setDecDigits] = useState<number[]>([1, 2, 5, 6]);

  // Binary switches (5 bits: b4, b3, b2, b1, b0)
  const [binaryBits, setBinaryBits] = useState<number[]>([1, 0, 1, 0, 1]);

  // Quinary digits (4 digits: q3, q2, q1, q0)
  const [quinaryDigits, setQuinaryDigits] = useState<number[]>([1, 3, 4, 0]);

  // Comparison selector decimal number
  const [selectedCompDec, setSelectedCompDec] = useState<number>(25);

  const decValue = decDigits[0] * 1000 + decDigits[1] * 100 + decDigits[2] * 10 + decDigits[3];
  const binaryValue = binaryBits.reduce((acc, bit, idx) => acc + bit * Math.pow(2, 4 - idx), 0);
  const quinaryValue = quinaryDigits[0] * 125 + quinaryDigits[1] * 25 + quinaryDigits[2] * 5 + quinaryDigits[3];

  const toBinaryString = (val: number) => (val >>> 0).toString(2);
  const toQuinaryString = (val: number) => {
    if (val === 0) return '0';
    let res = '';
    let n = val;
    while (n > 0) {
      res = (n % 5).toString() + res;
      n = Math.floor(n / 5);
    }
    return res;
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! सङ्ख्या पद्धति खोजी खेलमैदानमा स्वागत छ। दशमलव (10), द्विआधार (2) र पञ्चआधार (5) पद्धति बुझौँ!',
        'Hello! Welcome to Number System Discovery. Let us master Decimal (Base 10), Binary (Base 2), and Quinary (Base 5)!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'decimal', labelNp: '1. दशमलव पद्धति (Base 10)', labelEn: '1. Decimal System (Base 10)', icon: Layers },
            { id: 'binary', labelNp: '2. द्विआधार पद्धति (Base 2)', labelEn: '2. Binary System (Base 2)', icon: Binary },
            { id: 'quinary', labelNp: '3. पञ्चआधार पद्धति (Base 5)', labelEn: '3. Quinary System (Base 5)', icon: Power },
            { id: 'compare', labelNp: '4. पद्धतिहरूको तुलना तालिम', labelEn: '4. System Comparison', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  border: 'none',
                  background: active ? '#0284c7' : '#ffffff',
                  color: active ? '#ffffff' : '#334155',
                  boxShadow: active ? '0 2px 4px rgba(2, 132, 199, 0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                <span>{isNe ? tab.labelNp : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Decimal System */}
        {activeTab === 'decimal' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={20} />
                  {L('दशमलव सङ्ख्या पद्धति (Decimal System - आधार 10)', 'Decimal Number System (Base 10)')}
                </h3>
                <span style={{ fontSize: 13, background: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
                  {L('प्रयोग हुने 10 अङ्कहरू: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9', 'Digits used: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9')}
                </span>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                {L(
                  'हामीले दैनिक जीवनमा प्रयोग गर्ने हिन्दु-अरेबिक सङ्ख्या पद्धति नै दशमलव पद्धति हो। यसको प्रत्येक स्थानको मान 10 को घात (Power of 10) मा बढ्छ।',
                  'The Hindu-Arabic system used in daily life is the decimal system. Each position value increases by powers of 10.'
                )}
              </p>

              {/* Interactive Digit Place-Value Table */}
              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ padding: 10, border: '1px solid #cbd5e1' }}>{L('स्थान (Place)', 'Place')}</th>
                      <th style={{ padding: 10, border: '1px solid #cbd5e1' }}>{L('हजार (Thousand: 10³)', '10³ (1000)')}</th>
                      <th style={{ padding: 10, border: '1px solid #cbd5e1' }}>{L('सय (Hundred: 10²)', '10² (100)')}</th>
                      <th style={{ padding: 10, border: '1px solid #cbd5e1' }}>{L('दश (Ten: 10¹)', '10¹ (10)')}</th>
                      <th style={{ padding: 10, border: '1px solid #cbd5e1' }}>{L('एक (One: 10⁰)', '10⁰ (1)')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: 12, border: '1px solid #cbd5e1', fontWeight: 700, color: '#0369a1' }}>
                        {L('अङ्क (Digit 0-9)', 'Digit (0-9)')}
                      </td>
                      {decDigits.map((d, idx) => (
                        <td key={idx} style={{ padding: 10, border: '1px solid #cbd5e1' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <button
                              onClick={() => {
                                const next = [...decDigits];
                                next[idx] = (next[idx] + 1) % 10;
                                setDecDigits(next);
                              }}
                              style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', background: '#f8fafc' }}
                            >
                              ▲
                            </button>
                            <span style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{isNe ? toNp(d) : d}</span>
                            <button
                              onClick={() => {
                                const next = [...decDigits];
                                next[idx] = (next[idx] + 9) % 10;
                                setDecDigits(next);
                              }}
                              style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', background: '#f8fafc' }}
                            >
                              ▼
                            </button>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr style={{ background: '#fafafa' }}>
                      <td style={{ padding: 10, border: '1px solid #cbd5e1', fontWeight: 700 }}>
                        {L('स्थानीय मान (Place Value)', 'Place Value')}
                      </td>
                      <td style={{ padding: 10, border: '1px solid #cbd5e1', color: '#0284c7', fontWeight: 800 }}>
                        {isNe ? toNp(decDigits[0] * 1000) : decDigits[0] * 1000}
                      </td>
                      <td style={{ padding: 10, border: '1px solid #cbd5e1', color: '#0284c7', fontWeight: 800 }}>
                        {isNe ? toNp(decDigits[1] * 100) : decDigits[1] * 100}
                      </td>
                      <td style={{ padding: 10, border: '1px solid #cbd5e1', color: '#0284c7', fontWeight: 800 }}>
                        {isNe ? toNp(decDigits[2] * 10) : decDigits[2] * 10}
                      </td>
                      <td style={{ padding: 10, border: '1px solid #cbd5e1', color: '#0284c7', fontWeight: 800 }}>
                        {isNe ? toNp(decDigits[3]) : decDigits[3]}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Expanded Form Display */}
              <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 12, border: '1.5px solid #bae6fd' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1' }}>
                  {L('विस्तारित रूप (Expanded Form):', 'Expanded Form:')}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                  {isNe ? toNp(decValue) : decValue} = ({isNe ? toNp(decDigits[0]) : decDigits[0]} × 10³) + ({isNe ? toNp(decDigits[1]) : decDigits[1]} × 10²) + ({isNe ? toNp(decDigits[2]) : decDigits[2]} × 10¹) + ({isNe ? toNp(decDigits[3]) : decDigits[3]} × 10⁰)
                </div>
                <div style={{ fontSize: 14, color: '#0284c7', marginTop: 4 }}>
                  = {isNe ? toNp(decDigits[0] * 1000) : decDigits[0] * 1000} + {isNe ? toNp(decDigits[1] * 100) : decDigits[1] * 100} + {isNe ? toNp(decDigits[2] * 10) : decDigits[2] * 10} + {isNe ? toNp(decDigits[3]) : decDigits[3]} = {isNe ? toNp(decValue) : decValue}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Binary System */}
        {activeTab === 'binary' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: '#16a34a', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Binary size={20} />
                  {L('द्विआधार सङ्ख्या पद्धति (Binary Number System - आधार 2)', 'Binary Number System (Base 2)')}
                </h3>
                <span style={{ fontSize: 13, background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
                  {L('प्रयोग हुने 2 अङ्कहरू: 0 र 1 (Bits)', 'Digits used: 0 and 1')}
                </span>
              </div>
              <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                {L(
                  'कम्प्युटर सर्किटमा करेन्ट प्रवाह हुनु (स्विच अन) लाई 1 र नहुनु (स्विच अफ) लाई 0 मानिन्छ। यसको प्रत्येक स्थानको मान 2 को घात (2⁴, 2³, 2², 2¹, 2⁰) मा हुन्छ।',
                  'In digital electronics, switch ON is 1 and switch OFF is 0. Place values are powers of 2 (16, 8, 4, 2, 1).'
                )}
              </p>

              {/* Switches Interactive Circuit */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 12 }}>
                  {L('स्विच अन (1) / अफ (0) गरेर द्विआधार सङ्ख्या बनाउनुहोस्:', 'Toggle switches ON (1) / OFF (0) to build binary number:')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, textAlign: 'center' }}>
                  {[
                    { power: '2⁴ (16)', val: 16 },
                    { power: '2³ (8)', val: 8 },
                    { power: '2² (4)', val: 4 },
                    { power: '2¹ (2)', val: 2 },
                    { power: '2⁰ (1)', val: 1 },
                  ].map((p, idx) => {
                    const isOn = binaryBits[idx] === 1;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          const next = [...binaryBits];
                          next[idx] = next[idx] === 1 ? 0 : 1;
                          setBinaryBits(next);
                        }}
                        style={{
                          background: isOn ? '#dcfce7' : '#f1f5f9',
                          border: isOn ? '2px solid #22c55e' : '1px solid #cbd5e1',
                          borderRadius: 12,
                          padding: 12,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{p.power}</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: isOn ? '#15803d' : '#94a3b8', margin: '6px 0' }}>
                          {isOn ? '1 (ON)' : '0 (OFF)'}
                        </div>
                        <div style={{ fontSize: 12, color: isOn ? '#166534' : '#64748b', fontWeight: 700 }}>
                          {isOn ? `+${p.val}` : '+0'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Binary Calculation Result */}
              <div style={{ background: '#ecfdf5', padding: 16, borderRadius: 12, border: '1.5px solid #a7f3d0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>
                  {L('द्विआधार सङ्ख्या र दशमलव समतुल्यता:', 'Binary Number and Decimal Equivalent:')}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                  {binaryBits.join('')}₂ = {isNe ? toNp(binaryValue) : binaryValue}₁₀
                </div>
                <div style={{ fontSize: 13, color: '#064e3b', marginTop: 6, lineHeight: 1.6 }}>
                  {L('विस्तार:', 'Expanded calculation:')}{' '}
                  {binaryBits
                    .map((b, i) => `(${b} × 2^${4 - i})`)
                    .join(' + ')}{' '}
                  = {binaryBits.map((b, i) => b * Math.pow(2, 4 - i)).join(' + ')} = {binaryValue}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Quinary System */}
        {activeTab === 'quinary' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: '#ea580c', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Power size={20} />
                  {L('पञ्चआधार सङ्ख्या पद्धति (Quinary System - आधार 5)', 'Quinary Number System (Base 5)')}
                </h3>
                <span style={{ fontSize: 13, background: '#ffedd5', color: '#c2410c', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
                  {L('प्रयोग हुने 5 अङ्कहरू: 0, 1, 2, 3, 4', 'Digits used: 0, 1, 2, 3, 4')}
                </span>
              </div>
              <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                {L(
                  '5 pcs वस्तुहरू (जस्तै कलम, गेडागुडी) को समूह बनाएर गणना गर्ने विधिलाई पञ्चआधार पद्धति भनिन्छ। यसमा 5 प्रयोग हुँदैन, 4 पछि सिधै 10₅ (पाँच) आउँछ।',
                  'Counting in bundles of five objects is the quinary system. Digit 5 is not allowed; after 4 comes 10₅ (representing 5).'
                )}
              </p>

              {/* Quinary Place Values */}
              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#fff7ed' }}>
                      <th style={{ padding: 10, border: '1px solid #fed7aa' }}>{L('स्थान (Place)', 'Place')}</th>
                      <th style={{ padding: 10, border: '1px solid #fed7aa' }}>5³ (125)</th>
                      <th style={{ padding: 10, border: '1px solid #fed7aa' }}>5² (25)</th>
                      <th style={{ padding: 10, border: '1px solid #fed7aa' }}>5¹ (5)</th>
                      <th style={{ padding: 10, border: '1px solid #fed7aa' }}>5⁰ (1)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: 10, border: '1px solid #fed7aa', fontWeight: 700, color: '#c2410c' }}>
                        {L('अङ्क (0-4)', 'Digit (0-4)')}
                      </td>
                      {quinaryDigits.map((q, idx) => (
                        <td key={idx} style={{ padding: 10, border: '1px solid #fed7aa' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <button
                              onClick={() => {
                                const next = [...quinaryDigits];
                                next[idx] = (next[idx] + 1) % 5;
                                setQuinaryDigits(next);
                              }}
                              style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #fed7aa', cursor: 'pointer', background: '#fff' }}
                            >
                              ▲
                            </button>
                            <span style={{ fontSize: 24, fontWeight: 900, color: '#9a3412' }}>{isNe ? toNp(q) : q}</span>
                            <button
                              onClick={() => {
                                const next = [...quinaryDigits];
                                next[idx] = (next[idx] + 4) % 5;
                                setQuinaryDigits(next);
                              }}
                              style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #fed7aa', cursor: 'pointer', background: '#fff' }}
                            >
                              ▼
                            </button>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr style={{ background: '#fffaf5' }}>
                      <td style={{ padding: 10, border: '1px solid #fed7aa', fontWeight: 700 }}>
                        {L('स्थानीय मान (Value)', 'Value')}
                      </td>
                      <td style={{ padding: 10, border: '1px solid #fed7aa', color: '#c2410c', fontWeight: 800 }}>
                        {isNe ? toNp(quinaryDigits[0] * 125) : quinaryDigits[0] * 125}
                      </td>
                      <td style={{ padding: 10, border: '1px solid #fed7aa', color: '#c2410c', fontWeight: 800 }}>
                        {isNe ? toNp(quinaryDigits[1] * 25) : quinaryDigits[1] * 25}
                      </td>
                      <td style={{ padding: 10, border: '1px solid #fed7aa', color: '#c2410c', fontWeight: 800 }}>
                        {isNe ? toNp(quinaryDigits[2] * 5) : quinaryDigits[2] * 5}
                      </td>
                      <td style={{ padding: 10, border: '1px solid #fed7aa', color: '#c2410c', fontWeight: 800 }}>
                        {isNe ? toNp(quinaryDigits[3]) : quinaryDigits[3]}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Quinary Result Box */}
              <div style={{ background: '#fff7ed', padding: 16, borderRadius: 12, border: '1.5px solid #fdba74' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>
                  {L('पञ्चआधार सङ्ख्या र दशमलव मान:', 'Quinary Number & Decimal Value:')}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#c2410c', marginTop: 4 }}>
                  {quinaryDigits.join('')}₅ = {isNe ? toNp(quinaryValue) : quinaryValue}₁₀
                </div>
                <div style={{ fontSize: 13, color: '#7c2d12', marginTop: 6 }}>
                  = ({quinaryDigits[0]} × 125) + ({quinaryDigits[1]} × 25) + ({quinaryDigits[2]} × 5) + ({quinaryDigits[3]} × 1) = {quinaryValue}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Compare Number Systems */}
        {activeTab === 'compare' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} />
              {L('सङ्ख्या पद्धतिहरूको प्रत्यक्ष तुलना तालिम (Comparison Studio)', 'Number Systems Comparative Table')}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#475569' }}>
              {L(
                'पाठ्यपुस्तकका प्रमुख सङ्ख्याहरूलाई दशमलव, द्विआधार र पञ्चआधारमा तुलना गरेर हेर्नुहोस्:',
                'Compare textbook quantities side-by-side in Decimal, Binary, and Quinary systems:'
              )}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 16 }}>
              {[1, 5, 10, 15, 20, 25, 37, 50, 69, 100].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedCompDec(num)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: selectedCompDec === num ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: selectedCompDec === num ? '#e0f2fe' : '#ffffff',
                    color: selectedCompDec === num ? '#0369a1' : '#334155',
                  }}
                >
                  {isNe ? toNp(num) : num}₁₀
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 12, border: '1.5px solid #bae6fd', textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0284c7' }}>{L('दशमलव (Decimal)', 'Decimal (Base 10)')}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#0369a1', marginTop: 6 }}>
                  {isNe ? toNp(selectedCompDec) : selectedCompDec}₁₀
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{L('आधार 10', 'Base 10')}</div>
              </div>

              <div style={{ background: '#ecfdf5', padding: 16, borderRadius: 12, border: '1.5px solid #a7f3d0', textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>{L('द्विआधार (Binary)', 'Binary (Base 2)')}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#047857', marginTop: 6 }}>
                  {toBinaryString(selectedCompDec)}₂
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{L('आधार 2', 'Base 2')}</div>
              </div>

              <div style={{ background: '#fff7ed', padding: 16, borderRadius: 12, border: '1.5px solid #fed7aa', textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}>{L('पञ्चआधार (Quinary)', 'Quinary (Base 5)')}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#c2410c', marginTop: 6 }}>
                  {toQuinaryString(selectedCompDec)}₅
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{L('आधार 5', 'Base 5')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default NumberSystemDiscoveryPlayground;
