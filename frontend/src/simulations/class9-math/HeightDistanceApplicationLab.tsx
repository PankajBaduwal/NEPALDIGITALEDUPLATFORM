import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const HeightDistanceApplicationLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U20-03',
    chapter: 20,
    titleNp: 'उचाइ र दुरी व्यावहारिक अनुप्रयोग प्रयोगशाला',
    titleEn: 'Height and Distance Application Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeScenario, setActiveScenario] = useState<'building' | 'tree' | 'ladder' | 'word_problem'>('building');

  // Scenario 1: Building
  const [buildingDistance, setBuildingDistance] = useState<number>(30); // meters
  const [buildingAngleDeg, setBuildingAngleDeg] = useState<number>(45); // degrees
  const angleRadB = (buildingAngleDeg * Math.PI) / 180;
  const buildingHeight = (buildingDistance * Math.tan(angleRadB)).toFixed(2);

  // Scenario 2: Tree
  const [treeDistance, setTreeDistance] = useState<number>(20); // meters
  const [treeAngleDeg, setTreeAngleDeg] = useState<number>(30); // degrees
  const angleRadT = (treeAngleDeg * Math.PI) / 180;
  const treeHeight = (treeDistance * Math.tan(angleRadT)).toFixed(2);

  // Scenario 3: Ladder
  const [ladderLength, setLadderLength] = useState<number>(10); // meters
  const [ladderAngleDeg, setLadderAngleDeg] = useState<number>(60); // degrees
  const angleRadL = (ladderAngleDeg * Math.PI) / 180;
  const ladderVerticalHeight = (ladderLength * Math.sin(angleRadL)).toFixed(2);
  const ladderGroundDist = (ladderLength * Math.cos(angleRadL)).toFixed(2);

  // Scenario 4: Word Problem Challenge
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userGuess, setUserGuess] = useState<string>('');
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const PROBLEMS = [
    {
      titleNp: 'घरको उचाइ पत्ता लगाउनुहोस्',
      titleEn: 'Find the height of a house',
      descNp: 'एउटा घरको फेदबाट 15 m टाढाको बिन्दुबाट घरको टुप्पोमा हेर्दा उन्नतांश कोण (Angle of elevation) 45° पाइयो भने घरको उचाइ कति होला?',
      descEn: 'From a point on the ground 15 m away from the foot of a house, the angle of elevation of the top is 45°. Find the height of the house.',
      ans: 15,
      unit: 'm',
      solutionNp: 'tan 45° = Opposite / Adjacent = h / 15\n1 = h / 15 ⇒ h = 15 m।',
      solutionEn: 'tan 45° = h / 15 => 1 = h / 15 => h = 15 m.',
    },
    {
      titleNp: 'रुखको फेदसम्मको दुरी',
      titleEn: 'Distance to the foot of a tree',
      descNp: '20 m अग्लो एउटा रुखको टुप्पोलाई जमिनको कुनै बिन्दुबाट हेर्दा उन्नतांश कोण 45° हुन्छ भने उक्त बिन्दुबाट रुखको फेदसम्मको दुरी कति होला?',
      descEn: 'The angle of elevation of the top of a 20 m high tree is 45°. Find the distance of the observation point from the foot of the tree.',
      ans: 20,
      unit: 'm',
      solutionNp: 'tan 45° = 20 / d ⇒ 1 = 20 / d ⇒ d = 20 m।',
      solutionEn: 'tan 45° = 20 / d => 1 = 20 / d => d = 20 m.',
    },
    {
      titleNp: 'भित्तामा भर्‍याङ',
      titleEn: 'Ladder leaning on a wall',
      descNp: '12 m लामो भर्‍याङ जमिनसँग 30° को कोण बनाउँदै भित्तामा लगाइएको छ भने भर्‍याङले भित्तामा कति उचाइ छुन्छ?',
      descEn: 'A 12 m long ladder leans against a vertical wall making an angle of 30° with the ground. Find the vertical height reached by the ladder on the wall.',
      ans: 6,
      unit: 'm',
      solutionNp: 'sin 30° = h / 12 ⇒ 1/2 = h / 12 ⇒ h = 12 / 2 = 6 m।',
      solutionEn: 'sin 30° = h / 12 => 1/2 = h / 12 => h = 6 m.',
    },
  ];

  const currentProb = PROBLEMS[challengeIdx];

  const handleCheckChallenge = () => {
    const val = parseFloat(userGuess);
    if (!isNaN(val)) {
      setIsAnswerChecked(true);
      if (Math.abs(val - currentProb.ans) < 0.1) {
        setIsCorrect(true);
        setScore(s => s + 25);
      } else {
        setIsCorrect(false);
      }
    }
  };

  const handleNextChallenge = () => {
    setUserGuess('');
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setChallengeIdx(c => (c + 1) % PROBLEMS.length);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! त्रिकोणमितिका अनुपातहरू (विशेषगरी tan र sin) प्रयोग गरी भवन, रुख र भर्‍याङको उचाइ तथा दुरी निकाल्ने वास्तविक समस्याहरू हल गर्नुहोस्!',
        'Welcome! Apply trigonometric ratios (especially tangent and sine) to calculate real-world heights and distances of buildings, trees, and ladders!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Scenarios */}
        <div className="lg:col-span-12 flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveScenario('building')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeScenario === 'building'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏢</span>
            <span>{L('1. घर / भवनको उचाइ (Building Height)', '1. Building Height')}</span>
          </button>
          <button
            onClick={() => setActiveScenario('tree')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeScenario === 'tree'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🌳</span>
            <span>{L('2. रुखको उचाइ (Tree Measurement)', '2. Tree Measurement')}</span>
          </button>
          <button
            onClick={() => setActiveScenario('ladder')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeScenario === 'ladder'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🪜</span>
            <span>{L('3. भर्‍याङ र भित्ता (Ladder on Wall)', '3. Ladder on Wall')}</span>
          </button>
          <button
            onClick={() => setActiveScenario('word_problem')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeScenario === 'word_problem'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📝</span>
            <span>{L('4. पाठ्यपुस्तक समस्या चुनौती (Challenge)', '4. Textbook Challenge')}</span>
          </button>
        </div>

        {/* SCENARIO 1: Building Height */}
        {activeScenario === 'building' && (
          <>
            {/* Visual Outdoor Simulation */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('भवनको उचाइ मापन (Building Height Simulation)', 'Building Height Measurement')}
                </h4>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  h = d × tan θ
                </span>
              </div>

              {/* Graphic Scene SVG */}
              <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-center overflow-x-auto">
                <svg viewBox="0 0 460 250" className="w-full max-w-[440px] select-none">
                  {/* Sky & Ground line */}
                  <line x1="20" y1="210" x2="440" y2="210" stroke="#64748b" strokeWidth="2.5" />

                  {/* Building on the right */}
                  <rect x="340" y="40" width="80" height="170" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
                  {/* Windows */}
                  {Array.from({ length: 4 }).map((_, r) => (
                    <g key={r}>
                      <rect x="355" y={55 + r * 35} width="20" height="20" fill="#93c5fd" stroke="#3b82f6" />
                      <rect x="385" y={55 + r * 35} width="20" height="20" fill="#93c5fd" stroke="#3b82f6" />
                    </g>
                  ))}

                  {/* Observer on the left at (80, 210) */}
                  <circle cx="80" cy="195" r="8" fill="#f59e0b" />
                  <line x1="80" y1="203" x2="80" y2="210" stroke="#f59e0b" strokeWidth="3" />
                  <text x="80" y="228" textAnchor="middle" className="text-[10px] font-bold fill-slate-600">
                    {L('अवलोकनकर्ता', 'Observer')}
                  </text>

                  {/* Right triangle: Ground (80, 210) to (340, 210) to (340, 40) */}
                  <line x1="80" y1="210" x2="340" y2="40" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="80" y1="210" x2="340" y2="210" stroke="#3b82f6" strokeWidth="2" />
                  <line x1="340" y1="40" x2="340" y2="210" stroke="#10b981" strokeWidth="2.5" />

                  {/* Angle arc at observer */}
                  <path d="M 120 210 A 40 40 0 0 0 115 190" fill="none" stroke="#ef4444" strokeWidth="2" />
                  <text x="125" y="195" className="text-[11px] font-bold fill-red-600 font-mono">
                    θ = {fmt(buildingAngleDeg)}°
                  </text>

                  {/* Distance label */}
                  <text x="210" y="225" textAnchor="middle" className="text-xs font-bold fill-blue-700 font-mono">
                    d = {fmt(buildingDistance)} m
                  </text>

                  {/* Height label */}
                  <text x="350" y="30" textAnchor="middle" className="text-xs font-bold fill-emerald-800 font-mono">
                    h = {fmt(buildingHeight)} m
                  </text>
                </svg>
              </div>

              {/* Interactive Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{L('अवलोकन बिन्दुको दुरी (d):', 'Distance (d):')}</span>
                    <span className="font-mono text-indigo-700">{fmt(buildingDistance)} m</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={buildingDistance}
                    onChange={e => setBuildingDistance(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{L('उन्नतांश कोण (Elevation Angle θ):', 'Angle of Elevation (θ):')}</span>
                    <span className="font-mono text-indigo-700">{fmt(buildingAngleDeg)}°</span>
                  </div>
                  <div className="flex gap-1.5 pt-0.5">
                    {[30, 45, 60].map(a => (
                      <button
                        key={a}
                        onClick={() => setBuildingAngleDeg(a)}
                        className={`flex-1 py-1 rounded text-xs font-bold ${
                          buildingAngleDeg === a ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {a}°
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Calculation */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">
                {L('चरणबद्ध गणितीय समाधान:', 'Step-by-Step Solution:')}
              </h4>

              <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-xs space-y-2.5">
                <div>
                  <span className="text-slate-600 block">{L('1. दिइएको मानहरू (Given):', '1. Given:')}</span>
                  <div className="font-mono font-semibold text-slate-800 mt-0.5">
                    Distance (d) = {fmt(buildingDistance)} m, angle (θ) = {fmt(buildingAngleDeg)}°
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 block">{L('2. उपयुक्त त्रिकोणमितीय अनुपात (Formula):', '2. Formula:')}</span>
                  <div className="font-mono font-bold text-indigo-900 mt-0.5">
                    tan θ = \frac&#123;Opposite side, h&#125;&#123;Adjacent side, d&#125;
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 block">{L('3. मान प्रतिस्थापन गर्दा (Substitution):', '3. Substitution:')}</span>
                  <div className="font-mono text-slate-800 mt-0.5">
                    tan {fmt(buildingAngleDeg)}° = \frac&#123;h&#125;&#123;{fmt(buildingDistance)}&#125;
                  </div>
                  <div className="font-mono text-slate-800 mt-1">
                    h = {fmt(buildingDistance)} × tan {fmt(buildingAngleDeg)}° = {fmt(buildingDistance)} × {Math.tan(angleRadB).toFixed(3)}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-indigo-200 flex justify-between items-center text-sm font-bold text-indigo-950">
                  <span>{L('भवनको उचाइ (Height, h):', 'Building Height (h):')}</span>
                  <span className="font-mono text-base text-indigo-700">{fmt(buildingHeight)} m</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SCENARIO 2: Tree Height */}
        {activeScenario === 'tree' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('रुखको उचाइ मापन (Tree Height Problem)', 'Tree Height Measurement')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              {/* Sliders */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{L('रुखको फेदबाट दुरी (d):', 'Distance from tree foot (d):')}</span>
                    <span className="font-mono text-indigo-700">{fmt(treeDistance)} m</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={treeDistance}
                    onChange={e => setTreeDistance(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{L('उन्नतांश कोण (θ):', 'Angle of elevation (θ):')}</span>
                    <span className="font-mono text-indigo-700">{fmt(treeAngleDeg)}°</span>
                  </div>
                  <div className="flex gap-2">
                    {[30, 45, 60].map(a => (
                      <button
                        key={a}
                        onClick={() => setTreeAngleDeg(a)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                          treeAngleDeg === a ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-700'
                        }`}
                      >
                        {a}°
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculation Output */}
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-950">
                <div className="font-bold text-sm">
                  {L('रुखको उचाइ हिसाब:', 'Tree Height Calculation:')}
                </div>
                <div className="font-mono text-[11px] space-y-1">
                  <div>tan {fmt(treeAngleDeg)}° = h / {fmt(treeDistance)}</div>
                  <div>h = {fmt(treeDistance)} × tan {fmt(treeAngleDeg)}°</div>
                </div>
                <div className="pt-2 text-base font-bold font-mono text-emerald-800">
                  {L('रुखको उचाइ =', 'Tree Height =')} {fmt(treeHeight)} m
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO 3: Ladder Against Wall */}
        {activeScenario === 'ladder' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('भित्तामा लगाइएको भर्‍याङ (Ladder Leaning on a Wall)', 'Ladder on a Vertical Wall')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              {/* Sliders */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{L('भर्‍याङको लम्बाइ (कर्ण, L):', 'Ladder Length (Hypotenuse, L):')}</span>
                    <span className="font-mono text-indigo-700">{fmt(ladderLength)} m</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="1"
                    value={ladderLength}
                    onChange={e => setLadderLength(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{L('जमिनसँगको कोण (Angle with ground θ):', 'Angle with ground (θ):')}</span>
                    <span className="font-mono text-indigo-700">{fmt(ladderAngleDeg)}°</span>
                  </div>
                  <div className="flex gap-2">
                    {[30, 45, 60].map(a => (
                      <button
                        key={a}
                        onClick={() => setLadderAngleDeg(a)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                          ladderAngleDeg === a ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-700'
                        }`}
                      >
                        {a}°
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ladder Results */}
              <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 text-xs text-blue-950">
                <div className="font-bold text-sm">
                  {L('भर्‍याङको नापहरूको परिणाम:', 'Ladder Dimensions & Pythagoras:')}
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="p-2 bg-white rounded border border-blue-100 flex justify-between">
                    <span>Height h = L × sin θ:</span>
                    <span className="font-bold text-indigo-700">{fmt(ladderVerticalHeight)} m</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-blue-100 flex justify-between">
                    <span>Distance from the base d = L × cos θ:</span>
                    <span className="font-bold text-indigo-700">{fmt(ladderGroundDist)} m</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600">
                  Pythagoras check: h² + d² = ({fmt(ladderVerticalHeight)})² + ({fmt(ladderGroundDist)})² ≈ {fmt(ladderLength)}²
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO 4: Word Problem Challenge */}
        {activeScenario === 'word_problem' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                {L(`प्रश्न ${challengeIdx + 1} / ${PROBLEMS.length}: `, `Problem ${challengeIdx + 1} of ${PROBLEMS.length}: `)}
                {L(currentProb.titleNp, currentProb.titleEn)}
              </span>
              <span className="font-bold text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                ⭐ {L(`अङ्क: ${fmt(score)}`, `Score: ${score}`)}
              </span>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {L(currentProb.descNp, currentProb.descEn)}
            </p>

            {/* Input & Check */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">
                {L('तपाईंको उत्तर:', 'Your Answer:')}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={userGuess}
                  onChange={e => setUserGuess(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCheckChallenge()}
                  disabled={isAnswerChecked}
                  placeholder="?"
                  className="w-24 text-center text-sm font-bold font-mono p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">{currentProb.unit}</span>
              </div>
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckChallenge}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {L('जाँच गर्नुहोस्', 'Check Answer')}
                </button>
              ) : (
                <button
                  onClick={handleNextChallenge}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {L('अर्को प्रश्न →', 'Next Problem →')}
                </button>
              )}
            </div>

            {/* Solution Feedback */}
            {isAnswerChecked && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="font-bold text-sm">
                  {isCorrect
                    ? L(`🎉 उत्कृष्ट! सही उत्तर: ${fmt(currentProb.ans)} ${currentProb.unit}`, `🎉 Excellent! Correct: ${currentProb.ans} ${currentProb.unit}`)
                    : L(`❌ पुनः प्रयास गर्नुहोस्! सही उत्तर: ${fmt(currentProb.ans)} ${currentProb.unit}`, `❌ Incorrect! Correct: ${currentProb.ans} ${currentProb.unit}`)}
                </div>
                <div className="font-mono bg-white p-3 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-line text-[11px] leading-relaxed">
                  {L(currentProb.solutionNp, currentProb.solutionEn)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default HeightDistanceApplicationLab;
