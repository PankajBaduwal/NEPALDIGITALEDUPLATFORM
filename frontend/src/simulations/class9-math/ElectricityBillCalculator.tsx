import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Zap, Calendar, Receipt, Percent, CheckCircle2, RotateCcw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'विद्युत मिटरमा खपत युनिट (Units Consumed) कसरी निकालिन्छ?',
    en: 'How is electricity unit consumption calculated?',
    options: [
      { key: 'A', label: 'हालको रिडिङ − अघिल्लो रिडिङ (Current Reading − Previous Reading)' },
      { key: 'B', label: 'हालको रिडिङ + अघिल्लो रिडिङ' },
      { key: 'C', label: 'हालको रिडिङ × ३०' },
      { key: 'D', label: 'न्यूनतम शुल्क' },
    ],
    answer: 'A',
  },
  {
    np: 'नेपाल विद्युत प्राधिकरणको नियम अनुसार मिटर रिडिङ भएको पहिलो ७ दिनभित्र महसुल बुझाउँदा कति छुट पाइन्छ?',
    en: 'According to NEA rules, what discount is given if bill is paid within the first 7 days?',
    options: [
      { key: 'A', label: '३% छुट (3% Rebate / Discount)' },
      { key: 'B', label: '५% छुट' },
      { key: 'C', label: '१०% छुट' },
      { key: 'D', label: 'कुनै छुट पाइँदैन' },
    ],
    answer: 'A',
  },
  {
    np: 'मिटर रिडिङ भएको १६ औं दिनदेखि ३० औं दिनसम्म महसुल बुझाउँदा कति प्रतिशत थप जरिवाना लाग्छ?',
    en: 'What percentage penalty is charged if the bill is paid between 16th and 30th day?',
    options: [
      { key: 'A', label: '५% जरिवाना (5% Late Penalty)' },
      { key: 'B', label: '१०% जरिवाना' },
      { key: 'C', label: '२५% जरिवाना' },
      { key: 'D', label: '२% जरिवाना' },
    ],
    answer: 'A',
  },
  {
    np: '५ एम्पियर मिटरमा २० युनिटसम्म न्यूनतम शुल्क रु ३० छ भने सो अवधिको ऊर्जा शुल्क कति हुन्छ?',
    en: 'For 5A meter with Rs 30 minimum charge up to 20 units, what is the energy charge for lifeline users?',
    options: [
      { key: 'A', label: 'रु ० (निःशुल्क ऊर्जा शुल्क / Free energy charge)' },
      { key: 'B', label: 'रु ३०' },
      { key: 'C', label: 'रु ५०' },
      { key: 'D', label: 'रु १००' },
    ],
    answer: 'A',
  },
];

export const ElectricityBillCalculator: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U4-01',
    chapter: 4,
    titleNp: 'विद्युत महसुल क्यालकुलेटर',
    titleEn: 'Electricity Bill Calculator',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'bill' | 'slabs' | 'penalty'>('bill');

  // Meter Reading Inputs
  const [prevReading, setPrevReading] = useState<number>(1420);
  const [currReading, setCurrReading] = useState<number>(1580);
  const [meterCapacity, setMeterCapacity] = useState<'5A' | '15A' | '30A'>('5A');
  const [paymentDay, setPaymentDay] = useState<number>(5); // 5th day (within 7 days)

  // Consumed Units
  const unitsConsumed = Math.max(0, currReading - prevReading);

  // 5A Tariff Table according to CDC Nepal Grade 9 Textbook:
  // 0 - 20 units: Min Rs 30, Energy Rs 0
  // 21 - 30 units: Min Rs 50, Energy Rs 6.50/unit
  // 31 - 50 units: Min Rs 50, Energy Rs 8.00/unit
  // 51 - 150 units: Min Rs 75, Energy Rs 9.50/unit
  // 151 - 250 units: Min Rs 100, Energy Rs 9.50/unit
  // 251 - 400 units: Min Rs 125, Energy Rs 11.00/unit
  // Above 400: Min Rs 150, Energy Rs 12.00/unit
  const tariffCalc = useMemo(() => {
    let minCharge = 30;
    let energyCharge = 0;
    const u = unitsConsumed;

    if (u <= 20) {
      minCharge = 30;
      energyCharge = 0;
    } else if (u <= 30) {
      minCharge = 50;
      energyCharge = (u - 20) * 6.5;
    } else if (u <= 50) {
      minCharge = 50;
      energyCharge = 10 * 6.5 + (u - 30) * 8.0;
    } else if (u <= 150) {
      minCharge = 75;
      energyCharge = 10 * 6.5 + 20 * 8.0 + (u - 50) * 9.5;
    } else if (u <= 250) {
      minCharge = 100;
      energyCharge = 10 * 6.5 + 20 * 8.0 + 100 * 9.5 + (u - 150) * 9.5;
    } else {
      minCharge = 125;
      energyCharge = 10 * 6.5 + 20 * 8.0 + 100 * 9.5 + 100 * 9.5 + (u - 250) * 11.0;
    }

    const subtotal = minCharge + energyCharge;

    // Rebate or Penalty based on payment day:
    // Day 1 to 7: 3% rebate
    // Day 8 to 15: 0%
    // Day 16 to 30: +5% penalty
    // Day 31 to 40: +10% penalty
    // Day 41+: +25% penalty
    let rebatePct = 0;
    let penaltyPct = 0;

    if (paymentDay <= 7) {
      rebatePct = 3;
    } else if (paymentDay <= 15) {
      rebatePct = 0;
    } else if (paymentDay <= 30) {
      penaltyPct = 5;
    } else if (paymentDay <= 40) {
      penaltyPct = 10;
    } else {
      penaltyPct = 25;
    }

    const rebateAmount = Math.round((subtotal * rebatePct) / 100);
    const penaltyAmount = Math.round((subtotal * penaltyPct) / 100);
    const finalBill = Math.round(subtotal - rebateAmount + penaltyAmount);

    return {
      minCharge,
      energyCharge: Math.round(energyCharge),
      subtotal: Math.round(subtotal),
      rebatePct,
      penaltyPct,
      rebateAmount,
      penaltyAmount,
      finalBill,
    };
  }, [unitsConsumed, paymentDay]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! घरायसी अङ्कगणित अन्तर्गत विद्युत मिटर रिडिङ, खपत युनिट, स्ल्याब दर, न्यूनतम शुल्क र समयमै भुक्तानीको छुट/जरिवाना हिसाब सिकौं!',
        'Welcome! Explore electricity meter readings, consumption units, tiered tariff slabs, and rebate/penalty rules!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('bill')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bill' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            ⚡ {L('१. विद्युत महसुल क्यालकुलेटर (Bill Calculator)', '1. Bill Calculator')}
          </button>
          <button
            onClick={() => setActiveTab('slabs')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'slabs' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 {L('२. महसुल दर स्ल्याब (Tariff Slabs)', '2. Tariff Slabs')}
          </button>
          <button
            onClick={() => setActiveTab('penalty')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'penalty' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            ⏱️ {L('३. छुट र जरिवाना नियम (Rebate & Penalties)', '3. Rebates & Penalties')}
          </button>
        </div>

        {/* Tab 1: Electricity Bill Calculator */}
        {activeTab === 'bill' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Meter Readings */}
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                मिटर रिडिङ तथा भुक्तानी दिन
              </h3>

              {/* Digital Meter Simulation Display */}
              <div className="bg-slate-900 rounded-2xl p-4 text-center border-4 border-slate-700 shadow-inner">
                <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  विद्युत मिटर (Single Phase 5A KWh)
                </span>
                <div className="flex justify-center gap-1 font-mono text-2xl font-black text-amber-400 bg-slate-950 py-2 px-4 rounded-xl border border-slate-800 tracking-widest">
                  {currReading.toString().padStart(5, '0')} <span className="text-xs text-slate-500 self-end">kWh</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold mt-2 font-mono">
                  खपत युनिट = {currReading} − {prevReading} = {unitsConsumed} युनिट
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">अघिल्लो रिडिङ (Previous):</label>
                  <input
                    type="number"
                    value={prevReading}
                    onChange={(e) => setPrevReading(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">हालको रिडिङ (Current):</label>
                  <input
                    type="number"
                    value={currReading}
                    onChange={(e) => setCurrReading(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Payment Day Slider */}
              <div className="space-y-1 pt-1 border-t">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>भुक्तानी गरेको दिन (Payment Day):</span>
                  <span className="font-mono text-amber-700 text-sm font-bold">
                    {paymentDay} औं दिन {paymentDay <= 7 ? '(३% छुट)' : paymentDay <= 15 ? '(नियमित)' : '(जरिवाना लाग्ने)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="45"
                  value={paymentDay}
                  onChange={(e) => setPaymentDay(parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
            </div>

            {/* Bill Receipt Card */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-3 font-mono">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs uppercase text-slate-400 font-bold">नेपाल विद्युत प्राधिकरण महसुल बिल</span>
                  <span className="text-xs text-amber-400 font-bold">५ एम्पियर मिटर</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>कुल खपत युनिट:</span>
                    <span className="font-bold text-white">{unitsConsumed} kWh (Units)</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">१. न्यूनतम सेवा शुल्क (Min Charge):</span>
                    <span className="font-bold text-slate-200">रु. {tariffCalc.minCharge}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">२. ऊर्जा शुल्क (Energy Charge):</span>
                    <span className="font-bold text-slate-200">रु. {tariffCalc.energyCharge}</span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-slate-800 text-slate-300 font-bold">
                    <span>जम्मा रकम (Subtotal):</span>
                    <span>रु. {tariffCalc.subtotal}</span>
                  </div>

                  {tariffCalc.rebateAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>छुट ({tariffCalc.rebatePct}% छुट - पहिलो ७ दिन):</span>
                      <span>− रु. {tariffCalc.rebateAmount}</span>
                    </div>
                  )}

                  {tariffCalc.penaltyAmount > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>ढिलो जरिवाना (+{tariffCalc.penaltyPct}%):</span>
                      <span>+ रु. {tariffCalc.penaltyAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t-2 border-amber-500 font-black text-base text-amber-400">
                    <span>बुझाउनुपर्ने कुल महसुल:</span>
                    <span>रु. {tariffCalc.finalBill.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Helpful note */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 font-semibold space-y-1">
                <div>• कुल युनिट = हालको रिडिङ − अघिल्लो रिडिङ</div>
                <div>• समयमै (७ दिनभित्र) तिर्दा ३% छुट पाइन्छ।</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tariff Slabs Table */}
        {activeTab === 'slabs' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm text-center">
              ५ एम्पियर घरायसी मिटरको महसुल दर (नेपाल विद्युत प्राधिकरण)
            </h3>

            <div className="overflow-x-auto text-xs">
              <table className="w-full border border-slate-200 rounded-xl overflow-hidden text-left">
                <thead className="bg-slate-100 font-bold text-slate-800 border-b">
                  <tr>
                    <th className="p-2.5">खपत युनिट स्ल्याब</th>
                    <th className="p-2.5 text-right">न्यूनतम शुल्क</th>
                    <th className="p-2.5 text-right">ऊर्जा दर (प्रति युनिट)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="p-2.5">० देखि २० युनिटसम्म</td>
                    <td className="p-2.5 text-right font-bold">रु. ३०</td>
                    <td className="p-2.5 text-right text-emerald-700 font-bold">निःशुल्क (रु. ०)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">२१ देखि ३० युनिटसम्म</td>
                    <td className="p-2.5 text-right font-bold">रु. ५०</td>
                    <td className="p-2.5 text-right text-slate-800">रु. ६.५०</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">३१ देखि ५० युनिटसम्म</td>
                    <td className="p-2.5 text-right font-bold">रु. ५०</td>
                    <td className="p-2.5 text-right text-slate-800">रु. ८.००</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">५१ देखि १५० युनिटसम्म</td>
                    <td className="p-2.5 text-right font-bold">रु. ७५</td>
                    <td className="p-2.5 text-right text-slate-800">रु. ९.५०</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">१५१ देखि २५० युनिटसम्म</td>
                    <td className="p-2.5 text-right font-bold">रु. १००</td>
                    <td className="p-2.5 text-right text-slate-800">रु. ९.५०</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">२५१ भन्दा माथि</td>
                    <td className="p-2.5 text-right font-bold">रु. १२५</td>
                    <td className="p-2.5 text-right text-slate-800">रु. ११.००</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Penalty and Rebate Rules */}
        {activeTab === 'penalty' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-800 text-sm text-center">
              भुक्तानी समय अनुसार छुट तथा थप दस्तुर (NEA नियम)
            </h3>

            <div className="space-y-2">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span className="font-bold text-emerald-950">१ देखि ७ औं दिनभित्र</span>
                <span className="font-bold text-emerald-700 font-mono">३% छुट (Rebate)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">८ देखि १५ औं दिनसम्म</span>
                <span className="font-bold text-slate-600 font-mono">नियमित महसुल (०%)</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
                <span className="font-bold text-amber-950">१६ देखि ३० औं दिनसम्म</span>
                <span className="font-bold text-amber-700 font-mono">+५% थप दस्तुर (Penalty)</span>
              </div>

              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 flex justify-between items-center">
                <span className="font-bold text-orange-950">३१ देखि ४० औं दिनसम्म</span>
                <span className="font-bold text-orange-700 font-mono">+१०% थप दस्तुर (Penalty)</span>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex justify-between items-center">
                <span className="font-bold text-rose-950">४१ औं दिनभन्दा पछि</span>
                <span className="font-bold text-rose-700 font-mono">+२५% थप दस्तुर (Penalty)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default ElectricityBillCalculator;
