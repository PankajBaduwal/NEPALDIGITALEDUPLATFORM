import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Award, Briefcase, GraduationCap, HeartPulse, PieChart, CheckCircle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एक परिवारको मासिक कुल खर्च Rs 40,000 मध्ये खानामा Rs 20,000 खर्च हुन्छ भने वृत्तचित्रमा खानाको कोण कति degrees हुन्छ?',
    en: 'Out of a family monthly budget of Rs 40,000, Rs 20,000 is spent on food. What is the central angle for food in a pie chart?',
    options: [
      { key: 'A', label: '180° — (20,000 ÷ 40,000) × 360° = 180°' },
      { key: 'B', label: '90°' },
      { key: 'C', label: '120°' },
      { key: 'D', label: '360°' },
    ],
    answer: 'A',
  },
  {
    np: '5 जना Childrenको तौल क्रमशः 12, 14, 12, 16, 18 kg भए बहुलक (Mode) कति हुन्छ?',
    en: 'If weights of 5 children are 12, 14, 12, 16, 18 kg, what is the mode?',
    options: [
      { key: 'A', label: '12 kg (the most frequent)' },
      { key: 'B', label: '14 kg' },
      { key: 'C', label: '16 kg' },
      { key: 'D', label: '18 kg' },
    ],
    answer: 'A',
  },
  {
    np: '6 जना Studentले गणितमा प्राप्त गरेको प्राप्ताङ्क 20, 25, 30, 35, 40, 50 भए औसत प्राप्ताङ्क कति हुन्छ?',
    en: 'If marks obtained by 6 students in math are 20, 25, 30, 35, 40, 50, what is the mean score?',
    options: [
      { key: 'A', label: '33.33 — (200 ÷ 6 = 33.33)' },
      { key: 'B', label: '30' },
      { key: 'C', label: '35' },
      { key: 'D', label: '40' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै पनि तथ्याङ्कमा औसत (Mean) भन्दा मध्यिका (Median) कुन अवस्थामा बढी उपयुक्त मानिन्छ?',
    en: 'In what situation is the median generally preferred over the mean?',
    options: [
      { key: 'A', label: 'When there are extremely large or small values (extreme outliers)' },
      { key: 'B', label: 'When all values are equal' },
      { key: 'C', label: 'When the data set is very small' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'A',
  },
];

interface Scenario {
  id: string;
  titleNp: string;
  titleEn: string;
  icon: string;
  descNp: string;
  descEn: string;
  tableHeaders: [string, string];
  tableData: { label: string; val: number }[];
  questionNp: string;
  questionEn: string;
  correctAnswer: number;
  unit: string;
  explanationNp: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'budget',
    titleNp: 'Family monthly budget',
    titleEn: 'Family Monthly Budget',
    icon: '🏠',
    descNp: 'A family’s monthly expense headings and amounts (in thousands)',
    descEn: 'Family monthly expenditure in thousands of Rupees',
    tableHeaders: ['Expense heading', 'Amount (Rs. thousand)'],
    tableData: [
      { label: 'Food', val: 24 },
      { label: 'Education', val: 12 },
      { label: 'Health', val: 6 },
      { label: 'Rent', val: 18 },
    ],
    questionNp: 'If this family’s total expense is Rs 60 thousand, what is the central angle of "Food" in the pie chart, in degrees?',
    questionEn: 'If total budget is 60 thousand, what is the central angle for "Food" in degrees?',
    correctAnswer: 144, // (24/60)*360 = 144
    unit: 'degrees (°)',
    explanationNp: 'केन्द्रीय कोण = (24 ÷ 60) × 360° = 144° हुन्छ।',
  },
  {
    id: 'health',
    titleNp: 'Child weights at a health post',
    titleEn: 'Health Post Child Weights',
    icon: '🩺',
    descNp: 'Weight of children who came for vaccination at the health post (in kg)',
    descEn: 'Weights of children visiting health post (kg)',
    tableHeaders: ['Children', 'Weight (kg)'],
    tableData: [
      { label: 'Ram', val: 10 },
      { label: 'Sita', val: 14 },
      { label: 'Hari', val: 12 },
      { label: 'Gita', val: 16 },
      { label: 'Gopal', val: 18 },
    ],
    questionNp: 'What is the median weight of these 5 children, in kg?',
    questionEn: 'What is the median weight of these 5 children in kg?',
    correctAnswer: 14, // sorted: 10, 12, 14, 16, 18 -> middle is 14
    unit: 'kg',
    explanationNp: 'बढ्दो क्रममा मिलाउँदा (10, 12, 14, 16, 18) भएकाले बीचको 3 औं मान 14 kg हो।',
  },
  {
    id: 'school',
    titleNp: 'Class test marks',
    titleEn: 'Class Exam Marks',
    icon: '📚',
    descNp: 'Marks obtained by 6 students in the maths test',
    descEn: 'Marks of 6 students in mathematics exam',
    tableHeaders: ['Student', 'Marks obtained (full marks 50)'],
    tableData: [
      { label: 'Rohan', val: 35 },
      { label: 'Anjana', val: 40 },
      { label: 'Bishal', val: 45 },
      { label: 'Puja', val: 30 },
      { label: 'Sanjay', val: 50 },
    ],
    questionNp: 'What is the mean mark of these students?',
    questionEn: 'What is the arithmetic mean of these marks?',
    correctAnswer: 40, // (35+40+45+30+50) = 200 / 5 = 40
    unit: 'marks',
    explanationNp: 'औसत = (35 + 40 + 45 + 30 + 50) ÷ 5 = 200 ÷ 5 = 40 अङ्क।',
  },
];

export const RealLifeStatisticsChallengeWorld: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U21-03',
    chapter: 21,
    titleNp: 'व्यावहारिक तथ्याङ्क चुनौती संसार',
    titleEn: 'Real-Life Statistics Challenge World',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solvedCount, setSolvedCount] = useState<number>(0);

  const curScenario = SCENARIOS[scenarioIdx];

  const handleCheck = () => {
    const val = parseFloat(userAnswer);
    if (Math.abs(val - curScenario.correctAnswer) < 0.5) {
      kit.good();
      setSolvedCount((c) => c + 1);
      setFeedback(L(`🎉 एकदम सही! ${curScenario.explanationNp}`, `🎉 Correct! ${curScenario.explanationNp}`));
    } else {
      kit.oops();
      setFeedback(
        L(
          `❌ मिलेन। सही उत्तर: ${curScenario.correctAnswer} ${curScenario.unit} हो। ${curScenario.explanationNp}`,
          `❌ Incorrect. The answer is ${curScenario.correctAnswer} ${curScenario.unit}.`
        )
      );
    }
  };

  const handleNextScenario = () => {
    setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length);
    setUserAnswer('');
    setFeedback(null);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! दैनिक जीवनका बजेट, स्वास्थ्य चौकीका तौल र विद्यालय परीक्षा तथ्याङ्कको समाधान गरौं!',
        'Hello! Solve real-world statistical challenges involving family budgets, health data, and school exams!'
      )}
    >
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Scenario Selection Header */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          {SCENARIOS.map((sc, i) => (
            <button
              key={sc.id}
              onClick={() => {
                setScenarioIdx(i);
                setUserAnswer('');
                setFeedback(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                scenarioIdx === i ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {sc.icon} {sc.titleNp}
            </button>
          ))}
        </div>

        {/* Main Challenge Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Table side */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{curScenario.icon}</span>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">{curScenario.titleNp}</h3>
                <span className="text-xs text-slate-500">{curScenario.descNp}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-amber-50 text-amber-950 font-bold border-b border-amber-200">
                  <tr>
                    <th className="p-2.5">{curScenario.tableHeaders[0]}</th>
                    <th className="p-2.5 text-right">{curScenario.tableHeaders[1]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {curScenario.tableData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium text-slate-700">{row.label}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">{row.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Challenge Input side */}
          <div className="md:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block mb-1">
                Challenge question
              </span>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                {curScenario.questionNp}
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Write your answer..."
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  setFeedback(null);
                }}
                className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-sm bg-white"
              />
              <span className="self-center font-bold text-slate-700 text-xs">{curScenario.unit}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCheck}
                disabled={!userAnswer}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow transition-all"
              >
                {L('जाँच गर्नुहोस् (Check Answer)', 'Check Answer')}
              </button>
              <button
                onClick={handleNextScenario}
                className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs"
              >
                {L('अर्को परिदृश्य (Next)', 'Next')}
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  feedback.includes('🎉')
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                {feedback}
              </div>
            )}

            <div className="text-center text-[11px] font-semibold text-slate-500 pt-1">
              Scenarios solved: <span className="text-amber-600 font-bold">{solvedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default RealLifeStatisticsChallengeWorld;
