import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Zap, Calendar, Receipt, Percent, CheckCircle2, RotateCcw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'विद्युत mमा खपत units (Units Consumed) कसरी निकालिन्छ?',
    en: 'How is electricity unit consumption calculated?',
    options: [
      { key: 'A', label: 'Current reading − previous reading' },
      { key: 'B', label: 'Current reading + previous reading' },
      { key: 'C', label: 'Current reading × 30' },
      { key: 'D', label: 'Minimum charge' },
    ],
    answer: 'A',
  },
  {
    np: 'नेपाल विद्युत प्राधिकरणको नियम अनुसार m रिडिङ भएको पहिलो 7 दिनभित्र महसुल बुझाउँदा कति छुट पाइन्छ?',
    en: 'According to NEA rules, what discount is given if bill is paid within the first 7 days?',
    options: [
      { key: 'A', label: '3% Rebate (3% Rebate / Discount)' },
      { key: 'B', label: '5% rebate' },
      { key: 'C', label: '10% rebate' },
      { key: 'D', label: 'No rebate is given' },
    ],
    answer: 'A',
  },
  {
    np: 'm रिडिङ भएको 16 th dayदेखि 30 th dayसम्म महसुल बुझाउँदा कति प्रतिशत थप जरिवाना लाग्छ?',
    en: 'What percentage penalty is charged if the bill is paid between 16th and 30th day?',
    options: [
      { key: 'A', label: '5% late penalty' },
      { key: 'B', label: '10% penalty' },
      { key: 'C', label: '25% penalty' },
      { key: 'D', label: '2% penalty' },
    ],
    answer: 'A',
  },
  {
    np: '5 ampere meterमा 20 unitsसम्म Minimum charge Rs 30 छ भने सो अवधिको ऊर्जा शुल्क कति हुन्छ?',
    en: 'For 5A meter with Rs 30 minimum charge up to 20 units, what is the energy charge for lifeline users?',
    options: [
      { key: 'A', label: 'Rs 0' },
      { key: 'B', label: 'Rs 30' },
      { key: 'C', label: 'Rs 50' },
      { key: 'D', label: 'Rs 100' },
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
        'नमस्ते! घरायसी अङ्कगणित अन्तर्गत विद्युत m रिडिङ, खपत units, स्ल्याब दर, Minimum charge र समयमै भुक्तानीको छुट/जरिवाना हिसाब सिकौं!',
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
            ⚡ {L('1. विद्युत महसुल क्यालकुलेटर (Bill Calculator)', '1. Bill Calculator')}
          </button>
          <button
            onClick={() => setActiveTab('slabs')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'slabs' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 {L('2. महसुल दर स्ल्याब (Tariff Slabs)', '2. Tariff Slabs')}
          </button>
          <button
            onClick={() => setActiveTab('penalty')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'penalty' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            ⏱️ {L('3. छुट र जरिवाना नियम (Rebate & Penalties)', '3. Rebates & Penalties')}
          </button>
        </div>

        {/* Tab 1: Electricity Bill Calculator */}
        {activeTab === 'bill' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Meter Readings */}
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Meter reading and payment day
              </h3>

              {/* Digital Meter Simulation Display */}
              <div className="bg-slate-900 rounded-2xl p-4 text-center border-4 border-slate-700 shadow-inner">
                <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  Electricity meter (single phase 5A kWh)
                </span>
                <div className="flex justify-center gap-1 font-mono text-2xl font-black text-amber-400 bg-slate-950 py-2 px-4 rounded-xl border border-slate-800 tracking-widest">
                  {currReading.toString().padStart(5, '0')} <span className="text-xs text-slate-500 self-end">kWh</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold mt-2 font-mono">
                  Units consumed = {currReading} − {prevReading} = {unitsConsumed} units
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Previous reading:</label>
                  <input
                    type="number"
                    value={prevReading}
                    onChange={(e) => setPrevReading(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current reading:</label>
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
                  <span>Payment day:</span>
                  <span className="font-mono text-amber-700 text-sm font-bold">
                    {paymentDay} th day {paymentDay <= 7 ? '' : paymentDay <= 15 ? '' : ''}
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
                  <span className="text-xs uppercase text-slate-400 font-bold">Nepal Electricity Authority tariff bill</span>
                  <span className="text-xs text-amber-400 font-bold">5 ampere meter</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Total units consumed:</span>
                    <span className="font-bold text-white">{unitsConsumed} kWh (Units)</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">1. Minimum service charge:</span>
                    <span className="font-bold text-slate-200">Rs. {tariffCalc.minCharge}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">2. Energy charge:</span>
                    <span className="font-bold text-slate-200">Rs. {tariffCalc.energyCharge}</span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-slate-800 text-slate-300 font-bold">
                    <span>Subtotal:</span>
                    <span>Rs. {tariffCalc.subtotal}</span>
                  </div>

                  {tariffCalc.rebateAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Rebate ({tariffCalc.rebatePct}% rebate - first 7 days):</span>
                      <span>− Rs. {tariffCalc.rebateAmount}</span>
                    </div>
                  )}

                  {tariffCalc.penaltyAmount > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>ढिलो जरिवाना (+{tariffCalc.penaltyPct}%):</span>
                      <span>+ Rs. {tariffCalc.penaltyAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t-2 border-amber-500 font-black text-base text-amber-400">
                    <span>Total bill payable:</span>
                    <span>Rs. {tariffCalc.finalBill.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Helpful note */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 font-semibold space-y-1">
                <div>• Total units = current reading − previous reading</div>
                <div>• A 3% rebate is given for paying on time (within 7 days).</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tariff Slabs Table */}
        {activeTab === 'slabs' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm text-center">
              Tariff rates for a 5 ampere household meter (Nepal Electricity Authority)
            </h3>

            <div className="overflow-x-auto text-xs">
              <table className="w-full border border-slate-200 rounded-xl overflow-hidden text-left">
                <thead className="bg-slate-100 font-bold text-slate-800 border-b">
                  <tr>
                    <th className="p-2.5">Consumption unit slab</th>
                    <th className="p-2.5 text-right">Minimum charge</th>
                    <th className="p-2.5 text-right">Energy rate (per unit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="p-2.5">0 to 20 units</td>
                    <td className="p-2.5 text-right font-bold">Rs. 30</td>
                    <td className="p-2.5 text-right text-emerald-700 font-bold">Free (Rs. 0)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">21 to 30 units</td>
                    <td className="p-2.5 text-right font-bold">Rs. 50</td>
                    <td className="p-2.5 text-right text-slate-800">Rs. 6.50</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">31 to 50 units</td>
                    <td className="p-2.5 text-right font-bold">Rs. 50</td>
                    <td className="p-2.5 text-right text-slate-800">Rs. 8.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">51 to 150 units</td>
                    <td className="p-2.5 text-right font-bold">Rs. 75</td>
                    <td className="p-2.5 text-right text-slate-800">Rs. 9.50</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">151 to 250 units</td>
                    <td className="p-2.5 text-right font-bold">Rs. 100</td>
                    <td className="p-2.5 text-right text-slate-800">Rs. 9.50</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Above 251</td>
                    <td className="p-2.5 text-right font-bold">Rs. 125</td>
                    <td className="p-2.5 text-right text-slate-800">Rs. 11.00</td>
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
              Rebate and penalty by payment time (NEA rules)
            </h3>

            <div className="space-y-2">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span className="font-bold text-emerald-950">Within the 1st to 7th day</span>
                <span className="font-bold text-emerald-700 font-mono">3% Rebate (Rebate)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">8th to 15th day</span>
                <span className="font-bold text-slate-600 font-mono">Regular bill (0%)</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
                <span className="font-bold text-amber-950">16th to 30th day</span>
                <span className="font-bold text-amber-700 font-mono">+5% penalty</span>
              </div>

              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 flex justify-between items-center">
                <span className="font-bold text-orange-950">31st to 40th day</span>
                <span className="font-bold text-orange-700 font-mono">+10% penalty</span>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex justify-between items-center">
                <span className="font-bold text-rose-950">After the 41st day</span>
                <span className="font-bold text-rose-700 font-mono">+25% penalty</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default ElectricityBillCalculator;
