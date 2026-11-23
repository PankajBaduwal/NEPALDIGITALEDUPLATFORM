import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const TrigRatioConversionLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U2-03',
    chapter: 2,
    titleNp: 'त्रिकोणमितीय अनुपात रूपान्तरण प्रयोगशाला',
    titleEn: 'Trigonometric Ratio Conversion Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'network' | 'all_in_terms_of' | 'challenge'>('network');

  // Activity A: Pairwise Conversion
  const [sourceRatio, setSourceRatio] = useState<'sin' | 'cos' | 'tan' | 'sec'>('sin');
  const [targetRatio, setTargetRatio] = useState<'cos' | 'tan' | 'sec' | 'cosec' | 'cot'>('cos');

  // Pairwise Formulas
  const CONVERSIONS: Record<string, Record<string, { formula: string; stepsNp: string; stepsEn: string }>> = {
    sin: {
      cos: {
        formula: 'cos θ = √(1 − sin² θ)',
        stepsNp: 'sin² θ + cos² θ = १ बाट: cos² θ = १ − sin² θ ⇒ cos θ = √(१ − sin² θ)',
        stepsEn: 'From sin² θ + cos² θ = 1: cos² θ = 1 − sin² θ => cos θ = √(1 − sin² θ)',
      },
      tan: {
        formula: 'tan θ = sin θ / √(1 − sin² θ)',
        stepsNp: 'tan θ = sin θ / cos θ। cos θ = √(१ − sin² θ) प्रतिस्थापन गर्दा: tan θ = sin θ / √(१ − sin² θ)',
        stepsEn: 'tan θ = sin θ / cos θ. Substituting cos θ = √(1 − sin² θ): tan θ = sin θ / √(1 − sin² θ)',
      },
      sec: {
        formula: 'sec θ = 1 / √(1 − sin² θ)',
        stepsNp: 'sec θ = १ / cos θ = १ / √(१ − sin² θ)',
        stepsEn: 'sec θ = 1 / cos θ = 1 / √(1 − sin² θ)',
      },
      cosec: {
        formula: 'cosec θ = 1 / sin θ',
        stepsNp: 'पारस्परिक सम्बन्ध अनुसार: cosec θ = १ / sin θ',
        stepsEn: 'By reciprocal definition: cosec θ = 1 / sin θ',
      },
      cot: {
        formula: 'cot θ = √(1 − sin² θ) / sin θ',
        stepsNp: 'cot θ = cos θ / sin θ = √(१ − sin² θ) / sin θ',
        stepsEn: 'cot θ = cos θ / sin θ = √(1 − sin² θ) / sin θ',
      },
    },
    cos: {
      sin: {
        formula: 'sin θ = √(1 − cos² θ)',
        stepsNp: 'sin² θ = १ − cos² θ ⇒ sin θ = √(१ − cos² θ)',
        stepsEn: 'sin² θ = 1 − cos² θ => sin θ = √(1 − cos² θ)',
      },
      tan: {
        formula: 'tan θ = √(1 − cos² θ) / cos θ',
        stepsNp: 'tan θ = sin θ / cos θ = √(१ − cos² θ) / cos θ',
        stepsEn: 'tan θ = sin θ / cos θ = √(1 − cos² θ) / cos θ',
      },
      sec: {
        formula: 'sec θ = 1 / cos θ',
        stepsNp: 'sec θ = १ / cos θ',
        stepsEn: 'sec θ = 1 / cos θ',
      },
      cosec: {
        formula: 'cosec θ = 1 / √(1 − cos² θ)',
        stepsNp: 'cosec θ = १ / sin θ = १ / √(१ − cos² θ)',
        stepsEn: 'cosec θ = 1 / sin θ = 1 / √(1 − cos² θ)',
      },
      cot: {
        formula: 'cot θ = cos θ / √(1 − cos² θ)',
        stepsNp: 'cot θ = cos θ / sin θ = cos θ / √(१ − cos² θ)',
        stepsEn: 'cot θ = cos θ / sin θ = cos θ / √(1 − cos² θ)',
      },
    },
    tan: {
      sin: {
        formula: 'sin θ = tan θ / √(1 + tan² θ)',
        stepsNp: 'sec² θ = १ + tan² θ ⇒ sec θ = √(१ + tan² θ)। sin θ = tan θ / sec θ = tan θ / √(१ + tan² θ)',
        stepsEn: 'sec θ = √(1 + tan² θ). sin θ = tan θ / sec θ = tan θ / √(1 + tan² θ)',
      },
      cos: {
        formula: 'cos θ = 1 / √(1 + tan² θ)',
        stepsNp: 'cos θ = १ / sec θ = १ / √(१ + tan² θ)',
        stepsEn: 'cos θ = 1 / sec θ = 1 / √(1 + tan² θ)',
      },
      sec: {
        formula: 'sec θ = √(1 + tan² θ)',
        stepsNp: 'सर्वसमिका अनुसार: sec θ = √(१ + tan² θ)',
        stepsEn: 'By identity: sec θ = √(1 + tan² θ)',
      },
      cosec: {
        formula: 'cosec θ = √(1 + tan² θ) / tan θ',
        stepsNp: 'cosec θ = १ / sin θ = √(१ + tan² θ) / tan θ',
        stepsEn: 'cosec θ = 1 / sin θ = √(1 + tan² θ) / tan θ',
      },
      cot: {
        formula: 'cot θ = 1 / tan θ',
        stepsNp: 'पारस्परिक सम्बन्ध: cot θ = १ / tan θ',
        stepsEn: 'Reciprocal relation: cot θ = 1 / tan θ',
      },
    },
    sec: {
      sin: {
        formula: 'sin θ = √(sec² θ − 1) / sec θ',
        stepsNp: 'tan θ = √(sec² θ − १)। sin θ = tan θ / sec θ = √(sec² θ − १) / sec θ',
        stepsEn: 'tan θ = √(sec² θ − 1). sin θ = tan θ / sec θ = √(sec² θ − 1) / sec θ',
      },
      cos: {
        formula: 'cos θ = 1 / sec θ',
        stepsNp: 'cos θ = १ / sec θ',
        stepsEn: 'cos θ = 1 / sec θ',
      },
      tan: {
        formula: 'tan θ = √(sec² θ − 1)',
        stepsNp: 'सर्वसमिका अनुसार: tan θ = √(sec² θ − १)',
        stepsEn: 'By identity: tan θ = √(sec² θ − 1)',
      },
      cosec: {
        formula: 'cosec θ = sec θ / √(sec² θ − 1)',
        stepsNp: 'cosec θ = १ / sin θ = sec θ / √(sec² θ − १)',
        stepsEn: 'cosec θ = 1 / sin θ = sec θ / √(sec² θ − 1)',
      },
      cot: {
        formula: 'cot θ = 1 / √(sec² θ − 1)',
        stepsNp: 'cot θ = १ / tan θ = १ / √(sec² θ − १)',
        stepsEn: 'cot θ = 1 / tan θ = 1 / √(sec² θ − 1)',
      },
    },
  };

  // Activity B: Express all in terms of selected
  const [expressAllInTermsOf, setExpressAllInTermsOf] = useState<'sin' | 'cos' | 'tan' | 'sec'>('cos');

  // Activity C: Challenge
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userSelected, setUserSelected] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const QUIZ = [
    {
      qNp: 'tan θ लाई cos θ को पदमा व्यक्त गर्दा कुन सूत्र सही हुन्छ?',
      qEn: 'Express tan θ in terms of cos θ:',
      opts: ['√(1 − cos² θ) / cos θ', 'cos θ / √(1 − cos² θ)', '1 / cos θ', '√(1 + cos² θ)'],
      correct: 0,
      expNp: 'tan θ = sin θ / cos θ = √(1 − cos² θ) / cos θ',
      expEn: 'tan θ = sin θ / cos θ = √(1 − cos² θ) / cos θ',
    },
    {
      qNp: 'sin θ लाई tan θ को पदमा व्यक्त गर्दा कुन मान प्राप्त हुन्छ?',
      qEn: 'Express sin θ in terms of tan θ:',
      opts: ['tan θ / √(1 + tan² θ)', '1 / √(1 + tan² θ)', '√(1 + tan² θ) / tan θ', 'tan θ / (1 + tan² θ)'],
      correct: 0,
      expNp: 'sin θ = tan θ / sec θ = tan θ / √(1 + tan² θ)',
      expEn: 'sin θ = tan θ / sec θ = tan θ / √(1 + tan² θ)',
    },
    {
      qNp: 'sec θ लाई sin θ को पदमा व्यक्त गर्दा के हुन्छ?',
      qEn: 'Express sec θ in terms of sin θ:',
      opts: ['1 / √(1 − sin² θ)', '√(1 − sin² θ)', 'sin θ / √(1 − sin² θ)', '1 / sin θ'],
      correct: 0,
      expNp: 'sec θ = 1 / cos θ = 1 / √(1 − sin² θ)',
      expEn: 'sec θ = 1 / cos θ = 1 / √(1 − sin² θ)',
    },
  ];

  const currentPair = CONVERSIONS[sourceRatio]?.[targetRatio] || {
    formula: 'Identity',
    stepsNp: 'समान अनुपात',
    stepsEn: 'Same ratio',
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! कुनै पनि त्रिकोणमितीय अनुपातलाई अर्को कुनै पनि अनुपातको पदमा रूपान्तरण गर्ने पाठ्यपुस्तक विधिहरू यस प्रयोगशालामा अन्तरक्रियात्मक रूपमा सिक्नुहोस्!',
        'Welcome! Convert any trigonometric ratio into any of the other five ratios using textbook identity derivation pathways!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('network')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'network'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {L('अनुपात जोडी रूपान्तरण (Pairwise Conversion)', 'Pairwise Conversion')}
          </button>
          <button
            onClick={() => setActiveTab('all_in_terms_of')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'all_in_terms_of'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {L('सबै अनुपातलाई एउटैमा व्यक्त (All in Terms of One)', 'All in Terms of One')}
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'challenge'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. {L('रूपान्तरण चुनौती (Quiz Challenge)', 'Conversion Challenge')}
          </button>
        </div>

        {/* TAB 1: PAIRWISE CONVERSION */}
        {activeTab === 'network' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('स्रोत र लक्ष्य अनुपात छनोट गर्नुहोस्:', 'Select Source and Target Ratios:')}
            </h4>

            {/* Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700">{L('सुरुको अनुपात (Starting Ratio):', 'Starting Ratio:')}</span>
                <div className="grid grid-cols-4 gap-1.5 font-mono font-bold text-xs">
                  {(['sin', 'cos', 'tan', 'sec'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setSourceRatio(r)}
                      className={`p-2 rounded-lg border transition-all ${
                        sourceRatio === r ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white text-slate-700'
                      }`}
                    >
                      {r} θ
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700">{L('रूपान्तरण गर्ने लक्ष्य (Target Ratio):', 'Express in terms of:')}</span>
                <div className="grid grid-cols-5 gap-1.5 font-mono font-bold text-xs">
                  {(['sin', 'cos', 'tan', 'cosec', 'sec', 'cot'] as const)
                    .filter(r => r !== sourceRatio)
                    .map(r => (
                      <button
                        key={r}
                        onClick={() => setTargetRatio(r as any)}
                        className={`p-2 rounded-lg border transition-all ${
                          targetRatio === r ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-white text-slate-700'
                        }`}
                      >
                        {r} θ
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Derivation Result Card */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-indigo-950 text-sm">
                  {sourceRatio} θ {L('लाई', 'in terms of')} {targetRatio} θ:
                </span>
                <span className="font-mono text-base font-bold text-indigo-700 bg-white px-3 py-1 rounded border border-indigo-200">
                  {currentPair.formula}
                </span>
              </div>
              <div className="font-mono bg-white p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed text-[11px]">
                <strong>चरणबद्ध प्रक्रिया: </strong>{L(currentPair.stepsNp, currentPair.stepsEn)}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL IN TERMS OF ONE */}
        {activeTab === 'all_in_terms_of' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">
                {L('सबै त्रिकोणमितीय अनुपातहरूलाई एउटै अनुपातमा व्यक्त गर्नुहोस्:', 'Express All Ratios in Terms of:')}
              </h4>
              <div className="flex gap-1.5 font-mono font-bold text-xs">
                {(['sin', 'cos', 'tan', 'sec'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setExpressAllInTermsOf(r)}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      expressAllInTermsOf === r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    {r} θ
                  </button>
                ))}
              </div>
            </div>

            {/* List of all other 5 ratios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {(['sin', 'cos', 'tan', 'cosec', 'sec', 'cot'] as const)
                .filter(r => r !== expressAllInTermsOf)
                .map(r => {
                  const pair = CONVERSIONS[r]?.[expressAllInTermsOf] || { formula: '—' };
                  return (
                    <div key={r} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-800 block text-sm">{r} θ</span>
                      <div className="font-mono text-indigo-700 font-bold text-sm bg-white p-2 rounded border border-slate-100">
                        = {pair.formula.split('=')[1] || pair.formula}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 3: CHALLENGE */}
        {activeTab === 'challenge' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                {L(`प्रश्न ${challengeIdx + 1} / ${QUIZ.length}`, `Question ${challengeIdx + 1} of ${QUIZ.length}`)}
              </span>
              <span className="font-bold text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                ⭐ {L(`अङ्क: ${fmt(score)}`, `Score: ${score}`)}
              </span>
            </div>

            <h3 className="font-bold text-slate-800 text-sm">
              {L(QUIZ[challengeIdx].qNp, QUIZ[challengeIdx].qEn)}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUIZ[challengeIdx].opts.map((opt, i) => {
                let style = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                if (isAnswered) {
                  if (i === QUIZ[challengeIdx].correct) {
                    style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                  } else if (userSelected === i) {
                    style = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                  } else {
                    style = 'opacity-50 border-slate-200 text-slate-400';
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (isAnswered) return;
                      setUserSelected(i);
                      setIsAnswered(true);
                      if (i === QUIZ[challengeIdx].correct) setScore(s => s + 25);
                    }}
                    disabled={isAnswered}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all text-left ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-indigo-900">{L('स्पष्टीकरण:', 'Explanation:')}</div>
                <div className="text-slate-700 font-mono">{L(QUIZ[challengeIdx].expNp, QUIZ[challengeIdx].expEn)}</div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              {isAnswered && (
                <button
                  onClick={() => {
                    setUserSelected(null);
                    setIsAnswered(false);
                    setChallengeIdx(c => (c + 1) % QUIZ.length);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {challengeIdx === QUIZ.length - 1
                    ? L('सुरुबाट फेरि गर्नुहोस्', 'Start Over')
                    : L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default TrigRatioConversionLab;
