/**
 * UnitaryMethodRealLifeSolver.tsx
 * Grade 8 Mathematics – Unit 6: UNITARY METHOD (एकाइ विधि)
 * Simulation 3: Real-Life Unitary Method Solver & Arrow Method (व्यावहारिक एकाइ विधि र तीर विधि)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 6)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { ArrowUp, ArrowDown, HelpCircle, CheckCircle, RefreshCw, Award, Utensils, Briefcase, Zap } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एउटा छाउनीमा १२० जना सैनिकलाई ३० दिन पुग्ने खाना थियो। १० दिनपछि ३० जना नयाँ सैनिक थपिँदा बाँकी खाना कति दिन पुग्ला?',
    en: 'A camp had food for 120 soldiers for 30 days. After 10 days, 30 new soldiers arrived. How many days will the remaining food last?',
    options: [
      { key: 'A', label: '१६ दिन [ १२० × २० ÷ १५० = २४०० ÷ १५० = १६ ]' },
      { key: 'B', label: '२० दिन' },
      { key: 'C', label: '१८ दिन' },
      { key: 'D', label: '१५ दिन' },
    ],
    answer: 'A',
  },
  {
    np: 'तीर विधि (Arrow Method) मा प्रत्यक्ष विचरण (Direct Variation) हुँदा तीरहरू कता फर्किन्छन्?',
    en: 'In the Arrow Method, what direction do arrows point for Direct Variation?',
    options: [
      { key: 'A', label: 'दुवै तीर एउटै दिशामा (Same Direction: ↑ ↑ वा ↓ ↓)' },
      { key: 'B', label: 'विपरीत दिशामा (Opposite Direction: ↑ ↓)' },
      { key: 'C', label: 'तेर्सो दिशामा' },
      { key: 'D', label: 'गोलो घुम्छन्' },
    ],
    answer: 'A',
  },
  {
    np: 'कामदार संख्या र काम सम्पन्न गर्न लाग्ने दिन बीच कुन विचरण हुन्छ?',
    en: 'What variation exists between number of workers and days to complete a job?',
    options: [
      { key: 'A', label: 'अप्रत्यक्ष विचरण (Indirect Variation: कामदार बढे दिन घट्छ)' },
      { key: 'B', label: 'प्रत्यक्ष विचरण (Direct Variation)' },
      { key: 'C', label: 'कुनै विचरण हुँदैन' },
      { key: 'D', label: 'सधैं शून्य विचरण' },
    ],
    answer: 'A',
  },
  {
    np: '४ ओटा छापाखाना मेसिनले ५ दिनमा १२,००० किताब छाप्छन् भने ६ ओटा मेसिनले ८ दिनमा कति किताब छाप्लान्?',
    en: 'If 4 printing presses print 12,000 books in 5 days, how many books will 6 presses print in 8 days?',
    options: [
      { key: 'A', label: '२८,८०० किताब [ १२,००० × (६/४) × (८/५) = २८,८०० ]' },
      { key: 'B', label: '२४,००० किताब' },
      { key: 'C', label: '३०,००० किताब' },
      { key: 'D', label: '२६,५०० किताब' },
    ],
    answer: 'A',
  },
  {
    np: 'वस्तुको संख्या र जम्मा मूल्य बीच कुन विचरण सम्बन्ध हुन्छ?',
    en: 'What variation relationship exists between quantity of items and their total cost?',
    options: [
      { key: 'A', label: 'प्रत्यक्ष विचरण (Direct Variation)' },
      { key: 'B', label: 'अप्रत्यक्ष विचरण (Indirect Variation)' },
      { key: 'C', label: 'समानुपात होइन' },
      { key: 'D', label: 'स्थिर सम्बन्ध' },
    ],
    answer: 'A',
  },
];

const REAL_SCENARIOS = [
  {
    id: 1,
    titleNp: 'सैनिक छाउनी खाद्यान्न मौज्दात (Army Barrack Food Supply)',
    titleEn: 'Army Barrack Food Supply',
    initialPeople: 120,
    initialTotalDays: 30,
    daysElapsed: 10,
    newPeopleAdded: 30, // total becomes 150
  },
  {
    id: 2,
    titleNp: 'छात्रावास राशन समस्या (Hostel Mess Provisions)',
    titleEn: 'Hostel Mess Provisions',
    initialPeople: 80,
    initialTotalDays: 45,
    daysElapsed: 15,
    newPeopleAdded: 20, // total becomes 100
  },
];

export const UnitaryMethodRealLifeSolver: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U6-03',
    chapter: 6,
    titleNp: 'व्यावहारिक एकाइ विधि र तीर विधि (Unitary Method & Arrow Method)',
    titleEn: 'Real-Life Unitary Method Solver',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'classifier' | 'arrow_method' | 'food_provisions' | 'multi_solver'>('classifier');

  // Tab 1: Classifier Quiz
  const [classifierPairs, setClassifierPairs] = useState([
    {
      qNp: 'सामानको संख्या र जम्मा मूल्य (Number of items & Total cost)',
      qEn: 'Number of items & Total cost',
      type: 'direct',
      userChoice: null as 'direct' | 'indirect' | null,
    },
    {
      qNp: 'कामदार संख्या र लाग्ने दिन (Number of workers & Days to finish)',
      qEn: 'Number of workers & Days to finish',
      type: 'indirect',
      userChoice: null as 'direct' | 'indirect' | null,
    },
    {
      qNp: 'सवारी साधनको गति र लाग्ने समय (Vehicle speed & Travel time)',
      qEn: 'Vehicle speed & Travel time',
      type: 'indirect',
      userChoice: null as 'direct' | 'indirect' | null,
    },
    {
      qNp: 'कामदार संख्या र जम्मा ज्याला (Workers count & Total wages paid)',
      qEn: 'Workers count & Total wages paid',
      type: 'direct',
      userChoice: null as 'direct' | 'indirect' | null,
    },
    {
      qNp: 'विद्यार्थी संख्या र खाद्यान्न पुग्ने दिन (Students & Days food lasts)',
      qEn: 'Students & Days food lasts',
      type: 'indirect',
      userChoice: null as 'direct' | 'indirect' | null,
    },
  ]);

  const handleClassify = (idx: number, choice: 'direct' | 'indirect') => {
    const updated = [...classifierPairs];
    updated[idx].userChoice = choice;
    setClassifierPairs(updated);
    if (choice === updated[idx].type) {
      kit.good();
    } else {
      kit.oops();
    }
  };

  // Tab 2: Arrow Method Interactive
  const [var1Name, setVar1Name] = useState('कामदार (Workers)');
  const [var1Val1, setVar1Val1] = useState(12);
  const [var1Val2, setVar1Val2] = useState(18);
  const [var2Name, setVar2Name] = useState('दिन (Days)');
  const [var2Val1, setVar2Val1] = useState(15);
  const [isDirectArrow, setIsDirectArrow] = useState(false); // workers vs days is indirect
  const calculatedX = isDirectArrow
    ? (var2Val1 * var1Val2) / var1Val1
    : (var2Val1 * var1Val1) / var1Val2;

  // Tab 3: Food Provisions Real Life Simulator
  const [foodScenario, setFoodScenario] = useState(REAL_SCENARIOS[0]);
  const [customPeople, setCustomPeople] = useState(120);
  const [customInitialDays, setCustomInitialDays] = useState(30);
  const [customDaysPassed, setCustomDaysPassed] = useState(10);
  const [customPeopleAdded, setCustomPeopleAdded] = useState(30);

  const remInitialDays = Math.max(1, customInitialDays - customDaysPassed);
  const newTotalPeople = customPeople + customPeopleAdded;
  const foodLastsDays = newTotalPeople > 0 ? (customPeople * remInitialDays) / newTotalPeople : 0;

  // Tab 4: Multi-variable solver (e.g. 4 presses, 5 days, 12000 books -> 6 presses, 8 days, x books)
  const [mPress1, setMPress1] = useState(4);
  const [mDays1, setMDays1] = useState(5);
  const [mBooks1, setMBooks1] = useState(12000);
  const [mPress2, setMPress2] = useState(6);
  const [mDays2, setMDays2] = useState(8);

  const ratePerMachineDay = (mPress1 * mDays1 > 0) ? mBooks1 / (mPress1 * mDays1) : 0;
  const mBooks2 = ratePerMachineDay * mPress2 * mDays2;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! प्रत्यक्ष विचरणमा तीरहरू एउटै दिशामा हुन्छन्, अप्रत्यक्ष विचरणमा उल्टो! आउनुहोस् व्यावहारिक समस्याहरू तीर विधिबाट हल गरौं!',
        'Hello! In direct variation, arrows point the same way; in indirect variation, they point opposite! Let us solve real-life challenges!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('classifier')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'classifier' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            {L('१. विचरण पहिचान (Variation Classifier)', '1. Variation Classifier')}
          </button>
          <button
            onClick={() => setActiveTab('arrow_method')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'arrow_method' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            {L('२. तीर विधि प्रयोगशाला (Arrow Method Lab)', '2. Arrow Method Lab')}
          </button>
          <button
            onClick={() => setActiveTab('food_provisions')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'food_provisions' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            {L('३. खाद्यान्न मौज्दात समस्या (Food Provisions)', '3. Food Provisions')}
          </button>
          <button
            onClick={() => setActiveTab('multi_solver')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'multi_solver' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            {L('४. बहु-चलराशि हलकर्ता (Multi-Variable Solver)', '4. Multi-Variable Solver')}
          </button>
        </div>

        {/* Tab 1: Classifier */}
        {activeTab === 'classifier' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {L('विचरण पहिचान गर्नुहोस् (Identify Variation Type)', 'Identify Variation Type')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'प्रत्येक सम्बन्धमा परिमाण बढ्दा अर्को पनि बढ्छ (प्रत्यक्ष) वा घट्छ (अप्रत्यक्ष)? छनोट गर्नुहोस्:',
                    'Does one quantity increase when the other increases (Direct), or does it decrease (Indirect)? Select below:'
                  )}
                </p>
              </div>

              <div className="space-y-3">
                {classifierPairs.map((item, idx) => {
                  const answered = item.userChoice !== null;
                  const isCorrect = item.userChoice === item.type;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        answered
                          ? isCorrect
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-rose-50/70 border-rose-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="text-sm font-semibold text-slate-800">
                        {isNe ? item.qNp : item.qEn}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleClassify(idx, 'direct')}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition ${
                            item.userChoice === 'direct'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {L('प्रत्यक्ष विचरण (Direct)', 'Direct Variation')}
                        </button>
                        <button
                          onClick={() => handleClassify(idx, 'indirect')}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition ${
                            item.userChoice === 'indirect'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {L('अप्रत्यक्ष विचरण (Indirect)', 'Indirect Variation')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Arrow Method Lab */}
        {activeTab === 'arrow_method' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-amber-400">
                    {L('तीर विधि (Arrow Method Visualization)', 'Arrow Method Visualization')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {L(
                      'प्रत्यक्ष विचरणमा दुवै तीर एउटै दिशामा (↑ ↑); अप्रत्यक्ष विचरणमा विपरीत दिशामा (↑ ↓)।',
                      'In direct variation, arrows point same direction (↑ ↑); in inverse, opposite (↑ ↓).'
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
                  <button
                    onClick={() => setIsDirectArrow(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isDirectArrow ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {L('प्रत्यक्ष (Direct: ↑ ↑)', 'Direct (↑ ↑)')}
                  </button>
                  <button
                    onClick={() => setIsDirectArrow(false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      !isDirectArrow ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {L('अप्रत्यक्ष (Indirect: ↑ ↓)', 'Indirect (↑ ↓)')}
                  </button>
                </div>
              </div>

              {/* Arrow Visualization Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Column 1: Variable 1 */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4 text-center">
                  <div className="text-sm font-bold text-indigo-400">{L('चलराशि १ (Variable 1)', 'Variable 1')}</div>
                  <div className="flex justify-around items-center py-2">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">{L('सुरुको मान (Initial)', 'Initial')}</div>
                      <div className="text-2xl font-black text-white">{toNp(var1Val1)}</div>
                    </div>
                    {/* Arrow pointing down */}
                    <div className="flex flex-col items-center text-amber-400">
                      <ArrowDown className="w-8 h-8 animate-bounce" />
                      <span className="text-[10px] font-bold uppercase">{L('तीर तलतिर', 'Arrow Down')}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">{L('पछिको मान (Final)', 'Final')}</div>
                      <div className="text-2xl font-black text-white">{toNp(var1Val2)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {L('अनुपात:', 'Ratio:')} {toNp(var1Val2)} / {toNp(var1Val1)}
                  </div>
                </div>

                {/* Column 2: Variable 2 with Unknown X */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4 text-center">
                  <div className="text-sm font-bold text-emerald-400">{L('चलराशि २ (Variable 2 / Unknown x)', 'Variable 2 (x)')}</div>
                  <div className="flex justify-around items-center py-2">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">{L('सुरुको मान', 'Initial')}</div>
                      <div className="text-2xl font-black text-white">{toNp(var2Val1)}</div>
                    </div>
                    {/* Arrow matching or reversing */}
                    <div className="flex flex-col items-center text-emerald-400">
                      {isDirectArrow ? (
                        <>
                          <ArrowDown className="w-8 h-8 animate-bounce" />
                          <span className="text-[10px] font-bold uppercase">{L('समान दिशा (तल)', 'Same Down')}</span>
                        </>
                      ) : (
                        <>
                          <ArrowUp className="w-8 h-8 animate-bounce" />
                          <span className="text-[10px] font-bold uppercase">{L('विपरीत दिशा (माथि)', 'Opposite Up')}</span>
                        </>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">{L('अज्ञात मान (x)', 'Unknown (x)')}</div>
                      <div className="text-2xl font-black text-emerald-400">x = {toNp(calculatedX.toFixed(1))}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {isDirectArrow
                      ? `x / ${toNp(var2Val1)} = ${toNp(var1Val2)} / ${toNp(var1Val1)}`
                      : `x / ${toNp(var2Val1)} = ${toNp(var1Val1)} / ${toNp(var1Val2)}`}
                  </div>
                </div>
              </div>

              {/* Formula & Rule explanation */}
              <div className="bg-slate-800 p-4 rounded-2xl text-xs space-y-1 font-mono text-slate-300">
                <div className="text-amber-400 font-bold">{L('तीर विधिको सूत्र नियम (Arrow Equation Rule):', 'Arrow Equation Rule:')}</div>
                {isDirectArrow ? (
                  <div>x = {toNp(var2Val1)} × ({toNp(var1Val2)} ÷ {toNp(var1Val1)}) = <b className="text-emerald-400">{toNp(calculatedX.toFixed(1))}</b></div>
                ) : (
                  <div>x = {toNp(var2Val1)} × ({toNp(var1Val1)} ÷ {toNp(var1Val2)}) = <b className="text-emerald-400">{toNp(calculatedX.toFixed(1))}</b></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Food Provisions */}
        {activeTab === 'food_provisions' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('सैनिक छाउनी / छात्रावास खाद्यान्न मौज्दात समस्या (Food Provision Problem)', 'Food Provision Problem (Army Camp / Hostel)')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'CDC पाठ्यपुस्तक: १२० सैनिकलाई ३० दिन पुग्ने खाना थियो। १० दिनपछि ३० जना नयाँ सैनिक थपिँदा बाँकी खाना कति दिन पुग्ला?',
                    'CDC Example: 120 soldiers have food for 30 days. After 10 days, 30 new soldiers join. How many days does the remaining food last?'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('सुरुका सैनिक/व्यक्ति:', 'Initial Soldiers:')}</label>
                  <input
                    type="number"
                    value={customPeople}
                    onChange={(e) => setCustomPeople(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('जम्मा दिन (Total Days):', 'Initial Days:')}</label>
                  <input
                    type="number"
                    value={customInitialDays}
                    onChange={(e) => setCustomInitialDays(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-amber-600 block mb-1">{L('बितेको दिन (Days Elapsed):', 'Days Passed:')}</label>
                  <input
                    type="number"
                    value={customDaysPassed}
                    onChange={(e) => setCustomDaysPassed(Math.min(customInitialDays - 1, Math.max(0, Number(e.target.value))))}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-amber-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-indigo-600 block mb-1">{L('थपिएका सैनिक/व्यक्ति:', 'New Soldiers Added:')}</label>
                  <input
                    type="number"
                    value={customPeopleAdded}
                    onChange={(e) => setCustomPeopleAdded(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-indigo-700"
                  />
                </div>
              </div>

              {/* Visual Breakdown Box */}
              <div className="bg-indigo-50/60 p-6 rounded-2xl border border-indigo-100 space-y-4">
                <div className="text-sm font-bold text-indigo-950 uppercase">{L('चरणबद्ध समाधान (Step-by-Step Logic):', 'Step-by-Step Logic:')}</div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-indigo-200">
                    <div className="text-xs text-slate-500">{L('१. बाँकी दिन (Remaining Days):', 'Remaining Days:')}</div>
                    <div className="text-xl font-black text-slate-800">
                      {toNp(customInitialDays)} - {toNp(customDaysPassed)} = {toNp(remInitialDays)} {L('दिन', 'days')}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{L('१२० सैनिकका लागि बाँकी दिन', 'For original soldiers')}</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-indigo-200">
                    <div className="text-xs text-slate-500">{L('२. नयाँ जम्मा संख्या (Total Soldiers):', 'Total Soldiers:')}</div>
                    <div className="text-xl font-black text-slate-800">
                      {toNp(customPeople)} + {toNp(customPeopleAdded)} = {toNp(newTotalPeople)} {L('जना', 'people')}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{L('थपिएपछिको कुल संख्या', 'Total headcount')}</div>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-300">
                    <div className="text-xs text-emerald-800 font-bold">{L('३. खाना पुग्ने दिन (Food Lasts):', 'Food Lasts:')}</div>
                    <div className="text-2xl font-black text-emerald-700">
                      {toNp(foodLastsDays.toFixed(1))} {L('दिन', 'days')}
                    </div>
                    <div className="text-[10px] text-emerald-600 mt-1">
                      {toNp(customPeople)} × {toNp(remInitialDays)} ÷ {toNp(newTotalPeople)}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-slate-700">
                  <b>{L('सूत्र निष्कर्ष:', 'Conclusion:')}</b> {toNp(customPeople)} जनालाई {toNp(remInitialDays)} दिन पुग्ने खाना {toNp(newTotalPeople)} जनालाई <b>{toNp(foodLastsDays.toFixed(1))} दिन</b> मात्र पुग्छ किनभने सैनिक संख्या र खाना पुग्ने दिनबीच अप्रत्यक्ष विचरण हुन्छ।
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Multi-Variable Solver */}
        {activeTab === 'multi_solver' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('बहु-चलराशि एकाइ विधि हलकर्ता (Compound Multi-Variable Solver)', 'Compound Multi-Variable Solver')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'CDC पाठ्यपुस्तक: ४ ओटा मेसिनले ५ दिनमा १२,००० किताब छाप्छन् भने ६ ओटा मेसिनले ८ दिनमा कति किताब छाप्लान्?',
                    'CDC Example: 4 machines print 12,000 books in 5 days. How many will 6 machines print in 8 days?'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold uppercase text-slate-600">{L('पहिलेको अवस्था (Initial Condition)', 'Initial Condition')}</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">{L('मेसिन संख्या:', 'Machines:')}</label>
                      <input
                        type="number"
                        value={mPress1}
                        onChange={(e) => setMPress1(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-1.5 border rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">{L('दिन:', 'Days:')}</label>
                      <input
                        type="number"
                        value={mDays1}
                        onChange={(e) => setMDays1(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-1.5 border rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">{L('किताब:', 'Books:')}</label>
                      <input
                        type="number"
                        value={mBooks1}
                        onChange={(e) => setMBooks1(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-1.5 border rounded-lg font-bold"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                    {L('१ मेसिनले १ दिनमा छाप्ने दर:', 'Rate per machine-day:')}{' '}
                    <b className="text-indigo-700">{toNp(ratePerMachineDay.toFixed(0))} {L('किताब', 'books')}</b>
                  </div>
                </div>

                <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="text-xs font-bold uppercase text-emerald-900">{L('सोधिएको अवस्था (Target Condition)', 'Target Condition')}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">{L('नयाँ मेसिन संख्या:', 'New Machines:')}</label>
                      <input
                        type="number"
                        value={mPress2}
                        onChange={(e) => setMPress2(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-1.5 border rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">{L('नयाँ दिन:', 'New Days:')}</label>
                      <input
                        type="number"
                        value={mDays2}
                        onChange={(e) => setMDays2(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-1.5 border rounded-lg font-bold"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-300">
                    <div className="text-xs text-slate-500">{L('जम्मा छाप्ने किताब (Target Output):', 'Total Books Printed:')}</div>
                    <div className="text-2xl font-black text-emerald-700">
                      {toNp(mBooks2.toLocaleString())} {L('किताब', 'books')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default UnitaryMethodRealLifeSolver;
