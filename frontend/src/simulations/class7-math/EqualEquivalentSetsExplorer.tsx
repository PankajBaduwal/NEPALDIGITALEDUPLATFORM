/**
 * EqualEquivalentSetsExplorer.tsx
 * Grade 7 Mathematics – Lesson 1: SET
 * Simulation 3: Equal and Equivalent Sets Explorer (2D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S.)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';
import { Check, X, Sparkles, HelpCircle, ArrowRight, RotateCcw, Plus, Trash2, ArrowLeftRight } from 'lucide-react';

interface ComparePreset {
  id: string;
  titleEn: string;
  titleNp: string;
  setA: string[];
  setB: string[];
  isEqual: boolean;
  isEquivalent: boolean;
  reasonEn: string;
  reasonNp: string;
}

const PRESETS: ComparePreset[] = [
  {
    id: 'p1',
    titleEn: 'Letters vs Numbers (Count matches, elements differ)',
    titleNp: 'अक्षर र सङ्ख्या (सङ्ख्या बराबर तर सदस्य फरक)',
    setA: ['a', 'b', 'c'],
    setB: ['1', '2', '3'],
    isEqual: false,
    isEquivalent: true,
    reasonEn: 'n(A) = 3 and n(B) = 3, so A ~ B (Equivalent). But elements are completely different, so A ≠ B.',
    reasonNp: 'दुवै समूहमा 3-3 pcs सदस्य छन् [n(A)=n(B)=3], त्यसैले यी समतुल्य (A ~ B) हुन्। तर सदस्यहरू फरक भएकाले बराबर होइनन् (A ≠ B)।',
  },
  {
    id: 'p2',
    titleEn: 'Identical elements in different order',
    titleNp: 'उही सदस्यहरू फरक क्रममा',
    setA: ['1', '2', '3'],
    setB: ['3', '2', '1'],
    isEqual: true,
    isEquivalent: true,
    reasonEn: 'Both sets have identical elements {1, 2, 3}. Order does not matter in sets! A = B and A ~ B.',
    reasonNp: 'दुवै समूहमा ठीक उही सदस्यहरू 1, 2 र 3 छन्। समूहमा क्रमले फरक पार्दैन! त्यसैले A = B र A ~ B दुवै हो।',
  },
  {
    id: 'p3',
    titleEn: 'Different counts (Unequal and non-equivalent)',
    titleNp: 'सदस्य सङ्ख्या फरक (न बराबर, न समतुल्य)',
    setA: ['1', '2'],
    setB: ['1', '2', '3'],
    isEqual: false,
    isEquivalent: false,
    reasonEn: 'n(A) = 2 while n(B) = 3. Since counts differ and elements are not identical, sets are neither equal nor equivalent.',
    reasonNp: 'n(A) = 2 and n(B) = 3। सदस्य सङ्ख्या बराबर नभएकाले यी समूहहरू न बराबर हुन् न त समतुल्य नै।',
  },
  {
    id: 'p4',
    titleEn: 'Colors vs Shapes (Equal counts)',
    titleNp: 'रङ र आकृति (बराबर सदस्य सङ्ख्या)',
    setA: ['🔴 Red', '🟢 Green', '🔵 Blue', '🟡 Yellow'],
    setB: ['⭕ Circle', '🔺 Triangle', '🟦 Square', '⭐ Star'],
    isEqual: false,
    isEquivalent: true,
    reasonEn: 'n(A) = 4 and n(B) = 4. They form a 1-to-1 correspondence. A ~ B, but A ≠ B.',
    reasonNp: 'n(A) = 4 and n(B) = 4। 1-का-लागि-1 जोडा मिलाउन सकिन्छ। त्यसैले A ~ B तर A ≠ B।',
  },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'यदि A = {a, b, c} र B = {1, 2, 3} भए तलका मध्ये कुन सम्बन्ध सही हो?',
    en: 'If A = {a, b, c} and B = {1, 2, 3}, which relationship is true?',
    options: [
      { key: 'A', label: 'A = B' },
      { key: 'B', label: 'A ~ B' },
      { key: 'C', label: 'A = ∅' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'B',
  },
  {
    np: 'बराबर समूह (Equal Sets) हुनको लागि के हुनुपर्छ?',
    en: 'What is required for two sets to be Equal Sets?',
    options: [
      { key: 'A', label: 'Only the number of members must be equal' },
      { key: 'B', label: 'They must have exactly the same members (even if the order differs)' },
      { key: 'C', label: 'The members must be 1, 2, 3' },
      { key: 'D', label: 'There must be no members' },
    ],
    answer: 'B',
  },
  {
    np: '"सबै बराबर समूहहरू समतुल्य हुन्छन्, तर सबै समतुल्य समूहहरू बराबर हुँदैनन्।" यो भनाइ:',
    en: '"All equal sets are equivalent, but not all equivalent sets are equal." This statement is:',
    options: [
      { key: 'A', label: 'Always true' },
      { key: 'B', label: 'Always false' },
      { key: 'C', label: 'True only sometimes' },
      { key: 'D', label: 'Cannot be said' },
    ],
    answer: 'A',
  },
];

export const EqualEquivalentSetsExplorer: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({ onBackToLibrary, onBack }) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L1-03',
    titleEn: 'Equal and Equivalent Sets Explorer',
    titleNp: 'बराबर र समतुल्य समूह अन्वेषक',
    chapter: 1,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'learn_equiv' | 'learn_equal' | 'interactive' | 'master_proof'>('interactive');
  const [activePresetIdx, setActivePresetIdx] = useState<number>(0);

  // Interactive playground sets
  const [customA, setCustomA] = useState<string[]>(['1', '2', '3']);
  const [customB, setCustomB] = useState<string[]>(['a', 'b', 'c']);
  const [newInputA, setNewInputA] = useState('');
  const [newInputB, setNewInputB] = useState('');

  // Computations
  const countA = customA.length;
  const countB = customB.length;
  const isEquivalent = countA === countB;

  const sortedA = [...customA].sort();
  const sortedB = [...customB].sort();
  const isEqual = isEquivalent && sortedA.every((val, idx) => val === sortedB[idx]);

  const addElementToA = () => {
    const trimmed = newInputA.trim();
    if (!trimmed) return;
    if (customA.includes(trimmed)) {
      kit.oops('यो सदस्य समूह A मा पहिले नै छ!', 'Element already in Set A!');
      return;
    }
    kit.tap();
    setCustomA((prev) => [...prev, trimmed]);
    setNewInputA('');
  };

  const addElementToB = () => {
    const trimmed = newInputB.trim();
    if (!trimmed) return;
    if (customB.includes(trimmed)) {
      kit.oops('यो सदस्य समूह B मा पहिले नै छ!', 'Element already in Set B!');
      return;
    }
    kit.tap();
    setCustomB((prev) => [...prev, trimmed]);
    setNewInputB('');
  };

  const removeElementA = (item: string) => {
    kit.tap();
    setCustomA((prev) => prev.filter((x) => x !== item));
  };

  const removeElementB = (item: string) => {
    kit.tap();
    setCustomB((prev) => prev.filter((x) => x !== item));
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'समतुल्य समूह (A ~ B) मा सदस्यहरूको सङ्ख्या बराबर हुन्छ। बराबर समूह (A = B) मा ठीक उही सदस्यहरू हुन्छन्। आउनुहोस्, अन्वेषण गरौँ!',
        'Equivalent sets (A ~ B) have the same count of elements. Equal sets (A = B) have identical elements. Let us explore!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'interactive', np: 'क्रियाकलाप 1: अन्तरक्रियात्मक प्रयोगशाला', en: 'Activity 1: Interactive Lab' },
            { id: 'learn_equiv', np: 'क्रियाकलाप 2: समतुल्य समूह (A ~ B)', en: 'Activity 2: Equivalent Sets (A ~ B)' },
            { id: 'learn_equal', np: 'क्रियाकलाप 3: बराबर समूह (A = B)', en: 'Activity 3: Equal Sets (A = B)' },
            { id: 'master_proof', np: 'क्रियाकलाप 4: मुख्य नियम तथा चुनौती', en: 'Activity 4: Golden Rule & Proof' },
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

        {/* ── TAB 1: INTERACTIVE LAB ──────────────────────── */}
        {activeTab === 'interactive' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('समूह A र B मा सदस्यहरू थपेर वा हटाएर तुलना गर्नुहोस्', 'Compare Set A and Set B')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>
                  {L('दुवै समूहका सदस्यहरू परिवर्तन गर्दा प्रत्यक्ष सम्बन्ध परिवर्तन हुन्छ।', 'Modify elements in both sets and observe the mathematical relationship in real-time.')}
                </p>
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {PRESETS.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      kit.tap();
                      setActivePresetIdx(idx);
                      setCustomA(p.setA);
                      setCustomB(p.setB);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      background: activePresetIdx === idx ? '#187C68' : '#F1F5F9',
                      color: activePresetIdx === idx ? '#FFFFFF' : '#334155',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {L(`नमुना ${toNp(idx + 1)}`, `Preset ${idx + 1}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Side-by-Side Set Containers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
              {/* SET A */}
              <div style={{ background: '#EFF6FF', border: '2px solid #3B82F6', borderRadius: 16, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#1D4ED8' }}>
                    {L('समूह A (Set A)', 'Set A')}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: 6 }}>
                    n(A) = {isNe ? toNp(countA) : countA}
                  </div>
                </div>

                <div style={{ minHeight: 90, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  {customA.length === 0 ? (
                    <span style={{ color: '#94A3B8', fontSize: 13, fontStyle: 'italic' }}>{L('', '(Empty set ∅)')}</span>
                  ) : (
                    customA.map((item) => (
                      <span
                        key={item}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: '#FFFFFF',
                          border: '1px solid #93C5FD',
                          fontWeight: 800,
                          fontSize: 14,
                          color: '#1E3A8A',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {item}
                        <button
                          onClick={() => removeElementA(item)}
                          style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontWeight: 900, fontSize: 12 }}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add to A */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    placeholder={L('नयाँ सदस्य...', 'Add element...')}
                    value={newInputA}
                    onChange={(e) => setNewInputA(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addElementToA()}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                  <button
                    onClick={addElementToA}
                    style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#3B82F6', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', fontSize: 13 }}
                  >
                    + {L('थप्नुहोस्', 'Add')}
                  </button>
                </div>
              </div>

              {/* SET B */}
              <div style={{ background: '#FDF2F8', border: '2px solid #EC4899', borderRadius: 16, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#BE185D' }}>
                    {L('समूह B (Set B)', 'Set B')}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, background: '#FCE7F3', color: '#9D174D', padding: '2px 8px', borderRadius: 6 }}>
                    n(B) = {isNe ? toNp(countB) : countB}
                  </div>
                </div>

                <div style={{ minHeight: 90, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  {customB.length === 0 ? (
                    <span style={{ color: '#94A3B8', fontSize: 13, fontStyle: 'italic' }}>{L('', '(Empty set ∅)')}</span>
                  ) : (
                    customB.map((item) => (
                      <span
                        key={item}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: '#FFFFFF',
                          border: '1px solid #F9A8D4',
                          fontWeight: 800,
                          fontSize: 14,
                          color: '#831843',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {item}
                        <button
                          onClick={() => removeElementB(item)}
                          style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontWeight: 900, fontSize: 12 }}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add to B */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    placeholder={L('नयाँ सदस्य...', 'Add element...')}
                    value={newInputB}
                    onChange={(e) => setNewInputB(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addElementToB()}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                  <button
                    onClick={addElementToB}
                    style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#EC4899', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', fontSize: 13 }}
                  >
                    + {L('थप्नुहोस्', 'Add')}
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE MATHEMATICAL RELATIONSHIP DASHBOARD */}
            <div
              style={{
                background: isEqual ? '#DCFCE7' : isEquivalent ? '#FEF9C3' : '#F1F5F9',
                border: `2px solid ${isEqual ? '#16A34A' : isEquivalent ? '#CA8A04' : '#94A3B8'}`,
                borderRadius: 16,
                padding: 20,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>
                {isEqual ? (
                  <span style={{ color: '#166534' }}>A = B &nbsp; {L('', '(Equal & Equivalent Sets)')}</span>
                ) : isEquivalent ? (
                  <span style={{ color: '#854D0E' }}>A ~ B &nbsp; {L('', '(Equivalent but NOT Equal)')}</span>
                ) : (
                  <span style={{ color: '#475569' }}>A ≠ B &nbsp; {L('', '(Neither Equal nor Equivalent)')}</span>
                )}
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
                {isEqual
                  ? L(
                      `दुवै समूहमा सदस्य सङ्ख्या बराबर छ [n(A) = n(B) = ${toNp(countA)}] र प्रत्येक सदस्य ठीक उस्तै छन्। त्यसैले यी दुवै बराबर र समतुल्य हुन्।`,
                      `Both sets have the identical elements and identical count [n(A) = n(B) = ${countA}]. Thus they are both equal and equivalent.`
                    )
                  : isEquivalent
                  ? L(
                      `दुवै समूहमा सदस्य सङ्ख्या बराबर छ [n(A) = n(B) = ${toNp(countA)}]। तर सदस्यहरू उही नभएकाले यी समतुल्य (A ~ B) हुन्, बराबर (A = B) होइनन्।`,
                      `Both sets have equal number of elements [n(A) = n(B) = ${countA}], making them Equivalent (A ~ B). However, elements are not identical, so they are NOT Equal.`
                    )
                  : L(
                      `सदस्य सङ्ख्या फरक छ [n(A) = ${toNp(countA)} ≠ n(B) = ${toNp(countB)}]। त्यसैले यी न समतुल्य हुन्, न त बराबर।`,
                      `Element counts differ [n(A) = ${countA} ≠ n(B) = ${countB}]. Thus they are neither equal nor equivalent.`
                    )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: EQUIVALENT SETS DEEP-DIVE ─────────────── */}
        {activeTab === 'learn_equiv' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 12 }}>
              {L('समतुल्य समूह (Equivalent Sets): A ~ B', 'Equivalent Sets: A ~ B')}
            </h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
              {L(
                'दुई वा दुईभन्दा बढी समूहहरूमा सदस्यहरूको सङ्ख्या बराबर छ भने तिनीहरूलाई समतुल्य समूह भनिन्छ। समतुल्य समूहका सदस्यहरू उस्तै हुनु आवश्यक छैन, केवल सदस्य सङ्ख्या n(A) = n(B) हुनुपर्छ।',
                'If two or more sets have the same number of elements, they are called Equivalent sets. Their elements do not need to be identical, only their counts n(A) = n(B) must match.'
              )}
            </p>

            {/* 1-to-1 Correspondence Graphic */}
            <div style={{ background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#187C68', textAlign: 'center', marginBottom: 16 }}>
                {L('1-का-लागि-1 जोडा (One-to-One Correspondence):', 'One-to-One Correspondence:')}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: 500, margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1E40AF' }}>A = {'{a, b, c}'}</div>
                  {['a', 'b', 'c'].map((item) => (
                    <div key={item} style={{ width: 42, height: 42, borderRadius: 10, background: '#DBEAFE', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>
                      {item}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, color: '#187C68' }}>
                  <div style={{ height: 21 }}></div>
                  <ArrowLeftRight size={24} />
                  <ArrowLeftRight size={24} />
                  <ArrowLeftRight size={24} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#9D174D' }}>B = {'{1, 2, 3}'}</div>
                  {['1', '2', '3'].map((item) => (
                    <div key={item} style={{ width: 42, height: 42, borderRadius: 10, background: '#FCE7F3', color: '#9D174D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>
                      {isNe ? toNp(Number(item)) : item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', background: '#DCFCE7', padding: '12px 18px', borderRadius: 12, textAlign: 'center' }}>
              n(A) = {isNe ? '3' : '3'} &nbsp; and &nbsp; n(B) = {isNe ? '3' : '3'} &nbsp; ⟹ &nbsp; A ~ B
            </div>
          </div>
        )}

        {/* ── TAB 3: EQUAL SETS DEEP-DIVE ──────────────────── */}
        {activeTab === 'learn_equal' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 12 }}>
              {L('बराबर समूह (Equal Sets): A = B', 'Equal Sets: A = B')}
            </h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
              {L(
                'यदि समूह A का सबै सदस्यहरू समूह B मा पर्दछन् र समूह B का सबै सदस्यहरू समूह A मा पर्दछन् भने तिनीहरूलाई बराबर समूह भनिन्छ। सदस्यहरूको क्रम फरक भए पनि समूह बराबर नै हुन्छ।',
                'If every element of Set A is in Set B and every element of Set B is in Set A, they are Equal sets. The order of elements does not matter.'
              )}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div style={{ background: '#F0FDF4', border: '2px solid #16A34A', borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginBottom: 6 }}>
                  {L('उदाहरण 1: सङ्ख्याको क्रम परिवर्तन', 'Example 1: Order permutation')}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', fontFamily: 'monospace', marginBottom: 6 }}>
                  A = {'{ 1, 2, 3 }'}, &nbsp; B = {'{ 3, 2, 1 }'}
                </div>
                <div style={{ fontSize: 13, color: '#15803D', fontWeight: 700 }}>
                  ✓ A = B {L('', '(Order does not matter)')}
                </div>
              </div>

              <div style={{ background: '#F0FDF4', border: '2px solid #16A34A', borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginBottom: 6 }}>
                  {L('उदाहरण 2: शब्दका अक्षरहरू', 'Example 2: Letters of Words')}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', fontFamily: 'monospace', marginBottom: 6 }}>
                  A = {'{ E, A, T }'}, &nbsp; B = {'{ T, E, A }'}
                </div>
                <div style={{ fontSize: 13, color: '#15803D', fontWeight: 700 }}>
                  ✓ A = B {L('', '(Exactly the same letters)')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: MASTER PROOF CHALLENGE ───────────────── */}
        {activeTab === 'master_proof' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                🏆 {L('पाठ्यपुस्तकको मुख्य अवधारणात्मक प्रश्न', 'Core Textbook Concept Challenge')}
              </div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#78350F', lineHeight: 1.4 }}>
                "{L('सबै बराबर समूहहरू समतुल्य हुन्छन्, तर के सबै समतुल्य समूहहरू बराबर हुन्छन्?', 'All equal sets are equivalent, but are all equivalent sets equal?')}"
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {/* Part 1 */}
              <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 900, fontSize: 15, marginBottom: 8 }}>
                  <Check size={18} /> {L('पहिलो भाग: Always true', 'Part 1: Always True')}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                  {L(
                    'यदि A = B भए दुवैमा ठ्याक्कै उही सदस्यहरू हुन्छन्। त्यसैले तिनीहरूको सदस्य सङ्ख्या पनि स्वतः बराबर हुन्छ [n(A) = n(B)]। अतः सबै बराबर समूहहरू अनिवार्य रूपमा समतुल्य (A ~ B) हुन्छन्।',
                    'If A = B, they have identical elements. Hence their counts are automatically equal [n(A) = n(B)]. Therefore, all equal sets are ALWAYS equivalent.'
                  )}
                </p>
              </div>

              {/* Part 2 */}
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#DC2626', fontWeight: 900, fontSize: 15, marginBottom: 8 }}>
                  <X size={18} /> {L('दोस्रो भाग: सधैँ बराबर हुँदैनन् (Not Always Equal)', 'Part 2: Not Always Equal')}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                  {L(
                    'मानौँ A = {1, 2, 3} र B = {a, b, c}। यहाँ n(A) = n(B) = 3 भएकोले A ~ B हो। तर सदस्यहरू फरक भएकाले A ≠ B हो। त्यसैले सबै समतुल्य समूहहरू बराबर हुँदैनन्!',
                    'For example, A = {1, 2, 3} and B = {a, b, c}. Here n(A) = n(B) = 3, so A ~ B. But the elements are completely different, so A ≠ B. Thus, equivalent sets are NOT necessarily equal.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default EqualEquivalentSetsExplorer;
