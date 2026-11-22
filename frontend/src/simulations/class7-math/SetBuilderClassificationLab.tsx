/**
 * SetBuilderClassificationLab.tsx
 * Grade 7 Mathematics – Lesson 1: SET (समूह)
 * Simulation 1: Set Builder and Classification Lab (2D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S.)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';
import { Check, X, Sparkles, HelpCircle, ArrowRight, RotateCcw, Plus, Trash2 } from 'lucide-react';

interface ElementItem {
  id: string;
  labelEn: string;
  labelNp: string;
  category: 'number' | 'letter' | 'fruit' | 'flower' | 'shape' | 'stationery';
  isEven?: boolean;
  isOdd?: boolean;
  isPrime?: boolean;
  isSquare?: boolean;
  isVowel?: boolean;
  val?: number;
}

const POOL_ITEMS: ElementItem[] = [
  { id: 'n1', labelEn: '1', labelNp: '१', category: 'number', isOdd: true, isSquare: true, val: 1 },
  { id: 'n2', labelEn: '2', labelNp: '२', category: 'number', isEven: true, isPrime: true, val: 2 },
  { id: 'n3', labelEn: '3', labelNp: '३', category: 'number', isOdd: true, isPrime: true, val: 3 },
  { id: 'n4', labelEn: '4', labelNp: '४', category: 'number', isEven: true, isSquare: true, val: 4 },
  { id: 'n5', labelEn: '5', labelNp: '५', category: 'number', isOdd: true, isPrime: true, val: 5 },
  { id: 'n6', labelEn: '6', labelNp: '६', category: 'number', isEven: true, val: 6 },
  { id: 'n7', labelEn: '7', labelNp: '७', category: 'number', isOdd: true, isPrime: true, val: 7 },
  { id: 'n8', labelEn: '8', labelNp: '८', category: 'number', isEven: true, val: 8 },
  { id: 'n9', labelEn: '9', labelNp: '९', category: 'number', isOdd: true, isSquare: true, val: 9 },
  { id: 'n10', labelEn: '10', labelNp: '१०', category: 'number', isEven: true, val: 10 },
  { id: 'n11', labelEn: '11', labelNp: '११', category: 'number', isOdd: true, isPrime: true, val: 11 },
  { id: 'n12', labelEn: '12', labelNp: '१२', category: 'number', isEven: true, val: 12 },
  { id: 'n13', labelEn: '13', labelNp: '१३', category: 'number', isOdd: true, isPrime: true, val: 13 },
  { id: 'la', labelEn: 'a', labelNp: 'a', category: 'letter', isVowel: true },
  { id: 'lb', labelEn: 'b', labelNp: 'b', category: 'letter' },
  { id: 'le', labelEn: 'e', labelNp: 'e', category: 'letter', isVowel: true },
  { id: 'li', labelEn: 'i', labelNp: 'i', category: 'letter', isVowel: true },
  { id: 'lo', labelEn: 'o', labelNp: 'o', category: 'letter', isVowel: true },
  { id: 'lu', labelEn: 'u', labelNp: 'u', category: 'letter', isVowel: true },
  { id: 'fa', labelEn: '🍎 Apple', labelNp: '🍎 स्याउ', category: 'fruit' },
  { id: 'fb', labelEn: '🍌 Banana', labelNp: '🍌 केरा', category: 'fruit' },
  { id: 'fm', labelEn: '🥭 Mango', labelNp: '🥭 आँप', category: 'fruit' },
  { id: 'fl1', labelEn: '🌹 Rose', labelNp: '🌹 गुलाब', category: 'flower' },
  { id: 'fl2', labelEn: '🪷 Lotus', labelNp: '🪷 कमल', category: 'flower' },
  { id: 'fl3', labelEn: '🌼 Marigold', labelNp: '🌼 सयपत्री', category: 'flower' },
  { id: 'sh1', labelEn: '⭕ Circle', labelNp: '⭕ वृत्त', category: 'shape' },
  { id: 'sh2', labelEn: '🔺 Triangle', labelNp: '🔺 त्रिभुज', category: 'shape' },
  { id: 'sh3', labelEn: '🟦 Square', labelNp: '🟦 वर्ग', category: 'shape' },
  { id: 'st1', labelEn: '✏️ Pencil', labelNp: '✏️ सिसाकलम', category: 'stationery' },
  { id: 'st2', labelEn: '📏 Ruler', labelNp: '📏 स्केल', category: 'stationery' },
  { id: 'st3', labelEn: '📖 Book', labelNp: '📖 पुस्तक', category: 'stationery' },
];

const PROPERTY_CHALLENGES = [
  {
    id: 'p1',
    titleEn: 'Set of Prime numbers less than 15',
    titleNp: '१५ भन्दा साना रुढ सङ्ख्याहरूको समूह',
    setName: 'P',
    expectedIds: ['n2', 'n3', 'n5', 'n7', 'n11', 'n13'],
    builderEn: '{ x : x is a prime number, x < 15 }',
    builderNp: '{ x : x एउटा रुढ सङ्ख्या हो, x < १५ }',
  },
  {
    id: 'p2',
    titleEn: 'Set of Even numbers less than 12',
    titleNp: '१२ भन्दा साना जोर सङ्ख्याहरूको समूह',
    setName: 'E',
    expectedIds: ['n2', 'n4', 'n6', 'n8', 'n10'],
    builderEn: '{ x : x is an even natural number, x < 12 }',
    builderNp: '{ x : x एउटा जोर प्राकृतिक सङ्ख्या हो, x < १२ }',
  },
  {
    id: 'p3',
    titleEn: 'Set of English Vowels',
    titleNp: 'अंग्रेजी स्वरवर्णहरूको समूह',
    setName: 'V',
    expectedIds: ['la', 'le', 'li', 'lo', 'lu'],
    builderEn: '{ x : x is a vowel in English alphabet }',
    builderNp: '{ x : x अंग्रेजी वर्णमालाको स्वरवर्ण हो }',
  },
  {
    id: 'p4',
    titleEn: 'Set of Square numbers up to 10',
    titleNp: '१० सम्मका पूर्ण वर्ग सङ्ख्याहरूको समूह',
    setName: 'S',
    expectedIds: ['n1', 'n4', 'n9'],
    builderEn: '{ x : x is a square number, x ≤ 10 }',
    builderNp: '{ x : x पूर्ण वर्ग सङ्ख्या हो, x ≤ १० }',
  },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'यदि A = {१, २, ३, ४, ५} भए, तलका मध्ये कुन कथन सत्य हो?',
    en: 'If A = {1, 2, 3, 4, 5}, which of the following statements is true?',
    options: [
      { key: 'A', label: '३ ∉ A' },
      { key: 'B', label: '४ ∈ A' },
      { key: 'C', label: '६ ∈ A' },
      { key: 'D', label: '० ∈ A' },
    ],
    answer: 'B',
  },
  {
    np: '१० भन्दा साना बिजोर सङ्ख्याहरूको समूहलाई सूचीकरण विधिमा कसरी लेखिन्छ?',
    en: 'How is the set of odd numbers less than 10 written in listing method?',
    options: [
      { key: 'A', label: '{२, ४, ६, ८}' },
      { key: 'B', label: '{१, ३, ५, ७, ९}' },
      { key: 'C', label: '{१, ३, ५, ७}' },
      { key: 'D', label: '{०, १, ३, ५, ७, ९}' },
    ],
    answer: 'B',
  },
  {
    np: 'समूह निर्माण विधि {x : x ≤ ५, x ∈ N} मा कुन कुन सदस्य पर्दछन्?',
    en: 'Which elements belong to the set-builder form {x : x ≤ 5, x ∈ N}?',
    options: [
      { key: 'A', label: '{०, १, २, ३, ४, ५}' },
      { key: 'B', label: '{१, २, ३, ४, ५}' },
      { key: 'C', label: '{१, २, ३, ४}' },
      { key: 'D', label: '{५}' },
    ],
    answer: 'B',
  },
  {
    np: 'यदि B = {a, e, i, o, u} भए n(B) को मान कति हुन्छ?',
    en: 'If B = {a, e, i, o, u}, what is the value of n(B)?',
    options: [
      { key: 'A', label: '४' },
      { key: 'B', label: '५' },
      { key: 'C', label: '६' },
      { key: 'D', label: '२६' },
    ],
    answer: 'B',
  },
];

export const SetBuilderClassificationLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({ onBackToLibrary, onBack }) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L1-01',
    titleEn: 'Set Builder and Classification Lab',
    titleNp: 'समूह निर्माण र वर्गीकरण प्रयोगशाला',
    chapter: 1,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'create' | 'property' | 'listing' | 'builder' | 'membership'>('create');
  const [selectedIds, setSelectedIds] = useState<string[]>(['n1', 'n2', 'n3', 'n4', 'n5', 'n6']);
  const [setName, setSetName] = useState<string>('A');
  const [activePropertyIdx, setActivePropertyIdx] = useState<number>(0);
  const [propertyPicks, setPropertyPicks] = useState<string[]>([]);
  const [checkStatus, setCheckStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Element membership activity state
  const [membershipTestId, setMembershipTestId] = useState<string>('n4');
  const [membershipAnswer, setMembershipAnswer] = useState<'in' | 'not_in' | null>(null);

  const toggleElement = (id: string) => {
    kit.tap();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const togglePropertyPick = (id: string) => {
    kit.tap();
    setCheckStatus('idle');
    setPropertyPicks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const currentProperty = PROPERTY_CHALLENGES[activePropertyIdx];

  const handleVerifyProperty = () => {
    const expected = currentProperty.expectedIds.slice().sort();
    const actual = propertyPicks.slice().sort();
    const isCorrect =
      expected.length === actual.length && expected.every((val, idx) => val === actual[idx]);

    if (isCorrect) {
      kit.good('उत्कृष्ट! सही समूह निर्माण भयो।', 'Excellent! Set correctly formed.');
      setCheckStatus('correct');
    } else {
      kit.oops('कृपया सदस्यहरू पुनः जाँच्नुहोस्।', 'Some elements are missing or incorrect.');
      setCheckStatus('wrong');
    }
  };

  const selectedElements = POOL_ITEMS.filter((item) => selectedIds.includes(item.id));
  const listingString = selectedElements.map((item) => (isNe ? item.labelNp : item.labelEn)).join(', ');

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! समूह (Set) भनेको वस्तुहरूको सुस्पष्ट सङ्कलन हो। आउनुहोस्, समूह बनाउन र लेख्न सिकौँ!',
        'Welcome! A Set is a well-defined collection of distinct objects. Let us build and describe sets!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'create', np: 'क्रियाकलाप १: समूह बनाउने', en: 'Activity A: Create a Set' },
            { id: 'property', np: 'क्रियाकलाप २: विशेषता पहिचान', en: 'Activity B: Find the Property' },
            { id: 'listing', np: 'क्रियाकलाप ३: सूचीकरण विधि', en: 'Activity C: Listing Method' },
            { id: 'builder', np: 'क्रियाकलाप ४: समूह निर्माण विधि', en: 'Activity D: Set-Builder Method' },
            { id: 'membership', np: 'क्रियाकलाप ५: सदस्य पहिचान (∈, ∉)', en: 'Activity E: Membership (∈, ∉)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                kit.tap();
                setActiveTab(tab.id as any);
                setCheckStatus('idle');
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

        {/* ── TAB 1: CREATE A SET ──────────────────────────── */}
        {activeTab === 'create' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1E293B' }}>
                  {L('वस्तुहरू छनोट गरी समूह निर्माण गर्नुहोस्', 'Select Elements and Create Your Set')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>
                  {L('तलका वस्तुहरूमा क्लिक गरेर समूहमा थप्न वा हटाउन सकिन्छ।', 'Click on elements below to add or remove them from the set container.')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{L('समूहको नाम:', 'Set Name:')}</span>
                <input
                  type="text"
                  maxLength={3}
                  value={setName}
                  onChange={(e) => setSetName(e.target.value.toUpperCase())}
                  style={{ width: 48, padding: '4px 8px', borderRadius: 8, border: '2px solid #CBD5E1', fontWeight: 800, textAlign: 'center', fontSize: 16 }}
                />
              </div>
            </div>

            {/* Set Display Container */}
            <div
              style={{
                minHeight: 120,
                background: '#F0FDF4',
                border: '2px dashed #16A34A',
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 900, color: '#166534', textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.6 }}>
                {setName} = {'{ '}
                <span style={{ color: '#0F172A', fontWeight: 700 }}>{listingString || L('(खाली समूह)', '(Empty Set)')}</span>
                {' }'}
              </div>
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                {L(`सदस्य सङ्ख्या n(${setName}) = ${toNp(selectedElements.length)}`, `Cardinality n(${setName}) = ${selectedElements.length}`)}
              </div>
            </div>

            {/* Element Pool */}
            <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 8 }}>
              {L('उपलब्ध वस्तुहरू (क्लिक गरी छान्नुहोस्):', 'Available Objects (Click to select/deselect):')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {POOL_ITEMS.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleElement(item.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      border: isSelected ? '2px solid #16A34A' : '1px solid #E2E8F0',
                      background: isSelected ? '#DCFCE7' : '#F8FAFC',
                      color: isSelected ? '#166534' : '#1E293B',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 6px rgba(22,163,74,0.15)' : 'none',
                    }}
                  >
                    {isNe ? item.labelNp : item.labelEn} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => {
                  kit.tap();
                  setSelectedIds([]);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Trash2 size={14} /> {L('खाली गर्नुहोस्', 'Clear All')}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: FIND THE PROPERTY ────────────────────── */}
        {activeTab === 'property' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: 6 }}>
                  {L(`नमुना ${toNp(activePropertyIdx + 1)} / ${toNp(PROPERTY_CHALLENGES.length)}`, `Challenge ${activePropertyIdx + 1} of ${PROPERTY_CHALLENGES.length}`)}
                </span>
                <h3 style={{ margin: '8px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {isNe ? currentProperty.titleNp : currentProperty.titleEn}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {PROPERTY_CHALLENGES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      kit.tap();
                      setActivePropertyIdx(idx);
                      setPropertyPicks([]);
                      setCheckStatus('idle');
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: 'none',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: activePropertyIdx === idx ? '#187C68' : '#F1F5F9',
                      color: activePropertyIdx === idx ? '#FFFFFF' : '#475569',
                    }}
                  >
                    {isNe ? toNp(idx + 1) : idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Set Construction Area */}
            <div
              style={{
                minHeight: 110,
                background: '#F8FAFC',
                border: '2px solid #CBD5E1',
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                {currentProperty.setName} = {'{ '}
                <span style={{ color: '#187C68' }}>
                  {propertyPicks.length > 0
                    ? propertyPicks.map((id) => {
                        const item = POOL_ITEMS.find((p) => p.id === id);
                        return isNe ? item?.labelNp : item?.labelEn;
                      }).join(', ')
                    : L('(वस्तुहरू छान्नुहोस्)', '(Click items to add)')}
                </span>
                {' }'}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: '#64748B' }}>
                {L(`छानिएका सदस्य: ${toNp(propertyPicks.length)} वटा`, `Selected elements: ${propertyPicks.length}`)}
              </div>
            </div>

            {/* Candidate Items for Property */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {POOL_ITEMS.slice(0, 20).map((item) => {
                const isSelected = propertyPicks.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => togglePropertyPick(item.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      border: isSelected ? '2px solid #187C68' : '1px solid #E2E8F0',
                      background: isSelected ? '#E6F3E9' : '#FFFFFF',
                      color: isSelected ? '#187C68' : '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    {isNe ? item.labelNp : item.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Verification and Feedback */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleVerifyProperty}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#187C68',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {L('उत्तर जाँच्नुहोस्', 'Check Answer')}
                </button>
                <button
                  onClick={() => {
                    kit.tap();
                    setPropertyPicks(currentProperty.expectedIds);
                    setCheckStatus('idle');
                  }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {L('सही उत्तर देखाउनुहोस्', 'Show Solution')}
                </button>
              </div>

              {checkStatus === 'correct' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16A34A', fontWeight: 800, fontSize: 14 }}>
                  <Check size={18} /> {L('स्याबास! तपाईंले सही समूह बनाउनुभयो।', 'Well done! That is exactly the set.')}
                </div>
              )}
              {checkStatus === 'wrong' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#DC2626', fontWeight: 800, fontSize: 14 }}>
                  <X size={18} /> {L('केही सदस्यहरू मिलेनन् वा छुटेका छन्।', 'Incorrect selection. Try again!')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: LISTING METHOD ───────────────────────── */}
        {activeTab === 'listing' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 12 }}>
              {L('सूचीकरण विधि (Listing Method / Roster Method)', 'Listing Method (Roster Method)')}
            </h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
              {L(
                'यस विधिमा समूहका सबै सदस्यहरूलाई कमा (,) ले छुट्ट्याएर घुम्रिएको कोष्ठक { } भित्र लेखिन्छ। उदाहरणका लागि:',
                'In this method, all elements of a set are listed separated by commas within curly brackets { }. For example:'
              )}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {[
                {
                  titleNp: '१५ भन्दा साना रुढ सङ्ख्याहरू:',
                  titleEn: 'Prime numbers less than 15:',
                  code: 'P = { 2, 3, 5, 7, 11, 13 }',
                  cardinalNp: 'जम्मा सदस्य n(P) = ६',
                  cardinalEn: 'Cardinality n(P) = 6',
                },
                {
                  titleNp: 'अंग्रेजी वर्णमालाका स्वरवर्णहरू:',
                  titleEn: 'Vowels of English alphabet:',
                  code: 'V = { a, e, i, o, u }',
                  cardinalNp: 'जम्मा सदस्य n(V) = ५',
                  cardinalEn: 'Cardinality n(V) = 5',
                },
                {
                  titleNp: '१० भन्दा साना जोर सङ्ख्याहरू:',
                  titleEn: 'Even natural numbers less than 10:',
                  code: 'E = { 2, 4, 6, 8 }',
                  cardinalNp: 'जम्मा सदस्य n(E) = ४',
                  cardinalEn: 'Cardinality n(E) = 4',
                },
                {
                  titleNp: '१२ का गुणनखण्डहरू (Factors of 12):',
                  titleEn: 'Factors of 12:',
                  code: 'F = { 1, 2, 3, 4, 6, 12 }',
                  cardinalNp: 'जम्मा सदस्य n(F) = ६',
                  cardinalEn: 'Cardinality n(F) = 6',
                },
              ].map((ex, idx) => (
                <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
                    {isNe ? ex.titleNp : ex.titleEn}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#187C68', fontFamily: 'monospace', marginBottom: 6 }}>
                    {ex.code}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', background: '#DCFCE7', display: 'inline-block', padding: '2px 8px', borderRadius: 6 }}>
                    {isNe ? ex.cardinalNp : ex.cardinalEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: SET-BUILDER METHOD ───────────────────── */}
        {activeTab === 'builder' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 12 }}>
              {L('समूह निर्माण विधि (Set-Builder Method / Rule Method)', 'Set-Builder Method (Rule Method)')}
            </h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
              {L(
                'यस विधिमा सदस्यहरूको सूची नलेखी तिनीहरूको साझा विशेषता जनाउने नियम लेखिन्छ। यसमा (:) चिन्हको अर्थ "यस्तो कि" (such that) हुन्छ।',
                'In this method, instead of listing all elements, a common defining property is specified using a variable x. The colon (:) means "such that".'
              )}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                {
                  listing: 'A = { 1, 3, 5, 7, 9 }',
                  builderEn: 'A = { x : x is an odd natural number, x < 10 }',
                  builderNp: 'A = { x : x एउटा १० भन्दा सानो बिजोर सङ्ख्या हो }',
                  explEn: 'Read as: "A is the set of all x such that x is an odd natural number less than 10"',
                  explNp: 'पढ्ने तरिका: "A भनेको सबै x हरूको समूह हो, यस्तो कि x, १० भन्दा सानो बिजोर सङ्ख्या हो"',
                },
                {
                  listing: 'P = { 2, 3, 5, 7, 11, 13 }',
                  builderEn: 'P = { x : x is a prime number, x < 15 }',
                  builderNp: 'P = { x : x एउटा १५ भन्दा सानो रुढ सङ्ख्या हो }',
                  explEn: 'Read as: "P is the set of all x such that x is a prime number less than 15"',
                  explNp: 'पढ्ने तरिका: "P भनेको १५ भन्दा साना रुढ सङ्ख्या x हरूको समूह हो"',
                },
                {
                  listing: 'S = { 1, 4, 9, 16, 25 }',
                  builderEn: 'S = { x : x is a square number, x ≤ 25 }',
                  builderNp: 'S = { x : x एउटा २५ सम्मको पूर्ण वर्ग सङ्ख्या हो }',
                  explEn: 'Read as: "S is the set of all square numbers up to 25"',
                  explNp: 'पढ्ने तरिका: "S भनेको २५ सम्मका पूर्ण वर्ग सङ्ख्याहरूको समूह हो"',
                },
              ].map((row, idx) => (
                <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 14, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
                      {L('सूचीकरण विधि:', 'Listing Method:')} <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{row.listing}</strong>
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 6 }}>
                      {L('समूह निर्माण रूप', 'Set-Builder Form')}
                    </span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#187C68', marginBottom: 6 }}>
                    {isNe ? row.builderNp : row.builderEn}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>
                    {isNe ? row.explNp : row.explEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: MEMBERSHIP IDENTIFICATION ────────────── */}
        {activeTab === 'membership' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>
              {L('सदस्य पहिचान: ∈ (पर्दछ) र ∉ (पर्दैन)', 'Element Membership: ∈ (belongs to) and ∉ (does not belong to)')}
            </h3>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 18 }}>
              {L('मानौँ A = {२, ३, ५, ७, ११} (१२ भन्दा साना रुढ सङ्ख्याहरू)। तलका कथनहरूको सत्यता जाँच गर्नुहोस्:', 'Given set A = {2, 3, 5, 7, 11}. Check membership for the test element:')}
            </p>

            <div style={{ background: '#E6F3E9', border: '2px solid #187C68', borderRadius: 16, padding: 18, textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#187C68' }}>
                A = {'{ 2, 3, 5, 7, 11 }'}
              </div>
            </div>

            {/* Test Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{L('परीक्षण गर्ने वस्तु छान्नुहोस्:', 'Select Element to Test:')}</span>
              {['2', '4', '5', '7', '9', '11', '13'].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    kit.tap();
                    setMembershipTestId(val);
                    setMembershipAnswer(null);
                  }}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    border: membershipTestId === val ? '2px solid #187C68' : '1px solid #CBD5E1',
                    background: membershipTestId === val ? '#187C68' : '#FFFFFF',
                    color: membershipTestId === val ? '#FFFFFF' : '#0F172A',
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  {isNe ? toNp(Number(val)) : val}
                </button>
              ))}
            </div>

            {/* Membership Decision Box */}
            <div style={{ textAlign: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 14 }}>
                {isNe ? toNp(Number(membershipTestId)) : membershipTestId}
                <span style={{ margin: '0 12px', color: '#187C68' }}>
                  {membershipAnswer === 'in' ? '∈' : membershipAnswer === 'not_in' ? '∉' : ' ? '}
                </span>
                A
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  onClick={() => {
                    const isElement = ['2', '3', '5', '7', '11'].includes(membershipTestId);
                    if (isElement) {
                      kit.good('सही! यो सदस्य समूह A मा पर्दछ (∈)।', 'Correct! Belongs to set A (∈).');
                      setMembershipAnswer('in');
                    } else {
                      kit.oops('गलत! यो सदस्य समूह A मा छैन।', 'Incorrect! It does not belong to set A.');
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#187C68',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  ∈ {L('पर्दछ (Is an element)', 'Belongs to (∈)')}
                </button>

                <button
                  onClick={() => {
                    const isElement = ['2', '3', '5', '7', '11'].includes(membershipTestId);
                    if (!isElement) {
                      kit.good('सही! यो सदस्य समूह A मा पर्दैन (∉)।', 'Correct! Does not belong to set A (∉).');
                      setMembershipAnswer('not_in');
                    } else {
                      kit.oops('गलत! यो त समूह A भित्रै छ।', 'Incorrect! It is already inside set A.');
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  ∉ {L('पर्दैन (Is NOT an element)', 'Does not belong to (∉)')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default SetBuilderClassificationLab;
