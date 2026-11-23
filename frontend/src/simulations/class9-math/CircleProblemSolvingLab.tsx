import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface CircleProblem {
  id: string;
  titleNp: string;
  titleEn: string;
  storyNp: string;
  storyEn: string;
  givenR?: number;
  givenC?: number;
  givenD?: number;
  findType: 'd' | 'r' | 'c';
  correctVal: number;
  unit: string;
  solutionStepsNp: string[];
  solutionStepsEn: string[];
}

const PROBLEMS: CircleProblem[] = [
  {
    id: 'p1',
    titleNp: 'पाठ्यपुस्तक उदाहरण १: केन्द्रबाट जीवाको लम्ब दुरी पत्ता लगाउने',
    titleEn: 'Textbook Example 1: Find Perpendicular Distance to Chord',
    storyNp:
      'एउटा वृत्तको अर्धव्यास १० सेमी र जीवाको लम्बाइ १६ सेमी छ भने, वृत्तको केन्द्रबाट उक्त जीवा सम्मको लम्ब दुरी कति हुन्छ?',
    storyEn:
      'A circle has a radius of 10 cm and a chord of length 16 cm. Find the perpendicular distance from the centre to the chord.',
    givenR: 10,
    givenC: 16,
    findType: 'd',
    correctVal: 6,
    unit: 'cm',
    solutionStepsNp: [
      '१. केन्द्रबाट जीवामा खिचिएको लम्बले जीवालाई आधा गर्छ: आधा जीवा = १६ ÷ २ = ८ सेमी',
      '२. समकोणी त्रिभुजमा पाइथागोरस साध्य: r² = d² + (जीवा/२)²',
      '३. १०² = d² + ८² ⇒ १०० = d² + ६४',
      '४. d² = १०० - ६४ = ३६ ⇒ d = √३६ = ६ सेमी',
    ],
    solutionStepsEn: [
      '1. Perpendicular from centre bisects chord: Half chord = 16 / 2 = 8 cm',
      '2. In right triangle △OMA: r² = d² + (chord/2)²',
      '3. 10² = d² + 8² => 100 = d² + 64',
      '4. d² = 100 - 64 = 36 => d = √36 = 6 cm',
    ],
  },
  {
    id: 'p2',
    titleNp: 'पाठ्यपुस्तक उदाहरण २: वृत्तको अर्धव्यास पत्ता लगाउने',
    titleEn: 'Textbook Example 2: Find Radius of Circle',
    storyNp:
      'वृत्तको केन्द्रबाट ५ सेमी दुरीमा रहेको जीवाको लम्बाइ २४ सेमी छ भने, उक्त वृत्तको अर्धव्यास कति होला?',
    storyEn:
      'A chord of length 24 cm is at a distance of 5 cm from the centre of a circle. What is the radius of the circle?',
    givenD: 5,
    givenC: 24,
    findType: 'r',
    correctVal: 13,
    unit: 'cm',
    solutionStepsNp: [
      '१. आधा जीवा = २४ ÷ २ = १२ सेमी',
      '२. लम्ब दुरी d = ५ सेमी',
      '३. पाइथागोरस साध्य अनुसार: r² = ५² + १२² = २५ + १४४ = १६९',
      '४. r = √१६९ = १३ सेमी',
    ],
    solutionStepsEn: [
      '1. Half chord = 24 / 2 = 12 cm',
      '2. Perpendicular distance d = 5 cm',
      '3. By Pythagoras theorem: r² = 5² + 12² = 25 + 144 = 169',
      '4. r = √169 = 13 cm',
    ],
  },
  {
    id: 'p3',
    titleNp: 'पाठ्यपुस्तक उदाहरण ३: जीवाको पूरा लम्बाइ पत्ता लगाउने',
    titleEn: 'Textbook Example 3: Find Total Chord Length',
    storyNp:
      'एउटा वृत्तको अर्धव्यास २५ सेमी छ। केन्द्रबाट ७ सेमी दुरीमा रहेको जीवाको लम्बाइ कति हुन्छ?',
    storyEn:
      'A circle has a radius of 25 cm. What is the length of a chord situated at a distance of 7 cm from the centre?',
    givenR: 25,
    givenD: 7,
    findType: 'c',
    correctVal: 48,
    unit: 'cm',
    solutionStepsNp: [
      '१. पाइथागोरस साध्य अनुसार: (जीवा/२)² = r² - d²',
      '२. (जीवा/२)² = २५² - ७² = ६२५ - ४९ = ५७६',
      '३. आधा जीवा = √५७६ = २४ सेमी',
      '४. जीवाको पूरा लम्बाइ = २ × २४ = ४८ सेमी',
    ],
    solutionStepsEn: [
      '1. By Pythagoras: (half chord)² = r² - d²',
      '2. (half chord)² = 25² - 7² = 625 - 49 = 576',
      '3. Half chord = √576 = 24 cm',
      '4. Full chord length = 2 × 24 = 48 cm',
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'वृत्तको अर्धव्यास (r), केन्द्रबाट जीवाको दुरी (d) र जीवाको लम्बाइ (c) बीचको सही सम्बन्ध कुन हो?',
    en: 'What is the correct relation between radius (r), distance to chord (d), and chord length (c)?',
    options: [
      { key: 'A', label: 'r² = d² + (c/2)²' },
      { key: 'B', label: 'r = d + c' },
      { key: 'C', label: 'r² = d² + c²' },
      { key: 'D', label: 'd² = r² + c²' },
    ],
    answer: 'A',
  },
  {
    np: '१० सेमी अर्धव्यास भएको वृत्तमा केन्द्रबाट ६ सेमी पर रहेको जीवाको लम्बाइ कति हुन्छ?',
    en: 'In a circle of radius 10 cm, what is the length of a chord 6 cm from the centre?',
    options: [
      { key: 'A', label: '16 cm (२ × √(१०० - ३६) = २ × ८ = १६)' },
      { key: 'B', label: '8 cm' },
      { key: 'C', label: '12 cm' },
      { key: 'D', label: '20 cm' },
    ],
    answer: 'A',
  },
  {
    np: '५ सेमी अर्धव्यास भएको वृत्तमा ३ सेमी र ४ सेमी लम्बाइ भएका दुई जीवाहरू मध्ये कुन जीवा केन्द्रको नजिक हुन्छ?',
    en: 'In a circle of radius 5 cm, between chords of 3 cm and 4 cm, which is closer to the centre?',
    options: [
      { key: 'A', label: '४ सेमीको जीवा (लामो जीवा केन्द्रको नजिक हुन्छ)' },
      { key: 'B', label: '३ सेमीको जीवा' },
      { key: 'C', label: 'दुवै बराबर दुरीमा हुन्छन्' },
      { key: 'D', label: 'केन्द्रमै पर्छन्' },
    ],
    answer: 'A',
  },
];

export const CircleProblemSolvingLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U16-03',
    chapter: 16,
    titleNp: 'वृत्त समस्या समाधान प्रयोगशाला',
    titleEn: 'Circle Problem-Solving Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeProblemIdx, setActiveProblemIdx] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [showSolution, setShowSolution] = useState<boolean>(false);

  const prob = PROBLEMS[activeProblemIdx];

  const handleSelectProblem = (idx: number) => {
    setActiveProblemIdx(idx);
    setUserInput('');
    setFeedback('none');
    setShowSolution(false);
  };

  const handleCheck = () => {
    if (Number(userInput) === prob.correctVal) {
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
        'नमस्ते! वृत्तको अर्धव्यास, जीवा र केन्द्रबाट लम्ब दुरी बीचको पाइथागोरस सम्बन्ध (r² = d² + (c/२)²) प्रयोग गरी पाठ्यपुस्तकका व्यावहारिक प्रश्नहरू समाधान गरौं!',
        'Welcome! Solve circle calculation problems using the Pythagorean relation r² = d² + (chord/2)² with step-by-step guidance!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Problem Selector Bar */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {PROBLEMS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => handleSelectProblem(idx)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: activeProblemIdx === idx ? '2px solid #0D9488' : '1px solid #CBD5E1',
                backgroundColor: activeProblemIdx === idx ? '#F0FDFA' : '#FFFFFF',
                color: activeProblemIdx === idx ? '#0F766E' : '#475569',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {L(`उदाहरण ${fmt(idx + 1)}`, `Example ${idx + 1}`)}: {L(p.titleNp, p.titleEn)}
            </button>
          ))}
        </div>

        {/* Problem Question Card */}
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
            {L(prob.storyNp, prob.storyEn)}
          </div>

          {/* Given vs Find Specs */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              backgroundColor: '#F0FDFA',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: 13, color: '#134E4A' }}>
              <strong>{L('थाहा दिएको (Given):', 'Given:')}</strong>{' '}
              {prob.givenR !== undefined && `अर्धव्यास (r) = ${fmt(prob.givenR)} cm `}
              {prob.givenC !== undefined && `जीवा (c) = ${fmt(prob.givenC)} cm `}
              {prob.givenD !== undefined && `लम्ब दुरी (d) = ${fmt(prob.givenD)} cm`}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#D97706' }}>
              {prob.findType === 'd' && L('पत्ता लगाउनुपर्ने: लम्ब दुरी (d) = ?', 'Find: Perp Distance (d) = ?')}
              {prob.findType === 'r' && L('पत्ता लगाउनुपर्ने: अर्धव्यास (r) = ?', 'Find: Radius (r) = ?')}
              {prob.findType === 'c' && L('पत्ता लगाउनुपर्ने: पूरा जीवा (c) = ?', 'Find: Chord Length (c) = ?')}
            </div>
          </div>

          {/* User Input Controls */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <span>{L('तपाईंको उत्तर:', 'Your Answer:')}</span>
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
              <span style={{ fontWeight: 700, color: '#475569' }}>{prob.unit}</span>
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

            <button
              onClick={() => setShowSolution(!showSolution)}
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
              📖 {showSolution ? L('समाधान लुकाउने', 'Hide Solution') : L('समाधान हेर्ने', 'Show Solution')}
            </button>
          </div>

          {feedback === 'correct' && (
            <div style={{ padding: 12, backgroundColor: '#ECFDF5', borderRadius: 8, border: '1px solid #6EE7B7', color: '#065F46', fontWeight: 700, fontSize: 13 }}>
              🎉 {L('सबास! तपाईंको हिसाब पूर्ण रूपमा सही छ!', 'Correct! Your calculation is exact!')}
            </div>
          )}

          {feedback === 'incorrect' && (
            <div style={{ padding: 12, backgroundColor: '#FEF2F2', borderRadius: 8, border: '1px solid #FCA5A5', color: '#991B1B', fontSize: 13 }}>
              ❌ {L('मिलेन, कृपया r² = d² + (c/२)² सूत्र प्रयोग गरी पुनः प्रयास गर्नुहोस्।', 'Incorrect, please re-apply r² = d² + (c/2)².')}
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
              {(isNe ? prob.solutionStepsNp : prob.solutionStepsEn).map((st, i) => (
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

export default CircleProblemSolvingLab;
