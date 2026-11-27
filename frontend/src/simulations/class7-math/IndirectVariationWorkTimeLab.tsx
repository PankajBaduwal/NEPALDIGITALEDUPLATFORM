/**
 * IndirectVariationWorkTimeLab.tsx
 * Grade 7 Mathematics – Lesson 8: UNITARY METHOD (एकाइ विधि)
 * Simulation 4: Indirect Variation & Work-Time Lab (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 107-108)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Users, Clock, Utensils, HardHat, Check, ArrowRight } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: '१२ जना मानिसले एउटा काम २० दिनमा सक्छन् भने ८ जना मानिसले सो काम कति दिनमा सक्लान्?',
    en: 'If 12 men can finish a piece of work in 20 days, in how many days can 8 men finish it?',
    options: [
      { key: 'A', label: '३० दिन (१२ × २० = २४० श्रम-दिन => २४० ÷ ८ = ३० दिन)' },
      { key: 'B', label: '२५ दिन' },
      { key: 'C', label: '२४ दिन' },
      { key: 'D', label: '१६ दिन' },
    ],
    answer: 'A',
  },
  {
    np: 'छात्रावासमा ५० जना विद्यार्थीलाई ५४ दिन पुग्ने खाना थियो। थप १० जना आउँदा उक्त खाना कति दिन पुग्छ?',
    en: 'A hostel had food for 50 students for 54 days. If 10 more join (total 60), how many days will it last?',
    options: [
      { key: 'A', label: '४५ दिन (५० × ५४ = २७०० => २७०० ÷ ६० = ४५ दिन)' },
      { key: 'B', label: '४० दिन' },
      { key: 'C', label: '५० दिन' },
      { key: 'D', label: '४८ दिन' },
    ],
    answer: 'A',
  },
  {
    np: '३० जना कामदारले एउटा काम १७ दिनमा सक्छन्। सो काम १० दिनमै सम्पन्न गर्न थप कति जना कामदार चाहिन्छ?',
    en: '30 workers finish a job in 17 days. How many additional workers are needed to finish it in 10 days?',
    options: [
      { key: 'A', label: '२१ जना थप (जम्मा चाहिने = ५१, थप = ५१ - ३० = २१)' },
      { key: 'B', label: '५१ जना' },
      { key: 'C', label: '२० जना' },
      { key: 'D', label: '१५ जना' },
    ],
    answer: 'A',
  },
  {
    np: 'अप्रत्यक्ष विचरणमा कामदार र दिनको सम्बन्ध कुन सुत्रले दिन्छ?',
    en: 'In indirect variation, which formula relates workers and days?',
    options: [
      { key: 'A', label: 'M1 × D1 = M2 × D2' },
      { key: 'B', label: 'M1 / D1 = M2 / D2' },
      { key: 'C', label: 'M1 + D1 = M2 + D2' },
      { key: 'D', label: 'M1 - D1 = M2 - D2' },
    ],
    answer: 'A',
  },
];

export const IndirectVariationWorkTimeLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L8-04',
    titleEn: 'Indirect Variation & Work-Time Lab',
    titleNp: 'अप्रत्यक्ष विचरण र काम-समय प्रयोगशाला',
    chapter: 8,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'work-time' | 'hostel' | 'deadline'>('work-time');

  // Case 1: 12 men in 20 days -> 8 men take ?
  const [givenMen, setGivenMen] = useState<number>(12);
  const [givenDays, setGivenDays] = useState<number>(20);
  const [targetMen, setTargetMen] = useState<number>(8);
  const totalManDays = givenMen * givenDays;
  const targetDays = targetMen > 0 ? totalManDays / targetMen : 0;

  // Case 2: Hostel food provision
  const [hostelStudents, setHostelStudents] = useState<number>(50);
  const [hostelDays, setHostelDays] = useState<number>(54);
  const [newJoinedStudents, setNewJoinedStudents] = useState<number>(10);
  const totalHostelStudents = hostelStudents + newJoinedStudents;
  const foodCapacity = hostelStudents * hostelDays;
  const foodDurationDays = totalHostelStudents > 0 ? foodCapacity / totalHostelStudents : 0;

  // Case 3: Fixed deadline (30 workers in 17 days -> target 10 days)
  const [case3Workers, setCase3Workers] = useState<number>(30);
  const [case3Days, setCase3Days] = useState<number>(17);
  const [targetDeadlineDays, setTargetDeadlineDays] = useState<number>(10);
  const case3TotalManDays = case3Workers * case3Days;
  const neededWorkers = targetDeadlineDays > 0 ? Math.ceil(case3TotalManDays / targetDeadlineDays) : 0;
  const extraWorkersNeeded = Math.max(0, neededWorkers - case3Workers);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'काम र समयमा कामदार र दिनको गुणनफल सधैँ स्थिर रहन्छ: M1 × D1 = M2 × D2!',
        'In work and time, the product of workers and days remains constant: M1 × D1 = M2 × D2!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'work-time', np: '१. कामदार र दिन (Workers & Days)', en: '1. Workers & Days' },
            { id: 'hostel', np: '२. छात्रावास खाद्यान्न (Hostel Food Ration)', en: '2. Food Ration' },
            { id: 'deadline', np: '३. म्याद र थप कामदार (Deadline Challenge)', en: '3. Deadline Challenge' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                kit.tap();
                setActiveTab(tab.id as any);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === tab.id ? '#187C68' : '#E2E8F0',
                color: activeTab === tab.id ? '#FFF' : '#334155',
                transition: 'all 0.2s',
              }}
            >
              {L(tab.np, tab.en)}
            </button>
          ))}
        </div>

        {/* TAB 1: Workers and Days */}
        {activeTab === 'work-time' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('कामदार र दिन: अप्रत्यक्ष विचरण', 'Workers and Days (Indirect Variation)')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: १२ जना मानिसले एउटा काम २० दिनमा गर्न सक्छन् भने ८ जना मानिसले सो काम कति दिनमा सक्लान्?',
                'Textbook Example: If 12 men can finish a work in 20 days, in how many days can 8 men finish it?'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  {L('पहिलो कामदार सङ्ख्या: ', 'First Worker Count: ')} {givenMen} जना
                </label>
                <input
                  type="range"
                  min={4}
                  max={24}
                  step={2}
                  value={givenMen}
                  onChange={(e) => {
                    kit.tap();
                    setGivenMen(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('लाग्ने दिन: ', 'Days Taken: ')} {givenDays} दिन
                </label>
                <input
                  type="range"
                  min={10}
                  max={40}
                  step={5}
                  value={givenDays}
                  onChange={(e) => {
                    kit.tap();
                    setGivenDays(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('नयाँ कामदार सङ्ख्या: ', 'New Worker Count: ')} {targetMen} जना
                </label>
                <input
                  type="range"
                  min={2}
                  max={24}
                  step={1}
                  value={targetMen}
                  onChange={(e) => {
                    kit.tap();
                    setTargetMen(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div
              style={{
                background: '#F8FAFC',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('१. दिइएको:', '1. Given:')}</strong> {givenMen} जना मानिसलाई काम सक्न लाग्ने = {givenDays} दिन
              </div>
              <div>
                <strong>{L('२. १ जना मानिसलाई लाग्ने दिन (गुणन गर्दा):', '2. Days for 1 man (Multiply):')}</strong>
                <br />१ जनालाई धेरै दिन लाग्ने भएकोले: {givenMen} × {givenDays} ={' '}
                <span style={{ fontWeight: 800, color: '#0369A1' }}>{totalManDays} श्रम-दिन (Man-Days)</span>
              </div>
              <div>
                <strong>{L('३. नयाँ कामदारलाई लाग्ने दिन (भाग गर्दा):', '3. Days for target workers (Divide):')}</strong>
                <br />{targetMen} जना मानिसलाई लाग्ने = {totalManDays} ÷ {targetMen}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                {targetMen} जना {L('कामदारलाई लाग्ने समय = ', 'Workers will take = ')} {targetDays.toFixed(1)}{' '}
                {L('दिन', 'Days')}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Hostel Food Provision */}
        {activeTab === 'hostel' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('छात्रावास खाद्यान्न रासन (Hostel Food Provision)', 'Hostel Food Provision')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: एउटा छात्रावासमा ५० जना विद्यार्थीलाई ५४ दिन पुग्ने खाना थियो। थप १० जना विद्यार्थी आउँदा उक्त खाना कति दिन पुग्छ?',
                'Textbook Example: A hostel had food for 50 students for 54 days. If 10 more students join, how long will it last?'
              )}
            </p>

            <div
              style={{
                background: '#FFFBEB',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #FDE68A',
                lineHeight: 2,
                margin: '16px 0',
              }}
            >
              <div>
                <strong>{L('१. दिइएको:', '1. Given:')}</strong> ५० जनालाई पुग्ने = ५४ दिन
              </div>
              <div>
                <strong>{L('२. जम्मा रासन एकाइ:', '2. Total Food Units:')}</strong> ५० × ५४ ={' '}
                <span style={{ fontWeight: 800, color: '#B45309' }}>२,७०० विद्यार्थी-दिन</span>
              </div>
              <div>
                <strong>{L('३. थपिएपछिको जम्मा विद्यार्थी:', '3. Total Students:')}</strong> ५० + १० ={' '}
                <span style={{ fontWeight: 800 }}>६० जना</span>
              </div>
              <div>
                <strong>{L('४. ६० जनालाई पुग्ने दिन:', '4. Days for 60 students:')}</strong> २,७०० ÷ ६०
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#92400E',
                }}
              >
                {L('खाना पुग्ने दिन = ', 'Food will last for = ')} {foodDurationDays.toFixed(0)} {L('दिन', 'Days')}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Deadline Challenge */}
        {activeTab === 'deadline' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('म्यादभित्र काम सक्न थप कामदार (Deadline Challenge)', 'Deadline Challenge: Extra Workers')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: ३० जना कामदारले एउटा काम १७ दिनमा सक्छन्। सो काम १० दिनमै सम्पन्न गर्न थप कति जना कामदार थप्नुपर्छ?',
                'Textbook Example: 30 workers complete work in 17 days. How many extra workers are needed to complete it in 10 days?'
              )}
            </p>

            <div
              style={{
                background: '#ECFDF5',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #6EE7B7',
                lineHeight: 2,
                margin: '16px 0',
              }}
            >
              <div>
                <strong>{L('१. जम्मा आवश्यक श्रम:', '1. Total Required Labor:')}</strong> ३० कामदार × १७ दिन ={' '}
                <span style={{ fontWeight: 800, color: '#047857' }}>५१० श्रम-दिन (Man-Days)</span>
              </div>
              <div>
                <strong>{L('२. १० दिनमा सक्न चाहिने जम्मा कामदार:', '2. Total Workers for 10 Days:')}</strong> ५१० ÷ १० ={' '}
                <span style={{ fontWeight: 800, color: '#065F46' }}>५१ जना कामदार</span>
              </div>
              <div>
                <strong>{L('३. पहिले नै उपलब्ध कामदार:', '3. Available Workers:')}</strong> ३० जना
              </div>
              <div>
                <strong>{L('४. थप्नुपर्ने कामदार:', '4. Additional Workers Needed:')}</strong> ५१ - ३०
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#047857',
                }}
              >
                {L('थप कामदार सङ्ख्या = ', 'Extra Workers Needed = ')} {extraWorkersNeeded} {L('जना', 'workers')}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default IndirectVariationWorkTimeLab;
