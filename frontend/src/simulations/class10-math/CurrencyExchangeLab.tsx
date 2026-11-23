import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

interface CurrencyInfo {
  code: string;
  nameEn: string;
  nameNp: string;
  symbol: string;
  unit: number;
  buyRate: number; // in NPR per unit
  sellRate: number; // in NPR per unit
}

export const CurrencyExchangeLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U4-01',
    chapter: 4,
    titleNp: 'मुद्रा विनिमय तथा रूपान्तरण प्रयोगशाला',
    titleEn: 'Currency Exchange and Conversion Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'counter' | 'chainRule' | 'scenarios' | 'challenge'>('counter');

  // Sample rates based on Nepal Rastra Bank CDC textbook patterns (demonstration rates)
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>([
    { code: 'USD', nameEn: 'US Dollar', nameNp: 'अमेरिकी डलर', symbol: '$', unit: 1, buyRate: 132.50, sellRate: 133.10 },
    { code: 'EUR', nameEn: 'European Euro', nameNp: 'युरोपियन यूरो', symbol: '€', unit: 1, buyRate: 142.20, sellRate: 142.85 },
    { code: 'GBP', nameEn: 'UK Pound Sterling', nameNp: 'युके पाउन्ड स्टर्लिङ', symbol: '£', unit: 1, buyRate: 166.40, sellRate: 167.15 },
    { code: 'AUD', nameEn: 'Australian Dollar', nameNp: 'अष्ट्रेलियन डलर', symbol: 'A$', unit: 1, buyRate: 86.80, sellRate: 87.20 },
    { code: 'CAD', nameEn: 'Canadian Dollar', nameNp: 'क्यानेडियन डलर', symbol: 'C$', unit: 1, buyRate: 97.50, sellRate: 97.95 },
    { code: 'JPY', nameEn: 'Japanese Yen (10)', nameNp: 'जापानी येन (१०)', symbol: '¥', unit: 10, buyRate: 8.85, sellRate: 8.89 },
    { code: 'INR', nameEn: 'Indian Rupee (100)', nameNp: 'भारतीय रुपैयाँ (१००)', symbol: '₹', unit: 100, buyRate: 160.00, sellRate: 160.15 },
    { code: 'QAR', nameEn: 'Qatari Riyal', nameNp: 'कतारी रियाल', symbol: 'QR', unit: 1, buyRate: 36.35, sellRate: 36.52 },
  ]);

  // ── TAB A: DIRECT CONVERTER (BUYING VS SELLING RATE) ────────────────────────
  const [selectedCurrCode, setSelectedCurrCode] = useState<string>('USD');
  // Transaction type:
  // 'sell_to_bank': Customer gives foreign currency, bank buys at buyRate -> Customer gets NPR
  // 'buy_from_bank': Customer gives NPR, bank sells foreign currency at sellRate -> Customer gets foreign currency
  const [transactionType, setTransactionType] = useState<'sell_to_bank' | 'buy_from_bank'>('sell_to_bank');
  const [inputAmount, setInputAmount] = useState<number>(500);

  const activeCurrency = currencies.find((c) => c.code === selectedCurrCode) || currencies[0];
  const ratePerSingleUnit = transactionType === 'sell_to_bank'
    ? activeCurrency.buyRate / activeCurrency.unit
    : activeCurrency.sellRate / activeCurrency.unit;

  const convertedResult = transactionType === 'sell_to_bank'
    ? inputAmount * ratePerSingleUnit // Foreign to NPR
    : inputAmount / ratePerSingleUnit; // NPR to Foreign

  // ── TAB B: CROSS-CURRENCY CHAIN RULE ─────────────────────────────────────────
  // E.g., CAD to JPY via NPR (or USD to GBP via NPR)
  const [chainFrom, setChainFrom] = useState<string>('CAD');
  const [chainTo, setChainTo] = useState<string>('JPY');
  const [chainAmount, setChainAmount] = useState<number>(1000);

  const currFrom = currencies.find((c) => c.code === chainFrom) || currencies[4];
  const currTo = currencies.find((c) => c.code === chainTo) || currencies[5];

  // Step 1: Convert Starting Currency to NPR (Bank buys starting currency at buyRate)
  const step1NPR = chainAmount * (currFrom.buyRate / currFrom.unit);
  // Step 2: Convert NPR to Target Currency (Bank sells target currency at sellRate)
  const step2Final = step1NPR / (currTo.sellRate / currTo.unit);

  // ── TAB C: PRACTICAL TEXTBOOK SCENARIOS ──────────────────────────────────────
  const [scenarioType, setScenarioType] = useState<'travel' | 'export_tax' | 'depreciation'>('travel');

  // Travel Scenario: Nepali student going to Australia, tuition = AUD 15,000
  const [tuitionAUD, setTuitionAUD] = useState<number>(15000);
  const tuitionNPR = tuitionAUD * (currencies.find((c) => c.code === 'AUD')!.sellRate);

  // Export Tax Scenario: Pashmina export
  // Cost price = NPR 4,00,000, Export tax = 5%, Sold in USA for USD 3,800
  const [pashminaCostNPR, setPashminaCostNPR] = useState<number>(400000);
  const [exportTaxPercent, setExportTaxPercent] = useState<number>(5);
  const [sellingPriceUSD, setSellingPriceUSD] = useState<number>(3800);
  const totalCostWithTax = pashminaCostNPR * (1 + exportTaxPercent / 100);
  const earnedNPR = sellingPriceUSD * (currencies.find((c) => c.code === 'USD')!.buyRate);
  const netExportProfitNPR = earnedNPR - totalCostWithTax;

  // ── TAB D: CHALLENGE QUIZ ───────────────────────────────────────────────────
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);

  const quizQuestions = [
    {
      qNp: 'यदि १ अमेरिकी डलरको खरिददर रु. १३२.५० र बिक्रीदर रु. १३३.१० छ भने, ५०० डलर बैंकमा साट्दा कति नेपाली रुपैयाँ पाइन्छ?',
      qEn: 'If 1 USD has Buying rate Rs 132.50 and Selling rate Rs 133.10, how many NPR will you receive by selling 500 USD to the bank?',
      opts: ['रु. ६६,२५०', 'रु. ६६,५५०', 'रु. ६६,०००', 'रु. ६५,८००'],
      correct: 0,
      expNp: 'बैंकले विदेशी मुद्रा किन्ने भएकोले खरिददर (Buying Rate) लाग्छ: ५०० × १३२.५० = रु. ६६,२५०',
      expEn: 'Bank purchases foreign currency at Buying Rate: 500 × 132.50 = NPR 66,250',
    },
    {
      qNp: 'नेपाली रुपैयाँको अवमूल्यन (Depreciation) हुँदा विदेशी मुद्रा किन्ने नेपाली नागरिकलाई के असर पर्छ?',
      qEn: 'When Nepalese Rupee depreciates against foreign currency, how does it affect a Nepali citizen buying foreign currency?',
      opts: [
        'विदेशी मुद्रा किन्न धेरै रुपैयाँ तिर्नुपर्छ (महङ्गो हुन्छ)',
        'विदेशी मुद्रा किन्न थोरै रुपैयाँ तिरे पुग्छ (सस्तो हुन्छ)',
        'कुनै असर पर्दैन',
        'बैंकले ब्याज दिन्छ',
      ],
      correct: 0,
      expNp: 'रुपैयाँको अवमूल्यन हुँदा १ डलर वा पाउन्ड किन्न पहिलेभन्दा बढी रुपैयाँ तिर्नुपर्दछ।',
      expEn: 'When domestic currency depreciates, purchasing foreign currency requires more domestic currency.',
    },
    {
      qNp: 'चेन रुल (Chain Rule) अनुसार यदि A/B × B/C = A/C हुन्छ भने, १ क्यानेडियन डलरको जापानी येनसँगको विनिमय दर कुन मध्यवर्ती मुद्राबाट निकाल्न सकिन्छ?',
      qEn: 'By Chain Rule, which intermediate currency can convert Canadian Dollars (CAD) to Japanese Yen (JPY)?',
      opts: ['नेपाली रुपैयाँ (NPR)', 'सुन', 'जग्गा', 'कुनै पनि होइन'],
      correct: 0,
      expNp: 'नेपालमा CAD बाट NPR र त्यसपछि NPR बाट JPY मा रूपान्तरण गरी चेन रुल लागू गरिन्छ।',
      expEn: 'In Nepal, CAD is converted to NPR, then NPR is converted to JPY using the chain rule.',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'नमस्ते! कक्षा १० गणितको एकाइ ४: मुद्रा र विनिमय दर (Currency and Exchange Rate) प्रयोगशालामा स्वागत छ! यहाँ खरिददर, बिक्रीदर, चेन रुल, र अन्तर्राष्ट्रिय कारोबारको नाफा-नोक्सान अन्वेषण गर्नुहोस्!',
        'Welcome to Grade 10 Currency Exchange and Conversion Laboratory! Explore bank buying/selling rates, chain rule cross-conversions, and international business transactions!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'counter', labelNp: 'क) मुद्रा विनिमय काउन्टर (Buying vs Selling)', labelEn: 'A) Exchange Counter' },
            { id: 'chainRule', labelNp: 'ख) क्रस-मुद्रा विनिमय (Chain Rule)', labelEn: 'B) Cross-Currency Chain' },
            { id: 'scenarios', labelNp: 'ग) व्यावहारिक कारोबारहरू (Scenarios)', labelEn: 'C) Business Scenarios' },
            { id: 'challenge', labelNp: 'घ) अभ्यास चुनौती (Quiz)', labelEn: 'D) Practice Quiz' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                kit.tap();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-[#167C80] text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-[#142D4E] border border-slate-200'
              }`}
            >
              {isNe ? tab.labelNp : tab.labelEn}
            </button>
          ))}
        </div>

        {/* ── TAB A: EXCHANGE COUNTER (BUYING VS SELLING RATE) ───────────────────── */}
        {activeTab === 'counter' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Currency Rates Board */}
            <div className="md:col-span-7 bg-[#142D4E] text-white p-4 rounded-2xl shadow-md space-y-3">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-amber-400">
                    {L('नेपाल राष्ट्र बैंक विनिमय दर तालिका (नमुना दर)', 'Exchange Rates Board (Sample Rates)')}
                  </h3>
                  <span className="text-[10px] text-slate-300">
                    {L('* शैक्षिक प्रयोजनको लागि नमुना दरहरू', '* Demonstration rates for learning')}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="py-1.5">{L('मुद्रा (Currency)', 'Currency')}</th>
                      <th className="py-1.5">{L('एकाइ (Unit)', 'Unit')}</th>
                      <th className="py-1.5 text-emerald-400">{L('खरिददर (Buying Rate NPR)', 'Buy Rate')}</th>
                      <th className="py-1.5 text-amber-400">{L('बिक्रीदर (Selling Rate NPR)', 'Sell Rate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currencies.map((c) => {
                      const isSelected = c.code === selectedCurrCode;
                      return (
                        <tr
                          key={c.code}
                          onClick={() => {
                            setSelectedCurrCode(c.code);
                            kit.tap();
                          }}
                          className={`cursor-pointer border-b border-slate-800 transition-all ${
                            isSelected ? 'bg-white/10 font-bold text-white' : 'hover:bg-white/5 text-slate-200'
                          }`}
                        >
                          <td className="py-1.5">
                            <span className="font-mono text-cyan-300 font-bold mr-1">{c.symbol}</span>
                            {c.code} - {isNe ? c.nameNp : c.nameEn}
                          </td>
                          <td className="py-1.5 font-mono">{fmt(c.unit)}</td>
                          <td className="py-1.5 font-mono text-emerald-300">रु. {fmt(c.buyRate.toFixed(2))}</td>
                          <td className="py-1.5 font-mono text-amber-300">रु. {fmt(c.sellRate.toFixed(2))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Calculator */}
            <div className="md:col-span-5 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-[#142D4E] text-base">
                {L('कारोबार प्रकार छान्नुहोस्:', 'Select Transaction Type:')}
              </h3>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setTransactionType('sell_to_bank')}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                    transactionType === 'sell_to_bank'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{L('१) मसँग विदेशी मुद्रा छ, म साट्न चाहन्छु', '1) Customer Sells Foreign Currency to Bank')}</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">खरिददर (Buy Rate)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-normal">
                    {L('बैंकले तपाईंबाट विदेशी मुद्रा किन्छ र नेपाली रुपैयाँ (NPR) दिन्छ।', 'Bank buys foreign currency from customer and pays NPR.')}
                  </p>
                </button>

                <button
                  onClick={() => setTransactionType('buy_from_bank')}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                    transactionType === 'buy_from_bank'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{L('२) मलाई विदेशी मुद्रा चाहिएको छ (किन्न चाहन्छु)', '2) Customer Buys Foreign Currency from Bank')}</span>
                    <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">बिक्रीदर (Sell Rate)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-normal">
                    {L('बैंकले तपाईंलाई विदेशी मुद्रा बेच्छ, तपाईंले नेपाली रुपैयाँ तिर्नुपर्छ।', 'Bank sells foreign currency to customer for NPR.')}
                  </p>
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {transactionType === 'sell_to_bank'
                    ? L(`विदेशी मुद्राको परिमाण (${activeCurrency.code}):`, `Foreign Amount (${activeCurrency.code}):`)
                    : L('नेपाली रुपैयाँको परिमाण (NPR):', 'NPR Amount to Spend:')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border rounded-xl font-mono text-sm font-bold text-slate-900"
                />
              </div>

              {/* Step-by-Step Calculation Result */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5 font-mono text-xs text-teal-950">
                <span className="font-bold text-[#167C80] block uppercase tracking-wide">
                  {L('हिसाब प्रक्रिया (Mathematical Calculation):', 'Step-by-Step Calculation:')}
                </span>

                {transactionType === 'sell_to_bank' ? (
                  <div>
                    <div>१ {activeCurrency.code} को खरिददर = रु. {fmt((activeCurrency.buyRate / activeCurrency.unit).toFixed(2))}</div>
                    <div>प्राप्त हुने रकम = {fmt(inputAmount)} × {fmt((activeCurrency.buyRate / activeCurrency.unit).toFixed(2))}</div>
                    <div className="text-sm font-bold text-[#142D4E] pt-1">
                      ➔ कुल प्राप्त NPR = रु. {fmt(convertedResult.toFixed(2))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div>१ {activeCurrency.code} को बिक्रीदर = रु. {fmt((activeCurrency.sellRate / activeCurrency.unit).toFixed(2))}</div>
                    <div>प्राप्त हुने मुद्रा = रु. {fmt(inputAmount)} ÷ {fmt((activeCurrency.sellRate / activeCurrency.unit).toFixed(2))}</div>
                    <div className="text-sm font-bold text-[#142D4E] pt-1">
                      ➔ कुल प्राप्त = {activeCurrency.symbol} {fmt(convertedResult.toFixed(2))} {activeCurrency.code}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB B: CROSS-CURRENCY CHAIN RULE ───────────────────────────────────── */}
        {activeTab === 'chainRule' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded text-xs text-blue-950">
              <span className="font-bold">{L('चेन रुल (Chain Rule) को नियम:', 'Chain Rule Principle:')}</span>
              <p className="mt-1">
                {L(
                  'जब दुई विदेशी मुद्राहरू बीच सिधा विनिमय दर हुँदैन, तब मध्यवर्ती मुद्रा (नेपाली रुपैयाँ NPR) मार्फत चेन रुल प्रयोग गरिन्छ: सुरुको मुद्रा ➔ नेपाली रुपैयाँ (NPR) ➔ अन्तिम गन्तव्य मुद्रा।',
                  'When direct rates between two foreign currencies are unavailable, an intermediate currency (NPR) bridges the transaction: Source Currency ➔ NPR ➔ Destination Currency.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">सुरुको मुद्रा (From):</span>
                <select
                  value={chainFrom}
                  onChange={(e) => setChainFrom(e.target.value)}
                  className="w-full p-2 border rounded-xl font-bold text-xs"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} - {c.nameEn}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">परिमाण (Amount):</span>
                <input
                  type="number"
                  value={chainAmount}
                  onChange={(e) => setChainAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded-xl font-mono font-bold text-xs"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">गन्तव्य मुद्रा (To):</span>
                <select
                  value={chainTo}
                  onChange={(e) => setChainTo(e.target.value)}
                  className="w-full p-2 border rounded-xl font-bold text-xs"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} - {c.nameEn}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chain Visual Diagram */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-around gap-2 text-center">
              <div className="p-3 bg-blue-600/30 border border-blue-400 rounded-xl">
                <span className="text-xs text-blue-300 block">सुरुको मुद्रा</span>
                <span className="text-base font-bold font-mono">{fmt(chainAmount)} {currFrom.code}</span>
              </div>

              <span className="text-xl text-amber-400 font-bold">➔</span>

              <div className="p-3 bg-amber-600/30 border border-amber-400 rounded-xl">
                <span className="text-xs text-amber-300 block">मध्यवर्ती मुद्रा (NPR)</span>
                <span className="text-base font-bold font-mono">रु. {fmt(step1NPR.toFixed(2))}</span>
              </div>

              <span className="text-xl text-emerald-400 font-bold">➔</span>

              <div className="p-3 bg-emerald-600/30 border border-emerald-400 rounded-xl">
                <span className="text-xs text-emerald-300 block">अन्तिम प्राप्त मुद्रा</span>
                <span className="text-base font-bold font-mono">{currTo.symbol} {fmt(step2Final.toFixed(2))} {currTo.code}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border rounded-xl font-mono text-xs space-y-1">
              <div className="font-bold text-[#142D4E]">चेन रुल समीकरण (Chain Rule Equation):</div>
              <div>१) {fmt(chainAmount)} {currFrom.code} = रु. {fmt(chainAmount)} × ({fmt(currFrom.buyRate)} / {fmt(currFrom.unit)}) = रु. {fmt(step1NPR.toFixed(2))}</div>
              <div>२) रु. {fmt(step1NPR.toFixed(2))} = रु. {fmt(step1NPR.toFixed(2))} ÷ ({fmt(currTo.sellRate)} / {fmt(currTo.unit)}) = <span className="font-bold text-emerald-700 text-sm">{fmt(step2Final.toFixed(2))} {currTo.code}</span></div>
            </div>
          </div>
        )}

        {/* ── TAB C: PRACTICAL SCENARIOS ────────────────────────────────────────── */}
        {activeTab === 'scenarios' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setScenarioType('travel')}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  scenarioType === 'travel' ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('१) विदेश अध्ययन / भ्रमण (Travel & Tuition)', '1) Travel & Tuition')}
              </button>
              <button
                onClick={() => setScenarioType('export_tax')}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  scenarioType === 'export_tax' ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('२) निर्यात कर तथा नाफा-नोक्सान (Export Tax & Profit)', '2) Export Tax & Profit')}
              </button>
            </div>

            {scenarioType === 'travel' && (
              <div className="space-y-3">
                <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3 rounded text-xs text-emerald-950">
                  <span className="font-bold">{L('अष्ट्रेलिया अध्ययन शुल्क भुक्तानी:', 'Australian University Fee Payment:')}</span>
                  <p className="mt-1">
                    {L(
                      'एक नेपाली विद्यार्थीले अष्ट्रेलियाको कलेजमा शुल्क बापत AUD 15,000 पठाउनुपर्नेछ। बैंकको बिक्रीदर A$ 1 = रु. 87.20 हुँदा कति नेपाली रुपैयाँ आवश्यक पर्छ?',
                      'A Nepali student needs to pay AUD 15,000 college fees in Australia. If bank selling rate is A$ 1 = NPR 87.20, how much NPR is needed?'
                    )}
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  <span className="text-xs font-bold text-slate-700">कलेज शुल्क (AUD):</span>
                  <input
                    type="number"
                    value={tuitionAUD}
                    onChange={(e) => setTuitionAUD(parseFloat(e.target.value) || 0)}
                    className="p-1.5 border rounded-lg font-mono font-bold text-xs"
                  />
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl font-mono text-xs space-y-1">
                  <div>आवश्यक नेपाली रुपैयाँ = AUD {fmt(tuitionAUD)} × रु. ८७.२० (बिक्रीदर)</div>
                  <div className="text-base font-bold text-[#142D4E] pt-1">
                    ➔ कुल भुक्तानी गर्नुपर्ने = रु. {fmt(tuitionNPR.toLocaleString())}
                  </div>
                </div>
              </div>
            )}

            {scenarioType === 'export_tax' && (
              <div className="space-y-3">
                <div className="bg-amber-50 border-l-4 border-amber-600 p-3 rounded text-xs text-amber-950">
                  <span className="font-bold">{L('पश्मिना निर्यात कारोबार:', 'Pashmina Shawls Export Transaction:')}</span>
                  <p className="mt-1">
                    {L(
                      'नेपाली व्यापारीले रु. ४,००,००० मा पश्मिना किनेर ५% निर्यात कर तिरी अमेरिकामा USD 3,800 मा बेचे। यदि डलरको खरिददर रु. 132.50 भए नाफा वा नोक्सान कति भयो?',
                      'A merchant bought pashmina for NPR 400,000, paid 5% export tax, and sold in USA for USD 3,800. With buy rate USD 1 = NPR 132.50, what is the profit/loss?'
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-600 block">खरिद मूल्य (NPR):</span>
                    <input type="number" value={pashminaCostNPR} onChange={(e) => setPashminaCostNPR(parseFloat(e.target.value) || 0)} className="w-full p-1.5 border rounded font-mono font-bold" />
                  </div>
                  <div>
                    <span className="text-slate-600 block">निर्यात कर (%):</span>
                    <input type="number" value={exportTaxPercent} onChange={(e) => setExportTaxPercent(parseFloat(e.target.value) || 0)} className="w-full p-1.5 border rounded font-mono font-bold" />
                  </div>
                  <div>
                    <span className="text-slate-600 block">बिक्री रकम (USD):</span>
                    <input type="number" value={sellingPriceUSD} onChange={(e) => setSellingPriceUSD(parseFloat(e.target.value) || 0)} className="w-full p-1.5 border rounded font-mono font-bold" />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl font-mono text-xs space-y-1">
                  <div>१) करसहित कुल लागत = रु. {fmt(pashminaCostNPR)} + {fmt(exportTaxPercent)}% = रु. {fmt(totalCostWithTax.toLocaleString())}</div>
                  <div>२) डलर साट्दा प्राप्त रकम = USD {fmt(sellingPriceUSD)} × रु. १३२.५० = रु. {fmt(earnedNPR.toLocaleString())}</div>
                  <div className={`text-base font-bold pt-1 ${netExportProfitNPR >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    ➔ {netExportProfitNPR >= 0 ? `खुद नाफा (Net Profit) = रु. ${fmt(netExportProfitNPR.toLocaleString())}` : `खुद नोक्सान (Net Loss) = रु. ${fmt(Math.abs(netExportProfitNPR).toLocaleString())}`}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB D: PRACTICE CHALLENGE ────────────────────────────────────────── */}
        {activeTab === 'challenge' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-[#142D4E]">
                {L(`प्रश्न ${toNp(quizIdx + 1)} / ${toNp(quizQuestions.length)}`, `Question ${quizIdx + 1} of ${quizQuestions.length}`)}
              </span>
              <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 rounded">
                {L('पाठ्यपुस्तक आधारित प्रश्न', 'CDC Textbook Exercise')}
              </span>
            </div>

            <p className="font-medium text-slate-800 text-sm sm:text-base">
              {isNe ? quizQuestions[quizIdx].qNp : quizQuestions[quizIdx].qEn}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quizQuestions[quizIdx].opts.map((opt, i) => {
                const isSelected = selectedAns === i;
                const isCorrect = i === quizQuestions[quizIdx].correct;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedAns(i);
                      if (isCorrect) kit.good();
                      else kit.oops();
                    }}
                    className={`p-3 rounded-xl border text-left font-mono font-bold transition-all text-sm ${
                      selectedAns === null
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                        : isCorrect
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                        : isSelected
                        ? 'bg-rose-100 border-rose-400 text-rose-950'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {fmt(opt)}
                  </button>
                );
              })}
            </div>

            {selectedAns !== null && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="text-xs font-bold text-blue-900">{L('समाधान व्याख्या:', 'Explanation:')}</div>
                <div className="text-xs sm:text-sm font-mono text-blue-950">
                  {isNe ? quizQuestions[quizIdx].expNp : quizQuestions[quizIdx].expEn}
                </div>
                <button
                  onClick={() => {
                    setSelectedAns(null);
                    setQuizIdx((prev) => (prev + 1) % quizQuestions.length);
                  }}
                  className="px-4 py-1.5 bg-[#167C80] text-white rounded-lg text-xs font-bold"
                >
                  {L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default CurrencyExchangeLab;
