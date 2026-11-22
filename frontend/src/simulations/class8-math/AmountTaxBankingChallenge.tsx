/**
 * AmountTaxBankingChallenge.tsx
 * Grade 8 Mathematics – Unit 7: SIMPLE INTEREST (साधारण ब्याज)
 * Simulation 3: Total Amount, Interest Tax & Banking Challenge (मिश्रधन, ब्याज कर र बैंकिङ चुनौती)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 7)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Landmark, FileText, DollarSign, Award, ArrowRight, ShieldCheck, CheckCircle, RefreshCw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: '७.५% ब्याजदरमा ४० महिना (१०/३ वर्ष) पछि मिश्रधन रु. २,३७५ हुन्छ भने सावाँ (P) कति थियो?',
    en: 'If the amount is Rs. 2,375 after 40 months (10/3 years) at 7.5% per annum, what was the principal (P)?',
    options: [
      { key: 'A', label: 'रु. १,९०० [ P = (१०० × २३७५) ÷ १२५ = १९०० ]' },
      { key: 'B', label: 'रु. २,०००' },
      { key: 'C', label: 'रु. १,८००' },
      { key: 'D', label: 'रु. १,८५०' },
    ],
    answer: 'A',
  },
  {
    np: 'रु. ४०,००० को ५% दरले ४ वर्षको कुल ब्याज रु. ८,००० हुन्छ। ५% ब्याज कर कटाउँदा खुद ब्याज (Net Interest) कति बाँकी रहन्छ?',
    en: 'Gross interest on Rs. 40,000 at 5% for 4 years is Rs. 8,000. After deducting 5% interest tax, what is the net interest?',
    options: [
      { key: 'A', label: 'रु. ७,६०० [ कर = ४००, खुद = ८००० - ४०० = ७६०० ]' },
      { key: 'B', label: 'रु. ७,८००' },
      { key: 'C', label: 'रु. ७,५००' },
      { key: 'D', label: 'रु. ७,२००' },
    ],
    answer: 'A',
  },
  {
    np: 'हरिले बैंकबाट १२% वार्षिक ब्याजदरमा रु. ३,००,००० ऋण लिएर २.५ वर्षमा चुक्ता गर्दा जम्मा कति रकम तिर्नुपर्छ?',
    en: 'Hari takes a loan of Rs. 300,000 at 12% for 2.5 years. What total amount must he repay?',
    options: [
      { key: 'A', label: 'रु. ३,९०,००० [ ब्याज ९०,००० + सावाँ ३००,००० = ३,९०,००० ]' },
      { key: 'B', label: 'रु. ३,८०,०००' },
      { key: 'C', label: 'रु. ४,००,०००' },
      { key: 'D', label: 'रु. ३,७५,०००' },
    ],
    answer: 'A',
  },
  {
    np: 'मिश्रधन (A) र दर (R) तथा समय (T) दिँदा सावाँ (P) निकाल्ने सूत्र कुन हो?',
    en: 'Which is the formula to calculate Principal (P) when Amount (A), Rate (R) and Time (T) are given?',
    options: [
      { key: 'A', label: 'P = (100 × A) / (100 + TR)' },
      { key: 'B', label: 'P = (100 × A) / (TR)' },
      { key: 'C', label: 'P = A - (TR / 100)' },
      { key: 'D', label: 'P = A × TR / 100' },
    ],
    answer: 'A',
  },
  {
    np: 'नेपालमा बैंक ब्याजमा लाग्ने कर कुन रकममा काटिन्छ?',
    en: 'In Nepal banking, on which amount is the withholding interest tax deducted?',
    options: [
      { key: 'A', label: 'प्राप्त ब्याज रकममा मात्र (Only on the earned interest)' },
      { key: 'B', label: 'सावाँ रकममा' },
      { key: 'C', label: 'मिश्रधन रकममा' },
      { key: 'D', label: 'बैंकको कुल पूँजीमा' },
    ],
    answer: 'A',
  },
];

export const AmountTaxBankingChallenge: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U7-03',
    chapter: 7,
    titleNp: 'मिश्रधन, ब्याज कर र बैंकिङ चुनौती (Amount, Tax & Banking Challenge)',
    titleEn: 'Amount, Tax and Banking Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'reverse_p' | 'interest_tax' | 'loan_repay' | 'challenge'>('reverse_p');

  // Tab 1: Reverse P from Amount (A = 2375, R = 7.5%, T = 40/12 = 3.333)
  const [givenA, setGivenA] = useState<number>(2375);
  const [givenR, setGivenR] = useState<number>(7.5);
  const [givenMonths, setGivenMonths] = useState<number>(40);
  const timeInYears = givenMonths / 12;
  const factorTR = timeInYears * givenR;
  const derivedP = (100 + factorTR > 0) ? (100 * givenA) / (100 + factorTR) : 0;
  const derivedI = givenA - derivedP;

  // Tab 2: Interest Tax Simulator (Bikram: P = 40000, T = 4, R = 5%, Tax = 5%)
  const [taxP, setTaxP] = useState<number>(40000);
  const [taxT, setTaxT] = useState<number>(4);
  const [taxR, setTaxR] = useState<number>(5);
  const [taxRatePct, setTaxRatePct] = useState<number>(5);

  const grossInterest = (taxP * taxT * taxR) / 100;
  const taxDeduction = (grossInterest * taxRatePct) / 100;
  const netInterest = grossInterest - taxDeduction;
  const netTotalAmount = taxP + netInterest;

  // Tab 3: Loan Repayment Simulator (Hari: 300,000, 12%, 2.5 yrs)
  const [loanP, setLoanP] = useState<number>(300000);
  const [loanR, setLoanR] = useState<number>(12);
  const [loanT, setLoanT] = useState<number>(2.5);

  const loanInterest = (loanP * loanT * loanR) / 100;
  const totalLoanRepay = loanP + loanInterest;
  const monthlyInstallment = loanT > 0 ? totalLoanRepay / (loanT * 12) : 0;

  // Tab 4: Interactive Challenge
  const [chalInput, setChalInput] = useState<string>('');
  const [chalFeedback, setChalFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  const handleCheckChallenge = () => {
    const val = parseFloat(chalInput);
    if (Math.abs(val - 7600) < 5) {
      kit.good();
      setChalFeedback({
        isCorrect: true,
        msg: L('उत्कृष्ट! खुद ब्याज रु. ७,६०० ठ्याक्कै सही छ!', 'Brilliant! Net interest Rs. 7,600 is exact!'),
      });
    } else {
      kit.oops();
      setChalFeedback({
        isCorrect: false,
        msg: L('पुनः प्रयास गर्नुहोस्! जम्मा ब्याज = रु. ८,०००, ५% कर = रु. ४००, खुद ब्याज = ८,००० - ४०० = ७,६००', 'Hint: Gross Interest = 8,000, Tax = 400, Net = 7,600'),
      });
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! मिश्रधनबाट सावाँ पत्ता लगाउने, सरकारको ५% ब्याज कर कटाउने र बैंक ऋण चुक्ता गर्ने व्यावहारिक गणित सिकौं!',
        'Hello! Let us learn how to find Principal from Amount, calculate 5% interest tax withholding, and manage loan repayments!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('reverse_p')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'reverse_p' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            {L('१. मिश्रधनबाट सावाँ (Find P from Amount)', '1. Find P from Amount')}
          </button>
          <button
            onClick={() => setActiveTab('interest_tax')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'interest_tax' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {L('२. ब्याज कर कट्टी (5% Interest Tax)', '2. Interest Tax Withholding')}
          </button>
          <button
            onClick={() => setActiveTab('loan_repay')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'loan_repay' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Landmark className="w-4 h-4" />
            {L('३. बैंक ऋण चुक्ता (Loan Repayment)', '3. Loan Repayment')}
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'challenge' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            {L('४. बैंकिङ चुनौती (CDC Challenge)', '4. CDC Challenge')}
          </button>
        </div>

        {/* Tab 1: Reverse P from Amount */}
        {activeTab === 'reverse_p' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('मिश्रधन (A) बाट सावाँ (P) पत्ता लगाउने विधि (CDC पाठ्यपुस्तक उदाहरण)', 'Finding Principal (P) from Amount (A)')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'सूत्र: A = P + I = P(1 + TR/100) ⇒ P = (100 × A) ÷ (100 + TR)',
                    'Formula: A = P(1 + TR/100) ⇒ P = (100 × A) ÷ (100 + TR)'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('मिश्रधन (Amount A):', 'Amount (A):')}</label>
                  <input
                    type="number"
                    value={givenA}
                    onChange={(e) => setGivenA(Math.max(100, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-indigo-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('समय (महिनामा):', 'Time (in months):')}</label>
                  <input
                    type="number"
                    value={givenMonths}
                    onChange={(e) => setGivenMonths(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    = {toNp(givenMonths)}/१२ = {toNp(timeInYears.toFixed(2))} {L('वर्ष', 'years')}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('ब्याजदर (Rate R %):', 'Rate (R %):')}</label>
                  <input
                    type="number"
                    value={givenR}
                    onChange={(e) => setGivenR(Math.max(0.1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Step by step display */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 font-mono text-xs">
                <div className="text-amber-400 font-bold uppercase">{L('चरणबद्ध समाधान (CDC Mathematical Solution):', 'CDC Step Solution:')}</div>
                <div>१. समय (T) = {toNp(givenMonths)} ÷ १२ = {toNp(timeInYears.toFixed(2))} वर्ष</div>
                <div>२. TR = {toNp(timeInYears.toFixed(2))} × {toNp(givenR)} = {toNp(factorTR.toFixed(2))}</div>
                <div>३. १०० + TR = १०० + {toNp(factorTR.toFixed(2))} = {toNp((100 + factorTR).toFixed(2))}</div>
                <div className="text-emerald-400 text-base font-bold pt-2 border-t border-slate-700">
                  ४. सावाँ P = (१०० × {toNp(givenA)}) ÷ {toNp((100 + factorTR).toFixed(2))} = <b>रु. {toNp(derivedP.toFixed(2))}</b>
                </div>
                <div className="text-slate-400">
                  ५. जम्मा ब्याज I = A - P = रु. {toNp(givenA)} - रु. {toNp(derivedP.toFixed(2))} = रु. {toNp(derivedI.toFixed(2))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interest Tax Simulator */}
        {activeTab === 'interest_tax' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('ब्याज कर कट्टी प्रणाली (Interest Tax Deduction - CDC पाठ्यपुस्तक उदाहरण)', 'Interest Tax Withholding (CDC Example)')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'विक्रमले रु. ४०,००० को ५% दरले ४ वर्षका लागि मुद्दती खातामा राख्दा ५% ब्याज कर कटाएपछि पाउने खुद रकम:',
                    'Bikram deposits Rs. 40,000 at 5% for 4 years. Calculate net amount received after 5% tax deduction:'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('सावाँ (P):', 'Principal (P):')}</label>
                  <input
                    type="number"
                    value={taxP}
                    onChange={(e) => setTaxP(Math.max(1000, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('समय (वर्ष):', 'Time (years):')}</label>
                  <input
                    type="number"
                    value={taxT}
                    onChange={(e) => setTaxT(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('ब्याजदर (R %):', 'Rate (R %):')}</label>
                  <input
                    type="number"
                    value={taxR}
                    onChange={(e) => setTaxR(Math.max(0.5, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-600 block mb-1">{L('ब्याज कर (Tax %):', 'Tax % on Interest:')}</label>
                  <input
                    type="number"
                    value={taxRatePct}
                    onChange={(e) => setTaxRatePct(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-rose-700"
                  />
                </div>
              </div>

              {/* Tax Flow Visual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 text-center">
                  <div className="text-xs text-blue-900 font-bold uppercase">{L('१. कुल ब्याज (Gross Interest)', '1. Gross Interest')}</div>
                  <div className="text-2xl font-black text-blue-800 my-2">रु. {toNp(grossInterest.toLocaleString())}</div>
                  <div className="text-[11px] text-blue-600">(P × T × R) ÷ १००</div>
                </div>

                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-center">
                  <div className="text-xs text-rose-900 font-bold uppercase">{L('२. ब्याज कर कट्टी (Tax)', '2. Tax Deduction')}</div>
                  <div className="text-2xl font-black text-rose-700 my-2">रु. {toNp(taxDeduction.toLocaleString())}</div>
                  <div className="text-[11px] text-rose-600">कुल ब्याजको {toNp(taxRatePct)}%</div>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
                  <div className="text-xs text-amber-900 font-bold uppercase">{L('३. खुद ब्याज (Net Interest)', '3. Net Interest')}</div>
                  <div className="text-2xl font-black text-amber-800 my-2">रु. {toNp(netInterest.toLocaleString())}</div>
                  <div className="text-[11px] text-amber-700">{toNp(grossInterest)} - {toNp(taxDeduction)}</div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 text-center">
                  <div className="text-xs text-emerald-900 font-bold uppercase">{L('४. अन्तिम फिर्ता रकम', '4. Final Amount')}</div>
                  <div className="text-2xl font-black text-emerald-700 my-2">रु. {toNp(netTotalAmount.toLocaleString())}</div>
                  <div className="text-[11px] text-emerald-600">सावाँ + खुद ब्याज</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Loan Repayment */}
        {activeTab === 'loan_repay' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('बैंक ऋण चुक्ता हिसाब (Commercial Bank Loan Repayment)', 'Commercial Bank Loan Repayment')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'CDC पाठ्यपुस्तक: हरिले बैंकबाट १२% ब्याजदरमा रु. ३,००,००० ऋण लिई २.५ वर्षमा चुक्ता गर्दा कति रकम तिर्नुपर्छ?',
                    'CDC Example: Hari borrows Rs. 300,000 at 12% for 2.5 years. What total amount must he repay?'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('ऋण रकम (Loan Amount P):', 'Loan Principal (P):')}</label>
                  <input
                    type="number"
                    value={loanP}
                    onChange={(e) => setLoanP(Math.max(10000, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('वार्षिक ब्याजदर (R %):', 'Annual Rate (R %):')}</label>
                  <input
                    type="number"
                    value={loanR}
                    onChange={(e) => setLoanR(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">{L('ऋण अवधि (वर्ष T):', 'Loan Term (Years T):')}</label>
                  <input
                    type="number"
                    value={loanT}
                    onChange={(e) => setLoanT(Math.max(0.5, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Repayment Summary */}
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-4 rounded-xl border border-indigo-200">
                  <div className="text-xs text-slate-500 font-bold uppercase">{L('जम्मा ब्याज रकम', 'Total Loan Interest')}</div>
                  <div className="text-2xl font-black text-rose-600 my-1">रु. {toNp(loanInterest.toLocaleString())}</div>
                  <div className="text-[11px] text-slate-400">({toNp(loanP)} × {toNp(loanT)} × {toNp(loanR)}) ÷ १००</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-indigo-200">
                  <div className="text-xs text-slate-500 font-bold uppercase">{L('कुल चुक्ता रकम (Total Repay)', 'Total Repay (A)')}</div>
                  <div className="text-2xl font-black text-indigo-700 my-1">रु. {toNp(totalLoanRepay.toLocaleString())}</div>
                  <div className="text-[11px] text-slate-400">सावाँ + ब्याज</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-indigo-200">
                  <div className="text-xs text-slate-500 font-bold uppercase">{L('मासिक किस्ता (Monthly EMI)', 'Monthly Approx')}</div>
                  <div className="text-2xl font-black text-emerald-700 my-1">रु. {toNp(monthlyInstallment.toFixed(0))}</div>
                  <div className="text-[11px] text-slate-400">{toNp(loanT * 12)} {L('महिनामा समान किस्ता', 'months')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Challenge */}
        {activeTab === 'challenge' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('बैंकिङ ब्याज कर चुनौती (CDC Textbook Challenge)', 'CDC Banking Tax Challenge')}
                </h3>
                <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-bold">
                  {L('परीक्षा तयारी', 'Exam Practice')}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-200">
                {L(
                  'विक्रमले रु. ४०,००० सावाँ ५% का दरले ४ वर्षका लागि बैंकमा जम्मा गरे। ५% ब्याज कर कटाउँदा उनले पाउने खुद ब्याज (Net Interest) कति हुन्छ? हिसाब गरी लेख्नुहोस्।',
                  'Bikram deposited Rs. 40,000 at 5% for 4 years in a bank. Deducting 5% tax on interest, calculate the Net Interest he receives.'
                )}
              </div>

              <div className="max-w-xs">
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {L('तपाईंको खुद ब्याज (रु.):', 'Your Net Interest (Rs.):')}
                </label>
                <input
                  type="number"
                  value={chalInput}
                  onChange={(e) => setChalInput(e.target.value)}
                  placeholder={L('रु. लेख्नुहोस्...', 'Enter Rs...')}
                  className="w-full px-4 py-2 border rounded-xl font-bold text-slate-800"
                />
              </div>

              <button
                onClick={handleCheckChallenge}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" /> {L('उत्तर जाँच्नुहोस्', 'Check Answer')}
              </button>

              {chalFeedback && (
                <div
                  className={`p-4 rounded-2xl text-sm font-semibold ${
                    chalFeedback.isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {chalFeedback.msg}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default AmountTaxBankingChallenge;
