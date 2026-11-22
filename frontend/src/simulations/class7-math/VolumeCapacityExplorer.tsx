/**
 * VolumeCapacityExplorer.tsx
 * Grade 7 Mathematics – Lesson 9: PERIMETER, AREA AND VOLUME (परिमिति, क्षेत्रफल र आयतन)
 * Simulation 3: Volume and Capacity Explorer (3D + 2D Interactive Workspace)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 125-131)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Box, Droplets, Gauge, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'लम्बाइ १५ सेमी, चौडाइ १४ सेमी र उचाइ १३ सेमी भएको घनाभको आयतन (Volume) कति हुन्छ?',
    en: 'What is the volume of a cuboid with length 15 cm, breadth 14 cm, and height 13 cm?',
    options: [
      { key: 'A', label: '२,७३० घन सेमी (१५ × १४ × १३ = २,७३० cm³)' },
      { key: 'B', label: '२,५०० घन सेमी' },
      { key: 'C', label: '३,००० घन सेमी' },
      { key: 'D', label: '२,१६० घन सेमी' },
    ],
    answer: 'A',
  },
  {
    np: '६० सेमी भुजा भएको वर्गाकार बाकस (Cube) को आयतन कति हुन्छ?',
    en: 'What is the volume of a cube with edge 60 cm?',
    options: [
      { key: 'A', label: '२,१६,००० घन सेमी (६०³ = २,१६,००० cm³)' },
      { key: 'B', label: '३,६०० घन सेमी' },
      { key: 'C', label: '२१,६०० घन सेमी' },
      { key: 'D', label: '१,८०,००० घन सेमी' },
    ],
    answer: 'A',
  },
  {
    np: '१ लिटर पानीको आयतन कति घन सेन्टिमिटर (cm³) बराबर हुन्छ?',
    en: 'How many cubic centimetres (cm³) is 1 litre of water equivalent to?',
    options: [
      { key: 'A', label: '१,००० cm³ (1 litre = 1000 cm³)' },
      { key: 'B', label: '१०० cm³' },
      { key: 'C', label: '१०,००० cm³' },
      { key: 'D', label: '५०० cm³' },
    ],
    answer: 'A',
  },
  {
    np: 'पानी ट्याङ्कीको क्षमता ६०० लिटर छ। लम्बाइ २०० सेमी र उचाइ ५० सेमी भए चौडाइ कति हुन्छ?',
    en: 'A tank holds 600 litres. If length is 200 cm and height is 50 cm, what is the breadth?',
    options: [
      { key: 'A', label: '६० सेमी (६०० लिटर = ६,००,००० cm³ ÷ (२०० × ५०) = ६० सेमी)' },
      { key: 'B', label: '५० सेमी' },
      { key: 'C', label: '४० सेमी' },
      { key: 'D', label: '८० सेमी' },
    ],
    answer: 'A',
  },
];

export const VolumeCapacityExplorer: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L9-03',
    titleEn: 'Volume and Capacity Explorer',
    titleNp: 'आयतन र धारकता अन्वेषक',
    chapter: 9,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'cuboid' | 'cube' | 'tank'>('cuboid');

  // Tab 1: Cuboid Volume (Textbook: 15 x 14 x 13 cm)
  const [volL, setVolL] = useState<number>(15);
  const [volB, setVolB] = useState<number>(14);
  const [volH, setVolH] = useState<number>(13);
  const cuboidVolume = volL * volB * volH;
  const cuboidLitres = cuboidVolume / 1000;

  // Tab 2: Cube Volume (Textbook: 60 cm)
  const [cubeSide, setCubeSide] = useState<number>(60);
  const cubeVol = Math.pow(cubeSide, 3);
  const cubeLitres = cubeVol / 1000;

  // Tab 3: Tank Capacity and Missing Dimension (Textbook: Cap = 600 L, L = 200 cm, H = 50 cm => B = 60 cm)
  const [tankCapacityL, setTankCapacityL] = useState<number>(600);
  const [tankL, setTankL] = useState<number>(200);
  const [tankH, setTankH] = useState<number>(50);
  const tankTotalCm3 = tankCapacityL * 1000;
  const tankCalculatedB = tankTotalCm3 / (tankL * tankH);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'घनाभको आयतन V = l × b × h र घनको आयतन V = a³ हुन्छ। १ लिटर = १,००० cm³ र १ m³ = १,००० लिटर हुन्छ!',
        'Cuboid volume V = l × b × h, Cube volume V = a³. 1 litre = 1000 cm³, and 1 m³ = 1000 litres!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'cuboid', np: '१. घनाभको आयतन (V = l × b × h)', en: '1. Cuboid Volume' },
            { id: 'cube', np: '२. घनको आयतन (V = a³)', en: '2. Cube Volume' },
            { id: 'tank', np: '३. पानी ट्याङ्की र धारकता (Water Tank Capacity)', en: '3. Tank Capacity' },
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

        {/* TAB 1: Cuboid Volume */}
        {activeTab === 'cuboid' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('घनाभको आयतन गणना (Volume of Cuboid)', 'Volume of Cuboid')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: लम्बाइ १५ सेमी, चौडाइ १४ सेमी र उचाइ १३ सेमी भएको घनाभको आयतन निकाल्नुहोस्:',
                'Textbook Example: Find volume of cuboid with length 15 cm, breadth 14 cm, and height 13 cm:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('लम्बाइ (l): ', 'Length (l): ')} {volL} cm
                </label>
                <input
                  type="range"
                  min={5}
                  max={25}
                  value={volL}
                  onChange={(e) => {
                    kit.tap();
                    setVolL(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('चौडाइ (b): ', 'Breadth (b): ')} {volB} cm
                </label>
                <input
                  type="range"
                  min={5}
                  max={25}
                  value={volB}
                  onChange={(e) => {
                    kit.tap();
                    setVolB(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#D97706', display: 'block', marginBottom: 4 }}>
                  {L('उचाइ (h): ', 'Height (h): ')} {volH} cm
                </label>
                <input
                  type="range"
                  min={5}
                  max={25}
                  value={volH}
                  onChange={(e) => {
                    kit.tap();
                    setVolH(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div
              style={{
                background: '#F0FDF4',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #BBF7D0',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('आयतन सूत्र (Volume Formula):', 'Volume Formula:')}</strong> V = l × b × h
              </div>
              <div>
                V = {volL} cm × {volB} cm × {volH} cm = {volL * volB} × {volH}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#166534',
                }}
              >
                {L('जम्मा आयतन = ', 'Total Volume = ')} {cuboidVolume.toLocaleString()} cm³ (घन सेन्टिमिटर)
              </div>
              <div style={{ color: '#047857', fontSize: 14, marginTop: 4 }}>
                {L(
                  `लिटरमा रूपान्तरण गर्दा: ${cuboidVolume.toLocaleString()} ÷ १००० = ${cuboidLitres.toFixed(2)} लिटर`,
                  `In Litres: ${cuboidVolume.toLocaleString()} ÷ 1000 = ${cuboidLitres.toFixed(2)} Litres`
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Cube Volume */}
        {activeTab === 'cube' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('घनको आयतन (Volume of Cube)', 'Volume of Cube')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: भुजा ६० सेमी भएको वर्गाकार बाकसको आयतन निकाल्नुहोस्:',
                'Textbook Example: Find volume of cube box with edge length 60 cm:'
              )}
            </p>

            <div style={{ margin: '16px 0' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                {L('भुजाको लम्बाइ (Edge - a): ', 'Edge (a): ')} {cubeSide} cm
              </label>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={cubeSide}
                onChange={(e) => {
                  kit.tap();
                  setCubeSide(parseInt(e.target.value));
                }}
                style={{ width: 220 }}
              />
            </div>

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
                <strong>{L('घनको आयतन सूत्र:', 'Cube Volume Formula:')}</strong> V = a³ = a × a × a
              </div>
              <div>
                V = {cubeSide} × {cubeSide} × {cubeSide} = {cubeSide * cubeSide} × {cubeSide}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#3730A3',
                }}
              >
                {L('घनको आयतन = ', 'Cube Volume = ')} {cubeVol.toLocaleString()} cm³
              </div>
              <div style={{ color: '#4338CA', fontSize: 14, marginTop: 4 }}>
                {L(
                  `लिटरमा: ${cubeVol.toLocaleString()} ÷ १००० = ${cubeLitres.toLocaleString()} लिटर`,
                  `In Litres: ${cubeVol.toLocaleString()} ÷ 1000 = ${cubeLitres.toLocaleString()} Litres`
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Tank Capacity */}
        {activeTab === 'tank' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('पानी ट्याङ्कीको धारकता र चौडाइ गणना', 'Tank Capacity and Breadth Calculation')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: एउटा पानी ट्याङ्कीमा ६०० लिटर पानी अटाउँछ। यसको लम्बाइ २०० सेमी र उचाइ ५० सेमी भए चौडाइ कति हुन्छ?',
                'Textbook Example: A tank holds 600 litres. If length is 200 cm and height is 50 cm, what is the breadth?'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('ट्याङ्की क्षमता (लिटर): ', 'Capacity (Litres): ')} {tankCapacityL} L
                </label>
                <input
                  type="range"
                  min={200}
                  max={1200}
                  step={100}
                  value={tankCapacityL}
                  onChange={(e) => {
                    kit.tap();
                    setTankCapacityL(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('लम्बाइ (Length - l): ', 'Length (l): ')} {tankL} cm
                </label>
                <input
                  type="range"
                  min={100}
                  max={300}
                  step={20}
                  value={tankL}
                  onChange={(e) => {
                    kit.tap();
                    setTankL(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#D97706', display: 'block', marginBottom: 4 }}>
                  {L('उचाइ (Height - h): ', 'Height (h): ')} {tankH} cm
                </label>
                <input
                  type="range"
                  min={30}
                  max={100}
                  step={10}
                  value={tankH}
                  onChange={(e) => {
                    kit.tap();
                    setTankH(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
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
                <strong>{L('१. लिटरलाई घन सेमीमा बदल्दा:', '1. Converting Litres to cm³:')}</strong>
                <br />१ लिटर = १,००० cm³ ➜ {tankCapacityL} लिटर = {tankCapacityL} × १,००० ={' '}
                <span style={{ fontWeight: 800, color: '#0369A1' }}>{tankTotalCm3.toLocaleString()} cm³</span>
              </div>
              <div>
                <strong>{L('२. सम्बन्ध:', '2. Relation:')}</strong> V = l × b × h ➜ {tankTotalCm3.toLocaleString()} ={' '}
                {tankL} × b × {tankH}
              </div>
              <div>
                <strong>{L('३. गुणन गर्दा:', '3. Multiplying knowns:')}</strong> {tankTotalCm3.toLocaleString()} ={' '}
                {tankL * tankH} × b
              </div>
              <div>
                <strong>{L('४. भाग गरी चौडाइ (b) निकाल्दा:', '4. Dividing to find breadth (b):')}</strong> b ={' '}
                {tankTotalCm3.toLocaleString()} ÷ {tankL * tankH}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                {L('ट्याङ्कीको चौडाइ (Breadth - b) = ', 'Tank Breadth (b) = ')} {tankCalculatedB.toFixed(1)} cm
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default VolumeCapacityExplorer;
