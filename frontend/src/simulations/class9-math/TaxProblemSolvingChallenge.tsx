import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Award, CheckCircle2, RotateCcw, ArrowRight, HelpCircle, Briefcase } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुनै घडीको अङ्कित मूल्य रु २,५०० छ। १०% छुट दिएर १३% भ्याट लगाउँदा घडीको मूल्य कति हुन्छ?',
    en: 'A watch marked at Rs 2,500 is sold with 10% discount and 13% VAT. What is its selling price?',
    options: [
      { key: 'A', label: 'रु २,५४२.५० — (२२५० + २९२.५०)' },
      { key: 'B', label: 'रु २,५००' },
      { key: 'C', label: 'रु २,४००' },
      { key: 'D', label: 'रु २,६५०' },
    ],
    answer: 'A',
  },
  {
    np: 'एक व्यक्तिले वार्षिक रु ६,००,००० कमाउँछन्। पहिलो ५ लाखमा १% र त्यसपछिको १ लाखमा १०% कर लाग्दा कुल आयकर कति हुन्छ?',
    en: 'A person earns Rs 6,00,000 annually. With 1% on first 5 lakh and 10% on the next 1 lakh, what is total tax?',
    options: [
      { key: 'A', label: 'रु १५,००० — (५,००० + १०,००० = १५,०००)' },
      { key: 'B', label: 'रु १०,०००' },
      { key: 'C', label: 'रु ६,०००' },
      { key: 'D', label: 'रु २०,०००' },
    ],
    answer: 'A',
  },
  {
    np: 'एक खुद्रा बिक्रेताले रु ८,००० मा किनेको सामान रु १०,००० मा बेच्दा १३% का दरले सरकारलाई दाखिला गर्ने खुद भ्याट कति हुन्छ?',
    en: 'A retailer buys goods for Rs 8,000 and sells for Rs 10,000. At 13% VAT, what is the net VAT deposited to the government?',
    options: [
      { key: 'A', label: 'रु २६० — (१३०० − १०४० = २६०)' },
      { key: 'B', label: 'रु १,३००' },
      { key: 'C', label: 'रु १,०४०' },
      { key: 'D', label: 'रु ५००' },
    ],
    answer: 'A',
  },
  {
    np: 'भ्याटसहित रु ११,३०० मा बेचिएको साइकलको भ्याट रकम कति हो (भ्याट दर १३%)?',
    en: 'What is the VAT amount of a bicycle sold for Rs 11,300 including 13% VAT?',
    options: [
      { key: 'A', label: 'रु १,३०० — (११३०० − १०००० = १३००)' },
      { key: 'B', label: 'रु १,०००' },
      { key: 'C', label: 'रु १,४६९' },
      { key: 'D', label: 'रु १,५००' },
    ],
    answer: 'A',
  },
];

interface ChallengeItem {
  id: string;
  level: 'easy' | 'medium' | 'hard';
  levelLabelNp: string;
  titleNp: string;
  questionNp: string;
  questionEn: string;
  correctAnswer: number;
  unit: string;
  hintNp: string;
  solutionNp: string;
}

const CHALLENGES: ChallengeItem[] = [
  {
    id: 'ch1',
    level: 'easy',
    levelLabelNp: 'तह १: सामान्य (Easy)',
    titleNp: 'ल्यापटप खरिदमा भ्याट गणना',
    questionNp: 'अङ्कित मूल्य रु ५०,००० भएको ल्यापटपमा १०% छुट दिएपछि १३% भ्याट जोड्दा ग्राहकले कति रकम तिर्नुपर्छ?',
    questionEn: 'A laptop with MP Rs 50,000 has 10% discount and 13% VAT. What is the final amount payable?',
    correctAnswer: 50850,
    unit: 'रु.',
    hintNp: 'पहिले १०% छुट घटाउनुहोस् (रु ४५,०००), अनि त्यसमा १३% भ्याट जोड्नुहोस्।',
    solutionNp: 'छुट = ५०,००० × १०% = रु ५,०००। SP = रु ४५,०००। भ्याट = ४५,००० × १३% = रु ५,८५०। अन्तिम मूल्य = ४५,००० + ५,८५० = रु ५०,८५०।',
  },
  {
    id: 'ch2',
    level: 'medium',
    levelLabelNp: 'तह २: मध्यम (Medium)',
    titleNp: 'वार्षिक तलबमा आयकर गणना',
    questionNp: 'एक अविवाहित अधिकृतको मासिक तलब रु ५०,००० छ (दशैं खर्चसहित १३ महिना)। पहिलो ५ लाखमा १% र त्यसपछिको रकममा १०% कर लाग्छ भने वार्षिक आयकर कति हुन्छ?',
    questionEn: 'An officer earns Rs 50,000/mo (13 months). First 5 lakh @ 1%, next @ 10%. Find annual income tax.',
    correctAnswer: 20000,
    unit: 'रु.',
    hintNp: 'वार्षिक आम्दानी = ५०,००० × १३ = रु ६,५०,०००। पहिलो ५ लाखमा १% (५,०००) र बाँकी १.५ लाखमा १०% (१५,०००)।',
    solutionNp: 'कुल आय = रु ६,५०,०००। पहिलो स्ल्याब कर = ५,००,००० × १% = रु ५,०००। दोस्रो स्ल्याब कर = १,५०,००० × १०% = रु १५,०००। कुल आयकर = रु २०,०००।',
  },
  {
    id: 'ch3',
    level: 'hard',
    levelLabelNp: 'तह ३: चुनौतीपूर्ण (Hard)',
    titleNp: 'खुद भ्याट दाखिला गणना',
    questionNp: 'एक थोक बिक्रेताले कारखानाबाट रु २०,००० मा सामान किनेर रु ४,००० नाफा राखी डिलरलाई बेच्दा १३% का दरले सरकारलाई कति खुद भ्याट दाखिला गर्नुपर्छ?',
    questionEn: 'A wholesaler buys for Rs 20,000, adds Rs 4,000 profit and sells. How much net VAT is deposited?',
    correctAnswer: 520,
    unit: 'रु.',
    hintNp: 'व्यापारीले नाफा रकममा मात्र १३% भ्याट दाखिला गर्दछ (४००० × १३%)।',
    solutionNp: 'खरिद भ्याट = २०,००० × १३% = रु २,६००। बिक्री मूल्य = रु २४,०००। बिक्री भ्याट = २४,००० × १३% = रु ३,१२०। दाखिला गर्ने खुद भ्याट = ३,१२० − २,६०० = रु ५२०।',
  },
];

export const TaxProblemSolvingChallenge: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U2-03',
    chapter: 2,
    titleNp: 'कर समस्या समाधान चुनौती',
    titleEn: 'Tax Problem Solving Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<{ checked: boolean; isCorrect: boolean } | null>(null);
  const [score, setScore] = useState<number>(0);

  const cur = CHALLENGES[currentIdx];

  const handleCheck = () => {
    const val = parseFloat(userAnswer);
    const isCorrect = Math.abs(val - cur.correctAnswer) <= 1;
    if (isCorrect) {
      kit.good();
      setScore((s) => s + 1);
    } else {
      kit.oops();
    }
    setFeedback({ checked: true, isCorrect });
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % CHALLENGES.length);
    setUserAnswer('');
    setFeedback(null);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! आयकर, भ्याट र छुटका व्यावहारिक वित्तीय समस्याहरू हल गर्ने चुनौतीमा स्वागत छ!',
        'Welcome! Challenge yourself with practical financial problem solving in Income Tax, VAT, and Discounts!'
      )}
    >
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Level Switcher */}
        <div className="flex gap-2">
          {CHALLENGES.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => {
                setCurrentIdx(idx);
                setUserAnswer('');
                setFeedback(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                currentIdx === idx
                  ? 'bg-amber-600 text-white border-amber-600 shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {ch.levelLabelNp}
            </button>
          ))}
        </div>

        {/* Challenge Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block">
                {cur.levelLabelNp}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{cur.titleNp}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold block">अङ्क (Score)</span>
              <span className="text-lg font-black text-amber-600 font-mono">{score}</span>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-800 leading-relaxed bg-amber-50/70 p-4 rounded-xl border border-amber-200">
            {cur.questionNp}
          </p>

          {/* Input & Action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex-1 flex items-center gap-2">
              <input
                type="number"
                placeholder="तपाईंको उत्तर लेख्नुहोस्..."
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  setFeedback(null);
                }}
                className="w-full p-3 rounded-xl border border-slate-300 font-mono text-sm bg-white font-bold"
              />
              <span className="font-bold text-slate-600 text-sm whitespace-nowrap">{cur.unit}</span>
            </div>

            <button
              onClick={handleCheck}
              disabled={!userAnswer}
              className="py-3 px-6 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              जाँच गर्नुहोस् (Check Answer)
            </button>

            {feedback?.isCorrect && (
              <button
                onClick={handleNext}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1"
              >
                अर्को प्रश्न <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Feedback & Step-by-step Solution */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                feedback.isCorrect
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                  : 'bg-rose-50 text-rose-950 border-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {feedback.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>🎉 एकदम सही उत्तर! उत्कृष्ट हिसाब।</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-5 h-5 text-rose-600" />
                    <span>❌ मिलेन। सही उत्तर: {cur.unit} {cur.correctAnswer.toLocaleString()} हो।</span>
                  </>
                )}
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-slate-200 font-mono text-slate-800 leading-relaxed">
                <b>चरणबद्ध समाधान:</b> {cur.solutionNp}
              </div>
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};
export default TaxProblemSolvingChallenge;
