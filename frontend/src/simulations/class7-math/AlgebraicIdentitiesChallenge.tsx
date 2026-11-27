/**
 * AlgebraicIdentitiesChallenge.tsx
 * Grade 7 Mathematics – Lesson 11: ALGEBRAIC EXPRESSION
 * Simulation 5: Algebraic Identities & Simplification Challenge (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 164-167)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Award, CheckCircle, HelpCircle, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: '(2a + b)² - (2a - b)² लाई सर्वसमिका प्रयोग गरी सरल गर्दा कति प्राप्त हुन्छ?',
    en: 'Simplifying (2a + b)² - (2a - b)² using identities yields:',
    options: [
      { key: 'A', label: '8ab [ (4a² + 4ab + b²) - (4a² - 4ab + b²) = 8ab ]' },
      { key: 'B', label: '4ab' },
      { key: 'C', label: '8a² + 2b²' },
      { key: 'D', label: '0' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि a + b = 8 र ab = 12 भए a² + b² को मान कति हुन्छ?',
    en: 'If a + b = 8 and ab = 12, what is the value of a² + b²?',
    options: [
      { key: 'A', label: '40 [ (a + b)² - 2ab = 8² - 2(12) = 64 - 24 = 40 ]' },
      { key: 'B', label: '52' },
      { key: 'C', label: '64' },
      { key: 'D', label: '48' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि x + 1/x = 4 भए x² + 1/x² को मान कति हुन्छ?',
    en: 'If x + 1/x = 4, what is the value of x² + 1/x²?',
    options: [
      { key: 'A', label: '14 [ (x + 1/x)² - 2 = 4² - 2 = 16 - 2 = 14 ]' },
      { key: 'B', label: '16' },
      { key: 'C', label: '18' },
      { key: 'D', label: '12' },
    ],
    answer: 'A',
  },
  {
    np: 'त्रिपदीय सर्वसमिका (a + b + c)² को सही विस्तार कुन हो?',
    en: 'What is the correct expansion of trinomial square (a + b + c)²?',
    options: [
      { key: 'A', label: 'a² + b² + c² + 2ab + 2bc + 2ca' },
      { key: 'B', label: 'a² + b² + c² + 3abc' },
      { key: 'C', label: 'a² + b² + c²' },
      { key: 'D', label: 'a² + b² + c² + ab + bc + ca' },
    ],
    answer: 'A',
  },
];

export const AlgebraicIdentitiesChallenge: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L11-05',
    titleEn: 'Algebraic Identities & Simplification Challenge',
    titleNp: 'सर्वसमिका प्रयोग र सरलीकरण चुनौती',
    chapter: 11,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'expand' | 'simplify' | 'sum-prod' | 'reciprocal'>('simplify');

  // Case 3: a + b = 8, ab = 12
  const [sumAB, setSumAB] = useState<number>(8);
  const [prodAB, setProdAB] = useState<number>(12);
  const a2b2Val = sumAB * sumAB - 2 * prodAB;

  // Case 4: x + 1/x = 4
  const [valXPlusInv, setValXPlusInv] = useState<number>(4);
  const x2PlusInv2 = valXPlusInv * valXPlusInv - 2;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'सर्वसमिका प्रयोग गरी ठूला हिसाबहरू चुट्कीमा हल हुन्छन्: a² + b² = (a+b)² - 2ab र (x + 1/x)² - 2 = x² + 1/x²!',
        'Use identities for quick simplification: a² + b² = (a+b)² - 2ab and (x + 1/x)² - 2 = x² + 1/x²!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'simplify', np: '1. सर्वसमिका सरलीकरण (2a+b)² - (2a-b)²', en: '1. Simplification' },
            { id: 'sum-prod', np: '2. योगफल र गुणनफलबाट a² + b²', en: '2. Sum & Product' },
            { id: 'reciprocal', np: '3. व्युत्क्रम पद x² + 1/x²', en: '3. Reciprocal Identity' },
            { id: 'expand', np: '4. त्रिपदीय विस्तार (a + b + c)²', en: '4. Trinomial Square' },
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

        {/* TAB 1: Simplification (2a+b)^2 - (2a-b)^2 */}
        {activeTab === 'simplify' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('सर्वसमिका प्रयोग गरी सरलीकरण (Simplification using Identities)', 'Simplification using Identities')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: (2a + b)² - (2a - b)² लाई सर्वसमिका प्रयोग गरी सरल गर्नुहोस्:',
                'Textbook Example: Simplify (2a + b)² - (2a - b)² using identities:'
              )}
            </p>

            <div
              style={{
                background: '#F0FDF4',
                padding: 18,
                borderRadius: 10,
                border: '1px solid #BBF7D0',
                lineHeight: 2,
                margin: '16px 0',
              }}
            >
              <div>
                <strong>{L('1. दिइएको:', '1. Given:')}</strong> (2a + b)² - (2a - b)²
              </div>
              <div>
                <strong>{L('2. पहिलो पद विस्तार:', '2. Expand 1st term:')}</strong> (2a)² + 2(2a)(b) + b² = 4a² + 4ab + b²
              </div>
              <div>
                <strong>{L('3. दोस्रो पद विस्तार:', '3. Expand 2nd term:')}</strong> (2a)² - 2(2a)(b) + b² = 4a² - 4ab + b²
              </div>
              <div>
                <strong>{L('4. घटाउँदा (चिन्ह परिवर्तन):', '4. Subtracting:')}</strong> [ 4a² + 4ab + b² ] - [ 4a² - 4ab + b² ]
                <br />= 4a² + 4ab + b² - 4a² + 4ab - b²
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#166534',
                }}
              >
                = 8ab
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Given Sum and Product */}
        {activeTab === 'sum-prod' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('योगफल र गुणनफल दिइएको बेला a² + b² पत्ता लगाउने', 'Finding a² + b² given Sum and Product')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: यदि a + b = 8 र ab = 12 भए a² + b² को मान निकाल्नुहोस्:',
                'Textbook Example: If a + b = 8 and ab = 12, find a² + b²:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  Sum (a + b): {sumAB}
                </label>
                <input
                  type="range"
                  min={4}
                  max={15}
                  value={sumAB}
                  onChange={(e) => {
                    kit.tap();
                    setSumAB(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  Product (ab): {prodAB}
                </label>
                <input
                  type="range"
                  min={2}
                  max={25}
                  value={prodAB}
                  onChange={(e) => {
                    kit.tap();
                    setProdAB(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div
              style={{
                background: '#EEF2FF',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #C7D2FE',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('1. मूल सर्वसमिका:', '1. Fundamental Identity:')}</strong> (a + b)² = a² + 2ab + b²
              </div>
              <div>
                <strong>{L('2. पक्षान्तर गर्दा:', '2. Rearranging:')}</strong> a² + b² = (a + b)² - 2ab
              </div>
              <div>
                <strong>{L('3. मान राख्दा:', '3. Substituting values:')}</strong> a² + b² = ({sumAB})² - 2({prodAB})
                <br />= {sumAB * sumAB} - {2 * prodAB}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#3730A3',
                }}
              >
                a² + b² = {a2b2Val}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Reciprocal Identity */}
        {activeTab === 'reciprocal' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('व्युत्क्रम पदको सर्वसमिका (Reciprocal Identity: x² + 1/x²)', 'Reciprocal Identity')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: यदि x + 1/x = 4 भए x² + 1/x² को मान कति हुन्छ?',
                'Textbook Example: If x + 1/x = 4, find the value of x² + 1/x²:'
              )}
            </p>

            <div style={{ margin: '16px 0' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                x + 1/x = {valXPlusInv}
              </label>
              <input
                type="range"
                min={2}
                max={10}
                value={valXPlusInv}
                onChange={(e) => {
                  kit.tap();
                  setValXPlusInv(parseInt(e.target.value));
                }}
                style={{ width: 200 }}
              />
            </div>

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
                <strong>{L('1. दुवैतर्फ वर्ग गर्दा:', '1. Squaring both sides:')}</strong> (x + 1/x)² = ({valXPlusInv})²
              </div>
              <div>
                x² + 2(x)(1/x) + (1/x)² = {valXPlusInv * valXPlusInv}
              </div>
              <div>
                x² + 2 + 1/x² = {valXPlusInv * valXPlusInv}
              </div>
              <div>
                x² + 1/x² = {valXPlusInv * valXPlusInv} - 2
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                x² + 1/x² = {x2PlusInv2}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Trinomial Square */}
        {activeTab === 'expand' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('त्रिपदीय सर्वसमिका विस्तार (Trinomial Square: (a + b + c)²)', 'Trinomial Square')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ 166 अनुसार: (a + b + c)² लाई विस्तार गर्दा तीन वर्गहरू र तीन जोडी गुणनहरू प्राप्त हुन्छन्:',
                'Textbook Page 166: Expanding (a + b + c)² produces 3 squares and 3 paired products:'
              )}
            </p>

            <div
              style={{
                background: '#ECFDF5',
                padding: 18,
                borderRadius: 10,
                border: '1px solid #6EE7B7',
                lineHeight: 2,
                margin: '16px 0',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: '#065F46' }}>
                (a + b + c)² = a² + b² + c² + 2ab + 2bc + 2ca
              </div>
              <div style={{ fontSize: 14, color: '#047857', marginTop: 8 }}>
                {L(
                  'प्रमाणीकरण: [ (a + b) + c ]² = (a + b)² + 2(a + b)c + c² = a² + 2ab + b² + 2ac + 2bc + c²',
                  'Derivation: [ (a + b) + c ]² = (a + b)² + 2(a + b)c + c² = a² + b² + c² + 2ab + 2bc + 2ca'
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default AlgebraicIdentitiesChallenge;
