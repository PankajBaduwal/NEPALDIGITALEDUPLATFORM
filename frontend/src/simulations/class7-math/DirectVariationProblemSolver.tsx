/**
 * DirectVariationProblemSolver.tsx
 * Grade 7 Mathematics – Lesson 8: UNITARY METHOD (एकाइ विधि)
 * Simulation 3: Direct Variation Problem Solver (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 106-107)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Fuel, Factory, ShoppingBag, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: '५ केजी चिनीको मूल्य रु ४५० पर्छ भने ३ केजी चिनीको मूल्य कति पर्छ?',
    en: 'If 5 kg of sugar costs Rs 450, what is the cost of 3 kg of sugar?',
    options: [
      { key: 'A', label: 'रु २७० (१ केजी = ९० => ३ × ९० = रु २७०)' },
      { key: 'B', label: 'रु ३००' },
      { key: 'C', label: 'रु २४०' },
      { key: 'D', label: 'रु २८०' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा मोटरसाइकलले ८ लिटर पेट्रोलले ३२० किमी पार गर्छ भने ५० किमी दुरी पार गर्न कति लिटर पेट्रोल चाहिन्छ?',
    en: 'A motorcycle covers 320 km with 8 liters of petrol. How many liters are needed for 50 km?',
    options: [
      { key: 'A', label: '१.२५ लिटर (१ लिटरले ४० किमी => ५०/४० = १.२५ लिटर)' },
      { key: 'B', label: '१.५ लिटर' },
      { key: 'C', label: '२ लिटर' },
      { key: 'D', label: '०.८ लिटर' },
    ],
    answer: 'A',
  },
  {
    np: 'कारखानाको एउटा मेसिनले ३ घण्टामा ६,६०० बोतल जुस भर्छ भने ८ घण्टामा कति बोतल भर्ला?',
    en: 'A factory machine fills 6,600 juice bottles in 3 hours. How many bottles will it fill in 8 hours?',
    options: [
      { key: 'A', label: '१७,६०० बोतल (१ घण्टामा २,२०० => ८ × २२०० = १७,६००)' },
      { key: 'B', label: '१५,००० बोतल' },
      { key: 'C', label: '१८,००० बोतल' },
      { key: 'D', label: '२०,००० बोतल' },
    ],
    answer: 'A',
  },
  {
    np: 'प्रत्यक्ष विचरणमा परिमाण x बाट परिमाण y निकाल्दा सम्बन्ध कुन हुन्छ?',
    en: 'In direct variation, what is the relation between x and y?',
    options: [
      { key: 'A', label: 'y1 / x1 = y2 / x2' },
      { key: 'B', label: 'x1 × y1 = x2 × y2' },
      { key: 'C', label: 'x1 + y1 = x2 + y2' },
      { key: 'D', label: 'x1 - y1 = x2 - y2' },
    ],
    answer: 'A',
  },
];

export const DirectVariationProblemSolver: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L8-03',
    titleEn: 'Direct Variation Problem Solver',
    titleNp: 'प्रत्यक्ष विचरण समस्या समाधान',
    chapter: 8,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'sugar' | 'fuel' | 'bottles'>('sugar');

  // Case 1: Sugar (Textbook page 106)
  const [givenSugarKg, setGivenSugarKg] = useState<number>(5);
  const [givenSugarCost, setGivenSugarCost] = useState<number>(450);
  const [targetSugarKg, setTargetSugarKg] = useState<number>(3);
  const unitSugarRate = givenSugarCost / givenSugarKg;
  const targetSugarCost = unitSugarRate * targetSugarKg;

  // Case 2: Motorcycle Petrol (Textbook page 106)
  const [petrolLiters, setPetrolLiters] = useState<number>(8);
  const [distanceKm, setDistanceKm] = useState<number>(320);
  const [targetDistKm, setTargetDistKm] = useState<number>(50);
  const mileageKmPerL = distanceKm / petrolLiters;
  const targetPetrolNeeded = targetDistKm / mileageKmPerL;

  // Case 3: Bottle filling machine
  const [givenHours, setGivenHours] = useState<number>(3);
  const [givenBottles, setGivenBottles] = useState<number>(6600);
  const [targetHours, setTargetHours] = useState<number>(8);
  const bottlesPerHour = givenBottles / givenHours;
  const targetBottlesFilled = bottlesPerHour * targetHours;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'परिमाण बढ्दा मूल्य वा दुरी पनि सोही अनुपातमा बढ्छ: y1/x1 = y2/x2!',
        'As quantity increases, cost or distance increases proportionally: y1/x1 = y2/x2!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'sugar', np: '१. चिनीको मूल्य (Sugar Cost)', en: '1. Sugar Cost' },
            { id: 'fuel', np: '२. मोटरसाइकल इन्धन (Motorcycle Fuel)', en: '2. Motorcycle Fuel' },
            { id: 'bottles', np: '३. कारखाना उत्पादन (Bottle Production)', en: '3. Machine Production' },
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

        {/* TAB 1: Sugar Cost */}
        {activeTab === 'sugar' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('चिनीको परिमाण र मूल्यको प्रत्यक्ष विचरण', 'Sugar Quantity and Price (Direct Variation)')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: ५ केजी चिनीको मूल्य रु ४५० पर्छ भने ३ केजी चिनीको मूल्य कति पर्छ?',
                'Textbook Example: If 5 kg sugar costs Rs 450, what is the cost of 3 kg sugar?'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  {L('दिइएको चिनी (केजी): ', 'Given Sugar (kg): ')} {givenSugarKg} kg
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={givenSugarKg}
                  onChange={(e) => {
                    kit.tap();
                    setGivenSugarKg(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('दिइएको मूल्य (रु): ', 'Given Cost (Rs): ')} रु {givenSugarCost}
                </label>
                <input
                  type="range"
                  min={180}
                  max={900}
                  step={45}
                  value={givenSugarCost}
                  onChange={(e) => {
                    kit.tap();
                    setGivenSugarCost(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('किन्नुपर्ने चिनी (केजी): ', 'Target Sugar (kg): ')} {targetSugarKg} kg
                </label>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={targetSugarKg}
                  onChange={(e) => {
                    kit.tap();
                    setTargetSugarKg(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Step-by-Step Card */}
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
                <strong>{L('१. दिइएको:', '1. Given:')}</strong> {givenSugarKg} केजी चिनीको मूल्य = रु {givenSugarCost}
              </div>
              <div>
                <strong>{L('२. १ केजी चिनीको मूल्य (भाग गर्दा):', '2. Cost of 1 kg (Divide):')}</strong> रु{' '}
                {givenSugarCost} ÷ {givenSugarKg} = <span style={{ fontWeight: 800, color: '#059669' }}>रु {unitSugarRate}</span>
              </div>
              <div>
                <strong>{L('३. ३ केजी चिनीको मूल्य (गुणन गर्दा):', '3. Cost of 3 kg (Multiply):')}</strong> {targetSugarKg} × रु{' '}
                {unitSugarRate}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                {targetSugarKg} केजी {L('चिनीको मूल्य = रु ', 'Sugar Cost = Rs ')} {targetSugarCost.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Motorcycle Fuel */}
        {activeTab === 'fuel' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('मोटरसाइकल इन्धन खपत (Motorcycle Fuel Consumption)', 'Motorcycle Fuel Consumption')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: एउटा मोटरसाइकलले ८ लिटर पेट्रोलले ३२० किमी पार गर्छ भने ५० किमी दुरी पार गर्न कति लिटर पेट्रोल चाहिन्छ?',
                'Textbook Example: A motorcycle covers 320 km with 8 liters of petrol. How much petrol is needed for 50 km?'
              )}
            </p>

            <div
              style={{
                background: '#EFF6FF',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #BFDBFE',
                lineHeight: 2,
                margin: '16px 0',
              }}
            >
              <div>
                <strong>{L('१. दिइएको:', '1. Given:')}</strong> ३२० किमी दुरी पार गर्न लाग्ने पेट्रोल = ८ लिटर
              </div>
              <div>
                <strong>{L('२. १ किमी दुरी पार गर्न लाग्ने पेट्रोल:', '2. Petrol for 1 km:')}</strong> ८ ÷ ३२० = १/४० लिटर
                (अर्थात् १ लिटरले ४० किमी गुड्छ)
              </div>
              <div>
                <strong>{L('३. ५० किमी दुरी पार गर्न लाग्ने पेट्रोल:', '3. Petrol for 50 km:')}</strong> ५० × (१/४०) = ५० ÷ ४०
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#1E40AF',
                }}
              >
                {L('आवश्यक पेट्रोल = ', 'Petrol Required = ')} {targetPetrolNeeded.toFixed(2)} {L('लिटर', 'Liters')}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Factory Production */}
        {activeTab === 'bottles' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('कारखानाको मेसिन उत्पादन (Factory Machine Production)', 'Factory Machine Production')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: कारखानाको एउटा मेसिनले ३ घण्टामा ६,६०० बोतल जुस भर्छ भने सोही दरमा ८ घण्टामा कति बोतल भर्ला?',
                'Textbook Example: A machine fills 6,600 juice bottles in 3 hours. How many bottles will it fill in 8 hours?'
              )}
            </p>

            <div
              style={{
                background: '#F0FDF4',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #BBF7D0',
                lineHeight: 2,
                margin: '16px 0',
              }}
            >
              <div>
                <strong>{L('१. दिइएको:', '1. Given:')}</strong> ३ घण्टामा भरिने बोतल = ६,६०० बोतल
              </div>
              <div>
                <strong>{L('२. १ घण्टामा भरिने बोतल:', '2. Bottles in 1 hour:')}</strong> ६,६०० ÷ ३ ={' '}
                <span style={{ fontWeight: 800, color: '#15803D' }}>२,२०० बोतल</span>
              </div>
              <div>
                <strong>{L('३. ८ घण्टामा भरिने बोतल:', '3. Bottles in 8 hours:')}</strong> ८ × २,२०० बोतल
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#166534',
                }}
              >
                {L('जम्मा भरिने बोतल = ', 'Total Bottles Filled = ')} {targetBottlesFilled.toLocaleString()}{' '}
                {L('बोतल', 'Bottles')}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default DirectVariationProblemSolver;
