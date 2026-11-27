/**
 * IntegerApplicationChallenge.tsx
 * Grade 7 Mathematics – Lesson 3: INTEGER (पूर्णाङ्क)
 * Simulation 4: Integer Application and Simplification Challenge (2D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 64-66)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Check, Sparkles, HelpCircle, ArrowRight, RotateCcw, Wallet, Droplets, Trophy } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एउटा हाजिरीजवाफ प्रतियोगितामा सही उत्तरको +५ र गलत उत्तरको -२ अंक दिइन्छ। कुनै विद्यार्थीले ८ वटा सही र ३ वटा गलत उत्तर दिए कुल अंक कति हुन्छ?',
    en: 'In a quiz, correct gets +5 and wrong gets -2. If a student answers 8 correct and 3 wrong, what is the total score?',
    options: [
      { key: 'A', label: '३४ अंक (८×५ - ३×२ = ४० - ६ = ३४)' },
      { key: 'B', label: '४० अंक' },
      { key: 'C', label: '२६ अंक' },
      { key: 'D', label: '४६ अंक' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा ट्यांकीमा ५०० लिटर पानी छ। धारा A ले प्रतिमिनेट २५ लिटर भर्छ र धारा B ले प्रतिमिनेट १५ लिटर निकाल्छ। ६ मिनेटपछि ट्यांकीमा कति पानी रहन्छ?',
    en: 'A tank has 500 L. Tap A fills 25 L/min and Tap B drains 15 L/min. How much water is in the tank after 6 minutes?',
    options: [
      { key: 'A', label: '५०० लिटर' },
      { key: 'B', label: '५६० लिटर (५०० + १५० - ९०)' },
      { key: 'C', label: '६०० लिटर' },
      { key: 'D', label: '४४० लिटर' },
    ],
    answer: 'B',
  },
  {
    np: 'बैंक खातामा रु. ५,००० मौज्दात थियो। रु. २,००० जम्मा गरी रु. ३,५०० को बिल भुक्तानी गर्दा बाँकी कति हुन्छ?',
    en: 'A bank balance had Rs 5,000. Depositing Rs 2,000 and paying a bill of Rs 3,500 leaves what balance?',
    options: [
      { key: 'A', label: 'रु. ३,५००' },
      { key: 'B', label: 'रु. ५,०००' },
      { key: 'C', label: 'रु. ६,५००' },
      { key: 'D', label: 'रु. ३,०००' },
    ],
    answer: 'A',
  },
  {
    np: '(-३०) - (-४०) - (-२०) + (+२) को मान कति हुन्छ?',
    en: 'What is the value of (-30) - (-40) - (-20) + (+2)?',
    options: [
      { key: 'A', label: '+३२ (-३० + ४० + २० + २ = ३२)' },
      { key: 'B', label: '-३२' },
      { key: 'C', label: '+१०' },
      { key: 'D', label: '-८८' },
    ],
    answer: 'A',
  },
];

export const IntegerApplicationChallenge: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L3-04',
    titleEn: 'Integer Application & Simplification',
    titleNp: 'पूर्णाङ्कको व्यवहारिक प्रयोग र सरलीकरण',
    chapter: 3,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'quiz_contest' | 'bank' | 'tank' | 'simplify'>('quiz_contest');

  // ── Tab 1: Quiz Contest State ────────────────────────────────
  const [correctCount, setCorrectCount] = useState<number>(8);
  const [wrongCount, setWrongCount] = useState<number>(3);
  const quizScore = correctCount * 5 - wrongCount * 2;

  // ── Tab 2: Bank Account State ────────────────────────────────
  const [initialBal, setInitialBal] = useState<number>(5000);
  const [deposit, setDeposit] = useState<number>(2000);
  const [withdrawal, setWithdrawal] = useState<number>(3500);
  const finalBalance = initialBal + deposit - withdrawal;

  // ── Tab 3: Water Tank State ──────────────────────────────────
  const [tankMinutes, setTankMinutes] = useState<number>(6);
  const initialWater = 500;
  const inFlowRate = 25; // L/min
  const outFlowRate = 15; // L/min
  const totalWater = initialWater + (inFlowRate - outFlowRate) * tankMinutes;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'हाम्रो दैनिक जीवनमा पूर्णाङ्कको ठूलो प्रयोग हुन्छ: बैंक कारोबार, नाफा-नोक्सान, हाजिरीजवाफ र तापक्रम नापमा!',
        'Integers solve real-life problems: quiz scores (+/- marks), bank credits/debits, and water flow calculations!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'quiz_contest', np: '१. हाजिरीजवाफ अंक गणना (+५ / -२)', en: '1. Quiz Contest Score' },
            { id: 'bank', np: '२. बैंक खाता कारोबार (+ / -)', en: '2. Bank Account Ledger' },
            { id: 'tank', np: '३. पानी ट्यांकी भर्ने/निकाल्ने', en: '3. Water Tank Flow' },
            { id: 'simplify', np: '४. कोष्ठक र चिन्ह सरलीकरण (BODMAS)', en: '4. Integer Simplification' },
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

        {/* ── TAB 1: QUIZ CONTEST SCORE ────────────────────── */}
        {activeTab === 'quiz_contest' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0F766E', textTransform: 'uppercase', marginBottom: 4 }}>
                🏆 {L('पाठ्यपुस्तक व्यवहारिक उदाहरण (पृष्ठ ६४)', 'Textbook Quiz Problem (Page 64)')}
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#134E4A' }}>
                {L('नियम: सही उत्तरमा +५ अंक र गलत उत्तरमा -२ अंक प्राप्त हुन्छ।', 'Rules: Correct answer gets +5 marks, incorrect gets -2 marks.')}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#DCFCE7', padding: 18, borderRadius: 14, border: '1px solid #86EFAC' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 6 }}>
                  {L('सही उत्तरहरूको सङ्ख्या (Correct):', 'Correct Answers:')} <strong>{isNe ? toNp(correctCount) : correctCount}</strong>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setCorrectCount(Math.max(0, correctCount - 1))} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}>-</button>
                  <button onClick={() => setCorrectCount(correctCount + 1)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ fontSize: 12, color: '#15803D', marginTop: 8 }}>
                  अंक = {isNe ? toNp(correctCount) : correctCount} × (+५) = <strong>+{isNe ? toNp(correctCount * 5) : correctCount * 5}</strong>
                </div>
              </div>

              <div style={{ background: '#FEE2E2', padding: 18, borderRadius: 14, border: '1px solid #FCA5A5' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#991B1B', marginBottom: 6 }}>
                  {L('गलत उत्तरहरूको सङ्ख्या (Wrong):', 'Wrong Answers:')} <strong>{isNe ? toNp(wrongCount) : wrongCount}</strong>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setWrongCount(Math.max(0, wrongCount - 1))} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}>-</button>
                  <button onClick={() => setWrongCount(wrongCount + 1)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 8 }}>
                  अंक = {isNe ? toNp(wrongCount) : wrongCount} × (-२) = <strong>-{isNe ? toNp(wrongCount * 2) : wrongCount * 2}</strong>
                </div>
              </div>
            </div>

            {/* Total score banner */}
            <div style={{ background: '#F8FAFC', border: '2px solid #E2E8F0', padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#64748B', marginBottom: 4 }}>
                {L('कुल प्राप्त अंक (Total Score):', 'Total Score:')}
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0F766E' }}>
                (+{isNe ? toNp(correctCount * 5) : correctCount * 5}) + (-{isNe ? toNp(wrongCount * 2) : wrongCount * 2}) = <strong>{isNe ? toNp(quizScore) : quizScore} {L('अंक', 'marks')}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: BANK ACCOUNT LEDGER ───────────────────── */}
        {activeTab === 'bank' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण: बैंक मौज्दात', 'Textbook Example: Bank Balance')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('जम्मा (Credit: +) र भुक्तानी (Debit: -) हिसाब', 'Credits (+) and Debits (-) Calculation')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>सुरुवाती मौज्दात (Initial)</span>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>रु. {isNe ? toNp(initialBal) : initialBal}</div>
              </div>

              <div style={{ background: '#DCFCE7', padding: 16, borderRadius: 14, border: '1px solid #86EFAC' }}>
                <span style={{ fontSize: 12, color: '#166534' }}>थप जम्मा (Deposit: +)</span>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#14532D', marginTop: 4 }}>+ रु. {isNe ? toNp(deposit) : deposit}</div>
              </div>

              <div style={{ background: '#FEE2E2', padding: 16, borderRadius: 14, border: '1px solid #FCA5A5' }}>
                <span style={{ fontSize: 12, color: '#991B1B' }}>बिल भुक्तानी (Payment: -)</span>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#7F1D1D', marginTop: 4 }}>- रु. {isNe ? toNp(withdrawal) : withdrawal}</div>
              </div>
            </div>

            <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 18, borderRadius: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#166534' }}>
                अन्तिम मौज्दात = ५००० + २००० - ३५०० = <strong>रु. {isNe ? toNp(finalBalance) : finalBalance}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: WATER TANK FLOW ───────────────────────── */}
        {activeTab === 'tank' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ background: '#EFF6FF', border: '2px solid #3B82F6', borderRadius: 16, padding: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', marginBottom: 4 }}>
                💧 {L('पाठ्यपुस्तक पानी ट्यांकी समस्या (पृष्ठ ६४)', 'Textbook Water Tank Problem (Page 64)')}
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#1E40AF' }}>
                "{L('सुरुमा ट्यांकीमा ५०० लिटर पानी थियो। धारा A ले प्रतिमिनेट २५ लिटर भर्छ र धारा B ले प्रतिमिनेट १५ लिटर निकाल्छ। ६ मिनेटपछि कति पानी रहन्छ?', 'Tank initially has 500 L. Tap A fills 25 L/min and Tap B drains 15 L/min. Find the water after 6 minutes.')}"
              </h3>
            </div>

            <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 8 }}>
                {L('धारा खुला राखिएको समय (Minutes):', 'Duration taps are open:')} <strong>{isNe ? toNp(tankMinutes) : tankMinutes} {L('मिनेट', 'min')}</strong>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[2, 4, 6, 8, 10].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      kit.tap();
                      setTankMinutes(m);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      border: tankMinutes === m ? '2px solid #0F766E' : '1px solid #CBD5E1',
                      background: tankMinutes === m ? '#F0FDFA' : '#FFFFFF',
                      color: tankMinutes === m ? '#0F766E' : '#334155',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {isNe ? toNp(m) : m} {L('मिनेट', 'min')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 18, borderRadius: 14 }}>
              <div style={{ fontSize: 14, color: '#1E293B', lineHeight: 1.8 }}>
                <div>• सुरुवाती पानी = ५०० लिटर</div>
                <div>• भरिएको पानी = २५ × {isNe ? toNp(tankMinutes) : tankMinutes} = +{isNe ? toNp(inFlowRate * tankMinutes) : inFlowRate * tankMinutes} लिटर</div>
                <div>• निकालिएको पानी = १५ × {isNe ? toNp(tankMinutes) : tankMinutes} = -{isNe ? toNp(outFlowRate * tankMinutes) : outFlowRate * tankMinutes} लिटर</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F766E', marginTop: 8 }}>
                  अन्तिम परिमाण = ५०० + {isNe ? toNp(inFlowRate * tankMinutes) : inFlowRate * tankMinutes} - {isNe ? toNp(outFlowRate * tankMinutes) : outFlowRate * tankMinutes} = <strong>{isNe ? toNp(totalWater) : totalWater} लिटर</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: INTEGER SIMPLIFICATION (BODMAS) ───────── */}
        {activeTab === 'simplify' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक अभ्यास (पृष्ठ ६५)', 'Textbook Simplification (Page 65)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('चिन्ह र कोष्ठकयुक्त पूर्णाङ्कको सरलीकरण (Step-by-step Simplification)', 'Step-by-Step Integer Simplification')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 10 }}>
                उदाहरण: (-३०) - (-४०) - (-२०) + (+२)
              </div>
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.8 }}>
                <div>चरण १: दोहोरो चिन्ह हटाउँदा: - (-४०) = +४०, - (-२०) = +२०</div>
                <div>= -३० + ४० + २० + २</div>
                <div>चरण २: धनात्मक सङ्ख्याहरू जोड्दा: ४० + २० + २ = ६२</div>
                <div>= -३० + ६२</div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#166534', marginTop: 6 }}>
                  = <strong>+३२</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default IntegerApplicationChallenge;
