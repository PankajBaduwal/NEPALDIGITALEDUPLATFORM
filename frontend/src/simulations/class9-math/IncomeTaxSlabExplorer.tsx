import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { DollarSign, ShieldCheck, Users, Calculator, RefreshCw, CheckCircle2 } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एक व्यक्तिको मासिक तलब Rs 40,000 छ भने 1 महिनाको चाडपर्व खर्चसहित वार्षिक कुल आम्दानी कति हुन्छ?',
    en: 'If a person earns Rs 40,000 per month, what is their annual income including 1 month festival allowance?',
    options: [
      { key: 'A', label: 'Rs 5,20,000' },
      { key: 'B', label: 'Rs 4,80,000' },
      { key: 'C', label: 'Rs 5,00,000' },
      { key: 'D', label: 'Rs 6,00,000' },
    ],
    answer: 'A',
  },
  {
    np: 'करयोग्य आय (Taxable Income) कसरी गणना गरिन्छ?',
    en: 'How is taxable income calculated?',
    options: [
      { key: 'A', label: 'Gross annual income − tax exemptions and deductions' },
      { key: 'B', label: 'Gross annual income + insurance premium' },
      { key: 'C', label: 'Monthly income × 12' },
      { key: 'D', label: 'Provident fund amount only' },
    ],
    answer: 'A',
  },
  {
    np: 'आयकर (Income Tax) कुन दरको आधारमा प्रगतिशील (Progressive) हुन्छ?',
    en: 'Why is income tax called progressive?',
    options: [
      { key: 'A', label: 'As the income slab rises, the tax rate also rises (higher income attracts higher tax slabs)' },
      { key: 'B', label: 'Everyone pays the same fixed percentage of tax' },
      { key: 'C', label: 'Tax is always at a decreasing rate' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'A',
  },
  {
    np: 'नागरिक लगानी कोष (CIT) र बीमामा जम्मा गरेको रकमले आयकरमा के प्रभाव पार्दछ?',
    en: 'What effect does depositing money into CIT and insurance have on income tax?',
    options: [
      { key: 'A', label: 'It reduces taxable income, so the tax payable is lower' },
      { key: 'B', label: 'It increases taxable income' },
      { key: 'C', label: 'It has no effect' },
      { key: 'D', label: 'The tax doubles' },
    ],
    answer: 'A',
  },
];

interface SlabTier {
  limit: number; // upper delta limit of this slab
  rate: number; // percentage
  labelNp: string;
  labelEn: string;
}

export const IncomeTaxSlabExplorer: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U2-01',
    chapter: 2,
    titleNp: 'आयकर क्यालकुलेटर र कर स्ल्याब अन्वेषक',
    titleEn: 'Income Tax Calculator & Slab Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'calc' | 'slabs' | 'practice'>('calc');

  // Calculator State
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single');
  const [monthlySalary, setMonthlySalary] = useState<number>(55000);
  const [hasDashainBonus, setHasDashainBonus] = useState<boolean>(true); // 13 months
  const [insuranceDeduction, setInsuranceDeduction] = useState<number>(25000);
  const [citDeduction, setCitDeduction] = useState<number>(50000); // Provident fund / CIT

  // Practice State
  const [practiceSalary, setPracticeSalary] = useState<number>(60000);
  const [userTaxGuess, setUserTaxGuess] = useState<string>('');
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);

  // Computed Income
  const monthsCount = hasDashainBonus ? 13 : 12;
  const grossAnnual = monthlySalary * monthsCount;
  const totalDeductions = insuranceDeduction + citDeduction;
  const taxableIncome = Math.max(0, grossAnnual - totalDeductions);

  // Slabs according to CDC Nepal Grade 9 Curriculum:
  // For Single: First 5,00,000 @ 1%, Next 2,00,000 @ 10%, Next 3,00,000 @ 20%, Next 10,00,000 @ 30%, Above @ 36%
  // For Married: First 6,00,000 @ 1%, Next 2,00,000 @ 10%, Next 3,00,000 @ 20%, Next 9,00,000 @ 30%, Above @ 36%
  const currentSlabs: SlabTier[] = useMemo(() => {
    const firstLimit = maritalStatus === 'single' ? 500000 : 600000;
    const fourthLimit = maritalStatus === 'single' ? 1000000 : 900000;
    return [
      {
        limit: firstLimit,
        rate: 1,
        labelNp: `First Rs. ${firstLimit.toLocaleString()} (Social Security)`,
        labelEn: `First Rs. ${firstLimit.toLocaleString()} (Social Security)`,
      },
      {
        limit: 200000,
        rate: 10,
        labelNp: 'Next, up to Rs. 2,00,000',
        labelEn: 'Next Rs. 2,00,000',
      },
      {
        limit: 300000,
        rate: 20,
        labelNp: 'Next, up to Rs. 3,00,000',
        labelEn: 'Next Rs. 3,00,000',
      },
      {
        limit: fourthLimit,
        rate: 30,
        labelNp: `Next Rs. ${fourthLimit.toLocaleString()}`,
        labelEn: `Next Rs. ${fourthLimit.toLocaleString()}`,
      },
      {
        limit: Infinity,
        rate: 36,
        labelNp: 'On the remaining amount above that',
        labelEn: 'Remaining Above',
      },
    ];
  }, [maritalStatus]);

  // Progressive Tax Calculation
  const breakdown = useMemo(() => {
    let rem = taxableIncome;
    let totalTax = 0;
    const items: {
      slabName: string;
      taxableInSlab: number;
      rate: number;
      taxAmount: number;
    }[] = [];

    for (const slab of currentSlabs) {
      if (rem <= 0) break;
      const amountInSlab = Math.min(rem, slab.limit);
      const taxForSlab = Math.round((amountInSlab * slab.rate) / 100);
      totalTax += taxForSlab;
      items.push({
        slabName: slab.labelNp,
        taxableInSlab: amountInSlab,
        rate: slab.rate,
        taxAmount: taxForSlab,
      });
      rem -= amountInSlab;
    }

    return { totalTax, items };
  }, [taxableIncome, currentSlabs]);

  // Check Practice Problem
  const handleCheckPractice = () => {
    // Annual gross for practice: practiceSalary * 13, deductions 0 for simplicity
    const gross = practiceSalary * 13;
    let rem = gross;
    let correctTax = 0;
    for (const s of currentSlabs) {
      if (rem <= 0) break;
      const amt = Math.min(rem, s.limit);
      correctTax += Math.round((amt * s.rate) / 100);
      rem -= amt;
    }

    const userVal = parseInt(userTaxGuess);
    if (Math.abs(userVal - correctTax) <= 10) {
      kit.good();
      setPracticeFeedback(L('🎉 शाबास! तपाईंले सही आयकर हिसाब गर्नुभयो!', '🎉 Correct! Accurate tax calculated!'));
    } else {
      kit.oops();
      setPracticeFeedback(
        L(
          `❌ मिलेन। सही वार्षिक आयकर Rs. ${correctTax.toLocaleString()} हो।`,
          `❌ Incorrect. The correct tax is Rs. ${correctTax.toLocaleString()}.`
        )
      );
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! कक्षा 9 एकाइ 2 "कर" (Tax) मा स्वागत छ। मासिक तलबबाट वार्षिक आयकर, कर छुट र कर स्ल्याबहरूको हिसाब सिकौं!',
        'Welcome to Grade 9 Unit 2: Tax! Explore progressive income tax calculation, eligible deductions, and tax slab tiers!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'calc' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🧮 {L('1. आयकर क्यालकुलेटर (Tax Calculator)', '1. Tax Calculator')}
          </button>
          <button
            onClick={() => setActiveTab('slabs')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'slabs' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 {L('2. कर स्ल्याब संरचना (Tax Slab Tiers)', '2. Tax Slabs')}
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'practice' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎯 {L('3. आयकर अभ्यास चुनौती (Practice Challenge)', '3. Practice')}
          </button>
        </div>

        {/* Tab 1: Income Tax Calculator */}
        {activeTab === 'calc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Controls */}
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                {L('व्यक्तिगत आय विवरण (Income & Deductions Entry)', 'Income & Deductions Entry')}
              </h3>

              {/* Status Radio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Marital status:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setMaritalStatus('single')}
                    className={`p-2 rounded-xl font-bold border transition ${
                      maritalStatus === 'single'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setMaritalStatus('married')}
                    className={`p-2 rounded-xl font-bold border transition ${
                      maritalStatus === 'married'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Couple / married
                  </button>
                </div>
              </div>

              {/* Monthly Salary Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Monthly salary:</span>
                  <span className="font-mono text-indigo-700 text-sm">
                    Rs. {monthlySalary.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="250000"
                  step="5000"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Dashain Bonus Checkbox */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={hasDashainBonus}
                  onChange={(e) => setHasDashainBonus(e.target.checked)}
                  className="accent-indigo-600 w-4 h-4"
                />
                <span>Include 1 month of festival allowance (Dashain allowance) ({monthsCount} months)</span>
              </label>

              {/* Eligible Deductions */}
              <div className="space-y-3 pt-2 border-t">
                <span className="text-xs font-bold text-slate-700 block">
                  Tax exemptions and deductions (eligible deductions):
                </span>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 font-semibold mb-1">
                    <span>Employees’ Provident Fund / Citizen Investment Trust (EPF/CIT):</span>
                    <span className="font-mono font-bold text-slate-800">Rs. {citDeduction.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="10000"
                    value={citDeduction}
                    onChange={(e) => setCitDeduction(parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 font-semibold mb-1">
                    <span>Life insurance premium deduction (max 40k):</span>
                    <span className="font-mono font-bold text-slate-800">Rs. {insuranceDeduction.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40000"
                    step="5000"
                    value={insuranceDeduction}
                    onChange={(e) => setInsuranceDeduction(parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Output Calculation Summary */}
            <div className="lg:col-span-6 space-y-4">
              {/* Grand Total Tax Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block">
                  Total annual income tax payable
                </span>
                <div className="text-4xl font-black text-amber-600 font-mono">
                  Rs. {breakdown.totalTax.toLocaleString()}
                </div>
                <div className="text-xs text-slate-600 flex justify-between pt-1">
                  <span>Tax deducted monthly (monthly TDS):</span>
                  <span className="font-bold font-mono text-slate-900">
                    Rs. {Math.round(breakdown.totalTax / 12).toLocaleString()} / month
                  </span>
                </div>
              </div>

              {/* Income Summary Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Gross annual income:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Rs. {grossAnnual.toLocaleString()} ({monthsCount} months)
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total tax deductions:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    − Rs. {totalDeductions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-slate-800">
                  <span>Taxable income:</span>
                  <span className="font-mono text-sm text-indigo-700">
                    Rs. {taxableIncome.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Step-by-Step Slab Breakdown Table */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm text-xs space-y-2">
                <span className="font-bold text-slate-800 block">
                  Tax calculation by slab (progressive slab breakdown):
                </span>
                <div className="space-y-1.5">
                  {breakdown.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{item.slabName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Rs. {item.taxableInSlab.toLocaleString()} at {item.rate}%
                        </div>
                      </div>
                      <span className="font-mono font-bold text-amber-700 text-sm">
                        Rs. {item.taxAmount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tax Slabs Visualization */}
        {activeTab === 'slabs' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            <h3 className="font-extrabold text-slate-800 text-sm text-center">
              Nepal Government’s income tax slab structure ({maritalStatus === 'single' ? 'Single' : 'Married'})
            </h3>

            <div className="space-y-3">
              {currentSlabs.map((s, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">{s.labelNp}</span>
                    <span className="text-[11px] text-slate-500">{s.labelEn}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-black rounded-full text-sm font-mono">
                      {s.rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-200">
              💡 <b>Social security tax:</b> The 1% tax on the first slab is treated as a contribution to the Social Security Fund.
            </p>
          </div>
        )}

        {/* Tab 3: Practice Problem Challenge */}
        {activeTab === 'practice' && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                {L('आयकर अभ्यास (Income Tax Practice Challenge)', 'Income Tax Practice Challenge')}
              </span>
              <h3 className="text-base font-extrabold text-slate-800 mt-2">
                A single person’s monthly salary is Rs. {practiceSalary.toLocaleString()} and they receive 1 month of Dashain allowance (no deductions). What is their annual income tax?
              </h3>
            </div>

            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="number"
                placeholder="Annual income tax (in rupees)..."
                value={userTaxGuess}
                onChange={(e) => {
                  setUserTaxGuess(e.target.value);
                  setPracticeFeedback(null);
                }}
                className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-sm bg-white"
              />
              <span className="self-center font-bold text-slate-700 text-sm">Rs.</span>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleCheckPractice}
                className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Check answer
              </button>
              <button
                onClick={() => {
                  const salaries = [35000, 45000, 60000, 75000, 90000];
                  setPracticeSalary(salaries[Math.floor(Math.random() * salaries.length)]);
                  setUserTaxGuess('');
                  setPracticeFeedback(null);
                }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border"
              >
                New salary
              </button>
            </div>

            {practiceFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold text-center border ${
                  practiceFeedback.includes('🎉')
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {practiceFeedback}
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default IncomeTaxSlabExplorer;
