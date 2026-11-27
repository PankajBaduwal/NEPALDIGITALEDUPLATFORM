/**
 * IndirectVariationWorkTimeLab.tsx
 * Grade 8 Mathematics – Unit 6: UNITARY METHOD
 * Simulation 2: Indirect Variation and Work-Time Lab
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 6)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Users, Clock, Gauge, Award, CheckCircle, RefreshCw, ArrowRight, Zap } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'अप्रत्यक्ष विचरण (Indirect / Inverse Variation) मा दुई चलराशि x र y को कुन मान स्थिर हुन्छ?',
    en: 'In indirect (inverse) variation, which value remains constant for two variables x and y?',
    options: [
      { key: 'A', label: 'Product: x × y = k (the product is constant)' },
      { key: 'B', label: 'Quotient: y / x = k' },
      { key: 'C', label: 'Sum: x + y = k' },
      { key: 'D', label: 'Difference: x - y = k' },
    ],
    answer: 'A',
  },
  {
    np: '20 जना कामदारलाई एउटा काम गर्न 24 दिन लाग्छ भने 1 जनालाई सो काम गर्न कति दिन लाग्ला?',
    en: 'If 20 workers take 24 days to finish a job, how many days will 1 worker take?',
    options: [
      { key: 'A', label: '480 days [ 1 person needs many days: 20 × 24 = 480 days ]' },
      { key: 'B', label: '1.2 days' },
      { key: 'C', label: '240 days' },
      { key: 'D', label: '44 days' },
    ],
    answer: 'A',
  },
  {
    np: '20 जनालाई 24 दिन लाग्ने काम 15 people in कति दिनमा सम्पन्न गर्लान्?',
    en: 'A work finished by 20 workers in 24 days will be finished by 15 workers in how many days?',
    options: [
      { key: 'A', label: '32 days [ (20 × 24) ÷ 15 = 480 ÷ 15 = 32 ]' },
      { key: 'B', label: '18 days' },
      { key: 'C', label: '28 days' },
      { key: 'D', label: '30 days' },
    ],
    answer: 'A',
  },
  {
    np: '48 किमी/hoursको गतिमा हिँड्दा 6 hours लाग्ने दूरी 36 किमी/hoursको गतिमा हिँड्दा कति hours लाग्ला?',
    en: 'If a journey takes 6 hours at 48 km/h, how many hours will it take at 36 km/h?',
    options: [
      { key: 'A', label: '8 hours [ distance = 48 × 6 = 288 km; 288 ÷ 36 = 8 hours ]' },
      { key: 'B', label: '4.5 hours' },
      { key: 'C', label: '7 hours' },
      { key: 'D', label: '9 hours' },
    ],
    answer: 'A',
  },
  {
    np: '10 people in दैनिक 8 hoursका दरले 14 दिनमा बनाउने टहरो 7 people in 16 दिनमा बनाउन दैनिक कति hours काम गर्नुपर्छ?',
    en: 'If 10 workers working 8 hrs/day build a shelter in 14 days, how many hrs/day must 7 workers work to build it in 16 days?',
    options: [
      { key: 'A', label: '10 hours [ (10 × 14 × 8) ÷ (7 × 16) = 1120 ÷ 112 = 10 ]' },
      { key: 'B', label: '12 hours' },
      { key: 'C', label: '9 hours' },
      { key: 'D', label: '11 hours' },
    ],
    answer: 'A',
  },
];

export const IndirectVariationWorkTimeLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U6-02',
    chapter: 6,
    titleNp: 'अप्रत्यक्ष विचरण र कार्य-समय (Indirect Variation & Work-Time Lab)',
    titleEn: 'Indirect Variation and Work-Time Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'constant_product' | 'work_time' | 'speed_time' | 'compound_hours'>('constant_product');

  // Tab 1: Constant Product (Workers vs Days)
  const totalWorkloadManDays = 200; // e.g., 200 worker-days
  const [workersSlider, setWorkersSlider] = useState<number>(10);
  const daysRequired = totalWorkloadManDays / workersSlider;

  // Tab 2: CDC Work-Time Solver (20 workers, 24 days -> 15 workers)
  const [givenWorkers, setGivenWorkers] = useState<number>(20);
  const [givenDays, setGivenDays] = useState<number>(24);
  const [targetWorkers, setTargetWorkers] = useState<number>(15);
  const singleWorkerDays = givenWorkers * givenDays;
  const targetDays = targetWorkers > 0 ? singleWorkerDays / targetWorkers : 0;

  // Tab 3: Speed vs Time
  const [initSpeed, setInitSpeed] = useState<number>(48);
  const [initHours, setInitHours] = useState<number>(6);
  const [targetSpeed, setTargetSpeed] = useState<number>(36);
  const totalDistance = initSpeed * initHours;
  const targetHours = targetSpeed > 0 ? totalDistance / targetSpeed : 0;

  // Tab 4: Multi-Dimensional Shelter Work (Workers x Days x Hours)
  const [cWorkers1, setCWorkers1] = useState<number>(10);
  const [cDays1, setCDays1] = useState<number>(14);
  const [cHours1, setCHours1] = useState<number>(8);
  const [cWorkers2, setCWorkers2] = useState<number>(7);
  const [cDays2, setCDays2] = useState<number>(16);
  const totalManHours = cWorkers1 * cDays1 * cHours1;
  const reqHoursPerDay = (cWorkers2 * cDays2 > 0) ? totalManHours / (cWorkers2 * cDays2) : 0;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! अप्रत्यक्ष विचरणमा एउटा परिमाण बढ्दा अर्को परिमाण घट्छ (कामदार बढे दिन घट्छ)। आउनुहोस् गुणनफल अचरको नियम सिकौं!',
        'Hello! In indirect variation, as one quantity increases, the other decreases (more workers mean fewer days). Let us explore constant product!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('constant_product')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'constant_product' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            {L('1. गुणनफल अचर k (Constant Product)', '1. Constant Product')}
          </button>
          <button
            onClick={() => setActiveTab('work_time')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'work_time' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            {L('2. कामदार र दिन समस्या (Workers & Days)', '2. Workers & Days')}
          </button>
          <button
            onClick={() => setActiveTab('speed_time')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'speed_time' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            {L('3. गति र समय (Speed & Time)', '3. Speed & Time')}
          </button>
          <button
            onClick={() => setActiveTab('compound_hours')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'compound_hours' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            {L('4. दैनिक कार्यhours (Compound Hours)', '4. Daily Hours')}
          </button>
        </div>

        {/* Tab 1: Constant Product */}
        {activeTab === 'constant_product' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-amber-400">
                    {L('अप्रत्यक्ष विचरणको सिद्धान्त: x · y = k', 'Inverse Variation Rule: x · y = k (Constant)')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {L(
                      'कामदार (x) र दिन (y) को गुणनफल सधैं कुल काम (200 मानिस-दिन) बराबर स्थिर रहन्छ।',
                      'Total workload remains constant at 200 man-days: x · y = 200.'
                    )}
                  </p>
                </div>
                <div className="bg-slate-800 px-4 py-2 rounded-2xl border border-indigo-500/50 text-center">
                  <div className="text-xs text-slate-400 font-bold uppercase">{L('कुल कार्यभार (k)', 'Total Work (k)')}</div>
                  <div className="text-xl font-black text-emerald-400">{toNp(totalWorkloadManDays)} {L('मानिस-दिन', 'man-days')}</div>
                </div>
              </div>

              {/* Slider for interactive worker count */}
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-200">
                    {L('कामदार संख्या (Workers x):', 'Workers (x):')}{' '}
                    <span className="text-indigo-400 text-lg font-black">{toNp(workersSlider)}</span> {L('जना', 'people')}
                  </label>
                  <span className="text-xs text-slate-400">{L('स्लाइडर सार्नुहोस्', 'Move slider')}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="1"
                  value={workersSlider}
                  onChange={(e) => setWorkersSlider(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-xs text-slate-400 font-bold uppercase">{L('कामदार (x)', 'Workers (x)')}</div>
                    <div className="text-2xl font-black text-blue-400 my-1">{toNp(workersSlider)}</div>
                    <div className="text-xs text-slate-500">{L('मानिस संख्या', 'Count')}</div>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-xs text-slate-400 font-bold uppercase">{L('लाग्ने दिन (y = k/x)', 'Days (y = k/x)')}</div>
                    <div className="text-2xl font-black text-amber-400 my-1">{toNp(daysRequired.toFixed(1))}</div>
                    <div className="text-xs text-slate-500">{toNp(totalWorkloadManDays)} ÷ {toNp(workersSlider)}</div>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-xs text-slate-400 font-bold uppercase">{L('गुणनफल (x · y)', 'Product (x · y)')}</div>
                    <div className="text-2xl font-black text-emerald-400 my-1">
                      {toNp((workersSlider * daysRequired).toFixed(0))}
                    </div>
                    <div className="text-xs text-emerald-500/80 font-bold">{L('सधैं स्थिर (Constant)', 'Always Constant')}</div>
                  </div>
                </div>
              </div>

              {/* Table of values */}
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                <div className="text-xs font-bold text-amber-300 mb-2 uppercase">
                  {L('पाठ्यपुस्तक सन्दर्भ तालिका (CDC Value Table)', 'CDC Value Table')}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs">
                  {[5, 10, 20, 25, 40].map((w, idx) => {
                    const d = totalWorkloadManDays / w;
                    const isSelected = w === workersSlider;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition ${
                          isSelected ? 'bg-indigo-950 border-indigo-400 font-bold text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="text-slate-400">{toNp(w)} {L('कामदार', 'workers')}</div>
                        <div className="text-base font-black text-amber-400 my-1">{toNp(d)} {L('दिन', 'days')}</div>
                        <div className="text-[10px] text-slate-500">{toNp(w)} × {toNp(d)} = {toNp(totalWorkloadManDays)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Workers & Days Solver */}
        {activeTab === 'work_time' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('कामदार र दिन एकाइ विधि (CDC पाठ्यपुस्तक उदाहरण 2)', 'Workers and Days Unitary Method (CDC Example 2)')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('20 जनालाई 24 दिन लाग्ने काम 15 people in कति दिनमा सम्पन्न गर्लान्?', 'If 20 workers take 24 days to complete a work, how many days will 15 workers take?')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
                  <span className="text-xs font-bold text-blue-900 uppercase">{L('1. दिइएको अवस्था', '1. Given State')}</span>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">{L('कामदार (Workers 1):', 'Workers 1:')}</label>
                    <input
                      type="number"
                      value={givenWorkers}
                      onChange={(e) => setGivenWorkers(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-xl font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">{L('लाग्ने दिन (Days 1):', 'Days 1:')}</label>
                    <input
                      type="number"
                      value={givenDays}
                      onChange={(e) => setGivenDays(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-xl font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex flex-col justify-center items-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-800 text-lg">
                    1
                  </div>
                  <div className="text-xs font-bold uppercase text-amber-800">{L('1 जनालाई लाग्ने दिन', '1 Worker Takes')}</div>
                  <div className="text-2xl font-black text-amber-900">{toNp(singleWorkerDays)} {L('दिन', 'days')}</div>
                  <div className="text-xs text-slate-600">
                    {toNp(givenWorkers)} × {toNp(givenDays)} = {toNp(singleWorkerDays)} ({L('धेरै दिन लाग्ने हुनाले गुणन', 'Multiply: takes more days')})
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                  <span className="text-xs font-bold text-emerald-900 uppercase">{L('2. नयाँ अवस्था', '2. Target State')}</span>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">{L('नयाँ कामदार संख्या (Workers 2):', 'Target Workers 2:')}</label>
                    <input
                      type="number"
                      value={targetWorkers}
                      onChange={(e) => setTargetWorkers(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-xl font-bold text-slate-800"
                    />
                  </div>
                  <div className="pt-2 border-t border-emerald-200">
                    <div className="text-xs text-slate-500">{L('आवश्यक दिन (Target Days):', 'Target Days:')}</div>
                    <div className="text-2xl font-black text-emerald-700">
                      {toNp(targetDays.toFixed(1))} {L('दिन', 'days')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Mathematical Explanation */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-sm space-y-2 text-slate-700">
                <div className="font-bold text-indigo-900">{L('एकाइ विधिको चरणबद्ध हल:', 'Step-by-step Unitary Solution:')}</div>
                <div>1. {toNp(givenWorkers)} people to do 1 job = {toNp(givenDays)} days.</div>
                <div className="text-amber-800 font-semibold">
                  2. 1 people to do 1 job = {toNp(givenWorkers)} × {toNp(givenDays)} = {toNp(singleWorkerDays)} days (1 person takes many days).
                </div>
                <div className="text-emerald-700 font-bold">
                  3. {toNp(targetWorkers)} people to do that job = {toNp(singleWorkerDays)} ÷ {toNp(targetWorkers)} = {toNp(targetDays.toFixed(1))} days.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Speed & Time */}
        {activeTab === 'speed_time' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('गति र समयको अप्रत्यक्ष सम्बन्ध (Speed & Time Relation)', 'Speed and Time Indirect Variation')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'CDC पाठ्यपुस्तक: 48 किमी/hoursको गतिमा 6 hours लाग्ने दूरी 36 किमी/hoursको गतिमा हिँड्दा कति hours लाग्ला?',
                    'CDC Example: 48 km/h takes 6 hours. How many hours will it take at 36 km/h?'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('सुरुको गति (Speed 1):', 'Initial Speed 1:')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={initSpeed}
                      onChange={(e) => setInitSpeed(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-xl font-bold"
                    />
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">km/h</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('लागेको समय (Time 1):', 'Initial Time 1:')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={initHours}
                      onChange={(e) => setInitHours(Math.max(0.5, Number(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-xl font-bold"
                    />
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{L('hours', 'hours')}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('नयाँ गति (Speed 2):', 'New Speed 2:')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={targetSpeed}
                      onChange={(e) => setTargetSpeed(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-xl font-bold text-indigo-700"
                    />
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">km/h</span>
                  </div>
                </div>
              </div>

              {/* Visual Display */}
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-indigo-950">
                  <span>{L('जम्मा दूरी (Distance = Speed × Time):', 'Total Distance = Speed × Time:')}</span>
                  <span className="text-lg text-indigo-700">{toNp(initSpeed)} × {toNp(initHours)} = {toNp(totalDistance)} km</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-indigo-200 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-500">{L('नयाँ गतिमा लाग्ने समय (Time at New Speed):', 'Time at New Speed:')}</div>
                    <div className="text-xs text-slate-400">{toNp(totalDistance)} km ÷ {toNp(targetSpeed)} km/h</div>
                  </div>
                  <div className="text-2xl font-black text-indigo-700">
                    {toNp(targetHours.toFixed(2))} {L('hours', 'hours')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Compound Shelter Hours */}
        {activeTab === 'compound_hours' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('बाँसको टहरो निर्माण: दैनिक कार्यhours', 'Shelter Construction: Daily Hours (CDC Example 4)')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    '10 people in दैनिक 8 hours काम गरेर 14 दिनमा बनाउने टहरो 7 people in 16 दिनमा बनाउन दैनिक कति hours काम गर्नुपर्छ?',
                    '10 workers working 8 hrs/day build a shelter in 14 days. How many hrs/day must 7 workers work to build it in 16 days?'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-xs uppercase text-slate-600">{L('पहिलेको विवरण (Initial Parameters)', 'Initial Parameters')}</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">{L('कामदार:', 'Workers:')}</label>
                      <input
                        type="number"
                        value={cWorkers1}
                        onChange={(e) => setCWorkers1(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-1.5 border rounded-lg font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">{L('दिन:', 'Days:')}</label>
                      <input
                        type="number"
                        value={cDays1}
                        onChange={(e) => setCDays1(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-1.5 border rounded-lg font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">{L('hours/day:', 'Hrs/day:')}</label>
                      <input
                        type="number"
                        value={cHours1}
                        onChange={(e) => setCHours1(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-1.5 border rounded-lg font-bold text-sm"
                      />
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 pt-2 border-t border-slate-200">
                    {L('कुल आवश्यक श्रम (Total Man-Hours):', 'Total Man-Hours:')}{' '}
                    <span className="font-mono font-bold text-indigo-700">{toNp(totalManHours)} {L('hours', 'hours')}</span>
                  </div>
                </div>

                <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="font-bold text-xs uppercase text-emerald-900">{L('नयाँ अवस्था (Target Condition)', 'Target Condition')}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">{L('नयाँ कामदार:', 'Target Workers:')}</label>
                      <input
                        type="number"
                        value={cWorkers2}
                        onChange={(e) => setCWorkers2(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-1.5 border rounded-lg font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">{L('नयाँ दिन:', 'Target Days:')}</label>
                      <input
                        type="number"
                        value={cDays2}
                        onChange={(e) => setCDays2(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-1.5 border rounded-lg font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-300">
                    <div className="text-[11px] text-slate-500">{L('दैनिक आवश्यक कार्यhours:', 'Required Hours/Day:')}</div>
                    <div className="text-2xl font-black text-emerald-700">
                      {toNp(reqHoursPerDay.toFixed(1))} {L('hours/day', 'hours/day')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mathematical Work */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl font-mono text-xs space-y-1">
                <div className="text-amber-400 font-bold">{L('गणितीय समाधान (CDC Method):', 'Mathematical Solution:')}</div>
                <div>1. Total working hours = {toNp(cWorkers1)} × {toNp(cDays1)} × {toNp(cHours1)} = {toNp(totalManHours)} hours</div>
                <div>2. {toNp(cWorkers2)} people in {toNp(cDays2)} days. Daily hours needed = {toNp(totalManHours)} ÷ ({toNp(cWorkers2)} × {toNp(cDays2)})</div>
                <div className="text-emerald-400 font-bold">
                  3. Daily working hours = {toNp(totalManHours)} ÷ {toNp(cWorkers2 * cDays2)} = {toNp(reqHoursPerDay.toFixed(1))} hours/day
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default IndirectVariationWorkTimeLab;
