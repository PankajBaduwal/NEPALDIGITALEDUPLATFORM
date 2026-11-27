import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Building2, Users, Gift, Percent, Calculator, ArrowRight } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एक कम्पनीले वार्षिक Rs 50,00,000 खुद नाफाबाट 10% रकम बोनस वितरण गर्दा कुल बोनस रकम कति हुन्छ?',
    en: 'A company distributes 10% bonus from Rs 50,00,000 net profit. What is total bonus amount?',
    options: [
      { key: 'A', label: 'Rs 5,00,000 — (50,00,000 × 10% = 5,00,000)' },
      { key: 'B', label: 'Rs 50,000' },
      { key: 'C', label: 'Rs 10,00,000' },
      { key: 'D', label: 'Rs 25,000' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि कुल बोनस रकम Rs 6,00,000 लाई 50 people कर्मचारीहरूमा समान रूपमा बाँड्दा प्रत्येकले कति पाउँछन्?',
    en: 'If Rs 6,00,000 total bonus is equally divided among 50 employees, how much does each receive?',
    options: [
      { key: 'A', label: 'Rs 12,000 — (6,00,000 ÷ 50 = 12,000)' },
      { key: 'B', label: 'Rs 10,000' },
      { key: 'C', label: 'Rs 15,000' },
      { key: 'D', label: 'Rs 8,000' },
    ],
    answer: 'A',
  },
  {
    np: 'कर्मचारीहरूलाई बोनस वितरण गरेपछि कम्पनीसँग बाँकी रहने रकमलाई के भनिन्छ?',
    en: 'What is the amount remaining with the company after bonus distribution called?',
    options: [
      { key: 'A', label: 'Remaining net profit / reserve fund (retained profit)' },
      { key: 'B', label: 'Commission' },
      { key: 'C', label: 'Dividend only' },
      { key: 'D', label: 'Bonus percentage' },
    ],
    answer: 'A',
  },
  {
    np: 'Rs 40 लाख नाफाबाट Rs 2 लाख बोनस बाँड्दा Bonus percentage कति हुन्छ?',
    en: 'If Rs 2 lakh bonus is distributed from Rs 40 lakh profit, what is the bonus percentage?',
    options: [
      { key: 'A', label: '5% — (2,00,000 ÷ 40,00,000) × 100% = 5%' },
      { key: 'B', label: '10%' },
      { key: 'C', label: '2%' },
      { key: 'D', label: '8%' },
    ],
    answer: 'A',
  },
];

interface CompanyPreset {
  nameNp: string;
  profit: number;
  bonusRate: number;
  employees: number;
  descNp: string;
}

const PRESETS: CompanyPreset[] = [
  {
    nameNp: 'Hotel उद्योग (Hotel Industry)',
    profit: 4000000,
    bonusRate: 10,
    employees: 80,
    descNp: 'वार्षिक नाफा Rs 40 लाख, 10% बोनस, 80 people कर्मचारी',
  },
  {
    nameNp: 'Hydropower कम्पनी (Hydropower Co.)',
    profit: 15000000,
    bonusRate: 5,
    employees: 50,
    descNp: 'वार्षिक नाफा Rs 1 करोड 50 लाख, 5% बोनस, 50 people कर्मचारी',
  },
  {
    nameNp: 'Manufacturing उद्योग (Manufacturing)',
    profit: 8000000,
    bonusRate: 8,
    employees: 64,
    descNp: 'वार्षिक नाफा Rs 80 लाख, 8% बोनस, 64 people कर्मचारी',
  },
];

export const CompanyProfitBonusDistribution: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U3-02',
    chapter: 3,
    titleNp: 'कम्पनीको नाफा र बोनस वितरण प्रयोगशाला',
    titleEn: 'Company Profit & Bonus Distribution',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'dist' | 'reverse'>('dist');

  // Distribution State
  const [profit, setProfit] = useState<number>(4000000);
  const [bonusRate, setBonusRate] = useState<number>(10);
  const [employees, setEmployees] = useState<number>(80);

  // Reverse Calculation State
  const [revProfit, setRevProfit] = useState<number>(5000000);
  const [revBonusPool, setRevBonusPool] = useState<number>(400000);

  // Computed Values
  const totalBonusPool = Math.round((profit * bonusRate) / 100);
  const bonusPerEmployee = employees > 0 ? Math.round(totalBonusPool / employees) : 0;
  const retainedProfit = profit - totalBonusPool;

  const revBonusPct = revProfit > 0 ? ((revBonusPool / revProfit) * 100).toFixed(2) : '0';

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! कम्पनीको खुद नाफाबाट Bonus percentage, कुल बोनस कोष र प्रत्येक कर्मचारीले पाउने बोनस रकमको हिसाब सिकौं!',
        'Welcome! Explore company net profit allocation, bonus pool percentage, and per-employee distribution!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('dist')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'dist' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎁 {L('1. बोनस वितरण सिमुलेटर (Bonus Distribution)', '1. Bonus Distribution')}
          </button>
          <button
            onClick={() => setActiveTab('reverse')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reverse' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔄 {L('2. Bonus percentage पत्ता लगाउने (Find Bonus %)', '2. Reverse Calculator')}
          </button>
        </div>

        {/* Tab 1: Interactive Distribution */}
        {activeTab === 'dist' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Controls */}
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                Company and bonus details
              </h3>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">Textbook samples:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setProfit(p.profit);
                        setBonusRate(p.bonusRate);
                        setEmployees(p.employees);
                      }}
                      className="p-1.5 rounded-lg border text-[11px] font-bold bg-slate-50 text-slate-700 hover:bg-amber-50"
                    >
                      {p.nameNp.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profit Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Company’s net profit:</span>
                  <span className="font-mono text-indigo-700 text-sm">
                    Rs. {profit.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="20000000"
                  step="500000"
                  value={profit}
                  onChange={(e) => setProfit(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Bonus Rate Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Bonus percentage:</span>
                  <span className="font-mono text-emerald-700 text-sm">{bonusRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={bonusRate}
                  onChange={(e) => setBonusRate(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Employees Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Number of staff:</span>
                  <span className="font-mono text-amber-700 text-sm">{employees} people</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={employees}
                  onChange={(e) => setEmployees(parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
            </div>

            {/* Output Visualizer */}
            <div className="lg:col-span-6 space-y-4">
              {/* Highlight Per Employee Bonus Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-sm text-center space-y-2">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide block">
                  Bonus amount per employee
                </span>
                <div className="text-4xl font-black text-emerald-600 font-mono">
                  Rs. {bonusPerEmployee.toLocaleString()}
                </div>
                <span className="text-xs text-slate-600 font-semibold block">
                  Total bonus Rs. {totalBonusPool.toLocaleString()} ÷ {employees} people
                </span>
              </div>

              {/* Visual Split Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Profit distribution view:</span>
                <div className="w-full h-8 rounded-full overflow-hidden flex border">
                  <div
                    style={{ width: `${100 - bonusRate}%` }}
                    className="bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold"
                  >
                    Remaining in the company ({(100 - bonusRate)}%)
                  </div>
                  <div
                    style={{ width: `${bonusRate}%` }}
                    className="bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold"
                  >
                    Bonus ({bonusRate}%)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-xl border">
                    <span className="text-slate-500 block">Total bonus fund:</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      Rs. {totalBonusPool.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border">
                    <span className="text-slate-500 block">Net profit remaining in the company:</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      Rs. {retainedProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formula Reminder */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 font-semibold space-y-1">
                <div>• Total bonus amount = net profit × bonus percentage</div>
                <div>• Bonus per employee = total bonus amount ÷ number of staff</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Reverse Percentage Calculator */}
        {activeTab === 'reverse' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm text-center">
              Reverse method: calculating the bonus percentage from the distributed bonus amount
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company’s total profit (Rs):</label>
                <input
                  type="number"
                  value={revProfit}
                  onChange={(e) => setRevProfit(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total bonus amount distributed (Rs):</label>
                <input
                  type="number"
                  value={revBonusPool}
                  onChange={(e) => setRevBonusPool(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
              <span className="text-xs font-bold text-emerald-900 block">Bonus percentage:</span>
              <div className="text-3xl font-black text-emerald-700 font-mono">{revBonusPct}%</div>
              <span className="text-[11px] text-slate-600 font-mono block">
                ({revBonusPool.toLocaleString()} ÷ {revProfit.toLocaleString()}) × 100% = {revBonusPct}%
              </span>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default CompanyProfitBonusDistribution;
