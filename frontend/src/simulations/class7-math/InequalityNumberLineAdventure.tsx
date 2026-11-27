/**
 * InequalityNumberLineAdventure.tsx
 * Grade 7 Mathematics – Lesson 12: EQUATION, INEQUALITY AND GRAPH (समीकरण, असमानता र ग्राफ)
 * Simulation 2: Inequality and Number Line Adventure (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 174-179)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { ArrowLeftRight, Check, AlertTriangle, RefreshCw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'असमानता x > ४ मा सङ्ख्या रेखामा ४ को स्थानमा कस्तो बिन्दु (Circle) र कतातिर काँडो (Arrow) हुन्छ?',
    en: 'For inequality x > 4, what circle is at 4 on the number line and in which direction does the arrow point?',
    options: [
      { key: 'A', label: 'खुला वृत्त (Open circle), दायाँतर्फ काँडो (Rightward arrow)' },
      { key: 'B', label: 'भरिएको वृत्त (Filled circle), बायाँतर्फ' },
      { key: 'C', label: 'खुला वृत्त, बायाँतर्फ' },
      { key: 'D', label: 'भरिएको वृत्त, दायाँतर्फ' },
    ],
    answer: 'A',
  },
  {
    np: 'असमानता x + २ > ५ लाई हल गर्दा कुन नतिजा आउँछ?',
    en: 'Solving inequality x + 2 > 5 gives what result?',
    options: [
      { key: 'A', label: 'x > ३ (५ - २ = ३)' },
      { key: 'B', label: 'x < ३' },
      { key: 'C', label: 'x ≥ ७' },
      { key: 'D', label: 'x = ३' },
    ],
    answer: 'A',
  },
  {
    np: 'असमानता ३ - २x ≤ ९ लाई हल गर्दा (-२ ले भाग गर्दा चिन्ह उल्टिएर) के हुन्छ?',
    en: 'Solving 3 - 2x ≤ 9, what happens when dividing by -2?',
    options: [
      { key: 'A', label: 'x ≥ -३ (ऋणात्मक सङ्ख्याले भाग गर्दा चिन्ह उल्टिन्छ)' },
      { key: 'B', label: 'x ≤ -३' },
      { key: 'C', label: 'x > ६' },
      { key: 'D', label: 'x < -६' },
    ],
    answer: 'A',
  },
  {
    np: 'समावेशी असमानता (≤ वा ≥) मा सीमा बिन्दुमा कस्तो वृत्त बनाइन्छ?',
    en: 'For inclusive inequalities (≤ or ≥), what kind of circle is drawn at the boundary point?',
    options: [
      { key: 'A', label: 'भरिएको वा कालो वृत्त (Filled / Solid circle)' },
      { key: 'B', label: 'खुला वृत्त (Open circle)' },
      { key: 'C', label: 'कुनै वृत्त हुँदैन' },
      { key: 'D', label: 'त्रिभुज' },
    ],
    answer: 'A',
  },
];

export const InequalityNumberLineAdventure: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L12-02',
    titleEn: 'Inequality & Number Line Adventure',
    titleNp: 'असमानता र सङ्ख्या रेखा यात्रा',
    chapter: 12,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'symbols' | 'solver' | 'reversal'>('symbols');

  // Tab 1: Interactive Number Line Visualizer
  const [boundaryVal, setBoundaryVal] = useState<number>(4);
  const [symbolType, setSymbolType] = useState<'>' | '≥' | '<' | '≤'>('>');

  // Tab 2: Linear Inequality Solver (3x - 2 <= -11)
  const [solverStep, setSolverStep] = useState<number>(0);

  // Tab 3: Reversal Rule
  const [reversalStep, setReversalStep] = useState<number>(0);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'असमानतामा > र < हुँदा खुला वृत्त (Open circle) र ≥ र ≤ हुँदा भरिएको वृत्त (Filled circle) हुन्छ। ऋणात्मक सङ्ख्याले गुणन वा भाग गर्दा चिन्ह उल्टिन्छ!',
        '> and < use open circles, while ≥ and ≤ use filled circles. Multiplying or dividing by a negative number reverses the inequality!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'symbols', np: '१. सङ्ख्या रेखामा असमानता (Number Line)', en: '1. Number Line' },
            { id: 'solver', np: '२. असमानता समाधान (Solve Inequalities)', en: '2. Solving Inequalities' },
            { id: 'reversal', np: '३. चिन्ह उल्टिने नियम (Sign Reversal)', en: '3. Sign Reversal Rule' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                kit.tap();
                setActiveTab(tab.id as any);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === tab.id ? '#187C68' : '#E2E8F0',
                color: activeTab === tab.id ? '#FFF' : '#334155',
                transition: 'all 0.2s',
              }}
            >
              {L(tab.np, tab.en)}
            </button>
          ))}
        </div>

        {/* TAB 1: Number Line Visualizer */}
        {activeTab === 'symbols' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('सङ्ख्या रेखामा असमानताको दृश्यावलोकन', 'Number Line Inequality Representation')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'चिन्ह र सीमा सङ्ख्या छान्नुहोस् र सङ्ख्या रेखामा खुला वा भरिएको वृत्त र काँडोको दिशा हेर्नुहोस्:',
                'Select inequality symbol and boundary value to inspect number line graph:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '16px 0', alignItems: 'center' }}>
              {(['>', '≥', '<', '≤'] as const).map((sym) => (
                <button
                  key={sym}
                  onClick={() => {
                    kit.tap();
                    setSymbolType(sym);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 18,
                    cursor: 'pointer',
                    background: symbolType === sym ? '#187C68' : '#F1F5F9',
                    color: symbolType === sym ? '#FFF' : '#334155',
                  }}
                >
                  x {sym} {boundaryVal}
                </button>
              ))}

              <div style={{ marginLeft: 'auto' }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginRight: 8 }}>
                  {L('सीमा मान: ', 'Boundary: ')} {boundaryVal}
                </label>
                <input
                  type="range"
                  min={-6}
                  max={6}
                  value={boundaryVal}
                  onChange={(e) => {
                    kit.tap();
                    setBoundaryVal(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* SVG Interactive Number Line (-10 to +10) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '24px 0',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                margin: '16px 0',
              }}
            >
              <svg width="420" height="120" viewBox="0 0 420 120">
                {/* Main horizontal line with arrows */}
                <line x1="30" y1="70" x2="390" y2="70" stroke="#475569" strokeWidth="2.5" />
                <polygon points="390,65 405,70 390,75" fill="#475569" />
                <polygon points="30,65 15,70 30,75" fill="#475569" />

                {/* Tick marks from -8 to +8 */}
                {Array.from({ length: 17 }).map((_, i) => {
                  const num = i - 8;
                  const xPos = 210 + num * 20;
                  return (
                    <g key={num}>
                      <line x1={xPos} y1="64" x2={xPos} y2="76" stroke="#64748B" strokeWidth="2" />
                      <text x={xPos} y="94" fontSize="11" textAnchor="middle" fill="#334155" fontWeight={num === 0 ? 'bold' : 'normal'}>
                        {num}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Solution Ray */}
                {(() => {
                  const bX = 210 + boundaryVal * 20;
                  const isRight = symbolType === '>' || symbolType === '≥';
                  const isFilled = symbolType === '≥' || symbolType === '≤';
                  const rayEndX = isRight ? 395 : 25;

                  return (
                    <>
                      {/* Heavy solution line */}
                      <line x1={bX} y1="50" x2={rayEndX} y2="50" stroke="#10B981" strokeWidth="4" />
                      {/* Arrowhead on solution line */}
                      {isRight ? (
                        <polygon points="395,45 408,50 395,55" fill="#10B981" />
                      ) : (
                        <polygon points="25,45 12,50 25,55" fill="#10B981" />
                      )}

                      {/* Boundary circle */}
                      <circle
                        cx={bX}
                        cy="50"
                        r="6"
                        fill={isFilled ? '#10B981' : '#FFF'}
                        stroke="#10B981"
                        strokeWidth="3"
                      />
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Explanation Badge */}
            <div
              style={{
                background: '#ECFDF5',
                padding: 14,
                borderRadius: 8,
                border: '1px solid #6EE7B7',
                fontSize: 14,
                color: '#065F46',
                lineHeight: 1.8,
              }}
            >
              <div>
                <strong>{L('व्याख्या:', 'Explanation:')}</strong> x {symbolType} {boundaryVal} मा{' '}
                {symbolType === '≥' || symbolType === '≤' ? (
                  <span style={{ fontWeight: 800 }}>भरिएको वृत्त (सीमा {boundaryVal} समावेश छ)</span>
                ) : (
                  <span style={{ fontWeight: 800 }}>खुला वृत्त (सीमा {boundaryVal} समावेश छैन)</span>
                )}
                ।
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Linear Inequality Solver */}
        {activeTab === 'solver' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('असमानता हल गर्ने विधि: ३x - २ ≤ -११', 'Solving Linear Inequality: 3x - 2 ≤ -11')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ १७६ को उदाहरण: दुवैतर्फ समान सङ्ख्या जोड्ने र भाग गर्ने चरणहरू:',
                'Textbook Page 176 Example: Steps of adding and dividing to solve:'
              )}
            </p>

            <div
              style={{
                background: '#F8FAFC',
                padding: 18,
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                lineHeight: 2,
                margin: '16px 0',
              }}
            >
              <div>
                <strong>{L('१. दिइएको:', '1. Given:')}</strong> ३x - २ ≤ -११
              </div>
              <div>
                <strong>{L('२. दुवैतर्फ २ जोड्दा:', '2. Adding 2 to both sides:')}</strong> ३x - २ + २ ≤ -११ + २
                <br />➜ ३x ≤ -९
              </div>
              <div>
                <strong>{L('३. दुवैतर्फ ३ ले भाग गर्दा:', '3. Dividing both sides by 3:')}</strong> (३x ÷ ३) ≤ (-९ ÷ ३)
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                x ≤ -३
              </div>
              <div style={{ fontSize: 13, color: '#64748B' }}>
                {L('समाधान समूह: {-३, -४, -५, -६, ...}', 'Solution Set: {-3, -4, -5, -6, ...}')}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Sign Reversal */}
        {activeTab === 'reversal' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('चिन्ह उल्टिने नियम (Sign Reversal Rule: 3 - 2x ≤ 9)', 'Sign Reversal Rule: 3 - 2x ≤ 9')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ १७७ अनुसार: असमानताको दुवैतर्फ ऋणात्मक सङ्ख्याले गुणन वा भाग गर्दा असमानताको चिन्ह उल्टिन्छ (≤ बाट ≥ वा > बाट < बन्छ):',
                'Textbook Page 177: Multiplying or dividing by a negative number reverses the inequality sign (≤ becomes ≥):'
              )}
            </p>

            <div
              style={{
                background: '#FEF2F2',
                padding: 18,
                borderRadius: 10,
                border: '2px solid #F87171',
                lineHeight: 2,
                margin: '16px 0',
              }}
            >
              <div>
                <strong>{L('१. दिइएको:', '1. Given:')}</strong> ३ - २x ≤ ९
              </div>
              <div>
                <strong>{L('२. दुवैतर्फ ३ घटाउँदा:', '2. Subtracting 3:')}</strong> -२x ≤ ९ - ३ ➜ -२x ≤ ६
              </div>
              <div
                style={{
                  background: '#FEE2E2',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px dashed #EF4444',
                  margin: '8px 0',
                }}
              >
                <div style={{ color: '#B91C1C', fontWeight: 800 }}>
                  ⚠️ {L('महत्त्वपूर्ण चरण: -२ ले भाग गर्दा चिन्ह उल्टिन्छ!', 'Critical: Dividing by -2 reverses the sign!')}
                </div>
                <div>(-२x ÷ -२) <span style={{ color: '#166534', fontWeight: 900, fontSize: 18 }}>≥</span> (६ ÷ -२)</div>
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#991B1B',
                }}
              >
                x ≥ -३
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default InequalityNumberLineAdventure;
