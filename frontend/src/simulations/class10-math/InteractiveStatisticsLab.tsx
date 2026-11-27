import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const InteractiveStatisticsLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U13-01',
    chapter: 13,
    titleNp: 'अन्तरक्रियात्मक तथ्याङ्क शास्त्र प्रयोगशाला',
    titleEn: 'Interactive Statistics Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'mean' | 'medianQuartiles' | 'mode' | 'histogram' | 'challenge'>('mean');

  // ── 1. GROUPED FREQUENCY DATASET ──────────────────────────────────────────
  // Class intervals of width h = 10
  const initialFrequencies = [4, 8, 14, 10, 4];
  const [frequencies, setFrequencies] = useState<number[]>(initialFrequencies);

  const classIntervals = [
    { label: '10–20', low: 10, high: 20, mid: 15 },
    { label: '20–30', low: 20, high: 30, mid: 25 },
    { label: '30–40', low: 30, high: 40, mid: 35 },
    { label: '40–50', low: 40, high: 50, mid: 45 },
    { label: '50–60', low: 50, high: 60, mid: 55 },
  ];
  const h = 10;

  // Cumulative Frequencies
  const cfList: number[] = [];
  let runningTotal = 0;
  for (let i = 0; i < frequencies.length; i++) {
    runningTotal += frequencies[i];
    cfList.push(runningTotal);
  }
  const N = runningTotal;

  // ── MEAN CALCULATIONS ─────────────────────────────────────────────────────
  const assumedMeanA = 35; // midpoint of middle class 30-40
  const sumFm = classIntervals.reduce((sum, item, idx) => sum + item.mid * frequencies[idx], 0);
  const meanVal = N > 0 ? sumFm / N : 0;

  // Assumed mean deviation d = m - A
  const sumFd = classIntervals.reduce((sum, item, idx) => sum + (item.mid - assumedMeanA) * frequencies[idx], 0);
  const assumedMeanResult = assumedMeanA + (N > 0 ? sumFd / N : 0);

  // ── MEDIAN & QUARTILE CALCULATIONS ────────────────────────────────────────
  // Q1 position = N / 4
  const q1Pos = N / 4;
  const q1ClassIdx = Math.max(0, cfList.findIndex((cf) => cf >= q1Pos));
  const q1Class = classIntervals[q1ClassIdx];
  const q1L = q1Class.low;
  const q1CfPrev = q1ClassIdx > 0 ? cfList[q1ClassIdx - 1] : 0;
  const q1F = frequencies[q1ClassIdx];
  const q1Val = q1F > 0 ? q1L + ((q1Pos - q1CfPrev) / q1F) * h : q1L;

  // Median position = N / 2
  const medPos = N / 2;
  const medClassIdx = Math.max(0, cfList.findIndex((cf) => cf >= medPos));
  const medClass = classIntervals[medClassIdx];
  const medL = medClass.low;
  const medCfPrev = medClassIdx > 0 ? cfList[medClassIdx - 1] : 0;
  const medF = frequencies[medClassIdx];
  const medianVal = medF > 0 ? medL + ((medPos - medCfPrev) / medF) * h : medL;

  // Q3 position = 3N / 4
  const q3Pos = (3 * N) / 4;
  const q3ClassIdx = Math.max(0, cfList.findIndex((cf) => cf >= q3Pos));
  const q3Class = classIntervals[q3ClassIdx];
  const q3L = q3Class.low;
  const q3CfPrev = q3ClassIdx > 0 ? cfList[q3ClassIdx - 1] : 0;
  const q3F = frequencies[q3ClassIdx];
  const q3Val = q3F > 0 ? q3L + ((q3Pos - q3CfPrev) / q3F) * h : q3L;

  // ── MODE CALCULATION ──────────────────────────────────────────────────────
  let maxFreqIdx = 0;
  frequencies.forEach((f, idx) => {
    if (f > frequencies[maxFreqIdx]) maxFreqIdx = idx;
  });
  const modalClass = classIntervals[maxFreqIdx];
  const modeL = modalClass.low;
  const f1 = frequencies[maxFreqIdx];
  const f0 = maxFreqIdx > 0 ? frequencies[maxFreqIdx - 1] : 0;
  const f2 = maxFreqIdx < frequencies.length - 1 ? frequencies[maxFreqIdx + 1] : 0;
  const modeDenom = 2 * f1 - f0 - f2;
  const modeVal = modeDenom > 0 ? modeL + ((f1 - f0) / modeDenom) * h : modeL;

  const handleFreqChange = (idx: number, delta: number) => {
    kit.tap();
    const updated = [...frequencies];
    updated[idx] = Math.max(1, Math.min(25, updated[idx] + delta));
    setFrequencies(updated);
  };

  // ── 5. PRACTICE CHALLENGE ──────────────────────────────────────────────────
  const [score, setScore] = useState<number>(0);
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const quizQuestions = [
    {
      qEn: 'For a continuous frequency distribution with N = 40, which cumulative frequency (cf) is used to find the Median class position (N/2)?',
      qNp: 'कुल आवृत्ति N = ४० भएको निरन्तर श्रेणीमा मध्यिकाको स्थान (N/२) पत्ता लगाउन कुन सञ्चित आवृत्ति (cf) हेरिन्छ?',
      options: ['cf ≥ 20', 'cf ≥ 10', 'cf ≥ 30', 'cf ≥ 40'],
      optionsNp: ['cf ≥ २०', 'cf ≥ १०', 'cf ≥ ३०', 'cf ≥ ४०'],
      correct: 0, // N/2 = 20
      hintEn: 'Position of Median = N/2 = 40/2 = 20. The median class is the first class interval whose cf is greater than or equal to 20.',
      hintNp: 'मध्यिकाको स्थान = N/२ = ४०/२ = २०। cf को मान २० वा २० भन्दा ठिक ठूलो भएको वर्ग नै मध्यिका वर्ग हुन्छ।',
    },
    {
      qEn: 'In the grouped median formula Md = L + [(N/2 - cf)/f] × h, what does the symbol "cf" represent?',
      qNp: 'मध्यिका सूत्र Md = L + [(N/२ - cf)/f] × h मा "cf" ले के जनाउँछ?',
      options: [
        'Cumulative frequency of the class preceding the median class',
        'Frequency of the median class',
        'Total frequency N',
        'Lower limit of median class',
      ],
      optionsNp: [
        'मध्यिका वर्गभन्दा ठिक अघिल्लो वर्गको सञ्चित आवृत्ति',
        'मध्यिका वर्गको आवृत्ति',
        'कुल आवृत्ति N',
        'मध्यिका वर्गको तल्लो सीमा',
      ],
      correct: 0,
      hintEn: 'In the CDC textbook formula, cf denotes the cumulative frequency of the pre-median class.',
      hintNp: 'पाठ्यपुस्तकको सूत्र अनुसार cf ले मध्यिका वर्गभन्दा ठिक अघिल्लो वर्गको सञ्चित आवृत्ति (Preceding cf) जनाउँछ।',
    },
    {
      qEn: 'What is the relationship between the first quartile Q1, median Q2, and third quartile Q3?',
      qNp: 'पहिलो चतुर्थांश Q1, मध्यिका Q2 (दोस्रो चतुर्थांश), र तेस्रो चतुर्थांश Q3 बीचको सम्बन्ध के हो?',
      options: [
        'Q1 divides lower 25%, Q2 is 50% (Median), Q3 marks 75%',
        'Q1 + Q3 = Q2 always',
        'Q3 is always 3 times Q1',
        'They are always equally spaced from zero',
      ],
      optionsNp: [
        'Q1 ले तल्लो २५%, Q2 ले ५०% (मध्यिका), र Q3 ले ७५% तथ्याङ्क छुट्याउँछ',
        'सधैँ Q1 + Q3 = Q2 हुन्छ',
        'Q3 सधैँ Q1 को ३ गुणा हुन्छ',
        'ती सधैँ शून्यबाट समान दूरीमा हुन्छन्',
      ],
      correct: 0,
      hintEn: 'Quartiles divide an ordered dataset into 4 equal quarters: Q1 at 25%, Q2 (median) at 50%, and Q3 at 75%.',
      hintNp: 'चतुर्थांशहरूले तथ्याङ्कलाई चार बराबर भागमा बाँड्छन्: Q1 ले २५%, Q2 (मध्यिका) ले ५०%, र Q3 ले ७५%।',
    },
    {
      qEn: 'Which measure of central tendency corresponds to the class with the highest frequency?',
      qNp: 'सबैभन्दा बढी आवृत्ति (Maximum Frequency) भएको वर्गसँग कुन केन्द्रीय प्रवृत्तिको नाप सम्बन्धित हुन्छ?',
      options: ['Mode (बहुलक)', 'Mean (मध्यक)', 'Median (मध्यिका)', 'Quartile (चतुर्थांश)'],
      optionsNp: ['बहुलक (Mode)', 'मध्यक (Mean)', 'मध्यिका (Median)', 'चतुर्थांश (Quartile)'],
      correct: 0,
      hintEn: 'The modal class is the class interval containing the highest frequency f1.',
      hintNp: 'अधिकतम आवृत्ति f1 भएको वर्गलाई बहुलक वर्ग (Modal Class) भनिन्छ।',
    },
  ];

  const handleSelectAnswer = (idx: number) => {
    setSelectedAns(idx);
    const q = quizQuestions[quizIdx];
    if (idx === q.correct) {
      kit.good();
      setScore((prev) => prev + 10);
      setQuizFeedback(isNe ? 'सटीक उत्तर! धेरै राम्रो।' : 'Correct! Excellent statistical reasoning.');
    } else {
      kit.oops();
      setQuizFeedback(isNe ? 'गलत उत्तर। संकेत हेरी पुन: प्रयास गर्नुहोस्।' : 'Incorrect. Check the statistical formula.');
    }
  };

  const handleNextQuiz = () => {
    kit.tap();
    setSelectedAns(null);
    setQuizFeedback(null);
    setQuizIdx((prev) => (prev + 1) % quizQuestions.length);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'नमस्ते! कक्षा १० गणितको एकाइ १३: तथ्याङ्क शास्त्र (Statistics) प्रयोगशालामा स्वागत छ! यहाँ निरन्तर श्रेणीको मध्यक, मध्यिका, बहुलक, चतुर्थांशहरू (Q₁, Q₃) तथा आयतचित्र (Histogram) प्रत्यक्ष अन्वेषण गर्नुहोस्!',
        'Welcome to Grade 10 Unit 13: Interactive Statistics Laboratory! Explore continuous frequency distributions, compute Mean, Median, Mode, Quartiles (Q₁, Q₃), and visualize dynamic histograms!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'mean', labelNp: 'क) मध्यक अन्वेषक (Mean: Direct & Assumed)', labelEn: 'A) Mean Explorer' },
            { id: 'medianQuartiles', labelNp: 'ख) मध्यिका र चतुर्थांश (Md, Q₁, Q₃)', labelEn: 'B) Median & Quartiles' },
            { id: 'mode', labelNp: 'ग) बहुलक अन्वेषक (Mode & Modal Class)', labelEn: 'C) Mode Explorer' },
            { id: 'histogram', labelNp: 'घ) आयतचित्र (Histogram Visualization)', labelEn: 'D) Histogram & Compare' },
            { id: 'challenge', labelNp: 'ङ) अभ्यास चुनौती (Quiz)', labelEn: 'E) Practice Challenge' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                kit.tap();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-[#167C80] text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-[#142D4E] border border-slate-200'
              }`}
            >
              {isNe ? tab.labelNp : tab.labelEn}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 1: MEAN EXPLORER (DIRECT & ASSUMED MEAN)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'mean' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Frequency Table with Controls */}
            <div className="md:col-span-7 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-xs font-bold text-[#142D4E]">
                  {L('निरन्तर श्रेणी तालिका (Continuous Frequency Table):', 'Grouped Frequency Table:')}
                </span>
                <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full font-bold">
                  N = {fmt(N)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-[#142D4E] text-white font-sans">
                    <tr>
                      <th className="p-2 text-left">{L('वर्गान्तर', 'Class')}</th>
                      <th className="p-2 text-center">{L('मध्यमान (m)', 'Mid (m)')}</th>
                      <th className="p-2 text-center">{L('आवृत्ति (f)', 'Freq (f)')}</th>
                      <th className="p-2 text-center">{L('f × m', 'f · m')}</th>
                      <th className="p-2 text-center">{L('विचलन d', 'd = m - A')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-slate-50">
                    {classIntervals.map((cls, idx) => (
                      <tr key={idx} className="hover:bg-teal-50/50">
                        <td className="p-2 font-bold text-slate-700">{cls.label}</td>
                        <td className="p-2 text-center text-slate-600">{fmt(cls.mid)}</td>
                        <td className="p-2 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleFreqChange(idx, -1)}
                              className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 font-bold"
                            >
                              -
                            </button>
                            <span className="w-6 font-bold text-[#167C80]">{fmt(frequencies[idx])}</span>
                            <button
                              onClick={() => handleFreqChange(idx, 1)}
                              className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-2 text-center font-bold text-teal-700">
                          {fmt(cls.mid * frequencies[idx])}
                        </td>
                        <td className="p-2 text-center text-slate-500">
                          {fmt(cls.mid - assumedMeanA)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-teal-100/70 font-bold text-teal-900">
                      <td className="p-2">{L('कुल (Total)', 'Total')}</td>
                      <td className="p-2 text-center">-</td>
                      <td className="p-2 text-center">N = {fmt(N)}</td>
                      <td className="p-2 text-center">∑fm = {fmt(sumFm)}</td>
                      <td className="p-2 text-center">∑fd = {fmt(sumFd)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="md:col-span-5 space-y-4">
              {/* Direct Method */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                  {L('१. प्रत्यक्ष विधि (Direct Method)', '1. Direct Method')}
                </span>
                <div className="text-sm font-mono font-bold text-[#142D4E]">
                  X̄ = ∑fm / N = {fmt(sumFm)} / {fmt(N)} ={' '}
                  <strong className="text-teal-700 text-base">{fmt(meanVal.toFixed(2))}</strong>
                </div>
                <p className="text-xs text-slate-600 font-sans">
                  {L('प्रत्येक वर्गान्तरको मध्यमान m निकाली आवृत्ति f ले गुणन गरेर जोडिएको।', 'Multiply each class midpoint m by frequency f and divide by total N.')}
                </p>
              </div>

              {/* Assumed Mean Method */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                  {L('२. कल्पित मध्यक विधि (Assumed Mean Method)', '2. Assumed Mean Method')}
                </span>
                <div className="text-xs text-slate-600 font-sans">
                  {L(`कल्पित मध्यक A = ${fmt(assumedMeanA)} (वर्ग ३०–४० को मध्यमान)`, `Assumed Mean A = ${assumedMeanA}`)}
                </div>
                <div className="text-sm font-mono font-bold text-amber-900">
                  X̄ = A + (∑fd / N) = {fmt(assumedMeanA)} + ({fmt(sumFd)} / {fmt(N)}) ={' '}
                  <strong className="text-amber-800 text-base">{fmt(assumedMeanResult.toFixed(2))}</strong>
                </div>
                <p className="text-xs text-amber-800 font-sans">
                  {L('दुवै विधिबाट मध्यकको मान हुबहु समान आउँछ!', 'Both methods yield the exact same mean!')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: MEDIAN & QUARTILES (Q1, Md, Q3)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'medianQuartiles' && (
          <div className="space-y-4">
            {/* Visual Partition Bar */}
            <div className="bg-[#142D4E] p-4 rounded-2xl text-white shadow-md">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                {L('तथ्याङ्कको चार बराबर भाग विभाजन (Quartile Distribution Partition)', 'Quartile Distribution Partition')}
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-3 bg-teal-800/60 rounded-xl border border-teal-500/40">
                  <div className="text-slate-400 text-xs">पहिलो २५%</div>
                  <div className="text-base font-bold text-teal-300">Q₁ = {fmt(q1Val.toFixed(2))}</div>
                  <div className="text-xs text-slate-300">N/४ = {fmt(q1Pos.toFixed(1))}</div>
                </div>
                <div className="p-3 bg-emerald-800/60 rounded-xl border border-emerald-500/40">
                  <div className="text-slate-400 text-xs">दोस्रो ५०% (मध्यिका)</div>
                  <div className="text-base font-bold text-emerald-300">Md = {fmt(medianVal.toFixed(2))}</div>
                  <div className="text-xs text-slate-300">N/२ = {fmt(medPos.toFixed(1))}</div>
                </div>
                <div className="p-3 bg-amber-800/60 rounded-xl border border-amber-500/40">
                  <div className="text-slate-400 text-xs">तेस्रो ७५%</div>
                  <div className="text-base font-bold text-amber-300">Q₃ = {fmt(q3Val.toFixed(2))}</div>
                  <div className="text-xs text-slate-300">३N/४ = {fmt(q3Pos.toFixed(1))}</div>
                </div>
                <div className="p-3 bg-indigo-800/60 rounded-xl border border-indigo-500/40">
                  <div className="text-slate-400 text-xs">चौथो १००%</div>
                  <div className="text-base font-bold text-indigo-300">Max = ६०</div>
                  <div className="text-xs text-slate-300">N = {fmt(N)}</div>
                </div>
              </div>
            </div>

            {/* Calculations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Q1 Card */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                  {L('पहिलो चतुर्थांश (First Quartile Q₁)', 'First Quartile Q₁')}
                </span>
                <div className="text-xs font-mono text-slate-600">
                  स्थान = N/४ = {fmt(q1Pos.toFixed(1))} ⟹ वर्ग: <strong className="text-teal-800">{q1Class.label}</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border text-xs font-mono space-y-1">
                  <div>L = {fmt(q1L)}, cf = {fmt(q1CfPrev)}, f = {fmt(q1F)}, h = {fmt(h)}</div>
                  <div className="font-bold text-teal-700 text-sm mt-1">
                    Q₁ = {fmt(q1L)} + [({fmt(q1Pos.toFixed(1))} - {fmt(q1CfPrev)}) / {fmt(q1F)}] × {fmt(h)} = {fmt(q1Val.toFixed(2))}
                  </div>
                </div>
              </div>

              {/* Median Card */}
              <div className="p-4 bg-white border border-emerald-300 rounded-2xl shadow-sm space-y-2 bg-emerald-50/20">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                  {L('मध्यिका (Median Md = Q₂)', 'Median Md (Q₂)')}
                </span>
                <div className="text-xs font-mono text-slate-600">
                  स्थान = N/२ = {fmt(medPos.toFixed(1))} ⟹ वर्ग: <strong className="text-emerald-800">{medClass.label}</strong>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-xs font-mono space-y-1">
                  <div>L = {fmt(medL)}, cf = {fmt(medCfPrev)}, f = {fmt(medF)}, h = {fmt(h)}</div>
                  <div className="font-bold text-emerald-800 text-sm mt-1">
                    Md = {fmt(medL)} + [({fmt(medPos.toFixed(1))} - {fmt(medCfPrev)}) / {fmt(medF)}] × {fmt(h)} = {fmt(medianVal.toFixed(2))}
                  </div>
                </div>
              </div>

              {/* Q3 Card */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block">
                  {L('तेस्रो चतुर्थांश (Third Quartile Q₃)', 'Third Quartile Q₃')}
                </span>
                <div className="text-xs font-mono text-slate-600">
                  स्थान = ३N/४ = {fmt(q3Pos.toFixed(1))} ⟹ वर्ग: <strong className="text-amber-800">{q3Class.label}</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border text-xs font-mono space-y-1">
                  <div>L = {fmt(q3L)}, cf = {fmt(q3CfPrev)}, f = {fmt(q3F)}, h = {fmt(h)}</div>
                  <div className="font-bold text-amber-800 text-sm mt-1">
                    Q₃ = {fmt(q3L)} + [({fmt(q3Pos.toFixed(1))} - {fmt(q3CfPrev)}) / {fmt(q3F)}] × {fmt(h)} = {fmt(q3Val.toFixed(2))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: MODE EXPLORER (MODAL CLASS)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'mode' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div>
              <h4 className="font-bold text-sm text-[#142D4E] mb-1">
                {L('बहुलक र बहुलक वर्ग (Mode & Modal Class Explorer)', 'Mode & Modal Class Explorer')}
              </h4>
              <p className="text-xs text-slate-600">
                {L(
                  'निरन्तर श्रेणीमा अधिकतम आवृत्ति (f₁) भएको वर्गलाई बहुलक वर्ग भनिन्छ।',
                  'In a continuous distribution, the class with the highest frequency (f₁) is the modal class.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Formula Elements Card */}
              <div className="p-4 bg-slate-50 border rounded-xl space-y-2 font-mono text-xs">
                <span className="font-bold text-slate-800 font-sans block text-sm mb-2">
                  {L('बहुलक सूत्रका अवयवहरू:', 'Formula Components:')}
                </span>
                <div>बहुलक वर्ग (Modal Class) = <strong className="text-teal-700">{modalClass.label}</strong></div>
                <div>L (तल्लो सीमा / Lower boundary) = {fmt(modeL)}</div>
                <div>f₁ (बहुलक वर्गको आवृत्ति / Modal freq) = <strong className="text-teal-700">{fmt(f1)}</strong></div>
                <div>f₀ (अघिल्लो वर्गको आवृत्ति / Preceding freq) = {fmt(f0)}</div>
                <div>f₂ (पछिल्लो वर्गको आवृत्ति / Succeeding freq) = {fmt(f2)}</div>
                <div>h (वर्गान्तर / Class width) = {fmt(h)}</div>
              </div>

              {/* Mode Calculation */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 font-mono">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block font-sans">
                  {L('पाठ्यपुस्तक बहुलक सूत्र (Textbook Mode Formula):', 'Textbook Mode Formula:')}
                </span>
                <div className="text-sm font-bold text-amber-900">
                  Mode = L + [(f₁ - f₀) / (२f₁ - f₀ - f₂)] × h
                </div>
                <div className="p-3 bg-white rounded border text-xs text-slate-700 space-y-1">
                  <div>= {fmt(modeL)} + [({fmt(f1)} - {fmt(f0)}) / (२({fmt(f1)}) - {fmt(f0)} - {fmt(f2)})] × {fmt(h)}</div>
                  <div>= {fmt(modeL)} + [{fmt(f1 - f0)} / {fmt(modeDenom)}] × {fmt(h)}</div>
                  <div className="text-base font-black text-amber-800 mt-1">
                    = {fmt(modeVal.toFixed(2))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: HISTOGRAM & DATA VISUALIZATION
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'histogram' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-[#142D4E]">
                {L('आयतचित्र र केन्द्रीय प्रवृत्तिको तुलना (Histogram & Comparison)', 'Histogram & Comparison')}
              </h4>
              <div className="flex gap-3 text-xs font-mono font-bold">
                <span className="text-teal-600">मध्यक X̄ = {fmt(meanVal.toFixed(1))}</span>
                <span className="text-emerald-600">मध्यिका Md = {fmt(medianVal.toFixed(1))}</span>
                <span className="text-amber-600">बहुलक Mode = {fmt(modeVal.toFixed(1))}</span>
              </div>
            </div>

            {/* SVG Histogram */}
            <div className="w-full overflow-hidden flex justify-center bg-slate-900/90 rounded-2xl p-4 shadow-inner">
              <svg width={480} height={220} viewBox="0 0 480 220" className="max-w-full">
                {/* Baseline X-axis */}
                <line x1={40} y1={180} x2={440} y2={180} stroke="#94A3B8" strokeWidth={2} />

                {/* Bars */}
                {classIntervals.map((cls, idx) => {
                  const barW = 70;
                  const barX = 60 + idx * barW;
                  const maxH = 140;
                  const barH = (frequencies[idx] / 25) * maxH;
                  const barY = 180 - barH;

                  return (
                    <g key={idx}>
                      <rect
                        x={barX}
                        y={barY}
                        width={barW}
                        height={barH}
                        fill={idx === maxFreqIdx ? '#F59E0B' : '#14B8A6'}
                        fillOpacity={0.8}
                        stroke="#FFFFFF"
                        strokeWidth={1.5}
                      />
                      <text
                        x={barX + barW / 2}
                        y={barY - 6}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        f = {fmt(frequencies[idx])}
                      </text>
                      {/* Class boundary marker on x-axis */}
                      <text
                        x={barX}
                        y={196}
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize="10"
                      >
                        {fmt(cls.low)}
                      </text>
                      {idx === classIntervals.length - 1 && (
                        <text
                          x={barX + barW}
                          y={196}
                          textAnchor="middle"
                          fill="#94A3B8"
                          fontSize="10"
                        >
                          {fmt(cls.high)}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Vertical Indicator Lines for Mean, Median, Mode */}
                {/* Scale: x goes from 10 to 60 over (60 to 410) => width = 350 px for 50 units = 7 px per unit */}
                {(() => {
                  const getPixelX = (val: number) => 60 + (val - 10) * 7;
                  return (
                    <g>
                      {/* Mean line - Teal */}
                      <line
                        x1={getPixelX(meanVal)}
                        y1={20}
                        x2={getPixelX(meanVal)}
                        y2={180}
                        stroke="#2DD4BF"
                        strokeWidth={2}
                        strokeDasharray="3,2"
                      />
                      <text x={getPixelX(meanVal)} y={16} textAnchor="middle" fill="#2DD4BF" fontSize="9" fontWeight="bold">
                        X̄
                      </text>

                      {/* Median line - Emerald */}
                      <line
                        x1={getPixelX(medianVal)}
                        y1={20}
                        x2={getPixelX(medianVal)}
                        y2={180}
                        stroke="#34D399"
                        strokeWidth={2}
                        strokeDasharray="3,2"
                      />
                      <text x={getPixelX(medianVal)} y={28} textAnchor="middle" fill="#34D399" fontSize="9" fontWeight="bold">
                        Md
                      </text>

                      {/* Mode line - Amber */}
                      <line
                        x1={getPixelX(modeVal)}
                        y1={20}
                        x2={getPixelX(modeVal)}
                        y2={180}
                        stroke="#FBBF24"
                        strokeWidth={2.5}
                      />
                      <text x={getPixelX(modeVal)} y={40} textAnchor="middle" fill="#FBBF24" fontSize="9" fontWeight="bold">
                        Mo
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 5: PRACTICE CHALLENGE
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'challenge' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#167C80]">
                {L(`प्रश्न ${fmt(quizIdx + 1)} / ${fmt(quizQuestions.length)}`, `Question ${fmt(quizIdx + 1)} of ${fmt(quizQuestions.length)}`)}
              </span>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {L(`प्राप्ताङ्क: ${fmt(score)}`, `Score: ${fmt(score)}`)}
              </span>
            </div>

            <h3 className="text-base font-bold text-[#142D4E] mb-4">
              {isNe ? quizQuestions[quizIdx].qNp : quizQuestions[quizIdx].qEn}
            </h3>

            <div className="space-y-2.5 mb-5">
              {(isNe && quizQuestions[quizIdx].optionsNp ? quizQuestions[quizIdx].optionsNp : quizQuestions[quizIdx].options).map(
                (opt, oIdx) => {
                  const isSelected = selectedAns === oIdx;
                  const isCorrect = oIdx === quizQuestions[quizIdx].correct;
                  let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

                  if (selectedAns !== null) {
                    if (isSelected && isCorrect) btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                    else if (isSelected && !isCorrect) btnStyle = 'bg-rose-100 border-rose-400 text-rose-900 font-bold';
                    else if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectAnswer(oIdx)}
                      disabled={selectedAns !== null}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                }
              )}
            </div>

            {quizFeedback && (
              <div
                className={`p-3.5 rounded-xl mb-4 text-xs ${
                  selectedAns === quizQuestions[quizIdx].correct
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                <div className="font-bold mb-1">{quizFeedback}</div>
                <div>{isNe ? quizQuestions[quizIdx].hintNp : quizQuestions[quizIdx].hintEn}</div>
              </div>
            )}

            {selectedAns !== null && (
              <div className="flex justify-end">
                <button
                  onClick={handleNextQuiz}
                  className="px-5 py-2.5 bg-[#142D4E] text-white rounded-xl text-xs sm:text-sm font-bold shadow hover:bg-slate-800 transition-all"
                >
                  {L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default InteractiveStatisticsLab;
