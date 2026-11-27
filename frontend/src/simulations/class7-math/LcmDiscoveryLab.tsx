/**
 * LcmDiscoveryLab.tsx
 * Grade 7 Mathematics – Lesson 2: WHOLE NUMBER
 * Simulation 5: LCM Discovery and Real-Life Challenge (2D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 37-44)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Check, Bell, Clock, ArrowRight, RotateCcw, Ruler, Users, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दुई वा दुईभन्दा बढी सङ्ख्याहरूले निःशेष भाग जाने सबैभन्दा सानो साझा सङ्ख्यालाई के भनिन्छ?',
    en: 'What is the smallest positive number exactly divisible by two or more numbers?',
    options: [
      { key: 'A', label: 'Highest common factor (HCF)' },
      { key: 'B', label: 'Lowest common multiple (LCM)' },
      { key: 'C', label: 'Square root' },
      { key: 'D', label: 'Prime number' },
    ],
    answer: 'B',
  },
  {
    np: '10 cm, 20 cm र 30 cm लम्बाइ भएका तीनpcs छडहरूले पुरै नाप्न सकिने सबैभन्दा छोटो दुरी कति हो?',
    en: 'What is the shortest distance that can be measured exactly by three rods of 10 cm, 20 cm, and 30 cm?',
    options: [
      { key: 'A', label: '30 cm' },
      { key: 'B', label: '50 cm' },
      { key: 'C', label: '60 cm (LCM = 60)' },
      { key: 'D', label: '100 cm' },
    ],
    answer: 'C',
  },
  {
    np: '45 min र 60 minको फरकमा बज्ने दुईpcs घण्टीहरू बिहान 10:00 बजे एकैसाथ बजे भने पुनः कति बजे एकैसाथ बज्नेछन्?',
    en: 'If two bells ring at intervals of 45 min and 60 min and ring together at 10:00 AM, at what time will they ring together next?',
    options: [
      { key: 'A', label: '11:45' },
      { key: 'B', label: '12:00' },
      { key: 'C', label: '1:00 PM (after 3 hours)' },
      { key: 'D', label: '2:00 PM' },
    ],
    answer: 'C',
  },
  {
    np: '18, 24 र 36 को ल.स. (LCM) को मान कति हुन्छ? (2³ × 3² = 8 × 9)',
    en: 'What is the LCM of 18, 24, and 36? (2³ × 3² = 8 × 9)',
    options: [
      { key: 'A', label: '36' },
      { key: 'B', label: '48' },
      { key: 'C', label: '72' },
      { key: 'D', label: '144' },
    ],
    answer: 'C',
  },
];

export const LcmDiscoveryLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L2-05',
    titleEn: 'LCM Discovery and Real-Life Challenge',
    titleNp: 'लघुत्तम समापवर्त्य (ल.स.) खोजी प्रयोगशाला',
    chapter: 2,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'multiples' | 'rods' | 'bells' | 'grouping' | 'prime_lcm'>('multiples');

  // ── Tab 1: Multiples of 6 and 8 ──────────────────────────────
  const multiplesOf6 = [6, 12, 18, 24, 30, 36, 42, 48, 54, 60];
  const multiplesOf8 = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80];
  const commonMultiples = multiplesOf6.filter((m) => multiplesOf8.includes(m));

  // ── Tab 5: Bell Ringing Challenge ────────────────────────────
  const [bellIntervalA, setBellIntervalA] = useState<number>(45);
  const [bellIntervalB, setBellIntervalB] = useState<number>(60);
  const bellLcmMinutes = 180; // for 45 & 60

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'Lowest common multiple (LCM) भनेको सबैभन्दा सानो साझा गुणनफल हो। घण्टी बज्ने, चक्र पूरा हुने, र समूह विभाजनमा यसको ठूलो महत्व हुन्छ!',
        'Lowest Common Multiple (LCM) is the smallest common multiple. Explore how it solves time intervals, rod lengths, and grouping problems!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'multiples', np: '1. साझा अपवर्त्य सूची विधि', en: '1. Multiples Listing' },
            { id: 'rods', np: '2. छड र लम्बाइ नाप (10, 20, 30 cm)', en: '2. Rod Length Explorer' },
            { id: 'bells', np: '3. घण्टी बज्ने समय चक्र (45 र 60 मि)', en: '3. Bell Ringing Cycle' },
            { id: 'grouping', np: '4. विद्यार्थी समूह विभाजन (3, 5, 6)', en: '4. Student Grouping' },
            { id: 'prime_lcm', np: '5. अभाज्य गुणनखण्डबाट ल.स.', en: '5. LCM by Prime Factorisation' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                kit.tap();
                setActiveTab(tab.id as any);
              }}
              style={{
                flex: '1 1 auto',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? '#0F766E' : '#F8FAFC',
                color: activeTab === tab.id ? '#FFFFFF' : '#334155',
                transition: 'all 0.15s ease',
              }}
            >
              {isNe ? tab.np : tab.en}
            </button>
          ))}
        </div>

        {/* ── TAB 1: MULTIPLES LISTING ─────────────────────── */}
        {activeTab === 'multiples' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक पृष्ठ 37-38', 'Textbook Pages 37-38')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('6 र 8 का अपवर्त्यहरू (Multiples) बाट सबैभन्दा सानो साझा अपवर्त्य खोज्ने', 'Find LCM from Multiples of 6 and 8')}
            </h3>

            {/* Multiples of 6 */}
            <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B', marginBottom: 8 }}>
                6 {L('का अपवर्त्यहरू (Multiples of 6):', 'Multiples of 6:')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {multiplesOf6.map((m) => (
                  <span
                    key={m}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: commonMultiples.includes(m) ? '#DCFCE7' : '#FFFFFF',
                      border: commonMultiples.includes(m) ? (m === 24 ? '2px solid #0F766E' : '2px solid #16A34A') : '1px solid #CBD5E1',
                      fontWeight: 800,
                      fontSize: 14,
                      color: commonMultiples.includes(m) ? '#166534' : '#334155',
                    }}
                  >
                    {isNe ? toNp(m) : m}
                  </span>
                ))}
              </div>
            </div>

            {/* Multiples of 8 */}
            <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B', marginBottom: 8 }}>
                8 {L('का अपवर्त्यहरू (Multiples of 8):', 'Multiples of 8:')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {multiplesOf8.map((m) => (
                  <span
                    key={m}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: commonMultiples.includes(m) ? '#DCFCE7' : '#FFFFFF',
                      border: commonMultiples.includes(m) ? (m === 24 ? '2px solid #0F766E' : '2px solid #16A34A') : '1px solid #CBD5E1',
                      fontWeight: 800,
                      fontSize: 14,
                      color: commonMultiples.includes(m) ? '#166534' : '#334155',
                    }}
                  >
                    {isNe ? toNp(m) : m}
                  </span>
                ))}
              </div>
            </div>

            {/* LCM Result Card */}
            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F766E', marginBottom: 4 }}>
                {L('साझा अपवर्त्यहरू (Common Multiples):', 'Common Multiples:')} {'{ '}
                {commonMultiples.map((m) => (isNe ? toNp(m) : m)).join(', ')}, ... {' }'}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#14532D' }}>
                {L('सबैभन्दा सानो साझा अपवर्त्य (LCM / ल.स.) =', 'Lowest Common Multiple (LCM) =')} <strong style={{ color: '#0F766E' }}>{isNe ? '24' : '24'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: ROD LENGTH EXPLORER ───────────────────── */}
        {activeTab === 'rods' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक व्यवहारिक उदाहरण (पृष्ठ 37)', 'Textbook Practical Example (Page 37)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('10 cm, 20 cm र 30 cm लामा तीनpcs छडहरूले पुरै नाप्न सकिने सबैभन्दा छोटो दुरी', 'Shortest distance measured exactly by 10cm, 20cm, and 30cm rods')}
            </h3>

            {/* Visual Number Line / Track */}
            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0369A1', marginBottom: 6 }}>
                  10 cm rod (Ruler A):
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {[10, 20, 30, 40, 50, 60].map((v) => (
                    <span key={v} style={{ padding: '4px 10px', background: v === 60 ? '#DCFCE7' : '#E0F2FE', border: v === 60 ? '2px solid #16A34A' : '1px solid #BAE6FD', borderRadius: 6, fontWeight: 800, fontSize: 13 }}>
                      {isNe ? toNp(v) : v} cm
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#B45309', marginBottom: 6 }}>
                  20 cm rod (Ruler B):
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {[20, 40, 60].map((v) => (
                    <span key={v} style={{ padding: '4px 10px', background: v === 60 ? '#DCFCE7' : '#FEF3C7', border: v === 60 ? '2px solid #16A34A' : '1px solid #FDE68A', borderRadius: 6, fontWeight: 800, fontSize: 13 }}>
                      {isNe ? toNp(v) : v} cm
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#7E22CE', marginBottom: 6 }}>
                  30 cm rod (Ruler C):
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {[30, 60].map((v) => (
                    <span key={v} style={{ padding: '4px 10px', background: v === 60 ? '#DCFCE7' : '#F3E8FF', border: v === 60 ? '2px solid #16A34A' : '1px solid #E9D5FF', borderRadius: 6, fontWeight: 800, fontSize: 13 }}>
                      {isNe ? toNp(v) : v} cm
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Explanation Banner */}
            <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#166534', marginBottom: 6 }}>
                ✓ {L('तीनै छडहरूले पुरै नाप्ने साझा न्यूनतम लम्बाइ = 60 cm', 'Common shortest length measured by all three = 60 cm (LCM)')}
              </div>
              <div style={{ fontSize: 13, color: '#14532D', lineHeight: 1.5 }}>
                • 6 times 10 cm (10 × 6 = 60 cm)<br />
                • 3 times 20 cm (20 × 3 = 60 cm)<br />
                • 2 times 30 cm (30 × 2 = 60 cm)
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: BELL RINGING CYCLE ────────────────────── */}
        {activeTab === 'bells' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ background: '#EFF6FF', border: '2px solid #3B82F6', borderRadius: 16, padding: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', marginBottom: 4 }}>
                🔔 {L('पाठ्यपुस्तक घण्टी समस्या (पृष्ठ 40)', 'Textbook Bell Problem (Page 40)')}
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#1E40AF', lineHeight: 1.5 }}>
                "{L('दुईpcs घण्टीहरू क्रमशः 45 min र 60 minको अन्तरालमा बज्दछन्। बिहान 10:00 बजे ती दुवै एकसाथ बजेका थिए भने अब कति बजे फेरि एकसाथ बज्नेछन्?', 'Two bells ring at intervals of 45 and 60 minutes. If they rang together at 10:00 AM, at what time will they ring together next?')}"
              </h3>
            </div>

            {/* Timeline comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 8 }}>
                  🔔 {L('पहिलो घण्टी (हरेक 45 min):', 'First Bell (Every 45 min):')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  <span>10:00 AM</span>
                  <span>10:45 AM</span>
                  <span>11:30 AM</span>
                  <span>12:15 PM</span>
                  <span style={{ color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: 6 }}>1:00 PM</span>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#B45309', marginBottom: 8 }}>
                  🔔 {L('दोस्रो घण्टी (हरेक 60 min):', 'Second Bell (Every 60 min):')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  <span>10:00 AM</span>
                  <span>11:00 AM</span>
                  <span>12:00 PM</span>
                  <span style={{ color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: 6 }}>1:00 PM</span>
                </div>
              </div>
            </div>

            {/* Conclusion */}
            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 18, borderRadius: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F766E', marginBottom: 4 }}>
                {L('गणितीय हिसाब (Mathematical Calculation):', 'Mathematical Calculation:')}
              </div>
              <div style={{ fontSize: 15, color: '#1E293B', lineHeight: 1.6 }}>
                <div>• LCM(45, 60) = <strong>180 {L('min', 'minutes')} = 3 {L('घण्टा', 'hours')}</strong></div>
                <div>• 10:00 AM + 3 hours = <strong style={{ color: '#166534', fontSize: 17 }}>They will ring together again at 1:00 PM.</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: STUDENT GROUPING ──────────────────────── */}
        {activeTab === 'grouping' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक परियोजना समूह विभाजन (पृष्ठ 41)', 'Textbook Grouping Problem (Page 41)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('3, 5 र 6 जनाको समूहमा पुरै विभाजन गर्न सकिने विद्यार्थीहरूको न्यूनतम सङ्ख्या', 'Least number of students divisible into groups of 3, 5, and 6')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 20 }}>
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
                <div>• {L('3 जनाको समूह बनाउँदा:', 'In groups of 3:')} 30 ÷ 3 = 10 {L('समूहहरू', 'groups')}</div>
                <div>• {L('5 जनाको समूह बनाउँदा:', 'In groups of 5:')} 30 ÷ 5 = 6 {L('समूहहरू', 'groups')}</div>
                <div>• {L('6 जनाको समूह बनाउँदा:', 'In groups of 6:')} 30 ÷ 6 = 5 {L('समूहहरू', 'groups')}</div>
              </div>
            </div>

            <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 18, borderRadius: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#166534' }}>
                {L('न्यूनतम विद्यार्थी सङ्ख्या = LCM(3, 5, 6) = 30 जना', 'Least number of students = LCM(3, 5, 6) = 30 students')}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: PRIME FACTORISATION FOR LCM ───────────── */}
        {activeTab === 'prime_lcm' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण (पृष्ठ 39)', 'Textbook Example (Page 39)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('18, 24 र 36 को अभाज्य गुणनखण्ड विधिबाट ल.स. निकाल्ने', 'LCM of 18, 24, and 36 by Prime Factorisation (Highest Powers)')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>18 (18)</div>
                <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#334155' }}>= 2 × 3²</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>24 (24)</div>
                <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#334155' }}>= 2³ × 3</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>36 (36)</div>
                <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#334155' }}>= 2² × 3²</div>
              </div>
            </div>

            <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginBottom: 6 }}>
                {L('अभाज्य गुणनखण्डहरूको अधिकतम घाताङ्क (Highest powers of primes) लिँदा:', 'Taking highest powers of prime factors:')}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#14532D' }}>
                LCM = 2³ × 3² = 8 × 9 = <strong>{isNe ? '72' : '72'}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default LcmDiscoveryLab;
