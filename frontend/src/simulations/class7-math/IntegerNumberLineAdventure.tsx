/**
 * IntegerNumberLineAdventure.tsx
 * Grade 7 Mathematics – Lesson 3: INTEGER
 * Simulation 1: Integer Number Line Adventure (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 45-50)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { ArrowLeft, ArrowRight, RotateCcw, Check, Sparkles, HelpCircle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'सङ्ख्या रेखामा शून्य (0) भन्दा दायाँतर्फ कस्ता सङ्ख्याहरू हुन्छन्?',
    en: 'What kind of numbers are located to the right of zero (0) on a number line?',
    options: [
      { key: 'A', label: 'Positive integers' },
      { key: 'B', label: 'Negative integers' },
      { key: 'C', label: 'Decimals only' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'A',
  },
  {
    np: '-5 को विपरीत पूर्णाङ्क (Opposite Integer) कुन हो?',
    en: 'What is the opposite integer of -5?',
    options: [
      { key: 'A', label: '-5' },
      { key: 'B', label: '+5' },
      { key: 'C', label: '0' },
      { key: 'D', label: '10' },
    ],
    answer: 'B',
  },
  {
    np: '|-7| को निरपेक्ष मान (Absolute Value) कति हुन्छ?',
    en: 'What is the absolute value of |-7|?',
    options: [
      { key: 'A', label: '-7' },
      { key: 'B', label: '0' },
      { key: 'C', label: '+7' },
      { key: 'D', label: '14' },
    ],
    answer: 'C',
  },
  {
    np: '-2 बाट 5 एकाइ दायाँतर्फ सर्दा कुन पूर्णाङ्कमा पुगिन्छ?',
    en: 'Moving 5 units right from -2 lands on which integer?',
    options: [
      { key: 'A', label: '-7' },
      { key: 'B', label: '+3 (-2 + 5 = 3)' },
      { key: 'C', label: '+2' },
      { key: 'D', label: '+5' },
    ],
    answer: 'B',
  },
];

export const IntegerNumberLineAdventure: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L3-01',
    titleEn: 'Integer Number Line Adventure',
    titleNp: 'पूर्णाङ्क सङ्ख्यारेखा यात्रा',
    chapter: 3,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'explore' | 'move' | 'opposite' | 'absolute'>('explore');

  // State for character position on number line (-10 to +10)
  const [currentPos, setCurrentPos] = useState<number>(0);

  const movePosition = (steps: number) => {
    kit.tap();
    const newPos = Math.max(-10, Math.min(10, currentPos + steps));
    setCurrentPos(newPos);
  };

  const setPosDirect = (pos: number) => {
    kit.tap();
    setCurrentPos(pos);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'सङ्ख्या रेखामा शून्यभन्दा दायाँ धनात्मक र बायाँ ऋणात्मक पूर्णाङ्क हुन्छन्। दायाँ सर्दा सङ्ख्या बढ्छ, बायाँ सर्दा घट्छ!',
        'On a number line, positive integers lie to the right of zero, negative to the left. Moving right increases the value!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'explore', np: '1. सङ्ख्यारेखा अन्वेषण', en: '1. Explore Number Line' },
            { id: 'move', np: '2. दायाँ र बायाँ चाल (Movement)', en: '2. Left & Right Movement' },
            { id: 'opposite', np: '3. विपरीत पूर्णाङ्क (Opposite)', en: '3. Opposite Integers' },
            { id: 'absolute', np: '4. निरपेक्ष मान (|x| Absolute Value)', en: '4. Absolute Value (|x|)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                kit.tap();
                setActiveTab(tab.id as any);
              }}
              style={{
                flex: '1 1 auto',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? '#0F766E' : '#F8FAFC',
                color: activeTab === tab.id ? '#FFFFFF' : '#334155',
                transition: 'all 0.15s ease',
              }}
            >
              {isNe ? tab.np : tab.en}
            </button>
          ))}
        </div>

        {/* ── SHARED INTERACTIVE 2D NUMBER LINE ────────────── */}
        <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
                {L('सङ्ख्या रेखा (-10 देखि +10)', 'Number Line (-10 to +10)')}
              </span>
              <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                {L('स्थान:', 'Position:')}{' '}
                <strong style={{ color: currentPos > 0 ? '#16A34A' : currentPos < 0 ? '#DC2626' : '#0F766E' }}>
                  {currentPos > 0 ? `+${isNe ? toNp(currentPos) : currentPos}` : isNe ? toNp(currentPos) : currentPos}
                </strong>
              </h3>
            </div>
            <button
              onClick={() => setPosDirect(0)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} /> {L('शून्य (0) मा फर्कनुहोस्', 'Reset to 0')}
            </button>
          </div>

          {/* Number Line Visual Track */}
          <div style={{ overflowX: 'auto', padding: '24px 8px', margin: '16px 0' }}>
            <div style={{ minWidth: 720, position: 'relative', height: 90, display: 'flex', alignItems: 'center' }}>
              {/* Main horizontal line */}
              <div style={{ position: 'absolute', top: 40, left: 20, right: 20, height: 4, background: '#334155', borderRadius: 2 }} />

              {/* Tick Marks & Labels */}
              {Array.from({ length: 21 }, (_, idx) => idx - 10).map((num) => {
                const isSelected = num === currentPos;
                const isOrigin = num === 0;
                return (
                  <div
                    key={num}
                    onClick={() => setPosDirect(num)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      zIndex: 2,
                    }}
                  >
                    {/* Selected Marker */}
                    <div style={{ height: 26, display: 'flex', alignItems: 'center' }}>
                      {isSelected && (
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: num > 0 ? '#16A34A' : num < 0 ? '#DC2626' : '#0F766E',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 900,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            animation: 'bounce 0.3s ease',
                          }}
                        >
                          ●
                        </div>
                      )}
                    </div>

                    {/* Tick Mark */}
                    <div
                      style={{
                        width: isOrigin ? 3 : 2,
                        height: isOrigin ? 18 : 12,
                        background: isOrigin ? '#0F766E' : '#64748B',
                      }}
                    />

                    {/* Number label */}
                    <span
                      style={{
                        marginTop: 6,
                        fontSize: isOrigin || isSelected ? 13 : 11,
                        fontWeight: isOrigin || isSelected ? 900 : 700,
                        color: isSelected
                          ? num > 0
                            ? '#16A34A'
                            : num < 0
                            ? '#DC2626'
                            : '#0F766E'
                          : isOrigin
                          ? '#0F766E'
                          : '#475569',
                      }}
                    >
                      {num > 0 ? `+${isNe ? toNp(num) : num}` : isNe ? toNp(num) : num}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick controls to step left / right */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => movePosition(-3)}
              style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FEE2E2', color: '#DC2626', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
            >
              ← 3 units left (-3)
            </button>
            <button
              onClick={() => movePosition(-1)}
              style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FEE2E2', color: '#DC2626', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
            >
              ← 1 unit left (-1)
            </button>
            <button
              onClick={() => movePosition(1)}
              style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
            >
              1 unit right (+1) →
            </button>
            <button
              onClick={() => movePosition(3)}
              style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
            >
              3 units right (+3) →
            </button>
          </div>
        </div>

        {/* ── TAB DETAILS ─────────────────────────────────── */}
        {activeTab === 'explore' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 900, color: '#0F172A' }}>
              {L('सङ्ख्या रेखामा छानिएको पूर्णाङ्कको विशेषता:', 'Properties of the Selected Integer on Number Line:')}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>{L('प्रकार (Type):', 'Type:')}</span>
                <div style={{ fontSize: 15, fontWeight: 900, color: currentPos > 0 ? '#16A34A' : currentPos < 0 ? '#DC2626' : '#0F766E', marginTop: 2 }}>
                  {currentPos > 0 ? L('धनात्मक पूर्णाङ्क (Positive)', 'Positive Integer') : currentPos < 0 ? L('ऋणात्मक पूर्णाङ्क (Negative)', 'Negative Integer') : L('शून्य (Zero - Origin)', 'Zero - Origin')}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>{L('शून्यबाट दुरी (Distance from 0):', 'Distance from 0:')}</span>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', marginTop: 2 }}>
                  {isNe ? toNp(Math.abs(currentPos)) : Math.abs(currentPos)} {L('एकाइ (Units)', 'Units')}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>{L('विपरीत सङ्ख्या (Opposite):', 'Opposite:')}</span>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0F766E', marginTop: 2 }}>
                  {currentPos === 0 ? '0' : currentPos > 0 ? `-${isNe ? toNp(currentPos) : currentPos}` : `+${isNe ? toNp(Math.abs(currentPos)) : Math.abs(currentPos)}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'opposite' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 900, color: '#0F172A' }}>
              {L('विपरीत पूर्णाङ्क (Opposite Integers):', 'Opposite Integers:')}
            </h4>
            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px', lineHeight: 1.6 }}>
              {L(
                'शून्यबाट बराबर दुरीमा विपरित दिशातर्फ रहेका पूर्णाङ्कहरूलाई एक अर्काका विपरीत पूर्णाङ्क भनिन्छ। दुई विपरीत पूर्णाङ्कहरूको जोड सधैं शून्य हुन्छ: a + (-a) = 0।',
                'Integers that are at equal distances from zero in opposite directions are called opposite integers. Their sum is always zero: a + (-a) = 0.'
              )}
            </p>
            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 14, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0F766E' }}>
                ({currentPos > 0 ? `+${isNe ? toNp(currentPos) : currentPos}` : isNe ? toNp(currentPos) : currentPos}) + ({currentPos > 0 ? `-${isNe ? toNp(currentPos) : currentPos}` : `+${isNe ? toNp(Math.abs(currentPos)) : Math.abs(currentPos)}`}) = 0
              </div>
            </div>
          </div>
        )}

        {activeTab === 'absolute' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 900, color: '#0F172A' }}>
              {L('निरपेक्ष मान (Absolute Value):', 'Absolute Value:')}
            </h4>
            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px', lineHeight: 1.6 }}>
              {L(
                'कुनै पनि पूर्णाङ्कको सङ्ख्या रेखामा शून्यबाट भएको वास्तविक दुरीलाई त्यसको निरपेक्ष मान भनिन्छ। दुरी कहिल्यै ऋणात्मक हुँदैन, त्यसैले निरपेक्ष मान सधैं अऋणात्मक (Non-negative) हुन्छ।',
                'The distance of any integer from zero on the number line is its absolute value. Distance is never negative, so absolute value is always non-negative.'
              )}
            </p>
            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 14, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0F766E' }}>
                |{currentPos > 0 ? `+${isNe ? toNp(currentPos) : currentPos}` : isNe ? toNp(currentPos) : currentPos}| = {isNe ? toNp(Math.abs(currentPos)) : Math.abs(currentPos)}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default IntegerNumberLineAdventure;
