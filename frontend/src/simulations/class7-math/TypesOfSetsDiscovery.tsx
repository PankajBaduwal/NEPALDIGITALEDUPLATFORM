/**
 * TypesOfSetsDiscovery.tsx
 * Grade 7 Mathematics – Lesson 1: SET (समूह)
 * Simulation 2: Types of Sets – Discovery World (2D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S.)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';
import { Check, X, Sparkles, HelpCircle, ArrowRight, RotateCcw, Plus } from 'lucide-react';

interface SetTypeExample {
  id: string;
  type: 'NULL' | 'FINITE' | 'INFINITE';
  titleEn: string;
  titleNp: string;
  notationEn: string;
  notationNp: string;
  cardinalityTextEn: string;
  cardinalityTextNp: string;
  explanationEn: string;
  explanationNp: string;
  elementsEn: string[];
  elementsNp: string[];
}

const SET_EXAMPLES: SetTypeExample[] = [
  // ── Null Sets
  {
    id: 'null-1',
    type: 'NULL',
    titleEn: 'Natural numbers between 1 and 2',
    titleNp: '१ र २ बीचका प्राकृतिक सङ्ख्याहरूको समूह',
    notationEn: 'A = { } or A = ∅',
    notationNp: 'A = { } वा A = ∅',
    cardinalityTextEn: 'n(A) = 0 (No elements exist)',
    cardinalityTextNp: 'n(A) = ० (कुनै सदस्य छैनन्)',
    explanationEn: 'There is no natural number between 1 and 2. Therefore, this set has zero elements and is called a Null or Empty set.',
    explanationNp: '१ र २ बीचमा कुनै पनि प्राकृतिक सङ्ख्या पर्दैन। त्यसैले यसमा कुनै सदस्य हुँदैन र यो रिक्त समूह हो।',
    elementsEn: [],
    elementsNp: [],
  },
  {
    id: 'null-2',
    type: 'NULL',
    titleEn: 'Odd numbers divisible by 2',
    titleNp: '२ ले भाग जाने बिजोर सङ्ख्याहरूको समूह',
    notationEn: 'B = { } or B = ∅',
    notationNp: 'B = { } वा B = ∅',
    cardinalityTextEn: 'n(B) = 0 (Impossible event)',
    cardinalityTextNp: 'n(B) = ० (असम्भव घटना)',
    explanationEn: 'By definition, odd numbers leave a remainder of 1 when divided by 2. Hence no odd number is divisible by 2.',
    explanationNp: 'बिजोर सङ्ख्यालाई २ ले भाग जाँदैन। त्यसैले यस्तो समूहमा कुनै पनि सदस्य हुन सक्दैन।',
    elementsEn: [],
    elementsNp: [],
  },
  {
    id: 'null-3',
    type: 'NULL',
    titleEn: 'Months of a year having 35 days',
    titleNp: 'वर्षका ३५ दिन हुने महिनाहरूको समूह',
    notationEn: 'C = ∅',
    notationNp: 'C = ∅',
    cardinalityTextEn: 'n(C) = 0',
    cardinalityTextNp: 'n(C) = ०',
    explanationEn: 'No calendar month in the year has 35 days, so this set is empty.',
    explanationNp: 'वर्षको कुनै पनि महिना ३५ दिनको हुँदैन, त्यसैले यो पूर्ण रूपमा रिक्त छ।',
    elementsEn: [],
    elementsNp: [],
  },

  // ── Finite Sets
  {
    id: 'fin-1',
    type: 'FINITE',
    titleEn: 'Factors of 24 (२४ का गुणनखण्डहरू)',
    titleNp: '२४ का गुणनखण्डहरूको समूह',
    notationEn: 'F = { 1, 2, 3, 4, 6, 8, 12, 24 }',
    notationNp: 'F = { १, २, ३, ४, ६, ८, १२, २४ }',
    cardinalityTextEn: 'n(F) = 8 (Countable definite elements)',
    cardinalityTextNp: 'n(F) = ८ (सीमित तथा गन्न सकिने)',
    explanationEn: '24 has exactly 8 positive factors. Since the counting process comes to an end, it is a Finite set.',
    explanationNp: '२४ का ठीक ८ वटा गुणनखण्डहरू छन्। यसका सदस्यहरू गनेर टुङ्ग्याउन सकिने भएकाले यो सीमित समूह हो।',
    elementsEn: ['1', '2', '3', '4', '6', '8', '12', '24'],
    elementsNp: ['१', '२', '३', '४', '६', '८', '१२', '२४'],
  },
  {
    id: 'fin-2',
    type: 'FINITE',
    titleEn: 'Seven Rainbow Colors (इन्द्रेणीका रङहरू)',
    titleNp: 'इन्द्रेणीका सात रङहरूको समूह',
    notationEn: 'R = { Violet, Indigo, Blue, Green, Yellow, Orange, Red }',
    notationNp: 'R = { बैजनी, गाढा नीलो, नीलो, हरियो, पहेंलो, सुन्तला, रातो }',
    cardinalityTextEn: 'n(R) = 7 (Definite fixed count)',
    cardinalityTextNp: 'n(R) = ७ (निश्चित सङ्ख्या)',
    explanationEn: 'The number of rainbow colours is fixed and finite: n(R) = 7.',
    explanationNp: 'इन्द्रेणीका रङहरू निश्चित ७ वटा हुन्छन्।',
    elementsEn: ['Violet', 'Indigo', 'Blue', 'Green', 'Yellow', 'Orange', 'Red'],
    elementsNp: ['बैजनी', 'गाढा नीलो', 'नीलो', 'हरियो', 'पहेंलो', 'सुन्तला', 'रातो'],
  },
  {
    id: 'fin-3',
    type: 'FINITE',
    titleEn: 'Whole numbers less than 10',
    titleNp: '१० भन्दा साना पूर्ण सङ्ख्याहरूको समूह',
    notationEn: 'W₁₀ = { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 }',
    notationNp: 'W₁₀ = { ०, १, २, ३, ४, ५, ६, ७, ८, ९ }',
    cardinalityTextEn: 'n(W₁₀) = 10',
    cardinalityTextNp: 'n(W₁₀) = १०',
    explanationEn: 'There are exactly 10 whole numbers less than 10 (from 0 to 9).',
    explanationNp: '१० भन्दा साना पूर्ण सङ्ख्याहरू ठीक १० वटा हुन्छन् (० देखि ९ सम्म)।',
    elementsEn: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    elementsNp: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  },

  // ── Infinite Sets
  {
    id: 'inf-1',
    type: 'INFINITE',
    titleEn: 'Set of Natural numbers (प्राकृतिक सङ्ख्याहरू)',
    titleNp: 'प्राकृतिक सङ्ख्याहरूको समूह',
    notationEn: 'N = { 1, 2, 3, 4, 5, 6, ... }',
    notationNp: 'N = { १, २, ३, ४, ५, ६, ... }',
    cardinalityTextEn: 'n(N) = ∞ (Cannot be counted to an end)',
    cardinalityTextNp: 'n(N) = असीमित (गनेर नसकिने)',
    explanationEn: 'No matter what number you think of, you can always add 1. There is no final or greatest natural number.',
    explanationNp: 'तपाईंले जतिसुकै ठूलो सङ्ख्या सोचे पनि त्यसमा १ जोड्न सकिन्छ। यसको कुनै अन्तिम सदस्य हुँदैन।',
    elementsEn: ['1', '2', '3', '4', '5', '6', '7', '...'],
    elementsNp: ['१', '२', '३', '४', '५', '६', '७', '...'],
  },
  {
    id: 'inf-2',
    type: 'INFINITE',
    titleEn: 'Set of Even numbers (जोर सङ्ख्याहरू)',
    titleNp: 'जोर प्राकृतिक सङ्ख्याहरूको समूह',
    notationEn: 'E = { 2, 4, 6, 8, 10, 12, ... }',
    notationNp: 'E = { २, ४, ६, ८, १०, १२, ... }',
    cardinalityTextEn: 'n(E) is infinite (no finite limit)',
    cardinalityTextNp: 'n(E) असीमित छ',
    explanationEn: 'The even numbers go on endlessly: 2, 4, 6, 8, 10... They cannot be listed completely.',
    explanationNp: 'जोर सङ्ख्याहरू कहिल्यै अन्त्य नभई अनन्तसम्म जान्छन्।',
    elementsEn: ['2', '4', '6', '8', '10', '12', '14', '...'],
    elementsNp: ['२', '४', '६', '८', '१०', '१२', '१४', '...'],
  },
  {
    id: 'inf-3',
    type: 'INFINITE',
    titleEn: 'Multiples of 5 (५ का अपवर्त्यहरू)',
    titleNp: '५ का अपवर्त्यहरूको समूह',
    notationEn: 'M₅ = { 5, 10, 15, 20, 25, ... }',
    notationNp: 'M₅ = { ५, १०, १५, २०, २५, ... }',
    cardinalityTextEn: 'n(M₅) is infinite',
    cardinalityTextNp: 'n(M₅) असीमित छ',
    explanationEn: 'Multiplication by 5 never stops. The set extends infinitely.',
    explanationNp: '५ का गुणनहरू अनन्तसम्म जान्छन्, त्यसैले यो असीमित समूह हो।',
    elementsEn: ['5', '10', '15', '20', '25', '30', '...'],
    elementsNp: ['५', '१०', '१५', '२०', '२५', '३०', '...'],
  },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'रिक्त समूह (Null Set) मा कति वटा सदस्य हुन्छन्?',
    en: 'How many elements are in a Null Set?',
    options: [
      { key: 'A', label: '१' },
      { key: 'B', label: '० (कुनै सदस्य हुँदैन)' },
      { key: 'C', label: 'अनन्त' },
      { key: 'D', label: 'माथिका कुनै पनि होइन' },
    ],
    answer: 'B',
  },
  {
    np: 'तलका मध्ये कुन समूह सीमित समूह (Finite Set) हो?',
    en: 'Which of the following is a Finite Set?',
    options: [
      { key: 'A', label: 'प्राकृतिक सङ्ख्याहरूको समूह' },
      { key: 'B', label: '२४ का गुणनखण्डहरूको समूह' },
      { key: 'C', label: 'जोर सङ्ख्याहरूको समूह' },
      { key: 'D', label: '३ का अपवर्त्यहरूको समूह' },
    ],
    answer: 'B',
  },
  {
    np: 'N = {१, २, ३, ४, ५, ...} कस्तो प्रकारको समूह हो?',
    en: 'What type of set is N = {1, 2, 3, 4, 5, ...}?',
    options: [
      { key: 'A', label: 'रिक्त समूह' },
      { key: 'B', label: 'सीमित समूह' },
      { key: 'C', label: 'असीमित समूह (Infinite Set)' },
      { key: 'D', label: 'बराबर समूह' },
    ],
    answer: 'C',
  },
  {
    np: '५ र ६ बीचका प्राकृतिक सङ्ख्याहरूको समूह कुन हो?',
    en: 'Which set represents natural numbers between 5 and 6?',
    options: [
      { key: 'A', label: '{ ५, ६ }' },
      { key: 'B', label: '{ ५.५ }' },
      { key: 'C', label: '∅ (रिक्त समूह)' },
      { key: 'D', label: '{ ० }' },
    ],
    answer: 'C',
  },
];

export const TypesOfSetsDiscovery: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({ onBackToLibrary, onBack }) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L1-02',
    titleEn: 'Types of Sets – Discovery World',
    titleNp: 'समूहका प्रकारहरू खोजी संसार',
    chapter: 1,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeZone, setActiveZone] = useState<'NULL' | 'FINITE' | 'INFINITE' | 'TEST'>('NULL');
  const [selectedExampleId, setSelectedExampleId] = useState<string>('null-1');
  const [infiniteStep, setInfiniteStep] = useState<number>(6);

  // Practice test state
  const [testIdx, setTestIdx] = useState<number>(0);
  const [testFeedback, setTestFeedback] = useState<'correct' | 'wrong' | null>(null);

  const filteredExamples = SET_EXAMPLES.filter((ex) => ex.type === activeZone);
  const currentExample = SET_EXAMPLES.find((ex) => ex.id === selectedExampleId) || SET_EXAMPLES[0];

  const handleNextSequence = () => {
    kit.tap();
    if (infiniteStep < 18) {
      setInfiniteStep((prev) => prev + 2);
      kit.good('थप सङ्ख्याहरू थपिए! तर अन्त्य कहिल्यै हुँदैन।', 'More numbers generated! But an infinite set never ends.');
    } else {
      kit.oops('अनन्त सङ्ख्याहरू छन् — तपाईं कहिल्यै अन्तिम सङ्ख्यामा पुग्न सक्नुहुन्न!', 'Infinite sequence! You can never reach the final element.');
    }
  };

  const handlePracticeAnswer = (type: 'NULL' | 'FINITE' | 'INFINITE') => {
    const target = SET_EXAMPLES[testIdx];
    if (target.type === type) {
      kit.good('सही जवाफ!', 'Correct identification!');
      setTestFeedback('correct');
    } else {
      kit.oops('पुनः विचार गर्नुहोस्।', 'Incorrect classification. Try again!');
      setTestFeedback('wrong');
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'समूह मुख्यतया ३ प्रकारका हुन्छन्: रिक्त समूह (Null Set), सीमित समूह (Finite Set) र असीमित समूह (Infinite Set)। आउनुहोस्, भिन्नता बुझौँ!',
        'Sets are primarily classified into: Null Set, Finite Set, and Infinite Set. Explore each zone!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Zone Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { id: 'NULL', labelNp: '१. रिक्त समूह (Null Set)', labelEn: '1. Null Set (∅)', descNp: 'n = ०, कुनै सदस्य नभएको', descEn: 'Zero elements (∅)', color: '#EF4444', bg: '#FEF2F2' },
            { id: 'FINITE', labelNp: '२. सीमित समूह (Finite Set)', labelEn: '2. Finite Set', descNp: 'गनेर सकिने निश्चित सदस्य', descEn: 'Countable definite elements', color: '#16A34A', bg: '#F0FDF4' },
            { id: 'INFINITE', labelNp: '३. असीमित समूह (Infinite Set)', labelEn: '3. Infinite Set', descNp: 'अनन्तसम्म जाने, अन्त्य नहुने', descEn: 'Extends without end (...)', color: '#8B5CF6', bg: '#F5F3FF' },
            { id: 'TEST', labelNp: '४. अभ्यास तथा चुनौती', labelEn: '4. Practice Challenge', descNp: 'आफ्नो ज्ञान परीक्षण गर्नुहोस्', descEn: 'Test your understanding', color: '#0EA5E9', bg: '#F0F9FF' },
          ].map((zone) => {
            const isActive = activeZone === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => {
                  kit.tap();
                  setActiveZone(zone.id as any);
                  if (zone.id !== 'TEST') {
                    const firstEx = SET_EXAMPLES.find((e) => e.type === zone.id);
                    if (firstEx) setSelectedExampleId(firstEx.id);
                  }
                }}
                style={{
                  padding: '14px 16px',
                  borderRadius: 16,
                  border: isActive ? `3px solid ${zone.color}` : '1px solid #E2E8F0',
                  background: isActive ? zone.bg : '#FFFFFF',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900, color: isActive ? zone.color : '#1E293B' }}>
                  {isNe ? zone.labelNp : zone.labelEn}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                  {isNe ? zone.descNp : zone.descEn}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── ZONE 1: NULL SET ────────────────────────────── */}
        {activeZone === 'NULL' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: 6 }}>
                  {L('रिक्त समूह (Empty Set)', 'Null Set')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {isNe ? currentExample.titleNp : currentExample.titleEn}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {filteredExamples.map((ex, idx) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      kit.tap();
                      setSelectedExampleId(ex.id);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: 'none',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: selectedExampleId === ex.id ? '#EF4444' : '#F1F5F9',
                      color: selectedExampleId === ex.id ? '#FFFFFF' : '#475569',
                      fontSize: 12,
                    }}
                  >
                    {L(`उदाहरण ${toNp(idx + 1)}`, `Example ${idx + 1}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty Container Visual */}
            <div
              style={{
                height: 180,
                background: '#FEF2F2',
                border: '3px dashed #F87171',
                borderRadius: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                position: 'relative',
              }}
            >
              <div style={{ fontSize: 56, fontWeight: 900, color: '#EF4444', lineHeight: 1 }}>
                ∅
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#991B1B', marginTop: 8 }}>
                {isNe ? currentExample.notationNp : currentExample.notationEn}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#B91C1C', marginTop: 4 }}>
                {isNe ? currentExample.cardinalityTextNp : currentExample.cardinalityTextEn}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', borderLeft: '4px solid #EF4444', padding: 16, borderRadius: '0 12px 12px 0' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#991B1B', marginBottom: 4 }}>
                💡 {L('पाठ्यपुस्तक नियम:', 'Textbook Rule:')}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                {isNe ? currentExample.explanationNp : currentExample.explanationEn}
              </p>
            </div>
          </div>
        )}

        {/* ── ZONE 2: FINITE SET ──────────────────────────── */}
        {activeZone === 'FINITE' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
                  {L('सीमित समूह (Finite Set)', 'Finite Set')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {isNe ? currentExample.titleNp : currentExample.titleEn}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {filteredExamples.map((ex, idx) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      kit.tap();
                      setSelectedExampleId(ex.id);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: 'none',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: selectedExampleId === ex.id ? '#16A34A' : '#F1F5F9',
                      color: selectedExampleId === ex.id ? '#FFFFFF' : '#475569',
                      fontSize: 12,
                    }}
                  >
                    {L(`उदाहरण ${toNp(idx + 1)}`, `Example ${idx + 1}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Elements Grid Visual */}
            <div
              style={{
                minHeight: 140,
                background: '#F0FDF4',
                border: '2px solid #86EFAC',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}
            >
              {(isNe ? currentExample.elementsNp : currentExample.elementsEn).map((el, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 12,
                    background: '#FFFFFF',
                    border: '2px solid #16A34A',
                    fontWeight: 900,
                    fontSize: 15,
                    color: '#166534',
                    boxShadow: '0 2px 6px rgba(22,163,74,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>#{i + 1}</span>
                  <span>{el}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#166534' }}>
                {isNe ? currentExample.cardinalityTextNp : currentExample.cardinalityTextEn}
              </div>
              <div style={{ fontSize: 13, color: '#475569', maxWidth: 600 }}>
                {isNe ? currentExample.explanationNp : currentExample.explanationEn}
              </div>
            </div>
          </div>
        )}

        {/* ── ZONE 3: INFINITE SET ────────────────────────── */}
        {activeZone === 'INFINITE' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#EDE9FE', color: '#6D28D9', padding: '3px 8px', borderRadius: 6 }}>
                  {L('असीमित समूह (Infinite Set)', 'Infinite Set')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {isNe ? currentExample.titleNp : currentExample.titleEn}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {filteredExamples.map((ex, idx) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      kit.tap();
                      setSelectedExampleId(ex.id);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: 'none',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: selectedExampleId === ex.id ? '#8B5CF6' : '#F1F5F9',
                      color: selectedExampleId === ex.id ? '#FFFFFF' : '#475569',
                      fontSize: 12,
                    }}
                  >
                    {L(`उदाहरण ${toNp(idx + 1)}`, `Example ${idx + 1}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Endless Stream Animation Box */}
            <div
              style={{
                minHeight: 140,
                background: '#FAF5FF',
                border: '2px solid #C4B5FD',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
                marginBottom: 20,
              }}
            >
              {Array.from({ length: infiniteStep }).map((_, idx) => {
                const val = idx + 1;
                return (
                  <div
                    key={idx}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: '#FFFFFF',
                      border: '2px solid #8B5CF6',
                      fontWeight: 900,
                      fontSize: 15,
                      color: '#6D28D9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(139,92,246,0.15)',
                    }}
                  >
                    {isNe ? toNp(val) : val}
                  </div>
                );
              })}
              <div style={{ fontSize: 32, fontWeight: 900, color: '#8B5CF6', padding: '0 8px' }}>
                . . .
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <button
                onClick={handleNextSequence}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#8B5CF6',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={16} /> {L('थप सङ्ख्या देखाउनुहोस् (Extend Sequence)', 'Extend Sequence')}
              </button>

              <div style={{ fontSize: 13, color: '#581C87', background: '#F3E8FF', padding: '8px 14px', borderRadius: 10, fontWeight: 700 }}>
                ⚠️ {L('अन्तिम सदस्य कहिल्यै आउँदैन — असीमित समूहको अन्तिम सीमा हुँदैन!', 'No finite last element exists in an infinite set!')}
              </div>
            </div>
          </div>
        )}

        {/* ── ZONE 4: PRACTICE CHALLENGE ──────────────────── */}
        {activeZone === 'TEST' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#0EA5E9', background: '#E0F2FE', padding: '3px 8px', borderRadius: 6 }}>
                {L(`प्रश्न ${toNp(testIdx + 1)} / ${toNp(SET_EXAMPLES.length)}`, `Question ${testIdx + 1} of ${SET_EXAMPLES.length}`)}
              </span>
              <button
                onClick={() => {
                  kit.tap();
                  setTestIdx((prev) => (prev + 1) % SET_EXAMPLES.length);
                  setTestFeedback(null);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {L('अर्को प्रश्न →', 'Next Question →')}
              </button>
            </div>

            <div style={{ background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 700, marginBottom: 6 }}>
                {L('दिइएको समूहको प्रकार पहिचान गर्नुहोस्:', 'Classify the given set:')}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>
                {isNe ? SET_EXAMPLES[testIdx].titleNp : SET_EXAMPLES[testIdx].titleEn}
              </div>
              <div style={{ fontSize: 15, fontFamily: 'monospace', fontWeight: 800, color: '#187C68' }}>
                {isNe ? SET_EXAMPLES[testIdx].notationNp : SET_EXAMPLES[testIdx].notationEn}
              </div>
            </div>

            {/* Answer Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
              <button
                onClick={() => handlePracticeAnswer('NULL')}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '2px solid #EF4444',
                  background: '#FEF2F2',
                  color: '#991B1B',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ∅ {L('रिक्त समूह (Null Set)', 'Null Set (∅)')}
              </button>

              <button
                onClick={() => handlePracticeAnswer('FINITE')}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '2px solid #16A34A',
                  background: '#F0FDF4',
                  color: '#166534',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                🔢 {L('सीमित समूह (Finite Set)', 'Finite Set')}
              </button>

              <button
                onClick={() => handlePracticeAnswer('INFINITE')}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '2px solid #8B5CF6',
                  background: '#F5F3FF',
                  color: '#6D28D9',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ♾️ {L('असीमित समूह (Infinite Set)', 'Infinite Set')}
              </button>
            </div>

            {testFeedback === 'correct' && (
              <div style={{ padding: 12, borderRadius: 10, background: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: 13, textAlign: 'center' }}>
                ✓ {L('सही उत्तर! ', 'Correct! ')} {isNe ? SET_EXAMPLES[testIdx].explanationNp : SET_EXAMPLES[testIdx].explanationEn}
              </div>
            )}
            {testFeedback === 'wrong' && (
              <div style={{ padding: 12, borderRadius: 10, background: '#FEE2E2', color: '#991B1B', fontWeight: 800, fontSize: 13, textAlign: 'center' }}>
                ✕ {L('मिलेन! कृपया परिभाषा पुनः सम्झनुहोस्।', 'Incorrect! Recall the definition.')}
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default TypesOfSetsDiscovery;
