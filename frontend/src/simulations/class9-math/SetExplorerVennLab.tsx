import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Layers, Sparkles, CheckCircle2, RefreshCw, Plus, X } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'यदि A = {1, 2, 3, 4} र B = {3, 4, 5, 6} भए A ∩ B कुन हो?',
    en: 'If A = {1, 2, 3, 4} and B = {3, 4, 5, 6}, what is A ∩ B (intersection)?',
    options: [
      { key: 'A', label: '{3, 4} / {3, 4}' },
      { key: 'B', label: '{1, 2, 5, 6}' },
      { key: 'C', label: '{1, 2, 3, 4, 5, 6}' },
      { key: 'D', label: '∅ (empty set)' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि U = {1, 2, ..., 10} र A = {2, 4, 6, 8, 10} भए A को पूरक समूह Ā (वा A\') कति हुन्छ?',
    en: "If U = {1, 2, ..., 10} and A = {2, 4, 6, 8, 10}, what is the complement A'?",
    options: [
      { key: 'A', label: '{1, 3, 5, 7, 9} (odd numbers)' },
      { key: 'B', label: '{2, 4, 6, 8, 10}' },
      { key: 'C', label: '{1, 2, 3, 4, 5}' },
      { key: 'D', label: 'U' },
    ],
    answer: 'A',
  },
  {
    np: 'समूहको अन्तर (Difference of Sets) A − B को अर्थ के हो?',
    en: 'What does the difference of sets A - B mean?',
    options: [
      { key: 'A', label: 'The set of members in A but not in B ({x : x ∈ A and x ∉ B})' },
      { key: 'B', label: 'Members in B but not in A' },
      { key: 'C', label: 'Common members in both A and B' },
      { key: 'D', label: 'All members of A and B' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि दुई समूह A र B मा कुनै पनि साझा सदस्य छैन (A ∩ B = ∅) भने तिनीहरूलाई के भनिन्छ?',
    en: 'If two sets A and B have no common elements (A ∩ B = ∅), what are they called?',
    options: [
      { key: 'A', label: 'Disjoint sets' },
      { key: 'B', label: 'Overlapping sets' },
      { key: 'C', label: 'Subset' },
      { key: 'D', label: 'Equal sets' },
    ],
    answer: 'A',
  },
];

type SetOperation =
  | 'none'
  | 'union'
  | 'intersect'
  | 'diff_A_B'
  | 'diff_B_A'
  | 'comp_A'
  | 'comp_B'
  | 'comp_union'
  | 'sym_diff';

interface PresetItem {
  id: string;
  nameNp: string;
  nameEn: string;
  U: string[];
  A: string[];
  B: string[];
  descNp: string;
}

const PRESET_DOMAINS: PresetItem[] = [
  {
    id: 'numbers',
    nameNp: 'Numbers (1 to 10)',
    nameEn: 'Numbers (1 to 10)',
    U: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    A: ['2', '4', '6', '8', '10'], // Even numbers
    B: ['3', '6', '9'], // Multiples of 3
    descNp: 'U = {natural numbers from 1 to 10}, A = {even numbers}, B = {multiples of 3}',
  },
  {
    id: 'fruits',
    nameNp: 'Fruits',
    nameEn: 'Fruits and Colors',
    U: ['Apple', 'Banana', 'Orange', 'Grapes', 'Mango', 'Guava', 'Pomegranate'],
    A: ['Apple', 'Banana', 'Orange', 'Mango'],
    B: ['Orange', 'Grapes', 'Mango', 'Pomegranate'],
    descNp: 'U = {नेपालमा पाइने फलहरू}, A = {गर्मियामका फलहरू}, B = {रसिला फलहरू}',
  },
  {
    id: 'subjects',
    nameNp: 'School subjects',
    nameEn: 'School Subjects',
    U: ['Maths', 'Science', 'Nepali', 'English', 'Social', 'Health', 'Computer'],
    A: ['Maths', 'Science', 'Computer'],
    B: ['Science', 'Health', 'Computer', 'Social'],
    descNp: 'U = {कक्षा 9 का विषयहरू}, A = {प्राविधिक विषयहरू}, B = {प्रयोगात्मक विषयहरू}',
  },
];

export const SetExplorerVennLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U1-01',
    chapter: 1,
    titleNp: 'समूह अन्वेषक र भेन चित्र प्रयोगशाला',
    titleEn: 'Set Explorer and Venn Diagram Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'two_set' | 'three_set' | 'relations'>('two_set');

  // Two-Set State
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [universe, setUniverse] = useState<string[]>(PRESET_DOMAINS[0].U);
  const [setA, setSetA] = useState<string[]>(PRESET_DOMAINS[0].A);
  const [setB, setSetB] = useState<string[]>(PRESET_DOMAINS[0].B);
  const [currentOp, setCurrentOp] = useState<SetOperation>('union');
  const [newElem, setNewElem] = useState<string>('');

  // Three-Set State
  const [set3A] = useState<string[]>(['1', '2', '4', '5']);
  const [set3B] = useState<string[]>(['2', '3', '5', '6']);
  const [set3C] = useState<string[]>(['4', '5', '6', '7']);
  const [universe3] = useState<string[]>(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  const [threeOp, setThreeOp] = useState<'union' | 'intersect' | 'center' | 'none'>('center');

  // Compute 2-set partitions
  const onlyA = useMemo(() => setA.filter((x) => !setB.includes(x)), [setA, setB]);
  const intersectAB = useMemo(() => setA.filter((x) => setB.includes(x)), [setA, setB]);
  const onlyB = useMemo(() => setB.filter((x) => !setA.includes(x)), [setA, setB]);
  const outsideAB = useMemo(
    () => universe.filter((x) => !setA.includes(x) && !setB.includes(x)),
    [universe, setA, setB]
  );

  // Compute resulting elements based on current operation
  const resultElements = useMemo(() => {
    switch (currentOp) {
      case 'union':
        return Array.from(new Set([...setA, ...setB]));
      case 'intersect':
        return intersectAB;
      case 'diff_A_B':
        return onlyA;
      case 'diff_B_A':
        return onlyB;
      case 'comp_A':
        return universe.filter((x) => !setA.includes(x));
      case 'comp_B':
        return universe.filter((x) => !setB.includes(x));
      case 'comp_union':
        return outsideAB;
      case 'sym_diff':
        return [...onlyA, ...onlyB];
      default:
        return [];
    }
  }, [currentOp, setA, setB, intersectAB, onlyA, onlyB, outsideAB, universe]);

  // Handle Preset Change
  const handlePresetSelect = (idx: number) => {
    setSelectedPreset(idx);
    setUniverse([...PRESET_DOMAINS[idx].U]);
    setSetA([...PRESET_DOMAINS[idx].A]);
    setSetB([...PRESET_DOMAINS[idx].B]);
  };

  // Toggle element presence in Set A or B
  const toggleElementInA = (elem: string) => {
    setSetA((prev) => (prev.includes(elem) ? prev.filter((x) => x !== elem) : [...prev, elem]));
  };

  const toggleElementInB = (elem: string) => {
    setSetB((prev) => (prev.includes(elem) ? prev.filter((x) => x !== elem) : [...prev, elem]));
  };

  const handleAddNewUniverseElem = () => {
    const trimmed = newElem.trim();
    if (trimmed && !universe.includes(trimmed)) {
      setUniverse([...universe, trimmed]);
      setNewElem('');
    }
  };

  // Highlight check for regions in Venn Diagram
  const isRegionActive = (region: 'onlyA' | 'intersect' | 'onlyB' | 'outside') => {
    switch (currentOp) {
      case 'union':
        return region !== 'outside';
      case 'intersect':
        return region === 'intersect';
      case 'diff_A_B':
        return region === 'onlyA';
      case 'diff_B_A':
        return region === 'onlyB';
      case 'comp_A':
        return region === 'onlyB' || region === 'outside';
      case 'comp_B':
        return region === 'onlyA' || region === 'outside';
      case 'comp_union':
        return region === 'outside';
      case 'sym_diff':
        return region === 'onlyA' || region === 'onlyB';
      default:
        return false;
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! कक्षा 9 को पहिलो एकाइ "समूह" (Sets) मा स्वागत छ। भेन चित्रमा समूहका क्रियाहरू (संयोजन, प्रतिच्छेदन, अन्तर र पूरक) प्रत्यक्ष अन्वेषण गरौं!',
        'Welcome to Grade 9 Unit 1: Sets! Interactively explore Set Union, Intersection, Difference, and Complement with dynamic Venn diagrams!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('two_set')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'two_set' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🟡🔵 {L('1. दुई-समूह भेन चित्र प्रयोगशाला (2-Set Lab)', '1. 2-Set Venn Lab')}
          </button>
          <button
            onClick={() => setActiveTab('three_set')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'three_set' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🟣 {L('2. तीन-समूह भेन चित्र (3-Set Venn Diagram)', '2. 3-Set Venn Diagram')}
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'relations' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔍 {L('3. समूहका सम्बन्धहरू (Disjoint & Subsets)', '3. Set Relationships')}
          </button>
        </div>

        {/* Tab 1: 2-Set Interactive Venn Lab */}
        {activeTab === 'two_set' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: SVG Venn Diagram */}
            <div className="lg:col-span-7 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2 px-1 text-xs">
                <span className="font-bold text-slate-700">
                  {L('भेन चित्र (Venn Diagram of Sets A and B in U)', 'Venn Diagram')}
                </span>
                <span className="font-mono text-slate-500 font-semibold">
                  U = &#123;{universe.join(', ')}&#125;
                </span>
              </div>

              <svg
                width={480}
                height={320}
                className="max-w-full bg-slate-50 rounded-xl border-2 border-slate-300 shadow-inner select-none"
              >
                {/* Universal Set Rectangle */}
                <rect
                  x={10}
                  y={10}
                  width={460}
                  height={300}
                  fill={isRegionActive('outside') ? 'rgba(234, 179, 8, 0.25)' : '#f8fafc'}
                  stroke="#475569"
                  strokeWidth="2"
                  rx="8"
                />
                <text x={30} y={35} fontSize="16" fontWeight="900" fill="#334155">
                  U
                </text>

                {/* Circle A */}
                <circle
                  cx={180}
                  cy={160}
                  r={105}
                  fill={
                    isRegionActive('onlyA')
                      ? 'rgba(59, 130, 246, 0.35)'
                      : 'rgba(59, 130, 246, 0.1)'
                  }
                  stroke="#2563eb"
                  strokeWidth="2.5"
                />

                {/* Circle B */}
                <circle
                  cx={300}
                  cy={160}
                  r={105}
                  fill={
                    isRegionActive('onlyB')
                      ? 'rgba(16, 185, 129, 0.35)'
                      : 'rgba(16, 185, 129, 0.1)'
                  }
                  stroke="#059669"
                  strokeWidth="2.5"
                />

                {/* Intersection Overlap Region Highlight if active */}
                {isRegionActive('intersect') && (
                  <path
                    d="M 240 76 A 105 105 0 0 1 240 244 A 105 105 0 0 1 240 76"
                    fill="rgba(245, 158, 11, 0.5)"
                    stroke="#d97706"
                    strokeWidth="2"
                  />
                )}

                {/* Set Labels */}
                <text x={110} y={75} fontSize="18" fontWeight="bold" fill="#1d4ed8">
                  A
                </text>
                <text x={360} y={75} fontSize="18" fontWeight="bold" fill="#047857">
                  B
                </text>

                {/* Elements in Only A */}
                <g className="text-xs">
                  {onlyA.map((elem, idx) => (
                    <text
                      key={elem}
                      x={130 + (idx % 2) * 35}
                      y={130 + Math.floor(idx / 2) * 25}
                      fontSize="13"
                      fontWeight="bold"
                      fill="#1e40af"
                      textAnchor="middle"
                    >
                      {elem}
                    </text>
                  ))}
                </g>

                {/* Elements in Intersection (A ∩ B) */}
                <g className="text-xs">
                  {intersectAB.map((elem, idx) => (
                    <text
                      key={elem}
                      x={240}
                      y={135 + idx * 24}
                      fontSize="13"
                      fontWeight="black"
                      fill="#b45309"
                      textAnchor="middle"
                    >
                      {elem}
                    </text>
                  ))}
                </g>

                {/* Elements in Only B */}
                <g className="text-xs">
                  {onlyB.map((elem, idx) => (
                    <text
                      key={elem}
                      x={320 + (idx % 2) * 35}
                      y={130 + Math.floor(idx / 2) * 25}
                      fontSize="13"
                      fontWeight="bold"
                      fill="#065f46"
                      textAnchor="middle"
                    >
                      {elem}
                    </text>
                  ))}
                </g>

                {/* Elements Outside (Complement of Union) */}
                <g className="text-xs">
                  {outsideAB.map((elem, idx) => (
                    <text
                      key={elem}
                      x={45 + (idx % 5) * 85}
                      y={idx > 4 ? 285 : 290}
                      fontSize="12"
                      fontWeight="semibold"
                      fill="#64748b"
                      textAnchor="middle"
                    >
                      {elem}
                    </text>
                  ))}
                </g>
              </svg>

              {/* Mathematical Result Banner */}
              <div className="w-full mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                <span className="text-xs font-bold text-indigo-900 uppercase block mb-1">
                  Mathematical result:
                </span>
                <div className="text-base font-extrabold text-indigo-700 font-mono">
                  {currentOp === 'union' && `A ∪ B = { ${resultElements.join(', ')} }`}
                  {currentOp === 'intersect' && `A ∩ B = { ${resultElements.join(', ')} }`}
                  {currentOp === 'diff_A_B' && `A − B = { ${resultElements.join(', ')} }`}
                  {currentOp === 'diff_B_A' && `B − A = { ${resultElements.join(', ')} }`}
                  {currentOp === 'comp_A' && `Ā (or A') = { ${resultElements.join(', ')} }`}
                  {currentOp === 'comp_B' && `B̄ (or B') = { ${resultElements.join(', ')} }`}
                  {currentOp === 'comp_union' && `(A ∪ B)' = { ${resultElements.join(', ')} }`}
                  {currentOp === 'sym_diff' && `A △ B = (A − B) ∪ (B − A) = { ${resultElements.join(', ')} }`}
                  {currentOp === 'none' && 'No operation selected'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Number of members (cardinality) = {resultElements.length}
                </div>
              </div>
            </div>

            {/* Right: Operations & Set Builder Controls */}
            <div className="lg:col-span-5 space-y-4">
              {/* Presets */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  1. Choose a preset domain:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRESET_DOMAINS.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => handlePresetSelect(idx)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                        selectedPreset === idx
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {p.nameNp}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 italic mt-1">
                  {PRESET_DOMAINS[selectedPreset].descNp}
                </p>
              </div>

              {/* Set Operation Selector */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  2. Set operations (choose an operation to shade):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {[
                    { key: 'union', label: 'A ∪ B' },
                    { key: 'intersect', label: 'A ∩ B' },
                    { key: 'diff_A_B', label: 'A − B' },
                    { key: 'diff_B_A', label: 'B − A' },
                    { key: 'comp_A', label: "Ā or A'" },
                    { key: 'comp_B', label: "B̄ or B'" },
                    { key: 'comp_union', label: "(A ∪ B)'" },
                    { key: 'sym_diff', label: 'A △ B' },
                  ].map((op) => (
                    <button
                      key={op.key}
                      onClick={() => setCurrentOp(op.key as SetOperation)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        currentOp === op.key
                          ? 'bg-amber-500 text-white border-amber-600 shadow'
                          : 'bg-slate-50 text-slate-700 hover:bg-amber-50 border-slate-200'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Element Toggles in A and B */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                <span className="font-bold text-slate-700 uppercase block">
                  3. Add/remove members in sets (toggle elements):
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {universe.map((item) => {
                    const inA = setA.includes(item);
                    const inB = setB.includes(item);
                    return (
                      <div
                        key={item}
                        className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200"
                      >
                        <span className="font-mono font-bold text-slate-800">{item}</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => toggleElementInA(item)}
                            className={`px-2.5 py-1 rounded font-bold border transition ${
                              inA
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-100 text-slate-500 border-slate-300'
                            }`}
                          >
                            A {inA ? '✓' : '+'}
                          </button>
                          <button
                            onClick={() => toggleElementInB(item)}
                            className={`px-2.5 py-1 rounded font-bold border transition ${
                              inB
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-100 text-slate-500 border-slate-300'
                            }`}
                          >
                            B {inB ? '✓' : '+'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Three-Set Venn Diagram (A, B, C) */}
        {activeTab === 'three_set' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 flex flex-col items-center">
              <h3 className="font-extrabold text-slate-800 text-sm mb-2">
                3-set Venn diagram (A, B, C in U)
              </h3>

              <svg
                width={480}
                height={340}
                className="max-w-full bg-slate-50 rounded-xl border-2 border-slate-300 shadow-inner select-none"
              >
                <rect x={10} y={10} width={460} height={320} fill="#f8fafc" stroke="#475569" strokeWidth="2" rx="8" />
                <text x={30} y={35} fontSize="16" fontWeight="900" fill="#334155">
                  U
                </text>

                {/* Circle A (Top Left) */}
                <circle cx={190} cy={140} r={85} fill="rgba(59, 130, 246, 0.15)" stroke="#2563eb" strokeWidth="2.5" />
                {/* Circle B (Top Right) */}
                <circle cx={290} cy={140} r={85} fill="rgba(16, 185, 129, 0.15)" stroke="#059669" strokeWidth="2.5" />
                {/* Circle C (Bottom Center) */}
                <circle cx={240} cy={215} r={85} fill="rgba(245, 158, 11, 0.15)" stroke="#d97706" strokeWidth="2.5" />

                {/* Central Triple Overlap Highlight (A ∩ B ∩ C) */}
                {threeOp === 'center' && (
                  <circle cx={240} cy={165} r={28} fill="rgba(239, 68, 68, 0.5)" stroke="#b91c1c" strokeWidth="2" />
                )}

                {/* Labels */}
                <text x={140} y={80} fontSize="18" fontWeight="bold" fill="#1d4ed8">
                  A
                </text>
                <text x={340} y={80} fontSize="18" fontWeight="bold" fill="#047857">
                  B
                </text>
                <text x={240} y={320} fontSize="18" fontWeight="bold" fill="#b45309" textAnchor="middle">
                  C
                </text>

                {/* Example sample members in 3-set partitions */}
                <text x={155} y={130} fontSize="13" fontWeight="bold" fill="#1e40af">
                  1
                </text>
                <text x={325} y={130} fontSize="13" fontWeight="bold" fill="#065f46">
                  3
                </text>
                <text x={240} y={270} fontSize="13" fontWeight="bold" fill="#78350f" textAnchor="middle">
                  7
                </text>

                {/* Pairwise intersections */}
                <text x={240} y={115} fontSize="13" fontWeight="bold" fill="#0f766e" textAnchor="middle">
                  2
                </text>
                <text x={185} y={195} fontSize="13" fontWeight="bold" fill="#b45309" textAnchor="middle">
                  4
                </text>
                <text x={295} y={195} fontSize="13" fontWeight="bold" fill="#b45309" textAnchor="middle">
                  6
                </text>

                {/* Triple center intersection A ∩ B ∩ C */}
                <text x={240} y={170} fontSize="15" fontWeight="black" fill="#dc2626" textAnchor="middle">
                  5
                </text>

                {/* Outside elements in U */}
                <text x={50} y={300} fontSize="12" fontWeight="bold" fill="#64748b">
                  8, 9
                </text>
              </svg>

              <div className="w-full mt-3 flex justify-center gap-2">
                <button
                  onClick={() => setThreeOp('center')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    threeOp === 'center'
                      ? 'bg-rose-600 text-white border-rose-600 shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Common centre A ∩ B ∩ C = &#123; 5 &#125;
                </button>
                <button
                  onClick={() => setThreeOp('union')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    threeOp === 'union'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  A ∪ B ∪ C = &#123; 1, 2, 3, 4, 5, 6, 7 &#125;
                </button>
              </div>
            </div>

            {/* Explanation of 3-Set Formula */}
            <div className="lg:col-span-4 bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
              <h4 className="font-extrabold text-amber-950 text-sm">
                Cardinality formula for three sets:
              </h4>
              <div className="bg-white p-3 rounded-xl border border-amber-200 font-mono text-amber-900 leading-relaxed font-semibold">
                n(A ∪ B ∪ C) = n(A) + n(B) + n(C)
                <br />− n(A ∩ B) − n(B ∩ C) − n(C ∩ A)
                <br />+ n(A ∩ B ∩ C)
              </div>
              <p className="text-amber-900 leading-relaxed">
                💡 <b>Why is it added and subtracted?</b>
                <br />
                When the pairwise intersections are subtracted, the central common part (A ∩ B ∩ C) is removed three times. So it is added back once at the end.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Set Relationships (Disjoint & Subsets) */}
        {activeTab === 'relations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Disjoint Sets */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                Disjoint sets
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If two sets A and B have no common member (A ∩ B = ∅), they are called disjoint sets.
              </p>

              <svg width={360} height={180} className="w-full bg-slate-50 rounded-xl border border-slate-200">
                <rect x={10} y={10} width={340} height={160} fill="#f8fafc" stroke="#475569" strokeWidth="1.5" rx="6" />
                <text x={25} y={30} fontSize="14" fontWeight="bold" fill="#475569">
                  U
                </text>
                <circle cx={100} cy={95} r={55} fill="rgba(59, 130, 246, 0.2)" stroke="#2563eb" strokeWidth="2" />
                <text x={100} y={90} fontSize="14" fontWeight="bold" fill="#1d4ed8" textAnchor="middle">
                  A = &#123;1, 2&#125;
                </text>

                <circle cx={250} cy={95} r={55} fill="rgba(16, 185, 129, 0.2)" stroke="#059669" strokeWidth="2" />
                <text x={250} y={90} fontSize="14" fontWeight="bold" fill="#047857" textAnchor="middle">
                  B = &#123;3, 4&#125;
                </text>
              </svg>

              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-mono text-rose-900 font-bold text-center">
                A ∩ B = ∅ &nbsp;|&nbsp; n(A ∪ B) = n(A) + n(B)
              </div>
            </div>

            {/* Subset Relationship */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                Subset relation (B ⊂ A)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If all members of set B also belong to set A, then B is called a subset of A (B ⊂ A).
              </p>

              <svg width={360} height={180} className="w-full bg-slate-50 rounded-xl border border-slate-200">
                <rect x={10} y={10} width={340} height={160} fill="#f8fafc" stroke="#475569" strokeWidth="1.5" rx="6" />
                <text x={25} y={30} fontSize="14" fontWeight="bold" fill="#475569">
                  U
                </text>
                {/* Outer Circle A */}
                <circle cx={180} cy={95} r={65} fill="rgba(59, 130, 246, 0.15)" stroke="#2563eb" strokeWidth="2" />
                <text x={180} y={55} fontSize="13" fontWeight="bold" fill="#1d4ed8" textAnchor="middle">
                  A
                </text>

                {/* Inner Circle B */}
                <circle cx={180} cy={110} r={35} fill="rgba(16, 185, 129, 0.3)" stroke="#059669" strokeWidth="2" />
                <text x={180} y={115} fontSize="12" fontWeight="bold" fill="#047857" textAnchor="middle">
                  B ⊂ A
                </text>
              </svg>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-900 font-bold text-center">
                If B ⊂ A: A ∩ B = B &nbsp;|&nbsp; A ∪ B = A
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default SetExplorerVennLab;
