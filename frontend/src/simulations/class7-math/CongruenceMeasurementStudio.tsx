/**
 * CongruenceMeasurementStudio.tsx
 * Grade 7 Mathematics – Lesson 15: CONGRUENT FIGURES (अनुरूप आकृतिहरू)
 * Simulation 2: Congruence Measurement and Challenge Studio (अनुरूपता नाप तथा चुनौती स्टुडियो)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 240-244)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Ruler, Check, CheckCircle2, RotateCw, Shuffle, HelpCircle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दुई त्रिभुजहरूका संगत भुजाहरू क्रमशः ३ सेमी, ४ सेमी र ५ सेमी छन् भने तिनीहरू के हुन्छन्?',
    en: 'If the corresponding sides of two triangles are 3 cm, 4 cm, and 5 cm respectively, they are:',
    options: [
      { key: 'A', label: 'अनुरूप (Congruent)' },
      { key: 'B', label: 'असमान' },
      { key: 'C', label: 'समरूप मात्र तर अनुरूप होइन' },
      { key: 'D', label: 'कुनै सम्बन्ध छैन' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि एउटा आयतको नाप ६ सेमी × ४ सेमी र अर्को आयतको नाप ४ सेमी × ६ सेमी छ भने के ती अनुरूप हुन्?',
    en: 'If one rectangle is 6 cm × 4 cm and another is 4 cm × 6 cm, are they congruent?',
    options: [
      { key: 'A', label: 'हुन् (९०° घुमाउँदा दुरुस्त खप्टिन्छन्)' },
      { key: 'B', label: 'होइनन्' },
      { key: 'C', label: 'क्षेत्रफल मात्र बराबर हुन्छ' },
      { key: 'D', label: 'कहिलेकाहीँ मात्र' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा त्रिभुजलाई ऐनामा हेर्दा बन्ने प्रतिबिम्ब र सुरुको त्रिभुज बीचको सम्बन्ध के हुन्छ?',
    en: 'What is the relationship between a triangle and its mirror reflection?',
    options: [
      { key: 'A', label: 'अनुरूप (Congruent - आकार र नाप बराबर)' },
      { key: 'B', label: 'असमान' },
      { key: 'C', label: 'आकार फरक' },
      { key: 'D', label: 'नाप फरक' },
    ],
    answer: 'A',
  },
  {
    np: 'अनुरूपता प्रमाणित गर्न दुई आकृतिहरूको कुन-कुन कुरा बराबर हुनुपर्छ?',
    en: 'To prove congruence, which properties of two figures must match?',
    options: [
      { key: 'A', label: 'आकार र नाप दुवै (Both Shape and Size)' },
      { key: 'B', label: 'आकार मात्र' },
      { key: 'C', label: 'नाप मात्र' },
      { key: 'D', label: 'रङ्ग मात्र' },
    ],
    answer: 'A',
  },
];

type StudioTab = 'side_measurement' | 'find_matching' | 'congruence_challenge';

export const CongruenceMeasurementStudio: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L15-02',
    chapter: 15,
    titleNp: 'अनुरूपता नाप तथा चुनौती स्टुडियो (Measurement Studio)',
    titleEn: 'Congruence Measurement Studio',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [tab, setTab] = useState<StudioTab>('side_measurement');

  // Measurement side selector
  const [activeSide, setActiveSide] = useState<'a' | 'b' | 'c'>('a');

  // Find Matching Figure Game
  const [matchCandidate, setMatchCandidate] = useState<number | null>(null);
  const [matchFeedback, setMatchFeedback] = useState<string | null>(null);

  // Random Challenge state
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [challengeAns, setChallengeAns] = useState<boolean | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  const CHALLENGE_ITEMS = [
    {
      qNp: 'चित्र १: समकोण त्रिभुज (३ सेमी, ४ सेमी, ५ सेमी) र चित्र २: समकोण त्रिभुज (४ सेमी, ३ सेमी, ५ सेमी)',
      qEn: 'Fig 1: Right △ (3cm, 4cm, 5cm) & Fig 2: Right △ (4cm, 3cm, 5cm)',
      isCong: true,
      reasonNp: 'भुजाहरूको नाप ३, ४, ५ सेमी दुरुस्त बराबर भएकाले घुमाएर खप्ट्याउँदा अनुरूप हुन्छन्।',
      reasonEn: 'All three sides match (3, 4, 5 cm); rotating aligns them congruently.',
    },
    {
      qNp: 'चित्र १: वृत्त (अर्धव्याप्त r = ३ सेमी) र चित्र २: वृत्त (अर्धव्याप्त r = ४ सेमी)',
      qEn: 'Fig 1: Circle (r = 3 cm) & Fig 2: Circle (r = 4 cm)',
      isCong: false,
      reasonNp: 'दुवै वृत्त भए पनि अर्धव्यास फरक (३ सेमी र ४ सेमी) भएकाले आकार उस्तै तर नाप फरक छ।',
      reasonEn: 'Both are circles (same shape), but radii differ (3 cm vs 4 cm), so not congruent.',
    },
    {
      qNp: 'चित्र १: समबाहु त्रिभुज (भुजा ५ सेमी) र चित्र २: वर्ग (भुजा ५ सेमी)',
      qEn: 'Fig 1: Equilateral △ (side 5 cm) & Fig 2: Square (side 5 cm)',
      isCong: false,
      reasonNp: 'भुजा ५ सेमी भए पनि एउटा त्रिभुज र अर्को वर्ग भएकाले आकार नै फरक छ।',
      reasonEn: 'One is a triangle and one is a square; shapes differ completely.',
    },
  ];

  const currentChallenge = CHALLENGE_ITEMS[challengeIdx];

  const handleChallengeGuess = (guess: boolean) => {
    setChallengeAns(guess);
    if (guess === currentChallenge.isCong) {
      setChallengeFeedback(L('उत्कृष्ट! बिल्कुल सही उत्तर।', 'Excellent! Absolutely correct.'));
    } else {
      setChallengeFeedback(L('पुनः विचार गर्नुहोस्!', 'Review the reasoning and try again!'));
    }
  };

  const nextChallenge = () => {
    setChallengeIdx((challengeIdx + 1) % CHALLENGE_ITEMS.length);
    setChallengeAns(null);
    setChallengeFeedback(null);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! नाप (Measurements) लिएर भुजाहरू र कोणहरू बराबर भए/नभएको प्रमाणित गरौँ र चुनौती जितौँ!',
        'Hello! Measure sides and angles to verify congruence with mathematical accuracy!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'side_measurement', np: '१. भुजा र कोण नाप तुलना (Measure Sides)', en: '1. Measure Sides' },
            { id: 'find_matching', np: '२. अनुरूप आकृति पत्ता लगाउने (Find Match)', en: '2. Find Matching Shape' },
            { id: 'congruence_challenge', np: '३. अनुरूपता चुनौती (Congruence Quiz)', en: '3. Congruence Challenge' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as StudioTab)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {isNe ? t.np : t.en}
            </button>
          ))}
        </div>

        {/* Tab 1: Side Measurement */}
        {tab === 'side_measurement' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
                {L('रुलरद्वारा संगत भुजाहरूको नाप तुलना:', 'Measuring Corresponding Sides:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'दुई त्रिभुज △ABC र △PQR का संगत भुजाहरू नापेर तुलना गर्नुहोस्। तिनै भुजाहरू बराबर भएमा त्रिभुजहरू अनुरूप हुन्छन्।',
                  'Compare corresponding sides of △ABC and △PQR. If all three corresponding side pairs match, they are congruent.'
                )}
              </p>
            </div>

            {/* Side selector */}
            <div className="flex gap-2 justify-center">
              {[
                { id: 'a', labelNp: 'भुजा AB र PQ (४ सेमी)', labelEn: 'Sides AB & PQ (4 cm)' },
                { id: 'b', labelNp: 'भुजा BC र QR (५ सेमी)', labelEn: 'Sides BC & QR (5 cm)' },
                { id: 'c', labelNp: 'भुजा AC र PR (३ सेमी)', labelEn: 'Sides AC & PR (3 cm)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSide(s.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeSide === s.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isNe ? s.labelNp : s.labelEn}
                </button>
              ))}
            </div>

            {/* Visual with digital measurement indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="320" height="200" viewBox="0 0 320 200">
                  {/* Triangle 1 ABC */}
                  <polygon points="40,150 140,150 140,70" fill="rgba(59, 130, 246, 0.2)" stroke="#2563eb" strokeWidth="2.5" />
                  <text x="30" y="165" fontSize="11" fontWeight="bold">A</text>
                  <text x="145" y="165" fontSize="11" fontWeight="bold">B</text>
                  <text x="145" y="65" fontSize="11" fontWeight="bold">C</text>

                  {/* Triangle 2 PQR */}
                  <polygon points="180,150 280,150 280,70" fill="rgba(16, 185, 129, 0.2)" stroke="#059669" strokeWidth="2.5" />
                  <text x="170" y="165" fontSize="11" fontWeight="bold">P</text>
                  <text x="285" y="165" fontSize="11" fontWeight="bold">Q</text>
                  <text x="285" y="65" fontSize="11" fontWeight="bold">R</text>

                  {/* Highlight active side */}
                  {activeSide === 'a' && (
                    <>
                      <line x1="40" y1="150" x2="140" y2="150" stroke="#ef4444" strokeWidth="4" />
                      <line x1="180" y1="150" x2="280" y2="150" stroke="#ef4444" strokeWidth="4" />
                      <text x="90" y="140" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#dc2626">४ सेमी</text>
                      <text x="230" y="140" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#dc2626">४ सेमी</text>
                    </>
                  )}
                  {activeSide === 'b' && (
                    <>
                      <line x1="40" y1="150" x2="140" y2="70" stroke="#f59e0b" strokeWidth="4" />
                      <line x1="180" y1="150" x2="280" y2="70" stroke="#f59e0b" strokeWidth="4" />
                      <text x="80" y="100" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#d97706">५ सेमी</text>
                      <text x="220" y="100" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#d97706">५ सेमी</text>
                    </>
                  )}
                  {activeSide === 'c' && (
                    <>
                      <line x1="140" y1="150" x2="140" y2="70" stroke="#7c3aed" strokeWidth="4" />
                      <line x1="280" y1="150" x2="280" y2="70" stroke="#7c3aed" strokeWidth="4" />
                      <text x="155" y="115" fontSize="11" fontWeight="bold" fill="#7c3aed">३ सेमी</text>
                      <text x="295" y="115" fontSize="11" fontWeight="bold" fill="#7c3aed">३ सेमी</text>
                    </>
                  )}
                </svg>
              </div>

              {/* Data Summary */}
              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('तीनवटै भुजाहरूको नाप तालिका:', 'Three Corresponding Side Measures:')}
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>१. AB = PQ = ४ सेमी (बराबर)</div>
                    <div>२. BC = QR = ५ सेमी (बराबर)</div>
                    <div>३. AC = PR = ३ सेमी (बराबर)</div>
                    <div className="text-sm font-black text-emerald-800 pt-2 border-t border-slate-200">
                      ✓ △ABC ≅ △PQR (अनुरूप त्रिभुज प्रमाणित भयो)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Find Matching Shape */}
        {tab === 'find_matching' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-purple-950" style={{ fontFamily: FONT_NP }}>
                {L('दिइएको आकृतिसँग दुरुस्त अनुरूप हुने आकृति पत्ता लगाउनुहोस्:', 'Find the Exactly Congruent Candidate:')}
              </h3>
              <p className="text-xs text-purple-800 mt-1">
                {L('तलका ३ वटा विकल्पहरूमध्ये कुन आकृति सन्दर्भ आकृति (Reference) सँग ठ्याक्कै खप्टिन्छ?', 'Which of the 3 candidates coincides perfectly with the reference shape?')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Reference Figure */}
              <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-300 text-center">
                <div className="text-xs font-black text-indigo-900 mb-2 uppercase">{L('मूल आकृति (Reference)', 'Reference')}</div>
                <svg width="100" height="90" viewBox="0 0 100 90" className="mx-auto">
                  <polygon points="20,70 80,70 80,20" fill="rgba(99, 102, 241, 0.3)" stroke="#4f46e5" strokeWidth="2.5" />
                </svg>
                <div className="text-[10px] text-slate-500 mt-1 font-bold">नाप: ६ × ५ सेमी</div>
              </div>

              {/* Candidate 1 (Different shape: acute triangle) */}
              <button
                onClick={() => {
                  setMatchCandidate(1);
                  setMatchFeedback(L('गलत! यो समकोण त्रिभुज होइन (आकार फरक)।', 'Incorrect! This is an acute triangle (different shape).'));
                }}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  matchCandidate === 1 ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-700 mb-2">{L('विकल्प क', 'Option A')}</div>
                <svg width="100" height="90" viewBox="0 0 100 90" className="mx-auto">
                  <polygon points="15,70 85,70 50,20" fill="none" stroke="#64748b" strokeWidth="2" />
                </svg>
              </button>

              {/* Candidate 2 (Correct: Rotated congruent) */}
              <button
                onClick={() => {
                  setMatchCandidate(2);
                  setMatchFeedback(L('सबास! बिल्कुल सही। यो घुमाइएको भए पनि ठ्याक्कै अनुरूप छ!', 'Correct! Though rotated, it is perfectly congruent!'));
                }}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  matchCandidate === 2 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-700 mb-2">{L('विकल्प ख (सही)', 'Option B')}</div>
                <svg width="100" height="90" viewBox="0 0 100 90" className="mx-auto">
                  <polygon points="20,20 20,70 80,20" fill="none" stroke="#64748b" strokeWidth="2" />
                </svg>
              </button>

              {/* Candidate 3 (Same shape, but smaller size) */}
              <button
                onClick={() => {
                  setMatchCandidate(3);
                  setMatchFeedback(L('गलत! आकार उस्तै भए पनि नाप सानो छ (अनुरूप होइन)।', 'Incorrect! Same shape but smaller size (not congruent).'));
                }}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  matchCandidate === 3 ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-700 mb-2">{L('विकल्प ग', 'Option C')}</div>
                <svg width="100" height="90" viewBox="0 0 100 90" className="mx-auto">
                  <polygon points="30,65 70,65 70,30" fill="none" stroke="#64748b" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {matchFeedback && (
              <div
                className={`p-4 rounded-2xl text-center text-xs md:text-sm font-bold ${
                  matchCandidate === 2
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                {matchFeedback}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Congruence Quiz Challenge */}
        {tab === 'congruence_challenge' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
              <div>
                <h3 className="text-base font-bold text-indigo-950" style={{ fontFamily: FONT_NP }}>
                  {L('अनुरूपता निर्णय चुनौती (Congruence Decision Challenge):', 'Congruence Challenge:')}
                </h3>
                <p className="text-xs text-indigo-800 mt-1">
                  {L('दिइएको जोडी अनुरूप छ वा छैन भनी निर्णय गर्नुहोस्।', 'Determine whether the given pair is congruent.')}
                </p>
              </div>
              <button
                onClick={nextChallenge}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
              >
                <Shuffle className="w-3.5 h-3.5" />
                {L('अर्को जोडी', 'Next Pair')}
              </button>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-4">
              <div className="text-base md:text-lg font-bold text-slate-900" style={{ fontFamily: FONT_NP }}>
                {isNe ? currentChallenge.qNp : currentChallenge.qEn}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleChallengeGuess(true)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md"
                >
                  ✓ {L('अनुरूप छन् (Congruent)', 'Congruent')}
                </button>
                <button
                  onClick={() => handleChallengeGuess(false)}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-md"
                >
                  ✕ {L('अनुरूप छैनन् (Not Congruent)', 'Not Congruent')}
                </button>
              </div>

              {challengeFeedback && (
                <div
                  className={`p-4 rounded-xl text-xs md:text-sm font-bold ${
                    challengeAns === currentChallenge.isCong
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  <div>{challengeFeedback}</div>
                  <div className="text-xs font-normal text-slate-600 mt-1">
                    {isNe ? currentChallenge.reasonNp : currentChallenge.reasonEn}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default CongruenceMeasurementStudio;
