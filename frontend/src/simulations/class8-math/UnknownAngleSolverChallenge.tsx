import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface AngleProblem {
  id: string;
  type: 'alternate' | 'cointerior' | 'corresponding' | 'auxiliary';
  titleEn: string;
  titleNp: string;
  category: string;
  contextEn: string;
  contextNp: string;
  equationEn: string;
  equationNp: string;
  solutionX: number;
  stepsEn: string[];
  stepsNp: string[];
  angle1Expr: string;
  angle2Expr: string;
  svgType: 'transversal' | 'zigzag';
}

const PROBLEMS: AngleProblem[] = [
  {
    id: 'p1',
    type: 'alternate',
    titleEn: 'Alternate Angles: Find x',
    titleNp: 'एकान्तर कोण: x को मान पत्ता लगाउनुहोस्',
    category: 'Alternate Angles (एकान्तर कोण)',
    contextEn: 'In the figure, line AB is parallel to CD. Given alternate angles are (3x - 50)° and (x + 10)°. Find the value of x.',
    contextNp: 'चित्रमा रेखा AB र CD समानान्तर छन्। एकान्तर कोणहरू (3x - 50)° र (x + 10)° दिइएका छन्। x को मान पत्ता लगाउनुहोस्।',
    equationEn: '3x - 50 = x + 10',
    equationNp: '3x - 50 = x + 10',
    solutionX: 30,
    stepsEn: [
      'Since lines are parallel, alternate angles are equal: 3x - 50 = x + 10',
      'Collect like terms: 3x - x = 10 + 50',
      '2x = 60 => x = 30°',
      'Check: 3(30) - 50 = 40° and 30 + 10 = 40°. Equal!'
    ],
    stepsNp: [
      'समानान्तर रेखा भएकाले एकान्तर कोणहरू बराबर हुन्छन्: 3x - 50 = x + 10',
      'समान पदहरू एकातर्फ ल्याउँदा: 3x - x = 10 + 50',
      '2x = 60 => x = 30°',
      'जाँच: 3(30) - 50 = 40° र 30 + 10 = 40°। दुवै बराबर!'
    ],
    angle1Expr: '(3x - 50)°',
    angle2Expr: '(x + 10)°',
    svgType: 'transversal'
  },
  {
    id: 'p2',
    type: 'cointerior',
    titleEn: 'Co-Interior Angles: Find x',
    titleNp: 'क्रमागत भित्री कोण: x को मान पत्ता लगाउनुहोस्',
    category: 'Co-Interior Angles (क्रमागत भित्री कोण)',
    contextEn: 'Two consecutive interior angles on the same side of a transversal are (2x + 10)° and (3x + 20)°. If lines are parallel, find x.',
    contextNp: 'छेदकको एकैतर्फका दुई क्रमागत भित्री कोणहरू (2x + 10)° र (3x + 20)° छन्। रेखाहरू समानान्तर भए x को मान निकाल्नुहोस्।',
    equationEn: '(2x + 10) + (3x + 20) = 180',
    equationNp: '(2x + 10) + (3x + 20) = 180',
    solutionX: 30,
    stepsEn: [
      'Co-interior angles are supplementary: (2x + 10) + (3x + 20) = 180°',
      'Combine like terms: 5x + 30 = 180°',
      '5x = 180 - 30 => 5x = 150°',
      'x = 150 / 5 => x = 30°',
      'Angles are: 2(30)+10 = 70° and 3(30)+20 = 110° (Sum = 180°)'
    ],
    stepsNp: [
      'क्रमागत भित्री कोणहरूको जोड 180° हुन्छ: (2x + 10) + (3x + 20) = 180°',
      'समान पदहरू जोड्दा: 5x + 30 = 180°',
      '5x = 180 - 30 => 5x = 150°',
      'x = 150 / 5 => x = 30°',
      'कोणहरू: 2(30)+10 = 70° र 3(30)+20 = 110° (जोड = 180°)'
    ],
    angle1Expr: '(2x + 10)°',
    angle2Expr: '(3x + 20)°',
    svgType: 'transversal'
  },
  {
    id: 'p3',
    type: 'corresponding',
    titleEn: 'Corresponding Angles: Find x',
    titleNp: 'संगत कोण: x को मान पत्ता लगाउनुहोस्',
    category: 'Corresponding Angles (संगत कोण)',
    contextEn: 'In the figure, corresponding angles are given as (4x + 15)° and (2x + 55)°. Find the value of x.',
    contextNp: 'चित्रमा संगत कोणहरू (4x + 15)° र (2x + 55)° दिइएका छन्। x को मान पत्ता लगाउनुहोस्।',
    equationEn: '4x + 15 = 2x + 55',
    equationNp: '4x + 15 = 2x + 55',
    solutionX: 20,
    stepsEn: [
      'Corresponding angles on parallel lines are equal: 4x + 15 = 2x + 55',
      'Subtract 2x and 15: 4x - 2x = 55 - 15',
      '2x = 40 => x = 20°',
      'Check: 4(20) + 15 = 95° and 2(20) + 55 = 95°. Equal!'
    ],
    stepsNp: [
      'समानान्तर रेखामा संगत कोणहरू बराबर हुन्छन्: 4x + 15 = 2x + 55',
      'पदहरू मिलाउँदा: 4x - 2x = 55 - 15',
      '2x = 40 => x = 20°',
      'जाँच: 4(20) + 15 = 95° र 2(20) + 55 = 95°। दुवै बराबर!'
    ],
    angle1Expr: '(4x + 15)°',
    angle2Expr: '(2x + 55)°',
    svgType: 'transversal'
  },
  {
    id: 'p4',
    type: 'auxiliary',
    titleEn: 'Roof Truss / Zigzag Angle (Auxiliary Line)',
    titleNp: 'छानाको ट्रस / बाङ्गो कोण (सहायक रेखा)',
    category: 'Real-Life / Auxiliary Line (सहायक रेखा विधि)',
    contextEn: 'In a bridge truss where top chord AB ∥ bottom chord CD, the inner angle at vertex P is x°. The upper arm makes 45° with AB and lower arm makes 35° with CD. Find x.',
    contextNp: 'एउटा पुलको ट्रसमा माथिल्लो रेखा AB ∥ तल्लो रेखा CD छ। बिन्दु P मा बन्ने कोण x° छ। माथिल्लो भागले AB सँग 45° र तल्लो भागले CD सँग 35° कोण बनाउँछ भने x को मान पत्ता लगाउनुहोस्।',
    equationEn: 'x = 45° + 35°',
    equationNp: 'x = 45° + 35°',
    solutionX: 80,
    stepsEn: [
      'Draw an auxiliary line PQ parallel to AB and CD through vertex P',
      'The upper part of angle P is alternate to 45° => upper angle = 45°',
      'The lower part of angle P is alternate to 35° => lower angle = 35°',
      'Total angle x = 45° + 35° = 80°'
    ],
    stepsNp: [
      'बिन्दु P बाट रेखा AB र CD सँग समानान्तर हुने गरी सहायक रेखा PQ खिचौं',
      'कोण P को माथिल्लो भाग 45° सँग एकान्तर कोण हुन्छ => माथिल्लो कोण = 45°',
      'कोण P को तल्लो भाग 35° सँग एकान्तर कोण हुन्छ => तल्लो कोण = 35°',
      'जम्मा कोण x = 45° + 35° = 80°'
    ],
    angle1Expr: '45°',
    angle2Expr: '35°',
    svgType: 'zigzag'
  }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'यदि (5x - 20)° र (3x + 10)° समानान्तर रेखाका एकान्तर कोणहरू भए x को मान कति हुन्छ?',
    en: 'If (5x - 20)° and (3x + 10)° are alternate angles on parallel lines, what is x?',
    options: [
      { key: 'A', label: '15°' },
      { key: 'B', label: '12°' },
      { key: 'C', label: '20°' },
      { key: 'D', label: '25°' }
    ],
    answer: 'A'
  },
  {
    np: 'दुई समानान्तर रेखाको बीचमा बनेको बाङ्गो (zigzag) कोणको शीर्षबिन्दुबाट सहायक समानान्तर रेखा किन खिचिएको हो?',
    en: 'Why do we draw an auxiliary parallel line through the vertex of a zigzag angle between two parallel lines?',
    options: [
      { key: 'A', label: 'अज्ञात कोणलाई दुई एकान्तर कोण जोडीमा विभाजन गर्न' },
      { key: 'B', label: 'त्रिभुज बनाउन' },
      { key: 'C', label: 'स्केलले नाप्न' },
      { key: 'D', label: 'अन्य रेखा मेटाउन' }
    ],
    answer: 'A'
  }
];

export const UnknownAngleSolverChallenge: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U13-03',
    chapter: 13,
    titleNp: 'अज्ञात कोण पत्ता लगाउने चुनौती',
    titleEn: 'Unknown Angle Solver Challenge'
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [selectedProblemId, setSelectedProblemId] = useState<string>('p1');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [verdict, setVerdict] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showFullSolution, setShowFullSolution] = useState<boolean>(false);

  const activeProblem = PROBLEMS.find((p) => p.id === selectedProblemId) || PROBLEMS[0];

  const handleCheck = () => {
    const val = parseFloat(userAnswer);
    if (Math.abs(val - activeProblem.solutionX) < 0.01) {
      setVerdict('correct');
      kit.good();
    } else {
      setVerdict('incorrect');
      kit.oops();
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! समानान्तर रेखा र कोणका नियमहरू प्रयोग गरी अज्ञात कोण x को मान पत्ता लगाउनुहोस्!',
        'Hello! Apply geometric theorems on parallel lines to solve for unknown angle variables!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Problem selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            {L('अभ्यास समस्या चयन गर्नुहोस्:', 'Select Problem Scenario:')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PROBLEMS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProblemId(p.id);
                  setUserAnswer('');
                  setVerdict(null);
                  setShowHint(false);
                  setShowFullSolution(false);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedProblemId === p.id
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs text-amber-400 font-semibold">{p.category}</div>
                <div className="font-bold text-sm text-slate-100 mt-1">{isNe ? p.titleNp : p.titleEn}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Problem Description Card */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/30 rounded-2xl border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📐</span>
            <div>
              <h3 className="font-bold text-amber-300 text-base">{isNe ? activeProblem.titleNp : activeProblem.titleEn}</h3>
              <p className="text-sm text-slate-200 mt-1">{isNe ? activeProblem.contextNp : activeProblem.contextEn}</p>
            </div>
          </div>
        </div>

        {/* Geometric Canvas */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
          <svg viewBox="0 0 540 300" className="w-full max-w-2xl h-72 select-none">
            <defs>
              <pattern id="gridProblem" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="540" height="300" fill="url(#gridProblem)" />

            {/* If Transversal Problem */}
            {activeProblem.svgType === 'transversal' && (
              <g>
                {/* Line AB */}
                <line x1="40" y1="80" x2="500" y2="80" stroke="#38bdf8" strokeWidth="3" />
                <polygon points="260,75 272,80 260,85" fill="#38bdf8" />
                <text x="30" y="85" fill="#38bdf8" fontSize="13" fontWeight="bold">A</text>
                <text x="510" y="85" fill="#38bdf8" fontSize="13" fontWeight="bold">B</text>

                {/* Line CD */}
                <line x1="40" y1="210" x2="500" y2="210" stroke="#38bdf8" strokeWidth="3" />
                <polygon points="260,205 272,210 260,215" fill="#38bdf8" />
                <text x="30" y="215" fill="#38bdf8" fontSize="13" fontWeight="bold">C</text>
                <text x="510" y="215" fill="#38bdf8" fontSize="13" fontWeight="bold">D</text>

                {/* Transversal Line */}
                <line x1="160" y1="260" x2="380" y2="30" stroke="#f43f5e" strokeWidth="2.5" />

                {/* Highlight based on problem type */}
                {activeProblem.type === 'alternate' && (
                  <g>
                    <text x="270" y="105" fill="#f59e0b" fontSize="14" fontWeight="bold">
                      {activeProblem.angle1Expr}
                    </text>
                    <text x="230" y="200" fill="#f59e0b" fontSize="14" fontWeight="bold">
                      {activeProblem.angle2Expr}
                    </text>
                    <polyline points="180,80 332,80 208,210 360,210" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="5 5" />
                  </g>
                )}

                {activeProblem.type === 'cointerior' && (
                  <g>
                    <text x="270" y="105" fill="#a855f7" fontSize="14" fontWeight="bold">
                      {activeProblem.angle1Expr}
                    </text>
                    <text x="220" y="200" fill="#a855f7" fontSize="14" fontWeight="bold">
                      {activeProblem.angle2Expr}
                    </text>
                    <polyline points="380,80 332,80 208,210 380,210" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="5 5" />
                  </g>
                )}

                {activeProblem.type === 'corresponding' && (
                  <g>
                    <text x="340" y="70" fill="#10b981" fontSize="14" fontWeight="bold">
                      {activeProblem.angle1Expr}
                    </text>
                    <text x="220" y="200" fill="#10b981" fontSize="14" fontWeight="bold">
                      {activeProblem.angle2Expr}
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* If Zigzag / Roof Truss Problem */}
            {activeProblem.svgType === 'zigzag' && (
              <g>
                {/* Top line AB */}
                <line x1="50" y1="60" x2="490" y2="60" stroke="#38bdf8" strokeWidth="3" />
                <polygon points="260,55 272,60 260,65" fill="#38bdf8" />
                <text x="35" y="65" fill="#38bdf8" fontSize="13" fontWeight="bold">A</text>
                <text x="500" y="65" fill="#38bdf8" fontSize="13" fontWeight="bold">B</text>

                {/* Bottom line CD */}
                <line x1="50" y1="240" x2="490" y2="240" stroke="#38bdf8" strokeWidth="3" />
                <polygon points="260,235 272,240 260,245" fill="#38bdf8" />
                <text x="35" y="245" fill="#38bdf8" fontSize="13" fontWeight="bold">C</text>
                <text x="500" y="245" fill="#38bdf8" fontSize="13" fontWeight="bold">D</text>

                {/* Zigzag lines meeting at P (210, 150) */}
                <line x1="330" y1="60" x2="210" y2="150" stroke="#f43f5e" strokeWidth="3" />
                <line x1="210" y1="150" x2="310" y2="240" stroke="#f43f5e" strokeWidth="3" />

                {/* Vertex P */}
                <circle cx="210" cy="150" r="4" fill="#ffffff" />
                <text x="185" y="155" fill="#ffffff" fontSize="13" fontWeight="bold">P</text>
                <text x="225" y="155" fill="#f59e0b" fontSize="15" fontWeight="bold">x° = ?</text>

                {/* Angle tags */}
                <text x="280" y="85" fill="#38bdf8" fontSize="13" fontWeight="bold">{activeProblem.angle1Expr}</text>
                <text x="270" y="230" fill="#38bdf8" fontSize="13" fontWeight="bold">{activeProblem.angle2Expr}</text>

                {/* Auxiliary parallel line PQ */}
                {showHint && (
                  <g>
                    <line x1="50" y1="150" x2="490" y2="150" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 4" />
                    <text x="495" y="155" fill="#a855f7" fontSize="12" fontWeight="bold">PQ ∥ AB ∥ CD</text>
                  </g>
                )}
              </g>
            )}
          </svg>
        </div>

        {/* Student Answer Input & Feedback */}
        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-300">
                {L('x को मान प्रविष्ट गर्नुहोस्:', 'Enter value of x:')}
              </span>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="30"
                  className="w-24 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-amber-400 outline-none"
                />
                <span className="text-slate-400 font-bold">°</span>
              </div>
              <button
                onClick={handleCheck}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all"
              >
                {L('जाँच गर्नुहोस्', 'Check Answer')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-amber-300 font-medium"
              >
                {showHint ? L('💡 संकेत लुकाउनुहोस्', 'Hide Hint') : L('💡 संकेत (Hint)', 'Show Hint')}
              </button>
              <button
                onClick={() => setShowFullSolution(!showFullSolution)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300"
              >
                {showFullSolution ? L('समाधान लुकाउनुहोस्', 'Hide Solution') : L('पूर्ण समाधान (Solution)', 'Show Solution')}
              </button>
            </div>
          </div>

          {verdict && (
            <div
              className={`p-3 rounded-xl border text-sm font-bold ${
                verdict === 'correct'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {verdict === 'correct'
                ? L('🎉 स्याबास! तपाईंको उत्तर सही छ! (x = ' + activeProblem.solutionX + '°)', '🎉 Great job! Correct answer! (x = ' + activeProblem.solutionX + '°)')
                : L('❌ उत्तर मिलेन। कृपया समीकरण पुनः जाँच्नुहोस् वा संकेत हेर्नुहोस्।', '❌ Incorrect. Please check the equation or see the hint.')}
            </div>
          )}

          {showHint && (
            <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200">
              <span className="font-bold">{L('💡 संकेत: ', '💡 Hint: ')}</span>
              {isNe ? activeProblem.stepsNp[0] : activeProblem.stepsEn[0]}
            </div>
          )}

          {showFullSolution && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {L('चरणबद्ध समाधान (Detailed Solution):', 'Detailed Solution Steps:')}
              </div>
              {(isNe ? activeProblem.stepsNp : activeProblem.stepsEn).map((st, i) => (
                <div key={i} className="text-xs text-slate-300 font-mono flex items-start gap-2">
                  <span className="text-amber-400 font-bold">{i + 1}.</span>
                  <span>{st}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};
export default UnknownAngleSolverChallenge;
