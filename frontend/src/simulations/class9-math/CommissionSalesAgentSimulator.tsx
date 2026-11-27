import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { UserCheck, Home, DollarSign, Percent, PieChart, CheckCircle2 } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एक एजेन्टले रु ५०,००,००० मा जग्गा बिक्री गर्दा २% कमिशन पाउँछ भने उसको कमिशन रकम कति हुन्छ?',
    en: 'An agent receives 2% commission on selling land for Rs 50,00,000. What is the commission amount?',
    options: [
      { key: 'A', label: 'रु १,००,००० — (५०,००,००० × २% = १,००,०००)' },
      { key: 'B', label: 'रु ५०,०००' },
      { key: 'C', label: 'रु २,००,०००' },
      { key: 'D', label: 'रु १,५०,०००' },
    ],
    answer: 'A',
  },
  {
    np: 'कमिशन कटाएर जग्गाधनी (Owner) ले प्राप्त गर्ने खुद रकम कसरी निकालिन्छ?',
    en: 'How is the net amount received by the owner calculated after paying commission?',
    options: [
      { key: 'A', label: 'बिक्री मूल्य − कमिशन रकम (Selling Price − Commission)' },
      { key: 'B', label: 'बिक्री मूल्य + कमिशन रकम' },
      { key: 'C', label: 'कमिशन रकम × १००' },
      { key: 'D', label: 'बिक्री मूल्य ÷ २' },
    ],
    answer: 'A',
  },
  {
    np: 'स्ल्याबमा आधारित कमिशनमा रु २ लाखसम्म ५% र सोभन्दा माथि ३% दर भए रु ३ लाखको बिक्रीमा कुल कमिशन कति हुन्छ?',
    en: 'In slab commission with 5% up to 2 lakh and 3% above, what is the commission on 3 lakh sale?',
    options: [
      { key: 'A', label: 'रु १३,००० — (१०,००० + ३,००० = १३,०००)' },
      { key: 'B', label: 'रु १५,०००' },
      { key: 'C', label: 'रु ९,०००' },
      { key: 'D', label: 'रु १२,०००' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै प्रतिनिधिले मासिक तलब रु २०,००० र बिक्रीको १% कमिशन पाउँछन्। रु १० लाखको बिक्री हुँदा उनको कुल मासिक आम्दानी कति हुन्छ?',
    en: 'A representative earns Rs 20,000 monthly salary plus 1% sales commission. On Rs 10 lakh sales, what is total monthly income?',
    options: [
      { key: 'A', label: 'रु ३०,००० — (२०,००० + १०,००० = ३०,०००)' },
      { key: 'B', label: 'रु २०,०००' },
      { key: 'C', label: 'रु २५,०००' },
      { key: 'D', label: 'रु ४०,०००' },
    ],
    answer: 'A',
  },
];

interface PropertyPreset {
  id: string;
  nameNp: string;
  nameEn: string;
  icon: string;
  defaultPrice: number;
  defaultRate: number;
}

const PROPERTY_PRESETS: PropertyPreset[] = [
  { id: 'land', nameNp: 'घडेरी जग्गा (Land Plot)', nameEn: 'Land Plot', icon: '🏞️', defaultPrice: 4000000, defaultRate: 2 },
  { id: 'house', nameNp: 'आवासीय घर (Residential House)', nameEn: 'House', icon: '🏡', defaultPrice: 8500000, defaultRate: 1.5 },
  { id: 'car', nameNp: 'सवारी साधन (Vehicle)', nameEn: 'Vehicle', icon: '🚗', defaultPrice: 1500000, defaultRate: 3 },
  { id: 'goods', nameNp: 'थोक सामान (Wholesale Goods)', nameEn: 'Wholesale Goods', icon: '📦', defaultPrice: 500000, defaultRate: 5 },
];

export const CommissionSalesAgentSimulator: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U3-01',
    chapter: 3,
    titleNp: 'कमिशन र बिक्री प्रतिनिधि सिमुलेटर',
    titleEn: 'Commission & Sales Agent Simulator',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'flat' | 'slabs' | 'salary_plus'>('flat');

  // Flat Commission State
  const [selectedPreset, setSelectedPreset] = useState<PropertyPreset>(PROPERTY_PRESETS[0]);
  const [sellingPrice, setSellingPrice] = useState<number>(PROPERTY_PRESETS[0].defaultPrice);
  const [commissionRate, setCommissionRate] = useState<number>(PROPERTY_PRESETS[0].defaultRate);

  // Slab Commission State
  const [slabPrice, setSlabPrice] = useState<number>(600000);

  // Salary Plus Commission State
  const [baseSalary, setBaseSalary] = useState<number>(22000);
  const [agentSales, setAgentSales] = useState<number>(800000);
  const [agentBonusRate, setAgentBonusRate] = useState<number>(1.5);

  // Computed Flat Commission
  const commissionAmount = Math.round((sellingPrice * commissionRate) / 100);
  const ownerAmount = sellingPrice - commissionAmount;

  // Computed Slab Commission:
  // First 2,00,000 @ 5%
  // Next 3,00,000 (up to 5,00,000) @ 4%
  // Above 5,00,000 @ 2%
  const slabBreakdown = useMemo(() => {
    let rem = slabPrice;
    let s1 = 0, s2 = 0, s3 = 0;
    if (rem > 0) {
      s1 = Math.min(rem, 200000);
      rem -= s1;
    }
    if (rem > 0) {
      s2 = Math.min(rem, 300000);
      rem -= s2;
    }
    if (rem > 0) {
      s3 = rem;
    }

    const comm1 = Math.round((s1 * 5) / 100);
    const comm2 = Math.round((s2 * 4) / 100);
    const comm3 = Math.round((s3 * 2) / 100);
    const totalComm = comm1 + comm2 + comm3;

    return { s1, s2, s3, comm1, comm2, comm3, totalComm };
  }, [slabPrice]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! कक्षा ९ एकाइ ३ "कमिशन र लाभांश" मा स्वागत छ। बिक्री प्रतिनिधि, कमिशन दर, धनीले पाउने रकम र स्ल्याब कमिशनको हिसाब सिकौं!',
        'Welcome to Unit 3: Commission and Dividend! Simulate sales agent commissions, owner proceeds, and tiered commission slabs!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('flat')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'flat' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🤝 {L('१. निश्चित दर कमिशन (Flat Commission)', '1. Flat Commission')}
          </button>
          <button
            onClick={() => setActiveTab('slabs')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'slabs' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 {L('२. स्ल्याब कमिशन (Tiered Commission)', '2. Slab Commission')}
          </button>
          <button
            onClick={() => setActiveTab('salary_plus')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'salary_plus' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            💼 {L('३. तलब + कमिशन (Salary + Commission)', '3. Salary + Commission')}
          </button>
        </div>

        {/* Tab 1: Flat Rate Commission */}
        {activeTab === 'flat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls */}
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-600" />
                बिक्री तथा कमिशन दर विवरण
              </h3>

              {/* Presets */}
              <div className="grid grid-cols-2 gap-2">
                {PROPERTY_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPreset(p);
                      setSellingPrice(p.defaultPrice);
                      setCommissionRate(p.defaultRate);
                    }}
                    className={`p-2 rounded-xl border text-left transition ${
                      selectedPreset.id === p.id
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300 shadow'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xl">{p.icon}</div>
                    <div className="text-xs font-bold mt-1">{p.nameNp.split(' ')[0]}</div>
                  </button>
                ))}
              </div>

              {/* Selling Price Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>बिक्री मूल्य (Selling Price):</span>
                  <span className="font-mono text-indigo-700 text-sm">
                    रु. {sellingPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="10000000"
                  step="100000"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Commission Rate Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>कमिशन दर (Commission Rate):</span>
                  <span className="font-mono text-emerald-700 text-sm">{commissionRate}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Right: Distribution Breakdown */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-200 space-y-4">
                <h4 className="font-extrabold text-slate-800 text-sm">
                  रकम बाँडफाँड (Proceeds Distribution)
                </h4>

                {/* Progress bar visualizer */}
                <div className="w-full h-8 rounded-full overflow-hidden flex shadow-inner border">
                  <div
                    style={{ width: `${100 - commissionRate}%` }}
                    className="bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold"
                  >
                    धनी ({(100 - commissionRate).toFixed(1)}%)
                  </div>
                  <div
                    style={{ width: `${commissionRate}%` }}
                    className="bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold"
                  >
                    {commissionRate}%
                  </div>
                </div>

                {/* Detailed Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <span className="text-emerald-800 font-bold block">एजेन्टले पाउने कमिशन:</span>
                    <div className="text-lg font-black text-emerald-700 font-mono">
                      रु. {commissionAmount.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      ({sellingPrice.toLocaleString()} × {commissionRate}%)
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                    <span className="text-blue-800 font-bold block">जग्गा/घरधनीले पाउने खुद रकम:</span>
                    <div className="text-lg font-black text-blue-700 font-mono">
                      रु. {ownerAmount.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      (कुल बिक्री − कमिशन)
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanatory Box */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 font-semibold space-y-1">
                <div>• कमिशन रकम = बिक्री मूल्य × कमिशन दर%</div>
                <div>• धनीले पाउने रकम = बिक्री मूल्य − कमिशन रकम</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tiered / Slab Commission */}
        {activeTab === 'slabs' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            <h3 className="font-extrabold text-slate-800 text-sm text-center">
              स्ल्याबमा आधारित कमिशन प्रणाली (Tiered Commission Structure)
            </h3>

            {/* Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>कुल बिक्री रकम (Total Sale Amount):</span>
                <span className="font-mono text-indigo-700 text-sm">
                  रु. {slabPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="2000000"
                step="50000"
                value={slabPrice}
                onChange={(e) => setSlabPrice(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Slabs Grid */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 block">स्ल्याब १: पहिलो रु. २,००,००० सम्म (५%)</span>
                  <span className="text-slate-500 font-mono">रु. {slabBreakdown.s1.toLocaleString()} मा ५%</span>
                </div>
                <span className="font-mono font-bold text-amber-700 text-sm">
                  रु. {slabBreakdown.comm1.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 block">स्ल्याब २: त्यसपछिको रु. ३,००,००० सम्म (४%)</span>
                  <span className="text-slate-500 font-mono">रु. {slabBreakdown.s2.toLocaleString()} मा ४%</span>
                </div>
                <span className="font-mono font-bold text-amber-700 text-sm">
                  रु. {slabBreakdown.comm2.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 block">स्ल्याब ३: रु. ५,००,००० भन्दा माथिको बाँकी (२%)</span>
                  <span className="text-slate-500 font-mono">रु. {slabBreakdown.s3.toLocaleString()} मा २%</span>
                </div>
                <span className="font-mono font-bold text-amber-700 text-sm">
                  रु. {slabBreakdown.comm3.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Total Slab Commission */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-950 text-sm">कुल कमिशन रकम:</span>
              <span className="font-mono font-black text-xl text-emerald-700">
                रु. {slabBreakdown.totalComm.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Salary Plus Commission */}
        {activeTab === 'salary_plus' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm text-center">
              बिक्री प्रतिनिधि मासिक आम्दानी (मासिक तलब + बिक्री कमिशन)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">निश्चित मासिक तलब (रु):</label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">महिनाको कुल बिक्री (रु):</label>
                <input
                  type="number"
                  value={agentSales}
                  onChange={(e) => setAgentSales(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">बिक्री कमिशन दर (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={agentBonusRate}
                  onChange={(e) => setAgentBonusRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>
            </div>

            {/* Result */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span>१. कमिशन रकम:</span>
                <span className="font-mono font-bold text-sm text-indigo-800">
                  रु. {Math.round((agentSales * agentBonusRate) / 100).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-indigo-200 font-black text-sm text-indigo-950">
                <span>२. कुल मासिक आम्दानी (तलब + कमिशन):</span>
                <span className="font-mono text-lg text-indigo-700">
                  रु. {(baseSalary + Math.round((agentSales * agentBonusRate) / 100)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default CommissionSalesAgentSimulator;
