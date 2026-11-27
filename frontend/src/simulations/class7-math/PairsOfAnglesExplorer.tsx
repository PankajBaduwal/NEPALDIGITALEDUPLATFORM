/**
 * PairsOfAnglesExplorer.tsx
 * Grade 7 Mathematics – Lesson 13: LINES AND ANGLES
 * Simulation 3: Pairs of Angles Explorer
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 185-192)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Shuffle, HelpCircle, Check, ArrowRight, RotateCw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'शीर्ष र एउटा भुजा साझा भएका तर एकआपसमा नखप्टिएका कोणहरूलाई के भनिन्छ?',
    en: 'Angles having a common vertex, a common arm and non-overlapping interiors are called?',
    options: [
      { key: 'A', label: 'Adjacent angles' },
      { key: 'B', label: 'Vertically opposite angles' },
      { key: 'C', label: 'Complementary angles' },
      { key: 'D', label: 'Alternate angles' },
    ],
    answer: 'A',
  },
  {
    np: 'दुईpcs सीधा रेखाहरू आपसमा काटिँदा बन्ने आमने-सामनेका Vertically opposite angles के हुन्छन्?',
    en: 'When two straight lines intersect, vertically opposite angles are always:',
    options: [
      { key: 'A', label: 'Equal' },
      { key: 'B', label: 'Adding up to 90°' },
      { key: 'C', label: 'Adding up to 180°' },
      { key: 'D', label: 'Different' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि दुई कोणहरूको योगफल 90° हुन्छ भने तिनीहरूलाई के भनिन्छ?',
    en: 'If the sum of two angles is 90°, they are called:',
    options: [
      { key: 'A', label: 'Complementary angles' },
      { key: 'B', label: 'Supplementary angles' },
      { key: 'C', label: 'Adjacent angles' },
      { key: 'D', label: 'Right angle' },
    ],
    answer: 'A',
  },
  {
    np: '33° को पूरक कोण (Complement) कति हुन्छ? (90° - 33°)',
    en: 'What is the complement of 33°? (90° - 33°)',
    options: [
      { key: 'A', label: '57°' },
      { key: 'B', label: '147°' },
      { key: 'C', label: '67°' },
      { key: 'D', label: '47°' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि दुई कोणहरूको योगफल 180° हुन्छ भने तिनीहरूलाई के भनिन्छ?',
    en: 'If the sum of two angles is 180°, they are called:',
    options: [
      { key: 'A', label: 'Supplementary angles' },
      { key: 'B', label: 'Complementary angles' },
      { key: 'C', label: 'Vertically opposite angles' },
      { key: 'D', label: 'Straight angle' },
    ],
    answer: 'A',
  },
];

type PairMode = 'adjacent' | 'vertical' | 'complementary' | 'supplementary' | 'solver';

export const PairsOfAnglesExplorer: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L13-03',
    chapter: 13,
    titleNp: 'सम्बन्धित कोणहरूको खोजी (Pairs of Angles)',
    titleEn: 'Pairs of Angles Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [mode, setMode] = useState<PairMode>('adjacent');
  const [angle1, setAngle1] = useState<number>(40);
  const [angle2, setAngle2] = useState<number>(50);

  // Solver mode states
  const [solverType, setSolverType] = useState<'comp' | 'supp' | 'vert' | 'linear'>('comp');
  const [knownAngle, setKnownAngle] = useState<number>(33);
  const [userGuess, setUserGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const correctSolverAnswer =
    solverType === 'comp'
      ? 90 - knownAngle
      : solverType === 'supp' || solverType === 'linear'
      ? 180 - knownAngle
      : knownAngle;

  const handleCheckAnswer = () => {
    const val = parseInt(userGuess, 10);
    if (isNaN(val)) return;
    if (val === correctSolverAnswer) {
      setFeedback(L('सबास! बिल्कुल सही उत्तर।', 'Excellent! Absolutely correct answer.'));
    } else {
      setFeedback(
        L(
          `प्रयास राम्रो! सही उत्तर ${toNp(correctSolverAnswer)}° हो।`,
          `Good try! The correct answer is ${correctSolverAnswer}°.`
        )
      );
    }
  };

  const nextSolverProblem = () => {
    const types: ('comp' | 'supp' | 'vert' | 'linear')[] = ['comp', 'supp', 'vert', 'linear'];
    const nextT = types[Math.floor(Math.random() * types.length)];
    setSolverType(nextT);
    setUserGuess('');
    setFeedback(null);
    if (nextT === 'comp') {
      setKnownAngle(Math.floor(Math.random() * 70) + 10);
    } else if (nextT === 'vert') {
      setKnownAngle(Math.floor(Math.random() * 120) + 25);
    } else {
      setKnownAngle(Math.floor(Math.random() * 140) + 20);
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते साथीहरू! सन्निकट, शीर्षाभिमुख, पूरक र परिपूरक कोणहरूको सम्बन्ध प्रत्यक्ष हेरौँ र बुझौँ!',
        'Hello friends! Explore adjacent, vertically opposite, complementary, and supplementary angles interactively!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'adjacent', np: '1. Adjacent angles (Adjacent)', en: '1. Adjacent Angles' },
            { id: 'vertical', np: '2. Vertically opposite angles (Vert. Opposite)', en: '2. Vertically Opposite' },
            { id: 'complementary', np: '3. पूरक कोणहरू (Complementary 90°)', en: '3. Complementary (90°)' },
            { id: 'supplementary', np: '4. परिपूरक कोणहरू (Supplementary 180°)', en: '4. Supplementary (180°)' },
            { id: 'solver', np: '5. अज्ञात कोण समाधान (Angle Solver)', en: '5. Unknown Angle Challenge' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id as PairMode);
                setFeedback(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                mode === tab.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {isNe ? tab.np : tab.en}
            </button>
          ))}
        </div>

        {/* Mode 1: Adjacent Angles */}
        {mode === 'adjacent' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-2xl">
              <h3 className="text-lg font-bold text-blue-900" style={{ fontFamily: FONT_NP }}>
                {L('Adjacent angles को परिभाषा:', 'Definition of Adjacent Angles:')}
              </h3>
              <p className="text-slate-700 text-sm mt-1">
                {L(
                  'साझा शीर्षबिन्दु (Common Vertex) र एउटा साझा भुजा (Common Arm) भएका तर एकआपसमा नखप्टिएका (non-overlapping) दुई कोणहरूलाई सन्निकट कोण भनिन्छ।',
                  'Two angles having a common vertex and a common arm, with non-overlapping interiors, are called adjacent angles.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* SVG Canvas */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="340" height="260" viewBox="0 0 340 260">
                  {/* Origin at (80, 200) */}
                  {/* Base line OA */}
                  <line x1="80" y1="200" x2="280" y2="200" stroke="#1e293b" strokeWidth="3" markerEnd="url(#arrow)" />
                  <text x="290" y="205" fontSize="14" fontWeight="bold" fill="#1e293b">A</text>

                  {/* Middle shared arm OB at angle1 */}
                  {(() => {
                    const rad1 = (angle1 * Math.PI) / 180;
                    const bx = 80 + 170 * Math.cos(rad1);
                    const by = 200 - 170 * Math.sin(rad1);
                    const radTotal = ((angle1 + angle2) * Math.PI) / 180;
                    const cx = 80 + 170 * Math.cos(radTotal);
                    const cy = 200 - 170 * Math.sin(radTotal);
                    return (
                      <>
                        {/* Shaded Angle 1 */}
                        <path
                          d={`M 80 200 L 130 200 A 50 50 0 0 0 ${80 + 50 * Math.cos(rad1)} ${200 - 50 * Math.sin(rad1)} Z`}
                          fill="rgba(59, 130, 246, 0.25)"
                        />
                        {/* Shaded Angle 2 */}
                        <path
                          d={`M 80 200 L ${80 + 60 * Math.cos(rad1)} ${200 - 60 * Math.sin(rad1)} A 60 60 0 0 0 ${80 + 60 * Math.cos(radTotal)} ${200 - 60 * Math.sin(radTotal)} Z`}
                          fill="rgba(245, 158, 11, 0.25)"
                        />

                        {/* Shared Arm OB */}
                        <line x1="80" y1="200" x2={bx} y2={by} stroke="#2563eb" strokeWidth="4" />
                        <text x={bx + 5} y={by - 5} fontSize="14" fontWeight="bold" fill="#2563eb">B</text>

                        {/* Outer Arm OC */}
                        <line x1="80" y1="200" x2={cx} y2={cy} stroke="#d97706" strokeWidth="3" />
                        <text x={cx + 5} y={cy - 5} fontSize="14" fontWeight="bold" fill="#d97706">C</text>

                        {/* Vertex O */}
                        <circle cx="80" cy="200" r="5" fill="#ef4444" />
                        <text x="60" y="215" fontSize="14" fontWeight="bold" fill="#ef4444">O</text>
                      </>
                    );
                  })()}
                </svg>
                <div className="text-xs text-slate-500 mt-2 text-center">
                  {L('रेखा OB = साझा भुजा', 'Point O = Common Vertex | Ray OB = Common Arm')}
                </div>
              </div>

              {/* Controls & Math Info */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <label className="text-sm font-bold text-blue-900 block mb-1">
                    {L(`पहिलो कोण ∠AOB: ${toNp(angle1)}°`, `First Angle ∠AOB: ${angle1}°`)}
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="75"
                    value={angle1}
                    onChange={(e) => setAngle1(Number(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <label className="text-sm font-bold text-amber-900 block mb-1">
                    {L(`दोस्रो कोण ∠BOC: ${toNp(angle2)}°`, `Second Angle ∠BOC: ${angle2}°`)}
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="75"
                    value={angle2}
                    onChange={(e) => setAngle2(Number(e.target.value))}
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="text-sm font-semibold text-slate-700">
                    {L('तीन मुख्य सर्तहरू जाँच गर्नुहोस्:', 'Check 3 Essential Conditions:')}
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-600">
                    <li className="flex items-center gap-2 text-emerald-700">
                      <Check className="w-4 h-4" /> {L('1. साझा शीर्षबिन्दु O छ।', '1. Common vertex O exists.')}
                    </li>
                    <li className="flex items-center gap-2 text-emerald-700">
                      <Check className="w-4 h-4" /> {L('2. साझा भुजा OB छ।', '2. Common arm OB exists.')}
                    </li>
                    <li className="flex items-center gap-2 text-emerald-700">
                      <Check className="w-4 h-4" /> {L('3. कोणका क्षेत्रहरू खप्टिएका छैनन्।', '3. Non-overlapping interior spaces.')}
                    </li>
                  </ul>
                  <div className="pt-2 text-sm font-bold text-indigo-700 border-t border-slate-200">
                    {L(
                      `जम्मा कोण ∠AOC = ${toNp(angle1)}° + ${toNp(angle2)}° = ${toNp(angle1 + angle2)}°`,
                      `Total Angle ∠AOC = ${angle1}° + ${angle2}° = ${angle1 + angle2}°`
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Vertically Opposite Angles */}
        {mode === 'vertical' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-2xl">
              <h3 className="text-lg font-bold text-emerald-900" style={{ fontFamily: FONT_NP }}>
                {L('Vertically opposite angles (Vertically Opposite Angles):', 'Vertically Opposite Angles Theorem:')}
              </h3>
              <p className="text-slate-700 text-sm mt-1">
                {L(
                  'दुई सीधा रेखाहरू आपसमा एउटा बिन्दुमा काटिँदा बन्ने आमने-सामनेका Vertically opposite angles सधैं Equal हुन्छन्।',
                  'When two straight lines intersect at a point, the vertically opposite angles are always equal to each other.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* SVG Canvas */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="340" height="260" viewBox="0 0 340 260">
                  {/* Center O at (170, 130) */}
                  {(() => {
                    const cx = 170;
                    const cy = 130;
                    const rad = (angle1 * Math.PI) / 180;
                    const len = 120;
                    // Line 1: PQ horizontal-ish
                    const px1 = cx - len;
                    const py1 = cy;
                    const px2 = cx + len;
                    const py2 = cy;
                    // Line 2: RS rotated by angle1
                    const rx1 = cx - len * Math.cos(rad);
                    const ry1 = cy + len * Math.sin(rad);
                    const rx2 = cx + len * Math.cos(rad);
                    const ry2 = cy - len * Math.sin(rad);

                    return (
                      <>
                        {/* Sector 1: Right (blue) */}
                        <path
                          d={`M ${cx} ${cy} L ${cx + 45} ${cy} A 45 45 0 0 0 ${cx + 45 * Math.cos(rad)} ${cy - 45 * Math.sin(rad)} Z`}
                          fill="rgba(59, 130, 246, 0.35)"
                        />
                        {/* Sector 2: Left (blue opposite) */}
                        <path
                          d={`M ${cx} ${cy} L ${cx - 45} ${cy} A 45 45 0 0 0 ${cx - 45 * Math.cos(rad)} ${cy + 45 * Math.sin(rad)} Z`}
                          fill="rgba(59, 130, 246, 0.35)"
                        />
                        {/* Sector 3: Top (amber) */}
                        <path
                          d={`M ${cx} ${cy} L ${cx + 40 * Math.cos(rad)} ${cy - 40 * Math.sin(rad)} A 40 40 0 0 0 ${cx - 40} ${cy} Z`}
                          fill="rgba(245, 158, 11, 0.3)"
                        />
                        {/* Sector 4: Bottom (amber opposite) */}
                        <path
                          d={`M ${cx} ${cy} L ${cx + 40} ${cy} A 40 40 0 0 0 ${cx - 40 * Math.cos(rad)} ${cy + 40 * Math.sin(rad)} Z`}
                          fill="rgba(245, 158, 11, 0.3)"
                        />

                        {/* Line PQ */}
                        <line x1={px1} y1={py1} x2={px2} y2={py2} stroke="#334155" strokeWidth="3" />
                        <text x={px1 - 15} y={py1 + 5} fontSize="14" fontWeight="bold" fill="#334155">P</text>
                        <text x={px2 + 8} y={py2 + 5} fontSize="14" fontWeight="bold" fill="#334155">Q</text>

                        {/* Line RS */}
                        <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#0f766e" strokeWidth="3" />
                        <text x={rx1 - 10} y={ry1 + 15} fontSize="14" fontWeight="bold" fill="#0f766e">S</text>
                        <text x={rx2 + 5} y={ry2 - 5} fontSize="14" fontWeight="bold" fill="#0f766e">R</text>

                        {/* Center O */}
                        <circle cx={cx} cy={cy} r="5" fill="#ef4444" />
                        <text x={cx + 8} y={cy + 18} fontSize="14" fontWeight="bold" fill="#ef4444">O</text>

                        {/* Angle Text values */}
                        <text x={cx + 55} y={cy - 12} fontSize="12" fontWeight="bold" fill="#1e40af">
                          {angle1}°
                        </text>
                        <text x={cx - 85} y={cy + 22} fontSize="12" fontWeight="bold" fill="#1e40af">
                          {angle1}°
                        </text>
                        <text x={cx - 15} y={cy - 50} fontSize="12" fontWeight="bold" fill="#b45309">
                          {180 - angle1}°
                        </text>
                        <text x={cx - 15} y={cy + 60} fontSize="12" fontWeight="bold" fill="#b45309">
                          {180 - angle1}°
                        </text>
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Interactive verification */}
              <div className="space-y-4">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <label className="text-sm font-bold text-emerald-900 block mb-1">
                    {L(`कोणको नाप बदल्नुहोस्: ${toNp(angle1)}°`, `Adjust Angle: ${angle1}°`)}
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="155"
                    value={angle1}
                    onChange={(e) => setAngle1(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="text-sm font-bold text-slate-800">
                    {L('शीर्षाभिमुख जोडीहरूको तुलना तालिका:', 'Opposite Pairs Equality Table:')}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-blue-100 border border-blue-300 p-3 rounded-xl">
                      <div className="text-xs text-blue-700 font-semibold">{L('जोडी 1', 'Pair 1 (Blue)')}</div>
                      <div className="text-lg font-black text-blue-900 mt-1">
                        ∠ROQ = ∠POS = {toNp(angle1)}°
                      </div>
                      <div className="text-xs text-blue-600 font-bold">✓ {L('बराबर', 'Equal')}</div>
                    </div>
                    <div className="bg-amber-100 border border-amber-300 p-3 rounded-xl">
                      <div className="text-xs text-amber-700 font-semibold">{L('जोडी 2', 'Pair 2 (Orange)')}</div>
                      <div className="text-lg font-black text-amber-900 mt-1">
                        ∠ROP = ∠SOQ = {toNp(180 - angle1)}°
                      </div>
                      <div className="text-xs text-amber-600 font-bold">✓ {L('बराबर', 'Equal')}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 text-center">
                    {L('रेखा PQ मा: ∠ROP + ∠ROQ = 180° (ऋजु जोडा / Linear Pair)', 'On line PQ: sum of linear pair is 180°')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode 3: Complementary Angles */}
        {mode === 'complementary' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-2xl">
              <h3 className="text-lg font-bold text-purple-900" style={{ fontFamily: FONT_NP }}>
                {L('Complementary angles - योगफल 90°:', 'Complementary Angles - Sum = 90°:')}
              </h3>
              <p className="text-slate-700 text-sm mt-1">
                {L(
                  'यदि दुई कोणहरूको नापको योगफल 90° (Right angle) हुन्छ भने ती दुई कोणहरूलाई एकअर्काको पूरक कोण (Complement) भनिन्छ।',
                  'If the sum of two angles is 90° (Right angle), they are called complementary angles of each other.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="300" height="260" viewBox="0 0 300 260">
                  {/* Origin at (60, 210) */}
                  {/* Base line */}
                  <line x1="60" y1="210" x2="250" y2="210" stroke="#1e293b" strokeWidth="3" />
                  <text x="260" y="215" fontSize="14" fontWeight="bold">B</text>

                  {/* Vertical line (90°) */}
                  <line x1="60" y1="210" x2="60" y2="40" stroke="#1e293b" strokeWidth="3" />
                  <text x="50" y="30" fontSize="14" fontWeight="bold">A</text>

                  {/* Right angle symbol */}
                  <path d="M 60 190 L 80 190 L 80 210" fill="none" stroke="#64748b" strokeWidth="2" />

                  {/* Partition ray OC */}
                  {(() => {
                    const comp1 = Math.min(Math.max(angle1, 10), 80);
                    const rad = (comp1 * Math.PI) / 180;
                    const cx = 60 + 170 * Math.cos(rad);
                    const cy = 210 - 170 * Math.sin(rad);
                    const comp2 = 90 - comp1;
                    return (
                      <>
                        {/* Shaded Angle 1 */}
                        <path
                          d={`M 60 210 L 110 210 A 50 50 0 0 0 ${60 + 50 * Math.cos(rad)} ${210 - 50 * Math.sin(rad)} Z`}
                          fill="rgba(147, 51, 234, 0.3)"
                        />
                        {/* Shaded Angle 2 */}
                        <path
                          d={`M 60 210 L ${60 + 50 * Math.cos(rad)} ${210 - 50 * Math.sin(rad)} A 50 50 0 0 0 60 160 Z`}
                          fill="rgba(59, 130, 246, 0.3)"
                        />
                        <line x1="60" y1="210" x2={cx} y2={cy} stroke="#9333ea" strokeWidth="4" />
                        <text x={cx + 5} y={cy - 5} fontSize="14" fontWeight="bold" fill="#9333ea">C</text>
                        <circle cx="60" cy="210" r="5" fill="#ef4444" />
                        <text x="40" y="225" fontSize="14" fontWeight="bold">O</text>

                        <text x="120" y="200" fontSize="13" fontWeight="bold" fill="#7e22ce">
                          ∠BOC = {comp1}°
                        </text>
                        <text x="75" y="145" fontSize="13" fontWeight="bold" fill="#1e40af">
                          ∠AOC = {comp2}°
                        </text>
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <label className="text-sm font-bold text-purple-900 block mb-1">
                    {L(`कोण 1 बदल्नुहोस्: ${toNp(angle1)}°`, `Adjust Angle 1: ${angle1}°`)}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={angle1}
                    onChange={(e) => setAngle1(Number(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('पाठ्यपुस्तकको उदाहरण अनुसार गणना:', 'CDC Textbook Calculation Rule:')}
                  </div>
                  <div className="text-base font-bold text-purple-800">
                    {L(
                      `कोण 1 = ${toNp(angle1)}°`,
                      `Angle 1 = ${angle1}°`
                    )}
                  </div>
                  <div className="text-base font-bold text-blue-800">
                    {L(
                      `पूरक कोण = 90° - ${toNp(angle1)}° = ${toNp(90 - angle1)}°`,
                      `Complementary Angle = 90° - ${angle1}° = ${90 - angle1}°`
                    )}
                  </div>
                  <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-semibold">
                    ✓ {toNp(angle1)}° + {toNp(90 - angle1)}° = {toNp(90)}° ({L('Right angle / Right Angle', 'Right Angle')})
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode 4: Supplementary Angles */}
        {mode === 'supplementary' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-2xl">
              <h3 className="text-lg font-bold text-rose-900" style={{ fontFamily: FONT_NP }}>
                {L('Supplementary angles - योगफल 180°:', 'Supplementary Angles - Sum = 180°:')}
              </h3>
              <p className="text-slate-700 text-sm mt-1">
                {L(
                  'यदि दुई कोणहरूको नापको योगफल 180° (Straight angle) हुन्छ भने ती दुई कोणहरूलाई एकअर्काको परिपूरक कोण (Supplement) भनिन्छ।',
                  'If the sum of two angles is 180° (Straight angle), they are called supplementary angles of each other.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="340" height="240" viewBox="0 0 340 240">
                  {/* Origin at (170, 190) */}
                  {/* Straight line AB */}
                  <line x1="30" y1="190" x2="310" y2="190" stroke="#1e293b" strokeWidth="3" />
                  <text x="15" y="195" fontSize="14" fontWeight="bold">A</text>
                  <text x="320" y="195" fontSize="14" fontWeight="bold">B</text>

                  {/* Arm OC */}
                  {(() => {
                    const supp1 = Math.min(Math.max(angle1, 15), 165);
                    const rad = (supp1 * Math.PI) / 180;
                    const cx = 170 + 140 * Math.cos(rad);
                    const cy = 190 - 140 * Math.sin(rad);
                    const supp2 = 180 - supp1;
                    return (
                      <>
                        {/* Shaded Angle 1 (Right) */}
                        <path
                          d={`M 170 190 L 220 190 A 50 50 0 0 0 ${170 + 50 * Math.cos(rad)} ${190 - 50 * Math.sin(rad)} Z`}
                          fill="rgba(244, 63, 94, 0.3)"
                        />
                        {/* Shaded Angle 2 (Left) */}
                        <path
                          d={`M 170 190 L ${170 + 50 * Math.cos(rad)} ${190 - 50 * Math.sin(rad)} A 50 50 0 0 0 120 190 Z`}
                          fill="rgba(14, 165, 233, 0.3)"
                        />
                        <line x1="170" y1="190" x2={cx} y2={cy} stroke="#e11d48" strokeWidth="4" />
                        <text x={cx + 5} y={cy - 5} fontSize="14" fontWeight="bold" fill="#e11d48">C</text>
                        <circle cx="170" cy="190" r="5" fill="#ef4444" />
                        <text x="165" y="212" fontSize="14" fontWeight="bold">O</text>

                        <text x="210" y="175" fontSize="13" fontWeight="bold" fill="#be123c">
                          {supp1}°
                        </text>
                        <text x="95" y="175" fontSize="13" fontWeight="bold" fill="#0369a1">
                          {supp2}°
                        </text>
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div className="space-y-4">
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                  <label className="text-sm font-bold text-rose-900 block mb-1">
                    {L(`कोणको नाप बदल्नुहोस्: ${toNp(angle1)}°`, `Adjust Angle: ${angle1}°`)}
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="165"
                    value={angle1}
                    onChange={(e) => setAngle1(Number(e.target.value))}
                    className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('पाठ्यपुस्तकको परिपूरक कोण नियम:', 'CDC Supplementary Angle Rule:')}
                  </div>
                  <div className="text-base font-bold text-rose-800">
                    {L(`दिइएको कोण ∠BOC = ${toNp(angle1)}°`, `Given Angle ∠BOC = ${angle1}°`)}
                  </div>
                  <div className="text-base font-bold text-sky-800">
                    {L(
                      `परिपूरक कोण ∠AOC = 180° - ${toNp(angle1)}° = ${toNp(180 - angle1)}°`,
                      `Supplementary Angle ∠AOC = 180° - ${angle1}° = ${180 - angle1}°`
                    )}
                  </div>
                  <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-semibold">
                    ✓ {toNp(angle1)}° + {toNp(180 - angle1)}° = {toNp(180)}° ({L('Straight angle / Straight Angle', 'Straight Angle')})
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode 5: Unknown Angle Solver */}
        {mode === 'solver' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
              <div>
                <h3 className="text-lg font-bold text-indigo-900" style={{ fontFamily: FONT_NP }}>
                  {L('अज्ञात कोण पत्ता लगाउने चुनौती (Solve Unknown Angle)', 'Solve for Unknown Angle x')}
                </h3>
                <p className="text-xs text-indigo-700 mt-1">
                  {L('ज्यामितीय सम्बन्ध प्रयोग गरी अज्ञात x को मान पत्ता लगाउनुहोस्।', 'Use angle relationships to calculate unknown value x.')}
                </p>
              </div>
              <button
                onClick={nextSolverProblem}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md text-sm"
              >
                <Shuffle className="w-4 h-4" />
                {L('नयाँ प्रश्न (New Problem)', 'New Problem')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Question visual card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase bg-indigo-100 text-indigo-800">
                  {solverType === 'comp'
                    ? L('पूरक कोण (Complementary)', 'Complementary')
                    : solverType === 'supp'
                    ? L('परिपूरक कोण (Supplementary)', 'Supplementary')
                    : solverType === 'linear'
                    ? L('ऋजु जोडा (Linear Pair)', 'Linear Pair')
                    : L('शीर्षाभिमुख कोण (Vertically Opposite)', 'Vertically Opposite')}
                </div>

                <div className="text-xl font-bold text-slate-800" style={{ fontFamily: FONT_NP }}>
                  {solverType === 'comp' &&
                    L(
                      `यदि एउटा कोण ${toNp(knownAngle)}° छ भने यसको पूरक कोण x कति हुन्छ?`,
                      `If one angle is ${knownAngle}°, what is its complement x?`
                    )}
                  {solverType === 'supp' &&
                    L(
                      `यदि एउटा कोण ${toNp(knownAngle)}° छ भने यसको परिपूरक कोण x कति हुन्छ?`,
                      `If one angle is ${knownAngle}°, what is its supplement x?`
                    )}
                  {solverType === 'linear' &&
                    L(
                      `सीधा रेखामा Adjacent angles x र ${toNp(knownAngle)}° छन्। x को मान कति हुन्छ?`,
                      `On a straight line, adjacent angles are x and ${knownAngle}°. Find x.`
                    )}
                  {solverType === 'vert' &&
                    L(
                      `दुई सीधा रेखाहरू काटिँदा Vertically opposite angles x र ${toNp(knownAngle)}° छन्। x को मान कति हुन्छ?`,
                      `Two lines intersect forming vertically opposite angles x and ${knownAngle}°. Find x.`
                    )}
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-600">
                  {solverType === 'comp' && `Formula: x + ${knownAngle}° = 90°`}
                  {solverType === 'supp' && `Formula: x + ${knownAngle}° = 180°`}
                  {solverType === 'linear' && `Formula: x + ${knownAngle}° = 180°`}
                  {solverType === 'vert' && `सम्बन्ध: शीर्षाभिमुख कोण बराबर हुन्छन् (x = ${knownAngle}°)`}
                </div>
              </div>

              {/* Answer submission */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 block">
                    {L('तपाईंको उत्तर (degreesमा) लेख्नुहोस्:', 'Enter your answer (in degrees):')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={userGuess}
                      onChange={(e) => setUserGuess(e.target.value)}
                      placeholder="e.g. 57"
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-600 focus:outline-none text-lg font-bold"
                    />
                    <button
                      onClick={handleCheckAnswer}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md flex items-center gap-1 text-base"
                    >
                      <Check className="w-5 h-5" />
                      {L('जाँच', 'Check')}
                    </button>
                  </div>
                </div>

                {feedback && (
                  <div
                    className={`p-4 rounded-2xl font-bold text-sm ${
                      feedback.includes('सबास') || feedback.includes('Excellent')
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {feedback}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default PairsOfAnglesExplorer;
