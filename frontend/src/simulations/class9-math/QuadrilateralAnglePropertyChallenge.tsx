import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface QuadChallengeItem {
  id: string;
  level: 'basic' | 'intermediate' | 'challenge';
  levelNp: string;
  levelEn: string;
  titleNp: string;
  titleEn: string;
  storyNp: string;
  storyEn: string;
  diagramSvg: {
    type: 'quad' | 'parallelogram' | 'rhombus' | 'trapezium';
    givenText: string[];
    findText: string;
  };
  correctVal: number;
  unit: string;
  hintNp: string;
  hintEn: string;
  solutionStepsNp: string[];
  solutionStepsEn: string[];
}

const CHALLENGES: QuadChallengeItem[] = [
  {
    id: 'c1',
    level: 'basic',
    levelNp: 'आधारभूत (Basic)',
    levelEn: 'Basic',
    titleNp: 'चतुर्भुजको चौथो कोण पत्ता लगाउने',
    titleEn: 'Finding the 4th Angle of a Quadrilateral',
    storyNp:
      'एउटा चतुर्भुज ABCD मा तीनवटा कोणहरू क्रमश: ∠A = ८५°, ∠B = १०५° र ∠C = ७५° छन्। चौथो कोण ∠D को मान कति डिग्री हुन्छ?',
    storyEn:
      'In a quadrilateral ABCD, three angles are ∠A = 85°, ∠B = 105°, and ∠C = 75°. Find the value of fourth angle ∠D.',
    diagramSvg: {
      type: 'quad',
      givenText: ['∠A = 85°', '∠B = 105°', '∠C = 75°'],
      findText: '∠D = ?',
    },
    correctVal: 95,
    unit: '°',
    hintNp: 'चतुर्भुजका चारवटै भित्री कोणहरूको योगफल ३६०° हुन्छ।',
    hintEn: 'The sum of all four interior angles in any quadrilateral is 360°.',
    solutionStepsNp: [
      '१. ∠A + ∠B + ∠C + ∠D = ३६०° (चतुर्भुजको कोण योगफल)',
      '२. ८५° + १०५° + ७५° + ∠D = ३६०°',
      '३. २६५° + ∠D = ३६०°',
      '४. ∠D = ३६०° - २६५° = ९५°',
    ],
    solutionStepsEn: [
      '1. ∠A + ∠B + ∠C + ∠D = 360° (Angle sum property)',
      '2. 85° + 105° + 75° + ∠D = 360°',
      '3. 265° + ∠D = 360°',
      '4. ∠D = 360° - 265° = 95°',
    ],
  },
  {
    id: 'c2',
    level: 'basic',
    levelNp: 'आधारभूत (Basic)',
    levelEn: 'Basic',
    titleNp: 'समानान्तर चतुर्भुजको आसन्न कोण',
    titleEn: 'Adjacent Angle of a Parallelogram',
    storyNp:
      'समानान्तर चतुर्भुज PQRS मा ∠P = ६०° छ। यसको आसन्न कोण ∠Q को मान कति हुन्छ?',
    storyEn:
      'In a parallelogram PQRS, ∠P = 60°. Find the value of adjacent angle ∠Q.',
    diagramSvg: {
      type: 'parallelogram',
      givenText: ['∠P = 60°', 'PQ // RS', 'PS // QR'],
      findText: '∠Q = ?',
    },
    correctVal: 120,
    unit: '°',
    hintNp: 'समानान्तर चतुर्भुजका आसन्न कोणहरू संपूरक (१८०°) हुन्छन्।',
    hintEn: 'Adjacent angles of a parallelogram are supplementary (sum = 180°).',
    solutionStepsNp: [
      '१. ∠P + ∠Q = १८०° (समानान्तर रेखाका क्रमागत भित्री कोणहरू)',
      '२. ६०° + ∠Q = १८०°',
      '३. ∠Q = १८०° - ६०° = १२०°',
    ],
    solutionStepsEn: [
      '1. ∠P + ∠Q = 180° (Consecutive interior angles)',
      '2. 60° + ∠Q = 180°',
      '3. ∠Q = 180° - 60° = 120°',
    ],
  },
  {
    id: 'c3',
    level: 'intermediate',
    levelNp: 'मध्यम (Intermediate)',
    levelEn: 'Intermediate',
    titleNp: 'समानान्तर चतुर्भुजमा बीजीय सम्मुख कोण',
    titleEn: 'Algebraic Opposite Angles in a Parallelogram',
    storyNp:
      'समानान्तर चतुर्भुज ABCD मा सम्मुख कोणहरू ∠A = (३x + १०)° र ∠C = (२x + ४०)° छन्। x को मान पत्ता लगाउनुहोस्।',
    storyEn:
      'In a parallelogram ABCD, opposite angles are ∠A = (3x + 10)° and ∠C = (2x + 40)°. Find the value of x.',
    diagramSvg: {
      type: 'parallelogram',
      givenText: ['∠A = (3x + 10)°', '∠C = (2x + 40)°'],
      findText: 'x = ?',
    },
    correctVal: 30,
    unit: '°',
    hintNp: 'समानान्तर चतुर्भुजका सम्मुख कोणहरू आपसमा बराबर हुन्छन् (∠A = ∠C)।',
    hintEn: 'Opposite angles of a parallelogram are equal (∠A = ∠C).',
    solutionStepsNp: [
      '१. ∠A = ∠C (समानान्तर चतुर्भुजका सम्मुख कोण)',
      '२. ३x + १० = २x + ४०',
      '३. ३x - २x = ४० - १०',
      '४. x = ३०°',
    ],
    solutionStepsEn: [
      '1. ∠A = ∠C (Opposite angles of parallelogram)',
      '2. 3x + 10 = 2x + 40',
      '3. 3x - 2x = 40 - 10',
      '4. x = 30°',
    ],
  },
  {
    id: 'c4',
    level: 'challenge',
    levelNp: 'चुनौतीपूर्ण (Challenge)',
    levelEn: 'Challenge',
    titleNp: 'अनुपातमा दिइएका चार कोणहरूको समस्या',
    titleEn: 'Four Angles in Ratio 2:3:4:6',
    storyNp:
      'कुनै चतुर्भुजका चारवटै कोणहरू २:३:४:६ को अनुपातमा छन्। उक्त चतुर्भुजको सबैभन्दा सानो कोण कति डिग्रीको होला?',
    storyEn:
      'The four angles of a quadrilateral are in the ratio 2:3:4:6. Find the smallest angle in degrees.',
    diagramSvg: {
      type: 'quad',
      givenText: ['Angles ratio = 2 : 3 : 4 : 6'],
      findText: 'Smallest angle = ?',
    },
    correctVal: 48,
    unit: '°',
    hintNp: 'कोणहरू २x, ३x, ४x, ६x मान्ने र जम्मा ३६०° सँग तुलना गर्ने।',
    hintEn: 'Let angles be 2x, 3x, 4x, 6x. Their sum equals 360°.',
    solutionStepsNp: [
      '१. २x + ३x + ४x + ६x = ३६०° (कोणहरूको योगफल)',
      '२. १५x = ३६०°',
      '३. x = ३६०° ÷ १५ = २४°',
      '४. सबैभन्दा सानो कोण = २x = २ × २४° = ४८°',
    ],
    solutionStepsEn: [
      '1. 2x + 3x + 4x + 6x = 360°',
      '2. 15x = 360°',
      '3. x = 360° / 15 = 24°',
      '4. Smallest angle = 2x = 2 × 24° = 48°',
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'चतुर्भुजका कोणहरूको अनुपात १:२:३:४ भए सबैभन्दा ठूलो कोण कति हुन्छ?',
    en: 'If angles of a quadrilateral are in ratio 1:2:3:4, what is the largest angle?',
    options: [
      { key: 'A', label: '144° (१०x = ३६०° ⇒ x = ३६°, ४x = १४४°)' },
      { key: 'B', label: '108°' },
      { key: 'C', label: '72°' },
      { key: 'D', label: '180°' },
    ],
    answer: 'A',
  },
  {
    np: 'समलम्ब चतुर्भुज (Trapezium) मा समानान्तर भुजा बीचका दुई क्रमागत भित्री कोणहरूको योगफल कति हुन्छ?',
    en: 'In a trapezium, what is the sum of consecutive interior angles between parallel sides?',
    options: [
      { key: 'A', label: '180° (क्रमागत भित्री कोणहरू)' },
      { key: 'B', label: '360°' },
      { key: 'C', label: '90°' },
      { key: 'D', label: '270°' },
    ],
    answer: 'A',
  },
  {
    np: 'रोम्बस (Rhombus) का विकर्णहरू परस्पर कति डिग्रीको कोणमा काटिन्छन्?',
    en: 'At what angle do the diagonals of a rhombus intersect?',
    options: [
      { key: 'A', label: '90° (समकोणमा लम्ब हुन्छन्)' },
      { key: 'B', label: '60°' },
      { key: 'C', label: '45°' },
      { key: 'D', label: '180°' },
    ],
    answer: 'A',
  },
];

export const QuadrilateralAnglePropertyChallenge: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U14-03',
    chapter: 14,
    titleNp: 'चतुर्भुज कोण तथा विशेषता चुनौती',
    titleEn: 'Quadrilateral Angle and Property Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [filterLevel, setFilterLevel] = useState<'all' | 'basic' | 'intermediate' | 'challenge'>('all');
  const [activeChallengeId, setActiveChallengeId] = useState<string>('c1');
  const [userInput, setUserInput] = useState<string>('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  const filteredChallenges =
    filterLevel === 'all' ? CHALLENGES : CHALLENGES.filter((c) => c.level === filterLevel);

  const curr = CHALLENGES.find((c) => c.id === activeChallengeId) || CHALLENGES[0];

  const handleSelectChallenge = (id: string) => {
    setActiveChallengeId(id);
    setUserInput('');
    setFeedback('none');
    setShowHint(false);
    setShowSolution(false);
  };

  const handleCheckAnswer = () => {
    if (Number(userInput) === curr.correctVal) {
      setFeedback('correct');
      setShowSolution(true);
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
        'नमस्ते! चतुर्भुजका कोणहरूको योगफल ३६०°, समानान्तर चतुर्भुजका सम्मुख र आसन्न कोणहरू, तथा अनुपातमा आधारित समस्याहरूलाई तीन कठिनाइ तहहरूमा समाधान गर्नुहोस्!',
        'Welcome! Solve quadrilateral angle challenges across basic, intermediate, and challenge levels with step-by-step verified explanations!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Difficulty Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {(['all', 'basic', 'intermediate', 'challenge'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: filterLevel === lvl ? '2px solid #0D9488' : '1px solid #CBD5E1',
                backgroundColor: filterLevel === lvl ? '#F0FDFA' : '#FFFFFF',
                color: filterLevel === lvl ? '#0F766E' : '#475569',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {lvl === 'all'
                ? L('सबै तह (All Levels)', 'All Levels')
                : lvl === 'basic'
                ? L('आधारभूत (Basic)', 'Basic')
                : lvl === 'intermediate'
                ? L('मध्यम (Intermediate)', 'Intermediate')
                : L('चुनौतीपूर्ण (Challenge)', 'Challenge')}
            </button>
          ))}
        </div>

        {/* Challenge Selection Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {filteredChallenges.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectChallenge(c.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: activeChallengeId === c.id ? '2px solid #2563EB' : '1px solid #CBD5E1',
                backgroundColor: activeChallengeId === c.id ? '#EFF6FF' : '#FFFFFF',
                color: activeChallengeId === c.id ? '#1D4ED8' : '#334155',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {L(c.titleNp, c.titleEn)}
            </button>
          ))}
        </div>

        {/* Main Challenge Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: 6,
                backgroundColor:
                  curr.level === 'basic'
                    ? '#ECFDF5'
                    : curr.level === 'intermediate'
                    ? '#EFF6FF'
                    : '#FEF2F2',
                color:
                  curr.level === 'basic'
                    ? '#065F46'
                    : curr.level === 'intermediate'
                    ? '#1E40AF'
                    : '#991B1B',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {L(curr.levelNp, curr.levelEn)}
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
            {L(curr.storyNp, curr.storyEn)}
          </div>

          {/* Diagram Data Box */}
          <div
            style={{
              padding: 12,
              backgroundColor: '#F0FDFA',
              borderRadius: 8,
              border: '1px solid #CCFBF1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0F766E' }}>
                {L('दिइएको तथ्यहरू (Given):', 'Given:')}{' '}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#134E4A' }}>
                {curr.diagramSvg.givenText.join(' | ')}
              </span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: '#D97706' }}>
              {curr.diagramSvg.findText}
            </div>
          </div>

          {/* User Input & Action Controls */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <span>{L('उत्तर प्रविष्ट गर्नुहोस्:', 'Enter Answer:')}</span>
              <input
                type="number"
                placeholder={L('मान', 'value')}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                style={{
                  width: 110,
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  fontFamily: 'monospace',
                  fontSize: 15,
                }}
              />
              <span style={{ fontWeight: 700, color: '#475569' }}>{curr.unit}</span>
            </label>

            <button
              onClick={handleCheckAnswer}
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

            <button
              onClick={() => setShowHint(!showHint)}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#D97706',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              💡 {showHint ? L('संकेत लुकाउने', 'Hide Hint') : L('संकेत हेर्ने', 'Show Hint')}
            </button>
          </div>

          {feedback === 'correct' && (
            <div style={{ padding: 12, backgroundColor: '#ECFDF5', borderRadius: 8, border: '1px solid #6EE7B7', color: '#065F46', fontWeight: 700, fontSize: 13 }}>
              🎉 {L('सही उत्तर! स्याबास!', 'Correct answer! Excellent problem solving!')}
            </div>
          )}

          {feedback === 'incorrect' && (
            <div style={{ padding: 12, backgroundColor: '#FEF2F2', borderRadius: 8, border: '1px solid #FCA5A5', color: '#991B1B', fontSize: 13 }}>
              ❌ {L('उत्तर मिलेन, कृपया पुनः हिसाब गर्नुहोस् वा संकेत हेर्नुहोस्।', 'Incorrect answer, please re-calculate or consult the hint.')}
            </div>
          )}

          {showHint && (
            <div style={{ padding: 12, backgroundColor: '#FFFBEB', borderRadius: 8, border: '1px solid #FCD34D', color: '#B45309', fontSize: 13, lineHeight: 1.5 }}>
              <strong>{L('संकेत (Hint):', 'Hint:')}</strong> {L(curr.hintNp, curr.hintEn)}
            </div>
          )}

          {/* Step-by-Step Solution Drawer */}
          {showSolution && (
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <strong style={{ fontSize: 13, color: '#0F766E' }}>
                {L('चरणबद्ध समाधान (Step-by-Step Solution):', 'Step-by-Step Solution:')}
              </strong>
              {(isNe ? curr.solutionStepsNp : curr.solutionStepsEn).map((st, i) => (
                <div key={i} style={{ fontFamily: 'monospace', fontSize: 13, color: '#334155' }}>
                  {st}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};

export default QuadrilateralAnglePropertyChallenge;
