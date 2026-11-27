import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface WordChallenge {
  id: string;
  categoryNp: string;
  categoryEn: string;
  storyNp: string;
  storyEn: string;
  varXNp: string;
  varXEn: string;
  varYNp: string;
  varYEn: string;
  eq1Model: string;
  eq2Model: string;
  solution: { x: number; y: number; answerNp: string; answerEn: string };
  hintsNp: string[];
  hintsEn: string[];
}

const CHALLENGES: WordChallenge[] = [
  {
    id: 'ch1',
    categoryNp: 'उमेर सम्बन्धी समस्या (Age Problem)',
    categoryEn: 'Age Problem',
    storyNp:
      'हाल बाबुको उमेर छोराको उमेरको 3 गुणा छ। 10 वर्षपछि बाबुको उमेर छोराको उमेरको 2 गुणा भन्दा 10 वर्ष बढी हुनेछ। दुवैको हालको उमेर पत्ता लगाउनुहोस्।',
    storyEn:
      "Presently, a father's age is 3 times his son's age. After 10 years, the father's age will be 10 years more than twice the son's age. Find their present ages.",
    varXNp: 'बाबुको हालको उमेर (Father’s Age)',
    varXEn: "Father's present age",
    varYNp: 'छोराको हालको उमेर (Son’s Age)',
    varYEn: "Son's present age",
    eq1Model: 'x = 3y ⇒ x - 3y = 0',
    eq2Model: 'x + 10 = 2(y + 10) + 10 ⇒ x - 2y = 20',
    solution: {
      x: 60,
      y: 20,
      answerNp: 'बाबुको उमेर = 60 वर्ष, छोराको उमेर = 20 वर्ष',
      answerEn: 'Father is 60 years old, Son is 20 years old',
    },
    hintsNp: [
      'पहिचान: बाबुको उमेर x र छोराको उमेर y मान्ने।',
      'सर्त 1: x = 3y अर्थात् x - 3y = 0',
      'सर्त 2: 10 वर्षपछि बाबु = (x + 10), छोरा = (y + 10)। अतः (x + 10) = 2(y + 10) + 10',
      'समीकरण समाधान गर्दा y = 20 र x = 60 आउँछ।',
    ],
    hintsEn: [
      'Define: Father’s age = x, Son’s age = y.',
      'Condition 1: x = 3y => x - 3y = 0',
      'Condition 2: After 10 years, (x + 10) = 2(y + 10) + 10 => x - 2y = 20',
      'Solving yields y = 20 and x = 60.',
    ],
  },
  {
    id: 'ch2',
    categoryNp: 'वस्तुको मूल्य सम्बन्धी (Shopping / Cost)',
    categoryEn: 'Goods & Cost Problem',
    storyNp:
      '5 pcs कलम र 3 pcs कापीको जम्मा मूल्य Rs. 175 पर्दछ। त्यस्तै 2 pcs कलम र 4 pcs कापीको जम्मा मूल्य Rs. 140 पर्दछ। एउटा कलम र एउटा कापीको मूल्य कति-कति पर्ला?',
    storyEn:
      'The cost of 5 pens and 3 notebooks is Rs. 175. The cost of 2 pens and 4 notebooks is Rs. 140. Find the individual price of one pen and one notebook.',
    varXNp: 'एउटा कलमको मूल्य (Cost of 1 Pen)',
    varXEn: 'Cost of 1 Pen (Rs.)',
    varYNp: 'एउटा कापीको मूल्य (Cost of 1 Notebook)',
    varYEn: 'Cost of 1 Notebook (Rs.)',
    eq1Model: '5x + 3y = 175',
    eq2Model: '2x + 4y = 140 ⇒ x + 2y = 70',
    solution: {
      x: 20,
      y: 25,
      answerNp: '1 कलमको मूल्य = Rs. 20, 1 कापीको मूल्य = Rs. 25',
      answerEn: '1 Pen = Rs. 20, 1 Notebook = Rs. 25',
    },
    hintsNp: [
      'कलमको मूल्य = Rs. x, कापीको मूल्य = Rs. y मान्ने।',
      'पहिलो अवस्था: 5x + 3y = 175',
      'दोस्रो अवस्था: 2x + 4y = 140 ⇒ x = 70 - 2y',
      'प्रतिस्थापन गर्दा: 5(70 - 2y) + 3y = 175 ⇒ 350 - 7y = 175 ⇒ y = 25, x = 20',
    ],
    hintsEn: [
      'Let cost of pen = x, cost of notebook = y.',
      'Case 1: 5x + 3y = 175',
      'Case 2: 2x + 4y = 140 => x + 2y = 70',
      'Substitute x = 70 - 2y to get y = 25 and x = 20.',
    ],
  },
  {
    id: 'ch3',
    categoryNp: 'दुई अङ्कको संख्या सम्बन्धी (Two-Digit Number)',
    categoryEn: 'Two-Digit Number Problem',
    storyNp:
      'एउटा दुई अङ्कको संख्यामा अङ्कहरूको योगफल 9 छ। यदि अङ्कहरूको स्थान उल्ट्याउँदा बन्ने नयाँ संख्या मूल संख्या भन्दा 27 ले बढी हुन्छ भने, उक्त संख्या पत्ता लगाउनुहोस्।',
    storyEn:
      'A two-digit number has digits summing to 9. When digits are reversed, the new number exceeds the original number by 27. Find the number.',
    varXNp: 'दश स्थानको अङ्क (Tens digit x)',
    varXEn: 'Tens digit x',
    varYNp: 'एक स्थानको अङ्क (Units digit y)',
    varYEn: 'Units digit y',
    eq1Model: 'x + y = 9',
    eq2Model: '(10y + x) - (10x + y) = 27 ⇒ 9(y - x) = 27 ⇒ y - x = 3',
    solution: {
      x: 3,
      y: 6,
      answerNp: 'संख्या = 10(3) + 6 = 36',
      answerEn: 'Original Number = 10(3) + 6 = 36',
    },
    hintsNp: [
      'संख्या = 10x + y र स्थान उल्ट्याउँदा = 10y + x',
      'सर्त 1: x + y = 9',
      'सर्त 2: (10y + x) - (10x + y) = 27 ⇒ 9y - 9x = 27 ⇒ y - x = 3',
      'दुवै समीकरण जोड्दा: 2y = 12 ⇒ y = 6, x = 3। अतः संख्या = 36',
    ],
    hintsEn: [
      'Number = 10x + y, Reversed = 10y + x',
      'Condition 1: x + y = 9',
      'Condition 2: (10y + x) - (10x + y) = 27 => y - x = 3',
      'Adding equations gives 2y = 12 => y = 6, x = 3. Number is 36.',
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'दुई अङ्कको संख्यामा दश स्थानको अङ्क x र एक स्थानको अङ्क y भए उक्त संख्याको बीजीय स्वरूप के हुन्छ?',
    en: 'If tens digit is x and units digit is y, what is the algebraic form of the number?',
    options: [
      { key: 'A', label: '10x + y' },
      { key: 'B', label: 'x + y' },
      { key: 'C', label: 'xy' },
      { key: 'D', label: '10(x + y)' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि 5 कलम र 3 कापीको मूल्य Rs. 175 र कलमको मूल्य Rs. 20 भए, 1 कापीको मूल्य कति हुन्छ?',
    en: 'If 5 pens and 3 copies cost Rs. 175 and 1 pen costs Rs. 20, what is 1 copy cost?',
    options: [
      { key: 'A', label: 'Rs. 25 (Rs. 25)' },
      { key: 'B', label: 'Rs. 30' },
      { key: 'C', label: 'Rs. 15' },
      { key: 'D', label: 'Rs. 20' },
    ],
    answer: 'A',
  },
  {
    np: 'बाबुको हालको उमेर x वर्ष भए 5 वर्ष अघि बाबुको उमेर कति थियो?',
    en: "If father's present age is x years, what was his age 5 years ago?",
    options: [
      { key: 'A', label: 'x - 5' },
      { key: 'B', label: 'x + 5' },
      { key: 'C', label: '5x' },
      { key: 'D', label: 'x / 5' },
    ],
    answer: 'A',
  },
];

export const SimultaneousEquationChallenge: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U11-03',
    chapter: 11,
    titleNp: 'व्यावहारिक युगपत समीकरण चुनौती',
    titleEn: 'Real-Life Simultaneous Equation Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeChallengeId, setActiveChallengeId] = useState<string>('ch1');
  const [revealedStep, setRevealedStep] = useState<number>(0);
  const [userAnsX, setUserAnsX] = useState<string>('');
  const [userAnsY, setUserAnsY] = useState<string>('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');

  const ch = CHALLENGES.find((c) => c.id === activeChallengeId) || CHALLENGES[0];

  const handleSelectChallenge = (id: string) => {
    setActiveChallengeId(id);
    setRevealedStep(0);
    setUserAnsX('');
    setUserAnsY('');
    setFeedback('none');
  };

  const handleCheck = () => {
    const xNum = Number(userAnsX);
    const yNum = Number(userAnsY);
    if (xNum === ch.solution.x && yNum === ch.solution.y) {
      setFeedback('correct');
      setRevealedStep(ch.hintsNp.length);
    } else {
      setFeedback('incorrect');
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'स्वागत छ! उमेर, खरिद-बिक्री र दुई अङ्कका संख्या सम्बन्धी शाब्दिक समस्याहरूलाई रैखिक समीकरणमा बदलेर समाधान गर्ने रोमाञ्चक चुनौती अभ्यास गरौं!',
        'Welcome! Translate real-life word problems about ages, purchases, and digits into simultaneous linear equations and solve them step-by-step!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Challenge Selection Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {CHALLENGES.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectChallenge(c.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: activeChallengeId === c.id ? '2px solid #0D9488' : '1px solid #CBD5E1',
                backgroundColor: activeChallengeId === c.id ? '#F0FDFA' : '#FFFFFF',
                color: activeChallengeId === c.id ? '#0F766E' : '#475569',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: isNe ? FONT_NP : 'inherit',
                fontSize: 13,
              }}
            >
              {L(c.categoryNp, c.categoryEn)}
            </button>
          ))}
        </div>

        {/* Story Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 18,
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: '#CCFBF1',
                color: '#0F766E',
                padding: '3px 8px',
                borderRadius: 6,
              }}
            >
              {L(ch.categoryNp, ch.categoryEn)}
            </span>
          </div>

          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#1E293B',
              lineHeight: 1.6,
              backgroundColor: '#F8FAFC',
              padding: 14,
              borderRadius: 8,
              borderLeft: '4px solid #0D9488',
            }}
          >
            {L(ch.storyNp, ch.storyEn)}
          </div>

          {/* Mathematical Modeling Info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              fontSize: 13,
              color: '#334155',
            }}
          >
            <div style={{ backgroundColor: '#F0FDFA', padding: 10, borderRadius: 8 }}>
              <strong>x = </strong> {L(ch.varXNp, ch.varXEn)}
              <div style={{ fontFamily: 'monospace', color: '#0F766E', marginTop: 4 }}>
                Equation (i): {ch.eq1Model}
              </div>
            </div>
            <div style={{ backgroundColor: '#F0FDFA', padding: 10, borderRadius: 8 }}>
              <strong>y = </strong> {L(ch.varYNp, ch.varYEn)}
              <div style={{ fontFamily: 'monospace', color: '#0F766E', marginTop: 4 }}>
                Equation (ii): {ch.eq2Model}
              </div>
            </div>
          </div>
        </div>

        {/* Student Answer Input Box */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
            {L('तपाईंको उत्तर प्रविष्ट गर्नुहोस् (Enter Your Solution):', 'Enter Your Answer:')}
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span>x =</span>
              <input
                type="number"
                placeholder={L('मान', 'value')}
                value={userAnsX}
                onChange={(e) => setUserAnsX(e.target.value)}
                style={{
                  width: 90,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  fontFamily: 'monospace',
                  fontSize: 14,
                }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span>y =</span>
              <input
                type="number"
                placeholder={L('मान', 'value')}
                value={userAnsY}
                onChange={(e) => setUserAnsY(e.target.value)}
                style={{
                  width: 90,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  fontFamily: 'monospace',
                  fontSize: 14,
                }}
              />
            </label>

            <button
              onClick={handleCheck}
              style={{
                padding: '7px 18px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#0D9488',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {L('जाँच गर्नुहोस्', 'Check Answer')}
            </button>
          </div>

          {feedback === 'correct' && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#ECFDF5',
                border: '1px solid #6EE7B7',
                color: '#065F46',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              🎉 {L('स्याबास! तपाईंको उत्तर सही छ!', 'Excellent! Your answer is correct!')} —{' '}
              {L(ch.solution.answerNp, ch.solution.answerEn)}
            </div>
          )}

          {feedback === 'incorrect' && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                fontSize: 13,
              }}
            >
              ❌ {L('उत्तर मिलेन। कृपया तलका संकेतहरू (Hints) हेर्नुहोस्।', 'Incorrect answer. Please inspect the hints below.')}
            </div>
          )}
        </div>

        {/* Guided Step Hints Accordion */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
              💡 {L('चरणबद्ध समाधान संकेतहरू (Guided Hints):', 'Step-by-Step Guided Hints:')}
            </span>
            {revealedStep < ch.hintsNp.length && (
              <button
                onClick={() => setRevealedStep((prev) => Math.min(ch.hintsNp.length, prev + 1))}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#0F766E',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {L('अर्को संकेत देखाउनुहोस् (+)', 'Show Next Hint (+)')}
              </button>
            )}
          </div>

          {revealedStep === 0 && (
            <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic' }}>
              {L(
                'समस्या समाधान गर्न मद्दत चाहिएमा माथिको "अर्को संकेत देखाउनुहोस्" बटन थिच्नुहोस्।',
                'Click "Show Next Hint" above if you need guided help to solve the challenge.'
              )}
            </div>
          )}

          {ch.hintsNp.slice(0, revealedStep).map((h, i) => (
            <div
              key={i}
              style={{
                padding: '8px 12px',
                backgroundColor: '#FFFFFF',
                borderRadius: 6,
                border: '1px solid #E2E8F0',
                fontSize: 12,
                color: '#334155',
                lineHeight: 1.5,
              }}
            >
              <strong>{L(`संकेत ${fmt(i + 1)}:`, `Hint ${i + 1}:`)}</strong>{' '}
              {L(h, ch.hintsEn[i])}
            </div>
          ))}
        </div>
      </div>
    </SimFrame2D>
  );
};

export default SimultaneousEquationChallenge;
