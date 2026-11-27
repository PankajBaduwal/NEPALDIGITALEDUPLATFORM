/**
 * SubsetBuilderLab.tsx
 * Grade 7 Mathematics – Lesson 1: SET
 * Simulation 5: Subset and Subset Builder Lab (2D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S.)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';
import { Check, X, Sparkles, HelpCircle, ArrowRight, RotateCcw, Box, Compass, Layers } from 'lucide-react';

interface InstrumentItem {
  id: string;
  nameEn: string;
  nameNp: string;
  icon: string;
}

const INSTRUMENT_BOX: InstrumentItem[] = [
  { id: 'compass', nameEn: 'Compass', nameNp: 'कम्पास', icon: '📐' },
  { id: 'protractor', nameEn: 'Protractor', nameNp: 'प्रोट्याक्टर', icon: '📏' },
  { id: 'setsquare', nameEn: 'Set Square', nameNp: 'सेट स्क्वायर', icon: '📐' },
  { id: 'ruler', nameEn: 'Ruler', nameNp: 'रुलर / स्केल', icon: '📏' },
];

const THREE_ELEMENT_SET = [1, 2, 3];

// All 2^3 = 8 subsets of {1, 2, 3}
const ALL_SUBSETS_OF_123: { label: string; elements: number[]; isProper: boolean; descNp: string; descEn: string }[] = [
  { label: '∅', elements: [], isProper: true, descNp: 'Empty subset', descEn: 'Empty subset (0 elements)' },
  { label: '{ 1 }', elements: [1], isProper: true, descNp: 'एकल उपसमूह', descEn: 'Single-element subset' },
  { label: '{ 2 }', elements: [2], isProper: true, descNp: 'एकल उपसमूह', descEn: 'Single-element subset' },
  { label: '{ 3 }', elements: [3], isProper: true, descNp: 'एकल उपसमूह', descEn: 'Single-element subset' },
  { label: '{ 1, 2 }', elements: [1, 2], isProper: true, descNp: 'दुई सदस्यीय उपसमूह', descEn: 'Two-element subset' },
  { label: '{ 1, 3 }', elements: [1, 3], isProper: true, descNp: 'दुई सदस्यीय उपसमूह', descEn: 'Two-element subset' },
  { label: '{ 2, 3 }', elements: [2, 3], isProper: true, descNp: 'दुई सदस्यीय उपसमूह', descEn: 'Two-element subset' },
  { label: '{ 1, 2, 3 }', elements: [1, 2, 3], isProper: false, descNp: 'Improper subset', descEn: 'Improper subset (all elements)' },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'यदि समूह A मा 3 pcs सदस्य छन् भने A का सम्भावित जम्मा उपसमूहहरूको सङ्ख्या कति हुन्छ?',
    en: 'If a set A has 3 elements, what is the total number of possible subsets?',
    options: [
      { key: 'A', label: '3' },
      { key: 'B', label: '6' },
      { key: 'C', label: '8 (2³ = 8)' },
      { key: 'D', label: '9' },
    ],
    answer: 'C',
  },
  {
    np: 'रिक्त समूह ∅ कुनै पनि अरिक्त समूहको कस्तो उपसमूह हो?',
    en: 'The empty set ∅ is what type of subset of every non-empty set?',
    options: [
      { key: 'A', label: 'Proper subset (⊂)' },
      { key: 'B', label: 'Improper subset' },
      { key: 'C', label: 'Universal set' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'A',
  },
  {
    np: 'प्रत्येक समूह आफ्नै कस्तो उपसमूह हुन्छ?',
    en: 'Every set is what type of subset of itself?',
    options: [
      { key: 'A', label: 'Proper subset' },
      { key: 'B', label: 'Improper subset (⊆)' },
      { key: 'C', label: 'Empty subset' },
      { key: 'D', label: 'Infinite subset' },
    ],
    answer: 'B',
  },
];

export const SubsetBuilderLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({ onBackToLibrary, onBack }) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L1-05',
    titleEn: 'Subset and Subset Builder Lab',
    titleNp: 'उपसमूह र उपसमूह निर्माण प्रयोगशाला',
    chapter: 1,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'instruments' | 'proper_improper' | 'all_subsets'>('instruments');

  // Tab 1 state: Geometry instrument box selection
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(['compass', 'protractor']);

  // Tab 3 state: All 8 subsets discovered
  const [discoveredSubsets, setDiscoveredSubsets] = useState<number[]>([0, 1]);

  const toggleInstrument = (id: string) => {
    kit.tap();
    setSelectedInstruments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleDiscovered = (idx: number) => {
    kit.tap();
    setDiscoveredSubsets((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const isFullSet = selectedInstruments.length === INSTRUMENT_BOX.length;
  const isEmptySet = selectedInstruments.length === 0;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'यदि समूह B का सबै सदस्यहरू समूह A मा पर्दछन् भने B लाई A को उपसमूह भनिन्छ। 2ⁿ सूत्रबाट सबै उपसमूह बनाउन सकिन्छ!',
        'If every element of Set B is in Set A, then B is a subset of A. Explore proper and improper subsets!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'instruments', np: 'क्रियाकलाप 1: ज्यामिति बक्सबाट उपसमूह', en: 'Activity 1: Geometry Box Subsets' },
            { id: 'proper_improper', np: 'क्रियाकलाप 2: उचित र Improper subset', en: 'Activity 2: Proper vs Improper' },
            { id: 'all_subsets', np: 'क्रियाकलाप 3: सबै 8 उपसमूहहरू (2ⁿ सूत्र)', en: 'Activity 3: All 8 Subsets (2ⁿ Rule)' },
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

        {/* ── TAB 1: GEOMETRY INSTRUMENT BOX ──────────────── */}
        {activeTab === 'instruments' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: 6 }}>
                  {L('पाठ्यपुस्तकको मुख्य उदाहरण (पृष्ठ 11)', 'Textbook Main Example (Page 11)')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('ज्यामिति बाकसका सामग्रीहरूको समूह र उपसमूह', 'Geometry Box: Subsets Construction')}
                </h3>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#187C68' }}>
                U = {'{ Compass, Protractor, Set square, Ruler }'}
              </div>
            </div>

            {/* Geometry Box Master Container */}
            <div style={{ background: '#F8FAFC', border: '2px solid #CBD5E1', borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 10 }}>
                {L('ज्यामिति बक्स U का सामग्रीहरू (क्लिक गरी उपसमूहमा राख्नुहोस्):', 'Objects in Geometry Box U (Click to include in subset):')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {INSTRUMENT_BOX.map((item) => {
                  const isSelected = selectedInstruments.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleInstrument(item.id)}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        border: isSelected ? '2px solid #187C68' : '1px solid #E2E8F0',
                        background: isSelected ? '#DCFCE7' : '#FFFFFF',
                        color: isSelected ? '#166534' : '#1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: 13,
                        boxShadow: isSelected ? '0 2px 6px rgba(22,163,74,0.15)' : 'none',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                        <span>{isNe ? item.nameNp : item.nameEn}</span>
                      </span>
                      <span>{isSelected ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subset Output Box */}
            <div
              style={{
                background: isFullSet ? '#FEF3C7' : '#F0FDF4',
                border: `2px solid ${isFullSet ? '#F59E0B' : '#16A34A'}`,
                borderRadius: 16,
                padding: 20,
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 6 }}>
                S = {'{ '}
                {selectedInstruments.length > 0
                  ? selectedInstruments
                      .map((id) => {
                        const it = INSTRUMENT_BOX.find((x) => x.id === id)!;
                        return isNe ? it.nameNp : it.nameEn;
                      })
                      .join(', ')
                  : L('', '(Empty subset ∅)')}
                {' }'}
              </div>

              <div style={{ fontSize: 14, fontWeight: 800, color: isFullSet ? '#B45309' : '#15803D' }}>
                {isEmptySet ? (
                  <span>∅ ⊂ U &nbsp; {L('', '(Empty set is a proper subset of U)')}</span>
                ) : isFullSet ? (
                  <span>S ⊆ U &nbsp; {L('', '(S equals U, making it an improper subset)')}</span>
                ) : (
                  <span>S ⊂ U &nbsp; {L(`(S, U को Proper subset हो, n(S) = ${toNp(selectedInstruments.length)})`, `(S is a proper subset of U, n(S) = ${selectedInstruments.length})`)}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: PROPER VS IMPROPER SUBSETS ───────────── */}
        {activeTab === 'proper_improper' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 12 }}>
              {L('Proper subset (⊂) र Improper subset (⊆) को भिन्नता', 'Proper Subsets (⊂) vs Improper Subsets (⊆)')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
              {/* Proper Subset Rule */}
              <div style={{ background: '#F0FDF4', border: '2px solid #16A34A', borderRadius: 16, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 900, fontSize: 16, marginBottom: 8 }}>
                  <Check size={20} /> {L('Proper subset (Proper Subset: ⊂)', 'Proper Subset (⊂)')}
                </div>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                  {L(
                    'यदि समूह B का सबै सदस्यहरू A मा पर्दछन् तर A मा कम्तीमा एउटा यस्तो सदस्य छ जो B मा पर्दैन भने, B लाई A को Proper subset (B ⊂ A) भनिन्छ।',
                    'If all elements of B are in A, but A contains at least one element not in B, then B is a proper subset of A (B ⊂ A).'
                  )}
                </p>
                <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, border: '1px solid #86EFAC', fontSize: 13, fontWeight: 800, color: '#166534' }}>
                  {L('नमुना: U = {a, e, i, o, u} र A = {a, e}', 'Example: U = {a, e, i, o, u} and A = {a, e}')}
                  <br />
                  ⟹ A ⊂ U {L('', '(Proper subset)')}
                </div>
              </div>

              {/* Improper Subset Rule */}
              <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: 16, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#92400E', fontWeight: 900, fontSize: 16, marginBottom: 8 }}>
                  <Layers size={20} /> {L('Improper subset (Improper Subset: ⊆)', 'Improper Subset (⊆)')}
                </div>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                  {L(
                    'यदि कुनै समूहले अर्को समूहका सबै सदस्यहरू समेट्छ (अर्थात् दुवै समूह बराबर छन्) भने, त्यसलाई Improper subset (⊆) भनिन्छ। प्रत्येक समूह आफ्नै Improper subset हुन्छ (A ⊆ A)।',
                    'If a subset contains all elements of the original set (i.e. they are equal), it is called an improper subset (⊆). Every set is an improper subset of itself (A ⊆ A).'
                  )}
                </p>
                <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, border: '1px solid #FDE68A', fontSize: 13, fontWeight: 800, color: '#92400E' }}>
                  {L('नमुना: U = {a, e, i, o, u} र C = {a, e, i, o, u}', 'Example: U = {a, e, i, o, u} and C = {a, e, i, o, u}')}
                  <br />
                  ⟹ C ⊆ U {L('', '(Improper subset since C = U)')}
                </div>
              </div>
            </div>

            {/* Empty Set Rule Card */}
            <div style={{ background: '#F8FAFC', borderLeft: '4px solid #187C68', padding: 16, borderRadius: '0 12px 12px 0' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#187C68', marginBottom: 4 }}>
                ⭐ {L('रिक्त समूहको विशेष नियम:', 'Special Rule of Empty Set:')}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                {L(
                  'रिक्त समूह ∅ प्रत्येक अरिक्त समूहको Proper subset (Proper Subset) हुन्छ। त्यसैले ∅ ⊂ A सधैँ सत्य हुन्छ।',
                  'The empty set ∅ is a proper subset of every non-empty set. Therefore, ∅ ⊂ A is always true.'
                )}
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 3: ALL 8 SUBSETS (2^N FORMULA) ──────────── */}
        {activeTab === 'all_subsets' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
                  {L('सूत्र: जम्मा उपसमूह = 2ⁿ', 'Formula: Total Subsets = 2ⁿ')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('A = {1, 2, 3} का सम्भावित सबै 8 pcs उपसमूहहरू निर्माण गर्नुहोस्', 'Generate All 8 Subsets of A = {1, 2, 3}')}
                </h3>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#187C68', background: '#F0FDF4', padding: '6px 14px', borderRadius: 10 }}>
                n = {isNe ? '3' : '3'} ⟹ 2³ = {isNe ? '8' : '8'} {L('उपसमूहहरू', 'subsets')}
              </div>
            </div>

            {/* Clickable 8 Subsets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              {ALL_SUBSETS_OF_123.map((sub, idx) => {
                const isDiscovered = discoveredSubsets.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleDiscovered(idx)}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      border: isDiscovered ? (sub.isProper ? '2px solid #16A34A' : '2px solid #F59E0B') : '2px dashed #CBD5E1',
                      background: isDiscovered ? (sub.isProper ? '#F0FDF4' : '#FEF3C7') : '#F8FAFC',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isDiscovered ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B' }}>
                        #{idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: sub.isProper ? '#DCFCE7' : '#FDE68A',
                          color: sub.isProper ? '#166534' : '#92400E',
                        }}
                      >
                        {sub.isProper ? L('उचित ⊂', 'Proper ⊂') : L('अनुचित ⊆', 'Improper ⊆')}
                      </span>
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', fontFamily: 'monospace', marginBottom: 4 }}>
                      {sub.label}
                    </div>

                    <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                      {isNe ? sub.descNp : sub.descEn}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <button
                onClick={() => {
                  kit.tap();
                  setDiscoveredSubsets([0, 1, 2, 3, 4, 5, 6, 7]);
                  kit.good(L('सबै 8 उपसमूहहरू देखाइए!', 'All 8 subsets revealed!'));
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#187C68',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {L('सबै 8 उपसमूहहरू खोल्नुहोस्', 'Reveal All 8 Subsets')}
              </button>

              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                {L(`पत्ता लागेका: ${toNp(discoveredSubsets.length)} / 8`, `Discovered: ${discoveredSubsets.length} / 8`)}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default SubsetBuilderLab;
