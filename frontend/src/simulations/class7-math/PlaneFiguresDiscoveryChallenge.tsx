/**
 * PlaneFiguresDiscoveryChallenge.tsx
 * Grade 7 Mathematics – Lesson 14: PLANE FIGURES (समतलीय आकृतिहरू)
 * Simulation 4: Plane Figures Discovery and Mastery Challenge (समतलीय आकृतिहरूको खोज तथा चुनौती)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 205-230)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Trophy, CheckCircle2, XCircle, RotateCcw, Sparkles, Award } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुनै त्रिभुजका सबै तीनवटा भुजाहरू असमान छन् भने त्यसलाई के भनिन्छ?',
    en: 'If all three sides of a triangle are unequal in length, what is it called?',
    options: [
      { key: 'A', label: 'विषमबाहु त्रिभुज (Scalene Triangle)' },
      { key: 'B', label: 'समबाहु त्रिभुज (Equilateral)' },
      { key: 'C', label: 'समद्विबाहु त्रिभुज (Isosceles)' },
      { key: 'D', label: 'समकोण त्रिभुज' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै चतुर्भुजका चारवटै भित्री कोणहरूको योगफल कति हुन्छ?',
    en: 'What is the sum of all four interior angles of a quadrilateral?',
    options: [
      { key: 'A', label: '३६०°' },
      { key: 'B', label: '१८०°' },
      { key: 'C', label: '२७०°' },
      { key: 'D', label: '५४०°' },
    ],
    answer: 'A',
  },
  {
    np: 'नेपाली क्यारमबोर्ड (Carrom board) र चेस बोर्ड (Chessboard) कुन समतलीय आकृतिका उदाहरण हुन्?',
    en: 'A Nepali carrom board and chessboard are real-life examples of which plane figure?',
    options: [
      { key: 'A', label: 'वर्ग (Square)' },
      { key: 'B', label: 'वृत्त' },
      { key: 'C', label: 'समलम्ब चतुर्भुज' },
      { key: 'D', label: 'त्रिभुज' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि चतुर्भुजका तीन कोणहरू ८०°, १००° र ११०° छन् भने चौथो कोण कति हुन्छ?',
    en: 'If three angles of a quadrilateral are 80°, 100°, and 110°, what is the 4th angle?',
    options: [
      { key: 'A', label: '७०° (३६०° - २९०°)' },
      { key: 'B', label: '८०°' },
      { key: 'C', label: '९०°' },
      { key: 'D', label: '६०°' },
    ],
    answer: 'A',
  },
];

interface ChallengeCard {
  id: number;
  questionNp: string;
  questionEn: string;
  options: { key: string; labelNp: string; labelEn: string }[];
  correctKey: string;
  explanationNp: string;
  explanationEn: string;
  shapeType: 'triangle' | 'quad' | 'real_life';
}

const CHALLENGES: ChallengeCard[] = [
  {
    id: 1,
    questionNp: 'भुजाहरूको नाप ५ सेमी, ५ सेमी र ८ सेमी भएको त्रिभुज कुन प्रकारको हो?',
    questionEn: 'A triangle with side lengths 5 cm, 5 cm and 8 cm is classified as:',
    options: [
      { key: 'A', labelNp: 'समद्विबाहु त्रिभुज (Isosceles)', labelEn: 'Isosceles Triangle' },
      { key: 'B', labelNp: 'समबाहु त्रिभुज (Equilateral)', labelEn: 'Equilateral Triangle' },
      { key: 'C', labelNp: 'विषमबाहु त्रिभुज (Scalene)', labelEn: 'Scalene Triangle' },
    ],
    correctKey: 'A',
    explanationNp: 'दुईवटा भुजाहरू ५ सेमी = ५ सेमी बराबर भएकाले यो समद्विबाहु त्रिभुज हो।',
    explanationEn: 'Since two sides are equal (5 cm = 5 cm), it is an isosceles triangle.',
    shapeType: 'triangle',
  },
  {
    id: 2,
    questionNp: 'कुनै समकोणी त्रिभुजमा आधार ४ सेमी र लम्ब ३ सेमी छन् भने कर्ण कति हुन्छ?',
    questionEn: 'In a right triangle with base 4 cm and perpendicular 3 cm, what is the hypotenuse?',
    options: [
      { key: 'A', labelNp: '५ सेमी (√(३² + ४²))', labelEn: '5 cm (√(3² + 4²))' },
      { key: 'B', labelNp: '७ सेमी', labelEn: '7 cm' },
      { key: 'C', labelNp: '६ सेमी', labelEn: '6 cm' },
    ],
    correctKey: 'A',
    explanationNp: 'पाइथागोरस साध्य अनुसार: h = √(३² + ४²) = √(९ + १६) = √२५ = ५ सेमी।',
    explanationEn: 'By Pythagoras theorem: h = √(9 + 16) = √25 = 5 cm.',
    shapeType: 'triangle',
  },
  {
    id: 3,
    questionNp: 'नेपाली पाठ्यपुस्तक, हुलाक टिकट र फोटो फ्रेम सामान्यतया कुन आकृतिका हुन्छन्?',
    questionEn: 'Nepali textbooks, postage stamps, and photo frames are typical examples of:',
    options: [
      { key: 'A', labelNp: 'आयत (Rectangle)', labelEn: 'Rectangle' },
      { key: 'B', labelNp: 'समबाहु त्रिभुज', labelEn: 'Equilateral Triangle' },
      { key: 'C', labelNp: 'समलम्ब चतुर्भुज', labelEn: 'Trapezium' },
    ],
    correctKey: 'A',
    explanationNp: 'आमने-सामनेका भुजाहरू बराबर र चारै कोणहरू ९०° हुने भएकाले यी आयत हुन्।',
    explanationEn: 'Because opposite sides are equal and all angles are 90°, they are rectangles.',
    shapeType: 'real_life',
  },
  {
    id: 4,
    questionNp: 'यदि समान्तर चतुर्भुजमा एउटा कोण ७०° छ भने यसको सम्मुख कोण (Opposite Angle) कति हुन्छ?',
    questionEn: 'In a parallelogram, if one angle is 70°, what is its opposite angle?',
    options: [
      { key: 'A', labelNp: '७०° (सम्मुख कोण बराबर)', labelEn: '70° (Opposite angles equal)' },
      { key: 'B', labelNp: '११०°', labelEn: '110°' },
      { key: 'C', labelNp: '२०°', labelEn: '20°' },
    ],
    correctKey: 'A',
    explanationNp: 'समान्तर चतुर्भुजका सम्मुख कोणहरू बराबर हुन्छन्, त्यसैले अर्को कोण पनि ७०° नै हुन्छ।',
    explanationEn: 'Opposite angles of a parallelogram are equal, so it is also 70°.',
    shapeType: 'quad',
  },
  {
    id: 5,
    questionNp: 'त्रिभुजका दुई कोणहरू ५०° र ६०° छन्। तेस्रो कोण कति हुन्छ?',
    questionEn: 'Two angles of a triangle are 50° and 60°. What is the third angle?',
    options: [
      { key: 'A', labelNp: '७०° (१८०° - ११०°)', labelEn: '70° (180° - 110°)' },
      { key: 'B', labelNp: '८०°', labelEn: '80°' },
      { key: 'C', labelNp: '९०°', labelEn: '90°' },
    ],
    correctKey: 'A',
    explanationNp: 'त्रिभुजका तीनवटै कोणहरूको जोड १८०° हुन्छ। १८०° - (५०° + ६०°) = ७०°।',
    explanationEn: 'Sum of triangle angles is 180°. 180° - 110° = 70°.',
    shapeType: 'triangle',
  },
  {
    id: 6,
    questionNp: 'कुन चतुर्भुजका विकर्णहरू बराबर हुन्छन् र ९०° मा समद्विभाजन गर्छन्?',
    questionEn: 'Which quadrilateral has equal diagonals that bisect each other at 90°?',
    options: [
      { key: 'A', labelNp: 'वर्ग (Square)', labelEn: 'Square' },
      { key: 'B', labelNp: 'आयत (Rectangle)', labelEn: 'Rectangle' },
      { key: 'C', labelNp: 'समान्तर चतुर्भुज', labelEn: 'Parallelogram' },
    ],
    correctKey: 'A',
    explanationNp: 'वर्गका विकर्णहरू बराबर हुन्छन् र एकअर्कालाई ९०° मा समद्विभाजन गर्छन्।',
    explanationEn: 'Square diagonals are equal and perpendicular bisectors (90°).',
    shapeType: 'quad',
  },
];

export const PlaneFiguresDiscoveryChallenge: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L14-04',
    chapter: 14,
    titleNp: 'समतलीय आकृतिहरूको खोज तथा चुनौती (Plane Figures Challenge)',
    titleEn: 'Plane Figures Discovery Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  const currentQ = CHALLENGES[currentIndex];

  const handleSelectOption = (key: string) => {
    if (isAnswered) return;
    setSelectedAnswer(key);
    setIsAnswered(true);
    if (key === currentQ.correctKey) {
      setScore((prev) => prev + 10);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < CHALLENGES.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'बधाई छ साथीहरू! समतलीय आकृतिहरू (त्रिभुज, चतुर्भुज र पाइथागोरस साध्य) को खोज र बृहत् चुनौतीमा भाग लिऔँ!',
        'Congratulations friends! Participate in the comprehensive plane figures and geometry challenge!'
      )}
    >
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Score & Progress Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-5 text-white shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-300" />
            <div>
              <div className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">
                {L('समतलीय ज्यामिति चुनौती', 'Plane Figures Geometry Challenge')}
              </div>
              <div className="text-xl font-bold" style={{ fontFamily: FONT_NP }}>
                {L(`प्रश्न: ${toNp(currentIndex + 1)} / ${toNp(CHALLENGES.length)}`, `Question: ${currentIndex + 1} of ${CHALLENGES.length}`)}
              </div>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-2xl text-center border border-white/30">
            <div className="text-xs text-indigo-100 font-semibold">{L('कुल अङ्क (Score)', 'Total Score')}</div>
            <div className="text-2xl font-black text-amber-300">{toNp(score)}</div>
          </div>
        </div>

        {/* Challenge Card Body */}
        {!completed ? (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            {/* Question Text */}
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase bg-indigo-100 text-indigo-800">
                {currentQ.shapeType === 'triangle' && L('त्रिभुज (Triangle)', 'Triangle')}
                {currentQ.shapeType === 'quad' && L('चतुर्भुज (Quadrilateral)', 'Quadrilateral')}
                {currentQ.shapeType === 'real_life' && L('व्यावहारिक ज्यामिति (Real-life)', 'Real-Life Geometry')}
              </span>
              <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: FONT_NP }}>
                {isNe ? currentQ.questionNp : currentQ.questionEn}
              </h2>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((opt) => {
                const isSelected = selectedAnswer === opt.key;
                const isCorrect = opt.key === currentQ.correctKey;
                let btnStyle = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 bg-white text-slate-800';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                  } else {
                    btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.key}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between text-sm md:text-base ${btnStyle}`}
                  >
                    <span>{isNe ? opt.labelNp : opt.labelEn}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next */}
            {isAnswered && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase">
                  {L('पाठ्यपुस्तक व्याख्या (CDC Explanation):', 'CDC Explanation:')}
                </div>
                <div className="text-sm text-slate-700">
                  {isNe ? currentQ.explanationNp : currentQ.explanationEn}
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-sm transition-all"
                >
                  {currentIndex + 1 < CHALLENGES.length
                    ? L('अर्को प्रश्न (Next Question)', 'Next Question')
                    : L('नतिजा हेर्नुहोस् (See Results)', 'See Results')}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Completion Screen */
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 text-center space-y-6">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900" style={{ fontFamily: FONT_NP }}>
                {L('बधाई छ! तपाईंले चुनौती पूरा गर्नुभयो!', 'Congratulations! You completed the challenge!')}
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                {L(
                  `तपाईंको कुल प्राप्ताङ्क: ${toNp(score)} / ${toNp(CHALLENGES.length * 10)} अङ्क`,
                  `Your total score: ${score} / ${CHALLENGES.length * 10} points`
                )}
              </p>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs md:text-sm text-indigo-900 font-semibold max-w-md mx-auto">
              {score >= 50
                ? L('उत्कृष्ट प्रदर्शन! समतलीय आकृतिहरू र ज्यामितिमा तपाईं अब्बल बन्नुभयो।', 'Outstanding! You have mastered Grade 7 Plane Figures and Geometry!')
                : L('राम्रो प्रयास! पाठ्यपुस्तकका नियमहरू दोहोर्याएर पुनः अभ्यास गर्नुहोस्।', 'Good try! Review the geometric rules and try again.')}
            </div>

            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 mx-auto shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              {L('पुनः चुनौती खेल्नुहोस् (Play Again)', 'Play Challenge Again')}
            </button>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default PlaneFiguresDiscoveryChallenge;
