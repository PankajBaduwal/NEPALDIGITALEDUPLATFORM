/**
 * RatioSharingSolver.tsx
 * Grade 8 Mathematics – Unit 4: RATIO AND PROPORTION
 * Simulation 9: Ratio Sharing and Real-Life Problem Solver
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 4)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Users, Banknote, Clock, Award, ArrowRight, Layers, Briefcase } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'Rs. 500 लाई 2:3 को अनुपातमा दुई व्यक्तिलाई बाँड्दा पहिलो and दोस्रोले कति-कति पाउँछन्?',
    en: 'Dividing Rs. 500 in the ratio 2:3 gives which shares?',
    options: [
      { key: 'A', label: 'Rs. 200 and Rs. 300 [ total parts 5, 1 part = 100 ⇒ 200 and 300 ]' },
      { key: 'B', label: 'Rs. 250 and Rs. 250' },
      { key: 'C', label: 'Rs. 150 and Rs. 350' },
      { key: 'D', label: 'Rs. 100 and Rs. 400' },
    ],
    answer: 'A',
  },
  {
    np: 'मोहम्मद and अब्दुलको लगानीको अनुपात 2:3 छ। यदि मोहम्मदको लगानी Rs. 2,00,000 भए अब्दुलको कति?',
    en: 'Mohammad and Abdul invested in ratio 2:3. If Mohammad invested Rs. 2,00,000, how much did Abdul invest?',
    options: [
      { key: 'A', label: 'Rs. 3,00,000 [ 2x = 2,00,000 ⇒ x = 1,00,000 ⇒ 3x = 3,00,000 ]' },
      { key: 'B', label: 'Rs. 4,00,000' },
      { key: 'C', label: 'Rs. 2,50,000' },
      { key: 'D', label: 'Rs. 1,50,000' },
    ],
    answer: 'A',
  },
  {
    np: 'बिशाल and धनियाँको हालको उमेरको अनुपात 4:5 छ। 4 वर्षपछि 5:6 हुन्छ भने बिशालको हालको उमेर कति वर्ष हो?',
    en: 'Present ages of Bishal and Dhaniya are in ratio 4:5. After 4 years, ratio becomes 5:6. What is Bishal\'s present age?',
    options: [
      { key: 'A', label: '16 years [ (4x+4)/(5x+4) = 5/6 ⇒ x = 4 ⇒ 4x = 16 years ]' },
      { key: 'B', label: '20 years' },
      { key: 'C', label: '12 years' },
      { key: 'D', label: '24 years' },
    ],
    answer: 'A',
  },
  {
    np: 'डोल्मा, रामबिलास and सोनामको आम्दानीको अनुपात 3:4:5 and जम्मा आम्दानी Rs. 24,00,000 भए सोनामको आम्दानी कति?',
    en: 'Incomes of Dolma, Rambilash, and Sonam are in ratio 3:4:5 with total Rs. 24,00,000. What is Sonam\'s share?',
    options: [
      { key: 'A', label: 'Rs. 10,00,000 [ total parts 12, 1 part = 2,00,000 ⇒ 5 parts = 10,00,000 ]' },
      { key: 'B', label: 'Rs. 8,00,000' },
      { key: 'C', label: 'Rs. 6,00,000' },
      { key: 'D', label: 'Rs. 12,00,000' },
    ],
    answer: 'A',
  },
  {
    np: 'तीन पद भएको अनुपात a:b:c मा कुनै परिमाण बाँड्दा जम्मा parts (Total Parts) कसरी निकालिन्छ?',
    en: 'In a three-part ratio a:b:c, how are total parts calculated?',
    options: [
      { key: 'A', label: 'Sum of all three terms (a + b + c)' },
      { key: 'B', label: 'a × b × c' },
      { key: 'C', label: 'Sum of only the first two terms' },
      { key: 'D', label: 'c - a' },
    ],
    answer: 'A',
  },
];

export const RatioSharingSolver: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U4-02',
    chapter: 4,
    titleNp: 'अनुपात बाँडफाँड and व्यावहारिक समस्या (Ratio Sharing Solver)',
    titleEn: 'Ratio Sharing and Real-Life Problem Solver',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'divide_money' | 'investment' | 'age' | 'three_part' | 'challenge'>('divide_money');

  // Tab 1 interactive money sharing
  const [totalMoney, setTotalMoney] = useState<number>(500);
  const [shareRatioA, setShareRatioA] = useState<number>(2);
  const [shareRatioB, setShareRatioB] = useState<number>(3);

  const parts = shareRatioA + shareRatioB;
  const onePartVal = totalMoney / parts;
  const shareAVal = shareRatioA * onePartVal;
  const shareBVal = shareRatioB * onePartVal;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! अनुपातमा रकम बाँडफाँड, व्यवसाय लगानी, उमेर सम्बन्धी and तीन पद भएका व्यावहारिक समस्या हल गरौँ!',
        'Hello! Solve real-life problems involving sharing money, business investments, age ratios, and three-part ratios!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'divide_money', labelNp: '1. रकम बाँडफाँड (Divide Money)', labelEn: '1. Divide Money', icon: Banknote },
            { id: 'investment', labelNp: '2. व्यापार लगानी (मोहम्मद and अब्दुल)', labelEn: '2. Investment Problem', icon: Briefcase },
            { id: 'age', labelNp: '3. उमेर सम्बन्धी (बिशाल and धनियाँ)', labelEn: '3. Age Problem', icon: Clock },
            { id: 'three_part', labelNp: '4. तीन पदको अनुपात (3:4:5)', labelEn: '4. Three-Part Ratio', icon: Users },
            { id: 'challenge', labelNp: '5. अभ्यास चुनौती', labelEn: '5. Quiz Challenge', icon: Award },
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

        {/* Tab 1: Divide Money */}
        {activeTab === 'divide_money' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Banknote size={20} />
              {L('पाठ्यपुस्तक उदाहरण: Rs. 500 लाई 2:3 मा बाँड्ने विधि', 'Textbook Example: Divide Rs. 500 in 2:3')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  {L('बाँड्नुपर्ने जम्मा रकम (रु):', 'Total Amount (Rs.):')}
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {[500, 1000, 1500, 2400].map((m) => (
                    <button
                      key={m}
                      onClick={() => setTotalMoney(m)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: totalMoney === m ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: totalMoney === m ? '#e0f2fe' : '#ffffff',
                        color: totalMoney === m ? '#0369a1' : '#334155',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Rs. {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  {L('अनुपात (a : b):', 'Ratio (a : b):')}
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {[[2, 3], [1, 4], [3, 5], [4, 6]].map(([a, b]) => (
                    <button
                      key={`${a}:${b}`}
                      onClick={() => {
                        setShareRatioA(a);
                        setShareRatioB(b);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: shareRatioA === a && shareRatioB === b ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: shareRatioA === a && shareRatioB === b ? '#e0f2fe' : '#ffffff',
                        color: shareRatioA === a && shareRatioB === b ? '#0369a1' : '#334155',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {a}:{b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step-by-Step Calculation */}
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14, color: '#475569' }}>
                • <strong>{L('जम्मा parts (Total Parts):', 'Total Parts:')}</strong> {shareRatioA} + {shareRatioB} = {parts} parts
              </div>
              <div style={{ fontSize: 14, color: '#475569' }}>
                • <strong>{L('1 partsको मूल्य:', 'Value of 1 part:')}</strong> Rs. {totalMoney} ÷ {parts} = <strong>Rs. {onePartVal}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                <div style={{ background: '#eff6ff', padding: 14, borderRadius: 10, border: '1.5px solid #bfdbfe' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1e40af' }}>{L('पहिलो व्यक्तिको parts (Share A):', 'Share A:')}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#1d4ed8', marginTop: 4 }}>
                    Rs. {shareAVal}
                  </div>
                  <div style={{ fontSize: 12, color: '#1e3a8a' }}>({shareRatioA} parts × Rs. {onePartVal})</div>
                </div>

                <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 10, border: '1.5px solid #bbf7d0' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#166534' }}>{L('दोस्रो व्यक्तिको parts (Share B):', 'Share B:')}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#15803d', marginTop: 4 }}>
                    Rs. {shareBVal}
                  </div>
                  <div style={{ fontSize: 12, color: '#14532d' }}>({shareRatioB} parts × Rs. {onePartVal})</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Investment Problem */}
        {activeTab === 'investment' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase size={20} />
              {L('पाठ्यपुस्तक उदाहरण: मोहम्मद and अब्दुलको व्यापार लगानी', 'Textbook Investment: Mohammad & Abdul')}
            </h3>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', marginBottom: 14, lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#1e293b' }}>
                {L(
                  'मोहम्मद and अब्दुलले एउटा व्यापारमा 2:3 को अनुपातमा रकम लगानी गरे। यदि मोहम्मदले Rs. 2,00,000 लगानी गरेका भए अब्दुलको लगानी कति होला?',
                  'Mohammad and Abdul invested in a business in ratio 2:3. If Mohammad invested Rs. 2,00,000, calculate Abdul\'s investment:'
                )}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: '#e0f2fe', padding: 14, borderRadius: 12, border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0369a1' }}>{L('मोहम्मद (2x)', 'Mohammad (2x)')}</div>
                <div style={{ fontSize: 15, color: '#075985', marginTop: 4 }}>
                  2x = Rs. 2,00,000<br />
                  x = Rs. 1,00,000
                </div>
              </div>

              <div style={{ background: '#ecfdf5', padding: 14, borderRadius: 12, border: '1.5px solid #a7f3d0' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#065f46' }}>{L('अब्दुल (3x) को लगानी', 'Abdul (3x) Investment')}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                  Rs. 3,00,000
                </div>
                <div style={{ fontSize: 12, color: '#064e3b' }}>(3 × 1,00,000 = 3,00,000)</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Age Problem */}
        {activeTab === 'age' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={20} />
              {L('पाठ्यपुस्तक उदाहरण: बिशाल and धनियाँको उमेर समस्या', 'Textbook Age Problem: Bishal & Dhaniya')}
            </h3>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', marginBottom: 14, lineHeight: 1.6 }}>
              <div style={{ fontSize: 14, color: '#1e293b' }}>
                {L(
                  'बिशाल and धनियाँको हालको उमेरको अनुपात 4:5 छ। 4 वर्षपछि उनीहरूको उमेरको अनुपात 5:6 हुन्छ भने उनीहरूको हालको उमेर कति होला?',
                  'Present ages of Bishal & Dhaniya are in ratio 4:5. After 4 years, ratio becomes 5:6. Find present ages:'
                )}
              </div>
            </div>

            <div style={{ background: '#fff7ed', padding: 16, borderRadius: 12, border: '1px solid #fed7aa', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14, color: '#9a3412' }}>
                Let Bishal’s current age = 4x and Dhaniya’s current age = 5x
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#c2410c' }}>
                After 4 years: (4x + 4) / (5x + 4) = 5 / 6
              </div>
              <div style={{ fontSize: 14, color: '#7c2d12' }}>
                6(4x + 4) = 5(5x + 4)<br />
                24x + 24 = 25x + 20<br />
                25x - 24x = 24 - 20 ⇒ <strong>x = 4</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, border: '1px solid #fdba74' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#9a3412' }}>{L('बिशालको हालको उमेर:', 'Bishal\'s Present Age:')}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#c2410c' }}>4x = 16 years</div>
                </div>
                <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, border: '1px solid #fdba74' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#9a3412' }}>{L('धनियाँको हालको उमेर:', 'Dhaniya\'s Present Age:')}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#c2410c' }}>5x = 20 years</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Three-Part Ratio */}
        {activeTab === 'three_part' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={20} />
              {L('पाठ्यपुस्तक उदाहरण: डोल्मा, रामबिलास and सोनामको आम्दानी (3:4:5)', 'Three-Part Ratio: Dolma, Rambilash & Sonam')}
            </h3>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', marginBottom: 14 }}>
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
                Total annual income = <strong>Rs. 24,00,000</strong><br />
                Ratio of income = <strong>3 : 4 : 5</strong><br />
                Total parts = 3 + 4 + 5 = <strong>12 parts</strong><br />
                1 part = 24,00,000 ÷ 12 = <strong>Rs. 2,00,000</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ background: '#eff6ff', padding: 14, borderRadius: 10, border: '1.5px solid #bfdbfe', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1e40af' }}>{L('डोल्मा (3 parts)', 'Dolma (3 parts)')}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#1d4ed8', marginTop: 4 }}>Rs. 6,00,000</div>
                <div style={{ fontSize: 11, color: '#1e3a8a' }}>3 × 2,00,000</div>
              </div>

              <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 10, border: '1.5px solid #bbf7d0', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#166534' }}>{L('रामबिलास (4 parts)', 'Rambilash (4 parts)')}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#15803d', marginTop: 4 }}>Rs. 8,00,000</div>
                <div style={{ fontSize: 11, color: '#14532d' }}>4 × 2,00,000</div>
              </div>

              <div style={{ background: '#fef2f2', padding: 14, borderRadius: 10, border: '1.5px solid #fecaca', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#991b1b' }}>{L('सोनाम (5 parts)', 'Sonam (5 parts)')}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#dc2626', marginTop: 4 }}>Rs. 10,00,000</div>
                <div style={{ fontSize: 11, color: '#991b1b' }}>5 × 2,00,000</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Challenge */}
        {activeTab === 'challenge' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} />
              {L('अनुपात बाँडफाँड अभ्यास चुनौती', 'Ratio Sharing Quiz Challenge')}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
              {L(
                'माथि दायाँ कुनामा रहेको "चुनौती (Challenge)" ट्याबबाट 5 pcs आधिकारिक पाठ्यपुस्तकका प्रश्नहरू हल गरी ताराहरू कमाउनुहोस्!',
                'Click "Challenge" mode in the header to take the official CDC curriculum quiz and earn mastery stars!'
              )}
            </p>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default RatioSharingSolver;
