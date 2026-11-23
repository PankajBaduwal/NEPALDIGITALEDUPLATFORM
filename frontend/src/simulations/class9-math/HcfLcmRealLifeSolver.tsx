import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface Scenario {
  id: string;
  titleNp: string;
  titleEn: string;
  type: 'HCF' | 'LCM';
  storyNp: string;
  storyEn: string;
  defaultVal1: number;
  defaultVal2: number;
  unitNp: string;
  unitEn: string;
  questionNp: string;
  questionEn: string;
  calculate: (v1: number, v2: number) => {
    ans: number;
    factors1: number[];
    factors2: number[];
    common: number[];
    extraCalcNp?: string;
    extraCalcEn?: string;
  };
}

const gcd = (a: number, b: number): number => (!b ? a : gcd(b, a % b));
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

const getPrimeFactors = (n: number): number[] => {
  const factors: number[] = [];
  let d = 2;
  let temp = n;
  while (temp >= 2) {
    if (temp % d === 0) {
      factors.push(d);
      temp /= d;
    } else {
      d++;
    }
  }
  return factors;
};

const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    titleNp: 'कोठामा सबैभन्दा ठूलो वर्गाकार टायल बिछ्याउने (Tiling Floor)',
    titleEn: 'Paving Floor with Largest Square Tiles',
    type: 'HCF',
    storyNp:
      'एउटा आयताकार कोठाको लम्बाइ र चौडाइ नापिएको छ। नटुक्र्याईकन कोठामा बिछ्याउन सकिने सबैभन्दा ठूलो वर्गाकार टायलको भुजा र आवश्यक टायलको संख्या पत्ता लगाउनुहोस्।',
    storyEn:
      'A rectangular room has given length and breadth. Find the side length of the largest square tile that fits without cutting, and the total tiles required.',
    defaultVal1: 18,
    defaultVal2: 12,
    unitNp: 'मिटर (m)',
    unitEn: 'meters (m)',
    questionNp: 'सबैभन्दा ठूलो टायलको भुजा (म.स.) कति हुन्छ?',
    questionEn: 'What is the side of the largest square tile (HCF)?',
    calculate: (l, b) => {
      const h = gcd(l, b);
      const totalTiles = (l * b) / (h * h);
      return {
        ans: h,
        factors1: getPrimeFactors(l),
        factors2: getPrimeFactors(b),
        common: getPrimeFactors(h),
        extraCalcNp: `कुल टायल संख्या = (लम्बाइ × चौडाइ) ÷ (टायलको क्षेत्रफल) = (${toNp(l)} × ${toNp(b)}) ÷ (${toNp(h)} × ${toNp(h)}) = ${toNp(totalTiles)} वटा`,
        extraCalcEn: `Total tiles = (Area of floor) ÷ (Area of 1 tile) = (${l} × ${b}) ÷ (${h} × ${h}) = ${totalTiles} tiles`,
      };
    },
  },
  {
    id: 's2',
    titleNp: 'घण्टीहरू एकैसाथ बज्ने समय (Synchronized Bells)',
    titleEn: 'Simultaneous Ringing of School Bells',
    type: 'LCM',
    storyNp:
      'विद्यालयमा दुईवटा घण्टीहरू निश्चित समयान्तरमा बज्छन्। यदि तिनीहरू बिहान १०:०० बजे एकसाथ बजेका थिए भने, अब कति समयपछि पुनः एकैसाथ बज्नेछन्?',
    storyEn:
      'Two school bells ring at regular intervals. If they rang together at 10:00 AM, after how many minutes will they ring together again?',
    defaultVal1: 12,
    defaultVal2: 18,
    unitNp: 'मिनेट (mins)',
    unitEn: 'minutes (mins)',
    questionNp: 'पुनः एकैसाथ बज्न लाग्ने न्यूनतम समय (ल.स.) कति हो?',
    questionEn: 'Minimum time interval to ring together again (LCM)?',
    calculate: (t1, t2) => {
      const l = lcm(t1, t2);
      return {
        ans: l,
        factors1: getPrimeFactors(t1),
        factors2: getPrimeFactors(t2),
        common: getPrimeFactors(gcd(t1, t2)),
        extraCalcNp: `घण्टी १ ले ${toNp(l / t1)} फन्को र घण्टी २ ले ${toNp(l / t2)} फन्को पूरा गर्दा दुवै एकैसाथ बज्नेछन्।`,
        extraCalcEn: `Bell 1 completes ${l / t1} cycles and Bell 2 completes ${l / t2} cycles at the simultaneous ringing moment.`,
      };
    },
  },
  {
    id: 's3',
    titleNp: 'फलफूल बराबर प्याकेटमा बाँड्ने (Equal Distribution)',
    titleEn: 'Equally Distributing Fruits into Maximum Gift Packs',
    type: 'HCF',
    storyNp:
      'कुनै कार्यक्रममा स्याउ र सुन्तलालाई सबैभन्दा धेरै प्याकेटमा समान संख्यामा बाँड्नु छ, ताकि कुनै पनि फल बाँकी नरहोस्। अधिकतम कति प्याकेट बनाउन सकिन्छ?',
    storyEn:
      'Apples and oranges are to be packed into the maximum number of identical gift packs without leaving any fruit behind. How many packets can be made?',
    defaultVal1: 24,
    defaultVal2: 36,
    unitNp: 'वटा (items)',
    unitEn: 'items',
    questionNp: 'बनाउन सकिने अधिकतम प्याकेट संख्या (म.स.) कति हो?',
    questionEn: 'Maximum number of identical gift packs (HCF)?',
    calculate: (v1, v2) => {
      const h = gcd(v1, v2);
      return {
        ans: h,
        factors1: getPrimeFactors(v1),
        factors2: getPrimeFactors(v2),
        common: getPrimeFactors(h),
        extraCalcNp: `प्रत्येक प्याकेटमा: स्याउ = ${toNp(v1 / h)} वटा, सुन्तला = ${toNp(v2 / h)} वटा हुनेछन्।`,
        extraCalcEn: `In each pack: Apples = ${v1 / h}, Oranges = ${v2 / h}.`,
      };
    },
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'कुनै वस्तुलाई टुक्र्याएर अधिकतम ठूलो वा बराबर भाग बनाउन कुन विधि प्रयोग गरिन्छ?',
    en: 'Which method is used when dividing into maximum equal or largest possible pieces?',
    options: [
      { key: 'A', label: 'महत्तम समापवर्तक (HCF)' },
      { key: 'B', label: 'लघुत्तम समापवर्त्य (LCM)' },
      { key: 'C', label: 'साधारण जोड' },
      { key: 'D', label: 'वर्गमूल' },
    ],
    answer: 'A',
  },
  {
    np: 'विभिन्न समयमा दोहोरिने घटनाहरू एकैसाथ फेरि कहिले हुन्छन् भनी पत्ता लगाउन कुन प्रयोग गरिन्छ?',
    en: 'To find when recurring events at different intervals happen together again, which is used?',
    options: [
      { key: 'A', label: 'लघुत्तम समापवर्त्य (LCM)' },
      { key: 'B', label: 'महत्तम समापवर्तक (HCF)' },
      { key: 'C', label: 'गुणनफल मात्र' },
      { key: 'D', label: 'अन्तर' },
    ],
    answer: 'A',
  },
  {
    np: '१२ सेमी र १८ सेमी नाप भएका दुई डोरीहरूलाई बराबर लम्बाइका सबैभन्दा लामा टुक्रा पार्दा एउटा टुक्राको लम्बाइ कति हुन्छ?',
    en: 'What is the length of the longest equal pieces that 12cm and 18cm ropes can be cut into?',
    options: [
      { key: 'A', label: '६ सेमी (HCF of 12 and 18)' },
      { key: 'B', label: '३६ सेमी' },
      { key: 'C', label: '२ सेमी' },
      { key: 'D', label: '३ सेमी' },
    ],
    answer: 'A',
  },
];

export const HcfLcmRealLifeSolver: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U10-03',
    chapter: 10,
    titleNp: 'म.स. र ल.स. व्यावहारिक समस्या समाधानकर्ता',
    titleEn: 'HCF and LCM Real-Life Problem Solver',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeScenarioId, setActiveScenarioId] = useState<string>('s1');
  const scenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  const [val1, setVal1] = useState<number>(scenario.defaultVal1);
  const [val2, setVal2] = useState<number>(scenario.defaultVal2);

  const result = scenario.calculate(val1, val2);

  const switchScenario = (s: Scenario) => {
    setActiveScenarioId(s.id);
    setVal1(s.defaultVal1);
    setVal2(s.defaultVal2);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! दैनिक जीवनमा टायल बिछ्याउने, घण्टी एकैसाथ बज्ने वा सामान बाँड्ने जस्ता समस्याहरूमा म.स. (HCF) र ल.स. (LCM) कसरी प्रयोग गर्ने, यहाँ प्रत्यक्ष सिकौं!',
        'Hello! Explore how HCF and LCM solve real-world problems like tiling floors, synchronizing alarms, and dividing packages equally!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Scenario Selectors */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => switchScenario(s)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: activeScenarioId === s.id ? '2px solid #D97706' : '1px solid #CBD5E1',
                backgroundColor: activeScenarioId === s.id ? '#FFFBEB' : '#FFFFFF',
                color: activeScenarioId === s.id ? '#B45309' : '#475569',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: isNe ? FONT_NP : 'inherit',
                fontSize: 13,
              }}
            >
              {s.type === 'HCF' ? '📐' : '⏱️'} {L(s.titleNp, s.titleEn)}
            </button>
          ))}
        </div>

        {/* Story & Problem Setup Card */}
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
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: 6,
                backgroundColor: scenario.type === 'HCF' ? '#ECFDF5' : '#EFF6FF',
                color: scenario.type === 'HCF' ? '#065F46' : '#1D4ED8',
              }}
            >
              {scenario.type === 'HCF'
                ? L('महत्तम समापवर्तक (HCF) आवश्यक', 'HCF Problem Required')
                : L('लघुत्तम समापवर्त्य (LCM) आवश्यक', 'LCM Problem Required')}
            </span>
            <span style={{ fontSize: 13, color: '#64748B' }}>
              {L('एकाइ:', 'Unit:')} <strong>{L(scenario.unitNp, scenario.unitEn)}</strong>
            </span>
          </div>

          <div style={{ fontSize: 14, color: '#1E293B', lineHeight: 1.5 }}>
            {L(scenario.storyNp, scenario.storyEn)}
          </div>

          {/* Interactive Sliders for Input Values */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              backgroundColor: '#F8FAFC',
              padding: 14,
              borderRadius: 8,
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                <span>{L('पहिलो नाप / संख्या (Value 1):', 'First Value:')}</span>
                <strong>{fmt(val1)} {L(scenario.unitNp, scenario.unitEn)}</strong>
              </div>
              <input
                type="range"
                min={6}
                max={48}
                step={2}
                value={val1}
                onChange={(e) => setVal1(Number(e.target.value))}
                style={{ width: '100%', marginTop: 6, accentColor: '#D97706' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                <span>{L('दोस्रो नाप / संख्या (Value 2):', 'Second Value:')}</span>
                <strong>{fmt(val2)} {L(scenario.unitNp, scenario.unitEn)}</strong>
              </div>
              <input
                type="range"
                min={6}
                max={48}
                step={2}
                value={val2}
                onChange={(e) => setVal2(Number(e.target.value))}
                style={{ width: '100%', marginTop: 6, accentColor: '#D97706' }}
              />
            </div>
          </div>
        </div>

        {/* Prime Factorization & Calculation Breakdown */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1fr)',
            gap: 16,
          }}
        >
          {/* Prime Factors */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <strong style={{ fontSize: 13, color: '#1E293B' }}>
              {L('रूढ गुणनखण्ड विधि (Prime Factorization):', 'Prime Factorization Process:')}
            </strong>
            <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#334155' }}>
              {fmt(val1)} = {result.factors1.map((f) => fmt(f)).join(' × ')}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#334155' }}>
              {fmt(val2)} = {result.factors2.map((f) => fmt(f)).join(' × ')}
            </div>
            <div style={{ borderBottom: '1px solid #E2E8F0', margin: '4px 0' }} />
            <div style={{ fontSize: 13, color: '#0F766E', fontWeight: 700 }}>
              {L('साझा रूढ गुणनखण्डहरू (Common Primes):', 'Common Prime Factors:')}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#0F766E' }}>
              {result.common.length > 0
                ? result.common.map((f) => fmt(f)).join(' × ')
                : L('कुनै छैन (१)', 'None (1)')}
            </div>
          </div>

          {/* Solution & Meaning in Context */}
          <div
            style={{
              backgroundColor: scenario.type === 'HCF' ? '#F0FDF4' : '#EFF6FF',
              borderRadius: 12,
              border: scenario.type === 'HCF' ? '2px solid #86EFAC' : '2px solid #93C5FD',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
              {L(scenario.questionNp, scenario.questionEn)}
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 22,
                fontWeight: 800,
                color: scenario.type === 'HCF' ? '#065F46' : '#1E40AF',
              }}
            >
              {scenario.type} = {fmt(result.ans)} {L(scenario.unitNp, scenario.unitEn)}
            </div>
            {result.extraCalcNp && (
              <div
                style={{
                  fontSize: 12,
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  lineHeight: 1.5,
                }}
              >
                {L(result.extraCalcNp, result.extraCalcEn || '')}
              </div>
            )}
          </div>
        </div>

        {/* Practical Rule Card: HCF vs LCM Decision Helper */}
        <div
          style={{
            backgroundColor: '#F1F5F9',
            borderRadius: 10,
            padding: 12,
            fontSize: 12,
            color: '#475569',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          <div>
            <strong style={{ color: '#047857' }}>📌 {L('कहिले HCF (म.स.) प्रयोग गर्ने?', 'When to use HCF?')}</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              {L(
                'जब वस्तुहरूलाई नटुक्र्याई बराबर अधिकतम भागमा बाँड्नुपर्छ, सबैभन्दा ठूलो नाप वा टायल निकाल्नुपर्छ।',
                'When splitting things into maximum equal pieces or finding the largest common measure without remainder.'
              )}
            </p>
          </div>
          <div>
            <strong style={{ color: '#1D4ED8' }}>📌 {L('कहिले LCM (ल.स.) प्रयोग गर्ने?', 'When to use LCM?')}</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              {L(
                'जब भिन्न समयमा दोहोरिने घटनाहरू फेरि न्यूनतम कति समयपछि एकसाथ घट्छन् भनी निकाल्नुपर्छ।',
                'When finding when multiple repeating events of different periodicities will occur simultaneously again.'
              )}
            </p>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default HcfLcmRealLifeSolver;
