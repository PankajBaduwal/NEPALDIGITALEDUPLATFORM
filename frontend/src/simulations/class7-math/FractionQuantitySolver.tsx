/**
 * FractionQuantitySolver.tsx
 * Grade 7 Mathematics – Lesson 5: FRACTION AND DECIMAL
 * Simulation 9: Fraction of a Quantity and Real-Life Problem Solver (2D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 81-83)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Wallet, Users, Clock, Sparkles, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'सिर्peopleको मासिक आम्दानी Rs. 24,000 छ। उनले 1/3 भाग शिक्षामा र 1/2 भाग खानामा खर्च गर्दा जम्मा कति खर्च हुन्छ?',
    en: 'Sirjana earns Rs 24,000. She spends 1/3 on education and 1/2 on food. What is her total expenditure?',
    options: [
      { key: 'A', label: 'Rs. 20,000 (8,000 + 12,000 = 20,000)' },
      { key: 'B', label: 'Rs. 16,000' },
      { key: 'C', label: 'Rs. 18,000' },
      { key: 'D', label: 'Rs. 22,000' },
    ],
    answer: 'A',
  },
  {
    np: 'एक कक्षामा 48 people विद्यार्थी छन्। तीमध्ये 2/3 भाग छात्र छन् भने छात्राको संख्या कति हुन्छ?',
    en: 'A class has 48 students. 2/3 are boys. How many girls are there?',
    options: [
      { key: 'A', label: '16 people (48 - 32 = 16)' },
      { key: 'B', label: '32 people' },
      { key: 'C', label: '24 people' },
      { key: 'D', label: '12 people' },
    ],
    answer: 'A',
  },
  {
    np: 'सिर्peopleको कुल खर्च Rs. 20,000 लाई आम्दानी Rs. 24,000 को भिन्नमा देखाउँदा कति हुन्छ?',
    en: 'Expressing total expenditure of Rs 20,000 as a fraction of Rs 24,000 gives:',
    options: [
      { key: 'A', label: '5/6 (20000/24000 = 5/6)' },
      { key: 'B', label: '1/6' },
      { key: 'C', label: '3/4' },
      { key: 'D', label: '4/5' },
    ],
    answer: 'A',
  },
  {
    np: 'विद्यालयको 6 घण्टे समयमा 1 घण्टा खाजा तथा विश्राममा बित्छ भने त्यसको भिन्न कति हुन्छ?',
    en: 'In a 6-hour school day, 1 hour is spent on lunch and break. What fraction is that?',
    options: [
      { key: 'A', label: '1/6' },
      { key: 'B', label: '1/2' },
      { key: 'C', label: '1/3' },
      { key: 'D', label: '5/6' },
    ],
    answer: 'A',
  },
];

export const FractionQuantitySolver: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L5-02',
    titleEn: 'Fraction of a Quantity & Word Problems',
    titleNp: 'परिमाणको भिन्न र व्यवहारिक समस्या समाधान',
    chapter: 5,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'income' | 'classroom' | 'remaining' | 'school_time'>('income');

  // Sirjana Income State
  const [totalIncome, setTotalIncome] = useState<number>(24000);
  const eduExpense = totalIncome * (1 / 3);
  const foodExpense = totalIncome * (1 / 2);
  const totalExpense = eduExpense + foodExpense;
  const savings = totalIncome - totalExpense;

  // Classroom Ratio State
  const totalStudents = 48;
  const boysCount = Math.round(totalStudents * (2 / 3)); // 32
  const girlsCount = totalStudents - boysCount; // 16

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'कुनै परिमाणको भिन्न निकाल्न दिइएको परिमाणलाई भिन्नले गुणन गरिन्छ (जस्तै 24,000 को 1/3 = 8,000)। बार मोडलबाट सजिलै बुझ्न सकिन्छ!',
        'To find a fraction of a quantity, multiply the quantity by the fraction (e.g. 1/3 of 24,000 = 8,000). The bar model visualizes it clearly!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'income', np: '1. सिर्peopleको आम्दानी र खर्च (Rs. 24,000)', en: '1. Sirjana Income & Expense' },
            { id: 'classroom', np: '2. कक्षाकोठा छात्र/छात्रा (48 people, 2/3 भाग)', en: '2. Classroom Bar Model (48)' },
            { id: 'remaining', np: '3. बाँकी परिमाणको भिन्न (Remaining Fraction)', en: '3. Remaining Fraction' },
            { id: 'school_time', np: '4. विद्यालय समय परियोpeople', en: '4. School Timetable Project' },
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

        {/* ── TAB 1: SIRJANA INCOME & EXPENSE ──────────────── */}
        {activeTab === 'income' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: 16, padding: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#B45309', textTransform: 'uppercase', marginBottom: 4 }}>
                💵 {L('पाठ्यपुस्तक व्यवहारिक समस्या (पृष्ठ 81)', 'Textbook Practical Problem (Page 81)')}
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#92400E', lineHeight: 1.5 }}>
                "{L('सिर्peopleको मासिक आम्दानी Rs. 24,000 छ। उनले आम्दानीको 1/3 भाग शिक्षामा र 1/2 भाग खानामा खर्च गर्छिन् भने जम्मा खर्च र बचत कति हुन्छ?', 'Sirjana earns Rs 24,000 monthly. She spends 1/3 on education and 1/2 on food. Find her total expenditure and savings.')}"
              </h3>
            </div>

            {/* Income Allocation Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>Monthly income</span>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>Rs. {isNe ? toNp(totalIncome) : totalIncome}</div>
              </div>

              <div style={{ background: '#EFF6FF', padding: 16, borderRadius: 14, border: '1px solid #93C5FD' }}>
                <span style={{ fontSize: 12, color: '#1E40AF' }}>Education spending (1/3)</span>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#1D4ED8', marginTop: 4 }}>Rs. {isNe ? toNp(eduExpense) : eduExpense}</div>
                <div style={{ fontSize: 11, color: '#3B82F6', marginTop: 2 }}>1/3 × 24000 = Rs. 8000</div>
              </div>

              <div style={{ background: '#FEF3C7', padding: 16, borderRadius: 14, border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: 12, color: '#92400E' }}>Food spending (1/2)</span>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#B45309', marginTop: 4 }}>Rs. {isNe ? toNp(foodExpense) : foodExpense}</div>
                <div style={{ fontSize: 11, color: '#D97706', marginTop: 2 }}>1/2 × 24000 = Rs. 12,000</div>
              </div>

              <div style={{ background: '#DCFCE7', padding: 16, borderRadius: 14, border: '1px solid #86EFAC' }}>
                <span style={{ fontSize: 12, color: '#166534' }}>Savings (1/6)</span>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#14532D', marginTop: 4 }}>Rs. {isNe ? toNp(savings) : savings}</div>
                <div style={{ fontSize: 11, color: '#15803D', marginTop: 2 }}>24,000 - 20,000 = Rs. 4000</div>
              </div>
            </div>

            {/* Visual Income Allocation Bar */}
            <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 8 }}>
                Share of the total income (6 equal parts / sixths):
              </div>
              <div style={{ display: 'flex', width: '100%', height: 38, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ flex: 2, background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 11, fontWeight: 800 }}>
                  Education (2/6 = 1/3)
                </div>
                <div style={{ flex: 3, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 11, fontWeight: 800 }}>
                  Food (3/6 = 1/2)
                </div>
                <div style={{ flex: 1, background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 11, fontWeight: 800 }}>
                  Savings (1/6)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: CLASSROOM RATIO (48 STUDENTS) ─────────── */}
        {activeTab === 'classroom' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक बार मोडल विधि (पृष्ठ 82)', 'Textbook Bar Model (Page 82)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('कक्षाका 48 विद्यार्थीमध्ये 2/3 भाग छात्र (बार मोडलबाट छात्रा पत्ता लगाउने)', 'Class of 48 Students: 2/3 are Boys (Finding Girls via Bar Model)')}
            </h3>

            {/* Model Drawing Bar (3 equal blocks) */}
            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B', marginBottom: 8 }}>
                Dividing the total 48 into 3 equal parts (48 ÷ 3 = 16 per part):
              </div>
              <div style={{ display: 'flex', width: '100%', height: 50, borderRadius: 10, overflow: 'hidden', border: '2px solid #0F766E' }}>
                <div style={{ flex: 1, background: '#3B82F6', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>
                  Boys (16)
                </div>
                <div style={{ flex: 1, background: '#3B82F6', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, borderLeft: '1px solid #FFF' }}>
                  Boys (16)
                </div>
                <div style={{ flex: 1, background: '#EC4899', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, borderLeft: '1px solid #FFF' }}>
                  Girls (16)
                </div>
              </div>
            </div>

            <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 18, borderRadius: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#166534' }}>
                • Number of boys = 2 parts = 2 × 16 = <strong>32 people (2/3 part)</strong><br />
                • Number of girls = 1 part = 1 × 16 = <strong>16 people (1/3 part)</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: REMAINING FRACTION ────────────────────── */}
        {activeTab === 'remaining' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('सुरुवाती परिमाणको भिन्न र बाँकीको भिन्न बीचको फरक', 'Fraction of Original vs. Fraction of Remaining Amount')}
            </h3>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 14, color: '#134E4A', lineHeight: 1.8 }}>
                <div>• Initial amount = 1 whole</div>
                <div>• First spending = 1/3 ⟹ remaining = 1 - 1/3 = <strong>2/3</strong></div>
                <div>• Now spending 1/2 of the remainder = 1/2 × 2/3 = <strong>1/3</strong> (compared with the start)</div>
                <div>• Final remainder = 2/3 - 1/3 = <strong>1/3</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: SCHOOL TIMETABLE PROJECT ──────────────── */}
        {activeTab === 'school_time' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक परियोpeople कार्य (पृष्ठ 83)', 'Textbook Project Work (Page 83)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('विद्यालयको 6 घण्टे समय तालिका र विभिन्न क्रियाकलापको भिन्न', 'School 6-Hour Timetable Time Share')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>Prayer/assembly (0.5 hours)</span>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0F766E', marginTop: 4 }}>= 1/12 part</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>Study (4.5 hours)</span>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0F766E', marginTop: 4 }}>= 9/12 = 3/4 part</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>Lunch/rest (1 hour)</span>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0F766E', marginTop: 4 }}>= 1/6 part</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default FractionQuantitySolver;
