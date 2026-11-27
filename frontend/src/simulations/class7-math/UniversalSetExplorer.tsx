/**
 * UniversalSetExplorer.tsx
 * Grade 7 Mathematics – Lesson 1: SET
 * Simulation 4: Universal Set Explorer (2D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S.)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';
import { Check, X, Sparkles, HelpCircle, ArrowRight, RotateCcw, Box, Layers } from 'lucide-react';

const U_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

const SUBSET_PRESETS = [
  {
    id: 'even',
    name: 'A',
    titleEn: 'Even numbers less than 15',
    titleNp: '15 भन्दा साना जोर सङ्ख्याहरू',
    elements: [2, 4, 6, 8, 10, 12, 14],
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    id: 'prime',
    name: 'B',
    titleEn: 'Prime numbers less than 15',
    titleNp: '15 भन्दा साना रुढ सङ्ख्याहरू',
    elements: [2, 3, 5, 7, 11, 13],
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    id: 'odd',
    name: 'C',
    titleEn: 'Odd numbers less than 15',
    titleNp: '15 भन्दा साना बिजोर सङ्ख्याहरू',
    elements: [1, 3, 5, 7, 9, 11, 13],
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    id: 'square',
    name: 'D',
    titleEn: 'Square numbers in U',
    titleNp: 'U भित्रका पूर्ण वर्ग सङ्ख्याहरू',
    elements: [1, 4, 9],
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    id: 'composite',
    name: 'E',
    titleEn: 'Composite numbers less than 15',
    titleNp: '15 भन्दा साना संयुक्त सङ्ख्याहरू',
    elements: [4, 6, 8, 9, 10, 12, 14],
    color: '#EC4899',
    bg: '#FDF2F8',
  },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'Universal set (Universal Set) लाई कुन संकेतले जनाइन्छ?',
    en: 'Which symbol denotes a Universal Set?',
    options: [
      { key: 'A', label: 'U' },
      { key: 'B', label: '∅' },
      { key: 'C', label: '∈' },
      { key: 'D', label: '⊂' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि U = {1, 2, 3, ..., 10} र A = {2, 4, 6, 8, 10} भए, A कुन समूह हो?',
    en: 'If U = {1, 2, 3, ..., 10} and A = {2, 4, 6, 8, 10}, what is A?',
    options: [
      { key: 'A', label: 'Subset of U' },
      { key: 'B', label: 'Universal set' },
      { key: 'C', label: 'Empty set' },
      { key: 'D', label: 'Infinite set' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि A = {1, 2} र B = {3, 4} भए, यिनीहरूका लागि उपयुक्त Universal set कुन हुन सक्छ?',
    en: 'If A = {1, 2} and B = {3, 4}, which can be a suitable Universal Set?',
    options: [
      { key: 'A', label: 'U = {1, 2, 3, 4, 5}' },
      { key: 'B', label: 'U = {1, 2}' },
      { key: 'C', label: 'U = {3, 4}' },
      { key: 'D', label: 'U = {5, 6}' },
    ],
    answer: 'A',
  },
];

export const UniversalSetExplorer: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({ onBackToLibrary, onBack }) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L1-04',
    titleEn: 'Universal Set Explorer',
    titleNp: 'Universal set अन्वेषक',
    chapter: 1,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'diagram' | 'builder' | 'challenge'>('diagram');
  const [selectedSubsets, setSelectedSubsets] = useState<string[]>(['even', 'prime']);

  // Custom subset builder in Tab 2
  const [customSubset, setCustomSubset] = useState<number[]>([]);
  const [customSubsetName, setCustomSubsetName] = useState('S');

  // Challenge Tab 3
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [challengeAnswer, setChallengeAnswer] = useState<number | null>(null);

  const togglePresetSubset = (id: string) => {
    kit.tap();
    setSelectedSubsets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleCustomNumber = (num: number) => {
    kit.tap();
    setCustomSubset((prev) =>
      prev.includes(num) ? prev.filter((x) => x !== num) : [...prev, num]
    );
  };

  const CHALLENGE_CASES = [
    {
      givenEn: 'A = {2, 4, 6}, B = {1, 3, 5}',
      givenNp: 'A = {2, 4, 6}, B = {1, 3, 5}',
      options: [
        '{ 1, 2, 3, 4, 5, 6, 7 }',
        '{ 1, 3, 5 }',
        '{ 2, 4, 6 }',
        '{ 0, 8, 9 }',
      ],
      correct: 0,
      reasonEn: 'U = {1, 2, 3, 4, 5, 6, 7} contains all elements of both A and B.',
      reasonNp: 'U = {1, 2, 3, 4, 5, 6, 7} मा A र B दुवैका सबै सदस्यहरू पर्दछन्।',
    },
    {
      givenEn: 'P = {Apple, Banana}, Q = {Mango, Orange}',
      givenNp: 'P = {स्याउ, केरा}, Q = {आँप, सुन्तला}',
      options: [
        isNe ? 'फलफूलहरूको समूह (Set of fruits)' : 'Set of all fruits',
        isNe ? 'तरकारीहरूको समूह' : 'Set of vegetables',
        isNe ? 'सवारी साधनको समूह' : 'Set of vehicles',
        isNe ? 'कापी-कलमको समूह' : 'Set of stationery',
      ],
      correct: 0,
      reasonEn: 'All given items are fruits, so "Set of all fruits" is the natural universal set.',
      reasonNp: 'सबै वस्तुहरू फलफूल भएकाले "फलफूलहरूको समूह" उपयुक्त Universal set हो।',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'Universal set (Universal Set, U) भनेको कुनै निश्चित सन्दर्भमा छलफल गरिएका सबै सदस्यहरू समेट्ने ठूलो समूह हो।',
        'A Universal Set (U) is the comprehensive master set containing all objects under consideration.'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'diagram', np: 'क्रियाकलाप 1: सर्वव्यापक भेन रेखाचित्र', en: 'Activity 1: Universal Set Diagram' },
            { id: 'builder', np: 'क्रियाकलाप 2: U भित्र नयाँ उपसमूह बनाउने', en: 'Activity 2: Build Subsets Inside U' },
            { id: 'challenge', np: 'क्रियाकलाप 3: उपयुक्त Universal set छान्ने', en: 'Activity 3: Universal Set Challenge' },
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
                background: activeTab === tab.id ? '#187C68' : '#F8FAFC',
                color: activeTab === tab.id ? '#FFFFFF' : '#334155',
                transition: 'all 0.15s ease',
              }}
            >
              {isNe ? tab.np : tab.en}
            </button>
          ))}
        </div>

        {/* ── TAB 1: UNIVERSAL SET DIAGRAM ────────────────── */}
        {activeTab === 'diagram' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('पाठ्यपुस्तक नमुना: U = {1 देखि 14 सम्मका प्राकृतिक सङ्ख्याहरू}', 'Textbook Example: U = {1, 2, 3, ... 14}')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>
                  {L('बाहिरी आयताकार क्षेत्रले Universal set U जनाउँछ। यसभित्रका उपसमूहहरू हेर्नुहोस्:', 'The outer rectangle represents Universal set U. Subsets A and B reside inside U:')}
                </p>
              </div>

              {/* Subset Toggles */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SUBSET_PRESETS.map((p) => {
                  const isChecked = selectedSubsets.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePresetSubset(p.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: `2px solid ${p.color}`,
                        background: isChecked ? p.color : '#FFFFFF',
                        color: isChecked ? '#FFFFFF' : p.color,
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {p.name} ({isNe ? p.titleNp : p.titleEn}) {isChecked && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BIG RECTANGLE: UNIVERSAL SET U */}
            <div
              style={{
                position: 'relative',
                background: '#F8FAFC',
                border: '4px solid #1E293B',
                borderRadius: 20,
                padding: '36px 24px 24px',
                minHeight: 260,
                marginBottom: 20,
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              }}
            >
              {/* U Label Tag */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 20,
                  transform: 'translateY(-50%)',
                  background: '#1E293B',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: 16,
                  padding: '4px 16px',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
              >
                <Box size={16} /> U = {'{ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 }'}
              </div>

              {/* Elements Scattered inside U */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(65px, 1fr))', gap: 12 }}>
                {U_NUMBERS.map((num) => {
                  // Check membership in selected subsets
                  const matchingSubsets = SUBSET_PRESETS.filter(
                    (p) => selectedSubsets.includes(p.id) && p.elements.includes(num)
                  );

                  const isHighlighted = matchingSubsets.length > 0;
                  const primaryColor = isHighlighted ? matchingSubsets[0].color : '#94A3B8';

                  return (
                    <div
                      key={num}
                      style={{
                        padding: 10,
                        borderRadius: 14,
                        background: isHighlighted ? '#FFFFFF' : '#F1F5F9',
                        border: `2px solid ${primaryColor}`,
                        boxShadow: isHighlighted ? `0 4px 10px ${primaryColor}25` : 'none',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: 20, fontWeight: 900, color: isHighlighted ? '#0F172A' : '#64748B' }}>
                        {isNe ? toNp(num) : num}
                      </div>

                      {/* Subsets tags */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 4, minHeight: 18 }}>
                        {matchingSubsets.map((s) => (
                          <span
                            key={s.id}
                            style={{
                              fontSize: 10,
                              fontWeight: 900,
                              background: s.color,
                              color: '#FFFFFF',
                              padding: '1px 5px',
                              borderRadius: 4,
                            }}
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notation Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {selectedSubsets.map((subId) => {
                const sub = SUBSET_PRESETS.find((p) => p.id === subId)!;
                return (
                  <div key={sub.id} style={{ background: sub.bg, border: `1.5px solid ${sub.color}`, borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: sub.color, marginBottom: 4 }}>
                      {sub.name} = {isNe ? sub.titleNp : sub.titleEn}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                      {sub.name} = {'{ '}
                      {sub.elements.map((e) => (isNe ? toNp(e) : e)).join(', ')}
                      {' }'}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: sub.color, marginTop: 4 }}>
                      ✓ {sub.name} ⊂ U {L(`(${sub.name}, U को उचित उपसमूह हो)`, `(${sub.name} is a proper subset of U)`)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: BUILD SUBSETS INSIDE U ────────────────── */}
        {activeTab === 'builder' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('U बाट सदस्यहरू छानेर आफ्नो उपसमूह बनाउनुहोस्', 'Build Custom Subsets from U')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>
                  {L('Universal set U बाट कुनै पनि सङ्ख्याहरू छानेर उपसमूह तयार गर्नुहोस्।', 'Select elements from U to form a valid subset. Notice all elements stay strictly inside U.')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{L('उपसमूहको नाम:', 'Subset Name:')}</span>
                <input
                  type="text"
                  maxLength={2}
                  value={customSubsetName}
                  onChange={(e) => setCustomSubsetName(e.target.value.toUpperCase())}
                  style={{ width: 44, padding: '4px 8px', borderRadius: 8, border: '2px solid #CBD5E1', textAlign: 'center', fontWeight: 900, fontSize: 15 }}
                />
              </div>
            </div>

            {/* Generated Subset Display */}
            <div style={{ background: '#F0FDF4', border: '2px solid #16A34A', borderRadius: 16, padding: 18, textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#166534' }}>
                {customSubsetName} = {'{ '}
                <span style={{ color: '#0F172A' }}>
                  {customSubset.length > 0
                    ? [...customSubset].sort((a, b) => a - b).map((e) => (isNe ? toNp(e) : e)).join(', ')
                    : L('', '(Empty set ∅)')}
                </span>
                {' }'}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                n({customSubsetName}) = {isNe ? toNp(customSubset.length) : customSubset.length} &nbsp; • &nbsp; {customSubsetName} ⊆ U
              </div>
            </div>

            {/* Available elements in U */}
            <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 10 }}>
              {L('U का सदस्यहरू (क्लिक गरी थप्नुहोस् वा हटाउनुहोस्):', 'Elements of U (Click to toggle):')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {U_NUMBERS.map((num) => {
                const isSelected = customSubset.includes(num);
                return (
                  <button
                    key={num}
                    onClick={() => toggleCustomNumber(num)}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      border: isSelected ? '2px solid #16A34A' : '1px solid #CBD5E1',
                      background: isSelected ? '#DCFCE7' : '#FFFFFF',
                      color: isSelected ? '#166534' : '#0F172A',
                      fontWeight: 900,
                      fontSize: 18,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isNe ? toNp(num) : num}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 3: UNIVERSAL SET CHALLENGE ──────────────── */}
        {activeTab === 'challenge' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
                {L(`चुनौती ${toNp(challengeIdx + 1)} / ${toNp(CHALLENGE_CASES.length)}`, `Challenge ${challengeIdx + 1} of ${CHALLENGE_CASES.length}`)}
              </span>
              <button
                onClick={() => {
                  kit.tap();
                  setChallengeIdx((prev) => (prev + 1) % CHALLENGE_CASES.length);
                  setChallengeAnswer(null);
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
                {L('अर्को चुनौती →', 'Next Challenge →')}
              </button>
            </div>

            <div style={{ background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 700, marginBottom: 6 }}>
                {L('दिइएका समूहहरूका लागि कुन समूह उपयुक्त Universal set (U) हुन सक्छ?', 'Which is a suitable Universal Set (U) for the given groups?')}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A' }}>
                {isNe ? CHALLENGE_CASES[challengeIdx].givenNp : CHALLENGE_CASES[challengeIdx].givenEn}
              </div>
            </div>

            {/* Multiple Choice Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
              {CHALLENGE_CASES[challengeIdx].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const isCorrect = i === CHALLENGE_CASES[challengeIdx].correct;
                    if (isCorrect) {
                      kit.good('उत्कृष्ट! सही Universal set छनोट भयो।', 'Correct! That covers all elements.');
                      setChallengeAnswer(i);
                    } else {
                      kit.oops('गलत! यसमा सबै सदस्यहरू अटाउँदैनन्।', 'Incorrect! Does not contain all elements.');
                      setChallengeAnswer(i);
                    }
                  }}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: challengeAnswer === i
                      ? (i === CHALLENGE_CASES[challengeIdx].correct ? '2px solid #16A34A' : '2px solid #DC2626')
                      : '1px solid #CBD5E1',
                    background: challengeAnswer === i
                      ? (i === CHALLENGE_CASES[challengeIdx].correct ? '#DCFCE7' : '#FEE2E2')
                      : '#FFFFFF',
                    color: '#0F172A',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {challengeAnswer !== null && (
              <div style={{ padding: 14, borderRadius: 12, background: challengeAnswer === CHALLENGE_CASES[challengeIdx].correct ? '#DCFCE7' : '#FEE2E2', color: challengeAnswer === CHALLENGE_CASES[challengeIdx].correct ? '#166534' : '#991B1B', fontWeight: 700, fontSize: 13 }}>
                {isNe ? CHALLENGE_CASES[challengeIdx].reasonNp : CHALLENGE_CASES[challengeIdx].reasonEn}
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default UniversalSetExplorer;
