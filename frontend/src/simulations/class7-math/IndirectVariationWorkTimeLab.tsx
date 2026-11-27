/**
 * IndirectVariationWorkTimeLab.tsx
 * Grade 7 Mathematics – Lesson 8: UNITARY METHOD
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
    np: '12 people मानिसले एउटा काम 20 daysमा सक्छन् भने 8 people मानिसले सो काम कति daysमा सक्लान्?',
    en: 'If 12 men can finish a piece of work in 20 days, in how many days can 8 men finish it?',
    options: [
      { key: 'A', label: '30 days (12 × 20 = 240 man-days => 240 ÷ 8 = 30 days)' },
      { key: 'B', label: '25 days' },
      { key: 'C', label: '24 days' },
      { key: 'D', label: '16 days' },
    ],
    answer: 'A',
  },
  {
    np: 'छात्रावासमा 50 people विद्यार्थीलाई 54 days पुग्ने खाना थियो। थप 10 people आउँदा उक्त खाना कति days पुग्छ?',
    en: 'A hostel had food for 50 students for 54 days. If 10 more join (total 60), how many days will it last?',
    options: [
      { key: 'A', label: '45 days (50 × 54 = 2700 => 2700 ÷ 60 = 45 days)' },
      { key: 'B', label: '40 days' },
      { key: 'C', label: '50 days' },
      { key: 'D', label: '48 days' },
    ],
    answer: 'A',
  },
  {
    np: '30 people workersले एउटा काम 17 daysमा सक्छन्। सो काम 10 daysमै सम्पन्न गर्न थप कति people workers चाहिन्छ?',
    en: '30 workers finish a job in 17 days. How many additional workers are needed to finish it in 10 days?',
    options: [
      { key: 'A', label: '21 more people (total needed = 51, extra = 51 - 30 = 21)' },
      { key: 'B', label: '51 people' },
      { key: 'C', label: '20 people' },
      { key: 'D', label: '15 people' },
    ],
    answer: 'A',
  },
  {
    np: 'अप्रत्यक्ष विचरणमा workers र daysको सम्बन्ध कुन सुत्रले days्छ?',
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
        'काम र समयमा workers र daysको गुणनफल सधैँ स्थिर रहन्छ: M1 × D1 = M2 × D2!',
        'In work and time, the product of workers and days remains constant: M1 × D1 = M2 × D2!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'work-time', np: '1. workers र days (Workers & Days)', en: '1. Workers & Days' },
            { id: 'hostel', np: '2. छात्रावास खाद्यान्न (Hostel Food Ration)', en: '2. Food Ration' },
            { id: 'deadline', np: '3. म्याद र थप workers (Deadline Challenge)', en: '3. Deadline Challenge' },
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
              {L('workers र days: अप्रत्यक्ष विचरण', 'Workers and Days (Indirect Variation)')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: 12 people मानिसले एउटा काम 20 daysमा गर्न सक्छन् भने 8 people मानिसले सो काम कति daysमा सक्लान्?',
                'Textbook Example: If 12 men can finish a work in 20 days, in how many days can 8 men finish it?'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  {L('पहिलो workers सङ्ख्या: ', 'First Worker Count: ')} {givenMen} people
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
                  {L('लाग्ने days: ', 'Days Taken: ')} {givenDays} days
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
                  {L('नयाँ workers सङ्ख्या: ', 'New Worker Count: ')} {targetMen} people
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
                <strong>{L('1. दिइएको:', '1. Given:')}</strong> {givenMen} people need to finish the work = {givenDays} days
              </div>
              <div>
                <strong>{L('2. 1 people मानिसलाई लाग्ने days:', '2. Days for 1 man (Multiply):')}</strong>
                <br />One person needs many days, so: {givenMen} × {givenDays} ={' '}
                <span style={{ fontWeight: 800, color: '#0369A1' }}>{totalManDays} man-days</span>
              </div>
              <div>
                <strong>{L('3. नयाँ workersलाई लाग्ने days:', '3. Days for target workers (Divide):')}</strong>
                <br />{targetMen} people need = {totalManDays} ÷ {targetMen}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                {targetMen} people {L('workersलाई लाग्ने समय = ', 'Workers will take = ')} {targetDays.toFixed(1)}{' '}
                {L('days', 'Days')}
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
                'पाठ्यपुस्तक उदाहरण: एउटा छात्रावासमा 50 people विद्यार्थीलाई 54 days पुग्ने खाना थियो। थप 10 people विद्यार्थी आउँदा उक्त खाना कति days पुग्छ?',
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
                <strong>{L('1. दिइएको:', '1. Given:')}</strong> Lasts 50 people = 54 days
              </div>
              <div>
                <strong>{L('2. जम्मा रासन एकाइ:', '2. Total Food Units:')}</strong> 50 × 54 ={' '}
                <span style={{ fontWeight: 800, color: '#B45309' }}>2,700 student-days</span>
              </div>
              <div>
                <strong>{L('3. थपिएपछिको जम्मा विद्यार्थी:', '3. Total Students:')}</strong> 50 + 10 ={' '}
                <span style={{ fontWeight: 800 }}>60 people</span>
              </div>
              <div>
                <strong>{L('4. 60 peopleलाई पुग्ने days:', '4. Days for 60 students:')}</strong> 2,700 ÷ 60
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#92400E',
                }}
              >
                {L('खाना पुग्ने days = ', 'Food will last for = ')} {foodDurationDays.toFixed(0)} {L('days', 'Days')}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Deadline Challenge */}
        {activeTab === 'deadline' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('म्यादभित्र काम सक्न थप workers (Deadline Challenge)', 'Deadline Challenge: Extra Workers')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: 30 people workersले एउटा काम 17 daysमा सक्छन्। सो काम 10 daysमै सम्पन्न गर्न थप कति people workers थप्नुपर्छ?',
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
                <strong>{L('1. जम्मा आवश्यक श्रम:', '1. Total Required Labor:')}</strong> 30 workers × 17 days ={' '}
                <span style={{ fontWeight: 800, color: '#047857' }}>510 man-days</span>
              </div>
              <div>
                <strong>{L('2. 10 daysमा सक्न चाहिने जम्मा workers:', '2. Total Workers for 10 Days:')}</strong> 510 ÷ 10 ={' '}
                <span style={{ fontWeight: 800, color: '#065F46' }}>51 people workers</span>
              </div>
              <div>
                <strong>{L('3. पहिले नै उपलब्ध workers:', '3. Available Workers:')}</strong> 30 people
              </div>
              <div>
                <strong>{L('4. थप्नुपर्ने workers:', '4. Additional Workers Needed:')}</strong> 51 - 30
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#047857',
                }}
              >
                {L('थप workers सङ्ख्या = ', 'Extra Workers Needed = ')} {extraWorkersNeeded} {L('people', 'workers')}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default IndirectVariationWorkTimeLab;
