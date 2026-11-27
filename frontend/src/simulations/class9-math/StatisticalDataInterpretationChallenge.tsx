import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Question {
  id: number;
  level: 1 | 2 | 3;
  type: 'histogram' | 'table' | 'ogive';
  questionEn: string;
  questionNp: string;
  dataSummary: {
    classes: { label: string; f: number; cf: number }[];
    totalN: number;
  };
  options: { textEn: string; textNp: string; correct: boolean }[];
  explanationEn: string;
  explanationNp: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    level: 1,
    type: 'histogram',
    questionEn: 'In the given histogram representing test scores (10–20: 5, 20–30: 12, 30–40: 18, 40–50: 9), which class interval has the highest frequency (Modal Class)?',
    questionNp: 'दिइएको प्राप्ताङ्कको आयतचित्र (१०–२०: ५, २०–३०: १२, ३०–४०: १८, ४०–५०: ९) मा कुन वर्गान्तरको बारम्बारता सबैभन्दा बढी (रूत वर्ग / Modal Class) छ?',
    dataSummary: {
      classes: [
        { label: '10–20', f: 5, cf: 5 },
        { label: '20–30', f: 12, cf: 17 },
        { label: '30–40', f: 18, cf: 35 },
        { label: '40–50', f: 9, cf: 44 }
      ],
      totalN: 44
    },
    options: [
      { textEn: '20–30', textNp: '२०–३०', correct: false },
      { textEn: '30–40', textNp: '३०–४०', correct: true },
      { textEn: '40–50', textNp: '४०–५०', correct: false },
      { textEn: '10–20', textNp: '१०–२०', correct: false }
    ],
    explanationEn: 'The class interval 30–40 has the highest frequency of 18, making it the modal class.',
    explanationNp: 'वर्गान्तर ३०–४० को बारम्बारता सबैभन्दा बढी १८ भएकाले यो रूत वर्ग (Modal class) हो।'
  },
  {
    id: 2,
    level: 1,
    type: 'table',
    questionEn: 'What is the total number of students (N = ∑f) in the frequency table with frequencies 4, 8, 14, 10, and 4?',
    questionNp: 'बारम्बारताहरू ४, ८, १४, १० र ४ भएको तालिकामा कुल विद्यार्थी सङ्ख्या (N = ∑f) कति हुन्छ?',
    dataSummary: {
      classes: [
        { label: '0–10', f: 4, cf: 4 },
        { label: '10–20', f: 8, cf: 12 },
        { label: '20–30', f: 14, cf: 26 },
        { label: '30–40', f: 10, cf: 36 },
        { label: '40–50', f: 4, cf: 40 }
      ],
      totalN: 40
    },
    options: [
      { textEn: '36', textNp: '३६', correct: false },
      { textEn: '40', textNp: '४०', correct: true },
      { textEn: '44', textNp: '४४', correct: false },
      { textEn: '50', textNp: '५०', correct: false }
    ],
    explanationEn: 'Total frequency N = 4 + 8 + 14 + 10 + 4 = 40 students.',
    explanationNp: 'कुल बारम्बारता N = ४ + ८ + १४ + १० + ४ = ४० विद्यार्थी।'
  },
  {
    id: 3,
    level: 2,
    type: 'histogram',
    questionEn: 'How many students scored 30 or more marks if the distribution is: 10–20: 6, 20–30: 14, 30–40: 16, 40–50: 8?',
    questionNp: 'यदि प्राप्ताङ्क १०–२०: ६, २०–३०: १४, ३०–४०: १६, ४०–५०: ८ भए ३० वा सोभन्दा बढी अङ्क प्राप्त गर्ने विद्यार्थी सङ्ख्या कति छ?',
    dataSummary: {
      classes: [
        { label: '10–20', f: 6, cf: 6 },
        { label: '20–30', f: 14, cf: 20 },
        { label: '30–40', f: 16, cf: 36 },
        { label: '40–50', f: 8, cf: 44 }
      ],
      totalN: 44
    },
    options: [
      { textEn: '16', textNp: '१६', correct: false },
      { textEn: '24', textNp: '२४', correct: true },
      { textEn: '36', textNp: '३६', correct: false },
      { textEn: '20', textNp: '२०', correct: false }
    ],
    explanationEn: 'Students scoring 30 or more are in classes 30–40 and 40–50: 16 + 8 = 24 students.',
    explanationNp: '३० वा सोभन्दा बढी अङ्क ल्याउने विद्यार्थीहरू वर्गान्तर ३०–४० र ४०–५० मा पर्दछन्: १६ + ८ = २४ जना।'
  },
  {
    id: 4,
    level: 2,
    type: 'ogive',
    questionEn: 'In a cumulative frequency curve (less than ogive), what does the value on the Y-axis corresponding to the upper boundary 40 represent?',
    questionNp: 'भन्दा कम तोरण वक्र (Less than ogive) मा माथिल्लो सीमा ४० सँग मिल्ने Y-अक्षको मानले के जनाउँछ?',
    dataSummary: {
      classes: [
        { label: '10–20', f: 7, cf: 7 },
        { label: '20–30', f: 15, cf: 22 },
        { label: '30–40', f: 18, cf: 40 },
        { label: '40–50', f: 10, cf: 50 }
      ],
      totalN: 50
    },
    options: [
      { textEn: 'Number of students who scored exactly 40', textNp: 'ठ्याक्कै ४० अङ्क ल्याउने विद्यार्थी सङ्ख्या', correct: false },
      { textEn: 'Number of students who scored 40 or less', textNp: '४० वा सोभन्दा कम अङ्क ल्याउने विद्यार्थीहरूको सञ्चित सङ्ख्या', correct: true },
      { textEn: 'Number of students who scored more than 40', textNp: '४० भन्दा धेरै अङ्क ल्याउने विद्यार्थी सङ्ख्या', correct: false },
      { textEn: 'The class midpoint', textNp: 'वर्गान्तरको मध्यमान', correct: false }
    ],
    explanationEn: 'In a less-than ogive, each point (X, Y) shows that Y observations have a value less than or equal to the upper limit X.',
    explanationNp: 'भन्दा कम तोरण वक्रमा प्रत्येक बिन्दु (X, Y) ले माथिल्लो सीमा X वा सोभन्दा कम मान भएका सञ्चित अवलोकन सङ्ख्या Y जनाउँछ।'
  },
  {
    id: 5,
    level: 3,
    type: 'ogive',
    questionEn: 'If the total frequency is N = 60, at what cumulative frequency (Y-value) do the less-than and more-than ogives intersect?',
    questionNp: 'यदि कुल बारम्बारता N = ६० भए, भन्दा कम र भन्दा बढी तोरण वक्रहरू कुन सञ्चित बारम्बारता (Y-मान) मा प्रतिच्छेदन हुन्छन्?',
    dataSummary: {
      classes: [
        { label: '0–10', f: 8, cf: 8 },
        { label: '10–20', f: 14, cf: 22 },
        { label: '20–30', f: 20, cf: 42 },
        { label: '30–40', f: 12, cf: 54 },
        { label: '40–50', f: 6, cf: 60 }
      ],
      totalN: 60
    },
    options: [
      { textEn: '60 (at total N)', textNp: '६० (कुल N मा)', correct: false },
      { textEn: '30 (at N/2, the median position)', textNp: '३० (N/२, मध्यिका स्थितिमा)', correct: true },
      { textEn: '20 (at the modal value)', textNp: '२० (रूत मानमा)', correct: false },
      { textEn: '15 (at N/4)', textNp: '१५ (N/४ मा)', correct: false }
    ],
    explanationEn: 'The intersection of both ogives corresponds to the median position N/2 = 60/2 = 30 on the cumulative frequency axis.',
    explanationNp: 'दुवै तोरण वक्रहरू सञ्चित बारम्बारता अक्षमा N/२ = ६०/२ = ३० को उचाइमा प्रतिच्छेदन हुन्छन्, जसले मध्यिका दिन्छ।'
  }
];

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const StatisticalDataInterpretationChallenge: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U17-03',
    chapter: 17,
    titleNp: 'साङ्ख्यिकीय तथ्याङ्क विश्लेषण चुनौती',
    titleEn: 'Statistical Data Interpretation Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  const q = QUESTIONS[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (q.options[idx].correct) {
      setScore(s => s + 10);
      setStreak(st => st + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentIdx(c => (c + 1) % QUESTIONS.length);
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! आयतचित्र, तालिका र तोरण वक्रबाट तथ्याङ्क विश्लेषण गरी आफ्नो साङ्ख्यिकीय क्षमता परीक्षण गर्नुहोस्!',
        'Welcome! Analyze data from histograms, tables, and ogives to test your statistical interpretation skills!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Challenge Visual / Graph Preview */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              {L(`तह ${q.level}: `, `Level ${q.level}: `)}
              {q.level === 1 ? L('आधारभूत', 'Basic') : q.level === 2 ? L('मध्यम', 'Intermediate') : L('उच्च', 'Advanced')}
            </span>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-amber-600">🔥 {L(`शृङ्खला: ${fmt(streak)}`, `Streak: ${streak}`)}</span>
              <span className="text-indigo-800">⭐ {L(`अङ्क: ${fmt(score)}`, `Score: ${score}`)}</span>
            </div>
          </div>

          {/* Graphical Presentation for this Question */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex justify-between">
              <span>{L('तथ्याङ्क चित्र / तालिका:', 'Data Diagram / Table:')}</span>
              <span className="text-[11px] font-mono text-slate-500">N = {fmt(q.dataSummary.totalN)}</span>
            </h4>

            {/* Simple SVG Histogram Preview */}
            <svg viewBox="0 0 340 160" className="w-full bg-white rounded-lg border border-slate-100 p-1">
              <line x1="30" y1="130" x2="320" y2="130" stroke="#475569" strokeWidth="1.5" />
              <line x1="30" y1="20" x2="30" y2="130" stroke="#475569" strokeWidth="1.5" />

              {q.dataSummary.classes.map((c, i) => {
                const barW = 270 / q.dataSummary.classes.length;
                const x = 35 + i * barW;
                const maxF = Math.max(...q.dataSummary.classes.map(cl => cl.f));
                const barH = (c.f / maxF) * 95;
                const y = 130 - barH;

                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width={barW - 2}
                      height={barH}
                      fill="#6366f1"
                      fillOpacity={0.8}
                      stroke="#4338ca"
                      strokeWidth="1"
                    />
                    <text x={x + barW / 2} y={y - 4} textAnchor="middle" className="text-[9px] font-bold fill-indigo-900">
                      {fmt(c.f)}
                    </text>
                    <text
                      x={x + barW / 2}
                      y={145}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-600"
                    >
                      {c.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Accompanying frequency table summary */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-[11px] text-center border border-slate-200 bg-white rounded">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-1 border-r border-slate-200">{L('वर्गान्तर', 'Class')}</th>
                    {q.dataSummary.classes.map((c, i) => (
                      <th key={i} className="p-1 border-r border-slate-200 font-mono">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 font-bold bg-slate-50 border-r border-slate-200">{L('बारम्बारता (f)', 'Freq (f)')}</td>
                    {q.dataSummary.classes.map((c, i) => (
                      <td key={i} className="p-1 border-r border-slate-200 font-bold text-indigo-700 font-mono">
                        {fmt(c.f)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-1 font-bold bg-slate-50 border-r border-slate-200">{L('सञ्चित बा. (c.f.)', 'c.f.')}</td>
                    {q.dataSummary.classes.map((c, i) => (
                      <td key={i} className="p-1 border-r border-slate-200 text-slate-600 font-mono">
                        {fmt(c.cf)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Question and Answers */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-800 text-sm leading-snug">
                {fmt(currentIdx + 1)}. {L(q.questionNp, q.questionEn)}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                let btnStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';

                if (isAnswered) {
                  if (opt.correct) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs';
                  } else if (selectedOption === i) {
                    btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                  } else {
                    btnStyle = 'opacity-50 border-slate-200 text-slate-400';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={isAnswered}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{L(opt.textNp, opt.textEn)}</span>
                    {isAnswered && opt.correct && <span className="text-emerald-600 font-bold">✓</span>}
                    {isAnswered && selectedOption === i && !opt.correct && (
                      <span className="text-rose-600 font-bold">✗</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card */}
            {isAnswered && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  q.options[selectedOption || 0].correct
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}
              >
                <div className="font-bold mb-1">
                  {q.options[selectedOption || 0].correct ? L('✅ सही उत्तर!', '✅ Correct!') : L('❌ गलत उत्तर!', '❌ Incorrect!')}
                </div>
                <div>{L(q.explanationNp, q.explanationEn)}</div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              {L('पुनः सुरु गर्नुहोस्', 'Reset Challenge')}
            </button>
            {isAnswered && (
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                {currentIdx === QUESTIONS.length - 1
                  ? L('सुरुबाट फेरि गर्नुहोस्', 'Loop from Start')
                  : L('अर्को प्रश्न →', 'Next Question →')}
              </button>
            )}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default StatisticalDataInterpretationChallenge;
