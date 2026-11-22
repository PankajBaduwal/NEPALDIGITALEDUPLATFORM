/**
 * LinearEquationPlayground.tsx
 * Grade 7 Mathematics – Lesson 12: EQUATION, INEQUALITY AND GRAPH (समीकरण, असमानता र ग्राफ)
 * Simulation 1: Linear Equation Discovery Playground (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 168-173)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Scale, ShoppingBag, Table, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'हरिले x केजी आलु र गीताले y केजी प्याज किन्दा जम्मा तौल ३० केजी (x + y = ३०) भयो। यदि x = २० भए y को मान कति हुन्छ?',
    en: 'Hari buys x kg potatoes and Gita buys y kg onions totaling 30 kg (x + y = 30). If x = 20, what is y?',
    options: [
      { key: 'A', label: '१० केजी (y = ३० - २० = १०)' },
      { key: 'B', label: '२० केजी' },
      { key: 'C', label: '१५ केजी' },
      { key: 'D', label: '५० केजी' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा कक्षामा रातो कलम x वटा र कालो कलम y वटा गरी जम्मा १७ वटा कलम छन्। यसको समीकरण कुन हो?',
    en: 'There are x red pens and y black pens totaling 17 pens. Which equation represents this?',
    options: [
      { key: 'A', label: 'x + y = १७' },
      { key: 'B', label: 'x - y = १७' },
      { key: 'C', label: 'xy = १७' },
      { key: 'D', label: 'x/y = १७' },
    ],
    answer: 'A',
  },
  {
    np: 'समीकरण x + y = ११ मा यदि x = ४ भए y को मान कति हुन्छ?',
    en: 'In equation x + y = 11, if x = 4, what is the value of y?',
    options: [
      { key: 'A', label: '७ (४ + ७ = ११)' },
      { key: 'B', label: '१५' },
      { key: 'C', label: '४' },
      { key: 'D', label: '८' },
    ],
    answer: 'A',
  },
  {
    np: 'दुई चलयुक्त रेखीय समीकरण (Linear Equation in Two Variables) को सामान्य रूप कुन हो?',
    en: 'What is the standard form of a linear equation in two variables?',
    options: [
      { key: 'A', label: 'ax + by + c = ० (जहाँ a, b दुवै शून्य होइनन्)' },
      { key: 'B', label: 'ax² + bx + c = ०' },
      { key: 'C', label: 'x/y = c' },
      { key: 'D', label: 'a + b = c' },
    ],
    answer: 'A',
  },
];

export const LinearEquationPlayground: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L12-01',
    titleEn: 'Linear Equation Discovery Playground',
    titleNp: 'रेखीय समीकरण खोजी मैदान',
    chapter: 12,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'baskets' | 'pens' | 'table-pairs'>('baskets');

  // Tab 1: Hari and Gita Vegetables (x + y = 30)
  const totalVegKg = 30;
  const [potatoKg, setPotatoKg] = useState<number>(20);
  const onionKg = Math.max(0, totalVegKg - potatoKg);

  // Tab 2: Red and Black Pens (x + y = 17)
  const totalPens = 17;
  const [redPens, setRedPens] = useState<number>(9);
  const blackPens = Math.max(0, totalPens - redPens);

  // Tab 3: Table of values (x + y = 11)
  const [targetX, setTargetX] = useState<number>(4);
  const targetY = 11 - targetX;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'दैनिक जीवनका दुई अज्ञात परिमाणहरूलाई x र y मानेर रेखीय समीकरण (x + y = c) बनाउन सकिन्छ!',
        'Real-world unknown quantities can be modeled with two variables as linear equations: x + y = c!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'baskets', np: '१. तरकारीको तौल (x + y = 30)', en: '1. Vegetables (x+y=30)' },
            { id: 'pens', np: '२. कलम सङ्ख्या (x + y = 17)', en: '2. Pens (x+y=17)' },
            { id: 'table-pairs', np: '३. मान तालिका (x + y = 11)', en: '3. Table of Values' },
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

        {/* TAB 1: Vegetables x + y = 30 */}
        {activeTab === 'baskets' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('हरि र गीताको तरकारी: x + y = ३० केजी', 'Vegetables Weight: x + y = 30 kg')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: हरिले x केजी आलु र गीताले y केजी प्याज किन्दा जम्मा तौल ३० केजी भयो। आलुको तौल बदल्दा प्याजको तौल हेर्नुहोस्:',
                'Textbook Example: Hari buys x kg potatoes and Gita buys y kg onions totaling 30 kg. Adjust x to see y:'
              )}
            </p>

            <div style={{ margin: '16px 0' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#92400E', display: 'block', marginBottom: 4 }}>
                {L('आलुको तौल (x): ', 'Potatoes (x): ')} {potatoKg} kg
              </label>
              <input
                type="range"
                min={0}
                max={30}
                value={potatoKg}
                onChange={(e) => {
                  kit.tap();
                  setPotatoKg(parseInt(e.target.value));
                }}
                style={{ width: 220 }}
              />
            </div>

            {/* Visual Baskets Representation */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                margin: '16px 0',
              }}
            >
              <div style={{ background: '#FEF3C7', padding: 16, borderRadius: 10, border: '2px solid #FCD34D' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>
                  🥔 {L('आलुको टोकरी (x)', 'Potatoes Basket (x)')}
                </span>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#92400E', marginTop: 4 }}>
                  x = {potatoKg} kg
                </div>
              </div>

              <div style={{ background: '#FCE7F3', padding: 16, borderRadius: 10, border: '2px solid #F472B6' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#BE185D' }}>
                  🧅 {L('प्याजको टोकरी (y)', 'Onions Basket (y)')}
                </span>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#9D174D', marginTop: 4 }}>
                  y = {onionKg} kg
                </div>
                <div style={{ fontSize: 12, color: '#831843', marginTop: 2 }}>
                  y = ३० - {potatoKg} = {onionKg}
                </div>
              </div>
            </div>

            {/* Equation Badge */}
            <div
              style={{
                background: '#ECFDF5',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #6EE7B7',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, color: '#065F46', fontWeight: 700 }}>
                {L('समीकरण सन्तुष्टि (Equation Verified)', 'Equation Verified')}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                {potatoKg} + {onionKg} = ३० kg
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Red and Black Pens */}
        {activeTab === 'pens' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('रातो र कालो कलम: x + y = १७', 'Red & Black Pens: x + y = 17')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: जम्मा १७ वटा कलममा रातो कलम x र कालो कलम y वटा छन्:',
                'Textbook Example: Total 17 pens consisting of x red pens and y black pens:'
              )}
            </p>

            <div style={{ margin: '16px 0' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', display: 'block', marginBottom: 4 }}>
                {L('रातो कलम (x): ', 'Red Pens (x): ')} {redPens} वटा
              </label>
              <input
                type="range"
                min={0}
                max={17}
                value={redPens}
                onChange={(e) => {
                  kit.tap();
                  setRedPens(parseInt(e.target.value));
                }}
                style={{ width: 220 }}
              />
            </div>

            {/* Calculations Card */}
            <div
              style={{
                background: '#F8FAFC',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('समीकरण:', 'Equation:')}</strong> x + y = १७
              </div>
              <div>
                <strong>{L('y को मान निकाल्दा:', 'Solving for y:')}</strong> y = १७ - x = १७ - {redPens} ={' '}
                <span style={{ fontWeight: 800, color: '#1E293B' }}>{blackPens} कालो कलम</span>
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                ({redPens}, {blackPens}) {L('क्रमित युग्म (Ordered Pair)', 'Ordered Pair')}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Table of Values x + y = 11 */}
        {activeTab === 'table-pairs' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('समीकरणको मान तालिका (Table of Values: x + y = 11)', 'Table of Values: x + y = 11')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ १७१ अनुसार: x + y = ११ का विभिन्न क्रमित युग्म (x, y) हरू:',
                'Textbook Page 171: Ordered pairs (x, y) satisfying x + y = 11:'
              )}
            </p>

            <div style={{ overflowX: 'auto', margin: '16px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9' }}>
                    <th style={{ padding: 10, border: '1px solid #CBD5E1' }}>x</th>
                    <th style={{ padding: 10, border: '1px solid #CBD5E1' }}>y = 11 - x</th>
                    <th style={{ padding: 10, border: '1px solid #CBD5E1' }}>{L('क्रमित युग्म (x, y)', 'Ordered Pair')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 2, 4, 6, 8, 11].map((val) => (
                    <tr
                      key={val}
                      style={{
                        background: val === targetX ? '#ECFDF5' : '#FFF',
                        fontWeight: val === targetX ? 800 : 400,
                      }}
                    >
                      <td style={{ padding: 8, border: '1px solid #CBD5E1' }}>{val}</td>
                      <td style={{ padding: 8, border: '1px solid #CBD5E1' }}>{11 - val}</td>
                      <td style={{ padding: 8, border: '1px solid #CBD5E1', color: '#059669' }}>
                        ({val}, {11 - val})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default LinearEquationPlayground;
