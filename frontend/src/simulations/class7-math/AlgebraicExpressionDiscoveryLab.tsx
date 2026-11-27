/**
 * AlgebraicExpressionDiscoveryLab.tsx
 * Grade 7 Mathematics – Lesson 11: ALGEBRAIC EXPRESSION (बीजगणितीय व्यञ्जक)
 * Simulation 1: Algebraic Expression Discovery Lab (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 144-149)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Box, Layers, Plus, Minus, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'बीजगणितीय व्यञ्जक ३x + ९ मा चल (Variable), अचर (Constant) र गुणांक (Coefficient) कुन-कुन हुन्?',
    en: 'In algebraic expression 3x + 9, which are the variable, constant, and coefficient?',
    options: [
      { key: 'A', label: 'चल = x, अचर = ९, गुणांक = ३ (Variable = x, Constant = 9, Coefficient = 3)' },
      { key: 'B', label: 'चल = ३, अचर = x, गुणांक = ९' },
      { key: 'C', label: 'चल = ९, अचर = ३, गुणांक = x' },
      { key: 'D', label: 'सबै अचर हुन्' },
    ],
    answer: 'A',
  },
  {
    np: 'सजातीय पद (Like terms) भनेको कस्ता पदहरू हुन्?',
    en: 'What are like terms?',
    options: [
      { key: 'A', label: 'एउटै चल र चलको घात पनि एउटै भएका पदहरू (Same variable and same power)' },
      { key: 'B', label: 'एउटै गुणांक भएका पदहरू' },
      { key: 'C', label: 'फरक चल भएका पदहरू' },
      { key: 'D', label: 'अचर सङ्ख्याहरू मात्र' },
    ],
    answer: 'A',
  },
  {
    np: '३x, ७x, ५y, २x² र ९ मध्ये सजातीय पदहरूको जोडी कुन हो?',
    en: 'Among 3x, 7x, 5y, 2x², and 9, which pair is like terms?',
    options: [
      { key: 'A', label: '३x र ७x (3x and 7x)' },
      { key: 'B', label: '३x र २x²' },
      { key: 'C', label: '७x र ५y' },
      { key: 'D', label: '५y र ९' },
    ],
    answer: 'A',
  },
  {
    np: '३x + ५x लाई जोड्दा कति हुन्छ?',
    en: 'What is 3x + 5x?',
    options: [
      { key: 'A', label: '८x (गुणांक जोडिन्छ: ३ + ५ = ८)' },
      { key: 'B', label: '८x²' },
      { key: 'C', label: '१५x' },
      { key: 'D', label: '१५x²' },
    ],
    answer: 'A',
  },
];

export const AlgebraicExpressionDiscoveryLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L11-01',
    titleEn: 'Algebraic Expression Discovery Lab',
    titleNp: 'बीजगणितीय व्यञ्जक खोजी प्रयोगशाला',
    chapter: 11,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'parts' | 'like-terms' | 'tiles'>('parts');

  // Tab 1: 3x + 9 Component inspector
  const [selectedComponent, setSelectedComponent] = useState<'coeff' | 'var' | 'const' | 'terms'>('coeff');

  // Tab 2: Like terms grouping
  const [likeGroupFilter, setLikeGroupFilter] = useState<'all' | 'x' | 'x2' | 'y' | 'const'>('all');

  // Tab 3: Algebra tiles (3x + 5x)
  const [tileX1, setTileX1] = useState<number>(3);
  const [tileX2, setTileX2] = useState<number>(5);
  const sumTileX = tileX1 + tileX2;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'बीजगणितमा x, y जस्ता मान बदलिने प्रतीकलाई चल (Variable) र निश्चित मानलाई अचर (Constant) भनिन्छ। सजातीय पदहरू मात्र जोड्न र घटाउन सकिन्छ!',
        'In algebra, letters like x are Variables and fixed numbers are Constants. Only like terms can be added or subtracted!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'parts', np: '१. व्यञ्जकका अङ्गहरू (Parts of Expression)', en: '1. Expression Parts' },
            { id: 'like-terms', np: '२. सजातीय र विजातीय पद (Like/Unlike Terms)', en: '2. Like & Unlike Terms' },
            { id: 'tiles', np: '३. अल्जेब्रा टायलबाट जोड (Algebra Tiles Addition)', en: '3. Algebra Tiles' },
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

        {/* TAB 1: Parts of Expression */}
        {activeTab === 'parts' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('व्यञ्जकका अङ्गहरू: ३x + ९ (Parts of 3x + 9)', 'Parts of Expression: 3x + 9')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'तलको व्यञ्जकमा ३x र ९ दुई पदहरू हुन्। फरक-फरक भाग थिचेर तिनीहरूको भूमिका बुझ्नुहोस्:',
                'Click parts of the expression 3x + 9 to explore their roles:'
              )}
            </p>

            {/* Interactive Visual Expression Banner */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 16,
                padding: '28px 0',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                margin: '16px 0',
              }}
            >
              <button
                onClick={() => {
                  kit.tap();
                  setSelectedComponent('coeff');
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: selectedComponent === 'coeff' ? '3px solid #0369A1' : '1px solid #CBD5E1',
                  background: selectedComponent === 'coeff' ? '#BAE6FD' : '#FFF',
                  fontSize: 32,
                  fontWeight: 900,
                  color: '#0369A1',
                  cursor: 'pointer',
                }}
              >
                ३
              </button>

              <button
                onClick={() => {
                  kit.tap();
                  setSelectedComponent('var');
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: selectedComponent === 'var' ? '3px solid #15803D' : '1px solid #CBD5E1',
                  background: selectedComponent === 'var' ? '#BBF7D0' : '#FFF',
                  fontSize: 32,
                  fontWeight: 900,
                  color: '#15803D',
                  cursor: 'pointer',
                }}
              >
                x
              </button>

              <span style={{ fontSize: 32, fontWeight: 900, color: '#64748B' }}>+</span>

              <button
                onClick={() => {
                  kit.tap();
                  setSelectedComponent('const');
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: selectedComponent === 'const' ? '3px solid #D97706' : '1px solid #CBD5E1',
                  background: selectedComponent === 'const' ? '#FDE68A' : '#FFF',
                  fontSize: 32,
                  fontWeight: 900,
                  color: '#D97706',
                  cursor: 'pointer',
                }}
              >
                ९
              </button>
            </div>

            {/* Explanation Card */}
            <div
              style={{
                background: '#F0FDF4',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #BBF7D0',
                lineHeight: 1.8,
              }}
            >
              {selectedComponent === 'coeff' && (
                <div>
                  <h4 style={{ margin: '0 0 6px 0', color: '#0369A1' }}>
                    ३ = {L('गुणांक (Coefficient)', 'Coefficient')}
                  </h4>
                  <p style={{ margin: 0, fontSize: 14, color: '#0C4A6E' }}>
                    {L(
                      'चल x को अगाडि गुणनको रूपमा आएको स्थिर सङ्ख्या ३ लाई गुणांक भनिन्छ। यसले x कति पटक आएको छ भन्ने जनाउँछ।',
                      'The numerical multiplier 3 in front of variable x is the coefficient.'
                    )}
                  </p>
                </div>
              )}

              {selectedComponent === 'var' && (
                <div>
                  <h4 style={{ margin: '0 0 6px 0', color: '#15803D' }}>
                    x = {L('चल (Variable)', 'Variable')}
                  </h4>
                  <p style={{ margin: 0, fontSize: 14, color: '#14532D' }}>
                    {L(
                      'परिस्थिति अनुसार मान बदलिने अज्ञात प्रतीकलाई चल भनिन्छ। यहाँ x को मान १, २, ३ वा कुनै पनि सङ्ख्या हुन सक्छ।',
                      'A letter whose value can vary. Here x can represent any value.'
                    )}
                  </p>
                </div>
              )}

              {selectedComponent === 'const' && (
                <div>
                  <h4 style={{ margin: '0 0 6px 0', color: '#D97706' }}>
                    ९ = {L('अचर (Constant)', 'Constant')}
                  </h4>
                  <p style={{ margin: 0, fontSize: 14, color: '#78350F' }}>
                    {L(
                      'निश्चित मान भएको र कहिल्यै नबदलिने सङ्ख्या ९ लाई अचर भनिन्छ।',
                      'A fixed numerical quantity whose value never changes.'
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Like & Unlike Terms */}
        {activeTab === 'like-terms' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('सजातीय र विजातीय पदहरू (Like and Unlike Terms)', 'Like and Unlike Terms')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक सूची: ३x, ७x, ५y, २x², ९, ४x, १२y। समान चल र समान घात भएका पदहरू सजातीय पद हुन्:',
                'Terms with the same variable and same power are like terms:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '14px 0' }}>
              {[
                { id: 'all', label: 'सबै पदहरू (All)' },
                { id: 'x', label: 'x का सजातीय पदहरू (३x, ७x, ४x)' },
                { id: 'y', label: 'y का सजातीय पदहरू (५y, १२y)' },
                { id: 'x2', label: 'x² पद (२x²)' },
                { id: 'const', label: 'अचर पद (९)' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    kit.tap();
                    setLikeGroupFilter(filter.id as any);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: likeGroupFilter === filter.id ? '#187C68' : '#F1F5F9',
                    color: likeGroupFilter === filter.id ? '#FFF' : '#334155',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Displaying categorized terms */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                marginTop: 16,
              }}
            >
              <div style={{ background: '#EFF6FF', padding: 16, borderRadius: 10, border: '2px solid #93C5FD' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8' }}>
                  {L('x का सजातीय पदहरू (Like terms with x)', 'Like terms with x')}
                </span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1E40AF', marginTop: 6 }}>
                  ३x, ७x, ४x
                </div>
                <div style={{ fontSize: 12, color: '#1E3A8A', marginTop: 4 }}>
                  {L('चल x र घात १ दुवै समान छन्, त्यसैले जोड्न/घटाउन सकिन्छ', 'Same variable x^1')}
                </div>
              </div>

              <div style={{ background: '#F0FDF4', padding: 16, borderRadius: 10, border: '2px solid #86EFAC' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                  {L('y का सजातीय पदहरू (Like terms with y)', 'Like terms with y')}
                </span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#16A34A', marginTop: 6 }}>
                  ५y, १२y
                </div>
                <div style={{ fontSize: 12, color: '#14532D', marginTop: 4 }}>
                  {L('चल y र घात १ समान छन्', 'Same variable y^1')}
                </div>
              </div>

              <div style={{ background: '#FEF2F2', padding: 16, borderRadius: 10, border: '2px solid #FCA5A5' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>
                  {L('विजातीय पद (२x² र ३x किन विजातीय?)', 'Why are 2x² and 3x unlike?')}
                </span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#B91C1C', marginTop: 6 }}>
                  २x² र ३x विजातीय हुन्
                </div>
                <div style={{ fontSize: 12, color: '#991B1B', marginTop: 4 }}>
                  {L('चल x भए पनि २x² मा घात २ छ र ३x मा घात १ छ, घात फरक भएकाले विजातीय हुन्!', 'Powers differ (x² vs x¹)!')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Algebra Tiles Addition */}
        {activeTab === 'tiles' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('अल्जेब्रा टायलद्वारा सजातीय पदहरूको जोड (३x + ५x = ८x)', 'Algebra Tiles Addition')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: ३ वटा x टायल र ५ वटा x टायल मिलाउँदा जम्मा ८ वटा x टायल बन्दछन्:',
                'Textbook Example: Combining 3 x-tiles and 5 x-tiles yields 8 x-tiles:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  पहिलो समूह x: {tileX1} वटा
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={tileX1}
                  onChange={(e) => {
                    kit.tap();
                    setTileX1(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  दोस्रो समूह x: {tileX2} वटा
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={tileX2}
                  onChange={(e) => {
                    kit.tap();
                    setTileX2(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Visual Tiles Area */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
                padding: 16,
                background: '#F8FAFC',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                margin: '16px 0',
              }}
            >
              {Array.from({ length: tileX1 }).map((_, i) => (
                <div
                  key={`t1-${i}`}
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: 4,
                    background: '#38BDF8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  x
                </div>
              ))}

              <span style={{ fontSize: 22, fontWeight: 800, color: '#94A3B8', margin: '0 4px' }}>+</span>

              {Array.from({ length: tileX2 }).map((_, i) => (
                <div
                  key={`t2-${i}`}
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: 4,
                    background: '#34D399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  x
                </div>
              ))}
            </div>

            {/* Calculations Card */}
            <div
              style={{
                background: '#ECFDF5',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #6EE7B7',
                lineHeight: 1.8,
              }}
            >
              <div>
                <strong>{L('सजातीय पदहरूको जोड:', 'Addition of Like Terms:')}</strong> {tileX1}x + {tileX2}x = (
                {tileX1} + {tileX2})x
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#065F46',
                }}
              >
                = {sumTileX}x
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default AlgebraicExpressionDiscoveryLab;
